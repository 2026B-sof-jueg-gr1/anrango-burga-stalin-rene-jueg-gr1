# Órbita: Contrapunto

Juego de ritmo lateral espacial. Elia intenta recuperar la llamada de Sira y reparar Aurora sin borrar las conversaciones pendientes. La historia principal tiene cinco capítulos; tres rutas extra amplían el viaje.

**[Jugar](https://2026b-sof-jueg-gr1.github.io/anrango-burga-stalin-rene-jueg-gr1/)** · **[Repositorio](https://github.com/2026B-sof-jueg-gr1/anrango-burga-stalin-rene-jueg-gr1)**

## Cómo jugar

- **F:** golpea abajo. **J:** golpea arriba. Las teclas responden también antes de que llegue un enemigo.
- Pulsa cuando el objetivo llegue al círculo de su altura. Mantén la tecla para una cinta larga y pulsa ambas alturas para una pareja simultánea.
- **P / Escape:** pausa. Puedes continuar, reiniciar o volver al selector.
- El primer jefe se mueve y dispara proyectiles: devuélvelos siguiendo el ritmo. Más adelante aparece un núcleo protegido: alterna las dos acciones para romper su escudo.
- En Ajustes puedes elegir 2, 4 u 8 teclas, reasignarlas, calibrar audio y reducir movimiento. Las teclas adicionales son alternativas para las mismas dos acciones; no cambian el mapa ni duplican puntos.
- Los botones de suelo y aire admiten toque. La experiencia de partida está pensada para composición horizontal.

## Tutorial y presentación

La primera visita presenta tres frases sobre negro, escritas progresivamente. Una pulsación puede completar la frase; la siguiente avanza. Después empieza el entrenamiento, sin opción de saltar directamente desde la presentación.

El tutorial introduce las dos alturas, muestra una demostración automática y luego espera a que pulses **Practicar**. Sus siete pasos incluyen suelo, aire, alternancia, sostenidos, simultáneas, proyectiles y escudo. Cada paso correcto tiene una confirmación visual; un error permite repetir sin perder vidas. **Saltar tutorial** permanece visible en la esquina superior.

La ayuda está situada abajo, con letras legibles y las teclas actuales. El personaje sigue corriendo durante la explicación. Al terminar puedes ir al menú o practicar otra vez.

## Música y mapas

El propietario del proyecto proporcionó los ocho MP3 locales. Las canciones se reproducen desde `assets/audio/`; no se extrae audio de YouTube ni se necesita un servicio externo durante el juego. Los enlaces de referencia y créditos están en el selector.

| Estación | Artista y pista | Edición de juego |
| --- | --- | --- |
| Puerto Aurora | Yunomi feat. TORIENA — Wakusei Rabbit | 2:59 aprox. |
| Jardines de Io | Nayutalien — Alien Alien | 2:59 aprox. |
| Cinturón de Chatarra | Camellia — PLANET//SHAPER | 2:59 aprox. |
| Mar de Iones | xi — Ascension to Heaven | 2:47 |
| Faro Cero | Kurokotei — Galaxy Collapse | 3:00 aprox. |
| Núcleo de Rebote, ruta extra | t+pazolite — Oshama Scramble! | 3:00 aprox. |
| Abismo de Plasma, ruta extra | USAO — Cthugha | 2:35 aprox. |
| Órbita Libre, ruta extra | xi — FREEDOM DiVE | 2:59 aprox. |

Hay **ocho rutas y tres dificultades por ruta: 24 mapas**. Las rutas extra reutilizan el mundo industrial, de iones y solar con música y patrones propios. La canción conserva su velocidad al cambiar de dificultad.

Los MP3 originales se mantienen sin cambios. Al prepararlos se crea en memoria una edición de hasta tres minutos, cerrada a compás y con salida suave; los archivos más cortos conservan su duración disponible. La rejilla de pulsos se obtuvo del audio, se suavizó y quedó registrada en `src/track-maps.js`. El BPM de la rejilla es una medición de estos archivos concretos, no una afirmación del BPM oficial de cada composición.

El motor calcula las notas desde esa rejilla, adapta huecos a la energía del audio y utiliza el reloj de reproducción para el juicio y la representación. Las partituras son una base generada; se pueden seguir afinando manualmente por frases y acentos. La calibración del jugador compensa diferencias de dispositivo.

## Historia y arte

La narrativa completa, los personajes, las reglas del mundo, las revelaciones y las pautas para nuevos mapas están en [docs/HISTORIA.md](docs/HISTORIA.md). Se puede consultar también el archivo narrativo desde el menú, con fragmentos asociados al progreso.

Los fondos originales se conservan y se animan con desplazamiento suave, partículas y capas ambientales. Elia tiene una nueva hoja de doce movimientos, además de su pose de victoria. Diez criaturas y seis diseños de jefe aportan identidades de carga orbital, jardín, fundición, tormenta y faro.

Los impactos producen arcos de plasma, pulsos, fragmentos o partículas vegetales según el entorno. La devolución de un proyectil tiene una estela de regreso. Perfect/Great/Good/Miss aparecen sobre Elia. La vida y la energía tienen una barra central inferior. Se respeta el ajuste de movimiento reducido.

Las imágenes se crearon con la herramienta integrada de generación de imágenes y se guardan localmente. Procedencia y prompts: [assets/ART-DIRECTION.md](assets/ART-DIRECTION.md).

## Ejecución local

Sin instalación ni compilación:

```powershell
python -m http.server 4175 --bind 127.0.0.1
```

Abre [localhost:4175](http://127.0.0.1:4175) o usa Live Server. Phaser está incluido en `vendor/`. Las fuentes de Google son opcionales y tienen alternativas locales. GitHub Pages publica desde `main`, `/(root)`.

## Código y comprobaciones

- `src/core.js`: ocho rutas, composición de eventos, dos acciones y reglas de juicio.
- `src/track-maps.js`: rejillas y metadatos medidos de los MP3.
- `src/audio.js`, `src/tracks.js`: reproducción, preparación de ediciones de juego y análisis.
- `src/scene.js`, `src/art.js`: escenario, animación, atlas, jefes y efectos.
- `src/story.js`: narrativa y símbolos SVG.
- `src/library.js`: catálogo y créditos de canciones.
- `src/app.js`, `src/experience.js`: flujo, tutorial, menús, ajustes y persistencia.
- `styles.css`, `experience.css`: interfaz adaptable y mejoras de legibilidad.

```powershell
node --test tests/core.test.cjs
node tests/browser.test.cjs
```

La segunda prueba requiere Playwright y un servidor local. Usa Chrome en un perfil aislado; admite `CHROME_EXECUTABLE` y `ORBITA_TEST_URL`. Comprueba introducción progresiva, siete demostraciones y prácticas, reintentos, F/J libre, dos jefes, reproducción y muestras de los ocho MP3, récords y seis resoluciones. Las pruebas del núcleo cubren los 24 mapas y sus sostenidos, pausa, entradas alternativas y enemigos.

Las capturas y datos temporales de verificación se guardan en `tmp/`, ignorado por Git. El progreso se conserva en el navegador; los nuevos récords de esta versión se distinguen de los de la antigua banda sonora.
