# Órbita: Contrapunto

Juego de ritmo lateral con Phaser 3. Elia atraviesa seis estaciones para responder a la canción de su madre y devolver la comunicación a Aurora. Dos rutas extra amplían el viaje.

**[Jugar](https://2026b-sof-jueg-gr1.github.io/anrango-burga-stalin-rene-jueg-gr1/)** · **[Repositorio](https://github.com/2026B-sof-jueg-gr1/anrango-burga-stalin-rene-jueg-gr1)**

## Controles

- **F:** suelo. **J:** aire. Golpea cuando el objetivo llegue a su círculo.
- Mantén las estelas. Usa ambas acciones en las parejas simultáneas.
- Devuelve los proyectiles del jefe. Alterna las manos para lanzar aros contra el escudo.
- **P / Escape:** pausa o vuelve. **Enter / Espacio:** activa el botón enfocado o la acción principal.
- Ajustes permite 2, 4 u 8 teclas. Son alternativas para las mismas dos alturas; todos los mapas funcionan con cualquier configuración.

La primera visita incluye una presentación breve y un entrenamiento continuo de siete pasos. Los receptores indicados destellan; un paso avanza cuando lo completas. Los errores repiten los objetivos sin quitar vida y Elia sigue corriendo. La ayuda del menú es un modal independiente. La historia se cuenta mediante seis viñetas navegables.

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

Las partículas cambian con el entorno y el enemigo: estrellas, hojas, fragmentos y cristales. Los proyectiles y los aros recorren la distancia hasta el jefe y producen impactos en su posición. El escudo admite una ráfaga de hasta 18 segundos y exige más alternancias según dificultad.

Los fondos tienen tráfico orbital, hojas, chispas, ondas, rayos o anillos mediante Canvas; no necesitan videos. El ajuste de movimiento reducido elimina el movimiento decorativo y conserva las señales necesarias para jugar.

**[Historia](docs/HISTORIA.md)** · **[Dirección de arte](assets/ART-DIRECTION.md)** · **[Prompt de la historieta](assets/COMIC-PROMPT.md)**

## Ejecutar y comprobar

No requiere instalación ni compilación:

```powershell
python -m http.server 4175 --bind 127.0.0.1
```

Abre [localhost:4175](http://127.0.0.1:4175). Phaser está incluido en `vendor/`. GitHub Pages publica desde `main`, `/(root)`.

```powershell
node --test tests/core.test.cjs tests/notation.test.cjs
node tests/browser.test.cjs
```

Las pruebas de navegador requieren Playwright y un servidor local. Usan Chrome con un perfil aislado; admiten `CHROME_EXECUTABLE` y `ORBITA_TEST_URL`. Cubren las siete prácticas, controles, navegación, viñetas, carga, escala del personaje, dos jefes, canciones completas, récords y seis tamaños de pantalla. Las pruebas del motor comprueban los 24 mapas, sostenidos, alternancia y formatos de partitura.

`src/catalog.js` define el recorrido; `src/track-maps.js`, las duraciones; `assets/charts/`, las notas. `src/notation.js` importa, valida y genera borradores. `src/audio.js` y `src/tracks.js` reproducen. `src/scene.js` y `src/motion.js` dibujan y animan. `src/app.js` y `src/experience.js` controlan las pantallas y la persistencia.

El progreso se guarda en el navegador. Los récords distinguen canciones y partituras importadas. Las capturas y utilidades temporales quedan en `tmp/`, ignorado por Git.
