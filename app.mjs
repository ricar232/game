import {WIDTH,HEIGHT,MAX_LEVEL,zones,byId,peoples,classes,goods,slots,statNames,create,normalize,step,summary,timeAt,attributes,affinity,maxHP,needed,
  order,challenge,automatic,recall,sellGood,sellAll,buyGood,buyPrice,buyPotion,potionCost,potionHeal,MAX_POTIONS,item,canBuyItem,buyItem,missing,
  inTown,record,unlocked,lockReason,topTier,duel,verdict,xpFactor,policyRules} from './engine.mjs';
import {draw,portrait} from './map.mjs';
import {drawScene,scenes,spotAt} from './scene.mjs';
const by=id=>document.getElementById(id);
const saveKey='valle-de-bruma-v2',oldKey='valle-de-bruma-v1';
let migrated=false;
function load(){
  try{
    const value=JSON.parse(localStorage.getItem(saveKey));
    if(value?.version===2&&peoples[value.people]&&classes[value.classIndex]&&byId[value.zone]&&Array.isArray(value.path)&&Array.isArray(value.logs)){
      normalize(value);
      if(value.state==='travel'&&!value.path.length){value.state='rest';value.zone='villa';value.x=byId.villa.x;value.y=byId.villa.y;value.target=null;}
      return value;
    }
  }catch{}
  try{
    const old=JSON.parse(localStorage.getItem(oldKey));
    if(old&&peoples[old.people]&&classes[old.classIndex]){migrated=true;return create(Math.random,{people:old.people,classIndex:old.classIndex,name:old.name});}
  }catch{}
  return null;
}
const s=load()??create();
const modal=by('modal'),body=by('modal-body'),canvas=by('world'),stage=canvas.getContext('2d');
let previous=performance.now(),hudAt=0,saveAt=0,paintAt=0;
let sessionStarted=Boolean(s.started)&&!migrated,inventoryKey='',logRef=null,detailKey='',equipKey='';
let view='atlas',spot=null,hover=null,S=1;
const places=['atlas',...zones.map(z=>z.id)];

function persist(){try{localStorage.setItem(saveKey,JSON.stringify(s));}catch{}}
function act(fn){return()=>{fn();persist();detailKey='';equipKey='';sync();};}
function button(text,callback,style=''){
  const b=document.createElement('button');b.type='button';b.className='button '+style;b.textContent=text;b.onclick=callback;return b;
}
function element(name,text,cls){
  const el=document.createElement(name);if(text)el.textContent=text;if(cls)el.className=cls;return el;
}
function facts(list){
  const dl=element('dl','','facts');
  for(const [k,v] of list){const d=element('div');d.append(element('dt',k),element('dd',String(v)));dl.append(d);}
  return dl;
}
const statText=st=>Object.entries(st).filter(([,v])=>v).map(([k,v])=>'+'+(k==='speed'||k==='crit'?Math.round(v*100)+'%':v)+' '+statNames[k]).join(' · ')||'Sin bonificación';
const matText=m=>Object.entries(m).map(([k,v])=>v+' '+goods[k].name.toLowerCase()).join(', ');

/* ---------- lienzo ---------- */
function resize(){
  const next=Math.min(3,Math.max(1,Math.round(canvas.clientWidth*(devicePixelRatio||1)/WIDTH*2)/2));
  if(next!==S){S=next;canvas.width=Math.round(WIDTH*S);canvas.height=Math.round(HEIGHT*S);}
}
function toLocal(e){
  const r=canvas.getBoundingClientRect();
  return [(e.clientX-r.left)/r.width*WIDTH,(e.clientY-r.top)/r.height*HEIGHT];
}

/* ---------- navegación ---------- */
function pane(name){
  for(const b of document.querySelectorAll('.side-tabs button'))b.setAttribute('aria-selected',String(b.dataset.pane===name));
  for(const p of ['place','hero','log'])by('pane-'+p).hidden=p!==name;
}
function go(id,spotId=null){
  pane('place');view=id;spot=spotId;hover=null;detailKey='';
  try{history.replaceState(null,'',id==='atlas'?location.pathname+location.search:'#'+id+(spotId?'/'+spotId:''));}catch{}
  pins();tabs();sync();
}
const enter=id=>go(id);
const leave=()=>go('atlas');
function pick(id){pane('place');spot=spot===id?null:id;detailKey='';try{history.replaceState(null,'','#'+view+(spot?'/'+spot:''));}catch{}pins();sync();}
function heroPlace(){return s.state==='travel'?(s.target==='villa'?s.zone:s.target):s.zone;}
function pin(text,icon,extra,x,y,onclick,label){
  const b=document.createElement('button');
  b.type='button';b.className='marker';b.setAttribute('aria-label',label);
  b.append(element('span',icon),element('span',text));
  if(extra)b.append(element('small',extra));
  b.style.left=100*x/WIDTH+'%';b.style.top=100*y/HEIGHT+'%';b.onclick=onclick;
  return b;
}
function pins(){
  const box=by('markers');box.replaceChildren();
  if(view==='atlas'){
    for(const zone of zones){
      const open=unlocked(s,zone.id),done=s.bosses[zone.id];
      const b=pin(zone.short,open?zone.icon:'🔒',zone.tier?(open?(done?'✓ Nv. '+zone.level:'Nv. '+zone.level):lockReason(s,zone.id).replace('Requiere nivel','Nv.')):'Entrar',zone.label[0],zone.label[1],()=>enter(zone.id),'Explorar '+zone.name);
      if(!open)b.dataset.locked='true';
      b.onmouseenter=()=>{hover=zone.id;};b.onmouseleave=()=>{hover=null;};
      box.append(b);
    }
  }else{
    for(const sp of scenes[view].spots){
      const b=pin(sp.label,sp.icon,'',sp.at[0],sp.at[1],()=>pick(sp.id),sp.label);
      b.classList.add('spot');if(sp.kind==='boss')b.classList.add('boss');
      b.setAttribute('aria-pressed',String(spot===sp.id));
      b.onmouseenter=()=>{hover=sp.id;};b.onmouseleave=()=>{hover=null;};
      box.append(b);
    }
  }
  by('back').hidden=view==='atlas';
  by('atlas').classList.toggle('in-scene',view!=='atlas');
}
function tabs(){
  const nav=by('tabs');nav.replaceChildren();
  places.forEach((id,i)=>{
    const z=byId[id],open=id==='atlas'||unlocked(s,id);
    const b=document.createElement('button');b.type='button';b.className='tab';
    b.setAttribute('aria-pressed',String(view===id));
    b.append(element('kbd',String(i)),element('span',id==='atlas'?'◇':open?z.icon:'🔒','tab-icon'),element('span',id==='atlas'?'Atlas':z.short));
    if(id!=='atlas'&&heroPlace()===id)b.append(element('i','','here'));
    if(z?.tier&&s.bosses[id])b.append(element('small','✓'));
    if(z?.tier&&!open)b.title=lockReason(s,id);
    b.onclick=()=>go(id);nav.append(b);
  });
}
let tabsKey='';
function tabsIfChanged(){
  const key=[view,heroPlace(),s.level,JSON.stringify(s.bosses)].join('|');
  if(key!==tabsKey){tabsKey=key;tabs();if(view==='atlas')pins();}
}

/* ---------- tiendas ---------- */
function buyMissing(mats){
  for(const [k,n] of missing(s,mats))if(!buyGood(s,k,n))return false;
  return true;
}
function matChips(mats){
  const wrap=element('div','','mats');
  for(const [k,v] of Object.entries(mats)){
    const have=s.inventory[k]||0;
    wrap.append(element('span',goods[k].icon+' '+goods[k].name+' '+Math.min(have,v)+'/'+v,'mat '+(have>=v?'ok':'no')));
  }
  return wrap;
}
function shopItem(slot){
  const def=slots[slot],cur=s.gear[slot]||0,box=element('div','','shop-item');
  const head=element('div','','shop-head');
  head.append(element('span',def.icon,'slot-icon'),element('div'));
  head.lastChild.append(element('strong',def.name),element('small',cur?item(s,slot,cur).name+' · rango '+cur:'Sin equipar'));
  box.append(head);
  if(cur>=5){box.append(element('p','Rango máximo alcanzado.','muted'));return box;}
  const next=item(s,slot,cur+1),check=canBuyItem(s,slot,cur+1);
  const offer=element('div','','offer');
  offer.append(element('b',next.name),element('span',statText(next.stats),'stat-up'));
  box.append(offer,matChips(next.mats));
  const row=element('div','','buy-row');
  const b=button((def.shop==='forge'?'Forjar':'Comprar')+' · '+next.cost+' mon.',act(()=>buyItem(s,slot,cur+1)));
  b.disabled=!check.ok;row.append(b);
  const miss=missing(s,next.mats),avail=miss.every(([k])=>goods[k].tier<=topTier(s)),cost=miss.reduce((n,[k,v])=>n+buyPrice(k)*v,0);
  if(miss.length&&avail&&inTown(s)&&next.cost<=s.coins){
    const m=button('Comprar materiales · '+cost+' mon.',act(()=>buyMissing(next.mats)),'subtle');m.disabled=s.coins<cost;row.append(m);
  }
  box.append(row);
  if(!check.ok)box.append(element('small',check.reason,'reason'));
  return box;
}

/* ---------- paneles ---------- */
function chipNav(list){
  const wrap=element('div','','nav-chips');
  for(const sp of list)wrap.append(button(sp.icon+' '+sp.label,()=>pick(sp.id),'subtle'));
  return wrap;
}
function zoneStatus(z){
  if(!unlocked(s,z.id))return '🔒 '+lockReason(s,z.id);
  if(s.bosses[z.id])return '✓ '+z.boss.name+' derrotado';
  return 'Jefe: '+z.boss.name;
}
function detailContent(){
  const out={title:'',desc:'',nodes:[],actions:[],kicker:''};
  const town=inTown(s);
  const needTown=()=>{if(!town){out.nodes.unshift(element('p','Tu héroe no está en la villa. Ordénale volver para comprar y vender.','warn'));out.actions.push(button('Ordenar regreso',act(()=>recall(s))));}};
  if(view==='atlas'){
    out.kicker='Atlas';out.title='El valle';
    out.desc='Cada zona tiene un jefe. Derrótalo para abrir el camino a la siguiente. La última es el Pico de la Bruma.';
    const rows=element('div','','rows');
    for(const z of zones){
      const row=element('div','','row zone-row'+(unlocked(s,z.id)?'':' dim'));
      const info=element('div');info.append(element('strong',z.icon+' '+z.name+(z.level?' · Nv. '+z.level:'')),element('small',z.tier?zoneStatus(z):'Comercio, equipo y descanso'));
      row.append(info,button('Ver',()=>go(z.id),'subtle'));
      rows.append(row);
    }
    out.nodes.push(rows,element('p','Atajos: teclas 0 a 6 para cambiar de lugar, Esc para volver.','hint'));
    return out;
  }
  const z=byId[view],sc=scenes[view],sp=sc.spots.find(x=>x.id===spot);
  if(!sp){
    out.kicker=view==='villa'?'Villa':'Zona · Nv. '+z.level;out.title=z.name;out.desc=z.description;
    if(view==='villa'){
      out.nodes.push(chipNav(sc.spots));
      out.nodes.push(facts([['Tu héroe',heroPlace()==='villa'?summary(s):'Fuera · '+summary(s)],['Monedas',s.coins],['Pociones',s.potions+' / '+MAX_POTIONS]]));
      out.actions.push(button('Ordenar regreso',act(()=>recall(s))));
    }else{
      const r=record(s,view),open=unlocked(s,view);
      if(!open)out.nodes.push(element('p','🔒 '+lockReason(s,view),'warn'));
      out.nodes.push(chipNav(sc.spots.filter(x=>x.kind!=='exit')));
      out.nodes.push(facts([['Tu héroe',heroPlace()===view?summary(s):'No está aquí'],['Recursos',z.resources.map(k=>goods[k].name).join(', ')],['Enemigo',z.foe.name],['Jefe',s.bosses[view]?'Derrotado ✓':z.boss.name],['Victorias',r.kills],['Recolectado',r.gathered]]));
      const b=button('Enviar héroe aquí',act(()=>order(s,view)));b.disabled=!open;out.actions.push(b);
    }
    return out;
  }
  out.kicker=z.name;out.title=sp.label;out.desc=sp.text||'';
  switch(sp.kind){
    case 'inn':{
      out.title='Posada El Fresno Dormido';
      out.desc='Camas de paja limpia, sopa caliente y una chimenea que nunca se apaga. Aquí tu héroe recupera la salud.';
      const rate=classes[s.classIndex].name==='Paladín'?10:6.5;
      out.nodes.push(facts([['Salud',Math.ceil(s.hp)+' / '+maxHP(s)],['Recuperación',rate+'% por segundo'],['Estado',town?summary(s):'Fuera de la villa']]));
      const b=button(s.held&&town?'Descansando…':'Ordenar descanso',act(()=>recall(s)));b.disabled=s.held&&town;out.actions.push(b);
      break;
    }
    case 'market':{
      out.title='Mercado de la plaza';
      out.desc='Pociones, amuletos y materiales. El comerciante compra todo lo que traigas y vende lo que ya conoces del valle.';
      const pot=element('div','','shop-item');
      pot.append(element('div','','shop-head'));
      pot.firstChild.append(element('span','⚱','slot-icon'),element('div'));
      pot.firstChild.lastChild.append(element('strong','Poción de salud'),element('small','Cura '+potionHeal(s)+' de salud · llevas '+s.potions+' / '+MAX_POTIONS));
      const pr=element('div','','buy-row');
      const b1=button('Comprar 1 · '+potionCost(s)+' mon.',act(()=>buyPotion(s,1)));b1.disabled=!town||s.potions>=MAX_POTIONS||s.coins<potionCost(s);
      const fill=MAX_POTIONS-s.potions,b2=button('Llenar ('+fill+') · '+potionCost(s)*fill+' mon.',act(()=>buyPotion(s,fill)),'subtle');b2.disabled=!town||!fill||s.coins<potionCost(s)*fill;
      pr.append(b1,b2);pot.append(pr);
      out.nodes.push(pot,shopItem('charm'));
      const total=Object.entries(s.inventory).reduce((n,[k,v])=>n+goods[k].price*v,0);
      out.nodes.push(element('h4','Materiales'));
      const rows=element('div','','rows');
      for(const [k,g] of Object.entries(goods)){
        const n=s.inventory[k]||0,known=g.tier<=topTier(s);
        if(!known&&!n)continue;
        const row=element('div','','row goods-row');
        const info=element('div');info.append(element('strong',g.icon+' '+g.name+(n?' × '+n:'')),element('small','Vende '+g.price+' · Compra '+buyPrice(k)));
        const sb=button('Vender',act(()=>sellGood(s,k)),'subtle');sb.disabled=!town||!n;
        const bb=button('Comprar',act(()=>buyGood(s,k,1)),'subtle');bb.disabled=!town||!known||s.coins<buyPrice(k);
        row.append(info,sb,bb);rows.append(row);
      }
      out.nodes.push(rows);
      const all=button('Vender todo'+(total?' · '+total+' mon.':''),act(()=>sellAll(s)),'subtle');all.disabled=!town||!total;out.actions.push(all);
      needTown();
      break;
    }
    case 'forge':
      out.title='Herrería de Brasa';
      out.desc='Armas, armaduras y yelmos. El herrero necesita monedas y los materiales que traigas de cada zona.';
      out.nodes.push(shopItem('weapon'),shopItem('armor'),shopItem('helm'));
      needTown();
      break;
    case 'tailor':
      out.title='Sastrería de la Aguja';
      out.desc='Capas que dan salud y botas que dan defensa y velocidad, para viajar y luchar mejor.';
      out.nodes.push(shopItem('cloak'),shopItem('boots'));
      needTown();
      break;
    case 'home':{
      out.title='Casa de '+s.name;
      out.desc='El estandarte de tu clase en la entrada y un arcón con todo lo que has reunido.';
      const recs=Object.values(s.records||{}),sum=k=>recs.reduce((n,r)=>n+(r[k]||0),0);
      out.nodes.push(facts([['Victorias',sum('kills')],['Recolectado',sum('gathered')],['Caídas',sum('falls')],['Días en el valle',timeAt(s).day]]));
      out.nodes.push(element('h4','Trofeos de jefes'));
      const shelf=element('div','','chips');
      for(const zz of zones.slice(1))shelf.append(element('span',s.bosses[zz.id]?'🏆 '+zz.boss.name+(s.bosses[zz.id]>1?' ×'+s.bosses[zz.id]:''):'? '+zz.short,'chip'+(s.bosses[zz.id]?' gold':' dim')));
      out.nodes.push(shelf);
      if(s.won)out.nodes.push(element('p','Liberaste el Valle de Bruma. Los jefes vuelven a despertar: sigue cazándolos para conseguir más botín.','hint'));
      break;
    }
    case 'board':{
      out.title='Tablón de expediciones';
      out.desc='Encargos y rumores clavados en madera. Desde aquí envías a tu héroe o desafías a un jefe.';
      const rows=element('div','','rows');
      for(const zz of zones.slice(1)){
        const open=unlocked(s,zz.id),row=element('div','','row zone-row'+(open?'':' dim'));
        const info=element('div');info.append(element('strong',zz.icon+' '+zz.name),element('small',zoneStatus(zz)));
        const send=button('Enviar',act(()=>order(s,zz.id)),'subtle');send.disabled=!open;
        row.append(info,send);rows.append(row);
      }
      out.nodes.push(facts([['Orden actual',s.held?'Quedarse en la villa':s.challenge?'Desafiar a '+byId[s.challenge].boss.name:s.auto?'Ruta automática':byId[s.desired].name]]),rows);
      out.actions.push(button('Ruta automática',act(()=>automatic(s))));
      break;
    }
    case 'gather':{
      const r=record(s,view),g=attributes(s).gather,open=unlocked(s,view);
      out.nodes.push(facts([['Recursos',z.resources.map(k=>goods[k].icon+' '+goods[k].name).join(', ')+(view==='water'?', ○ Perla (rara)':'')],['Por recolección',(1+Number(g>=4))+(g>=8?'–'+(2+Number(g>=4)):'')+' unidades'],['Tu recolección',g],['Recolectado aquí',r.gathered]]));
      const b=button('Recolectar aquí',act(()=>{s.focus='gather';order(s,view);}));b.disabled=!open;out.actions.push(b);
      break;
    }
    case 'foe':{
      const f=z.foe,d=duel(s,f),r=record(s,view),fac=xpFactor(s,z),open=unlocked(s,view);
      out.title=f.name;
      const perTrip=Math.max(1,Math.floor((maxHP(s)*(1-policyRules[s.policy])+s.potions*potionHeal(s))/Math.max(1,d.taken)));
      out.nodes.push(facts([['Salud',f.hp],['Ataque',f.atk],['Defensa',f.def],['Tu golpe','≈ '+d.hd],['Su golpe','≈ '+d.fd],['Daño por pelea','≈ '+d.taken],['Peleas por viaje','~'+perTrip],['Botín',f.coins.join('–')+' mon. · '+goods[f.drop].name],['Experiencia',Math.max(1,Math.round(f.xp*fac))+(fac<1?' (reducida)':'')],['Victorias',r.kills]]));
      if(fac<1)out.nodes.push(element('p','Este enemigo ya es demasiado débil para ti: da poca experiencia. Avanza a la siguiente zona.','warn'));
      const b=button('Cazar aquí',act(()=>{s.focus='hunt';order(s,view);}));b.disabled=!open;out.actions.push(b);
      break;
    }
    case 'boss':{
      const f=z.boss,v=verdict(s,f),bs=s.bossState[view],open=unlocked(s,view);
      out.kicker=z.name+' · Jefe';out.title=f.name+' · '+f.title;
      out.nodes.push(facts([['Salud',f.hp],['Ataque',f.atk],['Defensa',f.def],['Tu golpe','≈ '+v.hd],['Su golpe','≈ '+v.fd],['Daño esperado','≈ '+v.taken],['Tu aguante',maxHP(s)+' + '+s.potions+' pociones'],['Pronóstico',v.label],['Recompensa',f.coins[0]+'+ mon. · '+f.xp+' XP · 6 '+goods[f.drop].name.toLowerCase()]]));
      const next=zones[z.tier+1];
      out.nodes.push(element('p',s.bosses[view]?'Ya lo derrotaste'+(s.bosses[view]>1?' '+s.bosses[view]+' veces':'')+'. Vuelve a despertar 5 minutos después de caer.':next?'Derrótalo para abrir '+next.name+' (Nv. '+next.level+').':'Es el jefe final: derrótalo para liberar el valle.',v.ratio<.8?'hint':'warn'));
      if(v.ratio>=.8)out.nodes.push(element('p','Consejo: mejora tu equipo en la herrería y la sastrería, y compra pociones antes del combate.','hint'));
      const b=button(!bs.alive?'Derrotado · vuelve pronto':s.challenge===view?'Desafío en curso':'Desafiar a '+f.name,act(()=>challenge(s,view)));
      b.disabled=!open||!bs.alive||s.challenge===view;out.actions.push(b);
      break;
    }
    case 'wild':
      out.nodes.push(facts([['Fauna',z.animals],['Peligro','Ninguno']]));
      break;
    case 'exit':
      out.actions.push(button('← Volver al atlas',leave),button('Ordenar regreso',act(()=>recall(s)),'subtle'));
      break;
  }
  if(sp.kind!=='exit')out.actions.push(button('← '+z.short,()=>pick(sp.id),'subtle'));
  return out;
}
function detail(){
  const key=[view,spot,s.level,s.coins,s.potions,JSON.stringify(s.gear),JSON.stringify(s.inventory),inTown(s),heroPlace(),s.state,s.task,s.focus,s.desired,s.auto,s.held,s.policy,s.challenge,
    JSON.stringify(s.bosses),s.bossState[view]?.alive,JSON.stringify(s.records?.[view]??''),!spot||spot==='inn'||spot==='boss'?Math.ceil(s.hp/5)+summary(s):''].join('|');
  if(key===detailKey)return;
  detailKey=key;
  const d=detailContent(),wrap=by('zone-detail');
  const nodes=[];
  if(d.kicker)nodes.push(element('p',d.kicker,'kicker'));
  nodes.push(element('h3',d.title));
  if(d.desc)nodes.push(element('p',d.desc,'desc'));
  nodes.push(...d.nodes);
  if(d.actions.length){const a=element('div','','actions');a.append(...d.actions);nodes.push(a);}
  const box=by('pane-place'),scroll=box.scrollTop;wrap.replaceChildren(...nodes);box.scrollTop=scroll;
}

/* ---------- modal ---------- */
function show(title,content,action,label){
  body.replaceChildren(element('h2',title),...content);
  const h=body.firstElementChild;h.id='modal-title';modal.setAttribute('aria-labelledby',h.id);
  body.append(button(label??(action?'Empezar':'Cerrar'),()=>{if(action)action();modal.close();sync();}));
  if(!modal.open)modal.showModal();
}
function showHelp(){
  const ul=element('ul');
  for(const rule of [
    'Cada zona tiene enemigos normales y un jefe. Derrota al jefe para abrir la siguiente zona (también hace falta el nivel indicado).',
    'Tu héroe lucha y recolecta solo. Verás cada golpe, el daño y la barra de vida de cada enemigo. Los enemigos caídos reaparecen poco después.',
    'Los jefes solo pelean si los desafías: toca la guarida del jefe y pulsa «Desafiar». El pronóstico te dice si estás listo.',
    'Vuelve a la villa para vender materiales, comprar pociones y forjar equipo. Cada pieza pide monedas y materiales de las zonas.',
    'Los enemigos demasiado débiles dan poca experiencia: para subir hay que avanzar.',
    'Navega con las pestañas, tocando el mapa o con las teclas 0–6. «Ver a mi héroe» te lleva a donde está.'
  ])ul.append(element('li',rule));
  show('Cómo jugar',[ul]);
}
function start(){sessionStarted=true;s.started=true;persist();sync();}
function introductory(){
  const p=peoples[s.people],c=classes[s.classIndex];
  show(migrated?'El valle ha cambiado':'Tu primer héroe',[
    element('p',s.name+' · '+p.name+' · '+c.name,'lead'),
    migrated?element('p','El juego tiene ahora jefes, equipo y combate real. Tu héroe empieza una nueva aventura desde el nivel 1.'):element('p',c.perk),
    element('p','Primer objetivo: caza lobos en la Pradera del Ciervo, compra tu primer equipo en la villa y derrota a Colmillo Viejo para abrir el Bosque del Roble.'),
    element('p','Toca la villa o cualquier zona del mapa para entrar y verla de cerca.')
  ],start);
}
function victory(){
  s.wonShown=true;persist();
  show('¡Has liberado el Valle de Bruma!',[element('p','El Corazón de la Bruma se ha roto y la niebla se disipa sobre la villa. Los aldeanos celebran a '+s.name+'.'),element('p','Los jefes seguirán despertando. Puedes seguir jugando para conseguir botín y trofeos.')],null,'Seguir jugando');
}

/* ---------- HUD ---------- */
function profile(){
  const p=peoples[s.people],c=classes[s.classIndex],a=attributes(s),max=maxHP(s);
  by('hero-name').textContent=s.name;by('hero-role').textContent=p.name+' · '+c.name+(affinity(s)?' · Afinidad':'');
  by('level').textContent=s.level+(s.level>=MAX_LEVEL?' (máx.)':'');
  by('hp-value').textContent=Math.ceil(s.hp)+' / '+max;
  by('hp-bar').style.width=100*s.hp/max+'%';
  by('hp-bar').classList.toggle('low',s.hp<max*.35);
  by('xp-value').textContent=s.level>=MAX_LEVEL?'—':s.xp+' / '+needed(s.level);
  by('xp-bar').style.width=(s.level>=MAX_LEVEL?100:100*s.xp/needed(s.level))+'%';
  const vals=[a.attack,a.armor,a.gather,Math.round(a.crit*100)+'%'];
  for(const [i,num] of vals.entries())by('stats').children[i].lastElementChild.textContent=num;
  by('gold').textContent='● '+s.coins;
  by('potions').textContent='⚱ '+s.potions+'/'+MAX_POTIONS;
}
function equipment(){
  const key=JSON.stringify(s.gear)+s.classIndex;
  if(key!==equipKey){
    equipKey=key;
    by('equipment').replaceChildren(...Object.entries(slots).map(([slot,def])=>{
      const it=item(s,slot,s.gear[slot]||0),cell=element('button','','equip t'+it.tier);cell.type='button';
      cell.title=it.tier?it.name+' · '+statText(it.stats):def.name+': sin equipar';
      cell.append(element('span',def.icon,'slot-icon'),element('span',it.tier?it.name:def.name,'equip-name'),element('small',it.tier?'Rango '+it.tier:'—'));
      cell.onclick=()=>go('villa',def.shop);
      return cell;
    }));
  }
  const content=Object.entries(s.inventory),ik=JSON.stringify(content);
  if(ik!==inventoryKey){
    inventoryKey=ik;
    const nodes=content.map(([id,num])=>{const it=element('span',goods[id].icon+' '+goods[id].name+' ','chip');it.append(element('b',String(num)));return it;});
    by('inventory').replaceChildren(...(nodes.length?nodes:[element('small','La mochila está vacía.','muted')]));
  }
}
function sync(){
  const {day,clock}=timeAt(s);
  by('day').textContent='Día '+day;by('daytime').textContent=clock;
  const running=sessionStarted&&s.speed>0&&!modal.open;
  by('live').textContent=running?'Mundo en marcha':'Mundo en pausa';
  by('live').classList.toggle('paused',!running);
  for(const [id,value] of [['pause',0],['normal',1],['fast',3]])by(id).setAttribute('aria-pressed',String(s.speed===value));
  const status=summary(s);
  if(by('current').textContent!==status)by('current').textContent=status;
  if(view==='atlas'){
    by('atlas-title').textContent='Atlas del valle';
    by('atlas-sub').textContent='Toca un lugar para entrar · '+(s.held?'Orden: quedarse en la villa':s.challenge?'Orden: desafiar a '+byId[s.challenge].boss.name:s.auto?'Ruta automática':'Destino: '+byId[s.desired].name);
  }else{
    by('atlas-title').textContent=byId[view].name;
    by('atlas-sub').textContent=unlocked(s,view)?'Toca los lugares señalados para verlos de cerca.':'🔒 '+lockReason(s,view);
  }
  for(const key of ['focus','policy'])if(by(key).value!==s[key])by(key).value=s[key];
  tabsIfChanged();profile();equipment();detail();
  if(logRef!==s.logs[0]){
    logRef=s.logs[0];
    by('feed').replaceChildren(...s.logs.slice(0,3).map(({text})=>element('li',text)));
    by('log').replaceChildren(...s.logs.map(({day,clock,text})=>{
      const row=document.createElement('li');row.append(element('time','Día '+day+' · '+clock),document.createTextNode(text));return row;
    }));
  }
  if(s.won&&!s.wonShown&&!modal.open)victory();
}
function paint(now){
  if(view==='atlas')draw(stage,s,S,hover);
  else drawScene(stage,view,s,S,now/1000,hover,spot,!unlocked(s,view));
}
function loop(now){
  const delta=Math.min((now-previous)/1000,.25);
  previous=now;
  if(sessionStarted&&!modal.open&&!document.hidden&&s.speed){
    let remaining=delta*s.speed;
    while(remaining>0){const slice=Math.min(remaining,.05);step(s,slice);remaining-=slice;}
  }
  if(now-paintAt>=16){paint(now);paintAt=now;}
  if(now-hudAt>=150){sync();hudAt=now;}
  if(now-saveAt>=2500&&sessionStarted){persist();saveAt=now;}
  requestAnimationFrame(loop);
}

/* ---------- eventos ---------- */
for(const title of ['Ataque','Defensa','Recolección','Crítico']){
  const stat=element('div','','stat');stat.append(element('span',title),element('b',''));by('stats').append(stat);
}
for(const [id,value] of [['pause',0],['normal',1],['fast',3]])by(id).onclick=act(()=>{s.speed=value;});
for(const key of ['focus','policy']){
  by(key).value=s[key];by(key).onchange=e=>{s[key]=e.target.value;persist();detailKey='';sync();};
}
by('auto').onclick=act(()=>automatic(s));
by('recall').onclick=act(()=>recall(s));
by('help').onclick=showHelp;
by('back').onclick=leave;
for(const b of document.querySelectorAll('.side-tabs button'))b.onclick=()=>pane(b.dataset.pane);
by('find').onclick=()=>go(heroPlace());
canvas.addEventListener('click',e=>{
  const [x,y]=toLocal(e);
  if(view==='atlas'){
    const z=zones.reduce((best,z)=>{const d=Math.hypot(z.x-x,z.y-y);return d<best[1]?[z,d]:best;},[null,80])[0];
    if(z)enter(z.id);
  }else{const id=spotAt(view,x,y);if(id)pick(id);}
});
canvas.addEventListener('mousemove',e=>{
  const [x,y]=toLocal(e);
  if(view==='atlas')hover=zones.find(z=>Math.hypot(z.x-x,z.y-y)<80)?.id??null;
  else hover=spotAt(view,x,y);
  canvas.style.cursor=hover?'pointer':'default';
});
canvas.addEventListener('mouseleave',()=>{hover=null;});
addEventListener('keydown',e=>{
  if(modal.open||e.target.closest?.('select,input,textarea'))return;
  if(e.key==='Escape'&&view!=='atlas'){if(spot)pick(spot);else leave();}
  const n=Number(e.key);
  if(e.key.length===1&&n>=0&&n<places.length)go(places[n]);
});
addEventListener('resize',resize);
try{new ResizeObserver(resize).observe(canvas);}catch{}
modal.addEventListener('cancel',e=>{if(!sessionStarted)e.preventDefault();});
addEventListener('pagehide',()=>{if(sessionStarted)persist();});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden&&sessionStarted)persist();
  previous=performance.now();
});
resize();
portrait(by('portrait').getContext('2d'),s);
const [hashView,hashSpot]=decodeURIComponent(location.hash.slice(1)).split('/');
if(byId[hashView])go(hashView,scenes[hashView].spots.some(x=>x.id===hashSpot)?hashSpot:null);else go('atlas');
paint(performance.now());
if(!sessionStarted){persist();introductory();}
requestAnimationFrame(loop);
