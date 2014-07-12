
if(this.Graphite == null)
{
	this.Graphite = {};
}

(
	// -- CONNECTION definition
	function()
	{
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
			
			if(properties.end != null)
			{
				this._endGroup = properties.end;
				properties.points = [properties.start.getX(), properties.start.getY(), properties.end.getX(), properties.end.getY()];
			}
			else
			{
				// no end means it starts and stops in same pixel
				this._endGroup = properties.start;
				properties.points = [properties.start.getX(), properties.start.getY(), properties.start.getX(), properties.start.getY()];
			}
			
			this._getStrokeWidthForType = function(isHighlighted)
			{
				if(this._type == Graphite.Connection.DOTTED)
				{
					if(isHighlighted)
					{
						return 6;
					}
					else
					{
						return 5;
					}
				}
				if(this._type == Graphite.Connection.DASHED)
				{
					if(isHighlighted)
					{
						return 6;
					}
					else
					{
						return 4;
					}
				}
				else
				{
					if(isHighlighted)
					{
						return 6;
					}
					else
					{
						return 3;
					}
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
				this._endGroup = end;
			};
			
			this.getEndGroups = function()
			{
				return {start:this._startGroup, end:this._endGroup};
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

