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
            	event.preventDefault();
            });
            stage.getContent().addEventListener('touchstart', function(event) 
            {
            	event.preventDefault();
            });
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

            // move the node with touch
            this._moveNodeIntoPlace = function(event)
            {
                var pos;
                if(this.isMobile())
                {
                    pos = stage.getTouchPosition();
                }
                else
                {
                    pos = { x:event.clientX, y:event.clientY };
                }
                
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
                
                var isMobile = this.isMobile();
                var pos;
                if(isMobile)
                {
                    pos = stage.getTouchPosition();
                }
                else
                {
                    pos = { x:window.event.clientX, y:window.event.clientY };
                }

                // keep track of this node until we finalize (place it)
                var shape = this._nodeFactory.createShape(type);
                var options = this._nodeFactory.createOptions(type);
                this._pendingNode = new Graphite.Node(
                {
                    getState:this.getState.bind(this),
                    shape:shape,
                    options:options,
                    isMobile:this.isMobile(),
                    x: pos.x,
                    y: pos.y
                });
                this._pendingNode.setOpacity(0.5);
                this._nodeLayer.add(this._pendingNode);
                
                if(isMobile)
                {
                    this._addCanvasListener('touchmove', function(event) { this._moveNodeIntoPlace(event); }.bind(this));
                }
                else
                {
                    this._addCanvasListener('mousemove', function(event) { this._moveNodeIntoPlace(event); }.bind(this));
                }
                
                // when click occurs, we are finalized
                var stopMovingNode = function(event)
                {
                    // stop listening for mouse moves
                    this._removeAllCanvasListeners();
                    
                    // now that this node is final, make it opaque
                    this._pendingNode.setOpacity(1);
                    
                    // now we are finalized and no need to be 'pending', so kill reference
                    this._pendingNode = null;
                    
                    // automatically start adding a new node now
                    this.addNode(type);

                }.bind(this);
                
                if(isMobile)
                {
                    this._pendingNode.on('touchend', stopMovingNode);
                }
                else
                {
                    this._pendingNode.on('click', stopMovingNode);
                }
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
                
                var isMobile = this.isMobile();
                
                // track line as we move
                var updateLine = function(event) 
                {
                    var points = this._pendingConnection.getPoints();
                    if(isMobile)
                    {
                        var pos = stage.getTouchPosition();
                        points[1] = {x: pos.x, y: pos.y};
                    }
                    else
                    {
                        points[1] = {x: event.clientX, y: event.clientY};
                    }
                    
                    this._connectionLayer.draw();
                }.bind(this);
                
                // transfer scope from clicked end node to 'this'
                var nodeClickEnd = function(event)
                {
                    endDrawLine(this);
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
                        node.off('click touchend');
                        
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
                    
                    if(this.isMobile())
                    {
                        this._addCanvasListener('touchmove', updateLine);
                    }
                    else
                    {
                        this._addCanvasListener('mousemove', updateLine);
                    }
                    
                    var listChildren = this._nodeLayer.getChildren();
                    for(var i = 0; i < listChildren.length; i++)
                    {
                        var node = listChildren[i];
                        
                        // stop listening for line begins
                        node.off('click touchstart');
                        
                        // start listening for line ends
                        if(this.isMobile())
                        {
                            node.on('touchend', nodeClickEnd);
                        }
                        else
                        {
                            node.on('click', nodeClickEnd);
                        }
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
                    if(this.isMobile())
                    {
                        node.on('touchstart', nodeClickBegin);
                    }
                    else
                    {
                        node.on('click', nodeClickBegin);
                    }
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
            
            this.isMobile = function() 
            {
                var check = false;
                (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true;})(navigator.userAgent||navigator.vendor||window.opera);
                return check; 
            };
        };
        Graphite.Builder.CATEGORY_NODE = 0;
        Graphite.Builder.CATEGORY_CONNECTION = 1;
        
        Graphite.Builder.STATE_SELECT = 0;
        Graphite.Builder.STATE_NODE = 1;
        Graphite.Builder.STATE_CONNECTION = 2;
    }
)();
