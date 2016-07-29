var WurldInput = function(){

	this.WALK_SPEED = 0.25;
	this.TURN_SPEED = 5;

	this.listener = new window.keypress.Listener();

	this.start_walking = function(speed){
		WURLD.physics.setSpeed(speed);
        WURLD.sound.startFootsteps();
        WURLD.is_walking = true;
	}

	this.stop_walking = function(){
		WURLD.physics.setSpeed(0);
        WURLD.sound.stopFootsteps();
        WURLD.animator.resetPerson(WURLD.player_avatar);
        WURLD.is_walking = false;
	}

	this.start_turning = function(speed){
		WURLD.physics.setRotation(speed);
	}

	this.stop_turning = function(){
    	WURLD.physics.setRotation(0);
	}
}

WurldInput.prototype.start = function(){

	this.listener.register_combo({
    	keys: 'w',
        prevent_default: true,
        prevent_repeat: true,
        "this":this,
        on_keydown: function(){this.start_walking(WURLD.input.WALK_SPEED);},
        on_keyup: function(){this.stop_walking();}
    });

    this.listener.register_combo({
    	keys: 's',
        prevent_default: true,
        prevent_repeat: true,
        "this":this,
        on_keydown: function(){this.start_walking(-WURLD.input.WALK_SPEED);},
        on_keyup: function(){this.stop_walking();}
    });

    this.listener.register_combo({
    	keys: 'a',
        prevent_default: true,
        prevent_repeat: true,
        "this":this,
        on_keydown: function(){this.start_turning(-WURLD.input.TURN_SPEED);},
        on_keyup: function(){this.stop_turning();}
    });

    this.listener.register_combo({
    	keys: 'd',
        prevent_default: true,
        prevent_repeat: true,
        "this":this,
        on_keydown: function(){this.start_turning(WURLD.input.TURN_SPEED);},
        on_keyup: function(){this.stop_turning();}
    });    
}

WurldInput.prototype.poll = function(dt){
	// Check for gamepad input
}
