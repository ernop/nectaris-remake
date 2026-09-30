/* AI-made terrain campaigns. Rebuild: node tools/build-environment-campaigns.js */
"use strict";
var ENVIRONMENT_CAMPAIGNS = [
  {
    "id": "open-horizons",
    "name": "AI-made: Open Horizons",
    "description": "A sea of maneuvering ground around mountain islands: space, concentration and exposed flanks. Ridges run in from the top and bottom edges, so no army can circle the rim.",
    "notes": "Sixteen AI-made battles created by Codex, each with its own terrain, forces and tactical problem. Normal capture/elimination rules apply. No Hunters, Falcons or Eagles; some missions include Pelicans. Forces start fresh each mission.",
    "levels": [
      {
        "name": "THREE AGAINST THREE",
        "pack": "AI-made: Open Horizons",
        "campaignId": "open-horizons",
        "mission": 1,
        "author": "AI-made by Codex",
        "source": "levels/open-horizons/01-three-against-three.json",
        "description": "Three squads per side and no replacements. Six small mountain islands break up a broad plain; every supporting position costs a third of your army.",
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "..........M.............",
          "..........M.............",
          ".........wM.............",
          ".....MMMwMM......M......",
          ".....MMM.M......MMM.....",
          "......M..M......MMM.....",
          "....hhh..MMM............",
          "..B.hhh..MM..M...hhh....",
          "....hhh...M..MM..hhh.B..",
          "............MMM..hhh....",
          ".....MMM......M..M......",
          ".....MMM......M.MMM.....",
          "......M......MMwMMM.....",
          ".............Mw.........",
          ".............M..........",
          ".............M.........."
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "..............M.................",
          "..............M.................",
          "..............M.--..............",
          ".....-..MMMMMMMM-.--.....---....",
          ".....---.F.----h-...-----...--..",
          ".....-..---wwwMM....MMM......-..",
          ".....-.....www.M..MMM........-..",
          "...--..hhhh....M.MM...hhh....-..",
          "..B...hhhhh....M.M...hhhhh...-..",
          "..-...hhhhh...M.M....hhhhh...B..",
          "..-....hhh...MM.M....hhhh..--...",
          "..-........MMM..M.www.....-.....",
          "..-......MMM....MMwww---..-.....",
          "..--...-----...-h----.F.---.....",
          "....---.....--.-MMMMMMMM..-.....",
          "..............--.M..............",
          ".................M..............",
          ".................M.............."
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
            "x": 5,
            "y": 4
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
            "x": 26,
            "y": 13
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "...........M................",
          "...........M................",
          "...........M................",
          "..B...MM-..M................",
          "......MMF..M................",
          "......MM...M.MM.............",
          "..........MM.MM.............",
          ".......hhhww.MM...hh........",
          "......hhhhww.....hhhh.......",
          ".......hhhh.....wwhhhh......",
          "........hh...MM.wwhhh.......",
          ".............MM.MM..........",
          ".............MM.M...MM......",
          "................M..FMM......",
          "................M..-MM...B..",
          "................M...........",
          "................M...........",
          "................M..........."
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "..............M......M..............",
          "..............M......M..............",
          "...........B..M......M..............",
          ".........---.MMM....M...............",
          ".......---M-MMMM....M...............",
          ".....--..-F-MMMh....M...............",
          ".....-...-MMMMMM....MF.....--.......",
          ".....-.hh-MMMMMMMM.---w..--.........",
          ".....-hhhh-MMMMMM---wwww.-hhh.......",
          ".....-hhhh--.----..-www--hhhhh-.....",
          ".....-hhhhh--www-..----.--hhhh-.....",
          ".......hhh-.wwww---MMMMMM-hhhh-.....",
          ".........--..w---.MMMMMMMM-hh.-.....",
          ".......--.....FM....MMMMMM-...-.....",
          "...............M....hMMM-F-..--.....",
          "...............M....MMMM-M---.......",
          "...............M....MMM.---.........",
          "..............M......M..B...........",
          "..............M......M..............",
          "..............M......M.............."
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          ".............M................",
          ".............M................",
          ".............M................",
          "..........wwM.................",
          "..........MwMM................",
          ".......-FMM.M.................",
          ".......-.M..M.MMMMMM..........",
          ".......-h-...MM...F-M.........",
          "......h--h--M-.....-Mhh-......",
          "..B-.--hh--.----...-h--h--....",
          "....--h--h-...----.--hh--.-B..",
          "......-hhM-.....-M--h--h......",
          ".........M-F...MM...-h-.......",
          "..........MMMMMM.M..M.-.......",
          ".................M.MMF-.......",
          "................MMwM..........",
          ".................Mww..........",
          "................M.............",
          "................M.............",
          "................M............."
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
            "x": 9,
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
            "x": 20,
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          ".............M.....M..............",
          ".............M.....M..............",
          ".............h.....M..............",
          "........MMMMMM.....M..............",
          "......MMM....M....M...............",
          ".........F.---M...M...............",
          "........---.ww--..M......---......",
          ".......--...www.--M.F-.--...-.....",
          ".....--..hhh..M..-...--.....-.....",
          ".....-M.hhhhh.M...---.hhh...-.....",
          "...B.-MMhhhhhMM......hhhhh..--....",
          "....--..hhhhh......MMhhhhhMM-.B...",
          ".....-...hhh.---...M.hhhhh.M-.....",
          ".....-.....--...-..M..hhh..--.....",
          ".....-...--.-F.M--.www...--.......",
          "......---......M..--ww.---........",
          "...............M...M---.F.........",
          "...............M....M....MMM......",
          "..............M.....MMMMMM........",
          "..............M.....h.............",
          "..............M.....M.............",
          "..............M.....M............."
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "............M...............",
          ".....M......M...............",
          "...MMMMM.M..M...............",
          "...MMMMMMMMMM..MMM..........",
          "...MMMMMMMMM...MMM..........",
          "....MMM-F..h....M....M......",
          "...........MMM.....MMMMM....",
          ".....hhh..wwMM.....MMhMM....",
          "..B.hhhhh.wwM......Mhhhh....",
          "....hhhhM......Mww.hhhhh.B..",
          "....MMhMM.....MMww..hhh.....",
          "....MMMMM.....MMM...........",
          "......M....M....h..F-MMM....",
          "..........MMM...MMMMMMMMM...",
          "..........MMM..MMMMMMMMMM...",
          "...............M..M.MMMMM...",
          "...............M......M.....",
          "...............M............"
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "................M......M..............",
          "................M......M..............",
          ".........-......M..-...M..............",
          "...B...--M-.....MM.-..M...............",
          "....----.MFM.....M.---M........-......",
          ".....-..--MMM....M.-..h-.....--.-.....",
          ".....-...-MMMM.M.M.-..MM--.--F..-.....",
          ".....-...h----M.M--.--FwM.-..-.--.....",
          ".....-..hhhhh.---....w-wwMhhhh-M-.....",
          ".....-.hhhhhh..-......-wwhhhhhh.-.....",
          ".....-.hhhhhhww-......-..hhhhhh.-.....",
          ".....-M-hhhhMww-w....---.hhhhh..-.....",
          ".....--.-..-.MwF--.--M.M----h...-.....",
          ".....-..F--.--MM..-.M.M.MMMM-...-.....",
          ".....-.--.....-h..-.M....MMM--..-.....",
          "......-........M---.M.....MFM.----....",
          "...............M..-.MM.....-M--...B...",
          "..............M...-..M......-.........",
          "..............M......M................",
          "..............M......M................"
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "............M.................",
          "............M.................",
          "............MMM...............",
          "..........wMMMMMMM............",
          "...........hwMMMMM............",
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
          "............MMMMMwh...........",
          "............MMMMMMMw..........",
          "...............MMM............",
          ".................M............",
          ".................M............"
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "..............M.................",
          "..............M.................",
          "..............M.................",
          ".....-.---....MM................",
          ".....--..F-....M................",
          ".....-MMMM-wwwMM................",
          ".....---..Mwww.M...F............",
          ".....-hh--..w......--..MM.......",
          "...--hhhh.--.......-.MMhhh......",
          "..B..hhhhh..--.---.-M.hhhhh.....",
          ".....hhhhh.M-.---.--..hhhhh..B..",
          "......hhhMM.-.......--.hhhh--...",
          ".......MM..--......w..--hh-.....",
          "............F...M.wwwM..---.....",
          "................MMwww-MMMM-.....",
          "................M....-F..--.....",
          "................MM....---.-.....",
          ".................M..............",
          ".................M..............",
          ".................M.............."
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          ".................M.......M................",
          ".................M.......M................",
          ".............B...M........M...............",
          ".................M........M...............",
          "................M.........M...............",
          ".........M......M.........MMMMMM..........",
          "..........MMMM..M..........M....M.........",
          "................M..........M..............",
          ".........hhhh..www........................",
          "........hhhhhhwwwww..........hhhh.........",
          "........hhhhhh.www....MM....hhhhhh........",
          "........hhhhhh....MM....www.hhhhhh........",
          ".........hhhh..........wwwwwhhhhhh........",
          "........................www..hhhh.........",
          "..............M..........M................",
          ".........M....M..........M..MMMM..........",
          "..........MMMMMM.........M......M.........",
          "...............M.........M................",
          "...............M........M.................",
          "...............M........M...B.............",
          "................M.......M.................",
          "................M.......M................."
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          ".............M.....M..............",
          ".............M.....M..............",
          ".............h.....M..............",
          "...........MMMMMMM.h..............",
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
          "..............h.MMMMMMM...........",
          "..............M.....h.............",
          "..............M.....M.............",
          "..............M.....M............."
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "................M......M................",
          "................M......M................",
          "...............MM......M................",
          "..............wMw...-...M...............",
          "....B-.---....wMww.---..M...............",
          ".....--.MM--..wMw--...--M........-......",
          ".....-..MM-F--h--......-Mh--...--.-.....",
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
          ".....-.--...--hM-......--h--F-MM..-.....",
          "......-........M--...--wMw..--MM.--.....",
          "...............M..---.wwMw....---.-B....",
          "...............M...-...wMw..............",
          "................M......MM...............",
          "................M......M................",
          "................M......M................"
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "...............M......M.............",
          "...............M......M.............",
          "...............M......M.............",
          "...........M....M..--hM.............",
          ".........F.M....M..-MM--............",
          "........-.M..ww.M..-..M.--..........",
          "........-MM-wwwwM--..FMM..--........",
          "........---M-----....--.M...--......",
          ".......--hhhMMM-....-..MMhhh.-......",
          "...B.--hhhhh.M.-....-..Mhhhhh-.-....",
          "....-.-hhhhhM..-....-.M.hhhhh--.B...",
          "......-.hhhMM..-....-MMMhhh--.......",
          "......--...M.--....-----M---........",
          "........--..MMF..--Mwwww-MM-........",
          "..........--.M..-..M.ww..M.-........",
          "............--MM-..M....M.F.........",
          ".............Mh--..M....M...........",
          ".............M......M...............",
          ".............M......M...............",
          ".............M......M..............."
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "..............M......M................",
          "..............M......M................",
          ".......-......h......M................",
          ".....--M--...MMM......M......MMM......",
          "....-M-MMM--.MMM......M.....MMMMM.....",
          "....-MMMMM..--M.......hM....MMMMM.....",
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
          ".....MMMMM....Mh.......M--..MMMMM-....",
          ".....MMMMM.....M......MMM.--MMM-M-....",
          "......MMM......M......MMM...--M--.....",
          "................M......h......-.......",
          "................M......M..............",
          "................M......M.............."
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "................M........M................",
          "................M........M................",
          "................MM.......M................",
          ".........---.....M......M.................",
          ".......--MMM--...M......M.................",
          ".......-MMMMM-...M......M.................",
          ".......-MMMMMF--.M.-....h..MMMM...........",
          ".......-MMMMMMMM--MF-..MMMMMMMM...........",
          ".......-MMMMM..M..h--....FMMMMMMF-........",
          ".......-.MMM....MMMM--.---MMMMMM--........",
          "......-hhhhh.......----.wwwMMMM--.--......",
          "......-hhhhhh..----...-wwwwwMMh-hhh.-.....",
          "...B..-hhhhhh--.F-....--www..--hhhh---....",
          "....---hhhh--..www--....-F.--hhhhhh-..B...",
          ".....-.hhh-hMMwwwww-...----..hhhhhh-......",
          "......--.--MMMMwww.----.......hhhhh-......",
          "........--MMMMMM---.--MMMM....MMM.-.......",
          "........-FMMMMMMF....--h..M..MMMMM-.......",
          "...........MMMMMMMM..-FM--MMMMMMMM-.......",
          "...........MMMM..h....-.M.--FMMMMM-.......",
          ".................M......M...-MMMMM-.......",
          ".................M......M...--MMM--.......",
          ".................M......M.....---.........",
          "................M.......MM................",
          "................M........M................",
          "................M........M................"
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
            "x": 7,
            "y": 17
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
            "y": 18
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
            "x": 9,
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
            "x": 8,
            "y": 19
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
            "x": 8,
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
            "x": 34,
            "y": 8
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
            "y": 7
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
            "x": 32,
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
            "x": 33,
            "y": 6
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
            "x": 33,
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
    "description": "Dense interior routes surrounded by spacious flanks: short paths through trouble or long paths around it. The long way round climbs through hill passes where ridges from the edge meet the knot.",
    "notes": "Sixteen AI-made battles created by Codex, each with its own terrain, forces and tactical problem. Normal capture/elimination rules apply. No Hunters, Falcons or Eagles; some missions include Pelicans. Forces start fresh each mission.",
    "levels": [
      {
        "name": "THE CROSS AND THE FIELD",
        "pack": "AI-made: The Knotted Heart",
        "campaignId": "knotted-heart",
        "mission": 1,
        "author": "AI-made by Codex",
        "source": "levels/knotted-heart/01-the-cross-and-the-field.json",
        "description": "A compact mountain knot has a cross-shaped interior route. The center is short and restrictive; the open outer field lets units maneuver around its arms.",
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "...........M.....hh.......",
          ".......h...M.......h......",
          "...........h..............",
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
          "..............h...........",
          "......h.......M...h.......",
          ".......hh.....M..........."
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          ".....h.......M................",
          ".............M................",
          ".............h................",
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
          "................h.............",
          "................M.............",
          "................M.......h....."
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "........h..Mh......h........",
          "...........M................",
          "...........hh.hh.....h......",
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
          "......h.....hh.hh...........",
          "................M...........",
          "........h......hM..h........"
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "..h.......h..M..........h..h..",
          "h....h....h..Mhh..............",
          "...h...h.B...h.h....h.........",
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
          ".........h....h.h...B.h...h...",
          "..............hhM..h....h....h",
          "..h..h..........M..h.......h.."
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "..............M.....M........h....",
          "h...h..h......M.h...M............h",
          "..............h.....h..h.....h....",
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
          "....h.....h..h.....h..............",
          "h............M...h.M......h..h...h",
          "....h........M.....M.............."
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          ".h.........h.M.....M....h.........",
          "........h....M....hM..............",
          "......h..----h-----h----..........",
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
          "..........----h-----h----..h......",
          "..............Mh....M....h........",
          ".........h....M.....M.h.........h."
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "..........M.....h.h....h",
          "..........Mh............",
          "...h......Mh............",
          ".....hMMMMhMMMM.MM.....h",
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
          "h.....MM.MMMMhMMMMh.....",
          "............hM......h...",
          "............hM..........",
          "h....h.h.....M.........."
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "...h...........M......M...hh........",
          "...............M......Mh........h...",
          "............h..M......h....h........",
          "...B.h..MMMM.MMhMMMMMMMMMMMM...hh...",
          "h...--..MMMM.MMhMMMMMMMMMMMM........",
          "....-h-------Fh.h..hMMMMMMMM........",
          "....-h.-MMMM-MMMMMM.MMMMMMMM--......",
          "h...---.hh..------h-F---MMMM.-......",
          ".....-..MMMMMMMMMM-..MM-MMMM.-h.....",
          ".....-..MMMM-------.MMM-MMMM..-.....",
          ".....-..MMMMFMMMM--MMMM-MMMM..-.h...",
          "...h.-..MMMM-MMMM--MMMMFMMMM..-.....",
          ".....-..MMMM-MMM.-------MMMM..-.....",
          ".....h-.MMMM-MM..-MMMMMMMMMM..-.....",
          "......-.MMMM---F-h------..hh.---...h",
          "......--MMMMMMMM.MMMMMM-MMMM-.h-....",
          "........MMMMMMMMh..h.hF-------h-....",
          "........MMMMMMMMMMMMhMM.MMMM..--...h",
          "...hh...MMMMMMMMMMMMhMM.MMMM..h.B...",
          "........h....h......M..h............",
          "...h........hM......M...............",
          "........hh...M......M...........h..."
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
            "y": 14
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
            "x": 6,
            "y": 16
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
            "y": 7
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
            "x": 29,
            "y": 5
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "..hhhh......hM....h........h....",
          "..h...h......M..................",
          ".......h.....h....h.......h.....",
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
          ".....h.......h....h.....h.......",
          "..................M......h...h..",
          "....h........h....Mh......hhhh.."
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "..............M......M..........h...",
          "..............M....h.M.......h......",
          "..........h---h---h--h----...h......",
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
          "......h...----h--h---h---h..........",
          "......h.......M.h....M..............",
          "...h..........M......M.............."
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "..............Mh....M..h..hh......",
          ".........h..h.M.....M.....hh......",
          "....h..----B..h....hh...h.........",
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
          ".........h...hh....h..B----..h....",
          "......hh.....M.....M.h..h.........",
          "......hh..h..M....hM.............."
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "..............M....h.M.......h........",
          "..............M...h..M..h.............",
          "..............h......h................",
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
          "................h......h..............",
          ".............h..M..h...M..............",
          "........h.......M.h....M.............."
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "h.......h.......M......M................",
          "...h............M....h.M..........h.....",
          "........h------hM--F.--h--------........",
          "........-MMMMMMM-MMM-MMMMMMMMMM.-.......",
          "....B-h--MMMMMMMMMMMMMMMMMMMMMMh-h......",
          "......--.MMMMMMMMMMMMMMMMMMMMMM.--......",
          "...h..-.--------.MMMMMMhh.h...h..-.....h",
          "......-hhMMMMMM-FMMMMMMFMMMMMMM..-......",
          "......---MMMMMMM-MMMMMM-MMMMMMMh.-......",
          "..hh.h-.FMMMMMMM-MMMMMM-MMMMMMM..-......",
          "h...h.-..MMMMMMM-MMMMMM-MMMMMMM..-.h....",
          "h.....-..MMMMMMM------.-MMMMMMM..-......",
          "......-..MMMMMMM-.------MMMMMMM..-.....h",
          "....h.-..MMMMMMM-MMMMMM-MMMMMMM..-.h...h",
          "......-..MMMMMMM-MMMMMM-MMMMMMMF.-h.hh..",
          "......-.hMMMMMMM-MMMMMM-MMMMMMM---......",
          "......-..MMMMMMMFMMMMMMF-MMMMMMhh-......",
          "h.....-..h...h.hhMMMMMM.--------.-..h...",
          "......--.MMMMMMMMMMMMMMMMMMMMMM.--......",
          "......h-hMMMMMMMMMMMMMMMMMMMMMM--h-B....",
          ".......-.MMMMMMMMMM-MMM-MMMMMMM-........",
          "........--------h--.F--Mh------h........",
          ".....h..........M.h....M............h...",
          "................M......M.......h.......h"
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "h..............M.....hM......h..h...",
          "...h...........M......M............h",
          "h..........h...h......h.h...........",
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
          "...........h.h......h...h..........h",
          "h............M......M...........h...",
          "...h..h......Mh.....M..............h"
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          ".........h..h..M...h...Mh...............",
          "..h............M.......M......hh........",
          ".h.............M.....h.M.h...h..........",
          ".........------h-------h--------.....h..",
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
          "..h.....--------h-------h------.........",
          "..........h...h.M.h.....M.............h.",
          "........hh......M.......M............h..",
          "...............hM...h...M..h..h........."
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "......h.........M........Mh........h......",
          ".......h.....h..M........M........h...h.h.",
          "........hh.-.h.-MM.h.....M........h.h.....",
          ".........--.---.-h-F.h.hh.................",
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
          ".................hh.h.F-h-.---.--.........",
          ".....h.h........M.....h.MM-.h.-.hh........",
          ".h.h...h........M........M..h.....h.......",
          "......h........hM........M.........h......"
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
    "description": "Roads, hills, wasteland and valleys give different units different maps to fight on. Gullies or valley seams cut the top and bottom edges, so no army can circle the rim.",
    "notes": "Sixteen AI-made battles created by Codex, each with its own terrain, forces and tactical problem. Normal capture/elimination rules apply. No Hunters, Falcons or Eagles; some missions include Pelicans. Forces start fresh each mission.",
    "levels": [
      {
        "name": "THE PRICE OF A HILL",
        "pack": "AI-made: Broken Ground",
        "campaignId": "broken-ground",
        "mission": 1,
        "author": "AI-made by Codex",
        "source": "levels/broken-ground/01-the-price-of-a-hill.json",
        "description": "Three squads each cross a field of hill belts. Charlie, Bison and Panther pay different movement costs for the same terrain; a short route on the map can be a slow route for the unit.",
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "..........v.............",
          "..........v.............",
          "..........v..hhh........",
          ".......hhvvhhhhhhhhh....",
          "....hhhhhvhhhhhhhhhh....",
          ".....hhhhvhhhhh.........",
          ".........v..............",
          ".........hhhhhhhhhhh....",
          "..B.....hhhhhhhhhhhh....",
          "....hhhhhhhhhhhh.....B..",
          "....hhhhhhhhhhh.........",
          "..............v.........",
          ".........hhhhhvhhhh.....",
          "....hhhhhhhhhhvhhhhh....",
          "....hhhhhhhhhvvhh.......",
          "........hhh..v..........",
          ".............v..........",
          ".............v.........."
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          ".............v................",
          ".............v................",
          "........wwwwwvw...............",
          ".......wwwwwwwvw.......hhhh...",
          "......www-hhwwvwwwwwwwhhhhh...",
          ".....ww-F-hhhhvwwwwwwwhhhhh...",
          "....wwww----hhvwwwwwwwwhhh....",
          "....wwMwh-hh--wwwwwwwwwww.....",
          "....wwMMw-hhww--wwwwwwwwww....",
          "..B-wwM--wwwww--wwwwwww---....",
          "....---wwwwwww--wwwww--Mww-B..",
          "....wwwwwwwwww--wwhh-wMMww....",
          ".....wwwwwwwwwww--hh-hwMww....",
          "....hhhwwwwwwwwvhh----wwww....",
          "...hhhhhwwwwwwwvhhhh-F-ww.....",
          "...hhhhhwwwwwwwvwwhh-www......",
          "...hhhh.......wvwwwwwww.......",
          "...............wvwwwww........",
          "................v.............",
          "................v............."
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "...........v................",
          "...........v.........ww.....",
          "...........v.......wwwwww...",
          "..B..wwwww.v......wwwhhhhw..",
          "..-.www-wwwv......wwhhhhhhw.",
          "..-wwww-F-wvwwwwwwwwhhhhhww.",
          "..-wwww--w-vwwwwwwwwwM--ww..",
          "..--w--www--wwwwwww.wMMw-...",
          "....-wwwwwww---wwww.....-...",
          "....-.....wwh--wwww....--...",
          "...--....wwww--hww.....-....",
          "...-.....wwww---wwwwwww-....",
          "...-wMMw.wwwwwww--www--w--..",
          "..ww--Mwwwwwwwwwv-w--wwww-..",
          ".wwhhhhhwwwwwwwwvw-F-wwww-..",
          ".whhhhhhww......vwww-www.-..",
          "..whhhhwww......v.wwwww..B..",
          "...wwwwww.......v...........",
          ".....ww.........v...........",
          "................v..........."
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "............v...............",
          "............v...............",
          "............v..-------......",
          "...........hv--.wwwww-hh....",
          "....--......v-wwwwwwhh--h...",
          "hh..-.--F...v-wwwwwwhhhh--..",
          "hhhh-...--.hv-wwwwwwwhhhh-..",
          "hhhh-h.hhh--v-wwwwwwwwww.-.h",
          "..hh-hMhhhhh-wwwwwwwwwww.-hh",
          "...--MMhhhhhhhwwwwwwww.hh-hh",
          "..B.hMMhhhhhhhhhhh.hhhhhh-h.",
          ".h-hhhhhh.hhhhhhhhhhhMMh.B..",
          "hh-hh.wwwwwwwwhhhhhhhMM--...",
          "hh-.wwwwwwwwwww-hhhhhMh-hh..",
          "h.-.wwwwwwwwww-v--hhh.h-hhhh",
          "..-hhhhwwwwwww-vh.--...-hhhh",
          "..--hhhhwwwwww-v...F--.-..hh",
          "...h--hhwwwwww-v......--....",
          "....hh-wwwww.--vh...........",
          "......-------..v............",
          "...............v............",
          "...............v............"
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          ".............v..................",
          ".............v..................",
          ".......hhhhhhv..................",
          "....h-hhhhhhhhvhh.......hhhh....",
          "....h-hhhhhhhhvhh.hhhhhhhhhhh...",
          "....-hhhhFhhhhvhhhhhhhhhhhhhh...",
          "....-----....hvhhhhFhhhhMhhh....",
          "...--wwwwwwwwwwwhhhh-hhhMMh.....",
          "...-wwwwwwwwwwwww---------......",
          "..B-wwwwwwwwwww--.wwwwwww.--....",
          "....--.wwwwwww.--wwwwwwwwwww-B..",
          "......---------wwwwwwwwwwwww-...",
          ".....hMMhhh-hhhhwwwwwwwwwww--...",
          "....hhhMhhhhFhhhhvh....-----....",
          "...hhhhhhhhhhhhhhvhhhhFhhhh-....",
          "...hhhhhhhhhhh.hhvhhhhhhhh-h....",
          "....hhhh.......hhvhhhhhhhh-h....",
          "..................vhhhhhh.......",
          "..................v.............",
          "..................v............."
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          ".............v................",
          ".............v................",
          ".....---.....v.........hhh....",
          ".....-M.--...v........hhhhhh..",
          ".....-MMw-wwvw.......hhhhhhh..",
          "...---M-Fw-wvwww.....hhhhhhh..",
          "...-ww-www-wvwwww.....hhhhh...",
          "..-wwwwwhh--vwwwwFwww---......",
          "..-wwwwhhhhh--w-w----www--....",
          "..-.wwwhhhhhh--w-hhhhhhw-w--..",
          "..B.wwwhhhhhh-ww-hhhhhhw-ww-..",
          "..-ww-whhhhhh-ww-hhhhhhwww.B..",
          "..--w-whhhhhh-w--hhhhhhwww.-..",
          "....--www----w-w--hhhhhwwww-..",
          "......---wwwFwwwwv--hhwwwww-..",
          "...hhhhh.....wwwwvw-www-ww-...",
          "..hhhhhhh.....wwwvw-wF-M---...",
          "..hhhhhhh.......wvww-wMM-.....",
          "..hhhhhh........v...--.M-.....",
          "....hhh.........v.....---.....",
          "................v.............",
          "................v............."
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "..............v.....v.............",
          ".....---......v.....v.............",
          ".....-ww--wwwwv.....v.............",
          "...B-wwww-wwwwvv.wwvvww...hhhh....",
          "..-..wwww---wwwvwwwvwwww.hhhhhh...",
          "..-wwwww-Fw-wwwvwwwvwwwwwhhhhhh...",
          "..-wwwwwwwww-wwvwwwvwwwww--hhhh...",
          "..-wwwwwwwww--wvwwwvFww--w--......",
          "..--wwwMwwwwww--w-hh---www..-.....",
          "...-wwMMMwwwwwww-w---wwwww..-.....",
          "....-wMMwwwwwwwwwwwwwwwwwww.--....",
          "....--.wwwwwwwwwwwwwwwwwwwMMw-....",
          ".....-..wwwww---w-wwwwwwwMMMww-...",
          ".....-..www---hh-w--wwwwwwMwww--..",
          "......--w--wwFvwwwvw--wwwwwwwww-..",
          "...hhhh--wwwwwvwwwvww-wwwwwwwww-..",
          "...hhhhhhwwwwwvwwwvwww-wF-wwwww-..",
          "...hhhhhh.wwwwvwwwvwww---wwww..-..",
          "....hhhh...wwvvww.vvwwww-wwww-B...",
          ".............v.....vwwww--ww-.....",
          ".............v.....v......---.....",
          ".............v.....v.............."
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "...........v..............",
          "...........v..............",
          ".....hh....vhh.....hh.....",
          "....hhhh..vhhhhh..hhhhh...",
          "...hhhhhh.vhhhhh.hhhhhhh..",
          "...hhhhhh.vhhhhh.hhhhhhh..",
          "....hhhh..vhhhhh..hMhhh...",
          "....................M.....",
          "....wwww..wwwwww..wwww....",
          "..B.wwwww.wwwwww.wwwwww...",
          "...wwwwww.wwwwww.wwwww.B..",
          "....wwww..wwwwww..wwww....",
          ".....M....................",
          "...hhhMh..hhhhhv..hhhh....",
          "..hhhhhhh.hhhhhv.hhhhhh...",
          "..hhhhhhh.hhhhhv.hhhhhh...",
          "...hhhhh..hhhhhv..hhhh....",
          ".....hh.....hhv....hh.....",
          "..............v...........",
          "..............v..........."
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          ".wwwww........v.....v.............",
          ".wwwwww.......v.....v.............",
          ".wwwwwwww--B..v.....v.............",
          "..wwwww--w..-vv..-..vv....hhhh....",
          "..www--wwww--v...-...v...hh--hh...",
          "....wwwwwF-w-v...-...v..h--hhhh...",
          "....wwwwwwww-vww.-...v.--hhhhhh...",
          "......wwwwww-vw--.--Fv-hhhhhhhh...",
          ".......Mwwww---www..---hhhhhhhhh..",
          ".....hMMMwww-whhwwww.-.hhhhhhhh...",
          "....hhMMhhww-whhwwwww-.hhhhhhhh...",
          "...hhhhhhhh.-wwwwwhhw-wwhhMMhh....",
          "...hhhhhhhh.-.wwwwhhw-wwwMMMh.....",
          "..hhhhhhhhh---..www---wwwwM.......",
          "...hhhhhhhh-vF--.--wv-wwwwww......",
          "...hhhhhh--.v...-.wwv-wwwwwwww....",
          "...hhhh--h..v...-...v-w-Fwwwww....",
          "...hh--hh...v...-...v--wwww--www..",
          "....hhhh....vv..-..vv-..w--wwwww..",
          ".............v.....v..B--wwwwwwww.",
          ".............v.....v.......wwwwww.",
          ".............v.....v........wwwww."
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
            "x": 12,
            "y": 4
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 10,
            "y": 3
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
            "x": 10,
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
            "x": 21,
            "y": 17
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 23,
            "y": 18
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 23,
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "..............v......v................",
          "..............v......v................",
          "..............v......v.h.h.h..........",
          "...hhhhhhh.h.hvv....hvhhhhhhhhhhhh....",
          "...hhhhhhhhhhhhvhh..vhhhhhhhhhhhhhh...",
          "....hhhhh-Fw-wwvwww.v.h.h.h.hhhhhhh...",
          ".......www---wwvwwwwvwww....hh--hh....",
          "......wwwwww-wwvwwwwvwF-....MMM-......",
          "........wwww-wwwwww-hh.-.h.h.MF-......",
          ".........-.---.-.---hhh-hhhhhh--hh....",
          "...B.hh--h-h.h-h--.-hhh-hhhhhhh---....",
          "....---hhhhhhh-hhh-.--h-h.h-h--hh.B...",
          "....hh--hhhhhh-hhh---.-.---.-.........",
          "......-FM.h.h.-.hh-wwwwww-wwww........",
          "......-MMM....-Fwvwwwwvww-wwwwww......",
          "....hh--hh....wwwvwwwwvww---www.......",
          "...hhhhhhh.h.h.h.v.wwwvww-wF-hhhhh....",
          "...hhhhhhhhhhhhhhv..hhvhhhhhhhhhhhh...",
          "....hhhhhhhhhhhhvh....vvh.h.hhhhhhh...",
          "..........h.h.h.v......v..............",
          "................v......v..............",
          "................v......v.............."
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "..............v......v..............",
          "..............v......v..............",
          "......hhhhhhhhv......v..............",
          "....hhhMhhhhhhvhh....v.......h......",
          "...B.hhMMhhhhvvhh..hhhvhhh.hhhhh....",
          "..-..hhMM-h-hvhh.hhhhhvhhhhhhhhhh...",
          "..-..hhMM-Fhhvhwhhhhhhvhhhhhhhhhh...",
          "..-....--.--wvwwwhhhhhvhhhhFhhhh....",
          "..-..--w.www-vwwww.-hFvhhh.-........",
          "..---wwwwwww--www--w--.....-.www....",
          "..-wwwwwwwwwww---www-......w--www...",
          "..--wwwwwwwwwww-wwww-w.w.wwww---w...",
          "...w---wwww.w.w-wwww-wwwwwwwwwww--..",
          "...www--w......-www---wwwwwwwwwww-..",
          "....www.-.....--w--www--wwwwwww---..",
          "........-.hhhvFh-.wwwwv-www.w--..-..",
          "....hhhhFhhhhvhhhhhwwwvw--.--....-..",
          "...hhhhhhhhhhvhhhhhhwhvhhF-MMhh..-..",
          "...hhhhhhhhhhvhhhhh.hhvh-h-MMhh..-..",
          "....hhhhh.hhhvhhh..hhvvhhhhMMhh.B...",
          "......h.......v....hhvhhhhhhMhhh....",
          "..............v......vhhhhhhhh......",
          "..............v......v..............",
          "..............v......v.............."
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "grid": [
          "................v.......v...............",
          "................v.......v...............",
          "................vv......v...............",
          ".......wwwwwww...v......v...............",
          ".....hwwwwwwwww..v--...vv.wwwwhhhhhh....",
          ".....whwwwwwwwww.vF.-..v.wwwwhhhhhhhh...",
          ".....wh-wwwFwwww.hv---.vwwwwwhh--hhhh...",
          ".....ww-h--wwwwwhhvwww-vwwwww-Fhhhh.....",
          "......w--hwwwwwwwhvwww-v.ww--w-wwww.....",
          ".......-MMhwwwwwwwwwww--F--wwwwwww......",
          ".....--MMMhh.wwwwwwww-----.wwwwww.......",
          "...B-.--MM..hwwwwww----www------........",
          "........------www----wwwwwwh..MM--.-B...",
          ".......wwwwww.-----wwwwwwww.hhMMM--.....",
          "......wwwwwww--F--wwwwwwwwwwwhMM-.......",
          ".....wwww-w--ww.v-wwwvhwwwwwwwh--w......",
          ".....hhhhF-wwwwwv-wwwvhhwwwww--h-ww.....",
          "...hhhh--hhwwwwwv.---vh.wwwwFwww-hw.....",
          "...hhhhhhhhwwww.v..-.Fv.wwwwwwwwwhw.....",
          "....hhhhhhwwww.vv...--v..wwwwwwwwwh.....",
          "...............v......v...wwwwwww.......",
          "...............v......vv................",
          "...............v.......v................",
          "...............v.......v................"
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
            "col": 24,
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
            "col": 21,
            "row": 18,
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
            "x": 5,
            "y": 3
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
            "x": 5,
            "y": 12
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
            "x": 34,
            "y": 20
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
            "x": 34,
            "y": 11
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
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
  },
  {
    "id": "bridgeheads",
    "name": "AI-made: Bridgeheads",
    "description": "Rilles split every board. Bridges and a few footpaths are the only fast crossings, and holding the far end of one is the campaign's recurring problem. Ridges on each bank stop a force that has crossed from running along the rim to the camp.",
    "notes": "Sixteen AI-made battles created by Claude Opus 5.5, each testing one idea about map balance. They were tuned so the strongest simulator bot playing both sides won about as often as Union as Xenon, under a rule since removed that gave Xenon the win at each board's own turn limit; their balance under the current draw rules has not been measured. Normal capture/elimination rules apply. No Hunters or Falcons. Forces start fresh each mission.",
    "levels": [
      {
        "name": "RIMA BODE",
        "pack": "AI-made: Bridgeheads",
        "campaignId": "bridgeheads",
        "mission": 1,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/bridgeheads/01-rima-bode.json",
        "description": "A single bridge spans the rille. Your vanguard waits a few hexes short of its near end; the Xenon garrison beyond is under strength. Infantry can climb down anywhere, but a squad in the valley floor ends its move there with no cover.",
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters or Falcons. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "valleys and bridges",
          "half-turn symmetry"
        ],
        "design": {
          "theme": "bridgeheads",
          "symmetry": "half"
        },
        "grid": [
          ".....M...vv...M.....",
          ".....M...vv...M.....",
          ".....M...vv...w.....",
          ".....M.h.vv..www....",
          "......hh.vv...w.....",
          ".......h.vv.........",
          ".........==-------B.",
          ".B-------==.........",
          ".........vv.h.......",
          ".....w...vv.hh......",
          "....www..vv.h.M.....",
          ".....w...vv...M.....",
          ".....M...vv...M.....",
          ".....M...vv...M....."
        ],
        "buildings": [
          {
            "col": 1,
            "row": 7,
            "owner": 0
          },
          {
            "col": 18,
            "row": 6,
            "owner": 1
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 6,
            "y": 7
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
            "y": 6
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
            "x": 5,
            "y": 7
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 16,
            "y": 7,
            "str": 7
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 15,
            "y": 6,
            "str": 7
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 16,
            "y": 6,
            "str": 7
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 17,
            "y": 6,
            "str": 7
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 15,
            "y": 7,
            "str": 7
          }
        ]
      },
      {
        "name": "RIMA HYGINUS",
        "pack": "AI-made: Bridgeheads",
        "campaignId": "bridgeheads",
        "mission": 2,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/bridgeheads/02-rima-hyginus.json",
        "description": "A crater sits in the middle of the rille, and the only bridges are at its two ends. An army that crosses at one end leaves the other bridge to the enemy. The Xenon camp stands nearer the rille than yours, and you bring one more Bison.",
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters or Falcons. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "valleys and bridges",
          "half-turn symmetry"
        ],
        "design": {
          "theme": "bridgeheads",
          "symmetry": "half"
        },
        "grid": [
          ".....M.....vv.....M.....",
          ".....M.....vv.....M.....",
          ".....M..---==---..M.....",
          ".....M.--..vv...-.M.....",
          ".......-...Mv...--......",
          "......-..MMMMM...-......",
          ".....--h.MMvMMM.h.-----.",
          ".B----.h.MMMvMM.h--..B..",
          "......-...MMMMM..-......",
          "......--...vM...-.......",
          ".....M.-...vv..--.M.....",
          ".....M..---==---..M.....",
          ".....M.....vv.....M.....",
          ".....M.....vv.....M....."
        ],
        "buildings": [
          {
            "col": 1,
            "row": 7,
            "owner": 0
          },
          {
            "col": 21,
            "row": 7,
            "owner": 1
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 3,
            "y": 7
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 3,
            "y": 6
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 2,
            "y": 7
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 4,
            "y": 7
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 2,
            "y": 8
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 3,
            "y": 8
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 4,
            "y": 8
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 3,
            "y": 5
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 20,
            "y": 7
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 19,
            "y": 6
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 20,
            "y": 6
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 21,
            "y": 6
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 19,
            "y": 7
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 20,
            "y": 8
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 19,
            "y": 5
          }
        ]
      },
      {
        "name": "RIMA HESIODUS",
        "pack": "AI-made: Bridgeheads",
        "campaignId": "bridgeheads",
        "mission": 3,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/bridgeheads/03-rima-hesiodus.json",
        "description": "The camps face each other across the north end of the rille, where a footpath lets infantry cross in two moves. Tanks must go the long way, over the southern bridge. Every Xenon unit is under strength, most of them badly.",
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters or Falcons. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "valleys and bridges",
          "mirror symmetry"
        ],
        "design": {
          "theme": "bridgeheads",
          "symmetry": "mirror"
        },
        "grid": [
          ".......M...vvv...M.......",
          ".......M...vvv...M.......",
          ".......M...vvv...M.......",
          "...B-..M...vvv...M..-B...",
          "....-......vvv......-....",
          "....-......vvv......-....",
          "....-......vvv......-....",
          "....-..hh..vvv..hh..-....",
          "....-..hh..vvv..hh..-....",
          "....-......vvv......-....",
          "....-......vvv......-....",
          "....-------===-------....",
          ".......M...vvv...M.......",
          ".......M...vvv...M.......",
          ".......M...vvv...M.......",
          ".......M...vvv...M......."
        ],
        "buildings": [
          {
            "col": 3,
            "row": 3,
            "owner": 0
          },
          {
            "col": 21,
            "row": 3,
            "owner": 1
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
            "y": 4
          },
          {
            "t": "KILROY",
            "o": 0,
            "x": 4,
            "y": 5
          },
          {
            "t": "KILROY",
            "o": 0,
            "x": 6,
            "y": 5
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 4,
            "y": 7
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
            "x": 19,
            "y": 5,
            "str": 5
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 19,
            "y": 4,
            "str": 5
          },
          {
            "t": "KILROY",
            "o": 1,
            "x": 18,
            "y": 5,
            "str": 6
          },
          {
            "t": "KILROY",
            "o": 1,
            "x": 20,
            "y": 5,
            "str": 6
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 20,
            "y": 7,
            "str": 5
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 19,
            "y": 6,
            "str": 5
          }
        ]
      },
      {
        "name": "VALLIS SNELLIUS",
        "pack": "AI-made: Bridgeheads",
        "campaignId": "bridgeheads",
        "mission": 4,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/bridgeheads/04-vallis-snellius.json",
        "description": "No bridge crosses this valley. Tanks can only hold their own bank; any attack must walk through the valley floor or fly. You have three Pelicans to Xenon's two, a Hawkeye guards each camp, and the Xenon ground forces are under strength.",
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters or Falcons. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "valleys and bridges",
          "half-turn symmetry"
        ],
        "design": {
          "theme": "bridgeheads",
          "symmetry": "half"
        },
        "grid": [
          "......M...vvvv...M......",
          "......M...vvvv...M......",
          "......M...vvvv...M......",
          "......M...vvvv..hM......",
          "......hh..vvvv.hhh......",
          "......hh..vvvv..hh......",
          "..........vvvv..........",
          "..........vvvv........B.",
          ".B........vvvv..........",
          "..........vvvv..........",
          "......hh..vvvv..hh......",
          "......hhh.vvvv..hh......",
          "......Mh..vvvv...M......",
          "......M...vvvv...M......",
          "......M...vvvv...M......",
          "......M...vvvv...M......"
        ],
        "buildings": [
          {
            "col": 1,
            "row": 8,
            "owner": 0
          },
          {
            "col": 22,
            "row": 7,
            "owner": 1
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 8
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 7
          },
          {
            "t": "KILROY",
            "o": 0,
            "x": 4,
            "y": 8
          },
          {
            "t": "KILROY",
            "o": 0,
            "x": 6,
            "y": 8
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 3,
            "y": 6
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 3,
            "y": 5
          },
          {
            "t": "PELICAN",
            "o": 0,
            "x": 2,
            "y": 9
          },
          {
            "t": "PELICAN",
            "o": 0,
            "x": 2,
            "y": 8
          },
          {
            "t": "PELICAN",
            "o": 0,
            "x": 3,
            "y": 8
          },
          {
            "t": "HAWKEYE",
            "o": 0,
            "x": 1,
            "y": 6
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 18,
            "y": 8,
            "str": 6
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 17,
            "y": 7,
            "str": 6
          },
          {
            "t": "KILROY",
            "o": 1,
            "x": 18,
            "y": 7,
            "str": 6
          },
          {
            "t": "KILROY",
            "o": 1,
            "x": 19,
            "y": 7,
            "str": 6
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 20,
            "y": 9,
            "str": 6
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 19,
            "y": 8,
            "str": 6
          },
          {
            "t": "PELICAN",
            "o": 1,
            "x": 21,
            "y": 6
          },
          {
            "t": "PELICAN",
            "o": 1,
            "x": 21,
            "y": 5
          },
          {
            "t": "HAWKEYE",
            "o": 1,
            "x": 22,
            "y": 9
          }
        ]
      },
      {
        "name": "RIMAE TRIESNECKER",
        "pack": "AI-made: Bridgeheads",
        "campaignId": "bridgeheads",
        "mission": 5,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/bridgeheads/05-rimae-triesnecker.json",
        "description": "Two rilles cross at right angles and divide the ground into four fields. Each camp's field has two bridges to the neutral fields, where small factories hold a Charlie each.",
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters or Falcons. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "valleys and bridges",
          "half-turn symmetry"
        ],
        "design": {
          "theme": "bridgeheads",
          "symmetry": "half"
        },
        "grid": [
          "........M....vv....M........",
          "........M....vv....M........",
          "........M....vv....M........",
          "...B---------==----Fh.......",
          "...-.........vv....hh.-.....",
          "....-........vv....hh.-.....",
          "....-........vv.......-.....",
          "....-........vv.......-.....",
          "vvvv==vvvvvvvvvvvvvvvv=vvvvv",
          "vvvvv=vvvvvvvvvvvvvvvv==vvvv",
          ".....-.......vv........-....",
          ".....-.......vv........-....",
          ".....-.hh....vv........-....",
          ".....-.hh....vv.........-...",
          ".......hF----==---------B...",
          "........M....vv....M........",
          "........M....vv....M........",
          "........M....vv....M........"
        ],
        "buildings": [
          {
            "col": 3,
            "row": 3,
            "owner": 0
          },
          {
            "col": 24,
            "row": 14,
            "owner": 1
          },
          {
            "col": 19,
            "row": 3,
            "owner": -1,
            "stored": [
              "CHARLIE"
            ]
          },
          {
            "col": 8,
            "row": 14,
            "owner": -1,
            "stored": [
              "CHARLIE"
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
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 2
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 4,
            "y": 3
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 6,
            "y": 3
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 4,
            "y": 4
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 22,
            "y": 14
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 22,
            "y": 15
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 23,
            "y": 14
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 21,
            "y": 14
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 23,
            "y": 13
          }
        ]
      },
      {
        "name": "RIMA HADLEY",
        "pack": "AI-made: Bridgeheads",
        "campaignId": "bridgeheads",
        "mission": 6,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/bridgeheads/06-rima-hadley.json",
        "description": "Each camp sits behind its own winding rille with a bridge at each end. The open plain between the rilles belongs to whoever crosses first. You bring one extra Kilroy, and the Xenon Lenet starts damaged.",
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters or Falcons. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "valleys and bridges",
          "mirror symmetry"
        ],
        "design": {
          "theme": "bridgeheads",
          "symmetry": "mirror"
        },
        "grid": [
          "MMMMMM.v.....M.....v.MMMMMM",
          "MMMMMM.v.MMM.M.MMM.v.MMMMMM",
          ".......v.MMMMMMMMM.v.......",
          "......v..MMM.M.MMM..v......",
          "......v.............v......",
          "......v.............v......",
          "......vv...........vv......",
          ".......v...........v.......",
          "........v.........v........",
          ".B.-.---=---...---=---.-.B.",
          ".--.-..vv.........vv..-.--.",
          "..-....v...........v....-..",
          "..--..v.............v..--..",
          "...-.-v......M......v-.-...",
          "....-.==--...M...--==.-....",
          ".......v.....M.....v.......",
          ".......v.....M.....v......."
        ],
        "buildings": [
          {
            "col": 1,
            "row": 9,
            "owner": 0
          },
          {
            "col": 25,
            "row": 9,
            "owner": 1
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
            "y": 8
          },
          {
            "t": "KILROY",
            "o": 0,
            "x": 2,
            "y": 9
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
            "x": 2,
            "y": 10
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 3,
            "y": 10
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 4,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 23,
            "y": 9
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 23,
            "y": 8
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 22,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 24,
            "y": 9
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 22,
            "y": 10
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 23,
            "y": 10,
            "str": 7
          }
        ]
      },
      {
        "name": "VALLIS ALPES",
        "pack": "AI-made: Bridgeheads",
        "campaignId": "bridgeheads",
        "mission": 7,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/bridgeheads/07-vallis-alpes.json",
        "description": "A deep valley cuts through the mountain wall, and one long bridge carries the road across. Pelicans can lift a tank over the wall anywhere. The Xenon tanks and infantry are under strength.",
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters or Falcons. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "valleys and bridges",
          "half-turn symmetry"
        ],
        "design": {
          "theme": "bridgeheads",
          "symmetry": "half"
        },
        "grid": [
          "......M....MMMMMM....M......",
          "......M....MMMMMM....M......",
          "......M....MMMMMM....M......",
          "......M....MMMMMM....M......",
          "......M....MMMMMM....M......",
          "...........MMMMMM...........",
          ".........vvvvvvvvv..........",
          ".........vvvv======-------B.",
          ".B-------======vvvv.........",
          "..........vvvvvvvvv.........",
          "...........MMMMMM...........",
          "......M....MMMMMM....M......",
          "......M....MMMMMM....M......",
          "......M....MMMMMM....M......",
          "......M....MMMMMM....M......",
          "......M....MMMMMM....M......"
        ],
        "buildings": [
          {
            "col": 1,
            "row": 8,
            "owner": 0
          },
          {
            "col": 26,
            "row": 7,
            "owner": 1
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 8
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 7
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 4,
            "y": 8
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 6,
            "y": 8
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 4,
            "y": 9
          },
          {
            "t": "PELICAN",
            "o": 0,
            "x": 3,
            "y": 5
          },
          {
            "t": "PELICAN",
            "o": 0,
            "x": 3,
            "y": 4
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 22,
            "y": 8,
            "str": 6
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 21,
            "y": 7,
            "str": 7
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 22,
            "y": 7,
            "str": 7
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 23,
            "y": 7,
            "str": 7
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 21,
            "y": 8,
            "str": 7
          },
          {
            "t": "PELICAN",
            "o": 1,
            "x": 24,
            "y": 11
          },
          {
            "t": "PELICAN",
            "o": 1,
            "x": 23,
            "y": 10
          }
        ]
      },
      {
        "name": "RIMA SIRSALIS",
        "pack": "AI-made: Bridgeheads",
        "campaignId": "bridgeheads",
        "mission": 8,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/bridgeheads/08-rima-sirsalis.json",
        "description": "Guns on either rim can reach across the rille. Your guns start in firing position; Xenon's are damaged and farther back, and its Bison is damaged too. Two bridges carry the tanks, and the artillery decides which of them is usable.",
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters or Falcons. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "valleys and bridges",
          "half-turn symmetry"
        ],
        "design": {
          "theme": "bridgeheads",
          "symmetry": "half"
        },
        "grid": [
          "......M.....vvvv.....M......",
          "......M.....vvvv.....M......",
          "......M.....vvvv.....M......",
          "......M.....vvvv.....M......",
          "........----====----........",
          ".......--...vvvv....-.......",
          ".......-....vvvv....--......",
          "......-..hh.vvvv.hh..-.-.-..",
          ".....--.hhh.vvvv.hhh..-.-.B.",
          ".B.-.-..hhh.vvvv.hhh.--.....",
          "..-.-.-..hh.vvvv.hh..-......",
          "......--....vvvv....-.......",
          ".......-....vvvv...--.......",
          "........----====----........",
          "......M.....vvvv.....M......",
          "......M.....vvvv.....M......",
          "......M.....vvvv.....M......",
          "......M.....vvvv.....M......"
        ],
        "buildings": [
          {
            "col": 1,
            "row": 9,
            "owner": 0
          },
          {
            "col": 26,
            "row": 8,
            "owner": 1
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 9
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 8
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 4,
            "y": 9
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 6,
            "y": 9
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 9,
            "y": 9
          },
          {
            "t": "OCTOPUS",
            "o": 0,
            "x": 9,
            "y": 8
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 22,
            "y": 9
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 21,
            "y": 8
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 22,
            "y": 8,
            "str": 7
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 23,
            "y": 8
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 24,
            "y": 9,
            "str": 6
          },
          {
            "t": "OCTOPUS",
            "o": 1,
            "x": 24,
            "y": 8,
            "str": 6
          }
        ]
      },
      {
        "name": "RIMA MARIUS",
        "pack": "AI-made: Bridgeheads",
        "campaignId": "bridgeheads",
        "mission": 9,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/bridgeheads/09-rima-marius.json",
        "description": "The rille runs close to your camp. You defend a narrow bank and Xenon has room to form up, but its camp stands nearer the centre than yours and its army is slightly under strength.",
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters or Falcons. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "valleys and bridges",
          "unequal sides"
        ],
        "design": {
          "theme": "bridgeheads",
          "symmetry": "none"
        },
        "grid": [
          ".....M....v......M.........",
          ".....M....v......M.........",
          ".....M....v......M.........",
          ".....M....v-----------.....",
          ".......hh.v-..........-....",
          ".......hh.=...........--...",
          "........h-=............-...",
          ".........-v.............-..",
          ".B.-.-.---v-.-.-.-.-.-B---.",
          "..-.-.-.-.=.-.-.-.-.-.-.-..",
          "..........v........hh......",
          "..........v........hh......",
          "..........v........hh......",
          ".....M....v................",
          ".....M....v......M.........",
          ".....M....v......M.........",
          ".....M....v......M........."
        ],
        "buildings": [
          {
            "col": 1,
            "row": 8,
            "owner": 0
          },
          {
            "col": 22,
            "row": 8,
            "owner": 1
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 4,
            "y": 8
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 3,
            "y": 7
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 4,
            "y": 7
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 5,
            "y": 7
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 3,
            "y": 8
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 5,
            "y": 8
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 21,
            "y": 7,
            "str": 7
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 22,
            "y": 7,
            "str": 7
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 23,
            "y": 7,
            "str": 7
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 21,
            "y": 8,
            "str": 7
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 23,
            "y": 8,
            "str": 7
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 22,
            "y": 9,
            "str": 7
          }
        ]
      },
      {
        "name": "RIMA PRINZ",
        "pack": "AI-made: Bridgeheads",
        "campaignId": "bridgeheads",
        "mission": 10,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/bridgeheads/10-rima-prinz.json",
        "description": "Eagles fly over the rille as if it were not there. Each side has one Hawkeye to keep the sky over its bridge, and a small factory waits on each far bank.",
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters or Falcons. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "valleys and bridges",
          "half-turn symmetry"
        ],
        "design": {
          "theme": "bridgeheads",
          "symmetry": "half"
        },
        "grid": [
          "......M.......vv.......M......",
          "......M.......vv.......M......",
          "......M.......vv.......M......",
          "......M.hhh...vv.....wwM......",
          "......Mhhhh...vv.....www......",
          "........hhh...vv...F.www......",
          "........hh....vv..............",
          "..............v=.-.-.-.-.-.-..",
          "..............=v-.-.-.-.-.-.B.",
          ".B.-.-.-.-.-.-v=..............",
          "..-.-.-.-.-.-.=v..............",
          "..............vv....hh........",
          "......www.F...vv...hhh........",
          "......www.....vv...hhhhM......",
          "......Mww.....vv...hhh.M......",
          "......M.......vv.......M......",
          "......M.......vv.......M......",
          "......M.......vv.......M......"
        ],
        "buildings": [
          {
            "col": 1,
            "row": 9,
            "owner": 0
          },
          {
            "col": 28,
            "row": 8,
            "owner": 1
          },
          {
            "col": 19,
            "row": 5,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON"
            ]
          },
          {
            "col": 10,
            "row": 12,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 9
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 8
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 4,
            "y": 9
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 6,
            "y": 9
          },
          {
            "t": "HAWKEYE",
            "o": 0,
            "x": 4,
            "y": 10
          },
          {
            "t": "EAGLE",
            "o": 0,
            "x": 2,
            "y": 5
          },
          {
            "t": "EAGLE",
            "o": 0,
            "x": 1,
            "y": 4
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 24,
            "y": 8
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 24,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 25,
            "y": 8
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 23,
            "y": 8
          },
          {
            "t": "HAWKEYE",
            "o": 1,
            "x": 25,
            "y": 7
          },
          {
            "t": "EAGLE",
            "o": 1,
            "x": 27,
            "y": 12
          },
          {
            "t": "EAGLE",
            "o": 1,
            "x": 28,
            "y": 13
          }
        ]
      },
      {
        "name": "RIMA BIRT",
        "pack": "AI-made: Bridgeheads",
        "campaignId": "bridgeheads",
        "mission": 11,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/bridgeheads/11-rima-birt.json",
        "description": "Two parallel rilles enclose a strip of plain with two factories. Each camp is one bridge from the strip and two from the enemy.",
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters or Falcons. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "valleys and bridges",
          "half-turn symmetry"
        ],
        "design": {
          "theme": "bridgeheads",
          "symmetry": "half"
        },
        "grid": [
          ".......M..v........v..M.......",
          ".......M..v........v..M.......",
          ".......M..v........v..M.......",
          ".......M..v........v..M.......",
          "..........v....F...v..........",
          "......----=--------=----......",
          "......-...v........v...-......",
          "......-...v........v...-......",
          "......-...v........v...-......",
          "......-...v........v...-----B.",
          ".B-----...v........v...-......",
          "......-...v........v...-......",
          "......-...v........v...-......",
          "......-...v........v...-......",
          "......----=--------=----......",
          "..........v...F....v..........",
          ".......M..v........v..M.......",
          ".......M..v........v..M.......",
          ".......M..v........v..M.......",
          ".......M..v........v..M......."
        ],
        "buildings": [
          {
            "col": 1,
            "row": 10,
            "owner": 0
          },
          {
            "col": 28,
            "row": 9,
            "owner": 1
          },
          {
            "col": 15,
            "row": 4,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET"
            ]
          },
          {
            "col": 14,
            "row": 15,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET"
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
            "y": 9
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 4,
            "y": 9
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
            "x": 3,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 25,
            "y": 9
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 26,
            "y": 10
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
            "x": 24,
            "y": 10
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 26,
            "y": 9
          }
        ]
      },
      {
        "name": "VALLIS SCHROTERI",
        "pack": "AI-made: Bridgeheads",
        "campaignId": "bridgeheads",
        "mission": 12,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/bridgeheads/12-vallis-schroteri.json",
        "description": "The Xenon camp stands inside a loop of the valley, reachable by tanks over one bridge. The armies are equal: the loop is Xenon's advantage, the first move is yours.",
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters or Falcons. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "valleys and bridges",
          "unequal sides"
        ],
        "design": {
          "theme": "bridgeheads",
          "symmetry": "none"
        },
        "grid": [
          ".........M.......M..............",
          ".........M.......M..............",
          ".........M.......M..............",
          ".........M.......Mhh.....vv.....",
          ".........M..hh...Mhh....vvvvv...",
          "...........hhh....hh...v....v...",
          "...........hhh.........v.....v..",
          "............hh........v......v..",
          "......................v......v..",
          "...-.-.-.-.-.-.-.-.-.-v-.-...v..",
          "..B.-.-.-.-.-.-.-.-.-.=.-.B..v..",
          "......................v......v..",
          "............hh........v......v..",
          "...........hhh.........v.....v..",
          "...........hhh.........v....v...",
          ".........M..hh...M......vvvvv...",
          ".........M.......M.......vv.....",
          ".........M.......M..............",
          ".........M.......M..............",
          ".........M.......M.............."
        ],
        "buildings": [
          {
            "col": 2,
            "row": 10,
            "owner": 0
          },
          {
            "col": 26,
            "row": 10,
            "owner": 1
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 4,
            "y": 10
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 6,
            "y": 10
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
            "x": 25,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 25,
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
            "x": 24,
            "y": 11
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 25,
            "y": 11
          }
        ]
      },
      {
        "name": "RIMA MAIRAN",
        "pack": "AI-made: Bridgeheads",
        "campaignId": "bridgeheads",
        "mission": 13,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/bridgeheads/13-rima-mairan.json",
        "description": "Each side's Mules start at its bridgeheads, carrying mines. A mine on a bridge closes it to tanks, but a closed bridge also stops your own attack. You bring one more Charlie.",
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters or Falcons. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "valleys and bridges",
          "half-turn symmetry"
        ],
        "design": {
          "theme": "bridgeheads",
          "symmetry": "half"
        },
        "grid": [
          "......M.......vv.......M......",
          "......M.......vv.......M......",
          "......M.......vv.......M......",
          "......M.......vv.......M......",
          "......M.......v=.-.-...M......",
          ".........-.-.-==-.-.-.........",
          "........-.-.-.=v....--........",
          "........-.....vv.....-........",
          ".......--.....vv......-.......",
          "......-.......vv......------B.",
          ".B------......vv.......-......",
          ".......-......vv.....--.......",
          "........-.....vv.....-........",
          "........--....v=.-.-.-........",
          ".........-.-.-==-.-.-.........",
          "......M...-.-.=v.......M......",
          "......M.......vv.......M......",
          "......M.......vv.......M......",
          "......M.......vv.......M......",
          "......M.......vv.......M......"
        ],
        "buildings": [
          {
            "col": 1,
            "row": 10,
            "owner": 0
          },
          {
            "col": 28,
            "row": 9,
            "owner": 1
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
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
            "x": 6,
            "y": 10
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 4,
            "y": 11
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 5,
            "y": 11
          },
          {
            "t": "MULE",
            "o": 0,
            "x": 12,
            "y": 5
          },
          {
            "t": "TRIGGER",
            "o": 0,
            "x": 11,
            "y": 4
          },
          {
            "t": "MULE",
            "o": 0,
            "x": 12,
            "y": 14
          },
          {
            "t": "TRIGGER",
            "o": 0,
            "x": 11,
            "y": 13
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 24,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 23,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 24,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 25,
            "y": 9
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 23,
            "y": 10
          },
          {
            "t": "MULE",
            "o": 1,
            "x": 17,
            "y": 14
          },
          {
            "t": "TRIGGER",
            "o": 1,
            "x": 17,
            "y": 13
          },
          {
            "t": "MULE",
            "o": 1,
            "x": 17,
            "y": 5
          },
          {
            "t": "TRIGGER",
            "o": 1,
            "x": 17,
            "y": 4
          }
        ]
      },
      {
        "name": "RIMAE LITTROW",
        "pack": "AI-made: Bridgeheads",
        "campaignId": "bridgeheads",
        "mission": 14,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/bridgeheads/14-rimae-littrow.json",
        "description": "Three rilles run between the camps with their bridges staggered, so every crossing turns the advance sideways. Both armies start between the rilles beside factories; your force is under strength.",
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters or Falcons. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "valleys and bridges",
          "half-turn symmetry"
        ],
        "design": {
          "theme": "bridgeheads",
          "symmetry": "half"
        },
        "grid": [
          ".....M....v.....vv.....v....M.....",
          ".....M....v.....vv.....v....M.....",
          ".....M....v.....vv.....v....M.....",
          ".....M....v.....vv.....v....M.....",
          ".....M....v..-.-v=-hF..v....M.....",
          "..........v..--.=v.hhh.v..........",
          "..........v..-..vv.hhh.v..........",
          "..........v..-..vv..h..v..........",
          "..........v..-..vv.F...v..........",
          "..........v..-..vv.....v..........",
          "..........v..-..vv..---=-------B..",
          "..B-------=---..vv..-..v..........",
          "..........v.....vv..-..v..........",
          "..........v...F.vv..-..v..........",
          "..........v..h..vv..-..v..........",
          "..........v.hhh.vv..-..v..........",
          "..........v.hhh.v=.--..v..........",
          ".....M....v..Fh-=v-.-..v....M.....",
          ".....M....v.....vv.....v....M.....",
          ".....M....v.....vv.....v....M.....",
          ".....M....v.....vv.....v....M.....",
          ".....M....v.....vv.....v....M....."
        ],
        "buildings": [
          {
            "col": 2,
            "row": 11,
            "owner": 0
          },
          {
            "col": 31,
            "row": 10,
            "owner": 1
          },
          {
            "col": 13,
            "row": 17,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET"
            ]
          },
          {
            "col": 20,
            "row": 4,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET"
            ]
          },
          {
            "col": 19,
            "row": 8,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET"
            ]
          },
          {
            "col": 14,
            "row": 13,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 13,
            "y": 11,
            "str": 6
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 13,
            "y": 10,
            "str": 6
          },
          {
            "t": "KILROY",
            "o": 0,
            "x": 12,
            "y": 11,
            "str": 7
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 14,
            "y": 11,
            "str": 6
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 12,
            "y": 12,
            "str": 6
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 13,
            "y": 12,
            "str": 6
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 14,
            "y": 12,
            "str": 6
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 20,
            "y": 11
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 19,
            "y": 10
          },
          {
            "t": "KILROY",
            "o": 1,
            "x": 20,
            "y": 10
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 21,
            "y": 10
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 19,
            "y": 11
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 21,
            "y": 11
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
        "name": "RIMA CAUCHY",
        "pack": "AI-made: Bridgeheads",
        "campaignId": "bridgeheads",
        "mission": 15,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/bridgeheads/15-rima-cauchy.json",
        "description": "A long diagonal rille separates distant camps. Mules carry infantry along the roads; the bridges are far apart and far from home. The Xenon camp stands nearer the rille than yours, and you bring one more Bison, badly damaged.",
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters or Falcons. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "valleys and bridges",
          "half-turn symmetry"
        ],
        "design": {
          "theme": "bridgeheads",
          "symmetry": "half"
        },
        "grid": [
          ".....M....vv..................M.....",
          ".....M....vvv.................M.....",
          ".....M.....vvv................M.....",
          ".....M....--==------..........w.....",
          ".....Mhhh...vvv.....-........www....",
          ".....hhhhh...vvv....--.......www....",
          "......hhh.....vv.--...--.....ww.....",
          "......hhh.....v==......-............",
          ".............--vvv......--..........",
          ".............-..vv.......-..........",
          "...........--...vvv......----------.",
          ".B---------......vvv...--.......B...",
          "..........-.......vv..-.............",
          "..........--......vvv--.............",
          "............-......==v.....hhh......",
          ".....ww.....--...--.vv.....hhh......",
          "....www.......--....vvv...hhhhh.....",
          "....www........-.....vvv...hhhM.....",
          ".....w..........------==--....M.....",
          ".....M................vvv.....M.....",
          ".....M.................vvv....M.....",
          ".....M..................vv....M....."
        ],
        "buildings": [
          {
            "col": 1,
            "row": 11,
            "owner": 0
          },
          {
            "col": 32,
            "row": 11,
            "owner": 1
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
            "y": 10
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 4,
            "y": 10
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
            "x": 3,
            "y": 11
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 5,
            "y": 11
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 4,
            "y": 12
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 3,
            "y": 9,
            "str": 5
          },
          {
            "t": "MULE",
            "o": 0,
            "x": 3,
            "y": 7
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 3,
            "y": 6
          },
          {
            "t": "MULE",
            "o": 0,
            "x": 2,
            "y": 7
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 4,
            "y": 7
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 31,
            "y": 11
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 31,
            "y": 10
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 30,
            "y": 11
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
            "y": 12
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 32,
            "y": 12
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 31,
            "y": 9
          },
          {
            "t": "MULE",
            "o": 1,
            "x": 32,
            "y": 14
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 31,
            "y": 13
          },
          {
            "t": "MULE",
            "o": 1,
            "x": 32,
            "y": 13
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 33,
            "y": 13
          }
        ]
      },
      {
        "name": "RIMA ARIADAEUS",
        "pack": "AI-made: Bridgeheads",
        "campaignId": "bridgeheads",
        "mission": 16,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/bridgeheads/16-rima-ariadaeus.json",
        "description": "The great straight rille cuts the whole board, with branches, footpaths and bridges along its length. Eagles, Pelicans and factories on both banks.",
        "special": "Capture the enemy camp or eliminate its eligible forces. No Hunters or Falcons. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "valleys and bridges",
          "half-turn symmetry"
        ],
        "design": {
          "theme": "bridgeheads",
          "symmetry": "half"
        },
        "grid": [
          ".....M.....vvv....................M.....",
          ".....M.....vvvv...................M.....",
          ".....M......vvv...................M.....",
          ".....M......vvvv..................M.....",
          ".....M..----====----------........M.....",
          ".....M.F.....vvv.........-........M.....",
          "..............vvvv.......-....hhh.......",
          "...............vvv........-...hhhh......",
          "...............vvvvv....Fhhh..hhh.......",
          "................vvvv.....hhh............",
          ".................vvvv....hhh............",
          "..................vvvv.....-............",
          "..................====---------------B..",
          "..B---------------====..................",
          "............-.....vvvv..................",
          "............hhh....vvvv.................",
          "............hhh.....vvvv................",
          ".......hhh..hhhF....vvvvv...............",
          "......hhhh...-........vvv...............",
          ".......hhh....-.......vvvv..............",
          ".....M........-.........vvv.....F.M.....",
          ".....M........----------====----..M.....",
          ".....M..................vvvv......M.....",
          ".....M...................vvv......M.....",
          ".....M...................vvvv.....M.....",
          ".....M....................vvv.....M....."
        ],
        "buildings": [
          {
            "col": 2,
            "row": 13,
            "owner": 0
          },
          {
            "col": 37,
            "row": 12,
            "owner": 1
          },
          {
            "col": 7,
            "row": 5,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET"
            ]
          },
          {
            "col": 32,
            "row": 20,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET"
            ]
          },
          {
            "col": 24,
            "row": 8,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "KILROY",
              "BISON",
              "LENET",
              "HADRIAN",
              "PELICAN"
            ]
          },
          {
            "col": 15,
            "row": 17,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "KILROY",
              "BISON",
              "LENET",
              "HADRIAN",
              "PELICAN"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 13
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 12
          },
          {
            "t": "KILROY",
            "o": 0,
            "x": 4,
            "y": 13
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 6,
            "y": 13
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 4,
            "y": 14
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
            "x": 6,
            "y": 14
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 5,
            "y": 11
          },
          {
            "t": "EAGLE",
            "o": 0,
            "x": 2,
            "y": 8
          },
          {
            "t": "PELICAN",
            "o": 0,
            "x": 1,
            "y": 7
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 34,
            "y": 12
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 34,
            "y": 13
          },
          {
            "t": "KILROY",
            "o": 1,
            "x": 35,
            "y": 12
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 33,
            "y": 12
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 35,
            "y": 11
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 34,
            "y": 11
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 33,
            "y": 11
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 34,
            "y": 14
          },
          {
            "t": "EAGLE",
            "o": 1,
            "x": 37,
            "y": 17
          },
          {
            "t": "PELICAN",
            "o": 1,
            "x": 38,
            "y": 18
          }
        ]
      }
    ]
  },
  {
    "id": "siege-lines",
    "name": "AI-made: Siege Lines",
    "description": "Xenon holds a fortified crater in every battle. Union must break in and take the camp; walls, gates and guns decide how long that takes.",
    "notes": "Sixteen AI-made battles created by Claude Opus 5.5, each testing one idea about map balance. They were tuned so the strongest simulator bot playing both sides won about as often as Union as Xenon, under a rule since removed that gave Xenon the win at each board's own turn limit; their balance under the current draw rules has not been measured. Normal capture/elimination rules apply. Forces start fresh each mission.",
    "levels": [
      {
        "name": "PLATO",
        "pack": "AI-made: Siege Lines",
        "campaignId": "siege-lines",
        "mission": 1,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/siege-lines/01-plato.json",
        "description": "Plato's wall is unbroken except for two gates facing you. Six Xenon units hold the crater, as many as you bring; your Hadrian is the only gun on either side.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "fortified camp",
          "unequal sides"
        ],
        "design": {
          "theme": "siege",
          "symmetry": "none"
        },
        "grid": [
          "......................",
          "......................",
          "......................",
          ".........hh....MMM....",
          ".........hh..MM...MM..",
          "....................M.",
          "....................M.",
          ".B..........M...B...M.",
          "....................M.",
          ".........hh..M.....MM.",
          ".........hh...MM.MM...",
          "................M.....",
          "......................",
          "......................"
        ],
        "buildings": [
          {
            "col": 1,
            "row": 7,
            "owner": 0
          },
          {
            "col": 16,
            "row": 7,
            "owner": 1
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 4,
            "y": 7
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 3,
            "y": 6
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 4,
            "y": 6
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 5,
            "y": 6
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 3,
            "y": 7
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 5,
            "y": 7
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 17,
            "y": 7
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 17,
            "y": 6
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 18,
            "y": 7
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 16,
            "y": 8
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 17,
            "y": 8
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 18,
            "y": 8
          }
        ]
      },
      {
        "name": "ARCHIMEDES",
        "pack": "AI-made: Siege Lines",
        "campaignId": "siege-lines",
        "mission": 2,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/siege-lines/02-archimedes.json",
        "description": "A single gate breaks Archimedes' wall. Whatever holds it holds the crater; infantry can climb the wall anywhere, slowly. Your Hadrian can shell the gate from outside.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "fortified camp",
          "unequal sides"
        ],
        "design": {
          "theme": "siege",
          "symmetry": "none"
        },
        "grid": [
          "........................",
          "........................",
          "........................",
          ".................MMM....",
          "...............MM...MM..",
          "..............M.......M.",
          "...........hh.M.......M.",
          ".B.........hh.....B...M.",
          "..............M.......M.",
          "..............MM.....MM.",
          "................MM.MM...",
          "..................M.....",
          "........................",
          "........................"
        ],
        "buildings": [
          {
            "col": 1,
            "row": 7,
            "owner": 0
          },
          {
            "col": 18,
            "row": 7,
            "owner": 1
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 7
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
            "x": 4,
            "y": 7
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 6,
            "y": 7
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 4,
            "y": 8
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 5,
            "y": 8,
            "str": 7
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 6,
            "y": 8
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 17,
            "y": 6
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 18,
            "y": 6
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 19,
            "y": 6
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 17,
            "y": 7
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 19,
            "y": 7
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 18,
            "y": 8
          }
        ]
      },
      {
        "name": "ARZACHEL",
        "pack": "AI-made: Siege Lines",
        "campaignId": "siege-lines",
        "mission": 3,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/siege-lines/03-arzachel.json",
        "description": "Two guns inside the wall cover both gates. The last few hexes before a gate are under their fire and the wall shields them from direct attack; your own Hadrian can answer them.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "fortified camp",
          "unequal sides"
        ],
        "design": {
          "theme": "siege",
          "symmetry": "none"
        },
        "grid": [
          "........................",
          "........................",
          "........................",
          "........................",
          ".................MMM....",
          "................M...MM..",
          "......................M.",
          "..........hh..........M.",
          ".B........hh..M...B...M.",
          "......................M.",
          ".....................MM.",
          "................MM.MM...",
          "..................M.....",
          "........................",
          "........................",
          "........................"
        ],
        "buildings": [
          {
            "col": 1,
            "row": 8,
            "owner": 0
          },
          {
            "col": 18,
            "row": 8,
            "owner": 1
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 8
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 7
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 4,
            "y": 8
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 6,
            "y": 8
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 4,
            "y": 9
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 5,
            "y": 9
          },
          {
            "t": "TITAN",
            "o": 0,
            "x": 6,
            "y": 9
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 5,
            "y": 6
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 19,
            "y": 8
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 19,
            "y": 7
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 20,
            "y": 8
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 18,
            "y": 9
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 19,
            "y": 9
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 20,
            "y": 9
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 19,
            "y": 6
          },
          {
            "t": "OCTOPUS",
            "o": 1,
            "x": 17,
            "y": 7
          }
        ]
      },
      {
        "name": "ALPHONSUS",
        "pack": "AI-made: Siege Lines",
        "campaignId": "siege-lines",
        "mission": 4,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/siege-lines/04-alphonsus.json",
        "description": "Three gates, two of them mined. A mine closes its gate to tanks until it is destroyed, and it is very hard to destroy.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "fortified camp",
          "unequal sides"
        ],
        "design": {
          "theme": "siege",
          "symmetry": "none"
        },
        "grid": [
          "..........................",
          "..........................",
          "..........................",
          "...................MMM....",
          "..........hh......M...MM..",
          "..........hh...M........MM",
          "...............M.........M",
          ".........................M",
          ".B..................B....M",
          "...............M.........M",
          "...............M.........M",
          ".......................MM.",
          "..................MM.MM...",
          "....................M.....",
          "..........................",
          ".........................."
        ],
        "buildings": [
          {
            "col": 1,
            "row": 8,
            "owner": 0
          },
          {
            "col": 20,
            "row": 8,
            "owner": 1
          }
        ],
        "units": [
          {
            "t": "TRIGGER",
            "o": 1,
            "x": 16,
            "y": 11
          },
          {
            "t": "TRIGGER",
            "o": 1,
            "x": 17,
            "y": 11
          },
          {
            "t": "TRIGGER",
            "o": 1,
            "x": 17,
            "y": 4
          },
          {
            "t": "TRIGGER",
            "o": 1,
            "x": 16,
            "y": 5
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 8
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 7
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 4,
            "y": 8
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 6,
            "y": 8
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 4,
            "y": 9
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
            "y": 9
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 21,
            "y": 8
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 21,
            "y": 7
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 22,
            "y": 8
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 20,
            "y": 9
          }
        ]
      },
      {
        "name": "PTOLEMAEUS",
        "pack": "AI-made: Siege Lines",
        "campaignId": "siege-lines",
        "mission": 5,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/siege-lines/05-ptolemaeus.json",
        "description": "The great walled plain holds a Xenon factory. Damaged defenders fall back to it for repairs, and its reserves can refill a gate. You bring one Hadrian.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "fortified camp",
          "unequal sides"
        ],
        "design": {
          "theme": "siege",
          "symmetry": "none"
        },
        "grid": [
          "............................",
          "............................",
          "............................",
          ".....................M......",
          "...................MM.MM....",
          ".................MM.....MM..",
          ".......................F..MM",
          "...........................M",
          "...............M...........M",
          ".B.............M.....B.....M",
          "...............M...........M",
          "...........................M",
          "...........................M",
          ".................M.......MM.",
          "..................MM...MM...",
          "............................",
          "............................",
          "............................"
        ],
        "buildings": [
          {
            "col": 1,
            "row": 9,
            "owner": 0
          },
          {
            "col": 21,
            "row": 9,
            "owner": 1
          },
          {
            "col": 23,
            "row": 6,
            "owner": 1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 9
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 8
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
            "x": 6,
            "y": 9
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 4,
            "y": 10
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 5,
            "y": 10
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
            "x": 21,
            "y": 8
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 20,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 22,
            "y": 9
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 20,
            "y": 10
          }
        ]
      },
      {
        "name": "COPERNICUS",
        "pack": "AI-made: Siege Lines",
        "campaignId": "siege-lines",
        "mission": 6,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/siege-lines/06-copernicus.json",
        "description": "Two walls: an outer terrace of broken ground open to the north and south, and an inner rim with a single western gate. Getting in means going around.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "fortified camp",
          "unequal sides"
        ],
        "design": {
          "theme": "siege",
          "symmetry": "none"
        },
        "grid": [
          "............................",
          "............................",
          "............................",
          "...................w...w....",
          ".................ww.....ww..",
          "...............ww....M....ww",
          "..............w....MM.MM....",
          "..............w..MM.....MM..",
          "..............w..M.......M..",
          ".B............w......B...M..",
          "..............w..M.......M..",
          "..............w..M.......M..",
          "..............w...MM...MM...",
          "..............ww....MMM....w",
          "................ww.......ww.",
          "..................ww...ww...",
          "............................",
          "............................"
        ],
        "buildings": [
          {
            "col": 1,
            "row": 9,
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
            "x": 5,
            "y": 9
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 8
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
            "x": 6,
            "y": 9
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 4,
            "y": 10
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 5,
            "y": 10
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 6,
            "y": 10
          },
          {
            "t": "POLAR",
            "o": 0,
            "x": 5,
            "y": 7
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 22,
            "y": 9
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 21,
            "y": 8
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 22,
            "y": 8
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 23,
            "y": 8
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 23,
            "y": 9
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 22,
            "y": 10
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 21,
            "y": 7
          }
        ]
      },
      {
        "name": "TYCHO",
        "pack": "AI-made: Siege Lines",
        "campaignId": "siege-lines",
        "mission": 7,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/siege-lines/07-tycho.json",
        "description": "The camp sits on Tycho's central peak. One narrow road climbs it; infantry can scramble up the slopes, where every defender has mountain cover.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "fortified camp",
          "unequal sides"
        ],
        "design": {
          "theme": "siege",
          "symmetry": "none"
        },
        "grid": [
          "..........................",
          "..........................",
          "..........................",
          "..........................",
          "...........hh.............",
          "...........hh.............",
          "...........hh....-.MMM....",
          ".................---MMMM..",
          "...............--MMM-MMM..",
          ".B............-.-MMMBMMM..",
          ".................MMMMMMM..",
          "..................MMMMM...",
          "....................M.....",
          "..........................",
          "..........................",
          "..........................",
          "..........................",
          ".........................."
        ],
        "buildings": [
          {
            "col": 1,
            "row": 9,
            "owner": 0
          },
          {
            "col": 20,
            "row": 9,
            "owner": 1
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 9
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 8
          },
          {
            "t": "KILROY",
            "o": 0,
            "x": 4,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 6,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 4,
            "y": 10
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 5,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 19,
            "y": 8
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 20,
            "y": 8
          },
          {
            "t": "KILROY",
            "o": 1,
            "x": 21,
            "y": 8
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 19,
            "y": 7
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 17,
            "y": 7
          }
        ]
      },
      {
        "name": "CLAVIUS",
        "pack": "AI-made: Siege Lines",
        "campaignId": "siege-lines",
        "mission": 8,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/siege-lines/08-clavius.json",
        "description": "Two small outpost craters guard the approaches, each with an unguarded Xenon factory. Taking an outpost gives you its reserve and a place to repair.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "fortified camp",
          "unequal sides"
        ],
        "design": {
          "theme": "siege",
          "symmetry": "none"
        },
        "grid": [
          "..............................",
          "...............MMM............",
          "..............M...M...........",
          ".................FM...........",
          "..............MM.MM...........",
          "................M......MMM....",
          ".....................MM...MM..",
          "....................M.......M.",
          "....................M.......M.",
          ".B......................B...M.",
          "....................M.......M.",
          "....................MM.....MM.",
          "...............MMM....MM.MM...",
          "..............M...M.....M.....",
          ".................FM...........",
          "..............MM.MM...........",
          "................M.............",
          ".............................."
        ],
        "buildings": [
          {
            "col": 1,
            "row": 9,
            "owner": 0
          },
          {
            "col": 24,
            "row": 9,
            "owner": 1
          },
          {
            "col": 17,
            "row": 3,
            "owner": 1,
            "stored": [
              "CHARLIE"
            ]
          },
          {
            "col": 17,
            "row": 14,
            "owner": 1,
            "stored": [
              "CHARLIE"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 9
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 8
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 4,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 6,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 4,
            "y": 10
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 5,
            "y": 10
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 6,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 25,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 25,
            "y": 8
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 26,
            "y": 9
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 24,
            "y": 10
          }
        ]
      },
      {
        "name": "GRIMALDI",
        "pack": "AI-made: Siege Lines",
        "campaignId": "siege-lines",
        "mission": 9,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/siege-lines/09-grimaldi.json",
        "description": "The garrison is small, but a Xenon relief column is marching along the northern edge. Take the camp before it arrives, or turn to meet it.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "fortified camp",
          "unequal sides"
        ],
        "design": {
          "theme": "siege",
          "symmetry": "none"
        },
        "grid": [
          "..............................",
          ".........-.-.-.-.-.-..........",
          "..........-.-.-.-.--..........",
          "...................-..........",
          "...................-..........",
          "...................-..........",
          "..................-....MMM....",
          "..................-..MM...MM..",
          "..................-.M.......M.",
          "..................-.M.......M.",
          ".B............hh..-.....B...M.",
          "..............hh....M.......M.",
          "..............hh....MM.....MM.",
          "..............hh......MM.MM...",
          "........................M.....",
          "..............................",
          "..............................",
          "..............................",
          "..............................",
          ".............................."
        ],
        "buildings": [
          {
            "col": 1,
            "row": 10,
            "owner": 0
          },
          {
            "col": 24,
            "row": 10,
            "owner": 1
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 12
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 11
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 4,
            "y": 12
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 6,
            "y": 12
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 4,
            "y": 13
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 5,
            "y": 13
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 6,
            "y": 13
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 23,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 24,
            "y": 9
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 25,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 15,
            "y": 1
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 15,
            "y": 0
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 14,
            "y": 1
          }
        ]
      },
      {
        "name": "WARGENTIN",
        "pack": "AI-made: Siege Lines",
        "campaignId": "siege-lines",
        "mission": 10,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/siege-lines/10-wargentin.json",
        "description": "Wargentin is a crater filled to the brim: a plateau of hills with no wall at all. One Eagle supports your attack; a Hawkeye and a Seeker defend the sky.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "fortified camp",
          "unequal sides"
        ],
        "design": {
          "theme": "siege",
          "symmetry": "none"
        },
        "grid": [
          "............................",
          "............................",
          "............................",
          "............................",
          "...................w.h.w....",
          ".................wwhhhhhww..",
          "...............wwhhhhhhhhhww",
          "...............whhhhhhhhhhhw",
          "................hhhhhhhhhhhw",
          ".B..............hhhhhBhhhhhw",
          "................hhhhhhhhhhhw",
          "...............whhhhhhhhhhhw",
          "...............whhhhhhhhhhhw",
          "................wwhhhhhhhww.",
          "..................wwhhhww...",
          "............................",
          "............................",
          "............................"
        ],
        "buildings": [
          {
            "col": 1,
            "row": 9,
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
            "x": 5,
            "y": 9
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 8
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
            "x": 6,
            "y": 9
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 4,
            "y": 10
          },
          {
            "t": "EAGLE",
            "o": 0,
            "x": 2,
            "y": 6
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 22,
            "y": 9
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 21,
            "y": 8
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 22,
            "y": 8
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 23,
            "y": 8
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
            "x": 22,
            "y": 10
          },
          {
            "t": "HAWKEYE",
            "o": 1,
            "x": 21,
            "y": 7
          },
          {
            "t": "SEEKER",
            "o": 1,
            "x": 22,
            "y": 7
          }
        ]
      },
      {
        "name": "GASSENDI",
        "pack": "AI-made: Siege Lines",
        "campaignId": "siege-lines",
        "mission": 11,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/siege-lines/11-gassendi.json",
        "description": "Gassendi's wall has one gate, but walls do not stop Pelicans. Each can carry a squad over the rim into the crater, where a single Seeker guards the sky.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "fortified camp",
          "unequal sides"
        ],
        "design": {
          "theme": "siege",
          "symmetry": "none"
        },
        "grid": [
          "..............................",
          "..............................",
          "..............................",
          "..............................",
          "..............hh..............",
          "..............hh.......M......",
          "..............hh.....MM.MM....",
          "..............hh...MM.....MM..",
          "..................M.........M.",
          "..................M.........M.",
          ".B.....................B....M.",
          "............................M.",
          "..................M.........M.",
          "..................MM.......MM.",
          "....................MM...MM...",
          "......................MMM.....",
          "..............................",
          "..............................",
          "..............................",
          ".............................."
        ],
        "buildings": [
          {
            "col": 1,
            "row": 10,
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
            "x": 6,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 9
          },
          {
            "t": "KILROY",
            "o": 0,
            "x": 6,
            "y": 9
          },
          {
            "t": "KILROY",
            "o": 0,
            "x": 7,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 5,
            "y": 10
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 7,
            "y": 10
          },
          {
            "t": "PELICAN",
            "o": 0,
            "x": 3,
            "y": 7
          },
          {
            "t": "PELICAN",
            "o": 0,
            "x": 3,
            "y": 6
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 24,
            "y": 10
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
            "x": 24,
            "y": 9
          },
          {
            "t": "SEEKER",
            "o": 1,
            "x": 25,
            "y": 9
          }
        ]
      },
      {
        "name": "POSIDONIUS",
        "pack": "AI-made: Siege Lines",
        "campaignId": "siege-lines",
        "mission": 12,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/siege-lines/12-posidonius.json",
        "description": "A rille runs in front of Posidonius with a single bridge. Tanks must cross it and then find a gate; infantry can climb down and up anywhere, and your Pelican can lift one unit over both.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "fortified camp",
          "unequal sides"
        ],
        "design": {
          "theme": "siege",
          "symmetry": "none"
        },
        "grid": [
          ".................v............",
          ".................v............",
          ".................v............",
          ".................v............",
          ".................v............",
          ".................v.....MMM....",
          ".................v...MM...MM..",
          ".................v.MM.......MM",
          ".................v.M.........M",
          ".......-.-.-.-.-.=.-.........M",
          ".B....-.-.-.-.-.-v-.-...B....M",
          ".................v.M.........M",
          ".................v.M.........M",
          ".................v.........MM.",
          ".................v....MM.MM...",
          ".................v......M.....",
          ".................v............",
          ".................v............",
          ".................v............",
          ".................v............"
        ],
        "buildings": [
          {
            "col": 1,
            "row": 10,
            "owner": 0
          },
          {
            "col": 24,
            "row": 10,
            "owner": 1
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 6,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 6,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 7,
            "y": 9
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 5,
            "y": 10
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 7,
            "y": 10
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 6,
            "y": 11
          },
          {
            "t": "OCTOPUS",
            "o": 0,
            "x": 5,
            "y": 8
          },
          {
            "t": "PELICAN",
            "o": 0,
            "x": 3,
            "y": 6
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 23,
            "y": 9
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 24,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 25,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 23,
            "y": 10
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 25,
            "y": 10
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 24,
            "y": 11
          }
        ]
      },
      {
        "name": "THEOPHILUS",
        "pack": "AI-made: Siege Lines",
        "campaignId": "siege-lines",
        "mission": 13,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/siege-lines/13-theophilus.json",
        "description": "Two craters: the camp in Theophilus and a Xenon factory in its neighbor. The factory's reserves can reinforce the camp unless you take it first.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "fortified camp",
          "unequal sides"
        ],
        "design": {
          "theme": "siege",
          "symmetry": "none"
        },
        "grid": [
          "................................",
          "................................",
          ".........................MMM....",
          ".......................MM...MM..",
          "..............................M.",
          "..............................M.",
          "......................M...B...M.",
          "......................M.......M.",
          "......................MM.....MM.",
          "........................MM.MM...",
          "..B.......................M.....",
          "................................",
          ".....................MMM........",
          "...................MM...MM......",
          ".........................M......",
          ".......................F.M......",
          "...................M.....M......",
          "....................MM.MM.......",
          "......................M.........",
          "................................"
        ],
        "buildings": [
          {
            "col": 2,
            "row": 10,
            "owner": 0
          },
          {
            "col": 26,
            "row": 6,
            "owner": 1
          },
          {
            "col": 23,
            "row": 15,
            "owner": 1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 6,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 9
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 6,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 7,
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
            "x": 7,
            "y": 10
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 6,
            "y": 11
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 5,
            "y": 8
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 27,
            "y": 6
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 27,
            "y": 5
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 28,
            "y": 6
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 23,
            "y": 14
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 23,
            "y": 13
          }
        ]
      },
      {
        "name": "MAUROLYCUS",
        "pack": "AI-made: Siege Lines",
        "campaignId": "siege-lines",
        "mission": 14,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/siege-lines/14-maurolycus.json",
        "description": "A fast Xenon Rabbit starts outside the walls, on the road to your camp. Chase it or ignore it: every unit you leave behind to watch it is one fewer at the gate.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "fortified camp",
          "unequal sides"
        ],
        "design": {
          "theme": "siege",
          "symmetry": "none"
        },
        "grid": [
          "................................",
          "................................",
          ".................-.----.........",
          ".............-.--.-.............",
          ".........----.-.................",
          ".......--.......................",
          ".......-.................MMM....",
          ".....--................MM...MM..",
          "....-.................M.......M.",
          "...--.................M.......M.",
          "..B.......................B...M.",
          "......................M.......M.",
          "......................MM.....MM.",
          "........................MM.MM...",
          "..........................M.....",
          "................................",
          "................................",
          "................................",
          "................................",
          "................................"
        ],
        "buildings": [
          {
            "col": 2,
            "row": 10,
            "owner": 0
          },
          {
            "col": 26,
            "row": 10,
            "owner": 1
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 6,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 6,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 7,
            "y": 9
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 5,
            "y": 10
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 7,
            "y": 10
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
            "x": 27,
            "y": 10
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 27,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 28,
            "y": 10
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
            "x": 27,
            "y": 11
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 20,
            "y": 2
          }
        ]
      },
      {
        "name": "PETAVIUS",
        "pack": "AI-made: Siege Lines",
        "campaignId": "siege-lines",
        "mission": 15,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/siege-lines/15-petavius.json",
        "description": "A huge crater with four gates and a rille across its floor. The camp lies beyond the rille; the gates are easy, the rille is not. Your Eagle faces two Hawkeyes and a Seeker.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "fortified camp",
          "unequal sides"
        ],
        "design": {
          "theme": "siege",
          "symmetry": "none"
        },
        "grid": [
          "..................................",
          "..................................",
          "..................................",
          "..................................",
          ".......................v..........",
          ".....................MMv..MM......",
          "...................MM..v....MM....",
          ".......................v..F...MM..",
          ".......................v.......M..",
          ".................M.....v.......M..",
          ".................M.....v.......M..",
          "..B..............M-----=--B....M..",
          ".................M.....v.......M..",
          ".......................v.......M..",
          ".......................v.......M..",
          "...................M...v.....MM...",
          "....................MM.v...MM.....",
          "......................Mv..M.......",
          "..................................",
          "..................................",
          "..................................",
          ".................................."
        ],
        "buildings": [
          {
            "col": 2,
            "row": 11,
            "owner": 0
          },
          {
            "col": 26,
            "row": 11,
            "owner": 1
          },
          {
            "col": 26,
            "row": 7,
            "owner": 1,
            "stored": [
              "BISON",
              "LENET"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 6,
            "y": 11
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 6,
            "y": 10
          },
          {
            "t": "KILROY",
            "o": 0,
            "x": 7,
            "y": 10
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 5,
            "y": 11
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 7,
            "y": 11
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 6,
            "y": 12
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
            "y": 9
          },
          {
            "t": "EAGLE",
            "o": 0,
            "x": 3,
            "y": 6
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 27,
            "y": 11
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
            "x": 28,
            "y": 11
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
            "x": 27,
            "y": 12
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 28,
            "y": 12
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 27,
            "y": 9
          },
          {
            "t": "HAWKEYE",
            "o": 1,
            "x": 25,
            "y": 10
          },
          {
            "t": "HAWKEYE",
            "o": 1,
            "x": 26,
            "y": 10
          },
          {
            "t": "SEEKER",
            "o": 1,
            "x": 28,
            "y": 10
          }
        ]
      },
      {
        "name": "MARE ORIENTALE",
        "pack": "AI-made: Siege Lines",
        "campaignId": "siege-lines",
        "mission": 16,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/siege-lines/16-mare-orientale.json",
        "description": "Three concentric rings of mountains surround the Xenon camp, the innermost two hexes thick, their gates offset so each ring turns the attack sideways. Xenon has more units; it also has more wall to hold.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "fortified camp",
          "unequal sides"
        ],
        "design": {
          "theme": "siege",
          "symmetry": "none"
        },
        "grid": [
          "........................................",
          "........................................",
          "........................................",
          ".............................MMM........",
          "...........................MM...MM......",
          ".........................MM.......MM....",
          ".......................MM...........MM..",
          ".....................MM....MM...MM....MM",
          "....................M....MM.......MM....",
          "....................M..MM....MMM.F..MM..",
          "....................M..M...MMMMMMM...M..",
          "....................M..M..MMM...MMM..M..",
          "....................M..M..M......MM..M..",
          "..B.................M..M......B..MM..M..",
          "....................M..M..MM.....MM..M..",
          ".......................M..MMMM.MMMM..M..",
          ".......................M....MMMMM....M..",
          "........................MM....M....MM...",
          "....................MM....MM.....MM....M",
          "......................MM....M...M....MM.",
          "........................MM.........MM...",
          "..........................MM.....MM.....",
          "............................MM.MM.......",
          "..............................M.........",
          "........................................",
          "........................................"
        ],
        "buildings": [
          {
            "col": 2,
            "row": 13,
            "owner": 0
          },
          {
            "col": 30,
            "row": 13,
            "owner": 1
          },
          {
            "col": 33,
            "row": 9,
            "owner": 1,
            "stored": [
              "BISON",
              "LENET"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 6,
            "y": 13
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 12
          },
          {
            "t": "KILROY",
            "o": 0,
            "x": 6,
            "y": 12
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 7,
            "y": 12
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 5,
            "y": 13
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 7,
            "y": 13
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 6,
            "y": 14
          },
          {
            "t": "OCTOPUS",
            "o": 0,
            "x": 5,
            "y": 11
          },
          {
            "t": "EAGLE",
            "o": 0,
            "x": 2,
            "y": 8
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 31,
            "y": 13
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 31,
            "y": 12
          },
          {
            "t": "KILROY",
            "o": 1,
            "x": 32,
            "y": 13
          },
          {
            "t": "KILROY",
            "o": 1,
            "x": 30,
            "y": 14
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 31,
            "y": 14
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 32,
            "y": 14
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 31,
            "y": 11
          },
          {
            "t": "GRIZZLY",
            "o": 1,
            "x": 29,
            "y": 12
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 30,
            "y": 12
          },
          {
            "t": "OCTOPUS",
            "o": 1,
            "x": 32,
            "y": 12
          },
          {
            "t": "HAWKEYE",
            "o": 1,
            "x": 29,
            "y": 13
          },
          {
            "t": "SEEKER",
            "o": 1,
            "x": 29,
            "y": 14
          }
        ]
      }
    ]
  },
  {
    "id": "arsenal",
    "name": "AI-made: Arsenal",
    "description": "Neutral factories hold the reserves that decide these battles. Which factory to take, and when, matters more than the army you start with.",
    "notes": "Sixteen AI-made battles created by Claude Opus 5.5, each testing one idea about map balance. They were tuned so the strongest simulator bot playing both sides won about as often as Union as Xenon, under a rule since removed that gave Xenon the win at each board's own turn limit; their balance under the current draw rules has not been measured. Normal capture/elimination rules apply. Forces start fresh each mission.",
    "levels": [
      {
        "name": "SINUS MEDII",
        "pack": "AI-made: Arsenal",
        "campaignId": "arsenal",
        "mission": 1,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/arsenal/01-sinus-medii.json",
        "description": "One factory stands at the exact centre, holding a Charlie, a Bison and a Kilroy. You move first, but your capturers are slow Kilroys starting farther back than Xenon's Charlies.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "factory reserves",
          "mirror symmetry"
        ],
        "design": {
          "theme": "arsenal",
          "symmetry": "mirror"
        },
        "grid": [
          ".....................",
          ".....................",
          "......h.......h......",
          "......h.......h......",
          "......h.......h......",
          ".....................",
          ".....................",
          ".B--------F--------B.",
          ".....................",
          "......h.......h......",
          "......h.......h......",
          "......h.......h......",
          ".....................",
          "....................."
        ],
        "buildings": [
          {
            "col": 1,
            "row": 7,
            "owner": 0
          },
          {
            "col": 19,
            "row": 7,
            "owner": 1
          },
          {
            "col": 10,
            "row": 7,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "KILROY"
            ]
          }
        ],
        "units": [
          {
            "t": "KILROY",
            "o": 0,
            "x": 1,
            "y": 6
          },
          {
            "t": "KILROY",
            "o": 0,
            "x": 0,
            "y": 7
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 2,
            "y": 7
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 0,
            "y": 8
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 17,
            "y": 7
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 17,
            "y": 6
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 16,
            "y": 7
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 18,
            "y": 7
          }
        ]
      },
      {
        "name": "MARE VAPORUM",
        "pack": "AI-made: Arsenal",
        "campaignId": "arsenal",
        "mission": 2,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/arsenal/02-mare-vaporum.json",
        "description": "Two factories lie in the open middle, each a little closer to one camp. Take yours, and decide whether to reach for theirs. Your camp stands farther forward than Xenon's, but you bring one Charlie fewer, and the Xenon tanks start damaged.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "factory reserves",
          "half-turn symmetry"
        ],
        "design": {
          "theme": "arsenal",
          "symmetry": "half"
        },
        "grid": [
          "........................",
          "........................",
          "......h......ww.........",
          ".....hhh.....ww.........",
          ".....hhh.....ww.........",
          ".....hh.................",
          ".............F------.-..",
          "....................-.B.",
          ".-.B....................",
          "..-.------F.............",
          ".................hh.....",
          ".........ww.....hhh.....",
          ".........ww.....hhh.....",
          ".........ww......h......",
          "........................",
          "........................"
        ],
        "buildings": [
          {
            "col": 3,
            "row": 8,
            "owner": 0
          },
          {
            "col": 22,
            "row": 7,
            "owner": 1
          },
          {
            "col": 10,
            "row": 9,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET"
            ]
          },
          {
            "col": 13,
            "row": 6,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 3,
            "y": 7
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 2,
            "y": 8
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 4,
            "y": 8
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 2,
            "y": 9
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 20,
            "y": 8
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 19,
            "y": 7
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 20,
            "y": 7,
            "str": 7
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 21,
            "y": 7,
            "str": 7
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 19,
            "y": 8,
            "str": 7
          }
        ]
      },
      {
        "name": "LACUS SOMNIORUM",
        "pack": "AI-made: Arsenal",
        "campaignId": "arsenal",
        "mission": 3,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/arsenal/03-lacus-somniorum.json",
        "description": "Six small factories are scattered across the lake bed, each holding a squad or two. There are more prizes than capturers, and the Xenon camp stands nearer the middle than yours.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "factory reserves",
          "half-turn symmetry"
        ],
        "design": {
          "theme": "arsenal",
          "symmetry": "half"
        },
        "grid": [
          "..........................",
          "..........................",
          "............hh............",
          "......F.....hh............",
          "..............F...........",
          "..........................",
          ".........h......F.........",
          "........hh......hh........",
          ".B......hh......hh....B...",
          ".........F......h.........",
          "..........................",
          "...........F..............",
          "............hh.....F......",
          "............hh............",
          "..........................",
          ".........................."
        ],
        "buildings": [
          {
            "col": 1,
            "row": 8,
            "owner": 0
          },
          {
            "col": 22,
            "row": 8,
            "owner": 1
          },
          {
            "col": 6,
            "row": 3,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET"
            ]
          },
          {
            "col": 19,
            "row": 12,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET"
            ]
          },
          {
            "col": 11,
            "row": 11,
            "owner": -1,
            "stored": [
              "CHARLIE"
            ]
          },
          {
            "col": 14,
            "row": 4,
            "owner": -1,
            "stored": [
              "CHARLIE"
            ]
          },
          {
            "col": 16,
            "row": 6,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET"
            ]
          },
          {
            "col": 9,
            "row": 9,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 4,
            "y": 8
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 3,
            "y": 7
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 4,
            "y": 7
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 5,
            "y": 7
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 3,
            "y": 8
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 21,
            "y": 7
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 22,
            "y": 8
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 21,
            "y": 8
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 20,
            "y": 8
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 22,
            "y": 7
          }
        ]
      },
      {
        "name": "MARE CRISIUM",
        "pack": "AI-made: Arsenal",
        "campaignId": "arsenal",
        "mission": 4,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/arsenal/04-mare-crisium.json",
        "description": "The factories on the rim of Crisium hold aircraft, a Hunter and a Falcon each. Whoever takes one owns the sky over the basin; you bring a second Hawkeye, but one of your Charlies is at half strength.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "factory reserves",
          "mirror symmetry"
        ],
        "design": {
          "theme": "arsenal",
          "symmetry": "mirror"
        },
        "grid": [
          "...........................",
          "...........................",
          "..........F.....F..........",
          "...........................",
          "...........M...M...........",
          ".........MM.....MM.........",
          "........M.........M........",
          "........M.........M........",
          ".B.-.-.-.-.-.-.-.-.-.-.-.B.",
          "..-.-.-.-.-.-.-.-.-.-.-.-..",
          "........M.........M........",
          "........MM.......MM........",
          "..........MM...MM..........",
          "...........................",
          "...........................",
          "...........................",
          "..........................."
        ],
        "buildings": [
          {
            "col": 1,
            "row": 8,
            "owner": 0
          },
          {
            "col": 25,
            "row": 8,
            "owner": 1
          },
          {
            "col": 10,
            "row": 2,
            "owner": -1,
            "stored": [
              "FALCON",
              "HUNTER"
            ]
          },
          {
            "col": 16,
            "row": 2,
            "owner": -1,
            "stored": [
              "FALCON",
              "HUNTER"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 4,
            "y": 8,
            "str": 4
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 3,
            "y": 7
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 4,
            "y": 7
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 5,
            "y": 7
          },
          {
            "t": "HAWKEYE",
            "o": 0,
            "x": 3,
            "y": 8
          },
          {
            "t": "HAWKEYE",
            "o": 0,
            "x": 5,
            "y": 8
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 22,
            "y": 8
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 21,
            "y": 7
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
            "y": 7
          },
          {
            "t": "HAWKEYE",
            "o": 1,
            "x": 21,
            "y": 8
          }
        ]
      },
      {
        "name": "PALUS PUTREDINIS",
        "pack": "AI-made: Arsenal",
        "campaignId": "arsenal",
        "mission": 5,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/arsenal/05-palus-putredinis.json",
        "description": "The marsh factories hold Atlas guns and the Mules to carry them. An Atlas can shell anything within six hexes, but only where a Mule puts it. You bring one more Charlie, and the Xenon force is under strength.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "factory reserves",
          "half-turn symmetry"
        ],
        "design": {
          "theme": "arsenal",
          "symmetry": "half"
        },
        "grid": [
          "............................",
          "............................",
          "............................",
          "............................",
          "..........Fwwwwww...........",
          "..........wwwwwwww..........",
          ".........wwwwwwwwww.........",
          ".........wwwwwwwwww.........",
          ".............-------------B.",
          ".B-------------.............",
          ".........wwwwwwwwww.........",
          ".........wwwwwwwwww.........",
          "..........wwwwwwww..........",
          "...........wwwwwwF..........",
          "............................",
          "............................",
          "............................",
          "............................"
        ],
        "buildings": [
          {
            "col": 1,
            "row": 9,
            "owner": 0
          },
          {
            "col": 26,
            "row": 8,
            "owner": 1
          },
          {
            "col": 10,
            "row": 4,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "MULE",
              "ATLAS"
            ]
          },
          {
            "col": 17,
            "row": 13,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "MULE",
              "ATLAS"
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
            "x": 3,
            "y": 8
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 4,
            "y": 8
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 5,
            "y": 8
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 3,
            "y": 9
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
            "x": 23,
            "y": 9,
            "str": 6
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 23,
            "y": 8,
            "str": 6
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 22,
            "y": 9,
            "str": 6
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 24,
            "y": 9,
            "str": 6
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 22,
            "y": 10,
            "str": 6
          }
        ]
      },
      {
        "name": "MARE NUBIUM",
        "pack": "AI-made: Arsenal",
        "campaignId": "arsenal",
        "mission": 6,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/arsenal/06-mare-nubium.json",
        "description": "A rich factory stands a few hexes from each camp, closer to the enemy's army than to its owner's. A quick capturer can take it; the camp's defenders can hold it.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "factory reserves",
          "half-turn symmetry"
        ],
        "design": {
          "theme": "arsenal",
          "symmetry": "half"
        },
        "grid": [
          "............................",
          "............................",
          "............................",
          "............................",
          ".....F.........hhh..........",
          ".............--hhh-----F....",
          ".........----..hhh..........",
          ".......--.......h...........",
          "...----..................-B.",
          ".B-..................----...",
          "...........h.......--.......",
          "..........hhh..----.........",
          "....F-----hhh--.............",
          "..........hhh.........F.....",
          "............................",
          "............................",
          "............................",
          "............................"
        ],
        "buildings": [
          {
            "col": 1,
            "row": 9,
            "owner": 0
          },
          {
            "col": 26,
            "row": 8,
            "owner": 1
          },
          {
            "col": 23,
            "row": 5,
            "owner": -1,
            "stored": [
              "BISON",
              "BISON",
              "LENET"
            ]
          },
          {
            "col": 4,
            "row": 12,
            "owner": -1,
            "stored": [
              "BISON",
              "BISON",
              "LENET"
            ]
          },
          {
            "col": 5,
            "row": 4,
            "owner": -1,
            "stored": [
              "CHARLIE"
            ]
          },
          {
            "col": 22,
            "row": 13,
            "owner": -1,
            "stored": [
              "CHARLIE"
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
            "x": 3,
            "y": 8
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 4,
            "y": 8
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 5,
            "y": 8
          },
          {
            "t": "RABBIT",
            "o": 0,
            "x": 3,
            "y": 9
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 23,
            "y": 8
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 24,
            "y": 9
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
            "x": 22,
            "y": 9
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 24,
            "y": 8
          }
        ]
      },
      {
        "name": "SINUS IRIDUM",
        "pack": "AI-made: Arsenal",
        "campaignId": "arsenal",
        "mission": 7,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/arsenal/07-sinus-iridum.json",
        "description": "The richest factory sits inside a horseshoe of mountains with one entrance to the south. Taking it is a race; keeping it is a siege.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "factory reserves",
          "mirror symmetry"
        ],
        "design": {
          "theme": "arsenal",
          "symmetry": "mirror"
        },
        "grid": [
          ".............................",
          ".............................",
          ".............MMM.............",
          "......F....MM...MM....F......",
          "...........M.....M...........",
          "...........M..F..M...........",
          "...........M.....M...........",
          "............M.-.M............",
          "..............-..............",
          "..............-..............",
          ".B-------------------------B.",
          ".............................",
          ".............................",
          ".............................",
          ".............................",
          ".............................",
          ".............................",
          "............................."
        ],
        "buildings": [
          {
            "col": 1,
            "row": 10,
            "owner": 0
          },
          {
            "col": 27,
            "row": 10,
            "owner": 1
          },
          {
            "col": 14,
            "row": 5,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "BISON"
            ]
          },
          {
            "col": 6,
            "row": 3,
            "owner": -1,
            "stored": [
              "CHARLIE"
            ]
          },
          {
            "col": 22,
            "row": 3,
            "owner": -1,
            "stored": [
              "CHARLIE"
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
            "y": 9
          },
          {
            "t": "KILROY",
            "o": 0,
            "x": 4,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 5,
            "y": 9
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 3,
            "y": 10
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 5,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 24,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 25,
            "y": 9
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
            "x": 23,
            "y": 9
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 25,
            "y": 10
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 23,
            "y": 10
          }
        ]
      },
      {
        "name": "MARE FECUNDITATIS",
        "pack": "AI-made: Arsenal",
        "campaignId": "arsenal",
        "mission": 8,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/arsenal/08-mare-fecunditatis.json",
        "description": "An island factory sits inside a ring of valleys that tanks cannot cross. The Pelican in your nearer factory can fly a squad over. The Xenon Lenet starts damaged.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "factory reserves",
          "half-turn symmetry"
        ],
        "design": {
          "theme": "arsenal",
          "symmetry": "half"
        },
        "grid": [
          "..............................",
          "..............................",
          "..............................",
          "..............................",
          ".............vvvv.............",
          ".......F...vvvvvvvv...........",
          "..........vv......vv..........",
          "..........v........v..........",
          ".........vv........vv..-.-.-..",
          ".........vv..F.....vv.-.-.-.B.",
          ".B.-.-.-.vv.....F..vv.........",
          "..-.-.-..vv........vv.........",
          "..........v........v..........",
          "..........vv......vv..........",
          "...........vvvvvvvv...F.......",
          ".............vvvv.............",
          "..............................",
          "..............................",
          "..............................",
          ".............................."
        ],
        "buildings": [
          {
            "col": 1,
            "row": 10,
            "owner": 0
          },
          {
            "col": 28,
            "row": 9,
            "owner": 1
          },
          {
            "col": 7,
            "row": 5,
            "owner": -1,
            "stored": [
              "PELICAN",
              "CHARLIE"
            ]
          },
          {
            "col": 22,
            "row": 14,
            "owner": -1,
            "stored": [
              "PELICAN",
              "CHARLIE"
            ]
          },
          {
            "col": 13,
            "row": 9,
            "owner": -1,
            "stored": [
              "BISON",
              "BISON",
              "LENET",
              "LENET"
            ]
          },
          {
            "col": 16,
            "row": 10,
            "owner": -1,
            "stored": [
              "BISON",
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
            "x": 4,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 3,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 4,
            "y": 9
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 5,
            "y": 9
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 25,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 25,
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
            "x": 26,
            "y": 10,
            "str": 7
          }
        ]
      },
      {
        "name": "MARE HUMORUM",
        "pack": "AI-made: Arsenal",
        "campaignId": "arsenal",
        "mission": 9,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/arsenal/09-mare-humorum.json",
        "description": "Near your camp, a factory holds one squad. Far out on the flank, another holds a tank company. Send your capturers near or far; you have one more Charlie than Xenon.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "factory reserves",
          "half-turn symmetry"
        ],
        "design": {
          "theme": "arsenal",
          "symmetry": "half"
        },
        "grid": [
          "..............................",
          "..............................",
          "...........-----F-............",
          "...........-..................",
          "..........-...................",
          ".........--...................",
          ".........-....................",
          "........-....hhhh......F......",
          ".......--...hhhhhh............",
          ".......-....hhhhhh.....-----B.",
          ".B-----.....hhhhhh....-.......",
          "............hhhhhh...--.......",
          "......F......hhhh....-........",
          "....................-.........",
          "...................--.........",
          "...................-..........",
          "..................-...........",
          "............-F-----...........",
          "..............................",
          ".............................."
        ],
        "buildings": [
          {
            "col": 1,
            "row": 10,
            "owner": 0
          },
          {
            "col": 28,
            "row": 9,
            "owner": 1
          },
          {
            "col": 6,
            "row": 12,
            "owner": -1,
            "stored": [
              "CHARLIE"
            ]
          },
          {
            "col": 23,
            "row": 7,
            "owner": -1,
            "stored": [
              "CHARLIE"
            ]
          },
          {
            "col": 16,
            "row": 2,
            "owner": -1,
            "stored": [
              "BISON",
              "BISON",
              "LENET",
              "TITAN"
            ]
          },
          {
            "col": 13,
            "row": 17,
            "owner": -1,
            "stored": [
              "BISON",
              "BISON",
              "LENET",
              "TITAN"
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
            "y": 9
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 4,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 5,
            "y": 9
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 3,
            "y": 10
          },
          {
            "t": "RABBIT",
            "o": 0,
            "x": 5,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 25,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 25,
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
            "x": 26,
            "y": 10
          },
          {
            "t": "RABBIT",
            "o": 1,
            "x": 24,
            "y": 11
          }
        ]
      },
      {
        "name": "OCEANUS PROCELLARUM",
        "pack": "AI-made: Arsenal",
        "campaignId": "arsenal",
        "mission": 10,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/arsenal/10-oceanus-procellarum.json",
        "description": "An ocean of open ground with eight scattered factories. Every capture draws a response, and no front holds still for long. Your army arrives worn: every unit starts at strength six.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "factory reserves",
          "half-turn symmetry"
        ],
        "design": {
          "theme": "arsenal",
          "symmetry": "half"
        },
        "grid": [
          "..................................",
          "..................................",
          "..................................",
          "....................F.............",
          ".......F..........................",
          "..........h.......h..F............",
          ".........hhh...F.hhh..............",
          ".........hhh.....hhh..............",
          "..................................",
          "...................ww.............",
          "...................ww..........B..",
          "..B..........ww...................",
          ".............ww...................",
          "..................................",
          "..............hhh.....hhh.........",
          "..............hhh.F...hhh.........",
          "............F..h.......h..........",
          "..........................F.......",
          ".............F....................",
          "..................................",
          "..................................",
          ".................................."
        ],
        "buildings": [
          {
            "col": 2,
            "row": 11,
            "owner": 0
          },
          {
            "col": 31,
            "row": 10,
            "owner": 1
          },
          {
            "col": 7,
            "row": 4,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET"
            ]
          },
          {
            "col": 26,
            "row": 17,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET"
            ]
          },
          {
            "col": 12,
            "row": 16,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON"
            ]
          },
          {
            "col": 21,
            "row": 5,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON"
            ]
          },
          {
            "col": 15,
            "row": 6,
            "owner": -1,
            "stored": [
              "BISON",
              "LENET"
            ]
          },
          {
            "col": 18,
            "row": 15,
            "owner": -1,
            "stored": [
              "BISON",
              "LENET"
            ]
          },
          {
            "col": 20,
            "row": 3,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LYNX"
            ]
          },
          {
            "col": 13,
            "row": 18,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LYNX"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 11,
            "str": 6
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 10,
            "str": 6
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 4,
            "y": 11,
            "str": 6
          },
          {
            "t": "PANTHER",
            "o": 0,
            "x": 6,
            "y": 11,
            "str": 6
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 4,
            "y": 12,
            "str": 6
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 5,
            "y": 12,
            "str": 6
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 6,
            "y": 12,
            "str": 6
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 5,
            "y": 9,
            "str": 6
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 3,
            "y": 10,
            "str": 6
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 28,
            "y": 11
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 27,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 28,
            "y": 10
          },
          {
            "t": "PANTHER",
            "o": 1,
            "x": 29,
            "y": 10
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 27,
            "y": 11
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 29,
            "y": 11
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 28,
            "y": 12
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 27,
            "y": 9
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 28,
            "y": 9
          }
        ]
      },
      {
        "name": "MARE COGNITUM",
        "pack": "AI-made: Arsenal",
        "campaignId": "arsenal",
        "mission": 11,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/arsenal/11-mare-cognitum.json",
        "description": "These factories hold only a squad each, but any damaged unit can repair in one. Holding them keeps your army whole. Your Hadrian starts damaged.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "factory reserves",
          "half-turn symmetry"
        ],
        "design": {
          "theme": "arsenal",
          "symmetry": "half"
        },
        "grid": [
          "..............................",
          "..............................",
          "..............................",
          "..............................",
          "..............................",
          ".................F............",
          "...........-F-----............",
          ".........--...hh..............",
          ".....----.....hh..............",
          "...--........hhhh..........-B.",
          ".B-..........hhhh........--...",
          "..............hh.....----.....",
          "..............hh...--.........",
          "............-----F-...........",
          "............F.................",
          "..............................",
          "..............................",
          "..............................",
          "..............................",
          ".............................."
        ],
        "buildings": [
          {
            "col": 1,
            "row": 10,
            "owner": 0
          },
          {
            "col": 28,
            "row": 9,
            "owner": 1
          },
          {
            "col": 12,
            "row": 6,
            "owner": -1,
            "stored": [
              "CHARLIE"
            ]
          },
          {
            "col": 17,
            "row": 13,
            "owner": -1,
            "stored": [
              "CHARLIE"
            ]
          },
          {
            "col": 12,
            "row": 14,
            "owner": -1,
            "stored": [
              "CHARLIE"
            ]
          },
          {
            "col": 17,
            "row": 5,
            "owner": -1,
            "stored": [
              "CHARLIE"
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
            "y": 9
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
            "y": 9
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 3,
            "y": 10
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 5,
            "y": 10
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
            "x": 3,
            "y": 8,
            "str": 7
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 25,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 25,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 24,
            "y": 10
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 26,
            "y": 10
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 24,
            "y": 11
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 25,
            "y": 11
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 26,
            "y": 11
          },
          {
            "t": "POLAR",
            "o": 1,
            "x": 25,
            "y": 8
          }
        ]
      },
      {
        "name": "MARE SERENITATIS",
        "pack": "AI-made: Arsenal",
        "campaignId": "arsenal",
        "mission": 12,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/arsenal/12-mare-serenitatis.json",
        "description": "Xenon's factories are many but far from its army; Union's are few but close. Whichever side arms faster decides the battle.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "factory reserves",
          "unequal sides"
        ],
        "design": {
          "theme": "arsenal",
          "symmetry": "none"
        },
        "grid": [
          "...............................",
          "...............................",
          "...........................F...",
          "...................F...........",
          "...............................",
          "...............................",
          "........F......................",
          "...............h...............",
          "..............hhh..............",
          "..............hhh..............",
          "..B--------------------------B.",
          "..............hhh..............",
          "...............h...............",
          "........F......................",
          "...............................",
          "...............................",
          "...............................",
          "...........................F...",
          "...............................",
          "..............................."
        ],
        "buildings": [
          {
            "col": 2,
            "row": 10,
            "owner": 0
          },
          {
            "col": 29,
            "row": 10,
            "owner": 1
          },
          {
            "col": 8,
            "row": 6,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET"
            ]
          },
          {
            "col": 8,
            "row": 13,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON"
            ]
          },
          {
            "col": 27,
            "row": 2,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON"
            ]
          },
          {
            "col": 27,
            "row": 17,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON"
            ]
          },
          {
            "col": 19,
            "row": 3,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "LENET"
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
            "y": 9
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 4,
            "y": 9
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 5,
            "y": 9
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 24,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 23,
            "y": 9
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 24,
            "y": 9
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 25,
            "y": 9
          }
        ]
      },
      {
        "name": "MARE TRANQUILLITATIS",
        "pack": "AI-made: Arsenal",
        "campaignId": "arsenal",
        "mission": 13,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/arsenal/13-mare-tranquillitatis.json",
        "description": "Both sides land with infantry only; your landing parties are under strength, and Xenon lands nearer the middle. The factories hold the tanks, and every tank you field is one the enemy does not.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "factory reserves",
          "half-turn symmetry"
        ],
        "design": {
          "theme": "arsenal",
          "symmetry": "half"
        },
        "grid": [
          "................................",
          "................................",
          "................................",
          ".........hh.....................",
          ".........hh.....................",
          ".........hh......F..............",
          "........F..........F............",
          "................................",
          "...............hh...............",
          "..............hhhh...........B..",
          "..B...........hhhh..............",
          "...............hh...............",
          "................................",
          "............F..........F........",
          "..............F......hh.........",
          ".....................hh.........",
          ".....................hh.........",
          "................................",
          "................................",
          "................................"
        ],
        "buildings": [
          {
            "col": 2,
            "row": 10,
            "owner": 0
          },
          {
            "col": 29,
            "row": 9,
            "owner": 1
          },
          {
            "col": 8,
            "row": 6,
            "owner": -1,
            "stored": [
              "BISON",
              "LENET"
            ]
          },
          {
            "col": 23,
            "row": 13,
            "owner": -1,
            "stored": [
              "BISON",
              "LENET"
            ]
          },
          {
            "col": 12,
            "row": 13,
            "owner": -1,
            "stored": [
              "BISON",
              "BISON",
              "LENET"
            ]
          },
          {
            "col": 19,
            "row": 6,
            "owner": -1,
            "stored": [
              "BISON",
              "BISON",
              "LENET"
            ]
          },
          {
            "col": 17,
            "row": 5,
            "owner": -1,
            "stored": [
              "LENET",
              "HADRIAN"
            ]
          },
          {
            "col": 14,
            "row": 14,
            "owner": -1,
            "stored": [
              "LENET",
              "HADRIAN"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 4,
            "y": 10,
            "str": 6
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 3,
            "y": 9,
            "str": 6
          },
          {
            "t": "KILROY",
            "o": 0,
            "x": 4,
            "y": 9,
            "str": 6
          },
          {
            "t": "PANTHER",
            "o": 0,
            "x": 5,
            "y": 9,
            "str": 6
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 25,
            "y": 10
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 25,
            "y": 9
          },
          {
            "t": "KILROY",
            "o": 1,
            "x": 24,
            "y": 10
          },
          {
            "t": "PANTHER",
            "o": 1,
            "x": 26,
            "y": 10
          }
        ]
      },
      {
        "name": "MARE INSULARUM",
        "pack": "AI-made: Arsenal",
        "campaignId": "arsenal",
        "mission": 14,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/arsenal/14-mare-insularum.json",
        "description": "Islands of firm ground stand in a sea of valleys, and the factories on them can be reached on foot, slowly, or by Pelican. Each side has one Pelican, and a Hawkeye to shoot the other's down.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "factory reserves",
          "half-turn symmetry"
        ],
        "design": {
          "theme": "arsenal",
          "symmetry": "half"
        },
        "grid": [
          "..................................",
          "..................................",
          "..................................",
          "...........vv.....................",
          "..........vvvvv.vv................",
          ".........v....vvvvv...............",
          ".........v..F.v....v..............",
          ".........v....v.F..v..............",
          ".........vv..vv....v..............",
          "..........vvvvvv..vv..............",
          "...............vvvv............B..",
          "..B............vvvv...............",
          "..............vv..vvvvvv..........",
          "..............v....vv..vv.........",
          "..............v..F.v....v.........",
          "..............v....v.F..v.........",
          "...............vvvvv....v.........",
          "................vv.vvvvv..........",
          ".....................vv...........",
          "..................................",
          "..................................",
          ".................................."
        ],
        "buildings": [
          {
            "col": 2,
            "row": 11,
            "owner": 0
          },
          {
            "col": 31,
            "row": 10,
            "owner": 1
          },
          {
            "col": 12,
            "row": 6,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET"
            ]
          },
          {
            "col": 21,
            "row": 15,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET"
            ]
          },
          {
            "col": 17,
            "row": 14,
            "owner": -1,
            "stored": [
              "BISON",
              "BISON",
              "LENET"
            ]
          },
          {
            "col": 16,
            "row": 7,
            "owner": -1,
            "stored": [
              "BISON",
              "BISON",
              "LENET"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 11
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 10
          },
          {
            "t": "KILROY",
            "o": 0,
            "x": 4,
            "y": 11
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 6,
            "y": 11
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 4,
            "y": 12
          },
          {
            "t": "HAWKEYE",
            "o": 0,
            "x": 5,
            "y": 12
          },
          {
            "t": "PELICAN",
            "o": 0,
            "x": 3,
            "y": 7
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
            "x": 28,
            "y": 11
          },
          {
            "t": "KILROY",
            "o": 1,
            "x": 29,
            "y": 10
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 27,
            "y": 10
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 29,
            "y": 9
          },
          {
            "t": "HAWKEYE",
            "o": 1,
            "x": 28,
            "y": 9
          },
          {
            "t": "PELICAN",
            "o": 1,
            "x": 30,
            "y": 14
          }
        ]
      },
      {
        "name": "LACUS MORTIS",
        "pack": "AI-made: Arsenal",
        "campaignId": "arsenal",
        "mission": 15,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/arsenal/15-lacus-mortis.json",
        "description": "Each camp owns a deep reserve of eight units, released from its factory a few at a time. The neutral factories between them decide who runs out first.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "factory reserves",
          "half-turn symmetry"
        ],
        "design": {
          "theme": "arsenal",
          "symmetry": "half"
        },
        "grid": [
          "....................................",
          "....................................",
          "....................................",
          "....................................",
          "....................................",
          "..............F.....................",
          "....F...............................",
          "....................................",
          ".................hh.................",
          "................hhhh................",
          "................h----------------B..",
          "..B----------------h................",
          "................hhhh................",
          ".................hh.................",
          "....................................",
          "...............................F....",
          ".....................F..............",
          "....................................",
          "....................................",
          "....................................",
          "....................................",
          "...................................."
        ],
        "buildings": [
          {
            "col": 2,
            "row": 11,
            "owner": 0
          },
          {
            "col": 33,
            "row": 10,
            "owner": 1
          },
          {
            "col": 4,
            "row": 6,
            "owner": 0,
            "stored": [
              "CHARLIE",
              "BISON",
              "BISON",
              "LENET",
              "LENET",
              "HADRIAN",
              "POLAR",
              "TITAN"
            ]
          },
          {
            "col": 31,
            "row": 15,
            "owner": 1,
            "stored": [
              "CHARLIE",
              "BISON",
              "BISON",
              "LENET",
              "LENET",
              "HADRIAN",
              "POLAR",
              "TITAN"
            ]
          },
          {
            "col": 14,
            "row": 5,
            "owner": -1,
            "stored": [
              "CHARLIE",
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
              "LENET"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 6,
            "y": 11
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 10
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 6,
            "y": 10
          },
          {
            "t": "LENET",
            "o": 0,
            "x": 7,
            "y": 10
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
            "y": 11
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 29,
            "y": 11
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 28,
            "y": 11
          }
        ]
      },
      {
        "name": "MARE NECTARIS",
        "pack": "AI-made: Arsenal",
        "campaignId": "arsenal",
        "mission": 16,
        "author": "AI-made by Claude Opus 5.5",
        "source": "levels/arsenal/16-mare-nectaris.json",
        "description": "The Sea of Nectar: the final battle, with factories of every kind across a wide field. Aircraft, armour and artillery are all waiting to be claimed.",
        "special": "Capture the enemy camp or eliminate its eligible forces. Each battle starts with its own authored forces; units do not carry between missions.",
        "tags": [
          "factory reserves",
          "half-turn symmetry"
        ],
        "design": {
          "theme": "arsenal",
          "symmetry": "half"
        },
        "grid": [
          "........................v...............",
          "........................v...............",
          "........................v...............",
          "...........MMM..........v...............",
          ".........MM...MM........v...............",
          ".......................Fv...............",
          "............F...........v......F........",
          ".........M.....M........v...............",
          "..........MM.MM...F.....v...............",
          "............M...........v...............",
          "..................hhhh..................",
          ".................hhhhhh.................",
          ".................hh------------------B..",
          "..B------------------hh.................",
          ".................hhhhhh.................",
          "..................hhhh..................",
          "...............v...........M............",
          "...............v.....F...MM.MM..........",
          "...............v........M.....M.........",
          "........F......v...........F............",
          "...............vF.......................",
          "...............v........MM...MM.........",
          "...............v..........MMM...........",
          "...............v........................",
          "...............v........................",
          "...............v........................"
        ],
        "buildings": [
          {
            "col": 2,
            "row": 13,
            "owner": 0
          },
          {
            "col": 37,
            "row": 12,
            "owner": 1
          },
          {
            "col": 12,
            "row": 6,
            "owner": -1,
            "stored": [
              "EAGLE",
              "HUNTER",
              "PELICAN"
            ]
          },
          {
            "col": 27,
            "row": 19,
            "owner": -1,
            "stored": [
              "EAGLE",
              "HUNTER",
              "PELICAN"
            ]
          },
          {
            "col": 8,
            "row": 19,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET"
            ]
          },
          {
            "col": 31,
            "row": 6,
            "owner": -1,
            "stored": [
              "CHARLIE",
              "BISON",
              "LENET"
            ]
          },
          {
            "col": 18,
            "row": 8,
            "owner": -1,
            "stored": [
              "MULE",
              "ATLAS",
              "HADRIAN"
            ]
          },
          {
            "col": 21,
            "row": 17,
            "owner": -1,
            "stored": [
              "MULE",
              "ATLAS",
              "HADRIAN"
            ]
          },
          {
            "col": 16,
            "row": 20,
            "owner": -1,
            "stored": [
              "GRIZZLY",
              "TITAN",
              "POLAR"
            ]
          },
          {
            "col": 23,
            "row": 5,
            "owner": -1,
            "stored": [
              "GRIZZLY",
              "TITAN",
              "POLAR"
            ]
          }
        ],
        "units": [
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 13
          },
          {
            "t": "CHARLIE",
            "o": 0,
            "x": 5,
            "y": 12
          },
          {
            "t": "KILROY",
            "o": 0,
            "x": 4,
            "y": 13
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 6,
            "y": 13
          },
          {
            "t": "BISON",
            "o": 0,
            "x": 4,
            "y": 14
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
            "x": 6,
            "y": 14
          },
          {
            "t": "HADRIAN",
            "o": 0,
            "x": 5,
            "y": 11
          },
          {
            "t": "HAWKEYE",
            "o": 0,
            "x": 3,
            "y": 12
          },
          {
            "t": "EAGLE",
            "o": 0,
            "x": 2,
            "y": 8
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 34,
            "y": 12
          },
          {
            "t": "CHARLIE",
            "o": 1,
            "x": 34,
            "y": 13
          },
          {
            "t": "KILROY",
            "o": 1,
            "x": 35,
            "y": 12
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 33,
            "y": 12
          },
          {
            "t": "BISON",
            "o": 1,
            "x": 35,
            "y": 11
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 34,
            "y": 11
          },
          {
            "t": "LENET",
            "o": 1,
            "x": 33,
            "y": 11
          },
          {
            "t": "HADRIAN",
            "o": 1,
            "x": 34,
            "y": 14
          },
          {
            "t": "HAWKEYE",
            "o": 1,
            "x": 36,
            "y": 13
          },
          {
            "t": "EAGLE",
            "o": 1,
            "x": 37,
            "y": 17
          }
        ]
      }
    ]
  }
];
if(typeof module!=="undefined")module.exports=ENVIRONMENT_CAMPAIGNS;
