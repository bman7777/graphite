
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
                var optionProps = { deleteProps:{x:-16, y:-45}, contentProps:{}, settingsProps:{}, bg:{width: 200, height:200}};
                optionProps.deleteProps.action =  function(node) { builder.removeNode(node); };
                
                switch(type)
                {
                    case Graphite.ShapeFactory.TRIANGLE:
                        optionProps.contentProps.x = -27;
                        optionProps.contentProps.y = 50;
                        optionProps.settingsProps.x = 2;
                        optionProps.settingsProps.y = 53;
                        break;
                        
                    case Graphite.ShapeFactory.SQUARE:
                        optionProps.contentProps.x = -27;
                        optionProps.contentProps.y = 64;
                        optionProps.settingsProps.x = 2;
                        optionProps.settingsProps.y = 67;
                        break;
                    
                    default:
                        optionProps.contentProps.x = -29;
                        optionProps.contentProps.y = 81;
                        optionProps.settingsProps.x = 0;
                        optionProps.settingsProps.y = 84;
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
