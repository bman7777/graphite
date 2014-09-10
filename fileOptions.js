
if(this.Graphite == null)
{
    this.Graphite = {};
}

(
    // -- FILE-OPTIONS definition
    function()
    {
        Graphite.FileOptions = function(builder, messager)
        {
            this._builder = builder;
            this._messager = messager;
            
            // todo: we may be loading a document that exists immediately
            this._messager.setFileName("Untitled");
            
            this._checkAuthorization = function(immediate, callback) 
            {
                if(immediate == true || this._isAuthorized != true)
                {
                    // as a sanity check- blank these out while we refresh them
                    this._isAuthorized = false;
                    this._authToken = undefined;
                    
                    var authReq = new XMLHttpRequest();
                    authReq.open("GET", "api/authorize", false);
                    authReq.onload = function()
                    {
                        var googleAuth = JSON.parse(authReq.responseText);
                        googleAuth.scope = 'https://www.googleapis.com/auth/drive';
                        googleAuth.immediate = (immediate == true);
                        
                        gapi.auth.authorize(googleAuth, 
                            this._handleAuthorizationResult.bind(this, callback));
                    }.bind(this);
                    authReq.send(null);
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
                var currFileNameIsValid = this._isFileNameValid(this._filename);
                settings[0] = [{id:'fileNameInput', text:'File:', type:'text', 
                    value:currFileNameIsValid ? this._filename + "(copy)" : "Untitled"}];
                
                var buttons = new Array();
                if(currFileNameIsValid)
                {
                    buttons.push({id:'newButton', text:'Create New', desc:"Create a new file", onClickCallback:this._onNamedFile.bind(this, true)});
                }
                
                buttons.push({id:'nameButton', text:'Rename', desc:"Rename file", onClickCallback:this._onNamedFile.bind(this, false)});
                buttons.push({id:'cancelButton', text:'Cancel', desc:"Don't create a new file"});
                
                this._builder.openPopup("Name File", settings, buttons);
            };
            
            this._onNamedFile = function(isNewFile, event)
            {
                if(this._onSelectFileName(event))
                {
                    if(isNewFile)
                    {
                        this._builder.clear();
                    }
                    
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
                    
                    // this is a valid filename that we can work with
                    this._currentFileId = undefined;
                    this._filename = fileName;
                    this._messager.setFileName(this._filename);
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
                if(!this._isFileNameValid(this._filename))
                {
                    var settings = new Array();
                    settings[0] = [{id:'msgInput', text:"Pick a name for your file before saving.", type:"message"}];
                    settings[1] = [{id:'fileNameInput', text:'File:', type:'text', value:"Untitled"}];
                    
                    var buttons = 
                    [
                        {id:'saveButton', text:'Save', desc:"Save Changes", onClickCallback:this._onSaveCallback.bind(this)},
                        {id:'cancelButton', text:'Cancel', desc:"Don't Save Changes"}
                    ];
                    
                    this._builder.openPopup("Save File", settings, buttons);
                }
                else
                {
                    this._onSaveCallback();
                }
            };
            
            this._onSaveCallback = function(event)
            {
                if(this._isFileNameValid(this._filename) || this._onSelectFileName(event))
                {
                    var doc = this._builder.toXML();
                    
                    const boundary = "gapi.client.request-Multipart-Boundary";
                    const requestBody = 
                        "--"+boundary+"\n"+
                        "Content-Type: application/json; charset=UTF-8\n\n"+
                            "{\n"+
                            "    'title': '"+this._filename+".xml'\n"+
                            "}\n"+
                         "\n--"+boundary+"\n"+
                         "Content-Type: text/xml\n\n"+
                         doc+"\n"+
                         "\n--"+boundary+"--";
                    
                    var requestPath = "/upload/drive/v2/files";
                    if(this._currentFileId != undefined)
                    {
                        requestPath += "/"+this._currentFileId;
                    }
                    
                    var request = gapi.client.request(
                    {
                        'path': requestPath,
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
                    return true;
                }
                else
                {
                    return false;
                }
            };
            
            this._onSaveSuccess = function(event)
            {
                this._messager.showMessage("Save Succeeded");
                
                // todo: error handling?
                
                this._link = event.downloadUrl;
            };
            
            this._createPicker = function(callback)
            {
                var view = new google.picker.View(google.picker.ViewId.DOCS);
                view.setMimeTypes("text/xml");
                
                var picker = new google.picker.PickerBuilder()
                    .setOAuthToken(this._authToken)
                    .addView(view)
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
                    // todo: if this is a graphite file, just reload inside the browser (after prompting save)
                    
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
                this._createPicker(callback);
            };
            
            this._onLoadPickedFile = function(data)
            {
                if (data.action == google.picker.Action.PICKED)
                {
                    var request = gapi.client.drive.files.get(
                    {
                        'fileId': data.docs[0].id
                    });
                    request.execute(function(resp) 
                    {
                        // todo: ensure this is a graphite file!
                        
                        var xhr = new XMLHttpRequest();
                        xhr.open('GET', decodeURIComponent(resp.downloadUrl));
                        xhr.setRequestHeader('Authorization', 'Bearer ' + this._authToken);
                        xhr.onload = function(param) 
                        {
                            this._currentFileId = data.docs[0].id;
                            this._filename = resp.title.substring(0, resp.title.lastIndexOf(".xml"));
                            this._messager.setFileName(this._filename);
                            
                            var parser=new DOMParser();
                            var xmlDoc = parser.parseFromString(xhr.responseText,"text/xml");
                            
                            this._builder.fromXML(xmlDoc);
                        }.bind(this);
                        xhr.send();
                    }.bind(this));
                }
            };
            
            // after a bit, we should refresh authorization with immediate passed in
            window.setTimeout(this._checkAuthorization.bind(this, true), 10);
        };
        
        Graphite.FileOptions.NEW = 0;
        Graphite.FileOptions.SAVE = 1;
        Graphite.FileOptions.LOAD = 2;
    }
)();

