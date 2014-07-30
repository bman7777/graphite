
if(this.Graphite == null)
{
	this.Graphite = {};
}
	
(
	// -- CONNECTION-OPTIONS definition
	function()
	{
		Graphite.ConnectionOptions = function(properties)
		{
            if(properties == null)
            {
                properties = { deleteOption: {}, leftHeadOption: {}, rightHeadOption: {}, bg: {} };
            }
            
            this._isShowing = false;
            this._background = new Kinetic.Group();
            this._background.on('dblclick', function(event)
            {
                // only hide the options when clicking on the connection and not on the options themselves
                event.cancelBubble = true;
            });
            
            this._overlay = new Kinetic.Group();
            this._overlay.on('dblclick', function(event)
            {
                // only hide the options when clicking on the connection and not on the options themselves
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
            
            this.show = function(line)
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
                            x: properties.bg.height / 2,
                            y: 10,
                            rotation: properties.bg.rotation
                        });
                        
                        this.add(bgImage);
                        
                        this.getLayer().draw();
                    }.bind(this._background);
                    
                    var deleteIcon = new Image();
                    deleteIcon.src = Graphite.ConnectionOptions.ICON_DELETE_PATH;
                    deleteIcon.onload = function() 
                    {
                        var deleteImage = new Kinetic.Image(
                        {
                            x: properties.deleteProps.x - ((Graphite.ConnectionOptions.ICON_SCALE * 27) / 2),
                            y: properties.deleteProps.y,
                            image: deleteIcon,
                            scale: {x: Graphite.ConnectionOptions.ICON_SCALE, y: Graphite.ConnectionOptions.ICON_SCALE},
                            opacity: Graphite.ConnectionOptions.UNFOCUS_OPACITY
                        });
                        
                        this.add(deleteImage);
                        
                        var deleteText = new Kinetic.Text(
                        {
                            x: properties.deleteProps.x - 17,
                            y: properties.deleteProps.y + 29,
                            text: 'Delete',
                            fontSize: 9,
                            fill: 'black',
                            fontFamily:'Arial Black',
                            opacity: Graphite.ConnectionOptions.UNFOCUS_OPACITY
                        });
                        this.add(deleteText);
                        
                        deleteImage.on('mouseenter', function(event)
                        {
                            this.opacity(1);
                            deleteText.opacity(1);
                            
                            this.getLayer().draw();
                        });
                        
                        deleteImage.on('mouseleave', function(event)
                        {
                            this.opacity(Graphite.ConnectionOptions.UNFOCUS_OPACITY);
                            deleteText.opacity(Graphite.ConnectionOptions.UNFOCUS_OPACITY);
                            
                            this.getLayer().draw();
                        });
                        
                        deleteImage.on('click', function(event)
                        {
                            properties.deleteProps.action(line);
                        });
                        
                        this.getLayer().draw();
                    }.bind(this._overlay);
                    
                    var arrowIcon = new Image();
                    arrowIcon.src = Graphite.ConnectionOptions.ICON_ARROW_PATH;
                    arrowIcon.onload = function() 
                    {
                        var leftHeadImage = new Kinetic.Image(
                        {
                            x: properties.leftHeadProps.x,
                            y: properties.leftHeadProps.y,
                            image: arrowIcon,
                            scale: {x: 0.65, y: 0.65},
                            opacity: Graphite.ConnectionOptions.UNFOCUS_OPACITY
                        });
                        this.add(leftHeadImage);
                        
                        var leftHeadText = new Kinetic.Text(
                        {
                            x: properties.leftHeadProps.x,
                            y: properties.leftHeadProps.y + 18,
                            text: 'Arrow',
                            fontSize: 9,
                            fill: 'black',
                            fontFamily:'Arial Black',
                            opacity: Graphite.ConnectionOptions.UNFOCUS_OPACITY
                        });
                        this.add(leftHeadText);
                        
                        leftHeadImage.on('mouseenter', function(event)
                        {
                            this.opacity(1);
                            leftHeadText.opacity(1);
                            
                            this.getLayer().draw();
                        });
                        
                        leftHeadImage.on('mouseleave', function(event)
                        {
                            this.opacity(Graphite.ConnectionOptions.UNFOCUS_OPACITY);
                            leftHeadText.opacity(Graphite.ConnectionOptions.UNFOCUS_OPACITY);
                            
                            this.getLayer().draw();
                        });
                        
                        leftHeadImage.on('click', function(event)
                        {
                            properties.leftHeadProps.action(line);
                        });
                        
                        var rightHeadImage = new Kinetic.Image(
                        {
                            x: properties.rightHeadProps.x + (Graphite.ConnectionOptions.ICON_SCALE * 41),
                            y: properties.rightHeadProps.y, // - (Graphite.ConnectionOptions.ICON_SCALE * 28),
                            image: arrowIcon,
                            scale: {x: -0.65, y: 0.65},
                            opacity: Graphite.ConnectionOptions.UNFOCUS_OPACITY
                        });
                        this.add(rightHeadImage);
                        
                        var rightHeadText = new Kinetic.Text(
                        {
                            x: properties.rightHeadProps.x + 1,
                            y: properties.rightHeadProps.y + 18,
                            text: 'Arrow',
                            fontSize: 9,
                            fill: 'black',
                            fontFamily:'Arial Black',
                            opacity: Graphite.ConnectionOptions.UNFOCUS_OPACITY
                        });
                        this.add(rightHeadText);
                        
                        rightHeadImage.on('mouseenter', function(event)
                        {
                            this.opacity(1);
                            rightHeadText.opacity(1);
                            
                            this.getLayer().draw();
                        });
                        
                        rightHeadImage.on('mouseleave', function(event)
                        {
                            this.opacity(Graphite.ConnectionOptions.UNFOCUS_OPACITY);
                            rightHeadText.opacity(Graphite.ConnectionOptions.UNFOCUS_OPACITY);
                            
                            this.getLayer().draw();
                        });
                        
                        rightHeadImage.on('click', function(event)
                        {
                            properties.rightHeadProps.action(line);
                        });
                        
                        this.getLayer().draw();
                    }.bind(this._overlay);
                    
                    this._isShowing = true;
                }
            };
            
            this.hide = function(line)
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
                    
                    line.getLayer().draw();
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
        
        Graphite.ConnectionOptions.ICON_SCALE = 0.8;
        Graphite.ConnectionOptions.UNFOCUS_OPACITY = 0.6;
        Graphite.ConnectionOptions.ICON_DELETE_PATH = "img/web/delete_icon.gif";
        Graphite.ConnectionOptions.ICON_ARROW_PATH = "img/web/arrow_icon.gif";
    }
)();

