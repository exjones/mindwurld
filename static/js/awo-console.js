var WURLD = null;

var W_CONSOLE = {
   
    el: null,
    listener: null,
    
    init: function(){
        
        W_CONSOLE.el = $('input#P2_POST_MESSAGE.text_field');
    
        W_CONSOLE.listener = new window.keypress.Listener();
        
        W_CONSOLE.listener.register_combo({
            keys: 'enter',
            prevent_default: true,
            prevent_repeat: true,
            on_keydown: function(e){
                W_CONSOLE.exec_command(W_CONSOLE.el.val(),true);
            }
        });

        W_CONSOLE.listener.register_combo({
            keys:'escape',
            prevent_repeat: true,
            prevent_default: true,
            on_keydown: function(){
                WURLD.closeConsole();
            }
        });

        W_CONSOLE.focusAndReset();
        
        // Start listening for messages
        W_CONSOLE.start_listening();
    },
    
    exec_command: function(cmd,focus){
        
        WURLD.sendCommand(cmd,function(data){
            if(data && data.response){
                        
                if(data.response.ok) WURLD.sound.ok();
                else WURLD.sound.error();
                        
                // Response told us to execute something
                if(data.response.exec_cmd){
                    W_log("Executing command: "+data.response.exec_cmd);
                    eval(data.response.exec_cmd);
                }
                
                if(focus) W_CONSOLE.focusAndReset();
            }
            else{
                W_CONSOLE.addMessage({
                    sent_by: '',
                    type: 'error',
                    chat_text: 'Unable to send command. Weird.'
                })
            }
        });
    },
    
    start_listening: function(){
        if(parent && parent.WURLD){
            WURLD = parent.WURLD;
            WURLD.comet_poll();
        }    
        else{
            setTimeout(W_CONSOLE.start_listening,1000);
        }
    },
    
    focusAndReset: function(){

        W_CONSOLE.el.val('/');
        var len = W_CONSOLE.el.val().length * 2;

        W_CONSOLE.el.attr('autocomplete','off');
        W_CONSOLE.el.focus();
        W_CONSOLE.el[0].setSelectionRange(len,len);
    },

    scrollToBottom: function(){
        $("#w-message-list").animate({scrollTop:$("#w-message-list")[0].scrollHeight}, 1000);
    },

    addMessages: function(arr){
        
        for(var i = 0;i < arr.length;i++){
            W_CONSOLE.append_html(arr[i]); 
        }
        W_CONSOLE.scrollToBottom(); 
    },
    
    addMessage: function(msg){

        W_CONSOLE.append_html(msg);        
        W_CONSOLE.scrollToBottom();    
    },
    
    append_html: function(msg){
        
        var who = msg.sent_by;
        if(typeof who != 'undefined' && who && who.indexOf('@')){
            who = who.substr(0,who.indexOf('@'));
        }
        else who = '';
        
        var msg_html = 
          '<div class="w-msg-'+msg.type+'">'+
          '<span class="w-msg-who">'+who+'</span>'+
          '<span class="w-msg-text">'+msg.chat_text+'</span>'+
          '</div>';
         
        // W_log('Adding message',msg);
        $("#w-message-list").append(msg_html);

    }
};
