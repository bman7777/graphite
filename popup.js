
if(this.Graphite == null)
{
    this.Graphite = {};
}

(
    // -- MENU definition
    function()
    {
        Graphite.Popup = function(mountId)
        {
            if(mountId != null)
            {
                this._container = document.getElementById(mountId);
                this._rootId = "popupRoot";
                this._container.innerHTML = "<table id=\""+this._rootId+"\"></table>";
            }
            
            this.open = function(settings, buttons)
            {
                var popupData = "<tr><td class='popupHeader' colspan='3'><p style='margin-left: 15px'>Settings</p></td></tr>";
                for(var i = 0; i < settings.length; i++)
                {
                    popupData +=    "<tr><td class='popupRow' colspan='3'>";
                    popupData +=        "<p class='popupLabel'>"+settings[i].text;
                    popupData +=            "<input id='"+settings[i].id+"' class='popupInput' type='"+settings[i].type+"' value='"+settings[i].value+"'/>";
                    popupData +=        "</p>";
                    popupData +=    "</td></tr>";
                }

                popupData +=    "<tr class='popupFooter'>";
                popupData +=        "<td class='popupFooterSpacer'></td>";
                
                for(var i = 0; i < buttons.length; i++)
                {
                    popupData +=    "<td id='"+buttons[i].id+"'><a href='#' title='"+buttons[i].desc+"'>";
                    popupData +=        "<div class='popupButton'>"+buttons[i].text+"</div></a>";
                    popupData +=    "</td>";
                }
                
                popupData +=    "</tr>";
                
                document.getElementById(this._rootId).innerHTML = popupData;
                
                for(var i = 0; i < buttons.length; i++)
                {
                    var button = document.getElementById(buttons[i].id);
                    button.onclick = this._onClickButton.bind(this, buttons[i].onClickCallback);
                    button.onmouseover = this.onHighlightButton;
                    button.onmouseout = this.onUnHighlightButton;
                }
                
                // show the popup
                this._container.style.visibility = "visible";
            };
            
            this._onClickButton = function(callback)
            {
                if(callback == null || callback() != false)
                {
                    this.close();
                }
            };
            
            this.close = function()
            {
                this._pendingShape = null;
                
                // we will make this fresh next time we open
                document.getElementById(this._rootId).innerHTML = "";
                
                // hide everything
                this._container.style.visibility = "hidden";
            };
            
            this.onHighlightButton = function(event)
            {
                var target = event.target || event.srcElement;
                target.style.borderColor = "#257675";
            };
            
            this.onUnHighlightButton = function(event)
            {
                var target = event.target || event.srcElement;
                target.style.borderColor = "transparent";
            };
        };
    }
)();

