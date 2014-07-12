
if(this.Graphite == null)
{
    this.Graphite = {};
}

(
    // -- NODE definition
    function()
    {
        Graphite._UNIQUE_NODE_ID = 0;
        Graphite.Node = function(properties)
        {
            if(properties == null)
            {
                properties = {};
            }
            
            properties.id = 'group'+Graphite._UNIQUE_NODE_ID;
            properties.draggable = true;
            
            Kinetic.Group.call(this, properties);
            
            // set our option display
            this._optionDisplay = properties.options;
            this.add(this._optionDisplay.getBackground());
            
            // set our new shape
            this._shape = properties.shape;
            this.add(this._shape);
            this.add(this._optionDisplay.getOverlay());
            
            this.add(new Kinetic.Text(
            {
                x: -30,
                y: -5,
                text: 'NewNode'+Graphite._UNIQUE_NODE_ID,
                fontSize: 12,
                fill: 'black',
                fontFamily:'Permanent Marker'
            }));
            
            // as we mouse enter, change node color and size
            this.on('mouseenter', function(event)
            {
                this._shape.onHighlight();
                this.getLayer().draw();
            });
            
            // as we mouse leave, change node color and size
            this.on('mouseleave', function(event)
            {
                this._shape.onUnHighlight();
                this.getLayer().draw();
            });
            
            this.on('touchstart', function(event)
            {
                this.getStage().addEventListener('touchmove', this._updateNodeDrag);
                
                var endTouchDrag = function()
                {
                    this.getStage().removeEventListener('touchmove', endTouchDrag);
                };
                
                this.getStage().addEventListener('touchend', endTouchDrag);
            });
            
            // as we drag move something make sure the node follows the mouse
            this.on('dragmove', function(event)
            {
                this._updateNodeDrag(event);
            });
            
            this._updateNodeDrag = function(event)
            {
                event.preventDefault();
                if(this._connectionList != null)
                {
                    var drawLayer;
                    for(var i = 0; i < this._connectionList.length; i++)
                    {
                        var endGroup = this._connectionList[i].otherEnd;
                        if(this.getId() != endGroup.getId())
                        {
                            if(event.type == 'touchmove')
                            {
                                var pos = this.getStage().getTouchPosition();
                                this._connectionList[i].line.setPoints([pos.x, pos.y, endGroup.getX(), endGroup.getY()]);
                                this.setX(pos.x);
                                this.setY(pos.y);
                                this.draw();
                            }
                            else
                            {
                                this._connectionList[i].line.setPoints([this.getX(), this.getY(), endGroup.getX(), endGroup.getY()]);
                            }
                            
                            drawLayer = this._connectionList[i].line.getLayer();
                        }
                    }
                    
                    if(drawLayer != null)
                    {
                        drawLayer.draw();
                    }
                }
            };
            
            // a new connection to the node- given the connection and the other node
            this.addConnection = function(line, otherEnd)
            {
                if(this._connectionList == null)
                {
                    this._connectionList = new Array();
                }
                
                this._connectionList.push({line:line, otherEnd:otherEnd});
            };
            
            this.getConnections = function()
            {
                if(this._connectionList == null)
                {
                    this._connectionList = new Array();
                }
                
                return this._connectionList;
            };
            
            this.removeConnection = function(line)
            {
                if(this._connectionList == null)
                {
                	this._connectionList = new Array();
                }
                
                for(var i = 0; i < this._connectionList.length; i++)
                {
                    if(line.getId() == this._connectionList[i].line.getId())
                    {
                        this._connectionList.splice(i, 1);
                        i--;
                    }
                }
            };
            
            this.getShape = function()
            {
                return this._shape;
            };
            
            this.isHighlighted = function()
            {
                return this._shape.isHighlighted();
            };
            
            this.getOptions = function()
            {
                return this._optionDisplay;
            };
            
            this.destroy = function()
            {
                this.off("dragmove touchstart dblclick mouseenter mouseleave");
                
                Kinetic.Group.prototype.destroy.call(this);
            };
            
            // listen for opening/closing the options
            this.on('dblclick', function(event)
            {
                if(properties.getState() == Graphite.Builder.STATE_SELECT)
                {
                    if(!this._optionDisplay.isShowing())
                    {
                        this._optionDisplay.show(this);
                    }
                    else
                    {
                        this._optionDisplay.hide(this);
                    }
                }
            });
            
            Graphite._UNIQUE_NODE_ID++;
        };
        Kinetic.Util.extend(Graphite.Node, Kinetic.Group);
    }
)();

