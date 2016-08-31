var wowweemip = require("wowweemip");
var MiPRobot = wowweemip.Robot;

/*
 * configure a sequence of actions to be performed in response to a game event
 * the sequence is indicated by the "start time" (milliseconds since game event) in the second column
 */
exports.actions = {
    "chest_opened": [
			["Play Sound", 500, MiPRobot.prototype.playMipSound, "MIP_SINGING", 0, 64, cb],
			["LED to Red", 1000, MiPRobot.prototype.setMipChestLedWithColor, 0xff, 0x00, 0x00, 0x00, cb],
			["LED to Green", 2000, MiPRobot.prototype.setMipChestLedWithColor, 0x00, 0xff, 0x00, 0x00, cb],
			["LED to Blue", 3000, MiPRobot.prototype.setMipChestLedWithColor, 0x00, 0x00, 0xff, 0x00, cb]
		],

	"pig_spawned": [
			["Play Sound", 500, MiPRobot.prototype.playMipSound, "ONEKHZ_500MS_8K16BIT", 0, 64, cb],
			["LED to Red", 4000, MiPRobot.prototype.setMipChestLedWithColor, 0xff, 0x00, 0x00, 0x00, cb]
		],

	"pigs_freed": [
			["Play Sound", 2000, MiPRobot.prototype.playMipSound, "ONEKHZ_500MS_8K16BIT", 0, 64, cb],
			["LED to Red", 5, MiPRobot.prototype.setMipChestLedWithColor, 0xff, 0x00, 0x00, 0x00, cb]
		]

}

function cb(err) {
	// console.log("robot callback error: ", err);
}
