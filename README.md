# Órbita: Contrapunto

**Dos manos. Dos voces. Una conversación que cruza las estrellas.**

Una aventura de ritmo para teclado, desarrollada con Phaser 3 y Web Audio. A bordo de la Nomad, reconstruyes los mensajes de una red de faros interestelares. Tu mano izquierda interpreta la llamada; la derecha, la respuesta.

## Esta versión

Tres encuentros conectan la historia de Sira y su hija Elia:

| Encuentro | Tempo | Duración musical | Historia |
| --- | --- | --- | --- |
| Faro dormido | 120 BPM | 1:12 | Una operadora conserva una melodía para su hija. |
| La respuesta pendiente | 128 BPM | 1:08 | Elia responde con la voz de la persona en que se convirtió. |
| Mar de estática | 140 BPM | 1:09 | Las dos partes atraviesan el corredor y restauran el enlace. |

Cada canción evoluciona entre **Pulso**, **Deriva** y **Confluencia**: llamada y respuesta, notas sostenidas y coordinación simultánea. Son fases de un mismo sistema de cuatro canales. Hay notas simples, sostenidos y acordes; las teclas mantienen su posición durante todo el encuentro.

Las tres piezas son composiciones originales sintetizadas para el juego: ambiente espacial, bajos, batería electrónica y guitarras de cuerda modelada mediante Karplus–Strong. Las dos voces y el mapa de notas comparten partitura. La música se genera antes de jugar y se conserva en memoria durante la sesión, sin depender de servicios de audio, archivos de canciones externos o claves de API. Las guitarras son sintetizadas, no grabaciones de instrumentos reales.

La interfaz ocupa la ventana completa, con mapa de faros, historia, instrucciones, ajustes y resultados integrados. El botón ⛶ permite solicitar pantalla completa del navegador. El movimiento reducido del sistema se respeta y se puede ajustar en el juego.

## Presentación visual

El mapa de faros es interactivo: cada planeta selecciona un encuentro. Una ilustración creada para el proyecto presenta a Sira y Elia; las transmisiones se cuentan en 19 escenas con frases breves, encuadres por personaje y motivos visuales de la melodía, la guitarra, el faro y el enlace. Los retratos reaccionan a las notas durante la partida. Las escenas avanzan al pulsar Continuar, sin tiempos obligatorios de lectura, y se pueden saltar.

El arte se sirve desde `assets/contrapunto-keyart.png`. Su procedencia y el prompt de generación con la herramienta integrada de imágenes están documentados en [assets/ART-DIRECTION.md](assets/ART-DIRECTION.md). Los planetas, los motivos y las animaciones se dibujan con CSS y SVG.

## Ejecutar localmente

Abre esta carpeta en VS Code y usa **Open with Live Server** sobre `index.html`. También puedes ejecutar:

```powershell
python -m http.server 4174 --bind 127.0.0.1
```

Abre <http://127.0.0.1:4174>. El juego no requiere npm ni compilación. El primer clic para interpretar activa el audio del navegador.

## Controles

| Acción | Entrada |
| --- | --- |
| Voz izquierda | D / F |
| Voz derecha | J / K |
| Pausar y continuar | P / Escape |
| Pantalla completa | Botón ⛶ |
| Navegar menús | Ratón o Tab y Enter |

Las cuatro letras se pueden reasignar en **Ajustes**. P se reserva para pausa. Los botones de los cuatro canales también admiten entrada táctil. La experiencia principal está pensada para teclado con dos manos; los acordes se limitan a dos canales simultáneos.

Pulsa cuando la señal llega al receptor. Mantén la tecla durante una nota larga. Al volver de una pausa, tienes una cuenta de entrada y un breve margen para recuperar un sostenido que estuvieras tocando.

## Dificultad y progreso

- **Historia:** una partitura más accesible; los errores no interrumpen el relato.
- **Normal:** incorpora respuestas adicionales, acordes y pérdida de estabilidad por errores.
- **Experto:** añade alternancias más densas y ventanas de precisión menores.

Las tres dificultades conservan el tempo y las escenas de historia. Cada encuentro se puede volver a interpretar; el mapa permite seleccionar cualquiera de los tres. Los resultados muestran precisión, mejor cadena, señales perdidas y desempeño de cada mano.

La repetición automática del teclado no produce nuevos golpes. Pulsar canales vacíos reduce la precisión; los errores afectan a la estabilidad según la dificultad. Un sostenido puntúa su inicio y su final.

El progreso, los mejores resultados por dificultad, las teclas y los ajustes se guardan en el almacenamiento local del navegador. No hay cuenta ni servidor de partidas. Si el almacenamiento no está disponible, se puede jugar sin persistencia.

## Sincronización y sonido

En **Ajustes** puedes cambiar volumen y compensación temporal entre -250 y +250 ms. Un valor positivo compensa golpes que llegan después de la referencia de audio.

**Probar sincronización** emite un metrónomo. Escucha los primeros cuatro pulsos y luego pulsa Espacio al ritmo de los clics. Con suficientes muestras se propone la mediana de los desfases, redondeada a 5 ms. La medición es personal: la latencia depende del equipo y la salida de audio.

El reloj de `AudioContext` gobierna las notas y la canción. Cambiar de pestaña o perder el foco pausa la partida. La reanudación crea una fuente de audio en el punto guardado, precedida por una cuenta de entrada. El modo de movimiento reducido atenúa las animaciones sin cambiar los tiempos de juicio.

## Estructura del código

- `index.html`: pantallas, controles, diálogos e instrucciones.
- `styles.css`: interfaz de juego que se adapta a la ventana.
- `cinema.css`: mapa estelar, encuadres, retratos y presentación de escenas.
- `narrative.js`: diálogo por personaje y motivos gráficos de las 19 escenas.
- `rhythm.js`: capítulos, partitura, mapas por dificultad y reglas de juicio; se prueba sin navegador.
- `music.js`: síntesis de las canciones, reproducción y reloj musical.
- `game.js`: historia, estados de partida, entrada, resultados, calibración y persistencia.
- `stage.js`: escenario Phaser, nave, receptores, notas y efectos.
- `visuals.js`: texturas originales de Órbita, creadas una sola vez con Canvas.
- `assets/orbita.svg`: emblema del juego.
- `vendor/`: Phaser 3.90.0 y su licencia MIT, incluidos para jugar sin descargar la librería.
- `tests/`: pruebas del sistema de notas e integración en un navegador aislado.

Las fuentes de Google Fonts son opcionales y tienen alternativas locales. Las rutas de recursos son relativas, compatibles con GitHub Pages.

## Verificación

Pruebas del núcleo, con Node.js:

```powershell
node --test tests/rhythm.test.cjs
```

Cubren los nueve mapas (tres encuentros por tres dificultades), interpretaciones perfectas, sostenidos, pausa, entradas incorrectas y pérdida de estabilidad.

La prueba `tests/browser-smoke.cjs` requiere Playwright y un servidor local. Usa una instancia aislada de Chrome; no accede al perfil personal. El ejecutable se puede indicar mediante `CHROME_EXECUTABLE` y la dirección mediante `ORBITA_TEST_URL`. Comprueba preparación real de audio, dimensiones de pantalla, controles, pausa, resultado, historia y persistencia. Las capturas de QA se guardan en `tmp/`, ignorado por Git.

## Publicar

Repositorio: <https://github.com/2026B-sof-jueg-gr1/anrango-burga-stalin-rene-jueg-gr1>

Conserva `index.html` en la raíz, junto con los otros scripts y las carpetas `assets` y `vendor`. En GitHub Pages utiliza **Deploy from a branch → main → /(root)**. `.nojekyll` permite servir los archivos estáticos directamente.

La dirección configurada del proyecto es <https://2026b-sof-jueg-gr1.github.io/anrango-burga-stalin-rene-jueg-gr1/>. Un cambio local aparece allí cuando se sube a la rama publicada y finaliza el despliegue de Pages.

## Créditos

Historia, composiciones y gráficos originales de Órbita: Contrapunto. Desarrollado en JavaScript con [Phaser 3](https://phaser.io/), bajo licencia MIT del proveedor. Tipografías DM Sans y Space Grotesk de Google Fonts. Inspiración en la coordinación y lectura de patrones de los juegos de ritmo; no utiliza canciones, personajes o mapas de osu!.
