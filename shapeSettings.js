
if(this.Graphite == null)
{
    this.Graphite = {};
}

(
    // -- MENU definition
    function()
    {
        Graphite.ShapeSettings = function(mountId)
        {
            if(mountId != null)
            {
                this._container = document.getElementById(mountId);
                this._rootId = "shapeSettingsRoot";
                this._container.innerHTML = "<table id=\""+this._rootId+"\"></table>";
            }
            
            this.open = function(shape)
            {
                // save off for later if/when we save changes
                this._pendingShape = shape;
                
                var buttons = ['saveButton', 'cancelButton'];
                var popupData = "<tr><td class='shapeSettingsHeader' colspan='3'><p style='margin-left: 15px'>Settings</p></td></tr>";
                popupData +=    "<tr><td class='shapeSettingsRow' colspan='3'>";
                popupData +=        "<p class='shapeSettingsLabel'>Name:";
                popupData +=            "<input id='nameInput' class='shapeSettingsInput' type='text' value='"+this._pendingShape.text()+"'/>";
                popupData +=        "</p>";
                popupData +=    "</td></tr>";
                popupData +=    "<tr><td class='shapeSettingsRow' colspan='3'>";
                popupData +=        "<p class='shapeSettingsLabel'>Color:";
                popupData +=            "<input id='colorInput' class='shapeSettingsInput' type='color' value='"+this._pendingShape.fill()+"'/>";
                popupData +=        "</p>";
                popupData +=    "</td></tr>";
                popupData +=    "<tr><td class='shapeSettingsRow' colspan='3'>";
                popupData +=        "<p class='shapeSettingsLabel'>File:";
                popupData +=            "<input class='shapeSettingsInput' type='file'/>";
                popupData +=        "</p>";
                popupData +=    "</td></tr>";
                popupData +=    "<tr class='shapeSettingsFooter'>";
                popupData +=        "<td class='shapeSettingsFooterSpacer'></td>";
                popupData +=        "<td id='"+buttons[0]+"'><a href='#' title='Save changes'><div class='shapeSettingsSave'>";
                popupData +=            "<p class='shapeSettingsButtonText'>Save</p></div></a>";
                popupData +=        "</td>";
                popupData +=        "<td id='"+buttons[1]+"'><a href='#' title='Cancel changes'><div class='shapeSettingsCancel'>";
                popupData +=            "<p class='shapeSettingsButtonText'>Cancel</p></div></a>";
                popupData +=        "</td>";
                popupData +=    "</tr>";
                
                document.getElementById(this._rootId).innerHTML = popupData;
                
                for(var i = 0; i < buttons.length; i++)
                {
                    var button = document.getElementById(buttons[i]);
                    button.onclick = this._onClickButton;
                }
                
                // show the popup
                this._container.style.visibility = "visible";
            };
            
            this.close = function()
            {
                this._pendingShape = null;
                
                // we will make this fresh next time we open
                document.getElementById(this._rootId).innerHTML = "";
                
                // hide everything
                this._container.style.visibility = "hidden";
            };
            
            this._onClickButton = function(event)
            {
                if(event.srcElement.textContent == 'Save')
                {
                    this._pendingShape.getShape().fill(document.getElementById('colorInput').value);
                    this._pendingShape.text(document.getElementById('nameInput').value);
                    
                    // TODO: save off file link
                    
                    this._pendingShape.draw();
                }
                
                this.close();
            }.bind(this);
        };
    }
)();

