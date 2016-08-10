var WurldSocket = function(){
}

WurldSocket.prototype.connected = function(data){
  W_log('Connected to server, session ID is',data.sessionID);
}

WurldSocket.prototype.action = function(data){
  W_log('Server says to perform action',data.op);

  if(data.op == 'toggle_music') WURLD.sound.toggleMusic();
  else if(data.op == 'prev_skin') WURLD.prev_skin();
  else if(data.op == 'next_skin') WURLD.next_skin();
  else if(data.op == 'spawn_pig') WURLD.create_pig();
  else if(data.op == 'open_chest') WURLD.try_open_chest();
  else if(data.op == 'jump') WURLD.do_jump();
  else W_warn('Unrecognized action received: '+data.op);
}

WurldSocket.prototype.listen = function(){

  this.channel = io();

  var thiz = this;
  this.channel.on('connected',function(data){thiz.connected(data);});
  this.channel.on('action',function(data){thiz.action(data);});
}
