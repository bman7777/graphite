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
            
            var WINDOW_GUTTER = 25;
            stageProps.width = window.innerWidth-WINDOW_GUTTER;
            stageProps.height = window.innerHeight-WINDOW_GUTTER;
            
            // all layers will be added to the stage
            this._stage = new Kinetic.Stage(stageProps);
            this._stage.getContent().addEventListener('mousedown', function(event) 
            {
                // right clicking the canvas will clear the drawing state 
                if(event.which != 1)
                {
                    this.clearUnfinishedBuilding();
                    
                    // we are in selecting mode now
                    this.enterSelectionState();
                }
            }.bind(this));
            
            // this is geared towards canceling a line drawing- node
            // drawing cancellation is below in the file
            this._stage.getContent().addEventListener('touchcancel', function(event) 
            {
                if(this._pendingConnection != null)
                {
                    // disrupted touch means that we are clearing draw state 
                    this.clearUnfinishedBuilding();
                        
                    // we are in selecting mode now
                    this.enterSelectionState();
                }
            }.bind(this));
            
            // connections should be under shapes, so add those first
            this._connectionLayer = new Kinetic.Layer();
            this._stage.add(this._connectionLayer);
            
            // next add nodes
            this._nodeLayer = new Kinetic.Layer();
            this._stage.add(this._nodeLayer);
            
            this._cookieControl = new Graphite.CookieControl(this);
            this._messager = new Graphite.Messager(stageProps.messagerMount, this);
            
            // make a factory for nodes
            this._nodeFactory = new Graphite.ShapeFactory(this);
            
            // make a factory for lines
            this._lineFactory = new Graphite.LineFactory(this);
            
            this._popup = stageProps.popup;
            
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
                            this.removeConnection(line);
                        }
                    }
                }
            }.bind(this);
            
            // when the window is resized, change the stage size accordingly
            this.updateSize = function(width, height)
            {
                this._stage.setWidth(width);
                this._stage.setHeight(height);
            };
            
            this.getState = function()
            {
                if(this._buildState == null)
                {
                    this._buildState = Graphite.MenuConfig.STATE_SELECT;
                }
                
                return this._buildState;
            };
            
            this._killNode = function(node)
            {
                var shape = node.getShape();
                var options = node.getOptions();
                node.off('mouseup');
                
                // since the overlay/bg are children of node, they
                // should get killed first
                this._nodeFactory.destroyShape(shape);
                this._nodeFactory.destroyOptions(options);
                
                // destroy the node last
                node.destroy();
            };
            
            this.openPopup = function(title, settings, buttons)
            {
                if(settings != null && buttons != null)
                {
                    this._popup.open(title, settings, buttons);
                }
            };
            
            this.closePopup = function()
            {
                this._popup.close();
            };
            
            this.openContent = function(node)
            {
                this._fileOptions.openFile(node.link());
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
                var touch = event.targetTouches != undefined ? event.targetTouches[0] : undefined;
                
                this._pendingNode.setX(touch != undefined ? touch.clientX : event.clientX);
                this._pendingNode.setY(touch != undefined ? touch.clientY : event.clientY);
                
                // must be a layer draw so we don't see a trail as we drag
                this._nodeLayer.draw();
            };
            
            this._addCanvasListener = function(eventType, callback)
            {
                if(this._canvasListeners == null)
                {
                    this._canvasListeners = new Array();
                }
                
                var events = eventType.split(" ");
                for(var i = 0; i < events.length; i++)
                {
                    if(events[i] != "")
                    {
                        this._canvasListeners.push({callback: callback, type: events[i]});
                        this._canvas.addEventListener(events[i], callback, false);
                    }
                }
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
            
            this.processFile = function(param)
            {
                switch(param.type)
                {
                    case Graphite.MenuConfig.FILE_NEW:
                        this._fileOptions.newFile();
                        break;
                    
                    case Graphite.MenuConfig.FILE_SAVE:
                        this._fileOptions.save();
                        break;
                        
                    case Graphite.MenuConfig.FILE_LOAD:
                        this._fileOptions.load(param.callback);
                        break;
                }
            };
            
            // being the process of placing a node- follow node with mouse until click
            this.addNode = function(param)
            {
                // if we were pending something, we should start over fresh
                this._cancelAddNode();
                
                // make sure the pending node is shown above everything
                // so it doesn't get blocked dragging against menu
                this._stage.getContent().style.zIndex = "30";
                
                // we are in connection state now
                this._buildState = Graphite.MenuConfig.STATE_NODE;
                
                // make mouse look different
                this._canvas.style.cursor = "pointer";
                
                var pos = { x: 0, y: 0};
                var touch = event.targetTouches != undefined ? event.targetTouches[0] : undefined;
                if(touch != undefined)
                {
                    pos.x = touch.clientX;
                    pos.y = touch.clientY;
                }
                else if(window.event != undefined)
                {
                    pos.x = window.event.clientX;
                    pos.y = window.event.clientY;
                }
                
                // keep track of this node until we finalize (place it)
                var shape = this._nodeFactory.createShape({type: param.type});
                var options = this._nodeFactory.createOptions(param.type);
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
                this._nodeLayer.draw();
                
                if(touch != undefined)
                {
                    var target = param.target;
                    target.addEventListener('touchmove', this._moveNodeIntoPlace.bind(this));
                    
                    var endTouchMove = function(event)
                    {
                        // stop listening for touch moves
                        target.removeEventListener('touchend', endTouchMove);
                        target.removeEventListener('touchcancel', endTouchMove);
                        target.removeEventListener('touchmove', this._moveNodeIntoPlace);
                        
                        // now that this node is final, make it opaque
                        this._pendingNode.setOpacity(1);
                        
                        // optimize by caching off node
                        this._pendingNode.cache();
                        this._pendingNode.draw();
                        
                        // now we are finalized and no need to be 'pending', so kill reference
                        this._pendingNode = null;
                        
                        // this reset some state like pointer type
                        this.clearUnfinishedBuilding();
                        
                        // we are in selecting mode now
                        this.enterSelectionState();
                    }.bind(this);
                    
                    target.addEventListener('touchend', endTouchMove);
                    target.addEventListener('touchcancel', endTouchMove);
                }
                else
                {
                    this._addCanvasListener('mousemove', this._moveNodeIntoPlace.bind(this));
                
                    // when click occurs, we are finalized
                    this._pendingNode.on('mouseup', function(event)
                    {
                        this._pendingNode.off('mouseup');
                        
                        if(event.evt.which == 1)
                        {
                            // stop listening for mouse moves
                            this._removeAllCanvasListeners();
                            
                            // now that this node is final, make it opaque
                            this._pendingNode.setOpacity(1);
                            
                            // optimize by caching off node
                            this._pendingNode.cache();
                            
                            // now we are finalized and no need to be 'pending', so kill reference
                            this._pendingNode = null;
                            
                            // automatically start adding a new node now
                            this.addNode(param);
                        }
                        else
                        {
                            // clear state for our in-progress node
                            this.clearUnfinishedBuilding();
                            
                            // we are in selecting mode now
                            this.enterSelectionState();
                        }
                    }.bind(this));
                }
            };
            
            // being the process of drawing a line when a node is clicked
            this.readyForNewConnection = function(param)
            {
                // make sure nothing was in progress already
                this._cancelNewConnection();
                
                // we are in connection state now
                this._buildState = Graphite.MenuConfig.STATE_CONNECTION;
                
                // make mouse look different
                this._canvas.style.cursor = "crosshair";
                
                // track line as we move
                var updateLine = function(event) 
                {
                    var touch = event.targetTouches != undefined ? event.targetTouches[0] : undefined;
                    if(touch != undefined)
                    {
                        // the touch tracking is done here
                        this._pendingConnection.dragUpdate(touch.clientX, touch.clientY);
                    }
                    else
                    {
                        // the mouse tracking is done here
                        this._pendingConnection.dragUpdate(event.clientX, event.clientY);
                    }
                    
                    // draw the line shifts external to dragging
                    this._connectionLayer.draw();
                }.bind(this);
                
                // transfer scope from clicked end node to 'this'
                var nodeClickEnd = function(event)
                {
                    if(event.evt.which == 1)
                    {
                        endDrawLine(this, true);
                    }
                    else if(event.evt.type == "touchend")
                    {
                        endDrawLine(this, false);
                    }
                };
                
                // click on a node when line is pending
                var endDrawLine = function(endNode, autoStartNewLine) 
                {
                    if(this._pendingConnectionStart == endNode)
                    {
                        // don't allow lines that start and end in same place
                        return;
                    }
                    
                    // stop updating the line on mouse/touch moves
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
                        node.off('mouseup touchend');
                        
                        // turn on all dragging of objects
                        node.setDraggable(true);
                    }
                    
                    if(autoStartNewLine)
                    {
                        // automatically start drawing a new line
                        this.readyForNewConnection(param);
                    }
                    else
                    {
                        // reset things like the mouse cursor
                        this.clearUnfinishedBuilding();
                        
                        // we are in selecting mode now
                        this.enterSelectionState();
                    }
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
                    var options = this._lineFactory.createOptions();
                    this._pendingConnection = new Graphite.Connection(
                    {
                        getState:this.getState.bind(this),
                        start:this._pendingConnectionStart, 
                        type:param.type,
                        options: options
                    });
                    this._connectionLayer.add(this._pendingConnection);
                    
                    this._addCanvasListener('mousemove touchmove', updateLine);
                    
                    var listChildren = this._nodeLayer.getChildren();
                    for(var i = 0; i < listChildren.length; i++)
                    {
                        var node = listChildren[i];
                        
                        // stop listening for line begins
                        node.off('mouseup touchstart');
                        
                        // start listening for line ends
                        node.on('mouseup touchend', nodeClickEnd);
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
                    node.on('mouseup touchstart', nodeClickBegin);
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
                this._buildState = Graphite.MenuConfig.STATE_SELECT;
            };
            
            // of a node was in process, cancel it
            this._cancelAddNode = function()
            {
                // we upped the z-index while we were pending
                // and now we need to go back to a lower index so the
                // menu overlaps the nodes again
                this._stage.getContent().style.zIndex = "auto";
                
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
                    node.off('mouseup');
                }
                
                this._canvas.style.cursor = "auto";
            };
            
            this.removeConnection = function(line)
            {
                // remove all connections that nodes have to this line
                var groups = line.getEndGroups();
                groups.start.removeConnection(line);
                groups.end.removeConnection(line);
                
                this._lineFactory.destroyOptions(line.getOptions());
                
                // kill the line
                line.destroy();
                
                // if we deleted when building, we should clear state
                this.clearUnfinishedBuilding();
                
                // we are in selecting mode now
                this.enterSelectionState();
                
                // redraw the deleted change(s)
                this._connectionLayer.draw();
            };
            
            this.toPNG = function(callback)
            {
                var BUFFER = 100;
                var rightMostEdge = -1;
                var bottomMostEdge = -1;
                var leftMostEdge = this._stage.width();
                var topMostEdge = this._stage.height();
                
                var listChildren = this._nodeLayer.getChildren();
                for(var i = listChildren.length - 1; i >= 0; i--)
                {
                    var node = listChildren[i];
                    
                    var nodeRightEdge = node.x() + BUFFER;
                    var nodeBottomEdge = node.y() + BUFFER;
                    var nodeLeftEdge = node.x() - BUFFER;
                    var nodeTopEdge = node.y() - BUFFER;
                    
                    if(nodeRightEdge > rightMostEdge) rightMostEdge = nodeRightEdge;
                    if(nodeBottomEdge > bottomMostEdge) bottomMostEdge = nodeBottomEdge;
                    if(nodeLeftEdge < leftMostEdge) leftMostEdge = nodeLeftEdge;
                    if(nodeTopEdge < topMostEdge) topMostEdge = nodeTopEdge;
                }
                
                // sanity check all the findings
                if(rightMostEdge <= 0) rightMostEdge = this._stage.width();
                if(bottomMostEdge <= 0) bottomMostEdge = this._stage.height();
                if(leftMostEdge >= rightMostEdge) leftMostEdge = 0;
                if(topMostEdge >= bottomMostEdge) topMostEdge = 0;
                
                return this._stage.toDataURL({
                    mimeType: "image/png",
                    x: leftMostEdge,
                    y: topMostEdge,
                    width: (rightMostEdge - leftMostEdge),
                    height: (bottomMostEdge - topMostEdge),
                    callback: callback
                });
            };
            
            this.toXML = function()
            {
                var serialize = "<graph>";
                
                serialize += "<connections>";
                var listChildren = this._connectionLayer.getChildren();
                for(var i = listChildren.length - 1; i >= 0; i--)
                {
                    serialize += listChildren[i].toXML();
                }
                serialize += "</connections>";
                
                serialize += "<nodes>";
                listChildren = this._nodeLayer.getChildren();
                for(var i = listChildren.length - 1; i >= 0; i--)
                {
                    serialize += listChildren[i].toXML();
                }
                serialize += "</nodes>";
                    
                serialize += "</graph>";
                
                return serialize;
            };
            
            this.fromXML = function(xmlDoc)
            {
                if(xmlDoc.firstChild.nodeName != "graph")
                {
                    return false;
                }
                
                // clear what we have now to start from scratch
                this.clear();
                
                var BUFFER = 100;
                var rightMostEdge = -1;
                var bottomMostEdge = -1;
                
                var nodeRoot = xmlDoc.getElementsByTagName("nodes")[0];
                var nodeList = nodeRoot.childNodes;
                for(var i = 0; i < nodeList.length; i++)
                {
                    var details = Graphite.XMLUtil.createObjectFromXML(nodeList[i]);
                    
                    var nodeParams = details.container;
                    nodeParams.getState = this.getState.bind(this);
                    nodeParams.shape = this._nodeFactory.createShape(details.shape);
                    nodeParams.options = this._nodeFactory.createOptions(details.shape.type);
                    
                    this._nodeLayer.add(new Graphite.Node(nodeParams));
                    
                    var nodeRightEdge = nodeParams.x + BUFFER;
                    var nodeBottomEdge = nodeParams.y + BUFFER;
                    
                    if(nodeRightEdge > rightMostEdge) rightMostEdge = nodeRightEdge;
                    if(nodeBottomEdge > bottomMostEdge) bottomMostEdge = nodeBottomEdge;
                }
                
                // make sure the stage is big enough for this graph
                if(rightMostEdge > this._stage.width()) this._stage.setWidth(rightMostEdge);
                if(bottomMostEdge > this._stage.height()) this._stage.setHeight(bottomMostEdge);
                
                this._nodeLayer.draw();
                
                var connectionRoot = xmlDoc.getElementsByTagName("connections")[0];
                var connectionList = connectionRoot.childNodes;
                for(var i = 0; i < connectionList.length; i++)
                {
                    var connectionParams = Graphite.XMLUtil.createObjectFromXML(connectionList[i]);
                    
                    connectionParams.getState = this.getState.bind(this);
                    connectionParams.options = this._lineFactory.createOptions();
                    connectionParams.start = this._getNodeById(connectionParams.startGroupId);
                    connectionParams.end = this._getNodeById(connectionParams.endGroupId);
                    
                    var connection = new Graphite.Connection(connectionParams);
                    this._connectionLayer.add(connection);
                    
                    connectionParams.start.addConnection(connection, connectionParams.end);
                    connectionParams.end.addConnection(connection, connectionParams.start);
                    connection.dragUpdate();
                }
                this._connectionLayer.draw();
                
                return true;
            };
            
            this._getNodeById = function(id)
            {
                var nodeList = this._nodeLayer.getChildren();
                for(var i = 0; i < nodeList.length; i++)
                {
                    if(nodeList[i].id() == id)
                    {
                        return nodeList[i];
                    }
                }
            };
            
            this.isDirty = function(lastSavedContent)
            {
                if(lastSavedContent == undefined)
                {
                    // more optimized version
                    return true;
                }
                else
                {
                    var parser=new DOMParser();
                    var lastSaveDoc = parser.parseFromString(lastSavedContent,"text/xml");
                    var currentDoc = parser.parseFromString(this.toXML(),"text/xml");
                    
                    if(lastSaveDoc.firstChild.nodeName != currentDoc.firstChild.nodeName &&
                       lastSaveDoc.childNodes.length   == currentDoc.childNodes.length &&
                       lastSaveDoc.childNodes.length   == 1)
                    {
                        // if they aren't both rooted in 1 "graph" node then don't even bother checking
                        return false;
                    }
                    else
                    {
                        return Graphite.XMLUtil.areXMLDocsDifferent(lastSaveDoc.firstChild.childNodes, currentDoc.firstChild.childNodes);
                    }
                }
            };
            
            this.clear = function()
            {
                var listChildren = this._connectionLayer.getChildren();
                for(var i = listChildren.length - 1; i >= 0; i--)
                {
                    this.removeConnection(listChildren[i]);
                }
                
                listChildren = this._nodeLayer.getChildren();
                for(var i = listChildren.length - 1; i >= 0; i--)
                {
                    this.removeNode(listChildren[i]);
                }
                
                // reset the stage size to not scroll
                this._stage.setWidth(window.innerWidth-WINDOW_GUTTER);
                this._stage.setHeight(window.innerHeight-WINDOW_GUTTER);
            };
            
            this.setFileOptions = function(fileOptions)
            {
                this._fileOptions = fileOptions;
            };
            
            this.getCookie = function()
            {
                return this._cookieControl;
            };
            
            this.getMessager = function()
            {
                return this._messager;
            };
            
            this.processMenuEvent = function(event, param)
            {
                switch(event)
                {
                    case "clearUnfinishedBuilding":
                        this.clearUnfinishedBuilding();
                        break;
                        
                    case "addNode":
                        this.addNode(param);
                        break;
                    
                    case "addConnection":
                        this.readyForNewConnection(param);
                        break;
                        
                    case "processFile":
                        this.processFile(param);
                        break;
                        
                    case "selection":
                        this.enterSelectionState();
                        break;
                };
            };
        };
    }
)();
