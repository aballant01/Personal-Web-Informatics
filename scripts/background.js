var app = (function(){
    if(localStorage['web_informatics_data']){
        data = JSON.parse(localStorage['web_informatics_data']);
    }else{
        data = {};
        data['history'] = [];
        data['bookmarks'] = [];
        data['indices'] = {};
    }

    base_urls = [
        "facebook.com",
        "www.google.com/search",
        "mail.google.com",
        "reddit.com",
        "plus.google.com"
    ];

    var re = var re = /^http[s]?:\/\/([a-zA-Z\.-]+)/;

    var getBaseURL = function( url ){
        var path = url.split("/");
        if(path.length > 1){
            return path[2];
        }else{
            return re.exec(url)[0];
        };
        
    };

    var storeData = function(){
        localStorage['web_informatics_data'] = JSON.stringify(data);
    };

    var addIndexCount = function( base_url, index ) {
        if(data.indices[base_url]){
            data.indicies[base_url].push(index);
        }else{
            data.indices[base_url] = [];
            data.indices[base_url].push(index);
        }
    };


    return {
        data      : data,
        storeData : storeData,  
        urls      : base_urls
    }

})();

var bookmark = (function(){
    
    chrome.bookmarks.onCreated.addListener(function(id, bookmark){
        console.log(id);
        console.log(bookmark);
    });


})();

var tab = (function(){
    chrome.tabs.onCreated.addListener(function(tab){
        if(tab.url !== "chrome://newtab" && !tab.incognito){
            var histitem = new history.HistItem( tab );
            var index = app.data.history.push(histitem);
            app.addIndexCount(histitem.base_url, index);

            console.log("start oncreated tab");
            console.log(tab);
            console.log(histitem);
            console.log(app.data.indices);
            console.log("end oncreated tab");
        };
    });

    chrome.tabs.onCreated.addListener(function(tab){
        console.log(tab)
    });

    chrome.tabs.onRemoved.addListener(function(tab, removeInfo){
        // For this, we will need to retrieve the tab data from the id
        // passed in the "tab" parameter
        console.log(tab);
        console.log(removeInfo);
    });

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
        this.index = app.data.history.length + 1;
        this.ID = obj.id;
        this.url = obj.url;
        this.baseURL = app.getBaseURL(obj.url);
        this.startTime = (new Date()).getTime();
        // Initially set to 0 - when closed or updated add to the duration
        this.duration = 0;
        this.chromeObj = obj;
    };

    HistItem.prototype.setDuration = function( endTime ){
        this.duration = endTime - this.startTime; 
    };

    /**
    * Gets the duration
    */
    HistItem.prototype.getDuration = function(){
        var dur = this.duration;
        return (dur !== 0) ? dur : (new Date()).getTime() - this.startTime;
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