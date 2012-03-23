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
        console.log(tab);
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
        this.ID = obj.id;
        this.url = obj.url;
        this.baseURL = app.getBaseURL(obj.url);
        this.startTime = new Date();
        this.duration = 0; // Initially set to 0 - when closed or 
        this.chromeObj = obj;
    };

    HistItem.prototype.setLength = function( endTime ){
        this.duration = endTime - this.startTime; 
    };

    HistItem.prototype.getDuration = function(){
        return this.duration;
    };

    return {
        HistItem : HistItem
    };
})();