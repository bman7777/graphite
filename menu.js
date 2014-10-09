if(this.Graphite == null)
{
    this.Graphite = {};
}

(
    // -- MENU definition
    function()
    {
        Graphite.Menu = function(mountId, eventCallback)
        {
            Graphite.Menu.BuilderCallback = eventCallback;
            
            this.addMenuItem = function(props)
            {
                if(props != null)
                {
                    var highlightId = props.title+"Highlight";
                    var subMenuId = props.title+"SubMenu";
                    var textId = props.title+"Label";
                    
                    var menuItem = "";
                    if(props.title == "Select")
                    {
                        menuItem += "<tr id=\""+subMenuId+"Row\" onclick=\"Graphite.Menu.ItemClickEvent()\"";
                    }
                    else
                    {
                        menuItem += "<tr id=\""+subMenuId+"Row\" onclick=\"Graphite.Menu.ToggleSubMenuEvent('"+subMenuId+"')\"";
                    }
                    menuItem    +=      " onmouseover=\"Graphite.Menu.HighlightItem('"+highlightId+"', '"+textId+"')\"";
                    menuItem    +=      " onmouseout=\"Graphite.Menu.UnHighlightItem('"+highlightId+"', '"+textId+"')\">";
                    menuItem    +=      "<td><a href=\"#\" title=\""+props.desc+"\">";
                    menuItem    +=          "<div class=\"menuRowOff\" id=\""+highlightId+"\">";
                    menuItem    +=               "<div class=\"menuIcon\" style=\"background-image:url('"+props.iconImg+"');\"></div>";
                    menuItem    +=          "</div>";
                    menuItem    +=          "<p class=\"menuTextOff\" id=\""+textId+"\">"+props.title+"</p>";
                    menuItem    +=      "</a></td>";
                    menuItem    += "</tr>";
                    
                    this._root.innerHTML += menuItem;
                    
                    return subMenuId;
                }
            };
            
            //add a new submenu to the given mount
            this.addSubMenu = function(subMenuId, icons)
            {
                if(subMenuId != null)
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
                            icons[i].highlightId = icons[i].title+"Highlight";
                            icons[i].id = icons[i].title+"Icon";
                            
                            subMenu += "<td class='subMenuIcon' id='"+icons[i].id+"'";
                            subMenu +=     " onclick=\"Graphite.Menu.ItemClickEvent("+icons[i].category+", {type: "+icons[i].type+"})\"";
                            subMenu +=     " onmouseover=\"Graphite.Menu.HighlightSubMenuIcon('"+icons[i].highlightId+"')\"";
                            subMenu +=     " onmouseout=\"Graphite.Menu.UnHighlightSubMenuIcon('"+icons[i].highlightId+"')\">";
                            subMenu +=         "<a href='#' title='"+icons[i].desc+"'>";
                            subMenu +=             "<div class='subMenuIconHighlight' id='"+icons[i].highlightId+"'";
                            subMenu +=                 " style=\"background-image:url('"+icons[i].iconImg+"');\">";
                            subMenu +=             "</div>";
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
                    
                    this._root.innerHTML += subMenu;
                    
                    var menu = document.getElementById(mountId);
                    menu.addEventListener('touchstart', function(icons, event)
                    {
                        var target = event.target || event.srcElement;
                        for(var i = 0; i < icons.length; i++)
                        {
                            var iconInfo = icons[i];
                            if(target.id == iconInfo.highlightId)
                            {
                                event.cancelBubble = true;
                                event.preventDefault();
                                event.stopPropagation();
                                
                                Graphite.Menu.ItemClickEvent(iconInfo.category, 
                                {
                                    type: iconInfo.type, 
                                    targetTouches: event.targetTouches, 
                                    target: target //menu
                                });
                                break;
                            }
                        }
                    }.bind(this, icons));
                }
            };
            
            if(mountId != null)
            {
                var mount = document.getElementById(mountId);
                mount.innerHTML = "<table><tbody id='menuTableRoot'></tbody></table>";
                this._root = document.getElementById("menuTableRoot");
            }
        };
        // when a submenu is clicked, activate its action
        Graphite.Menu.ItemClickEvent = function(category, param)
        {
            // make sure we aren't building two things at once
            Graphite.Menu.BuilderCallback("clearUnfinishedBuilding");
            
            switch(category)
            {
                case Graphite.MenuConfig.CATEGORY_NODE:
                    // attempt to add something of the given type
                    Graphite.Menu.BuilderCallback("addNode", param);
                    break;
                
                case Graphite.MenuConfig.CATEGORY_CONNECTION:
                    // this will setup the potential for a new line
                    Graphite.Menu.BuilderCallback("addConnection", param);
                    break;
                    
                case Graphite.MenuConfig.CATEGORY_FILE:
                    // this will setup a save or load
                    Graphite.Menu.BuilderCallback("processFile", param);
                    break;
                    
                default:
                    Graphite.Menu.BuilderCallback("selection", param);
                    break;
            }
        };
        // if a submenu is open- close it (and vice-versa)
        Graphite.Menu.ToggleSubMenuEvent = function(subMenuId)
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
        // highlight a menu category
        Graphite.Menu.HighlightItem = function(bgId, textId)
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
        Graphite.Menu.UnHighlightItem = function(bgId, textId)
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
        // the user is highlighting this submenu icon
        Graphite.Menu.HighlightSubMenuIcon = function(iconHighlightId)
        {
            if(iconHighlightId != null)
            {
                // set the highlight overlay
                document.getElementById(iconHighlightId).style.borderColor = "#559dc9";
            }
        };
        
        // the user is no longer highlighting this submenu icon
        Graphite.Menu.UnHighlightSubMenuIcon = function(iconHighlightId)
        {
            if(iconHighlightId != null)
            {
                // clear the highlight overlay
                document.getElementById(iconHighlightId).style.borderColor = "transparent";
            }
        };
    }
)();

