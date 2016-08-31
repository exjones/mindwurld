var WurldSocket = function(){
}

WurldSocket.prototype.connected = function(data){
  W_log('Connected to server, session ID is',data.sessionID);
}

WurldSocket.prototype.action = function(data){
  W_log('Server says to perform action',data.op);

  // Flash the icon that relates to the received action
  $('#w-action-'+data.op).animate({backgroundColor:"#f80"},250).animate({backgroundColor:"#fff"},500);

  // People can always still do these things via the client
  if(data.op == 'toggle_music') WURLD.sound.toggleMusic();
  else if(data.op == 'prev_skin') WURLD.prev_skin();
  else if(data.op == 'next_skin') WURLD.next_skin();
  else if(data.op == 'reload_page') window.location.reload();
  // These are the things (thinks, ha!) people should do by remote control
  else if(data.op == 'love') WURLD.create_pig();
  else if(data.op == 'lift') WURLD.try_open_chest();
  else if(data.op == 'push') WURLD.try_free_pigs();
  else if(data.op == 'jump') WURLD.do_jump();
  else if(data.op == 'fire') WURLD.fire_pokeball();
  // These things people may do by remote control
  else if(data.op == 'left') WURLD.input.do_left_turn();
  else if(data.op == 'walk') WURLD.input.do_walk();
  else if(data.op == 'right') WURLD.input.do_right_turn();
  else W_warn('Unrecognized action received: '+data.op);
}

WurldSocket.prototype.listen = function(){

  this.channel = io();

  var thiz = this;
  this.channel.on('connected',function(data){thiz.connected(data);});
  this.channel.on('action',function(data){thiz.action(data);});
}

WurldSocket.prototype.emit = function(msg) {
  this.channel.emit('message', msg);
}
