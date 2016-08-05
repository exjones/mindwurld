var W_debug = WURLD_SETTINGS.debug;
var W_log = function(){
    if(W_debug){
        for(var a = 0;a < arguments.length;a++){
            console.log(arguments[a]);
        }
    }
}
var W_warn = function(w){
  console.warn(w);
}
