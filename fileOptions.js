
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
            this._messager = builder.getMessager();
            this._cookieControl = builder.getCookie();
            this._fileStackType = "fileId";
            this._statusOK = 200;
            this._isDriveLoaded = false;
            
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
                    
                    if(!this._isDriveLoaded)
                    {
                        gapi.client.load('drive', 'v2', this._delayedGoogleDriveLoad.bind(this, callback));
                    }
                    else if(callback) callback();
                }
                else
                {
                    this._isAuthorized = false;
                    this._authToken = undefined;
                }
            };
            
            // need to delay the load for some reason, because Google Drive tends to 
            // fail when using it immediately
            this._delayedGoogleDriveLoad = function(callback)
            {
                this._isDriveLoaded = true;
                
                if(callback)
                {
                    window.setTimeout(callback, 10);
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
                
                this._builder.openPopup("Name New File", settings, buttons);
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
                    this._cookieControl.resetDataStack(this._fileStackType);
                    
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
                if(this._isFileNameValid(this._filename) || this._onSelectFileName(event))
                {
                    this._messager.showMessage("Saving...");
                    this._builder.toPNG(function(thumbnail)
                    {
                        thumbnail = thumbnail.split("base64,")[1].replace(
                            /\+/g, '-').replace(/\//g, '_');
                                
                                
                                ///[/]/g, "_").replace(/[+]/g, "-").replace(/[=]/g, "*");
                        
                        var doc = this._builder.toXML();
                        const boundary = "gapi.client.request-Multipart-Boundary";
                        const requestBody = 
                            "--"+boundary+"\n"+
                            "Content-Type: application/json; charset=UTF-8\n\n"+
                                "{\n"+
                                "    'title': '"+this._filename+".xml',\n"+
                                "    'mimeType': 'text/xml',\n"+
                                "    'thumbnail': {\n"+
                                "        'image': '"+thumbnail+"',\n"+
                                "        'mimeType': 'image/png'\n"+
                                "     }\n"+
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
                    }.bind(this));
                    
                    return true;
                }
                else
                {
                    return false;
                }
            };
            
            this._onSaveSuccess = function(callback, event)
            {
                if(event.code == this._statusOK || event.code == undefined)
                {
                    this._messager.showMessage("Save Succeeded");
                    this._currentFileId = event.id;
                    this._link = event.downloadUrl;
                    
                    // do whatever comes next if we can
                    if(callback != null)
                    {
                        callback();
                    }
                }
                else
                {
                    this._messager.showMessage("Error Saving");
                }
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
            
            this.openFile = function(fileId, closePreviousCallback)
            {
                // by default, we are pushing the fileId, but we may be popping
                if(closePreviousCallback == null)
                {
                    closePreviousCallback = this._cookieControl.pushData.bind(this._cookieControl, this._fileStackType);
                }
                
                if(fileId != undefined && fileId != "")
                {
                    if(this._builder.isDirty(this._lastSavedFileContent))
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
                                    this, this._onOpenFileCheckAuthorization.bind(this, fileId, closePreviousCallback))},
                            {id:'cancelButton', text:'Cancel', desc:"Don't Save Changes"}
                        ];
                        
                        this._builder.openPopup("Save File", settings, buttons);
                    }
                    else
                    {
                        this._onOpenFileCheckAuthorization(fileId, closePreviousCallback);
                    }
                }
            };
            
            this._onOpenFileCheckAuthorization = function(fileId, closePreviousCallback)
            {
                this._checkAuthorization(this._isAuthorized, this._onOpenFileAuthorizationReady.bind(this, fileId, closePreviousCallback));
            };
            
            this._onOpenFileAuthorizationReady = function(fileId, closePreviousCallback)
            {
                this._messager.showMessage("Opening...");
                
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
                                    if(closePreviousCallback != null)
                                    {
                                        closePreviousCallback(this._currentFileId);
                                    }
                                    
                                    this._currentFileId = resp.id;
                                    this._lastSavedFileContent = xhr.responseText.trim();
                                    this._link = resp.downloadUrl;
                                    this._filename = resp.title.substring(0, resp.title.lastIndexOf(".xml"));
                                    
                                    // do messager last since we are done with actual file work
                                    this._messager.refreshGoBack(this._cookieControl.getNumItemsInStack(this._fileStackType) > 0, this._goToPreviousFile.bind(this));
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
                    else
                    {
                        this._messager.showMessage("Error Opening");
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
                var prevFile = this._cookieControl.getTopData(this._fileStackType);
                if(prevFile != undefined)
                {
                    this.openFile(prevFile, this._cookieControl.popData.bind(this._cookieControl, this._fileStackType));
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
                        this._onLoadFileId(data.docs[0].id, this._cookieControl.resetDataStack.bind(this._cookieControl, this._fileStackType));
                    }
                    else
                    {
                        this._messager.showMessage("Cannot Load File Type");
                    }
                }
            };
            
            this._onLoadFileId = function(fileId, loadCompleteCallback)
            {
                this._messager.showMessage("Loading...");
                
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
                                this._lastSavedFileContent = xhr.responseText.trim();
                                this._currentFileId = fileId;
                                this._filename = resp.title.substring(0, resp.title.lastIndexOf(".xml"));
                                
                                if(loadCompleteCallback != null)
                                {
                                    loadCompleteCallback(this._currentFileId);
                                }
                                
                                // do messager last since we are done with actual file work
                                this._messager.refreshGoBack(this._cookieControl.getNumItemsInStack(this._fileStackType) > 0, this._goToPreviousFile.bind(this));
                                this._messager.setFileName(this._filename);
                            }
                            else
                            {
                                this._messager.showMessage("Cannot Load File Content");
                            }
                        }.bind(this);
                        xhr.send();
                    }
                    else
                    {
                        this._messager.showMessage("Error Loading");
                    }
                }.bind(this));
            };
            
            this._autoLoadFromCookie = function()
            {
                // try to auto-load the last cookie'd file
                var topFileId = this._cookieControl.getTopData(this._fileStackType);
                if(topFileId != undefined)
                {
                    this._checkAuthorization(true, this._onLoadFileId.bind(this, topFileId, 
                        this._cookieControl.popData.bind(this._cookieControl, this._fileStackType)));
                }
            };
            
            // check auth now for the first time
            this._checkAuthorization(true);
            
            // initialize to "Untitled", but still attempt to load the last 
            // cookie file-- we can't rely on it succeeding though 
            this._messager.setFileName("Untitled");
            
            // if we have a cookie, load up whatever is at the top of the stack
            this._autoLoadFromCookie();
            
            // as we are leaving the page we should push our current file
            // so when we return we are looking at the correct file.  We 
            // normally only PUSH when going forward to something.
            window.addEventListener("beforeunload", function (event)
            {
                if(this._currentFileId != undefined)
                {
                    this._cookieControl.pushData(this._fileStackType, this._currentFileId);
                }
            }.bind(this));
        };
    }
)();

