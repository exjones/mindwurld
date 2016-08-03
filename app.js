var
	port    	 = process.env.PORT || 4004,
	fs         = require("fs"),
  path       = require("path"),
  express 	 = require('express'),
  bodyParser = require('body-parser'),
  jsonParser = bodyParser.json(),
  app 		   = express();

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

app.use(express.static('static'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/skins.:format', function (req, res) {
	if(req.params.format == 'json') res.json(skins);
	else if(req.params.format == 'js'){
		res.set('Content-Type','text/javascript');
		res.send('WURLD_SKINS='+JSON.stringify(skins)+';');
	}
	else res.status(404).send('No format was specified.');
});

app.post('/COMET_POST', jsonParser, function (req, res) {

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

app.listen(port, function () {
  console.log('The mindwurld server is listening on port '+port);
});
