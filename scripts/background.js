var app = (function(){
    if(localStorage['web_informatics_data']){
        data = JSON.parse(localStorage['web_informatics_data']);
    }else{
        data = {};
        data['history'] = {};
        data['bookmarks'] = {}
    }

    base_urls = [
        "facebook.com",
        "www.google.com/search",
        "mail.google.com",
        "reddit.com",
        "plus.google.com"
    ];

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