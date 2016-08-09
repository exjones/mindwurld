var WurldAnimate = function(){

    this.tracked = {};

    this.arm_trans = new THREE.Matrix4();
    this.leg_trans = new THREE.Matrix4();
    this.front_trotter_trans = new THREE.Matrix4();
    this.back_trotter_trans = new THREE.Matrix4();
    this.lid_trans = new THREE.Matrix4();

    this.arm_rev_trans = new THREE.Matrix4();
    this.leg_rev_trans = new THREE.Matrix4();
    this.front_trotter_rev_trans = new THREE.Matrix4();
    this.back_trotter_rev_trans = new THREE.Matrix4();
    this.lid_rev_trans = new THREE.Matrix4();

    this.arm_trans.makeTranslation(0,1,0);
    this.arm_rev_trans.makeTranslation(0,-1,0);

    this.leg_trans.makeTranslation(0,1.25,0);
    this.leg_rev_trans.makeTranslation(0,-1.25,0);

    this.front_trotter_trans.makeTranslation(0,3,0);
    this.front_trotter_rev_trans.makeTranslation(0,-3,0);

    this.back_trotter_trans.makeTranslation(0,3,0);
    this.back_trotter_rev_trans.makeTranslation(0,-3,0);

    this.lid_trans.makeTranslation(0,-1.9,-0.4);
    this.lid_rev_trans.makeTranslation(0,0,0);

    this.pos_trans = new THREE.Matrix4();
    this.scl_trans = new THREE.Matrix4();
};

WurldAnimate.prototype.addTracked = function(key,type,mesh){

    this.tracked[key] = {"type":type,"mesh":mesh,"value":0};
}

WurldAnimate.prototype.removeTracked = function(key){
    delete this.tracked[key];
};

WurldAnimate.prototype.update = function(delta){

    for(var t in this.tracked){
        var obj = this.tracked[t];
        if(obj){
            if(obj.type == 'person') this.updatePerson(obj,delta);
            else if(obj.type == 'chest') this.updateChest(obj,delta);
        }
    }
};

WurldAnimate.prototype.setMatrix = function(mat,pos,scl){

    mat.identity();

    this.pos_trans.makeTranslation(pos.x,pos.y,pos.z);
    this.scl_trans.makeScale(scl.x,scl.y,scl.z);

    mat.multiply(this.scl_trans);
    mat.multiply(this.pos_trans);

    for(var a = 3;a < arguments.length;a++){
        mat.multiply(arguments[a]);
    }
};

WurldAnimate.prototype.updatePig = function(pig,delta){

    if(pig && pig.children){

      var fwd_rot = new THREE.Matrix4();
      var back_rot = new THREE.Matrix4();

      // Parts of a pig;
      // Front Left Trotter = 2
      // Front Right Trotter = 4
      // Back Left Trotter = 5
      // Back Right Trotter = 6

      var ms = Math.cos(((Date.now() % 1000) / 500.0) * (Math.PI * 3));

      fwd_rot.makeRotationZ ( ms * (Math.PI / 6) );
      back_rot.makeRotationZ ( ms * (Math.PI / -6) );

      pig.children[2].matrixAutoUpdate = false;
      pig.children[4].matrixAutoUpdate = false;
      pig.children[5].matrixAutoUpdate = false;
      pig.children[6].matrixAutoUpdate = false;

      this.setMatrix(
          pig.children[2].matrix,
          pig.children[2].position,
          pig.children[2].scale,
          this.front_trotter_trans,
          fwd_rot,
          this.front_trotter_rev_trans
      );

      this.setMatrix(
          pig.children[4].matrix,
          pig.children[4].position,
          pig.children[4].scale,
          this.front_trotter_trans,
          back_rot,
          this.front_trotter_rev_trans
      );

      this.setMatrix(
          pig.children[5].matrix,
          pig.children[5].position,
          pig.children[5].scale,
          this.back_trotter_trans,
          back_rot,
          this.back_trotter_rev_trans
      );

      this.setMatrix(
          pig.children[6].matrix,
          pig.children[6].position,
          pig.children[6].scale,
          this.back_trotter_trans,
          fwd_rot,
          this.back_trotter_rev_trans
      );

    }
}

WurldAnimate.prototype.updatePerson = function(obj,delta){

    if(obj && obj.children) {

        var fwd_rot = new THREE.Matrix4();
        var back_rot = new THREE.Matrix4();

        // Parts of a person;
        // Left arm = 1
        // Right arm = 2
        // Left leg = 5
        // Right leg = 4

        var ms = Math.cos(((Date.now() % 1000) / 500.0) * Math.PI);

        fwd_rot.makeRotationX ( ms * (Math.PI / 4) );
        back_rot.makeRotationX ( ms * (Math.PI / -4) );

        obj.children[1].matrixAutoUpdate = false;
        obj.children[2].matrixAutoUpdate = false;
        obj.children[5].matrixAutoUpdate = false;
        obj.children[4].matrixAutoUpdate = false;

        this.setMatrix(
            obj.children[1].matrix,
            obj.children[1].position,
            obj.children[1].scale,
            this.arm_trans,
            fwd_rot,
            this.arm_rev_trans
        );

        this.setMatrix(
            obj.children[2].matrix,
            obj.children[2].position,
            obj.children[2].scale,
            this.arm_trans,
            back_rot,
            this.arm_rev_trans
        );

        this.setMatrix(
            obj.children[5].matrix,
            obj.children[5].position,
            obj.children[5].scale,
            this.leg_trans,
            back_rot,
            this.leg_rev_trans
        );

        this.setMatrix(
            obj.children[4].matrix,
            obj.children[4].position,
            obj.children[4].scale,
            this.leg_trans,
            fwd_rot,
            this.leg_rev_trans
        );
    }
};

WurldAnimate.prototype.resetPerson = function(obj){

    if(obj && obj.children){
        obj.children[1].matrixAutoUpdate = true;
        obj.children[2].matrixAutoUpdate = true;
        obj.children[5].matrixAutoUpdate = true;
        obj.children[4].matrixAutoUpdate = true;
    }
};

WurldAnimate.prototype.openChest = function(obj,delta){

    if(obj && obj.children) {

        var up_rot = new THREE.Matrix4();

        up_rot.makeRotationX ( Math.PI / -4 );

        obj.children[0].matrixAutoUpdate = false;

        this.setMatrix(
            obj.children[0].matrix,
            obj.children[0].position,
            obj.children[0].scale,
            this.lid_trans,
            up_rot,
            this.lid_rev_trans
        );
    }
};

WurldAnimate.prototype.closeChest = function(obj,delta){

    if(obj && obj.children){
        obj.children[0].matrixAutoUpdate = true;
    }
};
