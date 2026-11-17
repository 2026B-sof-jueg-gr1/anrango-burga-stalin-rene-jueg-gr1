# Órbita · La canción de vuelta

Una mensajera sigue una melodía para encontrar el camino de regreso a unas colonias que todos creían perdidas. Una expedición espacial ilustrada con Phaser 3 y un cómic que se descubre durante el recorrido.

**[Explorar](https://2026b-sof-jueg-gr1.github.io/anrango-burga-stalin-rene-jueg-gr1/)** · **[Repositorio](https://github.com/2026B-sof-jueg-gr1/anrango-burga-stalin-rene-jueg-gr1)**

## Esta entrega

El enfoque actual es **arte, animación y narrativa**. La experiencia es completamente silenciosa: no carga canciones, no inicia un contexto de audio y desactiva el sonido de Phaser. Los ocho niveles ofrecen una prueba visual de 44 segundos con objetivos y resultados. Las canciones definitivas, el mapeo musical, el timing y sus puntuaciones se trabajarán después. Hay una [propuesta musical para escuchar](docs/MUSICA-PROPUESTA.md), pendiente de selección.

- Ocho fondos y ocho portadas propios.
- Dieciséis criaturas, con cuatro cuadros de animación por criatura.
- Ocho guardianes, con tres poses por guardián.
- Elia con ocho fases de carrera y cuatro poses de acción.
- Nueve páginas de cómic, treinta y seis viñetas, diálogos y narración legibles.
- Ambientes animados, suelo en movimiento e impactos temáticos acotados.

La ilustración inicial se conserva. El catálogo permite añadir destinos y nuevos arcos; el cierre de la primera ruta deja otros caminos abiertos.

## Control y dificultad

**Órbita Pulso** es el único modo: **F** golpea en el suelo; **J** salta y golpea en el aire. El mouse no mueve a Elia y Z/X no golpean.

Cada nivel tiene tres dificultades, seleccionables antes de jugar:

| Dificultad | Objetivos golpeados | Proyectiles devueltos |
| --- | --- | --- |
| Fácil | 6 | 2 |
| Medio | 9 | 3 |
| Difícil | 12 | 4 |

Aumentan la velocidad y la densidad de la prueba visual. Para completar un nivel hay que cumplir ambos objetivos y llegar al final. Los proyectiles cuentan al interceptarlos con F/J; pulsar en vacío no suma. Estas reglas provisionales se sustituirán por las partituras de la canción elegida.

**P / Escape:** pausa o vuelve. **Enter / Espacio:** activa el botón enfocado o la acción principal. **Flechas:** cambian de nivel, página de recuerdos o viñeta. La configuración ofrece intensidad de efectos, movimiento del fondo y animación reducida. Los dos aros tienen base oscura, borde claro y F/J para distinguirse en cualquier escenario.

## Historia integrada

Al entrar desde el título aparecen siempre las tres frases originales, escritas en tiempo real sobre negro. Después se abre el menú. El cómic no interrumpe este inicio.

Solo completar un nivel desbloquea su recuerdo, en cualquiera de las dificultades. La primera victoria desbloquea también el prólogo. Los resultados ofrecen **Leer recuerdo**, **Reintentar** y **Volver a niveles**. Salir, esperar sin acertar o leer una página no acredita una victoria.

**Recuerdos** reúne el cómic en páginas con botones anterior/siguiente, sin barra de desplazamiento vertical. Los capítulos bloqueados llevan al nivel que los desbloquea. Se puede alternar entre página completa y viñetas ampliadas; las pantallas pequeñas comienzan ampliadas. El progreso se guarda en `orbita-expedition-v2`. Los ajustes visuales anteriores se conservan; abrir un recuerdo en la versión de exploración no equivale a completar un nivel.

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

La prueba de navegador requiere Playwright, Chrome y el servidor local. Admite `CHROME_EXECUTABLE` y `ORBITA_TEST_URL`. Recorre los ocho destinos con F/J, las tres dificultades, los resultados de éxito y fallo, los recuerdos bloqueados, el archivo paginado, la pausa, la migración y seis tamaños de ventana. También comprueba que no se solicite audio ni se cree un contexto de audio.

`node scripts/index-art.cjs` registra las dimensiones originales de los PNG para recortar los atlas sin deformarlos.

## Estructura

- `src/worlds.js`: destinos, dificultades, condiciones de victoria, criaturas y recursos.
- `src/comic.js`: páginas, diálogos y orden narrativo.
- `src/expedition.js`: pantallas, cómic, navegación y guardado.
- `src/expedition-scene.js`: escenarios, animaciones e impactos.
- `src/input.js`: controles de dos acciones.
- `assets/expedition/`: arte final de esta expedición.

Los módulos y partituras de las etapas musicales anteriores se conservan como material de trabajo y no forman parte de la entrada actual. Las capturas y variantes descartadas se guardan en `tmp/`, ignorado por Git.
