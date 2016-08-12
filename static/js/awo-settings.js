var WurldSettings = {

    antialias: function(){

        var rc = (WURLD_SETTINGS && WURLD_SETTINGS.antialias)?true:false;
        return rc;
    },

    music: function(){
        return (WURLD_SETTINGS && WURLD_SETTINGS.music == 'on')?true:false;
    },

    start_location: function(){
        if(WURLD_SETTINGS && WURLD_SETTINGS.start_location){
            return new THREE.Vector3(WURLD_SETTINGS.start_location.x,WURLD_SETTINGS.start_location.y,WURLD_SETTINGS.start_location.z);
        }
        else{
            return new THREE.Vector3(0,0,0);
        }
    },

    start_rotation: function(){
        if(WURLD_SETTINGS && WURLD_SETTINGS.start_rotation){
            return WURLD_SETTINGS.start_rotation;
        }
        else return 0;
    },

	skin_name : function(){

    if(WURLD_SETTINGS.skin_name == 'RANDOM'){
      WURLD_SETTINGS.skin_name = WURLD_SKINS[Math.floor(Math.random()*WURLD_SKINS.length)];
    }
    return WURLD_SETTINGS.skin_name || WURLD_SKINS[0];
	},

  message: function(key){

    var msg = WURLD_SETTINGS.messages[key] || key;
    for(var a = 1;a < arguments.length;a++){
      var reg = '{'+(a-1)+'}';
      msg = msg.replace(reg,arguments[a]);
    }
    return msg;
  }
};
