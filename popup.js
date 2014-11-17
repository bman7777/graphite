
if(this.Graphite == null)
{
    this.Graphite = {};
}

(
    // -- MENU definition
    function()
    {
        Graphite.Popup = function(mountId, scrimMountId)
        {
            var POPUP_WIDTH = 500;
            
            if(mountId != null)
            {
                this._container = document.getElementById(mountId);
                this._container.style.visibility = "hidden";
                this._container.style.width = ""+POPUP_WIDTH+"px";
                
                // if the user zooms in, we need to get as much of the popup as possible to show
                this._container.style.left = "" + ((window.innerWidth - POPUP_WIDTH) / 2) + "px";
                
                this._scrimContainer = document.getElementById(scrimMountId);
                this._scrimContainer.style.visibility = "hidden";
                
                this._rootId = "popupRoot";
                this._container.innerHTML = "<table id=\""+this._rootId+"\"></table>";
            }
            
            this.open = function(title, settings, buttons)
            {
                var rowButtons = new Array();
                var popupData = "<tr><td class=\"popupHeader\"><p style=\"margin-left: 15px\">"+title+"</p></td></tr>";
                for(var i = 0; i < settings.length; i++)
                {
                    popupData += "<tr class=\"popupRow\"><td>";
                    
                    for(var j = 0; j < settings[i].length; j++)
                    {
                        var settingObj = settings[i][j];
                        if(settingObj != undefined)
                        {
                            var useParagraph = settingObj.text != undefined ? true : false;
                            if(useParagraph)
                            {
                                popupData += "<p class=\"popupLabel\">"+settingObj.text;
                            }
                            
                            if(settingObj.type != "message")
                            {
                                if(settingObj.attribute == undefined)
                                {
                                    settingObj.attribute = ""; 
                                }
                                popupData += "<input id=\""+settingObj.id+"\" class=\"popupInput\" type=\""+
                                    settingObj.type+"\" "+settingObj.attribute+" value=\""+
                                    settingObj.value+"\"/>";
                            }
                            
                            if(settingObj.type == 'button')
                            {
                                rowButtons.push(settingObj);
                            }
                            
                            if(useParagraph)
                            {
                                popupData += "</p>";
                            }
                        }
                    }
                    
                    popupData += "</td></tr>";
                }

                popupData += "<tr class=\"popupFooter\"><td><div style=\"float: right;\">";
                
                for(var i = 0; i < buttons.length; i++)
                {
                    popupData +=    "<a href=\"#\" title=\""+buttons[i].desc+"\">";
                    popupData +=        "<div id=\""+buttons[i].id+"\" class=\"popupButton\">"+buttons[i].text+"</div>";
                    popupData +=    "</a>";
                }
                
                popupData += "</div></td></tr>";
                
                document.getElementById(this._rootId).innerHTML = popupData;
                
                for(var i = 0; i < rowButtons.length; i++)
                {
                    var button = document.getElementById(rowButtons[i].id);
                    button.onclick = this._onClickButton.bind(this, rowButtons[i].onClickCallback);
                }
                
                for(var i = 0; i < buttons.length; i++)
                {
                    var button = document.getElementById(buttons[i].id);
                    button.onclick = this._onClickButton.bind(this, buttons[i].onClickCallback);
                    button.onmouseover = this.onHighlightButton;
                    button.onmouseout = this.onUnHighlightButton;
                }
                
                // show the popup
                this._container.style.visibility = "visible";
                this._scrimContainer.style.visibility = "visible";
            };
            
            this._onClickButton = function(callback, event)
            {
                if(callback == null || callback(event) != false)
                {
                    this.close();
                }
            };
            
            window.onresize = function()
            {
                this._container.style.left = "" + ((window.innerWidth - POPUP_WIDTH) / 2) + "px";
            }.bind(this);
            
            this.close = function()
            {
                this._pendingShape = null;
                
                // we will make this fresh next time we open
                document.getElementById(this._rootId).innerHTML = "";
                
                // hide everything
                this._container.style.visibility = "hidden";
                this._scrimContainer.style.visibility = "hidden";
            };
            
            this.onHighlightButton = function(event)
            {
                var target = event.target || event.srcElement;
                target.style.textShadow = "0px 1px 2px #333333";
                target.style.backgroundColor = "#cceeee";
                target.style.borderColor = "#9d9e9e";
                target.style.cursor = "pointer";
            };
            
            this.onUnHighlightButton = function(event)
            {
                var target = event.target || event.srcElement;
                target.style.textShadow = "none";
                target.style.backgroundColor = "#559dc9";
                target.style.borderColor = "transparent";
                target.style.cursor = "default";
            };
        };
    }
)();

