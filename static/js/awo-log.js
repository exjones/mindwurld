var W_debug = false;
var W_log = function(){
    if(W_debug){
        for(var a = 0;a < arguments.length;a++){
            console.log(arguments[a]);    
        }
    }
}
