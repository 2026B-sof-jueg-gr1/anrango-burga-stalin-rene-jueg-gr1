/* Catálogo y orden de vuelo acordados. El tiempo definitivo procede del MP3. */
(function(root){
 'use strict';
 const palettes=[['#201c48','#7264a0','#ffd4af','#ff947f','#9ef0ef'],['#123a42','#47837e','#f4e9ba','#ffcb7b','#99f6c4'],['#302237','#92546a','#f9c6a1','#ff9b66','#ffdb92'],['#201939','#6954a8','#c5c8ff','#d3a1ff','#91e4ff'],['#292345','#8f83a6','#fff2c5','#ffc786','#e8ffed']];
 const levels=[
  {id:'aurora',name:'Puerto Aurora',theme:0,songId:'altale',bpm:130,backdrop:'aurora',boss:'Centinela de aduana',genre:'PIANO / PRIMERA SEÑAL',line:'Entre la estática, reconociste su canción.',goal:'Recupera la llamada',fragment:'«Dejé encendida la luz del taller.» — Sira'},
  {id:'io',name:'Jardines de Io',theme:1,songId:'lotus',bpm:153,backdrop:'io',boss:'Jardinero orbital',genre:'ECOS VIVOS',line:'Una melodía crece donde parecía no quedar nada.',goal:'Conserva el recuerdo',fragment:'«Escucha antes de cambiar todas las piezas.» — Sira'},
  {id:'scrap',name:'Cinturón de Chatarra',theme:2,songId:'nhelv',bpm:174.45,backdrop:'scrap',boss:'Prensa Titán',genre:'HECHA CON MIS MANOS',line:'Hasta las piezas rotas pueden encontrar su voz.',goal:'Construye una respuesta',fragment:'«La canción era tuya; esta parte es mía.» — Elia'},
  {id:'rebound',name:'Núcleo de Rebote',theme:2,songId:'cheatreal',bpm:190,backdrop:'scrap',boss:'Tambor de fundición',genre:'EL PULSO DEL NÚCLEO',line:'Un corazón mecánico despierta bajo la fundición.',goal:'Enciende el repetidor',fragment:'«La señal ya no es un eco. Ahora puede cruzar.» — Elia'},
  {id:'ions',name:'Mar de Iones',theme:3,songId:'zenith',bpm:200,backdrop:'ions',boss:'Mantarraya de iones',genre:'A TRAVÉS DEL RUIDO',line:'Sostén la canción. La otra voz está cerca.',goal:'Mantén la conversación',fragment:'«¿Elia? Esa guitarra… cuéntame quién eres ahora.» — Sira'},
  {id:'chimera',name:'Abismo de Plasma',theme:3,songId:'chimera',bpm:215,backdrop:'ions',boss:'Quimera del abismo',genre:'EXTRA 01 / SEÑALES PROFUNDAS',line:'En el borde de la red, otra voz pide ayuda.',goal:'Explora el abismo',fragment:'«Hay más voces esperando una respuesta.» — Sira',bonus:true},
  {id:'spin',name:'Órbita Libre',theme:4,songId:'spin',bpm:220,backdrop:'zero',boss:'Guardián de la órbita',genre:'EXTRA 02 / GIRO ESTELAR',line:'Un vuelo más allá de las rutas conocidas.',goal:'Cruza la órbita',fragment:'«Ahora la canción también es de quienes la escuchan.» — Elia',bonus:true},
  {id:'zero',name:'Faro Zero',theme:4,songId:'galaxy',bpm:270.05,backdrop:'zero',boss:'Custodio de Aurora',genre:'FINAL / DOS MELODÍAS',line:'Seis estaciones. Una respuesta por entregar.',goal:'Devuelve todas las voces',fragment:'«Estoy aquí, mamá.» — Elia'}
 ];
 let chapter=0;for(const l of levels){l.chapter=l.bonus?null:++chapter;l.tag=l.bonus?l.genre:`0${l.chapter} / ${l.genre}`;l.root=45+l.theme;l.colors=palettes[l.theme];l.duration=180;l.bars=Math.floor(l.duration*l.bpm/240);}
 if(typeof module!=='undefined'&&module.exports)module.exports=levels;else root.OrbitCatalog=levels;
})(globalThis);
