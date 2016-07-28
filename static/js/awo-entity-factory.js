var WurldEntityFactory = function(){
    
    this.tree_roots = 1.0;
};
    
WurldEntityFactory.prototype.createEntities = function(parent,arr){
    
    W_log('Creating entities');
    
    var list = null;
    
    if(arr){
        
        list = [];
        
        for(var i = 0;i < arr.length;i++){
            if(this[arr[i].entity_type]) list.push(this[arr[i].entity_type](parent,arr[i]));
            else W_log('Unknown entity type "'+arr[i].entity_type+'".');
        }
    }
    
    return list;
};

WurldEntityFactory.prototype.destroyChildren = function(mesh){

    if(mesh && mesh.children){
        for(var c = 0;c < mesh.children.length;c++){

            mesh.remove(mesh.children[c]);

            this.destroyChildren(mesh.children[c]);
                
            if(mesh.children[c]){      
                if(mesh.children[c].material) mesh.children[c].material.dispose();
                if(mesh.children[c].geometry) mesh.children[c].geometry.dispose();
            }
        }
    }
};

WurldEntityFactory.prototype.destroyEntities = function(parent,arr){
    
    W_log('Destroying entities');
    
    if(arr){
        for(var e = 0;e < arr.length;e++){
    
            var obj = arr[e];
            
            if(obj){
                
                if(obj.mesh){
                    
                    W_log('Destroying a '+obj.entity_type);
                        
                    // TODO: Bad! Don't ever destroy chests, to attempt to fix a weird error
                    if(obj.mesh.osn_conversation){
                        WURLD.chests[obj.mesh.osn_conversation] = null;
                        delete WURLD.chests[obj.mesh.osn_conversation];
        
                        parent.remove(obj.mesh);
                    }
                    else{
                        parent.remove(obj.mesh);
                        
                        this.destroyChildren(obj.mesh);
                    
                        if(obj.mesh.material) obj.mesh.material.dispose();
                        if(obj.mesh.geometry) obj.mesh.geometry.dispose();
                        obj.mesh = null;
                    }
                }
				
				WURLD.physics.destroyBody(obj.body);
				
                obj = null;
            }
        }
    }
}

WurldEntityFactory.prototype.getHeight = function(parent,def){
    
   var top = 4000;
    
    var ray = new THREE.Raycaster(new THREE.Vector3( def.x, def.y, top ),new THREE.Vector3( 0, 0, -1 ));
    var intersects = ray.intersectObject( parent );

	for ( var i = 0; i < intersects.length; i++ ) {
		return top - intersects[ i ].distance;
	}
	return 0;
};

WurldEntityFactory.prototype.box = function(parent,def){

    W_log('Creating a box');
    
    var obj = {'entity_type':'box'};
    
    var z = this.getHeight(parent,def) + (def.size / 2);
    
    obj.geometry = new THREE.BoxGeometry( def.size, def.size, def.size );
    obj.material = new THREE.MeshLambertMaterial({
        color: WurldColors.lookup(def.colorName),
        shading: THREE.FlatShading
    });
    obj.mesh = new THREE.Mesh(obj.geometry,obj.material);
    obj.mesh.position.z = z;
    obj.mesh.position.x = def.x;
    obj.mesh.position.y = def.y;
    obj.mesh.castShadow = true;
    obj.mesh.rotation.z = (Math.PI * def.rotation) / 180.0;
    
    parent.add(obj.mesh);
    
    return obj;
};

WurldEntityFactory.prototype.oakTree = function(parent,def){
    
    W_log('Creating an oak tree');
    
    var height = def.height;
    var width = def.width;
    var branches = def.branches;
    
    var obj = {'entity_type':'oakTree'};

    var z = this.getHeight(parent,def);
    if(z < 0) return obj; // No trees under water!

    var trunkMaterial = new THREE.MeshLambertMaterial({color: WurldColors.Brown,shading: THREE.FlatShading});
    var leafMaterial = new THREE.MeshLambertMaterial({color:WurldColors.ForestGreen,shading:THREE.FlatShading});
    
    // Main mesh of the tree is the trunk, everything else is relative (and attached to) that
    var trunkGeometry = new THREE.TubeGeometry(
        new THREE.LineCurve3(new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,height + (width * 3))),
        10,
        width,
        8,
        false
    );

    obj.mesh = new THREE.Mesh(trunkGeometry,trunkMaterial);
    obj.mesh.position.z = z - this.tree_roots;
    obj.mesh.position.x = def.x;
    obj.mesh.position.y = def.y;
    obj.mesh.rotation.z = (Math.PI * def.rotation) / 180.0;
    obj.mesh.castShadow = true;

    // Create something to approximate physical collisions
    obj.body = WURLD.physics.createCircleBody(def.x + parent.position.x, -(def.y + parent.position.y), width);
	
    // Create the leaves
    var leafGeo = new THREE.DodecahedronGeometry(width * 3);
    var leafMesh = new THREE.Mesh(leafGeo,leafMaterial);
    leafMesh.position.set(0,0,height + (width * 3));
    leafMesh.castShadow = true;
    
    // Add the leaves to the tree
    obj.mesh.add(leafMesh);

    // Add the branches
    var bpos = height * 0.25;
    var blen = height;
    var bwid = width;
    for(var b = 0;b < branches;b++){
        
        blen *= 0.75;
        bwid *= 0.75;
        
        var off = (blen + (bwid * 3)) * 0.707;
        var mod = b % 4;
        var offx = (mod == 0)?off:(mod==2)?-off:0;
        var offy = (mod == 1)?off:(mod==3)?-off:0;
        
        var bgeo = new THREE.TubeGeometry(
            new THREE.LineCurve3(new THREE.Vector3(0,0,0),new THREE.Vector3(offx,offy,off)),
            10,
            bwid,
            8,
            false
        );
        
        var bmes = new THREE.Mesh(bgeo,trunkMaterial);
        bmes.position.set(0,0,bpos);
        bmes.castShadow = true;

        // Add the branch to the tree
        obj.mesh.add(bmes);
        
        // Create the leaves on the branch
        var lgeo = new THREE.DodecahedronGeometry(bwid * 3);
        var lmes = new THREE.Mesh(lgeo,leafMaterial);
        lmes.position.set(offx,offy,off + bpos);
        lmes.castShadow = true;
        
        bpos += bpos * 0.5;
        
        obj.mesh.add(lmes);
    }
    
    parent.add(obj.mesh);
    return obj;
};

WurldEntityFactory.prototype.firTree = function(parent,def){
    
    W_log('Creating a fir tree');
    
    var height = def.height;
    var width = def.width;
    var canopies = def.canopies;
    var canopy_rot = Math.PI / 8;
    
    var obj = {'entity_type':'firTree'};

    var z = this.getHeight(parent,def);
    if(z < 0) return obj; // No trees under water!

    var trunkMaterial = new THREE.MeshLambertMaterial({color: WurldColors.Sienna,shading: THREE.FlatShading});
    var leafMaterial = new THREE.MeshLambertMaterial({color:WurldColors.SeaGreen,shading:THREE.FlatShading});
    
    // Main mesh of the tree is the trunk, everything else is relative (and attached to) that
    var trunkGeometry = new THREE.TubeGeometry(
        new THREE.LineCurve3(new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,height)),
        10,
        width,
        8,
        false
    );

    obj.mesh = new THREE.Mesh(trunkGeometry,trunkMaterial);
    obj.mesh.position.z = z - this.tree_roots;
    obj.mesh.position.x = def.x;
    obj.mesh.position.y = def.y;
    obj.mesh.castShadow = true;
    obj.mesh.rotation.z = (Math.PI * def.rotation) / 180.0;

    // Create something to approximate physical collisions
    obj.body = WURLD.physics.createCircleBody(def.x + parent.position.x, -(def.y + parent.position.y), width);
	
    // Create the canopies
    var wid = width * 4
    for(var c = 0;c < canopies;c++){
        var cgeo = new THREE.TetrahedronGeometry(wid);
        cgeo.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 1, -1, 0 ).normalize(), Math.atan( Math.sqrt(2)) ) );
        
        cgeo.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 0, 0, 1 ).normalize(), c * canopy_rot ));
    
        var cmesh = new THREE.Mesh(cgeo,leafMaterial);
        cmesh.position.set(0,0,height + (c * wid * 0.9));
        cmesh.castShadow = true;
        
        wid *= 0.9;
        
        // Add the canopy to the tree
        obj.mesh.add(cmesh);
    }

    parent.add(obj.mesh);
    return obj;
};

WurldEntityFactory.prototype.rock = function(parent,def){
    
    W_log('Creating a rock');
    
    var size= def.size;
    var color=Math.floor(def.color);
    var type=Math.floor(def.type);
    
    var obj = {'entity_type':'rock'};

    var z = this.getHeight(parent,def);

    var material = new THREE.MeshLambertMaterial({
        color: WurldColors.lookup(
            (color==0)?'DarkGray':
            (color==1)?'DimGray':
            (color==2)?'LightSlateGray':
            (color==3)?'SlateGray':'Gray'
        ),
        shading: THREE.FlatShading
    });

    var geometry = 
        (type==0)?new THREE.DodecahedronGeometry(size):
        (type==1)?new THREE.IcosahedronGeometry(size):
        (type==2)?new THREE.OctahedronGeometry(size):
        (type==3)?new THREE.TetrahedronGeometry(size):new THREE.BoxGeometry(size,size,size);
      
    if(type == 3){
        geometry.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 1, -1, 0 ).normalize(), Math.atan( Math.sqrt(2)) ) );
    }  
    
    obj.mesh = new THREE.Mesh(geometry,material);
    obj.mesh.position.z = z + (size*0.25);
    obj.mesh.position.x = def.x;
    obj.mesh.position.y = def.y;
    obj.mesh.castShadow = true;
    obj.mesh.rotation.z = (Math.PI * def.rotation) / 180.0;

	// Create something to approximate physical collisions
    obj.body = WURLD.physics.createCircleBody(def.x + parent.position.x, -(def.y + parent.position.y), size);
	
    parent.add(obj.mesh);
    return obj;
};

WurldEntityFactory.prototype.palmTree = function(parent,def){

    W_log('Creating a palm tree');
    
    var length = def.length;
    var width = def.width;
    var bend = Math.min(def.bend,def.length*0.75);
    var leaves = def.leaves;
    var leaf_width = Math.min(def.leaf_width,def.length);
    var leaf_length = def.leaf_length;
    
    var obj = {'entity_type':'palmTree'};

    var z = this.getHeight(parent,def);
    if(z < 0) return obj; // No trees under water!

    var trunkMaterial = new THREE.MeshLambertMaterial({
        color: WurldColors.Peru,
        shading: THREE.FlatShading,
        side:THREE.DoubleSide
    });
    var leafMaterial = new THREE.MeshLambertMaterial({
        color:WurldColors.MediumSeaGreen,
        shading:THREE.FlatShading,
        side:THREE.DoubleSide
    });
    
    var curve = new THREE.QuadraticBezierCurve3(
	    new THREE.Vector3( 0, 0, 0 ),
	    new THREE.Vector3( 0, 0, length-bend ),
	    new THREE.Vector3( bend, 0, length )
    );

    // Main mesh of the tree is the trunk, everything else is relative (and attached to) that
    var trunkGeometry = new THREE.TubeGeometry(
        curve,
        10,
        width,
        8,
        false,
        function(u){
            // Taper
            return Math.max(1.0 - u,0.1);
        } 
    );

    obj.mesh = new THREE.Mesh(trunkGeometry,trunkMaterial);
    obj.mesh.position.z = z - this.tree_roots;
    obj.mesh.position.x = def.x;
    obj.mesh.position.y = def.y;
    obj.mesh.castShadow = true;
    obj.mesh.rotation.z = (Math.PI * def.rotation) / 180.0;

    // Create something to approximate physical collisions
    obj.body = WURLD.physics.createCircleBody(def.x + parent.position.x, -(def.y + parent.position.y), width);
			
    var top_normal = trunkGeometry.binormals[trunkGeometry.binormals.length - 1]; // or normals?
    var up_normal = new THREE.Vector3(1,0,0);
    
    // Add a "top" on the tree, to attach the leaves to
    // var top_geo = new THREE.DodecahedronGeometry(width);
    var top_mesh = new THREE.Object3D();//new THREE.Mesh(top_geo,trunkMaterial);
    top_mesh.position.set(bend,0,length);
    top_mesh.quaternion.setFromUnitVectors(up_normal,top_normal);
    
    //top_mesh.castShadow = true;
    obj.mesh.add(top_mesh);
    
    // Create the leaves
    var leaf_shape = new THREE.Shape();
    leaf_shape.moveTo( 0,0 );
    leaf_shape.lineTo( 0, leaf_width );
    leaf_shape.lineTo( leaf_length/2, leaf_width * 1.5);
    leaf_shape.lineTo( leaf_length, leaf_width /2);
    leaf_shape.lineTo( leaf_length, -leaf_width /2);
    leaf_shape.lineTo( leaf_length/2, -leaf_width * 1.5);
    leaf_shape.lineTo( 0, -leaf_width );
    leaf_shape.lineTo( 0, 0 );

    var leaf_geom = new THREE.ShapeGeometry( leaf_shape );
    leaf_geom.applyMatrix((new THREE.Matrix4()).makeRotationY(20 * (Math.PI / 180)))
    for(var l = 0;l < leaves;l++){
        var leaf_mesh = new THREE.Mesh( leaf_geom, leafMaterial ) ;	
        leaf_mesh.rotation.z = ((2 * Math.PI) / leaves) * l;
        leaf_mesh.castShadow = true;
        top_mesh.add(leaf_mesh);
    }

    parent.add(obj.mesh);
    return obj;
};

WurldEntityFactory.prototype.chest = function(parent,def){
  
    W_log('Creating a chest for OSN Conversation: '+def.osn_conversation);
    
    var obj = {'entity_type':'chest'};
    
    var new_chest = WURLD.models['chest_model'].clone();
    var new_material = WURLD.models['chest_model'].children[0].material.clone();
        
    for(var i = 0;i < new_chest.children.length;i++){
	    new_chest.children[i].material = new_material;    
    }

    new_chest.osn_conversation = def.osn_conversation;
    
    new_chest.rotation.x = Math.PI/2;
    new_chest.position.setZ(this.getHeight(parent,def));
    new_chest.position.setX(def.x);
    new_chest.position.setY(def.y);
    if(def.rotation) new_chest.rotation.y = (Math.PI * def.rotation) / 180.0;

    // Create something to approximate physical collisions
    obj.body = WURLD.physics.createBoxBody(def.x + parent.position.x, -(def.y + parent.position.y), 4,8,def.rotation);

    obj.mesh = new_chest;
    parent.add( obj.mesh );
          
    WURLD.chests[def.osn_conversation] = new_chest;
                        
    return obj;
};
