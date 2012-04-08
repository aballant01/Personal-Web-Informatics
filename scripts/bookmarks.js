var bookmarks = (function(){
    
    var bMarksInfo = [];
    var countInfo = {};

    var build = function(){
        chrome.bookmarks.getTree(function(treeNodes){
            buildHelper(treeNodes);
            bookmarkCount();
        });
    };

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
        return countInfo[type];
    }

    return {
        build : build,
        bMarksInfo : bMarksInfo,
        bookmarkCount : bookmarkCount,
        getCount: getCount
    }

})();