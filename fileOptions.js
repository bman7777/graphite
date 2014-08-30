
if(this.Graphite == null)
{
    this.Graphite = {};
}
	
(
    // -- FILE-OPTIONS definition
    function()
    {
        Graphite.FileOptions = function(builder)
        {
            this._builder = builder;
            this._clientID = '124896665631-ckqdiegiiv8h2hpc7vf8sogp0fgepg2q.apps.googleusercontent.com';
            this._developerKey = 'AIzaSyCrw7J_hoDt1kiB6AAmN8FyWjyEnOLHRWA';
            
            this._checkAuthorization = function(immediate, callback) 
            {
                if(immediate == true || this._isAuthorized != true)
                {
                    // as a sanity check- blank these out while we refresh them
                    this._isAuthorized = false;
                    this._authToken = undefined;
                    
                    gapi.auth.authorize(
                    {
                        'client_id': this._clientID, 
                        'scope': 'https://www.googleapis.com/auth/drive', 
                        'immediate': (immediate == true)
                    }, this._handleAuthorizationResult.bind(this, callback));
                }
                else
                {
                    if(callback) callback();
                }
            };
        
            this._handleAuthorizationResult = function(callback, authResult)
            {
                if(authResult && !authResult.error)
                {
                    // Access token has been successfully retrieved, requests can be sent to the API.
                    this._isAuthorized = true;
                    this._authToken = authResult.access_token;
                    
                    if(callback) callback();
                }
                else
                {
                    this._isAuthorized = false;
                    this._authToken = undefined;
                }
            };
            
            this.newFile = function()
            {
                var settings = new Array();
                settings[0] = [{id:'warningInput', text:"Creating a new file will wipe out all progress.  Are you sure?", type:"message"}]; 
                settings[1] = [{id:'fileNameInput', text:'File:', type:'text', value:"New File"}];
                
                var buttons = 
                [
                   {id:'newButton', text:'Create', desc:'Create a new file', onClickCallback:this._onNewFile.bind(this)}, 
                   {id:'cancelButton', text:'Cancel', desc:"Don't create a new file"}
                ];
                
                this._builder.openPopup("New File", settings, buttons);
            };
            
            this._onNewFile = function(event)
            {
                if(this._onSelectFileName(event))
                {
                    this._builder.clear();
                    return true;
                }
                else
                {
                    return false;
                }
            };
            
            this._onSelectFileName = function(event)
            {
                var fileName = document.getElementById('fileNameInput').value;
                if(!this._isFileNameValid(fileName))
                {
                    // nope- we don't accept this filename, don't close the popup
                    return false;
                }
                else
                {
                    // todo- if it ends in .xml we should cut that off since we append later
                    
                    // if filename is valid, clear everything and use this as filename
                    this._filename = fileName;
                    return true;
                }
            };
            
            this._isFileNameValid = function(fileName)
            {
                if(fileName == "" || fileName == undefined || fileName == null)
                {
                    return false;
                }
                else
                {
                    return true;
                }
            };
            
            this.save = function()
            {
                this._checkAuthorization(this._isAuthorized, this._onSaveAuthorizationReady.bind(this));
            };
            
            this._onSaveAuthorizationReady = function()
            {
                var settings = new Array();
                settings[0] = [{id:'msgInput', text:"Pick a name for your file before saving.", type:"message"}];
                settings[1] = [
                    {id:'fileNameInput', text:'Save As:', type:'text', value:"New File"},
                    {id:'nameButton', value:'Save', type:'button', desc:'Save the file', 
                         onClickCallback:this._onSaveCallback.bind(this)}
                ];
            
                if(!this._isFileNameValid(this._filename))
                {
                    settings[2] = [{id:'existingFileInput', text:'Save:', type:'button', value:"Choose File", 
                        onClickCallback:this._onOverwriteSaveCallback.bind(this)}
                    ];
                }
                else
                {
                    settings[2] = [{id:'existingFileInput', text:'Save:', type:'button', value:this._filename, 
                        onClickCallback:this._onOverwriteSaveCallback.bind(this)}
                    ];
                }
                
                var buttons = 
                [
                   {id:'cancelButton', text:'Cancel', desc:"Don't Save Changes"}
                ];
                
                this._builder.openPopup("Save File", settings, buttons);
            };
            
            this._onOverwriteSaveCallback = function(event)
            {
                return true;
            };
            
            this._onSaveCallback = function(event)
            {
                if(this._isFileNameValid(this._filename) || this._onSelectFileName(event))
                {
                    const boundary = "gapi.client.request-Multipart-Boundary";
                    const requestBody = 
                        "--"+boundary+"\n"+
                        "Content-Type: application/json; charset=UTF-8\n\n"+
                            "{\n"+
                            "    'title': '"+this._filename+".xml'\n"+
                            "}\n"+
                         "\n--"+boundary+"\n"+
                         "Content-Type: text/xml\n\n"+
                         "<text>hello world!!!! 123!!!!</text>\n"+
                         "\n--"+boundary+"--";
                        
                    var request = gapi.client.request(
                    {
                        'path': '/upload/drive/v2/files',
                        'method': 'POST',
                        'params': {'uploadType': 'multipart'},
                        'headers': 
                        {
                            'Content-Type': 'multipart/related; boundary="' + boundary + '"',
                            'Authorization': 'Bearer '+ this._authToken
                        },
                        'body': requestBody
                    });
                    request.execute(this._onSaveSuccess.bind(this));
                    
                    // todo write nodes/lines to a json/xml file
                    
                    // todo: message somewhere that the save succeeded
                    return true;
                }
                else
                {
                    return false;
                }
            };
            
            this._onSaveSuccess = function(event)
            {
                // todo: error handling?
                
                this._link = event.downloadUrl;
            };
            
            this._createPicker = function(callback)
            {
                this._isPickerLoaded = true;
                
                var view = new google.picker.View(google.picker.ViewId.DOCS);
                view.setMimeTypes("text/xml");
                
                var picker = new google.picker.PickerBuilder()
                    .setOAuthToken(this._authToken)
                    .addView(view)
                    .setDeveloperKey(this._developerKey)
                    .setCallback(callback)
                    .build();
                 picker.setVisible(true);
            };
            
            this.openFile = function(link)
            {
                if(link != undefined && link != "")
                {
                    this._checkAuthorization(this._isAuthorized, this._onOpenFileAuthorizationReady.bind(this, link));
                }
            };
            
            this._onOpenFileAuthorizationReady = function(link)
            {
                var request = gapi.client.request(
                {
                    'path': '/drive/v2/files/'+link,
                    'method': 'GET'
                });
                request.execute(function(resp) 
                {
                    console.log('url: ' + resp.downloadUrl);
                    window.location.href = "CodeEditor/code-editor.html?"+
                        "link="+encodeURIComponent(resp.downloadUrl)+"&parentLink="+encodeURIComponent(this._link);
                });
            };
            
            this.load = function(callback)
            {
                if(callback == undefined)
                {
                    callback = this._onLoadPickedFile.bind(this);
                }
                
                this._checkAuthorization(this._isAuthorized, this._onLoadAuthorizationReady.bind(this, callback));
            };
            
            this._onLoadAuthorizationReady = function(callback)
            {
                if(this._isPickerLoaded)
                {
                    this._createPicker(callback);
                }
            };
            
            this._onLoadPickedFile = function(data)
            {
                if (data.action == google.picker.Action.PICKED)
                {
                    // clear what we have now to start from scratch
                    this._builder.clear();
                    
                    var fileId = data.docs[0].id;
                    alert('The user selected: ' + fileId);
                    
                    debugger;
                    
                    // todo: load from json/xml
                }
            };
            
            this._pickerLoaded = function()
            {
                this._isPickerLoaded = true;
            };
            
            gapi.client.setApiKey(this._developerKey);
            
            // after a bit, we should refresh authorization with immediate passed in
            window.setTimeout(this._checkAuthorization.bind(this, true), 10);
            
            gapi.load('picker', {'callback': this._pickerLoaded.bind(this)});
        };
        
        Graphite.FileOptions.NEW = 0;
        Graphite.FileOptions.SAVE = 1;
        Graphite.FileOptions.LOAD = 2;
    }
)();

