
var app = (function(){

    var init = function(){
        if(localStorage['web_informatics_data']){
            data = JSON.parse(localStorage['web_informatics_data']);
        }else{
            data = {};
            data['history'] = [];
            data['bookmarks'] = [];
            data['indices'] = {};
            data['byDate'] = {};
            data['start_time'] = Date.now();
        }

        if(!data.byDate){
            data['byDate'] = {};
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
        }, 30000);
    };

    /**
    * Clears the data stored in LocalStorage
    */
    var clearData = function(){
        data = {};
        storeData();
    };

    /**
    * Finds the number of visits to a specific URL
    * 
    * @param {url} The target URL to count for
    * @returns the number of visits to the given URL
    */
    var findNumVisits = function(url){
        var indices = data.indices[getBaseURL(url)];
        
        var len = (indices) ? indices.length : data.history.length;
        var arr = (indices) ? indices : data.history;
        var count = 0;

        for(var i = 0; i < len; i++){
            if(arr[i].url === url){
                count += 1;
            }
        }

        return count;
    };

    /**
    * Adds the selected history item to the data store
    * and creates an index in the 
    */
    var addToHistory = function( obj ){
        var histitem = new history.HistItem( obj );
        var index = app.data.history.push(histitem);
        app.addIndexCount(histitem.baseURL, index);

        var d = getDateString();

        if(!data.byDate[d]){
            data.byDate[d] = [];
        }    
        data.byDate[d].push(histitem);
    };

    /**
    * Returns the current time as a string in the 
    * format of YYYY-MM-DD
    */
    var getDateString = function(){
        var d = new Date();
        return [
            d.getUTCFullYear(),  
            (d.getUTCMonth()+1),
            (d.getUTCDate())
        ].join('-');
    }

    init();
    storeInterval();

    return {
        data          : data,
        storeData     : storeData,  
        getBaseURL    : getBaseURL,
        addIndexCount : addIndexCount,
        findNumVisits : findNumVisits,
        addToHistory  : addToHistory
    }

})();

var bm = (function(){

    var bmark = function(bookmark){
        this.url = bookmark.url;
        this.baseURL = app.getBaseURL(this.url);
        this.numVisits = 0 + app.findNumVisits(this.url);
        this.created = new Date();
    };

    chrome.bookmarks.onCreated.addListener(function(id, bookmark){
        console.log(id);
        console.log(bookmark);

        app.data.bookmarks.push(new bmark(bookmark));
    });


})();

var tab = (function(){

    chrome.tabs.onCreated.addListener(function( tab ){
        if(tab.url && tab.url !== ""){
            if(tab.url.split("/")[0] !== "chrome:" && !tab.incognito){
                
                var histItem = new history.HistItem( tab );
                var index = app.data.history.push(histItem);
                app.addIndexCount(histItem.baseURL, index);
            }
        }
    });

    chrome.tabs.onUpdated.addListener(function( tabId, changeInfo, tab ){

        if(!tab.incognito){
            if(tab.status === "complete"){
                var lastTab = findLastTab(app.data.history, tabId);
                if (lastTab.url === tab.url){
                    return;
                }else if(lastTab !== 0){

                    if(!lastTab.setDuration){
                        lastTab = new history.HistItem(lastTab);
                    }

                    lastTab.setDuration(Date.now());

                    app.addToHistory(tab);
                }else{

                    app.addToHistory(tab);
                }
            }
        }
    });

    chrome.tabs.onRemoved.addListener(function(tabId, removeInfo){
        // Find the most recent occurence of the Tab ID

        var historyItem = findLastTab( app.data.history, tabId);
        
        if(historyItem !== 0){

            if(!historyItem.setDuration){
                historyItem = new history.HistItem(historyItem);
            }

            historyItem.setDuration(Date.now());
        }
        // just doing it this way for now, will try for better way 
    });

    /**
    * Finds the last instance of a tab with a given URL
    * 
    * @param {arr} The tab array to search in
    * @param {tabId} The Chrome tabID to search for
    * @param {url} The URL of the item to search for (optional)
    * 
    * @returns the found tab object or 0 if nothing was found 
    */
    var findLastTab = function( arr, tabId, url ){
        for(var i = arr.length - 1; i >= 0; i -= 1){

            var tab = arr[i];
            if(tab.id === tabId){
                return tab;
            }
        }
        return 0;
    };
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
        this.id = obj.id;
        this.url = obj.url;
        this.baseURL = obj.baseURL      || app.getBaseURL(obj.url);
        this.startTime = obj.startTime  || Date.now();
        this.fullDate = obj.fullDate    || new Date();
        // Initially set to 0 - when closed or updated add to the duration
        this.duration = (obj.duration && obj.duration !== 0)? obj.duration : 0;
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