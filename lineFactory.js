
if(this.Graphite == null)
{
    this.Graphite = {};
}

(
    // -- SHAPE factory
    function()
    {
        Graphite.LineFactory = function(builder)
        {
            this.createOptions = function(type)
            {
                var optionProps = { deleteProps:{}, leftHeadProps:{}, rightHeadProps:{}};
                optionProps.deleteProps.action =  function(line) { builder.removeConnection(line); };
                optionProps.leftHeadProps.action =  function(line) { line.toggleArrow(true); };
                optionProps.rightHeadProps.action =  function(line) { line.toggleArrow(false); };
                optionProps.bgImageSrc = "img/web/lineHalo.png";
                optionProps.leftHeadProps.x = -60;
                optionProps.leftHeadProps.y = 10;
                optionProps.deleteProps.x = 5;
                optionProps.deleteProps.y = 5;
                optionProps.rightHeadProps.x = 38;
                optionProps.rightHeadProps.y = 10;
                optionProps.bg = {width: 40, height:158, rotation: 90};

                return new Graphite.ConnectionOptions(optionProps);
            };
            
            this.destroyOptions = function(options)
            {
                options.destroy();
            };
        };
    }
)();
