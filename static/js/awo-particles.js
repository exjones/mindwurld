var WurldParticles = function(){

    this.particleGroup = new SPE.Group({
      texture: {
        value: WURLD.texture_loader.load('img/star.png')
      },
      maxParticleCount:2000
    });

    this.emitter = new SPE.Emitter({
      maxAge: {
        value: 2
      },
      position: {
        value: new THREE.Vector3(0, 0, 0),
        spread: new THREE.Vector3( 0, 0, 0 )
      },
      acceleration: {
        value: new THREE.Vector3(0, 0, -10),
        spread: new THREE.Vector3( 5, 5, 0 )
      },
      velocity: {
        value: new THREE.Vector3(0, 0, 20),
        spread: new THREE.Vector3(5, 5, 3)
      },
      color: {
        value: [ new THREE.Color('yellow'), new THREE.Color('orange') ]
      },
      size: {
        value: 2
      },
      particleCount: 2000
    });

    this.hide();

    this.particleGroup.addEmitter( this.emitter );
    WURLD.scene.add( this.particleGroup.mesh );
}

WurldParticles.prototype.show = function(obj){
  this.particleGroup.mesh.position.copy(obj.getWorldPosition());
  this.particleGroup.mesh.visible = true;
  this.is_visible = true;
}

WurldParticles.prototype.hide = function(){
  this.particleGroup.mesh.position.set(0,0,0);
  this.particleGroup.mesh.visible = false;
  this.is_visible = false;
}

WurldParticles.prototype.render = function(dt) {
  if(this.is_visible) this.particleGroup.tick( dt );
}
