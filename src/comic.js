/* Guion y bocadillos son texto accesible: el arte nunca contiene letras rasterizadas. */
(function(root){
 'use strict';
 const PAGES=[
  {id:'prologue',title:'La canción de vuelta',kicker:'PRÓLOGO · DOCE AÑOS ANTES',panels:[
   {speaker:'ELIA',text:'Cuando vuelva, terminamos la canción. ¿Sí?',caption:'Aurora. La última tarde antes de la evacuación.',sfx:'tin…',side:'left'},
   {speaker:'SIRA',text:'Sube al transporte. Yo ayudaré a los que faltan.',caption:'Después, las rutas de salto colapsaron.',sfx:'BRUM',side:'right'},
   {speaker:'ELIA',text:'Durante años, nadie supo cómo regresar.',caption:'La galaxia dio por perdidas a las colonias aisladas.',side:'left'},
   {speaker:'RECEPTOR',text:'…te estaba esperando.',caption:'Hoy, una melodía familiar trae una respuesta nueva.',sfx:'bip',side:'right'}]},
  {id:'chapter-aurora',title:'Una fecha imposible',kicker:'01 · PUERTO AURORA',world:'aurora',panels:[
   {speaker:'ELIA',text:'Este es mi dibujo. Lo hice en el taller de mamá.',caption:'En el andén, un autómata entrega un cartucho.',sfx:'CLAC',side:'left'},
   {speaker:'RECEPTOR',text:'Grabación: hace doce años. Llegada: hoy.',sfx:'bip',side:'right'},
   {speaker:'ELIA',text:'Alguien ha completado la otra mitad de la melodía.',caption:'La respuesta no estaba en la grabación original.',side:'left'},
   {speaker:'ELIA',text:'Voy a seguirla. Hasta donde haga falta.',caption:'La primera coordenada apunta a los jardines de Io.',sfx:'FSSHH',side:'right'}]},
  {id:'chapter-io',title:'Lo que siguió creciendo',kicker:'02 · JARDINES DE IO',world:'io',panels:[
   {speaker:'ELIA',text:'La red está cerrada… pero las flores siguen creciendo.',caption:'El jardín conserva huellas de quienes lo cuidaron.',side:'left'},
   {speaker:'REGISTRO',text:'Turno de riego completado. Próxima visita: mañana.',sfx:'tic',side:'right'},
   {speaker:'ELIA',text:'No desaparecieron. Aprendieron a vivir aquí.',caption:'Una pequeña mano dejó una semilla junto al registro.',side:'left'},
   {speaker:'ELIA',text:'Si ellos siguieron esperando, yo puedo seguir buscando.',caption:'Un viejo transporte salió hacia el cinturón.',sfx:'fuu…',side:'right'}]},
  {id:'chapter-scrap',title:'Las naves que volvieron',kicker:'03 · CINTURÓN DE CHATARRA',world:'scrap',panels:[
   {speaker:'ELIA',text:'Estas naves no se alejaban. Estaban regresando.',caption:'Entre los restos, la bitácora cambia la historia.',sfx:'CLINK',side:'left'},
   {speaker:'BITÁCORA',text:'Sira solicita otro transporte. Quedan familias en el andén.',caption:'El registro de la evacuación.',side:'right'},
   {speaker:'ELIA',text:'Se quedó para ayudarles a salir.',caption:'Elia reconoce la firma en una lista de pasajeros.',side:'left'},
   {speaker:'ELIA',text:'Con estas piezas podemos reconstruir el camino.',caption:'La última nave registró una ruta de gravedad.',sfx:'CHAS',side:'right'}]},
  {id:'chapter-rebound',title:'La ruta que se plegó',kicker:'04 · NÚCLEO DE REBOTE',world:'rebound',panels:[
   {speaker:'ELIA',text:'Los anillos se mueven, pero ninguno ha perdido su sitio.',caption:'El núcleo protege las rutas detrás de un pliegue.',sfx:'VUM',side:'left'},
   {speaker:'REGISTRO',text:'Rutas selladas para proteger a las colonias.',caption:'El cierre evitó que la tormenta alcanzara los puertos.',side:'right'},
   {speaker:'ELIA',text:'No borraron el camino. Lo mantuvieron a salvo.',sfx:'HMM',side:'left'},
   {speaker:'ELIA',text:'Cada faro conserva una parte del patrón. Ya puedo seguirlo.',caption:'La llave armónica señala el mar de iones.',side:'right'}]},
  {id:'chapter-ions',title:'Una voz de ahora',kicker:'05 · MAR DE IONES',world:'ions',panels:[
   {speaker:'ELIA',text:'La interferencia ya no tapa toda la señal.',caption:'Un mensaje reciente atraviesa la tormenta.',sfx:'KRR…',side:'left'},
   {speaker:'SIRA',text:'Si alguien escucha esto… el puerto sigue abierto.',caption:'Esta grabación no tiene doce años.',side:'right'},
   {speaker:'ELIA',text:'Mamá. Estoy aquí. Estoy encontrando el camino.',sfx:'tum',side:'left'},
   {speaker:'SIRA',text:'Hay más personas esperando. El observatorio guarda sus nombres.',caption:'Elia sigue la señal hacia el abismo.',side:'right'}]},
  {id:'chapter-chimera',title:'Un cielo lleno de nombres',kicker:'06 · ABISMO DE PLASMA',world:'chimera',panels:[
   {speaker:'ELIA',text:'Cada una de estas luces es un mensaje sin entregar.',caption:'El observatorio conservó el archivo de las colonias.',sfx:'tin',side:'left'},
   {speaker:'ARCHIVO',text:'Para mi hermano. Para nuestra hija. Para quien pueda volver.',side:'right'},
   {speaker:'ELIA',text:'Yo buscaba una voz. Aquí hay miles.',caption:'Las constelaciones se convierten en direcciones.',side:'left'},
   {speaker:'ELIA',text:'Abriremos el camino para todos.',caption:'La próxima alineación aparece en Órbita Libre.',sfx:'FUU',side:'right'}]},
  {id:'chapter-spin',title:'Una invitación a regresar',kicker:'07 · ÓRBITA LIBRE',world:'spin',panels:[
   {speaker:'ELIA',text:'Los cometas están marcando la misma dirección.',caption:'Las velas solares encuentran la ventana de regreso.',sfx:'SWISH',side:'left'},
   {speaker:'RECEPTOR',text:'Ruta visible. Faro Zero al alcance.',side:'right'},
   {speaker:'ELIA',text:'Esta vez la señal viajará en ambos sentidos.',caption:'Las coordenadas empiezan a llegar a otras naves.',side:'left'},
   {speaker:'ELIA',text:'Aurora, vamos a casa.',caption:'En el horizonte, una luz responde.',sfx:'VUUUM',side:'right'}]},
  {id:'chapter-zero',title:'Lo que viene después',kicker:'08 · FARO ZERO',world:'zero',panels:[
   {speaker:'SIRA',text:'Sabía que reconocerías la canción.',caption:'El puerto nunca dejó de esperar.',side:'right'},
   {speaker:'ELIA',text:'La recordaba. Esta parte la aprendí lejos de casa.',caption:'La melodía de infancia encuentra una respuesta propia.',sfx:'tin — tan',side:'left'},
   {speaker:'SIRA',text:'No vuelvas a empezar. Quiero oír lo que viene después.',caption:'Una conversación pendiente puede continuar.',side:'right'},
   {speaker:'ELIA',text:'Tenemos muchas voces que llevar de vuelta.',caption:'La primera ruta está abierta. La galaxia aún guarda más caminos.',sfx:'AURORA',side:'left'}]}
 ];
 PAGES.forEach(p=>{p.art=`assets/expedition/comics/${p.id}.png`;});
 const api={title:'La canción de vuelta',premise:'Una mensajera sigue una melodía para encontrar el camino de regreso a unas colonias que todos creen perdidas.',PAGES,page:id=>PAGES.find(p=>p.id===id)||PAGES[0]};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.OrbitComic=api;
})(globalThis);
