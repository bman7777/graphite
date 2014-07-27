
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
                optionProps.leftHeadProps.x = -134;
                optionProps.leftHeadProps.y = -90;
                optionProps.deleteProps.x = -67;
                optionProps.deleteProps.y = -92;
                optionProps.rightHeadProps.x = 27;
                optionProps.rightHeadProps.y = -62;
                optionProps.bg = {width: 42, height:158, rotation: 90};

                return new Graphite.ConnectionOptions(optionProps);
            };
            
            this.destroyOptions = function(options)
            {
                options.destroy();
            };
        };
    }
)();
