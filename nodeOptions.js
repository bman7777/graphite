
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
            this._overlay = new Kinetic.Group();
            
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
                    var halo = new Image();
                    halo.src = properties.bgImageSrc;
                    halo.onload = function() 
                    {
                        var bgImage = new Kinetic.Image(
                        {
                            image: halo,
                            x: (properties.bg.width / 2),
                            y: (-1 * (properties.bg.height / 2)),
                            rotation: properties.bg.rotation
                        });
                        
                        this.add(bgImage);
                        
                        this.getLayer().draw();
                    }.bind(this._background);
                    
                    var deleteIcon = new Image();
                    deleteIcon.src = Graphite.NodeOptions.ICON_DELETE_PATH;
                    deleteIcon.onload = function() 
                    {
                        var deleteImage = new Kinetic.Image(
                        {
                            x: properties.deleteProps.x,
                            y: properties.deleteProps.y,
                            image: deleteIcon,
                            shadowEnabled: false,
                            shadowColor: '#333333',
                            shadowOffset: {x:2, y:2},
                            shadowOpacity: 0.8,
                            width: deleteIcon.width,
                            height: deleteIcon.height
                        });
                        
                        this.add(deleteImage);
                        
                        var deleteText = new Kinetic.Text(
                        {
                            x: properties.deleteProps.x - 3,
                            y: properties.deleteProps.y + 37,
                            text: 'Delete',
                            fontSize: 9,
                            fill: 'black',
                            fontFamily:'Arial Black'
                        });
                        this.add(deleteText);
                        
                        deleteImage.on('mouseenter', function(event)
                        {
                            this.shadowEnabled(true);
                            this.opacity(0.3);
                            
                            deleteText.opacity(0.6);
                            
                            this.getLayer().draw();
                        });
                        
                        deleteImage.on('mouseleave', function(event)
                        {
                            this.shadowEnabled(false);
                            this.opacity(1);
                            
                            deleteText.opacity(1);
                            
                            this.getLayer().draw();
                        });
                        
                        deleteImage.on('click', function(event)
                        {
                            properties.deleteProps.action(node);
                        });
                        
                        this.getLayer().draw();
                    }.bind(this._overlay);
                    
                    var contentIcon = new Image();
                    contentIcon.src = Graphite.NodeOptions.ICON_CONTENT_PATH;
                    contentIcon.onload = function() 
                    {
                        var contentImage = new Kinetic.Image(
                        {
                            x: properties.contentProps.x,
                            y: properties.contentProps.y,
                            image: contentIcon,
                            shadowEnabled: false,
                            shadowColor: '#333333',
                            shadowOffset: {x:2, y:2},
                            shadowOpacity: 0.8,
                            width: contentIcon.width,
                            height: contentIcon.height
                        });
                        
                        this.add(contentImage);
                        
                        var contentText = new Kinetic.Text(
                        {
                            x: properties.contentProps.x - 8,
                            y: properties.contentProps.y + 34,
                            text: 'Content',
                            fontSize: 9,
                            fill: 'black',
                            fontFamily:'Arial Black'
                        });
                        this.add(contentText);
                        
                        contentImage.on('mouseenter', function(event)
                        {
                            this.shadowEnabled(true);
                            this.opacity(0.3);
                            
                            contentText.opacity(0.6);
                            
                            this.getLayer().draw();
                        });
                        
                        contentImage.on('mouseleave', function(event)
                        {
                            this.shadowEnabled(false);
                            this.opacity(1);
                            
                            contentText.opacity(1);
                            
                            this.getLayer().draw();
                        });
                        
                        contentImage.on('click', function(event)
                        {
                            // todo
                        });
                        
                        this.getLayer().draw();
                    }.bind(this._overlay);
                    
                    var settingsIcon = new Image();
                    settingsIcon.src = Graphite.NodeOptions.ICON_SETTINGS_PATH;
                    settingsIcon.onload = function() 
                    {
                        var settingsImage = new Kinetic.Image(
                        {
                            x: properties.settingsProps.x,
                            y: properties.settingsProps.y,
                            image: settingsIcon,
                            shadowEnabled: false,
                            shadowColor: '#333333',
                            shadowOffset: {x:2, y:2},
                            shadowOpacity: 0.8,
                            width: settingsIcon.width,
                            height: settingsIcon.height
                        });
                        this.add(settingsImage);
                        
                        var settingsText = new Kinetic.Text(
                        {
                            x: properties.settingsProps.x - 3,
                            y: properties.settingsProps.y + 37,
                            text: 'Settings',
                            fontSize: 9,
                            fill: 'black',
                            fontFamily:'Arial Black'
                        });
                        this.add(settingsText);
                        
                        settingsImage.on('mouseenter', function(event)
                        {
                            this.shadowEnabled(true);
                            this.opacity(0.3);
                            
                            settingsText.opacity(0.6);
                            
                            this.getLayer().draw();
                        });
                        
                        settingsImage.on('mouseleave', function(event)
                        {
                            this.shadowEnabled(false);
                            this.opacity(1);
                            
                            settingsText.opacity(1);
                            
                            this.getLayer().draw();
                        });
                        
                        settingsImage.on('click', function(event)
                        {
                            // todo
                        });
                        
                        this.getLayer().draw();
                    }.bind(this._overlay);
                    this._isShowing = true;
                }
            };
            
            this.hide = function(node)
            {
                if(this._isShowing)
                {
                    var childList = this._overlay.getChildren();
                    for(var i = 0; i < childList.length; i++)
                    {
                        childList[i].off("mouseenter mouseleave click");
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
                    childList[i].off("mouseenter mouseleave click");
                }

                this._background.destroy();
                this._background = null;
                
                this._overlay.destroy();
                this._overlay = null;
            };
        };
        
        Graphite.NodeOptions.ICON_DELETE_PATH = "img/web/delete_icon.gif";
        Graphite.NodeOptions.ICON_CONTENT_PATH = "img/web/content_icon.gif";
        Graphite.NodeOptions.ICON_SETTINGS_PATH = "img/web/settings_icon.gif";
    }
)();

