'use strict';
const $=id=>document.getElementById(id), esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const units=DATA.selected, stock=DATA.stock, all=[...stock,...units];
const band=r=>!r?'—':r===1?'1':r===2?'2':'2–'+r;
const policy=u=>!u.move?'Stationary':u.moveOrFire?'Move OR fire':u.moveAfterAttack?'Move · fire · retreat':'Move THEN fire';
const fmt=x=>(x*100).toFixed(1), short=u=>u.name.split(' ')[0];
const statKeys=['atkG','atkA','def','move','rngG','rngA'];
const labels={atkG:'Ground attack',atkA:'Air attack',def:'Defense',move:'Movement points',rngG:'Ground max range',rngA:'Air max range'};
let selected=0;
function image(u,state='union',facing='right',attrs=''){return `<img src="${u.images[state+'-'+facing]}" alt="${esc(u.name+' '+state+' '+facing+' icon')}" width="32" height="32" ${attrs}>`;}
function table(rows,gaps=false){return `<table><thead><tr><th>Unit</th><th>G AT</th><th>A AT</th><th>DE</th><th>Move</th><th>G band</th><th>A band</th><th>Chassis</th><th>Turn</th><th>Capture</th>${gaps?'<th>Distance</th>':''}</tr></thead><tbody>${rows.map(u=>`<tr class="${u.rank?'current':''}"><td>${esc(short(u))}</td>${['atkG','atkA','def','move'].map(k=>`<td>${u[k]}</td>`).join('')}<td>${band(u.rngG)}</td><td>${band(u.rngA)}</td><td>${u.moveType}</td><td>${policy(u)}</td><td>${u.capture?'Yes':'—'}</td>${gaps?`<td>${u.distance!==undefined?fmt(u.distance):'—'}</td>`:''}</tr>`).join('')}</tbody></table>`;}
function rangeDiagram(u){
  const n=Math.max(3,u.rngG,u.rngA),w=n*64+56,h=n*64+48,cx=w/2,cy=h/2;
  let hexes='';
  for(let q=-n;q<=n;q++)for(let r=-n;r<=n;r++){
    const d=Math.max(Math.abs(q),Math.abs(r),Math.abs(q+r));if(d>n)continue;
    const x=cx+q*32,y=cy+r*32+q*16,g=u.rngG===1?d===1:d>=2&&d<=u.rngG,a=u.rngA===1?d===1:d>=2&&d<=u.rngA;
    const fill=!d?'#472e38':g&&a?'#695282':g?'#245367':a?'#69592a':'#192330';
    hexes+=`<polygon points="${[[x-24,y],[x-8,y-16],[x+8,y-16],[x+24,y],[x+8,y+16],[x-8,y+16]].map(p=>p.join(',')).join(' ')}" fill="${fill}" stroke="#334355" stroke-width="1"><title>Distance ${d}: ${g?'ground ':''}${a?'air':!g?'no weapon':''}</title></polygon>`;
  }
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(short(u))}: ground band ${band(u.rngG)}, air band ${band(u.rngA)}. Gray hexes cannot be attacked.">${hexes}<image href="${u.images['union-right']}" x="${cx-16}" y="${cy-16}" width="32" height="32" style="image-rendering:pixelated"/></svg>`;
}
function selectUnit(index,updateHash=true){
  selected=(index+units.length)%units.length;const u=units[selected];
  document.querySelectorAll('.roster-button').forEach((b,i)=>b.setAttribute('aria-pressed',i===selected?'true':'false'));
  const nearest=u.nearest.map(n=>({...stock.find(s=>s.id===n.id),distance:n.distance}));
  const terrainNames={road:'Road / bridge',plain:'Plains',hill:'Hills',waste:'Wasteland',mountain:'Mountains',valley:'Valley'};
  const tags=[policy(u),u.moveType==='treads'?'Tracked terrain costs':u.moveType==='wheels'?'Wheeled terrain costs':'Foot terrain costs',u.capture?'Captures buildings':'Cannot capture'];
  if(u.placeByTransport)tags.push('Deploy / carry to relocate');
  if(u.cannotEnter)tags.push('Cannot enter '+u.cannotEnter.join(', '));
  const parts=u.name.split(' '),name=parts.shift();
  $('dossier').innerHTML=`<div class="dossier-top"><div class="portrait">${image(u)}<span class="portrait-label">32 × 32 / ENLARGED</span></div><div><div class="dossier-kicker"><span>PROTOTYPE ${String(u.rank).padStart(2,'0')} / 15</span><span>GAP ${fmt(u.gap)}</span></div><h2>${name} <span class="designation">${parts.join(' ')}</span></h2><p class="role">${u.role}</p><div class="native-row"><span>${image(u)} Union</span><span>${image(u,'xenon','left')} Xenon</span><span class="other-state">${image(u,'attack')} Attack</span><span class="other-state">${image(u,'spent')} Spent</span></div></div></div>
    <div class="stats">${[['Ground AT',u.atkG],['Air AT',u.atkA],['Defense',u.def],['Movement',u.move],['Ground band',band(u.rngG)],['Air band',band(u.rngA)]].map(([label,value])=>`<div class="stat"><span class="stat-label">${label}</span><span class="stat-value ${!value||value==='—'?'disabled':''}">${value}</span></div>`).join('')}</div>
    <div class="dossier-body"><div class="rule-tags">${tags.map(t=>`<span class="tag ${t==='Captures buildings'?'capture':''}">${t}</span>`).join('')}</div><div class="gap-story"><span class="label">The vacancy it occupies</span><p>${u.gapStory}</p></div></div>`;
  const body=$('dossier').querySelector('.dossier-body');
  body.insertAdjacentHTML('beforeend',`<div class="explanation"><div><h3>How to use it</h3><p>${u.use}</p></div><div class="trade"><h3>The price it pays</h3><p>${u.trade}</p></div></div><div class="range-block"><div><h3>Firing footprint</h3><div class="range-diagram">${rangeDiagram(u)}</div><p class="range-caption"><span class="g">■ Ground</span><span class="a">■ Air</span><span class="both">■ Both</span><span>□ Cannot attack</span></p><p class="small-note">Range is measured from the firing hex. Indirect exchanges have no counterattack, support or surround. Adjacent counters require a matching direct weapon, even if the unit already acted.</p></div><div><h3>Movement on uniform terrain</h3>${u.terrain.map(t=>`<div class="terrain-row"><span>${terrainNames[t.id]}</span><b>${!u.move?'Stationary':t.reach?t.id==='valley'?'1 · spends remainder':t.reach+' hex'+(t.reach===1?'':'es'):((u.moveType==='wheels'&&['waste','mountain','valley'].includes(t.id))||(u.moveType==='treads'&&['mountain','valley'].includes(t.id))||(u.cannotEnter||[]).includes(t.id))?'Impassable':'0 · insufficient points'}</b></div>`).join('')}<p class="small-note">Full fresh allowance, no enemies. Entering hostile ZOC stops movement. Foot units spend all remaining movement to enter a valley. Factory and base entry costs one. Starting-in-ZOC exceptions follow the existing engine.</p><p class="small-note"><b>Field identity:</b> ${u.art}</p></div></div><div class="neighbors"><h3>Nearest original configurations</h3><p class="small-note">Nearest means the full weighted distance, not visual resemblance. The distance score measures difference, not strength.</p><div class="table-wrap">${table([u,...nearest],true)}</div><p class="small-note">Original-roster distance: <b>${fmt(u.baselineGap)}</b> / 100 (percentile ${u.percentile.toFixed(1)} in the candidate sample). At selection ${u.rank}, its nearest occupied neighbor was <b>${u.prior.id}</b>, at <b>${fmt(u.gap)}</b>. ${u.rank>1?'Earlier proposals already count as occupied space.':''}</p><div class="risk"><b>First playtest question.</b> ${u.experiment}</div></div>`);
  const breakdown=u.nearest[0].components.map((v,i)=>`${DATA.method.groupNames[i]} ${fmt(v*DATA.method.weights[i])}`).join(' · ');
  body.querySelector('.neighbors .table-wrap').insertAdjacentHTML('afterend',`<p class="small-note">Distance to ${u.nearest[0].id}, in weighted points: ${breakdown}. Components sum to ${fmt(u.baselineGap)} before rounding.</p>`);
  $('dossier').insertAdjacentHTML('beforeend',`<div class="dossier-bottom"><button id="previous">← Previous</button><span>${String(u.rank).padStart(2,'0')} / 15</span><button id="next">Next →</button></div>`);
  $('previous').onclick=()=>selectUnit(selected-1);$('next').onclick=()=>selectUnit(selected+1);
  if(updateHash)history.replaceState(null,'','#'+u.id.toLowerCase());
}
$('roster').innerHTML=units.map((u,i)=>`<button class="roster-button" aria-pressed="${i===0}" data-index="${i}" aria-label="Prototype ${i+1}: ${u.name}. ${u.role}">${image(u)}<span><span class="unit-num">${String(i+1).padStart(2,'0')}</span><span class="unit-name">${u.id}</span></span></button>`).join('');
$('roster').addEventListener('click',e=>{const b=e.target.closest('button');if(b)selectUnit(Number(b.dataset.index));});
function showTab(audit){$('dossiers').hidden=audit;$('audit').hidden=!audit;$('dossiers-tab').setAttribute('aria-pressed',String(!audit));$('audit-tab').setAttribute('aria-pressed',String(audit));if(audit)renderScatter();}
$('dossiers-tab').onclick=()=>showTab(false);$('audit-tab').onclick=()=>showTab(true);
function download(name,obj){const blob=new Blob([JSON.stringify(obj,null,2)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('download').onclick=()=>download('nectaris-ground-prototypes.json',{description:'15 numerical design proposals. customUnits is engine-readable. artwork is a separate indexed pack and is not automatically registered by the game.',customUnits:DATA.custom,artwork:DATA.art,analysis:{method:DATA.method,units:units.map(({images,...u})=>u)}});
function histogram(key){
  const grid=key==='atkG'?Array.from({length:10},(_,i)=>i*10):key==='atkA'?[0,10,20,30,40,50,60,70,80,85]:key==='def'?Array.from({length:8},(_,i)=>(i+1)*10):Array.from({length:key==='move'?10:key==='rngG'?7:6},(_,i)=>i);
  const values=[...new Set([...grid,...all.map(u=>u[key])])].sort((a,b)=>a-b),old=values.map(v=>stock.filter(u=>u[key]===v).length),fresh=values.map(v=>units.filter(u=>u[key]===v).length),max=Math.max(...old,...fresh);
  return `<div class="histogram"><h4>${labels[key]}</h4><div class="bins">${values.map((v,i)=>`<div class="bin" title="${labels[key]} ${v}: ${old[i]} original, ${fresh[i]} proposed" aria-label="${labels[key]} ${v}: ${old[i]} original, ${fresh[i]} proposed"><div class="bin-bars"><i style="height:${old[i]/max*84}%">${old[i]?`<span>${old[i]}</span>`:''}</i><i class="new" style="height:${fresh[i]/max*84}%">${fresh[i]?`<span>${fresh[i]}</span>`:''}</i></div><span class="bin-label">${v}</span></div>`).join('')}</div></div>`;
}
$('histograms').innerHTML=statKeys.map(histogram).join('');
const rules=[['Capture',u=>u.capture],['Move or fire (mobile)',u=>u.move&&u.moveOrFire],['Retreat after fire',u=>u.moveAfterAttack],['Cargo capacity',u=>u.cargo],['Stationary',u=>!u.move],['Foot movement',u=>u.moveType==='foot'],['Wheeled movement',u=>u.moveType==='wheels'],['Tracked movement',u=>u.moveType==='treads'],['Ground + air indirect',u=>u.rngG>1&&u.rngA>1],['Capturer + indirect',u=>u.capture&&(u.rngG>1||u.rngA>1)],['Extra waste restriction',u=>(u.cannotEnter||[]).includes('waste')],['Transport placement',u=>u.placeByTransport]];
$('rule-counts').innerHTML=rules.map(([label,p])=>`<div class="rule-count"><b><span>${stock.filter(p).length}</span> / <span>${units.filter(p).length}</span></b>${label}</div>`).join('');
for(const id of ['x-axis','y-axis'])$(id).innerHTML=statKeys.map(k=>`<option value="${k}">${labels[k]}</option>`).join('');
$('x-axis').value='move';$('y-axis').value='def';
function renderScatter(){
  const xk=$('x-axis').value,yk=$('y-axis').value,w=Math.max(310,$('scatter').clientWidth-24),h=Math.min(410,w*.64+95),pad={l:54,r:25,t:25,b:54},xMax=Math.max(...all.map(u=>u[xk]),1),yMax=Math.max(...all.map(u=>u[yk]),1);
  const x=v=>pad.l+v/xMax*(w-pad.l-pad.r),y=v=>h-pad.b-v/yMax*(h-pad.t-pad.b);
  let plot='';const ticks=w<500?3:5;
  for(let i=0;i<=ticks;i++){const xv=xMax*i/ticks,yv=yMax*i/ticks,xf=x(xv),yf=y(yv);plot+=`<path d="M${xf},${pad.t}V${h-pad.b}M${pad.l},${yf}H${w-pad.r}" stroke="#2d3e50" fill="none"/><text x="${xf}" y="${h-pad.b+22}" text-anchor="middle" fill="#aab9c8" font-size="11">${Number(xv.toFixed(1))}</text><text x="${pad.l-12}" y="${yf+4}" text-anchor="end" fill="#aab9c8" font-size="11">${Number(yv.toFixed(1))}</text>`;}
  const groups=new Map();for(const u of all){const k=u[xk]+','+u[yk];if(!groups.has(k))groups.set(k,[]);groups.get(k).push(u);}
  let idx=0;const groupList=[];
  for(const list of groups.values()){
    const u=list[0],fresh=list.some(v=>v.rank),old=list.some(v=>!v.rank),color=fresh?'#f4d36c':'#7fcce3',xx=x(u[xk]),yy=y(u[yk]),r=list.length>1?10:6;
    groupList.push(list);plot+=`<g class="point" role="button" tabindex="0" data-point="${idx++}" aria-label="${esc(list.map(v=>v.name).join(', '))}. ${labels[xk]} ${u[xk]}, ${labels[yk]} ${u[yk]}"><title>${esc(list.map(v=>v.name).join(', '))}</title><circle cx="${xx}" cy="${yy}" r="16" fill="transparent"/><circle cx="${xx}" cy="${yy}" r="${r}" fill="${color}" stroke="${old&&fresh?'#7fcce3':'#141e2a'}" stroke-width="${old&&fresh?3:1}"/>${list.length>1?`<text x="${xx}" y="${yy+4}" text-anchor="middle" font-size="11" font-weight="700" fill="#10151e">${list.length}</text>`:''}</g>`;
  }
  $('scatter').innerHTML=`<svg viewBox="0 0 ${w} ${h}" role="group" aria-label="${labels[xk]} against ${labels[yk]}. Original units cyan, proposals yellow.">${plot}<text x="${(pad.l+w-pad.r)/2}" y="${h-8}" fill="#c0cbd6" text-anchor="middle" font-size="12">${labels[xk]}</text><text transform="translate(15 ${(pad.t+h-pad.b)/2}) rotate(-90)" fill="#c0cbd6" text-anchor="middle" font-size="12">${labels[yk]}</text></svg>`;
  const choose=e=>{const p=e.target.closest('[data-point]');if(!p)return;const list=groupList[Number(p.dataset.point)];$('point-detail').innerHTML=list.map(u=>`${esc(u.name)} ${u.rank?'[PROPOSED]':'[ORIGINAL]'} · G ${u.atkG} / A ${u.atkA} / DE ${u.def} / M ${u.move} · bands G ${band(u.rngG)}, A ${band(u.rngA)} · ${u.moveType} · ${policy(u)}${u.capture?' · captures':''}`).join('<br>');};
  $('scatter').onclick=choose;$('scatter').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(e);}};
}
$('x-axis').onchange=renderScatter;$('y-axis').onchange=renderScatter;
new ResizeObserver(()=>{if(!$('audit').hidden)renderScatter();}).observe($('scatter'));
$('weights').innerHTML=DATA.method.groupNames.map((n,i)=>`<div class="weight-row"><span>${n}</span><div class="weight-track"><span style="width:${DATA.method.weights[i]*200}%"></span></div><span>${DATA.method.weights[i]*100}%</span></div>`).join('');
const c=DATA.method.coverage;
$('coverage').innerHTML=`<p><strong>${DATA.method.candidates.toLocaleString()}</strong> distinct admissible configurations from ${DATA.method.feasibleDraws.toLocaleString()} feasible draws.</p><p>Mean nearest-unit distance: <strong>${fmt(c.meanBefore)} → ${fmt(c.meanAfter)}</strong> after adding 15 (${((1-c.meanAfter/c.meanBefore)*100).toFixed(1)}% reduction).</p><p>Largest remaining sample gap: <strong>${fmt(c.maxBefore)} → ${fmt(c.maxAfter)}</strong>. Coverage uses the same initial sample throughout, including subsequently excluded candidates.</p>`;
$('sensitivity').innerHTML=DATA.method.sensitivity.map(s=>`<div class="sensitivity-row"><b>${s.name} × 1.5</b><span>${s.top.moveType} M${s.top.move} · G${s.top.atkG} A${s.top.atkA} DE${s.top.def} · G-band ${band(s.top.rngG)} / A-band ${band(s.top.rngA)} · ${policy(s.top)}${s.top.capture?' · captures':''} · distance ${fmt(s.topGap)}</span></div>`).join('');
$('full-table').innerHTML=table(all);
const hash=location.hash.slice(1).toUpperCase(),index=units.findIndex(u=>u.id===hash);selectUnit(index<0?0:index,false);
