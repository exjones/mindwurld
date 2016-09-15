var wowweemip = require("wowweemip");
var mipFinder = new wowweemip.Finder();
var MiPRobot = wowweemip.Robot;

// var sounds = require("./constants.json")["SOUND_FILE"];
var actions = require("./robot-actions.js").actions;
var selectedRobot = null;

// We don't have an effective way to determine if a MiP Robot is lost connection, so we don't have a good way to know
// when to actively re-connect.

// If for whatever reason the connection is lost, a fool-proof way is to reboot robot and restart game server.
// The browser client can re-connect to game even with game server restart.

var exports = module.exports = {};

// scan to look for MiP Robot
exports.discover = scanner = function() {
    console.log("trying to find a MiP...");
    mipFinder.scan(function(err, robots) {
        if (err != null) {
            console.log(err);
            selectedRobot = null;
            return;
        }

        //connect to first mip
        var selectedMip = robots[0];
        mipFinder.connect(selectedMip, function(err) {
            if (err != null) {
                console.log(err);
                selectedRobot = null;
                return;
            }

            console.log("connected");

            //move toward a little to indicate
            selectedMip.driveDistanceByCm(2, 360, function(err) {
                console.log("moving a little bit");
            });

            // too noisy, quiet it down
            selectedMip.setMipVolumeLevel(2);

            //RXIE: play out all the sounds
           /* 
            var filenames = Object.keys(sounds);
            for( var i=0; i < filenames.length; i++ ) {
                delaySound( filenames[i], i*2000 );
            }
           */ 
            selectedRobot = selectedMip;
        });
    });
}

exports.perform = function(msg) {
    // console.log("robot to perform: " + msg);

    if( selectedRobot === null ) {
        console.log("no robot is in sight...  ignore robot performance\n");
        return;
    }

    // By now we have "selectedRobot" to talk to, so it would work most of time. In case we lost connection to robot, 
    // we do not have a way of knowing that, and so not knowing to reset "selectRobot" to null
    // For the time being, just reboot the robot, kill game server and restart it, to recover the Robot performance.
    var sequence = actions[msg];

    for(var i=0; i < sequence.length; i++ ) {
        var action = sequence[i];

        console.log("action: ", action);
        delayedCall(action);
    }
}

var delayedCall = function(action) {
        var p = action;

        setTimeout( function() { 
            console.log("debug: ", action[0], p[1], p[3]);
            action[2].call(selectedRobot, p[3], p[4], p[5], p[6], p[7], p[8], p[9]); 
        }, p[1] );
}

var delaySound = function(sound, delay) {
    setTimeout( function() {
            console.log("sound: " + sound);
            selectedRobot.playMipSound(sound, 0, 64);
    }, delay);
}

