
if(this.Graphite == null)
{
    this.Graphite = {};
}

(
    // -- SHAPE factory
    function()
    {
        Graphite.ShapeFactory = function(builder, settings)
        {
            // $HACK Start$ Kinetic bug that doesn't cache properly
            Kinetic.Circle.prototype._useBufferCanvas = function() 
            {
                return false;
            };
            Kinetic.RegularPolygon.prototype._useBufferCanvas = function() 
            {
                return false;
            };
            // $HACK end$
            
            this._createCircle = function()
            {
                var shapeProps = 
                {
                    fill: Graphite.ShapeFactory.DEFAULT_FILL_COLOR,
                    stroke: 'black',
                    strokeWidth: 3,
                    radius: Graphite.ShapeFactory.DEFAULT_RADIUS,
                    shadowEnabled: false,
                    shadowColor: '#555555',
                    shadowOffset: {x:4, y: 4},
                    shadowOpacity: 0.5
                };
                
                return new Kinetic.Circle(shapeProps);
            };
            
            this._createTriangle = function()
            {
                var shapeProps = 
                {
                    fill: Graphite.ShapeFactory.DEFAULT_FILL_COLOR,
                    stroke: 'black',
                    strokeWidth: 3,
                    radius: Graphite.ShapeFactory.DEFAULT_RADIUS,
                    shadowEnabled: false,
                    shadowColor: '#555555',
                    shadowOffset: {x:4, y: 4},
                    shadowOpacity: 0.5,
                    sides: 3
                };
                
                return new Kinetic.RegularPolygon(shapeProps);
            };
            
            this._createSquare = function()
            {
                var shapeProps = 
                {
                    fill: Graphite.ShapeFactory.DEFAULT_FILL_COLOR,
                    stroke: 'black',
                    strokeWidth: 3,
                    radius: Graphite.ShapeFactory.DEFAULT_RADIUS,
                    shadowEnabled: false,
                    shadowColor: '#555555',
                    shadowOffset: {x:4, y: 4},
                    shadowOpacity: 0.5,
                    sides: 4,
                    rotationDeg: 45
                };
                
                return new Kinetic.RegularPolygon(shapeProps);
            };
            
            this.createShape = function(type)
            {
                var shape;
                switch(type)
                {
                    case Graphite.ShapeFactory.TRIANGLE:
                        shape = this._createTriangle();
                        break;

                    case Graphite.ShapeFactory.SQUARE:
                        shape = this._createSquare();
                        break;

                    default:
                        shape = this._createCircle();
                        break;
                }
                
                this._unHighlightColor = Graphite.ShapeFactory.DEFAULT_FILL_COLOR;
                
                shape.unHighlightColor = function(color)
                {
                    if(color == undefined)
                    {
                        return this._unHighlightColor;
                    }
                    else
                    {
                        this._unHighlightColor = color;
                    }
                };
                
                shape.onHighlight = function()
                {
                    this._isHighlighted = true;
                    this._unHighlightColor = this.fill();
                    
                    // average with white to get a brighter color
                    var unhighlightRGB = Kinetic.Util.getRGB(this._unHighlightColor);
                    var MAX_COLOR = 255;
                    this.fill('rgb('+Math.round((unhighlightRGB.r + MAX_COLOR) / 2) +','+
                                     Math.round((unhighlightRGB.g + MAX_COLOR) / 2) +','+
                                     Math.round((unhighlightRGB.b + MAX_COLOR) / 2) +')');
                    
                    this.setRadius(Graphite.ShapeFactory.DEFAULT_RADIUS + 4);
                    this.shadowEnabled(true);
                };
                
                shape.onUnHighlight = function()
                {
                    this.setFill(this._unHighlightColor);
                    this.setRadius(Graphite.ShapeFactory.DEFAULT_RADIUS);
                    this.shadowEnabled(false);
                    this._isHighlighted = false;
                };
                
                shape.isHighlighted = function()
                {
                    if(this._isHighlighted == null)
                    {
                        this._isHighlighted = false;
                    }
                    
                    return this._isHighlighted;
                };
                
                return shape;
            };
            
            this.createOptions = function(type)
            {
                var optionProps = { deleteProps:{}, contentProps:{}, settingsProps:{}};
                optionProps.deleteProps.action =  function(node) { builder.removeNode(node); };
                optionProps.settingsProps.action =  function(node) { builder.openSettings(node); };
                
                switch(type)
                {
                    case Graphite.ShapeFactory.TRIANGLE:
                        optionProps.bgImageSrc = "img/web/lineHalo.png";
                        optionProps.contentProps.x = 58;
                        optionProps.contentProps.y = -39;
                        optionProps.deleteProps.x = 27;
                        optionProps.deleteProps.y = -88;
                        optionProps.settingsProps.x = 80;
                        optionProps.settingsProps.y = 4;
                        optionProps.bg = {width: 12, height:150, rotation: -33};
                        break;
                        
                    case Graphite.ShapeFactory.SQUARE:
                        optionProps.bgImageSrc = "img/web/lineHalo.png";
                        optionProps.contentProps.x = 72;
                        optionProps.contentProps.y = -10;
                        optionProps.deleteProps.x = 71;
                        optionProps.deleteProps.y = -62;
                        optionProps.settingsProps.x = 67;
                        optionProps.settingsProps.y = 36;
                        optionProps.bg = {width: 125, height:150, rotation: 0};
                        break;
                    
                    default:
                        optionProps.bgImageSrc = "img/web/roundHalo.png";
                        optionProps.contentProps.x = 94;
                        optionProps.contentProps.y = -38;
                        optionProps.deleteProps.x = 52;
                        optionProps.deleteProps.y = -104;
                        optionProps.settingsProps.x = 82;
                        optionProps.settingsProps.y = 27;
                        optionProps.bg = {width: -10, height:200, rotation:-25};
                        break;
                }

                return new Graphite.NodeOptions(optionProps);
            };
            
            this.destroyOptions = function(options)
            {
                options.destroy();
            };
            
            this.destroyShape = function(shape)
            {
                shape.destroy();
            };
        };
        
        Graphite.ShapeFactory.DEFAULT_FILL_COLOR = '#CCEEEE';
        Graphite.ShapeFactory.DEFAULT_RADIUS = 75;
        
        Graphite.ShapeFactory.CIRCLE = 0;
        Graphite.ShapeFactory.SQUARE = 1;
        Graphite.ShapeFactory.TRIANGLE = 2;
    }
)();
