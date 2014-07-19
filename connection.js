
if(this.Graphite == null)
{
    this.Graphite = {};
}

(
    // -- CONNECTION definition
    function()
    {
        Graphite._RADIAL_OFFSET = 85;
        Graphite._UNIQUE_LINE_ID = 0;
        Graphite.Connection = function(properties)
        {
            if(properties == null)
            {
                properties = {};
            }
            
            properties.id='line'+Graphite._UNIQUE_LINE_ID;
            this._type = properties.type;
            this._startGroup = properties.start;
            
            // for now, it starts and stops in same pixel- until an end is explicitly set
            this._endGroup = properties.start;
            properties.points = [properties.start.getX(), properties.start.getY(), properties.start.getX(), properties.start.getY()];
            
            this._getStrokeWidthForType = function(isHighlighted)
            {
                if(this._type == Graphite.Connection.DOTTED)
                {
                    return isHighlighted ? 6 : 5;
                }
                if(this._type == Graphite.Connection.DASHED)
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
            properties.shadowOffset = 3;
            properties.shadowOpacity = 0.7;
            
            if(this._type == Graphite.Connection.DASHED)
            {
                properties.dashArray =[25, 10];
            }
            else if(this._type == Graphite.Connection.DOTTED)
            {
                properties.dashArray =[1, 8];
                properties.lineCap = "round";
            }
            
            Kinetic.Line.call(this, properties);
            
            // as we mouseenter, change line color and size
            this.on('mouseenter', function(event)
            {
                this.setStrokeWidth(this._getStrokeWidthForType(true));
                this.setOpacity(0.2);
                this.setShadowEnabled(true);
                this.getLayer().draw();
                
                this._isHighlighted = true;
            });
            
            // as we mouseleave, change line color and size
            this.on('mouseleave', function(event)
            {
                this.setStrokeWidth(this._getStrokeWidthForType(false));
                this.setOpacity(1);
                this.setShadowEnabled(false);
                this.getLayer().draw();
                
                this._isHighlighted = false;
            });
            
            this.isHighlighted = function()
            {
                if(this._isHighlighted == null)
                {
                    this._isHighlighted = false;
                }
                
                return this._isHighlighted;
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
            
            this.dragUpdate = function()
            {
                var startPt = Graphite.MathUtil.getOffsetPoint(this._startGroup.getX(), this._startGroup.getY(), 
                                                               this._endGroup.getX(), this._endGroup.getY(), 
                                                               Graphite._RADIAL_OFFSET, true);
                var endPt = Graphite.MathUtil.getOffsetPoint(this._startGroup.getX(), this._startGroup.getY(), 
                                                             this._endGroup.getX(), this._endGroup.getY(), 
                                                             Graphite._RADIAL_OFFSET, false);
                
                this.setPoints([startPt.x, startPt.y, endPt.x, endPt.y]);
                
                // note: there is intentionally no drawing here because we likely
                // have a batch of lines being dragged with one node, so draw them all at once
            };
            
            this.destroy = function()
            {
                this.off("mouseenter mouseleave");
                
                Kinetic.Line.prototype.destroy.call(this);
            };
            
            Graphite._UNIQUE_LINE_ID++;
        };
        
        Kinetic.Util.extend(Graphite.Connection, Kinetic.Line);
        Graphite.Connection.SOLID = 0;
        Graphite.Connection.DASHED = 1;
        Graphite.Connection.DOTTED = 2;
	}
)();

