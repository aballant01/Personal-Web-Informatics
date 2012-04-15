
var history = (function(){

    /**
    * Fetches the total number of websites visited (non-distinct)
    * web visits 
    */
    var fetchTotalWebVisits = function(){
        var $p = app.$infoP.clone();
        var len = app.data.history.length;

        var div = len / app.compareItems['num1994Websites'];

        return app.statements['num1994WebDev'].format(dataProc.round(div, 2));
        
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

        return app.statements['siteVisitCountComp']
            .format(
                url,
                times[0].length/times[1].length,
                "today", 
                "yesterday" 
            );
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
                currItem.startTime >= (now - (dayLen*2))){
                past.push(app.data.history[arr[i]]);
            }
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

        return app.statements['apollo11Length'].format("the web", dataProc.round(timecomp,3));
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
        var state = app.statements.youtubeVideos.
            format(dataProc.round(data[dataType]/3600000,2));
        return state;
    };

    var googEnergy = function(){
        var urlRe = /www.google.com\/search/;

        var index = app.data.indices['www.google.com'];
        var count = 0;
        for(var i = 0, len = index.length; i < len; i++){
            
            if(typeof app.data.history[index[i]] !== 'undefined'){
                var currItem = app.data.history[index[i]];
            
                if(urlRe.exec(currItem.url)){
                    count+= 1;
                }
            }
        }
        var googEnergy = app.compareItems['googleSearchEnergyKWh'] * count;
        
        return app.statements['googEnergyDev'].format(dataProc.round(googEnergy,2));

    };

    var findMinTime = function(){

        var len = app.data.history.length, 
            minTime = 10000, 
            index = -1, 
            url = ""; // Setting the threshold for minimum time

        for(var i = 0; i < len; i++){
            var dur = app.data.history[i].duration;
            if( dur < minTime && dur !== 0){
                
                var check = app.data.history[i].url;
                var base = dataProc.getBaseURL(check);

                if(app.data.indices[base].length === 1){
                    console.log(base);
                    console.log(dur);
                    minTime = dur;
                    index = i;
                    var url = check; 
                }
            }
        }

        var string = app.statements['minTime'];
        
        dur = dataProc.round(minTime/1000, 2);

        return (index !== -1) ? string.format(url, dur): "";
    };

    return {
        getTime : getTime,
        fetchTotalWebVisits : fetchTotalWebVisits,
        buildVisitComp: buildVisitComp,
        buildWebTime: buildWebTime,
        fetchYoutube: fetchYoutube,
        googEnergy:googEnergy, 
        findMinTime:findMinTime
    }
})();