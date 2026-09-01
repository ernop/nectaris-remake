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

## Historical Nectaris map archives

Research performed 2026-08-26 found historical online maps, but no active
archive whose terms permit copying those map files into this repository:

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

An author can submit or publish a level under terms that allow redistribution;
its source URL and author should remain attached to the level object.
