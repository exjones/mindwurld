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
* Wait for stuff to load
* Hit a key, click the mouse, or press a button on your gamepad
* Walk with W and S, or gamepad Left Stick
* Turn with A and D, or gamepad Right Stick
* Turn music on/off by clicking the icon, hitting the M key, or gamepad Triangle (Y on XBone)
* Switch skins with Left / Right cursor keys, or controller d-pad Left / Right (or Up / Down in Firefox)

You can walk around and marvel at the glitchy physics. But don't go too far, only a small section of the map has been ported to static json files.

You can also use another browser (even one on a phone) to connect to "http://your.server.ip:5005/" and use the buttons in the UI to post actions back to the ctrlr server. Those actions will publish messages to the "mindwurld" topic on the mqtt://test.mosca.io broker. The wurld server listens for messages on that topic, and broadcasts them out to the clients, via socket.io, which controls the 3D experience.

You should be able to send messages to the broker from any MQTT client, e.g.

    mqtt publish -t mindwurld -h 'test.mosca.io' -m '{"op":"next_skin"}'

Tested with Firefox and Chrome, on a MacBook Pro Retina, running OS X El Capitan, with a Playstation Dualshock 4 (urban camouflage) controller. A Digital Storm custom gaming PC, running Windows 10, with XBox One controller. And an Alienware Alpha, running Windows 8.1, with XBox 360 controller. The controller client was tested in Chrome on a Nexus 5X.

YMMV.

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
