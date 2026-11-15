/* Movimiento, anclajes anatómicos y efectos del mundo. Todo usa el reloj musical. */
'use strict';
class OrbitMotionScene extends OrbitScene{
  reset(){super.reset();this.packets=[];this.poseStarted=-1;this.actorFrame=0;this.previousFrame=0;this.frameChanged=0;}
  react(action,time){super.react(action,time);this.poseStarted=time;this.poseUntil=time+.32;}
  hit(event){
    if(event.grade==='boss-escape')return;
    super.hit(event);
    if(['miss','boss-escape'].includes(event.grade))return;
    if(event.note.kind==='projectile'||event.note.kind==='boss'){
      const start={x:this.hitX-18,y:event.note.action?375:535},delay=event.note.kind==='boss'?.48:.55;
      this.packets.push({start,time:event.time,arrival:event.time+delay,action:event.note.action||0,type:event.note.kind,seed:this.chain});
      if(this.packets.length>80)this.packets.shift();
    }
  }
  background(level,t,reduced){
    super.background(level,t,reduced);if(reduced)return;const c=this.ctx,A=OrbitArt,w=this.worldW,[dark,,cream,warm,cool]=level.colors;
    c.save();
    // Cada entorno tiene una capa ambiental propia, sin video ni descargas adicionales.
    for(let i=0;i<22;i++){
      const x=((i*197.3-t*(18+i%4*8))%(w+160)+w+160)%(w+160)-80,y=115+i*53%450+Math.sin(t*.9+i*2)*20;
      c.globalAlpha=.25+(i%3)*.13;
      if(level.theme===1){c.save();c.translate(x,y);c.rotate(t*.7+i);c.fillStyle=i%2?cool:warm;c.beginPath();c.ellipse(0,0,4+2*Math.sin(t+i),11,.7,0,Math.PI*2);c.fill();c.restore();}
      else if(level.theme===2){c.strokeStyle=i%2?cream:warm;c.lineWidth=1.5;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.sin(i)*8,y-10-i%4*3);c.stroke();A.circle(c,x,y,2,warm);}
      else if(level.theme===3){c.strokeStyle=cool;c.lineWidth=1;c.beginPath();c.moveTo(x-15,y+3);c.quadraticCurveTo(x,y+Math.sin(t*3+i)*15,x+30,y);c.stroke();A.circle(c,x+30,y,2,cream);}
      else{A.circle(c,x,y,2+i%3,cool);if(i%4===0){c.strokeStyle=cream;c.lineWidth=1;c.beginPath();c.moveTo(x-5,y);c.lineTo(x+5,y);c.moveTo(x,y-5);c.lineTo(x,y+5);c.stroke();}}
    }
    if(level.theme===0){for(let i=0;i<3;i++){const x=((t*(35+i*10)+i*520)%(w+230))-115,y=160+i*70;c.globalAlpha=.45;c.strokeStyle=cool;c.lineWidth=2;c.beginPath();c.moveTo(x-70,y);c.lineTo(x,y);c.stroke();A.poly(c,[[x-15,y-3],[x+15,y],[x-15,y+3]],cream);}}
    if(level.theme===1){c.globalAlpha=.15;c.strokeStyle=cool;c.lineWidth=2;for(let i=0;i<4;i++){const x=i*w/3;c.beginPath();c.moveTo(x,615);c.bezierCurveTo(x+Math.sin(t+i)*25,540,x-20,490,x+Math.sin(t*.7+i)*38,440);c.stroke();}}
    if(level.theme===3){const flash=Math.pow(Math.max(0,Math.sin(t*.7)),35);if(flash>.04){c.globalAlpha=flash*.5;c.strokeStyle='#d8faff';c.lineWidth=2;const x=w*.68;c.beginPath();c.moveTo(x,80);c.lineTo(x-35,155);c.lineTo(x+5,140);c.lineTo(x-50,240);c.stroke();}}
    if(level.theme===4){c.globalAlpha=.12;c.translate(w*.7,230);c.rotate(t*.09);c.strokeStyle=cream;c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.ellipse(0,0,250+i*25,65+i*15,i*Math.PI/3,0,Math.PI*2);c.stroke();}}
    c.restore();
  }
  draw(atlas,index,x,y,w,h,feet=false){
    if(atlas!==this.enemies)return super.draw(atlas,index,x,y,w,h,feet);
    const c=this.ctx,A=OrbitArt,t=this.visualTime,air=index>=5,phase=t*(air?7:12)+x*.018,theme=index%5,reduced=window.app.settings.reduced;
    c.save();c.translate(x,y+(reduced?0:Math.sin(phase)*(air?8:2.5)));c.rotate(reduced?0:Math.sin(phase)*(air?.08:.035));
    if(!reduced){c.scale(1+Math.sin(phase)*.028,1-Math.sin(phase)*.028);const color=window.app.level.colors[4];c.globalAlpha=.55;c.strokeStyle=color;c.lineWidth=2;
      if(air){for(let k=-1;k<=1;k+=2){c.beginPath();c.ellipse(k*29,-3,18,4+Math.abs(Math.sin(phase))*12,k*.5,0,Math.PI*2);c.stroke();}}
      else{for(let k=-1;k<=1;k+=2){c.beginPath();c.moveTo(k*25,18);c.lineTo(k*(36+Math.sin(phase)*4),35);c.lineTo(k*46,34+Math.cos(phase)*4);c.stroke();}}
      c.globalAlpha=1;A.circle(c,-w*.3,0,2+Math.sin(phase),color);
    }
    const rect=super.draw(atlas,index,0,0,w,h,feet);c.restore();return {...rect,x:rect.x+x,y:rect.y+y};
  }
  targets(s,t,level,reduced){
    super.targets(s,t,level,reduced);const app=window.app,c=this.ctx,A=OrbitArt,tr=app.state==='tutorial'?app.training:null;
    if(!tr||tr.phase!=='practice')return;let actions=[];
    if(tr.step===6)actions=[0,1];else{const pending=s.notes.filter(n=>n.state!=='done'),next=pending[0];if(next)actions=pending.filter(n=>Math.abs(n.time-next.time)<.02).map(n=>n.action);}
    for(const action of new Set(actions)){const y=action?375:535,col=action?level.colors[4]:level.colors[3],p=reduced?.7:(Math.sin(this.visualTime*5)+1)/2;c.save();c.strokeStyle=col;c.shadowColor=col;c.shadowBlur=reduced?0:20;c.lineWidth=3;c.globalAlpha=.4+p*.55;c.beginPath();c.arc(this.hitX,y,34+p*12,0,Math.PI*2);c.stroke();A.poly(c,[[this.hitX+62,y-10],[this.hitX+46,y],[this.hitX+62,y+10]],col);c.restore();}
  }
  bossPosition(s,t,kind){
    const burst=kind==='boss',window=burst?s.boss:s.moving;if(!window)return {x:this.worldW*.8,y:450};
    const intro=Math.max(0,Math.min(1,(t-window.time+3)/2)),reduced=globalThis.app?.settings.reduced;
    return {x:this.worldW+180-intro*(this.worldW*(burst?.22:.2)+180)+(reduced||burst?0:Math.sin(t*1.5)*24),y:(burst?450:465)+(reduced?0:Math.sin(t*(burst?2:2.1))*12)};
  }
  bosses(s,t,level,reduced){
    const c=this.ctx,A=OrbitArt,[dark,,cream,warm,cool]=level.colors;
    for(const kind of ['projectile','boss']){
      const win=kind==='boss'?s.boss:s.moving;if(!win||t<win.time-3||t>win.end+1)continue;
      const burst=kind==='boss',pos=this.bossPosition(s,t,kind),won=burst&&s.bossWon,age=t-s.bossLastTime;
      const impact=this.packets.some(p=>p.type===kind&&t>=p.arrival&&t-p.arrival<.16);
      c.save();c.translate(pos.x,pos.y);if(impact&&!reduced)c.translate(Math.sin(t*120)*5,Math.cos(t*100)*4);
      if(won&&age>.65){c.restore();continue;}
      if(won)c.globalAlpha=Math.max(0,1-age/.65);
      if(burst){
        const progress=Math.min(1,s.bossHits/s.rules.boss);c.save();c.rotate(reduced?0:t*.24);c.strokeStyle=cool;c.lineWidth=1.5;c.globalAlpha*=.7;
        for(let i=0;i<3;i++){c.beginPath();c.ellipse(0,0,155,55+i*20,i*Math.PI/3,0,Math.PI*2);c.stroke();}c.restore();
        c.save();c.rotate(reduced?0:Math.sin(t*1.2)*.045);this.draw(this.guardians,5,0,0,245,245);c.restore();
        for(let i=0;i<12;i++){if(i<Math.floor(progress*12))continue;c.strokeStyle=i%2?warm:cool;c.shadowColor=c.strokeStyle;c.shadowBlur=reduced?0:10;c.lineWidth=7;c.beginPath();const rotation=reduced?0:t*.18;c.arc(0,0,139,i*Math.PI/6+.04+rotation,i*Math.PI/6+.44+rotation);c.stroke();}c.shadowBlur=0;
      }else{
        c.save();if(!reduced){c.rotate(Math.sin(t*2)*.025);c.scale(1+Math.sin(t*3)*.014,1-Math.sin(t*3)*.014);}this.draw(this.guardians,level.theme,0,0,315,260);c.restore();
        const shooting=s.notes.some(n=>n.kind==='projectile'&&t>=n.time-1.5&&t<n.time-1.32);
        if(shooting){c.shadowColor=cool;c.shadowBlur=reduced?0:25;A.circle(c,-100,-10,24,cream);}
      }
      if(impact){c.globalCompositeOperation='screen';c.globalAlpha=.6;A.circle(c,0,0,burst?100:70,cream);}
      c.restore();
    }
  }
  actor(s,t,delta,reduced){
    const app=window.app,c=this.ctx,A=OrbitArt,x=this.hitX-60,channel=s?.notes.some(n=>n.state==='holding'),airHeld=s?.notes.some(n=>n.state==='holding'&&n.action===1),active=t<this.poseUntil,air=active?this.pose:airHeld?1:0;
    const target=air?535:610;this.charY+=(target-this.charY)*(1-Math.exp(-Math.min(delta,50)/58));
    c.save();c.globalAlpha=.25;A.circle(c,x,615,Math.max(17,32-(610-this.charY)*.07),'#13152c');c.restore();
    const cycle=[0,1,2,3,4,5,6,7],frame=t<this.damageUntil?11:channel?(air?9:10):active?(air?9:8):reduced?0:cycle[Math.floor(this.visualTime*16)%8];
    if(frame!==this.actorFrame){this.previousFrame=this.actorFrame;this.actorFrame=frame;this.frameChanged=this.visualTime;}
    const cellW=this.motion.image.width/4,cellH=this.motion.image.height/3;
    // La escala depende de la celda de producción y de la cabeza, nunca del contorno del ataque.
    // El efecto del aro puede ser mucho más ancho que el cuerpo sin agrandar a Elia.
    const calibration=[1,1,1,1,1,1,1,1,.98,1.02,1,1];
    const hipX=[.55,.55,.55,.55,.55,.55,.55,.55,.47,.48,.47,.58],footY=[.95,.95,.95,.95,.95,.95,.95,.95,.96,.9,.96,.94];
    const bob=reduced||active||channel?0:Math.sin(this.visualTime*16*Math.PI/4)*2;
    const drawFrame=(index,opacity)=>{if(opacity<=0)return;const size=218*calibration[index],dx=x-hipX[index]*size,dy=this.charY-footY[index]*size+bob;c.save();c.globalAlpha=opacity*(t<this.damageUntil?.7:1);c.drawImage(this.motion.image,index%4*cellW,Math.floor(index/4)*cellH,cellW,cellH,dx,dy,size,size);c.restore();};
    const blend=reduced?1:Math.min(1,(this.visualTime-this.frameChanged)/.035);drawFrame(this.previousFrame,1-blend);drawFrame(frame,blend);
    this.actorMetrics={frame,cellSize:218*calibration[frame],x,y:this.charY,headScale:calibration[frame]};
    if(!reduced){
      c.save();c.globalCompositeOperation='screen';const gait=this.visualTime*17;
      if(air||channel){const col=air?app.level.colors[4]:app.level.colors[3];c.strokeStyle=col;c.lineWidth=3;c.shadowColor=col;c.shadowBlur=15;for(let i=0;i<2;i++){c.beginPath();c.ellipse(this.hitX-18,air?375:535,25+i*8,35+i*9,this.visualTime*2,0,Math.PI*2);c.stroke();}}
      if(air){const length=30+Math.sin(gait)*9;c.fillStyle='#9cffff88';A.poly(c,[[x-18,this.charY-25],[x-60,this.charY+length],[x-5,this.charY-12]],'#9cffff66');}
      if(!air&&!active){for(let i=0;i<4;i++){const p=((this.visualTime*3+i*.25)%1);c.globalAlpha=(1-p)*.3;A.circle(c,x-35-p*60,612-p*8,2+p*5,app.level.colors[4]);}}
      c.restore();
    }
    const j=document.getElementById('judgement'),view=document.getElementById('view').getBoundingClientRect();if(j){j.style.left=`${x*this.scale.width/this.surface.width}px`;j.style.top=`${Math.max(80,(this.charY-(frame===8?150:205))*this.scaleFactor-view.top-30)}px`;}
  }
  burst(x,y,p,seed,theme,col,cream,reduced,large=false){
    const c=this.ctx,A=OrbitArt,radius=large?150:95;c.save();c.translate(x,y);c.globalAlpha=1-p;c.globalCompositeOperation='screen';c.shadowColor=col;c.shadowBlur=reduced?0:15;c.lineWidth=large?5:3;c.strokeStyle=col;
    c.beginPath();c.arc(0,0,15+p*(reduced?15:radius),0,Math.PI*2);c.stroke();
    if(!reduced)for(let i=0;i<(large?30:20);i++){
      const angle=i*2.399+seed,r=p*(radius*.55+(i%5)*radius*.15),px=Math.cos(angle)*r,py=Math.sin(angle)*r,size=(1-p)*(3+i%4);c.save();c.translate(px,py);c.rotate(angle+p*2);c.fillStyle=i%3?col:cream;c.shadowBlur=0;
      if(theme===1){c.beginPath();c.ellipse(0,0,size*.65,size*1.5,.4,0,Math.PI*2);c.fill();}
      else if(theme===2){A.poly(c,[[-size,-size],[size,size/2],[0,size]],c.fillStyle);c.strokeStyle=c.fillStyle;c.beginPath();c.moveTo(0,0);c.lineTo(-size*3,0);c.stroke();}
      else if(theme===3){A.poly(c,[[0,-size*2],[size*.6,0],[0,size*2],[-size*.6,0]],c.fillStyle);}
      else{c.beginPath();for(let n=0;n<8;n++){const a=n*Math.PI/4,rr=n%2?size*.3:size*1.7;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}c.closePath();c.fill();}c.restore();
    }
    c.restore();
  }
  impacts(t,level,reduced){
    const c=this.ctx,A=OrbitArt,[dark,,cream,warm,cool]=level.colors;
    this.effects=this.effects.filter(e=>t-e.time<.65&&t>=e.time);
    for(const e of this.effects){const p=(t-e.time)/.65,col=e.grade==='miss'?'#ffa6a6':e.action?cool:warm;if(e.grade==='miss'){c.save();c.globalAlpha=1-p;c.strokeStyle=col;c.lineWidth=3;c.beginPath();c.arc(e.x,e.y,28+p*15,0,Math.PI*2);c.stroke();c.restore();continue;}if(e.grade==='boss-hit'||e.grade==='boss-break')continue;this.burst(e.x,e.y,p,e.seed,(level.theme+(e.action?2:0))%5,col,cream,reduced);}
    this.packets=this.packets.filter(p=>t-p.arrival<1);
    for(const packet of this.packets){
      if(t<packet.time)continue;const dest=this.bossPosition(window.app.session,Math.min(t,packet.arrival),packet.type),col=packet.action?cool:warm;
      if(t<packet.arrival){const p=(t-packet.time)/(packet.arrival-packet.time),x=packet.start.x+(dest.x-packet.start.x)*p,y=packet.start.y+(dest.y-packet.start.y)*p-Math.sin(p*Math.PI)*45;
        c.save();c.globalCompositeOperation='screen';c.shadowColor=col;c.shadowBlur=reduced?0:20;c.strokeStyle=col;c.lineWidth=5;
        c.beginPath();c.moveTo(x-40,y+4);c.lineTo(x,y);c.stroke();c.beginPath();c.ellipse(x,y,packet.type==='boss'?23:14,packet.type==='boss'?37:20,-.25,0,Math.PI*2);c.stroke();c.strokeStyle=cream;c.lineWidth=2;c.beginPath();c.ellipse(x,y,15,27,-.25,0,Math.PI*2);c.stroke();A.circle(c,x,y,4,cream);c.restore();
      }else{const p=(t-packet.arrival)/1;this.burst(dest.x,dest.y,p,packet.seed,level.theme,col,cream,reduced,true);}
    }
  }
}
