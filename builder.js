if(this.Graphite == null)
{
    this.Graphite = {};
}

(
    // -- BUILDER definition
    function()
    {
        Graphite.Builder = function(stageProps)
        {
            this._canvas = document.getElementById(stageProps.container);
            
            // all layers will be added to the stage
            var stage = new Kinetic.Stage(stageProps);
            
            // $HACK start$ this fixes a chrome issue where the drag with a
            // click+hold means that the drag event doesn't fire
            stage.getContent().addEventListener('mousedown', function(event) 
            {
                // right clicking the canvas will clear the drawing state 
                if(event.which != 1)
                {
                    this.clearUnfinishedBuilding();
                    
                    // we are in selecting mode now
                    this.enterSelectionState();
                }
                
            	event.preventDefault();
            }.bind(this));
            // $HACK end$
            
            
            // connections should be under shapes, so add those first
            this._connectionLayer = new Kinetic.Layer();
            stage.add(this._connectionLayer);
            
            // next add nodes
            this._nodeLayer = new Kinetic.Layer();
            stage.add(this._nodeLayer);
            
            // make a factory for nodes
            this._nodeFactory = new Graphite.ShapeFactory(this);

            // loop through children of the given layer and check isHighlighted
            this._findHighlightedChild = function(layer)
            {
                var listChildren = layer.getChildren();
                for(var i = 0; i < listChildren.length; i++)
                {
                    var child = listChildren[i];
                    if(child.isHighlighted())
                    {
                    	return child;
                    }
                }
                
                return null;
            };
            
            // the "delete" key allows you to delete a 
            // node and its related connections
            document.onkeydown = function(event)
            {
                if(event.keyCode == 46)
                {
                    // first try to find a node that is highlighted
                    var node = this._findHighlightedChild(this._nodeLayer);
                    if(node != null)
                    {
                        this.removeNode(node);
                    }
                    else
                    {
                        // we didn't find a node, so now find a connection
                        var line = this._findHighlightedChild(this._connectionLayer);
                        if(line != null)
                        {
                            // remove all connections that nodes have to this line
                            var groups = line.getEndGroups();
                            groups.start.removeConnection(line);
                            groups.end.removeConnection(line);
                            
                            // kill the line
                            line.destroy();
                            
                            // if we deleted when building, we should clear state
                            this.clearUnfinishedBuilding();
                            
                            // we are in selecting mode now
                            this.enterSelectionState();
                            
                            // redraw the deleted change(s)
                            this._connectionLayer.draw();
                        }
                    }
                }
            }.bind(this);
            
            // when the window is resized, change the stage size accordingly
            this.updateSize = function(width, height)
            {
                stage.setWidth(width);
                stage.setHeight(height);
            };
            
            this.getState = function()
            {
                if(this._buildState == null)
                {
                    this._buildState = Graphite.Builder.STATE_SELECT;
                }
                
                return this._buildState;
            };
            
            this._killNode = function(node)
            {
                var shape = node.getShape();
                var options = node.getOptions();
                node.off('click');
                node.destroy();
                this._nodeFactory.destroyShape(shape);
                this._nodeFactory.destroyOptions(options);
            };
            
            this.removeNode = function(node)
            {
                if(node != null)
                {
                    // remove all the connections that have been found
                    var connections = node.getConnections();
                    for(var i = 0; i < connections.length; i++)
                    {
                        connections[i].otherEnd.removeConnection(connections[i].line);
                        connections[i].line.destroy();
                    }

                    // kill the node
                    this._killNode(node);
                    
                    // if we deleted when building, we should clear state
                    this.clearUnfinishedBuilding();
                    
                    // we are in selecting mode now
                    this.enterSelectionState();
                    
                    // redraw the deleted change(s)
                    this._connectionLayer.draw();
                    this._nodeLayer.draw();
                }
            };

            // move the node as the mouse moves
            this._moveNodeIntoPlace = function(event)
            {
                var pos = { x:event.clientX, y:event.clientY };
                this._pendingNode.setX(pos.x);
                this._pendingNode.setY(pos.y);
                this._nodeLayer.draw();
            };
            
            this._addCanvasListener = function(eventType, callback)
            {
                if(this._canvasListeners == null)
                {
                    this._canvasListeners = new Array();
                }
                
                this._canvasListeners.push({callback: callback, type: eventType});
                this._canvas.addEventListener(eventType, callback, false);
            };
            
            this._removeAllCanvasListeners = function()
            {
                if(this._canvasListeners != null)
                {
                    for(var i = 0; i < this._canvasListeners.length; i++)
                    {
                        this._canvas.removeEventListener(this._canvasListeners[i].type, this._canvasListeners[i].callback, false);
                    }
                    
                    this._canvasListeners = null;
                }
            };
            
            // being the process of placing a node- follow node with mouse until click
            this.addNode = function(type)
            {
                // if we were pending something, we should start over fresh
                this._cancelAddNode();
                
                // we are in connection state now
                this._buildState = Graphite.Builder.STATE_NODE;
                
                // make mouse look different
                this._canvas.style.cursor = "pointer";
                
                var pos = { x:window.event.clientX, y:window.event.clientY };

                // keep track of this node until we finalize (place it)
                var shape = this._nodeFactory.createShape(type);
                var options = this._nodeFactory.createOptions(type);
                this._pendingNode = new Graphite.Node(
                {
                    getState:this.getState.bind(this),
                    shape:shape,
                    options:options,
                    x: pos.x,
                    y: pos.y
                });
                this._pendingNode.setOpacity(0.5);
                this._nodeLayer.add(this._pendingNode);
                
                this._addCanvasListener('mousemove', function(event) { this._moveNodeIntoPlace(event); }.bind(this));
                
                // when click occurs, we are finalized
                var stopMovingNode = function(event)
                {
                	switch(event.which)
                	{
	                	case 1:
	                	{
		                    // stop listening for mouse moves
		                    this._removeAllCanvasListeners();
		                    
		                    // now that this node is final, make it opaque
		                    this._pendingNode.setOpacity(1);
		                    
		                    // now we are finalized and no need to be 'pending', so kill reference
		                    this._pendingNode = null;
		                    
		                    // automatically start adding a new node now
		                    this.addNode(type);
		                    
		                    break;
	                	}
	                	default:
	                	{
	                		// clear state for our in-progress node
	                        this.clearUnfinishedBuilding();
	                        
	                        // we are in selecting mode now
	                        this.enterSelectionState();
	                		
	                		event.preventDefault();
	                		break;
	                	}
                	}

                }.bind(this);
                
                this._pendingNode.on('click', stopMovingNode);
            };
            
            // being the process of drawing a line when a node is clicked
            this.readyForNewConnection = function(type)
            {
                // make sure nothing was in progress already
                this._cancelNewConnection();
                
                // we are in connection state now
                this._buildState = Graphite.Builder.STATE_CONNECTION;
                
                // make mouse look different
                this._canvas.style.cursor = "crosshair";
                
                // track line as we move
                var updateLine = function(event) 
                {
                    var points = this._pendingConnection.getPoints();
                    points[1] = {x: event.clientX, y: event.clientY};
                    
                    this._connectionLayer.draw();
                }.bind(this);
                
                // transfer scope from clicked end node to 'this'
                var nodeClickEnd = function(event)
                {
                	if(event.which == 1)
                	{
                		endDrawLine(this);
                	}
                };
                
                // click on a node when line is pending
                var endDrawLine = function(endNode) 
                {
                    if(this._pendingConnectionStart == endNode)
                    {
                        // don't allow lines that start and end in same place
                        return;
                    }
                    
                    // stop updating the line on mouse moves
                    this._removeAllCanvasListeners();
                    
                    // track connections
                    this._pendingConnectionStart.addConnection(this._pendingConnection, endNode);
                    endNode.addConnection(this._pendingConnection, this._pendingConnectionStart);
                    this._pendingConnection.setEndGroup(endNode);
                    
                    // wipe out state vars
                    this._pendingConnection = null;
                    this._pendingConnectionStart = null;
                    
                    // loop through nodes to remove listeners
                    var listChildren = this._nodeLayer.getChildren();
                    for(var i = 0; i < listChildren.length; i++)
                    {
                        var node = listChildren[i];
                        
                        // stop listening for line ends
                        node.off('click');
                        
                        // turn on all dragging of objects
                        node.setDraggable(true);
                    }
                    
                    // automatically start drawing a new line
                    this.readyForNewConnection(type);
                }.bind(this);
                
                // transfer scope from start node to 'this'
                var nodeClickBegin = function(event)
                {
                    beginDrawLine(this);
                };
                
                // when a node is clicked in line mode, start tracking the end of the line
                var beginDrawLine = function(startNode) 
                {
                    // build a connection and cache it for access later
                    this._pendingConnectionStart = startNode;
                    this._pendingConnection = new Graphite.Connection({start:this._pendingConnectionStart, type:type});
                    this._connectionLayer.add(this._pendingConnection);
                    
                    this._addCanvasListener('mousemove', updateLine);
                    
                    var listChildren = this._nodeLayer.getChildren();
                    for(var i = 0; i < listChildren.length; i++)
                    {
                        var node = listChildren[i];
                        
                        // stop listening for line begins
                        node.off('click');
                        
                        // start listening for line ends
                        node.on('click', nodeClickEnd);
                    }

                }.bind(this);
                
                // loop through nodes to add listener and prevent dragging
                var listChildren = this._nodeLayer.getChildren();
                for(var i = 0; i < listChildren.length; i++)
                {
                    var node = listChildren[i];
                    
                    // turn off all dragging of objects
                    node.setDraggable(false);
                    
                    // listen for click on all nodes to start the connection
                    node.on('click', nodeClickBegin);
                }
            };
            
            // if a node or connection was in process, cancel it
            this.clearUnfinishedBuilding = function()
            {
                // this will clear the current add (if there was one)
                this._cancelAddNode();
                
                // this will clear the current add (if there was one)
                this._cancelNewConnection();
            };
            
            this.enterSelectionState = function()
            {
                // we are in selection state now (maybe temporarily)
                this._buildState = Graphite.Builder.STATE_SELECT;
            };
            
            // of a node was in process, cancel it
            this._cancelAddNode = function()
            {
                // if we were pending something, we should start over fresh
                if(this._pendingNode != null)
                {
                    this._removeAllCanvasListeners();
                    this._killNode(this._pendingNode);
                    this._pendingNode = null;
                    
                    this._nodeLayer.draw();
                }
                
                // make the cursor normal again
                this._canvas.style.cursor = "auto";
            };
            
            // if a connection was in process, cancel it
            this._cancelNewConnection = function()
            {
                // if we were pending something, we should start over fresh
                if(this._pendingConnection != null)
                {
                    this._pendingConnection.destroy();
                    this._nodeLayer.draw();
                }
                
                // turn on dragging on all nodes
                // note: we might not have a pendingConnection 
                // but still have started some of the process
                var listChildren = this._nodeLayer.getChildren();
                for(var i = 0; i < listChildren.length; i++)
                {
                    var node = listChildren[i];
                    
                    node.setDraggable(true);
                    node.off('click');
                }
                
                this._canvas.style.cursor = "auto";
            };
        };
        
        Graphite.Builder.CATEGORY_NODE = 0;
        Graphite.Builder.CATEGORY_CONNECTION = 1;
        
        Graphite.Builder.STATE_SELECT = 0;
        Graphite.Builder.STATE_NODE = 1;
        Graphite.Builder.STATE_CONNECTION = 2;
    }
)();
