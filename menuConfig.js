if(this.Graphite == null)
{
    this.Graphite = {};
}

if(this.Graphite.MenuConfig == null)
{
    this.Graphite.MenuConfig = {};
}

(
    // -- MENU config
    function()
    {
        {
            Graphite.MenuConfig.Create = function(menu)
            {
                var fileSubMenuId = menu.addMenuItem( 
                {
                    title:"File", 
                    desc:"Save/Load a Graph", 
                    iconImg:"img/web/fileIcon.gif"
                });
                menu.addSubMenu(fileSubMenuId, 
                [{
                    title:"New",
                    iconImg:"img/web/new.gif",
                    desc:"New/Rename Graph",
                    type:Graphite.MenuConfig.FILE_NEW,
                    category:Graphite.MenuConfig.CATEGORY_FILE
                },
                {
                    title:"Save",
                    iconImg:"img/web/save.gif",
                    desc:"Save Graph to a File",
                    type:Graphite.MenuConfig.FILE_SAVE,
                    category:Graphite.MenuConfig.CATEGORY_FILE
                },
                {
                    title:"Open",
                    iconImg:"img/web/open.png",
                    desc:"Open a Graph",
                    type:Graphite.MenuConfig.FILE_LOAD,
                    category:Graphite.MenuConfig.CATEGORY_FILE
                }]);
                
                menu.addMenuItem( 
                {
                    title:"Select", 
                    desc:"Move/Modify Graph", 
                    iconImg:"img/web/selectIcon.gif"
                });
                
                var shapeSubMenuId = menu.addMenuItem( 
                {
                    title:"Shapes", 
                    desc:"Add a New Shape to the Graph", 
                    iconImg:"img/web/shapesIcon.gif"
                });
                menu.addSubMenu(shapeSubMenuId, 
                [{
                    title:"Circle",
                    iconImg:"img/web/circle.gif",
                    desc:"Draw a Circle",
                    type:Graphite.MenuConfig.SHAPE_CIRCLE,
                    category:Graphite.MenuConfig.CATEGORY_NODE
                },
                {
                    title:"Square",
                    iconImg:"img/web/square.png",
                    desc:"Draw a Square",
                    type:Graphite.MenuConfig.SHAPE_SQUARE,
                    category:Graphite.MenuConfig.CATEGORY_NODE
                },
                {
                    title:"Triangle",
                    iconImg:"img/web/triangle.gif",
                    desc:"Draw a Triangle",
                    type:Graphite.MenuConfig.SHAPE_TRIANGLE,
                    category:Graphite.MenuConfig.CATEGORY_NODE
                }]);
                
                var lineSubMenuId = menu.addMenuItem( 
                {
                    title:"Lines", 
                    desc:"Add a New Line to the Graph", 
                    iconImg:"img/web/linesIcon.gif"
                });
                menu.addSubMenu(lineSubMenuId, 
                [{
                    title:"Dashed",
                    iconImg:"img/web/dashed.gif",
                    desc:"Draw a Dashed Line",
                    type:Graphite.MenuConfig.CONNECTION_DASHED,
                    category:Graphite.MenuConfig.CATEGORY_CONNECTION
                },
                {
                    title:"Dotted",
                    iconImg:"img/web/dotted.gif",
                    desc:"Draw a Dotted Line",
                    type:Graphite.MenuConfig.CONNECTION_DOTTED,
                    category:Graphite.MenuConfig.CATEGORY_CONNECTION
                },
                {
                    title:"Solid",
                    iconImg:"img/web/solid.gif",
                    desc:"Draw a Solid Line",
                    type:Graphite.MenuConfig.CONNECTION_SOLID,
                    category:Graphite.MenuConfig.CATEGORY_CONNECTION
                }]);
            };
            
            Graphite.MenuConfig.FILE_NEW = 0;
            Graphite.MenuConfig.FILE_SAVE = 1;
            Graphite.MenuConfig.FILE_LOAD = 2;
            
            Graphite.MenuConfig.CATEGORY_NODE = 0;
            Graphite.MenuConfig.CATEGORY_CONNECTION = 1;
            Graphite.MenuConfig.CATEGORY_FILE = 2;
            
            Graphite.MenuConfig.STATE_SELECT = 0;
            Graphite.MenuConfig.STATE_NODE = 1;
            Graphite.MenuConfig.STATE_CONNECTION = 2;
            
            Graphite.MenuConfig.SHAPE_CIRCLE = 0;
            Graphite.MenuConfig.SHAPE_SQUARE = 1;
            Graphite.MenuConfig.SHAPE_TRIANGLE = 2;
            
            Graphite.MenuConfig.CONNECTION_SOLID = 0;
            Graphite.MenuConfig.CONNECTION_DASHED = 1;
            Graphite.MenuConfig.CONNECTION_DOTTED = 2;
        };
    }
)();
