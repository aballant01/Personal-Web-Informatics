
var drive = (function(){

    var func = {
        "write"  : function(fs){
            fs.root.getFile('appData.txt',{create:true}, writeData, errorHandler);
        },
        "read"   : function(fs){
            fs.root.getFile('appData.txt', {}, readData, errorHandler)
        },
        "delete" : function(fs){
            fs.root.getFile('appData.txt', {create: false}, rmFile, errorHandler)
        }
    };

    var init = function(mode, data){

        mode = mode || "write";
        data = data || app.data;

        window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

        window.requestFileSystem( 
            webkitStorageInfo.PERSISTENT, 
            20 * 1024 * 1024,
            function(fs){
                func[mode](fs, data);
            }, 
            errorHandler
        );

    };


    var writeData = function(fileEntry, data){

        var data = data || app.data;
        console.log('FileEntry',fileEntry);

        fileEntry.createWriter(function(fileWriter){

            fileWriter.seek(fileWriter.length);

            var bb = new WebKitBlobBuilder();


            fileWriter.onwriteend = function(e) {
                console.log('Write completed.');
                //readData(fileEntry);
            };

            fileWriter.onerror = function(e) {
                console.log('Write failed: ' + e.toString());
            };

            
            bb.append(JSON.stringify(data));
            
            fileWriter.write(bb.getBlob('text/plain'));
        }, errorHandler);
    };


    var readData = function(fileEntry){
        var appData = "";
        // Get a File object representing the file,
        // then use FileReader to read its contents.
        fileEntry.file(function(file) {
            var reader = new FileReader();

            reader.onloadend = function(e) {
                app.mergeData(this.result);
            };

            reader.readAsText(file);

        }, errorHandler);

    };

    var rmFile = function(fileEntry){

        fileEntry.remove(function() {
            console.log('File removed.');
            init('write');
        }, errorHandler);

    };

    var errorHandler = function (e) {
        var msg = '';

        switch (e.code) {
            case FileError.QUOTA_EXCEEDED_ERR:
                msg = 'QUOTA_EXCEEDED_ERR';
                break;
            case FileError.NOT_FOUND_ERR:
                msg = 'NOT_FOUND_ERR';
                break;
            case FileError.SECURITY_ERR:
                msg = 'SECURITY_ERR';
                break;
            case FileError.INVALID_MODIFICATION_ERR:
                msg = 'INVALID_MODIFICATION_ERR';
                break;
            case FileError.INVALID_STATE_ERR:
                msg = 'INVALID_STATE_ERR';
                break;
            default:
                msg = 'Unknown Error';
                break;
        };

        console.log('Error: ' + msg);
    };


    return{
        init : init

    }

})();