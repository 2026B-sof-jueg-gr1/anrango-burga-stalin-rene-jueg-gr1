/* Base artística compartida: escenarios, personaje y efectos de la expedición. */
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
  receptors(){
    const c=this.ctx;
    // Disco oscuro + contorno claro: la identificación no depende del color del fondo.
    for(let lane=0;lane<2;lane++){const y=lane?this.airY:this.groundY,col=lane?'#90e8dd':'#ff9cab',active=this.t<this.poseUntil&&this.lastLane===lane;
      c.save();this.circle(this.hitX,y,34,'#201c32e8','#171323',4);this.circle(this.hitX,y,29,null,'#fff8ec',6);this.circle(this.hitX,y,29,null,col,3);
      c.font='700 17px Orbit, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fff8ec';c.fillText(lane?'J':'F',this.hitX,y+1);
      if(active){this.circle(this.hitX,y,39,null,col,3);}c.restore();
    }
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
}
