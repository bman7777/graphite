
if(this.Graphite == null)
{
    this.Graphite = {};
}

(
    // -- NODE-OPTIONS definition
    function()
    {
        Graphite.NodeOptions = function(properties)
        {
            if(properties == null)
            {
                properties = { deleteOption: {}, contentOption: {}, settingsOption: {}, bg: {} };
            }
            
            this._isShowing = false;
            this._background = new Kinetic.Group();
            this._background.on('dblclick', function(event)
            {
                // only hide the options when clicking on the node and not on the options themselves
                event.cancelBubble = true;
            });
            
            this._overlay = new Kinetic.Group();
            this._overlay.on('dblclick', function(event)
            {
                // only hide the options when clicking on the node and not on the options themselves
                event.cancelBubble = true;
            });
            
            this.getBackground = function()
            {
                return this._background;
            };
            
            this.getOverlay = function()
            {
                return this._overlay;
            };
            
            this.isShowing = function()
            {
                return this._isShowing;
            };
            
            this.show = function(node)
            {
                if(!this._isShowing)
                { 
                    var bgImage = new Kinetic.Image(
                    {
                        image: properties.bgType == "straight" ?
                                Graphite.NodeOptions.StraightHalo : 
                                Graphite.NodeOptions.CurvedHalo,
                        x: (properties.bg.width / 2),
                        y: (-1 * (properties.bg.height / 2)),
                        rotation: properties.bg.rotation
                    });
                    this._background.add(bgImage);
                    this._background.draw();
                    
                    var deleteImage = new Kinetic.Image(
                    {
                        x: properties.deleteProps.x,
                        y: properties.deleteProps.y,
                        image: Graphite.NodeOptions.DeleteImg,
                        scale: {x: Graphite.NodeOptions.ICON_SCALE, y: Graphite.NodeOptions.ICON_SCALE},
                        opacity: Graphite.NodeOptions.UNFOCUS_OPACITY
                    });
                    this._overlay.add(deleteImage);
                    
                    var deleteText = new Kinetic.Text(
                    {
                        x: properties.deleteProps.x - 6,
                        y: properties.deleteProps.y + 30,
                        text: 'Delete',
                        fontSize: 9,
                        fill: 'black',
                        fontFamily:'Arial Black',
                        opacity: Graphite.NodeOptions.UNFOCUS_OPACITY
                    });
                    this._overlay.add(deleteText);
                    
                    deleteImage.on('mouseenter', function(event)
                    {
                        this.opacity(1);
                        deleteText.opacity(1);
                        
                        this.getLayer().draw();
                    });
                    
                    deleteImage.on('mouseleave', function(event)
                    {
                        this.opacity(Graphite.NodeOptions.UNFOCUS_OPACITY);
                        deleteText.opacity(Graphite.NodeOptions.UNFOCUS_OPACITY);
                        
                        this.getLayer().draw();
                    });
                    
                    deleteImage.on('click tap', function(event)
                    {
                        properties.deleteProps.action(node);
                    });
                    
                    var contentImage = new Kinetic.Image(
                    {
                        x: properties.contentProps.x,
                        y: properties.contentProps.y,
                        image: Graphite.NodeOptions.ContentImg,
                        scale: {x: Graphite.NodeOptions.ICON_SCALE, y: Graphite.NodeOptions.ICON_SCALE},
                        opacity: Graphite.NodeOptions.UNFOCUS_OPACITY
                    });
                    this._overlay.add(contentImage);
                    
                    var contentText = new Kinetic.Text(
                    {
                        x: properties.contentProps.x - 5,
                        y: properties.contentProps.y + 25,
                        text: 'Open',
                        fontSize: 9,
                        fill: 'black',
                        fontFamily:'Arial Black',
                        opacity: Graphite.NodeOptions.UNFOCUS_OPACITY
                    });
                    this._overlay.add(contentText);
                    
                    contentImage.on('mouseenter', function(event)
                    {
                        this.opacity(1);
                        contentText.opacity(1);
                        
                        this.getLayer().draw();
                    });
                        
                    contentImage.on('mouseleave', function(event)
                    {
                        this.opacity(Graphite.NodeOptions.UNFOCUS_OPACITY);
                        contentText.opacity(Graphite.NodeOptions.UNFOCUS_OPACITY);
                        
                        this.getLayer().draw();
                    });
                    
                    contentImage.on('click tap', function(event)
                    {
                        properties.contentProps.action(node);
                    });
                    
                    var settingsImage = new Kinetic.Image(
                    {
                        x: properties.settingsProps.x,
                        y: properties.settingsProps.y,
                        image: Graphite.NodeOptions.SettingsImg,
                        scale: {x: Graphite.NodeOptions.ICON_SCALE, y: Graphite.NodeOptions.ICON_SCALE},
                        opacity: Graphite.NodeOptions.UNFOCUS_OPACITY
                    });
                    this._overlay.add(settingsImage);
                    
                    var settingsText = new Kinetic.Text(
                    {
                        x: properties.settingsProps.x - 9,
                        y: properties.settingsProps.y + 29,
                        text: 'Settings',
                        fontSize: 9,
                        fill: 'black',
                        fontFamily:'Arial Black',
                        opacity: Graphite.NodeOptions.UNFOCUS_OPACITY
                    });
                    this._overlay.add(settingsText);
                    
                    settingsImage.on('mouseenter', function(event)
                    {
                        this.opacity(1);
                        settingsText.opacity(1);
                        
                        this.getLayer().draw();
                    });
                    
                    settingsImage.on('mouseleave', function(event)
                    {
                        this.opacity(Graphite.NodeOptions.UNFOCUS_OPACITY);
                        settingsText.opacity(Graphite.NodeOptions.UNFOCUS_OPACITY);
                        
                        this.getLayer().draw();
                    });
                    
                    settingsImage.on('click tap', function(event)
                    {
                        var settings = new Array();
                        settings[0] = [{id:'nameInput', text:'Name:', type:'text', value:node.text()}]; 
                        settings[1] = [{id:'colorInput', text:'Color:', type:'color', value:node.fill()}];
                        
                        var label = node.linkName();
                        if(label == undefined || label == "")
                        {
                            label = "Choose File";
                        }
                        
                        settings[2] = [{id:'existingFileInput', text:'File:', type:'button', value:label, 
                            onClickCallback: function(event)
                            {
                                var target = event.target || event.srcElement;
                                properties.pickLink.action(function(target, data)
                                {
                                    if (data.action == google.picker.Action.PICKED)
                                    {
                                        var doc = data.docs[0];
                                        node.linkName(doc.name);
                                        node.link(doc.id);
                                        
                                        // update the button that showed the file link
                                        target.value = doc.name;
                                    }
                                }.bind(this, target));
                                
                                // don't close the popup while we are picking a link
                                return false;
                            }
                        }];
                        
                        var buttons = 
                        [
                           {id:'saveButton', text:'Save', desc:'Save Changes', onClickCallback:this._onClickSaveSettings.bind(this, node)}, 
                           {id:'cancelButton', text:'Cancel', desc:"Don't Save Changes"}
                        ];
                        
                        properties.settingsProps.action("Settings", settings, buttons);
                    }.bind(this));
                    
                    this._overlay.draw();
                    this._isShowing = true;
                }
            };
            
            this._onClickSaveSettings = function(modifiedNode)
            {
                modifiedNode.getShape().fill(document.getElementById('colorInput').value);
                modifiedNode.text(document.getElementById('nameInput').value);
                
                modifiedNode.cache();
                modifiedNode.draw();
            };
            
            this.hide = function(node)
            {
                if(this._isShowing)
                {
                    var childList = this._overlay.getChildren();
                    for(var i = 0; i < childList.length; i++)
                    {
                        childList[i].off("mouseenter mouseleave click tap");
                    }
                    
                    // to be more scalable, let's not keep these around
                    // when not necessary
                    this._background.destroyChildren();
                    this._overlay.destroyChildren();
                    
                    node.getLayer().draw();
                    this._isShowing = false;
                }
            };
            
            this.destroy = function()
            {
                // kill all events so we don't have a dangling event
                var childList = this._overlay.getChildren();
                for(var i = 0; i < childList.length; i++)
                {
                    childList[i].off("mouseenter mouseleave click tap");
                }

                this._background.destroy();
                this._background = null;
                
                this._overlay.destroy();
                this._overlay = null;
            };
        };
        
        Graphite.NodeOptions.ICON_SCALE = 0.8;
        Graphite.NodeOptions.UNFOCUS_OPACITY = 0.6;
        
        var curvedHalo = new Image();
        curvedHalo.src = "img/web/roundHalo.png";
        Graphite.NodeOptions.CurvedHalo = curvedHalo;
        
        var straightHalo = new Image();
        straightHalo.src = "img/web/lineHalo.png";
        Graphite.NodeOptions.StraightHalo = straightHalo;
        
        var deleteImg = new Image();
        deleteImg.src = "img/web/delete_icon.gif";
        Graphite.NodeOptions.DeleteImg = deleteImg;
        
        var contentIcon = new Image();
        contentIcon.src = "img/web/content_icon.gif";
        Graphite.NodeOptions.ContentImg = contentIcon;
        
        var settingsIcon = new Image();
        settingsIcon.src = "img/web/settings_icon.gif";
        Graphite.NodeOptions.SettingsImg = settingsIcon;
    }
)();

