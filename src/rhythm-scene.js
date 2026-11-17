/* El arte conserva su identidad; las posiciones proceden del reloj musical. */
'use strict';
class RhythmScene extends ExpeditionScene{
 enter(world,session){super.enter(world,session.rules);this.session=session;this.stats=null;this.objects=[];this.challenge=null;this.encounter=null;}
 get lane(){if(this.session?.activeBoss)return 0;if(this.session?.holds[1]?.down)return 1;return this.t<this.poseUntil?this.lastLane:0;}
 strike(lane){this.lastLane=lane;this.poseUntil=this.t+.24;this.effects.push({x:this.hitX,y:lane?this.airY:this.groundY,at:this.t,kind:'slash',lane,seed:this.serial++});this.effects=this.effects.slice(-12);}
 onEvent(event){
  const lane=event.note?.action??event.action??0,y=lane?this.airY:this.groundY;
  if(event.type==='judge'&&event.grade!=='miss'){
   this.effects.push({x:this.hitX,y,at:this.t,kind:'impact',lane,seed:this.serial++});
   if(event.note.kind==='projectile'){this.packets.push({at:this.t,lane});this.guardianReact=this.t+.18;}
  }
  if(event.type==='boss-hit'){this.packets.push({at:this.t,lane});this.guardianReact=this.t+.12;}
  if(event.type==='boss-break'){this.guardianReact=this.t+.4;this.effects.push({x:this.bossX,y:this.bossY,at:this.t,kind:'impact',lane,seed:this.serial++});}
  this.effects=this.effects.slice(-12);this.packets=this.packets.slice(-12);
 }
 targets(){
  const c=this.ctx,w=this.world,s=this.session,t=this.t,scale=s.difficulty==='hard'?78:s.difficulty==='normal'?91:106;
  const visible=s.visible(t-.25,t+s.rules.approach+.3);
  const speed=(this.worldW-this.hitX+100)/s.rules.approach;
  this.objects=visible.map(note=>({note,x:note.state==='holding'?this.hitX:this.hitX+(note.time-t)*speed,y:note.action?this.airY:this.groundY,lane:note.action}));
  const groups=new Map();
  for(const o of this.objects){if(o.note.end>o.note.time)continue;const key=o.note.time;if(groups.has(key)){const first=groups.get(key);if(first.lane!==o.lane){c.save();c.setLineDash([4,8]);this.line([[o.x,this.airY+41],[o.x,this.groundY-41]],'#fff4de88',2);c.restore();if(o.x>this.hitX+70){c.fillStyle='#201c32dd';c.fillRect(o.x-23,(this.airY+this.groundY)/2-11,46,22);c.fillStyle='#fff4de';c.font='700 10px Orbit';c.textAlign='center';c.fillText('F + J',o.x,(this.airY+this.groundY)/2+4);}}}else groups.set(key,o);}
  for(const o of this.objects){
   const n=o.note,col=o.lane?'#90e8dd':'#ff9cab',frame=app.settings.reduced?0:Math.floor(t*8+n.id)%4;
   if(n.end>n.time){
    const endX=this.hitX+(n.end-t)*speed;
    c.save();c.lineCap='round';this.line([[o.x,o.y],[endX,o.y]],'#201c32ee',22);this.line([[o.x,o.y],[endX,o.y]],col,n.state==='holding'?12:9);
    this.line([[o.x,o.y-1],[endX,o.y-1]],'#fff8ec99',2);this.circle(endX,o.y,11,'#201c32',col,3);
    for(let x=o.x+55;x<Math.min(this.worldW,endX-20);x+=70)this.line([[x-5,o.y-5],[x,o.y],[x-5,o.y+5]],'#201c32aa',2);
    this.star(o.x,o.y,30,col);if(n.state==='pending'&&o.x>this.hitX+50){c.font='700 10px Orbit';c.textAlign='center';c.strokeStyle='#201c32';c.lineWidth=4;c.strokeText('MANTÉN',o.x,o.y-39);c.fillStyle='#fff8ec';c.fillText('MANTÉN',o.x,o.y-39);}c.restore();
   }else if(n.kind==='projectile'){
    c.save();c.translate(o.x,o.y);c.fillStyle=col;c.strokeStyle='#201c32';c.lineWidth=4;c.beginPath();c.moveTo(-24,0);c.lineTo(0,-17);c.lineTo(24,0);c.lineTo(0,17);c.closePath();c.fill();c.stroke();this.circle(0,0,5,'#fff8ec');c.restore();
   }else{
    this.cell(this.creatures,frame,w.creatureRow+o.lane,4,4,o.x,o.y,scale*this.creatures.width/this.creatures.height);
    this.circle(o.x,o.y,scale*.27,null,'#201c32dd',4);this.circle(o.x,o.y,scale*.27,null,col,2);
   }
  }
 }
 star(x,y,r,col){const c=this.ctx;c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.52:r;const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;i?c.lineTo(px,py):c.moveTo(px,py);}c.closePath();c.fillStyle=col;c.strokeStyle='#201c32';c.lineWidth=4;c.fill();c.stroke();}
 receptors(){
  super.receptors();const c=this.ctx;
  for(const n of this.session.holds){if(!n)continue;const y=n.action?this.airY:this.groundY,col=n.action?'#90e8dd':'#ff9cab',progress=Math.max(0,Math.min(1,(this.t-n.time)/(n.end-n.time)));c.save();c.strokeStyle=col;c.lineWidth=4;c.beginPath();c.arc(this.hitX,y,41,-Math.PI/2,-Math.PI/2+progress*Math.PI*2);c.stroke();c.restore();}
 }
 bosses(){
  const t=this.t,b=this.challenge||this.encounter;if(!b)return;
  const start=b.time-2,end=b.end+1,enter=Math.max(0,Math.min(1,(t-start)/1.5)),exit=Math.max(0,Math.min(1,(end-t)/1)),x=this.worldW+160-(this.worldW*.2+160)*Math.min(enter,exit),y=this.challenge?425:450;
  this.bossX=x;this.bossY=y;const reacting=t<this.guardianReact,attack=this.challenge?!this.challenge.won:Math.sin(t*3)>0;
  this.cell(this.guardian,reacting?2:attack?1:0,this.world.bossRow,3,2,x,y+(app.settings.reduced?0:Math.sin(t*1.3)*3),this.challenge?320:275);
  if(this.challenge&&t>=b.time&&t<b.end){
   const progress=Math.min(1,b.hits/b.required),c=this.ctx;c.save();c.globalAlpha=b.won?.5:1;c.strokeStyle='#201c32';c.lineWidth=12;c.beginPath();c.arc(x,y,151,-Math.PI*.6,Math.PI*.6);c.stroke();c.strokeStyle=b.won?'#90e8dd':'#fff4de';c.lineWidth=5;c.beginPath();c.arc(x,y,151,-Math.PI*.6,-Math.PI*.6+Math.PI*1.2*progress);c.stroke();c.restore();
  }
 }
 update(_,delta){
  if(!this.world||!['explore','pause'].includes(window.app?.state))return;
  const sw=this.scale.width,sh=this.scale.height;this.worldW=Math.max(900,Math.min(2400,sw/sh*720));const width=Math.round(this.worldW);
  if(this.surface.width!==width){this.surface.setSize(width,720);this.ctx=this.surface.getContext();}this.image.setScale(sw/width,sh/720);this.hitX=this.worldW*.25;
  const time=app.frame();this.t=Math.max(0,time);this.challenge=this.session.bosses.find(b=>time>=b.time-2&&time<b.end+1)||null;this.encounter=this.session.encounters.find(b=>time>=b.time-2&&time<b.end+1)||null;this.bossActive=!!(this.challenge||this.encounter);
  this.effects=this.effects.filter(e=>this.t-e.at<.32);this.packets=this.packets.filter(p=>this.t-p.at<.75);
  const dt=app.state==='pause'?0:Math.min(delta,80)/1000;this.background();this.targets();this.bosses();this.actor(dt);this.effectsDraw();this.receptors();this.surface.refresh();app.sceneTick(time);
 }
}
