
var history = (function(){

    /**
    * Fetches the total number of websites visited (non-distinct)
    * web visits 
    */
    var fetchTotalWebVisits = function(){
        
        var len = app.data.history.length;

        var div = len / app.compareItems['num1994Websites'];

        var webVisits = dataProc.round(div, 2);

        if(! dataProc.isNumeric(webVisits)){
            throw new dataProc.NumericException();
        }

        return [
            app.statements['num1994WebDev'].format(webVisits),
            "boxOrangeBang.png"
        ];
        
    };


    var getTime = function(url){
        return (typeof url !== 'undefined')?
            dataProc.fetchTime(app.data.history, data.indices[url]):
            dataProc.fetchTime(app.data.history);
    };
    
    /**
    * Compares the number of times that a site has been 
    * visited in the current time period versus the previous
    * time period
    *
    * @param {url} The BaseURL (domain url) to check the usage
    *   against the time periods
    */
    var buildVisitComp = function(url, interval){
        var $p = app.$infoP.clone();
        var day = (new Date()).getDate();

        var index = app.data.indices[url];
        var times = visitCompHelperDay(index, interval || "day");
        console.log(times[0].length);
        console.log(times[1].length);

        var num = times[0].length/times[1].length;

        if(!dataProc.isNumeric(num)){
            throw new dataProc.NumericException();
        }

        return [
            app.statements['siteVisitCountComp'].format(
                url,
                times[0].length/times[1].length,
                "today", 
                "yesterday" 
            ),
            "pie.png"
        ];
    };

    /**
    * Helper to the buildVisitComp function - retrieves the
    * total comparative time for a given array of items
    * and the selected time period - defaults to comparison
    * between days
    *
    * @param {arr} The array index to retrieve duration information
    *   from
    * @param {interval} The string representation of the time 
    *   period to make comparison for - "day", "week", or "month"
    *
    * @return: A two element array of the current time period duration
    *   and the previous time period duration
    */
    var visitCompHelperDay = function(arr, interval){
        var today = (new Date()).getDate();
        var now = Date.now();
        var curr = [];
        var past = [];
        var intervals = {
            "day"   : 86400000,
            "week"  : 604800000,
            "month" : 2419200000
        };

        interval = interval || "day";
        var timeLen = (interval) ? intervals[interval] : 86400000;

        for(var i = 0, len = arr.length; i < len; i++){
            var currItem = app.data.history[arr[i]];

            if (typeof currItem === 'undefined'){
                continue;
            }
            
            if (currItem.startTime >= (now - timeLen)){
                curr.push(app.data.history[arr[i]]);
            }else if(currItem.startTime < (now - timeLen) && 
                currItem.startTime >= (now - (timeLen*2))){
                past.push(app.data.history[arr[i]]);
            }
        }

        return [curr, past];

    };

    /**
    * Retreives the total duration spent on the web
    * by a user. Calculated by total time spent on open
    * tabs, so not necessarily accurate because the duration
    * will be adding up in multiple places at once if the
    * user has several tabs open. 
    * 
    * @return The statement string for how long the user has
    *   spent on the web (currently Apollo 11);
    */
    var buildWebTime = function(){
        var $p = app.$infoP.clone();

        var time = getTime();
        var timecomp = time/app.compareItems['apollo11Length'];        

        if(!dataProc.isNumeric(timecomp)){
            throw new dataProc.NumericException();
        }

        return [
            app.statements['apollo11Length'].format("the web", dataProc.round(timecomp,3)),
            "rocket.png"
        ];
    };

    /**
    * Retrieves the number of hours spent on YouTube
    * and returns the statement for youtube time. Does
    * not strictly represent time watching videos; rather
    * it represents time spent on the YouTube Site 
    *
    * NOTE: This could be made into it's own informative function, 
    * as it retrieves data in a helpful manner
    *
    * @return The YouTube statment string with the number of
    *   hours spent on youtube. 
    */
    var fetchYoutube = function(dataType, url){
        var data = {
            'time' : 0,
            'num'  : 0,
            'objs' : []
        }
        url = url || "www.youtube.com";

        var index = app.data.indices[url];

        for(var i = 0, l = index.length; i < l; i++){
            currItem = app.data.history[index[i]];
            if(currItem){
                data.time += currItem.duration;
                data.num += 1;
                data.objs.push(currItem);
            }
        }

        var num = data[dataType]/3600000;

        if(!dataProc.isNumeric(num)){
            throw new dataProc.NumericException();
        }

        var statement = app.statements.youtubeVideos.
            format(dataProc.round(num,2));
        
        return [
            statement,
            "BarTWO.png"
        ];
    };

    /**
    * Calculates the amount of energy that has been
    * used in Google searches based upon a Google Blog 
    * post and returns the statement string representing
    * that information. 
    *
    * @return The Google Energy statement string
    */
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
        
        var googNum = dataProc.round(googEnergy,2); 

        if(!dataProc.isNumeric(googNum)){
            throw new dataProc.NumericException();
        }

        return [
            app.statements['googEnergyDev'].format(googNum),
            "village.png"
        ];

    };

    /**
    * Finds a website that the user has visited only once 
    * and for the shortest period of time, and returns the 
    * statment representing that information. 
    * 
    * The base limit for the shortest website is 10 seconds
    * 
    */
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
                    
                    minTime = dur;
                    index = i;
                    var url = check; 
                }
            }
        }

        var string = app.statements['minTime'];
        
        dur = dataProc.round(minTime/1000, 2);

        if(!dataProc.isNumeric(dur)){
            throw new dataProc.NumericException();
        }

        var statement = (index !== -1) ? string.format(url, dur): "";
        return [
            statement,
            "BarThree.png"
        ];
    };
	
	var fetchFacebook = function(){
		
		// Find duration and number of visits for facebook
		var firstDate;
		var time = 0;
		var num = 0; 
		var index = app.data.indices['www.facebook.com'];
		for (var i = 0; i < index.length; i++) {
		var currItem = app.data.history[index[i]];
			if (currItem){
				if (i == 0) {
					firstDate = new Date(currItem.startTime);
				}
				time += currItem.duration;
				num += 1;
			}
		}
		
		// Format and return statement
		var str = app.statements['facebook'];
		var visits = num
		var hours = dataProc.round(time/3600000,2);
		return [
            str.format(visits, hours, firstDate),
            "boxOrange.png"
        ];
		
	};
	
		
	var fetchFacebookMostFrequentPage = function() {
		
		// Get duration for each facebook page
		var facebookPages = new Object();
		var index = app.data.indices['www.facebook.com'];
		for (var i = 0; i < index.length; i++) {
			var currItem = app.data.history[index[i]];
			if (currItem){
				if (facebookPages[currItem.url]) {
					facebookPages[currItem.url] += currItem.duration;
				}
				else {
					facebookPages[currItem.url] = currItem.duration;
				}
			}
		}
		
		// Find page with most time that is not the main page
		var max = 0;
		var maxPage;
		for (var page in facebookPages) {
			if (page != 'http://www.facebook.com/' && page.indexOf('www.facebook.com') != -1 && facebookPages[page] > max) {
				maxPage = page;
				max = facebookPages[page];
			}
		}
		
		// Format and return statement
		var str = app.statements['facebookPages'];
		return [
            str.format(maxPage),
            "BarTWO.png"
        ];
		
	};
	
	var googleOrFacebook = function() {
		
		// Get Facebook total time
		var facebookTime = 0;
		var facebookIndex = app.data.indices['www.facebook.com'];
		for (var i = 0; i < facebookIndex.length; i++) {
			var currItem = app.data.history[facebookIndex[i]];
			if (currItem){
				facebookTime += currItem.duration;
			}
		}
		
		// Get Google total time
		var googleTime = 0;
		var googleIndex = app.data.indices['www.google.com'];
		for (var i = 0; i < googleIndex.length; i++) {
			var currItem = app.data.history[googleIndex[i]];
			if (currItem){
				googleTime += currItem.duration;
			}
		}
		
		// Format and return statement
		var str = app.statements['googleOrFacebook'];
		
		if (facebookTime > googleTime) {
			if (googleTime == 0) {
				return [
                    str.format('Facebook', 'Google', 'infinite'),
                    "pie.png"
                ];
			}
			var percent = dataProc.round((facebookTime - googleTime)/googleTime*100, 0);
			
            return [
                str.format('Facebook', 'Google', percent),
                "pie.png"
            ];
		}
		else {
			if (facebookTime == 0) {
				return [
                    str.format('Google', 'Facebook', 'infinite'),
                    "pie.png"
                ];
			}
			var percent = dataProc.round((googleTime - facebookTime)/facebookTime*100, 0);
			
            return [
                str.format('Google', 'Facebook', percent),
                "pie.png"
            ];
		}
		
	};

    /**
    * Finds the most visited/most time visited website and
    * returns the ambiguous fact for that website. 
    *
    * @return The statement string for the most visited 
    *   ambiguous fact
    */ 
    var ambiWebTime = function ambiWebTime(){
        var duration = 0;
        var topDomain = "";
        var siteIndex = {};
        
        // For each item in the history list
        for( var i = 0, l = app.data.history.length; i < l; i++ ){
            var item = app.data.history[i];
            var domain = item.baseURL;

            if(!siteIndex[domain]){
                siteIndex[domain] = 0;
            }
            // Increment the amount of time spent on the website
            siteIndex[domain] += item.duration;

            // If it's greater than the previous high point
            if(siteIndex[domain] > duration){
                // Set this as the top website
                duration = siteIndex[domain];
                topDomain = domain;
            }
        }

        duration = duration / 3600000;
        duration = dataProc.round(duration, 2);

        if(!dataProc.isNumeric(duration)){
            throw new dataProc.NumericException();
        }

        return [
            app.statements['ambiWebTime'].format(app.data.indices[topDomain].length, duration),
            "pie.png"
        ]
    };

    /**
    * Finds the number of .com sites visited versus the
    * number of .edu sites visited and compares the two
    * of them. 
    *
    * @return The .com versus .edu statement that compares
    *   the usage between the two. 
    */
    var comVersusEdu = function comVersusEdu(){
        var hist = app.data.history;
        var com = 0, 
            edu = 0;

        for( var i = 0, l = hist.length; i < l; i++){
            if(hist[i].baseURL.endsWith(".edu")){
                edu += 1;
            
            }else if(hist[i].baseURL.endsWith(".com")){
                com += 1; 
            }
        }

        var comparison = (edu > (com * 0.15)) ? "must be" : "must not be";



        return [
            app.statements['comVersusEdu'].format(edu, com, comparison),
            "pie.png"
        ];

    };

    /**
    * Finds the most frequent types of images viewed by the user
    * out of pdfs, pngs, and jpgs. Sorts them by descending size
    * and returns the statment comparing the usage of types
    */
    var findFavImgType = function findFavImgType(){
        var png = 0,
            jpg = 0,
            pdf = 0;

        var imgs = [
            0, //png 
            0, //jpg
            0  //pdf
        ];

        for( var i = 0, l = app.data.history.length; i < l; i++){
            var url = app.data.history[i].url;

            if(url.endsWith('.png')){
                png += 1;
                imgs[0] += 1;
            }else if(url.endsWith('.jpg')){
                jpg += 1;
                imgs[1] += 1;
            }else if(url.endsWith('.pdf')){
                pdf += 1;
                imgs[2] += 1;
            }
        }
       
        imgs = imgs.sort(function numOrdA(a, b){ return (b-a); });

        var imgOrder = [];
        for(var i = 0; i < 3; i++){
            
            switch(imgs[i]){
                case png:
                    imgOrder.push('.png');
                    break;
                case jpg:
                    imgOrder.push('.jpg');
                    break;
                case pdf:
                    imgOrder.push('.pdf');
                    break;
            }
        }

        return [
            app.statements['findFavImgType'].format(
                imgOrder[0], imgOrder[1], imgOrder[2]
            ),
            "pie.png"
        ];
    };

    /**
    * Finds the longest single strech on one specific website
    * visit (unique URL) and converts the length of time into
    * hours and minutes and returns the formatted statement
    */
    var websiteMarathon = function(){
        var maxDuration = 0;

        for(var i = 0, l = app.data.history.length; i < l; i++){
            currDuration = app.data.history[i].duration;
            if(currDuration > maxDuration){
                maxDuration = currDuration;
            }
        }

        var numMins = maxDuration / 60000;
        
        var hours = dataProc.round(numMins/60, 0);
        var minutes = dataProc.round(numMins%60, 2);

        if( ! dataProc.isNumeric(hours) || ! dataProc.isNumeric(minutes)){
            throw new dataproc.NumericException();
        }

        return [
            app.statements['websiteMarathon'].format(hours, minutes),
            "boxBlueBang.png"
        ];
    };
	
	var mostTabDayOfWeek = function(){
		
		// Find number of entries for each day of week
		var weekList = new Array(0, 0, 0, 0, 0, 0, 0);
		for (var i = 0; i < app.data.history.length; i++) {
			var currItem = app.data.history[i];
			if (currItem){
				var startDate = new Date(currItem.startTime);
				weekList[startDate.getDay()] += 1;
			}
		}
		
		// Find the day of week with most entries
		var maxIndex = 0;
		var maxNum = 0;
		for (var i = 0; i < weekList.length; i++) {
			if (weekList[i] > maxNum) {
				maxIndex = i;
				maxNum = weekList[i];
			}
		}
		
        var dayNum = dataProc.getDayOfWeek(maxIndex);
        if( !dataProc.isNumeric(dayNum) ){
            throw new dataProc.NumericException();
        }
		// Format and return statement
		var str = app.statements['mostTabDayOfWeek'];
		return [
                str.format(dayNum),
                "BarTWO.png"
            ];
		
	};
	
	var mostTimeDayOfWeek = function(){
		
		// Find number of entries for each day of week
		var weekList = new Array(0, 0, 0, 0, 0, 0, 0);
		for (var i = 0; i < app.data.history.length; i++) {
			var currItem = app.data.history[i];
			if (currItem){
				var startDate = new Date(currItem.startTime);
				weekList[startDate.getDay()] += currItem.duration;
			}
		}
		
		// Find the day of week with most entries
		var maxIndex = 0;
		var maxTime = 0;
		for (var i = 0; i < weekList.length; i++) {
			if (weekList[i] > maxTime) {
				maxIndex = i;
				maxTime = weekList[i];
			}
		}
		


		// Format and return statement
		var str = app.statements['mostTimeDayOfWeek'];
		return [
                str.format(dataProc.getDayOfWeek(maxIndex)),
                "BarTWO.png"
            ];
		
	};
	
	var overallTimeNum = function(){
		
		// Find first date, total time, and total number of sites
		var totalInterval;
		var websites = new Object();
		var websiteCout = 0;
		var durationList = new Array();
		for (var i = 0; i < app.data.history.length; i++) {
			var currItem = app.data.history[i];
			if (currItem){
				if (i == 0) {
					totalInterval = Date.now() - currItem.startTime;
				}
				
				// Add duration to the list and combine overlapped durations
				var combined = false;
				for (var j = 0; j < durationList.length; j++) {
					var endTime = durationList[j].startTime + durationList[j].duration;
					if (currItem.startTime >= durationList[j].startTime && currItem.startTime <= endTime) {
						durationList[j].duration = currItem.startTime + currItem.duration - durationList[j].startTime;
						endTime = durationList[j].startTime + durationList[j].duration;
						if (j+1 < durationList.length) {
							if (durationList[j+1].startTime <= endTime) {
								durationList[j].duration = durationList[j+1].startTime + durationList[j+1].duration - durationList[j].startTime;
								durationList.splice(j+1, 1);
							}
						}
						combined = true;
						break;
					}
				}
				if (!combined) {
					var newEntry = new Object();
					newEntry.startTime = currItem.startTime;
					newEntry.duration = currItem.duration;
					durationList.push(newEntry);
				}
				
				if (!websites[currItem.baseURL]) {
					websites[currItem.baseURL] = true;
					websiteCout++;
				}
			}
		}
		
		// Sum up durations in the list
		var totalTime = 0;
		for (var i = 0; i < durationList.length; i++) {
			totalTime += durationList[i].duration;
		}
		
        var timeData = [
            dataProc.round(totalInterval/86400000, 2),
            dataProc.round(totalTime/3600000, 2),
            websiteCout
        ];

        for(var i = 0; i < 3; i++){
            if(!dataProc.isNumeric(timeData[i])){
                throw new dataProc.NumericException();
            }
        }

		// Format and return statement
		var str = app.statements['overallTimeNum'];
		return [
                str.format(timeData[0], timeData[1], timeData[2]),
                "BarTWO.png"
            ];
		
	};


    var topWebsites = function(){
        var indices = app.data.indices;
        var totalTime = 0;
        var keys = [];
        var sorted = [];        

        for (var k in indices)keys.push(k);

        for( var i = 0, l = keys.length; i < l; i++ ){
            var time = dataProc.fetchTime(app.data.history, indices[keys[i]]);
            totalTime += time;
            sorted.push([keys[i], time])

        }

        sorted.sort(function(a, b) {return b[1] - a[1]})

        var randNum = dataProc.randArrayElemSub(
            Math.round(sorted.length - (sorted.length * 0.3)),
            sorted.length - 1 
        );
        
        var retElem = [
            sorted[0],
            sorted[2],
            dataProc.randArrayElem(sorted)
        ];
        
        var pct = (retElem[0][1] + retElem[1][1] + retElem[2][1]) / totalTime;

        console.log(pct);

        var str = app.statements["topWebsites"]
            .format(retElem[0][0], retElem[1][0], retElem[2][0], dataProc.round(pct*100, 2) );

        return [
            str,
            "pie.png"
        ];
    };
	
    return {
        getTime     : getTime,
        fetchTotalWebVisits : fetchTotalWebVisits,
        buildVisitComp      : buildVisitComp,
        buildWebTime        : buildWebTime,
        fetchYoutube        : fetchYoutube,
        googEnergy          : googEnergy, 
        findMinTime         : findMinTime,
		fetchFacebook       : fetchFacebook,

		fetchFacebookMostFrequentPage:fetchFacebookMostFrequentPage,
		
        googleOrFacebook    : googleOrFacebook,
        ambiWebTime         : ambiWebTime,
        comVersusEdu        : comVersusEdu,
        findFavImgType      : findFavImgType,
        websiteMarathon     : websiteMarathon,
		
		mostTabDayOfWeek	: mostTabDayOfWeek,
		mostTimeDayOfWeek	: mostTimeDayOfWeek,
		overallTimeNum		: overallTimeNum,
        topWebsites         : topWebsites
    }
})();