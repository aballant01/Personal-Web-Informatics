

/**
* Format function that replaces {d} tags in a string with
* supplied arguments
* 
* Example:
* "{0} is dead, but {1} is alive! {0} {2}".format("ASP", "ASP.NET");
* "ASP is dead, but ASP.NET is alive! ASP {2}"
* 
* Thanks to fearphage on stackoverflow here:
* http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format/
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

String.prototype.startsWith = function(str){
    return this.substring(0,str.length) === str;
};

String.prototype.endsWith = function(str){
    return this.substring(this.length - str.length) === str;
};

var app = (function(){

    var data = JSON.parse(localStorage['web_informatics_data']);

    var base_url_patt = '/^http[s]?:\/\/([a-zA-Z\.-]+)/';

    var themes = "theme1 theme2 theme3 theme4 theme5 theme6 theme7 theme8 theme9 theme10";

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
        "apollo11Length"    : "In the time you've spent on {0}, Apollo 11 would have " + 
            "gone to the moon and back {1} times!",
        
        "num 1994 web"      : "You've visited more websites in the past {0} than existed in 1994",
        
        // As a developing alernative to the above:
        "num1994WebDev"     : "The number of websites you've visited is {0} times " + 
            "the number that existed in 1994",
        //"youtubeVideos"   : "In the time you've spent watching videos on youtube, you 
        //  could have watched {0} best picture winning movies",
        "youtubeVideos"     : "you have spent {0} hours watching youtube",
        
        "siteVisitCountComp" : "You've visited {0} {1} times {2} compared with {3}",
        "googleSearchEnergy" : "In the energy you've used in google searches",
        
        "rawBookmarks"      :"You have clicked on {0} of your bookmarks since the beginning " + 
            "of time (since you installed this)",
        
        "googEnergyDev"     :"You have used {0} kWh of energy in Google searches alone", 
        
        "minTime"           : "Do you remember {0}? Probably not, you were only there for {1} seconds" ,
		
		"facebook"			: "Time to fess up your facebook-time: {0} visits and {1} hours of facebook prowling since {2}.",
		
		"facebookPages"		: "Out of all the times you\'ve been on facebook, you are most likely to be on {0}.",
		
		"googleOrFacebook"	: "Google or facebook? {0} of course! Your time on {0} is {2}% greater than your time on {1}.",

        "ambiWebTime"       : "Did you know there's a site you've visited {0} times for {1} hours?",

        "comVersusEdu"      : "Ratio of .edu to .com? {0} to {1}. You {2} a scholar",

        "findFavImgType"    : "You are more likely to open a {0} than to a {1}, and more likely to open a " +
            "{1} than a {2}. Interesting.",

        "websiteMarathon"   : "Marathon challenge: you've been on one website for a record of " + 
            "{0} hours and {1} minutes. Can you beat it?",
			
		"mostTabDayOfWeek"	: "You open the most tabs on {0}.",
		
		"mostTimeDayOfWeek"	: "Lonely {0}s? You spend the most time online on {0}.",
		
		"overallTimeNum"	: "Did you know that we've been recording your activity for {0} days. " +
			"In that time, we've seen you online for {1} hours, and recorded more than {2} sites you've visited.",

        "topWebsites"       : "{0}, {1}, and {2} make up {3}% of your web browsing activity"
    };

    var $container = $('#container');
    var $infoItem = $("<div class = 'info_item'></div>");
    var $infoP = $("<p class='float_right'></p>");
    
    
    /**
    * Adds the selected informatcs to the page to be displayed.
    * Right now it doesn't do any type of intelligent informatic
    * selection, it just does a few that I had the time/ability
    * to code up. 
    */
    var addInformatics = function(){

        var appFunctions = buildFunctionList();

        for(var i = 0, l = appFunctions.length; i < l; i++){
            try{
                var elem = appFunctions[i]();
                addBodyElem(elem);
            }catch(e){
                console.error(e);
                console.log(appFunctions[i]);
                continue;
            }
        }

    };
    
    /**
    * 
    */
    var buildFunctionList = function(){
        var appFunctions =[
            history.buildWebTime,
            
            function(){
                return history.buildVisitComp("www.google.com");
            },

            history.fetchTotalWebVisits,
            
            function(){
                return history.fetchYoutube('time');
            },
            
            function(){
                return bookmarks.getCount('count');
            },
            
            history.googEnergy, 

            history.findMinTime,
			
			history.fetchFacebook,
			
			history.fetchFacebookMostFrequentPage,
			
			history.googleOrFacebook, 

            history.ambiWebTime,

            history.comVersusEdu,

            history.findFavImgType,

            history.websiteMarathon,
			
			history.mostTabDayOfWeek,
			
			history.mostTimeDayOfWeek,
			
			history.overallTimeNum,

            history.topWebsites
        ];

        return appFunctions;
    };

    /**
    * Adds a new InfoItem element to the container element.
    * The text of the element is going to be the statmentText
    * passed to it. 
    *
    * @param {statmentText} The prompt to be displayed in in
    *   the newly created element
    * @param {width} The class to define the width of the
    *   added element. Can be 'thin', 'wide', or 'full' 
    */
    var addBodyElem = function(statement){
        statementText = statement[0];
        statementImg = statement[1];
        $img = $("<img class = 'float_left' src = '' alt = 'Personal Web Informatics' />");

        $container.append(
            $infoItem.clone()
                .append(
                    $img.clone().attr('src', "assets/" + statementImg)  
                )
                .append(
                    $infoP.clone().text(statementText)
                )
        )
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