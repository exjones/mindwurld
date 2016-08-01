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
        if(WURLD_SETTINGS && WURLD_SETTINGS.skin_name){
            return WURLD_SETTINGS.skin_name;
        }
        else return null;
	},

	user_name : function(){
        if(WURLD_SETTINGS && WURLD_SETTINGS.user_name){
            return WURLD_SETTINGS.user_name;
        }
        else return 'Anonymous Coward';
	}
};
