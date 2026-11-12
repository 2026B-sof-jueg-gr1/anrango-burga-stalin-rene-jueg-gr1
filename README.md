# Órbita: Contrapunto

Una aventura de ritmo lateral en el espacio. Elia corre automáticamente por cinco estaciones para reconstruir una transmisión de su madre. Golpea objetivos de **suelo** y **aire**, mantén cintas de energía y rompe los escudos de guardianes siguiendo la música.

**[Jugar](https://2026b-sof-jueg-gr1.github.io/anrango-burga-stalin-rene-jueg-gr1/)** · **[Repositorio](https://github.com/2026B-sof-jueg-gr1/anrango-burga-stalin-rene-jueg-gr1)**

## Jugar

- **F:** suelo. **J:** aire. Mantén para las notas largas y pulsa ambas acciones para los acordes.
- **P / Escape:** pausar. La pausa permite continuar, reiniciar o volver a estaciones.
- Durante el guardián, alterna suelo y aire para romper su escudo. Mantener una tecla no genera golpes automáticos.
- En Ajustes puedes usar **2, 4 u 8 teclas**, reasignarlas, cambiar volumen, reducir efectos y calibrar el desfase de audio.
- Los botones de suelo y aire también admiten toque simultáneo. La composición de partida es horizontal; en móvil se recomienda girar el dispositivo.

Las teclas extra son alternativas para las mismas dos acciones. Los quince mapas se pueden completar con dos teclas. No se exige mover al personaje ni saltar con otro control.

## Contenido

| Estación | BPM | Canción | Guardián |
| --- | --- | --- | --- |
| Puerto Aurora | 112 | 1:43 | Centinela de aduana |
| Jardines de Io | 120 | 1:36 | Jardinero orbital |
| Cinturón de Chatarra | 132 | 1:35 | Prensa Titán |
| Mar de Iones | 144 | 1:33 | Mantarraya de iones |
| Faro Cero | 150 | 1:36 | Custodio de Aurora |

Cada estación tiene ilustración, paleta y elementos visuales propios y tres dificultades: **Fácil, Medio y Difícil**. La dificultad modifica los patrones y el margen temporal; conserva la canción y su velocidad. Los niveles están disponibles para selección libre, con una secuencia narrativa sugerida.

La primera visita incluye una presentación breve y un tutorial de seis pasos. Al terminar o salir de la práctica puedes repetirla o ir al menú. En siguientes visitas entras al menú desde el inicio. El tutorial y las instrucciones siguen disponibles desde el menú.

Los aciertos suman puntos, combo y resonancia; la sobrecarga se activa automáticamente. Los errores rompen el combo y dañan el traje. Sobrevive hasta el final para conectar la estación. Los guardianes tienen una ventana limitada y un bonus máximo de 10 000 puntos, separado de los juicios de notas. La repetición automática y las teclas alternativas simultáneas no duplican puntos.

Al acabar aparecen rango, puntuación, precisión, combo, juicios y el fragmento de historia recuperado. Se guardan configuración y récords por estación y dificultad en el navegador, sin cuentas ni servidor de partidas. Si el almacenamiento está bloqueado, se puede jugar sin persistencia.

## Ejecutar localmente

El juego es estático y no requiere instalación ni compilación. Desde esta carpeta:

```powershell
python -m http.server 4175 --bind 127.0.0.1
```

Abre [localhost:4175](http://127.0.0.1:4175). También puedes usar Live Server en VS Code. El primer gesto habilita el audio del navegador. Las rutas relativas permiten publicar directamente desde la raíz con GitHub Pages (`main`, `/(root)`).

## Audio y arte

Cinco composiciones originales, sintetizadas localmente con Web Audio antes de jugar: batería y bajos electrónicos, pads espaciales y cuerdas Karplus–Strong, con saturación para las secciones de rock. Son instrumentos sintetizados, no grabaciones comerciales. Partitura y objetivos comparten datos musicales. El reloj de audio gobierna los juicios y la posición de los objetivos.

La ilustración de portada, la hoja de ocho poses de Elia y los cinco fondos se crearon para el proyecto con generación de imágenes. El juego anima la hoja de poses; los enemigos, guardianes, partículas y elementos de interfaz se dibujan con Canvas/CSS. Procedencia y prompts: [assets/ART-DIRECTION.md](assets/ART-DIRECTION.md).

No necesita claves de API, servicios de música ni recursos de juegos comerciales para ejecutarse. Phaser está incluido localmente. Las fuentes de Google son opcionales y tienen alternativas del sistema.

## Código

- `index.html`, `styles.css`: interfaz de juego y pantallas.
- `src/core.js`: estaciones, partituras, quince mapas y reglas de juicio, independientes del navegador.
- `src/audio.js`: síntesis, mezcla, reproducción y efectos de audio.
- `src/art.js`: dibujo auxiliar y escenarios de respaldo.
- `src/scene.js`: escenario Phaser, representación lateral, animación, enemigos y guardianes.
- `src/app.js`: flujo, tutorial, controles, ajustes, calibración y persistencia.
- `assets/`: ilustraciones locales y emblema.
- `vendor/`: Phaser 3 y licencia MIT del proveedor.
- `tests/`: pruebas del núcleo e integración en un navegador aislado.

## Verificación

Con Node.js:

```powershell
node --test tests/core.test.cjs
```

Comprueba los quince mapas, interpretaciones perfectas con dos acciones, sostenidos, pausa, entradas duplicadas, guardianes, dificultades y configuraciones de teclas.

La prueba de navegador requiere Playwright y un servidor local:

```powershell
node tests/browser.test.cjs
```

Usa una instancia aislada de Chrome. `CHROME_EXECUTABLE` permite indicar el ejecutable y `ORBITA_TEST_URL` la dirección. Recorre la primera visita y las seis lecciones con teclado, menús, reasignación, audio real de cinco niveles, pausa, resultado, récords, calibración y seis resoluciones. Capturas en `tmp/`, ignorado por Git.

La prueba automatizada de referencia verifica reglas y sincronización programática; el ajuste de latencia depende también del dispositivo y de la salida de audio del jugador.
