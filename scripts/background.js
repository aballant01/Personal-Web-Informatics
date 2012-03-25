
var app = (function(){

    var init = function(){
        if(localStorage['web_informatics_data']){
            data = JSON.parse(localStorage['web_informatics_data']);
        }else{
            data = {};
            data['history'] = [];
            data['bookmarks'] = [];
            data['indices'] = {};
            data['start_time'] = Date.now();
        }
    }   

    var re = /^http[s]?:\/\/([0-9a-zA-Z\.-]+)/;

    /**
    * Takes a complete url path and returns the core domain
    * path, AKA the base URL. For example, the URL
    * http://www.foo.com/bar?test=true would return www.foo.com
    *
    * @param {url} The complete url string
    * @returns The base URL component of the full URL
    */
    var getBaseURL = function( url ){
        var path = url.split("/");
        if(path.length > 1){
            return path[2];
        }else{
            console.log(url);
            console.log(re.exec(url));
            return path[0];
        };   
    };

    /**
    * Stores the current iteration of the app data into HTML5 
    * local storage as a JSON string
    */
    var storeData = function(){
        localStorage['web_informatics_data'] = JSON.stringify(data);
    };

    /**
    * Adds an array index corresponding to a History item to 
    * the corresponding base URL index map, app.data.indices
    * @param {base_url} The base url of the site being visited
    * @param {index} The history index of the added item
    */
    var addIndexCount = function( base_url, index ) {
        if(data.indices[base_url]){
            data.indices[base_url].push(index);
        }else{
            data.indices[base_url] = [];
            data.indices[base_url].push(index);
        }
    };

    /**
    * Sets an interval timer that will store the user data
    * in local storage every 60 seconds
    */
    var storeInterval = function(){
        window.setTimeout(function(){
            storeData();
            storeInterval();
        }, 60000);
    };

    /**
    * Clears the data stored in LocalStorage
    */
    var clearData = function(){
        data = {};
        storeData();
    };

    init();
    storeInterval();

    return {
        data      : data,
        storeData : storeData,  
        urls      : base_urls,
        getBaseURL: getBaseURL,
        addIndexCount: addIndexCount
    }

})();

var bookmark = (function(){
    
    chrome.bookmarks.onCreated.addListener(function(id, bookmark){
        console.log(id);
        console.log(bookmark);
    });


})();

var tab = (function(){

    chrome.tabs.onCreated.addListener(function( tab ){
        if(tab.url !== "chrome://newtab/" && !tab.incognito){
            
            var histitem = new history.HistItem( tab );
            var index = app.data.history.push(histitem);
            app.addIndexCount(histitem.baseURL, index);

        };
    });

    chrome.tabs.onUpdated.addListener(function( tabId, changeInfo, tab ){
        console.log("Updated")
        console.log(tab);

        if(tab.status === "complete"){

            var lastTab = findLastTab(data.history, tabId);
            if (lastTab.url === tab.url){
                return;
            }else{

                lastTab.setDuration(Date.now());

                var histitem = new history.HistItem( tab );
                var index = app.data.history.push(histitem);
                app.addIndexCount(histitem.baseURL, index);
            }
        }

    });

    chrome.tabs.onRemoved.addListener(function(tab, removeInfo){
        // Find the most recent occurence of the Tab ID
        var historyItem = findLastTab( data.history, tab);

        historyItem.setDuration(Date.now());
        // just doing it this way for now, will try for better way 
    });

    /**
    * 
    */
    var findLastTab = function( arr, tabId, url ){
        for(var i = arr.length; i > 0; i--){

            var tab = arr[i-1];
            
            if(tab.ID === tabId){
                if(url){
                    if(app.getBaseURL(tab.url) !== app.getBaseURL(url)){
                        continue;
                    }
                }
                return tab;
            }
        }
        return 0;
    }
})();

/**
* Module for storing history related objects and methods 
* related to history functions - right now my idea is to store
* all of the history items as an object of our own creation that
* we can then write functions to get data from, and worst comes
* to worst we also store the chrome object for now, such that
* if we find we need data from it, we can A) get it initially and
* B) write methods to retrieve that data. 
*/
var history = (function(){
    var HistItem = function( obj ) {
        this.index = app.data.history.length + 1 || obj.id;
        this.ID = obj.id;
        this.url = obj.url;
        this.baseURL = app.getBaseURL(obj.url);
        this.startTime = Date.now();
        // Initially set to 0 - when closed or updated add to the duration
        this.duration = 0;
        //this.chromeObj = obj;
    };

    /*
    * Append the duration of time spent on this 
    */
    HistItem.prototype.setDuration = function( endTime ){
        this.duration = endTime - this.startTime; 
    };

    /**
    * Gets the duration
    */
    HistItem.prototype.getDuration = function(){
        var dur = this.duration;
        return (dur !== 0) ? dur : Date.now() - this.startTime;
    };

    /**
    * Retrieves the total length of time spent on a specific 
    * site/base URL. 
    * @param {base_url} The website base URL to retrieve the
    *   duration of visit from.
    * @return: The site visit duration in milliseconds 
    */
    var getUrlDur = function( base_url ){
        var indices = app.data.indices[base_url];
        var totalDur = 0;
        for(var i = 0, len = indices.length; i < len; i++){
            totalDur += app.data.history[indices[i]].getDuration();
        };

        return totalDur;
    };
    return {
        HistItem : HistItem, 
        getUrlDur: getUrlDur
    };
})();