# Contexto vigente de Órbita: La canción de vuelta

Actualizado: **16 de noviembre de 2026**. Código musical de referencia: `29b0cf9`; este documento incorpora la limpieza posterior de prototipos.

Este archivo permite continuar el proyecto sin leer los chats anteriores. Se basa en decisiones del usuario y en el código actual. Las nuevas instrucciones explícitas del usuario prevalecen. No conviertas propuestas de mejora de este documento en funcionalidades ya aprobadas ni en trabajo ya realizado.

## 1. Qué estamos construyendo

Un juego de ritmo espacial de desplazamiento lateral, inspirado en la mecánica de dos alturas de Muse Dash, con personajes y arte propios. Elia corre automáticamente. El jugador golpea objetivos terrestres y aéreos con dos teclas, siguiendo la canción.

El valor del juego combina una acción musical comprensible con una aventura emotiva de misterio espacial. Debe sentirse como un juego acabado y atractivo, con lectura clara, buena producción visual y efectos temáticos que no cansen la vista. No basta una presentación bonita: las acciones tienen que corresponder al audio.

- Nombre actual: **Órbita · La canción de vuelta**.
- Único modo: **Órbita Pulso**.
- Ocho destinos iniciales, cada uno con Fácil, Medio y Difícil: **24 partituras**.
- El catálogo y la historia pueden crecer con nuevos destinos. Ocho es el primer arco, no un límite permanente.
- Juego de navegador a pantalla completa de la ventana, sin scroll de página; ampliación a fullscreen opcional.
- Proyecto académico que evolucionó con autorización creativa del usuario. El antiguo límite de mecánicas sencillas dejó de aplicar.

Repositorio: [GitHub](https://github.com/2026B-sof-jueg-gr1/anrango-burga-stalin-rene-jueg-gr1).
Sitio: [GitHub Pages](https://2026b-sof-jueg-gr1.github.io/anrango-burga-stalin-rene-jueg-gr1/).

## 2. Decisiones que se deben preservar

1. **Sólo teclado F/J.** F es suelo; J salta y golpea en el aire. Ambas manos importan. No hay movimiento manual ni salto con otra tecla.
2. Vector, mouse + Z/X, cuatro/ocho teclas y carriles verticales quedaron descartados. No volver a introducirlos por iniciativa propia.
3. Cada canción tiene las tres dificultades. No asignar una canción exclusivamente a Fácil y otra exclusivamente a Difícil.
4. Usar el MP3 completo elegido, sin acelerar, recortar ni cambiar de versión silenciosamente. Música y partitura deben pertenecer al mismo archivo.
5. Mantener portada, presentación negra con tres textos escritos progresivamente, cómic, protagonista y escenarios vigentes. No sustituirlos por prototipos anteriores.
6. Los recuerdos son **recompensas por logros**, no una presentación que se abre al entrar ni un botón gratuito durante la partida.
7. La interfaz funcional habla directamente: Jugar, Cómo jugar, Seleccionar nivel, Configuración, Recuerdos y Resultados. La ambientación queda en lugares, historia y diálogos.
8. Recuerdos se navega por páginas con anterior/siguiente; no recuperar su barra vertical. Siempre debe haber salida o regreso de una pantalla.
9. Preservar contraste entre escenario, personaje y objetivos. Los receptores llevan disco oscuro, contorno claro, color y F/J; no identificarlos sólo por color.
10. Mantener el estilo manga/cómic a color, bocadillos, viñetas, cartelas y onomatopeyas. No reducir la historia a una imagen y una frase o a un bloque de texto aislado.
11. Los efectos son locales y acotados. No añadir flashes blancos grandes, sacudidas continuas o fondos que compitan con las notas.
12. Los cambios deben ser incrementales: mejorar lo existente sin rehacer todo o quitar una parte que funciona. Cambios de concepto, controles, canciones o narrativa requieren una decisión del usuario.

Los números de balance que siguen describen la implementación actual; no son restricciones creativas eternas. Si se ajustan, hacerlo con pruebas y explicar el efecto sin alterar el concepto aprobado.

## 3. Historia definida

Elia tenía ocho años cuando evacuaron Aurora. Su madre, **Sira**, ingeniera, se quedó organizando el rescate de otras familias. Colapsaron las rutas de salto y las colonias aisladas se dieron por perdidas.

Doce años después, Elia, una mensajera de veinte años, recibe una melodía que tocaba con su madre. Incluye una respuesta nueva. Seguirla empieza como una búsqueda personal y se amplía a **encontrar el camino de regreso para muchas familias**. El tono es misterio espacial, emoción esperanzadora y energía arcade.

Elia se reconoce por pelo corto violeta con mechón cálido, bufanda coral, traje marfil/lavanda, botas turquesas y aro. Los guardianes son antiguos autómatas protectores: sus pulsos se devuelven, sin violencia gráfica. Los faros usan patrones armónicos para sincronizar rutas.

Al final del primer arco Elia y Sira se reencuentran en Faro Zero. Elia continúa la canción con lo aprendido lejos de casa; otras familias también pueden volver. Se cierra ese arco emocional y quedan rutas abiertas para nuevas historias.

La narración consta de **prólogo + ocho capítulos**, cuatro viñetas por página: nueve páginas y 36 viñetas. Canon detallado: `docs/HISTORIA.md`; diálogos: `src/comic.js` y `docs/GUION-COMIC.md`.

## 4. Destinos, música e identidad

| ID | Destino | Canción confirmada | Archivo completo | Pista narrativa |
| --- | --- | --- | --- | --- |
| aurora | Puerto Aurora | Sakuzyo — Altale | 2:32 | Un cartucho antiguo llegó hoy con una respuesta nueva. |
| io | Jardines de Io | Snail's House — Pixel Galaxy | 4:00 | Los habitantes siguieron cuidando sus lugares. |
| scrap | Cinturón de Chatarra | meganeko — Feral | 4:26 | Sira coordinó rescates después de la evacuación. |
| rebound | Núcleo de Rebote | t+pazolite — Cheatreal | 4:54 | Las rutas se sellaron para proteger, no por abandono. |
| ions | Mar de Iones | xi — Blue Zenith | 4:18 | Una voz reciente confirma que el puerto sigue abierto. |
| chimera | Abismo de Plasma | Camellia — crystallized | 4:37 | Muchas familias esperan sus mensajes y su regreso. |
| spin | Órbita Libre | Camellia — Exit This Earth's Atomosphere | 5:31 | La señal empieza a viajar en ambos sentidos. |
| zero | Faro Zero | xi — Halcyon | 5:11 | Reencuentro y apertura de rutas para otras familias. |

Las duraciones de la tabla están truncadas a minutos/segundos para mostrar. Las duraciones decimales reales y SHA-256 están en `src/music-catalog.js` y en cada JSON de partitura. Los MP3 fueron proporcionados por el usuario; no son composiciones originales del proyecto. Autores y enlaces: `docs/MUSICA-PROPUESTA.md`, cuyo contenido es una **selección confirmada**, aunque el nombre del archivo conserve “propuesta”.

Cada lugar tiene fondo, portada, dos criaturas, guardián y efectos propios. Ejemplos: autómatas postales, invernaderos y pétalos, maquinaria de cobre y chispas, anillos de gravedad, océano de iones, observatorio y constelaciones, velas solares y amanecer del faro. Nombres exactos y anclajes de suelo: `src/worlds.js`.

## 5. Flujo actual de pantallas

1. Portada con ilustración y “pulsa una tecla”.
2. Presentación sobre negro, cada vez que se entra desde la portada, con estas tres frases originales:
   - “Puerto Aurora lleva años en silencio.”
   - “Hoy ha sonado una melodía que Elia conoce desde pequeña.”
   - “El transmisor está apagado. ¿Quién sigue tocando?”
3. Menú: Jugar, Recuerdos, Cómo jugar; navegación, ajustes y fullscreen.
4. Selector de ocho niveles; ficha con dificultad, canción, duración, criaturas y récord.
5. Carga real de escenario, MP3 y partituras; cuenta atrás de tres segundos.
6. Partida lateral con puntuación, combo, precisión, energía, avance y pausa.
7. Resultados: rango, puntuación, precisión, combo máximo, juicios y guardianes/bonus. Reintentar o volver a niveles; Leer recuerdo cuando se gana.
8. Cómic como recompensa, después archivo para releer. La primera victoria desbloquea también el prólogo.

Existe ayuda **Cómo jugar**; **no existe todavía un tutorial interactivo por etapas**, aunque apareció en planes anteriores. No presentar una propuesta antigua como un tutorial implementado.

## 6. Reglas implementadas

### Notas y final del nivel

- Individual: F o J cuando el centro del objetivo llega al receptor.
- Doble: F+J simultáneas en alturas distintas.
- Sostenido/estela: mantener la tecla hasta terminar la barra. Se juzgan cabeza y cola; soltar demasiado pronto pierde una sola cola. Mantener una tecla no genera golpes repetidos.
- Proyectil: golpe de la altura correspondiente durante un encuentro del guardián.
- Se gana terminando **todo el audio**, con energía mayor que cero y precisión de al menos **60%**. Energía cero termina la partida antes, como fallo.
- Perder un desafío de guardián no implica necesariamente perder toda la canción: quita energía y rompe el combo.
- Precisión y rangos: S ≥97%, A ≥90%, B ≥80%, C ≥65%; D por debajo. Los bonus no inflan la precisión de las notas.
- Juicios: Perfecto, Genial, Bien, Fallo. Valores de precisión 1, 0,75, 0,5 y 0. Pulsar en altura incorrecta cerca de una nota añade penalización; golpear en vacío no regala puntos.

### Parámetros actuales de dificultad

| Dificultad | Anticipación | Perfecto | Genial | Ventana máxima | Daño por fallo | Recuperación por acierto |
| --- | --- | --- | --- | --- | --- | --- |
| Fácil | 2,70 s | ±65 ms | ±115 ms | ±170 ms | 3 | 1,8 |
| Medio | 2,35 s | ±55 ms | ±105 ms | ±155 ms | 4 | 1,6 |
| Difícil | 2,05 s | ±50 ms | ±95 ms | ±145 ms | 5 | 1,6 |

La energía comienza en 100 y tiene ese máximo. La cabeza vale hasta 1.000 puntos y la cola hasta 500, ponderados por juicio y multiplicador de combo. Reglas ejecutables: `src/rhythm.js`.

### Jefes con plazo: decisión especialmente importante

El jugador debe alternar **F ↔ J** dentro de un intervalo musical fijo. El mínimo depende del mapa y la dificultad: el generador utiliza aproximadamente 2,8 / 4,2 / 5,8 pulsaciones válidas por segundo.

- Repetir la misma tecla no cuenta como alternancia. Se ignora auto repeat y se exige separación mínima de 35 ms entre alternancias válidas.
- Cada alternancia válida suma 25 puntos.
- Alcanzar el mínimo rompe el escudo y da 3.000 puntos una sola vez.
- **El desafío NO se cierra al alcanzar el mínimo.** Sigue hasta su deadline.
- Cada alternancia adicional dentro del plazo añade **100 puntos de bonus**, además de sus 25 puntos base.
- Después del deadline no se aceptan alternancias para ese jefe.
- Si no se logra el mínimo, el guardián escapa: −18 de energía y combo roto. Al superarlo: +8 de energía y una unidad de combo al cerrar el intervalo.
- El panel debe mostrar mínimo, contador, tiempo restante y bonus. La idea es la sensación de un spinner de osu!, resuelta con las dos teclas y el tema propio.

### Pausa, sonido y progreso

- P/Escape pausa. Se detiene la fuente musical y se conserva el cursor.
- Reanudar programa el audio desde ese cursor, con 1,3 s de preparación. Un sostenido se puede recuperar durante la cuenta atrás; al reanudar tiene 400 ms de margen sin volver a puntuar su cabeza.
- Configuración: volumen musical, volumen de golpes, ajuste de sincronización ±250 ms, efectos, movimiento del fondo y animación reducida. Positivo retrasa las notas; negativo las adelanta.
- Portada y menús no arrancan música automáticamente. El contexto de audio se abre al solicitar jugar.
- `orbita-expedition-v2`: ajustes visuales, selección, capítulos leídos y dificultades completadas. Lee ajustes de v1 como migración.
- `orbita-rhythm-v1`: récords musicales, volúmenes y offset. Récord por destino/dificultad con puntuación, precisión, rango, combo y hash de audio.
- Se conservan recuerdos ganados en la etapa visual anterior. No borrar ni resetear esos guardados durante una mejora ordinaria.

## 7. Arquitectura y recursos que sí son actuales

Sitio estático: HTML/CSS/JavaScript sin bundler ni backend. Phaser 3 local para la escena; dibujo de arte en Canvas 2D y pantallas/cómic en HTML. Persistencia local, sin cuentas ni ranking remoto. No hace falta Codex para ejecutar o continuar el proyecto.

**`index.html` define la entrada y el orden de carga.** No confundir las clases base con versiones descartadas:

| Archivo | Responsabilidad |
| --- | --- |
| `src/input.js` | Dos acciones físicas y estado de teclas. |
| `src/worlds.js` | Destinos, dificultades, arte y desbloqueos. |
| `src/music-catalog.js` | Metadatos y hashes generados desde los MP3. |
| `src/comic.js` | Canon, páginas y diálogos editables. |
| `src/art-sizes.js` | Dimensiones originales de atlas, generadas. |
| `src/expedition.js` | **Base activa** de navegación, introducción, archivo y cómic. |
| `src/expedition-scene.js` | **Base activa** de escenario, protagonista y efectos. |
| `src/rhythm.js` | Validación y sesión determinista de ritmo. |
| `src/rhythm-audio.js` | Transporte, carga verificada y reloj audible. |
| `src/rhythm-scene.js` | Extiende la escena base con notas y guardianes. |
| `src/rhythm-app.js` | Extiende la app base; instancia la aplicación y Phaser. |
| `expedition.css`, `rhythm.css` | Estilo vigente de pantallas, cómic y juego musical. |

Phaser tiene `audio.noAudio=true` para no crear otro sistema de audio; **eso no silencia el juego**. El sonido lo gestiona el transporte Web Audio propio. Usa `getOutputTimestamp()` cuando está disponible y un fallback con reloj/latencia del contexto. Reproducción, dibujo y entradas comparten esa base temporal; no sustituirla por un contador que acumule deltas de frames.

Recursos a preservar:

- `assets/elia-aurora.png`: ilustración de portada/menú. `assets/orbita.svg`: favicon.
- `assets/expedition/`: 28 PNG finales que agrupan fondos, portadas, sprites y 36 viñetas. `PROMPTS.md` conserva prompts y criterios de producción.
- `assets/fonts/`: Outfit, Comic Neue y sus licencias.
- `assets/music/`: ocho MP3 finales, identificados por destino.
- `assets/scores/<id>.json`: tres dificultades de cada canción, formato v2.
- `assets/scores/source/`: ataques, energía, pulso local y fuentes de composición. **No son residuos**: sirven para revisar o regenerar los mapas.
- `assets/scores/report.json`: recuentos por dificultad.
- `vendor/`: Phaser y licencia. `.nojekyll`: publicación estática en Pages.

El generador `scripts/build-rhythm.py` mide ataques espectrales graves/agudos, usa microenvolvente de 5,8 ms, rastrea pulso local y compone frases. Los tiempos de los ataques se conservan; no se redondean a un BPM fijo. Las colas terminan en caída armónica medida o ataque real. Las partituras son una composición asistida por análisis, **no una prueba de que cada frase haya sido afinada manualmente al escuchar**.

Si cambia el MP3, regenerar hash, análisis, catálogo y mapas juntos. `--charts-only` recompone desde las fuentes guardadas; **puede sobrescribir ediciones manuales**. Copiar o versionar esas ediciones antes de regenerar. `scripts/index-art.cjs` actualiza dimensiones de PNG sin deformar los recortes.

## 8. Estado real y trabajo pendiente

### Hecho y verificado

- Los ocho audios completos están integrados; las 24 partituras tienen individuales, dobles, sostenidos, proyectiles y desafíos con plazo.
- Motor, puntuación, jefes con bonus, pausa, configuración, récords y recompensa narrativa funcionan.
- La prueba de navegador carga las ocho pistas y revisa patrones y seis resoluciones. Hay una prueba de Altale completa en tiempo real con entradas automáticas, pausa en sostenido y bonus; antes de esta limpieza terminó sin fallos de juicio.
- Existen pruebas de EOF con offsets positivos/negativos y de cancelación de carga. No confundir fixtures de puntos de control con una reproducción completa de las ocho canciones.

### Prioridades para pulir, sin rediseñar

1. **Revisión musical por frases de los 24 mapas:** jugar/escuchar, elegir qué instrumento sigue cada frase, comprobar descansos, dobles, finales de sostenidos y ubicaciones de jefes. Que un ataque esté medido no garantiza por sí solo que la frase sea divertida o expresiva.
2. **Pruebas humanas y de dispositivos:** dificultad real de F/J, cansancio de ambas manos, offset con distintos equipos/auriculares y rendimiento de portátiles. La prueba automatizada completa principal es Altale; no afirmar que las ocho canciones se revisaron enteras con jugadores.
3. **Aprendizaje:** confirmar con el usuario y diseñar un tutorial interactivo para individuales, dobles, estelas y alternancia. Hoy la ayuda es informativa.
4. **Legibilidad y fluidez:** revisar fondos densos, masas de notas de Difícil, cola de estelas, feedback y cambio entre suelo/aire. Mantener las opciones de movimiento reducido.
5. **Deuda técnica observada:** `RhythmApp.render()` modifica HTML producido por la base; conviene extraer componentes/herramientas comunes sin cambiar el aspecto. Hay métodos compactados y filtros de notas por frame que pueden mejorarse tras medir rendimiento.
6. **Récords y robustez de datos:** hoy el récord se valida con hash de MP3, no con fingerprint de partitura. Un cambio de notas sobre el mismo audio podría dejar puntuaciones poco comparables. Revisar también entradas de guardado corruptas antes de ampliar migraciones.

No hay editor de mapas/importador `.osu` activo, controles táctiles, multijugador, backend, logros extensos o guardado en nube. Son posibles ampliaciones a decidir, no requisitos aprobados ni funciones existentes. La inspiración en osu! se refiere al criterio de sincronización/mapeo y al desafío de alternancia; el juego no volvió a ser osu!mania.

## 9. Trabajar y verificar

Para jugar, desde la raíz:

```powershell
python -m http.server 4175 --bind 127.0.0.1
```

Abrir `http://127.0.0.1:4175`. No necesita Node ni Python de análisis para que el usuario juegue en Pages.

Pruebas unitarias vigentes:

```powershell
node --test tests/input.test.cjs tests/expedition.test.cjs tests/rhythm.test.cjs
```

Después de limpiar quedan **18 pruebas de módulos actuales**. Las cifras de 37 en conversaciones previas incluían pruebas de módulos sustituidos, que se retiraron. El test musical recorre las 24 partituras y verifica archivos/hashes y tiempos fuente.

Con servidor, Playwright instalado y Chrome disponible:

```powershell
node tests/browser.test.cjs
node tests/playback.browser.cjs
node tests/transport.browser.cjs
```

`CHROME_EXECUTABLE` permite cambiar la ruta de Chrome y `ORBITA_TEST_URL` el sitio de prueba. La prueba de playback dura la canción real; no es un bloqueo del proceso. `tmp/` se recrea para capturas/reportes y se ignora en Git.

Para análisis musical: instalar dependencias de `scripts/audio-requirements.txt` en un entorno de desarrollo y seguir `docs/MAPEO.md`. No hace falta conservar las dependencias temporales de otra máquina ni rutas privadas de Codex.

La publicación acordada usa `main`, `/(root)` en GitHub Pages. Se han autorizado commit/push al terminar cambios completos y verificados; no hacer commits intermedios de una reconstrucción a medias. No reescribir el historial ni forzar pushes como parte de una limpieza ordinaria. Revisar siempre las instrucciones más recientes del usuario antes de publicar.

## 10. Limpieza de esta entrega

Se retiraron 58 archivos versionados sin uso en la entrada vigente: motores/apps de prototipos, CSS anterior, imágenes y prompts sustituidos, la carpeta antigua de audios/partituras, el piloto de Aurora, su generador y pruebas que dependían de esos motores. Su historia sigue en Git; no se arrastran como requisitos del juego actual.

Fuera del repositorio se identificó exclusivamente la carpeta de este chat/proyecto en Codex. Se retiraron dos diseños antiguos de Contrapunto (nave/canales verticales y plan de cinco estaciones) y 31 variantes gráficas descartadas. Se conservaron 29 originales gráficos cuyo hash coincide con PNG finales del repositorio. La configuración global, credenciales, sesiones, adjuntos del usuario, plugins y archivos de otros proyectos no forman parte de esta limpieza.

La revisión automática rechazó el borrado recursivo de `tmp/` con el mensaje «blocked by policy», sin motivo más específico. Esa carpeta permanece local, ignorada por Git, con capturas, informes y dependencias de análisis temporales (aproximadamente 664 MiB antes de las últimas pruebas). Es limpieza pendiente del entorno, no una dependencia para jugar. No se eludió el rechazo mediante otro mecanismo de borrado.

Se mantienen las fuentes musicales, el arte final y los prompts finales dentro del repositorio. Para otra IA basta entregar este archivo y el repositorio actual; no hace falta copiar `tmp/` ni el directorio global `.codex`.

## 11. Guía de continuidad para otra IA

Lee este archivo, `README.md`, `index.html` y el módulo relacionado con la tarea antes de modificar. Contrasta los cambios con los datos reales y ejecuta las pruebas pertinentes. Conserva archivos del usuario y cambios locales ajenos. Una revisión de código autoriza describir problemas, no rehacer el concepto ni corregir todo el backlog sin que se solicite.

Informa qué cambió, por qué y cómo se verificó. Distingue decisiones aprobadas, comportamiento actual, propuestas y limitaciones. Mantén este contexto actualizado cuando cambie una decisión; los chats y diseños antiguos no deben imponerse sobre el estado vigente.
