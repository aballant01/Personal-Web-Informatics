var app = (function(){
    if(localStorage['web_informatics_data']){
        data = JSON.parse(localStorage['web_informatics_data']);
    }else{
        data = {};
        data['history'] = {};
        data['bookmarks'] = {}
    }

    base_urls = [
        "facebook.com",
        "www.google.com/search",
        "mail.google.com",
        "reddit.com",
        "plus.google.com"
    ];

    var storeData = function(){
        localStorage['web_informatics_data'] = JSON.stringify(data);
    };

    return {
        data      : data,
        storeData : storeData,  
        urls      : base_urls
    }

})();

var bookmark = (function(){
    
    chrome.bookmarks.onCreated.addListener(function(id, bookmark){
        console.log(id);
        console.log(bookmark);
    });


})();

var tab = (function(){
    chrome.tabs.onCreated.addListener(function(tab){
        console.log(tab);
    });

    chrome.tabs.onCreated.addListener(function(tab){
        console.log(tab)
    });

    chrome.tabs.onRemoved.addListener(function(tab, removeInfo){
        // For this, we will need to retrieve the tab data from the id
        // passed in the "tab" parameter
        console.log(tab);
        console.log(removeInfo);
    });

})();


// Database

function initDatabase() {
	try {
	    if (!window.openDatabase) {
	        alert('Local databases are not supported by your browser. ');
	    } else {
	        var shortName = 'web_informatics_data';
	        var version = '1.0';
	        var displayName = 'Web Informatics Data';
	        var maxSize = 100000; // in bytes
	        DB = openDatabase(shortName, version, displayName, maxSize);
			createTables();
	    }
	} catch(e) {
	    if (e == 2) {
	        // Version mismatch.
	        console.log("Invalid database version.");
	    } else {
	        console.log("Unknown error "+ e +".");
	    }
	    return;
	} 
}

function createTables(){
	DB.transaction(
        function (transaction) {
        	transaction.executeSql('CREATE TABLE IF NOT EXISTS history(date TEXT NOT NULL PRIMARY KEY, url TEXT NOT NULL);', [], nullDataHandler, errorHandler);
        }
    );
}

function nullDataHandler(){
	console.log("SQL Query Succeeded");
}

function errorHandler(transaction, error){
 	if (error.code==1){
 		// DB Table already exists
 	} else {
    	// Error is a human-readable string.
	    console.log('Oops.  Error was '+error.message+' (Code '+error.code+')');
 	}
    return false;
}

function selectAll(){ 
	DB.transaction(
	    function (transaction) {
	        transaction.executeSql("SELECT * FROM history;", [], dataSelectHandler, errorHandler);
	    }
	);	
}

function dataSelectHandler(transaction, results){
    for (var i = 0; i < results.rows.length; i++) {
    	var row = results.rows.item(i);
        var item = new Object();
    	item.date   = row['date'];
        item.url = row['url'];
        console.log(item);
    }
}

function insert(date, url){
	DB.transaction(
	    function (transaction) {
		transaction.executeSql("INSERT INTO history(date, url) VALUES (?, ?)", [date, url]);
	    }
	);	
}

initDatabase();
insert(new Date(), 'http://www.example.com');
selectAll();