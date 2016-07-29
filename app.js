var 
	port    	= process.env.PORT || 4004,
    express 	= require('express'),
    bodyParser  = require('body-parser'),
    jsonParser  = bodyParser.json(),
    app 		= express();

app.use(express.static('static'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
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
  console.log('mindwurld app listening on port '+port);
});