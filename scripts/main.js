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

    So there are a few reasons why I organize the javascript in the 
    way that I am. There are some technical reasons, which generally
    stem from wanting to limit the number of global variables and
    functions, as well as organizational, in that I want classes of
    methods and objects to be together rather than have everything in
    one global family. 
    
    Functions
    ---------
    To that effect, declaring functions like this:

    function functionName(){}

    makes that function a global function - it can be declared from
    anywhere just by going functionName(). Declaring them as I do, like:
    
    var functionName = function(){}

    instead makes the function local to the scope that it is declared in. 
    This way, I can have my functions encapsulated within their respective
    modules, without the ability of everything to perhaps use or misuse
    the function if I wasn't careful about how I was naming things. 

    Modules
    ---------
    The way I organize things is by using the "Module Pattern". The
    general benefit to using modules is that you can create a mix of
    public and private functions and variables, and then you can have
    related sets of functionality grouped together. Modules are declared
    like this:
    ----------------
    var moduleName = (function(){ 
        Method and variable definitions here...
        
        var myPrivateVar = 42;

        var myPublicMethod = function(){
        
        };

        var myPrivateMethod = function(){
    
        }    
        
        return{
            myPublicMethod : myPublicMethod
        }
    })();
    ----------------

    In the above example, you would be able to call the myPublicMethod
    by calling moduleName.myPublicMethod, but outside of the module 
    you would not be able to access myPrivateMethod. To be able to
    access myPrivateMethod, you would have to add it to the return
    statement, so the return statement would look like this:

    return{
        myPublicMethod : myPublicMethod,
        myPrivateMethod: myPrivateMethod
    }

    Now I would be able to call moduleName.myPrivateMethod() and
    encounter no issues. 

    Require
    --------
    So I've split this up into several files, each one representing
    one module - if we need more modules, feel free to add it to the
    string below and create the file for it. 
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