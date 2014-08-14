
if(this.Graphite == null)
{
    this.Graphite = {};
}

(
    // -- NODE definition
    function()
    {
        Graphite._UNIQUE_NODE_ID = 1;
        Graphite.Node = function(properties)
        {
            if(properties == null)
            {
                properties = {};
            }
            
            properties.id = 'group'+Graphite._UNIQUE_NODE_ID;
            properties.draggable = true;
            
            Kinetic.Group.call(this, properties);
            
            // $HACK Start$ Kinetic bug that doesn't cache properly
            Kinetic.Group.prototype._useBufferCanvas = function() 
            {
                return false;
            };
            // $HACK end$
            
            // set our option display
            this._optionDisplay = properties.options;
            this.add(this._optionDisplay.getBackground());
            
            // set our new shape
            this._shape = properties.shape;
            this.add(this._shape);
            this.add(this._optionDisplay.getOverlay());
            
            var TEXT_SIZE_FACTOR = 1.2;
            this._shapeText = new Kinetic.Text(
            {
                x: -1 * (TEXT_SIZE_FACTOR/2) * this._shape.getRadius(),
                y: -5,
                width: this._shape.getRadius() * TEXT_SIZE_FACTOR,
                align: 'center',
                text: 'Shape '+Graphite._UNIQUE_NODE_ID,
                fontSize: 12,
                fill: 'black',
                fontFamily:'Permanent Marker'
            });
            this.add(this._shapeText);
            
            // as we mouse enter, change node color and size
            this.on('mouseenter', function(event)
            {
                this.clearCache().offset({x:0, y:0});
                
                this._shape.onHighlight();
                
                this.getLayer().draw();
            });
            
            // as we mouse leave, change node color and size
            this.on('mouseleave', function(event)
            {
                this._shape.onUnHighlight();
                
                this.cache();
                this.getLayer().draw();
            });
            
            // as we drag move something make sure the connections follow the node
            this.on('dragmove', function(event)
            {
                this._updateNodeDrag(event);
            });
            
            this.on('dragend', function(event)
            {
                // there is an optimization temp layer made when dragging
                // that needs to be deleted when dragging is done or else
                // all the connection layer events will be hosed.  This 
                // ancestor draw appears to clean up the temp layer 
                this.getLayer().getAncestors()[0].draw();
            });
            
            this._updateNodeDrag = function(event)
            {
                if(this._connectionList != null)
                {
                    var drawLayer = null;
                    for(var i = 0; i < this._connectionList.length; i++)
                    {
                        var endGroup = this._connectionList[i].otherEnd;
                        if(this.id() != endGroup.id())
                        {
                            this._connectionList[i].line.dragUpdate();
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
                    if(line.id() == this._connectionList[i].line.id())
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
            
            this.text = function(txt)
            {
                if(txt == undefined)
                {
                    return this._shapeText.text();
                }
                else
                {
                    this._shapeText.text(txt);
                }
            };
            
            this.fill = function(color)
            {
                return this._shape.unHighlightColor(color);
            };
            
            this.isHighlighted = function()
            {
                return this._shape.isHighlighted();
            };
            
            this.getOptions = function()
            {
                return this._optionDisplay;
            };
            
            this.cache = function(config)
            {
                if(config == undefined)
                {
                    config = {};
                }
                
                var sizeScalar = 1.8;
                var radius = this._shape.radius();
                
                if(config.x == undefined)
                {
                    config.x = -1 * sizeScalar * radius;
                }
                
                if(config.y == undefined)
                {
                    config.y = -1 * sizeScalar * radius;
                }
                
                if(config.width == undefined)
                {
                    config.width = 2 * sizeScalar * radius;
                }
                
                if(config.height == undefined)
                {
                    config.height = 2 * sizeScalar * radius;
                }
                
                Kinetic.Group.prototype.cache.call(this, config).offset(
                {
                    x: sizeScalar * radius,
                    y: sizeScalar * radius
                });
            };
            
            this.destroy = function()
            {
                this.off("dragmove dblclick mouseenter mouseleave");
                
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

