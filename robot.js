var wowweemip = require("wowweemip");
var mipFinder = new wowweemip.Finder();
var MiPRobot = wowweemip.Robot;

var actions = require("./robot-actions.js").actions;
var selectedRobot = null;

var connectMip = function() {
    if( selectedRobot !== null) {
        return;
    }

    var count = 0; 

    // retry several times
    while( selectedRobot === null && count < 3 ) {
        scanner();
    }
}

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
            selectedMip.driveDistanceByCm(10, 180, function(err) {
                console.log("moving a little bit");
            });

            selectedRobot = selectedMip;
        });
    });
}

exports.perform = function(msg) {
    console.log("robot to perform: " + msg);

    if( selectedRobot === null ) {
        console.log("no robot is in sight...  ignore robot performance");
        return;
    }

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

