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
  }
];

if (typeof module !== "undefined") module.exports = AI_MADE_LEVELS;
