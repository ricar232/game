export const WIDTH=1000, HEIGHT=620, MAX_LEVEL=25;
export const peoples=[
  {name:'Humano',affinity:'Paladín',skin:'#edba88',names:['Aldren','Mara','Lucan']},
  {name:'Elfo',affinity:'Mago',skin:'#e5c5aa',names:['Ilyen','Aelira','Thalion']},
  {name:'Ogro',affinity:'Guerrero',skin:'#b1a76b',names:['Grum','Brakka','Mordak']},
  {name:'Enano',affinity:'Caballero',skin:'#d89c6c',names:['Borin','Brynja','Keld']},
  {name:'Trol',affinity:'Cazador',skin:'#8fa88b',names:['Varko','Syla','Zarak']}
];
export const classes=[
  {name:'Mago',icon:'✦',color:'#ab88cd',attack:9,armor:1,gather:1,hp:0,range:120,rate:1.25,crit:0,family:'staff',perk:'Lanza orbes de energía a distancia: golpea antes de que el enemigo llegue.'},
  {name:'Cazador',icon:'➶',color:'#80ac73',attack:7,armor:2,gather:3,hp:0,range:140,rate:1.15,crit:.06,family:'bow',perk:'Dispara flechas a distancia, acierta más críticos y recolecta más.'},
  {name:'Caballero',icon:'⛨',color:'#8dabb8',attack:7,armor:5,gather:1,hp:15,range:34,rate:1.1,crit:0,family:'sword',perk:'Su armadura pesada reduce mucho el daño recibido.'},
  {name:'No muerto',icon:'◉',color:'#a18dbb',attack:7,armor:2,gather:2,hp:0,range:34,rate:1.1,crit:0,family:'scythe',perk:'Absorbe el 10% de su salud con cada enemigo derrotado.'},
  {name:'Paladín',icon:'✧',color:'#e8bd69',attack:7,armor:3,gather:1,hp:10,range:34,rate:1.2,crit:0,family:'hammer',perk:'Descansa más rápido y sus pociones curan más.'},
  {name:'Guerrero',icon:'⚔',color:'#c07c5b',attack:8,armor:3,gather:1,hp:0,range:34,rate:1.0,crit:0,family:'axe',perk:'Golpea un 30% más fuerte cuando tiene poca salud.'}
];
export const goods={
  berries:{name:'Frutas',icon:'●',price:2,tier:1},herb:{name:'Hierbas',icon:'✿',price:3,tier:1},hide:{name:'Cuero',icon:'◆',price:5,tier:1},
  wood:{name:'Madera',icon:'▰',price:4,tier:2},silk:{name:'Seda de araña',icon:'∿',price:9,tier:2},
  fish:{name:'Pescado',icon:'≈',price:6,tier:3},scale:{name:'Escama',icon:'◇',price:14,tier:3},pearl:{name:'Perla',icon:'○',price:30,tier:3},
  stone:{name:'Piedra',icon:'▲',price:6,tier:4},iron:{name:'Hierro',icon:'◈',price:18,tier:4},
  crystal:{name:'Cuarzo',icon:'◊',price:38,tier:5},gem:{name:'Gema de bruma',icon:'✦',price:45,tier:5}
};
export const zones=[
  {id:'villa',name:'Villa del Fresno',short:'Villa',icon:'⌂',level:0,tier:0,x:476,y:331,label:[480,267],
    description:'Posada, mercado, herrería y sastrería. Aquí tu héroe descansa, comercia y se equipa.'},
  {id:'meadow',name:'Pradera del Ciervo',short:'Pradera',icon:'✿',level:1,tier:1,x:241,y:457,label:[238,510],resources:['berries','herb'],animals:'Ciervos y conejos',
    foe:{name:'Lobo gris',hp:36,atk:8,def:2,rate:1.6,xp:8,coins:[2,5],drop:'hide'},
    boss:{name:'Colmillo Viejo',title:'Lobo alfa',hp:247,atk:14,def:5,rate:1.8,xp:120,coins:[56,72],drop:'hide'},
    layout:{entry:[930,372],gather:[360,352],foes:[[340,555],[490,520],[620,585]],boss:[200,540]},
    description:'Frutales, hierbas y lobos grises. Colmillo Viejo, el lobo alfa, vigila desde su guarida.'},
  {id:'forest',name:'Bosque del Roble',short:'Bosque',icon:'♠',level:5,tier:2,x:228,y:202,label:[227,146],resources:['wood','berries'],animals:'Jabalíes',
    foe:{name:'Araña del roble',hp:74,atk:15,def:5,rate:1.5,xp:18,coins:[5,8],drop:'silk'},
    boss:{name:'Reina Tejedora',title:'Araña madre',hp:546,atk:25,def:9,rate:1.8,xp:420,coins:[128,160],drop:'silk'},
    layout:{entry:[940,442],gather:[380,442],foes:[[600,330],[720,400],[520,250]],boss:[800,240]},
    description:'Robles centenarios, madera y arañas. La Reina Tejedora anida entre los árboles más oscuros.'},
  {id:'water',name:'Lago Espejo',short:'Lago',icon:'≈',level:10,tier:3,x:612,y:466,label:[680,524],resources:['fish','wood'],animals:'Peces y patos',
    foe:{name:'Sapo de niebla',hp:138,atk:24,def:9,rate:1.7,xp:34,coins:[8,13],drop:'scale'},
    boss:{name:'Rey del Lago',title:'Sapo gigante',hp:1014,atk:37,def:14,rate:2,xp:950,coins:[256,304],drop:'scale'},
    layout:{entry:[120,112],gather:[485,472],foes:[[760,525],[880,482],[620,540]],boss:[930,380]},
    description:'Pesca, madera de ribera y perlas. El Rey del Lago surge cuando cae la niebla.'},
  {id:'quarry',name:'Cantera de Hierro',short:'Cantera',icon:'▲',level:15,tier:4,x:782,y:318,label:[804,355],resources:['stone','iron'],animals:'Cabras montesas',
    foe:{name:'Gólem de hierro',hp:252,atk:37,def:16,rate:2,xp:62,coins:[14,21],drop:'iron'},
    boss:{name:'Gólem Ancestral',title:'Guardián de las vetas',hp:1820,atk:54,def:24,rate:2.2,xp:1900,coins:[480,560],drop:'iron'},
    layout:{entry:[60,502],gather:[260,422],foes:[[600,560],[880,560],[560,330]],boss:[740,462]},
    description:'Piedra y hierro en las laderas. El Gólem Ancestral duerme en el círculo de runas.'},
  {id:'ridge',name:'Pico de la Bruma',short:'Pico',icon:'✦',level:20,tier:5,x:758,y:152,label:[791,101],resources:['gem','iron'],animals:'Cuervos',
    foe:{name:'Guardián de cuarzo',hp:396,atk:53,def:24,rate:2,xp:100,coins:[22,32],drop:'crystal'},
    boss:{name:'Corazón de la Bruma',title:'Origen de la niebla',hp:3200,atk:68,def:32,rate:2.3,xp:4000,coins:[1200,1200],drop:'gem'},
    layout:{entry:[60,562],gather:[300,472],foes:[[560,535],[880,500],[600,380]],boss:[740,432]},
    description:'Gemas y cuarzo en la cumbre. El Corazón de la Bruma es el origen de la niebla del valle.'}
];
export const byId=Object.fromEntries(zones.map(z=>[z.id,z]));
const roads={
  meadow:[[421,361],[367,401],[310,448]],
  forest:[[421,310],[371,276],[312,237],[270,205]],
  water:[[524,359],[553,402],[579,443]],
  quarry:[[528,314],[562,284],[618,278],[672,281],[724,302]],
  ridge:[[528,314],[562,284],[618,278],[665,242],[690,200],[720,169]]
};
export const routes=Object.fromEntries(Object.entries(roads).map(([id,points])=>[id,[
  [byId.villa.x,byId.villa.y],...points,[byId[id].x,byId[id].y]
]]));

/* ---------- equipo ---------- */
const weaponNames={
  staff:['Vara de fresno','Bastón de roble','Cetro de niebla','Báculo de hierro','Báculo de bruma'],
  bow:['Arco corto','Arco de roble','Arco de seda','Arco largo de hierro','Arco de cuarzo'],
  sword:['Espada corta','Espada de roble templado','Espada de escamas','Espada de hierro','Espada de bruma'],
  scythe:['Hoz oxidada','Guadaña de roble','Guadaña de niebla','Guadaña de hierro','Segadora de bruma'],
  hammer:['Maza de madera','Martillo de roble','Martillo bendito','Martillo de hierro','Martillo de bruma'],
  axe:['Hacha de mano','Hacha de leñador','Hacha de escamas','Gran hacha de hierro','Hacha de cuarzo']
};
export const slots={
  weapon:{name:'Arma',icon:'⚔',shop:'forge',stats:{atk:[5,11,19,29,42]},cost:[65,210,560,1330,2120],
    mats:[{hide:4},{wood:6,silk:3},{scale:5,wood:4},{iron:6,stone:5},{crystal:5,gem:3}]},
  armor:{name:'Armadura',icon:'⛨',shop:'forge',names:['Jubón de cuero','Armadura de seda tejida','Cota de escamas','Coraza de hierro','Armadura de cuarzo'],
    stats:{def:[3,7,12,18,26],hp:[10,25,45,70,100]},cost:[55,180,505,1190,1920],
    mats:[{hide:5},{silk:4,hide:3},{scale:6},{iron:8},{crystal:5,iron:4}]},
  helm:{name:'Yelmo',icon:'⛑',shop:'forge',names:['Capucha de cuero','Casco de roble','Yelmo de escamas','Yelmo de hierro','Corona de cuarzo'],
    stats:{def:[1,3,5,8,12],hp:[5,12,22,35,50]},cost:[35,110,310,730,1210],
    mats:[{hide:2},{wood:3,silk:2},{scale:3},{iron:4},{crystal:3,gem:1}]},
  cloak:{name:'Capa',icon:'❖',shop:'tailor',names:['Capa de lana','Capa de seda','Capa del lago','Manto de cantero','Manto de bruma'],
    stats:{hp:[15,35,60,95,140],def:[0,1,2,3,5]},cost:[40,135,365,870,1410],
    mats:[{hide:3},{silk:4},{scale:2,silk:3},{hide:6,iron:2},{crystal:3,silk:4}]},
  boots:{name:'Botas',icon:'⌁',shop:'tailor',names:['Botas de cuero','Botas de seda','Botas de escamas','Botas herradas','Botas de cuarzo'],
    stats:{def:[1,2,4,6,9],speed:[.1,.2,.3,.4,.5]},cost:[35,110,310,730,1210],
    mats:[{hide:2},{silk:3},{scale:3},{iron:3,hide:3},{crystal:3}]},
  charm:{name:'Amuleto',icon:'◎',shop:'market',names:['Amuleto de hierbas','Talismán de seda','Perla del lago','Sello de hierro','Gema de la bruma'],
    stats:{gather:[1,2,3,4,6],crit:[.03,.05,.07,.09,.12]},cost:[50,155,420,980,1610],
    mats:[{herb:4},{silk:2,herb:3},{pearl:1,herb:4},{iron:3},{gem:2}]}
};
export const statNames={atk:'ataque',def:'defensa',hp:'salud',speed:'velocidad',gather:'recolección',crit:'crítico'};
export function item(s,slot,tier){
  if(!tier)return {slot,tier:0,name:'Nada',stats:{},cost:0,mats:{}};
  const def=slots[slot],names=def.names??weaponNames[classes[s.classIndex].family];
  const stats=Object.fromEntries(Object.entries(def.stats).map(([k,v])=>[k,v[tier-1]]));
  return {slot,tier,name:names[tier-1],stats,cost:def.cost[tier-1],mats:def.mats[tier-1]};
}
export function gearStats(s){
  const out={atk:0,def:0,hp:0,speed:0,gather:0,crit:0};
  for(const slot of Object.keys(slots))for(const [k,v] of Object.entries(item(s,slot,s.gear[slot]||0).stats))out[k]+=v;
  return out;
}

/* ---------- atributos ---------- */
const rules={cautious:.50,standard:.35,bold:.20};
export const policyRules=rules;
const pick=(items,rng)=>items[Math.floor(rng()*items.length)];
const choice=(items,rng)=>Math.floor(rng()*items.length);
const between=([a,b],rng)=>a+Math.floor(rng()*(b-a+1));
export const needed=level=>Math.round(30*level**1.7);
export function xpFactor(s,z){
  const next=zones[z.tier+1],cap=(next?next.level:MAX_LEVEL)+2,over=s.level-cap;
  return over<=0?1:Math.max(.05,1-over*.3);
}
export const affinity=s=>peoples[s.people].affinity===classes[s.classIndex].name;
export function attributes(s){
  const c=classes[s.classIndex],b=Number(affinity(s)),g=gearStats(s),L=s.level;
  return {attack:Math.round(c.attack+b+L*1.2+g.atk),armor:Math.round(c.armor+b+L*.6+g.def),gather:c.gather+b+Math.floor(L/6)+g.gather,
    crit:.05+c.crit+g.crit,speed:1+g.speed};
}
export const maxHP=s=>Math.round(60+s.level*8+classes[s.classIndex].hp+gearStats(s).hp);
export const potionCost=s=>12+s.level*3;
export const potionHeal=s=>Math.round(maxHP(s)*(classes[s.classIndex].name==='Paladín'?.55:.4));
export const MAX_POTIONS=6;
const hit=(a,d,rng)=>Math.max(1,Math.round(a*a/(a+d)*(.85+rng()*.3)));
export function duel(s,f){
  const c=classes[s.classIndex],a=attributes(s);
  const hd=a.attack*a.attack/(a.attack+f.def)*(1+a.crit*.7);
  const hits=Math.ceil(f.hp/hd),time=hits*c.rate,free=c.range>60?1.4:0;
  const fd=f.atk*f.atk/(f.atk+a.armor);
  return {hd:Math.round(hd),fd:Math.round(fd),time,taken:Math.round(Math.max(0,time-free)/f.rate*fd)};
}
export function verdict(s,f){
  const d=duel(s,f),pool=s.hp+Math.min(s.potions,MAX_POTIONS)*potionHeal(s),fresh=maxHP(s)+s.potions*potionHeal(s);
  const ratio=d.taken/Math.max(1,fresh);
  return {...d,ratio,label:ratio<.5?'Favorable':ratio<.8?'Igualado':ratio<1?'Arriesgado':'Muy difícil',pool};
}
export function unlocked(s,id){
  const z=byId[id];if(!z)return false;if(!z.tier)return true;
  if(s.level<z.level)return false;
  return z.tier===1||Boolean(s.bosses[zones[z.tier-1].id]);
}
export function lockReason(s,id){
  const z=byId[id];if(unlocked(s,id))return '';
  const prev=zones[z.tier-1];
  if(z.tier>1&&!s.bosses[prev.id])return 'Derrota a '+prev.boss.name+' ('+prev.short+')';
  return 'Requiere nivel '+z.level;
}
export const topTier=s=>Math.max(1,...zones.filter(z=>z.tier&&unlocked(s,z.id)).map(z=>z.tier));
export const inTown=s=>s.zone==='villa'&&s.state!=='travel';
export function record(s,zone){
  s.records??={};
  return s.records[zone]??={kills:0,gathered:0,falls:0};
}

/* ---------- estado ---------- */
function freshFoes(z){return z.layout.foes.map(([x,y])=>({hp:z.foe.hp,alive:true,deadAt:-99,x,y,hitAt:-99,atkAt:-99,cd:0,engaged:false}));}
function freshBoss(z){const [x,y]=z.layout.boss;return {hp:z.boss.hp,alive:true,deadAt:-999,x,y,hitAt:-99,atkAt:-99,cd:0,engaged:false};}
export function create(rng=Math.random,identity=null){
  const people=identity?.people??choice(peoples,rng),classIndex=identity?.classIndex??choice(classes,rng);
  const s={version:2,people,classIndex,name:identity?.name??pick(peoples[people].names,rng),level:1,xp:0,coins:25,potions:2,
    gear:{weapon:0,armor:0,helm:0,cloak:0,boots:0,charm:0},inventory:{},records:{},bosses:{},foes:{},bossState:{},
    elapsed:0,zone:'villa',desired:'meadow',auto:true,held:false,challenge:null,focus:'balanced',policy:'standard',
    x:byId.villa.x,y:byId.villa.y,lx:0,ly:0,face:1,state:'rest',task:null,target:null,timer:0,path:[],turn:0,cd:0,
    swingAt:-99,hurtAt:-99,potionAt:-99,levelAt:-99,logs:[],speed:1,won:false};
  normalize(s);
  s.hp=maxHP(s);
  log(s,s.name+' llega a la Villa del Fresno.');
  if(affinity(s))log(s,'Afinidad natural: +1 a ataque, defensa y recolección.');
  return s;
}
export function normalize(s){
  for(const z of zones.slice(1)){
    if(!Array.isArray(s.foes[z.id])||s.foes[z.id].length!==z.layout.foes.length)s.foes[z.id]=freshFoes(z);
    if(!s.bossState[z.id])s.bossState[z.id]=freshBoss(z);
  }
  for(const k of Object.keys(slots))s.gear[k]??=0;
  return s;
}
export function timeAt(s){
  const minutes=Math.floor(360+s.elapsed*3);
  const day=1+Math.floor(minutes/1440);
  const clock=[Math.floor((minutes%1440)/60),minutes%60].map(n=>String(n).padStart(2,'0')).join(':');
  return {day,clock};
}
export const fx=[];
function effect(s,kind,x,y,text){
  fx.push({kind,zone:s.zone,x,y,text,at:s.elapsed});
  if(fx.length>80)fx.splice(0,fx.length-80);
}
function log(s,text){
  const {day,clock}=timeAt(s);
  s.logs.unshift({day,clock,text});
  s.logs.length=Math.min(14,s.logs.length);
}
function gainXP(s,value){
  if(s.level>=MAX_LEVEL)return;
  s.xp+=value;
  while(s.level<MAX_LEVEL&&s.xp>=needed(s.level)){
    s.xp-=needed(s.level);s.level++;s.levelAt=s.elapsed;
    s.hp=Math.min(maxHP(s),s.hp+maxHP(s)*.3);
    log(s,'¡Nivel '+s.level+' alcanzado!');
    effect(s,'level',s.lx,s.ly-70,'¡Nivel '+s.level+'!');
    for(const z of zones)if(z.level===s.level&&unlocked(s,z.id))log(s,'Zona desbloqueada: '+z.name+'.');
  }
  if(s.level>=MAX_LEVEL)s.xp=0;
}

/* ---------- viaje ---------- */
function getRoute(from,to){
  if(from===to)return [];
  if(from==='villa')return routes[to].slice(1);
  if(to==='villa')return routes[from].slice(0,-1).reverse();
  return [...getRoute(from,'villa'),...getRoute('villa',to)];
}
function travel(s,to){
  if(s.zone===to)return;
  disengage(s);
  s.path=getRoute(s.zone,to);s.target=to;s.state='travel';s.task=null;
}
function choose(s){
  if(s.held)return 'villa';
  if(!s.auto)return unlocked(s,s.desired)?s.desired:'villa';
  return zones.slice(1).filter(z=>unlocked(s,z.id)&&duel(s,z.foe).taken<maxHP(s)*.3).at(-1)?.id??'meadow';
}
export function destination(s){return choose(s);}

/* ---------- órdenes ---------- */
export function order(s,zone){
  if(!unlocked(s,zone))return false;
  if(zone==='villa'){recall(s);return true;}
  s.held=false;s.auto=false;s.desired=zone;
  if(s.challenge&&s.challenge!==zone)s.challenge=null;
  log(s,'Nueva orden: viajar a '+byId[zone].name+'.');
  return true;
}
export function challenge(s,zone){
  const b=s.bossState[zone];
  if(!unlocked(s,zone)||!b?.alive)return false;
  s.held=false;s.auto=false;s.desired=zone;s.challenge=zone;
  log(s,'Orden: desafiar a '+byId[zone].boss.name+'.');
  return true;
}
export function automatic(s){
  s.auto=true;s.held=false;s.challenge=null;log(s,'Ruta automática: la zona más alta en la que puede luchar con seguridad.');
}
export function recall(s){
  s.held=true;s.challenge=null;log(s,'Orden de regreso a la villa.');
}

/* ---------- comercio ---------- */
export const buyPrice=key=>goods[key].price*2;
export function sellGood(s,key,n=Infinity){
  const have=s.inventory[key]||0,k=Math.min(have,n);
  if(!inTown(s)||!k||!goods[key])return 0;
  const price=goods[key].price*k;
  s.inventory[key]=have-k;if(!s.inventory[key])delete s.inventory[key];
  s.coins+=price;log(s,'Vendió '+k+' · '+goods[key].name+' por '+price+' monedas.');
  return price;
}
export function sellAll(s){
  if(!inTown(s))return 0;
  const price=Object.entries(s.inventory).reduce((sum,[k,v])=>sum+(goods[k]?.price||0)*v,0);
  if(!price)return 0;
  s.inventory={};s.coins+=price;log(s,'Vendió todos los materiales por '+price+' monedas.');
  return price;
}
export function buyGood(s,key,n=1){
  const g=goods[key];
  if(!inTown(s)||!g||g.tier>topTier(s)||s.coins<buyPrice(key)*n)return false;
  s.coins-=buyPrice(key)*n;s.inventory[key]=(s.inventory[key]||0)+n;
  log(s,'Compró '+n+' · '+g.name+'.');
  return true;
}
export function buyPotion(s,n=1){
  if(!inTown(s)||s.potions+n>MAX_POTIONS||s.coins<potionCost(s)*n)return false;
  s.coins-=potionCost(s)*n;s.potions+=n;log(s,'Compró '+n+(n>1?' pociones':' poción')+' de salud.');
  return true;
}
export function missing(s,mats){
  return Object.entries(mats).filter(([k,v])=>(s.inventory[k]||0)<v).map(([k,v])=>[k,v-(s.inventory[k]||0)]);
}
export function canBuyItem(s,slot,tier){
  const it=item(s,slot,tier);
  if(tier<=(s.gear[slot]||0))return {ok:false,reason:'Ya lo tienes'};
  if(tier>topTier(s))return {ok:false,reason:'Se desbloquea en '+zones[tier].short};
  if(!inTown(s))return {ok:false,reason:'Vuelve a la villa'};
  if(s.coins<it.cost)return {ok:false,reason:'Faltan '+(it.cost-s.coins)+' monedas'};
  const miss=missing(s,it.mats);
  if(miss.length)return {ok:false,reason:'Faltan '+miss.map(([k,v])=>v+' '+goods[k].name.toLowerCase()).join(', ')};
  return {ok:true,reason:''};
}
export function buyItem(s,slot,tier){
  if(!canBuyItem(s,slot,tier).ok)return false;
  const it=item(s,slot,tier),before=maxHP(s);
  s.coins-=it.cost;
  for(const [k,v] of Object.entries(it.mats)){s.inventory[k]-=v;if(!s.inventory[k])delete s.inventory[k];}
  s.gear[slot]=tier;
  s.hp=Math.min(maxHP(s),s.hp+(maxHP(s)-before));
  log(s,'Nuevo equipo: '+it.name+'.');
  return true;
}

/* ---------- combate ---------- */
function targetOf(s){
  if(s.target==='boss')return s.bossState[s.zone];
  return s.foes[s.zone]?.[s.target];
}
function statsOf(s){const z=byId[s.zone];return s.target==='boss'?z.boss:z.foe;}
function disengage(s){
  if(!byId[s.zone]?.tier)return;
  for(const f of s.foes[s.zone])f.engaged=false;
  const b=s.bossState[s.zone];
  if(b.engaged){b.engaged=false;if(b.alive)b.hp=byId[s.zone].boss.hp;}
  s.task=null;s.target=null;
}
function engage(s,f){f.engaged=true;f.cd=statsOf(s).rate*.8;s.cd=.35;}
function walk(s,[x,y],dt){
  const dx=x-s.lx,dy=y-s.ly,d=Math.hypot(dx,dy),pace=78*attributes(s).speed*dt;
  if(d<=pace){s.lx=x;s.ly=y;return true;}
  s.lx+=dx*pace/d;s.ly+=dy*pace/d;if(Math.abs(dx)>2)s.face=Math.sign(dx);
  return false;
}
function drink(s){
  const heal=potionHeal(s);
  s.potions--;s.potionAt=s.elapsed;s.hp=Math.min(maxHP(s),s.hp+heal);
  effect(s,'heal',s.lx,s.ly-60,'+'+heal);
}
function kill(s,f,boss,rng){
  const z=byId[s.zone],st=boss?z.boss:z.foe;
  f.alive=false;f.hp=0;f.deadAt=s.elapsed;f.engaged=false;
  const coins=between(st.coins,rng);s.coins+=coins;
  const drops={};
  const add=(k,n)=>{drops[k]=(drops[k]||0)+n;s.inventory[k]=(s.inventory[k]||0)+n;};
  if(boss){add(st.drop,6);add(pick(z.resources,rng),4);if(z.id==='water')add('pearl',2);}
  else{if(rng()<.65)add(st.drop,1);if(rng()<.2)add(st.drop,1);}
  if(classes[s.classIndex].name==='No muerto')s.hp=Math.min(maxHP(s),s.hp+maxHP(s)*.1);
  record(s,z.id).kills++;
  const loot=Object.entries(drops).map(([k,n])=>'+'+n+' '+goods[k].icon).join(' ');
  effect(s,'loot',f.x,f.y-40,'+'+Math.max(1,Math.round(st.xp*(boss?1:xpFactor(s,z))))+' XP  +'+coins+' mon. '+loot);
  if(boss){
    const first=!s.bosses[z.id];
    s.bosses[z.id]=(s.bosses[z.id]||0)+1;s.challenge=null;
    log(s,'¡'+st.name+' ha caído! +'+coins+' monedas.');
    if(first){
      const next=zones[z.tier+1];
      if(next)log(s,next.name+(s.level>=next.level?' ya está abierta.':' se abrirá al nivel '+next.level+'.'));
      if(z.id==='ridge'){s.won=true;s.wonAt=s.elapsed;log(s,'¡La bruma se disipa! Has liberado el valle.');}
    }
  }else log(s,'Derrotó a '+st.name.toLowerCase()+' · +'+coins+' monedas'+(Object.keys(drops).length?' · '+Object.entries(drops).map(([k,n])=>n+' '+goods[k].name.toLowerCase()).join(', '):'')+'.');
  gainXP(s,Math.max(1,Math.round(st.xp*(boss?1:xpFactor(s,z)))));
  s.task=null;s.target=null;
}
function fall(s,rng){
  const z=byId[s.zone],lost=Math.floor(s.coins*.1);
  s.hp=0;s.coins-=lost;record(s,z.id).falls++;s.challenge=null;
  const who=s.target==='boss'?z.boss.name:z.foe.name;
  log(s,who+' derribó a '+s.name+'. Lo llevan a la villa.'+(lost?' Perdió '+lost+' monedas.':''));
  effect(s,'fall',s.lx,s.ly-60,'¡Derribado!');
  disengage(s);travel(s,'villa');
}
function fightTick(s,f,dt,rng){
  const c=classes[s.classIndex],a=attributes(s),st=statsOf(s),boss=s.target==='boss';
  let d=Math.hypot(f.x-s.lx,f.y-s.ly);
  const reach=boss?72:44;
  if(d>reach){const sp=(boss?40:58)*dt,m=Math.min(sp,d-reach);f.x+=(s.lx-f.x)/d*m;f.y+=(s.ly-f.y)/d*m;}
  d=Math.hypot(f.x-s.lx,f.y-s.ly);
  const range=Math.max(c.range,reach-2);
  if(d>range){const m=Math.min(78*a.speed*dt,d-range);s.lx+=(f.x-s.lx)/d*m;s.ly+=(f.y-s.ly)/d*m;d=Math.hypot(f.x-s.lx,f.y-s.ly);}
  s.face=f.x>=s.lx?1:-1;
  if(d<=range+1){
    s.cd-=dt;
    if(s.cd<=0){
      s.cd=c.rate;s.swingAt=s.elapsed;
      const boost=c.name==='Guerrero'&&s.hp<maxHP(s)*.5?1.3:1;
      const crit=rng()<a.crit;
      let dmg=hit(a.attack*boost,st.def,rng);if(crit)dmg=Math.round(dmg*1.7);
      f.hp-=dmg;f.hitAt=s.elapsed;
      effect(s,crit?'crit':'dmg',f.x,f.y-(boss?90:50),(crit?'¡':'')+dmg+(crit?'!':''));
      if(f.hp<=0){kill(s,f,boss,rng);return;}
    }
  }
  if(d<=reach+4){
    f.cd-=dt;
    if(f.cd<=0){
      f.cd=st.rate;f.atkAt=s.elapsed;
      const dmg=hit(st.atk,a.armor,rng);
      s.hp=Math.max(0,s.hp-dmg);s.hurtAt=s.elapsed;
      effect(s,'hurt',s.lx,s.ly-62,'-'+dmg);
      if(s.hp<=0)fall(s,rng);
    }
  }
}
function gatherOnce(s,z,rng){
  let key=pick(z.resources,rng);
  if(z.id==='water'&&rng()<.12)key='pearl';
  const g=attributes(s).gather,amount=1+Number(g>=4)+Number(g>=8&&rng()<.5);
  s.inventory[key]=(s.inventory[key]||0)+amount;record(s,z.id).gathered+=amount;gainXP(s,Math.max(1,Math.round((2+z.tier*2)*xpFactor(s,z))));
  effect(s,'gather',s.lx,s.ly-50,'+'+amount+' '+goods[key].icon+' '+goods[key].name);
}
function worldTick(s,dt){
  for(const z of zones.slice(1)){
    const here=s.zone===z.id&&s.state==='field';
    for(const [i,f] of s.foes[z.id].entries()){
      if(!f.alive){if(s.elapsed-f.deadAt>16){Object.assign(f,{alive:true,hp:z.foe.hp,x:z.layout.foes[i][0],y:z.layout.foes[i][1],engaged:false});if(here)effect(s,'spawn',f.x,f.y-30,'');}continue;}
      if(!f.engaged){
        f.hp=Math.min(z.foe.hp,f.hp+z.foe.hp*.12*dt);
        const [hx,hy]=z.layout.foes[i],dx=hx-f.x,dy=hy-f.y,d=Math.hypot(dx,dy);
        if(d>1){const m=Math.min(d,30*dt);f.x+=dx/d*m;f.y+=dy/d*m;}
      }
    }
    const b=s.bossState[z.id];
    if(!b.alive&&s.elapsed-b.deadAt>300){Object.assign(b,freshBoss(z));}
    if(b.alive&&!b.engaged){
      const [hx,hy]=z.layout.boss,dx=hx-b.x,dy=hy-b.y,d=Math.hypot(dx,dy);
      if(d>1){const m=Math.min(d,30*dt);b.x+=dx/d*m;b.y+=dy/d*m;}
    }
  }
}
function field(s,dt,rng,dest){
  const z=byId[s.zone],L=z.layout,max=maxHP(s);
  const fighting=s.task==='fight';
  if(fighting&&s.hp<max*.4&&s.potions>0&&s.elapsed-s.potionAt>2.5)drink(s);
  const low=s.hp<max*rules[s.policy]&&s.potions===0;
  if(s.task!=='leave'&&(low||s.held||dest!==s.zone)){
    if(low)log(s,s.name+' se retira a descansar: poca salud y sin pociones.');
    disengage(s);s.task='leave';
  }
  if(s.task==='leave'){
    if(walk(s,L.entry,dt)){s.task=null;travel(s,low||s.held?'villa':dest);}
    return;
  }
  if(fighting){
    const f=targetOf(s);
    if(!f||!f.alive){s.task=null;s.target=null;return;}
    fightTick(s,f,dt,rng);return;
  }
  if(s.task==='gather'){
    if(!walk(s,L.gather,dt))return;
    s.timer-=dt;
    if(s.timer<=0){gatherOnce(s,z,rng);s.task=null;}
    return;
  }
  const b=s.bossState[z.id];
  if(s.challenge===z.id){
    if(b.alive){s.task='fight';s.target='boss';engage(s,b);return;}
    s.challenge=null;
  }
  const alive=s.foes[z.id].map((f,i)=>[f,i]).filter(([f])=>f.alive);
  const hunt=s.focus==='hunt'||(s.focus==='balanced'&&s.turn%3!==2);
  s.turn++;
  if(hunt&&alive.length){
    const [f,i]=alive.reduce((best,cur)=>Math.hypot(cur[0].x-s.lx,cur[0].y-s.ly)<Math.hypot(best[0].x-s.lx,best[0].y-s.ly)?cur:best);
    s.task='fight';s.target=i;engage(s,f);
  }else{s.task='gather';s.timer=3;}
}
export function step(s,dt,rng=Math.random){
  if(!dt)return;
  s.elapsed+=dt;
  worldTick(s,dt);
  if(s.state==='travel'){
    const [x,y]=s.path[0],dx=x-s.x,dy=y-s.y,d=Math.hypot(dx,dy),pace=92*attributes(s).speed*dt;
    if(d>pace){s.x+=dx*pace/d;s.y+=dy*pace/d;return;}
    s.x=x;s.y=y;s.path.shift();
    if(s.path.length)return;
    s.zone=s.target;s.target=null;s.task=null;
    if(s.zone==='villa'){s.state='rest';log(s,'Llegó a la Villa del Fresno.');}
    else{s.state='field';[s.lx,s.ly]=byId[s.zone].layout.entry;log(s,'Llegó a '+byId[s.zone].name+'.');}
    return;
  }
  const dest=choose(s);
  if(s.zone==='villa'){
    const rate=classes[s.classIndex].name==='Paladín'?.1:.065;
    s.hp=Math.min(maxHP(s),s.hp+maxHP(s)*rate*dt);
    if(s.hp>=maxHP(s)&&dest!=='villa')travel(s,dest);
    return;
  }
  field(s,dt,rng,dest);
}
export function summary(s){
  if(s.state==='travel')return 'Viajando a '+byId[s.target].name;
  if(s.zone==='villa')return s.hp<maxHP(s)?'Descansando en la posada · '+Math.floor(100*s.hp/maxHP(s))+'%':s.held?'Esperando órdenes en la villa':'Preparando la expedición';
  const z=byId[s.zone];
  if(s.task==='fight')return 'Luchando contra '+(s.target==='boss'?z.boss.name:z.foe.name);
  if(s.task==='gather')return 'Recolectando en '+z.name;
  if(s.task==='leave')return 'Saliendo de '+z.name;
  return 'Explorando '+z.name;
}
