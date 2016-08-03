
W_log('Loading Mind Wurld Open main JavaScript routines...');

var WURLD = {

    scene: null,
    camera: null,
    renderer: null,
    light: null,
    sun: null,
    ambient: null,
    clock: null,
    entity_factory: null,
    sound: null,

    light_position: new THREE.Vector3(-30,10,100),
    camera_position: new THREE.Vector3(20,-40,30),
    camera_offset: new THREE.Vector3(0,20,16),

    look_at: new THREE.Vector3(0,0,0),
    player_height: new THREE.Vector3(0,0,7),
    animator: null,

    stats: null,

    current_map: null,
    center_pos: null,
    chunk_cache: {},
    cache_size: 3,

    models: {},
    player_avatar: null,
    camera_speed: 15,
    who_am_i: '',
    min_chest_dist: 10,
    chests: {},

    init: function(){

        // Send in the logos!
        $('.w-logo-banner').animate({bottom: "50%"}, 1000,"easeOutBounce");
        $('.w-start-container').animate({top: "55%"}, 1000,"easeOutBounce",function(){
            WURLD.startUp();
        });
    },

    startUp: function(){

        // Handle keyboard and gamepad input
        WURLD.input = new WurldInput();

        // Very very very basic animation
        WURLD.animator = new WurldAnimate();

		// We're going to use 2D physics in the ground-plane for collision detection and response
		WURLD.physics = new WurldPhysics(WURLD_SETTINGS.start_location.x,WURLD_SETTINGS.start_location.y);

        // Set up the Three.js scene
        WURLD.scene = new THREE.Scene();
        WURLD.scene.fog = new THREE.Fog(WurldColors.GhostWhite,30,600);

        // Set up the renderer
        WURLD.renderer = new THREE.WebGLRenderer({antialias:WurldSettings.antialias()});
        WURLD.renderer.setSize( $(window).width(), $(window).height() );

        WURLD.renderer.setClearColor(WurldColors.SkyBlue);
        $('.w-main-content').append( WURLD.renderer.domElement );

        // Adjust the Three.js stuff when the window resizes
        $(window).resize(function(){

            var w = $(window).width();
            var h = $(window).height();

            WURLD.renderer.setSize( w, h );

        	WURLD.camera.aspect	= w / h;
        	WURLD.camera.updateProjectionMatrix();
        });

        // A clock for timing deltas for animation
        WURLD.clock = new THREE.Clock;

        // The camera
        WURLD.camera = new THREE.PerspectiveCamera( 45, $(window).width() / $(window).height(), 1, 3000 );
        WURLD.camera.position.copy(WURLD.camera_position);
        WURLD.camera.up.set( 0, 0, 1 );
        WURLD.camera.lookAt(WURLD.look_at);

        // Lighting
        WURLD.ambient = new THREE.AmbientLight( WurldColors.SoftWhiteLight );
        WURLD.scene.add(WURLD.ambient);

        WURLD.sun = new THREE.DirectionalLight( WurldColors.White, 1.0 );
        WURLD.sun.position.copy(WURLD.light_position);
        WURLD.sun.position.addVectors(WURLD_SETTINGS.start_location,WURLD.light_position);
        WURLD.sun.target.position.copy(WURLD_SETTINGS.start_location);

        if(WURLD_SETTINGS.dynamic_shadows && WURLD_SETTINGS.dynamic_shadows.enabled){

          WURLD.renderer.shadowMap.enabled = true;
          WURLD.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

          WURLD.sun.castShadow = true;
          WURLD.sun.shadow.mapSize.width = WURLD_SETTINGS.dynamic_shadows.map_size;
          WURLD.sun.shadow.mapSize.height = WURLD_SETTINGS.dynamic_shadows.map_size;
          WURLD.sun.shadow.camera.far = 150;
          WURLD.sun.shadow.camera.near = 50;
          WURLD.sun.shadow.camera.left = -100;
          WURLD.sun.shadow.camera.right = 100;
          WURLD.sun.shadow.camera.top = 100;
          WURLD.sun.shadow.camera.bottom = -70;
        }

        WURLD.scene.add(WURLD.sun);
        if(WURLD_SETTINGS.debug_lights){
            WURLD.scene.add(new THREE.DirectionalLightHelper(WURLD.sun));
            WURLD.scene.add(new THREE.CameraHelper(WURLD.sun.shadow.camera));
        }

        // Other objects we need
        WURLD.entity_factory = new WurldEntityFactory();
        WURLD.sound = new WurldSound();
        WURLD.texture_loader = new THREE.TextureLoader();

        WURLD.sea_material = new THREE.MeshPhongMaterial( {
            color: WurldColors.Blue,
            shading: THREE.FlatShading,
            opacity: 0.75,
            transparent: true,
            specular:WurldColors.LightBlue,
            shininess:10
        });

        if(WURLD_SETTINGS.show_stats){
            WURLD.init_stats();
        }

        if(WurldSettings.music()) WURLD.sound.startMusic();

        // Do an initial render, but don't enter the refresh loop, to complete the WebGL setup
        requestAnimationFrame(function(){
            WURLD.renderer.render(WURLD.scene,WURLD.camera);
            WURLD.prepare_to_start();
        });
    },

    prepare_to_start: function(){

        // When the chest and player models have loaded, load the world, then we can start
        $.when(
            WURLD.load_player(),
            WURLD.load_chest()
        ).done(function(){
            for(var a = 0;a < arguments.length;a++) W_log(arguments[a]);

            $.when(
                WURLD.load_wurld()
            ).done(function(){
                for(var a = 0;a < arguments.length;a++) W_log(arguments[a]);

                WURLD.allow_start();
            })
        });
    },

    allow_start: function(){

        $('.w-start-message').html('p r e s s &nbsp;&nbsp; s o m e t h i n g');

        // Bind stuff to allow us to start
        if(!WURLD.is_started){
            $('.w-start-mask,.w-start-container,.w-logo-banner').bind('click',WURLD.do_start);
            $(document).bind('keyup', WURLD.do_start);

            WURLD.input.start_on_gamepad();
        }
    },

    do_start: function(){

        // Unbind the handlers
        $('.w-start-mask,.w-start-container,.w-logo-banner').unbind('click',WURLD.do_start);
        $(document).unbind('keyup', WURLD.do_start);

        if(!WURLD.is_started){

            // OK, let's really start
            WURLD.is_started = true;
            WURLD.sound.start();

            // Get rid of the logos, start rendering, and fade out the mask overlay
            $('.w-logo-banner').animate({bottom: "100%"}, 1000,"easeInBounce");
            $('.w-start-container').animate({top: "100%"}, 1000,"easeInBounce",function(){
                requestAnimationFrame( WURLD.render );

                $('.w-start-mask').fadeOut(2000);
            });

            // Start listening for input
            WURLD.input.start();

            // Allow the user to turn music on / off
            $('#w-music-btn').click(function(evt){
                var src = $(evt.target).attr('src');

                if(src.indexOf('_on') > 0) WURLD.sound.setMusic('off');
                else WURLD.sound.setMusic('on');
            });
        };
    },

    render: function() {
        requestAnimationFrame( WURLD.render );

        var delta = WURLD.clock.getDelta();

        if(WURLD.stats) WURLD.stats.begin();

        // Poll for inputs (e.g. from gamepads)
        WURLD.input.poll(delta);

        // Step the physical world
        WURLD.physics.step(delta);

        if(WURLD.player_avatar){

            // Update the position and rotation according to the physics engine
            WURLD.player_avatar.rotation.y = WURLD.physics.getPlayerRotation()

            WURLD.player_avatar.position.setX(WURLD.physics.getPlayerPositionX());
            WURLD.player_avatar.position.setY(WURLD.physics.getPlayerPositionY());
            WURLD.load_necessary_chunks();

            // Make sure the player is on the ground
            WURLD.put_player_on_ground();

            if(WURLD.is_walking){
                WURLD.animator.updatePerson(WURLD.player_avatar,delta);
            }

            // Move the camera toward the back of the player
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

            // Update the sun so that the shadows (if they're enabled) follow the player around
            WURLD.sun.position.addVectors(WURLD.player_avatar.position,WURLD.light_position);
            WURLD.sun.target.position.copy(WURLD.player_avatar.position);
            WURLD.sun.target.updateMatrixWorld();
        }

        // Align the compass with the player
        $('#w-compass-icon').css('transform','rotate('+(WURLD.player_avatar.rotation.y * (180/Math.PI))+'deg)');

	    // Keep the camera above the ground and the water
        WURLD.keep_camera_above_ground();

        // Render the world
        WURLD.renderer.render(WURLD.scene,WURLD.camera);

        if(WURLD.stats) WURLD.stats.end();
    },

    init_stats: function(){

        WURLD.stats = new Stats();
        WURLD.stats.setMode(0); // 0: fps, 1: ms

        $('body').append( WURLD.stats.domElement );
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

    create_person: function(obj){

        var new_player = WURLD.models['person_model'].clone();
        var new_material = WURLD.models['person_model'].children[0].material.clone();

        if(obj.skin_name){
            new_material.map = WURLD.texture_loader.load('img/'+obj.skin_name+'_skin.png',function(){
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
              WURLD_SETTINGS.user_name = name;
            }
        }
    },

    to_id: function(name){
        var new_name = name.toLowerCase().replace(/@oracle.com/,'');
        return new_name.replace(/\./,'-');
    },

    set_skin: function(person,skin_name){

        var src = skin_name;
        if(src && src.indexOf('img/') < 0) src = 'img/'+src;
        if(src && src.indexOf('_skin.png') < 0) src = src+'_skin.png';

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
            var old_name = WURLD_SETTINGS.user_name;
            var new_name = skin_name.replace(/_/,' ');
            person.children[0].material.map = WURLD.texture_loader.load(src, function(){
	            person.children[0].material.needsUpdate = true;
              WURLD.set_gamer_tag(WURLD.player_avatar,old_name,new_name);
            });
        }

        return curr_src;
    },

    curr_skin_id: function(){

      for(var i = 0;i < WURLD_SKINS.length;i++){
        if(WURLD_SKINS[i] == WURLD_SETTINGS.skin_name) return i;
      }
      return -1;
    },

    next_skin: function(){
      var curr = WURLD.curr_skin_id();
      if(curr >= 0){
        curr++;
        if(curr >= WURLD_SKINS.length) curr = 0;
        WURLD_SETTINGS.skin_name = WURLD_SKINS[curr];
        WURLD.set_skin(WURLD.player_avatar,WURLD_SETTINGS.skin_name);
      }
    },

    prev_skin: function(){
      var curr = WURLD.curr_skin_id();
      if(curr >= 0){
        curr--;
        if(curr < 0) curr = WURLD_SKINS.length - 1;
        WURLD_SETTINGS.skin_name = WURLD_SKINS[curr];
        WURLD.set_skin(WURLD.player_avatar,WURLD_SETTINGS.skin_name);
      }
    },

    comet_post: function(obj,func){

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
           	processData:false
        });
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

            WURLD.chunk_cache[i][j] = {
                to_load:true
            };

            WURLD.comet_post({op:'get_chunk',map_id:1,i:i,j:j},function(data){

                var geometry = new THREE.PlaneGeometry(
                    data.chunk_size,
                    data.chunk_size,
                    data.chunk_segments,
                    data.chunk_segments
                );

                // Look for low lying terrain
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

                var material = new THREE.MeshPhongMaterial( {
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
                WURLD.chunk_cache[i][j].to_load = false;
                if(data.entities) WURLD.chunk_cache[i][j].entities = WURLD.entity_factory.createEntities(terrainMesh,data.entities);

                // Create some water is any of the terrain is below sea level
                if(need_water){

                    var sea_geo = new THREE.PlaneBufferGeometry(
                        data.chunk_size,
                        data.chunk_size
                    );

                    var sea_mesh = new THREE.Mesh( sea_geo, WURLD.sea_material);
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

        var prev_z = WURLD.player_avatar.position.z;

        WURLD.put_object_on_ground(WURLD.player_avatar)

        var diff = prev_z - WURLD.player_avatar.position.z;
        if(Math.abs(diff) > 10){
          console.warn('Large change in player height detected',diff);
          WURLD.player_avatar.position.setZ(prev_z);
        }
    },

    put_object_on_ground: function(p){

        if(p){
            var top = 1000;
            var start = (new THREE.Vector3()).copy(p.position);
            start.setZ(top);

            var ray = new THREE.Raycaster(start,new THREE.Vector3( 0, 0, -1 ));
            var intersects = ray.intersectObjects( WURLD.scene.children );
            for(var i = 0;i<intersects.length;i++) {
                if(intersects[i].object.geometry.type == 'PlaneGeometry'){
                    p.position.setZ(top - intersects[ i ].distance);
                    break;
                }
            }
        }
    },

    keep_camera_above_ground: function(){

        var top = 1000;
        var start = (new THREE.Vector3()).copy(WURLD.camera.position);
        start.setZ(top);

        var ray = new THREE.Raycaster(start,new THREE.Vector3( 0, 0, -1 ));
        var intersects = ray.intersectObjects( WURLD.scene.children );
        for(var i = 0;i<intersects.length;i++) {
            if(intersects[i].object.geometry.type == 'PlaneGeometry'){
                var z = Math.max((top - intersects[ i ].distance),0) + 3; // Can't go below sea level
                if(z > WURLD.camera.position.z){
                    WURLD.camera.position.setZ(z);
                }
                break;
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

        // Load the player mesh, from the static files directory
        var loader = new THREE.ObjectLoader();
        loader.setTexturePath('tex/');
        loader.load(
            '3ds/player_model.json',
            function ( obj ) {

                for(var i = 0;i < obj.children.length;i++){
                    obj.children[i].castShadow = true;
                    obj.children[i].receiveShadow = true;
                    obj.children[i].material.side = THREE.FrontSide;
                }

                WURLD.models['person_model'] = obj;

	            WURLD.player_avatar = WURLD.create_person({
	            	skin_name:WurldSettings.skin_name(),
					      user_name:WurldSettings.user_name()
	            });

	            // Put the player back where they were last
	            WURLD.player_avatar.position.copy(WurldSettings.start_location());
	            WURLD.player_avatar.rotation.y = WurldSettings.start_rotation();

	            // Warp the camera to the player's position
	            WURLD.camera.position.copy(WURLD.calc_camera_pos());
                WURLD.look_at.copy(WURLD.calc_camera_look());
                WURLD.camera.lookAt(WURLD.look_at);

                // Load the wurld chunks according to where the player is
                // WURLD.load_necessary_chunks();

                WURLD.scene.add( WURLD.player_avatar );

                deferred.resolve('Loaded player');
            }
        );

        return deferred.promise();
    },

    load_wurld: function(){

        var deferred = $.Deferred();

        WURLD.comet_post({op:'get_map',map_id:1},function(data){

            W_log('Got map meta data');
            WURLD.current_map = data;

            WURLD.load_necessary_chunks();

            var load_delay = setInterval(function(){
                var found = false;
                for(var i in WURLD.chunk_cache){
                    if(WURLD.chunk_cache[i] !== undefined){
                        for(var j in WURLD.chunk_cache[i]){
                            if(WURLD.chunk_cache[i][j] !== undefined){
                                W_log('chunk_cache['+i+']['+j+']='+WURLD.chunk_cache[i][j].to_load);
                                if(WURLD.chunk_cache[i][j].to_load) found = true;
                            }
                        }
                    }
                }
                if(!found) {
                    clearInterval(load_delay);
                    deferred.resolve('Loaded wurld');
                }
            },1000);
        });

        return deferred.promise();
    },

    /*
    TODO: Give people some other way to open / close chests
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
