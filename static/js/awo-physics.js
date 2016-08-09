var WurldPhysics = function(x,y,r){

	// create an engine
	this.engine = Matter.Engine.create();

	// Turn off gravity
	this.engine.world.gravity.y = 0;

	// Create a moveable shape for the player
	this.playerBody = Matter.Bodies.circle(x, -y, 1, {friction: 0,frictionAir: 0,restitution:0,density:100,angle:-Math.PI*0.5});
  Matter.Body.setAngle(this.playerBody,-r + (Math.PI*0.5));

  var thiz = this;
	this.speed = 0;
	this.turn = 0;
	this.angle = this.playerBody.angle;

	Matter.Events.on(this.engine, 'afterUpdate',function(){thiz.onAfterUpdate();});
  Matter.Events.on(this.engine, 'collisionActive',function(evt){thiz.onCollisionActive(evt);});

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

WurldPhysics.prototype.setPlayerPosition = function(x,y){
		Matter.Body.setPosition(this.playerBody,{x:x,y:-y});
}

WurldPhysics.prototype.step = function(dt){

	// Step the engine, at a constant rate (passed time is in seconds, we wany ms)
	this.total_delta += dt * 1000;
	while(this.total_delta > this.target_delta){

		// Update the requested angle, based on the requested turn speed and the time that's passed
		this.angle += (this.target_delta / 1000) * this.turn;

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

  var obj = Matter.Bodies.rectangle(x,y,w,h,{angle:-a + (Math.PI*0.5),restitution:0,friction:0,isStatic:true});
  Matter.World.add(this.engine.world, obj);

  return obj;
}

WurldPhysics.prototype.createTriangleBody = function(x,y,x1,y1,x2,y2,x3,y3){

  var obj = Matter.Bodies.fromVertices(x,y,[[{x:x1,y:y1},{x:x2,y:y2},{x:x3,y:y3}]],{restitution:0,friction:0,isStatic:true});

  Matter.World.add(this.engine.world, obj);

  return obj;
}

WurldPhysics.prototype.createMobBody = function(x,y,r,a,label){

	var obj = Matter.Bodies.circle(x,-y,r,{
		restitution:0,
		friction:0,
	  frictionAir:0.2,
		label:'Mob_'+label
	});
	Matter.Body.setAngle(obj,-a + (Math.PI * 0.5));
  Matter.World.add(this.engine.world, obj);

  return obj;
}

WurldPhysics.prototype.transferPositionTo= function(obj){

	obj.position.setX(obj.body.position.x);
	obj.position.setY(-obj.body.position.y);
	obj.rotation.y = -obj.body.angle + (Math.PI * 0.5);
}

WurldPhysics.prototype.destroyBody = function(b){

	if(b){
		Matter.World.remove(this.engine.world, b);
	}
}

WurldPhysics.prototype.moveInDirection = function(body,angle,speed,delta){

	Matter.Body.setAngle(body,-angle + (Math.PI * 0.5));
	var req_spd = Matter.Vector.rotate({y:speed * delta,x:0},body.angle);

	req_spd.x += body.position.x;
	req_spd.y += body.position.y;

	Matter.Body.setPosition(body, req_spd);
}

WurldPhysics.prototype.onAfterUpdate = function(){

	// Force the player to the angle we want
	this.playerBody.angle = this.angle;

	// Work out what speed we should be going in what direction, and apply a force to get us there
	var req_spd = Matter.Vector.rotate({x:this.speed,y:0},this.angle);
	var cur_spd = this.playerBody.velocity;
	var force = 0.25;

	Matter.Body.applyForce(this.playerBody, this.playerBody.position, {
		x:force * (req_spd.x - cur_spd.x),
		y:force * (req_spd.y - cur_spd.y)
	});

	// Update the physics debug renderer to scroll with the player
	if(this.render){
		Matter.Bounds.shift(this.render.bounds,Matter.Vector.add(this.playerBody.position,{x:-160,y:-120}));
	}
}

WurldPhysics.prototype.processMobHit = function(body,collision){
	
	// Make the body turn away from the collision (after a fashion!)
	var dir = Matter.Vector.rotate({x:0,y:1},body.angle);
	var angle = Matter.Vector.angle(dir,collision.tangent);
	if(angle > 0) Matter.Body.setAngle(body,body.angle+0.1);
	else Matter.Body.setAngle(body,body.angle-0.1);
};

WurldPhysics.prototype.onCollisionActive = function(evt){
	for(var p in evt.pairs){
		var coll = evt.pairs[p].collision;
		if(coll.bodyA.label.startsWith('Mob_')) this.processMobHit(coll.bodyA,coll);
		if(coll.bodyB.label.startsWith('Mob_')) this.processMobHit(coll.bodyB,coll);
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
	this.speed = v;
}

WurldPhysics.prototype.setRotation = function(v){
	this.turn = v;
}
