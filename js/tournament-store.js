/* IndexedDB keeps replay payloads off the main thread's synchronous storage.
 * A finished game and the ordered Elo update commit in one transaction. */
"use strict";
var TOURNAMENT_STORE=(function(){
  function open(){return new Promise(function(resolve,reject){
    var request=indexedDB.open("nectaris-tournaments",1);
    request.onupgradeneeded=function(){var db=request.result;
      db.createObjectStore("runs",{keyPath:"id"});
      var games=db.createObjectStore("games",{keyPath:["runId","index"]});games.createIndex("runId","runId");
    };
    request.onsuccess=function(){resolve(request.result);};request.onerror=function(){reject(request.error);};
  });}
  function request(tx,store,method,arg){return new Promise(function(resolve,reject){var r=tx.objectStore(store)[method](arg);
    r.onsuccess=function(){resolve(r.result);};r.onerror=function(){reject(r.error);};});}
  function done(tx){return new Promise(function(resolve,reject){tx.oncomplete=resolve;tx.onerror=function(){reject(tx.error);};tx.onabort=function(){reject(tx.error||new Error("Storage transaction aborted"));};});}
  function Store(db){this.db=db;}
  Store.prototype.list=function(){return request(this.db.transaction("runs"),"runs","getAll");};
  Store.prototype.get=function(id){return request(this.db.transaction("runs"),"runs","get",id);};
  Store.prototype.game=function(id,index){return request(this.db.transaction("games"),"games","get",[id,index]);};
  Store.prototype.save=function(run,result){
    var tx=this.db.transaction(result?["runs","games"]:["runs"],"readwrite");
    tx.objectStore("runs").put(run);
    if(result)tx.objectStore("games").put(Object.assign({},result,{runId:run.id}));return done(tx);
  };
  Store.prototype.games=function(id,offset,count){var db=this.db;return new Promise(function(resolve,reject){
    var tx=db.transaction("games"),out=[],r=tx.objectStore("games").openCursor(IDBKeyRange.bound([id,offset],[id,Number.MAX_SAFE_INTEGER]));
    r.onsuccess=function(){var c=r.result;if(!c||out.length>=count){resolve(out);return;}out.push(c.value);c.continue();};r.onerror=function(){reject(r.error);};
  });};
  Store.prototype.remove=function(id){var tx=this.db.transaction(["runs","games"],"readwrite");
    tx.objectStore("runs").delete(id);tx.objectStore("games").delete(IDBKeyRange.bound([id,0],[id,Number.MAX_SAFE_INTEGER]));return done(tx);
  };
  return {open:async function(){return new Store(await open());}};
})();
