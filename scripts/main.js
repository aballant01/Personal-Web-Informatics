(function($){

/**
* Format function that replaces {d} tags in a string with
* supplied arguments
* 
* Example:
* "{0} is dead, but {1} is alive! {0} {2}".format("ASP", "ASP.NET");
* "ASP is dead, but ASP.NET is alive! ASP {2}"
* 
* Thanks to http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format/4673436#4673436
*
*/
String.prototype.format = function() {
  var args = arguments;
  return this.replace(/{(\d+)}/g, function(match, number) { 
    return typeof args[number] != 'undefined'
      ? args[number]
      : match
    ;
  });
};


var app = (function(){

    var data = JSON.parse(localStorage['web_informatics_data']);

    var base_url_patt = '/^http[s]?:\/\/([a-zA-Z\.-]+)/';

    // Will need to split these up into categories of statements, such that
    // we can pick randomly from a certain subset rather than the whole set
    var compareItems = {
        "apollo11Length" : 703115000, //In milliseconds
        "googleSearch energy kJ": 1, //in kJ,
        "googleSearchEnergyKWh": 0.0003, // in kWh
        "num1994Websites": 2738, // from http://answers.google.com/answers/threadview/id/147034.html
        "msInDay": 86400000 //Number of milliseconds in a day
    };

    // Will need to split these up into categories of statements, such that
    // we can pick randomly from a certain subset rather than the whole set
    var statements = {
        "apollo11Length" : "In the time you've spent on {0}, Apollo 11 would have gone to the moon and back {1} times!",
        "num 1994 web": "You've visited more websites in the past {0} than existed in 1994",
        // As a developing alernative to the above:
        "num1994WebDev": "The number of websites you've visited is {0} times the number that existed in 1994",
        //"youtubeVideos"   : "In the time you've spent watching videos on youtube, you could have watched {0} best picture winning movies",
        "youtubeVideos": "you have spent {0} hours watching youtube",
        "siteVisitCountComp" : "You've visited {0} {1} times {2} compared with {3}",
        "googleSearchEnergy" : "In the energy you've used in google searches",
        "rawBookmarks":"You have clicked on {0} of your bookmarks since the beginning of time (since you installed this)",
        "googEnergyDev":"You have used {0} kWh of energy in Google searches alone"
    };

    var $container = $('#container');
    var $infoItem = $("<div class = 'info_item'></div>");
    var $infoP = $("<p class='float_left'></p>");
    
    
    var addInformatics = function(){
        var $elems = [];
        
        var $timeElem = history.buildWebTime();
        $container.append($timeElem);

        var $visitCompElem = history.buildVisitComp("www.theverge.com");
        $container.append($visitCompElem);

        var $numWebVisits = history.fetchTotalWebVisits();
        $container.append($numWebVisits);

        var $youTime = history.fetchYoutube('time');
        $container.append(
            $infoItem.clone().append(
                $infoP.clone().text(
                    statements.youtubeVideos.format($youTime / 3600000)
                )
            ).addClass("thin theme5")
        );

        var bcount = bookmarks.bookmarkCount('count');
        $container.append(
            $infoItem.clone().append(
                $infoP.clone().text(
                    statements.rawBookmarks.format(bcount)
                )
            ).addClass("wide theme7")
        );

        var googEnergy = history.googEnergy();
        $container.append(
            $infoItem.clone().append(
                $infoP.clone().text(
                    statements['googEnergyDev'].format(googEnergy)
                )
            ).addClass("full theme8")
        );
        
    };
    

    return {
        data           :data,
        $container     : $container,
        $infoItem      : $infoItem,
        $infoP         : $infoP,
        addInformatics : addInformatics,
        compareItems   : compareItems,
        statements     : statements
    };
})();


var dataProc = (function(){

    var fetchTime = function(arr, index){
        var dur = 0;
        var set = typeof index !== 'undefined';

        var len = (set) ? index.length : arr.length;

        for(var i = 0; i < len; i++){
            dur += (set) ? arr[index[i]].duration : arr[i].duration;
        }

        return dur; 
    };

    return{
        fetchTime : fetchTime
    }
})();



var history = (function(){

    var fetchTotalWebVisits = function(){
        var $p = app.$infoP.clone();

        var len = app.data.history.length;

        var div = len / app.compareItems['num1994Websites'];

        $p.text(app.statements['num1994WebDev'].format(div));
        return app.$infoItem.clone().append($p).addClass("full theme3");
    };


    var getTime = function(url){
        return (typeof url !== 'undefined')?
            dataProc.fetchTime(app.data.history, data.indices[url]):
            dataProc.fetchTime(app.data.history);
    };
    
    /**
    *
    */
    var buildVisitComp = function(url){
        var $p = app.$infoP.clone();
        var day = (new Date()).getDate();

        var index = app.data.indices[url];
        var times = visitCompHelperDay(index);

        $p.text(app.statements['siteVisitCountComp'].format(url,times[0].length/times[1].length,"today", "yesterday" ));

        return app.$infoItem.clone().append($p).addClass("thin theme9");
    };

    var visitCompHelperDay = function(arr){
        var today = (new Date()).getDate();
        var now = Date.now();
        var curr = [];
        var past = [];
        var dayLen = 86400000;

        for(var i = 0, len = arr.length; i < len; i++){
            var currItem = app.data.history[arr[i]];

            if (typeof currItem === 'undefined'){
                continue;
            }
            
            if (currItem.startTime >= (now - dayLen)){
                curr.push(app.data.history[arr[i]]);
            }else if(currItem.startTime < (now - dayLen) && 
                curItem.startTime >= (now - (dayLen*2))){
                past.push(app.data.history[arr[i]]);
            }

            /*
            var date = new Date(currItem.fullDate);

            if(date.getDate() == today){
                curr.push(data.history[arr[i]]);
            }else if(date.getDate() == ){
                curr.push(arr[i]);
            }*/
        }

        return [curr, past];

    };

    /**
    * 
    */
    var buildWebTime = function(){
        var $p = app.$infoP.clone();

        var time = getTime();
        var timecomp = time/app.compareItems['apollo11Length'];        

        $p.text(app.statements['apollo11Length'].format("the web", timecomp));
        
        return app.$infoItem.clone().append($p).addClass("wide theme2");
    };

    var fetchYoutube = function(dataType){
        var data = {
            'time' : 0,
            'num'  : 0,
            'objs' : []
        }

        var index = app.data.indices['www.youtube.com'];

        for(var i = 0, l = index.length; i < l; i++){
            currItem = app.data.history[index[i]];
            if(currItem){
                data.time += currItem.duration;
                data.num += 1;
                data.objs.push(currItem);
            }
        }

        return data[dataType];
    };

    var googEnergy = function(){
        var urlRe = /www.google.com\/search/;

        var index = app.data.indices['www.google.com'];
        var count = 0;
        for(var i = 0, len = index.length; i < len; i++){
            var currItem = app.data.history[index[i]];
            if(urlRe.exec(currItem.url)){
                count+= 1;
            }
        }

        return app.compareItems['googleSearchEnergyKWh'] * count;

    };

    return {
        getTime : getTime,
        fetchTotalWebVisits : fetchTotalWebVisits,
        buildVisitComp: buildVisitComp,
        buildWebTime: buildWebTime,
        fetchYoutube: fetchYoutube,
        googEnergy:googEnergy
    }
})();



var bookmarks = (function(){
    
    var bmarksInfo = [];

    var build = function(){
        chrome.bookmarks.getTree(function(treeNodes){
            buildHelper(treeNodes);
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
            bmarksInfo.push(nodes);
        }
    };

    var bookmarkCount = function( type ){
        var count = 0;
        var hist = app.data.history;
        var l2 = bmarksInfo.length;
        var l1 = hist.length;

        for(var i = 0; i < l1; i++){
            for(var j = 0; j < l2; j++){
                if(hist[i].url === bmarksInfo[j].url){
                    count += 1;
                }
            }
        }

        var ret = {
            'count' : count, 
            'pct'   : count/l1
        }

        return ret[type];
    };

    return {
        build : build,
        bmarksInfo : bmarksInfo,
        bookmarkCount : bookmarkCount
    }

})();

window.onload = function(){
    bookmarks.build();
    app.addInformatics();
};

})(jQuery);