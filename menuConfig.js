if(this.GraphiteMenu == null)
{
    this.GraphiteMenu = {};
}

(
    // -- MENU config
    function()
    {
        GraphiteMenu.CONFIG = function(root)
        {
            var fileSubMenuId = GraphiteMenu.addMenuItem(root, 
            {
                title:"File", 
                desc:"Save/Load a Graph", 
                iconImg:"img/web/fileIcon.gif"
            });
            GraphiteMenu.addSubMenu(root, fileSubMenuId, 
            [{
                title:"New",
                iconImg:"img/web/new.gif",
                desc:"New Graph",
                type:Graphite.FileOptions.NEW,
                category:Graphite.Builder.CATEGORY_FILE
            },
            {
                title:"Save",
                iconImg:"img/web/save.gif",
                desc:"Save Graph to a File",
                type:Graphite.FileOptions.SAVE,
                category:Graphite.Builder.CATEGORY_FILE
            },
            {
                title:"Load",
                iconImg:"img/web/open.gif",
                desc:"Load a Graph",
                type:Graphite.FileOptions.LOAD,
                category:Graphite.Builder.CATEGORY_FILE
            }]);
            
            GraphiteMenu.addMenuItem(root, 
            {
                title:"Select", 
                desc:"Move/Modify Graph", 
                iconImg:"img/web/selectIcon.gif"
            });
            
            var shapeSubMenuId = GraphiteMenu.addMenuItem(root, 
            {
                title:"Shapes", 
                desc:"Add a New Shape to the Graph", 
                iconImg:"img/web/shapesIcon.gif"
            });
            GraphiteMenu.addSubMenu(root, shapeSubMenuId, 
            [{
                title:"Circle",
                iconImg:"img/web/circle.gif",
                desc:"Draw a Circle",
                type:Graphite.ShapeFactory.CIRCLE,
                category:Graphite.Builder.CATEGORY_NODE
            },
            {
                title:"Square",
                iconImg:"img/web/square.gif",
                desc:"Draw a Square",
                type:Graphite.ShapeFactory.SQUARE,
                category:Graphite.Builder.CATEGORY_NODE
            },
            {
                title:"Triangle",
                iconImg:"img/web/triangle.gif",
                desc:"Draw a Triangle",
                type:Graphite.ShapeFactory.TRIANGLE,
                category:Graphite.Builder.CATEGORY_NODE
            }]);
            
            var lineSubMenuId = GraphiteMenu.addMenuItem(root, 
            {
                title:"Lines", 
                desc:"Add a New Line to the Graph", 
                iconImg:"img/web/linesIcon.gif"
            });
            GraphiteMenu.addSubMenu(root, lineSubMenuId, 
            [{
                title:"Dashed",
                iconImg:"img/web/dashed.gif",
                desc:"Draw a Dashed Line",
                type:Graphite.Connection.DASHED,
                category:Graphite.Builder.CATEGORY_CONNECTION
            },
            {
                title:"Dotted",
                iconImg:"img/web/dotted.gif",
                desc:"Draw a Dotted Line",
                type:Graphite.Connection.DOTTED,
                category:Graphite.Builder.CATEGORY_CONNECTION
            },
            {
                title:"Solid",
                iconImg:"img/web/solid.gif",
                desc:"Draw a Solid Line",
                type:Graphite.Connection.SOLID,
                category:Graphite.Builder.CATEGORY_CONNECTION
            }]);
        };
    }
)();
