var wowweemip = require("wowweemip");
var MiPRobot = wowweemip.Robot;

/*
 * configure a sequence of actions to be performed in response to a game event
 * the sequence is indicated by the "start time" (milliseconds since game event) in the second column
 */
exports.actions = {
	"go_forward": [
			["Play Sound", 10, MiPRobot.prototype.playMipSound, "SOUND_BOOST", 0, 2, cb],
			["LED to Yellow", 100, MiPRobot.prototype.setMipChestLedWithColor, 0x00, 0xff, 0xff, 0x00, cb],
			["LED to Green", 300, MiPRobot.prototype.setMipChestLedWithColor, 0x00, 0xff, 0x00, 0x00, cb]
		],

	"go_backward": [
			["Play Sound", 10, MiPRobot.prototype.playMipSound, "MIP_WHISTLING", 0, 8, cb],
			["Drive Backward", 150, MiPRobot.prototype.driveDistanceByCm, -2, 0, cb],
			["LED to Yellow", 200, MiPRobot.prototype.setMipChestLedWithColor, 0xff, 0xff, 0x00, 0x00, cb]
		],	

	"go_stop": [
			["LED to Red", 200, MiPRobot.prototype.setMipChestLedWithColor, 0xff, 0x00, 0x00, 0x00, cb]
		],

	"turn_left": [
			["Play Sound", 10, MiPRobot.prototype.playMipSound, "MIP_FALL_OVER_1", 0, 8, cb],
			["Punch Left", 150, MiPRobot.prototype.punchLeftWithSpeed, 24, cb],
			["LED to Green", 200, MiPRobot.prototype.setMipChestLedWithColor, 0x00, 0xff, 0x00, 0x00, cb]
		],

	"turn_right": [
			["Play Sound", 10, MiPRobot.prototype.playMipSound, "SOUND_ZINGS", 0, 8, cb],
			["Punch Right", 150, MiPRobot.prototype.punchRightWithSpeed, 24, cb],
			["LED to Green", 200, MiPRobot.prototype.setMipChestLedWithColor, 0x00, 0xff, 0x00, 0x00, cb]
		],

	"turn_stop": [
			["LED to Red", 200, MiPRobot.prototype.setMipChestLedWithColor, 0xff, 0x00, 0x00, 0x00, cb]
		],

    "chest_opened": [
			["Play Sound", 10, MiPRobot.prototype.playMipSound, "MIP_LOOP_2", 0, 32, cb],
			["Punch Left", 250, MiPRobot.prototype.punchLeftWithSpeed, 24, cb],
			["Punch Left", 750, MiPRobot.prototype.punchLeftWithSpeed, 24, cb],
			["Punch Left", 1250, MiPRobot.prototype.punchLeftWithSpeed, 24, cb],
			["Punch Left", 1750, MiPRobot.prototype.punchLeftWithSpeed, 24, cb],
			["LED to Red", 10, MiPRobot.prototype.setMipChestLedWithColor, 0xff, 0x00, 0x00, 0x00, cb],
			["LED to Green", 1000, MiPRobot.prototype.setMipChestLedWithColor, 0x00, 0xff, 0x00, 0x00, cb],
			["LED to Blue", 2000, MiPRobot.prototype.setMipChestLedWithColor, 0x00, 0x00, 0xff, 0x00, cb]
		],

	"ball_thrown": [
			["Play Sound", 10, MiPRobot.prototype.playMipSound, "MIP_TRUMPET", 0, 32, cb],
			["LED to Red", 1000, MiPRobot.prototype.setMipChestLedWithColor, 0xff, 0x00, 0x00, 0x00, cb],
			["LED to Yellow", 1500, MiPRobot.prototype.setMipChestLedWithColor, 0xff, 0xff, 0x00, 0x00, cb],			
			["LED to Red", 2000, MiPRobot.prototype.setMipChestLedWithColor, 0xff, 0x00, 0x00, 0x00, cb],
			["LED to Yellow", 2500, MiPRobot.prototype.setMipChestLedWithColor, 0xff, 0xff, 0x00, 0x00, cb],			
			["LED to Red", 3000, MiPRobot.prototype.setMipChestLedWithColor, 0xff, 0x00, 0x00, 0x00, cb]
		],

	"pig_spawned": [
			["Play Sound", 10, MiPRobot.prototype.playMipSound, "MIP_IN_LOVE", 0, 32, cb],
			["Drive Forward", 150, MiPRobot.prototype.driveDistanceByCm, 2, 0, cb],
			["Drive Backward", 1150, MiPRobot.prototype.driveDistanceByCm, -2, 0, cb],
			["LED Flashing", 100, MiPRobot.prototype.setChestLedFlashingWithColor, 0xaa, 0x88, 0xcc, 0x05, cb],
			["LED to Pink", 6000, MiPRobot.prototype.setMipChestLedWithColor, 0xaa, 0x00, 0xaa, 0x00, cb]
		],

	"jump_up": [
			["Play Sound", 10, MiPRobot.prototype.playMipSound, "MIP_WHISTLING", 0, 32, cb],
			["LED Flashing", 100, MiPRobot.prototype.setChestLedFlashingWithColor, 0x88, 0xaa, 0xcc, 0x05, cb],
			["LED to Cyan", 6000, MiPRobot.prototype.setMipChestLedWithColor, 0x00, 0xaa, 0xaa, 0x00, cb]
		],

	"pigs_freed": [
			["Play Sound", 10, MiPRobot.prototype.playMipSound, "MIP_LOOP_1", 0, 32, cb],
			["Drive Right", 150, MiPRobot.prototype.driveDistanceByCm, 1, 120, cb],
			["Drive Right", 1150, MiPRobot.prototype.driveDistanceByCm, 1, 120, cb],
			["Drive Right", 2150, MiPRobot.prototype.driveDistanceByCm, 1, 120, cb],
			["LED Flashing", 100, MiPRobot.prototype.setChestLedFlashingWithColor, 0x88, 0xaa, 0xcc, 0x05, cb],
			["LED to Cyan", 6000, MiPRobot.prototype.setMipChestLedWithColor, 0x00, 0xaa, 0xaa, 0x00, cb]
		]
}

function cb(err) {
	// console.log("robot callback error: ", err);
}
