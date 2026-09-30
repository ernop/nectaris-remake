/* Balance-study campaigns: each mission in balance-campaign-specs.js draws
 * its terrain with shape primitives in board fractions, places camps,
 * factories and armies, and names the balance idea its bot measurements
 * test (ENVIRONMENT_CAMPAIGNS.md, MAP_BALANCE.md). The builder applies the
 * mission's symmetry and rejects any map where a unit cannot move to its
 * camp, a reserve cannot leave its factory, or a crossing the mission
 * relies on is missing. No imported maps, new unit types or hidden rules.
 * build-environment-campaigns.js appends these campaigns to its own. */
"use strict";
const HEX=require("../js/hex.js");
const {UNIT_TYPES}=require("../js/data-units.js"),{TERRAIN_BY_CHAR,terrainCost}=require("../js/data-terrain.js");
const COMBAT=require("../js/combat.js");
const catalog=require("./balance-campaign-specs.js");
const codes={C:"CHARLIE",K:"KILROY",P:"PANTHER",B:"BISON",L:"LENET",O:"POLAR",G:"GRIZZLY",S:"SLAGGER",T:"TITAN",J:"GIANT",
  H:"HADRIAN",U:"OCTOPUS",A:"ATLAS",R:"RABBIT",X:"LYNX",M:"MULE",Q:"PELICAN",E:"SEEKER",W:"HAWKEYE",Z:"TRIGGER",
  D:"EAGLE",F:"FALCON",N:"HUNTER"};
const key=p=>HEX.key(p.col,p.row),distance=(a,b)=>HEX.distance(a.col,a.row,b.col,b.row);
const typeOf=code=>{const t=UNIT_TYPES[codes[code]];if(!t)throw new Error("Bad roster code: "+code);return t;};

function build(campaign,spec,index){
  const fail=text=>{throw new Error(campaign.name+" "+(index+1)+" "+spec.name+": "+text);};
  const [width,height]=spec.size,sym=spec.sym;
  // Only these two reflections map this odd-q hex grid onto itself.
  if(sym==="half"&&width%2)fail("a half-turn needs an even width");
  if(sym==="mirror"&&width%2===0)fail("a left-right mirror needs an odd width");
  if(!["half","mirror","none"].includes(sym))fail("unknown symmetry "+sym);
  const grid=Array.from({length:height},()=>Array(width).fill("."));
  const cells=Array.from({length:width*height},(_,i)=>({col:i%width,row:Math.floor(i/width)}));
  const inside=p=>p.col>=0&&p.row>=0&&p.col<width&&p.row<height;
  const ns=p=>HEX.neighbors(p.col,p.row).filter(inside),at=p=>grid[p.row][p.col];
  const mate=p=>sym==="half"?{col:width-1-p.col,row:height-1-p.row}:sym==="mirror"?{col:width-1-p.col,row:p.row}:p;
  const point=([x,y])=>({col:Math.round(x*(width-1)),row:Math.round(y*(height-1))});
  const frac=p=>[p.col/(width-1),p.row/(height-1)];
  function paint(p,ch){if(!inside(p))return;grid[p.row][p.col]=ch;const q=mate(p);grid[q.row][q.col]=ch;}
  function line(a,b){
    const result=[a],ap=HEX.toPixel(a.col,a.row,1),bp=HEX.toPixel(b.col,b.row,1);
    while(distance(result[result.length-1],b)){
      const here=result[result.length-1],choices=ns(here).filter(n=>distance(n,b)<distance(here,b));
      const error=n=>{const p=HEX.toPixel(n.col,n.row,1);return Math.abs((bp.x-ap.x)*(ap.y-p.y)-(ap.x-p.x)*(bp.y-ap.y));};
      choices.sort((a,b)=>error(a)-error(b));result.push(choices[0]);
    }
    return result;
  }
  const path=points=>points.map(point).flatMap((p,i,ps)=>i?line(ps[i-1],p).slice(1):[p]);
  const around=(p,r)=>cells.filter(n=>distance(n,p)<=r);
  // Every shape takes board fractions: [0,0] is the top-left hex and [1,1]
  // the bottom-right one. Symmetric missions paint each hex with its mate.
  const draw={
    cell:(c,ch)=>paint(point(c),ch),
    disk:(c,r,ch)=>around(point(c),r).forEach(p=>paint(p,ch)),
    ellipse:([x,y],rx,ry,ch)=>cells.filter(p=>{const [px,py]=frac(p);return Math.pow((px-x)/rx,2)+Math.pow((py-y)/ry,2)<=1;}).forEach(p=>paint(p,ch)),
    rect:([x0,y0],[x1,y1],ch)=>cells.filter(p=>{const [px,py]=frac(p);return px>=x0-1e-9&&px<=x1+1e-9&&py>=y0-1e-9&&py<=y1+1e-9;}).forEach(p=>paint(p,ch)),
    fill:(test,ch)=>cells.filter(p=>test(...frac(p))).forEach(p=>paint(p,ch)),
    stroke:(points,ch,r=0)=>path(points).forEach(p=>around(p,r).forEach(n=>paint(n,ch))),
    // A valley of radius r is 2r+1 hexes across.
    valley:(points,r=0)=>path(points).forEach(p=>around(p,r).forEach(n=>paint(n,"v"))),
    // Bridges replace the valley hexes on the line between two banks.
    bridge:(a,b)=>{const hexes=line(point(a),point(b));if(!hexes.some(p=>at(p)==="v"))fail("bridge "+JSON.stringify([a,b])+" crosses no valley");hexes.forEach(p=>{if(at(p)==="v")paint(p,"=");});},
    // Roads bridge the valleys they cross; they never tunnel through mountains.
    road:points=>path(points).forEach(p=>{
      const ch=at(p);if(ch==="M")fail("road "+JSON.stringify(points)+" runs into mountains at "+key(p));
      if(ch!=="B"&&ch!=="F")paint(p,ch==="v"||ch==="="?"=":"-");
    }),
    // A wall `thick` hexes deep at hex distance R from a centre, open at the
    // gate bearings (degrees: 0 east, 90 south, 180 west, 270 north), each
    // gate spanning `half` degrees either side. Returns each gate's hexes.
    ring:(c,R,thick,ch,gates=[],half=20)=>{
      const o=point(c),op=HEX.toPixel(o.col,o.row,1);
      const bearing=p=>{const q=HEX.toPixel(p.col,p.row,1);return (Math.atan2(q.y-op.y,q.x-op.x)*180/Math.PI+360)%360;};
      const off=(a,g)=>Math.abs(((a-g+540)%360)-180);
      const band=cells.filter(p=>distance(p,o)<=R&&distance(p,o)>R-thick);
      band.filter(p=>!gates.some(g=>off(bearing(p),g)<half)).forEach(p=>paint(p,ch));
      return gates.map(g=>band.filter(p=>off(bearing(p),g)<half));
    },
    // A fixed unit on an exact hex (a cell, or board fractions), placed
    // before the armies: mines in gates need no carrier.
    unit:(code,owner,at)=>fixed.push({code,owner,at:Array.isArray(at)?point(at):at})
  };
  const fixed=[];
  spec.draw(draw);
  const buildings=[],units=[];
  const camp=c=>{const p=point(c);if(["M","v"].includes(at(p)))fail("camp on impassable ground");return p;};
  // `unionCamp` or `xenonCamp` moves one camp off a symmetric board's mirror
  // image to offset the first move; otherwise Xenon's is the mate of `bases`.
  const bases=sym==="none"?spec.bases.map(camp):
    [camp(spec.unionCamp||spec.bases[0]),spec.xenonCamp?camp(spec.xenonCamp):mate(camp(spec.bases[0]))];
  if(bases.length!==2||distance(bases[0],bases[1])===0)fail("needs two separate camps");
  bases.forEach((p,owner)=>{grid[p.row][p.col]="B";buildings.push({col:p.col,row:p.row,owner});});
  (spec.factories||[]).forEach(f=>{
    const p=point(f.at),owner=f.owner===undefined?-1:f.owner;
    const stored=f.stock.split("").map(c=>{typeOf(c);return codes[c];});
    const add=(q,o)=>{
      if(["B","F"].includes(at(q)))fail("two buildings on "+key(q));
      if(["M","v"].includes(at(q)))fail("factory on impassable ground at "+key(q));
      grid[q.row][q.col]="F";buildings.push({col:q.col,row:q.row,owner:o,stored});
    };
    add(p,owner);
    // A mirror's axis hexes are their own mates: one shared neutral factory.
    if(sym!=="none"&&key(mate(p))===key(p)&&owner>=0)fail("an owned factory on the axis has no mate");
    if(sym!=="none"&&key(mate(p))!==key(p))add(mate(p),owner<0?-1:1-owner);
  });
  // Movement checks use the engine's own terrain costs. Factories are not
  // transit hexes for anyone but their owner, so floods do not cross them.
  const enter=(type,p)=>terrainCost(TERRAIN_BY_CHAR[at(p)],type.moveType,type)!==null;
  function flood(start,passable){
    const q=[start],seen=new Set([key(start)]);
    for(let i=0;i<q.length;i++)ns(q[i]).forEach(p=>{if(!seen.has(key(p))&&passable(p)){seen.add(key(p));q.push(p);}});
    return seen;
  }
  const reach=new Map();
  function reachable(type,owner){
    const id=type.id+":"+owner;
    if(!reach.has(id))reach.set(id,flood(bases[owner],p=>at(p)!=="F"&&enter(type,p)));
    return reach.get(id);
  }
  const occupied=new Set();
  function place(code,owner,anchor,fixed,start){
    const type=typeOf(code),a=point(anchor);
    const carrier=type.placeByTransport&&!fixed?units.filter(u=>u.o===owner&&UNIT_TYPES[u.t].cargo).pop():null;
    if(type.placeByTransport&&!fixed&&!carrier)fail(type.id+" needs a carrier placed before it, or a fixed group");
    const legal=p=>!occupied.has(key(p))&&!["F","B"].includes(at(p))&&enter(type,p)&&
      (type.move===0||reachable(type,owner).has(key(p)))&&
      units.every(u=>u.o===owner||HEX.distance(p.col,p.row,u.x,u.y)>4)&&
      (!carrier||HEX.distance(p.col,p.row,carrier.x,carrier.y)===1);
    const choices=cells.filter(legal).sort((p,q)=>distance(p,a)-distance(q,a)||p.row-q.row||p.col-q.col);
    if(!choices.length)fail("no legal start for "+type.id+" near "+JSON.stringify(anchor));
    const p=choices[0],u=Object.assign({t:type.id,o:owner,x:p.col,y:p.row},start);
    units.push(u);occupied.add(key(p));return u;
  }
  // A group's third entry is `true` for fixed mines, or options: {fixed,
  // str, exp} for a starting strength (1-8) or experience (0-8).
  const army=(groups,owner)=>groups.forEach(([roster,anchor,opts])=>{
    const o=opts===true?{fixed:true}:opts||{},start={};
    if(o.str!==undefined&&!(Number.isInteger(o.str)&&o.str>=1&&o.str<=COMBAT.MAX_STRENGTH))fail(roster+" strength "+o.str+" is outside 1-"+COMBAT.MAX_STRENGTH);
    if(o.exp!==undefined&&!(Number.isInteger(o.exp)&&o.exp>=0&&o.exp<=COMBAT.MAX_EXP))fail(roster+" experience "+o.exp+" is outside 0-"+COMBAT.MAX_EXP);
    if(o.str!==undefined)start.str=o.str;
    if(o.exp!==undefined)start.exp=o.exp;
    roster.split("").forEach(code=>place(code,owner,anchor,o.fixed,start));
  });
  if(fixed.length&&sym!=="none")fail("exact units are for unequal maps");
  fixed.forEach(f=>{
    const type=typeOf(f.code),p=f.at;
    if(!inside(p)||occupied.has(key(p))||["F","B"].includes(at(p))||!enter(type,p))fail(type.id+" cannot stand on "+key(p));
    units.push({t:type.id,o:f.owner,x:p.col,y:p.row});occupied.add(key(p));
  });
  army(spec.union,0);
  if(spec.xenon)army(spec.xenon,1);
  else{
    if(sym==="none")fail("an unequal map names both armies");
    units.slice().forEach(u=>{
      const q=mate({col:u.x,row:u.y});
      if(occupied.has(key(q))||units.some(v=>v.o===0&&HEX.distance(q.col,q.row,v.x,v.y)<=4))fail(u.t+" has no free mirrored start");
      units.push(Object.assign({},u,{o:1,x:q.col,y:q.row}));occupied.add(key(q));
    });
  }
  units.forEach(u=>{const t=UNIT_TYPES[u.t];if(t.move>0&&!reachable(t,u.o).has(HEX.key(u.x,u.y)))fail(u.t+" cannot reach its camp");});
  [0,1].forEach(o=>{if(!units.some(u=>u.o===o&&UNIT_TYPES[u.t].capture))fail("side "+o+" has no capturer");});
  buildings.filter(b=>b.stored).forEach(b=>b.stored.forEach(id=>{
    const t=UNIT_TYPES[id];
    if(!t.placeByTransport&&!ns(b).some(p=>!["F","B"].includes(at(p))&&TERRAIN_BY_CHAR[at(p)].deployable&&enter(t,p)))fail(id+" has no exit from factory "+key(b));
  }));
  // Unless a mission is about a board vehicles cannot cross, both camps
  // share one vehicle network.
  const tread=p=>!["M","v","F"].includes(at(p));
  if(!spec.split&&!flood(bases[0],tread).has(key(bases[1])))fail("no vehicle route joins the camps");
  if(spec.split&&flood(bases[0],tread).has(key(bases[1])))fail("marked split, but vehicles can cross");
  const goal="Capture the enemy camp or eliminate its eligible forces within "+spec.limit+" rounds. At the turn limit, Xenon wins.";
  const slug=spec.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  return {name:spec.name,pack:campaign.name,campaignId:campaign.id,mission:index+1,author:"AI-made by Claude Opus 5.5",
    source:"levels/"+campaign.id+"/"+String(index+1).padStart(2,"0")+"-"+slug+".json",
    description:spec.idea,special:[goal,campaign.roster,"Each battle starts with its own authored forces; units do not carry between missions."].filter(Boolean).join(" "),
    tags:[campaign.tag,{half:"half-turn symmetry",mirror:"mirror symmetry",none:"unequal sides"}[sym]],
    design:{theme:campaign.theme,symmetry:sym},
    turnLimit:spec.limit,grid:grid.map(r=>r.join("")),buildings,units};
}
function generate(){return catalog.map(c=>({id:c.id,name:c.name,description:c.intro,
  notes:["Sixteen AI-made battles created by Claude Opus 5.5, each testing one idea about map balance, tuned until the strongest simulator bot playing both sides wins about as often as Union as Xenon.",
    "Normal capture/elimination rules apply.",c.roster,"Forces start fresh each mission."].filter(Boolean).join(" "),
  levels:c.levels.map((s,i)=>build(c,s,i))}));}
module.exports=generate;
module.exports.build=build;
