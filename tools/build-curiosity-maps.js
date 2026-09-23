/* Original Parts 11–15. Hand-authored route graphs share validation and
 * stocking rules, not a common random maze. Called by build-ai-fjords.js. */
"use strict";
const HEX=require("../js/hex.js");
const W=42,H=20,key=p=>HEX.key(p.col,p.row);
const point=xy=>({col:xy[0],row:xy[1]});
const rotate=p=>({col:W-1-p.col,row:H-1-p.row});
const inside=p=>p.col>=0&&p.col<W&&p.row>=0&&p.row<H;
const neighbors=p=>HEX.neighbors(p.col,p.row).filter(inside);
const distance=(a,b)=>HEX.distance(a.col,a.row,b.col,b.row);
const cells=Array.from({length:W*H},(_,i)=>({col:i%W,row:Math.floor(i/W)}));
const TEAMS=[
  {theme:"Fast armor",stored:["CHARLIE","BISON","LENET","SLAGGER","SLAGGER"]},
  {theme:"Heavy armor",stored:["POLAR","GRIZZLY","TITAN","GIANT"]},
  {theme:"Mixed battery",stored:["KILROY","HADRIAN","OCTOPUS","SEEKER","SEEKER"]},
  {theme:"Siege engineers",stored:["MULE","ATLAS","MULE","TRIGGER"]},
  {theme:"Missile screen",stored:["CHARLIE","RABBIT","LYNX","HAWKEYE","LENET","LENET"]},
  {theme:"Airlift reserve",stored:["PELICAN","ATLAS","TITAN","TITAN","RABBIT","RABBIT","TITAN","RABBIT"]}
];
const SPECS=[
  {part:11,name:"SWITCHBACK FJORDS",file:"switchback-fjords",factories:12,hills:.22,waste:.06,
    extras:["LENET","SLAGGER","HADRIAN"],tags:["hairpin routes","12 factories","fast armor"],
    description:"Long folded fjords run back and forth across the board. Two short diagonal passes let a quick force switch lanes while the main columns negotiate the hairpins. Twelve factories make each capture matter.",
    paths:[[[3,3],[10,2],[18,3],[26,2],[37,3],[38,7],[30,7],[23,6],[15,7],[6,7],[3,10],[12,10],[20,9]],
      [[18,3],[20,5],[23,6]]]},
  {part:12,name:"DELTA CROSSINGS",file:"delta-crossings",factories:24,hills:.16,waste:.08,
    extras:["POLAR","LYNX","PELICAN"],tags:["valley river","three crossings","24 factories"],
    description:"Braided fjords feed a two-hex valley river down the middle of the battlefield. Three bridge crossings carry the ground war; Pelicans can shift a force across the river away from those gates. Twenty-four factories crowd the banks and tributaries.",
    paths:[[[3,3],[8,5],[13,3],[20,5],[28,3],[38,3]],
      [[3,3],[5,10],[13,9],[20,10],[28,8],[38,9]],[[13,3],[13,9]],[[28,3],[28,8]]],river:true},
  {part:13,name:"CALDERA CIRCUIT",file:"caldera-circuit",factories:24,hills:.18,waste:.3,
    extras:["GRIZZLY","OCTOPUS","MULE"],tags:["concentric routes","wasteland","inner clearing"],
    description:"An outer circuit and an inner crater rim offer competing routes around a mountain caldera. Radial passes join the rings, wasteland makes cross-country armor slow, and an isolated ten-hex plain clearing rewards infantry or airlift. Twenty-four factories supply the siege.",
    paths:[[[3,9],[6,3],[16,2],[25,2],[35,3],[38,10]],
      [[10,10],[13,7],[19,6],[27,7],[31,10]],[[6,3],[13,7]],[[35,3],[27,7]],[[3,3],[6,3]]],core:true},
  {part:14,name:"FAULTLINE STEPS",file:"faultline-steps",factories:12,hills:.48,waste:.04,
    extras:["GIANT","TITAN","SEEKER"],tags:["diagonal ridges","hill cover","heavy armor"],
    description:"Diagonal mountain fingers divide a succession of stepped passes. Hill cover dominates the side routes, making the sparse roads especially valuable to slow heavy armor. Twelve factory alcoves are spread across the ridge fronts.",
    paths:[[[0,3],[6,6],[10,11],[15,14],[22,17],[30,18],[38,16]],
      [[3,3],[9,2],[16,4],[20,8],[27,10],[32,14],[38,16]],[[10,11],[13,8],[16,4]],[[20,8],[18,12]]]},
  {part:15,name:"POCKET SIEGE",file:"pocket-siege",factories:12,hills:.28,waste:.12,
    extras:["POLAR","HADRIAN","PELICAN"],tags:["four chambers","narrow throats","airlift"],
    description:"Four small battle chambers are linked by dogleg throats and a long route around the flanks. Each chamber gives artillery a staging area, but reinforcements must file through the narrow approaches. Twelve factories and two isolated five-hex clearings make transport timing matter.",
    paths:[[[3,3],[7,6],[4,12],[8,16],[15,13],[20,10]],[[3,3],[15,2],[25,3],[26,6]]],
    rooms:[[7,6],[15,13]],pockets:true}
];
function line(a,b){
  const out=[a],ap=HEX.toPixel(a.col,a.row,1),bp=HEX.toPixel(b.col,b.row,1);
  while(distance(out[out.length-1],b)){
    const p=out[out.length-1],next=neighbors(p).filter(n=>distance(n,b)<distance(p,b));
    const error=n=>{const np=HEX.toPixel(n.col,n.row,1);return Math.abs((bp.x-ap.x)*(ap.y-np.y)-(ap.x-np.x)*(bp.y-ap.y));};
    next.sort((x,y)=>error(x)-error(y));out.push(next[0]);
  }
  return out;
}
function build(spec,seed){
  const grid=Array.from({length:H},()=>Array(W).fill("M")),walls=new Set(),pockets=new Set(),mouths=new Set();
  const at=p=>grid[p.row][p.col];
  function paint(p,ch){if(inside(p)){grid[p.row][p.col]=ch;const q=rotate(p);grid[q.row][q.col]=ch;}}
  function disk(p,radius){cells.filter(n=>distance(n,p)<=radius).forEach(n=>paint(n,"."));}
  function channel(points,wide){
    points.map(point).forEach((p,i,pts)=>{if(!i)return;line(pts[i-1],p).forEach(n=>{
      if(wide)disk(n,1);else{paint(n,".");const side=HEX.neighbors(n.col,n.row)[2];if(inside(side))paint(side,".");}
    });});
  }
  spec.paths.forEach((path,i)=>channel(path,i===0&&spec.part===13));
  (spec.rooms||[]).forEach(xy=>disk(point(xy),2));
  const base={col:3,row:3},buildings=[{...base,owner:0},{...rotate(base),owner:1}],units=[];
  disk(base,1);
  const roster=["CHARLIE","PANTHER","RABBIT",...spec.extras];
  HEX.neighbors(base.col,base.row).forEach((p,i)=>[p,rotate(p)].forEach((n,o)=>units.push({t:roster[i],o,x:n.col,y:n.row})));
  const protectedLand=new Set(units.map(u=>HEX.key(u.x,u.y)));
  buildings.forEach(b=>protectedLand.add(key(b)));
  function flood(start,passable){
    const q=[start],seen=new Set([key(start)]);
    for(let i=0;i<q.length;i++)for(const n of neighbors(q[i]))if(!seen.has(key(n))&&passable(n)){seen.add(key(n));q.push(n);}
    return seen;
  }
  const ground=p=>!["M","v","F"].includes(at(p))&&!pockets.has(key(p));
  function joinFloor(){
    let main=flood(base,ground);
    for(let attempts=0;attempts<100;attempts++){
      const start=cells.find(p=>ground(p)&&!main.has(key(p)));if(!start)return true;
      const q=[start],prev=new Map([[key(start),null]]);let end;
      for(let i=0;i<q.length;i++){
        const p=q[i];if(main.has(key(p))){end=p;break;}
        for(const n of neighbors(p))if(!prev.has(key(n))&&!walls.has(key(n))&&!pockets.has(key(n))&&!["v","F"].includes(at(n))){prev.set(key(n),p);q.push(n);}
      }
      if(!end)return false;
      while(end){if(at(end)==="M")paint(end,".");end=prev.get(key(end));}
      main=flood(base,ground);
    }
    return false;
  }
  function pocket(patch){
    const all=[...patch,...patch.map(rotate)],keys=new Set(all.map(key));
    if(all.some(p=>!inside(p)||at(p)!=="M"||protectedLand.has(key(p))||
      neighbors(p).some(n=>at(n)!=="M"&&!keys.has(key(n)))))return false;
    all.forEach(p=>{paint(p,".");pockets.add(key(p));protectedLand.add(key(p));});
    all.forEach(p=>neighbors(p).filter(n=>!keys.has(key(n))).forEach(n=>walls.add(key(n))));return true;
  }
  if(spec.core&&!pocket(cells.filter(p=>distance(p,{col:20,row:10})<=1)))return null;
  if(spec.pockets){
    const choices=cells.filter(p=>p.col>2&&p.col<19&&p.row>2&&p.row<17);
    let done=false;
    for(const p of choices){const ns=HEX.neighbors(p.col,p.row);if(pocket([p,ns[0],ns[1],ns[2],ns[3]])){done=true;break;}}
    if(!done)return null;
  }
  const rays=[];
  for(let c=0;c<W;c++)for(const start of [0,H-4])rays.push([0,1,2,3].map(d=>({col:c,row:start+d})));
  for(let r=0;r<H;r++)for(const start of [0,W-4])rays.push([0,1,2,3].map(d=>({col:start+d,row:r})));
  const thinEdges=()=>rays.every(ray=>ray.some(p=>at(p)!=="M"));
  for(const ray of rays)if(ray.every(p=>at(p)==="M")){
    const p=ray.slice().sort((a,b)=>Math.min(b.col,W-1-b.col,b.row,H-1-b.row)-Math.min(a.col,W-1-a.col,a.row,H-1-a.row)).find(n=>!walls.has(key(n)));
    if(!p)return null;paint(p,".");
  }
  if(!joinFloor())return null;
  // Break deep mountain masses with short one-hex side channels. Existing
  // route shapes and the rings around isolated clearings remain intact.
  function depths(){
    const depth=new Map(),q=cells.filter(p=>at(p)!=="M");q.forEach(p=>depth.set(key(p),0));
    for(let i=0;i<q.length;i++)neighbors(q[i]).forEach(n=>{if(!depth.has(key(n))){depth.set(key(n),depth.get(key(q[i]))+1);q.push(n);}});
    return depth;
  }
  for(let i=0;i<100;i++){
    const depth=depths(),start=cells.find(p=>depth.get(key(p))>3&&!walls.has(key(p)));if(!start)break;
    const q=[start],prev=new Map([[key(start),null]]);let end;
    for(let j=0;j<q.length;j++){
      const p=q[j];if(ground(p)){end=p;break;}
      neighbors(p).forEach(n=>{if(!prev.has(key(n))&&!walls.has(key(n))&&!pockets.has(key(n))){prev.set(key(n),p);q.push(n);}});
    }
    if(!end)return null;while(end){paint(end,".");end=prev.get(key(end));}
  }
  if(spec.river){
    for(let r=0;r<H;r++)paint({col:20,row:r},"v");
    // The middle pair is one crossing; the outer two are rotated partners.
    for(const xy of [[20,5],[21,5],[20,9],[21,9]])paint(point(xy),"=");
    for(const xy of [[18,5],[19,5],[22,5],[23,5],[18,9],[19,9],[22,9],[23,9]])paint(point(xy),".");
    if(!joinFloor())return null;
  }
  buildings.forEach(b=>paint(b,"B"));
  let rng=seed;const random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};
  // Place paired terminal alcoves. We may shape a cap, but never sever an
  // existing corridor, change a prior mouth or wall, or shrink a landing zone.
  for(let i=0;i<spec.factories/2;i++){
    const exits=i%3+1,options=[];
    for(const p of cells.filter(p=>p.col>=2&&p.col<20&&p.row>=2&&p.row<H-2)){
      const mate=rotate(p),ns=HEX.neighbors(p.col,p.row);
      if(["F","B","v","="].includes(at(p))||protectedLand.has(key(p))||walls.has(key(p))||mouths.has(key(p))||
        buildings.some(b=>distance(p,b)<3)||distance(p,mate)<4)continue;
      for(let d=0;d<6;d++){
        const dirs=Array.from({length:exits},(_,j)=>(d+j)%6);
        const edits=[{p,ch:"F"},...ns.map((n,j)=>({p:n,ch:dirs.includes(j)?"-":"M"}))];
        if(edits.some(e=>protectedLand.has(key(e.p))||mouths.has(key(e.p))||
          walls.has(key(e.p))&&e.ch!=="M"||["B","F","v","="].includes(at(e.p))))continue;
        if(!dirs.some(j=>ground(ns[j])))continue;
        const changed=ns.filter((n,j)=>!dirs.includes(j)&&at(n)!=="M").length;
        options.push({p,edits,score:Math.min(...buildings.map(b=>distance(p,b)))*3-changed*8+random()});
      }
    }
    options.sort((a,b)=>b.score-a.score);let chosen;
    for(const option of options){
      const prior=option.edits.map(e=>({p:e.p,ch:at(e.p)}));option.edits.forEach(e=>paint(e.p,e.ch));
      if(thinEdges()&&flood(base,ground).size===cells.filter(ground).length){chosen=option;break;}
      prior.forEach(e=>paint(e.p,e.ch));
    }
    if(!chosen)return null;
    const team=TEAMS[(i+(spec.part-11)*2)%TEAMS.length];
    [chosen.p,rotate(chosen.p)].forEach(p=>{
      buildings.push({...p,owner:-1,inventoryTheme:team.theme,stored:team.stored.slice()});
      neighbors(p).forEach(n=>(at(n)==="M"?walls:mouths).add(key(n)));
    });
  }
  // Grow little detached mountain specks into readable ridge islands.
  function islands(){
    const seen=new Set(),groups=[];
    for(const p of cells.filter(p=>at(p)==="M")){
      if(seen.has(key(p)))continue;const group=flood(p,n=>at(n)==="M");group.forEach(k=>seen.add(k));
      const members=cells.filter(n=>group.has(key(n)));
      if(members.every(n=>n.col>0&&n.col<W-1&&n.row>0&&n.row<H-1))groups.push(members);
    }
    return groups.sort((a,b)=>a.length-b.length);
  }
  for(let i=0;i<100;i++){
    const small=islands().find(g=>g.length<5);if(!small)break;
    const choices=cells.filter(p=>ground(p)&&at(p)!=="B"&&at(p)!=="="&&!mouths.has(key(p))&&!protectedLand.has(key(p))&&neighbors(p).some(n=>small.some(q=>key(q)===key(n))));
    choices.sort((a,b)=>neighbors(b).filter(n=>at(n)==="M").length-neighbors(a).filter(n=>at(n)==="M").length);
    let changed=false;
    for(const p of choices){const before=at(p);paint(p,"M");
      if(thinEdges()&&Math.max(...depths().values())<=3&&flood(base,ground).size===cells.filter(ground).length){changed=true;break;}paint(p,before);
    }
    if(!changed)return null;
  }
  // Minimum additional paving connects every mouth, base and bridge. A
  // second pass removes redundant triangular paving while preserving access.
  const road=new Set([key(base),key(rotate(base))]),required=new Set([...mouths,...road]);
  cells.filter(p=>at(p)==="=").forEach(p=>required.add(key(p)));
  for(const target of required){
    const start=point(target.split(",").map(Number)),q=[{p:start,cost:0}],best=new Map([[target,0]]),prev=new Map([[target,null]]);let end;
    while(q.length){
      q.sort((a,b)=>a.cost-b.cost);const {p,cost}=q.shift();if(best.get(key(p))!==cost)continue;
      // Both camps are terminals, but initially only the first is connected.
      if(road.has(key(p))&&key(p)!==target){end=p;break;}
      for(const n of neighbors(p))if(ground(n)){
        const cost2=cost+(road.has(key(n))?0:1),k=key(n);
        if(best.has(k)&&best.get(k)<=cost2)continue;best.set(k,cost2);prev.set(k,p);q.push({p:n,cost:cost2});
      }
    }
    if(!end)return null;
    while(end){road.add(key(end));road.add(key(rotate(end)));end=prev.get(key(end));}
  }
  // Rotated routes can meet in more than one place; join any separate road
  // components before pruning. This also connects all three delta crossings.
  let connected=flood(base,p=>road.has(key(p)));
  while(connected.size<road.size){
    const start=cells.find(p=>road.has(key(p))&&!connected.has(key(p))),q=[start],prev=new Map([[key(start),null]]);let end;
    for(let i=0;i<q.length;i++){const p=q[i];if(connected.has(key(p))){end=p;break;}neighbors(p).forEach(n=>{if(ground(n)&&!prev.has(key(n))){prev.set(key(n),p);q.push(n);}});}
    if(!end)return null;while(end){road.add(key(end));road.add(key(rotate(end)));end=prev.get(key(end));}connected=flood(base,p=>road.has(key(p)));
  }
  for(const p of cells.filter(p=>p.col<21&&road.has(key(p))&&!required.has(key(p)))){
    const a=key(p),b=key(rotate(p));road.delete(a);road.delete(b);
    if(flood(base,n=>road.has(key(n))).size!==road.size){road.add(a);road.add(b);}
  }
  for(const p of cells.filter(p=>p.col<21)){
    if(["M","F","B","v","="].includes(at(p)))continue;
    if(road.has(key(p))){paint(p,"-");continue;}
    if(protectedLand.has(key(p))){paint(p,".");continue;}
    const roll=random();paint(p,roll<spec.hills?"h":roll<spec.hills+spec.waste?"w":".");
  }
  const map={name:spec.name,pack:"AI-made",author:"Codex · original level",source:"levels/"+spec.file+".json",
    description:"Part "+spec.part+" · 42×20 · 180-degree rotational symmetry. "+spec.description,
    special:spec.factories+" neutral factories hold 4–8 units each, with equal numbers of one-, two- and three-exit alcoves. Half include a Charlie or Kilroy. Focused teams collectively cover every tank, gun, missile vehicle and anti-air type. Each Atlas or mine follows its own carrier; Pelicans are the only aircraft. Both sides start with Charlie, Panther and Rabbit plus "+spec.extras.map(id=>id[0]+id.slice(1).toLowerCase()).join(", ")+" in identical rotated formations.",
    tags:["part "+spec.part,...spec.tags],turnLimit:180,grid:grid.map(r=>r.join("")),buildings,units};
  return {map,seed,clearings:cells.filter(p=>pockets.has(key(p)))};
}
module.exports=function(){
  return SPECS.map(spec=>{
    for(let seed=spec.part*1000;seed<spec.part*1000+100;seed++){
      const result=build(spec,seed);if(result)return result;
    }
    throw new Error("No valid authored layout found for "+spec.name);
  });
};
