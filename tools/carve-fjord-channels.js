/* Parts 9–10: thin the ridges, add back routes and rebuild a sparse road spine.
 * The input is an original symmetric fjord map; it is never mutated.
 */
"use strict";
const HEX = require("../js/hex.js");
module.exports = function(source,options) {
  const rotated=!!(options&&options.rotate);
  const map=JSON.parse(JSON.stringify(source)), width=map.grid[0].length, height=map.grid.length;
  const grid=map.grid.map(row=>row.split("")), key=p=>HEX.key(p.col,p.row);
  const ns=p=>HEX.neighbors(p.col,p.row).filter(inside);
  const mirror=p=>({col:width-1-p.col,row:rotated?height-1-p.row:p.row});
  const distance=(a,b)=>HEX.distance(a.col,a.row,b.col,b.row);
  const cells=[];
  for(let row=0;row<height;row++)for(let col=0;col<width;col++)cells.push({col,row});
  function inside(p){return p.col>=0&&p.row>=0&&p.col<width&&p.row<height;}
  const at=p=>grid[p.row][p.col];
  function paint(p,ch){grid[p.row][p.col]=ch;const m=mirror(p);grid[m.row][m.col]=ch;}
  const factories=map.buildings.filter(b=>b.owner===-1), walls=new Set(), mouths=new Set();
  factories.forEach(b=>ns(b).forEach(p=>(at(p)==="M"?walls:mouths).add(key(p))));
  const pockets=[];
  // Deliberately isolated plain clearings, five hexes each in Part 10.
  // Their surrounding walls stay intact while the connected channels grow.
  for(let i=0;i<(rotated?2:4);i++){
    const choices=[];
    cells.filter(p=>p.col>=2&&p.col<width/2-(rotated?2:1)&&p.row>=2&&p.row<height-2&&at(p)==="M").forEach(p=>{
      for(let direction=0;direction<(rotated?6:1);direction++){
        const around=HEX.neighbors(p.col,p.row);
        const patch=rotated?[p,...[0,1,2,3].map(d=>around[(d+direction)%6])]:[p];
        if(patch.every(n=>inside(n)&&at(n)==="M"&&!walls.has(key(n))&&ns(n).length===6&&
          ns(n).every(q=>at(q)==="M"&&!walls.has(key(q)))&&pockets.every(q=>distance(n,q)>=(rotated?3:5)))&&
          (rotated||map.buildings.every(b=>distance(p,b)>=4)))choices.push({p,patch});
      }
    });
    choices.sort((a,b)=>{
      const score=p=>Math.min(...cells.filter(n=>at(n)!=="M").map(n=>distance(p,n)))*10+
        Math.min(p.col,p.row,height-1-p.row);
      return score(b.p)-score(a.p)||a.p.row-b.p.row||a.p.col-b.p.col;
    });
    if(!choices.length)break;
    choices[0].patch.forEach(p=>{paint(p,".");[p,mirror(p)].forEach(n=>{pockets.push(n);ns(n).forEach(q=>walls.add(key(q)));});});
  }
  if(pockets.length<(rotated?10:6))return null;
  const pocketKeys=new Set(pockets.map(key)), carved=new Set();
  function dig(p){if(at(p)==="M"){carved.add(key(p));carved.add(key(mirror(p)));}paint(p,".");}
  if(rotated){
    // At most three mountain hexes before each edge reaches playable land.
    const rays=[];
    for(let c=0;c<width;c++)rays.push([0,1,2,3].map(r=>({col:c,row:r})),[0,1,2,3].map(r=>({col:c,row:height-1-r})));
    for(let r=0;r<height;r++)rays.push([0,1,2,3].map(c=>({col:c,row:r})),[0,1,2,3].map(c=>({col:width-1-c,row:r})));
    for(const ray of rays)if(ray.every(p=>at(p)==="M")){
      const p=ray.slice().reverse().find(n=>!walls.has(key(n)));
      if(!p)return null;dig(p);
    }
    const center={col:width/2-1,row:height/2};
    if(walls.has(key(center))||at(center)==="F")return null;
    dig(center);
  }else cells.filter(p=>p.col===0||p.col===width-1||p.row===0||p.row===height-1).forEach(dig);
  function flood(start,passable){
    const queue=[start],seen=new Set([key(start)]);
    for(let i=0;i<queue.length;i++)ns(queue[i]).forEach(p=>{
      if(!seen.has(key(p))&&passable(p)){seen.add(key(p));queue.push(p);}
    });
    return seen;
  }
  const camp=map.buildings.find(b=>b.owner===0);
  // Connect the perimeter to the main fjords without changing factory caps.
  let main=flood(camp,p=>at(p)!=="M"&&!pocketKeys.has(key(p)));
  while(cells.some(p=>at(p)!=="M"&&!pocketKeys.has(key(p))&&!main.has(key(p)))){
    const start=cells.find(p=>at(p)!=="M"&&!pocketKeys.has(key(p))&&!main.has(key(p)));
    const queue=[start],prev=new Map([[key(start),null]]);let end;
    for(let i=0;i<queue.length;i++){
      const p=queue[i];if(main.has(key(p))){end=p;break;}
      ns(p).forEach(n=>{if(!walls.has(key(n))&&!pocketKeys.has(key(n))&&!prev.has(key(n))){prev.set(key(n),p);queue.push(n);}});
    }
    if(!end)return null;
    while(end){if(at(end)==="M")dig(end);end=prev.get(key(end));}
    main=flood(camp,p=>at(p)!=="M"&&!pocketKeys.has(key(p)));
  }
  const passes=[];
  function broadensRoom(path){
    const added=new Set(path.flatMap(p=>[key(p),key(mirror(p))]));
    return cells.some(center=>path.some(p=>distance(p,center)<=2)&&
      cells.filter(p=>distance(p,center)<=2).length===19&&
      cells.filter(p=>distance(p,center)<=2).every(p=>at(p)!=="M"||added.has(key(p))));
  }
  function depths(){
    const result=new Map(),queue=cells.filter(p=>at(p)!=="M");queue.forEach(p=>result.set(key(p),0));
    for(let i=0;i<queue.length;i++)ns(queue[i]).forEach(p=>{
      if(!result.has(key(p))){result.set(key(p),result.get(key(queue[i]))+1);queue.push(p);}
    });
    return result;
  }
  // Straight, narrow cuts link existing channels on opposite sides of a
  // ridge. Prioritize its deepest points and spread the cuts across the map.
  for(let i=0;i<14;i++){
    const depth=depths(),choices=[];
    cells.filter(p=>p.col<=Math.floor(width/2)&&at(p)==="M"&&!walls.has(key(p))).forEach(p=>{
      for(let direction=0;direction<3;direction++){
        const path=[p];let valid=true;
        for(const d of [direction,direction+3]){
          let n=p,reached=false;
          for(let step=0;step<6;step++){
            n=HEX.neighbors(n.col,n.row)[d];
            if(!inside(n)||walls.has(key(n))||pocketKeys.has(key(n))||at(n)==="F")break;
            if(at(n)!=="M"){reached=true;break;}path.push(n);
          }
          if(!reached)valid=false;
        }
        if(!valid||passes.some(q=>distance(p,q)<3))continue;
        choices.push({p,path,score:depth.get(key(p))*10-path.length});
      }
    });
    choices.sort((a,b)=>b.score-a.score||a.p.row-b.p.row||a.p.col-b.p.col);
    const chosen=choices.find(c=>!broadensRoom(c.path));
    if(!chosen)break;
    chosen.path.forEach(dig);passes.push(chosen.p,mirror(chosen.p));
  }
  // If a deep remnant has no straight cut, give it a short angled branch.
  for(let i=0;i<40;i++){
    const depth=depths(),p=cells.find(n=>depth.get(key(n))>2&&!walls.has(key(n)));
    if(!p)break;
    const queue=[p],prev=new Map([[key(p),null]]);let end;
    for(let j=0;j<queue.length;j++){
      const n=queue[j];if(at(n)!=="M"&&!pocketKeys.has(key(n))){end=n;break;}
      ns(n).forEach(q=>{if(!walls.has(key(q))&&!pocketKeys.has(key(q))&&!prev.has(key(q))){prev.set(key(q),n);queue.push(q);}});
    }
    if(!end)return null;
    const path=[];
    while(end){if(at(end)==="M")path.push(end);end=prev.get(key(end));}
    if(broadensRoom(path))return null;
    path.forEach(dig);
  }
  if(rotated){
    // Keep interior mountain islands substantial (at least five hexes),
    // while preserving all connecting passages and the isolated clearings.
    const protectedLand=new Set([...mouths,...pocketKeys,...map.units.map(u=>HEX.key(u.x,u.y))]);
    map.buildings.forEach(b=>protectedLand.add(key(b)));
    const edge=p=>p.col===0||p.col===width-1||p.row===0||p.row===height-1;
    function islands(){
      const seen=new Set(),groups=[];
      for(const p of cells.filter(p=>at(p)==="M")){
        if(seen.has(key(p)))continue;
        const group=flood(p,n=>at(n)==="M");group.forEach(k=>seen.add(k));
        const members=cells.filter(n=>group.has(key(n)));
        if(!members.some(edge))groups.push(members);
      }
      return groups.sort((a,b)=>a.length-b.length);
    }
    function thinEdges(){
      for(let c=0;c<width;c++)for(const start of [0,height-4])
        if([0,1,2,3].every(d=>grid[start+d][c]==="M"))return false;
      for(let r=0;r<height;r++)for(const start of [0,width-4])
        if([0,1,2,3].every(d=>grid[r][start+d]==="M"))return false;
      return true;
    }
    for(let i=0;i<100;i++){
      const small=islands().find(g=>g.length<5);if(!small)break;
      const candidates=cells.filter(p=>at(p)!=="M"&&!protectedLand.has(key(p))&&
        ns(p).some(n=>small.some(q=>key(q)===key(n))));
      candidates.sort((a,b)=>ns(b).filter(n=>at(n)==="M").length-ns(a).filter(n=>at(n)==="M").length);
      let grown=false;
      for(const p of candidates){
        const before=at(p);paint(p,"M");
        const floor=cells.filter(n=>!["M","F"].includes(at(n))&&!pocketKeys.has(key(n)));
        if(thinEdges()&&Math.max(...depths().values())<=3&&
          flood(camp,n=>!["M","F"].includes(at(n))&&!pocketKeys.has(key(n))).size===floor.length){grown=true;break;}
        paint(p,before);
      }
      if(!grown)return null;
    }
    if(islands().some(g=>g.length<5))return null;
  }
  // Erase the broad road patches, then join required exits and camps using
  // the fewest additional road hexes. Each added route is mirrored at once.
  cells.filter(p=>at(p)==="-").forEach(p=>paint(p,"."));
  const road=new Set(),required=new Set(mouths);
  map.buildings.filter(b=>b.owner>=0).forEach(b=>required.add(key(b)));
  const axis=rotated?{col:width/2-1,row:height/2}:cells.find(p=>p.col===Math.floor(width/2)&&at(p)!=="M"&&at(p)!=="F"&&!pocketKeys.has(key(p)));
  road.add(key(axis));road.add(key(mirror(axis)));
  for(const targetKey of required){
    if(road.has(targetKey))continue;
    const [col,row]=targetKey.split(",").map(Number),start={col,row};
    const queue=[{p:start,cost:0}],best=new Map([[key(start),0]]),prev=new Map([[key(start),null]]);let end;
    while(queue.length){
      queue.sort((a,b)=>a.cost-b.cost);const {p,cost}=queue.shift();
      if(cost!==best.get(key(p)))continue;
      if(road.has(key(p))){end=p;break;}
      ns(p).forEach(n=>{
        if(at(n)==="M"||at(n)==="F"||pocketKeys.has(key(n)))return;
        const next=cost+(road.has(key(n))?0:1),k=key(n);
        if(best.has(k)&&best.get(k)<=next)return;
        best.set(k,next);prev.set(k,p);queue.push({p:n,cost:next});
      });
    }
    if(!end)return null;
    while(end){road.add(key(end));road.add(key(mirror(end)));end=prev.get(key(end));}
  }
  // Prune redundant paired road cells only when the entire road spine stays
  // connected. This removes triangular webs that look like paved rooms.
  for(const p of cells.filter(p=>p.col<width/2&&road.has(key(p))&&!required.has(key(p)))){
    const mate=mirror(p),a=key(p),b=key(mate);
    if(required.has(b)||ns(p).filter(n=>road.has(key(n))).length<3)continue;
    road.delete(a);road.delete(b);
    const rootKey=road.values().next().value,[col,row]=rootKey.split(",").map(Number);
    if(flood({col,row},n=>road.has(key(n))).size!==road.size){road.add(a);road.add(b);}
  }
  let rng=90421;
  cells.filter(p=>p.col<width/2).forEach(p=>{
    if(["M","F","B"].includes(at(p)))return;
    if(road.has(key(p))){paint(p,"-");return;}
    if(pocketKeys.has(key(p))||p.col===0||p.row===0||p.row===height-1){paint(p,".");return;}
    rng=(Math.imul(rng,1664525)+1013904223)>>>0;const roll=rng/4294967296;
    paint(p,roll<.3?"h":roll<.4&&!carved.has(key(p))?"w":".");
  });
  // Terrain variation must not strand a starting Panther on wasteland.
  // Keep existing roads and provide firm ground beneath every other starter.
  map.units.forEach(u=>{const p={col:u.x,row:u.y};if(at(p)!=="-")paint(p,".");});
  factories.forEach(b=>{
    const side=factories.filter(n=>n.col<Math.floor(width/2));
    const counterpart=b.col<width/2?b:mirror(b);
    const index=side.findIndex(n=>n.col===counterpart.col&&n.row===counterpart.row);
    if((index>=0&&index%2===0)||(b.col===Math.floor(width/2)&&b===factories.filter(n=>n.col===Math.floor(width/2))[1])){
      if(b.stored.length===8)b.stored.splice(b.stored.indexOf("LYNX"),1);
      b.stored.unshift(index===4||(rotated&&index===10)?"KILROY":"CHARLIE");
    }
  });
  map.name="LACED FJORDS";map.source="levels/laced-fjords.json";
  map.description="Part 9 keeps a mirrored 31×30 battlefield and 21 neutral factories, but cuts many more narrow connections through thinner mountain walls. A perimeter passage replaces the thick mountain border. Small isolated plain clearings sit among the ridges, while a connected road spine leaves most valley floors unpaved.";
  map.special="Eleven factories include one infantry reserve: usually Charlie, occasionally Kilroy. All inventories remain 4–8 units, with seven factories each offering one, two or three exits. Each side starts with Charlie, Panther, Rabbit, Bison, Polar and Hadrian in mirrored positions. Every Atlas or mine follows its own Mule or Pelican; Pelicans are the only aircraft.";
  map.tags=["part 9","thin mountain walls","infantry reserves","sparse roads"];
  if(rotated){
    map.name="TURNING FJORDS";map.source="levels/turning-fjords.json";
    map.description="Part 10 is a 42×20 battlefield with 180-degree rotational symmetry and opposite-corner armies. Narrow connecting passages weave around interior mountain islands of at least five hexes; edge mountains are at most three hexes thick. Four isolated five-hex plain clearings lie inside the ridges. Connected roads form a sparse backbone across the varied valley floor.";
    map.special="Twelve of 24 neutral factories include one Charlie or Kilroy. All inventories hold 4–8 units; eight factories each have one, two or three exits. Focused teams cover every tank and artillery type, both anti-air vehicles and missile buggies. Each side starts with Charlie, Panther, Rabbit, Slagger, Titan and Octopus in rotated positions. Atlas guns and mines follow their Mule or Pelican; Pelicans are the only aircraft.";
    map.tags=["part 10","180° symmetry","24 factories","sparse roads"];
  }
  map.grid=grid.map(row=>row.join(""));
  return {map,clearings:pockets,passes:passes.length,depth:Math.max(...depths().values())};
};
