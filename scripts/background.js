var app = (function(){
    if(localStorage['web_informatics_data']){
        data = JSON.parse(localStorage['web_informatics_data']);
    }else{
        data = {};
    }

    base_urls = [
        "facebook.com",
        "www.google.com/search",
        "mail.google.com",
        "reddit.com",
        "plus.google.com"
    ];

    return {
        data : data,
        urls : base_urls
    }

})();

var bookmark = (function(){
    
    chrome.bookmarks.onCreated.addListener(function(id, bookmark){
        console.log(id);
        console.log(bookmark);
    });

    chrome.tabs.onCreated().addListener(function(tab){
        console.log(tab);
    });

})()