var WurldPhysics = function(){
}

WurldPhysics.prototype.start = function(){

	// create an engine
	this.engine = Matter.Engine.create();

	// Turn off gravity
	this.engine.world.gravity.y = 0;
	
	// Create a moveable chape for the player 
	this.playerBody = Matter.Bodies.circle(0, 0, 1, {friction: 0,frictionAir: 0,restitution:0,density:100,angle:-Math.PI*0.5});
	
    var thiz = this;
	this.push_force = {x:0,y:0};
	this.rotate_force = 0;
	Matter.Events.on(this.engine, 'afterUpdate',function(){thiz.onAfterUpdate();});

	// The player body to the world
	Matter.World.add(this.engine.world, this.playerBody);

	// run the engine
	Matter.Engine.run(this.engine);

	// Create and run a renderer, if its display element is visible
	if($('#w-physics-debug:visible')){
		this.render = Matter.Render.create({
	    	element: $('#w-physics-debug')[0],
	    	engine: this.engine,
			options: {
			        width: 640,
			        height: 480,
			//        pixelRatio: 1,
			//        background: '#fafafa',
			//        wireframeBackground: '#222',
			        hasBounds: true,
			//        enabled: true,
			//        wireframes: true,
			//        showSleeping: true,
			//        showDebug: false,
			//        showBroadphase: false,
			//        showBounds: false,
			        showVelocity: true,
			//        showCollisions: false,
			//        showSeparations: false,
			        showAxes: false,
			        showPositions: false,
			        showAngleIndicator: true
			//        showIds: false,
			//        showShadows: false,
			//        showVertexNumbers: false,
			//        showConvexHulls: false,
			//        showInternalEdges: false,
			//        showMousePosition: false
			}
		});
		this.render.bounds = {min:{x:-160,y:-120},max:{x:160,y:120}};
		
		Matter.Render.run(this.render);
	}
}

WurldPhysics.prototype.createCircleBody = function(x,y,s){

  var obj = Matter.Bodies.circle(x,y,s,{restitution:0,friction:0,isStatic:true});
  Matter.World.add(this.engine.world, obj);

  return obj;	
}

WurldPhysics.prototype.createBoxBody = function(x,y,w,h,a){

  var obj = Matter.Bodies.rectangle(x,y,w,h,{angle:a - (Math.PI*0.5),restitution:0,friction:0,isStatic:true});
  Matter.World.add(this.engine.world, obj);

  return obj;	
}

WurldPhysics.prototype.destroyBody = function(b){

	if(b){
		Matter.World.remove(this.engine.world, b);
	}
}


WurldPhysics.prototype.onAfterUpdate = function(){

	// First slow the player down, then possibly push them in the direction they're facing 
	Matter.Body.applyForce(this.playerBody, this.playerBody.position, {x: -this.playerBody.velocity.x, y: -this.playerBody.velocity.y});
	Matter.Body.applyForce(this.playerBody, this.playerBody.position, Matter.Vector.rotate(this.push_force,this.playerBody.angle));
	
	// If we're not already turning too fast, then rotate the player, otherwise slow them down
	if(this.rotate_force && this.playerBody.angularSpeed < 0.025) this.playerBody.torque = this.rotate_force;
	else this.playerBody.torque = -this.playerBody.angularVelocity * 0.25;
	
	// Send the position and rotate of the player back to the main display
	if(WURLD && WURLD.player_avatar){
		WURLD.player_avatar.rotation.y = -this.playerBody.angle + (Math.PI * 0.5);
		
		WURLD.player_avatar.position.setX(this.playerBody.position.x);
		WURLD.player_avatar.position.setY(-this.playerBody.position.y);
		
		if(this.push_force.x) WURLD.player_moved = true;
	}
	
	// Update the physics debug renderer to scroll with the player
	if(this.render){
		Matter.Bounds.shift(this.render.bounds,Matter.Vector.add(this.playerBody.position,{x:-160,y:-120}));
	}
}

WurldPhysics.prototype.setSpeed = function(v){
	this.push_force.x = v;
	this.push_force.y = 0;
}

WurldPhysics.prototype.setRotation = function(v){
	this.rotate_force = v * 0.025;
}