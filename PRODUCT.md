# Product decisions

Settled product and UI decisions for this remake, with implementation choices
identified where relevant. Mechanics reconstruction (with sources) lives in
`MECHANICS.md`. [PROJECT_GUIDE.md](PROJECT_GUIDE.md) indexes current guidance,
pending work, experiments and historical evidence.

## Mission menu: map pictures, attempts, unfinished matches and play history (2026-09-30)

The user found the level list overwhelming and asked: remove the size and unit
count columns; make "as Xenon" subtler; show a small map next to each level;
count every attempt, including interrupted ones ("if i click into one, play a
while, then close or leave ... at least indicate we played it once"); drop
"opening a new map will cancel your old in-progress session" so that "every
board can be being played by me at once"; and add a top-level history of every
play action in sequence (started, lost, won, quit), where looking at a map
without starting it needs no entry. Implemented; this supersedes the conflicting
parts of the records below, which point here.

- **Level entry**, one line: map picture, number, name, the unfinished match
  ("Resume turn N" in gold), the record, then **as Xenon**. No column headings,
  map size or army totals. Clicking the picture or the name plays.
- **Map picture** (`js/map-thumbnail.js`): the starting position drawn pixel by
  pixel within 80 × 40 CSS pixels, at the display's pixel density. Terrain in
  the Legacy tiles' colors; bases and factories in their owner's colors (neutral
  bases near-white, neutral factories yellow); each starting unit a dot in its
  army's color. Hills and mountains get relief shading and hexes get edges once
  a hex is large enough to show them. The menu draws every picture as it opens,
  so a terrain letter the picture has no color for stops the menu with an error;
  the tests paint every shipped level and every terrain letter.
- **Record:** "N attempts · xW / yL · h hotseat". Attempts count every match begun
  on the board: either side, any Mode, solo or hotseat, finished, left, abandoned
  or still open. The W/L and hotseat numbers are this row's results (Union side,
  in the Mode selected in the settings row). A level won before per-level
  results existed still reads "Cleared".
- **as Xenon:** small white text after a small green hexagon; "as Xenon ✓" once
  won; "· turn N" when its match is unfinished. Struck through and disabled while
  Two players (hotseat) is ticked.
- **Unfinished matches:** one per board, side (Union or Xenon), Mode (Normal or
  Offer for first) and players (solo or hotseat). Opening an entry resumes its
  unfinished match or starts a new one; opening another level never ends or asks
  about any other match. The **Continue** line above the collections lists every
  unfinished match, newest first, with its turn and, where they apply, Xenon,
  Hotseat and Offers. A match whose offers ended without a deal (a Normal
  opening) stays in the Offer for first slot it was opened from.
- **When a match begins:** it is saved, counted and entered in the history only
  once the player changes it (a move, attack, deployment or End Turn) or answers
  the Offer for first questions. Opening a level to look at it and going back
  leaves nothing. The comparison starts when the player first has control, so
  an AI opening turn (when Offer for first gives the bot the first move) is not
  the player's action.
- **Restart** (match panel, beside Save & Menu): the level again from turn 1 in
  the same slot. A match under way asks first and is recorded as abandoned; the
  Offer for first questions are asked again.
- **History tab** (`index.html#history`, next to Campaigns on every page): the
  active profile's play actions, newest first, one line each: time; event
  (Started, Resumed, Left, Abandoned, Won, Lost, or "Union won" / "Xenon won" in
  hotseat); collection, number and level name; side (Union, Xenon or Hotseat);
  turn; and detail (the ending for results, "vs" and the bot for a solo start).
  Totals above it: attempts, won, lost, hotseat, abandoned, in progress. 200
  events at a time, then **Show older events**. **Left** is recorded when the
  player leaves an unfinished match he changed during this visit (Save & Menu,
  closing or reloading the page, navigating away); **Resumed** when he changes
  a match again after coming back to it. Results recorded before this change appear as Won /
  Lost. The collapsed match history leaves the profile menu; the win/loss line
  stays there.
- **Storage:** profile data version 2, still under `nectaris-profiles-v1`. Each
  profile gains `log`, its play events. Unfinished matches move out of the
  profile into one key each, `nectaris-session-v1:<profile id>:<slot key>` (the
  level key, plus `:hotseat` for hotseat), so saving a move rewrites only that
  match. A version 1 profile is upgraded on first read: stars, results and its
  unfinished match are kept, the match moving to its slot. Implementation
  choice: the upgrade moves the profile container only; a match snapshot is
  still checked when it is opened (see the next item). A full browser storage
  shows the save error; finishing or restarting matches frees space.
- **A save this version cannot open** shows the reason and offers to give it up
  (recorded as abandoned) and start the level again, so it never blocks its board.
- **Other tabs:** a tab stops its match and returns to the menu only when another
  tab writes that same match, clears the site's storage or switches profile.
  Matches on other boards carry on. The menu redraws when another tab changes
  saves or results.

Rationale: one save per board and slot lets the player move between levels
freely; recording actions rather than visits keeps "attempts" meaningful; one
storage key per match keeps a save small and stops matches overwriting each
other.

## Campaign menu for new players (2026-09-26)

The user asked for a much simpler first page whose job is getting a new player
into a campaign: fewer words, fewer controls and a smaller level list.
Implemented; this supersedes the conflicting parts of the mission-library,
profile and opening-choice records below.

- **Header:** one row. **NECTARIS** is the large title; the "Lunar Tactics" tag,
  the "Mission library" heading and "Choose a battlefield. Every campaign is open
  from the start." are removed. Two tabs follow the title: **Campaigns** (this
  page) and **Bot tournament** (`tournaments.html`, which shows the same tabs).
  The tournament lab is a separate area; the in-page "Configure a bot tournament →"
  and "AI tournament lab" links are removed.
- **Profile:** the upper-right corner reads "You are logged in as Wilson". A first
  visit creates the profile **Wilson** without asking. Clicking the corner opens
  **Rename**, **New profile** and **Switch to** (only with two or more profiles).
  Rename keeps the profile's results, stars and unfinished matches. Implementation
  choice: the win/loss line also lives in that menu (the collapsed match history
  that sat under it moved to the History tab on 2026-09-30). This supersedes the
  first-visit username prompt and the large player-profile panel.
- **Settings row** under the title: **Mode** (**Normal**, the default, or **Offer
  for first**), **Two players (hotseat)** and **AI** (the bot for moves and offers).
  The user named the second mode only approximately ("like new user offer"); it
  keeps its earlier name. The map-default mode and the explanatory paragraphs are
  removed; a stored map-default preference opens as Normal. The **Continue** line
  appears only while a match is unfinished; since 2026-09-30 it lists every
  unfinished match (see Mission menu: map pictures, attempts, unfinished matches
  and play history).
- **Removed:** the briefing-language option, per the user's instruction not to
  keep language as a setting (English only; the Base Nectaris data keeps its
  Japanese fields), and the "Briefings & making-of notes: ?" legend.
- **Collection order:** Normal campaign, Advanced campaign, Base Nectaris, then
  the three AI-made terrain campaigns, the three AI-made balance-study campaigns,
  AI-made, Lunar Frontiers and Custom levels.
- **Collection headers:** title, won count and the collection `?`. Category labels
  and introductions are removed except "From the PC Engine campaign." (Normal)
  and "Community terrain, with new forces and briefings for this remake." (Base
  Nectaris). The AI-made campaigns keep "AI-made:" in their titles; their theme
  sentences move into the collection `?`.
- **Help controls:** the original game had no briefings, so the Normal and
  Advanced campaigns show no `?` at all, neither per level nor per collection.
  Elsewhere a level shows `?` only when it has a briefing, design notes, tags,
  credit, terrain file or a safe source link, so no help panel is empty.
- **Denser entries:** the three-across single-line layout stays with smaller rows,
  gaps and `?` buttons. The page uses the full window width and neutral menu
  text is white.

Match defaults from the same request: **Pixel style** with the **Legacy** art set
(see Selectable art sets), **Watch AI** on, and a separate **Move animation**
toggle (see Movement presentation). The user also asked why everything moved to
the right after opening a level: the first level on the old page was AI-made,
and the map-default mode sent it to the offer setup, whose panel sits on the
right. With Normal as the default, levels open straight into the match.

## Search opponents and tournament lab (2026-09-23)

The user requested maximum-strength AI development, several distinct algorithms,
a map-view opponent picker, support for combinations of existing numerical unit
capabilities, and large configurable self-play tournaments with Elo and replays.
Personality presets are explicitly excluded. Implemented policies are Classic,
Tactical (greedy), Sequence (beam), Simulation (MCTS), Apex (hybrid search
with complete-turn verification) and, since 2026-09-29, Marshal (Apex search with
per-seat evaluation weights tuned by self-play; [BOTS.md](BOTS.md)). The new-match default is Classic
(2026-09-27; previously Apex). A saved choice in the menu still wins. A save without
a recorded policy is refused as an older format. All play under the same engine
rules and cannot
read future match randomness.

**Fair dice** (user instruction, 2026-09-28):
- Every match rolls ChaCha20 dice keyed by a 256-bit seed. A new browser match
  draws the seed fresh from the browser's random source.
- Only attacks roll the dice; no bot reads or rolls them. Bots imagine battles
  with their own separate generator.
- The seed and the dice's position are saved with the match, so a resumed match
  continues the same dice.
- A match saved before this change is refused with the older-version message.
- Details and enforcement: AI_TRAINING_PLAN.md, "Fair dice".

**The opponent is fixed for the whole match** (user instruction, 2026-09-26): it
is chosen before play with the menu's **AI** setting, and the match panel only
names it ("Opponent: …", or "Two players (hotseat)"). This supersedes the
map-view dropdown that changed the opponent from the next enemy turn. Records of
older matches that did change it keep their "(changed during match)" note.
Search runs in a cancellable background worker;
Watch AI controls animation without changing decisions. While a watched action
is on screen, the worker is already searching the position after that action
has been fully committed, so thinking overlaps the move and the battle instead
of starting when the picture finishes. The picture stays the board as of the
step being shown (the approach and the calculation still show pre-battle
strength and position). Synchronous tournament and opening search is unchanged:
one step per advance, so a cutoff cannot score a roll that was not shown.
Failures preserve the turn-start checkpoint and show an actionable error.

**Tournaments** opens a separate lab with opponent and board selection, paired
cycles, round limits, seed, worker count and Elo K. A blank seed draws a fresh
256-bit seed, recorded with the run. A typed number or text is stretched to 256
bits with SHA-256, and the same seed and settings reproduce the same games. Each
matchup swaps faction assignments at a common seed. An earlier lab cutoff is a
draw; original map
timeouts retain their ordinary winner. The lab has pause/stop/resume, ordered
per-run Elo, W/D/L and faction counts, head-to-head tables, saved game replays,
CSV and archive export, and individual replay import/download. Large disk runs
are available through the dependency-free Node worker runner. Profiles and
ordinary human match saves remain separate.

Algorithm sophistication is not a guaranteed difficulty ordering. Elo is
relative to the recorded experiment, not a human rating or a claim of superhuman
play. [AI_OPPONENTS.md](AI_OPPONENTS.md) owns the technical details, resource and
storage limits, generic-unit scope and validation record.

## Battle review (2026-09-25)

The 2026-09-25 request restores an original-style battle screen with opposing
formations, machine counts, attack/defense totals and terrain bonus. The user's
2026-09-26 corrections keep Union on the left facing right and Xenon on the
right facing left, whichever side initiated. Each half shows that squad's
actual terrain using original code-authored scenery and the selected unit art;
no original battle artwork is imported. Since the 2026-09-29 third pass,
adjacent units share one continuous ground and only fire from range splits the
field (see "Battle screen redesign"). The arrows showing who fires moved from
the middle of the field into the numbers panel: a side that cannot counter has
none. Remove the terrain-name/per-machine attack-and-defense sentence. Total
combat stats still describe the pre-battle squads.

A subtle **Ready → Fighting → Result** indicator distinguishes the approach,
combat and final summary. Units briefly approach. Then one volley of bullets
crosses the field, with both sides firing at once from their pre-battle
strength. Every loss bursts at the same moment: 0.5 s + 0.45 s, however many
machines fall. This follows the user's 2026-09-26 request ("with bullets and
all at once, like the orig game"); machines previously fell one by one over
1.6–2.6 s.
**Indirect fire arcs through the sky (user requests, 2026-09-29: "arti units
shoot up into the sky and then their projectils fall down onto the enemy", then
"they should tilt their barrels upwards, then fire at a high angle towards the
enemy (or launch bazooka-like things, in case of lynx) and fire, then we see the
projectiles descending and attacking").** When the attacker fires from beyond an
adjacent hex and is artillery class (gun) or a `buggy` with ground range over 1
(the Lynx: launcher), the fighting stage changes:
1. A barrel (gun) or bazooka-like tube (launcher) is drawn over each machine and
   tilts 55 degrees up toward the enemy in 0.3 s. The sprites are flat pictures,
   so the barrel is an overlay.
2. Each machine fires in turn, 30 ms apart: the barrel recoils and flashes, and
   a shell (gun) or rocket with an exhaust trail (launcher) leaves the muzzle.
3. The projectile climbs out of the top of the field, re-enters above the
   target's formation, descends onto one of its machines and bursts there
   (0.8 s flight, 0.18 s splash). The loss burst follows the last splash.
The volley therefore lasts 1.5 s instead of 0.5 s. Adjacent shots, counterattacks
and every other unit, including anti-air, keep the horizontal bullet.
`launchKind` and `volleyMs` in `js/battle-report.js` decide and time it; play and
replay both use them. Geometry is computed in the field's own units
(`--pad`, `--cell`, `--gap` in `css/battle-dock.css`), so a change to the
ground padding or machine size there must keep those variables authoritative.
Experience is shown only as stars in the standard unit mark (below), never
painted on a unit sprite and never as a numeric rank. Each battle header shows
the unit mark at 64 px (48 px on narrow screens; 96 px before the 2026-09-29
layout pass): the portrait with its stars beside it and, below full strength,
the remaining machines on its corner. Formation machines have no stars. A unit
destroyed in the battle earns no stars on screen (2026-09-29).
After fighting ends, actual earned stars appear one by one and glow beside
the header portrait, ending at the awarded rank (including the General star).
The user's 2026-09-26 corrections remove the "Experience gained" row, which
shifted the header layout, and enlarge the header unit icon. Ranks start
at 0 and follow the published awards (+1 per battle; +2 for destroying the
enemy squad or, as defender, taking no damage). Each newly earned star fades in,
holds a bright glow, then settles to the normal star colour over 1.2 s; Pause
freezes it. The result closes as the last star's glow settles. With no new
stars it holds 0.5 s after your battles and 1.4 s after watched opponent
battles. The user found the end pause too long (2026-09-26); it was 1.8 s of
glow plus 0.3 s, and at least 0.9 s or 2.7 s.
This supersedes the single large star overlay tried earlier the same day, and
applies to live, watched and replayed battles alike.
This supersedes numeric battle EXP and separate inspector rank badges.
Damage bonuses and calculation multipliers remain ordinary numeric stats.

**Star art and layout copied from the original (user request, 2026-09-26):**
the user asked for the original's stars: their style, their layout, and the
space they fill as they grow. Hudson's 1997 Windows port (PCE art; re-derive
with `tools/read-original-stars.py`) never draws stars on a unit sprite. The
battle header (both units), the map's bottom bar for the unit under the cursor
and the factory panel for the selected reserve each print an EXP label over a
16×16-pixel box, the size of a unit sprite:
- each small star is 5×4 pixels, yellow `#ffde00` with one light-grey
  `#dedede` centre pixel, on the box's navy background;
- stars 1–3 run down the left column (x 0; y 1, 6, 11), 4–5 form a middle
  column 2 pixels lower (x 5; y 3, 8), and 6–7 the right column (x 10; y 1, 6);
- the eighth replaces them with one large star that fills the box, lit white
  and yellow on the left, orange `#de9c00` and brown `#bd7b00` on the right,
  on a grey plate.

**Standard unit mark (user request, 2026-09-27):** "a standard ui unit: unit
icon + exp just next to it", with stars only ("we don't need that huge EXP")
and the stars at one scale relative to the icon in every context. The mark
is the unit icon followed by a star box exactly the icon's size, holding the
stars above at their original places. It has no EXP label, no navy tiles and
no grey plate behind the General star. This replaces the EXP label and box of
2026-09-26/27 and the earlier stars laid over the icon. The box keeps its
place at zero experience, so names line up in lists and a first earned star
moves nothing. Contexts choose only the size, a multiple of the 32-pixel
icon frame: 64 px in the hover card heading and battle headers (battle headers
48 px on narrow screens), 32 px everywhere else. The icon repeats the map sprite's
look: faction colours, greyscale once its activation is finished on its own
side's turn, red while attacking. Every view of a unit uses the mark: hover
card, factory, base and cargo lists, factory deployment rows,
battle headers, battle and move reports and the forecast in the left panel,
unload, deploy and end-turn buttons, the range legend, the replay hover line
and the balance setup. Only formation machines in the battle scene and unit
types in the editor palette show the icon alone. Map sprites still carry no
stars. The star pattern is third-party-derived art imported at the user's
request; the executable stays outside the repo.

The hover card shows the mark and the name in its heading, with a damaged
squad's remaining count on the icon's corner as on the map sprite, above
attack, defense and Shift. Factory, base and cargo rows are one line: the mark,
the name and N/8 when damaged. The original's map bar is not copied: a bar
under the board tried on 2026-09-26/27 took 56 pixels of board height, broke
the full-height board below, repeated the hover card, and the user could not
find it, so it was removed on 2026-09-27.

**Pause / Resume** freezes the current battle phase, including the automatic
advance to the next action, in human combat, watched AI and replays. A paused
replay battle resumes when clicked anywhere. Replay **Pause on battle screens**
starts on and pauses before the approach and combat; **Skip battle scenes**
starts off and bypasses battle animation, automatic pauses and result holds.
It retains the recorded combat result and left-side report. Disabling automatic
pause releases a battle waiting on that setting; manual pauses remain manual.
Seeking and closing cancel unfinished presentation, without changing engine
state or dice. Live results hold briefly before returning to the map.
**Show map / Show battle** switches views without changing the map's viewport
or camera, and earned-star updates respect that choice. This supersedes the
earlier dock-only presentation.

The fixed left panel retains **N destroyed, M lost**, who attacked whom and the
arithmetic for the coefficient actually drawn. Each shot reports its share of
the published 100-row damage table, this-roll-or-higher share, mean casualties,
exact-loss and loss-or-more shares. Within half a machine counts as near the
average. A disabled counter has no roll. Attack and counter remain separate draws.
The per-side ledger and opening decisions also remain in the left panel.
Since 2026-09-29 the report and the ledger appear only on the tournament replay
page; a match's left panel shows no battle data
([record](#no-battle-report-in-the-matchs-left-panel-2026-09-29)).

Replay pacing (user request, 2026-09-26): every action is shown and none is
drawn out, with no selection cursor and no slow walking.
- Only battles pause on their selection. Moves, deployments, unloads, boardings,
  finishes and turn ends play at once.
- A unit still crosses every hex of its route, but the whole move takes at
  most 450 ms (up to 90 ms per hex). Aircraft take half that (user
  suggestion, 2026-09-26), in replays and in play (75 ms per hex instead of
  150).
- Each route stays drawn in its side's colour and fades over 1.4 s, so quick
  sequences remain readable.
- Speed sets the pause between actions.
- Next action steps a non-battle action in one press.
- Previous/next battle jump to an attack's selection; Hold battles keeps
  results visible for at least 1.4 seconds (2.4 s before 2026-09-26).
- A battle's two units stay faintly marked from its selection until the next
  action.
The user's 2026-09-26 correction keeps the chosen camera still during opponent
playback: watched moves, deployments, battles, captures and repairs never pan
or zoom. When the opponent's turn ends, its last unit is deselected: its
destination highlight and the "selected" entry in the left panel clear (user
request, 2026-09-26). Its battles leave nothing there (2026-09-29). Replays open with **Follow action** off; explicitly enabling it frames
the acted hexes. Fit, wheel zoom and Ctrl+drag turn following off again. This
supersedes automatic live action framing and following by default in replays.
The scrubber shows 0,
midpoint and final command. Seeking or closing cancels visual movement safely.

## Optional inspector and full map height (updated 2026-09-25)

All match controls, contextual commands, status, forecasts, battle reports and
replay metadata occupy a fixed-width left panel with its own vertical scroll.
The board owns the remaining width and full window height.
Opening, closing or growing metadata must never resize, refit or move the board.
This user correction supersedes top/bottom bars, nearby unit-command popups,
temporary action rails and automatic control-position switching.
Hover cards remain available by map hexes. Undo / Redo stay paired; End Turn
remains the side-wide command and is distinct from the removed per-unit End choice.

The user removed the optional **Details** panel on 2026-09-26, judging that the
map hover covers its information. A unit's hover card now also lists the stored
units of a base or factory it stands on. Removed with the panel: its hint line,
the "PLAYER · name" label, the duplicate Unload list, and the target buttons that
were the only keyboard/touch way to open a forecast. Known gap, left open by the
user's choice the same day: an empty hex's terrain and defense bonus are shown
nowhere. A briefly added empty-hex hover card was withdrawn at his request; a
left-panel terrain readout was floated as an idea, not requested.

**Level name, no mission chooser (user instruction, 2026-09-26):** during a match
the panel prints the level's name and has no mission dropdown. The user judged
the full chooser unnecessary inside a specific level. Missions are chosen from
the menu; **Next mission** after a win is unchanged. This removes the former
"Jump to map…" selector.

**Settings at the foot of the panel (user request, 2026-09-26):** the user found
the style and similar choosers too prominent. Visual style, art set, Board
orientation with Fit, Watch AI, Move animation and Music now share one compact
block at the bottom of the panel, below End Turn and the battle report. The top
keeps Save & Menu, Tournaments, the level name, turn, side, unit counts and the
fixed opponent, then Undo / Redo and End Turn. (Rearranged again on 2026-09-29;
see [Left panel layout](#left-panel-layout-and-playing-either-side-2026-09-29).) The user left the treatment open
("smaller/to the side or whatever"); the bottom placement and 12-pixel controls
are implementation choices. A same-day follow-up asked for the Watch AI, Music
and Move animation buttons to take less space: they are now unboxed toggles, a
check mark (☑ in green when on, ☐ when off) before a short label, replacing the
boxed "Watch AI: On"-style buttons.

**Commands never move during play (user instruction, 2026-09-26):** the user
reported that a status line growing to two lines, such as the enemy's thinking
note, pushed every button below it down. The panel now has three parts. The top
(status lines, Undo / Redo, End Turn) and the settings at the foot keep a fixed
size and place. Everything that appears or changes size during either side's
turn shares the middle section, which scrolls by itself: the unit's action strip
and range legend, the attack forecast under that strip, Show map and the battle
report (the report left matches on 2026-09-29). The side line stays one line; while the AI plans it reads
"Xenon (thinking…)", as the opponent line already names the bot.

## Left panel layout and playing either side (2026-09-29)

The user's requests, in his order: no Tournaments link in the match panel (the
top-level tabs are enough); redo the display of his side (Union) so it is clear
and properly laid out; End Turn at "the very natural and easy to hit very bottom"
instead of Fit board; config buttons arranged vertically as easy choosers "which
aren't too huge", with high contrast and no gray text. The main buttons are
return to the outer page, End Turn, Undo / Redo and the sound toggles; the rest
may exist but small. The status block he named: campaign name, mission name and
number, and his side, large, plus unit counts. Behavior:

- **Top to bottom:** Save & Menu; the status block; the middle section (unit
  actions, the watched opponent's action, Show map during a battle; the only
  part that changes size); settings; Undo /
  Redo; End Turn. Undo / Redo and End Turn are one sticky group at the foot, so
  they stay reachable when a short window makes the panel scroll. Nothing in the
  status block, settings or foot changes size during play.
- **Status block** (no Tournaments link): campaign name (as titled in the menu:
  Normal campaign, Advanced campaign, Base Nectaris, each terrain or balance-study campaign, AI-made,
  Lunar Frontiers, Custom levels, Play test), the mission number (the menu's two
  digits; omitted for a play test) beside the mission name (30 px number, 17 px
  name, at most two lines), then "You play" over the side in 30 px bold in its
  faction color with a thick faction-colored edge, then "Turn N / M" (22 px) and
  the side to move, then the two unit counts (30 px numbers) and the opponent.
  In a hotseat match the banner reads "Hotseat" and names the side to move.
- **Settings**, each a single line: Sound, Music, Watch AI and Move animation as
  toggles sized to their label (user, 2026-09-29: they do not stretch the panel
  width) that say **On** or **Off** in words (green On), then Style
  (Pixel / Neon / Classic), Art (the icon sets) and Board (Auto / Normal /
  Sideways) as segmented choosers whose chosen segment is filled yellow with
  black text, then a small **Fit board (F)**. The F key is unchanged. Style,
  Art and Board persist as before (segments replace the dropdowns).
- **Undo / Redo** share a row (15 px, the enabled state in gold); **End Turn** is
  a 52 px gold button (20 px, black text). The end-turn confirmation opens beside
  the panel.
- **Top row** (2026-09-30): **Restart** sits beside Save & Menu; see Mission
  menu: map pictures, attempts, unfinished matches and play history.
- **Playing Union or Xenon:** every mission-menu entry keeps its whole-row Play
  (as Union) and adds an **As Xenon** button at the end of the
  row (a check mark once won; small white text since 2026-09-30). Chosen from the menu only; disabled
  while Two players (hotseat) is ticked. The AI takes the other side. The human's side is saved with the match
  (`humanSide`; saves without it are Union matches), so Continue restores it, and
  **Next mission** and **Replay** keep it. Victory means the human's side won.
  Xenon results are their own record (level keys end `:xenon`), do not count
  toward the menu's "N / M won", and never mark an original campaign mission
  cleared; the As Xenon check mark shows a Xenon win. The Offer for first
  questions run as the human's side against the bot's other side. Rationale: the
  turn limit favors Xenon (the defender), and the bots already play either side.
- **The player's side moves first** (user, 2026-09-30: "when i play as xenon,
  we still have union go first"): in a Normal solo match the human opens,
  so As Xenon starts on Xenon's turn and the AI's Union moves second. This
  supersedes the 2026-09-29 implementation choice that kept Union first. Hotseat
  matches begin with Union. Offer for first still gives first move by the
  offers; offers ending without a deal use this order. The turn limit still
  awards Xenon the win, rounds still count after both sides, and the
  balance-study measurements (Union first) do not describe these matches.
  Matches begun earlier keep the order they were saved with.
- The Sound toggle's behavior is in [Sound effects](#sound-effects-user-request-2026-09-29).

## No battle report in the match's left panel (2026-09-29)

User request (2026-09-29), with a screenshot of the panel during a battle: "i
like this 'show map' concept but really the entire data about the battle is not
useful so please remove it!" During a battle, the player's own or a watched
opponent's, the panel's middle section shows only **Show map / Show battle**,
which works as before, and nothing about the battle stays there afterwards.
Removed from the match's panel:

- the "N destroyed, M lost" headline, each side's icon, faction, lost or
  destroyed count and "N left of M", and "X attacked Y";
- the watched opponent's "Xenon selected an attack" preview;
- the per-side ledger (attacks, destroyed, lost, attack and counter against the
  average).

The battle screen keeps all of its numbers. The watched opponent's move,
deployment, capture and repair lines still appear in the same place between
battles; a battle clears the line before it, and the end of the opponent's turn
clears the last one. The tournament replay page is unchanged: its left panel
still shows the battle summary, the roll arithmetic and the ledger.

## Sound effects (user request, 2026-09-29)

The user asked for sound effects "in a really great way", music excluded, with a
**Sound** toggle that is **off by default**. Behavior:

- **Soundscape.** A **Sound by** dropdown lists every registered procedural
  bank (label: creator name and short title). The choice persists in
  `localStorage` (`nectaris-sound-bank`). **Default soundscape: Claude Fable 5.1
  — Helmet radio** (user choice, 2026-09-29), heard until the player picks
  another; the Sound toggle itself still starts off. Banks register through
  `SFX.registerBank` in `js/sfx.js` and optional `js/sfx-bank-*.js` files loaded
  before `SFX.init()`.
- **GPT-5.6 Sol — Selenographic Telemetry (user request, 2026-09-29).** This
  selectable bank treats sound as a lunar command system: relay codes, layered
  propulsion telemetry, encoded weapon releases and structure-borne impacts.
  The user's same-day revision kept the "beeps & boops" but asked for meatier
  sound because the generation and playback hardware was sophisticated by the
  TG-16's release. Machinery and combat therefore combine sub fundamentals,
  asymmetric harmonic bodies, detuned upper layers, filtered noise, inharmonic
  metal resonance and a wider short room; cannon weight, explosions and vehicle
  motion no longer inherit the restrained UI-pip scale. This follows the
  HuC6280's documented capabilities—six programmable 32-sample wavetable
  channels, noise, channel modulation, independent stereo levels and direct-D/A
  playback—without copying its games' waveforms or audio. Frequent UI cues stay
  brief; battle calculations serialize their information; squad size raises
  pulse density within a fixed ceiling rather than adding one full-level report
  per machine. The bank is entirely original runtime synthesis in
  `js/sfx-bank-sol.js` and identifies its creator in the dropdown.
- **Grok 4.7 — Field calls (user request, 2026-09-29; thickened the same day).**
  `js/sfx-bank-grok.js`. Drums count and bugles announce. The user liked the
  beeps and asked for more weight: the PC Engine's HuC6280 was a wavetable
  generator, six channels of 32-step 5-bit waveforms, separate left and right
  volume, noise on two channels, and an LFO. Each bugle note is that kind of
  waveform, two channels a few cents apart and spread left and right, with an
  octave underneath and a short noise chiff so the beep is still the attack.
  Counting taps keep a short pitched beep and add a low body and a noise thump,
  short enough for the 30 ms machine count. End Turn is a descending recall and
  a bass drum; defeat is taps; victory is a rising call. A supporter is a flam;
  a held ring hex is a bright tap and an open one is muffled; a closed ring
  rolls into a horn that falls. Volleys grow with squad strength. Movement is
  two steps a hex, a chain over a low motor, a road-wheel pulse, or a turbine
  whose pitch rises and then falls.
- **Claude Fable 5.1 — Helmet radio (user request, 2026-09-29).**
  `js/sfx-bank-fable.js`. The war is heard from inside a sealed lunar vehicle,
  because vacuum carries nothing: the low end comes through the ground on a
  hull bus (low-passed near 520 Hz with a resonant bump at 95 Hz, tanh
  saturation so the drops grow harmonics small speakers can carry, a 0.45 s
  hull ring instead of a hall), and everything else over the squad radio on a
  voice-band bus (250 to 3400 Hz, soft clipping, a compressor acting as
  automatic gain control so a loud shot pumps the channel). Every impact
  stacks a pitched sub drop, a saturated pulse-wave mid punch and a knock of
  band-passed noise. Voices are 32-step 5-bit wavetables, the PC Engine's
  instrument format, turned into their 16 harmonics through `PeriodicWave`
  (reed, quarter pulse, bell, bass); chimes are two reeds detuned 14 cents
  apart over a wavetable bass on the hull bus. The user's 2026-09-29 revision
  request: keep the "beeps & boops" but make them meatier, since the TG-16's
  hardware was capable. Transmissions open with a keying click
  and close with a squelch tail. Turn start is a 250 ms 2525 Hz key-down tone
  and End Turn a 250 ms 2475 Hz release tone, the Quindar tone frequencies
  documented for the Apollo ground network; the combat board's machine ticks
  are the 1200 / 2200 Hz Bell 202 data tones (attacker high, defender low,
  climbing with each machine) and supporters are three-bit data bursts; deny
  is the 480 + 620 Hz busy signal. An explosion's ground shock arrives before
  its radio blast, and a destroyed squad's carrier drops out with a squelch.
  Air units reach the hull only as a faint exhaust rumble. Chimes use E natural minor, the
  soundtrack's key. The bank needs `d.audio()` from `SFX`'s bank dependencies
  (context, master, room), read at cue time because a bank is built before the
  context exists; it throws if that is missing. Not yet listened to.
- **Toggle.** Sound joins Watch AI, Move animation and Music in the settings
  block. The choice persists in `localStorage` (`nectaris-sound`). Turning it on
  plays a short power-up blip; turning it off plays a power-down before it
  goes silent. Music and Sound are independent.
- **Original audio only.** Every cue is synthesized at run time in `js/sfx.js`
  and the selected bank file (oscillators, wavetables, filtered noise, a
  generated reverb, a compressor).
  No audio file exists and none of the original game's audio is imported or
  reproduced; the wah sweep at End Turn, the counting ticks and the star chimes
  reproduce the original's roles, not its waveforms.
- **Cues.** Select (pitch by movement class), target, move (per movement type,
  length by hexes), place, load, unload, deploy, factory, cancel, deny, undo,
  redo, End Turn (a falling wah sweep), turn start, victory and defeat. In a
  battle: the approach; each squad's volley by weapon (rifle, cannon,
  autocannon, howitzer, heavy cannon, rockets, missile, mortar; volley length
  scales with strength); explosions scaled by the share of the squad lost, and
  a deflect ping when a side lost nothing; a chime per experience star. Map
  events are panned by hex column; battle events by side (Union left, Xenon
  right).
- **Calculation sounds.** The combat board ticks in the order it counts: one
  step higher for each machine that lights (attacker bright, defender hollow),
  a tick per supporter panned to its hex, a thud for terrain, a tick per ring
  hex sweeping around the target, then a verdict for surrounded or not (none
  for ranged attacks, which have no ring).
- **Timeline coupling.** Battle sounds run off the battle timeline's clock. Pausing
  a battle suspends the audio context; skipping ahead plays only the outcome,
  not the skipped volley or ticks.
- **Browser rules.** The audio context is created on the first pointer press,
  key press or toggle click; a cue requested earlier is dropped, not queued.
- **Unknown names fail loudly.** An unknown cue, weapon, movement type or unit
  class throws. Off is the only silent state.
- **Scope.** Sounds are wired into the main game's `GameUI` (matches and watched
  AI turns). Tournament and balance replay viewers do not build a `GameUI`
  and make no sound. Sound never touches game state, dice or saves.
- **Not yet auditioned.** The cues were written and unit-checked for syntax and
  for the disabled and unknown-name paths, not listened to. Balance, pitch and
  length need a listening pass by the user.

## Board orientation and control docking (2026-09-23)

Updated by the user's 2026-09-25 fixed-left-panel correction above. The previous
Auto / Top / Left control-placement selector is removed; stored old preferences
no longer move the controls. Panel contents may scroll without changing its width.

**Board: Auto / Normal / Sideways** remains available and persisted. Auto
compares both orientations against the fixed board viewport and uses a clockwise
quarter turn when that fits better. Normal and Sideways are explicit overrides.
Units, counts and labels stay upright; highlights and hit testing rotate with
the board. Legacy terrain is drawn upright for the turned board
([2026-09-27](#legacy-terrain-redraw-and-upright-turned-boards-2026-09-27));
other styles and art sets rotate the terrain picture. This is presentation only
and the editor retains normal orientation.
**Fit board (F)** restores the complete board. The user asked on 2026-09-27
for it to be large and easy to hit and bound to F: it is a full-width button at
the top of the view settings, and the F key does the same (not with Ctrl, Cmd
or Alt, and not while typing in a field). Window, explicit orientation, art or
style changes may refit; metadata and selection changes may not. Keep the 8-pixel fit
margin, up to 4× zoom, Ctrl+left-drag pan and cursor-anchored wheel zoom.

## Movement presentation and automatic attacks (2026-09-25)

The user corrected the interaction: moving flows straight into legal attack
targets if an unused attack exists. Otherwise the unit finishes automatically.
There is no per-unit **End** button anywhere on the map or in the action panel.
Choosing the current hex commits staying in place under the same attack/finish rule.
Clicking away/Escape may decline a pending shot; ordinary activation, buggy
retreat, move-or-fire, transport and Undo rules remain unchanged.

Human moves, watched AI moves and replays show the unit traversing every hex of
the engine's live legal route. Render-only motion never changes authoritative
coordinates, RNG or saves: the action commits once, then the display catches up.
Commands stay locked during human movement; watched AI/replay playback waits
for movement to finish. Slow frames cannot skip intermediate hexes. Boarding
and storage can draw the moving unit even after it leaves the engine's field list.
Fast, unwatched AI and tournament computation retain their immediate execution.
The user asked on 2026-09-26 for movement display to be configurable separately
from Watch AI. **Move animation: On/Off** (default On, stored as
`nectaris-animate-moves`) sits beside Watch AI. Off draws no traversal: human
and watched AI units appear at their committed destination on the next frame,
and the rest of the flow is unchanged. Watch AI still decides whether the
opponent's turn is shown step by step at all. Replays keep their own speed control.
`test/board-playback.html` checks real-browser board bounds, camera stability,
move-to-attack, auto-completion, save/RNG preservation and battle presentation.

## Enemy movement and firing range inspection (updated 2026-09-22)

During your turn, click an enemy to inspect its details and orange movement
range. This previews a full next-turn movement budget on the current board,
respecting terrain, occupancy and ZOC, without changing the unit or match.
Also show firing range from its current hex: solid red outlines for ground fire,
dashed violet for air fire. Keep movement fill visible inside firing outlines.
Use the real per-domain bands, including indirect fire's adjacent blind spot;
show immobile Atlas range and omit unsupported domains. A compact on-map legend
identifies each range. These are separate movement and
current-position firing areas, never a combined move-and-fire threat projection.
Clicking a destination clears inspection; it never moves the enemy. Escape
also clears it, and clicking another unit selects or inspects that unit.
While choosing an attack, red targets retain their attack-click behavior;
cancel the current action first to inspect enemy movement.

### Firing-area border trial (2026-09-23)

The user requested trying only the inner and outer borders of the firing area
after finding Hawkeye's individual dashed target hexes too busy. Implemented
for friendly selection and enemy inspection in all art styles: join covered
hexes into one area per attack domain and draw only its exposed edges, including
minimum-range holes and board boundaries. This replaces the per-hex firing
outlines; movement destinations and red legal enemy targets retain their fills.
Ground borders stay solid red and air borders dashed violet. A wider ground
stroke under the air dashes keeps both visible on a shared boundary (an
implementation choice). Hawkeye's air-only 2–5 band still excludes its own
hex and all adjacent hexes; the firing area always uses the current position.
This is the requested visual trial, pending the user's assessment, with no
change to ranges, movement or attack eligibility.

## Selectable art sets (2026-09-20)

The **Art set** selector lists **1 · Remake** first and **Legacy** second.
**Legacy** is the default since the user's 2026-09-26 request, superseding
Remake as the default; the preference key moved to `nectaris-unit-icon-set-v2`
so every browser starts once on Legacy. Legacy unit icons are adapted from the user-selected ユニットデータ
chart; source provenance and the JPEG limitations are in `art/legacy/README.md`.
Both sets provide all 23 units in native 32×32 frames and all game states.

**Legacy unit size (user decision, 2026-09-26):** every Legacy unit, infantry
included, keeps the chart's pixels at exactly 2×, each art pixel a 2×2 block,
unscaled and centered in its frame. Units therefore have the original map's
proportions (up to 32×32 on the 48×32 hex; corners may reach past the hex's
slanted edges, as in the original). The small-infantry sizes and safe-hex mask in
the pixel-art section below apply to Remake only. The user reported the Rabbit
looked broken; every Legacy frame had holes where terrain showed through, and
the shrink to the Remake envelope drew some art pixels half-width. The user
chose exact 2× for all units over keeping small infantry or the envelope.

Legacy also selects reconstructed original-style terrain and buildings, with
48×32 flattened hexes, 32×32 pitch, 16-pixel odd-column stagger, connected roads
and relief, integer pixel drawing and no permanent grid. Minimum zoom now adapts
to the map and viewport, allowing a full overview in every style and art set
(2026-09-22); unit icons scale with map zoom. Remake keeps its existing production terrain
until its separate terrain migration is complete. Classic/neon keep their
existing vector appearance and disable the art-set picker.

Selection persists independently of saves/profiles and synchronizes across
same-origin game, editor and review pages. Adding a set uses the validated
registry in `js/unit-icon-sets.js`. Switching sets updates open inventories
and refits the map without changing game data.

## Connected terrain and board borders (2026-09-23)

The user requested smoother vertical mountain ranges, then better outside
edges and borders across the board. Legacy mountains form continuous plateaus
across shared edges and corners: avoid repeating triangular cutouts, isolated
hex outlines and seams in long vertical runs. Keep layered cliffs where actual
on-board low ground meets a range, including bends and concave joins.

At the board boundary, mountain plateaus continue to the outer edge. Missing
neighbors must not create a low-ground strip or an outer cliff suggesting a
route around the mountain. This supersedes the earlier decorative outer cliff
and skirt treatment.

The implemented response uses a thin rounded rectangular frame for every
Legacy terrain type. Small gaps outside the edge hexes carry reflected nearby
terrain, without copied buildings, roads or (since 2026-09-27) ravines
continuing outside the map. The
frame shape was selected during implementation; the user requested the border
improvement but did not explicitly choose between frame shapes.

This is decorative rendering only: preserve map bounds, logical cells,
adjacency, movement, picking and editor painting. Interior terrain pixels stay
unchanged. Keep the border crisp at map zoom, clip work to the viewport and
include it in the existing terrain cache. Classic/neon and Remake retain their
current rendering. Implementation/provenance is in `art/legacy/README.md`;
regressions live in `test/mountain-terrain-tests.js` and
`test/board-border-tests.js`.

## Legacy terrain redraw and upright turned boards (2026-09-27)

The user asked for two things on 2026-09-27. First, when **Board: Auto** or
**Sideways** turns a tall map, draw the Legacy tiles upright for the turned
board instead of rotating their picture (the second option discussed for that
view). Second, fix the Legacy tiles, which the user found "a bit janky even in
normal mode".

**Turned boards.** With the Pixel style and the Legacy set, a turned board
draws its terrain in screen space with a turned tile layout. Each cell keeps
its hex after the quarter turn, so it is 32×48 native pixels with pointed tops
and bottoms. The picture inside it stays upright: light from the upper left,
domes standing up, cliffs stepping down the screen. Highlights, units and hit
testing already follow the turned hex and are unchanged.

**Tile redraw, reverted the same day.** Commit 739421e redrew every tile on the
original's 24×16 art grid, one art pixel per 2×2 native pixels. It had rounded,
dithered hills, pebble wasteland, wider roads and taller domes. The user then
said the prior terrain was "much more beautiful", especially for the normal,
horizontal maps, and asked to restore it: "things like the 30% hills and the
20% ones were much nicer there" (wasteland is 30% and hills 20% in the defense
table). The user allowed keeping the riverbed changes, "since that looked
janky and weird before"; they are kept. Current state:
- Plains, hills, wasteland, mountains, roads, bridge decks and buildings are
  the prior tiles again. On a normal board every tile without a valley or
  bridge is pixel-identical to the pre-redraw generator.
- Valleys keep the redraw's riverbed: a continuous ravine along the lines
  between connected valley cells, with a lit bank and a shadow bank.
  Neighbouring tiles draw the parts of a bank that cross into them. It is drawn
  one pixel per native pixel, like the other tiles.
- A turned board draws the same tiles upright in the 32×48 turned layout.
- The board margin treats valleys and bridges as plain, like roads and
  buildings, so no ravine continues past the board's edge.

**Buildings (same day).** The user said "it's vital the BASE look diff than the
FACTORY" and asked to model the Legacy tiles on the original game's. Both are
now code-drawn top-down buildings after the original's map tiles, replacing the
low domes:
- The base is the original's prison camp (収容所): a square walled compound
  with maze-like inner walls, cell windows, a gate and a watchtower annex.
- The factory (工場) has two round storage tanks, a long hall with pipe runs
  and two sheds on an L-shaped footing.
- Colours follow the original: Union blue, Xenon green, and a neutral factory
  yellow. A neutral base, which the original does not show, is grey.
- Sources studied, not copied: the screenshots on
  [Anka's factory page](https://anka.sakura.ne.jp/nectaris/l5.html), the local
  encirclement-quiz capture, and the factory colours described on
  [game-keyboard.com](http://www.game-keyboard.com/?p=1623). The pixels are
  drawn in `js/legacy-terrain.js`; no reference image is bundled.
- `test/legacy-terrain-tests.js` requires the two buildings to differ in shape
  for every owner, not only in colour.

Review page: `tools/terrain-sheet.html` shows a sampler map and RAMSEY in both
orientations. Regressions cover the hex mask in both layouts, cracks, road
exits and upright turned tiles (`test/legacy-terrain-tests.js`), and turned
mountain runs (`test/mountain-terrain-tests.js`). They also cover both frame
orientations (`test/board-border-tests.js`) and the pixel checksum over both
layouts (`test/terrain-performance-tests.js`).

## Native pixel art and flattened geometry (2026-09-20)

The settled specification is documented in
[ART_DIRECTION.md](ART_DIRECTION.md). Every unit has one **32×32** native
transparent frame, centered at (16,16). Planned terrain hexes have a **48×32** footprint,
**32×32** center pitch and **16-pixel** odd-column stagger, following the
original's flattened geometry. Remake sprite corners remain transparent so visible
art fits the hex; see the explicit safe mask in that specification.

Map icons scale from their 32×32 frame with hex zoom (2026-09-21 correction,
superseding the old prohibition on enlarging them). Inspector, factory and
review icons remain native 32×32. Center the visible silhouette horizontally with equal
left/right transparent padding in every facing. Remake infantry stays smaller within
its frame (Charlie 18×17, Kilroy 22×17, Panther 22×14 visible). Remake bases are low domed compounds with
open service areas. Legacy buildings follow the original's top-down tiles instead
([2026-09-27](#legacy-terrain-redraw-and-upright-turned-boards-2026-09-27)).

Use angular military proportions inspired by traditional Japanese hex strategy:
long low hulls, flat rectangular turrets, straight wing edges, narrow fuselages
and small infantry helmets. The user explicitly rejected chibi, toy-like and
super-deformed shapes. Keep domed base architecture as its own building motif.

Use screen-upper-left lighting, selective one-pixel charcoal contours, a shared
indexed palette and integer pixel rendering. Upper armor uses connected white
and pale faction highlights; shadow-facing edges, tracks and recesses stay dark. Opposite-facing shapes must be relit
rather than mirroring the finished shaded image. All 23 units have been rebuilt
at native resolution using editable pixel construction. Terrain, buildings and connections follow
the same pixel density and light. Normal terrain has no permanent hex borders.

All 46 directional unit frames are now integrated into pixel mode in the game,
editor and factory. Review all states in `tools/unit-sheet.html` or substitute
any unit on the native map fixture in `tools/art-pilot.html`. Map sprites scale
proportionally with zoom. **Ctrl+left-drag** is the only map-pan gesture
(2026-09-23), at any zoom and even while choosing a movement destination.
Plain left, middle and right drags never pan. Ctrl-click without dragging never
selects a unit or destination. Show a grab cursor while Ctrl is held and a
grabbing cursor during the gesture; otherwise show a crosshair for map actions.
Do not snap a dragged map back to center; keep a patch visible at the pan limits.
Click without dragging retains normal selection and command behavior. Production
terrain, buildings and flattened map geometry for Remake remain to be migrated.

## Nearby unit inspection (updated 2026-09-22)

Hovering a unit immediately shows a compact card beside its hex, including
when another unit is selected; leaving it immediately hides the card. The card
and sidebar share a compact layout: unit icon and bold faction-colored
name; one stat row for ground attack, supported air attack, defense and Shift.
Omit the air attack cell entirely when that domain cannot be attacked. Ground
attack remains explicit, including zero for air-only and noncombat units.
Range 1 is the default: omit it and all unavailable-range placeholders. Show
longer exact bands directly beneath their attack value; when ground range is
longer, retain an aircraft range of 1 to make mixed ranges unambiguous (Lynx).
Keep terrain and its defense bonus in the footer, adding damage bonus only
when experience grants one. Show remaining/total Shift only when a friendly
buggy has spent movement. The card heading is the standard unit mark (see
the battle review section) at 64 px, then the name. Zero experience leaves the
star box empty. No numeric rank. Map sprites themselves carry no stars.
Damaged units show only the remaining-unit number on their icon, on the map
and in the card, without a "Strength" label. Names and terrain text wrap without
truncation. No faction heading,
stats table, movement chassis, capture explanation or action-rule reminders.
The card stays anchored to the hex. Placement
flips at viewport edges and favors space with fewer units underneath.
The card never covers its own hex and passes pointer events through to the map.
It clears on empty terrain, map exit, Escape, panning, combat and modal panels.

## Strength chrome (2026-08-30)

The map corner strength numeral and its backing are 1.6× their previous size
(2026-09-21), and the inspector corner numeral is similarly enlarged.
Full-strength units do **not** show `8`. Squad size 8 is the default, so
printing it on every healthy unit is redundant. The remaining count is shown
only when damaged (1–7):

- Map unit chrome (bottom-left badge)
- Sidebar and nearby hover unit inspectors (unlabelled icon numeral omitted when full)
- Factory stored-unit list
- Battle-preview name line

`COMBAT.strengthCaption` is the single check. Combat still uses 1–8 internally.

Factory reserve counts use separate, high-contrast map badges: bold white
numbers on an opaque dark backing, outlined in the owner's color (neutral
included). They remain readable at overview zoom, support multiple digits,
and draw above movement highlights in every art style. Empty factories omit
the badge. These numbers count stored units, not squad strength.

## No two-letter unit badges (2026-09-03)

Map units do **not** carry the two-letter stencil badge ("BI", "LY", …). The
silhouettes are the identification, as in the original, and the sidebar names
the unit under the cursor. Together with the hidden full-strength `8` and the
opposing enemy facing (player units face right, enemy units face left), this keeps unit-name text off the map.

## Completed-unit appearance (2026-09-02)

Once a unit has fully completed its activation during its player's current
turn, its map silhouette and remaining-status chrome are fully desaturated
without changing opacity. A unit with an open activation remains at full color,
including a Rabbit or Lynx that has attacked but still has movement available.

`unit.moved` is the state signal. Only completed units belonging to the current
player receive this treatment, so the opposing army does not remain greyed
during the next turn.

## Unit icon set, faction colours and attacker red (2026-09-03)

Adopted from the original's presentation after reviewing the local captures
in `inspiration/nectaris-original/`:

- **One silhouette per unit type.** The pixel style has two original 32×32
  directional frames for each of the 23 stock units (`js/data-unit-art.js`),
  so types are distinguished by shape: hull width, turret
  form, gun length and count, missile racks, dishes, wings, rotor. Yellow is
  used only for missiles, rockets and bombs, so a yellow accent itself means
  "carries ordnance". Custom unit types render as their class's base chassis
  or as a stock sprite named by `sprite: "GRIZZLY"`; an unknown name is an
  error. Map sprites scale with hex zoom using crisp integer pixel boundaries;
  standalone icons use one native pixel per canvas pixel.
- **Pixel is the default style.** The storage key moved to
  `nectaris-style-v2` so every existing browser sees the new set once instead
  of its saved neon; neon and classic remain selectable.
- **Faction colours follow the original: Union blue, Xenon green** in all
  three styles (neon keeps violet for Union). This frees red.
- **The attacking unit is deep red** (`attackColors` per theme) from the
  moment an attack is previewed — the human hover inspector or the AI's
  "XENON ATTACK" panel — until the result animation ends. The defender gets a
  white ring. The attacker is exempt from the completed-activation greyscale
  so its red is never greyed. `Renderer.attackingUnitId` is the single
  signal; `ui.js` sets and clears it.
- **Completed units stay bright greyscale** (unchanged from 2026-09-02): the
  pixel palette keeps mid and light tones luminous so `grayscale(1)` leaves a
  clearly visible unit, not a dark one.

Review tool: `tools/unit-sheet.html` shows every unit as Union, Xenon,
attacking and spent in pixel mode, with native frames and contrast controls.

## Opposing unit facing (2026-09-02)

Union/player-0 unit silhouettes face right. Xenon/player-1 silhouettes face
left. This applies to every chassis, including mines, in neon, pixel and
classic styles, on the map and in factory icons. Labels and numerical chrome
remain readable rather than being mirrored.

## Local visual references (2026-09-02)

`inspiration/nectaris-original/` contains gitignored local screenshots of
original-game/reference material plus a checked-in source manifest. Future
icon regeneration should consult them for silhouettes, opposing facing,
information density and terrain readability while continuing to produce
original procedural artwork. The captured PNGs are references, not runtime
assets and not files for redistribution.

`inspiration/nectaris-original/index.html` is the local viewer for those
captures: one full-width page, jump links, each filename as the section
heading. It is not linked from the game menu. A missing PNG fails the page
instead of rendering an empty slot.

## Mission-list force totals (updated 2026-09-23)

Superseded on 2026-09-30: entries show a map picture and no army totals (see
Mission menu: map pictures, attempts, unfinished matches and play history).

Every campaign, expansion and custom-level entry lists total squads in this
order: **Union, Xenon, Neutral**. Include fielded units and each side's stored
reserves; unowned factory inventories count as Neutral, never as either army.
Use normal, equal-size labels and numbers with tabular figures. The user
explicitly rejected oversized army counts; this supersedes the earlier larger
numbers and omission of neutral reserves. Put the three totals in shared,
right-aligned columns so each side's digits line up vertically between levels.
Column headings can supply the faction labels without repeating them in every entry.

## Single-line comparison entries (2026-09-23 clarification)

Each individual listing in a comparison list must occupy one text line. Never
stack a name, metadata, numbers or result on multiple lines inside that entry;
stacking breaks comparability even when every card has the same height. Multiple
complete listings may sit side by side in columns when there is room. The latest
user preference is **three levels across per row** on wide screens, with two or
one on narrower screens. This supersedes the two-column desktop maximum; it is
not a requirement for only one listing across the entire page.

Keep corresponding fields aligned down each column. In the mission library,
map pictures, names, unfinished-match turns and records remain on the same line
(dimensions and faction totals were removed on 2026-09-30). Use
horizontal scrolling when necessary, preserving full text rather than wrapping,
fading or truncating it. The earlier two-line dense cards are superseded.
This comparison rule does not prohibit paragraphs in deliberate detail popups.

## Readable interface colors (2026-09-23)

The user requires strong contrast throughout the interface. Never fade text
toward its background, on dark or light surfaces; secondary labels and campaign
numbers must stay readable. Use spacing, size and weight for hierarchy instead
of reduced opacity. Disabled controls retain opaque, readable text and indicate
their state with styling and behavior rather than fading the whole control.
Use saturated Union blue and Xenon green, not washed-out substitutes. The level
list uses the Pixel faction body colors (`#4a90e8` and `#3cb44b`) and bright,
opaque neutral text. Apply this guidance to future UI work; terrain shading and
the spent-unit art palette retain their separate gameplay/art requirements.

## AI-made fjord levels (2026-09-22)

The AI-made category preserves fifteen separate original maps, with stable
`aiMadeIndex` values 0–14 in the menu and profile records.
Twisted Fjords (65×49) is a winding tree; Shattered Fjords (65×49) and
Fractured Fjords (40×40) introduce angular, variable-width passages and
connections between branches. Each has fifteen neutral factories with twelve
ground units, five small clearings, and corner armies of five tanks and three
infantry. Honeycomb Fjords (28×28) scales down to eight factories with ten units,
three staging spaces, and four tanks plus three infantry per side. Its passage
mesh covers the board, separating sixteen mountain pockets of at most nineteen
hexes. The first four maps' factories have exactly one road exit and five
mountain neighbors; these maps exclude aircraft. Arsenal Fjords (Part 5, 28×28)
has nine neutral factories split equally between one, two and three road exits.
Its inventories range from one to twelve units (51 total), with deliberate
infantry, armor, patrol, artillery, engineer and mixed teams. Each inventory
uses at most five unit types and two artillery units. Every immobile Atlas or
Trigger immediately follows a compatible Mule or Pelican, with a separate
carrier for each passenger. Pelicans are the only aircraft. The starting armies
remain four tanks and three infantry each; normal transport rules apply.

Needle Fjords (Part 6, 34×34) and Labyrinth Fjords (Part 7, 30×30) restore
narrow branching fjords after the user found Part 5 too open. Approximately 38%
of each map is floor; the two- and three-hex channels have only two/three small
junction clearings. Factory mouths form a contiguous fan facing down the fjord,
with mountain walls behind them. Part 6 has nine neutral factories; Part 7 has
twenty-one, packed into terminal branches and short wall alcoves in its smaller
channel network. Each inventory has 4–8 units, no infantry or other capturing types,
and at most two artillery units. One-, two- and three-exit factories occur in
equal proportions. Part 6 starts each side with exactly one Charlie, one Panther
motorcycle infantry and one Rabbit missile buggy. Part 7 adds one Bison, one
Polar and one Hadrian to each side in corresponding positions around the camps;
this is a fixed roster, chosen once. Pelicans remain permitted,
and every Atlas or mine follows its own compatible carrier in the roster.

Mirror Fjords (Part 8, 31×30) keeps 21 neutral factories with 4–8 reserves and
the same six-unit starting roster as Part 7. Every terrain hex, building,
inventory and unit placement is reflected left-to-right, including the map
boundary. An odd column count preserves hex adjacency under that reflection.
Nine matched factory pairs and three shared center-line factories give seven
factories with each exit count. The central two-exit factory uses north/south
mouths so both approaches remain symmetrical; other mouths are contiguous.
Both players have identical opening movement costs and routes. Factory stocks
still exclude infantry, and every immobile unit has a preceding carrier.

Laced Fjords (Part 9, 31×30) adds narrow connections, a perimeter passage,
eight isolated plain hexes, and a sparse connected road network. Mountain
depth is at most two hexes. Eleven of its 21 factories contain one Charlie or
Kilroy; inventories remain 4–8 units, seven factories per exit count. It keeps
Part 8's mirrored six-unit formation and remains separately selectable.

Turning Fjords (Part 10, 42×20) is a new map, not a resize of Part 9. A true
180-degree rotation preserves hex adjacency, terrain, inventories and opening
movement. The even-sized board has no fixed center hex: 24 factories form
twelve pairs, allowing eight factories per exit count. Half have one Charlie
or Kilroy, with 4–8 total units each. Focused teams span every tank, artillery,
anti-air and missile vehicle; only Pelicans are permitted aircraft, and each
Atlas/mine follows its own carrier. Both armies start with Charlie, Panther,
Rabbit, Slagger, Titan and Octopus in rotated positions. Interior mountain
islands are at least five hexes, isolated plain clearings are four groups of
five, and edge mountains are at most three thick. Roads connect every factory
approach and camp while covering less than 30% of the main valley floor.

Parts 11–15 are five deliberately different 42×20 route designs, authored in
`tools/build-curiosity-maps.js` and included by the main builder. All retain
180-degree symmetry, matched six-unit starts, 4–8 reserves in focused teams,
exactly half the factories with one Charlie/Kilroy, and equal exit-count groups.
Every map covers the complete permitted reserve roster (all tanks, artillery,
missile and anti-air vehicles, carriers, mines, Charlie and Kilroy). Only Pelicans
fly. Mountain depth and edge bands are at most three hexes; interior mountain
islands are at least five. Roads connect both camps and all factory mouths.

- Part 11, **Switchback Fjords**, has 12 factories along folded lanes and
  hairpins, with two diagonal shortcuts. Extras: Lenet, Slagger, Hadrian.
- Part 12, **Delta Crossings**, has 24 factories around branching tributaries
  and a central valley river. Exactly three bridge crossings carry ground units;
  starting Pelicans offer another approach. Extras: Polar, Lynx, Pelican.
- Part 13, **Caldera Circuit**, has 24 factories on concentric circuits joined
  by radial passes. Wasteland discourages cutting across country; an isolated
  ten-hex plain sits inside the central ridge. Extras: Grizzly, Octopus, Mule.
- Part 14, **Faultline Steps**, has 12 factories among diagonal ridges and
  hill-heavy stepped passes. Extras: Giant, Titan, Seeker.
- Part 15, **Pocket Siege**, has 12 factories supplying four small chambers
  joined by dogleg throats, plus an outer route and two isolated five-hex
  clearings. Extras: Polar, Hadrian, Pelican.

Importable JSON lives under `levels/`; `tools/build-ai-fjords.js` rebuilds it and
the runtime data deterministically. Earlier layouts remain intact when a new
part is added.

## Compensation offers before play (2026-09-23)

Updated 2026-09-25 from the user’s request for visible opening choices, a linked
bot tournament setup and guided questions that find the changeover point.
Implemented; this supersedes the original one-step-at-a-time acceptance UI.

The user approved implementing the automatic second-player compensation
proposal with a longer list and predefined, visible locations near each base.
`js/balance.js` supplies 32 mixed ground-unit packages, starting at zero and
ending at four Polars plus two Charlies. Their ordering expands the available
menu; it does not assert universal unit prices. Every question includes the
cumulative menu through its numbered package,
with earlier packages still selectable. A player may preview the entire finite
schedule before answering. The binary search of these nested menus is an
implementation choice; individual mixed packages are not assumed to have
universally increasing value.

The setup shows the unplayed battlefield, both conditional bonuses, fixed
numbered hexes and exact one-based column/row coordinates. Zoom, base focus,
whole-map fit, Ctrl+left-drag and unit/factory inspection support evaluation.
Units are fielded on those exact empty ground hexes at full strength and zero
experience, ready on their first turn. Sites are deterministic, within five
hexes of the player's owned base, reachable by all offered ground types, closer
to home than the other base, and not adjacent to enemy field units. Building
tiles are excluded. Complete rotational/reflection symmetry detected by the
planner gets corresponding sites. Map authors can instead declare validated
`balanceSpawns` arrays. Use equal slot capacity on both sides, up to six; filter
out packages that cannot fit. No suitable sites means an explained fallback,
not a silently relocated bonus.

Each player privately answers “Would you accept this package to go second?”
They may choose any earlier package in the current menu. Yes brackets downward;
No rejects the whole current menu and brackets upward. Search ends at adjacent
rejected/accepted menu boundaries (or no acceptable package). There are at most
six questions for consistent answers across the 32-package schedule; accepting
an earlier package can shorten the search. Change previous answer restores the
prior question. Accepting a previously rejected package revises that rejection
and rechecks the lower boundary. The final screen permits starting over.

Both players finish before any result is revealed. The lower switch point sets
the deal: that player goes second with the package they accepted, and the other
gets first, as preferred at that menu. Matching switch points use a random
tie-break. If both refuse the entire menu, there is no forced deal: retry, return
to the library, or explicitly choose the normal opening. Hotseat hides the first
player’s completed survey during device handoff. Solo launches independent bot
analysis before accepting input and can collect human answers while the worker
thinks. Neither side sees the other's responses; settlement waits for both.
The selected bot evaluates both roles using its own playing algorithm, as
requested in the 2026-09-25 follow-up, superseding the shared material heuristic.
Neither surveying nor tie-breaking reads or advances combat randomness. The final screen shows
both switch points and the exact bonus; no army acts before Start match.

Updated 2026-09-26 (see Campaign menu for new players): the **Mode** dropdown
under the title offers **Normal** (default) and **Offer for first**. This
supersedes the **How should the match open?** panel and its map-default choice.
The choice persists and applies to new levels; Continue keeps the saved agreement.
Tournament setup is reached from the **Bot tournament** tab. Tournament
opening preferences are independent of human-match preferences, and each run
freezes its own opening and no-deal policy. Imported map data stays unchanged.
Human/CPU factions remain Union/Xenon; only initiative changes. A round ends
after both factions act, including Xenon-first matches. Existing timeout
victory for Xenon is stated during negotiation and remains unchanged.

Cancelling setup preserves the previous saved match. Negotiation drafts are
not persisted. Started matches save the chosen package, exact placements and
first-player identity, both switch points and the question history. Resuming
an unfinished match (Continue or its level entry) does not renegotiate; a new
match on the level (after a finished one, or Restart) asks again. Older saved
agreements remain valid.
Compensated results use separate level keys and never award original campaign
completion stars. Match history and the game toolbar identify the accepted
compensation. Balance needs playtesting across maps, player skill and opening
choices; the feature implements negotiation, not an established 50/50 outcome.

Tournament protocol 2026-09-25.2 uses each bot's actual move selector in bounded
hypothetical openings, with common independent simulation seeds and the existing
numerical position evaluator. The bot models both hypothetical armies using its
own policy. Scores estimate preferences, not winning odds. Normal opening remains
the default. Unplaceable offers/no-deal skip ratings by default, with an explicit
normal fallback option. Normal repeats swap factions in two games; offer repeats
use four games covering both faction assignments and both equal-offer tie
recipients. Private commitments remove response-order advantage; unequal bids
still decide roles. Seeds are shared within the mirrored set and change by repeat.
Saved results include policies, role scores, both switch points, questions, bonus
and first player. CSV and archives identify effective/requested openings. A run
recorded under another protocol cannot resume, and its games cannot be watched.
Protocol 2026-09-26.2 removed the factory-exit rules that 26.1 had added; see
AI_OPPONENTS.md.

The user decided on 2026-09-26 that the search bots (Tactical, Sequence,
Simulation, Apex) use general, adaptable methods, not invented special-case
rules or hand-picked penalties for particular situations.

The same follow-up requires durable long runs, visible progress, intelligible
controls, map/pair history, efficient replay and a fullscreen board for review.
Implemented: Randomize seed (fills in a fresh 64-hex-digit seed), help for repeats/rounds/workers/K, immediate focus
on live worker cards, progress and rough ETA, saved-through status, local Elo and
replay persistence. Completed out-of-order games are saved before ordered atomic
rating updates; reload offers Resume without discarding those records. Unfinished
games restart from their fixed seeds. Persistent-storage requests and archive
exports support longer experiments. Ratings stay per run. Indexed history filters
avoid loading replay payloads. Replays fill the window, optionally enter true
fullscreen, support normal zoom/Ctrl-drag pan, turn jumps and cached seeking
every 128 commands.

On 2026-09-26 the user removed tournament backward compatibility: no meaningful
tournaments had been run in production.
- A storage schema change starts afresh, dropping earlier stores without
  migration.
- A replay must carry its turn index, checkpoints and final position.
- A replay recorded with a different bot version is refused with an error
  rather than shown.
- A run from another bot version cannot be resumed.

See [AI_OPPONENTS.md](AI_OPPONENTS.md#browser-tournaments) for
precise search budgets, persistence boundaries, exports and validation.

## Official normal campaign (2026-09-03)

The main campaign reproduces the normal campaign built into Hudson's official
1997 Windows PC Engine remake rather than using substitute maps. All 16
missions retain its dimensions, terrain types, building ownership, field
deployments and factory inventories. English unit IDs use the TurboGrafx-16
names; the PC Engine passwords are retained, including `GALOIS`, `APPOLO` and
`NECTOR`.

The data is generated by `tools/extract-original-campaign.js` from Hudson's
official 1997 Windows freeware port, which carries the PC Engine campaign.
The project owner confirmed redistribution permission on 2026-09-03. Original
tile and unit bitmaps are not included; the remake continues to render its own
terrain and unit art.

The user requested the advanced campaign on 2026-09-20. A separate Advanced
section now contains missions 17–32 from the same official executable, with
stable campaign indices 16–31. Normal mission indices, saves, extra packs,
forecasts and all other modern features remain unchanged. The next-mission flow
continues from NECTOR into TLOVER and ends at ROTCEN. Provenance and the two
cross-source roster discrepancies are documented in `LEVEL_SOURCES.md`.

## Building capture, storage and deployment (updated 2026-09-23)

The inventory popup uses the same two-column icon/name roster as factory
mouseovers. Each ready tile is a native Deploy button, including its icon and
name. Unavailable tiles say Next turn or No open exit. This is a deployment
picker only: open it for the current player's building only when at least one
reserve has a legal exit or compatible carrier. The panel anchors beside its factory, flips at map edges, and
scrolls its roster while keeping the heading and close button visible.
Selecting a tile hides the panel and highlights legal exits; Back to factory
and Cancel sit near the factory, falling back to the bottom strip when exits
leave no clear space nearby. After deployment the remaining
roster reopens only if a remaining reserve has a legal deployment destination,
including a compatible carrier. Otherwise close it immediately, even if reserves
remain. Clicking again while all reserves are blocked, spent or absent stays
silent; inspect them through the hover card. Experience
uses the original's star box (General at 8) over the icon, with
an accessible label; there is no separate numeric experience row.
Since 2026-09-26 (user request: stars were invisible when hovering a factory's
stored units), every inventory list draws each unit on a 64-pixel icon with
legible overlay stars: factory, base and cargo lists, including under a unit
standing on a factory. The stars use the battle header's layout and the same
code: they fill the left column up to 3, then the offset middle column up to
2, then the right column up to 2, and the eighth turns them into one large
General star, as in the original. A damaged reserve's machine count sits above
the stars.
The user reaffirmed on 2026-09-26 that a missing-star mouseover is a rendering
bug to investigate within this design, not authorization to add separate badges
or numeric experience labels. Preserve the existing compact roster.
The reported case is not yet reproduced: browser checks show the existing
stars in both live factory mouseovers across owners and visual styles. The
exact affected view/map is still needed; the defect is not recorded as fixed.


The latest maximum-fidelity request restores the 1989 PCE distinction:
owned factories store and repair every chassis, including aircraft and loaded
transports; prison bases allow parking and provide ground defense without
repairing. This supersedes the earlier same-day base-storage extension.
Unowned factories cannot be stopping points or deployment exits except for
capturing infantry. Since 2026-09-29 this includes aircraft, which only fly
over them (user request to match the original; evidence in `MECHANICS.md`).
Loaded carrier entry separates its passenger into storage; both are repaired.
Factory entry ends the activation immediately and is not a firing position.
Since 2026-09-30 the move command itself stores the unit or captures the
factory, so no attack, turn end or other command can come between the move and
the storage or capture (user request to match the original, whose post-move
routine does both before returning control to the map; evidence in
`MECHANICS.md`).

Capturing infantry enters the factory immediately instead of remaining on its
map hex. The factory becomes unoccupied and clickable, its existing inventory
changes to the captor's side, and the capturing infantry joins that inventory
with its deployment locked until its next turn.

The user removed redundant click-to-inspect inventory popups on 2026-09-23.
Neutral/enemy, empty and fully blocked buildings use hover inspection without
opening a dialog. The hover card retains ownership, inventory count, every
unit's icon/name, damage and experience. When a unit occupies the hex, its
hover card lists the building's contents below the unit (2026-09-26, replacing
the removed Details panel's list). A valid movement click
still captures or stores the selected unit. An unreachable owned building may
offer deployment if reserves can act, but an unreachable unowned building never
opens a popup. This supersedes the earlier any-building inspection dialog.

Unit names use the short name (Pelican, Grizzly, Atlas), without the model
designation. Every visible unit name is paired with its icon, including cargo,
inventory, action controls and combat previews. Factory hovers use the same
anchored card as unit hovers for neutral and owned factories. List each reserve
separately, even when types match; each icon shows that unit's experience stars
and General emblem. Never combine reserves into a quantity label.

Loaded transports show their passengers and icons in the shared hover/detail card. The
action strip keeps unavailable Unload controls visible, explaining whether the
passenger must wait until next turn or has no legal landing space. A finished
transport remains selectable to inspect its cargo even when unloading is blocked.

Each transport has one passenger transfer per turn: loading or unloading.
Movement does not consume it. Cargo aboard at the start of the turn may be
unloaded before or after moving; loading then moving is allowed, but unloading
must wait until next turn. Unloading then loading a different unit is also
forbidden. Apply this equally to Pelican, Mule and custom transports.

End Turn warns only about legal actions returned by the engine's live-state
availability queries. A nearby popup lists the specific units and reserves;
its Keep playing and End turn anyway buttons perform cancellation/confirmation
inside that popup. The side-wide End Turn button never changes into a confirmation.
Reserve deployment is described separately because deployment spends the unit's
turn. Escape or a map click cancels the warning; a changed board requires fresh
confirmation. Blocked, stale and spent units are excluded by the same predicates
that validate actual commands. Button hover colors apply without transitions.

At an owned base or factory, a ready unit's entire tile is its
**Deploy** button; a unit that cannot deploy states either **Next turn**
or **No open exit**. Choosing a ready unit highlights all valid
destinations among the six neighboring hexes:

- Green: an unoccupied hex whose terrain is marked `deployable`
- Blue: an adjacent friendly Mule or Pelican with an empty cargo slot

The player clicks one highlighted destination. Ground units may use compatible
transports; aircraft cannot board, Mule has its original passenger restrictions,
and Atlas/Trigger may deploy directly or aboard a carrier. Deployment spends the unit's activation, including deployment into
a transport. After capture, hover reveals the inventory and a click offers any
legal reserve deployments. The destination is a player choice rather than selecting a
transport automatically.

## Local development endpoint (2026-09-03)

The permanent local backend port is **8001**, bound to `127.0.0.1` by
`serve.sh`. The machine's shared Caddy setup registers the project as
`nectaris-remake` and exposes it at <http://nectaris.localhost>. The fixed port
prevents unrelated temporary servers from changing the project URL, while the
Caddy hostname removes the need to remember the port during normal use.

## Shift, target inspection and combat controls (updated 2026-09-21)

Stopping a loaded transport automatically opens its legal passenger-unloading
hexes in orange (2026-09-23), without a second Unload click. Reselecting a moved
carrier or ending its activation opens those choices whenever unloading is legal.
An orange passenger prompt names the cargo, and available Unload buttons use the
same orange accent. This applies to Pelican, Mule and custom transports; all
hexes come from the engine's legal unloading query. With multiple passengers,
open the first eligible passenger and keep controls for choosing another.

Before movement, selecting a ready carrier still shows movement destinations;
its orange **Unload [unit]** control can open unloading first. A Move control
returns to movement if it is still legal. Right-click, Esc or Cancel dismisses
the orange choices without spending an action or undoing the carrier's move;
a subsequent right-click on the idle map can undo that move. Keep controls clear
of the orange landing hexes and hide hover cards while choosing a landing. Cargo that already acted (including boarding this
turn), a spent transfer allowance or blocked landing terrain never opens an
illegal unloading choice; unavailable controls explain the reason.

Selecting a ready mobile unit immediately opens its legal movement destinations,
boardable transports, firing-range outlines and red legal attack targets from
its current hex (2026-09-23). Clicking a red enemy attacks immediately without
moving; clicking a blue destination moves. **Attack** can still isolate targeting;
it is disabled if no target exists. A deployed Atlas aims immediately, Trigger
has no movement/attack, and Pelican cannot attack. This 2026-09-21 speed-flow
correction supersedes the earlier separate Shift-selection step.

A destination click commits the movement immediately. With a legal shot, show
red targets directly, with no per-unit **End** choice. Without a legal shot, end the unit automatically and
return to the map. Shift-or-fire units therefore end immediately after moving.
Surviving buggies immediately show their remaining movement after attacking: every hex the engine still allows, not only the hex they occupy. Clearing the battle marks happens before that overlay is drawn, so the retreat range stays on the map.
Enemy clicks outside the legal attack targets still inspect; never add automatic move-and-attack.

**Uninterrupted unit activations (2026-09-23 user correction, implemented):**
after moving, finish that unit's attack or choose to end it before using another
unit. Switching units, inspecting an enemy, clicking away or pressing Escape
ends a started activation; its unused attack cannot be saved for later in the
same player turn. Leaving a buggy after combat also forfeits its remaining
retreat. Merely selecting/cancelling a unit before it acts spends nothing, and
clicking the active unit again keeps its current choices. This supersedes the
earlier permission to reselect a moved unit and fire later. Implicit
deselection remains part of the move's Undo step. Saves preserve the finished
state; a saved or undone activation that is still open can continue only until
the player leaves it. The separately recorded passenger-transfer allowance
still governs unloading.

On selection and after a Shift destination, only enemies attackable from that position turn
red. (Where the hover calculation appears was superseded 2026-09-29: see "Combat board".) Hovering one shows its identity, both units' combat stats, support, terrain,
surround, experience, counterattack eligibility and the resulting calculation
in the fixed left panel, outside the map. Restored at the user's 2026-09-26
request: this forecast, with its heatmap, appears directly under the selected
unit's action strip whenever an attackable enemy is hovered (the user's chosen
placement). Undo/Redo and End Turn first moved down below it while it showed;
since the later same-day instruction that commands never move during play, they
stay above the action strip and the forecast opens in the middle section. It
had been hidden inside the closed-by-default Details panel since 2026-09-22.
The heatmap comes first. The last hovered matchup remains readable while moving
into the left panel; hovering another target replaces it. Clicking a red target
commits the attack from the chosen position. The keyboard/touch target buttons
were removed with the Details panel on 2026-09-26, so forecasts need mouse hover.

The forecast includes a two-dimensional casualty probability heatmap from
100,000 independent simulation seeds: enemy losses on the horizontal axis and
our losses on the vertical axis. Show cell rates, mean losses and destruction
probabilities. Simulations use the current combat formula and the documented weighted
14-outcome damage model. Opposing rolls are independently sampled; original
PRNG correlation remains unverified. They must never read, reveal, advance or derive their
seeds from the match RNG. Hovering and cancelling must leave combat state and
the future real result unchanged. Cache projections for the current activation.

Keep unit controls in the fixed left panel, clear of attack/destination hexes.
After a committed move there is no Cancel confirmation or per-unit **End** button.
Escape clears selection and ends a started activation. Right-click backs out of the active menu, closes the
End Turn confirmation, or undoes a just-committed move. With no selection it
undoes the last noncombat action. This also works over popup controls, without
opening the browser context menu. Unload remains available for eligible passengers.
Results close automatically after the casualty animation and lock input while
resolving.

### Undo and redo history (2026-09-23)

**Undo** reverses noncombat actions across units, with no fixed step limit.
Movement (including implicit completion), boarding, unloading, deployment, storage,
repair and factory capture restore the entire previous board and action state.
**Redo** restores undone actions in order. Both buttons always appear as a linked
pair; available actions have full opacity and unavailable ones are disabled and
faded. Ctrl/Cmd+Z undoes; Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y redoes. A new committed
action discards the abandoned redo branch. Both histories persist with the saved match. Each record holds dynamic state once;
map/roster definitions are shared by the save. Undo clears stale targeting and
selection state and preserves cargo/factory identity relationships.

Combat clears all earlier history immediately, before its result animation.
Later moves may be undone only back to that postbattle state, never across the
battle. Turn changes and match completion also clear history. Undo is disabled
during combat/AI processing, as is Redo. Both histories stop at these boundaries;
combat cannot be undone or rerolled.

## Mission library and deliberate help controls (2026-09-23)

The user rejected aggressive, whole-card mouseovers and requested a consistent
structure across every campaign and level group, with extra detail behind a
subtle edge `?` control. This supersedes the earlier AI-made-only hover layout.
Partly superseded on 2026-09-26 (see Campaign menu for new players): the
original-game campaigns show no `?`, levels without notes show none, and the
category labels, most introductions and the language option are removed.

The implemented content layout is:

| Location | Visible content |
| --- | --- |
| Collection header | Category, title, one-line introduction, number of levels won and a small help button |
| Every level entry | One line containing map picture, number, name, unfinished match, attempts and personal results, then As Xenon; the entry itself is the Play target (since 2026-09-30; previously map dimensions and Union/Xenon/Neutral totals) |
| Level help | Briefing, design/special notes, tags, author/terrain attribution, source link and last-match detail, where supplied |
| Collection help | Making-of context, provenance and links to the detailed collection record |

The user subsequently rejected the large cards, tiny Play buttons, turn-budget
labels, oversized army totals and faded colors. Restore dense entries, omit
turn limits from the list, and make the main entry area a native click-to-play
button. Keep the edge `?` a separate action. This correction supersedes the
initial card layout; retain the shared structure for normal, advanced, AI-made,
Lunar Frontiers, Base Nectaris and custom collections. Preserve campaign numbering and saved result keys.
Count solo victories once per level for group progress; keep legacy campaign
clearance and separate hotseat result records. Results never add a second line.

Clicking anywhere in the main entry area launches its match; focusing or hovering
that area never opens details. Hovering the small help button deliberately opens its panel after a
short delay; keyboard focus opens it immediately. Click/tap toggles it. The latest
explicit correction requires **0 ms mouseout dismissal**: no timeout, fade or
click/focus exemption may keep it open after the pointer leaves the help button
and panel. This supersedes click-to-pin behavior and the proposed 60 ms grace
period. The panel touches its button so the pointer can enter its text or links
directly without a gap. A second click, outside click, focus leaving the help
region or Escape also dismisses it. Constrain it to the viewport, and close it
when the page or list scrolls or resizes. Only one panel may be open. It must not
change the entry's height or show missing metadata as `undefined`.

Use responsive columns of individually single-line entries and collection jump links. Keep profile selection,
Continue, history, hotseat and custom imports accessible.
Remember the menu's scroll position when starting a match and restore it after
rebuilding the list on return. Mode/profile changes must preserve entered
import URLs and handlers. Custom text is plain text; source links use safe web
URLs (or local files when running the app from disk).

Imported data is checked field by field before use (2026-09-26): levels from
files or web addresses, their custom units, and recorded games opened in the
tournament lab. Unit sides, positions, strength and experience, building
positions and owners, turn limits and custom-unit statistics must be whole
numbers in range, lists must be lists, and the grid must be equal-length rows
of text. The interface writes these values into its markup, so a crafted file
could otherwise inject page content; the hosted site's CSP blocks scripts, but
the local copy has no CSP. A rejected file changes nothing: no level is saved
and none of its custom units join the roster. File and web imports share one
status line that names the file and the reason. Field units belong to Union or
Xenon; the editor's Neutral owner applies to buildings only and refuses unit
placement.

## Heavier tanks (2026-09-05)

The six tracked tank sprites now use deeper hulls, tread shoes, engine grilles,
raised beveled turrets and recessed hatches. Polar has the widest single-turret
armor envelope and segmented skirts; Giant retains its twin guns, Titan its
missile rack, and Lenet a small scout chassis. These original pixel constructions
use the local captures as visual references only.

## Player profiles and resumable matches (2026-09-20)

Since 2026-09-26 a first visit starts as the profile **Wilson** instead of
asking for a username; **Rename** changes it (1–24 characters, unique ignoring
case). The last-used profile stays selected; the corner profile menu offers
Rename, New profile and Switch to. Each browser-local profile has its own campaign stars, complete
play history (the History tab) and, since 2026-09-30, one unfinished match per board, side, Mode
and players (see Mission menu: map pictures, attempts, unfinished matches and play history). Solo results
are wins/losses from Union's perspective; hotseat records name the winning side
and are counted separately. A later campaign win marks only that mission.
No backward compatibility (user, 2026-09-26): a saved match from an older
format is refused with an error rather than migrated. The one-time import of
pre-profile `nectaris-progress` stars is gone.

Committed human actions save automatically, including during combat animation.
Save & Menu, page hiding, and navigation also checkpoint. Uncommitted moves are
rolled back in the saved copy. Animated AI turns retain their start checkpoint
until completion; resuming replays that turn deterministically. Snapshots preserve
unit identities, cargo, factory inventory/ownership, action flags, movement
budgets, custom types, turn/player and the random generator state. The Continue
line and each level entry resume their saves; starting another match leaves the
others unfinished. Match IDs make recording outcomes idempotent.

`js/profiles.js` owns versioned localStorage data under `nectaris-profiles-v1`,
with each unfinished match under its own `nectaris-session-v1:` key.
These are local profiles without accounts or cloud sync. The browser and origin
must match; clearing site data removes profiles. Storage failures are visible;
corrupt data is never silently overwritten. Another tab writing the same match,
clearing storage or switching profile stops this tab's match and returns to the
menu without writing stale state.


## Outcome history (2026-09-20)

Since 2026-09-30 the History tab lists every result among the play events, 200
at a time (see Mission menu: map pictures, attempts, unfinished matches and play
history); mission entries show attempts, solo win/loss totals and hotseat
count, and the latest result moved to the level's help panel. Originally: match
history exposed all recorded results, ten at a time, newest first. Each
entry shows victory/defeat (or the hotseat winning faction), ending reason,
turn and timestamp. New entries identify their campaign/pack and
mission index; custom map keys include the title and layout. Old entries without
keys remain readable and match by title.

The result screen confirms which profile recorded the outcome. Completed match
IDs are immutable: repeated callbacks cannot duplicate a result, resurrect a
finished match, or clear a newer save. Turn-limit records show the last playable
turn. Regression tests cover actual engine wins and losses by base capture and
elimination, turn-limit defeat, reloads, history pagination and profile switching.

## Per-battle hover information (2026-09-20)

After choosing a firing position, moving over each red target updates one
inspector with that target's class, movement type, ground/air power and range,
defense, damage and experience. The joint casualty plot uses enemy losses on X
and your losses on Y; each cell is a percentage from 100,000 independent seeds.
Since 2026-09-26 the plot comes first, directly under the target's name, then
the mean-loss summary, the target details and the calculation, so the heatmap
fits on a 1080-pixel screen when the forecast opens under the unit's action strip.
The calculation section names support contributors and their weighted values,
shows the support divisor, terrain, experience, caps, counterattack eligibility
and ZOC/surround status. Ordinary ZOC restricts movement; it is not a separate
combat bonus. Forecasting never reads or advances the live match RNG.

## Maximum-fidelity rule baseline (2026-09-20)

See `FIDELITY_AUDIT.md` and `MECHANICS.md`. The PCE rules supersede earlier
custom behavior where it conflicts: bases no longer repair/store incoming
units, mines do not prevent elimination, and Atlas still in storage does not
prevent elimination. Other owned reserves count even when exits are blocked.
Bases never store units. Since the user removed save compatibility on
2026-09-26, maps, custom levels and saves with base inventories are refused,
and the editor cannot add them. Loading and
unloading consume the passenger's turn; unloading a ready passenger remains
available after its carrier acts. Modern profiles, saves, editor and forecasts
remain product features and are identified as extras, not original PCE rules.

### Support, surround and transport losses verified (2026-09-26)

Hudson's 1997 Windows executable (the only original code available) was traced
for support, surround, counters, survivors and transport losses. Our engine
matches all 40 recorded cases; see `MECHANICS.md` § Combat calculations and
`ORIGINAL_EXECUTABLE_NOTES.md`. Where English guides disagree with the
executable, the executable wins.

- Defense supporters only need to touch the attacker.
- Supporters need no range.
- Two opposite units surround.
- A damaged carrier cuts its cargo to its own strength; a destroyed carrier
  destroys the cargo. This is the sudden whole-unit loss seen in play.
- One rule changed: a loaded transport can no longer start a battle (the
  original refuses with "搭載中は攻撃できません"). It still counterattacks.

## Support and surround display (2026-09-26)

User decisions:
- Show the effects both before the attack and during the battle.
- "What we present should always be true (although still random)": the
  original's misleading battle-screen numbers are not reproduced. The original
  shows experience inside attack and defense, surround before support and
  terrain, terrain as a multiplier, and defense times squad size; see
  `ORIGINAL_EXECUTABLE_NOTES.md` § How the original presents the effects.
- Cargo fate is not displayed: "the user will figure that out".

Before the attack (target forecast), the map outlines the target's six
surrounding hexes: white inside the attacker's ZOC, dashed orange for gaps,
and a "SURROUNDED ½" label when all six are covered. Units whose support
changes the numbers are outlined: green for attack support, yellow for the
target's defense support. Supporters worth 0, such as a Bison beside an
aircraft, are left unmarked. The forecast states how many surrounding hexes
are covered and when the map edge blocks surround.

After an attack is committed, by the player or a watched opponent, the battle
screen opens on the numbers panel, which counts in the true order of the
calculation (see "Battle screen numbers", 2026-09-29):
1. Supporters light one by one (170 ms each).
2. Terrain is added (260 ms).
3. The surrounding hexes are checked clockwise (90 ms each).
4. The verdict holds for 500 ms.

The battle screen shows each side's calculation as a table (Base, + Support,
+ Terrain, Surrounded ½, Final, Experience); see "Battle screen numbers".

### Skipping and the return to the map (2026-09-26)

- A click during a battle jumps to its last stage, saving time. The click can
  land on the battle screen (not its buttons) or on the map during the effects
  or while "Show map" is on.
  - From the map effects, a watched preview, or the approach and fighting, the
    battle screen goes straight to its result with every earned star shown.
  - At the result, a click returns to the map at once.
  - The battle screen reads "Click to skip ahead".
- Returning to the map after a squad was destroyed, its hex explodes once
  for about 1 s so the loss is noticed (user, 2026-09-29: it used to explode
  three more times, 1.4 s).
  - The unit that destroyed it keeps its battle highlight until the next action:
    deep red for an attacker, the white ring for a defender that killed with its
    counterattack. After mutual destruction, nothing is highlighted.
  - Play continues during the explosions; a watched opponent does not wait.
- The two units in a battle are marked subtly on the map before and after the
  battle screen, from the start of the effects until the next action (user
  request, 2026-09-26). The marks are thin outlines, red at the attacker and
  white at the defender, and a faint dashed link between them, all drawn under
  the units. A destroyed unit's hex stays marked.

## Combat board (2026-09-29)

User request (2026-09-29): after an attack some highlighted hexes stayed on the
board, and the combat calculations sat in the left panel. Wanted: two screens
off the side bar, in the style of the TG-16 game, where the attack total is the
sum of the living machines, support from neighbours raises it, and the
defender's numbers gain helpful defenders and are halved for a surround.

1. **Hover screen.** Pointing at a target the selected unit may attack opens the
   combat board over the map, and it closes when the pointer leaves the target
   (or the map, or a pan starts). It replaces the left panel's forecast, the
   heatmap and the calculation text; nothing of it remains in the side bar.
   - The map shows the ZOC ring around the target, tinted in the attacker's
     colour where its zone covers a hex and dashed orange for gaps, each
     supporter outlined in its own faction's colour with its number ("+200 ATK"
     or "+20 DEF"), and a tag on the target: "ZOC n/6" or "SURROUNDED ½".
   - The board docks at the top or bottom edge, whichever covers fewer of the
     lit hexes. Its width is a fraction of the map; a narrow map stacks the two
     squads. Union is always left and blue, Xenon right and green.
   - Each squad has one card: unit, role, machine count, then rows Base,
     + Support, + Terrain, Surrounded ½ (only when it applies) and Final, with
     Attack and Defense columns.
   - Attack is a squad total (machines × per-machine attack); its Base row also
     shows "8×50". Defense stays per machine, because squad size never
     multiplies it and it caps at 100 (MECHANICS); its column reads "Defense"
     (not "Defense %", since 2026-09-29). Every total is the
     engine's per-machine number times a count, so the Final row equals what the
     battle uses and nothing is invented ("what we present should always be
     true").
   - Experience is the last row, "Experience ×1.20" and so on (1.05 at one
     star up to 2.00 at seven and the General), for squads with at least one
     star (user, 2026-09-29: a step should show how the experience level
     improves the numbers). The engine applies it to the damage a machine
     deals, after defense and after the 100 cap, so the row sits after Final
     and shows the attack it amounts to, floor(final attack × multiplier),
     which may pass 100. It never changes defense. Exact damage floors once
     more after defense, so this figure can differ from the battle's by
     rounding. The experience is not folded into Base, as the original does
     (2026-09-26 decision).
   - A supporter's number is its share of the support: the change in
     floor(sum of supporter value × strength / (2 × attacker strength)), so the
     shares add up to the engine's support figure exactly (`build` throws if
     they do not).
   - Each card also charts that squad's projected losses as bars 0..N in its
     faction colour, with the percentage above each bar, the most likely count
     highlighted, the average and the chance of losing every machine. This
     replaces the joint heatmap: the two squads' rolls are independent, so the
     joint table held nothing the two charts do not. Still 100,000 simulated
     battles, never the match's dice. Without a counterattack the attacker's
     card has no chart (since 2026-09-29 there is no "Machines lost" heading and
     no "0 no counterattack" line).
2. **Battle-prep count.** Moved into the battle popup on 2026-09-29 (see
   "Battle screen numbers"). After the attack is committed, by the player or a
   watched opponent, the same steps count up inside the popup: machines fire their base attack one after another (30 ms each),
   each supporter lights and adds its share (170 ms each), terrain adds to
   defense (260 ms), the six hexes are checked clockwise (90 ms each), then
   a surround halves the defender (150 ms), the experience multiplier lifts
   each starred squad's attack (220 ms, only when a squad has stars) and the
   final numbers hold 500 ms.
   Rows appear as their step is reached; the row being counted is yellow. The
   left panel shows nothing during it.
3. **Nothing lingers after your own attack.** Aiming ranges and legend clear
   when the battle starts; the outlines, link and killer highlight of the two
   units no longer stay after the player's battle (the explosions of a destroyed
   squad still play). Since the 2026-09-29 "Battle screen layout" decision this also
   holds for a watched opponent's battle and at the end of its turn. The
   hover board also used to stay open, with its ring and supporters, after the
   pointer moved to empty ground; that was the source of the stray hexes.

Superseded by this record: the left-panel forecast, heatmap and calculation
text; the war dock's per-machine step table; the AI preview's "before the roll"
text (the dock then kept the scene headline and the result report/ledger;
matches dropped those on 2026-09-29); the
"faintly marked until the next action" rule for the player's own battles. The
old `js/combat-view.js` and the war dock's `effectsHtml` step table were deleted.

## Battle screen numbers (2026-09-29)

User request (2026-09-29): the combat board still appeared in the left-hand
area; "a better and proper location is within the actual battle popup". The
popup's layout was redone to give the comparison of attack, defense and the
numbers used a dedicated region, because a player learning the game must be able
to pause and study it. The per-side cards, team headers, step tables and the
"Support from", "Per machine" and "Squad" rows below were replaced the same day
by the face-off, minimaps and luck charts in "Battle screen redesign (third
pass)"; the Where, When, Left panel, Hover and Replay points still hold.

- **Compact frame (user, 2026-09-29, after testing).** The screen carries no
  Ready / Fighting / Result strip, no "NUMBERS ... hexes ..." facts line and no
  "Union · attacking · 8 machines" title row above each card. Each card's table
  header names its team ("Union", "Xenon") in the faction colour, over the
  faction-coloured top edge; role and machine count stay in the combatant
  heading. The one-line status ("Union preparing to attack", "Union attacking")
  shares the control bar under the screen with Pause and the "Space: pause ·
  click: skip" hint. The result used to add "Union attack · 5 destroyed · 1 lost";
  that line was removed the same day (fourth pass, below). The same bar is used on
  the tournament replay page. The hover board keeps its facts line.
- **Where.** The numbers panel is inside the battle popup, under the two
  formations and above the outcome line. Each side's card sits under its own
  formation (Union left and blue, Xenon right and green), so a side's steps are
  read beneath its machines and the two sides are compared across the same
  rows. Every width is a fraction of the popup; type and formation sizes follow
  the popup's height. The popup no longer has a 950 px maximum width.
- **What.** Per side: the step table (Base with "8×50", + Support, + Terrain,
  Surrounded ½ where it applies, Final, Experience ×N), a "Support from" line
  with each supporter's icon and its share, then "Per machine" (attack ×
  (100 − defense)% = damage, times the experience multiplier) and "Squad"
  (machines × damage, times the roll, with the average destroyed). After the
  roll the Squad line becomes "Roll 130% → 634 damage → 5 of 7 destroyed", with
  the average and whether the result was above or below it. These are the
  numbers the engine uses; the roll comes from the match's actual dice.
- **When.** The popup opens on the count-up, so Pause, Space and click-to-skip
  act on it; the formations stay apart until the count ends, then approach, fire
  and show the result with the finished numbers in place.
- **Left panel.** It carries no calculation. The war dock kept the result
  headline (destroyed/lost) and the running ledger until the user removed them
  from matches on 2026-09-29
  ([record](#no-battle-report-in-the-matchs-left-panel-2026-09-29)); the roll and
  formula lines it used to show are in the popup.
- **Hover.** Pointing at a target still opens the combat board over the map,
  because it needs the map's ZOC ring and supporter numbers; it has the same
  step rows and the projected-loss charts.
- **Replay.** The tournament replay's battle screen uses the same numbers panel.

## Battle screen layout (2026-09-29, second pass)

User requests (2026-09-29): "make sure that the battle screen shows the actual
unit area large"; "don't leave highlighted hexes from older attacks living on
the board, i still see this"; "the calculation area should be clearly and simply
laid out and not expand as text is added; premake it the right size"; "make sure
its easy and obvious how users can pause this screen then resume, to see the
resulting calculations and also see the kill distribution". This supersedes the
sizing and the "watched opponent keeps its marks" parts of the records above.
The third pass (next record) replaced the heading's role and count, the cards'
contents, the chart heading and the control order; the fixed regions, the fixed
panel height (now 17 x `--nf`), Pause and Resume, Skip, "Stop at result" and the
cleared marks still hold.

- **Three fixed regions in one column** (`css/battle-dock.css`): a slim heading
  (unit mark 64 px, 48 px on narrow screens; name, role and machine count on one
  row), the unit field, and the numbers panel. The field takes all the height the
  others leave, about half the window, and the machines scale to it (`--cell`:
  the window's height less the fixed regions, over three rows, at most 112 px and
  9vw). The popup fills the board area; nothing scrolls.
- **The numbers panel never resizes.** Its height is 19.5 x `--nf` (its type
  size, from the window's height and width), reserved before any number arrives.
  Each side has a card: on the left the step table (header naming the team, up to
  six rows of fixed height, the row being counted in yellow), on the right the
  loss chart, and under both three one-line rows of fixed height ("Support
  from", "Per machine", "Squad" that becomes "Roll ... destroyed"). A row that is
  not reached yet is blank and keeps its height; the roll's verdict wording
  ("above the average") is left to the war dock, so the Roll row fits one line.
- **Kill distribution.** Each card's chart, "Machines lost · chance %", gives the
  chance of that squad losing 0..N machines to the other side's shot: exact, from
  the published 100-row roll table via `COMBAT.marginal`, never the match's dice
  and not the hover board's 100,000-battle simulation. The most likely count is
  light, the average is written under it, and the chart appears with the final
  numbers. After the roll the actual loss is drawn solid yellow with a white
  outline and its label reversed, and the line under the chart reads "Result N
  lost · avg X". Without a counterattack the attacker's card says so.
- **Pause and resume.** One large button (48 px tall, 20 px type) with a drawn
  icon and the "Space" key on it: it reads Pause while running and turns solid
  yellow, reads Resume and shows a play icon while paused, and a yellow PAUSED
  tag sits on the field. A "Skip" button jumps to the result, then to the map
  (clicking the screen still does the same). "Stop at result" (off by default,
  remembered in `localStorage` key `nectaris-battle-hold`) pauses the screen once
  the result and every earned star are showing, so the final numbers and chart can
  be read without racing the 1.4 s hold; Resume then closes it. The tournament
  replay's bar uses the same button styling and PAUSED tag.
- **Nothing stays marked after a battle.** `GameUI.clearBattleMarks` clears the
  attacker and defender outlines, the link, the killer/target highlight, the
  support and surround overlay and aiming hexes when a battle's aftermath starts
  and when an AI turn ends, for the player's battles and a watched opponent's
  alike. Explosions of destroyed squads still play for one second. The tournament
  replay keeps marking the step it is showing and clears them on the next step.

## Battle screen redesign (2026-09-29, third pass)

The user reviewed the battle screen point by point on 2026-09-29 ("so basically
we're redoing this page"). This record supersedes, in the records above: the
heading's role label and machine-count box, the field's tilt and split scenery
for adjacent fights, the centre arrow, the numbers panel's step tables and its
"Support from", "Per machine" and "Squad" rows, the loss chart's heading and
no-counter text, and the control order. Implemented in `js/battle-report.js`,
`js/combat-panel.js` and `css/battle-dock.css`, for play, watched AI and the
tournament replay alike; not yet looked at in a browser (release first).

1. **Level formations.** "why are the units angled upwards? They shouldn't be
   given this is not an artillery or air battle." Formations tilt (8 degrees)
   only when a shot goes up: fire from range, or an aircraft in the fight
   (`battle-field-lofted`). Adjacent ground units stand level.
2. **Heading: unit mark and name only.** "'Union - Attacking' is not useful";
   "N Machines is not useful ... We can see this." Xenon's heading mirrors
   Union's toward the right edge. The remaining machines appear on the icon's
   corner exactly as on the map sprite (blank at full strength, 8) and drop,
   with a brief flash, the moment machines fall ("the number next to the unit
   on the main map and on the top unit icon should immediately go down as
   units die, that's it"). The status line in the control bar still names the
   attacker.
3. **One ground for adjacent units.** "the land between the two sides shall be
   flat visibly and not cut. If it were arti or some other distance attack, the
   visible division would make sense." An adjacent exchange draws one horizon
   across the field; each side's relief stands behind its own formation and
   fades out before the middle, where the two terrain colours blend on flat
   ground. Fire from range keeps the two separate halves. The arrow in the
   middle of the field is removed; the numbers panel's arrows (item 6) show who
   fires.
4. **No team names in the numbers panel** ("it's obvious the left is you").
5. **Defense is a number, not a percentage.** The user asked "Is defense really a
   %?". Defense is per machine: base + support + terrain, halved when
   surrounded, capped at 100. The damage formula then uses it as the share of
   each machine's hit that it stops: hit = attack × (100 − defense) / 100. The
   number of machines never multiplies it. The original's screen showed defense
   times machines with terrain as a percentage, which its own calculation does
   not use; the 2026-09-26 rule "What we present should always be true" keeps
   the real value. The battle screen labels it DEF; the hover board's column
   reads "Defense" (was "Defense %").
6. **Face-off totals.** "make it big and make it clearly shown ... rising as we
   calculate things, til it's done ... perfectly lined up and visually clearly
   going against the enemy". Two rows cross the panel, whoever attacked:
   Union's ATK → Xenon's DEF, then Union's DEF ← Xenon's ATK. Each total has its
   own column beside the arrows, so the two rows line up. Totals are the
   largest type on the screen (2.7 × the panel's type), white while counting
   and yellow once final. Each grows from a one-line equation of its parts,
   written outward from its "=": "8×70 +240 support ×1.40 exp = 800",
   "20 +5 Plains ½ surrounded = 12", with "cap" where the 100 limit cut it; the
   term being added is yellow. A lone unmodified value reads "20", not
   "20 = 20". The count keeps the Battle-prep count timing, both sides at once
   ("on the defender side, same thing, same time"). A side that cannot fire
   shows ATK "—" and has no arrow. Once rolled, each arrow names its roll
   ("roll ×1.3"); the fight then plays as before.
7. **Minimaps** ("a nearby hex little minimap for each side showing exactly how
   much each neighbor helped, how much surround helped, support, terrain").
   One per side, under its numbers: the two units and every hex touching
   either, in terrain colours. The map is drawn points-up and turned (never
   mirrored) so the Union unit is left of the Xenon unit on one row, as on the
   screen. The side's own hex is outlined white with its terrain bonus
   ("+5 DEF"). Its supporters are outlined in its colour with their shares
   ("+240 ATK", "+20 DEF"), each appearing as the count adds it. The attacker's
   map lights the six hexes around the target in the count's clockwise sweep
   (open hexes dashed orange), and "½" marks a surrounded target on both maps.
   Fire from range shows only the two hexes and their distance.
8. **No per-machine, squad or "Machines lost" text.** "rethink the entire method
   we visually show the calculations neither hiding nor belaboring it"; "the
   squad info - what's that?"; "we don't need this 'Machines lost' text at all";
   "we also don't need this 0 or the 'no counterattack' text". The equations,
   minimaps and the roll on each arrow replace the step tables and the "Support
   from", "Per machine" and "Squad" rows. The hover board also drops the
   "Machines lost" heading and "0 no counterattack". **Terminology:** the
   interface says unit (of 1 to 8 machines), never squad; code comments may.
9. **Loss charts with luck** ("show the distribution of outcomes, and the actual
   one we get ... so that we know if we were lucky/unlucky both in terms of
   number killed of enemy, and number lost self"). Each side's chart of its own
   losses (exact, from the published table) keeps its percentages and most
   likely count, marks the average under the axis ("avg 2.9") and, once rolled,
   shows the actual count in yellow with LUCKY, UNLUCKY or AS EXPECTED for that
   side. Within half a machine of the average counts as expected, as in the left
   panel's verdict. A side nothing shoots at has an empty chart area.
10. **No stars for a destroyed unit** ("if our unit dies completely we shall not
    gain any exp visually"). The engine still awards a destroyed attacker its
    points, which no longer matter; the screen, its sounds and the replay show
    no new stars for it (`BATTLE_REPORT.shownRank`).
11. **Controls.** Status on the left, then "Stop at result" (a toggle reading
    On / Off, same stored setting), Skip, and Pause / Resume at the lower right.
    The replay bar has the status, its hint and Pause / Resume, in that order.

How the dice relate to the numbers (the user asked whether the final attack
number is the only input to the random generator): the dice take no input. Each
shot draws one multiplier from the published 14-row table (×0.2 to ×4, average
×1.09). Damage is the attack total (experience included) × (100 − defense)% ×
that multiplier, floored at each step; the target keeps one machine per whole
100 of its hit points left, where it has 100 per machine plus 50 when it has
more than one. Attack, defense, experience and both machine counts shape the
result; the roll only scales it.

## Battle screen redesign (2026-09-29, fourth pass)

The user reviewed the third pass the same day. This replaces, in the records
above: the crossed face-off rows and their arrows (third pass item 6), the
per-side minimaps (item 7), the luck wording on the charts (item 9), the
result status line "Xenon attack · 2 destroyed · 0 lost", and the rule that
machine sprites grow to fill the field (second pass, `--cell` up to 112 px).

1. **Same two rows on both sides.** Attack is the first row and defense the
   second, for Union on the left and Xenon on the right. Nothing is drawn from
   one side's attack to the other's defense. Once rolled, the shooter's own
   attack carries its roll ("roll ×1.3"). A side that cannot fire shows ATK "—".
2. **Loss charts are a fixed scale.** Each chart always has nine columns, how
   many machines die: 0, then 1 through 8. The columns are a fixed narrow
   width (the wider gap before column 4 was removed in the fifth pass). Bar
   height is the chance on a 0%–100% axis (100, 50 and 0 marked), not
   stretched so the tallest bar fills the chart. The words "lucky",
   "unlucky" and "as expected" are not shown. A side nothing shoots at is a
   chart with 100% at 0.
3. **One hex map, in the center,** between the two charts (painted from the
   real board since the fifth pass).
4. **Formation sprites stay at 64 px,** twice the 32 px frame: the native
   icon, scaled by the stylesheet without smoothing. (This pass first drew
   them into bitmaps of their shown size; that was undone in the fifth pass,
   below.)
5. **No result tally under the screen.** "Preparing to attack" and "attacking"
   stay in the control bar. The finished battle does not add a destroyed/lost
   line there.

## Battle screen redesign (2026-09-29, fifth pass)

The user reviewed the fourth pass the same day. This replaces, in the records
above: the popup filling the board ("Where" in Battle screen numbers, "Three
fixed regions" in the second pass); defense shown per machine (third pass item
5, and the hover board's Defense column); the fourth pass's gap before column 4,
its "avg" line and its flat-colour hex map. Implemented in `js/combat-panel.js`,
`js/battle-report.js`, `js/render.js` (`paintScene`), `js/unit-view.js` and
`css/battle-dock.css`, for play, watched AI and the tournament replay.

1. **The popup is sized to its contents** ("screen is too stretched, no need to
   fully expand this much! shrink while retaining properly laid out"). It is as
   wide as its numbers need, at least 58 × the panel's type size and never
   wider than the board, and as tall as the heading, a field 4.7 machine
   sprites tall and the numbers panel (22 × its type size). It is centred over
   the board, which shows through a dimmed margin. Machine sprites stay 64 px
   and shrink only on a board too short for the popup. When the board is
   narrower than the finished equations need, the panel's type shrinks until
   they fit whole (`--need`, the panel's width in em, estimated in
   `combat-panel.js` from the equations): a clipped digit would state a wrong
   number, so an equation is never cut.
2. **Each total before its label, in one column per side** ("the ordering of
   the labels e.g. 'DEF' vs '85' for the defenders seems wrong. I think the
   numbers should be vertically laid up"). Both sides read "equation = total
   LABEL roll": "6×50 +162 support ×1.20 exp = 552 ATK roll ×2" over
   "6×40 +30 Plains = 270 DEF", Xenon the same. Each side's block is centred
   in its half, with a rule between the halves. The finished equation is laid
   out invisibly from the first frame, so nothing moves as terms arrive.
3. **Every value is a unit total** ("we should still show the TOTAL points of
   support and for everything in general ... never except at the very
   beginning show the 'per unit' costs"). Only the first term shows the
   per-machine value ("6×40"); every later term and every total is times the
   machines: "6×40 +30 Plains = 270 DEF", a defense supporter's share
   "+120 DEF", terrain "+30 DEF". The engine still works per machine, with
   defense as the share of each hit it stops (0–100); a defense total is
   machines × that value. The user asked whether a neighbour with 3 machines
   supports less: yes. A supporter adds its attack (or defense) × its machines
   ÷ (2 × the attacking unit's machines) to each machine, so 3 machines give
   3/8 of what 8 do; its share on the map and in the equation is that amount
   for the whole unit it helps. The hover board and the map badges use the
   same totals.
4. **Loss charts.** Nine evenly spaced columns ("there is a weird hgap within
   this otherwise well-done straightforward list of amounts") and no "avg"
   line ("we can remove the entire line saying avg"). The triangle under the
   axis still marks the average.
5. **The hex map is the board itself** ("should use the actual terrain and
   units, and use highlighting of the hexes and things to show which effect
   each one is causing and from where, as it calculates"). A crop of the board
   as the map draws it, in the current style and art set, in the board's own
   orientation (never turned), with every unit on it, painted from a record of
   the board kept with the battle (`BATTLE_REPORT.battleArea`: terrain,
   building owners, units, the combatants at pre-battle strength), so a replay
   shows the board as it was. It frames both units, every hex touching either
   and every unit whose zone of control covers the ring. As the count runs:
   each supporter's hex lights with its share, yellow and joined by a line to
   the unit it helps while it is being added; each combatant's hex (outlined
   white) gets its terrain bonus; the six hexes around the target are checked
   clockwise, lit in the attacker's colour or dashed orange when open, and the
   hex being checked is joined to the units whose zone covers it. The verdict
   ("½", or "5/6 ZOC") sits on the target's edge square to the attacker. Fire
   from range shows both units, the hexes between, a dashed line and the
   distance.

The fourth pass's "black borders around the units" point concerned the hex
map's unit tokens, which the painted board replaces. Its change to draw
formation icons into bitmaps of their shown size was undone: it broke the rule
that interface icons keep their native 32 px frame (`test/unit-art-tests.js`).

## Grok 4.7 15 tactical gap-filling units study (2026-09-23)

Review of the experimental outline item "design 15 gap-filling units" recorded in
`PROJECT_GUIDE.md` and `tools/design-space/README.md`. While the prior mathematical
study used an unconstrained maximin distance search that yielded degenerate boundary
extremes (e.g., 1-move wheeled units pinned to roads, 0-attack 80-defense tanks, and
defense-cap overflow), this study establishes an alternative 15-unit tactical set
grounded in operational wargame doctrine, combined-arms roles, and tempo tradeoffs:

- **Directory:** `grok4.7/`
- **Data & engine compatibility:** `grok4.7/custom-units.json` adheres to `mergeUnitTypes`
  schema without duplicate stock statlines, verified by `grok4.7/validate.js`.
- **Art assets:** 30 native 32×32 pixel sprites (15 Union, 15 Xenon) with upper-left lighting
  and centered silhouettes generated via `grok4.7/icons.js` into `grok4.7/icons/` and
  `grok4.7/sheet.png`.
- **Visual interface:** `grok4.7/gallery.html` and `grok4.7/index.html` deliver a high-contrast
  fluid overview (100% pure white `#ffffff` text on dark surfaces, prominent bold tabular stats,
  no gray text, fluid fraction-based card grid, and class filtering).
- **Roster scope:** 15 functional roles across 7 classes:
  1. `AEGIS` (Aegis AA-60, antiair, move 3 treads, 20/70, def 60, rngA 2 indirect AA anchor)
  2. `GADFLY` (Gadfly AD-31, antiair, move 8 wheels, 10/55, def 15, road AA interceptor)
  3. `ARGUS` (Argus AD-77, antiair, move 0, 0/60, def 30, rngA 4 deployable air umbrella)
  4. `BREACHER` (Breacher SG-9, artillery, move 4 treads, 55/0, def 35, rngG 3 move-and-fire assault gun)
  5. `LONGBOW` (Longbow AT-22, artillery, move 5 treads, 75/0, def 25, rngG 2 stand-off tank destroyer)
  6. `REDOUBT` (Redoubt FP-80, artillery, move 0, 60/0, def 70, rngG 2 deployable armored pillbox)
  7. `JAVELIN` (Javelin GX-90, infantry, move 3 foot, 85/0, def 10, foot anti-armor hit-and-run)
  8. `PAVISE` (Pavise GX-55, infantry, move 2 foot, 20/10, def 30, heavy shield capturer)
  9. `TRENCH` (Trench GX-41, infantry, move 2 foot, 35/0, def 10, rngG 3 mortar capturer)
  10. `DUSTER` (Duster AC-12, tank, move 7 wheels, 45/30, def 20, wheeled combat gun car)
  11. `WHIPPET` (Whippet MB-7, buggy, move 10 wheels, 20/20, def 10, high-speed recon scout)
  12. `CONDOR` (Condor CA-9, transport, move 7 air, 20/20, def 30, cargo 1 armed airlift)
  13. `TICK` (Tick M-3, mine, move 3 treads, 0/0, def 70, mobile obstacle and ZOC drone)
  14. `HAULER` (Hauler NC-7, transport, move 5 wheels, 30/20, def 30, cargo 1 foot combat transport)
  15. `SLOGGER` (Slogger HMB-9, tank, move 3 treads, 80/0, def 60, waste-capable breakthrough tank)

## Gemini 3.8 15 tactical gap-filling units study (2026-09-23)

Dedicated proposal and review pack designed by Gemini 3.8 reviewing the project outline
item "design 15 gap-filling units". The design addresses operational dilemmas
and combined-arms roles missing from the stock 23-unit roster without degenerating into
boundary-sampling statistical extremes:

- **Directory:** `gemini38/`
- **Data & engine compatibility:** `gemini38/custom-units.json` adheres to the `mergeUnitTypes`
  schema, loaded without errors and verified by `gemini38/validate.js` (valid range bands,
  Pelican loading compatibility, and zero duplicate statlines).
- **Art assets:** 30 native 32×32 pixel art sprites (15 Union right-facing, 15 Xenon left-facing)
  authored with upper-left illumination and centered silhouettes via `gemini38/icons.js` into
  `gemini38/icons/` and a 3×5 contact sheet at `gemini38/sheet.png`.
- **Visual interface:** `gemini38/gallery.html` and `gemini38/index.html` deliver a high-contrast
  fluid overview (100% pure white `#ffffff` text on dark surfaces, prominent bold tabular stats,
  no gray text, fluid fraction-based card grid, and class filtering).
- **Roster scope:** 15 functional roles across 7 classes:
  1. `PHALANX` (Phalanx AA-50, antiair, move 5 treads, 35/75, def 50, armored frontline flak tank)
  2. `SENTINEL` (Sentinel AD-80, antiair, move 0 treads, 0/80, def 25, rngA 5 static SAM battery)
  3. `DART` (Dart MB-6, buggy, move 7 treads, 25/50, def 20, rngA 2 hit-and-run anti-air buggy)
  4. `STORM` (Storm SG-50, artillery, move 4 treads, 50/0, def 35, rngG 3 move-and-fire assault gun)
  5. `CYCLOPS` (Cyclops MR-75, artillery, move 3 treads, 75/0, def 25, rngG 5 heavy siege rocket launcher)
  6. `BUNKER` (Bunker FB-70, artillery, move 0 treads, 65/30, def 70, deployable direct-fire cupola)
  7. `RANGER` (Ranger GX-35, infantry, move 4 foot, 35/25, def 16, mountain commando skirmisher)
  8. `HOPLITE` (Hoplite GX-25, infantry, move 2 foot, 25/15, def 26, heavy armored capturer)
  9. `MORTAR` (Mortar GX-40, infantry, move 3 foot, 40/0, def 12, rngG 3 mountain mortar squad)
  10. `CHEETAH` (Cheetah AC-8, tank, move 8 wheels, 50/0, def 30, wheeled cavalry tank)
  11. `RHINO` (Rhino AT-85, tank, move 3 treads, 85/0, def 45, heavy casemate tank destroyer)
  12. `MAMMOTH` (Mammoth HMB-5, tank, move 3 treads, 80/0, def 65, waste-capable breakthrough tank)
  13. `BUFFALO` (Buffalo NC-5, transport, move 5 treads, 25/15, def 35, cargo 1 armored combat APC)
  14. `CORSAIR` (Corsair AX-80, air, move 8 air, 80/30, def 40, heavy anti-tank attack gunship)
  15. `TALON` (Talon MB-9, buggy, move 9 wheels, 35/20, def 15, high-speed wheeled recon buggy)

## Claude Opus 5.5 gap-filling units study (2026-09-23)

Proposal pack in `opus55/` for the outline item "design 15 gap-filling units",
produced by a Claude Opus 5.5 session. It does not change the playable roster,
maps, renderer or AI; nothing outside that folder is generated.

- **Design rule:** each unit fills one empty cell of the stock rule matrix (chassis,
  firing band, turn rule, carrier role) with at most one special rule, using only
  engine fields that exist today. Each gap is a test over `js/data-units.js`; the
  build fails if any stock unit contradicts it.
- **Units:** foot units for ground that tracks cannot enter (Yeti walker, Meerkat
  anti-air team, Howler mortar team, Gecko raiders); carriers (Wombat armored
  carrier, Stork assault helicopter, Camel heavy transporter); air rules (Wasp attack
  helicopter, Vulture stand-off drone, Shrike missile interceptor); ground rule
  combinations (Mantis mobile SAM, Snapper pillbox, Pike tank destroyer, Hound
  armored car, Squid rocket truck).
- **Source and outputs:** `units.js` holds the prose, definitions, gap tests and
  exchange claims; `build.js` writes the icons, sheets, `custom-units.json`,
  `analysis.json`, `README.md` and the self-contained `index.html`, and refuses to
  write them if an exchange claim, prose comparison, gap test or the dominance screen
  fails. `verify.js` also checks the engine rules each unit relies on, classic and
  apex CPU games with all fifteen, the review's statements about
  `tools/design-space`, and that the files on disk match a fresh build.
- **Open items if a unit enters play:** in-game art stays the stock placeholder named
  by each unit's `sprite` field; `threatenedBase` in `js/ai.js` reacts only to a
  Pelican, so a Stork airlift toward a base does not trigger base defense; the CPU
  can deploy a Snapper where it blocks one of its own factory exits; apex turn time
  grows with unit count (one apex turn on the 42-unit verify map took 143 s, and
  126 s with stock units of the same chassis, measured once).

## Opus-Sonnet 5.5 gap-filling units study (2026-09-29)

Second proposal pack for the outline item "design 15 gap-filling units", in
`opus-sonnet-55/`, requested by the user with icons in Legacy style, a full design and
a one-glance table of basic characteristics. It does not change the playable roster,
maps, renderer or AI; nothing outside that folder is generated. Overview page:
`opus-sonnet-55/index.html`; design and table: `opus-sonnet-55/README.md`.

- **Design rule:** the game has no purchase cost, so a weaker copy of a stock unit is
  not a gap. Each unit opens a rule combination or terrain access that no stock unit
  has (a predicate over `js/data-units.js`), and no unit dominates or is dominated by
  any stock or new unit (move, defense, both attacks, firing band, capture, cargo,
  fire policy, terrain costs; 1110 ordered pairs).
- **Units:** foot teams for ground that tracks cannot enter (Ibex mortar, Nettle
  anti-air, Ferret skirmisher); Locust rocket truck (range 4 after a road move);
  Cyclone dual battery; Warden flak tank (anti-air ring 2-3); Stalker move-or-fire
  direct gun; Badger armored carrier (also the only carrier for the two fixed
  emplacements); Rhino armored capturer; Redoubt pillbox and Javelin SAM site; Hornet
  helicopter (attack, then fly on); Lancer air artillery; Merlin air-to-air missile
  interceptor; Dragonfly flying capturer.
- **Icons:** 16x16 art pixels doubled to 32x32, the seven Legacy chart colours, an
  automatic black contour, left frames mirrored. `unit-art.json` follows the
  `art/legacy` frame format; nothing is registered in `js/unit-icon-sets.js`. In-game
  sprites stay the stock placeholder named by each unit's `sprite` field.
- **Source and outputs:** `units.js` (rules and prose), `art.js` (icons) and
  `analysis.js` (gap and dominance screens, engine-run exhibits) are hand-written;
  `build.js` generates the icons, `sheet.png`, `unit-art.json`, `custom-units.json`,
  `analysis.json`, `page-data.js` and `README.md`. `verify.js` runs every check,
  including icon geometry (no see-through holes, 2x2 pixels, centring, distinct
  silhouettes), banned wording, and that the files on disk match a fresh build.
- **Open items if a unit enters play:** no CPU self-play was run with these units;
  Dragonfly and Rhino change base-race timing; Javelin (95 attack, range 2-4) may make
  aircraft unusable on small maps; Redoubt on a base has 85 defense; scenarios that
  place Redoubt or Javelin by transport need a Badger.


## Three terrain campaigns (2026-09-23)

The user requested three new campaigns of sixteen levels each around **open sea
of land**, **dense center / spacious outskirts**, and **difficult terrain**.
The focus is physical map design and tactical situations, with permission for
small forces, limited unit types and apparently strong but awkward positions.
Hunters, Falcons and Eagles should generally be avoided. Implemented as **Open
Horizons**, **The Knotted Heart**, and **Broken Ground**, with all three aircraft
excluded entirely. Pelicans and all other stock types are used across the set.

The user's follow-up explicitly requires clear AI-made attribution. All three
campaign display names are prefixed **AI-made:** in the library and
navigation; their collection category is **AI-made campaign**, and every
individual level credits **AI-made by Codex**, including downloadable JSON.
Campaign IDs, map names, progress keys and gameplay data remain unchanged.

These are 48 new missions in three separate menu collections, with their own
01–16 numbering, profile result keys, saved-match identity and
Next mission progression. Mission 16 ends its own campaign. Existing map packs,
numbering and source data are preserved. Each mission starts with fresh forces;
there is no army carryover or new campaign economy.

Implementation choices: boards range from 24×16 to 42×28, terrain and stock
placements use half-turn symmetry, and some starting armies are deliberately
asymmetric. Factories carry focused four-unit teams; immobile reserves follow
a compatible carrier. The old fjord-specific factory-count, mouth-count and
mountain-thickness constraints do not apply to these newly requested physical
families. Routes are checked for the units that actually use them, and factories
have genuine legal deployment terrain. The normal movement, capture, elimination
and turn-limit rules remain in force. The existing opening selector still applies;
Original opening preserves the exact authored roster puzzles, while compensation
offers may add units. The briefs describe tactical problems, not hidden objectives.

[Campaign catalog and import bundles](ENVIRONMENT_CAMPAIGNS.md) record every
mission. The deterministic builder, physical-route tests, menu/save/progression
tests and all-map CPU self-play cover integration and execution. These are new
scenarios whose difficulty and multiplayer balance still need human playtesting.


## Three balance-study campaigns (2026-09-28)

The user asked for three more campaigns whose bot results would confirm or
refute ideas about what balanced maps are like, and approved nine aspects on
2026-09-28 (listed in
[ENVIRONMENT_CAMPAIGNS.md](ENVIRONMENT_CAMPAIGNS.md#three-balance-study-campaigns)):
**Bridgeheads** (valleys split every board), **Siege Lines** (Xenon holds a
fortified camp) and **Arsenal** (neutral factories' reserves decide games), 16
missions each, one idea per mission, lunar place names, no new rules. Paired
variants of one map were rejected. They follow the three terrain campaigns in
the library, titled **AI-made:**, and every level credits **AI-made by Claude
Opus 5.5**.

Balance standard (user, 2026-09-29): the best bot playing itself should give
Union (first) and Xenon (second) about equal chances; implemented as Union
winning 40-60% of Marshal self-play games, with Xenon's wins at the turn limit
reported separately. Other bots and skill checks are reported, not tuned for.
All 48 missions meet it on dice seeds the tuning did not use, none within two
points of the range's edges. The measurements,
the tuning record and the findings about balanced maps are in
[MAP_BALANCE.md](MAP_BALANCE.md). Human play has not been measured.


## Fuseki hosting (2026-09-26)

Requested for later on 2026-09-26, then launched the same day at the user's
request: https://nectaris-remake.fuseki.net/, with `https://fuseki.net/nectaris-remake/`
as its entry link. The site has its own HTTPS origin, a dedicated restricted
deployment identity (`nectaris`, which can only upload a release for this
site), and validated atomic releases of the explicit runtime list in
`deploy/runtime-files.json`: the pages (game, editor, tournaments and, since
2026-09-27, [thanks](#thanks-page-2026-09-27); since 2026-09-28, the
[Rust simulator page](#rust-simulator-page-2026-09-28)), `css/`, `js/` (including the AI,
opening and tournament workers), `levels/`, and the linked `MECHANICS.md` and
`LEVEL_SOURCES.md`. Excluded: `art/` sources (the runtime draws units from the
JavaScript art tables), `inspiration/`, the model-named proposal packs,
`tools/`, `test/`, and research documents. Every master commit that passes
Tests is released by `.github/workflows/hosting.yml`.

The page's Content-Security-Policy allows connections only to its own origin,
`raw.githubusercontent.com` and `gist.githubusercontent.com`, matching the
online level import's "Raw GitHub and Gist URLs work"; other import hosts are
refused on the hosted copy. Browser saves stay at their original origin
unless explicitly exported/imported. Provenance: the optional Legacy unit
icons (`js/data-unit-art-legacy.js`) are third-party-derived art published
here as they already are in the public repository; see `art/legacy/README.md`.
The Fuseki repository's
[independent application hosting plan](https://github.com/ernop/fuseki4_ai/blob/master/docs/minesweeper-friendly-hosting-plan.md)
owns the server side.

## Thanks page (2026-09-27)

Requested by the user on 2026-09-27, after the credits research in
[NECTARIS_CREDITS.md](NECTARIS_CREDITS.md): a page thanking the creators of
"this wonderful game", in English and Japanese, with links to all sources and
the best references, imagery from the game's history and of the team, and
links in both directions between it and the game on fuseki. Tone (user
requirement): gratitude and respect for their hard work, respectful ways of
addressing people, not overly formal.

Implemented as `thanks.html`, deployed with `css/thanks.css` and
`css/thanks-images.css`:

- English and Japanese side by side, stacking on narrow windows. People are
  named in full; the Japanese prose uses さん and 皆さま, and the tables list
  names as credited.
- Sections: dedication with the Moon picture; how the game began (Isamu Izumi,
  Hiromasa Iwasaki's board-wargame advice, the "LONG REINS" planning document,
  Taiichi Matsuda's words from Konami's 2020 interview); the 1989 team with its
  sourcing note; one card per version from 1989 to 2020 with its key credited
  people and a link to the full roll; the fan community; references; an
  invitation to named people to add a memory or photo, correct details or ask
  to be removed, through GitHub issues; picture credits.
- Links: the menu (`index.html`) and `tournaments.html` carry a "Thanks to the
  creators" tab; the page's tabs and "Play the remake" link return to the game,
  and its footer gives the fuseki address and GitHub.
- Pictures: only freely licensed Wikimedia Commons files (public domain, CC0,
  CC BY, CC BY-SA); `tools/build-thanks-images.py` refuses anything else. The
  server accepts only css/html/js/json/md files and its Content-Security-Policy
  allows images only from the site or `data:` URLs, so the tool embeds each
  picture as WebP in `css/thanks-images.css` and regenerates the picture-credit
  list in `thanks.html`. Shown: NASA's near side of the Moon with Mare Nectaris
  outlined, the HUDSON sign on the Sapporo head office, the hardware of each
  version, and Chris Huelsbeck (2011).
- Team photographs: no freely licensed photograph of the Japanese team exists.
  The page links to Konami's 2020 interview, which shows Matsuda and Iwasaki,
  instead of copying photographs, and invites team members to send their own.
  No box art, screenshots or other original assets appear, per the IP posture
  in `agents.md`.
- Implementation choices, not user requirements: the dark site palette with
  pure white text, gold years, the card layout and which people each card
  names. The Japanese text still needs a native speaker's read.

## Rust simulator page (2026-09-28)

Requested by the user on 2026-09-28: "a docs page on the rust version
including rough speed profiles, like how much faster it is, etc and also an
english list of the tests we run to compare versions, linked to from the main
nectaris page."

Implemented as `simulator.html`, deployed with `css/simulator.css`:

- Sections:
  - what the simulator is for, and the lockstep rule;
  - how much faster: headline ratios, then a table covering the rules alone,
    random play, Classic against Tactical, search bots on one thread and on
    32 threads, and the tournament runners;
  - how it got faster: each step on a fixed 14-game sample, plus what was
    tried and removed;
  - where Rust spends its time, and one mid-game turn per bot;
  - how we check that both versions match: every check in plain English,
    when it runs, and what the fingerprint covers (including the dice
    generator);
  - how to use it.
- Links: a "Rust simulator" tab on the menu (`index.html`),
  `tournaments.html` and `thanks.html`; source links go to GitHub.
- The numbers are a snapshot measured on 2026-09-27 and 28 on the
  development machine (AMD Ryzen 9 5950X, Node 22, Rust 1.98), not updated
  automatically. `agents.md` asks for the page to be updated when the speed
  or the checks change.
- Implementation choices, not user requirements: the thanks page's dark
  palette, and one-line table rows with gold ratios.
