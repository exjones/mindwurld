Mind Wurld Open
===============

A port of Apex Open Wurld, as demoed at Kscope15, to Node.

That's telekinesis, Kyle.

Instructions
------------

To get started;

* Make sure you've got Node.js installed, plus the Socket.io, MQTT, Express, and Body Parser modules.
* Start up the server with "node server.js" from the command line.
* Use a decent browser to connect to "http://your.server.ip:4004/"
* Wait for stuff to load.
* Hit a key, click the mouse, or press a button on your gamepad.
* Walk with W and S, or gamepad Left Stick.
* Turn with A and D, or gamepad Right Stick.
* Turn music on/off by clicking the icon, hitting the M key, or gamepad Triangle (Y on XBone).
* Switch skins with Left / Right cursor keys, or controller d-pad Left / Right (or Up / Down in Firefox).
* Spawn a friendly pig with P or Square (X on Xbox gamepad).
* When you're near a chest, open it with O, or Circle / B button. It might give you treasure!
* Jump (or swim upwards, to breathe, see hint) with Space, or Cross / A button.

You can walk around and marvel at the glitchy physics and the bad garbage collection. But don't go too far, only a small section of the map has been ported to static json files.

Tested with Firefox and Chrome, on a MacBook Pro Retina, running OS X El Capitan, with a Playstation Dualshock 4 (urban camouflage) controller. A Digital Storm custom gaming PC, running Windows 10, with XBox One controller. And an Alienware Alpha, running Windows 8.1, with XBox 360 controller. The controller client was tested in Chrome on a Nexus 5X.

YMMV.

Hint
----

The fifth and final chest is on a different island, and you can't _quite_ hold your breath long enough to get there!

Remote Control
--------------

You can also use another browser (e.g. one on a phone) to connect to "http://your.server.ip:4004/ctrlr" and use the buttons in the UI to post actions back to the server. Those actions will publish messages to the "mindwurld" topic on an MQTT broker. You can either run your own, locally (in which case you'll have to change server.js accordingly), or use something like [Mosca's](http://mosca.io/) test server. The wurld server listens for messages on that topic, and broadcasts them out to the clients, via socket.io, which controls the 3D experience.

You should be able to send messages to the broker from any MQTT client, e.g.

    mqtt publish -t mindwurld -h 'test.mosca.io' -m '{"op":"next_skin"}'

Supported OPs (i.e. operations) are; toggle_music, prev_skin, next_skin, spawn_pig, open_chest, and jump. Obviously the player has to be near to a chest, when the message is received, to open it.

TODO
----

* Add message driven input, e.g. walk message moves for two seconds then stops if another one isn't received
* Remap messages to meaningful things, e.g. love, lift, push, etc
* Provide icons to visualize message receipt (mapped to mobile UI)
* Add total completion message with timings (limit to 5 minutes?) and persistent (e.g. nedb) leaderboard
* Add some kind of treasure effect
* Better AI for pigs. PI, or Pig Intelligence, if you will

Credits
-------

* [USGS](http://ned.usgs.gov/) Elevation data, via the US Geological Survey's point query service.
* [Three.js](http://threejs.org/) Making WebGL easier to use since 2010.
* [Howler.js](https://github.com/goldfire/howler.js/) Howler.js a JavaScript audio library for modern web applications.
* [Keypress](http://dmauro.github.io/Keypress/) A robust JavaScript library for capturing keyboard input. Surprisingly important.
* [Seedrandom](https://github.com/davidbau/seedrandom) A predictable, portable, seedable random number generator, for JavaScript.
* [Matter.js](http://brm.io/matter-js/index.html) and [Poly-Decomp](https://github.com/schteppe/poly-decomp.js) For providing physics based movement and simple collision detection.
* [Clara.io](https://clara.io/) Browser based 3D modeling, for free.
* [BDCraft](http://bdcraft.net/) Beautiful high-resolution textures, for some game I've never heard of. Craftmine or somesuch.
* [Longzijun](https://longzijun.wordpress.com/) Incredibly talented musician, poet, writer, and photographer.
* [Soundbible](http://soundbible.com/) and [Freesound](http://freesound.org/) Anything you want to make the sound of, it'll be there somewhere.
* [Media.io](http://media.io/) Online audio format converter.
* [Icons8](https://icons8.com/) If there's an icon you think you need, and it isn't here, you don't need it.
* [Github](https://github.com/) Source code repository hosting, endless inspiration from people way smarter than me.
* [Stack Overflow](http://stackoverflow.com/) If there's a question you think you need the answer to, and it isn't here, you don't need to know.
