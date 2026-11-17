/* Escenarios de exploración: animación y respuesta visual, sin audio ni partitura. */
'use strict';
class ExpeditionScene extends Phaser.Scene{
  constructor(){super('expedition');this.t=0;this.objects=[];this.effects=[];this.packets=[];this.foot=616;this.poseUntil=0;this.lastLane=0;}
  preload(){this.load.image('expedition-elia','assets/expedition/sprites/elia.png');}
  create(){
    const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;canvas.getContext('2d',{alpha:false,willReadFrequently:false,desynchronized:true});
    this.surface=this.textures.addCanvas('expedition-canvas',canvas);this.image=this.add.image(0,0,'expedition-canvas').setOrigin(0);this.ctx=this.surface.getContext();this.hero=this.textures.get('expedition-elia').getSourceImage();
    window.expeditionScene=this;window.app.ready(this);
  }
  loadWorld(world,progress=()=>{}){
    const run=()=>new Promise((resolve,reject)=>{
      const files=[['bg-'+world.id,world.background],['creatures-'+world.id,world.creatureSheet],['boss-'+world.id,world.bossSheet]],missing=files.filter(([key])=>!this.textures.exists(key));
      if(!missing.length){progress(1);resolve();return;}
      const report=p=>progress(p),complete=()=>{this.load.off('progress',report);if(missing.some(([key])=>!this.textures.exists(key)))reject(Error('No se pudo cargar el arte de esta estación. Reintenta.'));else resolve();};
      this.load.on('progress',report);this.load.once('complete',complete);for(const [key,url]of missing)this.load.image(key,url);this.load.start();
    });
    this.queue=(this.queue||Promise.resolve()).catch(()=>{}).then(run);return this.queue;
  }
  enter(world,rules){
    this.world=world;this.rules=rules;this.stats={hits:0,returns:0};this.finished=false;this.t=0;this.foot=world.floor;this.poseUntil=0;this.objects=[];this.effects=[];this.packets=[];this.nextSpawn=.6;this.serial=0;this.guardianHits=0;this.lastShot=-1;
    this.bg=this.textures.get('bg-'+world.id).getSourceImage();this.creatures=this.textures.get('creatures-'+world.id).getSourceImage();this.guardian=this.textures.get('boss-'+world.id).getSourceImage();
  }
  get groundY(){return this.world.floor-55;}
  get airY(){return this.world.floor-231;}
  get lane(){return this.t<this.poseUntil?this.lastLane:0;}
  strike(lane){
    if(!this.world||this.finished||(lane!==0&&lane!==1))return;this.lastLane=lane;this.poseUntil=this.t+.28;const y=lane?this.airY:this.groundY;
    this.effects.push({x:this.hitX,y,at:this.t,kind:'slash',lane,seed:this.serial++});
    const near=this.objects.filter(o=>o.lane===lane&&!o.done&&Math.abs(o.x-this.hitX)<70).sort((a,b)=>Math.abs(a.x-this.hitX)-Math.abs(b.x-this.hitX))[0];
    if(near){near.done=true;this.effects.push({x:near.x,y:near.y,at:this.t,kind:'impact',lane,seed:this.serial++});if(near.projectile)this.sendPulse(lane);else this.stats.hits++;}
    this.effects=this.effects.slice(-12);
  }
  sendPulse(lane){this.packets.push({at:this.t,lane});this.packets=this.packets.slice(-12);this.guardianHits++;this.stats.returns++;this.guardianReact=this.t+.2;}
  cell(image,column,row,cols,rows,x,y,size,anchorX=.5,anchorY=.5){const cw=image.width/cols,ch=image.height/rows,dh=size*ch/cw;this.ctx.drawImage(image,column*cw,row*ch,cw,ch,x-size*anchorX,y-dh*anchorY,size,dh);}
  circle(x,y,r,fill,stroke,width=2){const c=this.ctx;c.beginPath();c.arc(x,y,r,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
  line(points,color,width=2){const c=this.ctx;c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
  background(){
    const c=this.ctx,w=this.worldW,t=this.t,world=this.world,still=app.settings.reduced||!app.settings.ambient;
    c.drawImage(this.bg,0,0,w,720);
    if(!still){const fy=world.floor+1,sy=fy/720*this.bg.height,offset=(t*95)%w,sourceHeight=this.bg.height-sy;c.drawImage(this.bg,0,sy,this.bg.width,sourceHeight,-offset,fy,w,720-fy);c.drawImage(this.bg,0,sy,this.bg.width,sourceHeight,w-offset,fy,w,720-fy);}
    // Una sombra amplia da profundidad al corredor sin esconder el escenario.
    const tint=c.createLinearGradient(0,320,0,616);tint.addColorStop(0,world.palette[0]+'00');tint.addColorStop(1,world.palette[0]+'24');c.fillStyle=tint;c.fillRect(0,320,w,296);
    if(still)return;c.save();c.globalAlpha=.35;const type=world.ambience;
    if(type==='traffic'||type==='sails'){for(let i=0;i<2;i++){const x=(t*(14+i*7)+i*w*.6)%(w+90)-45,y=130+i*70;this.line([[x-18,y+1],[x+6,y],[x-6,y-3]],world.palette[2],2);}}
    if(type==='petals'){for(let i=0;i<6;i++){const x=(i*213+t*10)%(w+20),y=110+i*33+Math.sin(t*.5+i)*12;c.save();c.translate(x,y);c.rotate(t*.3+i);c.fillStyle=i%2?'#ffb0bc':'#acd6b2';c.beginPath();c.ellipse(0,0,3,7,.3,0,Math.PI*2);c.fill();c.restore();}}
    if(type==='sparks'){for(let i=0;i<5;i++){const p=(t*.12+i*.21)%1;this.circle(w*(.15+i*.17),240-p*80,1.5,world.palette[2]);}}
    if(type==='rings'){c.save();c.translate(w*.69,210);c.rotate(t*.08);c.strokeStyle='#fff3d6';c.lineWidth=2;for(let i=0;i<2;i++){c.beginPath();c.ellipse(0,0,75+i*20,25+i*9,i*.9,0,Math.PI*2);c.stroke();}c.restore();}
    if(type==='waves'){for(let i=0;i<3;i++){c.beginPath();c.strokeStyle='#a5f5ec';c.lineWidth=2;c.moveTo(w*.48,235+i*18);c.bezierCurveTo(w*.6,220+i*18+Math.sin(t+i)*5,w*.74,250+i*18,w*.88,230+i*18);c.stroke();}}
    if(type==='constellations'){const points=[[w*.57,130],[w*.65,100],[w*.72,150],[w*.82,118]];c.globalAlpha=.2+.08*Math.sin(t*.8);this.line(points,'#e5dcff',1);points.forEach(([x,y])=>this.circle(x,y,3,'#d4f6f4'));}
    if(type==='sunrise'){c.globalAlpha=.12+.025*Math.sin(t*.5);this.circle(w*.7,160,45,null,'#fff4cf',2);}
    // Marcas discretas recorren la superficie y conectan la carrera con el suelo.
    c.globalAlpha=.15;for(let i=-1;i<w/240+1;i++){const x=i*240-(t*90)%240;this.line([[x,627],[x+65,627]],world.palette[2],2);}c.restore();
  }
  simulate(dt){
    if(this.finished||dt<=0)return;
    this.t+=dt;const t=this.t,w=this.worldW;
    if(t>=this.nextSpawn){const lane=this.serial%3===1?1:0;this.objects.push({x:w+90,y:lane?this.airY:this.groundY,lane,frameSeed:this.serial++,done:false});this.nextSpawn=t+this.rules.spawn+(this.serial%3)*.15;}
    const phase=t%44;this.bossActive=phase>=13&&phase<=34;
    if(this.bossActive&&phase>16){const shot=Math.floor((phase-16)/3.4),round=Math.floor(t/44),key=round*100+shot;if(key!==this.lastShot){this.lastShot=key;const lane=shot%2;this.objects.push({x:w*.82,y:lane?this.airY:this.groundY,lane,projectile:true,done:false});}}
    for(const o of this.objects)o.x-=dt*(o.projectile?this.rules.projectileSpeed:this.rules.speed);this.objects=this.objects.filter(o=>!o.done&&o.x>-100).slice(-12);
    this.effects=this.effects.filter(e=>t-e.at<.32);this.packets=this.packets.filter(p=>t-p.at<.75);
    if(t>=this.rules.duration){this.finished=true;app.finishRun({...this.stats,elapsed:t});}
  }
  receptors(){
    const c=this.ctx;
    // Disco oscuro + contorno claro: la identificación no depende del color del fondo.
    for(let lane=0;lane<2;lane++){const y=lane?this.airY:this.groundY,col=lane?'#90e8dd':'#ff9cab',active=this.t<this.poseUntil&&this.lastLane===lane;
      c.save();this.circle(this.hitX,y,34,'#201c32e8','#171323',4);this.circle(this.hitX,y,29,null,'#fff8ec',6);this.circle(this.hitX,y,29,null,col,3);
      c.font='700 17px Orbit, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fff8ec';c.fillText(lane?'J':'F',this.hitX,y+1);
      if(active){this.circle(this.hitX,y,39,null,col,3);}c.restore();
    }
  }
  targets(){
    const c=this.ctx,quiet=app.settings.reduced,w=this.world;
    for(const o of this.objects){const col=o.lane?'#90e8dd':'#ff9cab',frame=quiet?0:Math.floor(this.t*8+(o.frameSeed||0))%4;
      if(o.projectile){const c=this.ctx;c.save();c.translate(o.x,o.y);c.fillStyle=col;c.strokeStyle=w.palette[0];c.lineWidth=2;c.beginPath();c.moveTo(-19,0);c.lineTo(0,-12);c.lineTo(20,0);c.lineTo(0,12);c.closePath();c.fill();c.stroke();this.circle(0,0,3,w.palette[2]);c.restore();}
      else{if(!o.lane){c.save();c.globalAlpha=.14;const shadow=c.createRadialGradient(o.x,w.floor,1,o.x,w.floor,27);shadow.addColorStop(0,'#251d45');shadow.addColorStop(1,'#251d4500');c.fillStyle=shadow;c.fillRect(o.x-30,w.floor-8,60,16);c.restore();}this.cell(this.creatures,frame,w.creatureRow+o.lane,4,4,o.x,o.y,128*this.creatures.width/this.creatures.height);}
    }
  }
  bosses(){
    if(!this.bossActive)return;const c=this.ctx,phase=this.t%44,enter=Math.min(1,(phase-13)/2),exit=Math.min(1,(34-phase)/2),x=this.worldW+160-(this.worldW*.18+160)*Math.max(0,Math.min(enter,exit)),y=456;
    this.bossX=x;this.bossY=y;const attacking=phase>16&&(phase-16)%3.4<.5,reacting=this.t<this.guardianReact,frame=reacting?2:attacking?1:0;
    const bob=app.settings.reduced?0:Math.sin(this.t*1.3)*4;this.cell(this.guardian,frame,this.world.bossRow,3,2,x,y+bob,275);
    if(reacting){c.save();c.globalAlpha=.7;this.line([[x-75,y-45],[x-90,y-25],[x-80,y-8]],'#90e8dd',3);c.restore();}
  }
  actor(dt){
    const c=this.ctx,air=this.lane,active=this.t<this.poseUntil,held=app.input.held.size>0;
    const target=this.world.floor-(air?160:0);this.foot+=(target-this.foot)*(1-Math.exp(-dt*15));
    const frame=held&&active?air?9:8:active?air?9:8:air?10:app.settings.reduced?0:Math.floor(this.t*12)%8;
    const x=this.hitX-63,size=248*(this.hero.width/4)/(this.hero.height/3),hip=[.53,.53,.53,.53,.53,.53,.53,.53,.5,.5,.5,.53][frame],anchor=[.93,.93,.93,.93,.93,.93,.93,.93,.93,.93,.93,.93][frame];
    c.save();c.globalAlpha=.18;const shadow=c.createRadialGradient(x,this.world.floor+2,0,x,this.world.floor+2,33);shadow.addColorStop(0,'#292140');shadow.addColorStop(1,'#29214000');c.fillStyle=shadow;c.fillRect(x-36,this.world.floor-9,72,20);c.restore();
    this.cell(this.hero,frame%4,Math.floor(frame/4),4,3,x,this.foot,size,hip,anchor);
    this.actorMetrics={frame,size,foot:this.foot,x,lane:air};
    if(air&&!app.settings.reduced&&app.settings.effects>0){c.save();c.globalAlpha=.35*app.settings.effects;this.line([[x-9,this.foot-22],[x-23,this.foot+6],[x-35,this.foot+15]],'#90e8dd',4);c.restore();}
  }
  effectsDraw(){
    const c=this.ctx,t=this.t,strength=app.settings.reduced?0:app.settings.effects;
    for(const e of this.effects){const p=(t-e.at)/.32,col=e.lane?'#90e8dd':'#ff9cab';c.save();c.globalAlpha=1-p;c.strokeStyle=col;c.lineWidth=e.kind==='slash'?4:2;c.beginPath();c.ellipse(e.x,e.y,16+p*27,23+p*18,-.55,-1.7,1.8);c.stroke();
      for(let i=0;i<Math.ceil(strength*6);i++){const a=i*2.4+e.seed,r=p*45,x=e.x+Math.cos(a)*r,y=e.y+Math.sin(a)*r;c.save();c.translate(x,y);c.rotate(a+p);c.fillStyle=col;c.strokeStyle=col;
        if(this.world.effect==='leaf'){c.beginPath();c.ellipse(0,0,2,5,0,0,Math.PI*2);c.fill();}
        else if(['orbit','sun'].includes(this.world.effect)){this.circle(0,0,3,null,col,1.5);}
        else if(['bolt','comet'].includes(this.world.effect)){this.line([[-5,2],[0,-2],[5,0]],col,2);}
        else{c.fillRect(-2,-2,4,4);}c.restore();}c.restore();
    }
    for(const p of this.packets){const age=t-p.at,ratio=Math.min(1,age/.5),x=this.hitX+(this.bossX-this.hitX)*ratio,from=p.lane?this.airY:this.groundY,y=from+(this.bossY-from)*ratio-Math.sin(ratio*Math.PI)*22,col=p.lane?'#90e8dd':'#ff9cab';c.save();c.globalAlpha=age>.5?Math.max(0,1-(age-.5)/.25):1;this.circle(x,y,age>.5?14+(age-.5)*65:12,null,col,3);c.restore();}
  }
  update(_,delta){
    if(!this.world||!['explore','pause'].includes(window.app?.state))return;const sw=this.scale.width,sh=this.scale.height;this.worldW=Math.max(900,Math.min(2400,sw/sh*720));const width=Math.round(this.worldW);
    if(this.surface.width!==width){this.surface.setSize(width,720);this.ctx=this.surface.getContext();}this.image.setScale(sw/width,sh/720);this.hitX=this.worldW*.25;
    const dt=app.state==='pause'?0:Math.min(delta,80)/1000;this.simulate(dt);this.background();this.targets();this.bosses();this.actor(dt);this.effectsDraw();this.receptors();this.surface.refresh();app.sceneTick(this.t);
  }
}
