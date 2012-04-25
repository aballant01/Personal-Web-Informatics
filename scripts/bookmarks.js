var bookmarks = (function(){
    
    var bMarksInfo = [];
    var countInfo = {};

    /**
    * Makes a call to the Chrome Bookmarks API to get a tree 
    * of all the bookmarks that a user has. This is an 
    * asynchronous call, so we will need to find a better way
    * to ensure that this data is ready when we need to generate
    * the bookmark tree. 
    */
    var build = function(){
        chrome.bookmarks.getTree(function(treeNodes){
            buildHelper(treeNodes);
            bookmarkCount();
        });
    };

    /**
    * Helper to the build fundtion that traverses the bookmarks
    * tree recursively to build a flat file of all the users
    * bookmarks. 
    */
    var buildHelper = function( nodes ){
        if(nodes instanceof Array){
            var len = nodes.length;
            for(var i = 0; i < len; i++){
                buildAdd(nodes[i]);
            }
        }else{
            buildAdd(nodes)
        }
        
    };

    /**
    * Adds the appropriate elements to the bMarksInfo array
    * structure that holds the user list of bookmarks 
    */
    var buildAdd = function(nodes){
        if(nodes.hasOwnProperty('children')){
            buildHelper(nodes.children);
        }else{
            bMarksInfo.push(nodes);
        }
    };

    var bookmarkCount = function(){
        var count = 0;
        var hist = app.data.history;
        var l1 = hist.length;
        ///////////////////////////////
        var l2 = 0 || bMarksInfo.length;
        
        for(var i = 0; i < l1; i++){
            for(var j = 0; j < l2; j++){
                if(hist[i].url === bMarksInfo[j].url){
                    count += 1;
                }
            }
        }

        countInfo = {
            'count' : count, 
            'pct'   : count/l1
        }
    };

    var getCount = function(type){
        return [
            app.statements.rawBookmarks.format(countInfo[type]),
            "pie.png"
        ];
    }

    return {
        build : build,
        bMarksInfo : bMarksInfo,
        bookmarkCount : bookmarkCount,
        getCount: getCount
    }

})();