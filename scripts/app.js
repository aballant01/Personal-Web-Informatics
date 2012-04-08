

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
    
    
    /**
    * Adds the selected informatcs to the page to be displayed.
    * Right now it doesn't do any type of intelligent informatic
    * selection, it just does a few that I had the time/ability
    * to code up. 
    */
    var addInformatics = function(){
        
        var $timeElem = history.buildWebTime();
        addBodyElem($timeElem,"wide");

        var $visitCompElem = history.buildVisitComp("www.google.com");
        addBodyElem($visitCompElem, "thin");

        var $numWebVisits = history.fetchTotalWebVisits();
        addBodyElem($numWebVisits);

        var $youTime = history.fetchYoutube('time');
        addBodyElem(
            statements.youtubeVideos.format(dataProc.round($youTime / 3600000, 2)), "thin"
        );

        var bcount = bookmarks.getCount('count');
        addBodyElem(statements.rawBookmarks.format(bcount), "wide");

        var googEnergy = history.googEnergy();
        addBodyElem(statements['googEnergyDev'].format(googEnergy));
        
    };
    
    var addBodyElem = function(statementText, width){
        var classWidth = width || "full"

        $container.append(
            $infoItem.clone().append(
                $infoP.clone().text(statementText)
            ).addClass(
                classWidth + 
                " " + 
                dataProc.randArrayElem(themes.split(" "))
            )
        )
    }
    
    /*
    var addElems = function(elements){
        var len = elements.length;

        if(%)

        $div = $("<div></div>");
        for(var i = 0; i < len; i++){
            if(i % ) 

            $div.append(
                $infoItem.clone().append(
                    $infoP.clone().text(elements[i]);
                ).addClass(

                )
            )
        }

    }*/

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