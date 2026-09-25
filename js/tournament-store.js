/* IndexedDB keeps replay payloads off the main thread's synchronous storage.
 * A finished game and the ordered Elo update commit in one transaction. */
"use strict";
var TOURNAMENT_STORE=(function(){
  function open(name){return new Promise(function(resolve,reject){
    var request=indexedDB.open(name||"nectaris-tournaments",2);
    request.onupgradeneeded=function(event){var db=request.result,tx=request.transaction;
      if(event.oldVersion<1){db.createObjectStore("runs",{keyPath:"id"});
        var games=db.createObjectStore("games",{keyPath:["runId","index"]});games.createIndex("runId","runId");}
      var summaries=db.createObjectStore("summaries",{keyPath:["runId","index"]});
      summaries.createIndex("map",["runId","mapIndex","index"]);
      summaries.createIndex("pair",["runId","pairKey","index"]);
      summaries.createIndex("mapPair",["runId","mapIndex","pairKey","index"]);
      var cursor=tx.objectStore("games").openCursor();
      cursor.onsuccess=function(){var c=cursor.result;if(!c)return;summaries.put(summary(c.value));c.continue();};
    };
    request.onblocked=function(){reject(new Error("Close other tournament tabs, then reload to upgrade saved game history. Existing results are safe."));};
    request.onsuccess=function(){var db=request.result;db.onversionchange=function(){db.close();};resolve(db);};request.onerror=function(){reject(request.error);};
  });}
  function request(tx,store,method,arg){return new Promise(function(resolve,reject){var r=tx.objectStore(store)[method](arg);
    r.onsuccess=function(){resolve(r.result);};r.onerror=function(){reject(r.error);};});}
  function done(tx){return new Promise(function(resolve,reject){tx.oncomplete=resolve;tx.onerror=function(){reject(tx.error);};tx.onabort=function(){reject(tx.error||new Error("Storage transaction aborted"));};});}
  function summary(game){
    var out={};["runId","index","mapIndex","map","players","seed","opening","requestedOpening","firstPlayer","skipped","reason","winner","rounds","ms","error"].forEach(function(k){out[k]=game[k];});
    out.pairKey=game.players.slice().sort().join("|");out.balance=game.balance?{label:game.balance.label}:null;
    return out;
  }
  function Store(db){this.db=db;}
  Store.prototype.list=function(){return request(this.db.transaction("runs"),"runs","getAll");};
  Store.prototype.get=function(id){return request(this.db.transaction("runs"),"runs","get",id);};
  Store.prototype.game=function(id,index){return request(this.db.transaction("games"),"games","get",[id,index]);};
  Store.prototype.save=function(run,result){
    run.savedAt=new Date().toISOString();
    var tx=this.db.transaction(result?["runs","games","summaries"]:["runs"],"readwrite");
    tx.objectStore("runs").put(run);
    if(result){var game=Object.assign({},result,{runId:run.id});tx.objectStore("games").put(game);tx.objectStore("summaries").put(summary(game));}return done(tx);
  };
  Store.prototype.stage=function(id,result){
    var tx=this.db.transaction(["games","summaries"],"readwrite"),game=Object.assign({},result,{runId:id});
    tx.objectStore("games").put(game);tx.objectStore("summaries").put(summary(game));return done(tx);
  };
  Store.prototype.games=function(id,offset,count){var db=this.db;return new Promise(function(resolve,reject){
    var tx=db.transaction("games"),out=[],r=tx.objectStore("games").openCursor(IDBKeyRange.bound([id,offset],[id,Number.MAX_SAFE_INTEGER]));
    r.onsuccess=function(){var c=r.result;if(!c||out.length>=count){resolve(out);return;}out.push(c.value);c.continue();};r.onerror=function(){reject(r.error);};
  });};
  Store.prototype.history=function(id,filter,offset,count){
    var tx=this.db.transaction("summaries"),source=tx.objectStore("summaries"),prefix=[id];
    var map=filter.map!=="",pair=filter.pair!=="";
    if(map&&pair){source=source.index("mapPair");prefix.push(Number(filter.map),filter.pair);}
    else if(map){source=source.index("map");prefix.push(Number(filter.map));}
    else if(pair){source=source.index("pair");prefix.push(filter.pair);}
    var range=IDBKeyRange.bound(prefix.concat(0),prefix.concat(Number.MAX_SAFE_INTEGER));
    var total=new Promise(function(resolve,reject){var r=source.count(range);r.onsuccess=function(){resolve(r.result);};r.onerror=function(){reject(r.error);};});
    var rows=new Promise(function(resolve,reject){var out=[],advanced=false,r=source.openCursor(range);
      r.onsuccess=function(){var c=r.result;if(!c||out.length>=count){resolve(out);return;}
        if(offset&&!advanced){advanced=true;c.advance(offset);return;}out.push(c.value);c.continue();};r.onerror=function(){reject(r.error);};});
    return Promise.all([total,rows]).then(function(v){return {total:v[0],rows:v[1]};});
  };
  Store.prototype.remove=function(id){var tx=this.db.transaction(["runs","games","summaries"],"readwrite");
    tx.objectStore("runs").delete(id);["games","summaries"].forEach(function(name){tx.objectStore(name).delete(IDBKeyRange.bound([id,0],[id,Number.MAX_SAFE_INTEGER]));});return done(tx);
  };
  return {open:async function(name){return new Store(await open(name));}};
})();
