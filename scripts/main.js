(function(){ 
    /**
    * This file combines the various scripts into one file 
    * without needing to change much about the original 
    * index.html file. If you create a new file, then you
    * just need to add it to the modules string that's being
    * passed as the first perameter, and without the .js 
    * extension. Make sure there's a space in front of it 
    * too. 
    *
    * 
    */

    var modules = "app dataproc history bookmarks";
    
    // Load the selected module
    require(modules.split(" "), function(){
            // When loaded, run the initialize function. 
            initialize();
        }
    );

    var initialize = function(){
        bookmarks.build();
        app.addInformatics();
    };
})();