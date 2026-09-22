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
    "description": "Part 7 cuts narrow, angular fjords through mountain ridges. Long two- and three-hex channels branch toward 21 terminal factories, with only 3 small junction clearings and a few connecting passes. Each corner camp starts with exactly one Charlie, one Panther motorcycle infantry and one Rabbit missile buggy.",
    "special": "Each of the 21 neutral factories holds 4–8 units in a focused or mixed team; none contains infantry. Exactly 7 factories each have one, two or three road exits, all facing down their fjord. Atlas guns and mines follow their own Mule or Pelican. Pelicans are the only aircraft. Protect your two capturing units: there are no infantry reinforcements.",
    "tags": [
      "part 7",
      "narrow fjords",
      "21 factories",
      "3-unit start"
    ],
    "turnLimit": 180,
    "grid": [
      "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM",
      "MMMMMww.MhMMMMMMMMMMMMMMMMMMMMMMMMM.MMMMMMMMMMMMMMMMMMMMMM",
      "MMM.w---h-.wMMMMMMMMMMMMMMMMMMMMMw.-..w.MMMMMMMMMMMMMMMMMM",
      "MMwB.hww-.-.MMMMMMMFMMMMMMMhM.Mw.--.----.whw.MMMMMMMMh.hMM",
      "MMw..MMMh.-.MMMMMMM-MhMMM.h-h-.--wwMh.h.-----hMMMMMM.--wMM",
      "MMMMMMMMM.--.MMMMMhh--w..--.-.-h.MMMMMM.--.h--h..wMMh--.MM",
      "MMMMMMMMMMw-.MMMMMMM.-----hM.M.MMMMMMMMMh-.Mh-----hh---.MM",
      "MMMMMMMMMMh-.MMMMMMM.h..w-hMMMMMMMMMMMMh.-hM-.hMMM----.MMM",
      "MMMMMMMMMM.-.MMMMMMMMMMMM-.MMMMMMMMMMMMw-hh.-hMMMMMhw-.MMM",
      "MMMMMMMMMMh-hMMMMMMMMMM..-hMMMM.MMMMMMM.--w---MMMMMh-.hMMM",
      "MMMMMMMMMh.-wwh.h.MMMMMh-..hMhh-.MMMMMM.-.-.--hwMMM.-wMMMM",
      "MMMMM-..w-h--------MMMMh--.-.---.MMMMMMw--.M.h-.MMM.--hMMM",
      "MMMMMF---w--..wMh-FMMMM.-h-M-M.-..MMMMMM.-hMMM.MMMMMh-.wMM",
      "MMMMMMMMMMh.-..MMMMMMMMw--.MMMww-wMMMMMMh-h.MMMMMMMMhh-hMM",
      "MMMMMMMMMMM.-.MMMMMMMMMM.-.MMMMh-wMMMMMM.w-wMMMMMMMMMh--.M",
      "MMMMMMMh..w--hMMMMMMMMMM.-.MMMMh-hMMMMMMh--hMMMMMMMMMMw-.M",
      "MMMMMMh---.-hMMhM.hhMMMMw-w.MMMw-wMMMMM.w-hMMMMMMMMMM.h-.M",
      "MMMMMF-hh--.whh-.--hMMMM.--MMMM.--hMMMM---hMMMMMMMMMM.-whM",
      "MMMMMMMMh.-----M-.-hMMMMMMFMMMMMh-wMMMMMFMMMMMMMMMMMM.-.MM",
      "MMMMMMMMM.--hMMMMM-.MMMMMMMMMMMMh-.MMMMMMMMMM.MFMMMMM.-.MM",
      "MMMMMMMMMMh-wMMMMM-.MMMMMMMMMMMMw-hMMMMMMMMMM.-MMMMMMw-.MM",
      "MMMMMMMMMMMM-hMMMM-.MMMMMMMMMMMMh-.MMMMMMMMMM--hMMMMh--.MM",
      "MMMMMMMMMMMM--MMMM-hMMMMMMMMMhM.-..MMMMMMMMMM-.MMMMM.-wMMM",
      "MMMMMMMMMMMw.-.wMw-.MMMMMMMh.-.--.MMMMMMMhh.-.wMMMMMh-wMMM",
      "MMMMMMMMMMM.----.--hww..h.h--.--..MMMMMhh-----MMMMMMh-h.MM",
      "MMMMMFMMMMMh-.hM-h---------hMMh.--h.MM.--hh-.-wMMMMM.---MM",
      "MMMMM--MMMh--.MMMMww..h.h..MMMMM.M--.w.-hMh.--.MMMMMMMFMMM",
      "MMMMw-wMMw.-.MMMMMMMMMMMMMMMMMMMMMMM---MMMMM.-hhMMMMMMMMMM",
      "MMMM.-.MM.-whMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMhh-.MMMMMMMMMM",
      "MMMM.-hMM.-.MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM.--.M.MMMMMMMM",
      "MMMwh-hMM.-.w.MMMMMMMMMMM-MMMMMMMMMhh.MMMhw.w-...-whMMMMMM",
      "MMMh-w.Mwh-..hM.M.MMMMMMF-.wMMMMMw.---h..--------.--h.MMMM",
      "MMM.--.w.---h-.-.-MFMMMMM.--.wM..--.h.--w-h..hh.hMwh--hMMM",
      "MMMMh-h----h-h-.-w-MMMMMMMhh--.--h.MMM.h-h.MMMMMMMMMh-hMMM",
      "MMMMMM-M.-.MhMhM.M.MMMMMMMMM..--.MMMMMM.-hMMMMMMMMMM..-hMM",
      "MMMMMMM.h-hMMMMMMMMMMMMMMMMMMMw-.MMMMMMw-hMMMMMMMMMMMM-.MM",
      "MMMMMMMh-..MMMMMMMMMMMMMMMMMMMM-.MMMMMM.-.MMMMMMMMMMM.-hMM",
      "MMMMMMM.--.MMMMMMMMMMMMMMMMMMMM-hMMMMMM.-hMMMMMMMMMMMM-MMM",
      "MMMMMMMMh-.hMMMMMMMMMMMMMMMMMMM-.MMMMMM.--w.MhMMMMMMMMFMMM",
      "MMMMMF-...-w.wMhMMMMMMMMMMMMMMw-hMMMMMMh-.--h--MMMMMMMMMMM",
      "MMMMM--hMh----.-MFMMMM.-FMMMMM.-hMMMMMMw-.hw--FMMMMMMMMMMM",
      "MMMMMw--h.--hh-h-MMMMMh--MMMMM.-.MMMMMM.-wMMhMMMMMMMMMMMMM",
      "MMMMM.w-hM.-.M.MhMMMMM-.hMMMMM.-.MMMMMM.-.MMMMMMMMMMMMMMMM",
      "MMMMh--..Mh-hMMMMMMMMM-.MMMMMMM-.MMMMMh.-..MMMMMMMMMMMMMMM",
      "MMM..-.MMMh-hhwhw.h.M.--MMMMMMM-wMMMMhh.-..hMMMMMMMh..MMMM",
      "MMMh--..MM.-.-------h-.-.hMMMMMw-wMhh-h-----.w.whhh--hMMMM",
      "MMMh-w-.Mwh--hh.whh--h---.MMMMM.--h--h-h--..-------h-hMMMM",
      "MMM.-.--h--.hMMMMMhw-hwh-hMMMMMh-.-wwMhMw-.M.-wh.hw--.MMMM",
      "MMM.-.ww-.wMMMMMMMM.-hMMhMMMMMM.-.hMMMMMh-wM..-.MMh-.MMMMM",
      "MMMh-.MM.MMMMMMMMMMw-.MMMMMMMMMh-.MMMMMhh-wMMw-hMM.-.MMMMM",
      "MMMh-.MMMMMMMMMMMM.--.MMMMMMMMM.-hMMMMMh-hwMM.-.MM.-..MMMM",
      "MMh--hMMMMMMM-w..h.-hMMMMMMMMMMw-.MMMMw--.MMM.--hMw.-wMMMM",
      "MMh-wMMMMMMMF-------.MMMMMMMMMM.-.MMMM-FMMMMMM.-hMM.--hMMM",
      "MM.-.MMMMMMM-.w.h....MMMMMMMM..--hMMMMMMMMMMMM-F-MMM....MM",
      "MM-FMMMMMMMMMMMMMMMMMMMMMMF-w--hhMMMMMMMMMMMMMMMMMMM.hB.MM",
      "MMMMMMMMMMMMMMMMMMMMMMMMMMMh-h.MMMMMMMMMMMMMMMMMMMMMMMwMMM",
      "MMMMMMMMMMMMMMMMMMMMMMMMMMMM.MMMMMMMMMMMMMMMMMMMMMMMMMMMMM",
      "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM"
    ],
    "buildings": [
      {
        "col": 3,
        "row": 3,
        "owner": 0
      },
      {
        "col": 54,
        "row": 54,
        "owner": 1
      },
      {
        "col": 19,
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
        "col": 5,
        "row": 12,
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
        "col": 18,
        "row": 12,
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
        "col": 5,
        "row": 17,
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
        "col": 26,
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
        "col": 40,
        "row": 18,
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
        "col": 47,
        "row": 19,
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
        "col": 5,
        "row": 25,
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
        "col": 54,
        "row": 26,
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
        "col": 19,
        "row": 32,
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
        "col": 24,
        "row": 31,
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
        "col": 5,
        "row": 39,
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
        "col": 17,
        "row": 40,
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
        "col": 24,
        "row": 40,
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
        "col": 46,
        "row": 40,
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
        "col": 54,
        "row": 38,
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
        "col": 3,
        "row": 54,
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
        "col": 12,
        "row": 52,
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
        "col": 26,
        "row": 54,
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
        "col": 39,
        "row": 52,
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
        "col": 47,
        "row": 53,
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
        "x": 53,
        "y": 53
      },
      {
        "t": "PANTHER",
        "o": 1,
        "x": 54,
        "y": 53
      },
      {
        "t": "RABBIT",
        "o": 1,
        "x": 55,
        "y": 53
      }
    ]
  }
];

if (typeof module !== "undefined") module.exports = AI_MADE_LEVELS;
