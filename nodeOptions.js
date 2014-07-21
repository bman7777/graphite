
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
                var CORNER_OFFSET = 20;
                
                if(!this._isShowing)
                { 
                    var selectCorner = new Image();
                    selectCorner.src = Graphite.NodeOptions.BG_SETTINGS_PATH;
                    selectCorner.onload = function() 
                    {
                        var tlImage = new Kinetic.Image(
                        {
                            image: selectCorner,
                            x: (-1 * (properties.bg.width / 2)) - CORNER_OFFSET,
                            y: (-1 * (properties.bg.height / 2)) - CORNER_OFFSET
                        });
                        
                        var blImage = new Kinetic.Image(
                        {
                            image: selectCorner,
                            rotationDeg: -90,
                            x: (-1 * (properties.bg.width / 2)) - CORNER_OFFSET,
                            y: ( 1 * (properties.bg.height / 2)) + CORNER_OFFSET
                        });
                        
                        var trImage = new Kinetic.Image(
                        {
                            image: selectCorner,
                            x: ( 1 * (properties.bg.width / 2)) + CORNER_OFFSET,
                            y: (-1 * (properties.bg.height / 2)) - CORNER_OFFSET,
                            rotationDeg: 90
                        });
                        
                        var brImage = new Kinetic.Image(
                        {
                            image: selectCorner,
                            rotationDeg: 180,
                            x: ( 1 * (properties.bg.width / 2)) + CORNER_OFFSET,
                            y: ( 1 * (properties.bg.height / 2)) + CORNER_OFFSET
                        });
                        
                        this.add(tlImage);
                        this.add(blImage);
                        this.add(trImage);
                        this.add(brImage);
                        
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
                            shadowColor: '#555555',
                            shadowOffset: 2,
                            shadowOpacity: 0.7,
                            width: deleteIcon.width,
                            height: deleteIcon.height
                        });
                        
                        this.add(deleteImage);
                        
                        deleteImage.on('mouseenter', function(event)
                        {
                            this.setShadowEnabled(true);
                        });
                        
                        deleteImage.on('mouseout', function(event)
                        {
                            this.setShadowEnabled(false);
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
                            shadowColor: '#555555',
                            shadowOffset: 2,
                            shadowOpacity: 0.7,
                            width: contentIcon.width,
                            height: contentIcon.height
                        });
                        
                        this.add(contentImage);
                        
                        contentImage.on('mouseenter', function(event)
                        {
                            this.setShadowEnabled(true);
                        });
                        
                        contentImage.on('mouseout', function(event)
                        {
                            this.setShadowEnabled(false);
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
                            shadowColor: '#555555',
                            shadowOffset: 2,
                            shadowOpacity: 0.7,
                            width: settingsIcon.width,
                            height: settingsIcon.height
                        });
                        
                        this._overlay.add(settingsImage);
                        
                        settingsImage.on('mouseenter', function(event)
                        {
                            this.setShadowEnabled(true);
                        });
                        
                        settingsImage.on('mouseout', function(event)
                        {
                            this.setShadowEnabled(false);
                        });
                        
                        settingsImage.on('click', function(event)
                        {
                            // todo
                        });
                        
                        this._overlay.getLayer().draw();
                    }.bind(this);
                    this._isShowing = true;
                }
            };
            
            this.hide = function(node)
            {
                if(this._isShowing)
                { 
                    this._background.destroyChildren();
                    this._overlay.destroyChildren();
                    node.getLayer().draw();
                    this._isShowing = false;
                }
            };
            
            this.destroy = function()
            {
                if(this._isShowing)
                { 
                    this._background.destroyChildren();
                    this._overlay.destroyChildren();
                }
                
                this._background.destroy();
                this._background = null;
                
                this._overlay.destroy();
                this._overlay = null;
            };
        };
        
        Graphite.NodeOptions.ICON_DELETE_PATH = "img/web/deleteIcon.gif";
        Graphite.NodeOptions.ICON_CONTENT_PATH = "img/web/contentIcon.png";
        Graphite.NodeOptions.ICON_SETTINGS_PATH = "img/web/settingsIcon.png";
        Graphite.NodeOptions.BG_SETTINGS_PATH = "img/web/selectionCorner.png";
    }
)();

