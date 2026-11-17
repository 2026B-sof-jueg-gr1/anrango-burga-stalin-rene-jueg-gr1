# Órbita · La canción de vuelta

Un juego de ritmo espacial con dos teclas. Elia sigue una melodía hacia las colonias que todos creían perdidas. Ocho escenarios ilustrados, veinticuatro partituras y una historia que se desbloquea al completar las canciones.

**Para continuar el proyecto con otra IA o desarrollador, lee primero [CONTEXTO-PROYECTO.md](CONTEXTO-PROYECTO.md).** Reúne las decisiones vigentes, las reglas, el estado real del código y el trabajo pendiente.

**[Jugar](https://2026b-sof-jueg-gr1.github.io/anrango-burga-stalin-rene-jueg-gr1/)** · **[Repositorio](https://github.com/2026B-sof-jueg-gr1/anrango-burga-stalin-rene-jueg-gr1)**

## Jugar con F y J

Órbita Pulso es el único modo. **F** golpea en el suelo; **J** salta y golpea en el aire. Cada nivel ofrece **Fácil, Medio y Difícil**, con partituras diferentes sobre el mismo MP3 completo.

- **Individual:** pulsa cuando el centro del objetivo llegue a su aro.
- **Doble:** pulsa F y J a la vez.
- **Estela:** mantén la tecla hasta que termine la barra. Soltarla antes pierde su cola.
- **Proyectil:** devuelve el ataque del guardián en la altura correspondiente.
- **Sobrecarga del guardián:** alterna F/J rápidamente antes de vencer el plazo. Al cumplir el mínimo se rompe el escudo; el tiempo restante sigue abierto para sumar bonus.

La precisión distingue Perfecto, Genial, Bien y Fallo. Se muestran puntuación, combo, energía y progreso de la canción. Llega al final con energía y al menos **60% de precisión** para completar el nivel. Un guardián que escapa quita energía y rompe el combo.

**P / Escape:** pausa. Al continuar hay una cuenta atrás para preparar las manos; las notas largas permiten recuperar su tecla. **Enter / Espacio:** acción principal. **Flechas:** niveles, páginas o viñetas.

## Las ocho canciones

| Nivel | Música | Duración del archivo |
| --- | --- | --- |
| Puerto Aurora | Sakuzyo — Altale | 2:32 |
| Jardines de Io | Snail's House — Pixel Galaxy | 4:00 |
| Cinturón de Chatarra | meganeko — Feral | 4:26 |
| Núcleo de Rebote | t+pazolite — Cheatreal | 4:54 |
| Mar de Iones | xi — Blue Zenith | 4:18 |
| Abismo de Plasma | Camellia — crystallized | 4:37 |
| Órbita Libre | Camellia — Exit This Earth's Atomosphere | 5:31 |
| Faro Zero | xi — Halcyon | 5:11 |

Se utilizan los MP3 facilitados por el usuario, sin recorte ni cambio de velocidad. Las canciones pertenecen a sus respectivos artistas. [Selección y enlaces de escucha](docs/MUSICA-PROPUESTA.md).

## Sonido y sincronización

La reproducción, la posición de las notas y las entradas comparten el reloj de Web Audio. La carga verifica el SHA-256 y la duración del archivo contra su partitura. No se generan objetivos por segundos transcurridos ni se mantiene un temporizador musical separado de la canción.

Configuración permite ajustar música, volumen de golpes, sincronización en milisegundos, intensidad de efectos y movimiento del fondo. Empieza con **0 ms**; un valor positivo retrasa la llegada de las notas y uno negativo la adelanta. Las ventanas de juicio y la anticipación cambian con la dificultad.

Los mapas se compusieron por frases a partir de ataques espectrales y energía armónica de los archivos seleccionados. Conservan tiempos absolutos y admiten cambios locales de pulso. Sus fuentes, el generador y el informe por dificultad están en el repositorio para revisar frases concretas después de jugarlas. [Motor y mapeo](docs/MAPEO.md).

## Historia y arte

La portada y las tres frases escritas sobre negro preceden al menú. Los recuerdos aparecen como recompensa por completar niveles: la primera victoria desbloquea también el prólogo. El archivo tiene páginas anterior/siguiente, sin desplazamiento vertical, y el cómic admite viñetas ampliadas.

Hay ocho fondos y portadas, dieciséis criaturas, ocho guardianes y doce poses para Elia. El cómic contiene nueve páginas y treinta y seis viñetas. Los aros conservan base oscura, borde claro y F/J para ser legibles sobre todos los fondos. El catálogo admite más destinos.

El progreso narrativo previo se conserva. Las nuevas marcas musicales se guardan por canción y dificultad, con puntuación, precisión, rango y combo máximo.

**[Historia](docs/HISTORIA.md)** · **[Guion](docs/GUION-COMIC.md)** · **[Dirección de arte](docs/EXPEDICION-VISUAL.md)** · **[Arte y prompts](assets/expedition/PROMPTS.md)**

## Ejecutar y verificar

No necesita instalación ni compilación para jugar:

```powershell
python -m http.server 4175 --bind 127.0.0.1
```

Abre [localhost:4175](http://127.0.0.1:4175). GitHub Pages publica `main`, `/(root)`.

```powershell
node --test tests/input.test.cjs tests/expedition.test.cjs tests/rhythm.test.cjs
node tests/browser.test.cjs
node tests/playback.browser.cjs
node tests/transport.browser.cjs
```

Las pruebas de navegador necesitan Playwright, Chrome y el servidor. Admiten `CHROME_EXECUTABLE` y `ORBITA_TEST_URL`. La primera revisa las ocho pistas, patrones, plazos, resultados y seis resoluciones mediante puntos de control. La segunda reproduce Altale **entera en tiempo real**, con entradas automáticas de prueba y una pausa durante un sostenido; no adelanta el audio. La tercera comprueba el final de la canción con ajustes positivos y negativos y la cancelación de una carga.

## Código activo

- `src/rhythm.js`: juicio, sostenidos, combo, energía y desafíos con plazo.
- `src/rhythm-audio.js`: reproducción, reloj audible, pausa y carga verificada.
- `src/rhythm-scene.js`: notas y guardianes sobre los escenarios.
- `src/rhythm-app.js`: partida, configuración, resultados y récords.
- `src/worlds.js`, `src/comic.js`: catálogo y narrativa.
- `src/expedition.js`, `src/expedition-scene.js`: pantallas, cómic y base artística.
- `assets/music/`, `assets/scores/`: MP3 completos y partituras actuales.
- `scripts/build-rhythm.py`: análisis y composición reproducibles.

Los prototipos y recursos sustituidos se retiraron del árbol actual; el historial de Git permite consultar esas versiones. `tmp/`, ignorado por Git, se usa para capturas y resultados temporales de las pruebas y puede recrearse. Phaser, Outfit y Comic Neue se sirven localmente y conservan sus licencias.
