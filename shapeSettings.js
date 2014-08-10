
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
                
                var buttons = [{id:'saveButton', text:'Save', desc:'Save Changes'}, {id:'cancelButton', text:'Cancel', desc:'Cancel Changes'}];
                
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
                
                for(var i = 0; i < buttons.length; i++)
                {
                    popupData +=    "<td id='"+buttons[i].id+"'><a href='#' title='"+buttons[i].desc+"'>";
                    popupData +=        "<div class='shapeSettingsButton'>"+buttons[i].text+"</div></a>";
                    popupData +=    "</td>";
                }
                
                popupData +=    "</tr>";
                
                document.getElementById(this._rootId).innerHTML = popupData;
                
                for(var i = 0; i < buttons.length; i++)
                {
                    var button = document.getElementById(buttons[i].id);
                    button.onclick = this._onClickButton;
                    button.onmouseover = this.onHighlightButton;
                    button.onmouseout = this.onUnHighlightButton;
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
                var target = event.target || event.srcElement;
                if(target.textContent == 'Save')
                {
                    this._pendingShape.getShape().fill(document.getElementById('colorInput').value);
                    this._pendingShape.text(document.getElementById('nameInput').value);
                    
                    // TODO: save off file link
                    
                    this._pendingShape.cache();
                    this._pendingShape.draw();
                }
                
                this.close();
            }.bind(this);
            
            this.onHighlightButton = function(event)
            {
                event.srcElement.style.borderColor = "#257675";
            };
            
            this.onUnHighlightButton = function(event)
            {
                event.srcElement.style.borderColor = "transparent";
            };
        };
    }
)();

