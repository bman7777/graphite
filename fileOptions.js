
if(this.Graphite == null)
{
    this.Graphite = {};
}

(
    // -- FILE-OPTIONS definition
    function()
    {
        Graphite.FileOptions = function(builder, messager, apiIsLoaded, clientIsLoaded)
        {
            this._builder = builder;
            this._messager = messager;
            this._fileStackCookieDelim = "--stack--";
            this._statusOK = 200;
            this._apiIsLoaded = apiIsLoaded != false;
            this._clientIsLoaded = clientIsLoaded != false;
            
            this._checkAuthorization = function(immediate, callback) 
            {
                if(!this._apiIsLoaded)
                {
                    // don't even try to authorize if api isn't ready
                    return;
                }
                
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
                    buttons.push({id:'newButton', text:'Create New', desc:"Create a new file", 
                        onClickCallback:this._onNamedFile.bind(this, true)});
                }
                
                buttons.push({id:'nameButton', text:'Rename', desc:"Rename file", 
                    onClickCallback:this._onNamedFile.bind(this, false)});
                buttons.push({id:'cancelButton', text:'Cancel', desc:"Don't create a new file"});
                
                this._builder.openPopup("Name File", settings, buttons);
            };
            
            this._onNamedFile = function(isNewFile, event)
            {
                if(this._onSelectFileName(event))
                {
                    this._lastSavedFileContent = undefined;
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
                    // this is a valid filename that we can work with
                    this._currentFileId = undefined;
                    this._resetFileStack();
                    
                    var suffixIdx = fileName.lastIndexOf(".xml");
                    if(suffixIdx > 0)
                    {
                        this._filename = fileName.substring(0, suffixIdx);
                    }
                    else
                    {
                        this._filename = fileName;
                    }
                    this._messager.refreshGoBack(false);
                    this._messager.setFileName(this._filename);
                    return true;
                }
            };
            
            this._isFileNameValid = function(fileName)
            {
                if(fileName == "" || fileName == undefined || fileName == null || fileName.indexOf(".xml") == 0)
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
                        {id:'saveButton', text:'Save', desc:"Save Changes", onClickCallback:this._onSaveCallback.bind(this, null)},
                        {id:'cancelButton', text:'Cancel', desc:"Don't Save Changes"}
                    ];
                    
                    this._builder.openPopup("Save File", settings, buttons);
                }
                else
                {
                    this._onSaveCallback(null);
                }
            };
            
            this._onSaveCallback = function(callback, event)
            {
                if(!this._clientIsLoaded)
                {
                    return false;
                }
                else if(this._isFileNameValid(this._filename) || this._onSelectFileName(event))
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
                    var requestMethod = "POST";
                    if(this._currentFileId != undefined)
                    {
                        requestPath += "/"+this._currentFileId;
                        requestMethod = "PUT";
                    }
                    
                    var request = gapi.client.request(
                    {
                        'path': requestPath,
                        'method': requestMethod,
                        'params': {'uploadType': 'multipart'},
                        'headers': 
                        {
                            'Content-Type': 'multipart/related; boundary="' + boundary + '"',
                            'Authorization': 'Bearer '+ this._authToken
                        },
                        'body': requestBody
                    });
                    
                    this._lastSavedFileContent = doc.trim();
                    request.execute(this._onSaveSuccess.bind(this, callback));
                    return true;
                }
                else
                {
                    return false;
                }
            };
            
            this._onSaveSuccess = function(callback, event)
            {
                this._messager.showMessage("Save Succeeded");
                
                // todo: error handling?
                
                this._currentFileId = event.id;
                this._link = event.downloadUrl;
                
                // do whatever comes next if we can
                if(callback != null)
                {
                    callback();
                }
            };
            
            this._createPicker = function(callback)
            {
                if(this._apiIsLoaded)
                {
                    var view = new google.picker.View(google.picker.ViewId.DOCS);
                    view.setMimeTypes("text/xml");
                    
                    var picker = new google.picker.PickerBuilder()
                        .setOAuthToken(this._authToken)
                        .addView(view)
                        .setCallback(callback)
                        .build();
                     picker.setVisible(true);
                }
            };
            
            this.openFile = function(fileId, preOpenCallback)
            {
                // by default, we are pushing the fileId, but we may be popping
                if(preOpenCallback == null)
                {
                    preOpenCallback = this._pushFileId.bind(this);
                }
                
                if(fileId != undefined && fileId != "")
                {
                    if(this.isDirty())
                    {
                        var settings = new Array();
                        settings[0] = [{id:'msgInput', text:"Save changes before continuing?", type:"message"}];
                        
                        if(!this._isFileNameValid(this._filename))
                        {
                            settings[1] = [{id:'fileNameInput', text:'File:', type:'text', value:"Untitled"}];
                        }
                        
                        var buttons = 
                        [
                            {id:'saveButton', text:'Save', desc:"Save Changes", onClickCallback:this._onSaveCallback.bind(
                                    this, this._onOpenFileCheckAuthorization.bind(this, fileId, preOpenCallback))},
                            {id:'cancelButton', text:'Cancel', desc:"Don't Save Changes"}
                        ];
                        
                        this._builder.openPopup("Save File", settings, buttons);
                    }
                    else
                    {
                        this._onOpenFileCheckAuthorization(fileId, preOpenCallback);
                    }
                }
            };
            
            this._onOpenFileCheckAuthorization = function(fileId, preOpenCallback)
            {
                this._checkAuthorization(this._isAuthorized, this._onOpenFileAuthorizationReady.bind(this, fileId, preOpenCallback));
            };
            
            this._onOpenFileAuthorizationReady = function(fileId, preOpenCallback)
            {
                if(!this._clientIsLoaded)
                {
                    return;
                }
                
                var request = gapi.client.request(
                {
                    'path': '/drive/v2/files/'+fileId,
                    'method': 'GET'
                });
                request.execute(function(resp) 
                {
                    if(resp.code == this._statusOK || resp.code == undefined)
                    {
                        if(resp.mimeType == "text/xml")
                        {
                            var xhr = new XMLHttpRequest();
                            xhr.open('GET', resp.downloadUrl);
                            xhr.setRequestHeader('Authorization', 'Bearer ' + this._authToken);
                            xhr.onload = function() 
                            {
                                var parser = new DOMParser();
                                var xmlDoc = parser.parseFromString(xhr.responseText,"text/xml");
                                if(!this._builder.fromXML(xmlDoc))
                                {
                                    // this is not a graphite XML file, just open it
                                    this._onLoadNonGraphiteFile(resp.downloadUrl);
                                }
                                else
                                {
                                    if(preOpenCallback != null)
                                    {
                                        preOpenCallback();
                                    }
                                    
                                    this._currentFileId = resp.id;
                                    this._lastSavedFileContent = xhr.responseText.trim();
                                    this._link = resp.downloadUrl;
                                    this._filename = resp.title.substring(0, resp.title.lastIndexOf(".xml"));
                                    var hasAncestors = document.cookie.length > 0;
                                    this._messager.refreshGoBack(hasAncestors, this._goToPreviousFile.bind(this));
                                    this._messager.setFileName(this._filename);
                                }
                            }.bind(this);
                            xhr.send();
                        }
                        else
                        {
                            // this is not a graphite file, just open it in code editor
                            this._onLoadNonGraphiteFile(resp.downloadUrl);
                        }
                    }
                }.bind(this));
            };
            
            this._onLoadNonGraphiteFile = function(url)
            {
                window.location.href = "CodeEditor/code-editor.html?"+
                    "link="+encodeURIComponent(url)+"&parentLink="+encodeURIComponent(this._link);
            };
            
            this._goToPreviousFile = function()
            {
                var prevFile = this._getTopFileId();
                if(prevFile != undefined)
                {
                    this.openFile(prevFile, this._popFileId.bind(this));
                }
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
                    if(data.docs[0].mimeType == "text/xml")
                    {
                        this._onLoadFileId(data.docs[0].id, this._resetFileStack.bind(this));
                    }
                    else
                    {
                        this._messager.showMessage("Cannot Load File Type");
                    }
                }
            };
            
            this._onLoadFileId = function(fileId, callback)
            {
                if(!this._clientIsLoaded)
                {
                    return;
                }
                
                var request = gapi.client.drive.files.get(
                {
                    'fileId': fileId
                });
                request.execute(function(resp) 
                {
                    if(resp.code == this._statusOK || resp.code == undefined)
                    {
                        var xhr = new XMLHttpRequest();
                        xhr.open('GET', decodeURIComponent(resp.downloadUrl));
                        xhr.setRequestHeader('Authorization', 'Bearer ' + this._authToken);
                        xhr.onload = function(param) 
                        {
                            var parser=new DOMParser();
                            var xmlDoc = parser.parseFromString(xhr.responseText,"text/xml");
                            
                            if(this._builder.fromXML(xmlDoc))
                            {
                                if(callback != null)
                                {
                                    callback();
                                }
                                
                                this._lastSavedFileContent = xhr.responseText.trim();
                                this._currentFileId = fileId;
                                this._filename = resp.title.substring(0, resp.title.lastIndexOf(".xml"));
                                var hasAncestors = document.cookie.length > 0;
                                this._messager.refreshGoBack(hasAncestors, this._goToPreviousFile.bind(this));
                                this._messager.setFileName(this._filename);
                            }
                            else
                            {
                                this._messager.showMessage("Cannot Load File Content");
                            }
                        }.bind(this);
                        xhr.send();
                    }
                }.bind(this));
            };
            
            this._pushFileId = function()
            {
                if(document.cookie == undefined)
                {
                    this._resetFileStack();
                }
                
                document.cookie += this._fileStackCookieDelim + this._currentFileId;
            };
            
            this._getTopFileId = function()
            {
                var cookieLen = document.cookie.length;
                if(cookieLen > 0)
                {
                    var lastFileStartIdx = document.cookie.lastIndexOf(this._fileStackCookieDelim);
                    if(lastFileStartIdx >= 0)
                    {
                        return document.cookie.substring(lastFileStartIdx + this._fileStackCookieDelim.length, cookieLen);
                    }
                }
            };
            
            this._popFileId = function()
            {
                var cookieLen = document.cookie.length;
                if(cookieLen > 0)
                {
                    var lastFileStartIdx = document.cookie.lastIndexOf(this._fileStackCookieDelim);
                    if(lastFileStartIdx > 0)
                    {
                        document.cookie = document.cookie.substring(0, lastFileStartIdx);
                    }
                    else
                    {
                        this._resetFileStack();
                    }
                }
            };
            
            this._resetFileStack = function()
            {
                document.cookie = ";expires=Wed; 01 Jan 1970";
            };
            
            this.isDirty = function()
            {
                if(this._lastSavedFileContent == undefined)
                {
                    // more optimized version
                    return true;
                }
                else
                {
                    var parser=new DOMParser();
                    var lastSaveDoc = parser.parseFromString(this._lastSavedFileContent,"text/xml");
                    var currentDoc = parser.parseFromString(this._builder.toXML(),"text/xml");
                    
                    if(lastSaveDoc.firstChild.nodeName != currentDoc.firstChild.nodeName &&
                       lastSaveDoc.childNodes.length   == currentDoc.childNodes.length &&
                       lastSaveDoc.childNodes.length   == 1)
                    {
                        // if they aren't both rooted in 1 "graph" node then don't even bother checking
                        return false;
                    }
                    else
                    {
                        return Graphite.XMLUtil.AreXMLDocsDifferent(lastSaveDoc.firstChild.childNodes, currentDoc.firstChild.childNodes);
                    }
                }
            };
            
            this.setApiIsLoaded = function()
            {
                var wasLoaded = this._apiIsLoaded;
                this._apiIsLoaded = true;
                
                if(!wasLoaded)
                {
                    this._checkAuthorization(true);
                }
            };
            
            this._autoLoadFromCookie = function()
            {
                // try to auto-load the last cookie'd file
                var topFileId = this._getTopFileId();
                if(topFileId != undefined)
                {
                    this._checkAuthorization(true, this._onLoadFileId.bind(this, topFileId, this._popFileId.bind(this)));
                }
            };
            
            this.setClientIsLoaded = function()
            {
                this._clientIsLoaded = true;
                this._autoLoadFromCookie();
            };
            
            // if we have an api instantly loaded, then check auth now
            if(this._apiIsLoaded)
            {
                this._checkAuthorization(true);
            }
            
            // initialize to "Untitled", but still attempt to load the last 
            // cookie file-- we can't rely on it succeeding though 
            this._messager.setFileName("Untitled");
            
            // if we have a cookie, load up whatever is at the top of the stack
            if(this._clientIsLoaded)
            {
                this._autoLoadFromCookie();
            }
            
            // as we are leaving the page we should push our current file
            // so when we return we are looking at the correct file.  We 
            // normally only PUSH when going forward to something.
            window.addEventListener("beforeunload", function (event)
            {
                if(this._currentFileId != undefined)
                {
                    this._pushFileId();
                }
            }.bind(this));
        };
        
        Graphite.FileOptions.NEW = 0;
        Graphite.FileOptions.SAVE = 1;
        Graphite.FileOptions.LOAD = 2;
    }
)();

