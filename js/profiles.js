/* Browser-local player profiles, their unfinished matches and play history.
 * Every write is atomic per storage key; failed/corrupt storage is reported to
 * the caller rather than silently replacing existing saves. */
"use strict";
var PROFILES = (function () {
  var KEY = "nectaris-profiles-v1";
  var VERSION = 2;
  // Each unfinished match has its own storage key, SESSION_PREFIX + profile id +
  // ":" + session key, so saving one match never rewrites the others.
  var SESSION_PREFIX = "nectaris-session-v1:";
  var DEFAULT_NAME = "Wilson";
  var FULL = "Progress could not be saved. Browser storage is full or unavailable. Keep this page open and free up storage.";
  function id() {
    return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() :
      Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
  }
  // Which side the person at the screen commands: 0 Union, 1 Xenon. Matches
  // saved before Xenon play existed carry no field; they were all Union.
  function humanSide(options) { return options.humanSide === 1 && !options.hotseat ? 1 : 0; }
  // The board itself, whichever side, opening or number of players.
  function boardKey(map, options) {
    options = options || {};
    if (options.campaignIndex !== undefined) return "campaign:" + options.campaignIndex;
    if (options.expansionIndex !== undefined) return "expansion:" + options.expansionIndex;
    if (options.baseNecIndex !== undefined) return "base:" + options.baseNecIndex;
    if (options.aiMadeIndex !== undefined) return "ai-made:" + options.aiMadeIndex;
    if (options.environmentCampaign && options.environmentIndex !== undefined)
      return "environment:" + options.environmentCampaign + ":" + options.environmentIndex;
    // Custom levels with the same title but different layouts are distinct.
    return "custom:" + JSON.stringify([map.name, map.grid]);
  }
  // A result record: Union keys keep their earlier form; a Xenon record is its own entry.
  function levelKey(map, options) {
    options = options || {};
    return boardKey(map, options) + (options.balance || options.opening==="offers" ? ":offers" : "") +
      (humanSide(options) === 1 ? ":xenon" : "");
  }
  // One unfinished match per board, side, opening and number of players.
  function sessionKey(map, options) { return levelKey(map, options) + (options && options.hotseat ? ":hotseat" : ""); }
  function boardOf(key) { return key.replace(/(:offers)?(:xenon)?(:hotseat)?$/, ""); }
  function outcomeLabel(result) {
    if (result.winner === null) return "Draw";
    if (result.hotseat) return result.winner === 0 ? "Union victory" : "Xenon victory";
    return result.outcome === "win" ? "Victory" : "Defeat";
  }
  // "turnlimit" results recorded before 2026-09-30 are Xenon wins at a map's own limit.
  function reasonLabel(reason) {
    return {base: "Base captured", elimination: "Army eliminated", "no-progress": "No damage or factory capture in 100 turns",
      turnlimit: "Turn limit reached"}[reason] || "Match completed";
  }
  function levelRecord(profile, map, options) {
    var key = levelKey(map, options);
    var results = (profile ? profile.results : []).filter(function (result) {
      return result.levelKey ? result.levelKey === key : result.name === map.name;
    });
    return {wins: results.filter(function (r) { return !r.hotseat && r.outcome === "win"; }).length,
      losses: results.filter(function (r) { return !r.hotseat && r.outcome === "loss"; }).length,
      draws: results.filter(function (r) { return !r.hotseat && r.outcome === "draw"; }).length,
      hotseat: results.filter(function (r) { return r.hotseat; }).length,
      latest: results.length ? results[results.length - 1] : null};
  }
  // Counts matches begun on each board on either side and in either opening:
  // finished, abandoned, left unfinished or still open. Opening a board without
  // making a move leaves no trace, so it is not an attempt. Returns
  // count(map, options) for one board.
  function attemptCounts(profile, sessions) {
    var byBoard = {}, byName = {};
    function add(table, key, id) { (table[key] = table[key] || new Set()).add(id); }
    // Results recorded before level keys existed are matched by level name.
    profile.results.forEach(function (r) {
      if (r.levelKey) add(byBoard, boardOf(r.levelKey), r.id); else add(byName, r.name, r.id);
    });
    profile.log.forEach(function (entry) { add(byBoard, boardOf(entry.key), entry.match); });
    sessions.forEach(function (session) { add(byBoard, boardOf(session.key), session.id); });
    return function (map, options) {
      var ids = new Set(byBoard[boardKey(map, options)]);
      if (byName[map.name]) byName[map.name].forEach(function (id) { ids.add(id); });
      return ids.size;
    };
  }
  // Every play event, newest first: the log's start, resume, leave and abandon
  // entries with each finished match's result ("win", "loss", "draw" or "hotseat").
  function history(profile) {
    var entries = profile.log.map(function (entry, order) { return Object.assign({order: order}, entry); });
    profile.results.forEach(function (r, order) {
      entries.push({order: profile.log.length + order, at: r.endedAt, match: r.id, key: r.levelKey, name: r.name,
        event: r.hotseat ? "hotseat" : r.outcome, side: humanSide(r), hotseat: !!r.hotseat, winner: r.winner,
        opponent: r.opponent, turn: r.turn, reason: r.reason});
    });
    // A result written in the same millisecond as the move that ended the match comes after it.
    return entries.sort(function (a, b) { return a.at < b.at ? 1 : a.at > b.at ? -1 : b.order - a.order; });
  }
  function summary(profile, sessions) {
    var ids = new Set(), count = {attempts: 0, wins: 0, losses: 0, draws: 0, hotseat: 0, abandoned: 0, open: sessions.length};
    profile.log.forEach(function (entry) { ids.add(entry.match); if (entry.event === "abandon") count.abandoned++; });
    profile.results.forEach(function (r) {
      ids.add(r.id);
      if (r.hotseat) count.hotseat++;
      else if (r.outcome === "win") count.wins++;
      else if (r.outcome === "draw") count.draws++;
      else count.losses++;
    });
    sessions.forEach(function (session) { ids.add(session.id); });
    count.attempts = ids.size;
    return count;
  }

  function Store(storage) { this.storage = storage; }
  function unsupported() { return new Error("Unsupported profile data. Your stored data has been left intact."); }
  function checked(data, version) {
    if (!data || data.version !== version || !Array.isArray(data.profiles) || data.profiles.some(function (p) {
      return !p || typeof p.id !== "string" || typeof p.name !== "string" ||
        !Array.isArray(p.results) || !Array.isArray(p.cleared) || (version === VERSION && !Array.isArray(p.log)) ||
        (p.openCollections !== undefined && !Array.isArray(p.openCollections));
    })) throw unsupported();
    return data;
  }
  Store.prototype.read = function () {
    var raw = this.storage.getItem(KEY);
    if (!raw) return {version: VERSION, activeId: null, profiles: []};
    var data;
    try { data = JSON.parse(raw); } catch (e) { throw new Error("Profile data could not be read. Your stored data has been left intact."); }
    if (data && data.version === 1) return this.upgrade(checked(data, 1));
    return checked(data, VERSION);
  };
  // Version 1 kept one unfinished match inside each profile. Version 2 moves it
  // to its own session key and begins each profile's play history.
  Store.prototype.upgrade = function (data) {
    data.profiles.forEach(function (p) {
      if (p.savedMatch) this.writeSession(p.id, Object.assign({key: sessionKey(p.savedMatch.state.map, p.savedMatch.options)}, p.savedMatch));
      delete p.savedMatch;
      p.log = [];
    }, this);
    data.version = VERSION;
    this.write(data);
    return data;
  };
  Store.prototype.write = function (data) {
    try { this.storage.setItem(KEY, JSON.stringify(data)); }
    catch (e) { throw new Error(FULL); }
  };
  Store.prototype.active = function () {
    var data = this.read();
    return data.profiles.find(function (p) { return p.id === data.activeId; }) || null;
  };
  function checkedName(data, name, ownId) {
    name = name.trim();
    if (!name || name.length > 24) throw new Error("Choose a username between 1 and 24 characters.");
    if (data.profiles.some(function (p) { return p.id !== ownId && p.name.toLowerCase() === name.toLowerCase(); })) {
      throw new Error("That username already exists. Choose another.");
    }
    return name;
  }
  Store.prototype.create = function (name) {
    var data = this.read();
    name = checkedName(data, name);
    var profile = {id: id(), name: name, results: [], cleared: [], log: []};
    data.profiles.push(profile); data.activeId = profile.id;
    this.write(data);
    return profile;
  };
  Store.prototype.ensureDefault = function () {
    if (!this.read().profiles.length) return this.create(DEFAULT_NAME);
    return this.active();
  };
  Store.prototype.rename = function (profileId, name) {
    var data = this.read();
    var profile = data.profiles.find(function (p) { return p.id === profileId; });
    if (!profile) throw new Error("Profile not found.");
    profile.name = checkedName(data, name, profileId);
    this.write(data);
    return profile;
  };
  // The menu collections a profile has open, by collection id. A profile that
  // has never opened or closed one has no field, and the menu opens its first.
  Store.prototype.setOpenCollections = function (profileId, ids) {
    var data = this.read();
    var profile = data.profiles.find(function (p) { return p.id === profileId; });
    if (!profile) throw new Error("Profile not found.");
    profile.openCollections = ids.slice();
    this.write(data);
    return profile;
  };
  Store.prototype.switchTo = function (profileId) {
    var data = this.read();
    if (!data.profiles.some(function (p) { return p.id === profileId; })) throw new Error("Profile not found.");
    data.activeId = profileId; this.write(data);
  };
  // The active profile's stored data, for a write on its behalf.
  function playing(data, profileId) {
    if (data.activeId !== profileId) throw new Error("The active profile changed in another tab. Return to the menu before playing.");
    var p = data.profiles.find(function (entry) { return entry.id === profileId; });
    if (!p) throw new Error("Profile not found.");
    return p;
  }
  // Finished and abandoned matches are closed for good. A delayed animation or
  // pagehide callback must neither reopen one nor replace a newer match.
  function closed(p, matchId) {
    return p.results.some(function (r) { return r.id === matchId; }) ||
      p.log.some(function (entry) { return entry.event === "abandon" && entry.match === matchId; });
  }
  function sessionName(profileId, key) { return SESSION_PREFIX + profileId + ":" + key; }
  Store.prototype.writeSession = function (profileId, match) {
    try { this.storage.setItem(sessionName(profileId, match.key), JSON.stringify(match)); }
    catch (e) { throw new Error(FULL); }
  };
  function parseSession(raw) {
    var match;
    try { match = JSON.parse(raw); } catch (e) { throw new Error("An unfinished match could not be read. Your stored data has been left intact."); }
    if (!match || typeof match.id !== "string" || typeof match.key !== "string" || !match.options ||
        !match.state || !match.state.map || typeof match.state.map.name !== "string") {
      throw new Error("Unsupported unfinished match data. Your stored data has been left intact.");
    }
    return match;
  }
  Store.prototype.removeSession = function (profileId, match) {
    var name = sessionName(profileId, match.key), raw = this.storage.getItem(name);
    if (raw && parseSession(raw).id === match.id) this.storage.removeItem(name);
  };
  // A profile's unfinished matches, most recently saved first. A match closed
  // before its session was removed (the page closed between the two writes)
  // is not listed.
  Store.prototype.sessions = function (profileId) {
    var p = this.read().profiles.find(function (entry) { return entry.id === profileId; });
    if (!p) throw new Error("Profile not found.");
    var prefix = SESSION_PREFIX + profileId + ":", list = [];
    for (var i = 0; i < this.storage.length; i++) {
      var name = this.storage.key(i);
      if (name.indexOf(prefix) !== 0) continue;
      var match = parseSession(this.storage.getItem(name));
      if (!closed(p, match.id)) list.push(match);
    }
    return list.sort(function (a, b) { return a.savedAt < b.savedAt ? 1 : a.savedAt > b.savedAt ? -1 : 0; });
  };
  Store.prototype.session = function (profileId, key) {
    var raw = this.storage.getItem(sessionName(profileId, key));
    if (!raw) return null;
    var match = parseSession(raw);
    var p = this.read().profiles.find(function (entry) { return entry.id === profileId; });
    if (!p) throw new Error("Profile not found.");
    return closed(p, match.id) ? null : match;
  };
  // Save a match: {id, key, options, savedAt, state}. An unfinished match
  // updates its session; a finished one becomes a result and its session goes.
  Store.prototype.checkpoint = function (profileId, match) {
    var data = this.read(), p = playing(data, profileId), state = match.state;
    if (state.winner !== null && state.winner !== 0 && state.winner !== 1) {
      throw new Error("Cannot record a match with an invalid winner.");
    }
    if (state.winner !== null && state.winReason === null) throw new Error("Cannot record a match won for no reason.");
    if (typeof match.key !== "string") throw new Error("Cannot save a match without the key of its board.");
    if (closed(p, match.id)) return;
    // winReason is null only while the match is being played; a draw has a reason and no winner.
    if (state.winReason === null) { this.writeSession(profileId, match); return; }
    p.results.push({id: match.id, name: state.map.name, endedAt: new Date().toISOString(),
      winner: state.winner, humanSide: humanSide(match.options),
      outcome: state.winner === null ? "draw" : state.winner === humanSide(match.options) ? "win" : "loss",
      hotseat: !!match.options.hotseat, turn: state.turn,
      levelKey: levelKey(state.map, match.options), reason: state.winReason,
      balance:state.balance || null,firstPlayer:state.firstPlayer || 0,
      opponent: match.options.opponent || "classic", opponentChanges: match.options.opponentChanges || []});
    var ci = match.options.campaignIndex;
    if (state.winner === 0 && humanSide(match.options) === 0 && !state.balance && match.options.opening!=="offers" && ci !== undefined && p.cleared.indexOf(ci) < 0) p.cleared.push(ci);
    this.write(data);
    this.removeSession(profileId, match);
  };
  // Append a play event: {at, event, match, key, name, side, hotseat, opponent, turn}.
  Store.prototype.record = function (profileId, entry) {
    var data = this.read(), p = playing(data, profileId);
    if (closed(p, entry.match)) return;
    p.log.push(entry);
    this.write(data);
  };
  // Give up an unfinished match: the history keeps it, its session goes.
  Store.prototype.abandon = function (profileId, match, entry) {
    this.record(profileId, entry);
    this.removeSession(profileId, match);
  };
  return {Store: Store, KEY: KEY, SESSION_PREFIX: SESSION_PREFIX, DEFAULT_NAME: DEFAULT_NAME, newId: id,
    boardKey: boardKey, levelKey: levelKey, sessionKey: sessionKey, sessionName: sessionName, boardOf: boardOf,
    outcomeLabel: outcomeLabel, reasonLabel: reasonLabel, levelRecord: levelRecord, attemptCounts: attemptCounts,
    history: history, summary: summary, humanSide: humanSide};
})();
if (typeof module !== "undefined") module.exports = PROFILES;
