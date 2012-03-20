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
    chrome.history.getVisits({url:"http://www.facebook.com"}, function(visItems){
        console.log(visItems);
    });
};

window.onload = function(){
    buildHistory();
};