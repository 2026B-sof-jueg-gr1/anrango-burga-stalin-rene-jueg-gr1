# Órbita · La canción de vuelta

Una mensajera sigue una melodía para encontrar el camino de regreso a unas colonias que todos creían perdidas. Una expedición espacial ilustrada con Phaser 3 y un cómic que se descubre durante el recorrido.

**[Explorar](https://2026b-sof-jueg-gr1.github.io/anrango-burga-stalin-rene-jueg-gr1/)** · **[Repositorio](https://github.com/2026B-sof-jueg-gr1/anrango-burga-stalin-rene-jueg-gr1)**

## Esta entrega

El enfoque actual es **arte, animación y narrativa**. La experiencia es completamente silenciosa: no carga canciones, no inicia un contexto de audio y desactiva el sonido de Phaser. Se pueden explorar todos los destinos, probar los golpes y devolver los pulsos de sus guardianes. Las canciones definitivas, el mapeo musical, el timing y sus puntuaciones se trabajarán después.

- Ocho fondos y ocho portadas propios.
- Dieciséis criaturas, con cuatro cuadros de animación por criatura.
- Ocho guardianes, con tres poses por guardián.
- Elia con ocho fases de carrera y cuatro poses de acción.
- Nueve páginas de cómic, treinta y seis viñetas, diálogos y narración legibles.
- Ambientes animados, suelo en movimiento e impactos temáticos acotados.

La ilustración inicial se conserva. El catálogo permite añadir destinos y nuevos arcos; el cierre de la primera ruta deja otros caminos abiertos.

## Modos y controles

Los modos se eligen en las **pestañas superiores del selector de rutas**. Comparten los mismos destinos; la ficha de una estación muestra el modo elegido.

| Modo | Control |
| --- | --- |
| **Órbita Pulso** | F golpea en el suelo; J impulsa y golpea en el aire. |
| **Órbita Vector** | Mouse arriba/abajo para elegir altura; Z y X golpean donde apuntas. El clic no golpea. |

**P / Escape:** pausa o vuelve. **Enter / Espacio:** activa el botón enfocado o la acción principal. **Flechas:** exploran rutas o recorren el cómic. La configuración ofrece intensidad de efectos, movimiento del entorno y animación reducida.

## Historia integrada

La primera visita abre el prólogo. En cada estación, **Descubrir el recuerdo** revela una página nueva de la historia. Sus bocadillos, cartelas y onomatopeyas se componen sobre el arte original como texto HTML. Se puede alternar entre página completa y viñetas ampliadas; las pantallas pequeñas comienzan ampliadas.

**Los recuerdos** permite releer lo descubierto. Las páginas pendientes llevan a su destino. Todos los destinos están disponibles en esta etapa de exploración; el progreso se guarda localmente en el navegador.

**[Historia](docs/HISTORIA.md)** · **[Guion completo del cómic](docs/GUION-COMIC.md)** · **[Dirección de arte](docs/EXPEDICION-VISUAL.md)** · **[Recursos y prompts](assets/expedition/PROMPTS.md)**

## Ejecutar

No requiere instalación ni compilación:

```powershell
python -m http.server 4175 --bind 127.0.0.1
```

Abre [localhost:4175](http://127.0.0.1:4175). GitHub Pages publica desde `main`, `/(root)`. Phaser y las fuentes se sirven localmente; Outfit y Comic Neue incluyen sus licencias en `assets/fonts/`.

## Verificar

```powershell
node --test tests/expedition.test.cjs
node tests/browser.test.cjs
```

La prueba de navegador requiere Playwright, Chrome y el servidor local. Admite `CHROME_EXECUTABLE` y `ORBITA_TEST_URL`. Recorre los ocho destinos, ambos controles, guardianes, cómic, pausa, archivo, persistencia y seis tamaños de ventana. También comprueba que no se solicite audio ni se cree un contexto de audio.

`node scripts/index-art.cjs` registra las dimensiones originales de los PNG para recortar los atlas sin deformarlos.

## Estructura

- `src/worlds.js`: destinos, modos, criaturas, colores y recursos.
- `src/comic.js`: páginas, diálogos y orden narrativo.
- `src/expedition.js`: pantallas, cómic, navegación y guardado.
- `src/expedition-scene.js`: escenarios, animaciones e impactos.
- `src/input.js`: controles de dos acciones.
- `assets/expedition/`: arte final de esta expedición.

Los módulos y partituras de las etapas musicales anteriores se conservan como material de trabajo y no forman parte de la entrada actual. Las capturas y variantes descartadas se guardan en `tmp/`, ignorado por Git.
