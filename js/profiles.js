/* Browser-local player profiles. All writes are atomic; failed/corrupt storage
 * is reported to the caller rather than silently replacing existing saves. */
"use strict";
var PROFILES = (function () {
  var KEY = "nectaris-profiles-v1";
  function id() {
    return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() :
      Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
  }
  function levelKey(map, options) {
    options = options || {};
    if (options.campaignIndex !== undefined) return "campaign:" + options.campaignIndex;
    if (options.expansionIndex !== undefined) return "expansion:" + options.expansionIndex;
    if (options.baseNecIndex !== undefined) return "base:" + options.baseNecIndex;
    if (options.aiMadeIndex !== undefined) return "ai-made:" + options.aiMadeIndex;
    // Custom levels with the same title but different layouts are distinct.
    return "custom:" + JSON.stringify([map.name, map.grid]);
  }
  function outcomeLabel(result) {
    if (result.hotseat) return result.winner === 0 ? "Union victory" : "Xenon victory";
    return result.outcome === "win" ? "Victory" : "Defeat";
  }
  function reasonLabel(reason) {
    return {base: "Base captured", elimination: "Army eliminated", turnlimit: "Turn limit reached"}[reason] || "Match completed";
  }
  function levelRecord(profile, map, options) {
    var key = levelKey(map, options);
    var results = (profile ? profile.results : []).filter(function (result) {
      return result.levelKey ? result.levelKey === key : result.name === map.name;
    });
    return {wins: results.filter(function (r) { return !r.hotseat && r.outcome === "win"; }).length,
      losses: results.filter(function (r) { return !r.hotseat && r.outcome === "loss"; }).length,
      hotseat: results.filter(function (r) { return r.hotseat; }).length,
      latest: results.length ? results[results.length - 1] : null};
  }
  function Store(storage) { this.storage = storage; }
  Store.prototype.read = function () {
    var raw = this.storage.getItem(KEY);
    if (!raw) return {version: 1, activeId: null, profiles: []};
    var data;
    try { data = JSON.parse(raw); } catch (e) { throw new Error("Profile data could not be read. Your stored data has been left intact."); }
    if (!data || data.version !== 1 || !Array.isArray(data.profiles) || data.profiles.some(function (p) {
      return !p || typeof p.id !== "string" || typeof p.name !== "string" ||
        !Array.isArray(p.results) || !Array.isArray(p.cleared);
    })) throw new Error("Unsupported profile data. Your stored data has been left intact.");
    return data;
  };
  Store.prototype.write = function (data) {
    try { this.storage.setItem(KEY, JSON.stringify(data)); }
    catch (e) { throw new Error("Progress could not be saved. Browser storage is full or unavailable. Keep this page open and free up storage."); }
  };
  Store.prototype.active = function () {
    var data = this.read();
    return data.profiles.find(function (p) { return p.id === data.activeId; }) || null;
  };
  Store.prototype.create = function (name) {
    name = name.trim();
    if (!name || name.length > 24) throw new Error("Choose a username between 1 and 24 characters.");
    var data = this.read();
    if (data.profiles.some(function (p) { return p.name.toLowerCase() === name.toLowerCase(); })) {
      throw new Error("That username already exists. Choose it from Switch profile.");
    }
    var profile = {id: id(), name: name, results: [], cleared: [], savedMatch: null};
    if (!data.profiles.length) {
      // Preserve old campaign stars once, without inventing match history.
      try {
        var legacy = JSON.parse(this.storage.getItem("nectaris-progress"));
        var count = legacy && Number.isInteger(legacy.cleared) ? Math.min(16, legacy.cleared) : 0;
        for (var i = 0; i < count; i++) profile.cleared.push(i);
      } catch (e) { /* Older progress was optional. */ }
    }
    data.profiles.push(profile); data.activeId = profile.id;
    this.write(data);
    return profile;
  };
  Store.prototype.switchTo = function (profileId) {
    var data = this.read();
    if (!data.profiles.some(function (p) { return p.id === profileId; })) throw new Error("Profile not found.");
    data.activeId = profileId; this.write(data);
  };
  Store.prototype.checkpoint = function (profileId, match) {
    var data = this.read();
    if (data.activeId !== profileId) throw new Error("The active profile changed in another tab. Return to the menu before playing.");
    var p = data.profiles.find(function (entry) { return entry.id === profileId; });
    if (!p) throw new Error("Profile not found.");
    var state = match.state;
    if (state.winner !== null && state.winner !== 0 && state.winner !== 1) {
      throw new Error("Cannot record a match with an invalid winner.");
    }
    // A completed match is immutable. A delayed animation/pagehide callback
    // must neither resurrect it nor clear a newer match's continuation.
    if (p.results.some(function (r) { return r.id === match.id; })) return;
    if (state.winner !== null) {
      p.results.push({id: match.id, name: state.map.name, endedAt: new Date().toISOString(),
        winner: state.winner, outcome: state.winner === 0 ? "win" : "loss",
        hotseat: !!match.options.hotseat, turn: Math.min(state.turn, state.turnLimit || state.turn),
        levelKey: levelKey(state.map, match.options), reason: state.winReason});
      var ci = match.options.campaignIndex;
      if (state.winner === 0 && ci !== undefined && p.cleared.indexOf(ci) < 0) p.cleared.push(ci);
      if (!p.savedMatch || p.savedMatch.id === match.id) p.savedMatch = null;
    } else {
      p.savedMatch = match;
    }
    this.write(data);
  };
  return {Store: Store, KEY: KEY, newId: id, levelKey: levelKey,
    outcomeLabel: outcomeLabel, reasonLabel: reasonLabel, levelRecord: levelRecord};
})();
if (typeof module !== "undefined") module.exports = PROFILES;
