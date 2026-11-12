'use strict';
window.OrbitArt={
  round(c,x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}},
  poly(c,points,fill,stroke){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}},
  circle(c,x,y,r,fill,stroke){c.beginPath();c.arc(x,y,r,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}},
  backdrop(level){
    const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;const c=canvas.getContext('2d'),[dark,mid,cream,warm,cool]=level.colors,A=this;
    let g=c.createLinearGradient(0,0,0,720);g.addColorStop(0,dark);g.addColorStop(1,mid);c.fillStyle=g;c.fillRect(0,0,1280,720);
    for(let i=0;i<150;i++){const x=(Math.sin(i*13.71)*.5+.5)*1280,y=(Math.cos(i*19.31)*.5+.5)*490;A.circle(c,x,y,i%13===0?1.7:.7,cream+'aa');}
    c.save();c.translate(945,200);c.rotate(-.3);c.strokeStyle=cream+'44';c.lineWidth=18;c.beginPath();c.ellipse(0,0,235,67,0,0,Math.PI*2);c.stroke();g=c.createLinearGradient(-120,-100,100,100);g.addColorStop(0,cream);g.addColorStop(1,warm);A.circle(c,0,0,120,g);c.save();c.beginPath();c.arc(0,0,120,0,Math.PI*2);c.clip();for(let i=0;i<7;i++){c.strokeStyle=dark+'18';c.lineWidth=8;c.beginPath();c.ellipse(0,-80+i*31,160,35,0,0,Math.PI);c.stroke();}c.restore();c.strokeStyle=cream+'aa';c.lineWidth=5;c.beginPath();c.ellipse(0,0,235,67,0,0,Math.PI);c.stroke();c.restore();
    for(let layer=0;layer<3;layer++){c.fillStyle=[dark+'50',dark+'66',dark+'99'][layer];c.beginPath();c.moveTo(0,720);for(let x=0;x<=1320;x+=70)c.lineTo(x,475+layer*43+Math.sin(x*.007+layer*4)*35+Math.cos(x*.017)*14);c.lineTo(1280,720);c.fill();}
    c.save();c.globalAlpha=.6;
    if(level.theme===0||level.theme===4){
      for(let i=0;i<8;i++){const x=i*190-60,h=100+(i%3)*56;A.round(c,x,535-h,115,h,9,mid);A.round(c,x+7,541-h,101,5,2,cream+'77');for(let j=0;j<4;j++)A.round(c,x+15+j*22,565-h,9,h-50,2,cool+'33');}
      c.strokeStyle=cream+'aa';c.lineWidth=22;c.beginPath();c.arc(level.theme===4?650:360,600,level.theme===4?340:220,Math.PI,Math.PI*2);c.stroke();c.lineWidth=3;c.strokeStyle=cool;c.beginPath();c.arc(level.theme===4?650:360,600,level.theme===4?325:205,Math.PI,Math.PI*2);c.stroke();
      if(level.theme===4){A.poly(c,[[615,160],[685,160],[720,600],[580,600]],cream+'88');A.circle(c,650,210,45,cream+'aa');c.strokeStyle=cool;c.lineWidth=4;c.beginPath();c.ellipse(650,210,90,25,-.5,0,Math.PI*2);c.stroke();}
    }else if(level.theme===1){
      for(let i=0;i<7;i++){const x=50+i*225;c.strokeStyle=cool+'55';c.lineWidth=5;c.beginPath();c.ellipse(x,520,130,230,0,Math.PI,Math.PI*2);c.stroke();for(let j=0;j<4;j++){const px=x-85+j*47;c.strokeStyle=cool;c.lineWidth=5;c.beginPath();c.moveTo(px,550);c.quadraticCurveTo(px+25,450,px,355+(j%2)*60);c.stroke();for(let k=0;k<5;k++)A.poly(c,[[px,510-k*28],[px+(k%2?35:-35),480-k*28],[px,470-k*28]],k%2?cool+'88':cream+'66');}}
    }else if(level.theme===2){
      for(let i=0;i<9;i++){const x=i*175,h=170+(i%3)*65;A.round(c,x,555-h,26,h,2,warm+'88');A.poly(c,[[x,560-h],[x+150,505-h],[x+140,490-h],[x,535-h]],warm+'88');c.strokeStyle=cream+'55';c.lineWidth=2;c.beginPath();c.moveTo(x+120,510-h);c.lineTo(x+120,420);c.stroke();A.round(c,x+95,420,50,35,3,dark,cream+'55');}for(let i=0;i<20;i++){c.save();c.translate(i*85,550);c.rotate(Math.sin(i*5)*.6);A.round(c,-35,-20,70,40,5,warm+'44');c.restore();}
    }else{
      for(let i=0;i<7;i++){const y=220+i*38;c.strokeStyle=(i%2?cool:cream)+'33';c.lineWidth=10;c.beginPath();c.moveTo(-50,y);c.bezierCurveTo(250,y-130,700,y+100,1330,y-30);c.stroke();}for(let i=0;i<6;i++){const x=i*240;A.poly(c,[[x,570],[x+30,340],[x+55,570]],mid);A.circle(c,x+30,340,9,cool);c.strokeStyle=cool+'66';c.lineWidth=2;c.beginPath();c.moveTo(x+30,345);c.lineTo(x+60,390);c.lineTo(x+40,410);c.lineTo(x+85,470);c.stroke();}
    }
    c.restore();return canvas;
  },
  character(c,x,y,time,pose=0,hit=0,damage=0,reduced=false){
    const A=this;c.save();c.translate(x,y);const run=reduced?0:Math.sin(time*15),lean=hit>0?.12:0;c.rotate(lean);c.lineCap='round';c.lineJoin='round';
    // Bottes et articulations, dessinées séparément pour une vraie course.
    const limb=(sx,sy,angle,len,width,color)=>{c.save();c.translate(sx,sy);c.rotate(angle);A.round(c,-width/2,0,width,len,width/2,color,'#292345');A.round(c,-width/2-3,len-12,width+13,23,7,'#eeeee6','#292345');A.round(c,-width/2,len+3,width+13,5,2,'#8cf6ec');c.restore();};
    limb(-12,-54,pose===1?.8:run*.65,47,18,'#a99cce');limb(12,-54,pose===1?-.9:-run*.65,48,19,'#f3eddf');
    if(pose===1||hit>0){c.fillStyle='#8cf6ec99';A.poly(c,[[-25,-7],[-42,30],[-7,-7]],'#8cf6ec99');A.poly(c,[[5,-7],[-5,27],[24,-7]],'#fff3bbcc');}
    A.round(c,-24,-112,46,65,13,damage>0?'#ffad9d':'#f2eddf','#292345');A.poly(c,[[-22,-93],[22,-93],[18,-59],[-15,-59]],'#b0a0d3');A.round(c,-23,-59,48,10,3,'#372d58');A.round(c,-6,-56,13,7,2,'#8cf6ec');A.round(c,-34,-105,13,35,5,'#71668e');
    limb(-18,-105,pose===1?-1.5:.5+run*.3,34,13,'#b7a9d5');
    c.save();c.translate(22,-103);c.rotate(hit>0?-1.2:-.4-run*.25);A.round(c,-6,0,14,37,6,'#f2eddf','#292345');A.circle(c,2,38,9,'#403255');c.strokeStyle='#ffb28f';c.lineWidth=5;c.beginPath();c.ellipse(4,55,32,13,.3,0,Math.PI*2);c.stroke();c.strokeStyle='#fff3cd';c.lineWidth=2;c.stroke();c.restore();
    // Scarf and head: silhouettes match the new title illustration.
    A.poly(c,[[-20,-114],[-57,-109+run*3],[-88,-122-run*5],[-58,-125],[-20,-122]],'#ff957e');A.round(c,-24,-124,49,15,5,'#ffad8d','#292345');
    A.circle(c,0,-148,29,'#30244b');A.circle(c,7,-144,23,'#f1c2a1');A.poly(c,[[-25,-145],[-22,-171],[-5,-180],[19,-171],[26,-151],[14,-160],[-5,-151],[-14,-135]],'#332546');A.poly(c,[[-7,-173],[6,-170],[-5,-156],[-15,-153]],'#d99078');A.circle(c,20,-144,3,'#352643');A.round(c,-17,-147,12,14,4,'#f5f0e5','#68577e');A.round(c,-15,-143,8,4,2,'#8cf6ec');c.strokeStyle='#b36b68';c.lineWidth=1.5;c.beginPath();c.moveTo(20,-132);c.lineTo(26,-133);c.stroke();c.restore();
  }
};
