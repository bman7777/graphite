
if(this.GraphiteMenu == null)
{
    this.GraphiteMenu = {};
}

(
    // -- MENU definition
    function()
    {
        GraphiteMenu.createRootMenu = function(mountId, graphiteBuilder)
        {
            this._graphiteBuilder = graphiteBuilder;
            
            if(mountId != null)
            {
                var rootId = "tableRoot";
                document.getElementById(mountId).innerHTML = "<table id=\""+rootId+"\"></table>";
                return rootId;
            }
        };
        
        GraphiteMenu.addMenuItem = function(mountId, props)
        {
            if(mountId != null && props != null)
            {
                var highlightId = props.title+"Highlight";
                var subMenuId = props.title+"SubMenu";
                var textId = props.title+"Label";
                
                var menuItem = "<tr onmouseover=\"GraphiteMenu.onHighlightItem('"+highlightId+"', '"+textId+"')\" ";
                menuItem +=        "onmouseout=\"GraphiteMenu.UN_onHighlightItem('"+highlightId+"', '"+textId+"')\" ";
                
                if(props.title == "Select")
                {
                    menuItem += "onclick=\"GraphiteMenu.onClickSubMenuIcon()\">";
                }
                else
                {
                    menuItem += "onclick=\"GraphiteMenu.onToggleSubMenu('"+subMenuId+"')\">";
                }
                
                menuItem += "<td><a href=\"#\" title=\""+props.desc+"\"><div class=\"menuRowOff\" id=\""+highlightId+"\">";
                menuItem += "<div class=\"menuIcon\" style=\"background-image:url('"+props.iconImg+"');\"></div>";
                menuItem += "</div><p class=\"menuTextOff\" id=\""+textId+"\">"+props.title+"</p></a></td></tr>";
                
                document.getElementById(mountId).innerHTML += menuItem;
                
                return subMenuId;
            }
        };
        
        // highlight a menu category
        GraphiteMenu.onHighlightItem = function(bgId, textId)
        {
            if(textId != null)
            {
                document.getElementById(textId).className = "menuTextOn";
            }
            
            if(bgId != null)
            {
                document.getElementById(bgId).className = "menuRowOn";
            }
        };
        
        // no longer highlight a menu category
        GraphiteMenu.UN_onHighlightItem = function(bgId, textId)
        {
            if(textId != null)
            {
                document.getElementById(textId).className = "menuTextOff";
            }
            
            if(bgId != null)
            {
                document.getElementById(bgId).className = "menuRowOff";
            }
        };
    }
)(),

(
    // -- SUBMENU definition
    function()
    {
        // add a new submenu to the given mount
        GraphiteMenu.addSubMenu = function(mountId, subMenuId, icons)
        {
            if(mountId != null && subMenuId != null)
            {
                var subMenu = "<tr id='"+subMenuId+"' style='display: none;'><td>";
                subMenu += "<table class='subMenu'><tr></tr>";
                
                var MAX_ICONS_PER_ROW = 2;
                var i = 0;
                
                // loop through each icon and add them to a td in the submenu
                while(i < icons.length)
                {
                    // if this is the first icon (of the row) initialize the tr
                    if(i%MAX_ICONS_PER_ROW == 0)
                    {
                        if(i > 0)
                        {
                            subMenu += "<td></td></tr>";
                        }
                        
                        subMenu += "<tr><td class='subMenuLeftGutter'></td>";
                    }
                    
                    var highlightId = icons[i].title+"Highlight";
                    
                    subMenu += "<td class='subMenuIcon' ";
                    subMenu +=     "onmouseover=\"GraphiteMenu.onHighlightSubMenuIcon('"+highlightId+"')\" ";
                    subMenu +=     "onmouseout=\"GraphiteMenu.UN_onHighlightSubMenuIcon('"+highlightId+"')\" ";
                    subMenu +=     "onclick=\"GraphiteMenu.onClickSubMenuIcon("+icons[i].category+", "+icons[i].type+")\">";
                    subMenu +=         "<div class='subMenuIconHighlight' id='"+highlightId+"' style=\"background-image:url('"+icons[i].iconImg+"');\"/>";
                    subMenu += "</td>";

                    i++;
                }
                
                // end off the tr if we didn't cleanly reach an end
                if(i % MAX_ICONS_PER_ROW != 0)
                {
                    while(i % MAX_ICONS_PER_ROW != 0)
                    {
                        subMenu += "<td></td>";
                        i++;
                    }
                    
                    subMenu += "<td></td></tr>";
                }
                
                // end the table
                subMenu += "<tr></tr></table></td></tr>";
                
                document.getElementById(mountId).innerHTML += subMenu;
            }
        };
        
        // the user is highlighting this submenu icon
        GraphiteMenu.onHighlightSubMenuIcon = function(iconHighlightId)
        {
            if(iconHighlightId != null)
            {
                // set the highlight overlay
                document.getElementById(iconHighlightId).style.borderColor = "#559dc9";
            }
        };
        
        // the user is no longer highlighting this submenu icon
        GraphiteMenu.UN_onHighlightSubMenuIcon = function(iconHighlightId)
        {
            if(iconHighlightId != null)
            {
                // clear the highlight overlay
                document.getElementById(iconHighlightId).style.borderColor = "transparent";
            }
        };
        
        // when a submenu is clicked, activate its action
        GraphiteMenu.onClickSubMenuIcon = function(category, type)
        {
            // make sure we aren't building two things at once
            this._graphiteBuilder.clearUnfinishedBuilding();
            
            switch(category)
            {
                case Graphite.Builder.CATEGORY_NODE:
                    // attempt to add something of the given type
                    this._graphiteBuilder.addNode(type);
                    break;
                
                case Graphite.Builder.CATEGORY_CONNECTION:
                    // this will setup the potential for a new line
                    this._graphiteBuilder.readyForNewConnection(type);
                    break;
                    
                default:
                    this._graphiteBuilder.enterSelectionState();
                    break;
            }
        };
        
        // if a submenu is open- close it (and vice-versa)
        GraphiteMenu.onToggleSubMenu = function(subMenuId)
        {
            var subMenu = document.getElementById(subMenuId);
            if(subMenu != null)
            {
                if(this._subMenuVisible == null)
                {
                    this._subMenuVisible = new Array();
                }
                
                if(this._subMenuVisible[subMenuId] == null)
                {
                    this._subMenuVisible[subMenuId] = false;
                }
                
                if(this._subMenuVisible[subMenuId])
                {
                    subMenu.style.display = "none";
                }
                else
                {
                    subMenu.style.display = "table-row";
                }
                
                this._subMenuVisible[subMenuId] = !this._subMenuVisible[subMenuId];
            }
        };
    }
)();

