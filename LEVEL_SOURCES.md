# Level library, sources, and sharing

## Included online expansion: Lunar Frontiers

The web edition includes twelve original scenarios in
[`js/data-expansion-maps.js`](js/data-expansion-maps.js). Each level card in
the game shows its description, distinguishing mechanic, tags, author, and a
source-data link. These maps were made for this project; they do not reproduce
commercial Nectaris map layouts.

| Level | Design focus |
|---|---|
| Bridgehead | Two crossings, artillery lanes, rapid front-switching |
| High Ground | Foot-only mountain route and summit factory |
| Airlift | Infantry transport into valley-enclosed bases |
| Factory Race | Four neutral factories with role-specific stored units |
| Long Reach | Atlas repositioning and interlocking artillery |
| Encirclement | Compact support-fire and surround geometry |
| Scrapyard | Wasteland cover versus exposed road speed |
| Skyhook | Fighter, interceptor, multirole and anti-air priorities |
| Convoy | Protecting two transport types across a long map |
| Citadel | Mined gates, fortress guns and an air corridor |
| Crosswinds | Rabbit/Lynx movement-after-attack tactics |
| Grand Lunar | 20×12 combined-arms battle across four fronts |

## Installing levels from the web

The mission menu accepts a raw JSON URL. It accepts:

1. One level object using the schema in `README.md`.
2. An array of level objects.
3. An object with a `levels` array.

Raw GitHub and Gist URLs provide the needed cross-origin response headers.
The importer validates every map with the game engine before saving it to
browser storage. An HTTP, JSON, terrain, or unit error is shown with the
specific failure; invalid data is not installed.

Example publishing flow:

1. Export a level from `editor.html`.
2. Commit the JSON to a public repository or Gist.
3. Open the file's **Raw** URL.
4. Paste that URL into **Install from URL** on the mission menu.

## Included campaign: official Hudson normal campaign

`js/data-maps.js` reproduces all 16 normal-campaign maps: dimensions, terrain
types, building ownership, field deployments and factory inventories. The
project owner confirmed redistribution permission on 2026-09-03.

The canonical source is Hudson's official 1997 Windows freeware port, described
by Hudson as a PC Engine Nectaris remake. The generated data came from the
1997-11-05 `Nec.exe` build with SHA-256
`d3c62eee07e7df1ad9b53ac46b3c69c38e6648ad045710fc4687aa20d10d9f92`.
`tools/extract-original-campaign.js` verifies that digest, decodes the
executable's terrain compression, unit records and factory tables, and emits
the campaign module. The archived
[Hudson edition page](https://web.archive.org/web/20030416131613id_/http://www.hudson.co.jp/gamenavi/gamedb/slg/soft/necwin.html)
and [download page](https://web.archive.org/web/20021020133532id_/http://www.hudson.co.jp/gamenavi/gamedb/slg/down.html)
identify the source. The Win95 installer has SHA-256
`bcd43e7dee31ccefac62d766f2b497245cebe0fed32ec5db2a004c4f12925a8c`.
Original map screenshots and the published rosters at
[Izuito's PC Engine guide](https://izuito.net/game/pce-nectaris/stage.htm)
were used as independent checks. Direct byte equality against a 1989 HuCard ROM
has not been tested, so claims of exactness refer to the official 1997 built-in
campaign data.

Map dimensions record playable cells only. The Windows renderer adds a
non-playable one-hex perimeter, so its 16×11 and 32×22 render buffers correspond
to 15×10 and 30×20 campaign maps. KAISER has one known source discrepancy:
`Nec.exe` and the visible sprite place `KILROY` at `(20,2)`, while Izuito's
roster lists a second `CHARLIE`. The executable record is authoritative here.

The compressed gameplay terrain IDs are `0` plains, `1` road, `2` hills, `3`
wasteland, `4` valley, `5` mountains and `6` bridge. This ordering is verified
against the executable's defense table (`5, 0, 20, 30, 0, 40, 0`) rather than
inferred from scenery appearance. An earlier swapped mapping made eight legal
deployed squads appear to begin on impassable terrain; correcting the decoder
removed all campaign validation failures.

No executable, ROM, screenshot, tile bitmap, unit sprite or sound from the
original release is committed. Only the functional level data and the
reproducible extractor are included.

## Historical Nectaris map archives

Research performed 2026-08-26 found historical fan maps, but no active archive
whose terms permit copying those community files into this repository:

- [BASE NECTARIS history](https://nectaris.tg-16.com/nectaris_legacy_01.html)
  documents Hudson Soft's 1997 Windows map editor, the design-a-map contest,
  and the 44 winning fan maps later included in the PlayStation and Game Boy
  releases. Those winning layouts became commercial game content.
- [BASE NECTARIS downloads](http://www.max.hi-ho.ne.jp/summoner/nectaris/down/index.htm)
  hosts community Windows-map files, but its download notice explicitly asks
  visitors not to republish or reproduce its files without permission. This
  project links to the archive but does not copy it.
- [Nectaris GB Map Converter](https://github.com/SourceK78/nectaris_gb_map_converter)
  is a GPL-3.0 conversion tool. Its repository also contains map binaries from
  the PC and Game Boy releases; the code license does not establish separate
  redistribution permission for the commercial map data, so those binaries
  are not imported here.

Further research 2026-09-01 — where the user-map scene and its discussions
live:

- **BASE NECTARIS downloads are still live** (2004–2005 uploads): 13
  unit-placed original maps (`bn_a001.nmd` … `bn_d001.nmd`, map names taken
  from C standard library functions — ASSERT, WCSTOL, MALLOC, SETJMP…) at
  [stage.htm](http://www.max.hi-ho.ne.jp/summoner/nectaris/down/stage.htm),
  with per-map author hints and design commentary at
  [bn_map/](http://www.max.hi-ho.ne.jp/summoner/nectaris/down/bn_map/index.htm),
  plus blank terrain maps and save data that unlock the Windows version's
  hidden 2-player and preview modes.
- **The BASE NECTARIS BBS** (`max.hi-ho.ne.jp/cgi-bin/user/summoner/nec_bbs.cgi`)
  is offline, but the Wayback Machine holds ~30 captures spanning 2006–2017
  with full period threads: map release announcements, playthrough reports,
  turn-by-turn strategy exchanges, and map-design advice from the site
  admin (Crescent). Example capture:
  [2006-05-03](http://web.archive.org/web/20060503211807/http://www.max.hi-ho.ne.jp:80/cgi-bin/user/summoner/nec_bbs.cgi).
- **NECTARIS' website** (Naoto's Geocities site, terrain-edited original
  maps plus DOS-Nectaris map guides) died with Yahoo! Geocities Japan
  (2019-03) but is archived:
  [2018-11 snapshot](http://web.archive.org/web/20181104001653/http://www.geocities.jp/naoto19690803/index.htm).
  Naoto's maps are the ones dissected in the BASE NECTARIS BBS threads.
- **Nectaris atwiki** ([w.atwiki.jp/nectaris](https://w.atwiki.jp/nectaris/))
  is active: working download links for the Win95/Win98 freeware and
  modern-OS install guides (winevdm for the 16-bit installer, DOSBox Pure,
  Wine, Steam Deck).
- Series history summary with distribution notes:
  [ミリタリー・まとめネス](https://www.ne.jp/asahi/krk/kct/misc/nectaris.htm)
  (notes that Hudson also published PS/GB and Neo-Nectaris-equivalent map
  packs for the Windows version on its own site, now gone).

## Included pack: Base Nectaris Terrain (added 2026-09-01)

`js/data-basenectaris-maps.js` holds twelve scenarios whose hex layouts come
from BASE NECTARIS's **unit-free** map files. That page grants exactly the
permission the pack relies on:

> これらのマップデータにユニットを配置して、他のサイトなどに投稿していたただいてもかまいません。
> ("You may place units on this map data and post it to other sites.")

This is narrower than it looks, so the boundary matters:

| Asset | Status | What we did |
|---|---|---|
| Unit-free terrain (`bnm_*.nmd`) | Explicit grant above | Converted the layouts; ship the derived levels |
| The raw `.nmd` files | Not covered | Not committed; the converter reads files you download |
| Unit-placed scenarios (`bn_*.nmd`) | Site-wide "無断転載禁止" | Not converted, not shipped |
| Crescent's per-map hints and commentary | Same | Not reproduced; our briefings are newly written |
| Windows-edition BMP sprites/tilesets | Hudson/Konami copyright | Not used; the pixel style is original art in the era's idiom |

So the layouts are Crescent's; the rosters, deployments, camp/factory
assignment, turn limits, map names and bilingual briefings are this project's.
`CREALF` (`bnm_d001.nmd`, 32×22) is **excluded**: one of its cells uses tile
index `0x5b`, which appears in no published screenshot, and the converter
raises an error rather than guessing a terrain for it.

### How the format was decoded

`tools/nmd-to-level.js` documents the header layout, which matches the
independent GPL-3.0 tool at
[SourceK78/nectaris_gb_map_converter](https://github.com/SourceK78/nectaris_gb_map_converter).
The hard part was the tile table: a `.nmd` cell stores a *scenery* index, not
a terrain type, and the tileset carries many edge-transition variants per
terrain (195 distinct indices across these maps). The mapping was recovered by
fitting the 32×32 tile grid to the site's published map screenshots, taking a
majority-vote image per index across 13 maps, and reading the terrain off each
tile's centre — edges blend into neighbours, the centre does not. The result
was checked by re-rendering each map as false colour beside its screenshot.
The resulting table is functional data about a file format, in the same
category as the stat and terrain tables described above; no tile artwork is
copied into this repository.

## Publishing your own

An author can submit or publish a level under terms that allow redistribution;
its source URL and author should remain attached to the level object.
