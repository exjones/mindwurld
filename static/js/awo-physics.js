var WurldPhysics = function(x,y){

	// create an engine
	this.engine = Matter.Engine.create();

	// Turn off gravity
	this.engine.world.gravity.y = 0;
	
	// Create a moveable chape for the player 
	this.playerBody = Matter.Bodies.circle(x, y, 1, {friction: 0,frictionAir: 0,restitution:0,density:100,angle:-Math.PI*0.5});
	
    var thiz = this;
	this.push_force = {x:0,y:0};
	this.rotate_force = 0;
	Matter.Events.on(this.engine, 'afterUpdate',function(){thiz.onAfterUpdate();});

	// The player body to the world
	Matter.World.add(this.engine.world, this.playerBody);

	// To enable us to step the physics at a constant rate
	this.total_delta = 0;
	this.target_delta = 1000.0 / 60.0; // 16.666ms (i.e. 60fps)

	// Create renderer, if we want to debug physics
	if(WURLD_SETTINGS.debug_physics){
		
		$('#w-physics-debug').show();

		this.render = Matter.Render.create({
	    	element: $('#w-physics-debug')[0],
	    	engine: this.engine,
			options: {
		        width: 640,
		        height: 480,
		        hasBounds: true,
		        showVelocity: true,
		        showAxes: false,
		        showPositions: false,
		        showAngleIndicator: true
			}
		});
		this.render.bounds = {min:{x:-160,y:-120},max:{x:160,y:120}};
	}
}

WurldPhysics.prototype.step = function(dt){

	// Step the engine, at a constant rate (passed time is in seconds, we wany ms)
	this.total_delta += dt * 1000; 
	while(this.total_delta > this.target_delta){
		Matter.Engine.update(this.engine,this.target_delta);
		this.total_delta -= this.target_delta;
	}

	// Update the renderer, if we have one
	if(this.render){
		Matter.Render.world(this.render);
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

WurldPhysics.prototype.createTriangleBody = function(x,y,x1,y1,x2,y2,x3,y3){

  var obj = Matter.Bodies.fromVertices(x,y,[[{x:x1,y:y1},{x:x2,y:y2},{x:x3,y:y3}]],{restitution:0,friction:0,isStatic:true});

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
	
	// Update the physics debug renderer to scroll with the player
	if(this.render){
		Matter.Bounds.shift(this.render.bounds,Matter.Vector.add(this.playerBody.position,{x:-160,y:-120}));
	}
}

WurldPhysics.prototype.getPlayerRotation = function(){
	return -this.playerBody.angle + (Math.PI * 0.5);
}

WurldPhysics.prototype.getPlayerPositionX = function(){
	return this.playerBody.position.x;
}

WurldPhysics.prototype.getPlayerPositionY = function(){
	return -this.playerBody.position.y;
}

WurldPhysics.prototype.setSpeed = function(v){
	this.push_force.x = v;
	this.push_force.y = 0;
}

WurldPhysics.prototype.setRotation = function(v){
	this.rotate_force = v * 0.025;
}