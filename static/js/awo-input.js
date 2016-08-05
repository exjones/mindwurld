var WurldInput = function(){

	this.WALK_SPEED = 0.25;
	this.TURN_SPEED = 3;

	this.listener = new window.keypress.Listener();

	this.gamepad_walk = false;
	this.gamepad_turn = false;
	this.play_button_down = false;
	this.prev_button_down = false;
	this.next_button_down = false;

	this.start_walking = function(speed){
		WURLD.physics.setSpeed(speed);
		if(!WURLD.is_walking){
			WURLD.sound.startFootsteps();
    	WURLD.is_walking = true;
		}
	}

	this.stop_walking = function(){
		if(WURLD.is_walking){
			WURLD.physics.setSpeed(0);
			WURLD.sound.stopFootsteps();
    	WURLD.animator.resetPerson(WURLD.player_avatar);
    	WURLD.is_walking = false;
		}
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

    this.listener.register_combo({
        keys: 'm',
        on_keyup: function(){WURLD.sound.toggleMusic();}
    });

		this.listener.register_combo({
        keys: 'left',
        on_keyup: function(){WURLD.prev_skin();}
    });

		this.listener.register_combo({
        keys: 'right',
        on_keyup: function(){WURLD.next_skin();}
    });
}

WurldInput.prototype.poll = function(dt){

	// Check for gamepad input
	var gamepads = navigator.getGamepads();
	if(gamepads && gamepads.length){
		var pad = gamepads[0];
		if(pad){
			var sens = WURLD_SETTINGS.gamepad.axis_sensitivity;

			var turn_axis = pad.axes[WURLD_SETTINGS.gamepad.turn_axis];
			if(turn_axis > sens || turn_axis < -sens){
				this.gamepad_turn = true;
				this.start_turning(this.TURN_SPEED * turn_axis);
			}
			else if(this.gamepad_turn){
				this.gamepad_turn = false;
				this.stop_turning();
			}

			var walk_axis = pad.axes[WURLD_SETTINGS.gamepad.walk_axis];
			if(walk_axis > sens || walk_axis < -sens){
				this.gamepad_walk = true;
				this.start_walking(-this.WALK_SPEED * walk_axis);
			}
			else if(this.gamepad_walk){
				this.gamepad_walk = false;
				this.stop_walking();
			}

			if(pad.buttons[WURLD_SETTINGS.gamepad.play_button].pressed && this.play_button_down == false){
				this.play_button_down = true;
			}
			else if(!pad.buttons[WURLD_SETTINGS.gamepad.play_button].pressed && this.play_button_down == true){
				this.play_button_down = false;
				WURLD.sound.toggleMusic();
			}

			if(pad.buttons[WURLD_SETTINGS.gamepad.prev_button].pressed && this.prev_button_down == false){
				this.prev_button_down = true;
			}
			else if(!pad.buttons[WURLD_SETTINGS.gamepad.prev_button].pressed && this.prev_button_down == true){
				this.prev_button_down = false;
				WURLD.prev_skin();
			}

			if(pad.buttons[WURLD_SETTINGS.gamepad.next_button].pressed && this.next_button_down == false){
				this.next_button_down = true;
			}
			else if(!pad.buttons[WURLD_SETTINGS.gamepad.next_button].pressed && this.next_button_down == true){
				this.next_button_down = false;
				WURLD.next_skin();
			}
		}
	}
}
WurldInput.prototype.start_on_gamepad = function(){

		var gamepads = navigator.getGamepads();

		if(gamepads && gamepads.length){
			var pad = gamepads[0];
			if(pad){
				for(var b = 0;b < pad.buttons.length;b++){
					if(typeof(pad.buttons[b]) == 'object'){
						if(pad.buttons[b].pressed) WURLD.do_start();
						else{
							if(pad.buttons[b] > 0.5) WURLD.do_start();
						}
					}
				}
			}
		}

		if(!WURLD.is_started){
			requestAnimationFrame(WURLD.input.start_on_gamepad);
		}
}
