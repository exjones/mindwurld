WURLD_SETTINGS={
  // -------------------------
  // Set this to false to stop
  // the client from doing things
  // that are supposed to be
  // controlled remotely
  "allow_client_actions":true,
  // -------------------------
  "debug" : false,
  "debug_lights" : false,
  "debug_physics" : false,
  "show_stats" : true,
  "skin_name" : "RANDOM", // Will be randomised upon start, or set to a specific one
  // --------------------------------------
  // Turn these off for lower spec machines
  "antialias" : true,
  "dynamic_shadows":{
    "enabled":true,
    "map_size":4096 // Or just turn this down
  },
  "pretty_water":true,
  // --------------------------------------
  "start_location" : {
    // Happy Valley
    "x" : 0,
    "y" : 0,
    "z" : 134.0169
    // At the Beach
    // "x" : -447.13844498880354,
    // "y" : 273.56913138244255,
    // "z" : 8.945790972118402
    // Larry's Island
    // "x": -1420.0297,
    // "y": 1235.278,
    // "z": 19.230
  },
  "start_rotation" : 3.14159,
  "music" : "off",
  "gamepad":{
    "walk_axis":1,
    "turn_axis":2,
    "axis_sensitivity":0.1,
    "play_button":3,
    "prev_button":14,
    "next_button":15,
    "pig_button":2,
    "open_button":1,
    "jump_button":0,
    "fence_button":5,
    "start_button":16,
    "share_button":8,
    "options_button":9
  },
  "min_chest_dist": 10,
  "jump_speed": 15,
  "gravity": 25,
  "max_oxygen": 200,
  "oxygen_drain": 12,
  "drown_depth": -6,
  "pig_speed": 7,
  "walk_speed":0.25,
  "turn_speed":3,
  "turn_timeout":250,
  "walk_timeout":2000,
  "banner_timeout": 5000,
  "total_chests": 6,
  "max_game_time":600000, // Ten minutes
  "messages":{
    "YOU_DROWNED"     :"Gulp, You Drowned!",
    "PCT_PIGS_FREE"   :"Now {0}% Pigs Free",
    "ALL_PIGS_FREE"   :"Freed All The Pigs!",
    "GOT_ALL_TREASURE":"Got All The Treasure!",
    "FOUND_TREASURE"  :"Found {0} Treasures",
    "OUT_OF_TIME"     :"Time's Up, Scored {0}",
    "BEAT_GAME"       :"You Won! Scored {0}"
  },
  "scores":{
    "pig_multiplier":100,
    "treasure_multiplier": 80,
    "time_multiplier": 25
  }
};
