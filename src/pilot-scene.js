/* El escenario nuevo se limita a Aurora. Los controles de claridad son comunes. */
'use strict';
class PilotScene extends OrbitMotionScene{
  preload(){super.preload();this.load.image('pilot-creatures','assets/aurora-creatures-v1.png');}
  create(){super.create();this.pilotEnemies=this.textures.get('pilot-creatures').getSourceImage();}
  get fx(){return window.app.settings.reduced?0:window.app.settings.effects;}
  background(level,t,reduced){
    const still=reduced||!window.app.settings.ambient;if(!level.pilot)return super.background(level,t,still);
    const c=this.ctx,A=OrbitArt,w=this.worldW,[dark,mid,cream,warm,cool]=level.colors;
    c.drawImage(this.backgrounds[level.theme],0,0,w,720);
    const shade=c.createLinearGradient(0,300,0,618);shade.addColorStop(0,dark+'00');shade.addColorStop(.45,dark+'24');shade.addColorStop(1,dark+'95');c.fillStyle=shade;c.fillRect(0,300,w,318);
    // Ningún objeto decorativo cruza las dos alturas de lectura.
    if(!still){c.save();c.globalAlpha=.5;const x=(t*15)%(w+120)-60;A.poly(c,[[x-8,185],[x+10,187],[x-8,189]],cream);c.restore();}
    c.fillStyle=dark;c.fillRect(0,618,w,102);c.fillStyle=mid;c.fillRect(0,628,w,25);c.fillStyle=cool;c.fillRect(0,616,w,3);
    c.save();c.globalAlpha=.22;const scroll=still?0:t*95;for(let i=-1;i<w/190+1;i++)A.round(c,i*190-scroll%190+35,638,60,3,2,cream);c.restore();
  }
  draw(atlas,index,x,y,w,h,feet=false){
    if(!window.app.level.pilot||atlas!==this.enemies||!this.pilotEnemies)return super.draw(atlas,index,x,y,w,h,feet);
    const air=index>=5,frame=window.app.settings.reduced?0:Math.floor(this.visualTime*(air?7:9))%4,im=this.pilotEnemies,cw=im.width/4,ch=im.height/2,size=air?112:105;
    // Celda fija: cambiar las alas o los pies nunca cambia la escala del cuerpo.
    this.ctx.drawImage(im,frame*cw,air?ch:0,cw,ch,x-size/2,y-size/2,size,size);
    return {x:x-size/2,y:y-size/2,w:size,h:size};
  }
  targets(s,t,level,reduced){super.targets(s,t,level,reduced||this.fx===0);}
  bosses(s,t,level,reduced){
    if(!level.pilot)return super.bosses(s,t,level,reduced||this.fx===0);
    const c=this.ctx,A=OrbitArt,[dark,,cream,warm,cool]=level.colors;
    for(const kind of ['projectile','boss']){
      const burst=kind==='boss',win=burst?s.boss:s.moving;if(!win||t<win.time-3||t>win.end+1)continue;
      const pos=this.bossPosition(s,t,kind),age=t-s.bossLastTime,won=burst&&s.bossWon;
      if(won&&age>.5)continue;c.save();c.translate(pos.x,pos.y);if(won)c.globalAlpha=Math.max(0,1-age/.5);
      if(burst){this.draw(this.guardians,5,0,0,185,185);const progress=Math.min(1,s.bossHits/s.rules.boss);for(let i=0;i<12;i++){if(i<Math.floor(progress*12))continue;c.strokeStyle=i%2?warm:cool;c.lineWidth=5;c.beginPath();c.arc(0,0,106,i*Math.PI/6+.06,i*Math.PI/6+.43);c.stroke();}}
      else this.draw(this.guardians,0,0,0,230,185);
      // Respuesta localizada y corta, sin sacudidas ni flashes de pantalla.
      if(this.packets.some(p=>p.type===kind&&t>=p.arrival&&t-p.arrival<.12)){c.strokeStyle=cool;c.lineWidth=3;c.beginPath();c.arc(0,0,burst?94:83,-2.7,-.45);c.stroke();}
      c.restore();
    }
  }
  actor(s,t,delta,reduced){super.actor(s,t,delta,reduced||this.fx===0);}
  burst(x,y,p,seed,theme,col,cream,reduced,large=false){
    const c=this.ctx,A=OrbitArt,strength=this.fx,radius=large?46+24*strength:20+22*strength;
    c.save();c.translate(x,y);c.globalAlpha=(1-p)*.85;c.strokeStyle=col;c.lineWidth=large?3:2;c.beginPath();c.arc(0,0,12+p*radius,0,Math.PI*2);c.stroke();
    if(strength>0)for(let i=0;i<Math.ceil((large?10:6)*strength);i++){const a=i*2.399+seed,r=p*radius,size=(1-p)*3;c.fillStyle=col;A.poly(c,[[Math.cos(a)*r,Math.sin(a)*r-size],[Math.cos(a)*r+size,Math.sin(a)*r],[Math.cos(a)*r,Math.sin(a)*r+size],[Math.cos(a)*r-size,Math.sin(a)*r]],col);}
    c.restore();
  }
  impacts(t,level,reduced){
    const c=this.ctx,A=OrbitArt,[dark,,cream,warm,cool]=level.colors;
    this.effects=this.effects.filter(e=>t-e.time<.28&&t>=e.time).slice(-6);
    for(const e of this.effects){if(e.grade==='boss-hit'||e.grade==='boss-break')continue;const p=(t-e.time)/.28,col=e.grade==='miss'?'#ffc8cb':e.action?cool:warm;this.burst(e.x,e.y,p,e.seed,level.theme,col,cream,reduced);}
    this.packets=this.packets.filter(p=>t-p.arrival<.4).slice(-14);
    for(const packet of this.packets){
      if(t<packet.time)continue;const dest=this.bossPosition(window.app.session,Math.min(t,packet.arrival),packet.type),col=packet.action?cool:warm;
      if(t<packet.arrival){const p=(t-packet.time)/(packet.arrival-packet.time),x=packet.start.x+(dest.x-packet.start.x)*p,y=packet.start.y+(dest.y-packet.start.y)*p-Math.sin(p*Math.PI)*24;
        c.save();c.strokeStyle=col;c.lineWidth=3;c.beginPath();c.ellipse(x,y,packet.type==='boss'?14:10,packet.type==='boss'?23:14,-.25,0,Math.PI*2);c.stroke();A.circle(c,x,y,3,cream);c.restore();
      }else this.burst(dest.x,dest.y,(t-packet.arrival)/.4,packet.seed,level.theme,col,cream,reduced,true);
    }
  }
}
