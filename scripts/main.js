var app = (function(){
    var data = {
        'Default':'Testing'
    };

    if(localStorage['web_informatics_data']){
        data = JSON.parse(localStorage['web_informatics_data']);
    }

    return {
        data:data
    }
})();


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

window.onload = function(){
    buildHistory();
};