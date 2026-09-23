/* Original AI-made levels. Rebuild with node tools/build-ai-fjords.js. */
"use strict";

var AI_MADE_LEVELS = [
  {
    "name": "TWISTED FJORDS",
    "pack": "AI-made",
    "author": "Codex · original level",
    "source": "levels/twisted-fjords.json",
    "description": "Fifteen twisting, three-hex-wide fjords branch through a mountain massif. Five irregular clearings open into small battlefields. Union and Xenon start at opposite corner camps, each with five tanks and three infantry.",
    "special": "Capture the 15 neutral factories: each holds 12 ground units and has one road exit, enclosed by five mountain hexes. Plains, roads and +20 hills fill the fjords. No aircraft. Infantry can cross mountains; keep the factory mouths clear for reinforcements.",
    "tags": [
      "15 fjords",
      "180 reserves",
      "ground only",
      "large"
    ],
    "turnLimit": 180,
    "grid": [
      "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM",
      "MMMhMMMMMMM.....MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM.h...M...MMMMMMM",
      "Mh....MhM...h...M.M.M.MMMMMMM.M.MhM.MMMMMMM.M.M.M....-.---.MMMMMM",
      "M..B...-.-----.-.-.-.-.MMMMMM-h-.-.-hhMMMM.-h-.-.-h--.-hh.-FMMMMM",
      "M.....-.-h.h-.-h-h-h--hMMMMMFM-h-.-.-.MMMM.--.-h-.--.h.MMMMMMMMMM",
      "MM...M.M.MM.--hMhM.h-h.MMMMMMM.MhM..-.MMMMhh-..M.M..-.MMMMMMMMMMM",
      "MMMMMMMMMMMMh-.MMM.--.MMMMMMMMMMMMMh-.MMMMM.-.MMMMM.-.MMMMMMMMMMM",
      "MMMMMMMMMMMM.-.MMM.-.MMMMMMMMMMMMMM.-.MMMMM.-.MMMMM.--hMMMMMMMMMM",
      "MMMMMMMMMMMhh-hMMM.-.MMMMMMMMMMMMMM.-hMMMMM.--.MMMMM.-.MMMMMMMMMM",
      "MMMMMMMMMMMh-..MMM.-.MMMMMMMMMMMMMM.-hMMMMMMh-.MMMMM.-hMMMMMMMMMM",
      "MMMMMMMMMMM.-.MMMMh-.MMMMMMMM.MMM...-.M.M.M.h-.MMMMM.-hMMMMhh.MMM",
      "MMMMMMMMMMM.-.MMMM.-hMMMMMMM.-...h..--.-.-.--..MMMMMh-..M..--hMMM",
      "MMMMMFMMMMM.-hMMMM.-.MMMMMMMh-----.--h-.-h-.-.MMMMMM.-h-.--.-.MMM",
      "MMMMM-MMMM.--hMMMM.-hhMMMMMMh-....-h.h.M.Mhh-.MMMMMM.--.-..--.MMM",
      "MMMMh-.hMM.-.MMMMM.h-.MMMMMM.-hMMM.M.MMMMMM.--.MMMMMh..MhMh-.MMMM",
      "MMMMh.-.MMh-.MMMMMM.-hMMMMMM.-.MMMMMMMMMMMMMh-hMMMMMMMMMMM.-.MMMM",
      "MMMMMh-.MMh-.MMMMMM.--hMMMMM.-hMMMMMMMMMMMMM.-.MMMMMMMMMMM.-hMMMM",
      "MMMMM.-.MMh-hhMMMMMM.-hMMMMM.-.MMMMMMMMMMMMh.-hMMMMMMMMMMM.-.MMMM",
      "MMMMM.-.MMhh-.MMMMMh.-.MMMM..-hMMMMMMMMMMMMh-hh.M.h...MMMM.-..MMM",
      "MMMM.--.M...-h.MMMM.-..MMMM.-..MMMMMMMMMMMM.--.-.----.MMMM..-hMMM",
      "MMMM.-....h--..MMMM.-hMMMh.--.MMMMMMFMMMMMM.-h-.-...-hMMMMMM-MMMM",
      "MMMM.------h-..MMMM.--..h--.--.MMMM.--.MMMMM.M.M.M.--.MMMMMMFMMMM",
      "MMMM..h.h..h--hMMMM.-h---.hM.-.MMMMM.-hMMMMMMMMMMM.-.MMMMMMMMMMMM",
      "MMMMMMMMMMMM.-.MMMM.-.h.hMMMh-.MMMMM.-..MMMMMMMMMMh-hMMMMMMMMMMMM",
      "MMMMMMMMMMMMh-hMMMM.-.MMMMMh.-hMMMMMhh-.MMMMMMMMMM.-.MMMMMMMMMMMM",
      "MMMMMMMMMMMM.-.MMMM.-.MMMMMh-.hMMMMMMh-hMMMMMMMMMMh-.MMMMMMMMMMMM",
      "MMMMMMMMMMMM.-hMMMM.-.MMMMM.-.MMMMMMh--.MMMMMMMMMM.-.MMMMMMMMMMMM",
      "MMMMMMMhMMM.h-.MMMMM-MMMMMh--hMMMMMh.-.MMMMMMMMMMM.-.MMMMMMMMMMMM",
      "MMMMF-.-h..---.MMMMMFMMMMM.-hh.h...-.-.MMMMFMMMMMMh-..M...MFMMMMM",
      "MMMMM.-.---..-.MMMMMMMMMMMh--------h--.MMMM-MMMMMM.-.-.----MMMMMM",
      "MMMMMM.M...Mh-.MMMMMMMMMMM.-h....hh.-..MM.h-.MMMMMh.-.-hh..MMMMMM",
      "MMMMMMMMMMMM.-.MMMMMMMMMMM.-.MMMMM.--.MMM.-..MMMMMMM.M.MMMMMMMMMM",
      "MMMMMMMMMMM..-hMMMMMMMMMMMh-.MMMMM.-.MMMM.-.MMMMMMMMMMMMMMMMMMMMM",
      "MMMMMMMMMMM.-.hMMMMMMMMMMM.-.MMMMM.-.MMMM.-hMMMMMMMMMMMMMMMMMMMMM",
      "MMMMMMMMMMM.-.MhMMMMMMMMMM.-.MMMMM.-.MMMMh-.MMMMMMM...M.MMMMMMMMM",
      "MMMMMMMMMMM.--h-..MMMMMMMM.-.MMMMM.-.MMMM.--.MM.M..---.-.hMMMMMMM",
      "MMMFMMMMMMMh-h-.--MFMMMMMM.-..MMMM.-....Mh.-.h.-.--.-h-.--MFMMMMM",
      "MMM-M.MMMM.--.hMhh-MMMMMMMhh-.MMMM..----.-.----.-..--..M..-MMMMMM",
      "MM..-.MMMMh-.MMMMMhMMMMMMMMh-.MMMMMM...h-.--...M.M.-.MMMMMhMMMMMM",
      "MMM.-.MMMM.-hMMMMMMMMMMMMMM.-hMMMMMMMMMM.M..-h.MMM.-.MMMMMMMMMMMM",
      "MMM.-.MMMMh-.MMMMMMMMMMMMMM.--.MMMMMMMMMMMM.--hMMM.-.MMMMMMMMMMMM",
      "MMMh-.MMMMh-.MMMMMMMMMMMMMMM.-.MM.M.MMMMMMMM.-.MMM.-h.MMMMMMMMMMM",
      "MMM.-.MhMh.-.hMhM.MMMMMMMMMM.-..h-.-MMMMMMM..-.MMMh.-hMMMMMMMMMMM",
      "MMM.--.-h-.-.-h-.-..MMMMMMMM.-h--.-MFMMMMMMM-M.MMMM.-.MMMMMMM.MMM",
      "MMM.-h-h-.-.-.-.-.--MMMMMMMMh-h-.MhMMMMMMMMMFMMMMMM.-...MhM.....M",
      "MMMM.MhMhM.M.M.M.M.MFMMMMMMMh--..MMMMMMMMMMMMMMMMMMh----.-h..BhhM",
      "MMMMMMMMMMMMMMMMMMMMMMMMMMMMh..MMMMMMMMMMMMMMMMMMMMM...h-h-h-.h.M",
      "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMhM.M...MM",
      "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM"
    ],
    "buildings": [
      {
        "col": 3,
        "row": 3,
        "owner": 0
      },
      {
        "col": 61,
        "row": 45,
        "owner": 1
      },
      {
        "col": 28,
        "row": 4,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "BISON",
          "HADRIAN",
          "MULE",
          "KILROY",
          "POLAR",
          "OCTOPUS",
          "RABBIT",
          "PANTHER",
          "SLAGGER",
          "SEEKER",
          "GIANT"
        ]
      },
      {
        "col": 59,
        "row": 3,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "LENET",
          "HADRIAN",
          "MULE",
          "KILROY",
          "GRIZZLY",
          "OCTOPUS",
          "LYNX",
          "PANTHER",
          "TITAN",
          "SEEKER",
          "BISON"
        ]
      },
      {
        "col": 5,
        "row": 12,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "POLAR",
          "HADRIAN",
          "MULE",
          "KILROY",
          "SLAGGER",
          "OCTOPUS",
          "RABBIT",
          "PANTHER",
          "GIANT",
          "SEEKER",
          "LENET"
        ]
      },
      {
        "col": 36,
        "row": 20,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "GRIZZLY",
          "HADRIAN",
          "MULE",
          "KILROY",
          "TITAN",
          "OCTOPUS",
          "LYNX",
          "PANTHER",
          "BISON",
          "SEEKER",
          "POLAR"
        ]
      },
      {
        "col": 60,
        "row": 21,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "SLAGGER",
          "HADRIAN",
          "MULE",
          "KILROY",
          "GIANT",
          "OCTOPUS",
          "RABBIT",
          "PANTHER",
          "LENET",
          "SEEKER",
          "GRIZZLY"
        ]
      },
      {
        "col": 4,
        "row": 28,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "TITAN",
          "HADRIAN",
          "MULE",
          "KILROY",
          "BISON",
          "OCTOPUS",
          "LYNX",
          "PANTHER",
          "POLAR",
          "SEEKER",
          "SLAGGER"
        ]
      },
      {
        "col": 20,
        "row": 28,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "GIANT",
          "HADRIAN",
          "MULE",
          "KILROY",
          "LENET",
          "OCTOPUS",
          "RABBIT",
          "PANTHER",
          "GRIZZLY",
          "SEEKER",
          "TITAN"
        ]
      },
      {
        "col": 43,
        "row": 28,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "BISON",
          "HADRIAN",
          "MULE",
          "KILROY",
          "POLAR",
          "OCTOPUS",
          "LYNX",
          "PANTHER",
          "SLAGGER",
          "SEEKER",
          "GIANT"
        ]
      },
      {
        "col": 59,
        "row": 28,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "LENET",
          "HADRIAN",
          "MULE",
          "KILROY",
          "GRIZZLY",
          "OCTOPUS",
          "RABBIT",
          "PANTHER",
          "TITAN",
          "SEEKER",
          "BISON"
        ]
      },
      {
        "col": 3,
        "row": 36,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "POLAR",
          "HADRIAN",
          "MULE",
          "KILROY",
          "SLAGGER",
          "OCTOPUS",
          "LYNX",
          "PANTHER",
          "GIANT",
          "SEEKER",
          "LENET"
        ]
      },
      {
        "col": 19,
        "row": 36,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "GRIZZLY",
          "HADRIAN",
          "MULE",
          "KILROY",
          "TITAN",
          "OCTOPUS",
          "RABBIT",
          "PANTHER",
          "BISON",
          "SEEKER",
          "POLAR"
        ]
      },
      {
        "col": 59,
        "row": 36,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "SLAGGER",
          "HADRIAN",
          "MULE",
          "KILROY",
          "GIANT",
          "OCTOPUS",
          "LYNX",
          "PANTHER",
          "LENET",
          "SEEKER",
          "GRIZZLY"
        ]
      },
      {
        "col": 20,
        "row": 45,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "TITAN",
          "HADRIAN",
          "MULE",
          "KILROY",
          "BISON",
          "OCTOPUS",
          "RABBIT",
          "PANTHER",
          "POLAR",
          "SEEKER",
          "SLAGGER"
        ]
      },
      {
        "col": 36,
        "row": 43,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "GIANT",
          "HADRIAN",
          "MULE",
          "KILROY",
          "LENET",
          "OCTOPUS",
          "LYNX",
          "PANTHER",
          "GRIZZLY",
          "SEEKER",
          "TITAN"
        ]
      },
      {
        "col": 44,
        "row": 44,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "BISON",
          "HADRIAN",
          "MULE",
          "KILROY",
          "POLAR",
          "OCTOPUS",
          "RABBIT",
          "PANTHER",
          "SLAGGER",
          "SEEKER",
          "GIANT"
        ]
      }
    ],
    "units": [
      {
        "t": "BISON",
        "o": 0,
        "x": 5,
        "y": 4
      },
      {
        "t": "LENET",
        "o": 0,
        "x": 3,
        "y": 5
      },
      {
        "t": "POLAR",
        "o": 0,
        "x": 4,
        "y": 5
      },
      {
        "t": "GRIZZLY",
        "o": 0,
        "x": 5,
        "y": 3
      },
      {
        "t": "SLAGGER",
        "o": 0,
        "x": 3,
        "y": 4
      },
      {
        "t": "CHARLIE",
        "o": 0,
        "x": 4,
        "y": 4
      },
      {
        "t": "CHARLIE",
        "o": 0,
        "x": 2,
        "y": 5
      },
      {
        "t": "KILROY",
        "o": 0,
        "x": 5,
        "y": 2
      },
      {
        "t": "BISON",
        "o": 1,
        "x": 61,
        "y": 43
      },
      {
        "t": "LENET",
        "o": 1,
        "x": 59,
        "y": 44
      },
      {
        "t": "POLAR",
        "o": 1,
        "x": 60,
        "y": 44
      },
      {
        "t": "GRIZZLY",
        "o": 1,
        "x": 61,
        "y": 44
      },
      {
        "t": "SLAGGER",
        "o": 1,
        "x": 62,
        "y": 44
      },
      {
        "t": "CHARLIE",
        "o": 1,
        "x": 59,
        "y": 45
      },
      {
        "t": "CHARLIE",
        "o": 1,
        "x": 60,
        "y": 45
      },
      {
        "t": "KILROY",
        "o": 1,
        "x": 63,
        "y": 44
      }
    ]
  },
  {
    "name": "SHATTERED FJORDS",
    "pack": "AI-made",
    "author": "Codex · original level",
    "source": "levels/shattered-fjords.json",
    "description": "A fresh mountain labyrinth: angular fjords pinch to two hexes, open into small battlefields and reconnect through four cross-routes. Alternating factory approaches flare into bowls or taper into narrow necks. Opposite corner camps each begin with five tanks and three infantry.",
    "special": "Fifteen neutral factories hold 12 ground units apiece, each behind a single road exit and five mountain walls. Plains, roads, +20 hills and +30 wasteland vary the fighting ground. No aircraft. Vehicles can take alternate routes; infantry can cross the mountains.",
    "tags": [
      "15 fjords",
      "linked branches",
      "2-hex narrows",
      "ground only"
    ],
    "turnLimit": 180,
    "grid": [
      "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM",
      "MMM.MMM.MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM",
      "Mw.w..h-..M.MMMMMMMMMMMMMMMMMMMMMMMMMMMMMwMMMMMMMMMMMMMMMMMMMMMMM",
      "M.hB-.-w--.h.wMMMhM.w.MMMMMMMMMMMMMMMM.w.-whMMM.MwMhMMMMMMMwMMMMM",
      "Mhw....M.h--.....-.--.MMMMMMMMMMMMMMMF---.-.whh-h-.-h.h..h.-.hMMM",
      "MM...MMMMh.h-----w-w-hMMMMMFMMMMMMMMMMMMh.-----w-h-w-------h-wMMM",
      "MMMMMMMMMM.h-w.w.Mh.-.MMMMM-M.MMMMMMMMMMw.w.--.MhM.Mw...ww..--hMM",
      "MMMMMMMMMMM.-.MMMMMw-hMMMMh-w..MMMMMMMMMh....-wMMMMMMMMMMMMMh-whM",
      "MMMMMMMMMMM.-.MMMMM.-.MMMM.w-h.MMMMMMMMMMMhMMM-.MMMMMMMMMMMMh.-hM",
      "MMMMMMMMMMMw-hMMMMMh-.MMMMh.-hhMMMMMMMMhMhMMM--hMMMMMMMMMMMMMh-.M",
      "MMMMMMMMMM.--.MMMMh--hMMMMMh-wMMMMMMMhw-w-wh.-wMMMMMMMMMMMMMh--hM",
      "MMMMMMMMMMh-.MMMMMh-whMMMMh--hMMMMMMw--.-w----.MMMMMMMM.hwMhh-hMM",
      "MMMMMMMMMM.-hMMMMM.---.hMh.-hhhwhhwhh-.MhM.hh.hMMMMMMMh..-.-h-.MM",
      "MMMFMMMMMMMFMMMMMM.-.h--h-.----------.hMMMMMMMMMMMMMMF---h-.-hwMM",
      "MMM-MwMMMMMMMMMMMMw.-.MM-.--...w.h..--MMMMMMMMMMMMMMMMM.w.hM.MMMM",
      "MMh.-..MMMMMMMMMMMM.-hMMMMh-wh.MMMMMwM-.MMMMMMMMMMMMMMMMhMMMMMMMM",
      "MM..-hwMMMMMMMMMMMM.-.MMMMhw-wMMMMMMMM-wMMMMMMMMMMMMMMMMMMMMMMMMM",
      "MMw.-h.MMMMMMMMMMMMw-hMMMMMw-.MMMMMMM--hMMMMMMMMMMMMMMMMMMMMMMMMM",
      "MMM.-.MMMMMMMMMMMMMh-.MMMMh.-hwMMMMMh-.MMMMMMMMMMMMMMMMMMMMMMMMMM",
      "MMM.--w.MMMMMMMMMMMh-wMMMMhh--hMMMMMh-hMMMMMMFMMMMMMMh.hMMMMMMMMM",
      "MMMMh-h-hwhMMMMMMMMh-wMMMMh.h-.MMMMM.-hMMMMMM-MMMMMFM...hh.hhwMMM",
      "MMMM.--h----FMMMMMM.-.MMMMMMMFMMMMMMhh-wMMMMh.-wMMMM----------wMM",
      "MMMMh.-h.h..MMMMMMM.--hwMMMMMMMMMMMMMM--MMMMMM-.MMMM.whh.MMM.-.MM",
      "MMMMMw-.MMMMMMMMMMMM.h-hMMMMMMMMMMMMMMM-.MMMM--.MMMMMMhMMMMM.-.MM",
      "MMMMM.--wMMMMMMMMMMMMh--hMMMMMMMMMMMMMM-.MMMM-hMMMMMMMMMMMMM-.hMM",
      "MMMMM..-.MMMMMMMMMMMM.w-hMMMMMMMMMMMMM-..MM..-hMMMMMMMMw.hMM-wMMM",
      "MMMMw--hhMMMMMM.M.Mh..-hwMMMMMMMMMMMM.-wMh..-hwMMMMMM..---.h-.MMM",
      "MMM.w-hwh.w...h-.-w-.--.hwMMMMMMMMMhwh-.h----.MMMMMMM--hwh---hMMM",
      "MMM.-----------M-M-h------...hhh.hh.h----Mhh-.MMMMMMFM.MMw--hMMMM",
      "MMMM.w.MMMw-.MMMMMMM.-....-------------.MMM.-.MMMMMMMMMMMM.-.hMMM",
      "MMMMMMMMMMh-.MMMMMMMM-hMMM......w..w.-w.MMM.-hMMMMMMMMMMMMhh-.MMM",
      "MMMMMMMMMMM-hMMMMMMMM-wMMMMMMMMMMMMMhw-hMMM.-wMMMMMMMMMMMMM.--.MM",
      "MMMMMMMMMMM-.MMMMMMMM-.MMMMMMMMMMMMMMh--.MMw-.MMMMMMMMMMMMMM.-wMM",
      "MMMMMMMMMMM-hMMMMMMMM-.MMMMMMMMMMMMMM.h-wM.--.MMMMMMMMMMMMMM.-.MM",
      "MMMMMMMMMMM-.MMMMMM.h-hMMMMMMMMMMMMMMh-..hw-.wMwMhM.MMMMMMMM.-.MM",
      "MMMFMMMMMMM-.MMh.wh-w-.MMMMMFMMMMMMMh---.-h-.-w-.-.-hhMMMMMMh-.MM",
      "MMM-MhMMMM.-whh----h--hMMMM.-wMMMMMM.--h-h---h-.-.-.--.hMMMhh-.MM",
      "MMhh-hhMMM.----..hh--h.MMMMM-.MMMMMMw-wMhM.-..hMhM.--.--.h.---hMM",
      "MMh.-h.MMh.-h.hMMMM-.MMMMMMM-.MMMMMMh-.MMMwh-.MMMMM-.M..---hw-.MM",
      "MM.h-h.MMh-w.MMMMM-.hMMMMMMM-hMMMMMM.-.MMMM.-wMMMMM-..MMw...-..MM",
      "MMMh--wMM.-wMMMMMM-wMMMMMMMM-hMMMMMMw-.MMMM.-.MMMMh-hwhMMMMw-hMMM",
      "MMMM.-hh.--.MMMMMM-.MMMMMMMM-.MMMMMh.-wwMMMw-.MMMMh.-.hMMMM.-.MMM",
      "MMM..-.---.hMMMMMM--MMMMMMMM--MMMMM..-.hMMMM-MMMMM.h--.MMMM.-hMMM",
      "MMM.---..h-w..hh..M-hMMMMMM.h-.MMMMww-..MMMMFMMMMMMMMFMMMMMh-.wMM",
      "MMM.-hhMM.--------.-h.Mhh.h-.-hMMMMMw-.MMMMMMMMMMMMMMMMMMMM.....M",
      "MMMMwMMMMMw..hh.w.--w-h----.-whMMMMMMFMMMMMMMMMMMMMMMMMMMMM..BhwM",
      "MMMMMMMMMMMMMMMMMM..-h-wh.wM.MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMh.w..M",
      "MMMMMMMMMMMMMMMMMMMM.M.MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMh.hMM",
      "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM"
    ],
    "buildings": [
      {
        "col": 3,
        "row": 3,
        "owner": 0
      },
      {
        "col": 61,
        "row": 45,
        "owner": 1
      },
      {
        "col": 27,
        "row": 5,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "BISON",
          "HADRIAN",
          "MULE",
          "KILROY",
          "POLAR",
          "OCTOPUS",
          "RABBIT",
          "PANTHER",
          "SLAGGER",
          "SEEKER",
          "GIANT"
        ]
      },
      {
        "col": 37,
        "row": 4,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "LENET",
          "HADRIAN",
          "MULE",
          "KILROY",
          "GRIZZLY",
          "OCTOPUS",
          "LYNX",
          "PANTHER",
          "TITAN",
          "SEEKER",
          "BISON"
        ]
      },
      {
        "col": 3,
        "row": 13,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "POLAR",
          "HADRIAN",
          "MULE",
          "KILROY",
          "SLAGGER",
          "OCTOPUS",
          "RABBIT",
          "PANTHER",
          "GIANT",
          "SEEKER",
          "LENET"
        ]
      },
      {
        "col": 11,
        "row": 13,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "GRIZZLY",
          "HADRIAN",
          "MULE",
          "KILROY",
          "TITAN",
          "OCTOPUS",
          "LYNX",
          "PANTHER",
          "BISON",
          "SEEKER",
          "POLAR"
        ]
      },
      {
        "col": 53,
        "row": 13,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "SLAGGER",
          "HADRIAN",
          "MULE",
          "KILROY",
          "GIANT",
          "OCTOPUS",
          "RABBIT",
          "PANTHER",
          "LENET",
          "SEEKER",
          "GRIZZLY"
        ]
      },
      {
        "col": 12,
        "row": 21,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "TITAN",
          "HADRIAN",
          "MULE",
          "KILROY",
          "BISON",
          "OCTOPUS",
          "LYNX",
          "PANTHER",
          "POLAR",
          "SEEKER",
          "SLAGGER"
        ]
      },
      {
        "col": 29,
        "row": 21,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "GIANT",
          "HADRIAN",
          "MULE",
          "KILROY",
          "LENET",
          "OCTOPUS",
          "RABBIT",
          "PANTHER",
          "GRIZZLY",
          "SEEKER",
          "TITAN"
        ]
      },
      {
        "col": 45,
        "row": 19,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "BISON",
          "HADRIAN",
          "MULE",
          "KILROY",
          "POLAR",
          "OCTOPUS",
          "LYNX",
          "PANTHER",
          "SLAGGER",
          "SEEKER",
          "GIANT"
        ]
      },
      {
        "col": 51,
        "row": 20,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "LENET",
          "HADRIAN",
          "MULE",
          "KILROY",
          "GRIZZLY",
          "OCTOPUS",
          "RABBIT",
          "PANTHER",
          "TITAN",
          "SEEKER",
          "BISON"
        ]
      },
      {
        "col": 52,
        "row": 28,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "POLAR",
          "HADRIAN",
          "MULE",
          "KILROY",
          "SLAGGER",
          "OCTOPUS",
          "LYNX",
          "PANTHER",
          "GIANT",
          "SEEKER",
          "LENET"
        ]
      },
      {
        "col": 3,
        "row": 35,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "GRIZZLY",
          "HADRIAN",
          "MULE",
          "KILROY",
          "TITAN",
          "OCTOPUS",
          "RABBIT",
          "PANTHER",
          "BISON",
          "SEEKER",
          "POLAR"
        ]
      },
      {
        "col": 28,
        "row": 35,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "SLAGGER",
          "HADRIAN",
          "MULE",
          "KILROY",
          "GIANT",
          "OCTOPUS",
          "LYNX",
          "PANTHER",
          "LENET",
          "SEEKER",
          "GRIZZLY"
        ]
      },
      {
        "col": 37,
        "row": 45,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "TITAN",
          "HADRIAN",
          "MULE",
          "KILROY",
          "BISON",
          "OCTOPUS",
          "RABBIT",
          "PANTHER",
          "POLAR",
          "SEEKER",
          "SLAGGER"
        ]
      },
      {
        "col": 44,
        "row": 43,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "GIANT",
          "HADRIAN",
          "MULE",
          "KILROY",
          "LENET",
          "OCTOPUS",
          "LYNX",
          "PANTHER",
          "GRIZZLY",
          "SEEKER",
          "TITAN"
        ]
      },
      {
        "col": 53,
        "row": 43,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "BISON",
          "HADRIAN",
          "MULE",
          "KILROY",
          "POLAR",
          "OCTOPUS",
          "RABBIT",
          "PANTHER",
          "SLAGGER",
          "SEEKER",
          "GIANT"
        ]
      }
    ],
    "units": [
      {
        "t": "BISON",
        "o": 0,
        "x": 5,
        "y": 4
      },
      {
        "t": "LENET",
        "o": 0,
        "x": 3,
        "y": 5
      },
      {
        "t": "POLAR",
        "o": 0,
        "x": 4,
        "y": 5
      },
      {
        "t": "GRIZZLY",
        "o": 0,
        "x": 5,
        "y": 3
      },
      {
        "t": "SLAGGER",
        "o": 0,
        "x": 3,
        "y": 4
      },
      {
        "t": "CHARLIE",
        "o": 0,
        "x": 4,
        "y": 4
      },
      {
        "t": "CHARLIE",
        "o": 0,
        "x": 2,
        "y": 5
      },
      {
        "t": "KILROY",
        "o": 0,
        "x": 5,
        "y": 2
      },
      {
        "t": "BISON",
        "o": 1,
        "x": 61,
        "y": 43
      },
      {
        "t": "LENET",
        "o": 1,
        "x": 59,
        "y": 44
      },
      {
        "t": "POLAR",
        "o": 1,
        "x": 60,
        "y": 44
      },
      {
        "t": "GRIZZLY",
        "o": 1,
        "x": 61,
        "y": 44
      },
      {
        "t": "SLAGGER",
        "o": 1,
        "x": 62,
        "y": 44
      },
      {
        "t": "CHARLIE",
        "o": 1,
        "x": 59,
        "y": 45
      },
      {
        "t": "CHARLIE",
        "o": 1,
        "x": 60,
        "y": 45
      },
      {
        "t": "KILROY",
        "o": 1,
        "x": 63,
        "y": 44
      }
    ]
  },
  {
    "name": "FRACTURED FJORDS",
    "pack": "AI-made",
    "author": "Codex · original level",
    "source": "levels/fractured-fjords.json",
    "description": "Part 3 compresses the fjord war into a fresh 40×40 mountain maze. Angular two- and three-hex passages reconnect around mountain islands, with five small battlefields and widening or tapering factory approaches. Each distant corner camp starts with five tanks and three infantry.",
    "special": "Fifteen neutral factories hold 12 ground units apiece, each behind a single road exit and five mountain walls. Plains, roads, +20 hills and +30 wasteland vary the fighting ground. No aircraft. Vehicles can take alternate routes; infantry can cross the mountains.",
    "tags": [
      "part 3",
      "40×40",
      "linked branches",
      "ground only"
    ],
    "turnLimit": 180,
    "grid": [
      "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM",
      "MMM.MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM",
      "M...h.MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM",
      "Mw.B..MMMMFMMMMFMMMMMMMMMMMMMMMMMMMFMMMM",
      "Mhw...MMMh-w.hM-MMMMMMMFMwM.MMMMMMM-MMMM",
      "MM...MMMMw--.h..--MMMMMM-..-wMMMMM.-.MMM",
      "MM-hMMMMM.h-wwMMM-hMMMM.----.MMMMM-..MMM",
      "MM--MMMMMMw-.MMMM-.MMMMhhhh-hMMMMM-hMMMM",
      "MMM-.MMMMM.-wh..-h.hMMMMw..-.hMMMM-.MMMM",
      "MMM.-.MMMhw-.----h.h.MMMMM.-.w..M--.MMMM",
      "MM..--.h.-.--.--.-.---FMMM.h--.-.-wMMMMM",
      "MM...----.-.h.h--w-...MMMMwh.--.--.MMMMM",
      "MMwww-.h.MhMMM.-w...hMMMMMww-whMh-.hMMMM",
      "MMM.-..MMMMMMMM-.hMMMMMMMMMh-.MMh.-wMMMM",
      "MMMh-.MMMMMMMMMw-h.hw.MMMMh--.MMMh-.MMMM",
      "MM.--.MMMMMMMMM.------.hMMh-.MMMM.--hMMM",
      "MMMFMMMMMMMMMMM.-h.w.w--.ww-.h..whh-.MMM",
      "MMMMMMMMMMMFMMM.-hMMMMh--.-w-------.hMMM",
      "MMMMMMMMMMM-MMM.-.MMMMh----Mh...hhwMMMMM",
      "MMMMMMMMM..-hhMh-hMMMMh-.MMMMMMMMMMMMMMM",
      "MMMMMMMMM..-h.Mw-.MMMh.-.MMMMMMMMMMMMMMM",
      "MMMMM.M.M.h-h..---hM.--h.MMMMMMMMMMMMMMM",
      "MMMFM-w-whh-h--.-.-wh--.MMMMMMMMMMMMMMMM",
      "MMMM-.-h-----.hh-.---h-hMMMMMFMMMFMhMMMM",
      "MMMM.MwMhhw-wh.w-hMMMw-hMMM.M-MMMM-.MMMM",
      "MMMMMMMMMM.-hMM.-.MMMh-wMM.h-h.MMM-.MMMM",
      "MMMMMMMhMhh-hMM.-wM..--wMMh.-wh.M.-.MMMM",
      "MMMMMh.hhh-.hMh--.Mh.-hw.wh.--.-.--wMMMM",
      "MMMMM-.----hM..-hhMw.--------.-w-h-.MMMM",
      "MMMMFM-hw.--..----.h--...h.h-..Mhh--.MMM",
      "MMMMMMw.hh-h---.-.----.MMMM.-.MMMMh-h.MM",
      "MMMMMhM.Mh-h--.h-ww..-.MMMMh-.MMMMhh-.MM",
      "MMMMM-h-.h-hw..h--hMM-hMMM.h-hwMMMMw-.MM",
      "MMMMFM-.---.MM.hw-hMM-hMMMw--hhMMMMh-wMM",
      "MMMMMMhM.-.MMMMMMFMM.-hMMMh-hwwMMMM...MM",
      "MMMMMMMM.whMMMMMMMMMMFMMMMMFMMMMMM.....M",
      "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM..BhhM",
      "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMw.hwhM",
      "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM.MMM",
      "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM"
    ],
    "buildings": [
      {
        "col": 3,
        "row": 3,
        "owner": 0
      },
      {
        "col": 36,
        "row": 36,
        "owner": 1
      },
      {
        "col": 10,
        "row": 3,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "BISON",
          "HADRIAN",
          "MULE",
          "KILROY",
          "POLAR",
          "OCTOPUS",
          "RABBIT",
          "PANTHER",
          "SLAGGER",
          "SEEKER",
          "GIANT"
        ]
      },
      {
        "col": 15,
        "row": 3,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "LENET",
          "HADRIAN",
          "MULE",
          "KILROY",
          "GRIZZLY",
          "OCTOPUS",
          "LYNX",
          "PANTHER",
          "TITAN",
          "SEEKER",
          "BISON"
        ]
      },
      {
        "col": 23,
        "row": 4,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "POLAR",
          "HADRIAN",
          "MULE",
          "KILROY",
          "SLAGGER",
          "OCTOPUS",
          "RABBIT",
          "PANTHER",
          "GIANT",
          "SEEKER",
          "LENET"
        ]
      },
      {
        "col": 35,
        "row": 3,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "GRIZZLY",
          "HADRIAN",
          "MULE",
          "KILROY",
          "TITAN",
          "OCTOPUS",
          "LYNX",
          "PANTHER",
          "BISON",
          "SEEKER",
          "POLAR"
        ]
      },
      {
        "col": 22,
        "row": 10,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "SLAGGER",
          "HADRIAN",
          "MULE",
          "KILROY",
          "GIANT",
          "OCTOPUS",
          "RABBIT",
          "PANTHER",
          "LENET",
          "SEEKER",
          "GRIZZLY"
        ]
      },
      {
        "col": 3,
        "row": 16,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "TITAN",
          "HADRIAN",
          "MULE",
          "KILROY",
          "BISON",
          "OCTOPUS",
          "LYNX",
          "PANTHER",
          "POLAR",
          "SEEKER",
          "SLAGGER"
        ]
      },
      {
        "col": 11,
        "row": 17,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "GIANT",
          "HADRIAN",
          "MULE",
          "KILROY",
          "LENET",
          "OCTOPUS",
          "RABBIT",
          "PANTHER",
          "GRIZZLY",
          "SEEKER",
          "TITAN"
        ]
      },
      {
        "col": 3,
        "row": 22,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "BISON",
          "HADRIAN",
          "MULE",
          "KILROY",
          "POLAR",
          "OCTOPUS",
          "LYNX",
          "PANTHER",
          "SLAGGER",
          "SEEKER",
          "GIANT"
        ]
      },
      {
        "col": 29,
        "row": 23,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "LENET",
          "HADRIAN",
          "MULE",
          "KILROY",
          "GRIZZLY",
          "OCTOPUS",
          "RABBIT",
          "PANTHER",
          "TITAN",
          "SEEKER",
          "BISON"
        ]
      },
      {
        "col": 33,
        "row": 23,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "POLAR",
          "HADRIAN",
          "MULE",
          "KILROY",
          "SLAGGER",
          "OCTOPUS",
          "LYNX",
          "PANTHER",
          "GIANT",
          "SEEKER",
          "LENET"
        ]
      },
      {
        "col": 4,
        "row": 29,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "GRIZZLY",
          "HADRIAN",
          "MULE",
          "KILROY",
          "TITAN",
          "OCTOPUS",
          "RABBIT",
          "PANTHER",
          "BISON",
          "SEEKER",
          "POLAR"
        ]
      },
      {
        "col": 4,
        "row": 33,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "SLAGGER",
          "HADRIAN",
          "MULE",
          "KILROY",
          "GIANT",
          "OCTOPUS",
          "LYNX",
          "PANTHER",
          "LENET",
          "SEEKER",
          "GRIZZLY"
        ]
      },
      {
        "col": 17,
        "row": 34,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "TITAN",
          "HADRIAN",
          "MULE",
          "KILROY",
          "BISON",
          "OCTOPUS",
          "RABBIT",
          "PANTHER",
          "POLAR",
          "SEEKER",
          "SLAGGER"
        ]
      },
      {
        "col": 21,
        "row": 35,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "GIANT",
          "HADRIAN",
          "MULE",
          "KILROY",
          "LENET",
          "OCTOPUS",
          "LYNX",
          "PANTHER",
          "GRIZZLY",
          "SEEKER",
          "TITAN"
        ]
      },
      {
        "col": 27,
        "row": 35,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "BISON",
          "HADRIAN",
          "MULE",
          "KILROY",
          "POLAR",
          "OCTOPUS",
          "RABBIT",
          "PANTHER",
          "SLAGGER",
          "SEEKER",
          "GIANT"
        ]
      }
    ],
    "units": [
      {
        "t": "BISON",
        "o": 0,
        "x": 5,
        "y": 4
      },
      {
        "t": "LENET",
        "o": 0,
        "x": 3,
        "y": 5
      },
      {
        "t": "POLAR",
        "o": 0,
        "x": 4,
        "y": 5
      },
      {
        "t": "GRIZZLY",
        "o": 0,
        "x": 5,
        "y": 3
      },
      {
        "t": "SLAGGER",
        "o": 0,
        "x": 3,
        "y": 4
      },
      {
        "t": "CHARLIE",
        "o": 0,
        "x": 4,
        "y": 4
      },
      {
        "t": "CHARLIE",
        "o": 0,
        "x": 2,
        "y": 5
      },
      {
        "t": "KILROY",
        "o": 0,
        "x": 5,
        "y": 2
      },
      {
        "t": "BISON",
        "o": 1,
        "x": 35,
        "y": 34
      },
      {
        "t": "LENET",
        "o": 1,
        "x": 36,
        "y": 34
      },
      {
        "t": "POLAR",
        "o": 1,
        "x": 34,
        "y": 35
      },
      {
        "t": "GRIZZLY",
        "o": 1,
        "x": 37,
        "y": 34
      },
      {
        "t": "SLAGGER",
        "o": 1,
        "x": 35,
        "y": 35
      },
      {
        "t": "CHARLIE",
        "o": 1,
        "x": 36,
        "y": 35
      },
      {
        "t": "CHARLIE",
        "o": 1,
        "x": 34,
        "y": 36
      },
      {
        "t": "KILROY",
        "o": 1,
        "x": 37,
        "y": 35
      }
    ]
  },
  {
    "name": "HONEYCOMB FJORDS",
    "pack": "AI-made",
    "author": "Codex · original level",
    "source": "levels/honeycomb-fjords.json",
    "description": "Part 4 is a dense 28×28 web of angled tunnels and fjords around small mountain pockets. Two-hex narrows, branching passages and three small staging spaces cover the board. Opposite corner camps each start with four tanks and three infantry.",
    "special": "Eight neutral factories hold ten ground units each, with one road mouth and five mountain walls. Every mountain pocket is small; alternate routes run throughout the map. Plains, roads, +20 hills and +30 wasteland; no aircraft.",
    "tags": [
      "part 4",
      "28×28",
      "8 factories",
      "dense tunnels"
    ],
    "turnLimit": 120,
    "grid": [
      ".h..........h.hhh-h.h.hw..hh",
      "wBh.--.hw---h..--M--.h.hwh..",
      "-...MM---MMM---MMMMM--hMMMw.",
      "...MMMw-MMM--w-MMMMM.h--MMMw",
      "-MMMMMh-MMFMMh-MMMMM..MMFMMh",
      "--MMM..-MMMMMh--MMM.w.MMMMMh",
      "h.--h.h---M.w.h.--wwhhh.Mhh.",
      "....--.-w.--...w..-...whhh..",
      "hMMMh--wh...--.MMM--h...h.wh",
      "MMMMh--hhM..h-.MM--.h..Mww..",
      "MMFMM--MMMMM.-MMFMMw.MMMMMh.",
      "MM-MM--MMMMM.-MMMMM..MMMMMh.",
      "hw---h-MMMMM.h--M...wMMMMMh.",
      "..-.h.--MMMw...w--h-hhMMMh.w",
      "....wh-.--hhwh..h.--.w..hhh.",
      "...M..-w-.--.h...M.h--..w...",
      "hMMMMM---MMM--.MMMMM.-hMMM..",
      ".MMMMM-.--MMM--MMMMM.-MMMMM.",
      ".MMMMM-.MMFMM--MMMMM.-MMFMM.",
      "h.MMM--wMMMMM--hMMMhh-MM-MM.",
      ".h.h-.wwhhM.h--....h..---h..",
      "hhh.-.....w..--w.w...h.h--h.",
      "hMMM--.hw.w..--MMMw.h.hh.h-h",
      "wMM--.hwhMw.w.--MMMh...M.w-.",
      "MMFMMw.MMMMMh.MMFMMw.MMMM...",
      "MMMMMhhMMMMMwhMMMMMh.MMM....",
      ".wM.hh.MMMMM..hww..w.MMM..B.",
      "....h.hwMMM..h.h.whw..MM...h"
    ],
    "buildings": [
      {
        "col": 1,
        "row": 1,
        "owner": 0
      },
      {
        "col": 26,
        "row": 26,
        "owner": 1
      },
      {
        "col": 10,
        "row": 4,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "BISON",
          "HADRIAN",
          "MULE",
          "KILROY",
          "POLAR",
          "OCTOPUS",
          "RABBIT",
          "PANTHER",
          "SLAGGER"
        ]
      },
      {
        "col": 24,
        "row": 4,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "LENET",
          "HADRIAN",
          "MULE",
          "KILROY",
          "GRIZZLY",
          "OCTOPUS",
          "LYNX",
          "PANTHER",
          "TITAN"
        ]
      },
      {
        "col": 2,
        "row": 10,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "POLAR",
          "HADRIAN",
          "MULE",
          "KILROY",
          "SLAGGER",
          "OCTOPUS",
          "RABBIT",
          "PANTHER",
          "GIANT"
        ]
      },
      {
        "col": 16,
        "row": 10,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "GRIZZLY",
          "HADRIAN",
          "MULE",
          "KILROY",
          "TITAN",
          "OCTOPUS",
          "LYNX",
          "PANTHER",
          "BISON"
        ]
      },
      {
        "col": 10,
        "row": 18,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "SLAGGER",
          "HADRIAN",
          "MULE",
          "KILROY",
          "GIANT",
          "OCTOPUS",
          "RABBIT",
          "PANTHER",
          "LENET"
        ]
      },
      {
        "col": 24,
        "row": 18,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "TITAN",
          "HADRIAN",
          "MULE",
          "KILROY",
          "BISON",
          "OCTOPUS",
          "LYNX",
          "PANTHER",
          "POLAR"
        ]
      },
      {
        "col": 2,
        "row": 24,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "GIANT",
          "HADRIAN",
          "MULE",
          "KILROY",
          "LENET",
          "OCTOPUS",
          "RABBIT",
          "PANTHER",
          "GRIZZLY"
        ]
      },
      {
        "col": 16,
        "row": 24,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "BISON",
          "HADRIAN",
          "MULE",
          "KILROY",
          "POLAR",
          "OCTOPUS",
          "LYNX",
          "PANTHER",
          "SLAGGER"
        ]
      }
    ],
    "units": [
      {
        "t": "BISON",
        "o": 0,
        "x": 3,
        "y": 2
      },
      {
        "t": "LENET",
        "o": 0,
        "x": 1,
        "y": 3
      },
      {
        "t": "POLAR",
        "o": 0,
        "x": 2,
        "y": 3
      },
      {
        "t": "GRIZZLY",
        "o": 0,
        "x": 3,
        "y": 1
      },
      {
        "t": "CHARLIE",
        "o": 0,
        "x": 1,
        "y": 2
      },
      {
        "t": "CHARLIE",
        "o": 0,
        "x": 2,
        "y": 2
      },
      {
        "t": "KILROY",
        "o": 0,
        "x": 0,
        "y": 3
      },
      {
        "t": "BISON",
        "o": 1,
        "x": 25,
        "y": 24
      },
      {
        "t": "LENET",
        "o": 1,
        "x": 26,
        "y": 24
      },
      {
        "t": "POLAR",
        "o": 1,
        "x": 24,
        "y": 25
      },
      {
        "t": "GRIZZLY",
        "o": 1,
        "x": 27,
        "y": 24
      },
      {
        "t": "CHARLIE",
        "o": 1,
        "x": 25,
        "y": 25
      },
      {
        "t": "CHARLIE",
        "o": 1,
        "x": 26,
        "y": 25
      },
      {
        "t": "KILROY",
        "o": 1,
        "x": 24,
        "y": 26
      }
    ]
  },
  {
    "name": "ARSENAL FJORDS",
    "pack": "AI-made",
    "author": "Codex · original level",
    "source": "levels/arsenal-fjords.json",
    "description": "Part 5 rebuilds the dense 28×28 fjord network around nine deliberate supply teams: infantry caches, armor depots, patrols, escorted guns, engineers and mixed arsenals. Each corner army starts with four tanks and three infantry.",
    "special": "Factory stocks range from 1 to 12 units (51 total), with three factories each offering one, two or three road exits. Every Atlas and mine follows its own Mule or Pelican in the roster. Deploy the carrier first and load the immobile unit aboard. Pelicans are the only aircraft; no battery has more than two guns.",
    "tags": [
      "part 5",
      "themed reserves",
      "1 / 2 / 3 exits",
      "Pelican airlift"
    ],
    "turnLimit": 120,
    "grid": [
      ".h.hh.h.h..h.h.....w....h.h.",
      ".B..--.h.---hhh.hM.hh..ww..w",
      "-...MM---MMM----MMMMw-.MMMh-",
      "...MMM.-MMM--.-M-FMMh---M--h",
      "-MMMMMw-MMFMM.-MMM---.MMFMM.",
      "--MMM..-MMMMMh--MMMw-hMM-MMw",
      "-h--..h---Mh...h--..h.h.-w..",
      "-ww.--h-w.--w.....-w..w.-...",
      "-MMMh.-..hh.--.MMM--......h.",
      "--MM..-..M..h-hMM--....M....",
      "MMF-M.-MMMMM.-MMFMM.wMMMMM..",
      "MMMM---MMMMM.-MMMMMw.MMMMM.h",
      ".hMh.h-MMMMM..--M...hMMMMMw.",
      ".whhh.--MMMh.h..--.-..MMM...",
      "..w...-.--.h.....h--..hw..w.",
      "w..Mw.-h-.--wh...M.h--.---..",
      ".MMMMM---MMM--.MMMMM.--MMM--",
      "hMMMMM-w--M----MMMMM.-MMM--w",
      ".MMMMM-.MMFMM--MMMMM.-MMFMM.",
      "h.MMM--.MM-MM--.MMM.h-MMMMM.",
      "h...-...hh-w.--..wh...--...h",
      "..w.-.....-..--hh.hhw.h.--w.",
      ".MMM--..wh..h--MMM.h.hhhhw-.",
      "--M--w...M.wh.--MMM..h.Mh.-.",
      "MMFMM.hMMMMM.wMMF-M.hMMMM...",
      "MM-MM.hMMMMMhwMMMM--.MMM....",
      "..-hw..MMMMM.w.hww.w.MMM..Bh",
      "..-....wMMMh...h....hhMM..hh"
    ],
    "buildings": [
      {
        "col": 1,
        "row": 1,
        "owner": 0
      },
      {
        "col": 26,
        "row": 26,
        "owner": 1
      },
      {
        "col": 10,
        "row": 4,
        "owner": -1,
        "inventoryTheme": "Infantry relay",
        "stored": [
          "CHARLIE"
        ]
      },
      {
        "col": 2,
        "row": 10,
        "owner": -1,
        "inventoryTheme": "Armor outpost",
        "stored": [
          "BISON",
          "BISON"
        ]
      },
      {
        "col": 2,
        "row": 24,
        "owner": -1,
        "inventoryTheme": "Mobile siege team",
        "stored": [
          "MULE",
          "ATLAS",
          "BISON"
        ]
      },
      {
        "col": 24,
        "row": 18,
        "owner": -1,
        "inventoryTheme": "Fast patrol",
        "stored": [
          "RABBIT",
          "RABBIT",
          "CHARLIE",
          "CHARLIE"
        ]
      },
      {
        "col": 16,
        "row": 24,
        "owner": -1,
        "inventoryTheme": "Escorted battery",
        "stored": [
          "BISON",
          "HADRIAN",
          "CHARLIE",
          "BISON",
          "CHARLIE"
        ]
      },
      {
        "col": 24,
        "row": 4,
        "owner": -1,
        "inventoryTheme": "Combat engineers",
        "stored": [
          "MULE",
          "TRIGGER",
          "MULE",
          "TRIGGER",
          "CHARLIE",
          "CHARLIE"
        ]
      },
      {
        "col": 16,
        "row": 10,
        "owner": -1,
        "inventoryTheme": "Heavy armor reserve",
        "stored": [
          "POLAR",
          "POLAR",
          "BISON",
          "BISON",
          "POLAR",
          "BISON",
          "CHARLIE",
          "CHARLIE"
        ]
      },
      {
        "col": 17,
        "row": 3,
        "owner": -1,
        "inventoryTheme": "Combined-arms arsenal",
        "stored": [
          "BISON",
          "BISON",
          "CHARLIE",
          "CHARLIE",
          "HADRIAN",
          "HADRIAN",
          "RABBIT",
          "RABBIT",
          "MULE",
          "CHARLIE"
        ]
      },
      {
        "col": 10,
        "row": 18,
        "owner": -1,
        "inventoryTheme": "Airlift arsenal",
        "stored": [
          "PELICAN",
          "ATLAS",
          "BISON",
          "BISON",
          "CHARLIE",
          "CHARLIE",
          "PELICAN",
          "ATLAS",
          "BISON",
          "BISON",
          "CHARLIE",
          "CHARLIE"
        ]
      }
    ],
    "units": [
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
        "t": "POLAR",
        "o": 0,
        "x": 2,
        "y": 3
      },
      {
        "t": "POLAR",
        "o": 0,
        "x": 3,
        "y": 1
      },
      {
        "t": "CHARLIE",
        "o": 0,
        "x": 1,
        "y": 2
      },
      {
        "t": "CHARLIE",
        "o": 0,
        "x": 2,
        "y": 2
      },
      {
        "t": "CHARLIE",
        "o": 0,
        "x": 0,
        "y": 3
      },
      {
        "t": "BISON",
        "o": 1,
        "x": 25,
        "y": 24
      },
      {
        "t": "BISON",
        "o": 1,
        "x": 26,
        "y": 24
      },
      {
        "t": "POLAR",
        "o": 1,
        "x": 24,
        "y": 25
      },
      {
        "t": "POLAR",
        "o": 1,
        "x": 27,
        "y": 24
      },
      {
        "t": "CHARLIE",
        "o": 1,
        "x": 25,
        "y": 25
      },
      {
        "t": "CHARLIE",
        "o": 1,
        "x": 26,
        "y": 25
      },
      {
        "t": "CHARLIE",
        "o": 1,
        "x": 24,
        "y": 26
      }
    ]
  },
  {
    "name": "NEEDLE FJORDS",
    "pack": "AI-made",
    "author": "Codex · original level",
    "source": "levels/needle-fjords.json",
    "description": "Part 6 cuts narrow, angular fjords through mountain ridges. Long two- and three-hex channels branch toward 9 terminal factories, with only 2 small junction clearings and a few connecting passes. Each corner camp starts with exactly one Charlie, one Panther motorcycle infantry and one Rabbit missile buggy.",
    "special": "Each of the 9 neutral factories holds 4–8 units in a focused or mixed team; none contains infantry. Exactly 3 factories each have one, two or three road exits, all facing down their fjord. Atlas guns and mines follow their own Mule or Pelican. Pelicans are the only aircraft. Protect your two capturing units: there are no infantry reinforcements.",
    "tags": [
      "part 6",
      "narrow fjords",
      "9 factories",
      "3-unit start"
    ],
    "turnLimit": 180,
    "grid": [
      "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM",
      "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM",
      "MMM.MMMMMMMMMMMMMMMMMMMMMMMMMMMMMM",
      "MM.B.MMMMMMhMMMMMMMMMMMMMMMMMFMMMM",
      "MM....MMMFM-...wMMMMMMMMMMMM---MMM",
      "MM..-.MMMM-.----hMMMM.MFMMMM.-wMMM",
      "MMM.--hMMM.MMMh-hMM.w---MMMM.-.MMM",
      "MMMMw-.MM...MM.-hMMh-.wMMMMh.-.MMM",
      "MMMh.-..hw.w.MM-.MM.-.MMMMM.-hhMMM",
      "MMMw------h.wMM-.MMh--.MMMh--hMMMM",
      "MMMh-hhhw---h.h-hMMM.-h...h-.MMMMM",
      "MMMMwMMMh-.-w-w-.MMMh------..MMMMM",
      "MMMMMMMMM-wM-.-whMMMhh-.MMhMMMMMMM",
      "MMMMMMMMM-.MM--.MMMMM.-hMMMMMMMMMM",
      "MMMMMMMMM-.MM-hMMMMhM.--hMMMMMMMMM",
      "MMMMFMMMM-hMMM-.M..-w-.-hMMMMFMMMM",
      "MMM.-.MM.-hMMh--.--.-.--h.M.M--MMM",
      "MMM.-.MMh-hwMhh--.hM.Mhh-.Mh-..MMM",
      "MMM.-hMM.h--..--..hMMMM.-.M.-.MMMM",
      "MMMw-wMMMMh.----.wwMMMh--..--wMMMM",
      "MMM.-hMMMMMM-hh--MMMMMh-.Mw-.MMMMM",
      "MMh--.MhMMM--.h-FMMMM..-hM.-.hMMMM",
      "MMh-hh.-..h-.MMMMMMMMh-..M..-hMMMM",
      "MM.----M----hMMMMMMMMh--whh--wMMMM",
      "MMw.-.MMM.-w.MMMMMMMMw-----.hMMMMM",
      "MMM.-hMM.--hMMMMMMMMMMh-hMMMMMMMMM",
      "MMMh--.Mhh-.MMMMMMMMM.h-wMMMMMMMMM",
      "MMMMh-.MM.--hMMMM-M.M.-.hMMMMMMMMM",
      "MMMMMFMMMM-FMMMMF-h-.--hMwMwMwMMMM",
      "MMMMMMMMMMMMMMMM-.-w--.-w-h-....MM",
      "MMMMMMMMMMMMMMMMMMhM..-h-.-h-wB.MM",
      "MMMMMMMMMMMMMMMMMMMMMMhM.MhMwM.MMM",
      "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM",
      "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM"
    ],
    "buildings": [
      {
        "col": 3,
        "row": 3,
        "owner": 0
      },
      {
        "col": 30,
        "row": 30,
        "owner": 1
      },
      {
        "col": 9,
        "row": 4,
        "owner": -1,
        "stored": [
          "BISON",
          "BISON",
          "POLAR",
          "POLAR"
        ],
        "inventoryTheme": "Armor section"
      },
      {
        "col": 23,
        "row": 5,
        "owner": -1,
        "stored": [
          "RABBIT",
          "RABBIT",
          "BISON",
          "BISON",
          "LYNX"
        ],
        "inventoryTheme": "Missile patrol"
      },
      {
        "col": 29,
        "row": 3,
        "owner": -1,
        "stored": [
          "BISON",
          "HADRIAN",
          "BISON",
          "HADRIAN",
          "POLAR",
          "POLAR"
        ],
        "inventoryTheme": "Escorted battery"
      },
      {
        "col": 4,
        "row": 15,
        "owner": -1,
        "stored": [
          "MULE",
          "ATLAS",
          "BISON",
          "BISON",
          "POLAR"
        ],
        "inventoryTheme": "Mobile siege team"
      },
      {
        "col": 29,
        "row": 15,
        "owner": -1,
        "stored": [
          "MULE",
          "TRIGGER",
          "MULE",
          "TRIGGER",
          "BISON",
          "BISON"
        ],
        "inventoryTheme": "Mine-laying team"
      },
      {
        "col": 16,
        "row": 21,
        "owner": -1,
        "stored": [
          "PELICAN",
          "ATLAS",
          "BISON",
          "BISON",
          "POLAR",
          "POLAR",
          "RABBIT"
        ],
        "inventoryTheme": "Airlift reserve"
      },
      {
        "col": 5,
        "row": 28,
        "owner": -1,
        "stored": [
          "BISON",
          "BISON",
          "POLAR",
          "POLAR",
          "HADRIAN",
          "RABBIT",
          "RABBIT",
          "LYNX"
        ],
        "inventoryTheme": "Combined-arms reserve"
      },
      {
        "col": 11,
        "row": 28,
        "owner": -1,
        "stored": [
          "BISON",
          "BISON",
          "POLAR",
          "POLAR"
        ],
        "inventoryTheme": "Armor section"
      },
      {
        "col": 16,
        "row": 28,
        "owner": -1,
        "stored": [
          "RABBIT",
          "RABBIT",
          "BISON",
          "BISON",
          "LYNX"
        ],
        "inventoryTheme": "Missile patrol"
      }
    ],
    "units": [
      {
        "t": "CHARLIE",
        "o": 0,
        "x": 3,
        "y": 4
      },
      {
        "t": "PANTHER",
        "o": 0,
        "x": 4,
        "y": 4
      },
      {
        "t": "RABBIT",
        "o": 0,
        "x": 4,
        "y": 3
      },
      {
        "t": "CHARLIE",
        "o": 1,
        "x": 29,
        "y": 29
      },
      {
        "t": "PANTHER",
        "o": 1,
        "x": 30,
        "y": 29
      },
      {
        "t": "RABBIT",
        "o": 1,
        "x": 31,
        "y": 29
      }
    ]
  },
  {
    "name": "LABYRINTH FJORDS",
    "pack": "AI-made",
    "author": "Codex · original level",
    "source": "levels/labyrinth-fjords.json",
    "description": "Part 7 packs 21 neutral factories into a 30×30 mountain labyrinth. Narrow, angular two- and three-hex channels interconnect around ridges, with factories tucked into terminal branches and short wall alcoves. Three small junction clearings provide room to fight. Each corner camp starts with a Charlie, Panther motorcycle infantry and Rabbit missile buggy, plus one Bison, one Polar and one Hadrian in matching formations.",
    "special": "Each of the 21 neutral factories holds 4–8 units in a focused or mixed team; none contains infantry. Exactly 7 factories each have one, two or three road exits, all facing down their fjord. Atlas guns and mines follow their own Mule or Pelican. Pelicans are the only aircraft. Protect your two capturing units: there are no infantry reinforcements.",
    "tags": [
      "part 7",
      "narrow fjords",
      "21 factories",
      "6-unit start"
    ],
    "turnLimit": 180,
    "grid": [
      "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMM",
      "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMM",
      "MMM.MMMMM-F-.MMMMMMh.-FMMMMMMM",
      "MM.B.MMhw-----FMMMMw-.MMMMMMMM",
      "MM...MM.-.-MMMMMMMMM--MMMMMMMM",
      "MMMM-hMM--MMMMMMMMMM--MFMMMMMM",
      "MMMM-hMMF-hMMMMMMMMMM---MMMMMM",
      "MMMM-.MMM-h.MMMMMMMMMM-MMMMMMM",
      "MMMM--MM.-.-.hMFMMMMM---F-MMMM",
      "MMMMh-.M.--M----M.M.M-w.-hMMMM",
      "MMMF-.-hMM-...--.-w--h.---MMMM",
      "MMMMM---MM-hMM---M--hM.--FMMMM",
      "MMM.-.hMFM--..M-hMM-w.h--MMMMM",
      "MMw--hMMM.h----hhw.---w-w.MMMM",
      "MMh-.MMMMw-..---.---..--w-MMMM",
      "MMM-.MMM.--hh-wM-.-hwMh-.MFMMM",
      "MMM-..hh.wwM.-hMMMhMMMM-.MMMMM",
      "MMF-h---h-.hh-hMMMMMMMF-hMMMMM",
      "MM---.w.-.-hh-.MMMFMMMM-.MMMMM",
      "MM.hhMMM----h-w..--MMMM-wMMMMM",
      "MMMMMMMMF---.----MMMMM-FMMMMMM",
      "MMMMMMMMM.---h.MMMMMMMMMMMMMMM",
      "MMMMMMMMM.----MMFMMhMMMMMMMMMM",
      "MMMMMF-hh--.--Mh-hh-.hMMMMMMMM",
      "MMMMM------MM-h----w--.hM.MMMM",
      "MMMMMMMMMMFMw---h..MMF--h...MM",
      "MMMMMMMMMMMM.h-FMMMMMMMM-.B.MM",
      "MMMMMMMMMMMMMMMMMMMMMMMMMM.MMM",
      "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMM",
      "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMM"
    ],
    "buildings": [
      {
        "col": 3,
        "row": 3,
        "owner": 0
      },
      {
        "col": 26,
        "row": 26,
        "owner": 1
      },
      {
        "col": 14,
        "row": 3,
        "owner": -1,
        "stored": [
          "BISON",
          "BISON",
          "POLAR",
          "POLAR"
        ],
        "inventoryTheme": "Armor section"
      },
      {
        "col": 23,
        "row": 5,
        "owner": -1,
        "stored": [
          "RABBIT",
          "RABBIT",
          "BISON",
          "BISON",
          "LYNX"
        ],
        "inventoryTheme": "Missile patrol"
      },
      {
        "col": 24,
        "row": 8,
        "owner": -1,
        "stored": [
          "BISON",
          "HADRIAN",
          "BISON",
          "HADRIAN",
          "POLAR",
          "POLAR"
        ],
        "inventoryTheme": "Escorted battery"
      },
      {
        "col": 18,
        "row": 18,
        "owner": -1,
        "stored": [
          "MULE",
          "ATLAS",
          "BISON",
          "BISON",
          "POLAR"
        ],
        "inventoryTheme": "Mobile siege team"
      },
      {
        "col": 23,
        "row": 20,
        "owner": -1,
        "stored": [
          "MULE",
          "TRIGGER",
          "MULE",
          "TRIGGER",
          "BISON",
          "BISON"
        ],
        "inventoryTheme": "Mine-laying team"
      },
      {
        "col": 5,
        "row": 23,
        "owner": -1,
        "stored": [
          "PELICAN",
          "ATLAS",
          "BISON",
          "BISON",
          "POLAR",
          "POLAR",
          "RABBIT"
        ],
        "inventoryTheme": "Airlift reserve"
      },
      {
        "col": 8,
        "row": 12,
        "owner": -1,
        "stored": [
          "BISON",
          "BISON",
          "POLAR",
          "POLAR",
          "HADRIAN",
          "RABBIT",
          "RABBIT",
          "LYNX"
        ],
        "inventoryTheme": "Combined-arms reserve"
      },
      {
        "col": 15,
        "row": 26,
        "owner": -1,
        "stored": [
          "BISON",
          "BISON",
          "POLAR",
          "POLAR"
        ],
        "inventoryTheme": "Armor section"
      },
      {
        "col": 2,
        "row": 17,
        "owner": -1,
        "stored": [
          "RABBIT",
          "RABBIT",
          "BISON",
          "BISON",
          "LYNX"
        ],
        "inventoryTheme": "Missile patrol"
      },
      {
        "col": 26,
        "row": 15,
        "owner": -1,
        "stored": [
          "BISON",
          "HADRIAN",
          "BISON",
          "HADRIAN",
          "POLAR",
          "POLAR"
        ],
        "inventoryTheme": "Escorted battery"
      },
      {
        "col": 15,
        "row": 8,
        "owner": -1,
        "stored": [
          "MULE",
          "ATLAS",
          "BISON",
          "BISON",
          "POLAR"
        ],
        "inventoryTheme": "Mobile siege team"
      },
      {
        "col": 8,
        "row": 6,
        "owner": -1,
        "stored": [
          "MULE",
          "TRIGGER",
          "MULE",
          "TRIGGER",
          "BISON",
          "BISON"
        ],
        "inventoryTheme": "Mine-laying team"
      },
      {
        "col": 3,
        "row": 10,
        "owner": -1,
        "stored": [
          "PELICAN",
          "ATLAS",
          "BISON",
          "BISON",
          "POLAR",
          "POLAR",
          "RABBIT"
        ],
        "inventoryTheme": "Airlift reserve"
      },
      {
        "col": 21,
        "row": 25,
        "owner": -1,
        "stored": [
          "BISON",
          "BISON",
          "POLAR",
          "POLAR",
          "HADRIAN",
          "RABBIT",
          "RABBIT",
          "LYNX"
        ],
        "inventoryTheme": "Combined-arms reserve"
      },
      {
        "col": 8,
        "row": 20,
        "owner": -1,
        "stored": [
          "BISON",
          "BISON",
          "POLAR",
          "POLAR"
        ],
        "inventoryTheme": "Armor section"
      },
      {
        "col": 16,
        "row": 22,
        "owner": -1,
        "stored": [
          "RABBIT",
          "RABBIT",
          "BISON",
          "BISON",
          "LYNX"
        ],
        "inventoryTheme": "Missile patrol"
      },
      {
        "col": 10,
        "row": 25,
        "owner": -1,
        "stored": [
          "BISON",
          "HADRIAN",
          "BISON",
          "HADRIAN",
          "POLAR",
          "POLAR"
        ],
        "inventoryTheme": "Escorted battery"
      },
      {
        "col": 25,
        "row": 11,
        "owner": -1,
        "stored": [
          "MULE",
          "ATLAS",
          "BISON",
          "BISON",
          "POLAR"
        ],
        "inventoryTheme": "Mobile siege team"
      },
      {
        "col": 22,
        "row": 2,
        "owner": -1,
        "stored": [
          "MULE",
          "TRIGGER",
          "MULE",
          "TRIGGER",
          "BISON",
          "BISON"
        ],
        "inventoryTheme": "Mine-laying team"
      },
      {
        "col": 22,
        "row": 17,
        "owner": -1,
        "stored": [
          "PELICAN",
          "ATLAS",
          "BISON",
          "BISON",
          "POLAR",
          "POLAR",
          "RABBIT"
        ],
        "inventoryTheme": "Airlift reserve"
      },
      {
        "col": 10,
        "row": 2,
        "owner": -1,
        "stored": [
          "BISON",
          "BISON",
          "POLAR",
          "POLAR",
          "HADRIAN",
          "RABBIT",
          "RABBIT",
          "LYNX"
        ],
        "inventoryTheme": "Combined-arms reserve"
      }
    ],
    "units": [
      {
        "t": "CHARLIE",
        "o": 0,
        "x": 4,
        "y": 4
      },
      {
        "t": "CHARLIE",
        "o": 1,
        "x": 25,
        "y": 25
      },
      {
        "t": "PANTHER",
        "o": 0,
        "x": 4,
        "y": 3
      },
      {
        "t": "PANTHER",
        "o": 1,
        "x": 25,
        "y": 26
      },
      {
        "t": "RABBIT",
        "o": 0,
        "x": 3,
        "y": 2
      },
      {
        "t": "RABBIT",
        "o": 1,
        "x": 26,
        "y": 27
      },
      {
        "t": "BISON",
        "o": 0,
        "x": 2,
        "y": 3
      },
      {
        "t": "BISON",
        "o": 1,
        "x": 27,
        "y": 26
      },
      {
        "t": "POLAR",
        "o": 0,
        "x": 2,
        "y": 4
      },
      {
        "t": "POLAR",
        "o": 1,
        "x": 27,
        "y": 25
      },
      {
        "t": "HADRIAN",
        "o": 0,
        "x": 3,
        "y": 4
      },
      {
        "t": "HADRIAN",
        "o": 1,
        "x": 26,
        "y": 25
      }
    ]
  },
  {
    "name": "MIRROR FJORDS",
    "pack": "AI-made",
    "author": "Codex · original level",
    "source": "levels/mirror-fjords.json",
    "description": "Part 8 is a 31×30 fjord network with exact left-to-right symmetry. Mountain walls enclose narrow, angular channels and small junctions. Nine matched factory pairs surround three shared center-line factories. Every terrain hex, reserve team and starting position has an identical counterpart for the other side.",
    "special": "Each side starts with one Charlie, Panther, Rabbit, Bison, Polar and Hadrian in mirrored positions. All 21 neutral factories hold 4–8 units without infantry; seven factories each have one, two or three exits. The center two-exit factory has matching north/south approaches. Every Atlas or mine follows its own Mule or Pelican. Pelicans are the only aircraft.",
    "tags": [
      "part 8",
      "exact symmetry",
      "21 factories",
      "6-unit start"
    ],
    "turnLimit": 180,
    "grid": [
      "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM",
      "MMMMMMMMMMMMM-----MMMMMMMMMMMMM",
      "MMM...hh..h--MMFMM--h..hh...MMM",
      "MM.B.------hMMMMMMMh------.B.MM",
      "MM...MMMMM--MMMMMMM--MMMMM...MM",
      "MMMMMMMMMMM-MFMMMFM-MMMMMMMMMMM",
      "MMMMMMMMMMM-M-MMM-M-MMMMMMMMMMM",
      "MMMMMMMMMM-.h-.M.-h.-MMMMMMMMMM",
      "MMMMMMMMF----h-M-h----FMMMMMMMM",
      "MMMMM.MMMw-...-M-...-wMMM.MMMMM",
      "MMMM.-hhM--.hM.M.Mh.--Mhh-.MMMM",
      "MMMF----.-.hMFMMMFMh.-.----FMMM",
      "MMMMM-hM-M----MMM----M-Mh-MMMMM",
      "MMMMM-.MMh-M---M---M-hMM.-MMMMM",
      "MMMhh-.MM--M..-M-..M--MM.-hhMMM",
      "MMh--.hM-FMMMM---MMMMF-Mh.--hMM",
      "MMh-.h..MMMMMMMFMMMMMMM..h.-hMM",
      "MM------.MMMMMM-MMMMMM.------MM",
      "MMFMh---hh.hM--M--Mh.hh---hMFMM",
      "MMMM.-h.----w-hMh-w----.h-.MMMM",
      "MMMM-h.MhMMM-h-M-h-MMMhM.h-MMMM",
      "MMMM-hMMMMMMMw-M-wMMMMMMMh-MMMM",
      "MMMF-.MMMMMM.--M--.MMMMMM.-FMMM",
      "MMM--.MMMMMhh-----hhMMMMM.--MMM",
      "MMM-hMMw-FMh-h-F-h-hMF-wMMh-MMM",
      "MM.-.MM---M...MMM...M---MM.-.MM",
      "MM---.h-MMMw-.MMM.-wMMM-h.---MM",
      "MMF----MMMMM.MMMMM.MMMMM----FMM",
      "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM",
      "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM"
    ],
    "buildings": [
      {
        "col": 3,
        "row": 3,
        "owner": 0
      },
      {
        "col": 27,
        "row": 3,
        "owner": 1
      },
      {
        "col": 13,
        "row": 5,
        "owner": -1,
        "stored": [
          "BISON",
          "BISON",
          "POLAR",
          "POLAR"
        ],
        "inventoryTheme": "Armor section"
      },
      {
        "col": 17,
        "row": 5,
        "owner": -1,
        "stored": [
          "BISON",
          "BISON",
          "POLAR",
          "POLAR"
        ],
        "inventoryTheme": "Armor section"
      },
      {
        "col": 9,
        "row": 15,
        "owner": -1,
        "stored": [
          "RABBIT",
          "RABBIT",
          "BISON",
          "BISON",
          "LYNX"
        ],
        "inventoryTheme": "Missile patrol"
      },
      {
        "col": 21,
        "row": 15,
        "owner": -1,
        "stored": [
          "RABBIT",
          "RABBIT",
          "BISON",
          "BISON",
          "LYNX"
        ],
        "inventoryTheme": "Missile patrol"
      },
      {
        "col": 9,
        "row": 24,
        "owner": -1,
        "stored": [
          "BISON",
          "HADRIAN",
          "BISON",
          "HADRIAN",
          "POLAR",
          "POLAR"
        ],
        "inventoryTheme": "Escorted battery"
      },
      {
        "col": 21,
        "row": 24,
        "owner": -1,
        "stored": [
          "BISON",
          "HADRIAN",
          "BISON",
          "HADRIAN",
          "POLAR",
          "POLAR"
        ],
        "inventoryTheme": "Escorted battery"
      },
      {
        "col": 3,
        "row": 11,
        "owner": -1,
        "stored": [
          "MULE",
          "ATLAS",
          "BISON",
          "BISON",
          "POLAR"
        ],
        "inventoryTheme": "Mobile siege team"
      },
      {
        "col": 27,
        "row": 11,
        "owner": -1,
        "stored": [
          "MULE",
          "ATLAS",
          "BISON",
          "BISON",
          "POLAR"
        ],
        "inventoryTheme": "Mobile siege team"
      },
      {
        "col": 2,
        "row": 18,
        "owner": -1,
        "stored": [
          "MULE",
          "TRIGGER",
          "MULE",
          "TRIGGER",
          "BISON",
          "BISON"
        ],
        "inventoryTheme": "Mine-laying team"
      },
      {
        "col": 28,
        "row": 18,
        "owner": -1,
        "stored": [
          "MULE",
          "TRIGGER",
          "MULE",
          "TRIGGER",
          "BISON",
          "BISON"
        ],
        "inventoryTheme": "Mine-laying team"
      },
      {
        "col": 2,
        "row": 27,
        "owner": -1,
        "stored": [
          "PELICAN",
          "ATLAS",
          "BISON",
          "BISON",
          "POLAR",
          "POLAR",
          "RABBIT"
        ],
        "inventoryTheme": "Airlift reserve"
      },
      {
        "col": 28,
        "row": 27,
        "owner": -1,
        "stored": [
          "PELICAN",
          "ATLAS",
          "BISON",
          "BISON",
          "POLAR",
          "POLAR",
          "RABBIT"
        ],
        "inventoryTheme": "Airlift reserve"
      },
      {
        "col": 8,
        "row": 8,
        "owner": -1,
        "stored": [
          "BISON",
          "BISON",
          "POLAR",
          "POLAR",
          "HADRIAN",
          "RABBIT",
          "RABBIT",
          "LYNX"
        ],
        "inventoryTheme": "Combined-arms reserve"
      },
      {
        "col": 22,
        "row": 8,
        "owner": -1,
        "stored": [
          "BISON",
          "BISON",
          "POLAR",
          "POLAR",
          "HADRIAN",
          "RABBIT",
          "RABBIT",
          "LYNX"
        ],
        "inventoryTheme": "Combined-arms reserve"
      },
      {
        "col": 13,
        "row": 11,
        "owner": -1,
        "stored": [
          "BISON",
          "BISON",
          "POLAR",
          "POLAR"
        ],
        "inventoryTheme": "Armor section"
      },
      {
        "col": 17,
        "row": 11,
        "owner": -1,
        "stored": [
          "BISON",
          "BISON",
          "POLAR",
          "POLAR"
        ],
        "inventoryTheme": "Armor section"
      },
      {
        "col": 3,
        "row": 22,
        "owner": -1,
        "stored": [
          "RABBIT",
          "RABBIT",
          "BISON",
          "BISON",
          "LYNX"
        ],
        "inventoryTheme": "Missile patrol"
      },
      {
        "col": 27,
        "row": 22,
        "owner": -1,
        "stored": [
          "RABBIT",
          "RABBIT",
          "BISON",
          "BISON",
          "LYNX"
        ],
        "inventoryTheme": "Missile patrol"
      },
      {
        "col": 15,
        "row": 2,
        "owner": -1,
        "inventoryTheme": "Armor section",
        "stored": [
          "BISON",
          "BISON",
          "POLAR",
          "POLAR"
        ]
      },
      {
        "col": 15,
        "row": 16,
        "owner": -1,
        "inventoryTheme": "Escorted battery",
        "stored": [
          "BISON",
          "HADRIAN",
          "BISON",
          "HADRIAN",
          "POLAR",
          "POLAR"
        ]
      },
      {
        "col": 15,
        "row": 24,
        "owner": -1,
        "inventoryTheme": "Combined-arms reserve",
        "stored": [
          "BISON",
          "BISON",
          "POLAR",
          "POLAR",
          "HADRIAN",
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
        "y": 4
      },
      {
        "t": "CHARLIE",
        "o": 1,
        "x": 26,
        "y": 4
      },
      {
        "t": "PANTHER",
        "o": 0,
        "x": 4,
        "y": 3
      },
      {
        "t": "PANTHER",
        "o": 1,
        "x": 26,
        "y": 3
      },
      {
        "t": "RABBIT",
        "o": 0,
        "x": 3,
        "y": 2
      },
      {
        "t": "RABBIT",
        "o": 1,
        "x": 27,
        "y": 2
      },
      {
        "t": "BISON",
        "o": 0,
        "x": 2,
        "y": 3
      },
      {
        "t": "BISON",
        "o": 1,
        "x": 28,
        "y": 3
      },
      {
        "t": "POLAR",
        "o": 0,
        "x": 2,
        "y": 4
      },
      {
        "t": "POLAR",
        "o": 1,
        "x": 28,
        "y": 4
      },
      {
        "t": "HADRIAN",
        "o": 0,
        "x": 3,
        "y": 4
      },
      {
        "t": "HADRIAN",
        "o": 1,
        "x": 27,
        "y": 4
      }
    ]
  },
  {
    "name": "LACED FJORDS",
    "pack": "AI-made",
    "author": "Codex · original level",
    "source": "levels/laced-fjords.json",
    "description": "Part 9 keeps a mirrored 31×30 battlefield and 21 neutral factories, but cuts many more narrow connections through thinner mountain walls. A perimeter passage replaces the thick mountain border. Small isolated plain clearings sit among the ridges, while a connected road spine leaves most valley floors unpaved.",
    "special": "Eleven factories include one infantry reserve: usually Charlie, occasionally Kilroy. All inventories remain 4–8 units, with seven factories each offering one, two or three exits. Each side starts with Charlie, Panther, Rabbit, Bison, Polar and Hadrian in mirrored positions. Every Atlas or mine follows its own Mule or Pelican; Pelicans are the only aircraft.",
    "tags": [
      "part 9",
      "thin mountain walls",
      "infantry reserves",
      "sparse roads"
    ],
    "turnLimit": 180,
    "grid": [
      "...........---------...........",
      ".h..MMM..MM-MMM.MMM-MM..MMM..h.",
      ".MM.MhhMMMMh-MMhMM-hMMMMhhM.MM.",
      ".M.B.MMMF-h--FM.MF--h-FMMM.B.M.",
      "....-MM.-h--MMM.MMM--h-.MM-....",
      ".MMM--Mh.--M-------M--.hM--MMM.",
      ".MMMh-Mh-MM.MMMFMMM.MM-hM-hMMM.",
      ".M.MMh----MMMMMMMMMMM----hMM.M.",
      ".MMMM.w-hh--MMMMMMM--hh-w.MMMM.",
      ".MMMh--whM..-MMMMM-..Mhw--hMMM.",
      ".MMF-..w.MMM-FMMMF-MMM.w..-FMM.",
      "..MMMM.h.wMh-MMMMM-hMw.h.MMMM..",
      ".M.hMh......---M---......hMh.M.",
      ".MMM..hwMh...-FMF-...hMwh..MMM.",
      ".MMM..w....-.-MMM-.-....w..MMM.",
      ".MM-h...h--M-M---M-M--h...h-MM.",
      ".MF-.M.wh-FM-MMFMM-MF-hw.M.-FM.",
      "..MM--.whwMM--M-M--MMwhw.--MM..",
      ".M.hh.--h..--M---M--..h--.hh.M.",
      ".MMMw...----MFM-MFM----...wMMM.",
      "..MMh..--MM.-MM-MM-.MM--..hMM..",
      ".M..M.-MM.M.MMM-MMM.M.MM-.M..M.",
      ".MM...-MMMMhMMM-MMMhMMMM-...MM.",
      ".MM-.--..hhhMMM-MMMhhh..--.-MM.",
      ".M-F-.hhh..hM.-F-.Mh..hhh.-F-M.",
      ".MMMMh.hhh..h.MMM.h..hhh.hMMMM.",
      ".MMh.MMhMMMh..MMM..hMMMhMM.hMM.",
      ".hhMM.MhMMMM.M.h.M.MMMMhM.MMhh.",
      ".MMMMMMhMMMMM.hMh.MMMMMhMMMMMM.",
      "..............................."
    ],
    "buildings": [
      {
        "col": 3,
        "row": 3,
        "owner": 0
      },
      {
        "col": 27,
        "row": 3,
        "owner": 1
      },
      {
        "col": 13,
        "row": 3,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "BISON",
          "BISON",
          "POLAR",
          "POLAR"
        ],
        "inventoryTheme": "Armor section"
      },
      {
        "col": 17,
        "row": 3,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "BISON",
          "BISON",
          "POLAR",
          "POLAR"
        ],
        "inventoryTheme": "Armor section"
      },
      {
        "col": 13,
        "row": 10,
        "owner": -1,
        "stored": [
          "RABBIT",
          "RABBIT",
          "BISON",
          "BISON",
          "LYNX"
        ],
        "inventoryTheme": "Missile patrol"
      },
      {
        "col": 17,
        "row": 10,
        "owner": -1,
        "stored": [
          "RABBIT",
          "RABBIT",
          "BISON",
          "BISON",
          "LYNX"
        ],
        "inventoryTheme": "Missile patrol"
      },
      {
        "col": 14,
        "row": 13,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "BISON",
          "HADRIAN",
          "BISON",
          "HADRIAN",
          "POLAR",
          "POLAR"
        ],
        "inventoryTheme": "Escorted battery"
      },
      {
        "col": 16,
        "row": 13,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "BISON",
          "HADRIAN",
          "BISON",
          "HADRIAN",
          "POLAR",
          "POLAR"
        ],
        "inventoryTheme": "Escorted battery"
      },
      {
        "col": 13,
        "row": 19,
        "owner": -1,
        "stored": [
          "MULE",
          "ATLAS",
          "BISON",
          "BISON",
          "POLAR"
        ],
        "inventoryTheme": "Mobile siege team"
      },
      {
        "col": 17,
        "row": 19,
        "owner": -1,
        "stored": [
          "MULE",
          "ATLAS",
          "BISON",
          "BISON",
          "POLAR"
        ],
        "inventoryTheme": "Mobile siege team"
      },
      {
        "col": 2,
        "row": 16,
        "owner": -1,
        "stored": [
          "KILROY",
          "MULE",
          "TRIGGER",
          "MULE",
          "TRIGGER",
          "BISON",
          "BISON"
        ],
        "inventoryTheme": "Mine-laying team"
      },
      {
        "col": 28,
        "row": 16,
        "owner": -1,
        "stored": [
          "KILROY",
          "MULE",
          "TRIGGER",
          "MULE",
          "TRIGGER",
          "BISON",
          "BISON"
        ],
        "inventoryTheme": "Mine-laying team"
      },
      {
        "col": 3,
        "row": 24,
        "owner": -1,
        "stored": [
          "PELICAN",
          "ATLAS",
          "BISON",
          "BISON",
          "POLAR",
          "POLAR",
          "RABBIT"
        ],
        "inventoryTheme": "Airlift reserve"
      },
      {
        "col": 27,
        "row": 24,
        "owner": -1,
        "stored": [
          "PELICAN",
          "ATLAS",
          "BISON",
          "BISON",
          "POLAR",
          "POLAR",
          "RABBIT"
        ],
        "inventoryTheme": "Airlift reserve"
      },
      {
        "col": 3,
        "row": 10,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "BISON",
          "BISON",
          "POLAR",
          "POLAR",
          "HADRIAN",
          "RABBIT",
          "RABBIT"
        ],
        "inventoryTheme": "Combined-arms reserve"
      },
      {
        "col": 27,
        "row": 10,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "BISON",
          "BISON",
          "POLAR",
          "POLAR",
          "HADRIAN",
          "RABBIT",
          "RABBIT"
        ],
        "inventoryTheme": "Combined-arms reserve"
      },
      {
        "col": 8,
        "row": 3,
        "owner": -1,
        "stored": [
          "BISON",
          "BISON",
          "POLAR",
          "POLAR"
        ],
        "inventoryTheme": "Armor section"
      },
      {
        "col": 22,
        "row": 3,
        "owner": -1,
        "stored": [
          "BISON",
          "BISON",
          "POLAR",
          "POLAR"
        ],
        "inventoryTheme": "Armor section"
      },
      {
        "col": 10,
        "row": 16,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "RABBIT",
          "RABBIT",
          "BISON",
          "BISON",
          "LYNX"
        ],
        "inventoryTheme": "Missile patrol"
      },
      {
        "col": 20,
        "row": 16,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "RABBIT",
          "RABBIT",
          "BISON",
          "BISON",
          "LYNX"
        ],
        "inventoryTheme": "Missile patrol"
      },
      {
        "col": 15,
        "row": 6,
        "owner": -1,
        "inventoryTheme": "Armor section",
        "stored": [
          "BISON",
          "BISON",
          "POLAR",
          "POLAR"
        ]
      },
      {
        "col": 15,
        "row": 16,
        "owner": -1,
        "inventoryTheme": "Escorted battery",
        "stored": [
          "CHARLIE",
          "BISON",
          "HADRIAN",
          "BISON",
          "HADRIAN",
          "POLAR",
          "POLAR"
        ]
      },
      {
        "col": 15,
        "row": 24,
        "owner": -1,
        "inventoryTheme": "Combined-arms reserve",
        "stored": [
          "BISON",
          "BISON",
          "POLAR",
          "POLAR",
          "HADRIAN",
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
        "y": 4
      },
      {
        "t": "CHARLIE",
        "o": 1,
        "x": 26,
        "y": 4
      },
      {
        "t": "PANTHER",
        "o": 0,
        "x": 4,
        "y": 3
      },
      {
        "t": "PANTHER",
        "o": 1,
        "x": 26,
        "y": 3
      },
      {
        "t": "RABBIT",
        "o": 0,
        "x": 3,
        "y": 2
      },
      {
        "t": "RABBIT",
        "o": 1,
        "x": 27,
        "y": 2
      },
      {
        "t": "BISON",
        "o": 0,
        "x": 2,
        "y": 3
      },
      {
        "t": "BISON",
        "o": 1,
        "x": 28,
        "y": 3
      },
      {
        "t": "POLAR",
        "o": 0,
        "x": 2,
        "y": 4
      },
      {
        "t": "POLAR",
        "o": 1,
        "x": 28,
        "y": 4
      },
      {
        "t": "HADRIAN",
        "o": 0,
        "x": 3,
        "y": 4
      },
      {
        "t": "HADRIAN",
        "o": 1,
        "x": 27,
        "y": 4
      }
    ]
  },
  {
    "name": "TURNING FJORDS",
    "pack": "AI-made",
    "author": "Codex · original level",
    "source": "levels/turning-fjords.json",
    "description": "Part 10 is a 42×20 battlefield with 180-degree rotational symmetry and opposite-corner armies. Narrow connecting passages weave around interior mountain islands of at least five hexes; edge mountains are at most three hexes thick. Four isolated five-hex plain clearings lie inside the ridges. Connected roads form a sparse backbone across the varied valley floor.",
    "special": "Twelve of 24 neutral factories include one Charlie or Kilroy. All inventories hold 4–8 units; eight factories each have one, two or three exits. Focused teams cover every tank and artillery type, both anti-air vehicles and missile buggies. Each side starts with Charlie, Panther, Rabbit, Slagger, Titan and Octopus in rotated positions. Atlas guns and mines follow their Mule or Pelican; Pelicans are the only aircraft.",
    "tags": [
      "part 10",
      "180° symmetry",
      "24 factories",
      "sparse roads"
    ],
    "turnLimit": 180,
    "grid": [
      "..M....MMMMMMMM..MMM.MMM..MMM......MMM..MM",
      "MMh.MMMMMMM.M..MMMMM.MMMMMhh.MMM.hM.MMh.hM",
      "Mhh.MMMMMMhMMMhhM-FM.MM.Mh.M.M..MMM...MhhM",
      ".h.B.h.-F-.MFMh--w-h.h.h.hMFMM...MMM.MM...",
      "Mh..---.-w-----hhhwh.Mhhh.--MMMMMMMMMhhh.M",
      "M...MFM....h.w--h.hh.M.MMM-.hMMMMMM..MMM.M",
      "MMM.MMMMMM.....-MM.hwMMMMM-w.MMF-..MMMF-.M",
      "MhM.MMM.MFM...w-MM.M.M.MMF-.MMM--------MhM",
      "M.M.MFMM----.h.-.MMF--.MMM--MFM-...-w..MMM",
      "M.MhM-M.M.wh-.-M--MMM---MMM----h.hh-.wh..M",
      "M..hw.-hh.h----MMM---MMM--M-.-hw.M.M-MhM.M",
      "MMM..w-...-MFM--MMM.--FMM.-.h.----MMFM.M.M",
      "MhM--------MMM.-FMM.M.M.MM-w...MFM.MMM.MhM",
      "M.-FMMM..-FMM.w-MMMMMwh.MM-.....MMMMMM.MMM",
      "M.MMM..MMMMMMh.-MMM.M.hh.h--w.h....MFM...M",
      "M.hhhMMMMMMMMM--.hhhM.hwhhh-----w-.---..hM",
      "...MM.MMM...MMFMh.h.h.h-w--hMFM.-F-.h.B.h.",
      "MhhM...MMM..M.M.hM.MM.MF-MhhMMMhMMMMMM.hhM",
      "Mh.hMM.Mh.MMM.hhMMMMM.MMMMM..M.MMMMMMM.hMM",
      "MM..MMM......MMM..MMM.MMM..MMMMMMMM....M.."
    ],
    "buildings": [
      {
        "col": 3,
        "row": 3,
        "owner": 0
      },
      {
        "col": 38,
        "row": 16,
        "owner": 1
      },
      {
        "col": 19,
        "row": 8,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "BISON",
          "BISON",
          "LENET",
          "SLAGGER"
        ],
        "inventoryTheme": "Fast armor"
      },
      {
        "col": 22,
        "row": 11,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "BISON",
          "BISON",
          "LENET",
          "SLAGGER"
        ],
        "inventoryTheme": "Fast armor"
      },
      {
        "col": 3,
        "row": 13,
        "owner": -1,
        "stored": [
          "POLAR",
          "GRIZZLY",
          "TITAN",
          "GIANT"
        ],
        "inventoryTheme": "Heavy armor"
      },
      {
        "col": 38,
        "row": 6,
        "owner": -1,
        "stored": [
          "POLAR",
          "GRIZZLY",
          "TITAN",
          "GIANT"
        ],
        "inventoryTheme": "Heavy armor"
      },
      {
        "col": 10,
        "row": 13,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "HADRIAN",
          "HADRIAN",
          "BISON",
          "LENET",
          "SEEKER"
        ],
        "inventoryTheme": "Long-range battery"
      },
      {
        "col": 31,
        "row": 6,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "HADRIAN",
          "HADRIAN",
          "BISON",
          "LENET",
          "SEEKER"
        ],
        "inventoryTheme": "Long-range battery"
      },
      {
        "col": 12,
        "row": 3,
        "owner": -1,
        "stored": [
          "OCTOPUS",
          "OCTOPUS",
          "GRIZZLY",
          "GRIZZLY",
          "SLAGGER",
          "SLAGGER"
        ],
        "inventoryTheme": "Rocket battery"
      },
      {
        "col": 29,
        "row": 16,
        "owner": -1,
        "stored": [
          "OCTOPUS",
          "OCTOPUS",
          "GRIZZLY",
          "GRIZZLY",
          "SLAGGER",
          "SLAGGER"
        ],
        "inventoryTheme": "Rocket battery"
      },
      {
        "col": 18,
        "row": 2,
        "owner": -1,
        "stored": [
          "KILROY",
          "MULE",
          "ATLAS",
          "POLAR",
          "POLAR"
        ],
        "inventoryTheme": "Mobile siege"
      },
      {
        "col": 23,
        "row": 17,
        "owner": -1,
        "stored": [
          "KILROY",
          "MULE",
          "ATLAS",
          "POLAR",
          "POLAR"
        ],
        "inventoryTheme": "Mobile siege"
      },
      {
        "col": 9,
        "row": 7,
        "owner": -1,
        "stored": [
          "PELICAN",
          "ATLAS",
          "TITAN",
          "TITAN",
          "RABBIT",
          "RABBIT"
        ],
        "inventoryTheme": "Airlift siege"
      },
      {
        "col": 32,
        "row": 12,
        "owner": -1,
        "stored": [
          "PELICAN",
          "ATLAS",
          "TITAN",
          "TITAN",
          "RABBIT",
          "RABBIT"
        ],
        "inventoryTheme": "Airlift siege"
      },
      {
        "col": 5,
        "row": 8,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "MULE",
          "TRIGGER",
          "MULE",
          "TRIGGER",
          "LENET",
          "LENET"
        ],
        "inventoryTheme": "Mine engineers"
      },
      {
        "col": 36,
        "row": 11,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "MULE",
          "TRIGGER",
          "MULE",
          "TRIGGER",
          "LENET",
          "LENET"
        ],
        "inventoryTheme": "Mine engineers"
      },
      {
        "col": 16,
        "row": 12,
        "owner": -1,
        "stored": [
          "RABBIT",
          "RABBIT",
          "LYNX",
          "LYNX",
          "BISON",
          "BISON"
        ],
        "inventoryTheme": "Missile patrol"
      },
      {
        "col": 25,
        "row": 7,
        "owner": -1,
        "stored": [
          "RABBIT",
          "RABBIT",
          "LYNX",
          "LYNX",
          "BISON",
          "BISON"
        ],
        "inventoryTheme": "Missile patrol"
      },
      {
        "col": 8,
        "row": 3,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "HAWKEYE",
          "SEEKER",
          "SEEKER",
          "POLAR",
          "POLAR"
        ],
        "inventoryTheme": "Air-defense screen"
      },
      {
        "col": 33,
        "row": 16,
        "owner": -1,
        "stored": [
          "CHARLIE",
          "HAWKEYE",
          "SEEKER",
          "SEEKER",
          "POLAR",
          "POLAR"
        ],
        "inventoryTheme": "Air-defense screen"
      },
      {
        "col": 5,
        "row": 5,
        "owner": -1,
        "stored": [
          "GIANT",
          "GIANT",
          "GRIZZLY",
          "TITAN"
        ],
        "inventoryTheme": "Breakthrough reserve"
      },
      {
        "col": 36,
        "row": 14,
        "owner": -1,
        "stored": [
          "GIANT",
          "GIANT",
          "GRIZZLY",
          "TITAN"
        ],
        "inventoryTheme": "Breakthrough reserve"
      },
      {
        "col": 14,
        "row": 16,
        "owner": -1,
        "stored": [
          "KILROY",
          "LENET",
          "SLAGGER",
          "HADRIAN",
          "RABBIT",
          "RABBIT"
        ],
        "inventoryTheme": "Combined arms"
      },
      {
        "col": 27,
        "row": 3,
        "owner": -1,
        "stored": [
          "KILROY",
          "LENET",
          "SLAGGER",
          "HADRIAN",
          "RABBIT",
          "RABBIT"
        ],
        "inventoryTheme": "Combined arms"
      },
      {
        "col": 12,
        "row": 11,
        "owner": -1,
        "stored": [
          "BISON",
          "POLAR",
          "TITAN",
          "GRIZZLY",
          "BISON",
          "POLAR",
          "TITAN",
          "GRIZZLY"
        ],
        "inventoryTheme": "Armored reserve"
      },
      {
        "col": 29,
        "row": 8,
        "owner": -1,
        "stored": [
          "BISON",
          "POLAR",
          "TITAN",
          "GRIZZLY",
          "BISON",
          "POLAR",
          "TITAN",
          "GRIZZLY"
        ],
        "inventoryTheme": "Armored reserve"
      }
    ],
    "units": [
      {
        "t": "CHARLIE",
        "o": 0,
        "x": 4,
        "y": 4
      },
      {
        "t": "CHARLIE",
        "o": 1,
        "x": 37,
        "y": 15
      },
      {
        "t": "PANTHER",
        "o": 0,
        "x": 4,
        "y": 3
      },
      {
        "t": "PANTHER",
        "o": 1,
        "x": 37,
        "y": 16
      },
      {
        "t": "RABBIT",
        "o": 0,
        "x": 3,
        "y": 2
      },
      {
        "t": "RABBIT",
        "o": 1,
        "x": 38,
        "y": 17
      },
      {
        "t": "SLAGGER",
        "o": 0,
        "x": 2,
        "y": 3
      },
      {
        "t": "SLAGGER",
        "o": 1,
        "x": 39,
        "y": 16
      },
      {
        "t": "TITAN",
        "o": 0,
        "x": 2,
        "y": 4
      },
      {
        "t": "TITAN",
        "o": 1,
        "x": 39,
        "y": 15
      },
      {
        "t": "OCTOPUS",
        "o": 0,
        "x": 3,
        "y": 4
      },
      {
        "t": "OCTOPUS",
        "o": 1,
        "x": 38,
        "y": 15
      }
    ]
  },
  {
    "name": "SWITCHBACK FJORDS",
    "pack": "AI-made",
    "author": "Codex · original level",
    "source": "levels/switchback-fjords.json",
    "description": "Part 11 · 42×20 · 180-degree rotational symmetry. Long folded fjords run back and forth across the board. Two short diagonal passes let a quick force switch lanes while the main columns negotiate the hairpins. Twelve factories make each capture matter.",
    "special": "12 neutral factories hold 4–8 units each, with equal numbers of one-, two- and three-exit alcoves. Half include a Charlie or Kilroy. Focused teams collectively cover every tank, gun, missile vehicle and anti-air type. Each Atlas or mine follows its own carrier; Pelicans are the only aircraft. Both sides start with Charlie, Panther and Rabbit plus Lenet, Slagger, Hadrian in identical rotated formations.",
    "tags": [
      "part 11",
      "hairpin routes",
      "12 factories",
      "fast armor"
    ],
    "turnLimit": 180,
    "grid": [
      ".hMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM.MMM",
      "M..hMMM-------M-M-M-M-M-.h.---M-M-MMMMhMMM",
      "MMM..--h..h..h-.-h-.-.-w---..h-h-.----.MMM",
      "MM.B-..MMMMMMM.M.M.h-M.MMFMMMM.MhM.hhh--..",
      "MM.-.MMMMMMMMMMMMMM.-hMMMMMMMMMMMMMMM.-FMM",
      "MMM-MMMMMMMMMMF-MMM--...M.MhM.MMFMMMM.-MMM",
      "MMM-M..hhw....-.---..h.h.h......--w...-MMM",
      "MMM-Mh..h..w.MhM.-.M.MhM.M.MhM....-----MMM",
      "MMM-..MMMMMMM.M.M-w.MMMMMMMMMMMMMMMMMM-MMM",
      "MMM-..h..-F-.-.-.-...MMMF-M-M-.-h..hh.-MMM",
      "MMM-.hh..h-.-M-M-FMMM...-.-.-.-F-..h..-MMM",
      "MMM-MMMMMMMMMMMMMMMMMM.w-M.M.MMMMMMM..-MMM",
      "MMM-----....MhM.M.MhM.M.-.MhM.w..h..hM-MMM",
      "MMM-...w--......h.h.h..---.-....whh..M-MMM",
      "MMM-.MMMMFMM.MhM.M...--MMM-FMMMMMMMMMM-MMM",
      "MMF-.MMMMMMMMMMMMMMMh-.MMMMMMMMMMMMMM.-.MM",
      "..--hhh.MhM.MMMMFMM.M-h.M.M.MMMMMMM..-B.MM",
      "MMM.----.-h-h..---w-.-.-h-.-h..h..h--..MMM",
      "MMMhMMMM-M-M---.h.-M-M-M-M-M-------MMMh..M",
      "MMM.MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMh."
    ],
    "buildings": [
      {
        "col": 3,
        "row": 3,
        "owner": 0
      },
      {
        "col": 38,
        "row": 16,
        "owner": 1
      },
      {
        "col": 16,
        "row": 16,
        "owner": -1,
        "inventoryTheme": "Fast armor",
        "stored": [
          "CHARLIE",
          "BISON",
          "LENET",
          "SLAGGER",
          "SLAGGER"
        ]
      },
      {
        "col": 25,
        "row": 3,
        "owner": -1,
        "inventoryTheme": "Fast armor",
        "stored": [
          "CHARLIE",
          "BISON",
          "LENET",
          "SLAGGER",
          "SLAGGER"
        ]
      },
      {
        "col": 14,
        "row": 5,
        "owner": -1,
        "inventoryTheme": "Heavy armor",
        "stored": [
          "POLAR",
          "GRIZZLY",
          "TITAN",
          "GIANT"
        ]
      },
      {
        "col": 27,
        "row": 14,
        "owner": -1,
        "inventoryTheme": "Heavy armor",
        "stored": [
          "POLAR",
          "GRIZZLY",
          "TITAN",
          "GIANT"
        ]
      },
      {
        "col": 2,
        "row": 15,
        "owner": -1,
        "inventoryTheme": "Mixed battery",
        "stored": [
          "KILROY",
          "HADRIAN",
          "OCTOPUS",
          "SEEKER",
          "SEEKER"
        ]
      },
      {
        "col": 39,
        "row": 4,
        "owner": -1,
        "inventoryTheme": "Mixed battery",
        "stored": [
          "KILROY",
          "HADRIAN",
          "OCTOPUS",
          "SEEKER",
          "SEEKER"
        ]
      },
      {
        "col": 9,
        "row": 14,
        "owner": -1,
        "inventoryTheme": "Siege engineers",
        "stored": [
          "MULE",
          "ATLAS",
          "MULE",
          "TRIGGER"
        ]
      },
      {
        "col": 32,
        "row": 5,
        "owner": -1,
        "inventoryTheme": "Siege engineers",
        "stored": [
          "MULE",
          "ATLAS",
          "MULE",
          "TRIGGER"
        ]
      },
      {
        "col": 17,
        "row": 10,
        "owner": -1,
        "inventoryTheme": "Missile screen",
        "stored": [
          "CHARLIE",
          "RABBIT",
          "LYNX",
          "HAWKEYE",
          "LENET",
          "LENET"
        ]
      },
      {
        "col": 24,
        "row": 9,
        "owner": -1,
        "inventoryTheme": "Missile screen",
        "stored": [
          "CHARLIE",
          "RABBIT",
          "LYNX",
          "HAWKEYE",
          "LENET",
          "LENET"
        ]
      },
      {
        "col": 10,
        "row": 9,
        "owner": -1,
        "inventoryTheme": "Airlift reserve",
        "stored": [
          "PELICAN",
          "ATLAS",
          "TITAN",
          "TITAN",
          "RABBIT",
          "RABBIT",
          "TITAN",
          "RABBIT"
        ]
      },
      {
        "col": 31,
        "row": 10,
        "owner": -1,
        "inventoryTheme": "Airlift reserve",
        "stored": [
          "PELICAN",
          "ATLAS",
          "TITAN",
          "TITAN",
          "RABBIT",
          "RABBIT",
          "TITAN",
          "RABBIT"
        ]
      }
    ],
    "units": [
      {
        "t": "CHARLIE",
        "o": 0,
        "x": 4,
        "y": 4
      },
      {
        "t": "CHARLIE",
        "o": 1,
        "x": 37,
        "y": 15
      },
      {
        "t": "PANTHER",
        "o": 0,
        "x": 4,
        "y": 3
      },
      {
        "t": "PANTHER",
        "o": 1,
        "x": 37,
        "y": 16
      },
      {
        "t": "RABBIT",
        "o": 0,
        "x": 3,
        "y": 2
      },
      {
        "t": "RABBIT",
        "o": 1,
        "x": 38,
        "y": 17
      },
      {
        "t": "LENET",
        "o": 0,
        "x": 2,
        "y": 3
      },
      {
        "t": "LENET",
        "o": 1,
        "x": 39,
        "y": 16
      },
      {
        "t": "SLAGGER",
        "o": 0,
        "x": 2,
        "y": 4
      },
      {
        "t": "SLAGGER",
        "o": 1,
        "x": 39,
        "y": 15
      },
      {
        "t": "HADRIAN",
        "o": 0,
        "x": 3,
        "y": 4
      },
      {
        "t": "HADRIAN",
        "o": 1,
        "x": 38,
        "y": 15
      }
    ]
  },
  {
    "name": "DELTA CROSSINGS",
    "pack": "AI-made",
    "author": "Codex · original level",
    "source": "levels/delta-crossings.json",
    "description": "Part 12 · 42×20 · 180-degree rotational symmetry. Braided fjords feed a two-hex valley river down the middle of the battlefield. Three bridge crossings carry the ground war; Pelicans can shift a force across the river away from those gates. Twenty-four factories crowd the banks and tributaries.",
    "special": "24 neutral factories hold 4–8 units each, with equal numbers of one-, two- and three-exit alcoves. Half include a Charlie or Kilroy. Focused teams collectively cover every tank, gun, missile vehicle and anti-air type. Each Atlas or mine follows its own carrier; Pelicans are the only aircraft. Both sides start with Charlie, Panther and Rabbit plus Polar, Lynx, Pelican in identical rotated formations.",
    "tags": [
      "part 12",
      "valley river",
      "three crossings",
      "24 factories"
    ],
    "turnLimit": 180,
    "grid": [
      "hwMMMMMMMMMMMMMMMMMMvvMMMMMMMMMMMMMMMM.MMM",
      "M...MMMMMMMMMMMMMMMMvvMMMMMMMMMMMMMMMM.MMM",
      "MMM.MMMMMMFMM.M.M-F-vvMMFMM.hw.-hw.....MMM",
      "MM.B..h..w--...--.--vv.h--.-.--.--.-..h.w.",
      "MM..-h.....h---M...-vv.h.M-M-MMMMM-FMM.MMM",
      "MMM.-MMM.MMMM-MMMM--==w.MMMM-FMMMMMMMM-FMM",
      "MMM.-MMMMMMMM--MMMFMvvMMMMMM--MMFMMMMM--MM",
      "MMMw-MMMMMMMM-FMMMMMvvMFMhM..-.--.M.MM-MMM",
      "MMM.--MMFMM.M-M.M.MhvvM--..wMM--.....M-MMM",
      "MMM--.---..--.--.h..==-.--..MMM---...M-FMM",
      "MMF-M...---MMM..--.-==..h.--.--..---.--MMM",
      "MMM-M.....--MMw..--MvvhM.M.M-M.MMFMM--.MMM",
      "MMM-MM.M.--.-..MhMFMvvMMMMMF-MMMMMMMM-wMMM",
      "MM--MMMMMFMM--MMMMMMvvMFMMM--MMMMMMMM-.MMM",
      "MMF-MMMMMMMMF-MMMM.w==--MMMM-MMMM.MMM-.MMM",
      "MMM.MMF-MMMMM-M-M.h.vv-...M---h.....h-..MM",
      ".w.h..-.--.--.-.--h.vv--.--...--w..h..B.MM",
      "MMM.....wh-.wh.MMFMMvv-F-M.M.MMFMMMMMM.MMM",
      "MMM.MMMMMMMMMMMMMMMMvvMMMMMMMMMMMMMMMM...M",
      "MMM.MMMMMMMMMMMMMMMMvvMMMMMMMMMMMMMMMMMMwh"
    ],
    "buildings": [
      {
        "col": 3,
        "row": 3,
        "owner": 0
      },
      {
        "col": 38,
        "row": 16,
        "owner": 1
      },
      {
        "col": 17,
        "row": 17,
        "owner": -1,
        "inventoryTheme": "Mixed battery",
        "stored": [
          "KILROY",
          "HADRIAN",
          "OCTOPUS",
          "SEEKER",
          "SEEKER"
        ]
      },
      {
        "col": 24,
        "row": 2,
        "owner": -1,
        "inventoryTheme": "Mixed battery",
        "stored": [
          "KILROY",
          "HADRIAN",
          "OCTOPUS",
          "SEEKER",
          "SEEKER"
        ]
      },
      {
        "col": 6,
        "row": 15,
        "owner": -1,
        "inventoryTheme": "Siege engineers",
        "stored": [
          "MULE",
          "ATLAS",
          "MULE",
          "TRIGGER"
        ]
      },
      {
        "col": 35,
        "row": 4,
        "owner": -1,
        "inventoryTheme": "Siege engineers",
        "stored": [
          "MULE",
          "ATLAS",
          "MULE",
          "TRIGGER"
        ]
      },
      {
        "col": 14,
        "row": 7,
        "owner": -1,
        "inventoryTheme": "Missile screen",
        "stored": [
          "CHARLIE",
          "RABBIT",
          "LYNX",
          "HAWKEYE",
          "LENET",
          "LENET"
        ]
      },
      {
        "col": 27,
        "row": 12,
        "owner": -1,
        "inventoryTheme": "Missile screen",
        "stored": [
          "CHARLIE",
          "RABBIT",
          "LYNX",
          "HAWKEYE",
          "LENET",
          "LENET"
        ]
      },
      {
        "col": 10,
        "row": 2,
        "owner": -1,
        "inventoryTheme": "Airlift reserve",
        "stored": [
          "PELICAN",
          "ATLAS",
          "TITAN",
          "TITAN",
          "RABBIT",
          "RABBIT",
          "TITAN",
          "RABBIT"
        ]
      },
      {
        "col": 31,
        "row": 17,
        "owner": -1,
        "inventoryTheme": "Airlift reserve",
        "stored": [
          "PELICAN",
          "ATLAS",
          "TITAN",
          "TITAN",
          "RABBIT",
          "RABBIT",
          "TITAN",
          "RABBIT"
        ]
      },
      {
        "col": 2,
        "row": 10,
        "owner": -1,
        "inventoryTheme": "Fast armor",
        "stored": [
          "CHARLIE",
          "BISON",
          "LENET",
          "SLAGGER",
          "SLAGGER"
        ]
      },
      {
        "col": 39,
        "row": 9,
        "owner": -1,
        "inventoryTheme": "Fast armor",
        "stored": [
          "CHARLIE",
          "BISON",
          "LENET",
          "SLAGGER",
          "SLAGGER"
        ]
      },
      {
        "col": 18,
        "row": 2,
        "owner": -1,
        "inventoryTheme": "Heavy armor",
        "stored": [
          "POLAR",
          "GRIZZLY",
          "TITAN",
          "GIANT"
        ]
      },
      {
        "col": 23,
        "row": 17,
        "owner": -1,
        "inventoryTheme": "Heavy armor",
        "stored": [
          "POLAR",
          "GRIZZLY",
          "TITAN",
          "GIANT"
        ]
      },
      {
        "col": 8,
        "row": 8,
        "owner": -1,
        "inventoryTheme": "Mixed battery",
        "stored": [
          "KILROY",
          "HADRIAN",
          "OCTOPUS",
          "SEEKER",
          "SEEKER"
        ]
      },
      {
        "col": 33,
        "row": 11,
        "owner": -1,
        "inventoryTheme": "Mixed battery",
        "stored": [
          "KILROY",
          "HADRIAN",
          "OCTOPUS",
          "SEEKER",
          "SEEKER"
        ]
      },
      {
        "col": 18,
        "row": 12,
        "owner": -1,
        "inventoryTheme": "Siege engineers",
        "stored": [
          "MULE",
          "ATLAS",
          "MULE",
          "TRIGGER"
        ]
      },
      {
        "col": 23,
        "row": 7,
        "owner": -1,
        "inventoryTheme": "Siege engineers",
        "stored": [
          "MULE",
          "ATLAS",
          "MULE",
          "TRIGGER"
        ]
      },
      {
        "col": 12,
        "row": 14,
        "owner": -1,
        "inventoryTheme": "Missile screen",
        "stored": [
          "CHARLIE",
          "RABBIT",
          "LYNX",
          "HAWKEYE",
          "LENET",
          "LENET"
        ]
      },
      {
        "col": 29,
        "row": 5,
        "owner": -1,
        "inventoryTheme": "Missile screen",
        "stored": [
          "CHARLIE",
          "RABBIT",
          "LYNX",
          "HAWKEYE",
          "LENET",
          "LENET"
        ]
      },
      {
        "col": 9,
        "row": 13,
        "owner": -1,
        "inventoryTheme": "Airlift reserve",
        "stored": [
          "PELICAN",
          "ATLAS",
          "TITAN",
          "TITAN",
          "RABBIT",
          "RABBIT",
          "TITAN",
          "RABBIT"
        ]
      },
      {
        "col": 32,
        "row": 6,
        "owner": -1,
        "inventoryTheme": "Airlift reserve",
        "stored": [
          "PELICAN",
          "ATLAS",
          "TITAN",
          "TITAN",
          "RABBIT",
          "RABBIT",
          "TITAN",
          "RABBIT"
        ]
      },
      {
        "col": 18,
        "row": 6,
        "owner": -1,
        "inventoryTheme": "Fast armor",
        "stored": [
          "CHARLIE",
          "BISON",
          "LENET",
          "SLAGGER",
          "SLAGGER"
        ]
      },
      {
        "col": 23,
        "row": 13,
        "owner": -1,
        "inventoryTheme": "Fast armor",
        "stored": [
          "CHARLIE",
          "BISON",
          "LENET",
          "SLAGGER",
          "SLAGGER"
        ]
      },
      {
        "col": 2,
        "row": 14,
        "owner": -1,
        "inventoryTheme": "Heavy armor",
        "stored": [
          "POLAR",
          "GRIZZLY",
          "TITAN",
          "GIANT"
        ]
      },
      {
        "col": 39,
        "row": 5,
        "owner": -1,
        "inventoryTheme": "Heavy armor",
        "stored": [
          "POLAR",
          "GRIZZLY",
          "TITAN",
          "GIANT"
        ]
      }
    ],
    "units": [
      {
        "t": "CHARLIE",
        "o": 0,
        "x": 4,
        "y": 4
      },
      {
        "t": "CHARLIE",
        "o": 1,
        "x": 37,
        "y": 15
      },
      {
        "t": "PANTHER",
        "o": 0,
        "x": 4,
        "y": 3
      },
      {
        "t": "PANTHER",
        "o": 1,
        "x": 37,
        "y": 16
      },
      {
        "t": "RABBIT",
        "o": 0,
        "x": 3,
        "y": 2
      },
      {
        "t": "RABBIT",
        "o": 1,
        "x": 38,
        "y": 17
      },
      {
        "t": "POLAR",
        "o": 0,
        "x": 2,
        "y": 3
      },
      {
        "t": "POLAR",
        "o": 1,
        "x": 39,
        "y": 16
      },
      {
        "t": "LYNX",
        "o": 0,
        "x": 2,
        "y": 4
      },
      {
        "t": "LYNX",
        "o": 1,
        "x": 39,
        "y": 15
      },
      {
        "t": "PELICAN",
        "o": 0,
        "x": 3,
        "y": 4
      },
      {
        "t": "PELICAN",
        "o": 1,
        "x": 38,
        "y": 15
      }
    ]
  },
  {
    "name": "CALDERA CIRCUIT",
    "pack": "AI-made",
    "author": "Codex · original level",
    "source": "levels/caldera-circuit.json",
    "description": "Part 13 · 42×20 · 180-degree rotational symmetry. An outer circuit and an inner crater rim offer competing routes around a mountain caldera. Radial passes join the rings, wasteland makes cross-country armor slow, and an isolated ten-hex plain clearing rewards infantry or airlift. Twenty-four factories supply the siege.",
    "special": "24 neutral factories hold 4–8 units each, with equal numbers of one-, two- and three-exit alcoves. Half include a Charlie or Kilroy. Focused teams collectively cover every tank, gun, missile vehicle and anti-air type. Each Atlas or mine follows its own carrier; Pelicans are the only aircraft. Both sides start with Charlie, Panther and Rabbit plus Grizzly, Octopus, Mule in identical rotated formations.",
    "tags": [
      "part 13",
      "concentric routes",
      "wasteland",
      "inner clearing"
    ],
    "turnLimit": 180,
    "grid": [
      "w.MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMwMMM",
      "M.h.MMM-M-M-----.h.w..w.w.M-M-MMMMMMMM.MMM",
      "MMM.h--.-.-w..h-w-w---hh.--h-w------FM.MMM",
      "MM.B-w-w...M.-.--F-wwh---..---......-..h.w",
      "MM....-ww.hMMF-MMMMMMMMFMM.MFM-hh.hh--hMMM",
      "MMMw..-MMMh.MM-MM.M.MwMMMMMMMw-w.M..-h-FMM",
      "MMMww--FMM.w..----whhhw.h...w--MMMM.-.-MMM",
      "MMM..-MMMMMw.--..--M.M...h.--.MMMMM.--wMMM",
      "MMww.-MMMMM--MMMMMFMM.MMMMMF--MMMMMMhw-FMM",
      "MMh..MFMMM.-MMMMMMM....MMMMMM-.-FMMMww--MM",
      "MM--wwMMMF-.-MMMMMM....MMMMMMM-.MMMFM..hMM",
      "MMF-whMMMMMM--FMMMMM.MMFMMMMM--MMMMM-.wwMM",
      "MMMw--.MMMMM.--.h...M.M--..--.wMMMMM-..MMM",
      "MMM-.-.MMMM--w...h.whhhw----..w.MMF--wwMMM",
      "MMF-h-..M.w-wMMMMMMMwM.M.MM-MM.hMMM-..wMMM",
      "MMMh--hh.hh-MFM.MMFMMMMMMMM-FMMh.ww-....MM",
      "w.h..-......---..---hww-F--.-.M...w-w-B.MM",
      "MMM.MF------w-h--.hh---w-w-h..w-.-.--h.MMM",
      "MMM.MMMMMMMM-M-M.w.w..w.h.-----M-M-MMM.h.M",
      "MMMwMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM.w"
    ],
    "buildings": [
      {
        "col": 3,
        "row": 3,
        "owner": 0
      },
      {
        "col": 38,
        "row": 16,
        "owner": 1
      },
      {
        "col": 18,
        "row": 15,
        "owner": -1,
        "inventoryTheme": "Missile screen",
        "stored": [
          "CHARLIE",
          "RABBIT",
          "LYNX",
          "HAWKEYE",
          "LENET",
          "LENET"
        ]
      },
      {
        "col": 23,
        "row": 4,
        "owner": -1,
        "inventoryTheme": "Missile screen",
        "stored": [
          "CHARLIE",
          "RABBIT",
          "LYNX",
          "HAWKEYE",
          "LENET",
          "LENET"
        ]
      },
      {
        "col": 5,
        "row": 17,
        "owner": -1,
        "inventoryTheme": "Airlift reserve",
        "stored": [
          "PELICAN",
          "ATLAS",
          "TITAN",
          "TITAN",
          "RABBIT",
          "RABBIT",
          "TITAN",
          "RABBIT"
        ]
      },
      {
        "col": 36,
        "row": 2,
        "owner": -1,
        "inventoryTheme": "Airlift reserve",
        "stored": [
          "PELICAN",
          "ATLAS",
          "TITAN",
          "TITAN",
          "RABBIT",
          "RABBIT",
          "TITAN",
          "RABBIT"
        ]
      },
      {
        "col": 13,
        "row": 4,
        "owner": -1,
        "inventoryTheme": "Fast armor",
        "stored": [
          "CHARLIE",
          "BISON",
          "LENET",
          "SLAGGER",
          "SLAGGER"
        ]
      },
      {
        "col": 28,
        "row": 15,
        "owner": -1,
        "inventoryTheme": "Fast armor",
        "stored": [
          "CHARLIE",
          "BISON",
          "LENET",
          "SLAGGER",
          "SLAGGER"
        ]
      },
      {
        "col": 9,
        "row": 10,
        "owner": -1,
        "inventoryTheme": "Heavy armor",
        "stored": [
          "POLAR",
          "GRIZZLY",
          "TITAN",
          "GIANT"
        ]
      },
      {
        "col": 32,
        "row": 9,
        "owner": -1,
        "inventoryTheme": "Heavy armor",
        "stored": [
          "POLAR",
          "GRIZZLY",
          "TITAN",
          "GIANT"
        ]
      },
      {
        "col": 18,
        "row": 8,
        "owner": -1,
        "inventoryTheme": "Mixed battery",
        "stored": [
          "KILROY",
          "HADRIAN",
          "OCTOPUS",
          "SEEKER",
          "SEEKER"
        ]
      },
      {
        "col": 23,
        "row": 11,
        "owner": -1,
        "inventoryTheme": "Mixed battery",
        "stored": [
          "KILROY",
          "HADRIAN",
          "OCTOPUS",
          "SEEKER",
          "SEEKER"
        ]
      },
      {
        "col": 2,
        "row": 11,
        "owner": -1,
        "inventoryTheme": "Siege engineers",
        "stored": [
          "MULE",
          "ATLAS",
          "MULE",
          "TRIGGER"
        ]
      },
      {
        "col": 39,
        "row": 8,
        "owner": -1,
        "inventoryTheme": "Siege engineers",
        "stored": [
          "MULE",
          "ATLAS",
          "MULE",
          "TRIGGER"
        ]
      },
      {
        "col": 7,
        "row": 6,
        "owner": -1,
        "inventoryTheme": "Missile screen",
        "stored": [
          "CHARLIE",
          "RABBIT",
          "LYNX",
          "HAWKEYE",
          "LENET",
          "LENET"
        ]
      },
      {
        "col": 34,
        "row": 13,
        "owner": -1,
        "inventoryTheme": "Missile screen",
        "stored": [
          "CHARLIE",
          "RABBIT",
          "LYNX",
          "HAWKEYE",
          "LENET",
          "LENET"
        ]
      },
      {
        "col": 14,
        "row": 11,
        "owner": -1,
        "inventoryTheme": "Airlift reserve",
        "stored": [
          "PELICAN",
          "ATLAS",
          "TITAN",
          "TITAN",
          "RABBIT",
          "RABBIT",
          "TITAN",
          "RABBIT"
        ]
      },
      {
        "col": 27,
        "row": 8,
        "owner": -1,
        "inventoryTheme": "Airlift reserve",
        "stored": [
          "PELICAN",
          "ATLAS",
          "TITAN",
          "TITAN",
          "RABBIT",
          "RABBIT",
          "TITAN",
          "RABBIT"
        ]
      },
      {
        "col": 13,
        "row": 15,
        "owner": -1,
        "inventoryTheme": "Fast armor",
        "stored": [
          "CHARLIE",
          "BISON",
          "LENET",
          "SLAGGER",
          "SLAGGER"
        ]
      },
      {
        "col": 28,
        "row": 4,
        "owner": -1,
        "inventoryTheme": "Fast armor",
        "stored": [
          "CHARLIE",
          "BISON",
          "LENET",
          "SLAGGER",
          "SLAGGER"
        ]
      },
      {
        "col": 6,
        "row": 9,
        "owner": -1,
        "inventoryTheme": "Heavy armor",
        "stored": [
          "POLAR",
          "GRIZZLY",
          "TITAN",
          "GIANT"
        ]
      },
      {
        "col": 35,
        "row": 10,
        "owner": -1,
        "inventoryTheme": "Heavy armor",
        "stored": [
          "POLAR",
          "GRIZZLY",
          "TITAN",
          "GIANT"
        ]
      },
      {
        "col": 2,
        "row": 14,
        "owner": -1,
        "inventoryTheme": "Mixed battery",
        "stored": [
          "KILROY",
          "HADRIAN",
          "OCTOPUS",
          "SEEKER",
          "SEEKER"
        ]
      },
      {
        "col": 39,
        "row": 5,
        "owner": -1,
        "inventoryTheme": "Mixed battery",
        "stored": [
          "KILROY",
          "HADRIAN",
          "OCTOPUS",
          "SEEKER",
          "SEEKER"
        ]
      },
      {
        "col": 17,
        "row": 3,
        "owner": -1,
        "inventoryTheme": "Siege engineers",
        "stored": [
          "MULE",
          "ATLAS",
          "MULE",
          "TRIGGER"
        ]
      },
      {
        "col": 24,
        "row": 16,
        "owner": -1,
        "inventoryTheme": "Siege engineers",
        "stored": [
          "MULE",
          "ATLAS",
          "MULE",
          "TRIGGER"
        ]
      }
    ],
    "units": [
      {
        "t": "CHARLIE",
        "o": 0,
        "x": 4,
        "y": 4
      },
      {
        "t": "CHARLIE",
        "o": 1,
        "x": 37,
        "y": 15
      },
      {
        "t": "PANTHER",
        "o": 0,
        "x": 4,
        "y": 3
      },
      {
        "t": "PANTHER",
        "o": 1,
        "x": 37,
        "y": 16
      },
      {
        "t": "RABBIT",
        "o": 0,
        "x": 3,
        "y": 2
      },
      {
        "t": "RABBIT",
        "o": 1,
        "x": 38,
        "y": 17
      },
      {
        "t": "GRIZZLY",
        "o": 0,
        "x": 2,
        "y": 3
      },
      {
        "t": "GRIZZLY",
        "o": 1,
        "x": 39,
        "y": 16
      },
      {
        "t": "OCTOPUS",
        "o": 0,
        "x": 2,
        "y": 4
      },
      {
        "t": "OCTOPUS",
        "o": 1,
        "x": 39,
        "y": 15
      },
      {
        "t": "MULE",
        "o": 0,
        "x": 3,
        "y": 4
      },
      {
        "t": "MULE",
        "o": 1,
        "x": 38,
        "y": 15
      }
    ]
  },
  {
    "name": "FAULTLINE STEPS",
    "pack": "AI-made",
    "author": "Codex · original level",
    "source": "levels/faultline-steps.json",
    "description": "Part 14 · 42×20 · 180-degree rotational symmetry. Diagonal mountain fingers divide a succession of stepped passes. Hill cover dominates the side routes, making the sparse roads especially valuable to slow heavy armor. Twelve factory alcoves are spread across the ridge fronts.",
    "special": "12 neutral factories hold 4–8 units each, with equal numbers of one-, two- and three-exit alcoves. Half include a Charlie or Kilroy. Focused teams collectively cover every tank, gun, missile vehicle and anti-air type. Each Atlas or mine follows its own carrier; Pelicans are the only aircraft. Both sides start with Charlie, Panther and Rabbit plus Giant, Titan, Seeker in identical rotated formations.",
    "tags": [
      "part 14",
      "diagonal ridges",
      "hill cover",
      "heavy armor"
    ],
    "turnLimit": 180,
    "grid": [
      "h.MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM.MMM",
      "M.MMMMMhMhM.MhMhMMMMMMMMMMMMM-MMMMMMMM.MMM",
      "..M.w.h.hww.hhh.h---MMMMFMMMM-FMMMMMF-hMMM",
      "...B.h....hMh-.--h..---------h-------h.h..",
      "MM..--hhMMMMMF-...MM.hhh-hMMMMMMMMMMMM.MMM",
      "MMMh.h--.hMMMM-whhhwMM.M--h.MMMMMMMMMM.MMM",
      "MMMhMM.h--.hMM-hMM.hMMMMMM--.MMMMMMMMM.MMM",
      "MMMhMMM..M--M--MMMMh.hMhMMMM-.MMMMMMMM.MMM",
      "MMM.MMMMMMMh-.hMMMM.hhh.h-FM--hhMMMMMMhMMM",
      "MMMhMMMF--M.--hhMMMMhMh.h.--M---.MMMMM.MMM",
      "MMM.MMMMM.---M--.h.hMhMMMMhh--.M--FMMMhMMM",
      "MMMhMMMMMMhh--MF-h.hhh.MMMMh.-hMMMMMMM.MMM",
      "MMM.MMMMMMMM.-MMMMhMh.hMMMM--M--M..MMMhMMM",
      "MMM.MMMMMMMMM.--MMMMMMh.MMh-MMh.--h.MMhMMM",
      "MMM.MMMMMMMMMM.h--M.MMwhhhw-MMMMh.--h.hMMM",
      "MMM.MMMMMMMMMMMMh-hhh.MM...-FMMMMMhh--..MM",
      "..h.h-------h---------..h--.-hMh....h.B...",
      "MMMh-FMMMMMF-MMMMFMMMM---h.hhh.wwh.h.w.M..",
      "MMM.MMMMMMMM-MMMMMMMMMMMMMhMhM.MhMhMMMMM.M",
      "MMM.MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM.h"
    ],
    "buildings": [
      {
        "col": 3,
        "row": 3,
        "owner": 0
      },
      {
        "col": 38,
        "row": 16,
        "owner": 1
      },
      {
        "col": 17,
        "row": 17,
        "owner": -1,
        "inventoryTheme": "Fast armor",
        "stored": [
          "CHARLIE",
          "BISON",
          "LENET",
          "SLAGGER",
          "SLAGGER"
        ]
      },
      {
        "col": 24,
        "row": 2,
        "owner": -1,
        "inventoryTheme": "Fast armor",
        "stored": [
          "CHARLIE",
          "BISON",
          "LENET",
          "SLAGGER",
          "SLAGGER"
        ]
      },
      {
        "col": 5,
        "row": 17,
        "owner": -1,
        "inventoryTheme": "Heavy armor",
        "stored": [
          "POLAR",
          "GRIZZLY",
          "TITAN",
          "GIANT"
        ]
      },
      {
        "col": 36,
        "row": 2,
        "owner": -1,
        "inventoryTheme": "Heavy armor",
        "stored": [
          "POLAR",
          "GRIZZLY",
          "TITAN",
          "GIANT"
        ]
      },
      {
        "col": 13,
        "row": 4,
        "owner": -1,
        "inventoryTheme": "Mixed battery",
        "stored": [
          "KILROY",
          "HADRIAN",
          "OCTOPUS",
          "SEEKER",
          "SEEKER"
        ]
      },
      {
        "col": 28,
        "row": 15,
        "owner": -1,
        "inventoryTheme": "Mixed battery",
        "stored": [
          "KILROY",
          "HADRIAN",
          "OCTOPUS",
          "SEEKER",
          "SEEKER"
        ]
      },
      {
        "col": 7,
        "row": 9,
        "owner": -1,
        "inventoryTheme": "Siege engineers",
        "stored": [
          "MULE",
          "ATLAS",
          "MULE",
          "TRIGGER"
        ]
      },
      {
        "col": 34,
        "row": 10,
        "owner": -1,
        "inventoryTheme": "Siege engineers",
        "stored": [
          "MULE",
          "ATLAS",
          "MULE",
          "TRIGGER"
        ]
      },
      {
        "col": 15,
        "row": 11,
        "owner": -1,
        "inventoryTheme": "Missile screen",
        "stored": [
          "CHARLIE",
          "RABBIT",
          "LYNX",
          "HAWKEYE",
          "LENET",
          "LENET"
        ]
      },
      {
        "col": 26,
        "row": 8,
        "owner": -1,
        "inventoryTheme": "Missile screen",
        "stored": [
          "CHARLIE",
          "RABBIT",
          "LYNX",
          "HAWKEYE",
          "LENET",
          "LENET"
        ]
      },
      {
        "col": 11,
        "row": 17,
        "owner": -1,
        "inventoryTheme": "Airlift reserve",
        "stored": [
          "PELICAN",
          "ATLAS",
          "TITAN",
          "TITAN",
          "RABBIT",
          "RABBIT",
          "TITAN",
          "RABBIT"
        ]
      },
      {
        "col": 30,
        "row": 2,
        "owner": -1,
        "inventoryTheme": "Airlift reserve",
        "stored": [
          "PELICAN",
          "ATLAS",
          "TITAN",
          "TITAN",
          "RABBIT",
          "RABBIT",
          "TITAN",
          "RABBIT"
        ]
      }
    ],
    "units": [
      {
        "t": "CHARLIE",
        "o": 0,
        "x": 4,
        "y": 4
      },
      {
        "t": "CHARLIE",
        "o": 1,
        "x": 37,
        "y": 15
      },
      {
        "t": "PANTHER",
        "o": 0,
        "x": 4,
        "y": 3
      },
      {
        "t": "PANTHER",
        "o": 1,
        "x": 37,
        "y": 16
      },
      {
        "t": "RABBIT",
        "o": 0,
        "x": 3,
        "y": 2
      },
      {
        "t": "RABBIT",
        "o": 1,
        "x": 38,
        "y": 17
      },
      {
        "t": "GIANT",
        "o": 0,
        "x": 2,
        "y": 3
      },
      {
        "t": "GIANT",
        "o": 1,
        "x": 39,
        "y": 16
      },
      {
        "t": "TITAN",
        "o": 0,
        "x": 2,
        "y": 4
      },
      {
        "t": "TITAN",
        "o": 1,
        "x": 39,
        "y": 15
      },
      {
        "t": "SEEKER",
        "o": 0,
        "x": 3,
        "y": 4
      },
      {
        "t": "SEEKER",
        "o": 1,
        "x": 38,
        "y": 15
      }
    ]
  },
  {
    "name": "POCKET SIEGE",
    "pack": "AI-made",
    "author": "Codex · original level",
    "source": "levels/pocket-siege.json",
    "description": "Part 15 · 42×20 · 180-degree rotational symmetry. Four small battle chambers are linked by dogleg throats and a long route around the flanks. Each chamber gives artillery a staging area, but reinforcements must file through the narrow approaches. Twelve factories and two isolated five-hex clearings make transport timing matter.",
    "special": "12 neutral factories hold 4–8 units each, with equal numbers of one-, two- and three-exit alcoves. Half include a Charlie or Kilroy. Focused teams collectively cover every tank, gun, missile vehicle and anti-air type. Each Atlas or mine follows its own carrier; Pelicans are the only aircraft. Both sides start with Charlie, Panther and Rabbit plus Polar, Hadrian, Pelican in identical rotated formations.",
    "tags": [
      "part 15",
      "four chambers",
      "narrow throats",
      "airlift"
    ],
    "turnLimit": 180,
    "grid": [
      ".hMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM.MMM",
      "M...MMMMMMM.M-M-M.M.MMMMMMMMMMMMMMMMMMhMMM",
      "MMM.w..wh..--h-.--.-h.w.h.MMFMMMMMMMMMhMMM",
      "MM.B..MM.h-MhM.--M-M------.-----h.h---h-..",
      "MM..--MMM--MM.MMFMMMMMMMM.-.MMM.---MMM-FMM",
      "MMM.M-----FM...MMMMMMMMMw.-.MMh.wM-.MM-MMM",
      "MMM.M-hwhhMMMM.MMMMMMMMMw.-..M.MMM--.M.MMM",
      "MMM.M-...wMMMMMMMMMMMMMM..-..MMMMMMM-hhMMM",
      "MMM.M.--wMMMMMMMMMMMMMMh.M-MMMMMMMMM-.hMMM",
      "MMM.M--FMMMMMMMMMMM.h.h..MFMMMMMMMMM-hhMMM",
      "MMMhh-MMMMMMMMMFM..h.h.MMMMMMMMMMMF--M.MMM",
      "MMMh.-MMMMMMMMM-M.hMMMMMMMMMMMMMMw--.M.MMM",
      "MMMhh-MMMMMMM..-..MMMMMMMMMMMMMMw...-M.MMM",
      "MMM.M.--MMM.M..-.wMMMMMMMMM.MMMMhhwh-M.MMM",
      "MMM-MM.-Mw.hMM.-.wMMMMMMMMM...MF-----M.MMM",
      "MMF-MMM---.MMM.-.MMMMMMMMFMM.MM--MMM--..MM",
      "..-h---h.h-----.------M-M--.MhM-h.MM..B.MM",
      "MMMhMMMMMMMMMFMM.h.w.h-.--.-h--..hw..w.MMM",
      "MMMhMMMMMMMMMMMMMMMMMM.M.M-M-M.MMMMMMM...M",
      "MMM.MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMh."
    ],
    "buildings": [
      {
        "col": 3,
        "row": 3,
        "owner": 0
      },
      {
        "col": 38,
        "row": 16,
        "owner": 1
      },
      {
        "col": 13,
        "row": 17,
        "owner": -1,
        "inventoryTheme": "Mixed battery",
        "stored": [
          "KILROY",
          "HADRIAN",
          "OCTOPUS",
          "SEEKER",
          "SEEKER"
        ]
      },
      {
        "col": 28,
        "row": 2,
        "owner": -1,
        "inventoryTheme": "Mixed battery",
        "stored": [
          "KILROY",
          "HADRIAN",
          "OCTOPUS",
          "SEEKER",
          "SEEKER"
        ]
      },
      {
        "col": 16,
        "row": 4,
        "owner": -1,
        "inventoryTheme": "Siege engineers",
        "stored": [
          "MULE",
          "ATLAS",
          "MULE",
          "TRIGGER"
        ]
      },
      {
        "col": 25,
        "row": 15,
        "owner": -1,
        "inventoryTheme": "Siege engineers",
        "stored": [
          "MULE",
          "ATLAS",
          "MULE",
          "TRIGGER"
        ]
      },
      {
        "col": 2,
        "row": 15,
        "owner": -1,
        "inventoryTheme": "Missile screen",
        "stored": [
          "CHARLIE",
          "RABBIT",
          "LYNX",
          "HAWKEYE",
          "LENET",
          "LENET"
        ]
      },
      {
        "col": 39,
        "row": 4,
        "owner": -1,
        "inventoryTheme": "Missile screen",
        "stored": [
          "CHARLIE",
          "RABBIT",
          "LYNX",
          "HAWKEYE",
          "LENET",
          "LENET"
        ]
      },
      {
        "col": 15,
        "row": 10,
        "owner": -1,
        "inventoryTheme": "Airlift reserve",
        "stored": [
          "PELICAN",
          "ATLAS",
          "TITAN",
          "TITAN",
          "RABBIT",
          "RABBIT",
          "TITAN",
          "RABBIT"
        ]
      },
      {
        "col": 26,
        "row": 9,
        "owner": -1,
        "inventoryTheme": "Airlift reserve",
        "stored": [
          "PELICAN",
          "ATLAS",
          "TITAN",
          "TITAN",
          "RABBIT",
          "RABBIT",
          "TITAN",
          "RABBIT"
        ]
      },
      {
        "col": 7,
        "row": 9,
        "owner": -1,
        "inventoryTheme": "Fast armor",
        "stored": [
          "CHARLIE",
          "BISON",
          "LENET",
          "SLAGGER",
          "SLAGGER"
        ]
      },
      {
        "col": 34,
        "row": 10,
        "owner": -1,
        "inventoryTheme": "Fast armor",
        "stored": [
          "CHARLIE",
          "BISON",
          "LENET",
          "SLAGGER",
          "SLAGGER"
        ]
      },
      {
        "col": 10,
        "row": 5,
        "owner": -1,
        "inventoryTheme": "Heavy armor",
        "stored": [
          "POLAR",
          "GRIZZLY",
          "TITAN",
          "GIANT"
        ]
      },
      {
        "col": 31,
        "row": 14,
        "owner": -1,
        "inventoryTheme": "Heavy armor",
        "stored": [
          "POLAR",
          "GRIZZLY",
          "TITAN",
          "GIANT"
        ]
      }
    ],
    "units": [
      {
        "t": "CHARLIE",
        "o": 0,
        "x": 4,
        "y": 4
      },
      {
        "t": "CHARLIE",
        "o": 1,
        "x": 37,
        "y": 15
      },
      {
        "t": "PANTHER",
        "o": 0,
        "x": 4,
        "y": 3
      },
      {
        "t": "PANTHER",
        "o": 1,
        "x": 37,
        "y": 16
      },
      {
        "t": "RABBIT",
        "o": 0,
        "x": 3,
        "y": 2
      },
      {
        "t": "RABBIT",
        "o": 1,
        "x": 38,
        "y": 17
      },
      {
        "t": "POLAR",
        "o": 0,
        "x": 2,
        "y": 3
      },
      {
        "t": "POLAR",
        "o": 1,
        "x": 39,
        "y": 16
      },
      {
        "t": "HADRIAN",
        "o": 0,
        "x": 2,
        "y": 4
      },
      {
        "t": "HADRIAN",
        "o": 1,
        "x": 39,
        "y": 15
      },
      {
        "t": "PELICAN",
        "o": 0,
        "x": 3,
        "y": 4
      },
      {
        "t": "PELICAN",
        "o": 1,
        "x": 38,
        "y": 15
      }
    ]
  }
];

if (typeof module !== "undefined") module.exports = AI_MADE_LEVELS;
