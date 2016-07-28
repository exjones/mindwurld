var WurldSettings = {
    
    antialias: function(){
        
        var rc = (WURLD_SETTINGS && WURLD_SETTINGS.antialias == 'true')?true:false;
        
        // Never use anti-aliasing on Linux, or UNIX
        if(rc && (navigator.appVersion.indexOf("X11") != -1 || navigator.appVersion.indexOf("Linux") != -1)){
            W_log('Sorry, anti-aliasing isn\'t supported on Linux/UNIX. The fill-rate on my dev machine\'s GPU just isn\'t good enough!');
            rc = false;    
        } 
        
        return rc;
    },
    
    music: function(){
        return (WURLD_SETTINGS && WURLD_SETTINGS.music == 'on')?true:false;
    },
    
    last_location: function(){
        if(WURLD_SETTINGS && WURLD_SETTINGS.last_location){
            return new THREE.Vector3(WURLD_SETTINGS.last_location.x,WURLD_SETTINGS.last_location.y,WURLD_SETTINGS.last_location.z);
        }
        else{
            return new THREE.Vector3(0,0,0);
        }
    },
    
    last_rotation: function(){
        if(WURLD_SETTINGS && WURLD_SETTINGS.last_rotation){
            return WURLD_SETTINGS.last_rotation;
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
