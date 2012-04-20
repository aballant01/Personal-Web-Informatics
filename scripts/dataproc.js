/**
* This module is for general data processing/formatting
* functions that might not make sense to put into a 
* specific module elsewhere - 
*/
var dataProc = (function(){

    /**
    * Generates the total duration of a supplied array filled
    * with history objects. Can generate the duration of an
    * entire array or can take an index array (i.e. an array
    * that contains the relevant locations in the other array)
    * and generate the duration for those items.
    *
    * @param {arr} The HistItem array to generate duration from
    * @param {index} (optional) The index array to get the desired
    *   HistItem objects from arr. 
    * 
    * @return The duration for the selected array or index array 
    */
    var fetchTime = function(arr, index){
        var dur = 0;
        var set = typeof index !== 'undefined';

        var len = (set) ? index.length : arr.length;

        for(var i = 0; i < len; i++){
            dur += (set) ? arr[index[i]].duration : arr[i].duration;
        }

        return dur; 
    };

    /**
    * Rounds a number to a given number of decimal
    * places. 
    *
    * @param {val} The number to be rounded
    * @param {dec} The number of decimal places to round to
    *
    * @return The rounded number
    */
    var round = function(val, dec){
        var fact = Math.pow(10, dec);

        return Math.round(val*fact)/fact;
    };


    /**
    * Returns a random int between min and max
    */ 
    var getRandomInt = function(min, max) {  
        return Math.floor(Math.random() * (max - min + 1)) + min;  
    };

    /**
    * Selects a random element from an array
    * 
    * @param {arr} The array to select an element from
    * 
    * @return The selected array element
    */
    var randArrayElem = function(arr){
        return arr[0, getRandomInt(0,arr.length-1)];
    };

    /**
    * Takes a complete url path and returns the core domain
    * path, AKA the base URL. For example, the URL
    * http://www.foo.com/bar?test=true would return www.foo.com
    *
    * @param {url} The complete url string
    * @returns The base URL component of the full URL
    */
    var getBaseURL = function( url ){
        var path = url.split("/");
        if(path.length > 1){
            return path[2];
        }else{
            return path[0];
        };   
    };
	
	/**
	* Conert int into day of week
	*
	*@param { num } the integer that represnts day of week
	*@return the string version of day of week
	*/
	var getDayOfWeek = function ( num ) {
		var weekday = new Array(7);
		weekday[0] = "Sunday";
		weekday[1] = "Monday";
		weekday[2] = "Tuesday";
		weekday[3] = "Wednesday";
		weekday[4] = "Thursday";
		weekday[5] = "Friday";
		weekday[6] = "Saturday";
		return weekday[num];
	};
	
	
	
    return{
        fetchTime : fetchTime,
        round : round,
        getRandomInt : getRandomInt,
        randArrayElem : randArrayElem,
        getBaseURL : getBaseURL,
		getDayOfWeek : getDayOfWeek
    }
})();