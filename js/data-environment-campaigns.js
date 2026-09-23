/* AI-made terrain campaigns. Rebuild: node tools/build-environment-campaigns.js */
"use strict";
var ENVIRONMENT_CAMPAIGNS = [
  {
    "id": "open-horizons",
    "name": "AI-made: Open Horizons",
    "description": "A sea of maneuvering ground around mountain islands: space, concentration and exposed flanks.",
    "levels": [
      {
        "name": "THREE AGAINST THREE",
        "pack": "AI-made: Open Horizons",
        "campaignId": "open-horizons",
        "mission": 1,
        "author": "AI-made by Codex",
        "source": "levels/open-horizons/01-three-against-three.json",
        "description": "Three squads per side and no replacements. Six small mountain islands break up a broad plain; every supporting position costs a third of your army.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 40 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "open maneuver",
          "line",
          "few units"
        ],
        "design": {
          "theme": "open",
          "layout": 1,
          "formation": "line",
          "road": "none"
        },
        "turnLimit": 40,
        "grid": [
          "........................",
          "........................",
          ".........w..............",
          ".....MMMwww......M......",
          ".....MMM........MMM.....",
          "......M.........MMM.....",
          "....hhh..MMM............",
          "..B.hhh..MMM.M...hhh....",
          "....hhh...M.MMM..hhh.B..",
          "............MMM..hhh....",
          ".....MMM.........M......",
          ".....MMM........MMM.....",
          "......M......wwwMMM.....",
          "..............w.........",
          "........................",
          "........................"
        ],
        "buildings": [
          {
            "col": 2,
            "row": 7,
            "owner": 0
          },
          {
            "col": 21,
            "row": 8,
            "owner": 1
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 1,
            "y": 6
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 2,
            "y": 6
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 3,
            "y": 6
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 22,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 21,
            "y": 9
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 20,
            "y": 9
          }
        ]
      },
      {
        "name": "THE LONG HOOK",
        "pack": "AI-made: Open Horizons",
        "campaignId": "open-horizons",
        "mission": 2,
        "author": "AI-made by Codex",
        "source": "levels/open-horizons/02-the-long-hook.json",
        "description": "Crescent ridges shelter the direct approach. Fast Lenets and a Rabbit can take the long outside route, but the infantry must still reach a camp or arsenal.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 55 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "open maneuver",
          "split",
          "mixed forces"
        ],
        "design": {
          "theme": "open",
          "layout": 2,
          "formation": "split",
          "road": "rim"
        },
        "turnLimit": 55,
        "grid": [
          "................................",
          "................................",
          ".......-------.---..............",
          ".....--.MMMMMM-...--.....---....",
          ".....-...F....M.....-----...--..",
          ".....-.--..wwwMM....MMM......-..",
          ".....--....www.M..MMM........-..",
          "...--..hhhh....M.MM...hhh....-..",
          "..B...hhhhh....M.M...hhhhh...-..",
          "..-...hhhhh...M.M....hhhhh...B..",
          "..-....hhh...MM.M....hhhh..--...",
          "..-........MMM..M.www....--.....",
          "..-......MMM....MMwww..--.-.....",
          "..--...-----.....M....F...-.....",
          "....---.....--...-MMMMMM.--.....",
          "..............---.-------.......",
          "................................",
          "................................"
        ],
        "buildings": [
          {
            "col": 2,
            "row": 8,
            "owner": 0
          },
          {
            "col": 29,
            "row": 9,
            "owner": 1
          },
          {
            "col": 9,
            "row": 4,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET",
              "LENET"
            ]
          },
          {
            "col": 22,
            "row": 13,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET",
              "LENET"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 6,
            "y": 4
          },
          {
            "t": "PANTHER",
            "o": 0,
            "x": 6,
            "y": 12
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 5,
            "y": 3
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 5,
            "y": 11
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 6,
            "y": 3
          },
          {
            "t": "RABBIT",
            "o": 0,
            "x": 6,
            "y": 11
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 25,
            "y": 13
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 25,
            "y": 5
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 26,
            "y": 14
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 26,
            "y": 6
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 25,
            "y": 14
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 25,
            "y": 6
          }
        ]
      },
      {
        "name": "TWO COLORS OF STEEL",
        "pack": "AI-made: Open Horizons",
        "campaignId": "open-horizons",
        "mission": 3,
        "author": "AI-made by Codex",
        "source": "levels/open-horizons/03-two-colors-of-steel.json",
        "description": "Only Charlie and Bison exist here. A diagonal chain of islands makes positioning and mutual support the entire problem.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 50 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "open maneuver",
          "line",
          "limited roster"
        ],
        "design": {
          "theme": "open",
          "layout": 3,
          "formation": "line",
          "road": "none"
        },
        "turnLimit": 50,
        "grid": [
          "............................",
          "............................",
          "............................",
          "..B...MM-...................",
          "......MMF...................",
          "......MM.....MM.............",
          "..........M..MM.............",
          ".......hhhww.MM...hh........",
          "......hhhhww.....hhhh.......",
          ".......hhhh.....wwhhhh......",
          "........hh...MM.wwhhh.......",
          ".............MM..M..........",
          ".............MM.....MM......",
          "...................FMM......",
          "...................-MM...B..",
          "............................",
          "............................",
          "............................"
        ],
        "buildings": [
          {
            "col": 2,
            "row": 3,
            "owner": 0
          },
          {
            "col": 25,
            "row": 14,
            "owner": 1
          },
          {
            "col": 8,
            "row": 4,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "BISON",
              "BISON"
            ]
          },
          {
            "col": 19,
            "row": 13,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "BISON",
              "BISON"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 1,
            "y": 2
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 2,
            "y": 2
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 3,
            "y": 2
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 1,
            "y": 3
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 3,
            "y": 3
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 26,
            "y": 15
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 25,
            "y": 15
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 24,
            "y": 15
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 26,
            "y": 14
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 24,
            "y": 14
          }
        ]
      },
      {
        "name": "DIVIDED WEIGHT",
        "pack": "AI-made: Open Horizons",
        "campaignId": "open-horizons",
        "mission": 4,
        "author": "AI-made by Codex",
        "source": "levels/open-horizons/04-divided-weight.json",
        "description": "Two large mountain formations divide the approach into three wide lanes. Your separated detachments can concentrate quickly only if you keep the middle passage usable.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 65 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "open maneuver",
          "split",
          "mixed forces"
        ],
        "design": {
          "theme": "open",
          "layout": 4,
          "formation": "split",
          "road": "fork"
        },
        "turnLimit": 65,
        "grid": [
          "....................................",
          "....................................",
          "...........B.-......................",
          ".........----M--....................",
          ".......---M-MMM.--..................",
          ".....--...F-MMM...-.................",
          ".....-....MMMMMM..-..F--...---......",
          ".....-.hh.MMMMMMMM----w.---...-.....",
          ".....-hhhhhMMMMMM--.wwww..hhh.-.....",
          ".....-hhhhh......--.www..hhhhh-.....",
          ".....-hhhhh..www.--......hhhhh-.....",
          ".....-.hhh..wwww.--MMMMMMhhhhh-.....",
          ".....-...---.w----MMMMMMMM.hh.-.....",
          "......---...--F..-..MMMMMM....-.....",
          ".................-...MMM-F...--.....",
          "..................--.MMM-M---.......",
          "....................--M----.........",
          "......................-.B...........",
          "....................................",
          "...................................."
        ],
        "buildings": [
          {
            "col": 11,
            "row": 2,
            "owner": 0
          },
          {
            "col": 24,
            "row": 17,
            "owner": 1
          },
          {
            "col": 10,
            "row": 5,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET",
              "POLAR",
              "TITAN"
            ]
          },
          {
            "col": 25,
            "row": 14,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET",
              "POLAR",
              "TITAN"
            ]
          },
          {
            "col": 14,
            "row": 13,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "HADRIAN",
              "LENET"
            ]
          },
          {
            "col": 21,
            "row": 6,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "HADRIAN",
              "LENET"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 7,
            "y": 5
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 7,
            "y": 14
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 7,
            "y": 4
          },
          {
            "t": "POLAR",
            "o": 0,
            "x": 7,
            "y": 13
          },
          {
            "t": "TITAN",
            "o": 0,
            "x": 6,
            "y": 5
          },
          {
            "t": "TITAN",
            "o": 0,
            "x": 6,
            "y": 14
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 8,
            "y": 5
          },
          {
            "t": "RABBIT",
            "o": 0,
            "x": 8,
            "y": 14
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 28,
            "y": 14
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 28,
            "y": 5
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 28,
            "y": 15
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 28,
            "y": 6
          },
          {
            "t": "GRIZZLY",
            "o": 1,
            "x": 29,
            "y": 14
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 29,
            "y": 5
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 27,
            "y": 14
          },
          {
            "t": "OCTOPUS",
            "o": 1,
            "x": 27,
            "y": 5
          }
        ]
      },
      {
        "name": "THE INVITING BOWL",
        "pack": "AI-made: Open Horizons",
        "campaignId": "open-horizons",
        "mission": 5,
        "author": "AI-made by Codex",
        "source": "levels/open-horizons/05-the-inviting-bowl.json",
        "description": "A horseshoe of mountains wraps a tempting central arsenal. The straight road enters its mouth; the spacious outside flanks let the opponent approach its sides.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 55 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "open maneuver",
          "forward",
          "mixed forces"
        ],
        "design": {
          "theme": "open",
          "layout": 5,
          "formation": "forward",
          "road": "direct"
        },
        "turnLimit": 55,
        "grid": [
          "..............................",
          "..............................",
          "..............................",
          "..........www.................",
          "..........MwwM................",
          ".......-FMM..-------..........",
          ".......-.M.--.MMMMMM--........",
          ".......-h--..MM...F-M.--......",
          "......h--h-.M......-Mhh.-.....",
          "..B-.--hhh-........-hhhh--....",
          "....--hhhh-........-hhh--.-B..",
          ".....-.hhM-......M.-h--h......",
          "......--.M-F...MM..--h-.......",
          "........--MMMMMM.--.M.-.......",
          "..........-------..MMF-.......",
          "................MwwM..........",
          ".................www..........",
          "..............................",
          "..............................",
          ".............................."
        ],
        "buildings": [
          {
            "col": 2,
            "row": 9,
            "owner": 0
          },
          {
            "col": 27,
            "row": 10,
            "owner": 1
          },
          {
            "col": 8,
            "row": 5,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "POLAR",
              "POLAR"
            ]
          },
          {
            "col": 21,
            "row": 14,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "POLAR",
              "POLAR"
            ]
          },
          {
            "col": 11,
            "row": 12,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "OCTOPUS",
              "POLAR"
            ]
          },
          {
            "col": 18,
            "row": 7,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "OCTOPUS",
              "POLAR"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 8,
            "y": 8
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 8,
            "y": 10
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 8,
            "y": 11
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 7,
            "y": 7
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 7,
            "y": 9
          },
          {
            "t": "OCTOPUS",
            "o": 0,
            "x": 7,
            "y": 10
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 9,
            "y": 7
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 21,
            "y": 11
          },
          {
            "t": "KILROY",
            "o": 1,
            "x": 21,
            "y": 9
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 21,
            "y": 8
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 22,
            "y": 12
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 22,
            "y": 10
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 22,
            "y": 9
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 20,
            "y": 12
          }
        ]
      },
      {
        "name": "RINGS WITHOUT WALLS",
        "pack": "AI-made: Open Horizons",
        "campaignId": "open-horizons",
        "mission": 6,
        "author": "AI-made by Codex",
        "source": "levels/open-horizons/06-rings-without-walls.json",
        "description": "Broken mountain atolls enclose useful staging areas. Several gaps make each enclosure permeable; a force inside must watch more than the entrance it used.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 65 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "open maneuver",
          "line",
          "mixed forces"
        ],
        "design": {
          "theme": "open",
          "layout": 6,
          "formation": "line",
          "road": "fork"
        },
        "turnLimit": 65,
        "grid": [
          "..................................",
          "..................................",
          "..................................",
          "........MMMMMM....................",
          "......MMM....M....................",
          ".........F.---M...................",
          "........---.ww--.........---......",
          ".......--...www.--..F-.--...-.....",
          ".....--..hhh..M..-...--.....-.....",
          ".....-M.hhhhh.M...---.hhh...-.....",
          "...B.-MMhhhhhMM......hhhhh..--....",
          "....--..hhhhh......MMhhhhhMM-.B...",
          ".....-...hhh.---...M.hhhhh.M-.....",
          ".....-.....--...-..M..hhh..--.....",
          ".....-...--.-F..--.www...--.......",
          "......---.........--ww.---........",
          "...................M---.F.........",
          "....................M....MMM......",
          "....................MMMMMM........",
          "..................................",
          "..................................",
          ".................................."
        ],
        "buildings": [
          {
            "col": 3,
            "row": 10,
            "owner": 0
          },
          {
            "col": 30,
            "row": 11,
            "owner": 1
          },
          {
            "col": 9,
            "row": 5,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET",
              "POLAR",
              "LENET"
            ]
          },
          {
            "col": 24,
            "row": 16,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET",
              "POLAR",
              "LENET"
            ]
          },
          {
            "col": 13,
            "row": 14,
            "owner": -1,
            "stored": [
              "PELICAN",
              "ATLAS",
              "TITAN",
              "TITAN"
            ]
          },
          {
            "col": 20,
            "row": 7,
            "owner": -1,
            "stored": [
              "PELICAN",
              "ATLAS",
              "TITAN",
              "TITAN"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 4,
            "y": 11
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 3,
            "y": 9
          },
          {
            "t": "PANTHER",
            "o": 0,
            "x": 2,
            "y": 10
          },
          {
            "t": "POLAR",
            "o": 0,
            "x": 4,
            "y": 10
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 2,
            "y": 11
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 3,
            "y": 11
          },
          {
            "t": "PELICAN",
            "o": 0,
            "x": 5,
            "y": 9
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 29,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 30,
            "y": 12
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 31,
            "y": 11
          },
          {
            "t": "GRIZZLY",
            "o": 1,
            "x": 29,
            "y": 11
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 31,
            "y": 10
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 30,
            "y": 10
          },
          {
            "t": "PELICAN",
            "o": 1,
            "x": 28,
            "y": 12
          }
        ]
      },
      {
        "name": "NO HEAVY ANSWER",
        "pack": "AI-made: Open Horizons",
        "campaignId": "open-horizons",
        "mission": 7,
        "author": "AI-made by Codex",
        "source": "levels/open-horizons/07-no-heavy-answer.json",
        "description": "Capturers and missile buggies only. Scattered small islands provide turning points for hit-and-retreat movement, with very little armor to absorb mistakes.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 45 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "open maneuver",
          "spread",
          "limited roster"
        ],
        "design": {
          "theme": "open",
          "layout": 7,
          "formation": "spread",
          "road": "none"
        },
        "turnLimit": 45,
        "grid": [
          "............................",
          ".....M......................",
          "...MMMMM.M..................",
          "...MMMMMMMM....MMM..........",
          "...MMMMMMMM....MMM..........",
          "....MMM-F.......M....M......",
          "...........MMM.....MMMMM....",
          ".....hhh..wwMM.....MMhMM....",
          "..B.hhhhh.wwM......Mhhhh....",
          "....hhhhM......Mww.hhhhh.B..",
          "....MMhMM.....MMww..hhh.....",
          "....MMMMM.....MMM...........",
          "......M....M.......F-MMM....",
          "..........MMM....MMMMMMMM...",
          "..........MMM....MMMMMMMM...",
          "..................M.MMMMM...",
          "......................M.....",
          "............................"
        ],
        "buildings": [
          {
            "col": 2,
            "row": 8,
            "owner": 0
          },
          {
            "col": 25,
            "row": 9,
            "owner": 1
          },
          {
            "col": 8,
            "row": 5,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "RABBIT",
              "RABBIT",
              "LYNX"
            ]
          },
          {
            "col": 19,
            "row": 12,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "RABBIT",
              "RABBIT",
              "LYNX"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 4,
            "y": 3
          },
          {
            "t": "PANTHER",
            "o": 0,
            "x": 4,
            "y": 6
          },
          {
            "t": "RABBIT",
            "o": 0,
            "x": 6,
            "y": 7
          },
          {
            "t": "RABBIT",
            "o": 0,
            "x": 4,
            "y": 9
          },
          {
            "t": "LYNX",
            "o": 0,
            "x": 5,
            "y": 12
          },
          {
            "t": "LYNX",
            "o": 0,
            "x": 6,
            "y": 14
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 23,
            "y": 14
          },
          {
            "t": "PANTHER",
            "o": 1,
            "x": 23,
            "y": 11
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 21,
            "y": 10
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 23,
            "y": 8
          },
          {
            "t": "LYNX",
            "o": 1,
            "x": 22,
            "y": 5
          },
          {
            "t": "LYNX",
            "o": 1,
            "x": 21,
            "y": 3
          }
        ]
      },
      {
        "name": "FINGER COUNTRY",
        "pack": "AI-made: Open Horizons",
        "campaignId": "open-horizons",
        "mission": 8,
        "author": "AI-made by Codex",
        "source": "levels/open-horizons/08-finger-country.json",
        "description": "Long mountain fingers project into open ground. Their tips are turning points, while gaps between the fingers shelter artillery and isolated detachments.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 70 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "open maneuver",
          "column",
          "mixed forces"
        ],
        "design": {
          "theme": "open",
          "layout": 8,
          "formation": "column",
          "road": "rim"
        },
        "turnLimit": 70,
        "grid": [
          "......................................",
          "......................................",
          ".........-.........-..................",
          "...B...--M--.....--.--................",
          "....---..MFM--.--.....--.......-......",
          ".....-....MMM.-......--.--...--.-.....",
          ".....-....MMMM.M.....-MM..---F..-.....",
          ".....-...hh...M.M....-FwM...--.--.....",
          ".....-..hhhhh........w-wwMhhhh-M-.....",
          ".....-.hhhhhh.........wwwhhhhhh.-.....",
          ".....-.hhhhhhwww.........hhhhhh.-.....",
          ".....-M-hhhhMww-w........hhhhh..-.....",
          ".....--.--...MwF-....M.M...hh...-.....",
          ".....-..F---..MM-.....M.MMMM....-.....",
          ".....-.--...--.--......-.MMM....-.....",
          "......-.......--.....--.--MFM..---....",
          "................--.--.....--M--...B...",
          "..................-.........-.........",
          "......................................",
          "......................................"
        ],
        "buildings": [
          {
            "col": 3,
            "row": 3,
            "owner": 0
          },
          {
            "col": 34,
            "row": 16,
            "owner": 1
          },
          {
            "col": 10,
            "row": 4,
            "owner": -1,
            "stored": [
              "MULE",
              "ATLAS",
              "TITAN",
              "TITAN"
            ]
          },
          {
            "col": 27,
            "row": 15,
            "owner": -1,
            "stored": [
              "MULE",
              "ATLAS",
              "TITAN",
              "TITAN"
            ]
          },
          {
            "col": 15,
            "row": 12,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET",
              "LENET"
            ]
          },
          {
            "col": 22,
            "row": 7,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET",
              "LENET"
            ]
          },
          {
            "col": 8,
            "row": 13,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "OCTOPUS",
              "POLAR"
            ]
          },
          {
            "col": 29,
            "row": 6,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "OCTOPUS",
              "POLAR"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 4,
            "y": 9
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 4,
            "y": 10
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 5,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 5,
            "y": 10
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 6,
            "y": 9
          },
          {
            "t": "POLAR",
            "o": 0,
            "x": 6,
            "y": 10
          },
          {
            "t": "TITAN",
            "o": 0,
            "x": 7,
            "y": 9
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 7,
            "y": 10
          },
          {
            "t": "MULE",
            "o": 0,
            "x": 8,
            "y": 9
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 33,
            "y": 10
          },
          {
            "t": "KILROY",
            "o": 1,
            "x": 33,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 32,
            "y": 10
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 32,
            "y": 9
          },
          {
            "t": "GRIZZLY",
            "o": 1,
            "x": 31,
            "y": 10
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 31,
            "y": 9
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 30,
            "y": 10
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 30,
            "y": 9
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 29,
            "y": 10
          }
        ]
      },
      {
        "name": "A NARROW ADVANTAGE",
        "pack": "AI-made: Open Horizons",
        "campaignId": "open-horizons",
        "mission": 9,
        "author": "AI-made by Codex",
        "source": "levels/open-horizons/09-a-narrow-advantage.json",
        "description": "Two Giants give Union impressive local strength but few bodies. The hourglass formations invite a frontal stand while lighter forces can use the wide outer lanes.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 60 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "open maneuver",
          "line",
          "mixed forces"
        ],
        "design": {
          "theme": "open",
          "layout": 9,
          "formation": "line",
          "road": "direct"
        },
        "turnLimit": 60,
        "grid": [
          "..............................",
          "..............................",
          ".............MM...............",
          "..........wwwMMMMM............",
          "..........MwwMMMMM............",
          ".......-F.MMMMMMMM............",
          ".....--.....MMMMM.............",
          "...--...hh...MMM...---........",
          "..-....hhhh...M..--hhh--......",
          "..B-.-.hhhhh...--..hhhh---....",
          "....---hhhh..--...hhhhh.-.-B..",
          "......--hhh--..M...hhhh....-..",
          "........---...MMM...hh...--...",
          ".............MMMMM.....--.....",
          "............MMMMMMMM.F-.......",
          "............MMMMMwwM..........",
          "............MMMMMwww..........",
          "...............MM.............",
          "..............................",
          ".............................."
        ],
        "buildings": [
          {
            "col": 2,
            "row": 9,
            "owner": 0
          },
          {
            "col": 27,
            "row": 10,
            "owner": 1
          },
          {
            "col": 8,
            "row": 5,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "TITAN",
              "TITAN",
              "TITAN"
            ]
          },
          {
            "col": 21,
            "row": 14,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "TITAN",
              "TITAN",
              "TITAN"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 2,
            "y": 8
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 3,
            "y": 9
          },
          {
            "t": "GIANT",
            "o": 0,
            "x": 1,
            "y": 8
          },
          {
            "t": "GIANT",
            "o": 0,
            "x": 3,
            "y": 8
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 1,
            "y": 9
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 27,
            "y": 11
          },
          {
            "t": "PANTHER",
            "o": 1,
            "x": 26,
            "y": 10
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 28,
            "y": 11
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 26,
            "y": 11
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 28,
            "y": 10
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 27,
            "y": 9
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 26,
            "y": 12
          }
        ]
      },
      {
        "name": "GUNS NEED COMPANY",
        "pack": "AI-made: Open Horizons",
        "campaignId": "open-horizons",
        "mission": 10,
        "author": "AI-made by Codex",
        "source": "levels/open-horizons/10-guns-need-company.json",
        "description": "Offset mountain ribbons put neighboring lanes within artillery reach. Your gun-heavy army still needs infantry and a small mobile screen to occupy the ground.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 65 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "open maneuver",
          "gunline",
          "mixed forces"
        ],
        "design": {
          "theme": "open",
          "layout": 10,
          "formation": "gunline",
          "road": "cross"
        },
        "turnLimit": 65,
        "grid": [
          "................................",
          "................................",
          "................................",
          ".....-.---......................",
          ".....--..F-.....................",
          ".....-MMMM-wwwM.................",
          ".....---..Mwww.....F............",
          ".....-hh--..w......--..MM.......",
          "...--hhhh.--.......-.MMhhh......",
          "..B..hhhhh..--.---.-M.hhhhh.....",
          ".....hhhhh.M-.---.--..hhhhh..B..",
          "......hhhMM.-.......--.hhhh--...",
          ".......MM..--......w..--hh-.....",
          "............F.....wwwM..---.....",
          ".................Mwww-MMMM-.....",
          ".....................-F..--.....",
          "......................---.-.....",
          "................................",
          "................................",
          "................................"
        ],
        "buildings": [
          {
            "col": 2,
            "row": 9,
            "owner": 0
          },
          {
            "col": 29,
            "row": 10,
            "owner": 1
          },
          {
            "col": 9,
            "row": 4,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "BISON",
              "LENET"
            ]
          },
          {
            "col": 22,
            "row": 15,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "BISON",
              "LENET"
            ]
          },
          {
            "col": 12,
            "row": 13,
            "owner": -1,
            "stored": [
              "MULE",
              "ATLAS",
              "POLAR",
              "POLAR"
            ]
          },
          {
            "col": 19,
            "row": 6,
            "owner": -1,
            "stored": [
              "MULE",
              "ATLAS",
              "POLAR",
              "POLAR"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 8,
            "y": 6
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 8,
            "y": 8
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 7,
            "y": 10
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 7,
            "y": 11
          },
          {
            "t": "OCTOPUS",
            "o": 0,
            "x": 7,
            "y": 13
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 7,
            "y": 6
          },
          {
            "t": "MULE",
            "o": 0,
            "x": 8,
            "y": 7
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 23,
            "y": 13
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 23,
            "y": 11
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 23,
            "y": 9
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 23,
            "y": 8
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 23,
            "y": 6
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 24,
            "y": 13
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 23,
            "y": 12
          }
        ]
      },
      {
        "name": "EMPTY MILES",
        "pack": "AI-made: Open Horizons",
        "campaignId": "open-horizons",
        "mission": 11,
        "author": "AI-made by Codex",
        "source": "levels/open-horizons/11-empty-miles.json",
        "description": "Four squads each on a very wide field. Elongated shoals interrupt pursuit; committing two units to one side leaves enormous areas unguarded.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 65 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "open maneuver",
          "split",
          "few units"
        ],
        "design": {
          "theme": "open",
          "layout": 11,
          "formation": "split",
          "road": "none"
        },
        "turnLimit": 65,
        "grid": [
          "..........................................",
          "..........................................",
          ".............B............................",
          "..........................................",
          "..........................................",
          ".........M..................MMMM..........",
          "..........MMMM..................M.........",
          "..........................................",
          ".........hhhh..www........................",
          "........hhhhhhwwwww..........hhhh.........",
          "........hhhhhh.www....MM....hhhhhh........",
          "........hhhhhh....MM....www.hhhhhh........",
          ".........hhhh..........wwwwwhhhhhh........",
          "........................www..hhhh.........",
          "..........................................",
          ".........M..................MMMM..........",
          "..........MMMM..................M.........",
          "..........................................",
          "..........................................",
          "............................B.............",
          "..........................................",
          ".........................................."
        ],
        "buildings": [
          {
            "col": 13,
            "row": 2,
            "owner": 0
          },
          {
            "col": 28,
            "row": 19,
            "owner": 1
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 8,
            "y": 5
          },
          {
            "t": "PANTHER",
            "o": 0,
            "x": 8,
            "y": 15
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 7,
            "y": 4
          },
          {
            "t": "RABBIT",
            "o": 0,
            "x": 7,
            "y": 14
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 33,
            "y": 16
          },
          {
            "t": "PANTHER",
            "o": 1,
            "x": 33,
            "y": 6
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 34,
            "y": 17
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 34,
            "y": 7
          }
        ]
      },
      {
        "name": "THE CROWN'S TEETH",
        "pack": "AI-made: Open Horizons",
        "campaignId": "open-horizons",
        "mission": 12,
        "author": "AI-made by Codex",
        "source": "levels/open-horizons/12-the-crown-s-teeth.json",
        "description": "A broken crown of mountains offers several protected approaches to the center. The gaps face different directions, so one supporting group cannot cover them all.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 70 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "open maneuver",
          "forward",
          "mixed forces"
        ],
        "design": {
          "theme": "open",
          "layout": 12,
          "formation": "forward",
          "road": "fork"
        },
        "turnLimit": 70,
        "grid": [
          "..................................",
          "..................................",
          "..................................",
          "...........MMMMMMM................",
          ".........FMMMM.MMMM...............",
          ".......--MM-M...M.MM..............",
          ".......-MM.---.....M.....---......",
          ".......-MMM-..--...-M-.---F.-.....",
          ".......-M--h....----F--...---.....",
          ".......--hhhh......w-whhh...-.....",
          "...B...-hhhhh......wwwhhhh.---....",
          "....---.hhhhwww......hhhhh-...B...",
          ".....-...hhhw-w......hhhh--.......",
          ".....---...--F----....h--M-.......",
          ".....-.F---.-M-...--..-MMM-.......",
          "......---.....M.....---.MM-.......",
          "..............MM.M...M-MM--.......",
          "...............MMMM.MMMMF.........",
          "................MMMMMMM...........",
          "..................................",
          "..................................",
          ".................................."
        ],
        "buildings": [
          {
            "col": 3,
            "row": 10,
            "owner": 0
          },
          {
            "col": 30,
            "row": 11,
            "owner": 1
          },
          {
            "col": 9,
            "row": 4,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "OCTOPUS",
              "POLAR"
            ]
          },
          {
            "col": 24,
            "row": 17,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "OCTOPUS",
              "POLAR"
            ]
          },
          {
            "col": 13,
            "row": 13,
            "owner": -1,
            "stored": [
              "MULE",
              "TRIGGER",
              "BISON",
              "BISON"
            ]
          },
          {
            "col": 20,
            "row": 8,
            "owner": -1,
            "stored": [
              "MULE",
              "TRIGGER",
              "BISON",
              "BISON"
            ]
          },
          {
            "col": 7,
            "row": 14,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET",
              "POLAR",
              "TITAN"
            ]
          },
          {
            "col": 26,
            "row": 7,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET",
              "POLAR",
              "TITAN"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 9,
            "y": 8
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 9,
            "y": 11
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 9,
            "y": 13
          },
          {
            "t": "POLAR",
            "o": 0,
            "x": 10,
            "y": 8
          },
          {
            "t": "TITAN",
            "o": 0,
            "x": 9,
            "y": 10
          },
          {
            "t": "TITAN",
            "o": 0,
            "x": 8,
            "y": 14
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 8,
            "y": 9
          },
          {
            "t": "MULE",
            "o": 0,
            "x": 8,
            "y": 11
          },
          {
            "t": "RABBIT",
            "o": 0,
            "x": 9,
            "y": 14
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 24,
            "y": 13
          },
          {
            "t": "KILROY",
            "o": 1,
            "x": 24,
            "y": 10
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 24,
            "y": 8
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 23,
            "y": 13
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 24,
            "y": 11
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 25,
            "y": 7
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 25,
            "y": 12
          },
          {
            "t": "OCTOPUS",
            "o": 1,
            "x": 25,
            "y": 10
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 24,
            "y": 7
          }
        ]
      },
      {
        "name": "DISTANT NEIGHBORS",
        "pack": "AI-made: Open Horizons",
        "campaignId": "open-horizons",
        "mission": 13,
        "author": "AI-made by Codex",
        "source": "levels/open-horizons/13-distant-neighbors.json",
        "description": "Two island clusters face each other across an open gulf. Pelicans can shift cargo across the gulf, while unsupported ground units spend several turns crossing it.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 80 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "open maneuver",
          "split",
          "mixed forces"
        ],
        "design": {
          "theme": "open",
          "layout": 13,
          "formation": "split",
          "road": "rim"
        },
        "turnLimit": 80,
        "grid": [
          "........................................",
          "........................................",
          ".............-----......................",
          "...........--.www.----..................",
          "....B-.----...wwww....--................",
          ".....--.MM-...www.......--.......-......",
          ".....-..MM-F.............---...--.-.....",
          ".....-.......MM.........-MM.--F...-.....",
          ".....-......MMM........F-MM...--..-.....",
          ".....-.hhhh..MM........--MM.....---.....",
          ".....-hhhhhh.............MM..hhhh.-.....",
          ".....-hhhhhh................hhhhhh-.....",
          ".....-hhhhhh................hhhhhh-.....",
          ".....-.hhhh..MM.............hhhhhh-.....",
          ".....---.....MM--........MM..hhhh.-.....",
          ".....-..--...MM-F........MMM......-.....",
          ".....-...F--.MM-.........MM.......-.....",
          ".....-.--...---.............F-MM..-.....",
          "......-.......--.......www...-MM.--.....",
          "................--....wwww...----.-B....",
          "..................----.www.--...........",
          "......................-----.............",
          "........................................",
          "........................................"
        ],
        "buildings": [
          {
            "col": 4,
            "row": 4,
            "owner": 0
          },
          {
            "col": 35,
            "row": 19,
            "owner": 1
          },
          {
            "col": 11,
            "row": 6,
            "owner": -1,
            "stored": [
              "PELICAN",
              "ATLAS",
              "TITAN",
              "TITAN"
            ]
          },
          {
            "col": 28,
            "row": 17,
            "owner": -1,
            "stored": [
              "PELICAN",
              "ATLAS",
              "TITAN",
              "TITAN"
            ]
          },
          {
            "col": 16,
            "row": 15,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET",
              "LENET"
            ]
          },
          {
            "col": 23,
            "row": 8,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET",
              "LENET"
            ]
          },
          {
            "col": 9,
            "row": 16,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "SEEKER",
              "POLAR",
              "POLAR"
            ]
          },
          {
            "col": 30,
            "row": 7,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "SEEKER",
              "POLAR",
              "POLAR"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 8,
            "y": 6
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 8,
            "y": 17
          },
          {
            "t": "PANTHER",
            "o": 0,
            "x": 7,
            "y": 5
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 7,
            "y": 17
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 7,
            "y": 6
          },
          {
            "t": "TITAN",
            "o": 0,
            "x": 7,
            "y": 16
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 8,
            "y": 7
          },
          {
            "t": "PELICAN",
            "o": 0,
            "x": 8,
            "y": 16
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 31,
            "y": 17
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 31,
            "y": 6
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 32,
            "y": 18
          },
          {
            "t": "GRIZZLY",
            "o": 1,
            "x": 32,
            "y": 6
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 32,
            "y": 17
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 32,
            "y": 7
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 31,
            "y": 16
          },
          {
            "t": "PELICAN",
            "o": 1,
            "x": 31,
            "y": 7
          }
        ]
      },
      {
        "name": "THE BRIGHT ROAD",
        "pack": "AI-made: Open Horizons",
        "campaignId": "open-horizons",
        "mission": 14,
        "author": "AI-made by Codex",
        "source": "levels/open-horizons/14-the-bright-road.json",
        "description": "A conspicuous straight road passes through a crooked reef. Its speed comes with no terrain defense; the surrounding plain leaves room to approach on a wider frontage.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 60 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "open maneuver",
          "column",
          "mixed forces"
        ],
        "design": {
          "theme": "open",
          "layout": 14,
          "formation": "column",
          "road": "direct"
        },
        "turnLimit": 60,
        "grid": [
          "....................................",
          "....................................",
          "....................................",
          "...........M.......---..............",
          ".........F.M.---.---MM--............",
          "........-.M--ww.-..-..M.--..........",
          "........-MM-wwww...-.FMM..--........",
          "........---M.ww.....---.M...--......",
          ".......--hhhMMM........MMhhh.-......",
          "...B.--hhhhh.M.........Mhhhhh-.-....",
          "....-.-hhhhhM.........M.hhhhh--.B...",
          "......-.hhhMM........MMMhhh--.......",
          "......--...M.---.....ww.M---........",
          "........--..MMF.-...wwww-MM-........",
          "..........--.M..-..-.ww--M.-........",
          "............--MM---.---.M.F.........",
          "..............---.......M...........",
          "....................................",
          "....................................",
          "...................................."
        ],
        "buildings": [
          {
            "col": 3,
            "row": 9,
            "owner": 0
          },
          {
            "col": 32,
            "row": 10,
            "owner": 1
          },
          {
            "col": 9,
            "row": 4,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET",
              "POLAR",
              "TITAN"
            ]
          },
          {
            "col": 26,
            "row": 15,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET",
              "POLAR",
              "TITAN"
            ]
          },
          {
            "col": 14,
            "row": 13,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "HADRIAN",
              "LENET"
            ]
          },
          {
            "col": 21,
            "row": 6,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "HADRIAN",
              "LENET"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 4,
            "y": 9
          },
          {
            "t": "PANTHER",
            "o": 0,
            "x": 4,
            "y": 10
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 5,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 5,
            "y": 10
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 6,
            "y": 9
          },
          {
            "t": "SLAGGER",
            "o": 0,
            "x": 6,
            "y": 10
          },
          {
            "t": "TITAN",
            "o": 0,
            "x": 7,
            "y": 8
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 7,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 31,
            "y": 10
          },
          {
            "t": "KILROY",
            "o": 1,
            "x": 31,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 30,
            "y": 10
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 30,
            "y": 9
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 29,
            "y": 10
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 29,
            "y": 9
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 28,
            "y": 11
          },
          {
            "t": "OCTOPUS",
            "o": 1,
            "x": 28,
            "y": 9
          }
        ]
      },
      {
        "name": "MANY SMALL FRONTS",
        "pack": "AI-made: Open Horizons",
        "campaignId": "open-horizons",
        "mission": 15,
        "author": "AI-made by Codex",
        "source": "levels/open-horizons/15-many-small-fronts.json",
        "description": "A loose field of irregular islands creates many small fronts. Four arsenals per side of the map reward local captures, but scattering every squad leaves no reserve.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 75 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "open maneuver",
          "spread",
          "mixed forces"
        ],
        "design": {
          "theme": "open",
          "layout": 15,
          "formation": "spread",
          "road": "cross"
        },
        "turnLimit": 75,
        "grid": [
          "......................................",
          "......................................",
          ".......-..............................",
          ".....--M--...MMM.............MMM......",
          "....-M-MMM--.MMM............MMMMM.....",
          "....-MMMMM..--M........M....MMMMM.....",
          "....-MMMMMF--.---F....MMM...MMMMM.....",
          "....-.MMM--.....--....MMM....FM.......",
          "....-..--.........--..F-.....-........",
          "....---..MhhhhwwMM.----.------........",
          "....-..MMhhhhwwwwM.-....hhhhMM--......",
          "...B-..MMhhhhwwwM.--....hhhhhMM.--....",
          "....--.MMhhhhh....--.MwwwhhhhMM..-B...",
          "......--MMhhhh....-.MwwwwhhhhMM..-....",
          "........------.----.MMwwhhhhM..---....",
          "........-.....-F..--.........--..-....",
          ".......MF....MMM....--.....--MMM.-....",
          ".....MMMMM...MMM....F---.--FMMMMM-....",
          ".....MMMMM....M........M--..MMMMM-....",
          ".....MMMMM............MMM.--MMM-M-....",
          "......MMM.............MMM...--M--.....",
          "..............................-.......",
          "......................................",
          "......................................"
        ],
        "buildings": [
          {
            "col": 3,
            "row": 11,
            "owner": 0
          },
          {
            "col": 34,
            "row": 12,
            "owner": 1
          },
          {
            "col": 10,
            "row": 6,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "BISON",
              "BISON"
            ]
          },
          {
            "col": 27,
            "row": 17,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "BISON",
              "BISON"
            ]
          },
          {
            "col": 15,
            "row": 15,
            "owner": -1,
            "stored": [
              "KILROY",
              "LENET",
              "LENET",
              "LENET"
            ]
          },
          {
            "col": 22,
            "row": 8,
            "owner": -1,
            "stored": [
              "KILROY",
              "LENET",
              "LENET",
              "LENET"
            ]
          },
          {
            "col": 8,
            "row": 16,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "RABBIT",
              "RABBIT",
              "LYNX"
            ]
          },
          {
            "col": 29,
            "row": 7,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "RABBIT",
              "RABBIT",
              "LYNX"
            ]
          },
          {
            "col": 17,
            "row": 6,
            "owner": -1,
            "stored": [
              "MULE",
              "ATLAS",
              "POLAR",
              "POLAR"
            ]
          },
          {
            "col": 20,
            "row": 17,
            "owner": -1,
            "stored": [
              "MULE",
              "ATLAS",
              "POLAR",
              "POLAR"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 4
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 6,
            "y": 7
          },
          {
            "t": "PANTHER",
            "o": 0,
            "x": 7,
            "y": 9
          },
          {
            "t": "PANTHER",
            "o": 0,
            "x": 5,
            "y": 13
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 6,
            "y": 16
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 10,
            "y": 18
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 5,
            "y": 3
          },
          {
            "t": "POLAR",
            "o": 0,
            "x": 5,
            "y": 7
          },
          {
            "t": "RABBIT",
            "o": 0,
            "x": 8,
            "y": 9
          },
          {
            "t": "LYNX",
            "o": 0,
            "x": 5,
            "y": 12
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 32,
            "y": 19
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 31,
            "y": 16
          },
          {
            "t": "PANTHER",
            "o": 1,
            "x": 30,
            "y": 14
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 32,
            "y": 10
          },
          {
            "t": "GRIZZLY",
            "o": 1,
            "x": 31,
            "y": 7
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 27,
            "y": 5
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 32,
            "y": 20
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 32,
            "y": 16
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 29,
            "y": 14
          },
          {
            "t": "LYNX",
            "o": 1,
            "x": 32,
            "y": 11
          }
        ]
      },
      {
        "name": "HORIZON CONVERGENCE",
        "pack": "AI-made: Open Horizons",
        "campaignId": "open-horizons",
        "mission": 16,
        "author": "AI-made by Codex",
        "source": "levels/open-horizons/16-horizon-convergence.json",
        "description": "Several island chains converge around a wide central gulf. Large mixed armies must choose where to concentrate while keeping distant factory approaches and their own camp covered.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 90 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "open maneuver",
          "split",
          "mixed forces"
        ],
        "design": {
          "theme": "open",
          "layout": 16,
          "formation": "split",
          "road": "fork"
        },
        "turnLimit": 90,
        "grid": [
          "..........................................",
          "..........................................",
          "..........................................",
          ".........---..............................",
          ".......--MMM--............................",
          ".......-MMMMM-.............-----..........",
          ".......-MMMMMF--.......----MMMM.--........",
          ".......-MMMMMMMM---F..-MMMMMMMM..-........",
          ".......-MMMMM..M..--..--.FMMMMMMF-........",
          ".......-.MMM....MMMM---.--MMMMMM-.--......",
          "......-hhhhh.........-..wwwMMMM--...-.....",
          "......-hhhhhh..-.......wwwwwMMh-hhh.-.....",
          "...B..-hhhhhh--.F.......www..--hhhh---....",
          "....---hhhh--..www.......F.--hhhhhh-..B...",
          ".....-.hhh-hMMwwwww.......-..hhhhhh-......",
          ".....-...--MMMMwww..-.........hhhhh-......",
          "......--.-MMMMMM--.---MMMM....MMM.-.......",
          "........-FMMMMMMF.--..--..M..MMMMM-.......",
          "........-..MMMMMMMM-..F---MMMMMMMM-.......",
          "........--.MMMM----.......--FMMMMM-.......",
          "..........-----.............-MMMMM-.......",
          "............................--MMM--.......",
          "..............................---.........",
          "..........................................",
          "..........................................",
          ".........................................."
        ],
        "buildings": [
          {
            "col": 3,
            "row": 12,
            "owner": 0
          },
          {
            "col": 38,
            "row": 13,
            "owner": 1
          },
          {
            "col": 13,
            "row": 6,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET",
              "POLAR",
              "TITAN"
            ]
          },
          {
            "col": 28,
            "row": 19,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET",
              "POLAR",
              "TITAN"
            ]
          },
          {
            "col": 16,
            "row": 17,
            "owner": -1,
            "stored": [
              "KILROY",
              "GRIZZLY",
              "GRIZZLY",
              "GRIZZLY"
            ]
          },
          {
            "col": 25,
            "row": 8,
            "owner": -1,
            "stored": [
              "KILROY",
              "GRIZZLY",
              "GRIZZLY",
              "GRIZZLY"
            ]
          },
          {
            "col": 9,
            "row": 17,
            "owner": -1,
            "stored": [
              "MULE",
              "ATLAS",
              "POLAR",
              "POLAR"
            ]
          },
          {
            "col": 32,
            "row": 8,
            "owner": -1,
            "stored": [
              "MULE",
              "ATLAS",
              "POLAR",
              "POLAR"
            ]
          },
          {
            "col": 19,
            "row": 7,
            "owner": -1,
            "stored": [
              "PELICAN",
              "ATLAS",
              "TITAN",
              "TITAN"
            ]
          },
          {
            "col": 22,
            "row": 18,
            "owner": -1,
            "stored": [
              "PELICAN",
              "ATLAS",
              "TITAN",
              "TITAN"
            ]
          },
          {
            "col": 16,
            "row": 12,
            "owner": -1,
            "stored": [
              "MULE",
              "TRIGGER",
              "LENET",
              "LENET"
            ]
          },
          {
            "col": 25,
            "row": 13,
            "owner": -1,
            "stored": [
              "MULE",
              "TRIGGER",
              "LENET",
              "LENET"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 8,
            "y": 6
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 8,
            "y": 18
          },
          {
            "t": "PANTHER",
            "o": 0,
            "x": 7,
            "y": 5
          },
          {
            "t": "KILROY",
            "o": 0,
            "x": 8,
            "y": 17
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 7,
            "y": 6
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 8,
            "y": 19
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 7,
            "y": 4
          },
          {
            "t": "POLAR",
            "o": 0,
            "x": 7,
            "y": 17
          },
          {
            "t": "SLAGGER",
            "o": 0,
            "x": 8,
            "y": 4
          },
          {
            "t": "TITAN",
            "o": 0,
            "x": 7,
            "y": 18
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 7,
            "y": 7
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 9,
            "y": 18
          },
          {
            "t": "OCTOPUS",
            "o": 0,
            "x": 6,
            "y": 5
          },
          {
            "t": "RABBIT",
            "o": 0,
            "x": 7,
            "y": 16
          },
          {
            "t": "MULE",
            "o": 0,
            "x": 6,
            "y": 6
          },
          {
            "t": "PELICAN",
            "o": 0,
            "x": 9,
            "y": 16
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 33,
            "y": 19
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 33,
            "y": 7
          },
          {
            "t": "PANTHER",
            "o": 1,
            "x": 34,
            "y": 20
          },
          {
            "t": "KILROY",
            "o": 1,
            "x": 33,
            "y": 8
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 34,
            "y": 19
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 33,
            "y": 6
          },
          {
            "t": "GRIZZLY",
            "o": 1,
            "x": 34,
            "y": 21
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 34,
            "y": 8
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 33,
            "y": 21
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 34,
            "y": 7
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 34,
            "y": 18
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 32,
            "y": 7
          },
          {
            "t": "OCTOPUS",
            "o": 1,
            "x": 35,
            "y": 20
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 34,
            "y": 9
          },
          {
            "t": "MULE",
            "o": 1,
            "x": 35,
            "y": 19
          },
          {
            "t": "PELICAN",
            "o": 1,
            "x": 32,
            "y": 9
          }
        ]
      }
    ]
  },
  {
    "id": "knotted-heart",
    "name": "AI-made: The Knotted Heart",
    "description": "Dense interior routes surrounded by spacious flanks: short paths through trouble or long paths around it.",
    "levels": [
      {
        "name": "THE CROSS AND THE FIELD",
        "pack": "AI-made: The Knotted Heart",
        "campaignId": "knotted-heart",
        "mission": 1,
        "author": "AI-made by Codex",
        "source": "levels/knotted-heart/01-the-cross-and-the-field.json",
        "description": "A compact mountain knot has a cross-shaped interior route. The center is short and restrictive; the open outer field lets units maneuver around its arms.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 45 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "dense center / open flanks",
          "line",
          "few units"
        ],
        "design": {
          "theme": "center",
          "layout": 1,
          "formation": "line",
          "road": "direct"
        },
        "turnLimit": 45,
        "grid": [
          ".................hh.......",
          ".......h...........h......",
          "..........................",
          "......MMMMMM--MMMMMM......",
          "...h..MMMMMMF-MMMMMM..h...",
          "......MMMMMM.-MMMMMM......",
          "......MMMMMM.-MMMMMM.h...h",
          "......MMMMMMh-MMMMMM......",
          "..B-.-M-M-M-h-M-M-M-.-....",
          "....-.-M-M-M-h-M-M-M-.-B..",
          "......MMMMMM-hMMMMMM......",
          "h...h.MMMMMM-.MMMMMM......",
          "......MMMMMM-.MMMMMM......",
          "...h..MMMMMM-FMMMMMM..h...",
          "......MMMMMM--MMMMMM......",
          "..........................",
          "......h...........h.......",
          ".......hh................."
        ],
        "buildings": [
          {
            "col": 2,
            "row": 8,
            "owner": 0
          },
          {
            "col": 23,
            "row": 9,
            "owner": 1
          },
          {
            "col": 12,
            "row": 4,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET",
              "LENET"
            ]
          },
          {
            "col": 13,
            "row": 13,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET",
              "LENET"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 3,
            "y": 8
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 1,
            "y": 7
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 2,
            "y": 7
          },
          {
            "t": "RABBIT",
            "o": 0,
            "x": 3,
            "y": 7
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 22,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 24,
            "y": 10
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 23,
            "y": 10
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 22,
            "y": 10
          }
        ]
      },
      {
        "name": "SPOKES",
        "pack": "AI-made: The Knotted Heart",
        "campaignId": "knotted-heart",
        "mission": 2,
        "author": "AI-made by Codex",
        "source": "levels/knotted-heart/02-spokes.json",
        "description": "Radial passages meet at a small hub. A central force can change fronts rapidly, but several entrances lead into it and the spacious rim remains available.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 55 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "dense center / open flanks",
          "spread",
          "mixed forces"
        ],
        "design": {
          "theme": "center",
          "layout": 2,
          "formation": "spread",
          "road": "fork"
        },
        "turnLimit": 55,
        "grid": [
          ".....h........................",
          "..............................",
          "..............................",
          ".........MMMMMMMMMMMMhh.......",
          ".......---MMMMMMMMMMMh........",
          "..hh..-MM-.MMMMMMMMhhMM.h.....",
          "......-MMM-FMMMMMFh.hMM-....hh",
          "..h...-MMMMM--MM.M-MMMM-.....h",
          ".....h-MMMMM.-M----MMMM-..h...",
          "..B-.---h-h--.--.h--.-.-.-...h",
          "h...-.-.-.--h.--.--h-h---.-B..",
          "...h..-MMMM----M-.MMMMM-h.....",
          "h.....-MMMM-M.MM--MMMMM-...h..",
          "hh....-MMh.hFMMMMMF-MMM-......",
          ".....h.MMhhMMMMMMMM.-MM-..hh..",
          "........hMMMMMMMMMMM---.......",
          ".......hhMMMMMMMMMMMM.........",
          "..............................",
          "..............................",
          "........................h....."
        ],
        "buildings": [
          {
            "col": 2,
            "row": 9,
            "owner": 0
          },
          {
            "col": 27,
            "row": 10,
            "owner": 1
          },
          {
            "col": 11,
            "row": 6,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "POLAR",
              "POLAR"
            ]
          },
          {
            "col": 18,
            "row": 13,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "POLAR",
              "POLAR"
            ]
          },
          {
            "col": 12,
            "row": 13,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "HADRIAN",
              "LENET"
            ]
          },
          {
            "col": 17,
            "row": 6,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "HADRIAN",
              "LENET"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 4,
            "y": 3
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 6
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 6,
            "y": 8
          },
          {
            "t": "POLAR",
            "o": 0,
            "x": 4,
            "y": 11
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 5,
            "y": 13
          },
          {
            "t": "RABBIT",
            "o": 0,
            "x": 6,
            "y": 15
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 25,
            "y": 16
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 24,
            "y": 13
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 23,
            "y": 11
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 25,
            "y": 8
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 24,
            "y": 6
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 23,
            "y": 4
          }
        ]
      },
      {
        "name": "THE LADDER",
        "pack": "AI-made: The Knotted Heart",
        "campaignId": "knotted-heart",
        "mission": 3,
        "author": "AI-made by Codex",
        "source": "levels/knotted-heart/03-the-ladder.json",
        "description": "Two close interior lanes are joined by short rungs. Forces on the open flanks can enter at different heights, turning a seemingly simple corridor into several possible fights.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 55 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "dense center / open flanks",
          "split",
          "limited roster"
        ],
        "design": {
          "theme": "center",
          "layout": 3,
          "formation": "split",
          "road": "none"
        },
        "turnLimit": 55,
        "grid": [
          "........h...h......h........",
          "............................",
          "............h.hh.....h......",
          "..B...MMM.MMMMMMMM.MMM......",
          "h.....MMM.MMMMMMMM.MMM......",
          ".h...hMMMhMMMMMMMM.MMM......",
          ".........h-F.h..h......h....",
          "......MMM.MMMMMMMMhMMM...h..",
          "......MMMhMMMMMMMMhMMM......",
          ".h....MMMhMMMMMMMM.MMMh.....",
          "......h.....h.....h.........",
          ".........h.....h.....h......",
          ".....hMMM.MMMMMMMMhMMM....h.",
          "......MMMhMMMMMMMMhMMM......",
          "..h...MMMhMMMMMMMM.MMM......",
          "....h......h..h.F-h.........",
          "......MMM.MMMMMMMMhMMMh...h.",
          "......MMM.MMMMMMMM.MMM.....h",
          "......MMM.MMMMMMMM.MMM...B..",
          "......h.....hh.h............",
          "............................",
          "........h......h...h........"
        ],
        "buildings": [
          {
            "col": 2,
            "row": 3,
            "owner": 0
          },
          {
            "col": 25,
            "row": 18,
            "owner": 1
          },
          {
            "col": 11,
            "row": 6,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "BISON",
              "BISON"
            ]
          },
          {
            "col": 16,
            "row": 15,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "BISON",
              "BISON"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 5
          },
          {
            "t": "PANTHER",
            "o": 0,
            "x": 5,
            "y": 15
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 5,
            "y": 4
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 5,
            "y": 14
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 4,
            "y": 5
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 22,
            "y": 16
          },
          {
            "t": "PANTHER",
            "o": 1,
            "x": 22,
            "y": 6
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 22,
            "y": 17
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 22,
            "y": 7
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 23,
            "y": 16
          }
        ]
      },
      {
        "name": "FOOTPATH MAJORITY",
        "pack": "AI-made: The Knotted Heart",
        "campaignId": "knotted-heart",
        "mission": 4,
        "author": "AI-made by Codex",
        "source": "levels/knotted-heart/04-footpath-majority.json",
        "description": "Infantry and Mules only. The serpentine center is a road problem for the carriers, while Charlie and Kilroy can climb directly across the surrounding mountains.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 55 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "dense center / open flanks",
          "spread",
          "limited roster"
        ],
        "design": {
          "theme": "center",
          "layout": 4,
          "formation": "spread",
          "road": "none"
        },
        "turnLimit": 55,
        "grid": [
          "..h.......h.............h..h..",
          "h....h....h...hh..............",
          "...h...h.B.....h....h.........",
          ".......M...MMMM.MMMMMMM.......",
          "....h...MhM.MhMhMhM.MMM.......",
          "h......MhMhM-M..hMhM.MM...hh..",
          ".h......h...Fh...hh.hMM.......",
          "...h.h.MMMM.M.MhM.M..MM.h.....",
          ".......MMMhM.M.M.M...MM.......",
          ".......MMMhMMMMMMMM.MMM..h....",
          "....h..MMM.MMMMMMMMhMMM.......",
          ".......MM...M.M.M.MhMMM.......",
          ".....h.MM..M.MhM.M.MMMM.h.h...",
          ".......MMh.hh...hF...h......h.",
          "..hh...MM.MhMh..M-MhMhM......h",
          ".......MMM.MhMhMhM.MhM...h....",
          ".......MMMMMMM.MMMM...M.......",
          ".........h....h.....B.h...h...",
          "..............hh...h....h....h",
          "..h..h.............h.......h.."
        ],
        "buildings": [
          {
            "col": 9,
            "row": 2,
            "owner": 0
          },
          {
            "col": 20,
            "row": 17,
            "owner": 1
          },
          {
            "col": 12,
            "row": 6,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "CHARLIE",
              "KILROY",
              "KILROY"
            ]
          },
          {
            "col": 17,
            "row": 13,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "CHARLIE",
              "KILROY",
              "KILROY"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 4,
            "y": 3
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 6
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 6,
            "y": 8
          },
          {
            "t": "KILROY",
            "o": 0,
            "x": 4,
            "y": 11
          },
          {
            "t": "KILROY",
            "o": 0,
            "x": 5,
            "y": 13
          },
          {
            "t": "MULE",
            "o": 0,
            "x": 6,
            "y": 15
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 25,
            "y": 16
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 24,
            "y": 13
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 23,
            "y": 11
          },
          {
            "t": "KILROY",
            "o": 1,
            "x": 25,
            "y": 8
          },
          {
            "t": "KILROY",
            "o": 1,
            "x": 24,
            "y": 6
          },
          {
            "t": "MULE",
            "o": 1,
            "x": 23,
            "y": 4
          }
        ]
      },
      {
        "name": "THE SHORT WAY",
        "pack": "AI-made: The Knotted Heart",
        "campaignId": "knotted-heart",
        "mission": 5,
        "author": "AI-made by Codex",
        "source": "levels/knotted-heart/05-the-short-way.json",
        "description": "Braided interior passages offer the shortest route to the enemy. The defenders bring more guns; the attacker brings speed and enough open flank to refuse the central fight.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 55 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "dense center / open flanks",
          "forward",
          "mixed forces"
        ],
        "design": {
          "theme": "center",
          "layout": 5,
          "formation": "forward",
          "road": "direct"
        },
        "turnLimit": 55,
        "grid": [
          ".............................h....",
          "h...h..h........h................h",
          ".......................h.....h....",
          "...h....MMMMMMMMMMMMMMMMMM...h....",
          "........MMMMMMMMMMMMMMMMMM........",
          "........MMMMM-MMM-.-MMMMMM.h.h....",
          "........MhM--F---M-M----MM........",
          ".h.......--.MhM...-FMMM.--.h.h....",
          "..h....--MMM.M.MMM--M..M.M--......",
          "...B.--.MMMMM.hMMMM.hMMMMM.-.-....",
          "....-.-.MMMMMh.MMMMh.MMMMM.--.B...",
          "......--M.M..M--MMM.M.MMM--....h..",
          "....h.h.--.MMMF-...MhM.--.......h.",
          "........MM----M-M---F--MhM........",
          "....h.h.MMMMMM-.-MMM-MMMMM........",
          "........MMMMMMMMMMMMMMMMMM........",
          "....h...MMMMMMMMMMMMMMMMMM....h...",
          "....h.....h.......................",
          "h................h........h..h...h",
          "....h............................."
        ],
        "buildings": [
          {
            "col": 3,
            "row": 9,
            "owner": 0
          },
          {
            "col": 30,
            "row": 10,
            "owner": 1
          },
          {
            "col": 13,
            "row": 6,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET",
              "LENET"
            ]
          },
          {
            "col": 20,
            "row": 13,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET",
              "LENET"
            ]
          },
          {
            "col": 14,
            "row": 12,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "OCTOPUS",
              "POLAR"
            ]
          },
          {
            "col": 19,
            "row": 7,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "OCTOPUS",
              "POLAR"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 9,
            "y": 8
          },
          {
            "t": "PANTHER",
            "o": 0,
            "x": 9,
            "y": 11
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 8,
            "y": 12
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 9,
            "y": 7
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 7,
            "y": 11
          },
          {
            "t": "RABBIT",
            "o": 0,
            "x": 9,
            "y": 12
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 24,
            "y": 11
          },
          {
            "t": "KILROY",
            "o": 1,
            "x": 24,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 24,
            "y": 8
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 24,
            "y": 12
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 26,
            "y": 8
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 25,
            "y": 7
          }
        ]
      },
      {
        "name": "INNER OR OUTER",
        "pack": "AI-made: The Knotted Heart",
        "campaignId": "knotted-heart",
        "mission": 6,
        "author": "AI-made by Codex",
        "source": "levels/knotted-heart/06-inner-or-outer.json",
        "description": "Nested interior loops contrast with a broad outer circuit. Taking the inside saves distance, while the outside provides room to bring several units alongside one another.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 65 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "dense center / open flanks",
          "line",
          "mixed forces"
        ],
        "design": {
          "theme": "center",
          "layout": 6,
          "formation": "line",
          "road": "rim"
        },
        "turnLimit": 65,
        "grid": [
          ".h.........h............h.........",
          "........h.........h...............",
          "......h..---------------..........",
          "..h...h--.MMMMMMM-MMMMMM----......",
          ".h..h--..MMMM.MMMMMMMMMMM.h.-...h.",
          "h.h.h-.h.Mh--Fh..hhF----M...-h....",
          ".h...-h.MM-MMMMMMMMMMMM-MMh.-hh...",
          ".h...-..MM-MMMMMMMMMMMM-MM..-h....",
          ".....-.----....h...hMMM-MMh.--...h",
          "....h--.MM.MMMhMMMM.MMM-MM....-.h.",
          "...B-.--MM.MM...MM...h..--....-...",
          "...-....--..h...MM...MM.MM--.-B...",
          ".h.-....MM-MMM.MMMMhMMM.MM.--h....",
          "h...--.hMM-MMMh...h....----.-.....",
          "....h-..MM-MMMMMMMMMMMM-MM..-...h.",
          "...hh-.hMM-MMMMMMMMMMMM-MM.h-...h.",
          "....h-...M----Fhh..hF--hM.h.-h.h.h",
          ".h...-.h.MMMMMMMMMMM.MMMM..--h..h.",
          "......----MMMMMM-MMMMMMM.--h...h..",
          "..........---------------..h......",
          "...............h.........h........",
          ".........h............h.........h."
        ],
        "buildings": [
          {
            "col": 3,
            "row": 10,
            "owner": 0
          },
          {
            "col": 30,
            "row": 11,
            "owner": 1
          },
          {
            "col": 13,
            "row": 5,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET",
              "POLAR",
              "TITAN"
            ]
          },
          {
            "col": 20,
            "row": 16,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET",
              "POLAR",
              "TITAN"
            ]
          },
          {
            "col": 14,
            "row": 16,
            "owner": -1,
            "stored": [
              "MULE",
              "ATLAS",
              "POLAR",
              "POLAR"
            ]
          },
          {
            "col": 19,
            "row": 5,
            "owner": -1,
            "stored": [
              "MULE",
              "ATLAS",
              "POLAR",
              "POLAR"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 4,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 3,
            "y": 11
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 3,
            "y": 9
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 2,
            "y": 10
          },
          {
            "t": "POLAR",
            "o": 0,
            "x": 2,
            "y": 11
          },
          {
            "t": "TITAN",
            "o": 0,
            "x": 4,
            "y": 11
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 5,
            "y": 9
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 29,
            "y": 11
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 30,
            "y": 10
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 30,
            "y": 12
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 31,
            "y": 11
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 31,
            "y": 10
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 29,
            "y": 10
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 28,
            "y": 12
          }
        ]
      },
      {
        "name": "THREE IN THE KNOT",
        "pack": "AI-made: The Knotted Heart",
        "campaignId": "knotted-heart",
        "mission": 7,
        "author": "AI-made by Codex",
        "source": "levels/knotted-heart/07-three-in-the-knot.json",
        "description": "One Charlie, one Hadrian and one Rabbit per side. Diagonal interior cuts offer gun positions, but every detached unit leaves only two to defend the rest of the board.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 40 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "dense center / open flanks",
          "line",
          "few units"
        ],
        "design": {
          "theme": "center",
          "layout": 7,
          "formation": "line",
          "road": "none"
        },
        "turnLimit": 40,
        "grid": [
          "................h.h....h",
          "...........h............",
          "...h......hh............",
          ".....hMMMM.MMMM.MM.....h",
          "..h...MMMMh.M..MM..h.h..",
          "......MMMMMMh.MMM.......",
          "...h.hMMMMM...M.hMh.....",
          ".......MMMM.MM..MM...h..",
          "..B.h...MM.MMhh.MM......",
          "......MM.hhMM.MM...h.B..",
          "..h...MM..MM.MMMM.......",
          ".....hMh.M...MMMMMh.h...",
          ".......MMM.hMMMMMM......",
          "..h.h..MM..M.hMMMM...h..",
          "h.....MM.MMMM.MMMMh.....",
          "............hh......h...",
          "............h...........",
          "h....h.h................"
        ],
        "buildings": [
          {
            "col": 2,
            "row": 8,
            "owner": 0
          },
          {
            "col": 21,
            "row": 9,
            "owner": 1
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 1,
            "y": 7
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 2,
            "y": 7
          },
          {
            "t": "RABBIT",
            "o": 0,
            "x": 3,
            "y": 7
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 22,
            "y": 10
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 21,
            "y": 10
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 20,
            "y": 10
          }
        ]
      },
      {
        "name": "ZIPPER",
        "pack": "AI-made: The Knotted Heart",
        "campaignId": "knotted-heart",
        "mission": 8,
        "author": "AI-made by Codex",
        "source": "levels/knotted-heart/08-zipper.json",
        "description": "Offset openings interlock through the central ridge. A force can change lanes at some points and must backtrack at others; the open margins remain a longer escape route.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 65 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "dense center / open flanks",
          "split",
          "mixed forces"
        ],
        "design": {
          "theme": "center",
          "layout": 8,
          "formation": "split",
          "road": "fork"
        },
        "turnLimit": 65,
        "grid": [
          "...h......................hh........",
          ".......................h........h...",
          "............h---------------........",
          "...B.h..MMMM-MMhMMMMMMMMMMMM-..hh...",
          "h...--..MMMM-MMhMMMMMMMMMMMM-.......",
          "....-h-------Fh.h..hMMMMMMMM-.......",
          "....-h.-MMMM-MMMMMM.MMMMMMMM--......",
          "h...---.hh..------h.F---MMMM.-......",
          ".....-..MMMMMMMMMM-..MM-MMMM.-h.....",
          ".....-..MMMM-------.MMM-MMMM..-.....",
          ".....-..MMMMFMMMMMMMMMM-MMMM..-.h...",
          "...h.-..MMMM-MMMMMMMMMMFMMMM..-.....",
          ".....-..MMMM-MMM.-------MMMM..-.....",
          ".....h-.MMMM-MM..-MMMMMMMMMM..-.....",
          "......-.MMMM---F.h------..hh.---...h",
          "......--MMMMMMMM.MMMMMM-MMMM-.h-....",
          ".......-MMMMMMMMh..h.hF-------h-....",
          ".......-MMMMMMMMMMMMhMM-MMMM..--...h",
          "...hh..-MMMMMMMMMMMMhMM-MMMM..h.B...",
          "........---------------h............",
          "...h........h.......................",
          "........hh......................h..."
        ],
        "buildings": [
          {
            "col": 3,
            "row": 3,
            "owner": 0
          },
          {
            "col": 32,
            "row": 18,
            "owner": 1
          },
          {
            "col": 13,
            "row": 5,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET",
              "LENET"
            ]
          },
          {
            "col": 22,
            "row": 16,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET",
              "LENET"
            ]
          },
          {
            "col": 15,
            "row": 14,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "OCTOPUS",
              "POLAR"
            ]
          },
          {
            "col": 20,
            "row": 7,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "OCTOPUS",
              "POLAR"
            ]
          },
          {
            "col": 12,
            "row": 10,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "RABBIT",
              "RABBIT",
              "LYNX"
            ]
          },
          {
            "col": 23,
            "row": 11,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "RABBIT",
              "RABBIT",
              "LYNX"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 7,
            "y": 5
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 7,
            "y": 15
          },
          {
            "t": "PANTHER",
            "o": 0,
            "x": 6,
            "y": 5
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 6,
            "y": 15
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 8,
            "y": 5
          },
          {
            "t": "POLAR",
            "o": 0,
            "x": 7,
            "y": 16
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 7,
            "y": 6
          },
          {
            "t": "RABBIT",
            "o": 0,
            "x": 7,
            "y": 14
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 28,
            "y": 16
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 28,
            "y": 6
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 29,
            "y": 16
          },
          {
            "t": "GRIZZLY",
            "o": 1,
            "x": 29,
            "y": 6
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 27,
            "y": 16
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 28,
            "y": 5
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 28,
            "y": 15
          },
          {
            "t": "OCTOPUS",
            "o": 1,
            "x": 28,
            "y": 7
          }
        ]
      },
      {
        "name": "THE COMFORTABLE COURT",
        "pack": "AI-made: The Knotted Heart",
        "campaignId": "knotted-heart",
        "mission": 9,
        "author": "AI-made by Codex",
        "source": "levels/knotted-heart/09-the-comfortable-court.json",
        "description": "Small protected courts look ideal for heavy tanks. Their narrow connections make it hard to bring that weight to bear against mobile units working around the outside.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 65 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "dense center / open flanks",
          "column",
          "mixed forces"
        ],
        "design": {
          "theme": "center",
          "layout": 9,
          "formation": "column",
          "road": "direct"
        },
        "turnLimit": 65,
        "grid": [
          "..hhhh......h.....h........h....",
          "..h...h.........................",
          ".......h..........h.......h.....",
          "....h..MMMMM.MMMMMMMMMMMM.......",
          ".h.....MMMMM.MMMMMMMMMMMM.......",
          ".....h.MMMMM.MMMMMMMMMMMM.......",
          "......h....-F....hF-h-.h........",
          ".......h.--h---------h--.h......",
          "..h....--..h..h.h.h.h...--..h...",
          ".....--MMMM.h.MMM...hMMMM-......",
          "..B--h-MMMM.h.MMMhh..MMMM-....h.",
          ".h....-MMMM..hhMMM.h.MMMM-h--B..",
          "......-MMMMh...MMM.h.MMMM--.....",
          "...h..--...h.h.h.h..h..--....h..",
          "......h.--h---------h--.h.......",
          "........h.-h-Fh....F-....h......",
          ".......MMMMMMMMMMMM.MMMMM.h.....",
          ".......MMMMMMMMMMMM.MMMMM.....h.",
          ".......MMMMMMMMMMMM.MMMMM..h....",
          ".....h.......h..........h.......",
          ".........................h...h..",
          "....h........h.....h......hhhh.."
        ],
        "buildings": [
          {
            "col": 2,
            "row": 10,
            "owner": 0
          },
          {
            "col": 29,
            "row": 11,
            "owner": 1
          },
          {
            "col": 12,
            "row": 6,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "TITAN",
              "TITAN",
              "TITAN"
            ]
          },
          {
            "col": 19,
            "row": 15,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "TITAN",
              "TITAN",
              "TITAN"
            ]
          },
          {
            "col": 13,
            "row": 15,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET",
              "LENET"
            ]
          },
          {
            "col": 18,
            "row": 6,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET",
              "LENET"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 3,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 4,
            "y": 11
          },
          {
            "t": "GRIZZLY",
            "o": 0,
            "x": 4,
            "y": 10
          },
          {
            "t": "GRIZZLY",
            "o": 0,
            "x": 5,
            "y": 10
          },
          {
            "t": "TITAN",
            "o": 0,
            "x": 5,
            "y": 9
          },
          {
            "t": "TITAN",
            "o": 0,
            "x": 5,
            "y": 11
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 6,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 28,
            "y": 11
          },
          {
            "t": "PANTHER",
            "o": 1,
            "x": 27,
            "y": 10
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 27,
            "y": 11
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 26,
            "y": 11
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 26,
            "y": 12
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 26,
            "y": 10
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 25,
            "y": 11
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 25,
            "y": 10
          }
        ]
      },
      {
        "name": "A LOOP AND A NEEDLE",
        "pack": "AI-made: The Knotted Heart",
        "campaignId": "knotted-heart",
        "mission": 10,
        "author": "AI-made by Codex",
        "source": "levels/knotted-heart/10-a-loop-and-a-needle.json",
        "description": "A roomy interior loop is cut by one narrow direct tunnel. Guns can cover nearby sectors, while moving the supporting vehicles between those sectors takes a different route.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 70 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "dense center / open flanks",
          "gunline",
          "mixed forces"
        ],
        "design": {
          "theme": "center",
          "layout": 10,
          "formation": "gunline",
          "road": "rim"
        },
        "turnLimit": 70,
        "grid": [
          "................................h...",
          "...................h.........h......",
          "..........h-------h-------...h......",
          "....h....--MMMMMMM-MMMMMM.--..h.....",
          ".......--.MMMMMMMMMMMMMMMM..--......",
          ".....--..MMMM.MMMMMMMMMMMMM...--....",
          ".....-..hMM--Fh...h.hF--.MM..h.-....",
          ".....-..MMM-MMMMMMMMMMMM-MMM...-....",
          "....h-..MMM-MMMMMMMMMMMM-MMM...-..h.",
          ".....-.hMMM-MMMMMMMMMMMM-MMM...-....",
          ".....-..MMM-MMMMMMMMMMMM-MMMh.h-h...",
          "...B-.--M-.FM.M.M.MhM.M.--M-....-...",
          "...-....-M--.M.MhM.M.M.MF.-M--.-B...",
          "...h-h.hMMM-MMMMMMMMMMMM-MMM..-.....",
          "....-...MMM-MMMMMMMMMMMM-MMMh.-.....",
          ".h..-...MMM-MMMMMMMMMMMM-MMM..-h....",
          "....-...MMM-MMMMMMMMMMMM-MMM..-.....",
          "....-.h..MM.--Fh.h...hF--MMh..-.....",
          "....--...MMMMMMMMMMMMM.MMMM..--.....",
          "......--..MMMMMMMMMMMMMMMM.--.......",
          ".....h..--.MMMMMM-MMMMMMM--....h....",
          "......h...-------h-------h..........",
          "......h.........h...................",
          "...h................................"
        ],
        "buildings": [
          {
            "col": 3,
            "row": 11,
            "owner": 0
          },
          {
            "col": 32,
            "row": 12,
            "owner": 1
          },
          {
            "col": 13,
            "row": 6,
            "owner": -1,
            "stored": [
              "MULE",
              "ATLAS",
              "POLAR",
              "POLAR"
            ]
          },
          {
            "col": 22,
            "row": 17,
            "owner": -1,
            "stored": [
              "MULE",
              "ATLAS",
              "POLAR",
              "POLAR"
            ]
          },
          {
            "col": 14,
            "row": 17,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "HADRIAN",
              "LENET"
            ]
          },
          {
            "col": 21,
            "row": 6,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "HADRIAN",
              "LENET"
            ]
          },
          {
            "col": 11,
            "row": 11,
            "owner": -1,
            "stored": [
              "PELICAN",
              "ATLAS",
              "TITAN",
              "TITAN"
            ]
          },
          {
            "col": 24,
            "row": 12,
            "owner": -1,
            "stored": [
              "PELICAN",
              "ATLAS",
              "TITAN",
              "TITAN"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 9,
            "y": 7
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 9,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 9,
            "y": 11
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 11,
            "y": 13
          },
          {
            "t": "POLAR",
            "o": 0,
            "x": 8,
            "y": 17
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 7,
            "y": 7
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 7,
            "y": 9
          },
          {
            "t": "MULE",
            "o": 0,
            "x": 8,
            "y": 12
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 26,
            "y": 16
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 26,
            "y": 14
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 26,
            "y": 12
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 24,
            "y": 10
          },
          {
            "t": "GRIZZLY",
            "o": 1,
            "x": 27,
            "y": 6
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 24,
            "y": 17
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 28,
            "y": 14
          },
          {
            "t": "PELICAN",
            "o": 1,
            "x": 26,
            "y": 11
          }
        ]
      },
      {
        "name": "BETWEEN THE TEETH",
        "pack": "AI-made: The Knotted Heart",
        "campaignId": "knotted-heart",
        "mission": 11,
        "author": "AI-made by Codex",
        "source": "levels/knotted-heart/11-between-the-teeth.json",
        "description": "Only capturers and missile buggies. A comb of narrow mouths opens onto two broad flanks, giving retreating buggies many positions but few places to hide a careless capturer.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 55 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "dense center / open flanks",
          "spread",
          "limited roster"
        ],
        "design": {
          "theme": "center",
          "layout": 11,
          "formation": "spread",
          "road": "cross"
        },
        "turnLimit": 55,
        "grid": [
          "...............h.......h..hh......",
          ".........h..h.......h.....hh......",
          "....h..----B.......h....h.........",
          "h....--.MM.-.MMMhMMMMMMMMM..h.....",
          "...h....M.M-M-Mh..MhMhMMMM......h.",
          "...h.......--F...h....MMMM....h..h",
          ".........M.M-M.M.M.M.MMMMM.h......",
          ".h......MMM.--h.h.h......h........",
          "....h...MMM.h.--h.h...h..h........",
          "......h.MMMMMMMM--MMMMMMMM.......h",
          "h.......MMMMMMMM--MMMMMMMM.h......",
          "........h..h...h.h--.h.MMM...h....",
          "........h......h.h.h--.MMM......h.",
          "......h.MMMMM.M.M.M.M-M.M.........",
          "h..h....MMMM....h...F--.......h...",
          ".h......MMMMhMhM..hM-M-M.M....h...",
          ".....h..MMMMMMMMMhMMM.-.MM.--....h",
          ".........h....h.......B----..h....",
          "......hh.....h.......h..h.........",
          "......hh..h.......h..............."
        ],
        "buildings": [
          {
            "col": 11,
            "row": 2,
            "owner": 0
          },
          {
            "col": 22,
            "row": 17,
            "owner": 1
          },
          {
            "col": 13,
            "row": 5,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "RABBIT",
              "RABBIT",
              "LYNX"
            ]
          },
          {
            "col": 20,
            "row": 14,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "RABBIT",
              "RABBIT",
              "LYNX"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 3
          },
          {
            "t": "PANTHER",
            "o": 0,
            "x": 6,
            "y": 6
          },
          {
            "t": "RABBIT",
            "o": 0,
            "x": 7,
            "y": 8
          },
          {
            "t": "RABBIT",
            "o": 0,
            "x": 5,
            "y": 11
          },
          {
            "t": "LYNX",
            "o": 0,
            "x": 6,
            "y": 13
          },
          {
            "t": "LYNX",
            "o": 0,
            "x": 7,
            "y": 15
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 28,
            "y": 16
          },
          {
            "t": "PANTHER",
            "o": 1,
            "x": 27,
            "y": 13
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 26,
            "y": 11
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 28,
            "y": 8
          },
          {
            "t": "LYNX",
            "o": 1,
            "x": 27,
            "y": 6
          },
          {
            "t": "LYNX",
            "o": 1,
            "x": 26,
            "y": 4
          }
        ]
      },
      {
        "name": "FAN OUT",
        "pack": "AI-made: The Knotted Heart",
        "campaignId": "knotted-heart",
        "mission": 12,
        "author": "AI-made by Codex",
        "source": "levels/knotted-heart/12-fan-out.json",
        "description": "Several passages fan away from an off-center meeting point. Occupying that point shortens transfers between fronts, but moving too much through it creates traffic.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 75 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "dense center / open flanks",
          "forward",
          "mixed forces"
        ],
        "design": {
          "theme": "center",
          "layout": 12,
          "formation": "forward",
          "road": "fork"
        },
        "turnLimit": 75,
        "grid": [
          "..............h....h.........h........",
          "..................h.....h.............",
          "......................................",
          "h.........MMMMMhMMMMMMMMMMMMM......h..",
          ".........hMMMMMM.MMMMMMMMMMM..........",
          "...hh....M.MMMMMh.MMMMMMMMM...........",
          ".........-.--MMMM.MMMMMMMMhMM.........",
          "........-M-.-MMMMM.MMMMMM..----h......",
          "........-MMM--MFMM.hMMMMh--MM.--......",
          ".h......-MMMMM-M--M-M-F--MMMM...-.....",
          "........-MMMMM..MM-.-h-MMMMMM...-.....",
          "h..B...--MMMMMM..--M-.h...hF--h---....",
          "....---h--Fh...h.-M--..MMMMMM--...B..h",
          ".....-...MMMMMM-h-.-MM..MMMMM-........",
          ".....-...MMMM--F-M-M--M-MMMMM-......h.",
          "......--.MM--hMMMMh.MMFM--MMM-........",
          "......h----..MMMMMM.MMMMM-.-M-........",
          ".........MMhMMMMMMMM.MMMM--.-.........",
          "...........MMMMMMMMM.hMMMMM.M....hh...",
          "..........MMMMMMMMMMM.MMMMMMh.........",
          "..h......MMMMMMMMMMMMMhMMMMM.........h",
          "......................................",
          ".............h.....h..................",
          "........h.........h....h.............."
        ],
        "buildings": [
          {
            "col": 3,
            "row": 11,
            "owner": 0
          },
          {
            "col": 34,
            "row": 12,
            "owner": 1
          },
          {
            "col": 15,
            "row": 8,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET",
              "POLAR",
              "TITAN"
            ]
          },
          {
            "col": 22,
            "row": 15,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET",
              "POLAR",
              "TITAN"
            ]
          },
          {
            "col": 15,
            "row": 14,
            "owner": -1,
            "stored": [
              "KILROY",
              "GRIZZLY",
              "GRIZZLY",
              "GRIZZLY"
            ]
          },
          {
            "col": 22,
            "row": 9,
            "owner": -1,
            "stored": [
              "KILROY",
              "GRIZZLY",
              "GRIZZLY",
              "GRIZZLY"
            ]
          },
          {
            "col": 10,
            "row": 12,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "OCTOPUS",
              "POLAR"
            ]
          },
          {
            "col": 27,
            "row": 11,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "OCTOPUS",
              "POLAR"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 10,
            "y": 9
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 9,
            "y": 12
          },
          {
            "t": "PANTHER",
            "o": 0,
            "x": 11,
            "y": 15
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 10,
            "y": 7
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 11,
            "y": 12
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 12,
            "y": 15
          },
          {
            "t": "POLAR",
            "o": 0,
            "x": 8,
            "y": 8
          },
          {
            "t": "TITAN",
            "o": 0,
            "x": 8,
            "y": 11
          },
          {
            "t": "OCTOPUS",
            "o": 0,
            "x": 10,
            "y": 16
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 12,
            "y": 8
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 27,
            "y": 14
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 28,
            "y": 11
          },
          {
            "t": "KILROY",
            "o": 1,
            "x": 27,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 27,
            "y": 16
          },
          {
            "t": "GRIZZLY",
            "o": 1,
            "x": 26,
            "y": 11
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 26,
            "y": 8
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 29,
            "y": 15
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 29,
            "y": 12
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 25,
            "y": 8
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 25,
            "y": 15
          }
        ]
      },
      {
        "name": "TWO HEARTS",
        "pack": "AI-made: The Knotted Heart",
        "campaignId": "knotted-heart",
        "mission": 13,
        "author": "AI-made by Codex",
        "source": "levels/knotted-heart/13-two-hearts.json",
        "description": "Two dense knots share a small central connection. Armies can contest one knot, divide between both, or use the broad outside field to bypass either concentration.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 80 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "dense center / open flanks",
          "split",
          "mixed forces"
        ],
        "design": {
          "theme": "center",
          "layout": 13,
          "formation": "split",
          "road": "rim"
        },
        "turnLimit": 80,
        "grid": [
          "h.......h...............................",
          "...h...........---.-.h............h.....",
          "........h------.h.-F------------........",
          "........-MMMMMMMMMMM-MMMMMMMMMM.-.......",
          "....B-h--MMMMMMMMMMMMMMMMMMMMMMh-h......",
          "......--.MMMMMMMMMMMMMMMMMMMMMM.--......",
          "...h..-.--------.MMMMMMhh.h...h..-.....h",
          "......-hhMMMMMM-FMMMMMMFMMMMMMM..-......",
          "......---MMMMMMM-MMMMMM-MMMMMMMh.-......",
          "..hh.h-.FMMMMMMM-MMMMMM-MMMMMMM..-......",
          "h...h.-..MMMMMMM-MMMMMM-MMMMMMM..-.h....",
          "h.....-..MMMMMMM-..h...-MMMMMMM..-......",
          "......-..MMMMMMM-...h..-MMMMMMM..-.....h",
          "....h.-..MMMMMMM-MMMMMM-MMMMMMM..-.h...h",
          "......-..MMMMMMM-MMMMMM-MMMMMMMF.-h.hh..",
          "......-.hMMMMMMM-MMMMMM-MMMMMMM---......",
          "......-..MMMMMMMFMMMMMMF-MMMMMMhh-......",
          "h.....-..h...h.hhMMMMMM.--------.-..h...",
          "......--.MMMMMMMMMMMMMMMMMMMMMM.--......",
          "......h-hMMMMMMMMMMMMMMMMMMMMMM--h-B....",
          ".......-.MMMMMMMMMM-MMMMMMMMMMM-........",
          "........------------F-.h.------h........",
          ".....h............h.-.---...........h...",
          "...............................h.......h"
        ],
        "buildings": [
          {
            "col": 4,
            "row": 4,
            "owner": 0
          },
          {
            "col": 35,
            "row": 19,
            "owner": 1
          },
          {
            "col": 16,
            "row": 7,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET",
              "LENET"
            ]
          },
          {
            "col": 23,
            "row": 16,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET",
              "LENET"
            ]
          },
          {
            "col": 16,
            "row": 16,
            "owner": -1,
            "stored": [
              "MULE",
              "ATLAS",
              "POLAR",
              "POLAR"
            ]
          },
          {
            "col": 23,
            "row": 7,
            "owner": -1,
            "stored": [
              "MULE",
              "ATLAS",
              "POLAR",
              "POLAR"
            ]
          },
          {
            "col": 8,
            "row": 9,
            "owner": -1,
            "stored": [
              "PELICAN",
              "ATLAS",
              "TITAN",
              "TITAN"
            ]
          },
          {
            "col": 31,
            "row": 14,
            "owner": -1,
            "stored": [
              "PELICAN",
              "ATLAS",
              "TITAN",
              "TITAN"
            ]
          },
          {
            "col": 19,
            "row": 2,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "RABBIT",
              "RABBIT",
              "LYNX"
            ]
          },
          {
            "col": 20,
            "row": 21,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "RABBIT",
              "RABBIT",
              "LYNX"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 8,
            "y": 6
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 8,
            "y": 17
          },
          {
            "t": "PANTHER",
            "o": 0,
            "x": 7,
            "y": 5
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 7,
            "y": 16
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 9,
            "y": 6
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 8,
            "y": 16
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 8,
            "y": 5
          },
          {
            "t": "MULE",
            "o": 0,
            "x": 7,
            "y": 17
          },
          {
            "t": "PELICAN",
            "o": 0,
            "x": 9,
            "y": 5
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 31,
            "y": 17
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 31,
            "y": 6
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 32,
            "y": 18
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 32,
            "y": 7
          },
          {
            "t": "GRIZZLY",
            "o": 1,
            "x": 30,
            "y": 17
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 31,
            "y": 7
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 31,
            "y": 18
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 32,
            "y": 6
          },
          {
            "t": "PELICAN",
            "o": 1,
            "x": 30,
            "y": 18
          }
        ]
      },
      {
        "name": "THE OFF-CENTER PRIZE",
        "pack": "AI-made: The Knotted Heart",
        "campaignId": "knotted-heart",
        "mission": 14,
        "author": "AI-made by Codex",
        "source": "levels/knotted-heart/14-the-off-center-prize.json",
        "description": "Unevenly placed spokes lead toward valuable central factories. The fastest-looking entry turns your force away from the route it must take to continue toward the enemy camp.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 65 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "dense center / open flanks",
          "split",
          "mixed forces"
        ],
        "design": {
          "theme": "center",
          "layout": 14,
          "formation": "split",
          "road": "direct"
        },
        "turnLimit": 65,
        "grid": [
          "h....................h.......h..h...",
          "...h..................h............h",
          "h..........h............h...........",
          "...........MMMMMM.MMMMMMM...h.....h.",
          ".h.....h..MMMMMMMhMMMMMMMM......h...",
          "........h.M-MMMMM.MMMMMMMMM.........",
          ".......----M-FMM.MMMMMMMMh.-........",
          ".......-M-MMMM--.-MMMMMh.--M--..h...",
          ".......-MM--MMMM-M--Mh.--MMM.-......",
          ".......-MMMFMMMMhMM-F--MMMMM.-...h..",
          "...B.--.MMMMh.Mh.----.MMMMMM.-.-....",
          "....-.-.MMMMMM.----.hM.hMMMM.--.B...",
          "..h...-.MMMMM--F-MMhMMMMFMMM-.......",
          "......-.MMM--.hM--M-MMMM--MM-.......",
          "...h..--M--.hMMMMM-.--MMMM-M-.......",
          "........-.hMMMMMMMM.MMF-M----.......",
          ".........MMMMMMMMM.MMMMM-M.h........",
          "...h......MMMMMMMMhMMMMMMM..h.....h.",
          ".h.....h...MMMMMMM.MMMMMM...........",
          "...........h............h..........h",
          "h............h..................h...",
          "...h..h.......h....................h"
        ],
        "buildings": [
          {
            "col": 3,
            "row": 10,
            "owner": 0
          },
          {
            "col": 32,
            "row": 11,
            "owner": 1
          },
          {
            "col": 13,
            "row": 6,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "OCTOPUS",
              "POLAR"
            ]
          },
          {
            "col": 22,
            "row": 15,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "OCTOPUS",
              "POLAR"
            ]
          },
          {
            "col": 15,
            "row": 12,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET",
              "POLAR",
              "TITAN"
            ]
          },
          {
            "col": 20,
            "row": 9,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET",
              "POLAR",
              "TITAN"
            ]
          },
          {
            "col": 11,
            "row": 9,
            "owner": -1,
            "stored": [
              "MULE",
              "TRIGGER",
              "BISON",
              "BISON"
            ]
          },
          {
            "col": 24,
            "row": 12,
            "owner": -1,
            "stored": [
              "MULE",
              "TRIGGER",
              "BISON",
              "BISON"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 7,
            "y": 5
          },
          {
            "t": "PANTHER",
            "o": 0,
            "x": 7,
            "y": 15
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 7,
            "y": 6
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 7,
            "y": 14
          },
          {
            "t": "POLAR",
            "o": 0,
            "x": 8,
            "y": 6
          },
          {
            "t": "TITAN",
            "o": 0,
            "x": 8,
            "y": 15
          },
          {
            "t": "RABBIT",
            "o": 0,
            "x": 7,
            "y": 4
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 28,
            "y": 16
          },
          {
            "t": "KILROY",
            "o": 1,
            "x": 28,
            "y": 6
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 28,
            "y": 15
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 28,
            "y": 7
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 27,
            "y": 15
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 27,
            "y": 6
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 28,
            "y": 17
          }
        ]
      },
      {
        "name": "OUTSIDE THE FORTRESS",
        "pack": "AI-made: The Knotted Heart",
        "campaignId": "knotted-heart",
        "mission": 15,
        "author": "AI-made by Codex",
        "source": "levels/knotted-heart/15-outside-the-fortress.json",
        "description": "The defender has an imposing heavy force beside a dense central fortress. The attacker has more flexible movement around its spacious outskirts; the strongest local position need not control the whole map.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 85 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "dense center / open flanks",
          "spread",
          "mixed forces"
        ],
        "design": {
          "theme": "center",
          "layout": 15,
          "formation": "spread",
          "road": "rim"
        },
        "turnLimit": 85,
        "grid": [
          ".........h..h......h....h...............",
          "..h...........................hh........",
          ".h...................h...h...h..........",
          ".........-----------------------.....h..",
          "h....hh--MMMMMMMMMMMMMMMMMMMMMM.--......",
          "h....--..MM.M-M-M-MMMMMMMMMMMMM..-......",
          "..h..-h..Mh--.-F-hFMMh.---.-.hM...--....",
          ".....-h..M-MMMMMMM.MMhFMhM-M--M....-..h.",
          ".....-..hM-MMMMMMM.MM.MMMMMMM-M....-....",
          ".....-...M-MMMMMMM.MMhMMMMMMM-M....-h.h.",
          ".....-...M-MMMMMMM.MMhMMMMMMM-M.....-h..",
          ".....---.M-MMMMMMMhMM.MMMMMMM-M.....-...",
          "h..B-...----Fh.hh...hh...h..h-......-...",
          "...-......-h..h...hh...hh.hF----...-B..h",
          "...-.....M-MMMMMMM.MMhMMMMMMM-M.---.....",
          "..h-.....M-MMMMMMMhMM.MMMMMMM-M...-.....",
          ".h.h-....M-MMMMMMMhMM.MMMMMMM-M...-.....",
          "....-....M-MMMMMMM.MM.MMMMMMM-Mh..-.....",
          ".h..-....M--M-MhMFhMM.MMMMMMM-M..h-.....",
          "....--...Mh.-.---.hMMFh-F-.--hM..h-..h..",
          "......-..MMMMMMMMMMMMM-M-M-M.MM..--....h",
          "......--.MMMMMMMMMMMMMMMMMMMMMM--hh....h",
          "..h.....-----------------------.........",
          "..........h...h...h...................h.",
          "........hh...........................h..",
          "...............h....h......h..h........."
        ],
        "buildings": [
          {
            "col": 3,
            "row": 12,
            "owner": 0
          },
          {
            "col": 36,
            "row": 13,
            "owner": 1
          },
          {
            "col": 15,
            "row": 6,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET",
              "LENET"
            ]
          },
          {
            "col": 24,
            "row": 19,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET",
              "LENET"
            ]
          },
          {
            "col": 17,
            "row": 18,
            "owner": -1,
            "stored": [
              "MULE",
              "ATLAS",
              "POLAR",
              "POLAR"
            ]
          },
          {
            "col": 22,
            "row": 7,
            "owner": -1,
            "stored": [
              "MULE",
              "ATLAS",
              "POLAR",
              "POLAR"
            ]
          },
          {
            "col": 12,
            "row": 12,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "RABBIT",
              "RABBIT",
              "LYNX"
            ]
          },
          {
            "col": 27,
            "row": 13,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "RABBIT",
              "RABBIT",
              "LYNX"
            ]
          },
          {
            "col": 18,
            "row": 6,
            "owner": -1,
            "stored": [
              "KILROY",
              "GRIZZLY",
              "GRIZZLY",
              "GRIZZLY"
            ]
          },
          {
            "col": 21,
            "row": 19,
            "owner": -1,
            "stored": [
              "KILROY",
              "GRIZZLY",
              "GRIZZLY",
              "GRIZZLY"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 5
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 7,
            "y": 8
          },
          {
            "t": "PANTHER",
            "o": 0,
            "x": 8,
            "y": 11
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 5,
            "y": 14
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 7,
            "y": 17
          },
          {
            "t": "SLAGGER",
            "o": 0,
            "x": 8,
            "y": 20
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 6,
            "y": 5
          },
          {
            "t": "RABBIT",
            "o": 0,
            "x": 7,
            "y": 7
          },
          {
            "t": "PELICAN",
            "o": 0,
            "x": 7,
            "y": 11
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 34,
            "y": 20
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 32,
            "y": 17
          },
          {
            "t": "GIANT",
            "o": 1,
            "x": 31,
            "y": 14
          },
          {
            "t": "GIANT",
            "o": 1,
            "x": 34,
            "y": 11
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 32,
            "y": 8
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 31,
            "y": 5
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 33,
            "y": 20
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 32,
            "y": 18
          },
          {
            "t": "MULE",
            "o": 1,
            "x": 32,
            "y": 14
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 34,
            "y": 12
          }
        ]
      },
      {
        "name": "HEART OF THE MATTER",
        "pack": "AI-made: The Knotted Heart",
        "campaignId": "knotted-heart",
        "mission": 16,
        "author": "AI-made by Codex",
        "source": "levels/knotted-heart/16-heart-of-the-matter.json",
        "description": "A large interlocking center has several rooms, loops and narrow transfers. Twelve neutral factories pull the armies in different directions while the outer field leaves room for a major turning movement.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 95 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "dense center / open flanks",
          "split",
          "mixed forces"
        ],
        "design": {
          "theme": "center",
          "layout": 16,
          "formation": "split",
          "road": "fork"
        },
        "turnLimit": 95,
        "grid": [
          "......h...................h........h......",
          ".......h.....h....................h...h.h.",
          "........hh.-.h.---.h..............h.h.....",
          ".........--.---...-F.h.h..................",
          ".........-MMMMMMMMMMMMMMMMMM.M.M...h......",
          "...h.h.h.-MMMMMMMMMMMMMMMMMM...M..........",
          "........h-MMMMMMMMMMMMMMMMMMFhMM.....h....",
          "h........-.-.-.-hMMMMMMMMMMM--MM.....h....",
          "..h..h...--M-M--FMMMM..F--...---h-........",
          "..h.h....-MMMMM-hMMMMhM-M-M--MMM-.--...hhh",
          ".......h.-MMMMM.-MMMh--M-M-..MMM...-h....h",
          ".........-MMMMM.-MMMh-MMMMM.MMMM....-.....",
          ".........-MMMMM.-MMM.-M....MMMMM....-.....",
          "...B...--.--F.hh---F--h-.h.MMMMM...---....",
          "....---...MMMMM.h.-h--F---hh.F--.--...B...",
          ".....-....MMMMM....M-.MMM-.MMMMM-.........",
          ".....-....MMMM.MMMMM-hMMM-.MMMMM-.........",
          "h....h-...MMM..-M-M--hMMM-.MMMMM-.h.......",
          "hhh...--.-MMM--M-M-MhMMMMh-MMMMM-....h.h..",
          "........-h---...--F..MMMMF--M-M--...h..h..",
          "....h.....MM--MMMMMMMMMMMh-.-.-.-........h",
          "....h.....MMhFMMMMMMMMMMMMMMMMMM-h........",
          "..........M...MMMMMMMMMMMMMMMMMM-.h.h.h...",
          "......h...M.M.MMMMMMMMMMMMMMMMMM-.........",
          "..................h.h.F-...---.--.........",
          ".....h.h..............h.---.h.-.hh........",
          ".h.h...h....................h.....h.......",
          "......h........h...................h......"
        ],
        "buildings": [
          {
            "col": 3,
            "row": 13,
            "owner": 0
          },
          {
            "col": 38,
            "row": 14,
            "owner": 1
          },
          {
            "col": 16,
            "row": 8,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET",
              "POLAR",
              "TITAN"
            ]
          },
          {
            "col": 25,
            "row": 19,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET",
              "POLAR",
              "TITAN"
            ]
          },
          {
            "col": 18,
            "row": 19,
            "owner": -1,
            "stored": [
              "MULE",
              "ATLAS",
              "POLAR",
              "POLAR"
            ]
          },
          {
            "col": 23,
            "row": 8,
            "owner": -1,
            "stored": [
              "MULE",
              "ATLAS",
              "POLAR",
              "POLAR"
            ]
          },
          {
            "col": 12,
            "row": 13,
            "owner": -1,
            "stored": [
              "PELICAN",
              "ATLAS",
              "TITAN",
              "TITAN"
            ]
          },
          {
            "col": 29,
            "row": 14,
            "owner": -1,
            "stored": [
              "PELICAN",
              "ATLAS",
              "TITAN",
              "TITAN"
            ]
          },
          {
            "col": 19,
            "row": 3,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "OCTOPUS",
              "POLAR"
            ]
          },
          {
            "col": 22,
            "row": 24,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "OCTOPUS",
              "POLAR"
            ]
          },
          {
            "col": 13,
            "row": 21,
            "owner": -1,
            "stored": [
              "MULE",
              "TRIGGER",
              "LENET",
              "LENET"
            ]
          },
          {
            "col": 28,
            "row": 6,
            "owner": -1,
            "stored": [
              "MULE",
              "TRIGGER",
              "LENET",
              "LENET"
            ]
          },
          {
            "col": 19,
            "row": 13,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "RABBIT",
              "RABBIT",
              "LYNX"
            ]
          },
          {
            "col": 22,
            "row": 14,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "RABBIT",
              "RABBIT",
              "LYNX"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 8,
            "y": 7
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 8,
            "y": 20
          },
          {
            "t": "PANTHER",
            "o": 0,
            "x": 9,
            "y": 6
          },
          {
            "t": "KILROY",
            "o": 0,
            "x": 8,
            "y": 19
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 9,
            "y": 7
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 7,
            "y": 19
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 7,
            "y": 6
          },
          {
            "t": "POLAR",
            "o": 0,
            "x": 9,
            "y": 19
          },
          {
            "t": "TITAN",
            "o": 0,
            "x": 8,
            "y": 6
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 7,
            "y": 20
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 7,
            "y": 7
          },
          {
            "t": "OCTOPUS",
            "o": 0,
            "x": 9,
            "y": 20
          },
          {
            "t": "RABBIT",
            "o": 0,
            "x": 8,
            "y": 8
          },
          {
            "t": "MULE",
            "o": 0,
            "x": 8,
            "y": 21
          },
          {
            "t": "PELICAN",
            "o": 0,
            "x": 9,
            "y": 5
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 33,
            "y": 20
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 33,
            "y": 7
          },
          {
            "t": "PANTHER",
            "o": 1,
            "x": 32,
            "y": 21
          },
          {
            "t": "KILROY",
            "o": 1,
            "x": 33,
            "y": 8
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 32,
            "y": 20
          },
          {
            "t": "GRIZZLY",
            "o": 1,
            "x": 34,
            "y": 8
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 34,
            "y": 21
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 32,
            "y": 8
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 33,
            "y": 21
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 34,
            "y": 7
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 34,
            "y": 20
          },
          {
            "t": "OCTOPUS",
            "o": 1,
            "x": 32,
            "y": 7
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 33,
            "y": 19
          },
          {
            "t": "MULE",
            "o": 1,
            "x": 33,
            "y": 6
          },
          {
            "t": "PELICAN",
            "o": 1,
            "x": 32,
            "y": 22
          }
        ]
      }
    ]
  },
  {
    "id": "broken-ground",
    "name": "AI-made: Broken Ground",
    "description": "Roads, hills, wasteland and valleys give different units different maps to fight on.",
    "levels": [
      {
        "name": "THE PRICE OF A HILL",
        "pack": "AI-made: Broken Ground",
        "campaignId": "broken-ground",
        "mission": 1,
        "author": "AI-made by Codex",
        "source": "levels/broken-ground/01-the-price-of-a-hill.json",
        "description": "Three squads each cross a field of hill belts. Charlie, Bison and Panther pay different movement costs for the same terrain; a short route on the map can be a slow route for the unit.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 45 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "terrain-dependent routes",
          "line",
          "few units"
        ],
        "design": {
          "theme": "rough",
          "layout": 1,
          "formation": "line",
          "road": "none"
        },
        "turnLimit": 45,
        "grid": [
          "........................",
          "........................",
          ".............hhh........",
          ".......hhhhhhhhhhhhh....",
          "....hhhhhhhhhhhhhhhh....",
          ".....hhhhhhhhhh.........",
          "........................",
          ".........hhhhhhhhhhh....",
          "..B.....hhhhhhhhhhhh....",
          "....hhhhhhhhhhhh.....B..",
          "....hhhhhhhhhhh.........",
          "........................",
          ".........hhhhhhhhhh.....",
          "....hhhhhhhhhhhhhhhh....",
          "....hhhhhhhhhhhhh.......",
          "........hhh.............",
          "........................",
          "........................"
        ],
        "buildings": [
          {
            "col": 2,
            "row": 8,
            "owner": 0
          },
          {
            "col": 21,
            "row": 9,
            "owner": 1
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 1,
            "y": 7
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 2,
            "y": 7
          },
          {
            "t": "PANTHER",
            "o": 0,
            "x": 3,
            "y": 7
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 22,
            "y": 10
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 21,
            "y": 10
          },
          {
            "t": "PANTHER",
            "o": 1,
            "x": 20,
            "y": 10
          }
        ]
      },
      {
        "name": "THE GILDED CAGE",
        "pack": "AI-made: Broken Ground",
        "campaignId": "broken-ground",
        "mission": 2,
        "author": "AI-made by Codex",
        "source": "levels/broken-ground/02-the-gilded-cage.json",
        "description": "Giants dominate nearby ground but cannot enter wasteland. A winding road threads the waste fields; the lighter opposing army has more ways to approach the queue.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 60 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "terrain-dependent routes",
          "column",
          "mixed forces"
        ],
        "design": {
          "theme": "rough",
          "layout": 2,
          "formation": "column",
          "road": "zigzag"
        },
        "turnLimit": 60,
        "grid": [
          "..............................",
          "..............................",
          "........wwwwwww...............",
          ".......wwwwwwwww.......hhhh...",
          "......www-hhwwwwwwwwwwhhhhh...",
          ".....ww-F-hhhhwwwwwwwwhhhhh...",
          "....wwww----hhwwwwwwwwwhhh....",
          "....wwMwh-hh--wwwwwwwwwww.....",
          "....wwMMw-hhww--wwwwwwwwww....",
          "..B-wwM--wwwww--wwwwwww---....",
          "....---wwwwwww--wwwww--Mww-B..",
          "....wwwwwwwwww--wwhh-wMMww....",
          ".....wwwwwwwwwww--hh-hwMww....",
          "....hhhwwwwwwwwwhh----wwww....",
          "...hhhhhwwwwwwwwhhhh-F-ww.....",
          "...hhhhhwwwwwwwwwwhh-www......",
          "...hhhh.......wwwwwwwww.......",
          "...............wwwwwww........",
          "..............................",
          ".............................."
        ],
        "buildings": [
          {
            "col": 2,
            "row": 9,
            "owner": 0
          },
          {
            "col": 27,
            "row": 10,
            "owner": 1
          },
          {
            "col": 8,
            "row": 5,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "TITAN",
              "TITAN",
              "TITAN"
            ]
          },
          {
            "col": 21,
            "row": 14,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "TITAN",
              "TITAN",
              "TITAN"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 3,
            "y": 9
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 3,
            "y": 10
          },
          {
            "t": "GIANT",
            "o": 0,
            "x": 4,
            "y": 10
          },
          {
            "t": "GIANT",
            "o": 0,
            "x": 5,
            "y": 10
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 5,
            "y": 9
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 26,
            "y": 10
          },
          {
            "t": "PANTHER",
            "o": 1,
            "x": 26,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 25,
            "y": 10
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 25,
            "y": 9
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 24,
            "y": 10
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 24,
            "y": 9
          }
        ]
      },
      {
        "name": "MOTORCYCLE COUNTRY",
        "pack": "AI-made: Broken Ground",
        "campaignId": "broken-ground",
        "mission": 3,
        "author": "AI-made by Codex",
        "source": "levels/broken-ground/03-motorcycle-country.json",
        "description": "Capturers and Rabbits share a road network across broad wasteland shoals. Panthers cannot leave the firm routes into wasteland, even where a Rabbit can cross.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 50 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "terrain-dependent routes",
          "spread",
          "limited roster"
        ],
        "design": {
          "theme": "rough",
          "layout": 3,
          "formation": "spread",
          "road": "fork"
        },
        "turnLimit": 50,
        "grid": [
          "............................",
          ".....................ww.....",
          "...................wwwwww...",
          "..B..wwwww........wwwhhhhw..",
          "..-.www-wwww......wwhhhhhhw.",
          "..-wwww-F-wwwwwwwww---hhhww.",
          "..-wwww--w--wwwww--wwM--ww..",
          "..--w--wwwww--w--ww.wMMw-...",
          "....-wwwwwwwhw-wwww....--...",
          "....-.....wwhwwwwww....-....",
          "....-....wwwwwwhww.....-....",
          "...--....wwww-whwwwwwww-....",
          "...-wMMw.ww--w--wwwww--w--..",
          "..ww--Mww--wwwww--w--wwww-..",
          ".wwhhh---wwwwwwwww-F-wwww-..",
          ".whhhhhhww......wwww-www.-..",
          "..whhhhwww........wwwww..B..",
          "...wwwwww...................",
          ".....ww.....................",
          "............................"
        ],
        "buildings": [
          {
            "col": 2,
            "row": 3,
            "owner": 0
          },
          {
            "col": 25,
            "row": 16,
            "owner": 1
          },
          {
            "col": 8,
            "row": 5,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "PANTHER",
              "RABBIT",
              "RABBIT"
            ]
          },
          {
            "col": 19,
            "row": 14,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "PANTHER",
              "RABBIT",
              "RABBIT"
            ]
          }
        ],
        "units": [
          {
            "t": "PANTHER",
            "o": 0,
            "x": 4,
            "y": 3
          },
          {
            "t": "PANTHER",
            "o": 0,
            "x": 5,
            "y": 7
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 6,
            "y": 8
          },
          {
            "t": "RABBIT",
            "o": 0,
            "x": 4,
            "y": 11
          },
          {
            "t": "RABBIT",
            "o": 0,
            "x": 5,
            "y": 13
          },
          {
            "t": "PANTHER",
            "o": 1,
            "x": 23,
            "y": 16
          },
          {
            "t": "PANTHER",
            "o": 1,
            "x": 22,
            "y": 12
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 21,
            "y": 11
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 23,
            "y": 8
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 22,
            "y": 6
          }
        ]
      },
      {
        "name": "THE LONG CAUSEWAY",
        "pack": "AI-made: Broken Ground",
        "campaignId": "broken-ground",
        "mission": 4,
        "author": "AI-made by Codex",
        "source": "levels/broken-ground/04-the-long-causeway.json",
        "description": "Valley seams interrupt the difficult ground. Bridges carry the vehicle routes, while Pelicans can move cargo to legal landing hexes beyond a crowded crossing.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 65 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "terrain-dependent routes",
          "line",
          "mixed forces"
        ],
        "design": {
          "theme": "rough",
          "layout": 4,
          "formation": "line",
          "road": "direct"
        },
        "turnLimit": 65,
        "grid": [
          "...........v......vv..............",
          "...................v..............",
          ".......ww..B.-......v.............",
          ".....wMMww..-v--....v.hhhhhhhh....",
          "....wwMMMww--v..--..hhhhhhhhhhh...",
          "....wwwMwF-w-.v...--hhhhhhhhhhh...",
          "....wwwwwwww-.v....-F-hhhhhhhhh...",
          "....wwwwwww--vv...hh-v-hhhhhh.....",
          ".....wwwwww-.v....hh.v--..........",
          "......-www-.-v.......=------......",
          "......------=.......v-.-www-......",
          "..........--v.hh....v.-wwwwww.....",
          ".....hhhhhh-v-hh...vv--wwwwwww....",
          "...hhhhhhhhh-F-....v.-wwwwwwww....",
          "...hhhhhhhhhhh--...v.-w-FwMwww....",
          "...hhhhhhhhhhh..--..v--wwMMMww....",
          "....hhhhhhhh.v....--v-..wwMMw.....",
          ".............v......-.B..ww.......",
          "..............v...................",
          "..............vv......v..........."
        ],
        "buildings": [
          {
            "col": 11,
            "row": 2,
            "owner": 0
          },
          {
            "col": 22,
            "row": 17,
            "owner": 1
          },
          {
            "col": 9,
            "row": 5,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET",
              "LENET"
            ]
          },
          {
            "col": 24,
            "row": 14,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET",
              "LENET"
            ]
          },
          {
            "col": 13,
            "row": 13,
            "owner": -1,
            "stored": [
              "PELICAN",
              "ATLAS",
              "TITAN",
              "TITAN"
            ]
          },
          {
            "col": 20,
            "row": 6,
            "owner": -1,
            "stored": [
              "PELICAN",
              "ATLAS",
              "TITAN",
              "TITAN"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 11,
            "y": 3
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 12,
            "y": 3
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 11,
            "y": 4
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 12,
            "y": 4
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 10,
            "y": 3
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 10,
            "y": 4
          },
          {
            "t": "PELICAN",
            "o": 0,
            "x": 13,
            "y": 2
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 22,
            "y": 16
          },
          {
            "t": "KILROY",
            "o": 1,
            "x": 21,
            "y": 16
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 22,
            "y": 15
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 21,
            "y": 15
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 23,
            "y": 16
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 23,
            "y": 15
          },
          {
            "t": "PELICAN",
            "o": 1,
            "x": 20,
            "y": 17
          }
        ]
      },
      {
        "name": "WALKING THE RIDGE",
        "pack": "AI-made: Broken Ground",
        "campaignId": "broken-ground",
        "mission": 5,
        "author": "AI-made by Codex",
        "source": "levels/broken-ground/05-walking-the-ridge.json",
        "description": "Infantry and Mules only. Connected hill belts are cheap for foot soldiers and costly for their carriers; the road around the edge offers a different kind of shortcut.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 60 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "terrain-dependent routes",
          "split",
          "limited roster"
        ],
        "design": {
          "theme": "rough",
          "layout": 5,
          "formation": "split",
          "road": "rim"
        },
        "turnLimit": 60,
        "grid": [
          "............................",
          "............................",
          "............h..-------......",
          "...........hh--.wwwww-hh....",
          "....--.....--wwwwwwwhh--h...",
          "hh..-.--F--.wwwwwwwwhhhh--..",
          "hhhh-...-..hwwwwwwwwwhhhh-..",
          "hhhh-h.hhhhhwwwwwwwwwwww.-.h",
          "..hh-hMhhhhhwwwwwwwwwwww.-hh",
          "...--MMhhhhhhhwwwwwwww.hh-hh",
          "..B.hMMhhhhhhhhhhh.hhhhhh-h.",
          ".h-hhhhhh.hhhhhhhhhhhMMh.B..",
          "hh-hh.wwwwwwwwhhhhhhhMM--...",
          "hh-.wwwwwwwwwwwwhhhhhMh-hh..",
          "h.-.wwwwwwwwwwwwhhhhh.h-hhhh",
          "..-hhhhwwwwwwwwwh..-...-hhhh",
          "..--hhhhwwwwwwww.--F--.-..hh",
          "...h--hhwwwwwww--.....--....",
          "....hh-wwwww.--hh...........",
          "......-------..h............",
          "............................",
          "............................"
        ],
        "buildings": [
          {
            "col": 2,
            "row": 10,
            "owner": 0
          },
          {
            "col": 25,
            "row": 11,
            "owner": 1
          },
          {
            "col": 8,
            "row": 5,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "CHARLIE",
              "KILROY",
              "KILROY"
            ]
          },
          {
            "col": 19,
            "row": 16,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "CHARLIE",
              "KILROY",
              "KILROY"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 5
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 15
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 4
          },
          {
            "t": "KILROY",
            "o": 0,
            "x": 5,
            "y": 14
          },
          {
            "t": "KILROY",
            "o": 0,
            "x": 4,
            "y": 5
          },
          {
            "t": "MULE",
            "o": 0,
            "x": 4,
            "y": 15
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 22,
            "y": 16
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 22,
            "y": 6
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 22,
            "y": 17
          },
          {
            "t": "KILROY",
            "o": 1,
            "x": 22,
            "y": 7
          },
          {
            "t": "KILROY",
            "o": 1,
            "x": 23,
            "y": 16
          },
          {
            "t": "MULE",
            "o": 1,
            "x": 23,
            "y": 6
          }
        ]
      },
      {
        "name": "THE ROAD IS NOT COVER",
        "pack": "AI-made: Broken Ground",
        "campaignId": "broken-ground",
        "mission": 6,
        "author": "AI-made by Codex",
        "source": "levels/broken-ground/06-the-road-is-not-cover.json",
        "description": "A fast exposed road crosses alternating hill and waste banks. Leaving it gives better terrain defense but spends movement, and the motorcycle capturer has fewer off-road choices.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 60 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "terrain-dependent routes",
          "column",
          "mixed forces"
        ],
        "design": {
          "theme": "rough",
          "layout": 6,
          "formation": "column",
          "road": "cross"
        },
        "turnLimit": 60,
        "grid": [
          "................................",
          "................................",
          ".......hhhhhhh..................",
          "....h-hhhhhhhhhhh.......hhhh....",
          "....h-hhhhhhhhhhh.hhhhhhhhhhh...",
          "....-hhhhFhhhhhhhhhhhhhhhhhhh...",
          "....-----....hhhhhhFhhhhMhhh....",
          "...--wwwwwwwwwwwhhhh-hhhMMh.....",
          "...-wwwwwwwwwwwww---------......",
          "..B-wwwwwwwwwww--.wwwwwww.--....",
          "....--.wwwwwww.--wwwwwwwwwww-B..",
          "......---------wwwwwwwwwwwww-...",
          ".....hMMhhh-hhhhwwwwwwwwwww--...",
          "....hhhMhhhhFhhhhhh....-----....",
          "...hhhhhhhhhhhhhhhhhhhFhhhh-....",
          "...hhhhhhhhhhh.hhhhhhhhhhh-h....",
          "....hhhh.......hhhhhhhhhhh-h....",
          "..................hhhhhhh.......",
          "................................",
          "................................"
        ],
        "buildings": [
          {
            "col": 2,
            "row": 9,
            "owner": 0
          },
          {
            "col": 29,
            "row": 10,
            "owner": 1
          },
          {
            "col": 9,
            "row": 5,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "POLAR",
              "POLAR"
            ]
          },
          {
            "col": 22,
            "row": 14,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "POLAR",
              "POLAR"
            ]
          },
          {
            "col": 12,
            "row": 13,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "HADRIAN",
              "LENET"
            ]
          },
          {
            "col": 19,
            "row": 6,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "HADRIAN",
              "LENET"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 3,
            "y": 9
          },
          {
            "t": "PANTHER",
            "o": 0,
            "x": 4,
            "y": 10
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 4,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 5,
            "y": 10
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 5,
            "y": 9
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 6,
            "y": 11
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 28,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 27,
            "y": 9
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 27,
            "y": 10
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 26,
            "y": 9
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 26,
            "y": 10
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 25,
            "y": 8
          }
        ]
      },
      {
        "name": "GUNS IN THE MUD",
        "pack": "AI-made: Broken Ground",
        "campaignId": "broken-ground",
        "mission": 7,
        "author": "AI-made by Codex",
        "source": "levels/broken-ground/07-guns-in-the-mud.json",
        "description": "Your artillery-heavy force must relocate through broken waste and hill patches. An attractive firing position may take a full turn to leave and another to make useful again.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 65 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "terrain-dependent routes",
          "gunline",
          "mixed forces"
        ],
        "design": {
          "theme": "rough",
          "layout": 7,
          "formation": "gunline",
          "road": "zigzag"
        },
        "turnLimit": 65,
        "grid": [
          "..............................",
          "..............................",
          ".....---...............hhh....",
          ".....-M.--............hhhhhh..",
          ".....-MMw-wwww.......hhhhhhh..",
          "...---M-Fw-wwwww.....hhhhhhh..",
          "...-ww-www-wwwwww.....hhhhh...",
          "..-wwwwwhh--hwwwwFwww---......",
          "..-wwwwhhhhh--w-w----www--....",
          "..-.wwwhhhhhh--w-hhhhhhw-w--..",
          "..B.wwwhhhhhh-ww-hhhhhhw-ww-..",
          "..-ww-whhhhhh-ww-hhhhhhwww.B..",
          "..--w-whhhhhh-w--hhhhhhwww.-..",
          "....--www----w-w--hhhhhwwww-..",
          "......---wwwFwwwwh--hhwwwww-..",
          "...hhhhh.....wwwwww-www-ww-...",
          "..hhhhhhh.....wwwww-wF-M---...",
          "..hhhhhhh.......wwww-wMM-.....",
          "..hhhhhh............--.M-.....",
          "....hhh...............---.....",
          "..............................",
          ".............................."
        ],
        "buildings": [
          {
            "col": 2,
            "row": 10,
            "owner": 0
          },
          {
            "col": 27,
            "row": 11,
            "owner": 1
          },
          {
            "col": 8,
            "row": 5,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "BISON",
              "LENET"
            ]
          },
          {
            "col": 21,
            "row": 16,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "BISON",
              "LENET"
            ]
          },
          {
            "col": 12,
            "row": 14,
            "owner": -1,
            "stored": [
              "MULE",
              "ATLAS",
              "POLAR",
              "POLAR"
            ]
          },
          {
            "col": 17,
            "row": 7,
            "owner": -1,
            "stored": [
              "MULE",
              "ATLAS",
              "POLAR",
              "POLAR"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 8,
            "y": 6
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 8,
            "y": 8
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 6,
            "y": 11
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 6,
            "y": 13
          },
          {
            "t": "OCTOPUS",
            "o": 0,
            "x": 6,
            "y": 15
          },
          {
            "t": "MULE",
            "o": 0,
            "x": 7,
            "y": 5
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 21,
            "y": 15
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 21,
            "y": 13
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 21,
            "y": 10
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 21,
            "y": 8
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 21,
            "y": 6
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 22,
            "y": 16
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 22,
            "y": 14
          }
        ]
      },
      {
        "name": "FIRM GROUND",
        "pack": "AI-made: Broken Ground",
        "campaignId": "broken-ground",
        "mission": 8,
        "author": "AI-made by Codex",
        "source": "levels/broken-ground/08-firm-ground.json",
        "description": "Mine teams compete over the few firm routes between large waste fields. Each mine has its own Mule, but transport unloading still needs plain, road, bridge or an owned factory.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 70 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "terrain-dependent routes",
          "column",
          "mixed forces"
        ],
        "design": {
          "theme": "rough",
          "layout": 8,
          "formation": "column",
          "road": "fork"
        },
        "turnLimit": 70,
        "grid": [
          "..................................",
          ".....---..........................",
          ".....-ww--wwwww...................",
          "...B-wwww-wwwwww.wwwwww...hhhh....",
          "..-..wwww---wwwwwwwwwwww.hhhhhh...",
          "..-wwwww-Fw-wwwwwwwwwwwwwhhhhhh...",
          "..-wwwwwwwww--wwwwwwwwwww--hhhh...",
          "..-wwwwwwwwwhh--wwwwFww--w--......",
          "..--wwwMwwwwwwww--hh---www..-.....",
          "...-wwMMMwwwwwwwww---wwwww..-.....",
          "....-wMMwwwwwwwwwwwwwwwwwww.--....",
          "....--.wwwwwwwwwwwwwwwwwwwMMw-....",
          ".....-..wwwww---wwwwwwwwwMMMww-...",
          ".....-..www---hh--wwwwwwwwMwww--..",
          "......--w--wwFwwww--hhwwwwwwwww-..",
          "...hhhh--wwwwwwwwwww--wwwwwwwww-..",
          "...hhhhhhwwwwwwwwwwwww-wF-wwwww-..",
          "...hhhhhh.wwwwwwwwwwww---wwww..-..",
          "....hhhh...wwwwww.wwwwww-wwww-B...",
          "...................wwwww--ww-.....",
          "..........................---.....",
          ".................................."
        ],
        "buildings": [
          {
            "col": 3,
            "row": 3,
            "owner": 0
          },
          {
            "col": 30,
            "row": 18,
            "owner": 1
          },
          {
            "col": 9,
            "row": 5,
            "owner": -1,
            "stored": [
              "MULE",
              "TRIGGER",
              "BISON",
              "BISON"
            ]
          },
          {
            "col": 24,
            "row": 16,
            "owner": -1,
            "stored": [
              "MULE",
              "TRIGGER",
              "BISON",
              "BISON"
            ]
          },
          {
            "col": 13,
            "row": 14,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET",
              "LENET"
            ]
          },
          {
            "col": 20,
            "row": 7,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET",
              "LENET"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 3,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 4,
            "y": 11
          },
          {
            "t": "MULE",
            "o": 0,
            "x": 4,
            "y": 10
          },
          {
            "t": "TRIGGER",
            "o": 0,
            "x": 5,
            "y": 10
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 5,
            "y": 11
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 6,
            "y": 11
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 5,
            "y": 9
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 7,
            "y": 11
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 30,
            "y": 11
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 29,
            "y": 10
          },
          {
            "t": "MULE",
            "o": 1,
            "x": 29,
            "y": 11
          },
          {
            "t": "TRIGGER",
            "o": 1,
            "x": 28,
            "y": 11
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 28,
            "y": 10
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 27,
            "y": 10
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 28,
            "y": 12
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 26,
            "y": 10
          }
        ]
      },
      {
        "name": "FOUR MACHINES",
        "pack": "AI-made: Broken Ground",
        "campaignId": "broken-ground",
        "mission": 9,
        "author": "AI-made by Codex",
        "source": "levels/broken-ground/09-four-machines.json",
        "description": "Four squads each, no replacement stock. A quilt of hills and wasteland makes the Lenet's speed, Polar's weight and Hadrian's firing position matter in different ways.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 50 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "terrain-dependent routes",
          "spread",
          "few units"
        ],
        "design": {
          "theme": "rough",
          "layout": 9,
          "formation": "spread",
          "road": "none"
        },
        "turnLimit": 50,
        "grid": [
          "..........................",
          "..........................",
          ".....hh....hhh.....hh.....",
          "....hhhh..hhhhhh..hhhhh...",
          "...hhhhhh.hhhhhh.hhhhhhh..",
          "...hhhhhh.hhhhhh.hhhhhhh..",
          "....hhhh..hhhhhh..hMhhh...",
          "....................M.....",
          "....wwww..wwwwww..wwww....",
          "..B.wwwww.wwwwww.wwwwww...",
          "...wwwwww.wwwwww.wwwww.B..",
          "....wwww..wwwwww..wwww....",
          ".....M....................",
          "...hhhMh..hhhhhh..hhhh....",
          "..hhhhhhh.hhhhhh.hhhhhh...",
          "..hhhhhhh.hhhhhh.hhhhhh...",
          "...hhhhh..hhhhhh..hhhh....",
          ".....hh.....hhh....hh.....",
          "..........................",
          ".........................."
        ],
        "buildings": [
          {
            "col": 2,
            "row": 9,
            "owner": 0
          },
          {
            "col": 23,
            "row": 10,
            "owner": 1
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 4,
            "y": 3
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 4,
            "y": 6
          },
          {
            "t": "POLAR",
            "o": 0,
            "x": 5,
            "y": 8
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 4,
            "y": 11
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 21,
            "y": 16
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 21,
            "y": 13
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 20,
            "y": 11
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 21,
            "y": 8
          }
        ]
      },
      {
        "name": "BROKEN LADDER",
        "pack": "AI-made: Broken Ground",
        "campaignId": "broken-ground",
        "mission": 10,
        "author": "AI-made by Codex",
        "source": "levels/broken-ground/10-broken-ladder.json",
        "description": "Two valley cuts cross a ladder of firm routes. Some rungs are fast and exposed, others bend through hills; committing to a rung can leave the army on the wrong side of the next cut.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 75 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "terrain-dependent routes",
          "split",
          "mixed forces"
        ],
        "design": {
          "theme": "rough",
          "layout": 10,
          "formation": "split",
          "road": "ladder"
        },
        "turnLimit": 75,
        "grid": [
          "...........v............v...........",
          "...........v............v...........",
          "...........v...........vv...........",
          ".......M...v...........v.....h......",
          ".....wwMM.v....---.....v...hhhhh....",
          "...wwwwMMwv..--hh---...v..hhhhhhh...",
          "...ww--MM-F--.hhh--.---=..hhh-hhh...",
          "...--w--w--..hhhhhhh..v.--.F-hhh....",
          "..-wwwww-ww..hhhhhhh.Fv...----......",
          "..-wwwwwwwvv.hhhhhhh.-v...---.--....",
          "..--.wwww..v.hhhhhhhh-vv.--.....-...",
          "...B.......v.hhhhhhhhh-=-.......-...",
          "...-.......-=-hhhhhhhhh.v.......B...",
          "...-.....--.vv-hhhhhhhh.v..wwww.--..",
          "....--.---...v-.hhhhhhh.vvwwwwwww-..",
          "......----...vF.hhhhhhh..ww-wwwww-..",
          "....hhh-F.--.v..hhhhhhh..--w--w--...",
          "...hhh-hhh..=---.--hhh.--F-MM--ww...",
          "...hhhhhhh..v...---hh--..vwMMwwww...",
          "....hhhhh...v.....---....v.MMww.....",
          "......h.....v...........v...M.......",
          "...........vv...........v...........",
          "...........v............v...........",
          "...........v............v..........."
        ],
        "buildings": [
          {
            "col": 3,
            "row": 11,
            "owner": 0
          },
          {
            "col": 32,
            "row": 12,
            "owner": 1
          },
          {
            "col": 10,
            "row": 6,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "RABBIT",
              "RABBIT",
              "LYNX"
            ]
          },
          {
            "col": 25,
            "row": 17,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "RABBIT",
              "RABBIT",
              "LYNX"
            ]
          },
          {
            "col": 14,
            "row": 15,
            "owner": -1,
            "stored": [
              "PELICAN",
              "ATLAS",
              "TITAN",
              "TITAN"
            ]
          },
          {
            "col": 21,
            "row": 8,
            "owner": -1,
            "stored": [
              "PELICAN",
              "ATLAS",
              "TITAN",
              "TITAN"
            ]
          },
          {
            "col": 8,
            "row": 16,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "HADRIAN",
              "LENET"
            ]
          },
          {
            "col": 27,
            "row": 7,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "HADRIAN",
              "LENET"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 7,
            "y": 6
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 7,
            "y": 17
          },
          {
            "t": "PANTHER",
            "o": 0,
            "x": 6,
            "y": 6
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 7,
            "y": 16
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 6,
            "y": 7
          },
          {
            "t": "POLAR",
            "o": 0,
            "x": 6,
            "y": 17
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 7,
            "y": 7
          },
          {
            "t": "RABBIT",
            "o": 0,
            "x": 8,
            "y": 17
          },
          {
            "t": "PELICAN",
            "o": 0,
            "x": 7,
            "y": 5
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 28,
            "y": 17
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 28,
            "y": 6
          },
          {
            "t": "KILROY",
            "o": 1,
            "x": 29,
            "y": 17
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 28,
            "y": 7
          },
          {
            "t": "GRIZZLY",
            "o": 1,
            "x": 29,
            "y": 16
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 29,
            "y": 6
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 28,
            "y": 16
          },
          {
            "t": "LYNX",
            "o": 1,
            "x": 27,
            "y": 6
          },
          {
            "t": "PELICAN",
            "o": 1,
            "x": 28,
            "y": 18
          }
        ]
      },
      {
        "name": "THE PATIENT GIANT",
        "pack": "AI-made: Broken Ground",
        "campaignId": "broken-ground",
        "mission": 11,
        "author": "AI-made by Codex",
        "source": "levels/broken-ground/11-the-patient-giant.json",
        "description": "A slow heavy group faces a broad diagonal waste belt. The long firm route keeps the Giant mobile, while mobile opponents can choose when to cross closer to it.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 70 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "terrain-dependent routes",
          "line",
          "mixed forces"
        ],
        "design": {
          "theme": "rough",
          "layout": 11,
          "formation": "line",
          "road": "rim"
        },
        "turnLimit": 70,
        "grid": [
          ".wwwww............................",
          ".wwwwww...........................",
          ".wwwwwwww--B......................",
          "..wwwww--w.---...-.......-hhhh....",
          "..www--wwww-w.---.--...--h----h...",
          "...--wwwwF-www......---.hhhhhh--..",
          "...-wwwwwwwwwwww.....-.hhhhhhhh-..",
          "...-..wwwwwwwwwww...F-.hhhhhhhh-..",
          "...-...Mwwwwwwwwww..-..hhhhhhhh-..",
          "...-.hMMMwwwwwhhwwww...hhhhhhhh-..",
          "...-hhMMhhwwwwhhwwwwww.hhhhhhhh-..",
          "..-hhhhhhhh.wwwwwwhhwwwwhhMMhh-...",
          "..-hhhhhhhh...wwwwhhwwwwwMMMh.-...",
          "..-hhhhhhhh..-..wwwwwwwwwwM...-...",
          "..-hhhhhhhh.-F...wwwwwwwwwww..-...",
          "..-hhhhhhhh.-.....wwwwwwwwwwww-...",
          "..--hhhhhh.---......www-Fwwww--...",
          "...h----h--...--.---.w-wwww--www..",
          "....hhhh-.......-...---.w--wwwww..",
          "......................B--wwwwwwww.",
          "...........................wwwwww.",
          "............................wwwww."
        ],
        "buildings": [
          {
            "col": 11,
            "row": 2,
            "owner": 0
          },
          {
            "col": 22,
            "row": 19,
            "owner": 1
          },
          {
            "col": 9,
            "row": 5,
            "owner": -1,
            "stored": [
              "MULE",
              "ATLAS",
              "POLAR",
              "POLAR"
            ]
          },
          {
            "col": 24,
            "row": 16,
            "owner": -1,
            "stored": [
              "MULE",
              "ATLAS",
              "POLAR",
              "POLAR"
            ]
          },
          {
            "col": 13,
            "row": 14,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET",
              "POLAR",
              "TITAN"
            ]
          },
          {
            "col": 20,
            "row": 7,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET",
              "POLAR",
              "TITAN"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 11,
            "y": 3
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 12,
            "y": 3
          },
          {
            "t": "GIANT",
            "o": 0,
            "x": 11,
            "y": 4
          },
          {
            "t": "TITAN",
            "o": 0,
            "x": 10,
            "y": 3
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 10,
            "y": 4
          },
          {
            "t": "MULE",
            "o": 0,
            "x": 9,
            "y": 2
          },
          {
            "t": "RABBIT",
            "o": 0,
            "x": 12,
            "y": 4
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 22,
            "y": 18
          },
          {
            "t": "PANTHER",
            "o": 1,
            "x": 21,
            "y": 18
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 22,
            "y": 17
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 23,
            "y": 18
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 23,
            "y": 17
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 21,
            "y": 17
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 24,
            "y": 19
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 23,
            "y": 19
          }
        ]
      },
      {
        "name": "RIDGES AND RUNWAYS",
        "pack": "AI-made: Broken Ground",
        "campaignId": "broken-ground",
        "mission": 12,
        "author": "AI-made by Codex",
        "source": "levels/broken-ground/12-ridges-and-runways.json",
        "description": "Long hill ridges alternate with flat landing strips and waste depressions. Pelican cargo needs those firm strips; flying over a good defensive hill does not make it a legal unloading site.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 75 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "terrain-dependent routes",
          "forward",
          "mixed forces"
        ],
        "design": {
          "theme": "rough",
          "layout": 12,
          "formation": "forward",
          "road": "fork"
        },
        "turnLimit": 75,
        "grid": [
          "......................................",
          "......................................",
          ".....................h.h.h.h..........",
          "...hhhhhhh.h.h.h....hhhhhhhhhhhhhh....",
          "...hhhhhhhhhhhhhhh..hhhhhhhhhhhhhhh...",
          "....hhhhh-Fw-wwwwww...h.h.h.hhhhhhh...",
          ".......www---wwwwwwwwwww....hh--hh....",
          "......wwwwww-wwwwwwwwwF-....MMM-......",
          "........wwww-wwwwww-hh.-.h.h.MF-......",
          ".........-.---.-.---hhh-hhhhhh--hh....",
          "...B.hh--h-h.h-h--.-hhh-hhhhhhh---....",
          "....---hhhhhhh-hhh-.--h-h.h-h--hh.B...",
          "....hh--hhhhhh-hhh---.-.---.-.........",
          "......-FM.h.h.-.hh-wwwwww-wwww........",
          "......-MMM....-Fwwwwwwwww-wwwwww......",
          "....hh--hh....wwwwwwwwwww---www.......",
          "...hhhhhhh.h.h.h...wwwwww-wF-hhhhh....",
          "...hhhhhhhhhhhhhhh..hhhhhhhhhhhhhhh...",
          "....hhhhhhhhhhhhhh....h.h.h.hhhhhhh...",
          "..........h.h.h.h.....................",
          "......................................",
          "......................................"
        ],
        "buildings": [
          {
            "col": 3,
            "row": 10,
            "owner": 0
          },
          {
            "col": 34,
            "row": 11,
            "owner": 1
          },
          {
            "col": 10,
            "row": 5,
            "owner": -1,
            "stored": [
              "PELICAN",
              "ATLAS",
              "HAWKEYE",
              "TITAN"
            ]
          },
          {
            "col": 27,
            "row": 16,
            "owner": -1,
            "stored": [
              "PELICAN",
              "ATLAS",
              "HAWKEYE",
              "TITAN"
            ]
          },
          {
            "col": 15,
            "row": 14,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET",
              "LENET"
            ]
          },
          {
            "col": 22,
            "row": 7,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET",
              "LENET"
            ]
          },
          {
            "col": 7,
            "row": 13,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "OCTOPUS",
              "POLAR"
            ]
          },
          {
            "col": 30,
            "row": 8,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "OCTOPUS",
              "POLAR"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 10,
            "y": 8
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 10,
            "y": 11
          },
          {
            "t": "PANTHER",
            "o": 0,
            "x": 10,
            "y": 13
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 9,
            "y": 7
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 10,
            "y": 10
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 9,
            "y": 12
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 10,
            "y": 7
          },
          {
            "t": "PELICAN",
            "o": 0,
            "x": 9,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 27,
            "y": 13
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 27,
            "y": 10
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 27,
            "y": 8
          },
          {
            "t": "GRIZZLY",
            "o": 1,
            "x": 28,
            "y": 14
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 27,
            "y": 11
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 28,
            "y": 9
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 27,
            "y": 14
          },
          {
            "t": "PELICAN",
            "o": 1,
            "x": 28,
            "y": 11
          }
        ]
      },
      {
        "name": "THE FALSE SHORTCUT",
        "pack": "AI-made: Broken Ground",
        "campaignId": "broken-ground",
        "mission": 13,
        "author": "AI-made by Codex",
        "source": "levels/broken-ground/13-the-false-shortcut.json",
        "description": "A visually short route cuts straight through deep wasteland. The road bends away from the objective but can be faster, especially for a Panther or a heavy vehicle with little movement.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 75 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "terrain-dependent routes",
          "split",
          "mixed forces"
        ],
        "design": {
          "theme": "rough",
          "layout": 13,
          "formation": "split",
          "road": "zigzag"
        },
        "turnLimit": 75,
        "grid": [
          "....................................",
          "....................................",
          "......hhhhhhhh......................",
          "....hhhMhhhhhhhhh............h......",
          "...B.hhMMhhhhhhhh..hhhhhhh.hhhhh....",
          "..-..hhMM---hhh-.hhhhhhhhhhhhhhhh...",
          "..-..hhMM-Fh---w--hhhhhhhhhhhhhhh...",
          "..-....--..wwwwwwh-hhhhhhhhFhhhh....",
          "..-..--w.wwwwwwwww--hFhhhh.-........",
          "..---wwwwwwwwwwww--w--.....-.www....",
          "..-wwwwwwwwwwwwww--w..--.--w--www...",
          "..--wwwwwwwwwwwww--www.w-wwww---w...",
          "...w---wwww-w.www--wwwwwwwwwwwww--..",
          "...www--w--.--..w--wwwwwwwwwwwwww-..",
          "....www.-.....--w--wwwwwwwwwwww---..",
          "........-.hhhhFh--wwwwwwwww.w--..-..",
          "....hhhhFhhhhhhhh-hwwwwww..--....-..",
          "...hhhhhhhhhhhhhhh--w---hF-MMhh..-..",
          "...hhhhhhhhhhhhhhhh.-hhh---MMhh..-..",
          "....hhhhh.hhhhhhh..hhhhhhhhMMhh.B...",
          "......h............hhhhhhhhhMhhh....",
          "......................hhhhhhhh......",
          "....................................",
          "...................................."
        ],
        "buildings": [
          {
            "col": 3,
            "row": 4,
            "owner": 0
          },
          {
            "col": 32,
            "row": 19,
            "owner": 1
          },
          {
            "col": 10,
            "row": 6,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET",
              "POLAR",
              "TITAN"
            ]
          },
          {
            "col": 25,
            "row": 17,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET",
              "POLAR",
              "TITAN"
            ]
          },
          {
            "col": 14,
            "row": 15,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "OCTOPUS",
              "POLAR"
            ]
          },
          {
            "col": 21,
            "row": 8,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "OCTOPUS",
              "POLAR"
            ]
          },
          {
            "col": 8,
            "row": 16,
            "owner": -1,
            "stored": [
              "MULE",
              "TRIGGER",
              "BISON",
              "BISON"
            ]
          },
          {
            "col": 27,
            "row": 7,
            "owner": -1,
            "stored": [
              "MULE",
              "TRIGGER",
              "BISON",
              "BISON"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 7,
            "y": 6
          },
          {
            "t": "PANTHER",
            "o": 0,
            "x": 7,
            "y": 17
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 7,
            "y": 7
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 7,
            "y": 16
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 8,
            "y": 7
          },
          {
            "t": "SLAGGER",
            "o": 0,
            "x": 6,
            "y": 17
          },
          {
            "t": "TITAN",
            "o": 0,
            "x": 6,
            "y": 6
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 8,
            "y": 17
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 28,
            "y": 17
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 28,
            "y": 6
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 28,
            "y": 16
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 28,
            "y": 7
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 27,
            "y": 16
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 29,
            "y": 6
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 29,
            "y": 17
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 27,
            "y": 6
          }
        ]
      },
      {
        "name": "TWO SPEEDS",
        "pack": "AI-made: Broken Ground",
        "campaignId": "broken-ground",
        "mission": 14,
        "author": "AI-made by Codex",
        "source": "levels/broken-ground/14-two-speeds.json",
        "description": "Fast patrols and a slower core begin together on a patchwork of firm and difficult ground. Keeping them mutually supporting takes more care than sending every unit its maximum distance.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 80 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "terrain-dependent routes",
          "spread",
          "mixed forces"
        ],
        "design": {
          "theme": "rough",
          "layout": 14,
          "formation": "spread",
          "road": "ladder"
        },
        "turnLimit": 80,
        "grid": [
          "........................................",
          "........................................",
          ".......-------..........................",
          "......-wwwwwww--.........-----..........",
          ".....h-wwwwwwww.--.....--.wwww--hhhh....",
          ".....w-wwwwwwwww.---.---.wwwwhhh-hhhh...",
          ".....w--wwwFwwww.hF--..-wwwwwhhh--hhh...",
          ".....ww-h--wwwwwhhhwwwh-wwwwwwF--h--....",
          "......w--hwwwwwwwhwwwwwF-wwwww-wwww-....",
          ".......-MMhwwwwwwwwwwww.-hwwwwwwww.-....",
          ".....--MMMhh.wwwwwwwwwww.h.wwwwww..-....",
          "...B-...MM..hwwwwwwwwwwwwwhh.......-....",
          "....-.......hhwwwwwwwwwwwwwh..MM...-B...",
          "....-..wwwwww.h.wwwwwwwwwww.hhMMM--.....",
          "....-.wwwwwwwwh-.wwwwwwwwwwwwhMM-.......",
          "....-wwww-wwwww-Fwwwwwhwwwwwwwh--w......",
          "....--h--Fwwwwww-hwwwhhhwwwww--h-ww.....",
          "...hhh--hhhwwwww-..--Fh.wwwwFwww--w.....",
          "...hhhh-hhhwwww.---.---.wwwwwwwww-w.....",
          "....hhhh--wwww.--.....--.wwwwwwww-h.....",
          "..........-----.........--wwwwwww-......",
          "..........................-------.......",
          "........................................",
          "........................................"
        ],
        "buildings": [
          {
            "col": 3,
            "row": 11,
            "owner": 0
          },
          {
            "col": 36,
            "row": 12,
            "owner": 1
          },
          {
            "col": 11,
            "row": 6,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET",
              "LENET"
            ]
          },
          {
            "col": 28,
            "row": 17,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET",
              "LENET"
            ]
          },
          {
            "col": 16,
            "row": 15,
            "owner": -1,
            "stored": [
              "KILROY",
              "GRIZZLY",
              "GRIZZLY",
              "GRIZZLY"
            ]
          },
          {
            "col": 23,
            "row": 8,
            "owner": -1,
            "stored": [
              "KILROY",
              "GRIZZLY",
              "GRIZZLY",
              "GRIZZLY"
            ]
          },
          {
            "col": 9,
            "row": 16,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "RABBIT",
              "RABBIT",
              "LYNX"
            ]
          },
          {
            "col": 30,
            "row": 7,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "RABBIT",
              "RABBIT",
              "LYNX"
            ]
          },
          {
            "col": 18,
            "row": 6,
            "owner": -1,
            "stored": [
              "MULE",
              "ATLAS",
              "POLAR",
              "POLAR"
            ]
          },
          {
            "col": 21,
            "row": 17,
            "owner": -1,
            "stored": [
              "MULE",
              "ATLAS",
              "POLAR",
              "POLAR"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 4
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 7,
            "y": 7
          },
          {
            "t": "PANTHER",
            "o": 0,
            "x": 7,
            "y": 9
          },
          {
            "t": "PANTHER",
            "o": 0,
            "x": 5,
            "y": 13
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 7,
            "y": 16
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 8,
            "y": 19
          },
          {
            "t": "RABBIT",
            "o": 0,
            "x": 6,
            "y": 4
          },
          {
            "t": "RABBIT",
            "o": 0,
            "x": 7,
            "y": 6
          },
          {
            "t": "TITAN",
            "o": 0,
            "x": 7,
            "y": 8
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 4,
            "y": 13
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 34,
            "y": 19
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 32,
            "y": 16
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 32,
            "y": 14
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 34,
            "y": 10
          },
          {
            "t": "GRIZZLY",
            "o": 1,
            "x": 32,
            "y": 7
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 31,
            "y": 4
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 33,
            "y": 19
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 32,
            "y": 17
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 32,
            "y": 15
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 35,
            "y": 10
          }
        ]
      },
      {
        "name": "THE ISLAND ROAD",
        "pack": "AI-made: Broken Ground",
        "campaignId": "broken-ground",
        "mission": 15,
        "author": "AI-made by Codex",
        "source": "levels/broken-ground/15-the-island-road.json",
        "description": "Road-linked plateaus sit between valley seams and waste basins. Transports can shorten transfers, but ground escorts must choose among bridges, rough cuts and the long outer route.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 90 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "terrain-dependent routes",
          "split",
          "mixed forces"
        ],
        "design": {
          "theme": "rough",
          "layout": 15,
          "formation": "split",
          "road": "rim"
        },
        "turnLimit": 90,
        "grid": [
          "............v..............v............",
          "............v..............v............",
          "......wwwwwwvv.............v............",
          "....wwwwwwwwww.....-------..v...........",
          "...wwwwwwwwwwww..--..hhhh.--v-hhhhhh....",
          "...www-wwwwwwww--...hhhhhh.-=h--h-hhh...",
          "...www-wwwwww-----.hhhhhhh.-vhhh-h--h...",
          "....ww-wwwwFw-v-..Fhhhhhhhh-vhhhhhhh-...",
          ".....--www-w.-v-...hhhhFh--.vvMFhhh.-...",
          "...--.-------vv-...hhhhh-hh..vMM--..-...",
          "...-vvvvvv-v.v-..h.hhhhhhh...v....---...",
          "...-......v.v.=vhhhvhhhhhh...v......-...",
          "...B.......vv...hhh..hhhh...v.......-...",
          "...-.......v...hhhh..hhh...vv.......B...",
          "...-......v...hhhhhhvhhhv=.v.v......-...",
          "...---....v...hhhhhhh.h..-v.v-vvvvvv-...",
          "...-..--MMv..hh-hhhhh...-vv-------.--...",
          "...-.hhhFMvv.--hFhhhh...-v-.w-www--.....",
          "...-hhhhhhhv-hhhhhhhhF..-v-wFwwww-ww....",
          "...h--h-hhhv-.hhhhhhh.-----wwwwww-www...",
          "...hhh-h--h=-.hhhhhh...--wwwwwwww-www...",
          "....hhhhhh-v--.hhhh..--..wwwwwwwwwwww...",
          "...........v..-------.....wwwwwwwwww....",
          "............v.............vvwwwwww......",
          "............v..............v............",
          "............v..............v............"
        ],
        "buildings": [
          {
            "col": 3,
            "row": 12,
            "owner": 0
          },
          {
            "col": 36,
            "row": 13,
            "owner": 1
          },
          {
            "col": 11,
            "row": 7,
            "owner": -1,
            "stored": [
              "PELICAN",
              "ATLAS",
              "TITAN",
              "TITAN"
            ]
          },
          {
            "col": 28,
            "row": 18,
            "owner": -1,
            "stored": [
              "PELICAN",
              "ATLAS",
              "TITAN",
              "TITAN"
            ]
          },
          {
            "col": 16,
            "row": 17,
            "owner": -1,
            "stored": [
              "MULE",
              "ATLAS",
              "POLAR",
              "POLAR"
            ]
          },
          {
            "col": 23,
            "row": 8,
            "owner": -1,
            "stored": [
              "MULE",
              "ATLAS",
              "POLAR",
              "POLAR"
            ]
          },
          {
            "col": 8,
            "row": 17,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "OCTOPUS",
              "POLAR"
            ]
          },
          {
            "col": 31,
            "row": 8,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "OCTOPUS",
              "POLAR"
            ]
          },
          {
            "col": 18,
            "row": 7,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET",
              "POLAR",
              "TITAN"
            ]
          },
          {
            "col": 21,
            "row": 18,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET",
              "POLAR",
              "TITAN"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 8,
            "y": 6
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 8,
            "y": 18
          },
          {
            "t": "PANTHER",
            "o": 0,
            "x": 6,
            "y": 5
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 7,
            "y": 17
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 7,
            "y": 5
          },
          {
            "t": "POLAR",
            "o": 0,
            "x": 7,
            "y": 18
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 8,
            "y": 5
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 9,
            "y": 18
          },
          {
            "t": "MULE",
            "o": 0,
            "x": 6,
            "y": 6
          },
          {
            "t": "PELICAN",
            "o": 0,
            "x": 9,
            "y": 17
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 31,
            "y": 19
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 31,
            "y": 7
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 32,
            "y": 20
          },
          {
            "t": "GRIZZLY",
            "o": 1,
            "x": 32,
            "y": 8
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 31,
            "y": 20
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 32,
            "y": 7
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 30,
            "y": 20
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 30,
            "y": 7
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 32,
            "y": 19
          },
          {
            "t": "PELICAN",
            "o": 1,
            "x": 30,
            "y": 8
          }
        ]
      },
      {
        "name": "EVERY YARD COUNTS",
        "pack": "AI-made: Broken Ground",
        "campaignId": "broken-ground",
        "mission": 16,
        "author": "AI-made by Codex",
        "source": "levels/broken-ground/16-every-yard-counts.json",
        "description": "Hill belts, wasteland basins, broken valleys and several firm routes meet on one large board. The army is broad enough to solve each terrain problem, but its different units cannot all use the same approach.",
        "special": "Capture the enemy camp or eliminate its eligible forces within 100 rounds. At the turn limit, Xenon wins. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "terrain-dependent routes",
          "split",
          "mixed forces"
        ],
        "design": {
          "theme": "rough",
          "layout": 16,
          "formation": "split",
          "road": "fork"
        },
        "turnLimit": 100,
        "grid": [
          "..............vv..........................",
          "...............v..........................",
          "........wwwwww..v.........................",
          "......wwwwwwwwwwvv........................",
          ".....wwwMMwwwwwwwwv..........wwwhhhhh.....",
          "....wwwwMMMwwwwwwwvv.........wwhhhhhhh....",
          "....wwwwMMwwwwwwwwwv.hhhhhhhh.hhhhhhhhh...",
          "...wwwwwMMwFw-wwww-Fvhhhhhhhhhwhhhhhhh....",
          "...wwwwwww--w-wwww-vvhhhhhhhhhhhh-hhhh....",
          "....wwwFwwww--www--vhhhhhFhhhhhhF-www.....",
          ".....--wwwwww-www-vhhhhhhh-hhhhh--wwww....",
          "...--.wwwwwww-w--vvhh-hhhh-hhhhhh-wwww....",
          "...-....www--h-Fhvhhh-hhh--hhhhhh-..w.....",
          "...B.....--hhh--=hh--h---v-hhhhhh-----....",
          "....-----hhhhhh-v---h--hh=--hhh--.....B...",
          ".....w..-hhhhhh--hhh-hhhvhF-h--www....-...",
          "....wwww-hhhhhh-hhhh-hhvv--w-wwwwwww.--...",
          "....wwww--hhhhh-hhhhhhhv-www-wwwwww--.....",
          ".....www-FhhhhhhFhhhhhv--www--wwwwFwww....",
          "....hhhh-hhhhhhhhhhhhvv-wwww-w--wwwwwww...",
          "....hhhhhhhwhhhhhhhhhvF-wwww-wFwMMwwwww...",
          "...hhhhhhhhh.hhhhhhhh.vwwwwwwwwwMMwwww....",
          "....hhhhhhhww.........vvwwwwwwwMMMwwww....",
          ".....hhhhhwww..........vwwwwwwwwMMwww.....",
          "........................vvwwwwwwwwww......",
          ".........................v..wwwwww........",
          "..........................v...............",
          "..........................vv.............."
        ],
        "buildings": [
          {
            "col": 3,
            "row": 13,
            "owner": 0
          },
          {
            "col": 38,
            "row": 14,
            "owner": 1
          },
          {
            "col": 11,
            "row": 7,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET",
              "POLAR",
              "TITAN"
            ]
          },
          {
            "col": 30,
            "row": 20,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET",
              "POLAR",
              "TITAN"
            ]
          },
          {
            "col": 16,
            "row": 18,
            "owner": -1,
            "stored": [
              "MULE",
              "ATLAS",
              "POLAR",
              "POLAR"
            ]
          },
          {
            "col": 25,
            "row": 9,
            "owner": -1,
            "stored": [
              "MULE",
              "ATLAS",
              "POLAR",
              "POLAR"
            ]
          },
          {
            "col": 9,
            "row": 18,
            "owner": -1,
            "stored": [
              "PELICAN",
              "ATLAS",
              "TITAN",
              "TITAN"
            ]
          },
          {
            "col": 32,
            "row": 9,
            "owner": -1,
            "stored": [
              "PELICAN",
              "ATLAS",
              "TITAN",
              "TITAN"
            ]
          },
          {
            "col": 19,
            "row": 7,
            "owner": -1,
            "stored": [
              "MULE",
              "TRIGGER",
              "LENET",
              "LENET"
            ]
          },
          {
            "col": 22,
            "row": 20,
            "owner": -1,
            "stored": [
              "MULE",
              "TRIGGER",
              "LENET",
              "LENET"
            ]
          },
          {
            "col": 15,
            "row": 12,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "OCTOPUS",
              "POLAR"
            ]
          },
          {
            "col": 26,
            "row": 15,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "HADRIAN",
              "OCTOPUS",
              "POLAR"
            ]
          },
          {
            "col": 7,
            "row": 9,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "RABBIT",
              "RABBIT",
              "LYNX"
            ]
          },
          {
            "col": 34,
            "row": 18,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "RABBIT",
              "RABBIT",
              "LYNX"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 8,
            "y": 7
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 8,
            "y": 20
          },
          {
            "t": "PANTHER",
            "o": 0,
            "x": 10,
            "y": 8
          },
          {
            "t": "KILROY",
            "o": 0,
            "x": 8,
            "y": 19
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 7,
            "y": 6
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 7,
            "y": 19
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 7,
            "y": 7
          },
          {
            "t": "POLAR",
            "o": 0,
            "x": 9,
            "y": 19
          },
          {
            "t": "SLAGGER",
            "o": 0,
            "x": 8,
            "y": 8
          },
          {
            "t": "TITAN",
            "o": 0,
            "x": 7,
            "y": 20
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 7,
            "y": 5
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 9,
            "y": 20
          },
          {
            "t": "OCTOPUS",
            "o": 0,
            "x": 6,
            "y": 6
          },
          {
            "t": "RABBIT",
            "o": 0,
            "x": 8,
            "y": 21
          },
          {
            "t": "MULE",
            "o": 0,
            "x": 11,
            "y": 8
          },
          {
            "t": "PELICAN",
            "o": 0,
            "x": 8,
            "y": 18
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 33,
            "y": 20
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 33,
            "y": 7
          },
          {
            "t": "PANTHER",
            "o": 1,
            "x": 31,
            "y": 19
          },
          {
            "t": "KILROY",
            "o": 1,
            "x": 33,
            "y": 8
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 34,
            "y": 21
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 34,
            "y": 8
          },
          {
            "t": "GRIZZLY",
            "o": 1,
            "x": 34,
            "y": 20
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 32,
            "y": 8
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 33,
            "y": 19
          },
          {
            "t": "TITAN",
            "o": 1,
            "x": 34,
            "y": 7
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 34,
            "y": 22
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 32,
            "y": 7
          },
          {
            "t": "OCTOPUS",
            "o": 1,
            "x": 35,
            "y": 21
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 33,
            "y": 6
          },
          {
            "t": "MULE",
            "o": 1,
            "x": 30,
            "y": 19
          },
          {
            "t": "PELICAN",
            "o": 1,
            "x": 33,
            "y": 9
          }
        ]
      }
    ]
  }
];
if(typeof module!=="undefined")module.exports=ENVIRONMENT_CAMPAIGNS;
