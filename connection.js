
if(this.Graphite == null)
{
    this.Graphite = {};
}

(
    // -- CONNECTION definition
    function()
    {
        Graphite._RADIAL_OFFSET = 90;
        Graphite._UNIQUE_LINE_ID = 0;
        Graphite._ARROW_SIZE = 30;
        Graphite.Connection = function(properties)
        {
            if(properties == null)
            {
                properties = {};
            }
            
            this._type = properties.type;
            this._startGroup = properties.start;
            
            if(properties.end == undefined)
            {
                // for now, it starts and stops in same pixel- until an end is explicitly set
                this._endGroup = properties.start;
            }
            else
            {
                this._endGroup = properties.end;
            }
            
            properties.points = [this._startGroup.x(), this._startGroup.y(), this._endGroup.x(), this._endGroup.y()];
            
            this._getStrokeWidthForType = function(isHighlighted)
            {
                if(this._type == Graphite.MenuConfig.CONNECTION_DOTTED)
                {
                    return isHighlighted ? 6 : 5;
                }
                if(this._type == Graphite.MenuConfig.CONNECTION_DASHED)
                {
                    return isHighlighted ? 6 : 4;
                }
                else
                {
                    return isHighlighted ? 6 : 3;
                }
            };
            
            properties.stroke = 'black';
            properties.strokeWidth = this._getStrokeWidthForType(false);
            properties.lineJoin = 'round';
            properties.shadowEnabled = false;
            properties.shadowColor = '#333333';
            properties.shadowOffset = {x:2, y:2};
            properties.shadowOpacity = 0.8;
            
            this._startArrowEnabled = properties.startArrowVisible == true;
            this._endArrowEnabled = properties.endArrowVisible == true;
            
            if(this._type == Graphite.MenuConfig.CONNECTION_DASHED)
            {
                properties.dash =[25, 10];
            }
            else if(this._type == Graphite.MenuConfig.CONNECTION_DOTTED)
            {
                properties.dash =[1, 8];
                properties.lineCap = "round";
            }
            
            Kinetic.Group.call(this, { id: 'line'+Graphite._UNIQUE_LINE_ID });
            
            this._line = new Kinetic.Line(properties);
            this.add(this._line);
            
            this._arrowDrawFunc = function(context)
            {
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(Graphite._ARROW_SIZE, -1*Graphite._ARROW_SIZE*0.3);
                context.lineTo(Graphite._ARROW_SIZE*0.8, 0);
                context.lineTo(Graphite._ARROW_SIZE, Graphite._ARROW_SIZE*0.3);
                context.lineTo(0, 0);
                context.closePath();
                context.fillStrokeShape(this);
            };
            
            this._startArrow = new Kinetic.Shape(
            {
                fill: 'black',
                drawFunc: this._arrowDrawFunc,
                shadowEnabled: false,
                shadowColor: '#333333',
                shadowOffset: {x:2, y:2},
                shadowOpacity: 0.8,
                opacity: this._startArrowEnabled ? 1 : 0
            });
            this.add(this._startArrow);
            
            this._endArrow = new Kinetic.Shape(
            {
                fill: 'black',
                drawFunc: this._arrowDrawFunc,
                shadowEnabled: false,
                shadowColor: '#333333',
                shadowOffset: {x:2, y:2},
                shadowOpacity: 0.8,
                opacity: this._endArrowEnabled ? 1 : 0
            });
            this.add(this._endArrow);
            
            this._optionDisplay = properties.options;
            this.add(this._optionDisplay.getBackground());
            this.add(this._optionDisplay.getOverlay());
            
            // as we mouseenter, change line color and size
            this.on('mouseenter', function(event)
            {
                this._line.strokeWidth(this._getStrokeWidthForType(true));
                this._line.shadowEnabled(true);
                this._line.stroke('#EEEEEE');
                this._startArrow.fill('#EEEEEE');
                this._startArrow.shadowEnabled(true);
                this._endArrow.fill('#EEEEEE');
                this._endArrow.shadowEnabled(true);
                this.getLayer().draw();
                
                this._isHighlighted = true;
            });
            
            // as we mouseleave, change line color and size
            this.on('mouseleave', function(event)
            {
                this._line.strokeWidth(this._getStrokeWidthForType(false));
                this._line.shadowEnabled(false);
                this._line.stroke('black');
                this._startArrow.fill('black');
                this._startArrow.shadowEnabled(false);
                this._endArrow.fill('black');
                this._endArrow.shadowEnabled(false);
                this.getLayer().draw();
                
                this._isHighlighted = false;
            });
            
            // listen for opening/closing the options
            this.on('dblclick', function(event)
            {
                if(properties.getState() == -Graphite.MenuConfig.STATE_SELECT)
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
            
            this.toggleArrow = function(isLeft)
            {
                var newlyShowing = false;
                var arrow;
                var lineEnd = this._line.points();
                
                if(lineEnd[0] <= lineEnd[2])
                {
                    arrow = isLeft ? this._startArrow : this._endArrow;
                }
                else
                {
                    arrow = isLeft ? this._endArrow : this._startArrow;
                }
                
                if(arrow == this._startArrow)
                {
                    this._startArrowEnabled = this._startArrowEnabled ? false : true;
                    this._startArrow.opacity(this._startArrowEnabled ? 1 : 0);
                    newlyShowing = this._startArrowEnabled;
                }
                else
                {
                    this._endArrowEnabled = this._endArrowEnabled ? false : true;
                    this._endArrow.opacity(this._endArrowEnabled ? 1 : 0);
                    newlyShowing = this._endArrowEnabled;
                }
                
                if(newlyShowing)
                {
                    // simulating a drag will move arrows into place and draw them
                    this.dragUpdate();
                }
                else
                {
                    this.getLayer().draw();
                }
            };
            
            this.getOptions = function()
            {
                return this._optionDisplay;
            };
            
            this.isHighlighted = function()
            {
                if(this._isHighlighted == null)
                {
                    this._isHighlighted = false;
                }
                
                return this._isHighlighted;
            };
            
            this.toXML = function()
            {
                var serialize = "<connection>";
                
                serialize += "<type>"+this._type+"</type>";
                serialize += "<startGroupId>"+this._startGroup.id()+"</startGroupId>";
                serialize += "<endGroupId>"+this._endGroup.id()+"</endGroupId>";
                serialize += "<startArrowVisible>" + this._startArrowEnabled + "</startArrowVisible>";
                serialize += "<endArrowVisible>" + this._endArrowEnabled + "</endArrowVisible>";
                
                serialize += "</connection>";
                return serialize;
            };
            
            this.setEndGroup = function(end)
            {
                // update end group
                this._endGroup = end;
                
                // this will make the radial offsets draw properly and automatically
                this.dragUpdate();
                
                // draw the update
                // done internal to this call because the expectation is that end
                // points are not set in bunches, but one at a time, so no draw
                // optimizations are likely to occur by moving this out
                this.getLayer().draw();
            };
            
            this.getEndGroups = function()
            {
                return {start:this._startGroup, end:this._endGroup};
            };
            
            this.dragUpdate = function(x, y)
            {
                if(x == undefined)
                {
                    x = this._endGroup.x();
                }
                
                if(y == undefined)
                {
                    y = this._endGroup.y();
                }
                
                var distance = Graphite.MathUtil.getDistance(this._startGroup.x(), this._startGroup.y(), x, y);
                var startPt;
                var endPt;
                
                if(this._startGroup == this._endGroup)
                {
                    // we are still creating a connection, just try and not have the line intersect the cursor
                    startPt = {x:this._startGroup.x(), y:this._startGroup.y()};
                    endPt = Graphite.MathUtil.getOffsetPoint(this._startGroup.x(), this._startGroup.y(), 
                            x, y, 20, false);
                }
                else if(distance <= (Graphite._RADIAL_OFFSET*1.5))
                {
                    // if distance is less than offset, don't even bother with offsets
                    startPt = {x:this._startGroup.x(), y:this._startGroup.y()};
                    endPt = {x:startPt.x, y:startPt.y};
                }
                else
                {
                    // the line is connected and far enough apart to allow some offset on both ends
                    startPt = Graphite.MathUtil.getOffsetPoint(this._startGroup.x(), this._startGroup.y(), 
                                                                   x, y, Graphite._RADIAL_OFFSET, true);
                    endPt = Graphite.MathUtil.getOffsetPoint(this._startGroup.x(), this._startGroup.y(), 
                                                                 x, y, Graphite._RADIAL_OFFSET, false);
                }
                this._line.setPoints([startPt.x, startPt.y, endPt.x, endPt.y]);
                
                if(this._startArrowEnabled || this._endArrowEnabled)
                {
                    // as arrows get close together, scale the arrows so they don't overlap
                    var scale = distance <= (Graphite._RADIAL_OFFSET*2.5) ? Graphite.MathUtil.Clamp(0, 1, 0.7*distance / (Graphite._RADIAL_OFFSET*2.5)) : 1.0;
                    
                    // when arrows are extremely close, just fade them out so we don't see them overlap
                    var fade = distance <= (Graphite._RADIAL_OFFSET*2) ? 0 : 1;
                    
                    // update arrow positioning
                    if(this._startArrowEnabled)
                    {
                        var startArrowPt = Graphite.MathUtil.getOffsetPoint(this._startGroup.x(), this._startGroup.y(), startPt.x, startPt.y, 
                                                                            0.5 * Graphite._ARROW_SIZE, false);
                        this._startArrow.setX(startArrowPt.x);
                        this._startArrow.setY(startArrowPt.y);
                        
                        this._startArrow.opacity(fade);
                        this._startArrow.scaleX(scale);
                        this._startArrow.scaleY(scale);
                    }
                    
                    if(this._endArrowEnabled)
                    {
                        var endArrowPt = Graphite.MathUtil.getOffsetPoint(this._endGroup.x(), this._endGroup.y(), endPt.x, endPt.y, 
                                                                          0.5 * Graphite._ARROW_SIZE, false);
                        this._endArrow.setX(endArrowPt.x);
                        this._endArrow.setY(endArrowPt.y);
                        
                        this._endArrow.opacity(fade);
                        this._endArrow.scaleX(scale);
                        this._endArrow.scaleY(scale);
                    }
                }
                
                // update arrow rotation
                var slope = (y - this._startGroup.y()) / (x - this._startGroup.x());
                var rot = Math.atan(slope) * (180 / Math.PI);
                if(this._startGroup.x() <= x)
                {
                    this._startArrow.setRotationDeg(rot);
                    this._endArrow.setRotationDeg(rot + 180);
                }
                else
                {
                    this._startArrow.setRotationDeg(rot + 180);
                    this._endArrow.setRotationDeg(rot);
                }
                
                this._optionDisplay.getBackground().setRotationDeg(rot);
                this._optionDisplay.getOverlay().setRotationDeg(rot);
                
                var centerPoint = Graphite.MathUtil.GetCenterPoint(startPt.x, startPt.y, endPt.x, endPt.y);
                
                // update options display
                this._optionDisplay.getBackground().x(centerPoint.x);
                this._optionDisplay.getBackground().y(centerPoint.y);
                this._optionDisplay.getOverlay().x(centerPoint.x);
                this._optionDisplay.getOverlay().y(centerPoint.y);
                
                this.draw();
                
                // note: there is intentionally no drawing here because we likely
                // have a batch of lines being dragged with one node, so draw them all at once
            };
            
            this.destroy = function()
            {
                this.off("mouseenter mouseleave");
                
                Kinetic.Group.prototype.destroy.call(this);
            };
            
            Graphite._UNIQUE_LINE_ID++;
        };
        
        Kinetic.Util.extend(Graphite.Connection, Kinetic.Group);
	}
)();

