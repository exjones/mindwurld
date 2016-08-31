/*
A server that listens on two ports to;
- serve the 3D world, the supporting resources, and its map chunks to browsers
- provide a simple (temporary) mobile ui to remotely control the 3D worlds
*/
console.log('\nStarting up the mindwurld server');
console.log('================================');

var
	server_port  = process.env.port || 4004,
	fs         = require('fs'),
  path       = require('path'),
	uuid       = require('node-uuid'),
	http       = require('http'),
  express 	 = require('express'),
	socket     = require('socket.io'),
  bodyParser = require('body-parser'),
	mqtt       = require('mqtt'),
	nedb       = require('nedb'),
	db         = new nedb({filename:'data/highscores.db',autoload:true}),
  jsonParser = bodyParser.json(),
  	// MiP Robot
  	robot 	= require('./robot.js'),
	// The servers allow browser clients to connect and display the 3D world
	// and the /ctrlr path is what mobile clients can connect to in order to control the world remotely
  wurld 	   = express(),
	server     = http.createServer(wurld),
  // Either connect to a local MQTT broker, or the mosca test instance
	// broker     = mqtt.connect('mqtt://localhost:6006');
	broker     = mqtt.connect('mqtt://test.mosca.io');

// try to find a mip robot
robot.discover();

// Find all the images that we think are skins, so the client can switch between them
var dir = path.join(__dirname,'static/img');
var files =	fs.readdirSync(dir);
var skins = [];
files.forEach(function(f) {
	if(fs.statSync(path.join(dir,f)).isFile()){
		if(f.indexOf('_skin.png') >= 0) {
			skins.push(f.replace(/_skin.png/,''));
		}
	}
});

// Both servers get their static resources from the same location
wurld.use(express.static('static'));

// Default index files for the root path and the mobile client
wurld.get('/', function (req, res) {
  res.sendFile(__dirname + '/wurld.html');
});

wurld.get('/ctrlr', function (req, res) {
  res.sendFile(__dirname + '/ctrlr.html');
});

// Send the list of available skins
wurld.get('/available-skins.:format', function (req, res) {
	if(req.params.format == 'json') res.json(skins);
	else if(req.params.format == 'js'){
		res.set('Content-Type','text/javascript');
		res.send('WURLD_SKINS='+JSON.stringify(skins)+';');
	}
	else res.status(404).send('No format was specified.');
});

// Send the settings
wurld.get('/wurld-settings.js',function(req,res){
	res.sendFile(path.join(__dirname,'wurld-settings.js'));
});

// Send the map data and handle other posts from the browser client
wurld.post('/POST', jsonParser, function (req, res) {

	var obj = req.body;

	if(obj.op == 'get_map'){
		console.log('Getting map '+obj.map_id);
		res.sendFile(__dirname + '/maps/map_'+obj.map_id+'/meta.json');
	}
	else if(obj.op == 'get_chunk'){
		console.log('Getting chunk '+obj.i+','+obj.j+' from map '+obj.map_id);
		res.sendFile(__dirname + '/maps/map_'+obj.map_id+'/chunk_'+obj.map_id+'_'+obj.i+'_'+obj.j+'.json');
	}
    else res.send({success:true});
});

// Record something in the highscore table
wurld.post('/SCORE', jsonParser, function(req,res){
	db.insert(req.body,function(err,newDoc){
			if(err) res.json(err);
			else res.json(newDoc);
	});
});

// Get the data from the highscore table
wurld.get('/SCORES',function(req,res){
	db.find({}).sort({total_score:-1,time_stamp:1}).limit(20).exec(function(err,docs){
		if(err) res.json(err);
		else res.json(docs);
	});
});

// Wurld server connects to the client via socket.io
var io = socket(server);
io.on('connection',function(client){
	client.sessionID = uuid();
	client.emit('connected',{sessionID:client.sessionID});
  	console.log('Client connected',client.sessionID);

  	// RXIE: listen to game event in the browser
  	client.on('message', function(msg){
  		console.log("message from game: ", msg);

  		// ask the MiPRobot to perform action
  		robot.perform(msg);
  	});
});

// The MQTT broker subscribes to the mindwurld topic
broker.on('connect',function(){
	console.log('MQTT broker connected, listening for topic mindwurld');
	broker.subscribe('mindwurld');
});

// Capture the controller app actions and send it on to the MQTT broker
wurld.post('/ctrlr/ACTION',jsonParser,function(req,res){

	var obj = req.body;
	console.log('Received an action of '+obj.op);
	if(typeof obj.comm == 'undefined' || obj.comm == 'mqtt'){
		broker.publish('mindwurld',JSON.stringify(obj));
		res.send({success:true,msg:'Published message for "'+obj.op+'" to MQTT'});
	}
	else if(obj.comm == 'sock'){
		io.emit('action',obj);
		res.send({success:true,msg:'Emitted action for "'+obj.op+'" to Socket'});
	}
	else{
		res.send({success:false,msg:'Unknown communication method "'+obj.comm+'"'});
	}
});

// Any messages the broker gets, which could come from the mobile client, or anywhere, get sent to the wurld client
broker.on('message',function(topic,message){
	var obj = JSON.parse(message.toString());
	console.log('Received a message for action',obj.op);
	io.emit('action',obj);
});

// Start up the server
server.listen(server_port, function () {
  console.log('Wurld server is listening on '+server_port);
});
