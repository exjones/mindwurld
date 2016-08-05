/*
A server that listens on two ports to;
- serve the 3D world, the supporting resources, and its map chunks to browsers
- provide a simple (temporary) mobile ui to remotely control the 3D worlds
*/
console.log('\nStarting up the mindwurld servers');
console.log('=================================');

var
	wurld_port = 4004,
	ctrlr_port  = 5005,
	fs         = require('fs'),
  path       = require('path'),
	uuid       = require('node-uuid'),
	http       = require('http'),
  express 	 = require('express'),
	socket     = require('socket.io'),
  bodyParser = require('body-parser'),
  jsonParser = bodyParser.json(),
	// The "wurld" server allows browser clients to connect and display the 3D world
	// The "ctrlr" server is what mobile clients can connect to in order to control the world remotely
  wurld 	   = express(),
	server     = http.createServer(wurld),
	ctrlr      = express();

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
ctrlr.use(express.static('static'));

// The two servers use different deafult files
wurld.get('/', function (req, res) {
  res.sendFile(__dirname + '/wurld.html');
});

ctrlr.get('/', function (req, res) {
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
wurld.post('/COMET_POST', jsonParser, function (req, res) {

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

// Wurld server connects to the client via socket.io
var io = socket(server);
io.on('connection',function(client){
	client.sessionID = uuid();
	client.emit('connected',{sessionID:client.sessionID});
  console.log('Client connected',client.sessionID);
});

// Capture the controller app actions and broadcast it to the clients
ctrlr.post('/ACTION',jsonParser,function(req,res){

	var obj = req.body;
	console.log('Received an action of '+obj.op);
	io.emit('action',obj);
	res.send({success:true,msg:'Broadcast action "'+obj.op+'"'});
});

// Start up the two servers
server.listen(wurld_port, function () {
  console.log('Wurld server is listening on '+wurld_port);
});

ctrlr.listen(ctrlr_port, function () {
  console.log('Ctrlr is listening on '+ctrlr_port);
});
