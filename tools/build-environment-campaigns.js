#!/usr/bin/env node
/* Reproducible original campaigns. The catalog authors the tactical problem;
 * these geometry recipes create its terrain, roads, deployments and arsenals.
 * No imported maps, new unit types or hidden victory conditions are used. */
"use strict";
const fs=require("node:fs"),path=require("node:path"),HEX=require("../js/hex.js");
const {UNIT_TYPES}=require("../js/data-units.js"),{TERRAIN_BY_CHAR,terrainCost}=require("../js/data-terrain.js");
const catalog=require("./environment-campaign-specs.js");
const codes={C:"CHARLIE",K:"KILROY",P:"PANTHER",B:"BISON",L:"LENET",O:"POLAR",G:"GRIZZLY",S:"SLAGGER",T:"TITAN",J:"GIANT",H:"HADRIAN",U:"OCTOPUS",A:"ATLAS",R:"RABBIT",X:"LYNX",M:"MULE",Q:"PELICAN",E:"SEEKER",W:"HAWKEYE",Z:"TRIGGER"};
const key=p=>HEX.key(p.col,p.row),distance=(a,b)=>HEX.distance(a.col,a.row,b.col,b.row);
function build(campaign,spec,index){
  const [width,height]=spec.size,grid=Array.from({length:height},()=>Array(width).fill("."));
  const cells=Array.from({length:width*height},(_,i)=>({col:i%width,row:Math.floor(i/width)}));
  const inside=p=>p.col>=0&&p.row>=0&&p.col<width&&p.row<height;
  const ns=p=>HEX.neighbors(p.col,p.row).filter(inside),at=p=>grid[p.row][p.col];
  const rotate=p=>({col:width-1-p.col,row:height-1-p.row});
  const point=xy=>({col:Math.round(xy[0]*(width-1)),row:Math.round(xy[1]*(height-1))});
  function paint(p,ch){if(inside(p)){grid[p.row][p.col]=ch;const q=rotate(p);grid[q.row][q.col]=ch;}}
  let seed=(campaign.theme==="open"?41000:campaign.theme==="center"?52000:63000)+index*137;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  function disk(p,r,ch){cells.filter(n=>distance(n,p)<=r).forEach(n=>paint(n,ch));}
  function ellipse(x,y,rx,ry,ch){
    cells.filter(p=>Math.pow((p.col/(width-1)-x)/rx,2)+Math.pow((p.row/(height-1)-y)/ry,2)<=1).forEach(p=>paint(p,ch));
  }
  function line(a,b){
    const result=[a],ap=HEX.toPixel(a.col,a.row,1),bp=HEX.toPixel(b.col,b.row,1);
    while(distance(result[result.length-1],b)){
      const here=result[result.length-1],choices=ns(here).filter(n=>distance(n,b)<distance(here,b));
      const error=n=>{const p=HEX.toPixel(n.col,n.row,1);return Math.abs((bp.x-ap.x)*(ap.y-p.y)-(ap.x-p.x)*(bp.y-ap.y));};
      choices.sort((a,b)=>error(a)-error(b));result.push(choices[0]);
    }return result;
  }
  function stroke(points,ch,radius=0){points.map(point).forEach((p,i,ps)=>{if(i)line(ps[i-1],p).forEach(n=>disk(n,radius,ch));});}
  function arc(x,y,rx,ry,start,end,ch,radius=0){
    const points=Array.from({length:18},(_,i)=>{const a=start+(end-start)*i/17;return [x+rx*Math.cos(a),y+ry*Math.sin(a)];});stroke(points,ch,radius);
  }
  function openTerrain(){
    const m="M",pi=Math.PI;
    switch(index){
      case 0: [[.27,.28],[.45,.48],[.25,.72]].forEach(p=>disk(point(p),1,m));break;
      case 1: arc(.34,.42,.14,.27,-pi*.7,pi*.6,m);break;
      case 2: [[.24,.25],[.37,.43],[.5,.64]].forEach((p,i)=>ellipse(...p,.035+i*.008,.10,m));break;
      case 3: ellipse(.34,.3,.075,.17,m);ellipse(.4,.38,.09,.08,m);break;
      case 4: arc(.44,.45,.16,.26,pi*.2,pi*1.55,m);break;
      case 5: arc(.3,.32,.13,.19,-pi*.8,pi*.85,m);stroke([[.25,.33],[.30,.33]],".");break;
      case 6: [[.2,.2],[.35,.18],[.44,.4],[.24,.59],[.40,.76]].forEach((p,i)=>disk(point(p),i%3===0?2:1,m));break;
      case 7: stroke([[.23,.16],[.28,.34],[.43,.38]],m);stroke([[.17,.59],[.31,.55],[.4,.66]],m);disk(point([.3,.26]),1,m);break;
      case 8: ellipse(.47,.22,.15,.12,m);ellipse(.48,.3,.075,.13,m);break;
      case 9: stroke([[.20,.24],[.38,.34],[.45,.27]],m);stroke([[.21,.62],[.36,.51]],m);break;
      case 10: [[.23,.22],[.37,.43],[.22,.7]].forEach(p=>stroke([p,[p[0]+.09,p[1]+.08]],m));break;
      case 11: arc(.42,.4,.19,.26,pi*.8,pi*1.9,m);[[.26,.31],[.37,.2],[.48,.18]].forEach(p=>disk(point(p),1,m));break;
      case 12: [[.22,.24],[.34,.34],[.21,.48],[.35,.63]].forEach((p,i)=>ellipse(...p,.035,.06+i*.015,m));break;
      case 13: stroke([[.3,.15],[.25,.35],[.4,.42],[.32,.65],[.43,.78]],m);break;
      case 14: [[.2,.2],[.38,.17],[.24,.48],[.43,.43],[.19,.77],[.37,.72]].forEach((p,i)=>disk(point(p),i%2?1:2,m));break;
      case 15: ellipse(.25,.26,.075,.12,m);stroke([[.31,.22],[.39,.37],[.47,.35]],m);ellipse(.31,.67,.07,.12,m);stroke([[.27,.73],[.43,.73]],m);break;
    }
    // Cover occurs in coherent patches, leaving most of the sea as plain.
    ellipse(.22+(index%3)*.04,.48,.08,.12,"h");ellipse(.39,.18+(index%4)*.13,.05,.07,"w");
  }
  const centerPaths=[
    [[[0,.5],[1,.5]],[[.5,0],[.5,1]]],
    [[[0,0],[.5,.5],[1,1]],[[0,1],[.5,.5],[1,0]],[[0,.5],[1,.5]]],
    [[[.2,0],[.2,1]],[[.8,0],[.8,1]],[[0,.22],[1,.22]],[[0,.55],[1,.55]],[[0,.8],[1,.8]]],
    [[[0,.15],[.82,.15],[.82,.42],[.2,.42],[.2,.72],[1,.72]],[[.45,.72],[.45,1]]],
    [[[0,.22],[.35,.4],[.6,.2],[1,.4]],[[0,.65],[.3,.55],[.7,.8],[1,.6]],[[.35,.4],[.3,.55]],[[.6,.2],[.7,.8]]],
    [[[.15,.15],[.85,.15],[.85,.85],[.15,.85],[.15,.15]],[[0,.5],[.35,.5],[.35,.35],[.65,.35],[.65,.65],[1,.65]]],
    [[[0,.3],[.7,1]],[[.3,0],[1,.7]],[[0,.85],[.85,0]]],
    [[[0,.15],[.6,.15],[.6,.4],[.2,.4],[.2,.7],[1,.7]],[[.38,0],[.38,.15]],[[.8,.7],[.8,1]]],
    [[[0,.3],[.3,.3],[.3,.7],[.7,.7],[.7,.3],[1,.3]],[[.3,0],[.3,.3]],[[.7,.7],[.7,1]]],
    [[[.15,.15],[.85,.15],[.85,.85],[.15,.85],[.15,.15]],[[0,.52],[1,.48]]],
    [[[0,.18],[.75,.18]],[[.2,.4],[1,.4]],[[0,.65],[.8,.65]],[[.25,.86],[1,.86]],[[.48,0],[.52,1]]],
    [[[0,0],[.4,.55],[1,.2]],[[0,.5],[.4,.55],[1,.8]],[[0,1],[.4,.55],[.65,1]]],
    [[[0,.2],[.34,.2],[.34,.8],[0,.8]],[[1,.2],[.66,.2],[.66,.8],[1,.8]],[[.34,.5],[.66,.5]]],
    [[[0,.2],[.35,.6],[1,.2]],[[0,.85],[.35,.6],[1,.85]],[[.35,.6],[.45,0]]],
    [[[.08,.15],[.45,.15],[.45,.85],[.08,.85]],[[.55,.15],[.92,.15],[.92,.85],[.55,.85]],[[0,.5],[1,.5]]],
    [[[0,.15],[.32,.15],[.32,.48],[.72,.48],[.72,.82],[1,.82]],[[.16,1],[.16,.7],[.5,.7],[.5,.22],[1,.22]],[[0,.45],[.32,.48]],[[.72,.48],[.9,0]]]
  ];
  function centerTerrain(){
    const x0=.22,y0=.13,sx=.56,sy=.74;
    cells.forEach(p=>{const x=p.col/(width-1),y=p.row/(height-1);
      if(x>x0&&x<1-x0&&y>y0&&y<1-y0&&
        (index%4!==1||Math.abs(x-.5)/.28+Math.abs(y-.5)/.45<1.5))paint(p,"M");
    });
    const scale=path=>path.map(([x,y])=>[x0+x*sx,y0+y*sy]);
    centerPaths[index].forEach((p,i)=>stroke(scale(p),".",index===8&&i===0?1:0));
    // Selected meeting points open into small rooms, leaving the external
    // field several times wider than any individual interior passage.
    if([1,5,8,11,15].includes(index))disk(point([.42,.5]),1,".");
    cells.filter(p=>p.col<width/2&&at(p)===".").forEach(p=>{
      const central=p.col/(width-1)>.22&&p.row/(height-1)>.13&&p.row/(height-1)<.87;
      if(random()<(central?.27:.09))paint(p,"h");
    });
  }
  function roughTerrain(){
    const w="w",h="h",v="v",m="M";
    switch(index){
      case 0: for(const y of [.25,.55,.8])ellipse(.4,y,.26,.085,h);break;
      case 1: ellipse(.38,.45,.26,.38,w);ellipse(.35,.32,.08,.13,h);break;
      case 2: [[.27,.3],[.47,.6],[.2,.78]].forEach(p=>ellipse(...p,.17,.17,w));break;
      case 3: stroke([[.32,0],[.42,.3],[.34,.7],[.46,1]],v);ellipse(.22,.3,.12,.20,w);ellipse(.24,.74,.17,.14,h);break;
      case 4: stroke([[0,.3],[.22,.44],[.4,.32],[.62,.55],[1,.4]],h,1);ellipse(.35,.7,.24,.17,w);break;
      case 5: for(const y of [.2,.43,.7])ellipse(.32,y,.22,.11,y===.43?w:h);break;
      case 6: ellipse(.35,.42,.27,.26,w);ellipse(.34,.47,.13,.17,h);ellipse(.17,.8,.12,.12,h);break;
      case 7: ellipse(.3,.3,.22,.25,w);ellipse(.4,.65,.17,.24,w);stroke([[.25,.1],[.4,.33]],h);break;
      case 8: for(const x of [.22,.48])for(const y of [.23,.5,.77])ellipse(x,y,.12,.13,Math.round(x*100+y*100)%2?h:w);break;
      case 9: stroke([[.32,0],[.28,.35],[.37,.6],[.31,1]],v);ellipse(.18,.3,.12,.15,w);ellipse(.46,.4,.11,.20,h);break;
      case 10: stroke([[.1,.05],[.3,.4],[.5,.5],[.75,.8]],w,2);ellipse(.19,.63,.13,.22,h);break;
      case 11: for(const y of [.2,.5,.8])stroke([[.1,y],[.42,y+.06]],h,1);ellipse(.4,.32,.25,.09,w);break;
      case 12: stroke([[.13,.5],[.4,.33],[.6,.6],[.87,.5]],w,2);ellipse(.27,.18,.18,.12,h);ellipse(.37,.74,.18,.1,h);break;
      case 13: [[.25,.25],[.45,.42],[.25,.7]].forEach(p=>ellipse(...p,.14,.16,w));stroke([[.12,.18],[.43,.7]],h);break;
      case 14: stroke([[.3,0],[.35,.35],[.25,.6],[.32,1]],v);stroke([[.1,.38],[.48,.43]],v);ellipse(.22,.2,.15,.14,w);ellipse(.43,.68,.10,.18,h);break;
      case 15: ellipse(.26,.26,.19,.20,w);ellipse(.40,.60,.2,.2,h);stroke([[.35,0],[.48,.27],[.38,.50]],v);stroke([[.12,.60],[.28,.83]],w,1);break;
    }
    if(index>0){ellipse(.21,.2+(index%3)*.24,.035,.075,m);ellipse(.44,.15+(index%4)*.15,.035,.06,h);}
    // A few linked cover patches complete the physical texture; they are
    // kept distinct from roads and never scatter isolated mountain pixels.
    if(index!==0)ellipse(.17,.77,.10,.10,h);
  }
  if(campaign.theme==="open")openTerrain();else if(campaign.theme==="center")centerTerrain();else roughTerrain();
  const base=point(index%7===3?[.32,.08]:index%5===2?[.09,.16]:[.08,.49]);
  const buildings=[{...base,owner:0},{...rotate(base),owner:1}],units=[];
  buildings.forEach(b=>disk(b,1,"."));
  function flood(start,passable){const q=[start],seen=new Set([key(start)]);for(let i=0;i<q.length;i++)ns(q[i]).forEach(p=>{if(!seen.has(key(p))&&passable(p)){seen.add(key(p));q.push(p);}});return seen;}
  function route(a,b,road){
    const q=[{p:a,cost:0}],best=new Map([[key(a),0]]),prev=new Map([[key(a),null]]);let end;
    while(q.length){
      q.sort((a,b)=>a.cost-b.cost);const {p,cost}=q.shift();if(cost!==best.get(key(p)))continue;
      if(key(p)===key(b)){end=p;break;}
      ns(p).forEach(n=>{
        if(at(n)==="F"&&key(n)!==key(b))return;
        const next=cost+({M:22,v:8,w:2.3,h:1.5,"-":.35,"=":.35}[at(n)]||1),k=key(n);
        if(best.has(k)&&best.get(k)<=next)return;best.set(k,next);prev.set(k,p);q.push({p:n,cost:next});
      });
    }
    if(!end)throw new Error("No route in "+spec.name);
    while(end){if(!["F","B"].includes(at(end))){if(road)paint(end,at(end)==="v"||at(end)==="="?"=":"-");else if(["M","v"].includes(at(end)))paint(end,at(end)==="v"?"=":".");}end=prev.get(key(end));}
  }
  // Preserve broad open ground and connect land pockets by the least
  // disruptive pass. A neutral factory is never a necessary transit tile.
  for(let attempt=0;attempt<100;attempt++){
    const main=flood(base,p=>!["M","v"].includes(at(p))),stray=cells.find(p=>!["M","v"].includes(at(p))&&!main.has(key(p)));
    if(!stray)break;const nearest=cells.filter(p=>main.has(key(p))).sort((a,b)=>distance(a,stray)-distance(b,stray))[0];route(stray,nearest,false);
  }
  const roads={direct:[[.18,.49],[.82,.49]],rim:[[.15,.2],[.5,.12],[.85,.2]],zigzag:[[.16,.55],[.3,.2],[.52,.4],[.68,.8],[.84,.48]],
    fork:[[.15,.5],[.32,.25],[.52,.4],[.8,.3]],cross:[[.16,.18],[.5,.5],[.84,.82]],ladder:[[.18,.25],[.82,.25],[.82,.75],[.18,.75]]};
  if(spec.road!=="none"){
    const points=[base,...roads[spec.road].map(point),rotate(base)];
    points.forEach((p,i)=>{if(i)route(points[i-1],p,true);});
    if(spec.road==="ladder")route(point([.5,.25]),point([.5,.75]),true);
  }
  if(campaign.theme==="rough"&&[3,9,14,15].includes(index)){
    // Give each valley seam a real vehicle crossing. Roads routed by cost
    // alone may instead run around a seam's end.
    const target=point([.35,.5]),crossing=cells.filter(p=>at(p)==="v"&&
      ns(p).filter(n=>!["v","M"].includes(at(n))).length>=2)
      .sort((a,b)=>distance(a,target)-distance(b,target))[0];
    if(crossing){paint(crossing,"=");route(base,crossing,true);route(crossing,rotate(base),true);}
  }
  buildings.forEach(b=>paint(b,"B"));
  const stockTargets=campaign.theme==="center"?[[.4,.3],[.43,.7],[.3,.48],[.49,.19],[.32,.77],[.47,.48]]:
    [[.28,.26],[.4,.67],[.22,.68],[.46,.27],[.39,.47],[.18,.34]];
  spec.stocks.forEach((stock,i)=>{
    const target=point(stockTargets[i]);
    const choices=cells.filter(p=>p.col>1&&p.col<width/2&&p.row>1&&p.row<height-2&&!["M","v","=","B","F"].includes(at(p))&&
      distance(p,rotate(p))>=3&&buildings.every(b=>distance(p,b)>=3));
    choices.sort((a,b)=>distance(a,target)-distance(b,target)||a.row-b.row||a.col-b.col);
    const p=choices[0];if(!p)throw new Error("No factory site: "+spec.name);
    [p,rotate(p)].forEach(n=>buildings.push({...n,owner:-1,stored:stock.split("").map(c=>codes[c])}));paint(p,"F");
    // Every stock can leave onto a firm hex, including an Atlas or Trigger.
    const mouth=ns(p).filter(n=>!["F","B"].includes(at(n))).sort((a,b)=>(["M","v"].includes(at(a))?10:0)-(["M","v"].includes(at(b))?10:0)||distance(a,base)-distance(b,base))[0];
    paint(mouth,at(mouth)==="="?"=":"-");
    if(spec.road!=="none")route(mouth,base,true);
  });
  // Rough-ground road networks must join both camps without factories as
  // stepping stones. Other maps retain their explicitly unpaved variants.
  if(spec.road!=="none")route(base,rotate(base),true);
  // Placing a factory in a narrow passage must not imprison a starting
  // detachment: unowned factories are not ordinary vehicle transit tiles.
  for(let attempt=0;attempt<100;attempt++){
    const floor=p=>!["M","v","F"].includes(at(p)),main=flood(base,floor);
    const stray=cells.find(p=>floor(p)&&!main.has(key(p)));
    if(!stray)break;
    const nearest=cells.filter(p=>main.has(key(p))).sort((a,b)=>distance(a,stray)-distance(b,stray))[0];
    route(stray,nearest,false);
  }
  const occupied=new Set(),reachCache=new Map();
  function reachable(type,owner){
    const id=type.id+":"+owner;
    if(!reachCache.has(id))reachCache.set(id,flood(owner?rotate(base):base,p=>
      at(p)!=="F"&&terrainCost(TERRAIN_BY_CHAR[at(p)],type.moveType,type)!==null));
    return reachCache.get(id);
  }
  function deploy(roster,owner){
    let carrier=null;
    roster.split("").forEach((code,i)=>{
      const typeId=codes[code],type=UNIT_TYPES[typeId];if(!type)throw new Error("Bad roster code: "+code);
      let anchor=base;
      if(spec.formation==="split")anchor=point(i%2?[.20,.73]:[.20,.25]);
      if(spec.formation==="spread")anchor=point([.14+(i%3)*.035,.18+(i%6)*.125]);
      if(spec.formation==="forward")anchor=point([.27,.4+(i%3)*.1]);
      if(spec.formation==="column")anchor=point([.10+Math.min(i,9)*.014,.46+(i%2)*.07]);
      if(spec.formation==="gunline")anchor=point([type.cls==="artillery"?.21:.27,.3+(i%5)*.10]);
      if(index%7===3&&spec.formation==="line")anchor=point([.32,.16]);
      if(owner)anchor=rotate(anchor);
      const legal=p=>!occupied.has(key(p))&&!["F","B"].includes(at(p))&&
        (owner?p.col>=width/2:p.col<width/2)&&
        terrainCost(TERRAIN_BY_CHAR[at(p)],type.moveType,type)!==null&&
        (type.move===0||reachable(type,owner).has(key(p)))&&
        units.every(u=>u.o===owner||HEX.distance(p.col,p.row,u.x,u.y)>4);
      let choices=type.placeByTransport&&carrier?ns({col:carrier.x,row:carrier.y}).filter(legal):cells.filter(legal);
      choices.sort((a,b)=>distance(a,anchor)-distance(b,anchor)||
        (at(a)==="-"?-1:0)-(at(b)==="-"?-1:0)||(owner?-1:1)*(a.row-b.row||a.col-b.col));
      const p=choices[0];if(!p)throw new Error("No legal deployment: "+spec.name+" "+typeId);
      const u={t:typeId,o:owner,x:p.col,y:p.row};units.push(u);occupied.add(key(p));carrier=type.cargo?u:null;
    });
  }
  deploy(spec.army,0);deploy(spec.enemy,1);
  const goal="Capture the enemy camp or eliminate its eligible forces within "+spec.limit+" rounds. At the turn limit, Xenon wins.";
  return {name:spec.name,pack:campaign.name,campaignId:campaign.id,mission:index+1,
    author:"AI-made by Codex",source:"levels/"+campaign.id+"/"+String(index+1).padStart(2,"0")+"-"+spec.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/-$/g,"")+".json",
    description:spec.idea,special:goal+" No Hunters, Falcons or Eagles. Each battle starts with its own authored forces; units do not carry between missions.",
    tags:[campaign.theme==="open"?"open maneuver":campaign.theme==="center"?"dense center / open flanks":"terrain-dependent routes",spec.formation,spec.army.length<=4?"few units":new Set(spec.army+spec.enemy).size<=4?"limited roster":"mixed forces"],
    design:{theme:campaign.theme,layout:index+1,formation:spec.formation,road:spec.road},
    turnLimit:spec.limit,grid:grid.map(r=>r.join("")),buildings,units};
}
function generate(){return catalog.map(c=>({id:c.id,name:c.name,description:c.intro,levels:c.levels.map((s,i)=>build(c,s,i))}));}
if(require.main===module){
  const root=path.join(__dirname,".."),campaigns=generate();
  campaigns.forEach(c=>{
    fs.mkdirSync(path.join(root,"levels",c.id),{recursive:true});
    c.levels.forEach(m=>fs.writeFileSync(path.join(root,m.source),JSON.stringify(m,null,2)+"\n"));
    fs.writeFileSync(path.join(root,"levels",c.id+".json"),JSON.stringify({name:c.name,levels:c.levels},null,2)+"\n");
    console.log(c.name+": "+c.levels.length+" original maps");
  });
  fs.writeFileSync(path.join(root,"js/data-environment-campaigns.js"),"/* AI-made terrain campaigns. Rebuild: node tools/build-environment-campaigns.js */\n\"use strict\";\nvar ENVIRONMENT_CAMPAIGNS = "+JSON.stringify(campaigns,null,2)+";\nif(typeof module!==\"undefined\")module.exports=ENVIRONMENT_CAMPAIGNS;\n");
}
module.exports=generate;
