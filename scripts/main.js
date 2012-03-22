var app = (function(){
    var data = {
        'Default':'Testing'
    };

    if(localStorage['web_informatics_data']){
        data = JSON.parse(localStorage['web_informatics_data']);
    };

    var base_url_pattern = '/^http[s]?:\/\/([a-zA-Z\.-]+)/';

    var re = /^http[s]?:\/\/([a-zA-Z\.-]+)/;

    return {
        data:data,
        re : re
    };
})();

var history = (function(){
    var buildHistory = function(){
        
        app.data['history'] = getUrls();
    };

    var getUrls = function(){
        /*Find way to get search across many days*/
        chrome.history.search({
                text : "alistair.ballantine", 
                maxResults : 2000, 
                startTime : 0,
                endTime:(new Date()).getTime()
            }, function(hisItems){
            console.log(hisItems);
        });
    };

    return {
        build:buildHistory
    }
})();

var bookmarks = (function(){


    var build = function(){
        
        chrome.bookmarks.getTree(function(treeNodes){
            var bookmarkInfo = buildHelper(treeNodes);
            console.log(bookmarkInfo);
        });
    };

    var buildHelper = function( node,  bookmarkInfo ){
        if(typeof bookmarkInfo === 'undefined'){
            console.log(node);
            console.log("bookmark undefined");
            bookmarkInfo = [];
            console.log(typeof bookmarkInfo);
        };

        console.log(node);
        if(node.url){
            console.log("Node URL");
            bookmarkInfo.push(node);
            return bookmarkInfo;
        };
        

        return bookmarkInfo;
    };

    return {
        build : build
    }

})();



window.onload = function(){
    //history.build();
    bookmarks.build();
};