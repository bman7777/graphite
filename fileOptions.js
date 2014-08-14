
if(this.Graphite == null)
{
    this.Graphite = {};
}
	
(
    // -- FILE-OPTIONS definition
    function()
    {
        Graphite.FileOptions = function(stage)
        {
            this._stage = stage;
            
            this.newFile = function()
            {
                // todo clear out nodes and ask for file name
            };
            
            this.save = function()
            {
                // todo write nodes/lines to a json/xml file
            };
            
            this.load = function()
            {
                // todo - open a popup to ask which file
                
                // load from json/xml
            };
        };
        
        Graphite.FileOptions.NEW = 0;
        Graphite.FileOptions.SAVE = 1;
        Graphite.FileOptions.LOAD = 2;
    }
)();

