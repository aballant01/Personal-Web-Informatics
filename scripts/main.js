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
    var data = {
        'Default':'Testing'
    };

    if(localStorage['web_informatics_data']){
        data = JSON.parse(localStorage['web_informatics_data']);
    };

    var base_url_pattern = '/^http[s]?:\/\/([a-zA-Z\.-]+)/';

    var re = /^http[s]?:\/\/([a-zA-Z\.-]+)/;

    var compareItems = {
        "apollo 11 length" : 703115000, //In milliseconds
        "google search energy kJ": 1, //in kJ,
        "google search energy kWh": 0.0003, // in kWh
        "num 1994 websites": 2738, // from http://answers.google.com/answers/threadview/id/147034.html
        "ms in day": 86400000 //Number of milliseconds in a day
    };

    // Will need to split these up into categories of statements, such that
    // we can pick randomly from a certain subset rather than the whole set
    var statements = {
        "apollo 11 length" : "In the time you've spent on {0}, Apollo 11 would have gone to the moon and back {1} times!",
        "num 1994 websites": "You've visited more websites in the past {0} than existed in 1994",
        "youtube videos"   : "In the time you've spent watching videos on youtube, you could have watched {0} best picture winning movies",
        "site vist count comp" : "You've visited {0} times more this {1} than last {1}"
    };

    var $container = $('#container');
    var $infoItem = $("<div class = 'info_item'></div>");
    var $infoP = $("<p class='float_left'></p>");
    
    
    var addInformatics = function(){
        var $elems = [];
        var $timeElem = buildWebTime();
        $container.append($timeElem);
    };


    var buildWebTime = function(){
        var $p = $infoP.clone();

        var time = history.getTime();


        console.log(time);
        console.log(compareItems['apollo 11 length']);

        var timecomp = time/compareItems['apollo 11 length'];        
        console.log(timecomp);

        $p.text(statements['apollo 11 length'].format("the web", timecomp));
        
        return $infoItem.clone().append($p).addClass("wide theme2");
    };

    return {
        data:data,
        re : re,
        $container : $container,
        $infoItem  : $infoItem,
        addInformatics: addInformatics
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

    var getTime = function(url){
        return (typeof url !== 'undefined')?
            dataProc.fetchTime(app.data.history, data.indices[url]):
            dataProc.fetchTime(app.data.history);
    };
    
    
    return {
        getTime : getTime
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
    app.addInformatics();
    //bookmarks.build();
};

})(jQuery);