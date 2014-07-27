
if(this.Graphite == null)
{
    this.Graphite = {};
}

(
    // -- SHAPE factory
    function()
    {
        Graphite.ShapeFactory = function(builder)
        {
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
                    shadowOffset: 10,
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
                    shadowOffset: 10,
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
                    shadowOffset: 10,
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
                
                shape.onHighlight = function()
                {
                    this._isHighlighted = true;
                    this.setFill('#EEEEEE');
                    this.setRadius(Graphite.ShapeFactory.DEFAULT_RADIUS + 4);
                    this.setShadowEnabled(true);
                };
                
                shape.onUnHighlight = function()
                {
                    this.setFill(Graphite.ShapeFactory.DEFAULT_FILL_COLOR);
                    this.setRadius(Graphite.ShapeFactory.DEFAULT_RADIUS);
                    this.setShadowEnabled(false);
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
                
                switch(type)
                {
                    case Graphite.ShapeFactory.TRIANGLE:
                        optionProps.bgImageSrc = "img/web/lineHalo.png";
                        optionProps.contentProps.x = 58;
                        optionProps.contentProps.y = -39;
                        optionProps.deleteProps.x = 27;
                        optionProps.deleteProps.y = -88;
                        optionProps.settingsProps.x = 83;
                        optionProps.settingsProps.y = 10;
                        optionProps.bg = {width: 12, height:150, rotation: -33};
                        break;
                        
                    case Graphite.ShapeFactory.SQUARE:
                        optionProps.bgImageSrc = "img/web/lineHalo.png";
                        optionProps.contentProps.x = 67;
                        optionProps.contentProps.y = -15;
                        optionProps.deleteProps.x = 65;
                        optionProps.deleteProps.y = -75;
                        optionProps.settingsProps.x = 60;
                        optionProps.settingsProps.y = 40;
                        optionProps.bg = {width: 125, height:150, rotation: 0};
                        break;
                    
                    default:
                        optionProps.bgImageSrc = "img/web/roundHalo.png";
                        optionProps.contentProps.x = 90;
                        optionProps.contentProps.y = -60;
                        optionProps.deleteProps.x = 46;
                        optionProps.deleteProps.y = -114;
                        optionProps.settingsProps.x = 90;
                        optionProps.settingsProps.y = 5;
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
