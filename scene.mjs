import {WIDTH,HEIGHT,byId,zones,classes,peoples,maxHP,fx} from './engine.mjs';
import {rect,oval,poly,line,rock,animal,rngFor,cached,darknessAt,reduce,mist} from './map.mjs';

const TAU=Math.PI*2;
const still=()=>reduce.matches;

/* ---------- utilidades de dibujo ---------- */
function shade(hex,amt){
  const n=parseInt(hex.slice(1,7),16);let r=n>>16,g=n>>8&255,b=n&255;
  const t=amt<0?0:255,p=Math.abs(amt);
  r=Math.round(r+(t-r)*p);g=Math.round(g+(t-g)*p);b=Math.round(b+(t-b)*p);
  return '#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1);
}
function glow(c,x,y,r,rgb,a){
  if(a<=0)return;
  const g=c.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,'rgba('+rgb+','+a+')');g.addColorStop(1,'rgba('+rgb+',0)');
  c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);
}
function smooth(c,pts,color,w){
  c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';
  c.beginPath();c.moveTo(...pts[0]);
  for(let i=1;i<pts.length-1;i++){const [x,y]=pts[i],[nx,ny]=pts[i+1];c.quadraticCurveTo(x,y,(x+nx)/2,(y+ny)/2);}
  c.lineTo(...pts.at(-1));c.stroke();
}
function road(c,pts,w=34){
  smooth(c,pts,'#4f5a3f',w+6);smooth(c,pts,'#9c8a5c',w);smooth(c,pts,'#b9a674',w-10);smooth(c,pts,'#dccb9655',3);
}
function ground(c,a,b){
  const g=c.createLinearGradient(0,0,WIDTH*.35,HEIGHT);g.addColorStop(0,a);g.addColorStop(1,b);rect(c,0,0,WIDTH,HEIGHT,g);
}
function speckle(c,rng,n,colors,area=[0,0,WIDTH,HEIGHT],size=2){
  const [ax,ay,aw,ah]=area;
  for(let i=0;i<n;i++){c.fillStyle=colors[i%colors.length];c.fillRect(ax+rng()*aw,ay+rng()*ah,1+rng()*size,1+rng()*size*.5);}
}
function tufts(c,rng,n,color,area=[0,0,WIDTH,HEIGHT],size=4){
  const [ax,ay,aw,ah]=area;c.strokeStyle=color;c.lineWidth=1.2;c.lineCap='round';c.beginPath();
  for(let i=0;i<n;i++){
    const x=ax+rng()*aw,y=ay+rng()*ah,s=size*(.6+rng()*.8);
    c.moveTo(x-s*.6,y);c.lineTo(x-s*.25,y-s);c.moveTo(x,y);c.lineTo(x+s*.1,y-s*1.25);c.moveTo(x+s*.6,y);c.lineTo(x+s*.4,y-s*.9);
  }
  c.stroke();
}
function soft(c,x,y,rx,ry,color){
  const g=c.createRadialGradient(x,y,1,x,y,rx);g.addColorStop(0,color);g.addColorStop(1,color.slice(0,7)+'00');
  c.save();c.translate(x,y);c.scale(1,ry/rx);oval(c,0,0,rx,rx,g);c.restore();
}
function vignette(c){
  const g=c.createRadialGradient(500,310,280,500,310,660);g.addColorStop(0,'#10201800');g.addColorStop(1,'#0f1c15b0');rect(c,0,0,WIDTH,HEIGHT,g);
}
function frame(c){
  c.strokeStyle='#e4c89566';c.lineWidth=1.5;c.strokeRect(8,8,WIDTH-16,HEIGHT-16);
}
function oak(c,x,y,s,pal=['#2f4a32','#41623f','#5b7e4c','#86a663'],fruit=null){
  const r=rngFor((x*73+y*31)|0);
  c.save();c.translate(x,y);c.scale(s,s);
  oval(c,9,2,24,7,'#132a1d55');
  poly(c,[[-3,0],[-2,-16],[-8,-26],[-1,-21],[5,-29],[3,-15],[4,0]],'#5a4530');
  line(c,[[1,-2],[1,-14]],'#7a6045',1);
  const blobs=[];for(let i=0;i<9;i++)blobs.push([(r()-.5)*30,-30-r()*20,8+r()*7]);
  for(const [bx,by,br] of blobs)oval(c,bx+2,by+3,br,br*.9,pal[0]);
  for(const [bx,by,br] of blobs)oval(c,bx,by,br*.88,br*.8,pal[1]);
  for(const [bx,by,br] of blobs)oval(c,bx-br*.25,by-br*.3,br*.5,br*.42,pal[2]);
  for(const [bx,by,br] of blobs.slice(0,5))oval(c,bx-br*.35,by-br*.45,br*.22,br*.18,pal[3]);
  if(fruit)for(let i=0;i<12;i++)oval(c,(r()-.5)*32,-24-r()*26,1.9,1.9,fruit);
  c.restore();
}
function pine(c,x,y,s,pal=['#1f382f','#2f4d3b','#4d6e4b'],snow=false){
  c.save();c.translate(x,y);c.scale(s,s);
  oval(c,6,1,14,5,'#10231a55');rect(c,-2,-8,4,9,'#4e3c2a');
  for(let i=0;i<4;i++){
    const yy=-6-i*9,w=16-i*3.3;
    poly(c,[[-w,yy],[0,yy-17],[w,yy]],pal[0]);
    poly(c,[[-w+3,yy-1],[0,yy-17],[w*.1,yy-2]],pal[1]);
    line(c,[[-w*.55,yy-3],[0,yy-14]],pal[2],1.2);
    if(snow)poly(c,[[-w*.55,yy-8],[0,yy-17],[w*.55,yy-8],[0,yy-11]],'#e8eee9');
  }
  c.restore();
}
function bush(c,x,y,s,berry=null){
  const r=rngFor((x*13+y*7)|0);c.save();c.translate(x,y);c.scale(s,s);
  oval(c,3,2,16,5,'#142a1d55');
  for(let i=0;i<5;i++)oval(c,(i-2)*6,-6-r()*4,8,7,i%2?'#3f6a3e':'#4d7a45');
  oval(c,-4,-11,5,3,'#6f9a58');
  if(berry)for(let i=0;i<8;i++)oval(c,(r()-.5)*24,-4-r()*10,1.7,1.7,berry);
  c.restore();
}
function stone(c,x,y,s,fill='#8c8d7c'){
  c.save();c.translate(x,y);c.scale(s,s);
  oval(c,3,2,15,5,'#14211a55');
  poly(c,[[-14,2],[-12,-8],[-3,-14],[8,-12],[15,-3],[10,4]],fill,shade(fill,-.4),1.2);
  poly(c,[[-12,-8],[-3,-14],[8,-12],[2,-6],[-8,-4]],shade(fill,.22));
  c.restore();
}
function fence(c,pts,color='#7a5c3c'){
  for(let i=0;i<pts.length-1;i++){
    const [ax,ay]=pts[i],[bx,by]=pts[i+1],n=Math.max(1,Math.round(Math.hypot(bx-ax,by-ay)/16));
    for(let k=0;k<=n;k++){const x=ax+(bx-ax)*k/n,y=ay+(by-ay)*k/n;rect(c,x-1.5,y-14,3,15,shade(color,-.2));}
    line(c,[[ax,ay-11],[bx,by-11]],color,2.4);line(c,[[ax,ay-5],[bx,by-5]],color,2.4);
  }
}
function barrel(c,x,y,s=1){
  c.save();c.translate(x,y);c.scale(s,s);oval(c,2,1,9,3,'#16231b66');
  rect(c,-7,-18,14,18,'#8a6440');oval(c,0,-18,7,2.6,'#a37a50');
  for(const yy of [-15,-4])line(c,[[-7,yy],[7,yy]],'#4c3a2b',1.8);
  c.restore();
}
function crate(c,x,y,s=1,top='#c9a46b'){
  c.save();c.translate(x,y);c.scale(s,s);oval(c,3,1,11,3,'#16231b66');
  rect(c,-9,-15,18,15,'#9a7448');poly(c,[[-9,-15],[-5,-19],[13,-19],[9,-15]],top);poly(c,[[9,-15],[13,-19],[13,-4],[9,0]],'#7a5a38');
  line(c,[[-9,-15],[9,0]],'#6a4e33',1.4);line(c,[[9,-15],[-9,0]],'#6a4e33',1.4);
  c.restore();
}
function lanternPost(c,x,y){
  oval(c,x+3,y+1,6,2,'#16231b66');rect(c,x-1.5,y-34,3,34,'#3b3328');
  line(c,[[x,y-32],[x+8,y-32]],'#3b3328',2);rect(c,x+5,y-31,7,9,'#2f2a22');rect(c,x+6.5,y-29.5,4,6,'#d4b36b');
}
function signboard(c,x,y,text,color='#5a3d28'){
  c.font='bold 10px Georgia';const w=c.measureText(text).width+14;
  line(c,[[x,y],[x+w*.5+8,y]],'#2f2a22',2.4);
  line(c,[[x+6,y],[x+6,y+5]],'#2f2a22',1);line(c,[[x+w-2,y],[x+w-2,y+5]],'#2f2a22',1);
  c.fillStyle=color;c.beginPath();c.roundRect(x+2,y+5,w,16,3);c.fill();c.strokeStyle='#c9a46b';c.lineWidth=1;c.stroke();
  c.fillStyle='#f6e3b6';c.textAlign='center';c.textBaseline='middle';c.fillText(text,x+2+w/2,y+13.5);
}

/* ---------- casas ---------- */
function geom(o){
  const d=o.d??Math.round(o.w*.26),lift=d*.55,top=o.y-o.h,rh=o.rh??Math.round(o.h*.62);
  return {d,lift,top,ry:top-rh*.85,rx0:o.x+d*.5,rx1:o.x+o.w+d*.5,x1:o.x+o.w};
}
function windowsOf(o){
  const n=o.storeys??1,sh=o.h/n,ww=o.ww??12,out=[];
  for(let k=0;k<n;k++){
    const wh=o.wh??Math.min(17,sh*.36),yy=o.y-sh*(k+1)+sh*.24;
    for(const f of (k?o.winUp??[.2,.5,.8]:o.win??[.2,.8]))out.push([o.x+o.w*f-ww/2,yy,ww,wh]);
  }
  return out;
}
function chimneyOf(o){
  const {ry,d}=geom(o);return [o.x+o.w*o.chimney+d*.3,ry-12];
}
function house(c,o){
  const {x,y,w,h}=o,{d,lift,top,ry,rx0,rx1,x1}=geom(o),side=o.side??shade(o.wall,-.3);
  oval(c,x+w/2+d*.5,y+3,w*.6+d*.4,9+d*.12,'#16261b66');
  poly(c,[[x1,y],[x1+d,y-lift],[x1+d,top-lift],[x1,top]],side);
  poly(c,[[x1,top],[x1+d,top-lift],[rx1,ry]],side);
  rect(c,x,top,w,h,o.wall);
  const lit=c.createLinearGradient(x,top,x,y);lit.addColorStop(0,'#ffffff14');lit.addColorStop(1,'#00000018');rect(c,x,top,w,h,lit);
  if(o.stone){
    c.save();c.beginPath();c.rect(x,top,w,h);c.clip();const r=rngFor((x*7+y)|0);
    c.strokeStyle='#00000026';c.lineWidth=1;
    for(let yy=top+2,row=0;yy<y;yy+=7,row++)for(let xx=x-(row%2?6:0);xx<x1;xx+=11+r()*6)c.strokeRect(xx,yy,11,6);
    c.restore();
  }
  if(o.timber){
    const n=o.storeys??1;c.lineWidth=3;c.strokeStyle=o.timber;c.beginPath();
    c.moveTo(x+1.5,top);c.lineTo(x+1.5,y);c.moveTo(x1-1.5,top);c.lineTo(x1-1.5,y);
    c.moveTo(x,top+1.5);c.lineTo(x1,top+1.5);
    for(let k=1;k<n;k++){const yy=y-h*k/n;c.moveTo(x,yy);c.lineTo(x1,yy);}
    if(n>1){const yy=y-h/n;c.moveTo(x,yy);c.lineTo(x+w*.1,top);c.moveTo(x1,yy);c.lineTo(x1-w*.1,top);}
    c.stroke();
  }
  rect(c,x-2,y-5,w+4,5,'#5d5546');poly(c,[[x1+2,y],[x1+d+1,y-lift],[x1+d+1,y-lift-5],[x1+2,y-5]],'#4b4438');
  const L=[x-9,top+6],R=[x1+8,top+6],RT=[rx1+5,ry],LT=[rx0-6,ry];
  poly(c,[[rx1+5,ry],[x1+d+10,top-lift+6],[x1+d+5,top-lift+10],[rx1,ry+6]],shade(o.roof,-.38));
  poly(c,[L,R,RT,LT],o.roof,'#2b2620',1.3);
  const rg=c.createLinearGradient(0,ry,0,top);rg.addColorStop(0,'#ffffff1c');rg.addColorStop(1,'#00000022');poly(c,[L,R,RT,LT],rg);
  c.strokeStyle=shade(o.roof,-.25);c.lineWidth=1.1;c.beginPath();
  const rows=Math.max(3,Math.round((top-ry)/7));
  for(let i=1;i<rows;i++){const f=i/rows,ax=L[0]+(LT[0]-L[0])*f,ay=L[1]+(LT[1]-L[1])*f,bx=R[0]+(RT[0]-R[0])*f;c.moveTo(ax,ay);c.lineTo(bx,ay);}
  c.stroke();
  line(c,[LT,RT],shade(o.roof,.25),2.4);line(c,[L,R],shade(o.roof,-.42),2);
  if(o.chimney!=null){const [cx,cy]=chimneyOf(o);rect(c,cx-5,cy,11,(ry+(top-ry)*.35)-cy,'#6c5f50');rect(c,cx-7,cy-3,15,5,'#8b7f6c');}
  for(const [wx,wy,ww,wh] of windowsOf(o)){
    rect(c,wx-2,wy-2,ww+4,wh+4,'#3a2e22');rect(c,wx,wy,ww,wh,'#2c3b40');rect(c,wx+1,wy+1,ww*.4,wh*.35,'#5b6f73');
    line(c,[[wx+ww/2,wy],[wx+ww/2,wy+wh]],'#3a2e22',1.5);line(c,[[wx,wy+wh/2],[wx+ww,wy+wh/2]],'#3a2e22',1.5);
    rect(c,wx-3,wy+wh+1,ww+6,3,'#7a6448');
    if(o.flowers)for(let i=0;i<4;i++)oval(c,wx+i*ww/3,wy+wh,2.2,2,o.flowers);
  }
  if(o.door!==false){
    const n=o.storeys??1,dw=o.dw??16,dh=o.dh??Math.min(30,(h/n)*.62),dx=x+w*(o.doorAt??.5)-dw/2;
    rect(c,dx-3,y-dh-3,dw+6,dh+3,'#3a2e22');
    c.fillStyle='#6b4a2f';c.beginPath();c.roundRect(dx,y-dh,dw,dh,[dw/2,dw/2,0,0]);c.fill();
    for(let i=1;i<3;i++)line(c,[[dx+dw*i/3,y-dh+3],[dx+dw*i/3,y]],'#4f3622',1);
    oval(c,dx+dw*.78,y-dh*.45,1.4,1.4,'#e8c27a');
  }
  if(o.sign)signboard(c,x+w*(o.signAt??.5)+(o.dw??16)/2+4,y-h/(o.storeys??1)-2,o.sign,o.signColor);
}
function windowLights(c,houses,dark,t){
  if(dark<=.05)return;
  for(const [hi,o] of houses.entries())for(const [i,[wx,wy,ww,wh]] of windowsOf(o).entries()){
    if((hi*3+i)%4===3&&dark<.7)continue;
    const flick=still()?1:.85+Math.sin(t*3+i*1.7+hi)*.15;
    c.fillStyle='rgba(255,206,120,'+(dark*.9*flick)+')';c.fillRect(wx,wy,ww,wh);
    glow(c,wx+ww/2,wy+wh/2,ww*1.8,'255,190,100',dark*.35*flick);
  }
}
function smoke(c,x,y,t,amt=1){
  for(let i=0;i<5;i++){
    const k=still()?i/5:((t*.35+i/5)%1),r=3+k*10;
    c.fillStyle='rgba(205,205,195,'+(.35*(1-k)*amt)+')';
    c.beginPath();c.arc(x+Math.sin(k*5+i)*4+k*14,y-k*46,r,0,TAU);c.fill();
  }
}

/* ---------- personajes ---------- */
function person(c,x,y,o,t,moving=false,dir=1,s=1.25){
  c.save();c.translate(x,y);c.scale(dir*s,s);
  oval(c,0,1,8,3,'#1a2a1f66');
  const st=moving&&!still()?Math.sin(t*9+(o.ph||0))*3:0;
  const bob=moving&&!still()?Math.abs(Math.sin(t*9+(o.ph||0)))*-1:(still()?0:Math.sin(t*1.5+(o.ph||0))*.4);
  line(c,[[-2,-8],[-2-st*.6,0]],o.legs??'#3d3328',3);line(c,[[2,-8],[2+st*.6,0]],o.legs??'#3d3328',3);
  c.translate(0,bob);
  poly(c,[[-6,-8],[-5,-21],[5,-21],[6,-8]],o.body,'#2a2a22',1);
  if(o.apron)poly(c,[[-4,-8],[-3,-16],[3,-16],[4,-8]],o.apron);
  line(c,[[-5,-19],[-7,-11+st*.5]],shade(o.body,-.2),2.6);line(c,[[5,-19],[7,-11-st*.5]],shade(o.body,-.2),2.6);
  if(o.carry)crate(c,7,-9,.45,o.carry);
  oval(c,0,-25,4.6,4.8,o.skin??'#e0b58c');
  oval(c,0,-27.5,4.9,2.8,o.hair??'#4a3a2a');
  if(o.hat)poly(c,[[-7,-27],[0,-34],[7,-27]],o.hat);
  c.restore();
}
const villagers=[
  {body:'#8a5a44',hair:'#2f2620',apron:'#d9cba8',ph:0},{body:'#4f6b7a',hair:'#c9a46b',ph:1.3},
  {body:'#7a7a3e',hair:'#5a3a24',hat:'#a8874e',ph:2.1},{body:'#9a4f5a',hair:'#1f1a16',ph:3.7},
  {body:'#5a6f4a',hair:'#8a6a4a',carry:'#c98958',ph:.6},{body:'#6a5a8a',hair:'#3a2a1a',ph:4.4},
  {body:'#a0703c',hair:'#d8c9a0',hat:'#5a4a3a',ph:5.2}
];
function along(pts,k){
  let total=0;const seg=[];
  for(let i=0;i<pts.length-1;i++){const l=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]);seg.push(l);total+=l;}
  let d=k*total;
  for(let i=0;i<seg.length;i++){
    if(d<=seg[i]||i===seg.length-1){const f=seg[i]?Math.min(1,d/seg[i]):0,[ax,ay]=pts[i],[bx,by]=pts[i+1];return [ax+(bx-ax)*f,ay+(by-ay)*f,bx>=ax?1:-1];}
    d-=seg[i];
  }
  return [...pts[0],1];
}
function patrol(pts,t,speed,offset=0){
  let total=0;for(let i=0;i<pts.length-1;i++)total+=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]);
  const period=total/speed*2,ph=((t+offset)%period)/period;
  const back=ph>.5,k=back?2-ph*2:ph*2,[x,y,dir]=along(pts,k);
  const pause=Math.abs(k-.5)>.47;
  return [x,y,back?-dir:dir,!pause];
}
function heroFigure(c,s,x,y,t,dir=1,action='idle',opts={}){
  const cls=classes[s.classIndex],p=peoples[s.people];
  c.save();c.translate(x,y);
  glow(c,0,-18,50,'255,228,160',.32);
  c.strokeStyle='#f6d78c';c.lineWidth=1.6;c.beginPath();c.ellipse(0,2,18,6,0,0,TAU);c.stroke();
  c.scale(dir*1.85,1.85);
  const moving=action==='walk',st=moving&&!still()?Math.sin(t*9)*3:0;
  const sw=opts.swing??-1;
  const crouch=action==='gather'?2:0;
  oval(c,0,1,8,3,'#1a2a1f88');
  c.translate(0,crouch);
  poly(c,[[-5,-20],[-9,-1],[3,-4],[5,-20]],shade(cls.color,-.38));
  line(c,[[-2,-8],[-2-st*.6,-crouch]],'#3a3128',3.2);line(c,[[2,-8],[2+st*.6,-crouch]],'#3a3128',3.2);
  poly(c,[[-6,-8],[-5,-21],[5,-21],[6,-8]],cls.color,'#262a22',1.2);
  rect(c,-6,-11,12,2,'#5a4430');oval(c,0,-10,1.5,1.2,'#e8c27a');
  const skin=cls.name==='No muerto'?'#b5bda7':p.skin;
  line(c,[[-5,-19],[-7,-11]],shade(cls.color,-.2),2.8);
  oval(c,0,-25.5,p.name==='Ogro'?5.6:4.8,5,skin);
  oval(c,0,-28,5,2.8,'#463c31');
  if(p.name==='Elfo'||p.name==='Trol')poly(c,[[-4,-26],[-9,-30],[-4,-23]],skin);
  if(p.name==='Enano')poly(c,[[-4,-23],[0,-17],[4,-23]],'#674633');
  if(cls.name==='Caballero'||cls.name==='Paladín')poly(c,[[-5.5,-26],[-4,-31],[4,-31],[5.5,-26]],'#9aa394','#dad9b1',.8);
  c.save();c.translate(6,-17);c.rotate(sw>=0?-1.5+sw*2.6:-.3+(still()?0:Math.sin(t*2)*.08));
  line(c,[[0,0],[2,6]],shade(cls.color,-.2),2.8);
  const n=cls.name;
  if(n==='Mago'){line(c,[[2,10],[2,-16]],'#7a5a3a',1.8);glow(c,2,-17,9,'190,150,255',.7);oval(c,2,-17,2.2,2.2,'#e6d4ff');}
  else if(n==='Cazador'){c.strokeStyle='#8a6a3a';c.lineWidth=1.6;c.beginPath();c.arc(-2,-2,10,-1.2,1.2);c.stroke();line(c,[[2,-11],[2,7]],'#e0d6b8',.6);}
  else if(n==='Caballero'){line(c,[[2,6],[2,-14]],'#d8dcd4',2);line(c,[[-1,4],[5,4]],'#8a6a3a',2);}
  else if(n==='No muerto'){line(c,[[2,8],[2,-15]],'#5a4a3a',1.6);poly(c,[[2,-15],[-9,-12],[-6,-15]],'#c9cfc4');}
  else if(n==='Paladín'){line(c,[[2,8],[2,-10]],'#7a5a3a',1.8);rect(c,-2,-15,8,6,'#d9b766');glow(c,2,-12,10,'255,220,140',.45);}
  else {line(c,[[2,8],[2,-12]],'#7a5a3a',1.8);poly(c,[[2,-13],[9,-16],[9,-7],[2,-9]],'#cfd3cc','#6a6e66',.6);}
  c.restore();
  if(n==='Caballero'){oval(c,-7,-14,4,5.5,'#8dabb8');oval(c,-7,-14,1.5,2,'#dad9b1');}
  c.restore();
  if(opts.hurt)glow(c,x,y-26,34,'255,60,40',.55);
  if(action==='gather'&&!still())for(let i=0;i<3;i++){const k=(t*.8+i/3)%1;oval(c,x+dir*14+Math.sin(i*2+k*6)*6,y-10-k*30,2.2*(1-k)+.6,2.2*(1-k)+.6,'#ffe09a');}
  if(action==='rest'&&!still()){
    c.font='bold 14px Georgia';c.textAlign='center';
    for(let i=0;i<3;i++){const k=(t*.5+i/3)%1;c.fillStyle='rgba(240,230,200,'+(1-k)+')';c.fillText('z',x+16+k*14,y-56-k*26);}
  }
}

/* ---------- criaturas ---------- */
function rabbit(c,x,y,t,s=1,ph=0){
  const hop=still()?0:Math.max(0,Math.sin(t*4+ph))*6;
  c.save();c.translate(x,y);c.scale(s,s);oval(c,0,2,7,2,'#1a2a1f55');c.translate(0,-hop);
  oval(c,0,-4,6,4,'#b49a7a');oval(c,5,-8,3.2,3,'#b49a7a');poly(c,[[4,-10],[3,-17],[6,-11]],'#a88e6e');poly(c,[[6,-10],[7,-16],[8,-10]],'#a88e6e');
  oval(c,-6,-4,1.8,1.8,'#efe6d8');c.restore();
}
function wolf(c,x,y,t,dir=1,s=1,ph=0){
  c.save();c.translate(x,y);c.scale(dir*s,s);
  oval(c,0,6,22,5,'#1a2a1f66');
  const g=still()?0:Math.sin(t*6+ph)*2;
  poly(c,[[-16,-8],[-30,-15+g],[-27,-8],[-16,-3]],'#5f5c5a');
  for(const [lx,k] of [[-11,1],[-6,-1],[8,1],[13,-1]])line(c,[[lx,-3],[lx+g*k,6]],'#4a4746',3.2);
  oval(c,0,-6,18,8,'#77736d');oval(c,-1,-3,14,4.5,'#8d8780');poly(c,[[-6,-13],[6,-13],[2,-9],[-4,-9]],'#5f5b57');
  poly(c,[[12,-12],[20,-19],[30,-11],[34,-6],[22,-3],[14,-5]],'#7a756f','#3b3836',1);
  poly(c,[[17,-16],[18,-26],[22,-17]],'#55514d');poly(c,[[21,-17],[24,-25],[25,-15]],'#55514d');
  oval(c,24,-12,1.7,1.4,'#f5c46a');oval(c,33.5,-6.5,1.6,1.3,'#1f1d1c');
  c.restore();
}
function spider(c,x,y,t,s=1){
  const bob=still()?0:Math.sin(t*1.6)*8;
  c.save();line(c,[[x,0],[x,y-12*s+bob]],'#e8e6dc88',1);c.translate(x,y+bob);c.scale(s,s);
  for(let i=0;i<4;i++){const a=still()?0:Math.sin(t*4+i)*2;for(const sd of [-1,1])line(c,[[0,0],[sd*(14+i*2),-9+i*5+a],[sd*(23+i*3),5+i*4]],'#2b2232',2.6);}
  oval(c,0,10,11,13,'#3a2d45');poly(c,[[-4,4],[0,18],[4,4]],'#8a3a3a');
  oval(c,0,-5,8,7,'#4a3a58');
  for(const [ex,ey] of [[-3,-8],[3,-8],[-1.5,-5],[1.5,-5]])oval(c,ex,ey,1.4,1.4,'#ff6b5a');
  glow(c,0,-7,12,'255,90,80',.25);
  c.restore();
}
function toad(c,x,y,t,s=1,ph=0,pad=true){
  c.save();c.translate(x,y);c.scale(s,s);
  if(pad){oval(c,0,2,32,9,'#2f5b4a');oval(c,0,1,30,8,'#4a7f4f');line(c,[[0,1],[22,-3]],'#2f5b4a',2);}else oval(c,0,3,22,5,'#1a2a1f66');
  const p=still()?0:(Math.sin(t*3+ph)+1)*2;
  oval(c,-14,-3,7,4,'#5f6b34');oval(c,14,-3,7,4,'#5f6b34');
  oval(c,0,-10,19,12,'#6f7b3e');oval(c,0,-4,13+p,6+p*.5,'#c6b77a');
  for(const [wx,wy] of [[-8,-14],[6,-16],[-2,-18],[10,-11]])oval(c,wx,wy,1.6,1.3,'#56622e');
  oval(c,-9,-20,6,5,'#7d8a45');oval(c,9,-20,6,5,'#7d8a45');
  oval(c,-9,-21,3,3.2,'#e8d26a');oval(c,9,-21,3,3.2,'#e8d26a');rect(c,-10,-22,2,3,'#1c1a12');rect(c,8,-22,2,3,'#1c1a12');
  c.restore();
}
function golem(c,x,y,t,s=1){
  const b=still()?0:Math.sin(t*1.5)*2;
  c.save();c.translate(x,y);c.scale(s,s);
  oval(c,0,4,36,9,'#1b201c77');
  poly(c,[[-20,0],[-22,-26],[-6,-28],[-6,0]],'#6f6a60','#46423b',1.4);poly(c,[[20,0],[22,-26],[6,-28],[6,0]],'#655f56','#46423b',1.4);
  poly(c,[[-26,-24+b],[-31,-58+b],[-12,-71+b],[14,-71+b],[31,-57+b],[26,-24+b]],'#857e70','#4a463f',1.6);
  poly(c,[[-12,-71+b],[14,-71+b],[31,-57+b],[8,-52+b],[-20,-56+b]],'#9a9283');
  oval(c,-37,-42+b,10,17,'#766f63');oval(c,37,-42+b,10,17,'#6d665b');oval(c,-39,-24+b,9,7,'#6a645a');oval(c,39,-24+b,9,7,'#6a645a');
  poly(c,[[-11,-70+b],[-9,-88+b],[9,-88+b],[11,-70+b]],'#958d7e','#4a463f',1.2);
  const pulse=still()?.6:.5+Math.sin(t*2.4)*.2;
  glow(c,0,-45+b,30,'255,150,70',pulse*.7);
  oval(c,0,-45+b,5,5,'#ffb66a');
  rect(c,-6,-81+b,4,3,'#ffc070');rect(c,3,-81+b,4,3,'#ffc070');
  line(c,[[-18,-40+b],[-8,-48+b],[-14,-58+b]],'rgba(240,160,90,'+pulse+')',1.6);line(c,[[18,-38+b],[9,-50+b],[16,-60+b]],'rgba(240,160,90,'+pulse+')',1.6);
  c.restore();
}
function guardian(c,x,y,t,s=1){
  const f=still()?0:Math.sin(t*1.2)*6;
  c.save();c.translate(x,y);c.scale(s,s);
  oval(c,0,6,30,8,'#2c3b4566');
  glow(c,0,-55+f,85,'150,220,235',.35);
  poly(c,[[0,-112+f],[17,-62+f],[9,-22+f],[-9,-22+f],[-17,-62+f]],'#a9dce6','#e6fbff',1.4);
  poly(c,[[0,-112+f],[17,-62+f],[0,-50+f]],'#d5f3f7');poly(c,[[0,-50+f],[9,-22+f],[-9,-22+f],[-17,-62+f]],'#86c0cd');
  for(let i=0;i<6;i++){
    const a=(still()?0:t*.6)+i*TAU/6,sx=Math.cos(a)*40,sy=-60+f+Math.sin(a)*12;
    poly(c,[[sx,sy-10],[sx+5,sy],[sx,sy+10],[sx-5,sy]],Math.sin(a)>0?'#c9eef3':'#8fc6d2','#e6fbff',.8);
  }
  glow(c,0,-68+f,10,'255,255,255',.8);oval(c,0,-68+f,4,2,'#ffffff');
  c.restore();
}

/* ---------- escenas ---------- */
const inn={x:130,y:268,w:200,h:112,storeys:2,wall:'#dcc8a0',timber:'#5a4030',roof:'#9a5440',win:[.18,.82],winUp:[.14,.38,.62,.86],chimney:.12,dw:22,flowers:'#d76f5a',sign:'POSADA',signAt:.5,signColor:'#6a3a2a'};
const hall={x:420,y:236,w:160,h:100,storeys:2,wall:'#bdb4a0',stone:true,roof:'#5b6b78',win:[.2,.8],winUp:[.2,.5,.8],dw:22,sign:'CONSEJO',signColor:'#3c4a56'};
const forgeHouse={x:720,y:268,w:170,h:92,wall:'#a29a8d',stone:true,roof:'#4e4c4a',win:[.72],chimney:.32,doorAt:.38,sign:'HERRERÍA',signAt:.38,signColor:'#3a3532'};
const home={x:50,y:540,w:140,h:82,wall:'#d9c8a4',timber:'#6a4a32',roof:'#6f7e4c',win:[.2,.8],chimney:.7,flowers:'#e3c35a'};
const house2={x:810,y:560,w:130,h:78,wall:'#cdbb94',roof:'#a16a45',timber:'#5c4330',win:[.2,.78],chimney:.25,sign:'SASTRERÍA',signAt:.5,signColor:'#6a3a5a',flowers:'#b57ab8'};
const house3={x:905,y:198,w:80,h:60,wall:'#cbbd9c',roof:'#87604a',win:[.25],doorAt:.7,d:18};
const house4={x:20,y:330,w:90,h:64,wall:'#cfc09d',roof:'#7b7058',win:[.25],doorAt:.7,chimney:.3};
const villaHouses=[house3,hall,inn,forgeHouse,house4,home,house2];
const lanterns=[[262,330],[758,330],[300,452],[722,452],[392,288],[628,288]];
const stalls=[[400,478,['#b5483c','#efe2c4'],['#c98958','#d9c36b','#9a5a3a']],[510,478,['#3f6a8a','#efe2c4'],['#6aa0a8','#c9c2b4','#8a8f98']],[620,478,['#5f7a3c','#efe2c4'],['#a8b464','#c46a4a','#e3c35a']]];

function paintVilla(c){
  const rng=rngFor(911);
  ground(c,'#6f8a52','#5d7a4a');
  for(let i=0;i<7;i++){
    const y=20+i*16;poly(c,[[140+i*6,y],[620-i*4,y-6],[620-i*4,y+8],[140+i*6,y+14]],i%2?'#8f9a5a':'#a39f60');
  }
  for(let x=660;x<900;x+=14)line(c,[[x,30],[x-30,130]],'#7f8b4e',6);
  soft(c,780,80,140,70,'#94a06099');
  speckle(c,rng,5000,['#2a402c33','#e2d29a2a','#3e5a3a33']);
  tufts(c,rng,500,'#3d5c3a88');
  for(let x=0;x<WIDTH;x+=38)oak(c,x+rng()*20,24+rng()*14,.9+rng()*.4);
  road(c,[[0,396],[120,390],[260,380]],40);
  road(c,[[760,382],[880,372],[1000,360]],40);
  road(c,[[690,455],[750,520],[790,640]],34);
  soft(c,510,376,300,120,'#9b8a5c77');
  c.save();c.beginPath();c.ellipse(510,376,272,100,0,0,TAU);c.fillStyle='#a69a79';c.fill();c.clip();
  for(let y=270;y<480;y+=8)for(let x=230+((y/8)%2)*6;x<800;x+=12){
    oval(c,x+rng()*2,y+rng()*2,5.2,3.2,rng()<.5?'#b8ad8c':'#968a6a');
  }
  c.restore();
  c.strokeStyle='#5d5546';c.lineWidth=3;c.beginPath();c.ellipse(510,376,272,100,0,0,TAU);c.stroke();
  // molino
  c.save();c.translate(60,200);oval(c,10,4,30,8,'#16261b66');
  poly(c,[[-18,0],[-11,-62],[11,-62],[18,0]],'#d6c7a2','#5a4a3a',1.2);poly(c,[[-14,-60],[0,-80],[14,-60]],'#8a5a40','#4a3a2a',1);
  rect(c,-5,-18,10,18,'#6b4a2f');rect(c,-4,-44,8,9,'#2c3b40');c.restore();
  // campo de coles y huerto
  for(let r=0;r<4;r++)for(let k=0;k<7;k++){oval(c,212+k*17+r*4,530+r*18,6,4,'#5a8a4a');oval(c,211+k*17+r*4,528+r*18,3.5,2.5,'#8ab866');}
  fence(c,[[200,512],[340,512],[350,604]]);
  // corral de gallinas
  fence(c,[[460,532],[590,532],[600,600],[450,600],[460,532]],'#8a6a44');
  soft(c,525,566,70,32,'#b39e6a88');
  // pozo
  c.save();c.translate(736,548);oval(c,4,4,24,8,'#16261b66');rect(c,-18,-16,36,16,'#8a8270');oval(c,0,-16,18,6,'#9d9582');oval(c,0,-16,13,4,'#1f2a2a');
  rect(c,-17,-46,3,30,'#5a4330');rect(c,14,-46,3,30,'#5a4330');poly(c,[[-24,-44],[0,-58],[24,-44]],'#8a5a40');line(c,[[0,-46],[0,-24]],'#3a3128',1);rect(c,-3,-26,6,6,'#7a5a3a');c.restore();
  // carreta de heno
  c.save();c.translate(890,338);oval(c,0,8,40,8,'#16261b66');rect(c,-30,-14,56,14,'#8a6440');oval(c,-2,-20,28,12,'#d9c36b');for(let i=0;i<9;i++)line(c,[[-24+i*6,-26],[-26+i*6,-12]],'#b49a4a',1);
  c.strokeStyle='#4a3a2a';c.lineWidth=3;c.beginPath();c.arc(-18,2,9,0,TAU);c.stroke();c.beginPath();c.arc(16,2,9,0,TAU);c.stroke();line(c,[[26,-6],[46,0]],'#5a4330',3);c.restore();
  // cobertizo de la forja
  poly(c,[[650,270],[650,214],[722,196],[722,270]],'#3b342e');
  poly(c,[[640,214],[724,190],[730,200],[646,226]],'#5a5450','#2b2724',1.2);
  rect(c,650,214,4,56,'#5a4330');
  c.save();c.translate(672,262);rect(c,-16,-34,32,34,'#6a6258');c.fillStyle='#2a1a12';c.beginPath();c.roundRect(-9,-20,18,16,[9,9,0,0]);c.fill();c.restore();
  for(let i=0;i<4;i++)line(c,[[700+i*5,224],[700+i*5,246]],'#9aa0a0',1.6);
  barrel(c,708,286,1);
  // farolas, barriles y cajas
  for(const [x,y] of lanterns)lanternPost(c,x,y);
  barrel(c,342,470,1.1);barrel(c,356,482,1);crate(c,690,476,1.1);crate(c,672,488,.9,'#d9b06b');
  // bancos alrededor de la fuente
  for(const [x,y] of [[420,350],[600,350],[430,410],[592,410]]){rect(c,x-14,y-6,28,4,'#7a5a3a');rect(c,x-12,y-2,3,6,'#5a4330');rect(c,x+9,y-2,3,6,'#5a4330');}
  // fuente
  c.save();c.translate(510,380);oval(c,6,8,64,18,'#16261b66');
  oval(c,0,0,58,20,'#7d7765');oval(c,0,-4,58,20,'#a39c86');oval(c,0,-4,50,16,'#4f7d7b');oval(c,0,-6,44,12,'#5f8e8a');
  rect(c,-7,-40,14,36,'#a39c86');oval(c,0,-40,16,6,'#b7b09a');oval(c,0,-41,12,4,'#5f8e8a');c.restore();
  // parterres
  for(const [x,y] of [[360,560],[690,590],[300,300],[720,300]]){oval(c,x,y,22,8,'#5a4a34');for(let i=0;i<9;i++)oval(c,x-16+i*4,y-2-rng()*3,2,2,['#e3c35a','#d76f5a','#e8e2d0','#b57ab8'][i%4]);}
  oak(c,410,614,1.3);oak(c,640,622,1.2);oak(c,970,470,1.4);oak(c,250,600,1.1);oak(c,30,470,1.3);oak(c,365,250,.9);
  for(const o of villaHouses)house(c,o);
  c.save();c.translate(780,590);rect(c,-14,-36,3,36,'#5a4330');rect(c,12,-36,3,36,'#5a4330');line(c,[[-14,-34],[15,-34]],'#5a4330',2);
  for(const [i,col] of ['#b5483c','#3f6a8a','#e3c35a','#5f7a3c'].entries())poly(c,[[-11+i*6.5,-33],[-6+i*6.5,-33],[-5+i*6.5,-12],[-12+i*6.5,-12]],col);c.restore();
  // bandera del consejo
  rect(c,560,40,2.5,52,'#3a3128');
  // tablón
  c.save();c.translate(612,300);oval(c,0,3,22,5,'#16261b66');rect(c,-20,-40,3,40,'#5a4330');rect(c,17,-40,3,40,'#5a4330');
  rect(c,-22,-44,44,26,'#8a6440');for(const [px,py,col] of [[-16,-40,'#efe6d0'],[-4,-41,'#e8dcb8'],[8,-39,'#efe6d0'],[-12,-30,'#e0d0a8'],[4,-29,'#efe6d0']])rect(c,px,py,9,9,col);
  poly(c,[[-26,-44],[0,-54],[26,-44]],'#6a4a30');c.restore();
  // estandarte de la casa del héroe
  rect(c,206,452,2.5,60,'#3a3128');
  vignette(c);frame(c);
}
function drawStall(c,[x,y,aw,gd],t,i){
  const w=96;
  rect(c,x-w/2+4,y-62,4,62,'#5b4330');rect(c,x+w/2-8,y-62,4,62,'#5b4330');
  person(c,x+(i-1)*8,y-24,villagers[(i*2+1)%villagers.length],t,false,i%2?-1:1,1.3);
  rect(c,x-w/2,y-26,w,26,'#8a6440');rect(c,x-w/2,y-28,w,4,'#a37a50');
  for(let k=1;k<4;k++)line(c,[[x-w/2,y-26+k*6.5],[x+w/2,y-26+k*6.5]],'#6e4f33',1);
  for(let k=0;k<7;k++){const gx=x-w/2+10+k*12.5;oval(c,gx,y-30,5,3.5,gd[k%3]);oval(c,gx-1,y-31.5,2,1.2,'#ffffff55');}
  const sway=still()?0:Math.sin(t*1.3+i)*1.2;
  for(let k=0;k<8;k++){
    const x0=x-w/2-6+k*(w+12)/8,x1=x0+(w+12)/8;
    poly(c,[[x0+4,y-78],[x1+4,y-78],[x1,y-62+sway],[x0,y-62+sway]],aw[k%2]);
    oval(c,(x0+x1)/2,y-62+sway,(x1-x0)/2,4,aw[k%2]);
  }
  line(c,[[x-w/2-2,y-78],[x+w/2+10,y-78]],'#4a3a2a',2);
}
function animVilla(c,s,t){
  const dark=darknessAt(s);
  // aspas del molino
  c.save();c.translate(60,148);c.rotate(still()?.3:t*.6);
  for(let i=0;i<4;i++){c.rotate(TAU/4);rect(c,-1.5,0,3,46,'#5a4330');poly(c,[[1.5,8],[11,10],[11,44],[1.5,46]],'#e8dcc0','#7a6a50',1);}
  c.restore();oval(c,60,148,4,4,'#3a3128');
  // agua de la fuente
  for(let i=0;i<10;i++){
    const a=i/10*TAU,k=still()?.5:(t*.9+i*.1)%1;
    const px=510+Math.cos(a)*k*34,py=339-Math.sin(k*Math.PI)*16+k*30*(.3+Math.abs(Math.sin(a))*.2);
    oval(c,px,py,1.6,1.6,'rgba(220,240,240,'+(.85-k*.5)+')');
  }
  for(let i=0;i<3;i++){const k=still()?.5:(t*.5+i/3)%1;c.strokeStyle='rgba(220,240,240,'+(.5*(1-k))+')';c.lineWidth=1;c.beginPath();c.ellipse(510,374,10+k*36,3+k*10,0,0,TAU);c.stroke();}
  // humo
  for(const o of [inn,forgeHouse,home,house2,house4]){const [x,y]=chimneyOf(o);smoke(c,x,y,t+o.x*.01,o===forgeHouse?1.4:1);}
  smoke(c,672,226,t*1.3,1.2);
  // fuego de la forja
  const fl=still()?.8:.7+Math.sin(t*11)*.12+Math.sin(t*17)*.08;
  glow(c,672,248,40,'255,140,60',fl*.8);oval(c,672,250,7,5,'#ffb35a');oval(c,672,251,4,3,'#fff0b0');
  // herrero
  c.save();c.translate(700,288);oval(c,0,4,14,4,'#16261b66');poly(c,[[-10,-8],[-12,-12],[12,-12],[10,-8],[4,-8],[4,0],[-4,0],[-4,-8]],'#3a3a3e');c.restore();
  const hit=still()?0:Math.max(0,Math.sin(t*4));
  person(c,722,296,{body:'#6a4a3a',apron:'#3a3028',hair:'#2a1f18',ph:9},t,false,-1,1.35);
  c.save();c.translate(712,270);c.rotate(-1.2+hit*1.3);line(c,[[0,0],[0,-14]],'#5a4330',2.4);rect(c,-4,-18,8,5,'#8a8f98');c.restore();
  if(hit>.95)for(let i=0;i<6;i++){const a=-Math.PI/2+(i-2.5)*.4;line(c,[[700,277],[700+Math.cos(a)*12,277+Math.sin(a)*12]],'#ffd27a',1.4);}
  // puestos del mercado
  stalls.forEach((st,i)=>drawStall(c,st,t,i));
  // gallinas
  for(let i=0;i<6;i++){
    const [x,y,dir]=patrol([[470+i*8,560+(i%3)*10],[580-i*10,572-(i%2)*14]],t,9+i,i*7);
    const peck=still()?0:Math.max(0,Math.sin(t*5+i*2))*3;
    c.save();c.translate(x,y);c.scale(dir,1);oval(c,0,2,6,2,'#16261b55');oval(c,0,-4,6,4.5,i%3?'#efe6d4':'#b8784a');oval(c,5,-8+peck,3,3,i%3?'#efe6d4':'#b8784a');poly(c,[[7,-8+peck],[10,-7+peck],[7,-6+peck]],'#e2a040');oval(c,5,-11+peck,1.6,1.2,'#d04a3a');c.restore();
  }
  // aldeanos
  const paths=[
    [[230,276],[300,330],[420,430],[470,470]],
    [[694,300],[600,350],[420,372],[250,404],[150,470],[120,548]],
    [[0,398],[250,384],[380,338]],
    [[1000,362],[790,382],[660,432]],
    [[760,640],[720,470],[600,440]]
  ];
  paths.forEach((p,i)=>{const [x,y,dir,moving]=patrol(p,t,24+i*3,i*11);person(c,x,y,villagers[i],t,moving,dir);});
  for(let i=0;i<2;i++){
    const a=(still()?i*3:t*.18)+i*Math.PI,x=510+Math.cos(a)*170,y=380+Math.sin(a)*62;
    person(c,x,y,villagers[5+i],t,true,-Math.sin(a)>0?1:-1);
  }
  // bandera y estandarte
  const wv=still()?0:t*4;
  c.beginPath();c.moveTo(562,42);for(let k=0;k<=8;k++)c.lineTo(562+k*4,42+Math.sin(wv+k*.7)*2);for(let k=8;k>=0;k--)c.lineTo(562+k*4,60+Math.sin(wv+k*.7)*2);c.fillStyle='#b5483c';c.fill();
  c.beginPath();c.moveTo(208,454);for(let k=0;k<=6;k++)c.lineTo(208+k*4,454+Math.sin(wv+k*.8)*1.6);for(let k=6;k>=0;k--)c.lineTo(208+k*4,478+Math.sin(wv+k*.8)*1.6);c.fillStyle=classes[s.classIndex].color;c.fill();
  c.font='bold 11px Georgia';c.fillStyle='#1f2a22';c.textAlign='center';c.fillText(classes[s.classIndex].icon,220,470);
  // héroe
  if(s.zone==='villa'&&s.state!=='travel'){
    const resting=s.hp<maxHP(s);
    if(resting)heroFigure(c,s,268,300,t,-1,'rest');else heroFigure(c,s,560,440,t,-1,'idle');
  }else if(s.state==='travel'&&(s.target==='villa'||s.zone==='villa')){
    const other=s.target==='villa'?s.zone:s.target,arriving=s.target==='villa';
    const lanes={meadow:[[250,384],[0,398]],forest:[[250,384],[0,398]],quarry:[[770,382],[1000,362]],ridge:[[770,382],[1000,362]],water:[[690,455],[780,620]]};
    const [[ax,ay],[bx,by]]=lanes[other]??lanes.meadow,k=still()?.5:(t*.2)%1,f=arriving?1-k:k;
    heroFigure(c,s,ax+(bx-ax)*f,ay+(by-ay)*f,t,(bx>ax)!==arriving?1:-1,'walk');
  }
  // noche
  nightTint(c,dark);
  windowLights(c,villaHouses,dark,t);
  for(const [x,y] of lanterns){glow(c,x+8,y-26,38,'255,200,110',dark*.85);oval(c,x+8.5,y-26.5,2.6,3.4,'rgba(255,230,160,'+Math.max(.2,dark)+')');}
  glow(c,672,248,70,'255,140,60',dark*.4);
}
function nightTint(c,dark){
  if(dark>0)rect(c,0,0,WIDTH,HEIGHT,'rgba(17,26,52,'+(dark*.42)+')');
}

/* ---------- zonas ---------- */
function paintMeadow(c){
  const rng=rngFor(101);
  ground(c,'#86a35a','#6b8a4c');
  soft(c,280,180,280,140,'#a3b8689a');soft(c,760,420,300,150,'#9ab06488');soft(c,600,130,200,90,'#b0c27a77');
  speckle(c,rng,7000,['#3a5a3033','#f0e6b02e','#4c6c3c33']);
  tufts(c,rng,900,'#4c6f3e88');
  c.strokeStyle='#6f9ec0';c.lineWidth=14;c.lineCap='round';c.beginPath();c.moveTo(1010,40);c.bezierCurveTo(820,120,900,240,640,260);c.bezierCurveTo(520,270,560,120,420,-10);c.stroke();
  c.strokeStyle='#9cc6d8';c.lineWidth=5;c.stroke();
  road(c,[[1010,350],[880,360],[700,390],[560,400],[440,380]],36);
  for(let i=0;i<900;i++){const x=rng()*WIDTH,y=rng()*HEIGHT;oval(c,x,y,1.4,1.4,['#f4efe0','#f0d25a','#e89ab0','#c0a0e0'][i%4]);}
  // guarida
  soft(c,190,520,170,80,'#5a604a88');
  c.save();c.translate(170,505);
  for(const [x,y,s] of [[-70,10,2.4],[60,20,2.1],[-20,-30,3.4],[40,-26,2.8],[-60,-20,2]])stone(c,x,y,s,'#7d7f6e');
  oval(c,8,-6,26,16,'#1d211c');oval(c,8,-2,20,9,'#0f120f');
  for(const [x,y] of [[-30,30],[50,36],[0,44]]){line(c,[[x,y],[x+10,y-3]],'#e8e2d0',2.2);oval(c,x,y,2,2,'#e8e2d0');oval(c,x+10,y-3,2,2,'#e8e2d0');}
  c.restore();
  // huerto
  const fruitTrees=[];for(let i=0;i<14;i++)fruitTrees.push([90+rng()*340,90+rng()*210,1.7+rng()*.6]);
  fruitTrees.sort((a,b)=>a[1]-b[1]).forEach(([x,y,s])=>oak(c,x,y,s,['#4f5a34','#6f7e42','#9aa85a','#c8cf86'],'#d0703e'));
  for(const [x,y] of [[300,330],[210,320]])bush(c,x,y,1.8,'#a03a5a');
  c.save();c.translate(410,326);rect(c,-10,-14,20,14,'#a0784a');for(let i=0;i<6;i++)oval(c,-7+i*3,-15,2.4,2.4,'#d0703e');c.restore();
  for(let i=0;i<12;i++)oak(c,620+rng()*360,520+rng()*120,1.2+rng()*.6);
  for(let i=0;i<6;i++)oak(c,840+rng()*160,60+rng()*120,1.4+rng()*.5);
  fence(c,[[470,470],[560,520],[680,540]],'#8a6a44');
  vignette(c);frame(c);
}
function paintForest(c){
  const rng=rngFor(202);
  ground(c,'#46613f','#2e4a33');
  speckle(c,rng,7000,['#1e33233a','#8a6a3a33','#a0784a2a','#5a7a4a33']);
  for(let i=0;i<300;i++){const x=rng()*WIDTH,y=rng()*HEIGHT;oval(c,x,y,2.6,1.4,['#8a6a3a66','#a0784a55','#6a5a2a66'][i%3]);}
  tufts(c,rng,400,'#5a7a4a77');
  road(c,[[1010,440],[880,430],[720,410],[600,420]],30);
  soft(c,380,380,180,90,'#7a8a4a66');
  // tocón y leña
  c.save();c.translate(330,400);oval(c,0,4,20,7,'#16261b66');rect(c,-14,-12,28,14,'#7a5a3a');oval(c,0,-12,14,5,'#c9a46b');for(let r=3;r<13;r+=3){c.strokeStyle='#9a7448';c.lineWidth=.8;c.beginPath();c.ellipse(0,-12,r,r*.36,0,0,TAU);c.stroke();}
  line(c,[[2,-14],[16,-30]],'#6a4a30',3);poly(c,[[12,-34],[22,-30],[18,-24],[14,-28]],'#a8aea8');c.restore();
  for(let r=0;r<3;r++)for(let k=0;k<4-r;k++){c.save();c.translate(410+k*16+r*8,420-r*12);oval(c,0,0,8,7,'#7a5a3a');oval(c,0,0,5,4.5,'#c9a46b');c.restore();}
  for(const [x,y] of [[250,350],[460,360],[230,440]])bush(c,x,y,1.7,'#3a3a8a');
  // tronco caído
  c.save();c.translate(560,540);c.rotate(-.12);rect(c,-70,-12,140,22,'#5a4330');oval(c,70,-1,6,11,'#c9a46b');for(let i=0;i<6;i++)oval(c,-50+i*20,-12,5,3,'#5a8a4a');c.restore();
  // telarañas
  const web=(x,y,r)=>{c.strokeStyle='#e8e6dc66';c.lineWidth=1;for(let i=0;i<10;i++){const a=i/10*TAU;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);c.stroke();}for(let k=1;k<6;k++){c.beginPath();for(let i=0;i<=10;i++){const a=i/10*TAU,rr=r*k/6;i?c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr):c.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}c.stroke();}};
  soft(c,760,240,200,130,'#14201aaa');
  // setas
  for(let i=0;i<26;i++){const x=rng()*WIDTH,y=200+rng()*400;rect(c,x-1,y-5,2,5,'#e8e2d0');oval(c,x,y-6,4,2.6,i%3?'#c0443a':'#d9b06b');oval(c,x-1,y-7,1,1,'#fff');}
  const trees=[];
  for(let i=0;i<34;i++)trees.push([rng()*WIDTH,10+rng()*150,2.4+rng()*1.2]);
  for(let i=0;i<10;i++)trees.push([620+rng()*380,150+rng()*190,2.2+rng()*1]);
  for(let i=0;i<14;i++)trees.push([rng()*200,180+rng()*440,2.2+rng()*1]);
  for(let i=0;i<10;i++)trees.push([700+rng()*300,500+rng()*140,2+rng()*.8]);
  trees.sort((a,b)=>a[1]-b[1]).forEach(([x,y,s],i)=>i%5?oak(c,x,y,s,['#203a2a','#2f4f36','#45683f','#6a8a52']):pine(c,x,y,s*.9));
  web(700,230,46);web(850,300,34);web(780,140,30);
  vignette(c);frame(c);
}
function lakePath(c){
  c.beginPath();c.moveTo(250,250);c.bezierCurveTo(260,120,480,80,640,110);c.bezierCurveTo(840,140,930,250,900,360);
  c.bezierCurveTo(870,470,700,500,560,480);c.bezierCurveTo(400,470,240,400,250,250);c.closePath();
}
function paintWater(c){
  const rng=rngFor(303);
  ground(c,'#6f8f58','#58784a');
  speckle(c,rng,5000,['#2a402c33','#e2d29a2a']);tufts(c,rng,500,'#3d5c3a88');
  road(c,[[-10,-10],[80,60],[170,130]],30);
  c.save();c.translate(0,6);lakePath(c);c.fillStyle='#c9b98a';c.fill();c.restore();
  lakePath(c);c.lineWidth=16;c.strokeStyle='#cdbd8e';c.stroke();
  const wg=c.createLinearGradient(0,100,0,500);wg.addColorStop(0,'#3f6f78');wg.addColorStop(1,'#2f5a64');lakePath(c);c.fillStyle=wg;c.fill();
  c.save();lakePath(c);c.clip();
  soft(c,560,280,260,130,'#5f9a9a66');
  for(let i=0;i<120;i++){const x=260+rng()*640,y=110+rng()*370;line(c,[[x,y],[x+8+rng()*16,y]],'#a8d0c844',1.2);}
  c.restore();
  // juncos
  for(const [cx,cy,n] of [[270,320,22],[880,300,18],[620,480,14],[340,150,14]])for(let i=0;i<n;i++){const x=cx+(rng()-.5)*60,y=cy+(rng()-.5)*30,h=14+rng()*16;line(c,[[x,y],[x+(rng()-.5)*5,y-h]],'#5a7a3a',1.6);if(i%3===0)oval(c,x,y-h,1.8,4,'#6a4a2a');}
  // nenúfares
  for(let i=0;i<14;i++){const x=650+rng()*200,y=360+rng()*90;oval(c,x,y,9,4,'#4a7f4f');if(i%4===0)oval(c,x+2,y-2,3,2,'#f0c0d0');}
  // muelle
  c.save();rect(c,462,420,46,200,'#7a5a3a');for(let y=424;y<620;y+=10)line(c,[[462,y],[508,y]],'#5a4330',1.4);
  for(const y of [430,500,570])for(const x of [458,508])rect(c,x,y,5,18,'#4a3828');
  c.restore();
  c.save();c.translate(540,430);c.rotate(.1);oval(c,0,0,34,11,'#5a4330');oval(c,0,-2,30,8,'#8a6440');line(c,[[-30,0],[-60,-14]],'#c9b98a',1);c.restore();
  barrel(c,476,600,1);crate(c,494,610,1);
  const trees=[];
  for(let i=0;i<16;i++)trees.push([rng()*230,140+rng()*480,1.8+rng()*.8]);
  for(let i=0;i<12;i++)trees.push([300+rng()*700,rng()*90,1.6+rng()*.6]);
  for(let i=0;i<10;i++)trees.push([700+rng()*300,520+rng()*120,1.7+rng()*.6]);
  trees.sort((a,b)=>a[1]-b[1]).forEach(([x,y,s],i)=>i%3?oak(c,x,y,s):pine(c,x,y,s));
  for(let r=0;r<3;r++)for(let k=0;k<3-r;k++){c.save();c.translate(160+k*16+r*8,560-r*12);oval(c,0,0,8,7,'#7a5a3a');oval(c,0,0,5,4.5,'#c9a46b');c.restore();}
  vignette(c);frame(c);
}
function paintQuarry(c){
  const rng=rngFor(404);
  ground(c,'#9a927c','#857d68');
  const bands=[[0,'#5d5a50'],[70,'#6d6a5e'],[140,'#7d7969'],[205,'#8b8571']];
  for(const [y,col] of [...bands].reverse()){
    const pts=[[0,y-20]];for(let x=0;x<=WIDTH;x+=40)pts.push([x,y+Math.sin(x*.03+y)*12+rng()*10]);pts.push([WIDTH,y-20]);
    const fill=[[0,0],...pts,[WIDTH,0]];poly(c,fill,col);
    const edge=pts.slice(1,-1);line(c,edge,shade(col,.2),3);line(c,edge.map(([x,yy])=>[x,yy+5]),shade(col,-.25),2);
  }
  for(let i=0;i<60;i++){const x=rng()*WIDTH,y=rng()*200;line(c,[[x,y],[x+(rng()-.5)*12,y+10+rng()*20]],'#3a383233',1.2);}
  speckle(c,rng,8000,['#5a554833','#c8c0a833','#6a645433'],[0,200,WIDTH,420]);
  for(let i=0;i<120;i++)oval(c,rng()*WIDTH,230+rng()*390,1.5+rng()*3,1+rng()*2,'#6f6a5a');
  road(c,[[-10,500],[100,500],[230,490],[360,470]],32);
  // mina
  c.save();c.translate(310,215);oval(c,0,4,60,12,'#2a2a2466');
  c.fillStyle='#14120f';c.beginPath();c.roundRect(-34,-62,68,62,[30,30,0,0]);c.fill();
  rect(c,-40,-66,9,66,'#6a4a30');rect(c,31,-66,9,66,'#6a4a30');rect(c,-46,-72,92,10,'#7a5a3a');
  c.restore();
  // raíles
  for(let i=0;i<14;i++){const k=i/13,x=310+k*120,y=220+k*270;line(c,[[x-16,y],[x+16,y]],'#5a4330',3);}
  line(c,[[296,218],[416,490]],'#8a8f98',2);line(c,[[324,218],[444,490]],'#8a8f98',2);
  c.save();c.translate(392,410);oval(c,0,8,28,7,'#2a2a2466');poly(c,[[-24,-16],[24,-16],[18,6],[-18,6]],'#5a5a5e','#2a2a2e',1.4);
  for(let i=0;i<7;i++)rock(c,-15+i*5,-16,.35,i%2?'iron':'stone');
  c.strokeStyle='#2a2a2e';c.lineWidth=3;c.beginPath();c.arc(-12,8,5,0,TAU);c.stroke();c.beginPath();c.arc(12,8,5,0,TAU);c.stroke();c.restore();
  // vetas
  const ores=[];for(let i=0;i<22;i++)ores.push([150+rng()*330,260+rng()*230,1.6+rng()*1.4,i%3?'iron':'stone']);
  ores.sort((a,b)=>a[1]-b[1]).forEach(([x,y,s,k])=>rock(c,x,y,s,k));
  // andamio
  c.save();c.translate(470,190);for(const x of [0,40])rect(c,x,-80,4,80,'#6a4a30');for(const y of [-30,-60])rect(c,-6,y,56,4,'#7a5a3a');line(c,[[0,0],[44,-60]],'#6a4a30',2);c.restore();
  // círculo del gólem
  soft(c,730,450,170,70,'#4a463a99');
  c.strokeStyle='#c8a06a55';c.lineWidth=2;c.beginPath();c.ellipse(730,450,120,40,0,0,TAU);c.stroke();
  for(let i=0;i<8;i++){const a=i/8*TAU;c.save();c.translate(730+Math.cos(a)*120,450+Math.sin(a)*40);rect(c,-6,-26,12,26,'#7d7969');rect(c,-7,-28,14,4,'#9a9483');if(i%3===1){rect(c,-6,-26,12,10,'#6d6a5e');}c.restore();}
  for(let i=0;i<10;i++)stone(c,580+rng()*400,520+rng()*100,1+rng()*1.4);
  vignette(c);frame(c);
}
function paintRidge(c){
  const rng=rngFor(505);
  const sky=c.createLinearGradient(0,0,0,240);sky.addColorStop(0,'#5d6f80');sky.addColorStop(1,'#a8b8c0');rect(c,0,0,WIDTH,260,sky);
  const peaks=[[120,250,180,'#6a7a84'],[330,250,230,'#5f7080'],[560,250,260,'#6a7a84'],[800,250,220,'#5a6a78'],[980,250,190,'#66768a']];
  for(const [x,y,h,col] of peaks){
    poly(c,[[x-190,y],[x,y-h],[x+190,y]],col);poly(c,[[x,y-h],[x+190,y],[x+30,y]],shade(col,-.18));
    poly(c,[[x-60,y-h+64],[x,y-h],[x+60,y-h+64],[x+30,y-h+50],[x+8,y-h+70],[x-20,y-h+52]],'#eef2f2');
  }
  const g=c.createLinearGradient(0,200,0,620);g.addColorStop(0,'#dfe5e2');g.addColorStop(1,'#b8c3c0');
  const pts=[[0,240]];for(let x=0;x<=WIDTH;x+=50)pts.push([x,230+Math.sin(x*.012)*20+rng()*8]);
  poly(c,[...pts,[WIDTH,HEIGHT],[0,HEIGHT]],g);
  speckle(c,rng,4000,['#9aa8b033','#ffffff55'],[0,240,WIDTH,380]);
  for(let i=0;i<14;i++)soft(c,rng()*WIDTH,280+rng()*320,60+rng()*80,14+rng()*12,'#9fb0bc66');
  road(c,[[-10,560],[120,540],[240,500],[330,470]],28);
  for(let i=0;i<14;i++)stone(c,rng()*WIDTH,280+rng()*340,1+rng()*1.6,'#6f7478');
  // cristales
  const crystal=(x,y,s,col)=>{c.save();c.translate(x,y);c.scale(s,s);oval(c,0,2,16,4,'#2c3b4544');
    for(const [dx,h,w] of [[-8,26,6],[0,40,8],[9,30,6],[-14,16,5],[14,18,5]]){poly(c,[[dx-w,0],[dx-w*.7,-h*.8],[dx,-h],[dx+w*.7,-h*.8],[dx+w,0]],col,'#e8faff',.8);poly(c,[[dx,-h],[dx+w*.7,-h*.8],[dx+w,0],[dx,0]],shade(col,-.2));}
    c.restore();};
  for(const [x,y,s,col] of [[200,400,1.8,'#9fd8e0'],[280,460,1.3,'#b8a6e0'],[150,480,1.1,'#9fd8e0'],[330,380,1,'#c8b8f0'],[240,330,1.2,'#9fd8e0']])crystal(x,y,s,col);
  for(let i=0;i<8;i++)rock(c,380+rng()*140,420+rng()*160,1.6,'iron');
  // altar
  soft(c,730,420,160,60,'#8aa0b088');
  for(let i=0;i<7;i++){const a=i/7*TAU;c.save();c.translate(730+Math.cos(a)*110,420+Math.sin(a)*36);poly(c,[[-7,0],[-5,-34],[0,-40],[5,-34],[7,0]],'#7a8288','#4a5258',1);c.restore();}
  // árbol seco
  c.save();c.translate(900,330);line(c,[[0,0],[0,-70]],'#3a3128',5);line(c,[[0,-40],[-24,-62]],'#3a3128',3);line(c,[[0,-55],[20,-80]],'#3a3128',3);line(c,[[-12,-50],[-18,-74]],'#3a3128',2);c.restore();
  for(let i=0;i<8;i++)pine(c,60+rng()*160,560+rng()*60,1.6,undefined,true);
  for(let i=0;i<6;i++)pine(c,820+rng()*170,480+rng()*140,1.6,undefined,true);
  vignette(c);frame(c);
}
function animZone(c,s,t,id){
  const dark=darknessAt(s);
  if(id==='meadow'){
    [[740,190,0],[810,230,2],[700,250,4]].forEach(([x,y,ph],i)=>{const d=still()?0:Math.sin(t*.25+ph)*18;animal(c,x+d,y,'deer',2.3-(i===2?.4:0));});
    for(let i=0;i<4;i++)rabbit(c,520+i*70+(still()?0:Math.sin(t*.4+i)*20),300+(i%2)*60,t,1.6,i);
    for(let i=0;i<5;i++){const a=t*.8+i*1.3,x=600+Math.cos(a+i)*200,y=330+Math.sin(a*1.3)*60,f=still()?1:Math.abs(Math.sin(t*12+i));c.fillStyle=['#f4efe0','#f0d25a','#e89ab0'][i%3];c.beginPath();c.ellipse(x-3,y,3*f+.5,2.5,0,0,TAU);c.ellipse(x+3,y,3*f+.5,2.5,0,0,TAU);c.fill();}
  }
  if(id==='forest'){
    if(!still())for(let i=0;i<4;i++){const x=200+i*200+Math.sin(t*.2+i)*20;c.fillStyle='rgba(255,240,190,'+(.08*(1-dark))+')';c.beginPath();c.moveTo(x,0);c.lineTo(x+60,0);c.lineTo(x-80,620);c.lineTo(x-170,620);c.fill();}
    [[200,520,0],[300,560,3]].forEach(([x,y,ph])=>{const [px,py,dir]=patrol([[x-60,y],[x+80,y+10]],t,14,ph*5);c.save();c.translate(px,py);c.scale(dir,1);animal(c,0,0,'boar',2.4);c.restore();});
    for(let i=0;i<12;i++){const k=still()?i/12:(t*.08+i/12)%1;const x=(i*97)%WIDTH+Math.sin(k*10+i)*20,y=k*HEIGHT;c.save();c.translate(x,y);c.rotate(k*8+i);oval(c,0,0,3,1.6,['#c98a3a','#a0602a','#d9b06b'][i%3]);c.restore();}
    if(dark>.2)for(let i=0;i<20;i++){const x=(i*173)%WIDTH+Math.sin(t+i)*14,y=200+(i*67)%400+Math.cos(t*.8+i)*10;glow(c,x,y,8,'220,255,140',dark*(.5+Math.sin(t*3+i)*.4));}
  }
  if(id==='water'){
    c.save();lakePath(c);c.clip();
    for(let i=0;i<16;i++){const k=still()?.5:(t*.05+i/16)%1,x=280+((i*131)%600),y=130+((i*71)%340);line(c,[[x+k*30,y],[x+k*30+20,y]],'rgba(220,240,240,'+(.35*Math.sin(k*Math.PI))+')',1.4);}
    const jump=still()?-1:(t*.4)%3;if(jump>=0&&jump<1){const x=420+Math.floor(t*.4/3)%3*120,y=260;c.save();c.translate(x+jump*30,y-Math.sin(jump*Math.PI)*30);c.rotate(-1+jump*2);oval(c,0,0,8,3.4,'#c8d4c8');poly(c,[[-8,0],[-13,-4],[-13,4]],'#a8b4a8');c.restore();}
    c.restore();
    for(let i=0;i<4;i++){const a=(still()?0:t*.15)+i*1.5,x=440+Math.cos(a)*110,y=210+Math.sin(a)*40;c.save();c.translate(x,y);c.scale(-Math.sin(a)>0?1:-1,1);animal(c,0,0,'duck',2.1);c.restore();c.strokeStyle='rgba(220,240,240,.3)';c.lineWidth=1;c.beginPath();c.ellipse(x,y+5,16,3,0,0,TAU);c.stroke();}
  }
  if(id==='quarry'){
    [[760,110,0],[850,90,2],[930,130,4]].forEach(([x,y,ph])=>{const d=still()?0:Math.sin(t*.2+ph)*14;animal(c,x+d,y,'goat',2.2);});
    for(let i=0;i<14;i++){const k=still()?.5:(t*.1+i/14)%1;oval(c,(i*83)%WIDTH+k*40,300+((i*57)%300)-k*30,1.6,1.6,'rgba(220,210,190,'+(.4*(1-k))+')');}
    glow(c,310,190,30,'255,200,110',.5+dark*.4);
  }
  if(id==='ridge'){
    for(let i=0;i<3;i++){const a=(still()?i:t*.5)+i*2.1;const x=880+Math.cos(a)*60,y=160+Math.sin(a)*24;c.save();c.translate(x,y);animal(c,0,0,'crow',2);c.restore();}
    for(const [x,y] of [[200,360],[280,430],[150,460]])glow(c,x,y,46,'160,230,240',.25+(still()?0:Math.sin(t*2+x)*.1));
  }
  drawCombat(c,s,t,id);
  if(id==='ridge'&&!still())for(let i=0;i<80;i++){const k=(t*.07+i/80)%1,x=((i*137)%WIDTH)+Math.sin(t+i)*20-k*80,y=k*HEIGHT;oval(c,x,y,1.6,1.6,'rgba(255,255,255,.8)');}
  nightTint(c,dark);
  for(const f of [...s.foes[id],s.bossState[id]])if(f.alive){
    if(id==='quarry')glow(c,f.x,f.y-50,40,'255,150,70',dark*.6);
    if(id==='ridge')glow(c,f.x,f.y-70,60,'150,220,235',dark*.6);
  }
  if(id==='water')mist(c,t*2.2,.9+dark*.8);else mist(c,t*1.2,.5);
  overlay(c,s,id);
}


/* ---------- combate visible ---------- */
const heights={meadow:26,forest:20,water:28,quarry:90,ridge:115};
const scales={meadow:[1.5,2.4],forest:[1.5,2.4],water:[1.25,2.1],quarry:[1.05,1.6],ridge:[1,1.55]};
function bar(c,x,y,w,frac,col,h=5){
  c.fillStyle='#0d1410d9';c.beginPath();c.roundRect(x-w/2-1.5,y-1.5,w+3,h+3,3);c.fill();
  c.fillStyle=col;c.beginPath();c.roundRect(x-w/2,y,Math.max(0,w*Math.min(1,frac)),h,2);c.fill();
}
function sprite(c,id,x,y,t,dir,boss,i){
  const sc=scales[id][boss?1:0];
  if(id==='meadow')wolf(c,x,y,t,dir,sc,i);
  if(id==='forest')spider(c,x,y,t,sc);
  if(id==='water')toad(c,x,y,t,sc,i,boss);
  if(id==='quarry')golem(c,x,y,t,sc);
  if(id==='ridge')guardian(c,x,y,t,sc);
}
function crown(c,x,y){
  poly(c,[[x-12,y],[x-12,y-10],[x-6,y-5],[x,y-13],[x+6,y-5],[x+12,y-10],[x+12,y]],'#e8c060','#7a5a20',1.2);
  for(const dx of [-8,0,8])oval(c,x+dx,y-3,1.6,1.6,'#c0443a');
}
function drawFoe(c,s,id,f,boss,i,t){
  const el=s.elapsed,z=byId[id],st=boss?z.boss:z.foe,H=heights[id]*scales[id][boss?1:0];
  const dead=!f.alive,k=dead?(el-f.deadAt)/1.3:0;
  if(dead&&k>1)return;
  const born=el-f.deadAt-16,alpha=dead?1-k:(born>=0&&born<.6?born/.6:1);
  const dir=s.zone===id&&s.state==='field'&&s.lx<f.x?-1:1;
  let x=f.x;const y=f.y;
  if(!dead&&el-f.atkAt<.28)x+=dir*Math.sin((el-f.atkAt)/.28*Math.PI)*14;
  if(el-f.hitAt<.2)x-=dir*Math.sin((el-f.hitAt)/.2*Math.PI)*6;
  if(boss&&!dead)glow(c,x,y-H*.4,H*.9,'200,60,40',.22+(still()?0:Math.sin(t*2)*.06));
  c.save();c.globalAlpha=Math.max(0,alpha);
  if(dead){c.translate(x,y);c.rotate(-dir*k*1.5);c.translate(-x,-y);}
  if(el-f.hitAt<.12)c.filter='brightness(1.9)';
  sprite(c,id,x,y,t,dir,boss,i);
  c.restore();
  if(dead)return;
  if(boss)crown(c,x,y-H-6);
  if(f.hp<st.hp||f.engaged)bar(c,f.x,f.y-H-(boss?28:14),boss?96:46,f.hp/st.hp,boss?'#e0604a':'#d9534a',boss?7:5);
  if(boss){c.font='bold 13px Georgia';c.textAlign='center';c.lineWidth=3;c.strokeStyle='#0d1410';c.strokeText(st.name,f.x,f.y-H-36);c.fillStyle='#ffd98f';c.fillText(st.name,f.x,f.y-H-36);}
}
const lastHero={x:0,y:0,id:null};
function drawCombat(c,s,t,id){
  const z=byId[id],b=s.bossState[id],el=s.elapsed;
  if(!b.alive){
    const [bx,by]=z.layout.boss;
    rect(c,bx-2,by-44,4,44,'#5a4330');poly(c,[[bx+2,by-44],[bx+30,by-38],[bx+2,by-30]],'#c9a46b');
    stone(c,bx+16,by+4,1.2,'#8a8a7a');
    const left=Math.max(0,300-(el-b.deadAt)),m=Math.floor(left/60),sec=String(Math.floor(left%60)).padStart(2,'0');
    c.font='bold 12px system-ui, sans-serif';c.textAlign='center';c.lineWidth=3;c.strokeStyle='#0d1410';
    const txt=z.boss.name+' derrotado · vuelve en '+m+':'+sec;c.strokeText(txt,bx,by-52);c.fillStyle='#e8dcb8';c.fillText(txt,bx,by-52);
  }
  const list=[...s.foes[id].map((f,i)=>[f,false,i]),[b,true,9]].sort((p,q)=>p[0].y-q[0].y);
  const heroHere=s.zone===id&&s.state==='field';
  let heroDrawn=!heroHere;
  const drawHero=()=>{
    heroDrawn=true;
    const moving=lastHero.id===id&&Math.hypot(s.lx-lastHero.x,s.ly-lastHero.y)>.15;
    Object.assign(lastHero,{x:s.lx,y:s.ly,id});
    const sw=el-s.swingAt,fighting=s.task==='fight',cls=classes[s.classIndex],ranged=cls.range>60;
    const action=moving?'walk':fighting?'hunt':s.task==='gather'?'gather':'idle';
    let hx=s.lx;
    if(fighting&&!ranged&&sw<.25)hx+=s.face*Math.sin(sw/.25*Math.PI)*12;
    heroFigure(c,s,hx,s.ly,t,s.face,action,{swing:fighting&&sw<.3?sw/.3:-1,hurt:el-s.hurtAt<.2});
    bar(c,s.lx,s.ly-80,58,s.hp/maxHP(s),'#8fc46a',6);
    const tgt=fighting?(s.target==='boss'?b:s.foes[id][s.target]):null;
    if(tgt&&sw<.3){
      const p=sw/.3,sx=s.lx+s.face*14,sy=s.ly-40,tx=tgt.x,ty=tgt.y-heights[id]*scales[id][s.target==='boss'?1:0]*.5;
      if(ranged){
        const px=sx+(tx-sx)*p,py=sy+(ty-sy)*p-Math.sin(p*Math.PI)*18;
        if(cls.name==='Mago'){glow(c,px,py,18,'190,150,255',.9);oval(c,px,py,4,4,'#f2e8ff');for(let k=1;k<4;k++)glow(c,px-(tx-sx)*.05*k,py-(ty-sy)*.05*k,8,'190,150,255',.5-k*.12);}
        else{const a=Math.atan2(ty-sy,tx-sx);c.save();c.translate(px,py);c.rotate(a);line(c,[[-14,0],[6,0]],'#e8dcc0',2);poly(c,[[6,-3],[12,0],[6,3]],'#cfd3cc');poly(c,[[-14,0],[-18,-4],[-12,0],[-18,4]],'#c0443a');c.restore();}
      }else if(sw<.22){
        const k=sw/.22;c.strokeStyle='rgba(255,240,200,'+(1-k)+')';c.lineWidth=5-3*k;c.lineCap='round';
        c.beginPath();c.arc(s.lx+s.face*20,s.ly-34,22+k*8,s.face>0?-1.4:Math.PI-1.1,s.face>0?1.1:Math.PI+1.4);c.stroke();
      }
    }
    if(el-s.potionAt<.8){const k=(el-s.potionAt)/.8;for(let i=0;i<6;i++)oval(c,s.lx+Math.cos(i)*16,s.ly-20-k*40-i*3,2.5*(1-k)+.5,2.5*(1-k)+.5,'#8fe07a');}
  };
  for(const [f,boss,i] of list){
    if(!heroDrawn&&s.ly<f.y)drawHero();
    drawFoe(c,s,id,f,boss,i,t);
  }
  if(!heroDrawn)drawHero();
  if(s.state==='travel'&&(s.target===id||s.zone===id)){
    const [ex,ey]=z.layout.entry,k=still()?.5:(t*.25)%1,toward=s.target===id,[gx,gy]=z.layout.gather,f=toward?k:1-k;
    heroFigure(c,s,ex+(gx-ex)*f*.4,ey+(gy-ey)*f*.4,t,(gx>ex)===toward?1:-1,'walk');
  }
}
const fxStyle={dmg:['bold 19px','#fff3c8',1.1],crit:['bold 27px','#ffb340',1.3],hurt:['bold 19px','#ff7a6a',1.1],heal:['bold 20px','#8fe07a',1.4],
  loot:['bold 14px','#ffd98f',2.2],gather:['bold 14px','#e8f0c8',1.6],level:['bold 28px','#ffe08a',2.4],fall:['bold 24px','#ff6a5a',2]};
function overlay(c,s,id){
  for(const e of fx){
    if(e.zone!==id)continue;
    const age=s.elapsed-e.at;
    if(e.kind==='spawn'){if(age<.7){const k=age/.7;for(let i=0;i<8;i++){const a=i/8*TAU;oval(c,e.x+Math.cos(a)*k*28,e.y+30+Math.sin(a)*k*10,6*(1-k)+1,4*(1-k)+1,'rgba(220,220,210,'+(1-k)+')');}}continue;}
    const [font,col,life]=fxStyle[e.kind]??fxStyle.dmg,k=age/life;
    if(k<0||k>1)continue;
    if(e.kind==='level'){c.strokeStyle='rgba(255,224,138,'+(1-k)+')';c.lineWidth=4;c.beginPath();c.ellipse(e.x,e.y+60,20+k*70,8+k*24,0,0,TAU);c.stroke();}
    const pop=e.kind==='crit'&&k<.15?1+(.15-k)*3:1;
    c.save();c.globalAlpha=1-k*k;c.translate(e.x,e.y-k*44);c.scale(pop,pop);
    c.font=font+' Georgia, serif';c.textAlign='center';c.textBaseline='middle';c.lineWidth=4;c.strokeStyle='#160f0a';c.lineJoin='round';
    c.strokeText(e.text,0,0);c.fillStyle=col;c.fillText(e.text,0,0);c.restore();
  }
  const b=s.bossState[id];
  if(b.engaged&&b.alive&&s.zone===id){
    const st=byId[id].boss;
    c.fillStyle='#0d1410cc';c.beginPath();c.roundRect(250,18,500,44,8);c.fill();
    c.font='bold 15px Georgia';c.textAlign='center';c.fillStyle='#ffd98f';c.fillText(st.name+' · '+st.title,500,34);
    bar(c,500,44,470,b.hp/st.hp,'#e0604a',10);
    c.font='bold 10px system-ui';c.fillStyle='#fff';c.fillText(Math.max(0,Math.ceil(b.hp))+' / '+st.hp,500,49.5);
  }
}

export const scenes={
  villa:{paint:paintVilla,spots:[
    {id:'inn',kind:'inn',icon:'☾',label:'Posada',rect:[120,90,270,185],at:[235,96]},
    {id:'board',kind:'board',icon:'✉',label:'Tablón',rect:[412,40,230,268],at:[505,56]},
    {id:'forge',kind:'forge',icon:'⚒',label:'Herrería',rect:[636,150,310,150],at:[800,150]},
    {id:'market',kind:'market',icon:'⚖',label:'Mercado',rect:[340,392,340,100],at:[510,392]},
    {id:'tailor',kind:'tailor',icon:'❖',label:'Sastrería',rect:[760,455,230,140],at:[880,462]},
    {id:'home',kind:'home',icon:'⌂',label:'Tu casa',rect:[30,420,215,130],at:[125,428]}
  ]},
  meadow:{paint:paintMeadow,spots:[
    {id:'boss',kind:'boss',icon:'♛',label:'Guarida del alfa',rect:[40,420,240,190],at:[150,600],text:'Una cueva entre rocas con musgo y huesos roídos. Colmillo Viejo no deja que nadie se acerque.'},
    {id:'foe',kind:'foe',icon:'⚔',label:'Lobos grises',rect:[290,470,400,140],at:[490,478],text:'Los lobos grises rondan la parte baja de la pradera. Sueltan cuero al caer.'},
    {id:'gather',kind:'gather',icon:'●',label:'Huerto silvestre',rect:[70,60,380,290],at:[250,62],text:'Manzanos, zarzas y hierbas medicinales.'},
    {id:'wild',kind:'wild',icon:'✿',label:'Ciervos y conejos',rect:[500,140,440,200],at:[740,140],text:'La manada pasta junto al arroyo y los conejos saltan entre las flores. No atacan.'},
    {id:'exit',kind:'exit',icon:'⌂',label:'Camino a la villa',rect:[860,310,140,110],at:[870,316],text:'El sendero de tierra vuelve hacia la Villa del Fresno.'}
  ]},
  forest:{paint:paintForest,spots:[
    {id:'boss',kind:'boss',icon:'♛',label:'Nido de la reina',rect:[700,110,260,180],at:[880,300],text:'Las telarañas más grandes del bosque. La Reina Tejedora espera en el centro.'},
    {id:'foe',kind:'foe',icon:'⚔',label:'Arañas del roble',rect:[460,200,280,240],at:[600,206],text:'Arañas que bajan colgadas de su hilo. Dejan seda al morir.'},
    {id:'gather',kind:'gather',icon:'▰',label:'Claro del leñador',rect:[200,320,250,150],at:[330,322],text:'Un tocón con hacha clavada, troncos apilados y zarzas con moras.'},
    {id:'wild',kind:'wild',icon:'♠',label:'Jabalíes',rect:[100,480,360,120],at:[260,484],text:'Jabalíes hozando entre la hojarasca. Al anochecer el bosque se llena de luciérnagas.'},
    {id:'exit',kind:'exit',icon:'⌂',label:'Camino a la villa',rect:[860,380,140,110],at:[870,386],text:'El sendero sale del bosque rumbo a la Villa del Fresno.'}
  ]},
  water:{paint:paintWater,spots:[
    {id:'boss',kind:'boss',icon:'♛',label:'Trono del Rey',rect:[850,280,150,160],at:[915,440],text:'Un nenúfar enorme en la orilla este. El Rey del Lago surge entre la niebla.'},
    {id:'foe',kind:'foe',icon:'⚔',label:'Sapos de niebla',rect:[570,450,400,130],at:[770,456],text:'Sapos enormes que salen del agua. Dejan escamas al caer.'},
    {id:'gather',kind:'gather',icon:'≈',label:'Muelle y ribera',rect:[420,400,140,140],at:[485,404],text:'Un muelle con una barca amarrada. Pescado, madera y, con suerte, perlas.'},
    {id:'wild',kind:'wild',icon:'◦',label:'Patos y peces',rect:[300,140,320,150],at:[450,146],text:'Los patos nadan en círculos y a veces un pez salta en medio del lago.'},
    {id:'exit',kind:'exit',icon:'⌂',label:'Camino a la villa',rect:[0,0,180,140],at:[90,24],text:'El camino sube hacia el noroeste, de vuelta a la villa.'}
  ]},
  quarry:{paint:paintQuarry,spots:[
    {id:'boss',kind:'boss',icon:'♛',label:'Círculo de runas',rect:[620,330,240,170],at:[740,515],text:'Pilares rotos alrededor de un círculo de runas. El Gólem Ancestral duerme en el centro.'},
    {id:'foe',kind:'foe',icon:'⚔',label:'Gólems de hierro',rect:[500,240,480,380],at:[580,250],text:'Gólems que patrullan la cantera. Sueltan hierro al romperse.'},
    {id:'gather',kind:'gather',icon:'◈',label:'Mina y vetas',rect:[140,140,330,320],at:[300,140],text:'La boca de la mina, raíles, una vagoneta cargada y rocas con vetas de hierro.'},
    {id:'wild',kind:'wild',icon:'▲',label:'Cabras montesas',rect:[680,40,300,120],at:[840,44],text:'Las cabras saltan por las cornisas sin perder el equilibrio.'},
    {id:'exit',kind:'exit',icon:'⌂',label:'Camino a la villa',rect:[0,440,150,120],at:[70,446],text:'El camino baja hacia el oeste, cruzando el puente hasta la villa.'}
  ]},
  ridge:{paint:paintRidge,spots:[
    {id:'boss',kind:'boss',icon:'♛',label:'Altar de la bruma',rect:[630,250,220,200],at:[740,486],text:'Un anillo de piedras talladas en la cumbre. De aquí nace la niebla del valle.'},
    {id:'foe',kind:'foe',icon:'⚔',label:'Guardianes de cuarzo',rect:[500,300,480,300],at:[880,320],text:'Cristales vivos que flotan sobre la nieve. Dejan cuarzo al romperse.'},
    {id:'gather',kind:'gather',icon:'✦',label:'Vetas de gema',rect:[110,300,330,260],at:[240,304],text:'Cristales de bruma que brillan en la nieve, junto a rocas con hierro.'},
    {id:'wild',kind:'wild',icon:'∿',label:'Cuervos',rect:[820,100,180,140],at:[900,104],text:'Los cuervos vigilan desde un árbol seco.'},
    {id:'exit',kind:'exit',icon:'⌂',label:'Camino a la villa',rect:[0,500,170,120],at:[80,506],text:'El sendero helado baja hacia el valle.'}
  ]}
};

export function drawScene(c,id,s,S,t,hover,selected,locked){
  const sc=scenes[id];
  c.setTransform(1,0,0,1,0,0);
  c.drawImage(cached('scene-'+id,S,sc.paint),0,0);
  c.setTransform(S,0,0,S,0,0);
  if(id==='villa')animVilla(c,s,t);else animZone(c,s,t,id);
  for(const spot of sc.spots){
    const on=spot.id===selected,hv=spot.id===hover;
    if(!on&&!hv)continue;
    const [x,y,w,h]=spot.rect;
    c.save();c.fillStyle=on?'rgba(255,220,150,.10)':'rgba(255,220,150,.06)';c.strokeStyle=on?'rgba(255,214,140,.95)':'rgba(255,214,140,.6)';
    c.lineWidth=on?2.5:1.8;c.setLineDash(on?[]:[7,5]);c.beginPath();c.roundRect(x,y,w,h,14);c.fill();c.stroke();c.restore();
  }
  if(locked){
    rect(c,0,0,WIDTH,HEIGHT,'rgba(14,22,18,.55)');
    c.font='bold 30px Georgia';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#f4daa3';
    c.fillText('Zona bloqueada · Nv. '+byId[id].level,WIDTH/2,HEIGHT/2-14);
    c.font='16px system-ui, sans-serif';c.fillStyle='#dcd6bc';c.fillText('Tu héroe necesita más experiencia para llegar hasta aquí.',WIDTH/2,HEIGHT/2+22);
  }
}
export function spotAt(id,x,y){
  return scenes[id].spots.find(({rect:[rx,ry,w,h]})=>x>=rx&&x<=rx+w&&y>=ry&&y<=ry+h)?.id??null;
}
