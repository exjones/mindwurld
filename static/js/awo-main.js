
W_log('Loading Apex Wurld Open main JavaScript routines...');

var WURLD = {

    fake_osn: false,
    
    connected: true,
    ping_freq: 0.5,
    ping_time: 0,
    
    scene: null,
    camera: null,
    renderer: null,
    light: null,
    sun: null,
    ambient: null,
    clock: null,
    listener: null,
    pointer: null,
    entity_factory: null,
    sound: null,
    
    light_position: new THREE.Vector3(-120, -10, 170),
    camera_position: new THREE.Vector3(20,-40,30),
    camera_offset: new THREE.Vector3(0,20,16),
    controls: null,
    shift_down: false,
    look_at: new THREE.Vector3(0,0,0),
    player_height: new THREE.Vector3(0,0,7),
    animator: null,
    
    stats: null,
    
    current_map: null,
    center_pos: null,
    chunk_cache: {},
    cache_size: 3,
    
    move_to_pointer: false,
    models: {},
    player_avatar: null,
    turn_speed: 10,
    player_speed: 10,
    camera_speed: 15,
    player_rotation: 0,
    who_am_i: '',
    min_chest_dist: 10,
    chests: {},
    osn_open: false,
    pre_fish_skin: null,
    
    other_people: {},
    
    last_update: 0,

    init: function(){
        
        // Instantly hide the console
        $('.w-console-container').css({bottom:($(window).height() * -0.4) - 10});
        
        // Save the current session, before we unload the page
        $( window ).unload(function() {
            WURLD.comet_post({op:'save_current_session'});
        });

        // Listen for keys
        WURLD.listener = new window.keypress.Listener();
        
        // Very very very basic animation
        WURLD.animator = new WurldAnimate();
        
		// We're going to use 2D physics in the ground-plane for collision detection and response
		WURLD.physics = new WurldPhysics();
		
        // Send in the logos!
        $('.w-logo-banner').animate({bottom: "50%"}, 1000,"easeOutBounce");
        $('.w-start-container').animate({top: "55%"}, 1000,"easeOutBounce");

        // Set up the Three.js scene
        WURLD.scene = new THREE.Scene();
        WURLD.scene.fog = new THREE.Fog(WurldColors.GhostWhite,30,600);
        
        // Set up the renderer
        WURLD.renderer = new THREE.WebGLRenderer({antialias:WurldSettings.antialias()});
        WURLD.renderer.setSize( $(window).width(), $(window).height() );
        WURLD.renderer.shadowMapEnabled = true;
        WURLD.renderer.setClearColor(WurldColors.SkyBlue);
        $('.w-main-content').append( WURLD.renderer.domElement );

        // Adjust the Three.js stuff when the window resizes
        $(window).resize(function(){
            
            var w = $(window).width();
            var h = $(window).height();
            
            WURLD.renderer.setSize( w, h );
        	
        	WURLD.camera.aspect	= w / h;
        	WURLD.camera.updateProjectionMatrix();
        	
        	// Move the console, if it's currently offscreen
        	var pos = parseInt($('.w-console-container').css('bottom').replace(/px/,''));
        	if(pos < 0){
        	    $('.w-console-container').css({bottom:(h * -0.4) - 10});
        	}
        });
        
        // A clock for timing deltas for animation
        WURLD.clock = new THREE.Clock;

        // The camera
        WURLD.camera = new THREE.PerspectiveCamera( 45, $(window).width() / $(window).height(), 1, 3000 );
        WURLD.camera.position.copy(WURLD.camera_position);
        WURLD.camera.up.set( 0, 0, 1 );
        WURLD.camera.lookAt(WURLD.look_at);
        
        // Plus our custom version of orbit controls
        WURLD.controls = null;

        // Lighting
        WURLD.ambient = new THREE.AmbientLight( WurldColors.SoftWhiteLight );
        WURLD.scene.add(WURLD.ambient);
        
        WURLD.sun = new THREE.DirectionalLight( WurldColors.White, 1.0 );
        WURLD.sun.position.copy(WURLD.light_position);
        WURLD.scene.add(WURLD.sun);

        WURLD.light = new THREE.SpotLight( WurldColors.White, 1.0 );
        
        // WURLD.light.shadowCameraVisible = true;
        WURLD.light.castShadow = true;
        WURLD.light.shadowMapWidth = 4096; // 2048; // 1024;
        WURLD.light.shadowMapHeight = 4096; // 2048; // 1024;
        WURLD.light.shadowCameraFar = 300;
        WURLD.light.shadowCameraNear = 100;
        WURLD.light.shadowCameraLeft = -50;
        WURLD.light.shadowCameraRight = 50;
        WURLD.light.shadowCameraTop = 50;
        WURLD.light.shadowCameraBottom = -50;
        WURLD.light.onlyShadow = true;
        
        WURLD.light.position.addVectors(WURLD.camera.position,WURLD.light_position);
                
        WURLD.scene.add(WURLD.light);

        // Other objects we need
        WURLD.entity_factory = new WurldEntityFactory();
        WURLD.sound = new WurldSound();
        
        WURLD.create_pointer();
        WURLD.init_stats();
        
        // Startup and load the initial map and settings
        if(WurldSettings.music()) WURLD.sound.startMusic();
        
        $.when(
            WURLD.load_player(),
            WURLD.load_chest()
        ).done(function(){
            for(var a = 0;a < arguments.length;a++){
                W_log(arguments[a]);
            }
            $.when(
                WURLD.load_wurld()
            ).done(function(){
                for(var a = 0;a < arguments.length;a++){
                    W_log(arguments[a]);
                }
                WURLD.allow_start();
            })
        });
        
        // Start rendering        
        requestAnimationFrame( WURLD.render );
		WURLD.physics.start();
    },

    init_stats: function(){
    
        WURLD.stats = new Stats();
        WURLD.stats.setMode(0); // 0: fps, 1: ms

        // Align the THREE stats top-left
        /*
        $(WURLD.stats.domElement).css({
            position:'fixed',
            left:0,
            top:0,
            zIndex:200
        });
        */
        $('body').append( WURLD.stats.domElement );
        
        // Create a DIV in which to display some debug info; players, position, rotation, etc
        // $('body').append('<div id="w-debug"></div>');
    },
    
    create_pointer: function(){

        var geometry = new THREE.TetrahedronGeometry(1);
     
        var material = new THREE.MeshLambertMaterial( {
            color: 0xff0000 ,
            shading: THREE.FlatShading
        });
        
        geometry.vertices[0].set(0,-1,2);
        geometry.vertices[1].set(0,0,0);
        geometry.vertices[2].set(-0.866,0.5,2);
        geometry.vertices[3].set(0.866,0.5,2);
        
        geometry.computeFaceNormals(); 
        geometry.computeVertexNormals();
            
        WURLD.pointer = new THREE.Mesh( geometry, material );
        WURLD.pointer.position.x = 0;
        WURLD.pointer.position.y = 0;
        WURLD.pointer.position.z = -1000;
        WURLD.pointer.castShadow = true;
        WURLD.scene.add( WURLD.pointer );
        
    },
    
    calc_camera_pos: function(){
        
        var cam_pos = (new THREE.Vector3()).copy(WURLD.camera_offset);
        cam_pos.applyAxisAngle(new THREE.Vector3(0,0,1),WURLD.player_avatar.rotation.y);
        cam_pos.add(WURLD.player_avatar.position);
        
        return cam_pos;    
    },
    
    calc_camera_look: function(){
        return (new THREE.Vector3()).addVectors(WURLD.player_height,WURLD.player_avatar.position);
    },
    
    render: function() {
        var delta = WURLD.clock.getDelta();
        
        if(WURLD.stats) WURLD.stats.begin();
        
        if(WURLD.pointer){
            WURLD.pointer.rotation.z -= delta * 5; 
        }
        
        if(WURLD.player_avatar){
    
            // If the shift key isn't down (e.g. we're orbiting) then move toward the back of the player        
            if(!WURLD.shift_down){
                var cam_pos = WURLD.calc_camera_pos();
                
                var diff = (new THREE.Vector3()).subVectors(cam_pos,WURLD.camera.position);
                if(diff.length() < (WURLD.camera_speed * delta)){
                    WURLD.camera.position.copy(cam_pos);
                }
                else{
                    diff.normalize();
                    WURLD.camera.position.add(diff.multiplyScalar(WURLD.camera_speed * delta));
                }
                
                var new_look = WURLD.calc_camera_look();
                var look_diff = (new THREE.Vector3()).subVectors(new_look,WURLD.look_at);
                
                if(look_diff.length() < (WURLD.camera_speed * delta)){
                    WURLD.look_at.copy(new_look);
                }
                else{
                    look_diff.normalize();
                    WURLD.look_at.add(look_diff.multiplyScalar(WURLD.camera_speed * delta));
                }
                
                WURLD.camera.lookAt(WURLD.look_at);
            }
            
            WURLD.light.position.addVectors(WURLD.camera.position,WURLD.light_position);
            WURLD.light.target.position.subVectors(WURLD.light.position,WURLD.light_position);
            
            WURLD.light.target.updateMatrixWorld();   
        }
        
        if(WURLD.move_to_pointer && WURLD.player_avatar){
            var vec = (new THREE.Vector3()).subVectors(WURLD.pointer.position,WURLD.player_avatar.position);
            vec.setZ(0);
            
            if(vec.length() < WURLD.player_speed * delta){
                WURLD.player_avatar.position.copy(WURLD.pointer.position);
                WURLD.pointer.position.setZ(-1000);
                WURLD.move_to_pointer = false;
            }
            else{
                vec.normalize();
                
                var forward = (new THREE.Vector3(0,-1,0));
                var ang = forward.angleTo(vec);
                
                if(vec.x - forward.x < 0) ang *= -1;
                
                var diff = WURLD.player_rotation - ang; 
                if(diff > 0) {
                    if(diff < WURLD.turn_speed * delta) WURLD.player_rotation = ang;
                    else WURLD.player_rotation -= WURLD.turn_speed * delta;
                }
                else if(diff < 0) {
                    if(-diff < WURLD.turn_speed * delta) WURLD.player_rotation = ang;
                    else WURLD.player_rotation += WURLD.turn_speed * delta;
                }
                
                WURLD.player_avatar.rotation.y = WURLD.player_rotation;
                
                WURLD.player_avatar.position.add(vec.multiplyScalar(WURLD.player_speed * delta));
            }
            
 		    WURLD.player_moved = true;
        }
        
        // Always put the player on the ground!
        WURLD.put_player_on_ground(); 
        
		if(WURLD.player_moved){
            WURLD.animator.updatePerson(WURLD.player_avatar,delta);
            WURLD.sound.startFootsteps();
            
            WURLD.load_necessary_chunks();
			WURLD.player_moved = false;
		}
        else {
            WURLD.animator.resetPerson(WURLD.player_avatar);
            WURLD.sound.stopFootsteps();
        }
		
        $('#w-compass-icon').css('transform','rotate('+(WURLD.player_rotation * (180/Math.PI))+'deg)');

        // Ping our position to the server, even if we haven't updated it, 
        // so we can at least tell the server we're alive, and so we get the positions of everyone else
        // Don't do this while an OSN iframe (chest) is open, it seems to max out the browser connections
    	WURLD.ping_time += delta;
    	if(!WURLD.osn_open){
            if(WURLD.ping_time > WURLD.ping_freq && WURLD.player_avatar){
                WURLD.ping_time -= WURLD.ping_freq;
        	      /*  
                WURLD.comet_post({
        	        op:'position_ping',
        	        last_location:(WURLD.player_avatar?WURLD.player_avatar.position:null),
        	        last_destination:(WURLD.move_to_pointer?WURLD.pointer.position:null),
        	        last_rotation:WURLD.player_avatar.rotation.y
        	    },function(data){
        	        WURLD.handle_other_people(data,delta);
        	    }); 
				*/   
        	}
    	}
    	
        // Update the positions of all the people we know about
        for(var per in WURLD.other_people){
            WURLD.move_other_people(WURLD.other_people[per],delta);    
        }
        
        WURLD.renderer.render(WURLD.scene,WURLD.camera);
	
	    if(WURLD.player_avatar && WURLD.controls && WURLD.shift_down){
	        var target = (new THREE.Vector3(0,0,8)).add(WURLD.player_avatar.position);
	        WURLD.controls.target = target;
	        WURLD.controls.update();
	    }
	    
	    WURLD.keep_camera_above_ground();
	    
        if(WURLD.stats) WURLD.stats.end();
        requestAnimationFrame( WURLD.render );
    },
    
    create_person: function(obj){
    
        var new_player = WURLD.models['person_model'].clone();
        var new_material = WURLD.models['person_model'].children[0].material.clone();
        
        if(obj.skin_name){
            new_material.map = THREE.ImageUtils.loadTexture( 'img/'+obj.skin_name, THREE.UVMapping,function(){
    	        new_material.needsUpdate = true;    
    	    });
        }
                        
        for(var i = 0;i < new_player.children.length;i++){
	        new_player.children[i].material = new_material;    
        }
        
        new_player.rotation.x = Math.PI/2;

        if(obj.user_name){
            WURLD.set_gamer_tag(new_player,'',obj.user_name);
        }
        new_player.position.set(0,0,-1000);
        WURLD.scene.add( new_player );
                        
        return new_player;
    },
    
    set_gamer_tag: function(person,old_name,new_name){
    
        if(old_name != new_name){
            
            W_log('Setting gamer tag for change from "'+old_name+'" to "' + new_name+'".');
            
            // First, remove any children of type Sprite, that'll be the existing gamertag
            for(var i = 0;i < person.children.length;i++){
                if(person.children[i].type == 'Sprite'){
	                W_log('Removing child: ',person.children[i]);
	                person.remove(person.children[i]); // TODO: Not leak memory here!
	                break;
                }
            }
            
            if(new_name){
                var name = new_name.toLowerCase().replace(/@oracle.com/,'');
                
                var spritey = WURLD.make_text_sprite(name);
    	        spritey.position.set(0,9,0);
    	        person.add( spritey );

                /*
                if(WURLD.stats){
                    $('#'+WURLD.to_id(old_name)).remove();
                    var new_id = WURLD.to_id(new_name);
                    $('#'+new_id).remove();
                    $('#w-debug').append(
                        '<div id="'+new_id+'">'+
                        'name=[<span class="w-dbg-name">'+new_id+'</span>], '+
                        'pos=(<span class="w-dbg-px">0</span>,<span class="w-dbg-py">0</span>,<span class="w-dbg-pz">0</span>), '+
                        'rot=(<span class="w-dbg-rx">0</span>,<span class="w-dbg-ry">0</span>,<span class="w-dbg-rz">0</span>)' +
                        '</div>'
                    );
                }
                */
            }
        }
    },
    
    to_id: function(name){
        var new_name = name.toLowerCase().replace(/@oracle.com/,'');
        return new_name.replace(/\./,'-');
    },
    
    set_debug_info: function(name,object){
    
        /*
        if(WURLD.stats){
            var id = WURLD.to_id(name);
            $('#w-debug > div#'+id+' > .w-dbg-px').html(object.position.x);
            $('#w-debug > div#'+id+' > .w-dbg-py').html(object.position.y);
            $('#w-debug > div#'+id+' > .w-dbg-pz').html(object.position.z);
            $('#w-debug > div#'+id+' > .w-dbg-rx').html(object.rotation.x);
            $('#w-debug > div#'+id+' > .w-dbg-ry').html(object.rotation.y);
            $('#w-debug > div#'+id+' > .w-dbg-rz').html(object.rotation.z);
        }
        */
    },
    
    set_skin: function(person,skin_name){
    
        var src = skin_name;
        if(src && src.indexOf('img/') < 0) src = 'img/'+src;
        
        var img = (
            person && 
            person.children[0] && 
            person.children[0].material &&
            person.children[0].material.map &&
            person.children[0].material.map.image
        )?person.children[0].material.map.image:null;
        var curr_src = (img && img.src)?img.src:(img && img.currentSrc)?img.currentSrc:null;
        
        if(curr_src && curr_src.indexOf(src) < 0){
            W_log('Updating skin to',src);
            person.children[0].material.map = THREE.ImageUtils.loadTexture(src, THREE.UVMapping,function(){
	            person.children[0].material.needsUpdate = true;
            });
        }
        
        return curr_src;
    },

    move_other_people: function(person,delta){
    
        if(person){
            // If we have a destination then move toward it
            if(typeof person.last_destination != 'undefined' && person.last_destination){
    
                var vec = (new THREE.Vector3()).subVectors(person.last_destination,person.position);
                vec.setZ(0);
    
                if(vec.length() < WURLD.player_speed * delta){
                    person.position.copy(person.last_destination);
                    person.last_destination = null;
                }
                else{
                    vec.normalize();
                    person.position.add(vec.multiplyScalar(WURLD.player_speed * delta));
                }
                
                WURLD.animator.updatePerson(person,delta);
            }
            else WURLD.animator.resetPerson(person);
            
            WURLD.put_object_on_ground(person); 
            
            // Rotate the player
            var turn_speed = 10.0; 
            var diff = person.rotation.y - person.last_rotation; 
            if(diff > 0) {
                if(diff < turn_speed * delta) person.rotation.y = person.last_rotation;
                else person.rotation.y -= turn_speed * delta;
            }
            else if(diff < 0) {
                if(-diff < turn_speed * delta) person.rotation.y = person.last_rotation;
                else person.rotation.y += turn_speed * delta;
            }
        }
    },
    
    handle_other_people: function(data){

        WURLD.set_gamer_tag(WURLD.player_avatar,WURLD.who_am_i,data.user_name);
        WURLD.who_am_i = data.user_name;
        
        if(WURLD.pre_fish_skin === null){
            WURLD.set_skin(WURLD.player_avatar,data.skin_name);
        }
        
        WURLD.set_debug_info(WURLD.who_am_i,WURLD.player_avatar);
        
        for(var i = 0;i < data.other_people.length;i++){
            
            var d = data.other_people[i];
            var person = WURLD.other_people[d.user_name];
            
            if(typeof person == 'undefined'){
                
                W_log('Creating a new person: '+d.user_name);
                
                person = WURLD.create_person(d);
                person.position.copy(d.last_location);
                WURLD.other_people[d.user_name] = person;
            }
            else{
                WURLD.set_skin(person,d.skin_name);
            }

            person.last_rotation = d.last_rotation;
            person.last_location = d.last_location;
            if(d.last_destination) {
                person.last_destination = d.last_destination;
            }
            
            WURLD.set_debug_info(d.user_name,person);
        }
        
        // Cull out the other people we don't need
        for(var p in WURLD.other_people){
            var found = false;
            for(var c = 0;c < data.other_people.length;c++){
                if(data.other_people[c].user_name == p) {
                    found = true;
                    break;
                }
            }
            if(!found && WURLD.other_people[p]){
                W_log('Removing person:',WURLD.other_people[p]); // TODO: Not leak memory!
                WURLD.scene.remove(WURLD.other_people[p]);
                WURLD.other_people[p] = null;
                delete WURLD.other_people[p];
            }
        }
    },
    
    sendCommand: function(txt,func){
        W_log('Sending command: '+txt);

        WURLD.comet_post({op:'send_command',param:txt},func);
    },
  
    toggleConsole: function(){
    
        var pos = parseInt($('.w-console-container').css('bottom').replace(/px/,''));    
        if(pos < 0) WURLD.showConsole();
        else WURLD.closeConsole();
    },
    
    showConsole: function(){
        
        var pos = parseInt($('.w-console-container').css('bottom').replace(/px/,''));
        
        if(pos < 0){
            $('.w-console-container').animate({bottom:10});
            W_log('Opened console');
        }
        else W_log('Console already open');
    },

    closeConsole: function(){
        var pos = parseInt($('.w-console-container').css('bottom').replace(/px/,''));
        
        if(pos > 0){
            $('.w-console-container').animate({bottom:($(window).height() * -0.4) - 10});
            W_log('Closed console');
        }
        else W_log('Console already closed');
    },
    
    comet_poll: function(){
        
        if(WURLD.connected){
            apex.server.process('COMET_POLL',{x01:WURLD.last_update},{
                success:function(data){ 
                    if(data){
                        if(data.kill_session){
                            // TODO: Some nicer way of displaying this
                            alert('Sorry. You\'ve been disconnected. Did someone else log in as you in a different browser?');
                            WURLD.connected = false;
                        }
                        else{
                            WURLD.last_update = data.now;
                            if(data.error){
                                W_log('SQLERRM='+data.sqlerrm);
                            }
                            else{
                                // TODO: Something with the rest of the data
                                if(data.chats){
                                    W_log('Got chat messages: '+data.chats.length);
                                    var el = frames['w-console-frame'];
                                    if(el){
                                        el.contentWindow.W_CONSOLE.addMessages(data.chats);
                                    }
                                }
                            }
                            WURLD.comet_poll();
                        }
                    }
                },
                error: function(xhr,status,thrown){
                    W_log('ERROR '+status+': '+thrown);
                }
            });
        }
    },
    
    comet_post: function(obj,func){
        if(WURLD.connected){
            
			$.ajax({
				url: 'COMET_POST',
				method:'POST',
				data: JSON.stringify(obj),
				success:function(data){
            		// TODO: Something with the return values?
                	if(func){
                		func(data);
                	}
            	},
				dataType:'json',
				contentType: 'application/json',
            	processData:false/*,
                error: function(xhr,status,thrown){
                    for(var i in arguments.length){
                        W_log(i+'='+arguments[i]);
                    }
                }
            */});		
        }
    },

    load_chunk: function(map_id,i,j,func) {
  
        if(typeof WURLD.chunk_cache[i] == 'undefined'){
            WURLD.chunk_cache[i] = {};
        }
        
        if(
            typeof WURLD.chunk_cache[i][j] == 'undefined'||
            (WURLD.chunk_cache[i][j].mesh == null && !WURLD.chunk_cache[i][j].to_load)
        ){
            W_log('Loading chunk '+i+','+j);
        
            WURLD.chunk_cache[i][j] = {to_load:true};
            
            WURLD.comet_post({op:'get_chunk',map_id:1,i:i,j:j},function(data){
    
                var geometry = new THREE.PlaneGeometry(
                    data.chunk_size,
                    data.chunk_size,
                    data.chunk_segments,
                    data.chunk_segments
                );
         
                var need_water = false;
                for(var v = 0; v < data.vertex_count; v++) {
                    geometry.vertices[v].z = data.vertices[v];
                    if(data.vertices[v] < 0) need_water = true;
                }
        
                Math.seedrandom(data.chunk_id);
                W_log('Seeding random with '+data.chunk_id);
                for(var f = 0;f < geometry.faces.length;f++){
                    geometry.faces[f].color.setHex(WurldColors.computeColor(geometry,f)); 
                }
        
                geometry.computeFaceNormals(); 
                geometry.computeVertexNormals();
        
                var material = new THREE.MeshLambertMaterial( {
                    color: 0xffffff ,
                    shading: THREE.FlatShading ,
                    vertexColors: THREE.FaceColors
                    ,side: THREE.DoubleSide
                });
            
                var terrainMesh = new THREE.Mesh( geometry, material );
                terrainMesh.position.x = data.x;
                terrainMesh.position.y = data.y;
                terrainMesh.receiveShadow = true;
                WURLD.scene.add( terrainMesh );
    
                WURLD.chunk_cache[i][j].mesh = terrainMesh;
                if(data.entities) WURLD.chunk_cache[i][j].entities = WURLD.entity_factory.createEntities(terrainMesh,data.entities); 
                
                // Create some water
                if(need_water){
                    var sea_geo = new THREE.PlaneGeometry(
                        data.chunk_size,
                        data.chunk_size,
                        data.chunk_segments,
                        data.chunk_segments
                    );
                    var sea_mat = new THREE.MeshLambertMaterial( {
                        color: WurldColors.Blue,
                        shading: THREE.FlatShading,
                        opacity: 0.75,
                        transparent: true
                        //,side: THREE.DoubleSide
                    });
                    var sea_mesh = new THREE.Mesh( sea_geo, sea_mat);
                    sea_mesh.position.set(0,0,0);
                    terrainMesh.add( sea_mesh );
                }
                
                if(func) func();
            });
        }
        else{
            if(func) func();
        }
    },

    load_necessary_chunks: function(){
    
        if(WURLD.current_map){
            
            // Work out where the player or the camera is
            var pos = (WURLD.player_avatar)?WURLD.player_avatar.position:WURLD.camera.position;
            var i = Math.round(pos.x / WURLD.current_map.chunk_size);
            var j = Math.round(pos.y / WURLD.current_map.chunk_size);
            
            if(WURLD.center_pos == null || i != WURLD.center_pos.i || j != WURLD.center_pos.j){
                // W_log('center_pos = '+i+','+j);
                
                WURLD.center_pos = {i:i,j:j};

                for(var ni = WURLD.center_pos.i - WURLD.cache_size;ni <= WURLD.center_pos.i + WURLD.cache_size;ni++){
                    for(var nj = WURLD.center_pos.j - WURLD.cache_size;nj <= WURLD.center_pos.j + WURLD.cache_size;nj++){
                        WURLD.load_chunk(WURLD.current_map.id,ni,nj);
                    }
                }            
        
                // Remove chunks we no longer care about
                for(var di in WURLD.chunk_cache){
                    for(var dj in WURLD.chunk_cache[di]){
                        if(
                            parseInt(di) < WURLD.center_pos.i - WURLD.cache_size || 
                            parseInt(di) > WURLD.center_pos.i + WURLD.cache_size ||
                            parseInt(dj) < WURLD.center_pos.j - WURLD.cache_size || 
                            parseInt(dj) > WURLD.center_pos.j + WURLD.cache_size
                        ){
                            var mesh = WURLD.chunk_cache[di][dj].mesh;
                    
                            WURLD.entity_factory.destroyEntities(mesh,WURLD.chunk_cache[di][dj].entities);
                            WURLD.chunk_cache[di][dj].entities = null;
                    
                            if(mesh){
                                W_log('Removing mesh '+di+','+dj);
                                WURLD.scene.remove(mesh);
                                mesh.material.dispose();
                                mesh.geometry.dispose();
                                mesh = null;
                                WURLD.chunk_cache[di][dj].mesh = null;
                                WURLD.chunk_cache[di][dj].to_load = false;
                            }
                        }
                    }
                }
            }
        }
    },

    put_player_on_ground: function(){
    
        WURLD.put_object_on_ground(WURLD.player_avatar)
        
        if(WURLD.player_avatar){
            if(WURLD.pre_fish_skin !== null){
                if(WURLD.player_avatar.position.z > -6){
                    WURLD.set_skin(WURLD.player_avatar,WURLD.pre_fish_skin);
                    W_log('Turned back to normal: '+WURLD.pre_fish_skin);
                    WURLD.pre_fish_skin = null;
                }    
            }
            else{
                if(WURLD.player_avatar.position.z <= -6){
                    WURLD.pre_fish_skin = WURLD.set_skin(WURLD.player_avatar,'fishman.png');
                    W_log('Turned into a fish! Was: '+WURLD.pre_fish_skin);
                }   
            }
        }
    },
    
    put_object_on_ground: function(p){
    
        if(p){
            var top = 4000;
            var start = (new THREE.Vector3()).copy(p.position);
            start.setZ(top);
        
            //var i = Math.round(start.x / WURLD.current_map.chunk_size);
            //var j = Math.round(start.y / WURLD.current_map.chunk_size);
            
            //WURLD.load_chunk(WURLD.current_map.id,i,j,function(){
                
                var ray = new THREE.Raycaster(start,new THREE.Vector3( 0, 0, -1 ));
                var intersects = ray.intersectObjects( WURLD.scene.children );
                for(var i = 0;i<intersects.length;i++) {
                    if(intersects[i].object.geometry.type == 'PlaneGeometry'){
                        p.position.setZ(top - intersects[ i ].distance);
                        break;
                    }
                }
            //});
        }
    },
    
    keep_camera_above_ground: function(){
        
        var top = 4000;
        var start = (new THREE.Vector3()).copy(WURLD.camera.position);
        start.setZ(top);
        
        var ray = new THREE.Raycaster(start,new THREE.Vector3( 0, 0, -1 ));
        var intersects = ray.intersectObjects( WURLD.scene.children );
        for(var i = 0;i<intersects.length;i++) {
            if(intersects[i].object.geometry.type == 'PlaneGeometry'){
                var z = (top - intersects[ i ].distance) + 3;
                if(z > WURLD.camera.position.z){
                    WURLD.camera.position.setZ(z);
                }
                break;
            }
        }
        
        // Show a full screen overlay if the camera is under water
        if(WURLD.camera.position.z < 0){
            if($('#w-underwater-overlay').length == 0){
                WURLD.sound.splash();
                $('body').append('<div id="w-underwater-overlay"></div>');    
            }
        }
        else {
            if($('#w-underwater-overlay').length > 0){
                WURLD.sound.splash();
                $('#w-underwater-overlay').remove();
            }
        }
    },
    
    load_chest: function(){
        
        var deferred = $.Deferred();
        
        // Load the chest mesh, from the static files directory
        var loader = new THREE.ObjectLoader();
        loader.setTexturePath('tex/');
        loader.load(
            '3ds/chest_model.json',
            function ( obj ) {

                for(var i = 0;i < obj.children.length;i++){
                    obj.children[i].castShadow = true;
                    // obj.children[i].receiveShadow = true;
                    obj.children[i].material.side = THREE.FrontSide;
                }

                WURLD.models['chest_model'] = obj;

                deferred.resolve('Loaded chest');
            }
        );
        
        return deferred.promise();
    },
    
    load_player: function(){
        
        var deferred = $.Deferred();
        
        // Load they player mesh, from the static files directory
        var loader = new THREE.ObjectLoader();
        loader.setTexturePath('tex/');
        loader.load(
            '3ds/player_model.json',
            function ( obj ) {

                for(var i = 0;i < obj.children.length;i++){
                    obj.children[i].castShadow = true;
                    // obj.children[i].receiveShadow = true;
                    obj.children[i].material.side = THREE.FrontSide;
                }

                WURLD.models['person_model'] = obj;

	            WURLD.player_avatar = WURLD.create_person({
	            	skin_name:WurldSettings.skin_name(),
					user_name:WurldSettings.user_name()
	            });
	            
	            // Put the player back where they were last
	            WURLD.player_avatar.position.copy(WurldSettings.last_location());
	            WURLD.player_avatar.rotation.y = WurldSettings.last_rotation();
                    
	            // Warp the camera to the player's position
	            WURLD.camera.position.copy(WURLD.calc_camera_pos());
                WURLD.look_at.copy(WURLD.calc_camera_look());
                WURLD.camera.lookAt(WURLD.look_at);
        
                // Load the wurld chunks according to where the player is
                WURLD.load_necessary_chunks();

                WURLD.scene.add( WURLD.player_avatar );
                
                deferred.resolve('Loaded player');
            }
        );
        
        return deferred.promise();
    },

    load_wurld: function(){

        var deferred = $.Deferred();
        
        WURLD.comet_post({op:'get_map',map_id:1},function(data){
    
            WURLD.current_map = data;
            
            WURLD.load_necessary_chunks();
            deferred.resolve('Loaded wurld');
        });
        
        return deferred.promise();
    },
    
    allow_start: function(){
    
        $('.w-start-message').html('c l i c k to s t a r t');
                
        $('.w-start-mask,.w-start-container,.w-logo-banner').click(function(){
                  
            // Once we've clicked anything on the start screen, ignore any further clicks
            $('.w-start-mask,.w-start-container,.w-logo-banner').css({'pointer-events':'none'});
                    
            WURLD.sound.start();
                    
            $('.w-logo-banner').animate({bottom: "100%"}, 1000,"easeInBounce");
            $('.w-start-container').animate({top: "100%"}, 1000,"easeInBounce");
            $('.w-start-mask').fadeOut(2000);
            
            WURLD.listener.register_combo({
                keys: 'w',
                prevent_default: true,
                prevent_repeat: true,
                on_keydown: function(){
                	WURLD.physics.setSpeed(0.25);
                },
                on_keyup: function(){
                	WURLD.physics.setSpeed(0);
                }
            });
            WURLD.listener.register_combo({
                keys: 's',
                prevent_default: true,
                prevent_repeat: true,
                on_keydown: function(){
                	WURLD.physics.setSpeed(-0.25);
                },
                on_keyup: function(){
                	WURLD.physics.setSpeed(0);
                }
            });
            WURLD.listener.register_combo({
                keys: 'a',
                prevent_default: true,
                prevent_repeat: true,
                on_keydown: function(){
                	WURLD.physics.setRotation(-5);
                },
                on_keyup: function(){
                	WURLD.physics.setRotation(0);
                }
            });
            WURLD.listener.register_combo({
                keys: 'd',
                prevent_default: true,
                prevent_repeat: true,
                on_keydown: function(){
                	WURLD.physics.setRotation(5);
                },
                on_keyup: function(){
                	WURLD.physics.setRotation(0);
                }
            });
			
				/*
            WURLD.listener.register_combo({
                keys: '/',
                prevent_default: true,
                prevent_repeat: true,
                on_keydown: WURLD.showConsole
            });
                        
            WURLD.listener.register_combo({
                keys:'escape',
                prevent_default: true,
                prevent_repeat: true,
                on_keydown: WURLD.closeConsole
            });
              */
			          
            $('#w-console-toggle').click(WURLD.toggleConsole);
            $('#w-music-btn').click(function(evt){
                var src = $(evt.target).attr('src');
                var el = frames['w-console-frame'];
                
                if(el){
                    if(src.indexOf('_on') > 0) el.contentWindow.W_CONSOLE.exec_command('/set music off');
                    else el.contentWindow.W_CONSOLE.exec_command('/set music on');
                }
            });
                    
            $('#w-osn-close-icon img').on('click',WURLD.hide_osn_overlay);
            
            $(WURLD.renderer.domElement).click(function(evt){
                if(!WURLD.shift_down){
                    WURLD.pick_position(evt);
                }
            });

            WURLD.listener.register_combo({
                keys: 'shift',
                prevent_default: true,
                prevent_repeat: true,
                on_keydown: function(){
                    if(!WURLD.controls) WURLD.controls = new THREE.OrbitControls(WURLD.camera,document.body);
                    WURLD.controls.enabled = true;
                    WURLD.shift_down = true;
                },
                on_keyup: function(){
                    WURLD.controls.enabled = false;
                    WURLD.shift_down = false;
                }
            });
        });
    },
    
    pick_position: function(event){
            
        var raycaster = new THREE.Raycaster(); 
        var mouse = new THREE.Vector2(); 
                            
        // calculate mouse position in normalized device coordinates 
        // (-1 to +1) for both components 
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1; 
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
                            
        // update the picking ray with the camera and mouse position 
        raycaster.setFromCamera( mouse, WURLD.camera ); 
                            
        // First, see if we hit a chest
        var hit_chest = false;
        var chest_list = [];
        for(var ch in WURLD.chests){
            if(WURLD.chests[ch]) chest_list.push(WURLD.chests[ch]);
        }
        var chest_intersects = raycaster.intersectObjects( chest_list,true); 
        if(chest_intersects.length > 0){

            for(var c = 0;c < chest_intersects.length;c++){
                
                // Distance from the player to the click
                var diff = (new THREE.Vector3()).subVectors(WURLD.player_avatar.position,chest_intersects[c].point);
                                
                if(diff.length() < WURLD.min_chest_dist){
                    var osn_conversation = chest_intersects[c].object.parent.osn_conversation;
                    W_log('Clicked a chest! ('+osn_conversation+')');   
                    // WURLD.show_osn_overlay(osn_conversation);
					WURLD.hit_chest(osn_conversation);
                    hit_chest = true;
                    break;
                }
            }
        }

        if(!hit_chest){
            // Otherwise, calculate the ground objects intersecting the picking ray 
            var intersects = raycaster.intersectObjects( WURLD.scene.children); 
            for(var i = 0;i<intersects.length;i++) {
                if(intersects[i].object.geometry.type == 'PlaneGeometry' && intersects[i].point.z > 0){
                    WURLD.pointer.position.copy(intersects[i].point);
                    WURLD.move_to_pointer = true;
                    break;
                }
            }
        }
    },
    
	hit_chest: function(chest_id){
		
		if(WURLD.chests[chest_id].isOpen){
            WURLD.sound.closeChest();
            WURLD.animator.closeChest(WURLD.chests[chest_id]);
			WURLD.chests[chest_id].isOpen = false;
		}
		else{
        	WURLD.sound.openChest();
        	WURLD.animator.openChest(WURLD.chests[chest_id]);
			WURLD.chests[chest_id].isOpen = true;
		}
	},
	
	/*
    hide_osn_overlay: function(){
        
        $('#w-osn-overlay').slideUp(1000,function(){
            
            WURLD.sound.closeChest();
            WURLD.animator.closeChest(WURLD.chests[$('#w-osn-iframe').attr('data-convo-id')]);
            WURLD.osn_open = false;
            
            $('#w-osn-iframe').attr('src','about:blank');
        });
    },
    
    show_osn_overlay: function(convo_id){
        
        WURLD.osn_open = true;
        WURLD.sound.openChest();
        WURLD.animator.openChest(WURLD.chests[convo_id]);
        
        $('#w-osn-iframe').attr('data-convo-id',convo_id);
        if(WURLD.fake_osn){
            $('#w-osn-iframe').attr('src','https://fusiontools.oraclecorp.com/static/wurld/osn_conversation.html#'+convo_id);
        }
        else{
            $('#w-osn-iframe').attr('src','https://socialnetwork.oracle.com/osn/web/?conversation='+convo_id+'&window=standalone');
        }
        $('#w-osn-overlay').slideDown();
    },
    */
	
    make_text_sprite: function( message, parameters ){

    	var canvas = document.createElement('canvas');
	    $(canvas).attr('id','2d-canvas');
	    $(canvas).attr('width','512');
	    $(canvas).attr('height','32');
	    $(canvas).css({zIndex:-1000,position:'fixed',top:0,left:0,width:'256px',height:'32px'});
	    $('body').append(canvas);
	    var ctx = canvas.getContext('2d');
	
	    ctx.fillStyle = 'rgba(0,0,0,0)';
    	ctx.fillRect(0,0,512,32);
	
	    ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
    	ctx.textAlign = "center";
    	ctx.textBaseline = "bottom";
	    ctx.font = "28px Courier"
	    ctx.fillText( message, 256,32);
	
	    var texture = new THREE.Texture(canvas);
	    texture.needsUpdate = true;
	    var spriteMaterial = new THREE.SpriteMaterial({ map: texture});
	    var sprite = new THREE.Sprite( spriteMaterial );
    	sprite.scale.set(16,1,1);
    	
    	$(canvas).remove();
    	
	    return sprite;	
    }
};
