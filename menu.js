
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
                
                menuItem += "<td><a href=\"#\" title=\""+props.desc+"\">";
                menuItem +=     "<div class=\"menuRowOff\" id=\""+highlightId+"\">";
                menuItem +=         "<div class=\"menuIcon\" style=\"background-image:url('"+props.iconImg+"');\"></div>";
                menuItem +=     "</div>";
                menuItem +=     "<p class=\"menuTextOff\" id=\""+textId+"\">"+props.title+"</p>";
                menuItem += "</a></td>";
                menuItem +  "</tr>";
                
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
                var MAX_ROWS = 2;
                
                // loop through each icon and add them to a td in the submenu
                for(var i = 0; i < (MAX_ICONS_PER_ROW * MAX_ROWS); i++)
                {
                    // if this is the first icon (of the row) initialize the tr
                    if(i % MAX_ICONS_PER_ROW == 0)
                    {
                        // if we had a previous row in progress end that row
                        if(i > 0)
                        {
                            subMenu += "<td class='subMenuGutter'></td></tr>";
                        }
                        
                        subMenu += "<tr><td class='subMenuGutter'></td>";
                    }
                    
                    if(i < icons.length)
                    {
                        var highlightId = icons[i].title+"Highlight";
                        
                        subMenu += "<td class='subMenuIcon' ";
                        subMenu +=     "onmouseover=\"GraphiteMenu.onHighlightSubMenuIcon('"+highlightId+"')\" ";
                        subMenu +=     "onmouseout=\"GraphiteMenu.UN_onHighlightSubMenuIcon('"+highlightId+"')\" ";
                        subMenu +=     "onclick=\"GraphiteMenu.onClickSubMenuIcon("+icons[i].category+", "+icons[i].type+")\">";
                        subMenu +=         "<a href='#' title='"+icons[i].desc+"'>";
                        subMenu +=             "<div class='subMenuIconHighlight' id='"+highlightId+"' style=\"background-image:url('"+icons[i].iconImg+"');\"></div>";
                        subMenu +=         "</a>";
                        subMenu += "</td>";
                    }
                    else
                    {
                        subMenu += "<td class='subMenuGutter'></td>";
                    }
                    
                    // if this is the last icon of the last row, end it now
                    if((i+1) == (MAX_ICONS_PER_ROW * MAX_ROWS))
                    {
                        subMenu += "<td class='subMenuGutter'></td></tr>";
                    }
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
                    
                case Graphite.Builder.CATEGORY_FILE:
                    // this will setup a save or load
                    this._graphiteBuilder.processFile(type);
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

