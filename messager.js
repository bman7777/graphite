
if(this.Graphite == null)
{
    this.Graphite = {};
}

(
    // -- MESSAGER definition
    function()
    {
        Graphite.Messager = function(mountId, builder)
        {
            this._filenameMount = "MsgFileNameId";
            this._backMount = "GoBackId";
            this._statusMount = "StatusId";
            this._builder = builder;
            
            if(mountId != null)
            {
                this._container = document.getElementById(mountId);
                this._rootId = "messagerRoot";
                
                var msgBar = "<table id=\""+this._rootId+"\" class='MsgTable'>";
                msgBar +=        "<tr>";
                msgBar +=            "<td class='MsgTableCell'>";
                msgBar +=               "<a href='#' title='Go Back'>";
                msgBar +=                   "<div id='"+this._backMount+"' class='GoBackLabel'><<</div>";
                msgBar +=               "</a>";
                msgBar +=            "</td>";
                msgBar +=            "<td class='MsgTableCell'>";
                msgBar +=               "<a href='#' title='File name'>";
                msgBar +=                   "<div id='"+this._filenameMount+"' class='MsgFileLabel'></div>";
                msgBar +=               "</a>";
                msgBar +=            "</td>";
                msgBar +=        "</tr>";
                msgBar +=    "</table>";
                msgBar +=    "<div id='"+this._statusMount+"' class='MsgStatusDisplay'></p>";
                
                this._container.innerHTML = msgBar;
            }
            
            this.setFileName = function(name, hasParent)
            {
                if(name.length > 20)
                {
                    name = name.substring(0, 20);
                    name += "...";
                }
                document.getElementById(this._filenameMount).innerHTML = name != undefined ? name : "";
                document.getElementById(this._backMount).style.visibility = hasParent == true ? "visible" : "hidden";
            };
            
            this._changeFileName = function()
            {
                this._builder.processFile(Graphite.FileOptions.NEW);
            };
            
            this.showMessage = function(message)
            {
                if(this._messageQueue == undefined)
                {
                    this._messageQueue = new Array();
                }
                
                this._messageQueue.push(message);
                
                if(this._messageQueue.length <= 1)
                {
                    var status = document.getElementById(this._statusMount);
                    status.innerHTML = message;
                    status.style.visibility = "visible";
                    status.style.animation = "statusIn 1.5s ease-in";
                    status.style.webkitAnimation = "statusIn 1.5s ease-in";
                    
                    this._statusIntervalId = setInterval(this._nextMessage.bind(this), 4500);
                }
            };
            
            this._nextMessage = function()
            {
                this._messageQueue.shift();
                
                var status = document.getElementById(this._statusMount);
                if(this._messageQueue.length >= 1)
                {
                    status.innerHTML = this._messageQueue[0];
                }
                else
                {
                    clearInterval(this._statusIntervalId);
                    this._statusIntervalId = undefined;
                    
                    status.style.animation = "";
                    status.style.webkitAnimation = "";
                    status.style.visibility = "hidden";
                    status.innerHTML = "";
                    
                }
            };
            
            this._goBack = function()
            {
                // todo
            };
            
            this._onHighlightItem = function(event)
            {
                var target = event.target || event.srcElement;
                target.style.textShadow = "0px 1px 2px #333333";
                target.style.backgroundColor = "#cceeee";
                target.style.borderColor = "#9d9e9e";
            };
            
            this._onUnHighlightItem = function(event)
            {
                var target = event.target || event.srcElement;
                target.style.textShadow = "none";
                target.style.backgroundColor = "#559dc9";
                target.style.borderColor = "#ffffff";
            };
            
            // add a shortcut to change filename
            var newFileSelect = document.getElementById(this._filenameMount);
            newFileSelect.onclick = this._changeFileName.bind(this);
            newFileSelect.onmouseover = this._onHighlightItem.bind(this);
            newFileSelect.onmouseout = this._onUnHighlightItem.bind(this);

            // add a shortcut to go back to previous graph
            var goBack = document.getElementById(this._backMount);
            goBack.onclick = this._goBack.bind(this);
            goBack.onmouseover = this._onHighlightItem.bind(this);
            goBack.onmouseout = this._onUnHighlightItem.bind(this);
            goBack.style.visibility = "hidden";
            
            var status = document.getElementById(this._statusMount);
            status.style.visibility = "hidden";
        };
    }
)();

