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
                highlightImg:"img/web/icon_highlight.png",
                desc:"Draw a Circle",
                type:Graphite.ShapeFactory.CIRCLE,
                category:Graphite.Builder.CATEGORY_NODE
            },
            {
                title:"Square",
                iconImg:"img/web/square.gif",
                highlightImg:"img/web/icon_highlight.png",
                desc:"Draw a Square",
                type:Graphite.ShapeFactory.SQUARE,
                category:Graphite.Builder.CATEGORY_NODE
            },
            {
                title:"Triangle",
                iconImg:"img/web/triangle.gif",
                highlightImg:"img/web/icon_highlight.png",
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
                highlightImg:"img/web/icon_highlight.png",
                desc:"Draw a Dashed Line",
                type:Graphite.Connection.DASHED,
                category:Graphite.Builder.CATEGORY_CONNECTION
            },
            {
                title:"Dotted",
                iconImg:"img/web/dotted.gif",
                highlightImg:"img/web/icon_highlight.png",
                desc:"Draw a Dotted Line",
                type:Graphite.Connection.DOTTED,
                category:Graphite.Builder.CATEGORY_CONNECTION
            },
            {
                title:"Solid",
                iconImg:"img/web/solid.gif",
                highlightImg:"img/web/icon_highlight.png",
                desc:"Draw a Solid Line",
                type:Graphite.Connection.SOLID,
                category:Graphite.Builder.CATEGORY_CONNECTION
            }]);
        };
    }
)();
