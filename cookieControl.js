
if(this.Graphite == null)
{
    this.Graphite = {};
}

(
    // -- COOKIE-CONTROL definition
    function()
    {
        Graphite.CookieControl = function(builder)
        {
            this._builder = builder;
            this._stackCookieDelim = "--stack--";
            
            this.pushData = function(type, data)
            {
                var cookieData = this._getCookieData(type);
                if(cookieData == undefined)
                {
                    cookieData = "";
                }
                
                // make sure the stack is fully cleaned up properly
                this.resetDataStack(type);
                
                cookieData += this._stackCookieDelim + data;
                document.cookie = type+"="+cookieData;
            };
            
            this.getTopData = function(type)
            {
                var data = this._getCookieData(type);
                if(data != undefined)
                {
                    var cookieLen = data.length;
                    if(cookieLen > 0)
                    {
                        var lastItemStartIdx = data.lastIndexOf(this._stackCookieDelim);
                        if(lastItemStartIdx >= 0)
                        {
                            return data.substring(lastItemStartIdx + this._stackCookieDelim.length, cookieLen);
                        }
                    }
                }
            };
            
            this.popData = function(type)
            {
                var data = this._getCookieData(type);
                if(data != undefined)
                {
                    var cookieLen = data.length;
                    if(cookieLen > 0)
                    {
                        this.resetDataStack(type);
                        
                        var lastItemStartIdx = data.lastIndexOf(this._stackCookieDelim);
                        if(lastItemStartIdx > 0)
                        {
                            document.cookie = type + "=" + data.substring(0, lastItemStartIdx);
                        }
                    }
                }
            };
            
            this.resetDataStack = function(type)
            {
                document.cookie = type + "=;expires=Wed; 01 Jan 1970;";
            };
            
            this.getNumItemsInStack = function(type)
            {
                var num = 0;
                var data = this._getCookieData(type);
                if(data != undefined && data != "")
                {
                    num = data.split(this._stackCookieDelim).length - 1;
                }
                
                return num;
            };
            
            this._getCookieData = function (type)
            {
                var value = "; " + document.cookie;
                var parts = value.split("; " + type + "=");
                if (parts.length == 2)
                {
                    return parts[1];
                }
            };
        };
    }
)();

