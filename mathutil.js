if(this.Graphite == null)
{
    this.Graphite = {};
}

if(this.Graphite.MathUtil == null)
{
    this.Graphite.MathUtil = {};
}

(
    // -- MATHUTIL definition
    function()
    {
        {
            Graphite.MathUtil.getDistance = function(x1, y1, x2, y2) 
            {
                var xComp = Math.pow(Math.abs(x2 - x1), 2);
                var yComp = Math.pow(Math.abs(y2 - y1), 2);
                return Math.sqrt(xComp + yComp);
            };
            
            Graphite.MathUtil.Clamp = function(min, max, num)
            {
                return Math.max(min,Math.min(num,max));
            };
            
            Graphite.MathUtil.GetCenterPoint = function(startX, startY, endX, endY)
            {
                var midX;
                var midY;
                
                if(endX > startX)
                {
                    midX = ((endX - startX) / 2) + startX;
                }
                else
                {
                    midX = ((startX - endX) / 2) + endX;
                }
                
                if(endY > startY)
                {
                    midY = ((endY - startY) / 2) + startY;
                }
                else
                {
                    midY = ((startY - endY) / 2) + endY;
                }
                
                return {x:midX, y:midY};
            };
            
            Graphite.MathUtil.getOffsetPoint = function(x1, y1, x2, y2, offset, from1) 
            {
                var x;
                var y;
                var oneIsLeftOfTwo = (x1 < x2) ? true : false;
                var oneIsAboveTwo = (y1 < y2) ? true : false;
                var slope = (y2 - y1) / (x2 - x1);
                
                // offset is from point #1
                if(from1)
                {
                    if(oneIsLeftOfTwo)
                    {
                        x = x1 + (offset / Math.sqrt(1 + Math.pow(slope, 2)));
                    }
                    else
                    {
                        x = x1 - (offset / Math.sqrt(1 + Math.pow(slope, 2)));
                    }
                    
                    if(oneIsAboveTwo)
                    {
                        y = y1 + Math.sqrt(Math.pow(offset, 2) - Math.pow(x1 - x, 2));
                    }
                    else
                    {
                        y = y1 - Math.sqrt(Math.pow(offset, 2) - Math.pow(x1 - x, 2));
                    }
                }
                else // offset is from point #2
                {
                    if(oneIsLeftOfTwo)
                    {
                        x = x2 - (offset / Math.sqrt(1 + Math.pow(slope, 2)));
                    }
                    else
                    {
                        x = x2 + (offset / Math.sqrt(1 + Math.pow(slope, 2)));
                    }
                    
                    if(oneIsAboveTwo)
                    {
                        y = y2 - Math.sqrt(Math.pow(offset, 2) - Math.pow(x2 - x, 2));
                    }
                    else
                    {
                        y = y2 + Math.sqrt(Math.pow(offset, 2) - Math.pow(x2 - x, 2));
                    }
                }
                
                return {x:x, y:y};
            };
        };
    }
)();
