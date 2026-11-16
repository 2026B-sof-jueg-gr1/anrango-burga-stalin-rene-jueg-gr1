# Órbita: Contrapunto

Juego de ritmo lateral con Phaser 3. En un puerto abandonado, Elia reconoce la melodía de su madre en un transmisor apagado. Sigue sus pistas para completar una conversación pendiente.

**Piloto actual: Puerto Aurora.** Estrena escenario pastel, criaturas postales compactas, prólogo ilustrado y una pista tras completar el mapa. Se valida esta dirección antes de extenderla a las otras siete rutas, que siguen abiertas con su presentación anterior. Altale permanece completa como música provisional. [Alcance del piloto](docs/PILOTO-AURORA.md).

**[Jugar](https://2026b-sof-jueg-gr1.github.io/anrango-burga-stalin-rene-jueg-gr1/)** · **[Repositorio](https://github.com/2026B-sof-jueg-gr1/anrango-burga-stalin-rene-jueg-gr1)**

## Controles

- **Teclado:** F golpea el suelo y J golpea el aire.
- **Mouse + teclado:** mueve el cursor arriba o abajo para elegir la altura. Z y X son equivalentes: cualquiera golpea donde apuntas. El mouse mueve a Elia incluso sin pulsar; el clic no golpea.
- Mantén la tecla hasta el final de una estela. Conserva su altura inicial aunque apuntes a la otra para golpear una nota con la segunda tecla.
- Devuelve los proyectiles del jefe. Alterna las manos para lanzar aros contra el escudo.
- **P / Escape:** pausa o vuelve. **Enter / Espacio:** activa el botón enfocado o la acción principal.
- Elige entre los dos modos en Ajustes o desde la ficha de una estación. Son dos teclas fijas por modo; se retiraron las configuraciones de cuatro y ocho teclas y la reasignación.

Los jefes piden alternar F/J en teclado o Z/X en mouse, aunque el cursor permanezca en una altura. No cuentan repeticiones automáticas por mantener una tecla. El teclado conserva las parejas simultáneas; en mouse se condensan en un objetivo, manteniendo el sostenido si lo hay. La música y sus tiempos permanecen iguales y los archivos de partituras no se modifican.

Los récords del mouse se guardan aparte. Si cambias el modo durante una pausa, el botón de continuar ofrece reiniciar con el nuevo control para no mezclar partituras ni puntuaciones. Las preferencias antiguas de ocho teclas migran a F/J.

La primera visita incluye una presentación breve, tres viñetas y la elección de control antes del entrenamiento continuo de siete pasos. Los receptores indicados destellan; los errores repiten los objetivos sin quitar vida. La práctica completada y el aviso previo al juego se guardan por modo. La ayuda del menú es independiente. Una cuarta viñeta se descubre al continuar después de superar Aurora.

## Música

Se usan los archivos locales proporcionados por el propietario del proyecto. Se reproduce cada archivo decodificado **completo**, a su velocidad y frecuencia originales, sin recorte a tres minutos ni fundido añadido. El tiempo de la partida, las notas y los juicios comparten el reloj del audio.

| Orden | Mapa | Canción | Archivo completo |
| --- | --- | --- | --- |
| 01 | Puerto Aurora | Sakuzyo — Altale | 2:36 |
| 02 | Jardines de Io | wa. — Black Lotus | 3:02 |
| 03 | Cinturón de Chatarra | Silentroom × 駿 — Nhelv | 2:42 |
| 04 | Núcleo de Rebote | t+pazolite — Cheatreal | 4:54 |
| 05 | Mar de Iones | xi — Blue Zenith | 4:18 |
| 06 | Abismo de Plasma, extra 1 | Laur — Sound Chimera (Nyankovsky & Kobaryo Remix) | 3:39 |
| 07 | Órbita Libre, extra 2 | Camellia — Spin Eternally | 3:50 |
| 08 | Faro Zero, final | Kurokotei — Galaxy Collapse | 6:47 |

Los títulos y enlaces de referencia aparecen en los créditos de la canción seleccionada. Los BPM del catálogo son los indicados por el propietario como referencia; no se presentan como mediciones oficiales ni fuerzan las notas a una rejilla constante.

Hay **24 partituras**, almacenadas como JSON con segundos explícitos. Su primera versión detecta ataques del audio en bandas graves y agudas, selecciona acentos según dificultad y conserva huecos. Incluye sostenidos, simultáneas y dos encuentros con jefes. Estos mapas son **borradores por acentos**, no partituras revisadas nota por nota. La colocación expresiva, las colas y la elección de frases aún pueden afinarse escuchando y jugando.

El antiguo compositor de patrones periódicos se retiró. Para autoría manual se puede importar osu!mania de dos columnas o JSON, sin cuantizar sus tiempos. El editor es una herramienta de producción: la partida continúa siendo lateral.

**[Guía de mapeo y revisión musical](docs/MAPEO.md)** · **[Abrir herramientas de partituras](https://2026b-sof-jueg-gr1.github.io/anrango-burga-stalin-rene-jueg-gr1/?editor=1)**

## Presentación y movimiento

La pantalla de título conserva su ilustración. La carga tiene progreso central, porcentaje y órbitas animadas. El selector usa flechas y mantiene todas las rutas abiertas durante el desarrollo. La partida muestra puntuación, combo, pausa y vida/energía/progreso en una barra inferior.

Elia usa una escala de celda constante con calibración anatómica por pose: el contorno del aro no cambia el tamaño de su cuerpo. Hay ocho fases de carrera, transiciones cortas entre poses, desplazamiento suave entre alturas, canalización y propulsores. Las criaturas tienen balanceo, flotación y apéndices animados.

Los proyectiles y aros recorren la distancia hasta el jefe y producen impactos breves en su posición. Aurora tiene una zona de notas despejada, criaturas más pequeñas y respuestas sin grandes flashes ni sacudidas. El escudo admite una ráfaga de hasta 18 segundos y exige más alternancias según dificultad.

Los ajustes separan intensidad de efectos, movimiento ambiental y movimiento reducido. A cero se conservan círculos, objetivos y confirmación mínima del golpe. El fondo nuevo mantiene el detalle lejos de las dos alturas de lectura.

**[Historia](docs/HISTORIA.md)** · **[Arte del piloto y prompts](assets/PILOT-ART.md)** · **[Arte anterior](assets/ART-DIRECTION.md)**

## Ejecutar y comprobar

No requiere instalación ni compilación:

```powershell
python -m http.server 4175 --bind 127.0.0.1
```

Abre [localhost:4175](http://127.0.0.1:4175). Phaser está incluido en `vendor/`. GitHub Pages publica desde `main`, `/(root)`.

```powershell
node --test tests/core.test.cjs tests/notation.test.cjs tests/input.test.cjs tests/pilot.test.cjs
node tests/browser.test.cjs
node tests/controls.browser.cjs
node tests/pilot.browser.cjs
```

Las pruebas de navegador requieren Playwright y un servidor local. Usan Chrome con un perfil aislado; admiten `CHROME_EXECUTABLE` y `ORBITA_TEST_URL`. Cubren las siete prácticas, controles, navegación, viñetas, carga, escala del personaje, dos jefes, canciones completas, récords y seis tamaños de pantalla. Las pruebas del motor comprueban los 24 mapas, sostenidos, alternancia y formatos de partitura.

`src/catalog.js` define el recorrido; `src/track-maps.js`, las duraciones; `assets/charts/`, las notas. `src/input.js` controla F/J, mouse + Z/X y la adaptación de parejas. `src/notation.js` importa, valida y genera borradores. `src/audio.js` y `src/tracks.js` reproducen. Las capas `scene`/`motion` y `app`/`experience` conservan el juego anterior. `src/pilot-scene.js` y `src/pilot.js` integran el escenario de Aurora, la nueva historia y preferencias. `src/pilot-score.js` organiza sus frases musicales.

El progreso se guarda en el navegador. Los récords distinguen canciones y partituras importadas. Las capturas y utilidades temporales quedan en `tmp/`, ignorado por Git.
