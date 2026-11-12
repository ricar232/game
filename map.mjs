import {WIDTH,HEIGHT,zones,routes,peoples,classes} from './engine.mjs';
export const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const layers=new Map();
export function cached(key,S,paint){
  const id=key+'@'+S;
  if(!layers.has(id)){
    const layer=document.createElement('canvas');layer.width=Math.round(WIDTH*S);layer.height=Math.round(HEIGHT*S);
    const c=layer.getContext('2d');c.scale(S,S);paint(c);layers.set(id,layer);
  }
  return layers.get(id);
}
export function darknessAt(s){
  const phase=(360+s.elapsed*3)%1440;
  return Math.max(0,Math.cos(phase/1440*Math.PI*2));
}
export function rngFor(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
export function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h);}
export function oval(c,x,y,rx,ry,color){
  c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();
}
export function poly(c,points,color,stroke=null,width=1){
  c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();
  if(color){c.fillStyle=color;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}
}
export function line(c,points,color,width=1){
  c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';
  c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();
}
export function tree(c,x,y,s,type,variant){
  c.save();c.translate(x,y);c.scale(s,s);
  oval(c,6,-1,16,5,'#142c234d');rect(c,-2,-14,4,15,'#604d34');
  if(type==='pine'){
    const colors=[['#263f36','#3f6043','#64804e'],['#284837','#436544','#759155'],['#334c36','#526842','#889656']][variant];
    poly(c,[[0,-40],[-15,-11],[-8,-12],[-17,-2],[-3,-4],[7,-3],[18,-7],[9,-16],[13,-15]],colors[0],'#202f29',1);
    poly(c,[[0,-40],[-13,-13],[-7,-15],[-14,-4],[0,-6],[7,-17],[11,-17]],colors[1]);
    line(c,[[-9,-17],[0,-35],[5,-23]],colors[2],1.5);
  }else{
    const colors=type==='fruit'?['#5a643a','#7b8a4a','#adb464']:['#38543b','#59754b','#86a15f'];
    oval(c,1,-18,16,16,colors[0]);oval(c,-5,-23,12,12,colors[1]);oval(c,4,-28,12,10,colors[1]);oval(c,-4,-27,7,6,colors[2]);
    if(type==='fruit')for(const [dx,dy] of [[-9,-20],[4,-24],[8,-16],[-1,-13]])oval(c,dx,dy,2.2,2.2,'#c98958');
  }
  c.restore();
}
export function rock(c,x,y,s,kind){
  c.save();c.translate(x,y);c.scale(s,s);
  oval(c,5,2,15,5,'#18271f67');
  if(kind==='gem'){
    poly(c,[[-12,2],[-9,-11],[-2,-22],[5,-10],[10,-16],[15,1]],'#637d83','#3d585d');
    poly(c,[[-8,0],[-4,-12],[-2,-22],[0,-7],[4,0]],'#a9c7ac');
    poly(c,[[5,0],[9,-8],[10,-16],[13,0]],'#d9ddaa');
  }else{
    const fill=kind==='iron'?'#907863':'#8c8d73';
    poly(c,[[-14,2],[-10,-7],[0,-13],[9,-9],[15,-1],[7,5]],fill,'#4d584c');
    poly(c,[[-10,-7],[0,-13],[9,-9],[3,-3],[-7,-2]],'#b4a892');
    if(kind==='iron')line(c,[[-8,0],[-3,-4],[1,-2],[7,-6]],'#cf9764',2);
  }
  c.restore();
}
export function cabin(c,x,y,s,kind){
  c.save();c.translate(x,y);c.scale(s,s);
  oval(c,8,12,26,11,'#20322663');
  rect(c,-16,-4,34,22,'#b69a67');poly(c,[[18,-4],[25,-9],[25,12],[18,18]],'#79654a');
  rect(c,-4,6,8,12,'#504436');rect(c,-13,2,5,6,'#f6ca80');rect(c,9,2,5,6,'#f6ca80');
  const roof=kind===0?'#995d49':kind===1?'#73795b':'#8f6747';
  poly(c,[[-21,-3],[-8,-23],[21,-23],[30,-7],[18,0]],roof,'#52473b',1.6);
  poly(c,[[-21,-3],[-8,-23],[4,-4]],'#b58460','#66543e',1);
  for(let i=0;i<4;i++)line(c,[[1+i*6,-21],[10+i*5,-8]],'#e4af733a');
  rect(c,12,-26,5,12,'#67584b');rect(c,11,-27,7,3,'#b89d7f');
  c.restore();
}
export function mountain(c,x,y,s,snow){
  c.save();c.translate(x,y);c.scale(s,s);
  poly(c,[[-50,28],[-36,0],[-21,-12],[1,-68],[23,-23],[49,2],[57,26],[14,36],[-12,26]],'#5d695e','#435649',2);
  poly(c,[[1,-68],[6,-24],[23,-7],[32,25],[57,26],[49,2],[23,-23]],'#768377');
  poly(c,[[1,-68],[-9,-19],[-17,-16],[-31,14],[-49,28],[-22,29],[-5,19],[6,-24]],'#4f625a');
  if(snow)poly(c,[[1,-68],[-15,-24],[-7,-28],[-3,-22],[2,-32],[10,-27],[12,-31],[20,-27]],'#c4cbbb');
  line(c,[[3,-39],[9,-24],[14,-17],[20,-13]],'#a8b0a18c',1.3);
  c.restore();
}
function river(c,width,stroke,offset=0){
  c.save();c.translate(offset,0);c.lineWidth=width;c.strokeStyle=stroke;c.lineCap='round';
  c.beginPath();c.moveTo(652,-30);c.bezierCurveTo(625,44,523,73,557,148);
  c.bezierCurveTo(573,203,637,198,617,264);c.bezierCurveTo(595,332,590,337,620,385);
  c.bezierCurveTo(685,485,698,514,640,652);c.stroke();c.restore();
}
function drawLake(c,fill,stroke,width){
  c.beginPath();c.moveTo(606,382);c.bezierCurveTo(663,365,700,390,723,413);
  c.bezierCurveTo(776,435,753,479,722,493);c.bezierCurveTo(681,522,628,492,618,476);
  c.bezierCurveTo(602,449,622,436,607,412);c.bezierCurveTo(600,400,592,394,606,382);
  c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}
}
export function animal(c,x,y,kind,scale=1){
  c.save();c.translate(x,y);c.scale(scale,scale);oval(c,3,6,11,3,'#21362a55');
  if(kind==='duck'){
    oval(c,0,1,9,4,'#d8c9a3');oval(c,6,-4,4,4,'#526d51');line(c,[[9,-4],[13,-4]],'#e2ab62',2);
  } else if(kind==='crow'){
    line(c,[[-9,-2],[-5,-5],[0,-1],[4,-5],[9,-3]],'#23372f',2.5);
  } else {
    const fur=kind==='boar'?'#6e5041':kind==='goat'?'#c6b898':'#a87852';
    oval(c,-2,0,9,4,fur);line(c,[[-7,3],[-8,9],[-5,9]],'#493c2e',1.6);line(c,[[3,3],[5,9]],'#493c2e',1.6);
    line(c,[[4,0],[7,-6]],fur,4);oval(c,9,-7,4,3,fur);
    if(kind==='deer'||kind==='goat')line(c,[[8,-8],[5,-13],[3,-13]],'#d3b78e',1.5);
  }
  c.restore();
}
function backdrop(c){
  const rng=rngFor(3742);
  const ground=c.createLinearGradient(0,0,1000,620);
  ground.addColorStop(0,'#5f7950');ground.addColorStop(.36,'#6b8052');ground.addColorStop(.72,'#7d8657');ground.addColorStop(1,'#4f6950');
  rect(c,0,0,WIDTH,HEIGHT,ground);
  const areas=[[228,210,186,150,'#38563b'],[230,445,177,100,'#8c925b'],[785,278,179,134,'#71775a'],[805,111,194,130,'#4e6656'],[414,304,125,120,'#9c955d'],[690,469,131,106,'#63885d']];
  for(const [x,y,rx,ry,fill] of areas){
    const g=c.createRadialGradient(x,y,13,x,y,rx);g.addColorStop(0,fill);g.addColorStop(1,fill+'00');
    oval(c,x,y,rx,ry,g);
    for(let i=0;i<4;i++){
      c.strokeStyle='#e1d39422';c.lineWidth=1;c.beginPath();
      c.ellipse(x,y,rx*(.61+i*.11),ry*(.53+i*.11),-.11,0,Math.PI*2);c.stroke();
    }
  }
  for(let i=0;i<14500;i++){
    const x=rng()*WIDTH,y=rng()*HEIGHT;
    rect(c,x,y,1+rng()*3,1,rng()<.55?'#192f243b':'#e1cd9037');
  }
  for(let i=0;i<480;i++){
    const x=rng()*WIDTH,y=rng()*HEIGHT;
    line(c,[[x-2,y+2],[x,y],[x+2,y+2]],i%5?'#3e604155':'#dfc88268',1);
  }
  river(c,39,'#4c6350');river(c,33,'#a9ad77');river(c,27,'#517e7a');river(c,22,'#487571');
  river(c,1.7,'#9db4a177',-5);river(c,1.7,'#b9c8a77a',5);
  drawLake(c,'#4d7b7c','#a5ad79',8);drawLake(c,'#4f7d7b','#6e9d92',2);
  for(let i=0;i<53;i++){
    const x=639+rng()*83,y=413+rng()*66;
    line(c,[[x,y],[x+4+rng()*10,y]],'#c0ceab44');
  }
  const peaks=[[867,106,1.08],[771,78,.9],[696,119,.77],[921,139,1.12],[813,129,1.1],[745,166,.77],[874,192,.84],[930,244,.9]];
  peaks.sort((a,b)=>a[1]-b[1]).forEach(([x,y,s])=>mountain(c,x,y,s,true));
  const reserve=(x,y)=>{
    const villa=Math.hypot((x-474)*.9,y-326);
    const closeRoad=Object.values(routes).some(points=>points.some(([xx,yy])=>Math.hypot(xx-x,yy-y)<17));
    return villa<72||closeRoad||(x>540&&x<643&&y<442)||(x>603&&x<760&&y>375&&y<505);
  };
  const trees=[];
  const clusters=[[192,178,146,100,170,'oak'],[73,303,66,253,85,'pine'],[320,62,157,60,75,'pine'],[980,351,64,212,105,'pine'],[406,542,160,64,96,'pine'],[131,437,89,104,63,'fruit'],[741,569,131,56,53,'oak'],[467,122,83,69,32,'oak']];
  for(const [cx,cy,rx,ry,count,kind] of clusters)for(let j=0;j<count;j++){
    const angle=rng()*Math.PI*2,r=Math.sqrt(rng()),x=cx+Math.cos(angle)*rx*r,y=cy+Math.sin(angle)*ry*r;
    if(reserve(x,y)||x<8||x>990||y<15||y>609)continue;
    const type=rng()<.14?'pine':kind;
    trees.push([x,y,.38+rng()*.74,type,Math.floor(rng()*3)]);
  }
  for(const path of Object.values(routes)){
    line(c,path,'#3c523e',16);line(c,path,'#a39062',13);line(c,path,'#b8a675',8);line(c,path,'#cfba833e',2);
  }
  c.save();c.translate(616,278);c.rotate(.04);
  rect(c,-21,-11,43,23,'#544b36');rect(c,-20,-9,41,18,'#927f55');
  for(let i=-18;i<21;i+=5)line(c,[[i,-9],[i,8]],'#baa06b',1.4);
  line(c,[[-22,-10],[22,-10]],'#d0b07a',2);line(c,[[-22,10],[22,10]],'#d0b07a',2);c.restore();
  trees.sort((a,b)=>a[1]-b[1]).forEach(t=>tree(c,...t));
  for(let i=0;i<87;i++){
    const x=735+rng()*161,y=205+rng()*143;
    if(!reserve(x,y))rock(c,x,y,.23+rng()*.55,i%4?'stone':'iron');
  }
  for(const [x,y] of [[729,152],[782,163],[809,181],[746,123]])rock(c,x,y,.73,'gem');
  for(const [x,y] of [[365,484],[309,510],[180,407],[341,333],[555,447]])rock(c,x,y,.47,'stone');
  for(const [x,y,s] of [[191,437,1.0],[209,479,.9],[269,471,.76],[181,493,1.0],[137,471,.85]])tree(c,x,y,s,'fruit',0);
  oval(c,473,328,72,45,'#9b8a5c57');
  poly(c,[[411,320],[419,301],[459,290],[509,294],[540,308],[543,338],[521,359],[470,370],[431,353]],null,'#555b47',5);
  line(c,[[411,320],[419,301],[459,290],[509,294],[540,308]],'#b7aa84',2);
  const cabins=[[456,306,.75,0],[492,307,.78,1],[521,320,.66,0],[429,325,.59,2],[475,333,1,0],[507,345,.65,2],[451,350,.6,1]];
  cabins.forEach(b=>cabin(c,...b));
  oval(c,537,348,8,6,'#4b6151');oval(c,537,345,8,5,'#b2a782');oval(c,537,345,5,3,'#55746c');
  for(const z of zones.slice(1)){
    oval(c,z.x+18,z.y+11,17,8,'#2d4b3669');oval(c,z.x+17,z.y+10,12,5,'#72824a72');
  }
  const shade=c.createRadialGradient(500,302,270,500,302,630);
  shade.addColorStop(0,'#12251900');shade.addColorStop(1,'#182a238c');rect(c,0,0,WIDTH,HEIGHT,shade);
  c.strokeStyle='#e4c89583';c.lineWidth=1.5;c.strokeRect(10,10,980,600);
  c.strokeStyle='#334635';c.strokeRect(14,14,972,592);
  line(c,[[943,51],[943,98]],'#e8d5a8',1);
  poly(c,[[943,42],[938,64],[943,60],[948,64]],'#e8d5a8');
  c.font='bold 11px Georgia';c.fillStyle='#ebd6a5';c.textAlign='center';c.fillText('N',943,35);
}
const wildlife=[[173,446,'deer',1],[274,424,'deer',.75],[266,487,'deer',.68],[277,218,'boar',.95],[207,244,'boar',.7],[689,444,'duck',.82],[706,456,'duck',.74],[832,292,'goat',.8],[793,174,'crow',.8],[776,169,'crow',.6]];
function foe(c,x,y,z,t){
  const pulse=reduce.matches?0:Math.sin(t*3+z.level)*2;
  c.save();c.translate(x,y+pulse);
  oval(c,0,3,9,5,'#24352663');
  const hue=['#696262','#6d524c','#7a864f','#82694d','#7d94a1'][zones.indexOf(z)-1];
  poly(c,[[-8,4],[-7,-3],[-3,-7],[0,-5],[5,-7],[8,-1],[7,4]],hue,'#352f30',1.5);
  rect(c,-4,-1,2,2,'#fac57e');rect(c,3,-1,2,2,'#fac57e');c.restore();
}
export function mist(c,t,alpha=1){
  const banks=[[120,250,190,34],[560,150,230,30],[820,420,210,36],[330,560,260,28],[700,600,240,26],[40,470,180,30]];
  for(const [i,[x,y,rx,ry]] of banks.entries()){
    const dx=reduce.matches?0:((t*(6+i*1.7)+i*190)%(WIDTH+500))-250-x;
    const cx=x+dx,g=c.createRadialGradient(cx,y,4,cx,y,rx);
    g.addColorStop(0,'rgba(226,232,214,'+(.2*alpha)+')');g.addColorStop(1,'rgba(226,232,214,0)');
    c.save();c.translate(cx,y);c.scale(1,ry/rx);c.translate(-cx,-y);oval(c,cx,y,rx,rx,g);c.restore();
  }
}
export function draw(c,s,S=1,hover=null){
  c.setTransform(1,0,0,1,0,0);
  c.drawImage(cached('atlas',S,backdrop),0,0);
  c.setTransform(S,0,0,S,0,0);
  const darkness=darknessAt(s)*.24;
  if(darkness>0)rect(c,0,0,WIDTH,HEIGHT,'rgba(19,29,52,'+darkness+')');
  if(hover){
    const z=zones.find(z=>z.id===hover);
    if(z){const g=c.createRadialGradient(z.x,z.y,6,z.x,z.y,90);g.addColorStop(0,'#ffe3a055');g.addColorStop(1,'#ffe3a000');oval(c,z.x,z.y,90,70,g);}
  }
  for(const [i,[x,y,kind,size]] of wildlife.entries()){
    const drift=reduce.matches?0:s.elapsed*.72+i*2;
    animal(c,x+Math.sin(drift)*7,y+Math.sin(drift*.7)*3,kind,size);
  }
  for(const z of zones.slice(1))foe(c,z.x+18,z.y+9,z,s.elapsed);
  c.save();c.translate(s.x,s.y);c.scale(1.35,1.35);
  oval(c,0,4,15,7,'#1b2b22a0');
  const glow=c.createRadialGradient(0,-1,4,0,-1,23);glow.addColorStop(0,'#ffe9ac9c');glow.addColorStop(1,'#ffcc7500');
  oval(c,0,-1,23,23,glow);
  c.strokeStyle='#f6d78c';c.lineWidth=1.5;c.beginPath();c.ellipse(0,4,12,7,0,0,Math.PI*2);c.stroke();
  const bob=s.state==='travel'&&!reduce.matches?Math.sin(s.elapsed*21)*2:0;
  const cls=classes[s.classIndex],skin=peoples[s.people].skin;
  poly(c,[[-6,4+bob],[-5,-9+bob],[5,-9+bob],[7,4+bob]],cls.color,'#313b30',2);
  oval(c,0,-12+bob,5,5,skin);
  line(c,[[7,-12+bob],[7,5+bob]],'#e2bb75',2);
  if(s.task==='fight'&&!reduce.matches)line(c,[[9,-8],[15,-12+(s.elapsed*10%9)]],'#ffe1a5',2);
  if(s.task==='gather'&&!reduce.matches){
    const travel=s.elapsed*1.1%1;
    oval(c,7+travel*6,-8-travel*12,2,2,'#f9d280');
  }
  c.restore();
  mist(c,s.elapsed,1-darknessAt(s)*.3);
}
export function portrait(c,s){
  const cls=classes[s.classIndex],p=peoples[s.people];
  c.clearRect(0,0,86,86);
  oval(c,43,79,33,18,'#202e24');
  poly(c,[[16,86],[21,62],[35,55],[51,55],[65,62],[70,86]],cls.color,'#202b24',3);
  poly(c,[[34,58],[43,69],[52,58],[50,48],[35,48]],p.skin);
  oval(c,43,38,p.name==='Ogro'?16:13,19,cls.name==='No muerto'?'#b5bda7':p.skin);
  poly(c,[[28,42],[27,30],[33,19],[47,16],[57,22],[60,36],[55,35],[52,27],[32,34],[31,45]],'#463c31');
  if(p.name==='Elfo'||p.name==='Trol')poly(c,[[32,36],[22,30],[29,45]],p.skin);
  if(p.name==='Enano')poly(c,[[31,46],[38,49],[49,47],[54,44],[50,60],[43,65],[35,61]],'#674633');
  if(p.name==='Ogro')poly(c,[[33,48],[35,40],[37,49],[51,49],[53,40],[55,48]],'#ead9b6');
  if(cls.name==='Caballero'||cls.name==='Paladín')poly(c,[[28,33],[31,22],[43,16],[55,21],[59,33],[51,31],[44,26],[37,31]],'#939c8b','#dad9b1',1);
  rect(c,37,37,3,2,'#3d3a2c');rect(c,48,37,3,2,'#3d3a2c');
  line(c,[[39,47],[47,47]],'#745948',1.5);
  poly(c,[[40,75],[43,71],[47,75],[43,80]],'#e8be73');
}
