/* Teaching campaign (approved 2026-09-30; PRODUCT.md, Campaign design: a
 * difficulty curve; MAP_BALANCE.md, Designing a campaign). Each mission
 * introduces one thing a new player needs, in `lesson`, and the boards grow
 * from small to large. `target` is Union's share of wins when the best bot
 * (Marshal) plays both sides: 95-100 on missions 1-3, falling evenly to about
 * 60 on mission 16. The armies and terrain seeds below are the variants that
 * met the targets in the bot measurements. The fields are those of
 * balance-campaign-specs.js, built by build-balance-campaigns.js.
 * Roster codes: C Charlie, K Kilroy, P Panther, B Bison, L Lenet, O Polar,
 * G Grizzly, S Slagger, T Titan, J Giant, H Hadrian, U Octopus, A Atlas,
 * R Rabbit, X Lynx, M Mule, Q Pelican, E Seeker, W Hawkeye, Z Trigger,
 * D Eagle, F Falcon, N Hunter. */
"use strict";
// A pair of barriers from the top and bottom edges at x, `depth` of the
// board deep, so no army circles the board along its rim (PRODUCT.md, Edge
// barriers). On a half-turn map each also paints its mate at 1-x.
const rims=(d,x,depth=.25,ch="M")=>{d.stroke([[x,0],[x,depth]],ch);d.stroke([[x,1],[x,1-depth]],ch);};
// Clustered rough ground from value noise: each layer [ch, share, cell]
// paints ch on `share` of the board's hexes (before the half-turn adds their
// mates) where noise with cells `cell` hexes wide is highest. Hexes within
// 2.5 of either camp stay clear. The seed fixes the pattern; changing any of
// this changes the measured maps.
function texture(d,[w,h],seed,layers){
  const hash=(i,j,k)=>{
    let n=(Math.imul(i+1013,374761393)^Math.imul(j+7919,668265263)^Math.imul(k*97+seed*131+17,1911520717))|0;
    n=Math.imul(n^(n>>>15),2246822519);n=Math.imul(n^(n>>>13),3266489917);
    return ((n^(n>>>16))>>>0)/4294967296;
  };
  const s=t=>t*t*(3-2*t);
  const noise=(X,Y,k)=>{const i=Math.floor(X),j=Math.floor(Y),fx=s(X-i),fy=s(Y-j);
    const a=hash(i,j,k),b=hash(i+1,j,k),c=hash(i,j+1,k),e=hash(i+1,j+1,k);
    return a+(b-a)*fx+(c-a)*fy+(a-b-c+e)*fx*fy;};
  const kept=(c,r)=>Math.hypot(c-.04*(w-1),r-.5*(h-1))<=2.5||Math.hypot(c-.96*(w-1),r-.5*(h-1))<=2.5;
  layers.forEach(([ch,share,cell],k)=>{
    const value=new Map(),free=[];
    for(let r=0;r<h;r++)for(let c=0;c<w;c++){value.set(c+","+r,noise(c/cell,r/cell*.87,k+1));if(!kept(c,r))free.push(value.get(c+","+r));}
    free.sort((a,b)=>b-a);
    const cut=free[Math.max(0,Math.round(share*w*h)-1)];
    d.fill((x,y)=>{const c=Math.round(x*(w-1)),r=Math.round(y*(h-1));return !kept(c,r)&&value.get(c+","+r)>=cut;},ch);
  });
}
// Rough ground first, then the mission's own features; each road clears its
// path through the rough ground, which leaves a pass where it crosses.
const ROUGH=[["h",.05,2.5],["w",.03,3],["M",.035,3]],DENSE=[["h",.08,2.5],["w",.05,3],["M",.05,3]];
const rough=(size,seed,features,layers=ROUGH)=>function(d){
  texture(d,size,seed,layers);
  features(Object.assign({},d,{road:points=>{d.stroke(points,".");d.road(points);}}));
};
const levels=[
  {name:"MONS PICO",size:[14,10],sym:"half",target:98,lesson:"capture the camp",
    idea:"Your Charlies are infantry: move one onto the Xenon camp and you win. Your Bisons are tanks, the strongest units here; they attack from the hex beside an enemy. You also win by destroying every Xenon unit. You have one more Bison than the Xenon.",
    draw:rough([14,10],41,d=>{rims(d,.3,.25);d.road([[.04,.5],[.5,.5]]);d.ellipse([.5,.25],.05,.12,"h");},DENSE),
    bases:[[.04,.5]],union:[["CCBBB",[.2,.5]]],xenon:[["CCBB",[.8,.5]]]},
  {name:"MONS PITON",size:[16,10],sym:"half",target:97,lesson:"terrain defense",
    idea:"Ground adds to a unit's defense: plains 5, hills 20, wasteland 30, mountains 40. Tanks cannot climb mountains, and wasteland slows them. The Xenon waits on the wasteland in the middle; draw it out or strike it from hills of your own.",
    draw:rough([16,10],32,d=>{rims(d,.25,.25);d.ellipse([.5,.5],.12,.35,"w");d.ellipse([.36,.3],.05,.12,"h");d.cell([.5,.5],"M");d.road([[.04,.5],[.3,.5]]);}),
    bases:[[.04,.5]],union:[["CCBBBB",[.18,.5]]],xenon:[["CCBB",[.6,.5]]]},
  {name:"MONS LA HIRE",size:[16,12],sym:"half",target:96,lesson:"zones of control",
    idea:"A unit that moves next to an enemy must stop there. A mountain wall splits the board, with a pass at each end, and one unit in a pass stops enemy tanks beside it. Hold one pass with a single Bison and push through the other with the rest.",
    draw(d){rims(d,.25,.2);d.stroke([[.5,.2],[.5,.8]],"M");d.stroke([[.44,.4],[.56,.6]],"M");d.road([[.04,.5],[.25,.5],[.38,.1]]);},
    bases:[[.04,.5]],union:[["CCBBBB",[.18,.5]]],xenon:[["CCBB",[.8,.5]]]},
  {name:"MONS HUYGENS",size:[18,12],sym:"half",target:93,lesson:"support and surround",
    idea:"Each of your units beside the target adds to an attack, and each Xenon unit beside the attacker adds to its defense. When your units stand on both sides of an enemy it is surrounded, and its attack and defense are halved. Attack together; a lone tank loses.",
    draw:rough([18,12],24,d=>{rims(d,.3,.25);d.ellipse([.5,.5],.08,.14,"h");d.ellipse([.35,.25],.04,.1,"w");d.cell([.42,.75],"M");d.road([[.04,.5],[.4,.5]]);}),
    bases:[[.04,.5]],union:[["CCBBBB",[.2,.5]]],xenon:[["CCBBB",[.8,.5]]]},
  {name:"MONS BRADLEY",size:[18,12],sym:"half",target:90,lesson:"factories",
    idea:"A factory stores units. Move a Charlie onto a neutral factory to capture it: the Bisons inside join you and can leave next to it at once. A unit that enters your own factory is repaired to full strength and can leave again next turn. The Xenon Bisons start damaged.",
    draw:rough([18,12],65,d=>{rims(d,.35,.25);d.ellipse([.5,.5],.06,.2,"h");d.road([[.04,.5],[.3,.3],[.5,.3]]);}),
    bases:[[.04,.5]],factories:[{at:[.3,.22],stock:"BB"}],union:[["CCBB",[.16,.5]]],xenon:[["CC",[.84,.5]],["BB",[.84,.5],{str:6}]]},
  {name:"MONS WOLFF",size:[18,14],sym:"half",target:87,lesson:"Kilroy",
    idea:"New: the Kilroy, heavy infantry. It moves only two hexes but hits tanks four times as hard as a Charlie, and on a mountain it is very hard to shift. Put your Kilroys on the ridge and let the Xenon tanks come to them.",
    draw:rough([18,14],26,d=>{rims(d,.3,.22);d.stroke([[.42,.18],[.38,.4]],"M");d.stroke([[.38,.6],[.42,.82]],"M");d.ellipse([.3,.72],.05,.1,"h");d.road([[.04,.5],[.5,.5]]);}),
    bases:[[.04,.5]],union:[["KKCCBB",[.22,.5]],["B",[.22,.5],{str:6}]],xenon:[["KCCBB",[.78,.5]]]},
  {name:"MONS AMPERE",size:[20,14],sym:"half",target:84,lesson:"artillery",
    idea:"New: the Hadrian, a self-propelled gun. It fires two to five hexes away, and nobody can shoot back, but in one turn it either moves or fires. Keep your tanks in front of it: a gun caught beside an enemy is easy prey.",
    draw:rough([20,14],57,d=>{rims(d,.3,.22);d.ellipse([.5,.5],.06,.18,"h");d.ellipse([.34,.28],.05,.1,"w");d.ellipse([.36,.78],.04,.08,"M");d.road([[.04,.5],[.45,.5]]);}),
    bases:[[.04,.5]],union:[["HHCCBB",[.16,.5]]],xenon:[["HCCCBB",[.84,.5]]]},
  {name:"MONS ARGAEUS",size:[20,14],sym:"half",target:81,lesson:"buggies",
    idea:"New: buggies. A Rabbit attacks and then keeps any movement it has left, so it can strike and pull back out of reach. The Lynx does the same but fires at ground units exactly two hexes away. Use them on guns and damaged units, not on fresh tanks.",
    draw:rough([20,14],98,d=>{rims(d,.28,.22);d.ellipse([.5,.3],.05,.12,"h");d.ellipse([.5,.7],.05,.12,"w");d.road([[.04,.5],[.5,.5]]);}),
    bases:[[.04,.5]],union:[["RXHCCBB",[.16,.5]],["B",[.16,.5],{str:6}]],xenon:[["RHCCBBB",[.84,.5]]]},
  {name:"MONS VINOGRADOV",size:[22,14],sym:"half",target:78,lesson:"aircraft",
    idea:"New: the Eagle. It flies over mountains and valleys, hits ground units hard, and no Bison can shoot at it; only infantry and buggies fire back, weakly. Aircraft get no defense from terrain. The Xenon has no aircraft, and your Eagle squad is down to three machines.",
    draw:rough([22,14],39,d=>{rims(d,.3,.25);d.stroke([[.5,.15],[.5,.4]],"M");d.stroke([[.5,.6],[.5,.85]],"M");d.ellipse([.35,.5],.04,.1,"h");d.road([[.04,.5],[.5,.5]]);}),
    bases:[[.04,.5]],union:[["HCCBBB",[.16,.5]],["D",[.16,.5],{str:3}]],xenon:[["HRCCBBB",[.84,.5]]]},
  {name:"MONS GRUITHUISEN",size:[22,16],sym:"half",target:76,lesson:"anti-air",
    idea:"New: anti-air. The Seeker is a fast tank whose guns are made for aircraft. The Hawkeye fires missiles at aircraft two to five hexes away, but moves or fires. The Xenon brings an Eagle; keep your anti-air beside the units it will dive on.",
    draw:rough([22,16],30,d=>{rims(d,.3,.22);d.ellipse([.5,.5],.07,.16,"h");d.ellipse([.3,.25],.05,.1,"w");d.road([[.04,.5],[.45,.5]]);}),
    bases:[[.04,.5]],union:[["EWHCCBBB",[.16,.5]]],xenon:[["DHCCBBB",[.84,.5]]]},
  {name:"MONS RUMKER",size:[24,16],sym:"half",target:73,lesson:"transports and roads",
    idea:"New: wheels. The Mule carries one Charlie or Kilroy; the Panther is a fast infantry car that captures. Wheels pay double on plains and cannot enter wasteland, so use the roads. Two neutral factories hold reserves.",
    draw:rough([24,16],41,d=>{rims(d,.3,.22,"w");d.ellipse([.5,.5],.1,.2,"w");d.road([[.04,.5],[.25,.5],[.4,.2],[.6,.2]]);d.road([[.25,.5],[.4,.8]]);}),
    bases:[[.04,.5]],factories:[{at:[.4,.78],stock:"BC"}],union:[["MCPHEBBB",[.14,.5]],["K",[.2,.35]]],xenon:[["MCPHEBB",[.86,.5]],["K",[.8,.65]]]},
  {name:"MONTES JURA",size:[24,16],sym:"half",target:70,lesson:"valleys and the Pelican",
    idea:"New: the Pelican, an air transport for any one ground unit; it must land its passenger on plains, roads or bridges. A valley runs down the board: infantry can climb in and out, but vehicles cross only at the bridges. A Pelican can land a tank behind the Xenon lines.",
    draw:rough([24,16],42,d=>{rims(d,.25,.22);d.valley([[.5,0],[.5,1]]);d.bridge([.4,.3],[.6,.3]);d.road([[.04,.5],[.3,.5],[.4,.3]]);d.ellipse([.35,.75],.05,.1,"h");}),
    bases:[[.04,.5]],union:[["QHECCBBBB",[.14,.5]]],xenon:[["QHECCBBB",[.86,.5]]]},
  {name:"MONTES CAUCASUS",size:[26,16],sym:"half",target:68,lesson:"heavy armor",
    idea:"New: heavy tanks. The Polar and Grizzly are slow and hard to crack; the Titan is strong and a little quicker; the Slagger is as tough and the fastest tank of all; the Lenet is a lighter Bison. The Giant moves only two hexes, but hits hardest of all and fires at aircraft too.",
    draw:rough([26,16],33,d=>{rims(d,.3,.22);d.ellipse([.5,.5],.08,.18,"h");d.ellipse([.34,.3],.05,.1,"w");d.cell([.4,.72],"M");d.road([[.04,.5],[.45,.5]]);}),
    bases:[[.04,.5]],union:[["JGTLHCCBB",[.16,.5]]],xenon:[["OSSTLHCCC",[.84,.5]]]},
  {name:"MONTES HAEMUS",size:[26,18],sym:"half",target:65,lesson:"experience",
    idea:"Experience: a unit that damages or destroys enemies earns stars, and each star makes it hit harder. Your main squads start with a star. Keep them alive: a damaged veteran is worth repairing in a factory, and repairs keep its stars.",
    draw:rough([26,18],24,d=>{rims(d,.3,.22);d.ellipse([.5,.5],.06,.2,"h");d.ellipse([.35,.3],.05,.08,"M");d.road([[.04,.5],[.2,.5],[.3,.66]]);}),
    bases:[[.04,.5]],factories:[{at:[.3,.7],stock:"BE"}],union:[["TBBHWC",[.16,.5],{exp:1}],["CDR",[.2,.4]]],xenon:[["TBBBHWCC",[.84,.5]],["DR",[.8,.6]]]},
  {name:"MONTES TAURUS",size:[28,18],sym:"none",target:62,lesson:"mines and fixed guns",
    idea:"New: fixed defenses. Trigger mines never move or fire but are very hard to destroy and still stop units beside them. An Atlas gun, set down by a transport, fires two to six hexes away but never moves again. The Octopus is a shorter-ranged, harder-hitting gun. Break the line with your own guns first.",
    draw(d){rims(d,.2,.22);rims(d,.8,.22);d.stroke([[.62,.25],[.62,.4]],"M");d.stroke([[.62,.6],[.62,.75]],"M");d.ellipse([.4,.5],.05,.12,"h");d.road([[.04,.5],[.5,.5]]);d.road([[.96,.5],[.7,.5]]);},
    bases:[[.04,.5],[.96,.5]],union:[["UUHHCCBBBL",[.14,.5]],["B",[.14,.5],{str:4}],["E",[.2,.35]]],
    xenon:[["ZZ",[.62,.5],true],["MA",[.8,.5]],["UCCBBTL",[.86,.5]],["W",[.9,.35]]]},
  {name:"MONTES APENNINUS",size:[30,20],sym:"half",target:60,lesson:"all arms",
    idea:"Everything together. New: the Falcon hunts aircraft and cannot touch ground units; the Hunter fights both. The Xenon army matches yours except for your two extra Bisons. Win the air, cover your guns, and capture the factories before the Xenon does.",
    draw(d){rims(d,.3,.22);rims(d,.42,.18,"w");d.ellipse([.5,.5],.06,.16,"h");d.ellipse([.36,.3],.04,.1,"M");d.road([[.04,.5],[.25,.5],[.4,.7],[.55,.7]]);},
    bases:[[.04,.5]],factories:[{at:[.24,.26],stock:"BCH"}],union:[["NFHWECCBBBTBB",[.14,.5]],["QK",[.2,.3]]],xenon:[["NFHWECCBBBT",[.86,.5]],["QK",[.8,.7]]]}
];
module.exports=[{id:"training-ground",name:"AI-made: Training Ground",theme:"teaching",tag:"teaching campaign",roster:null,edgeBarriers:true,
  intro:"Sixteen battles that teach the game one idea at a time, from capturing a camp with infantry and tanks to a fight with every arm.",
  levels}];
