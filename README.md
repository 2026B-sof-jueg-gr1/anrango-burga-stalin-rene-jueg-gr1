# Órbita — El camino a casa

Una pequeña aventura espacial para el taller **Setup, Desarrollo y Despliegue con Phaser 3**.

Pilota la Nomad-01, recoge **8 cristales**, evita los asteroides y cruza el portal al final del sector. Tienes **75 segundos** y **3 puntos de escudo**.

## Ejecutar

1. Abre esta carpeta en Visual Studio Code.
2. Instala la extensión **Live Server** si aún no la tienes.
3. Haz clic derecho en `index.html` → **Open with Live Server**.

Alternativa si tienes Python instalado:

```powershell
python -m http.server 4173
```

Abre <http://localhost:4173>. No requiere npm, compilación ni claves de servicios.

Phaser 3.90.0 se importa desde jsDelivr. Si el CDN falla, se usa la misma versión incluida en `vendor/`. Las fuentes de Google son opcionales y cuentan con alternativas del sistema. Todas las imágenes del juego se dibujan localmente con Canvas.

## Controles

| Acción | Control |
| --- | --- |
| Mover la nave | Flechas o WASD |
| Pausar / continuar | P, Escape o botón de pausa |
| Empezar / reintentar | Enter o botón en pantalla |
| Activar / silenciar efectos | Botón de sonido |
| Jugar en móvil | Botones táctiles bajo el escenario |

La velocidad diagonal se normaliza para que no sea más rápida. Los impactos otorgan 1,7 segundos de protección para poder escapar. El juego se pausa al cambiar de pestaña o salir de la ventana. El sonido comienza silenciado y solo se activa por decisión del jugador.

## Archivos

- `index.html`: página, contadores, instrucciones, controles y carga de Phaser.
- `styles.css`: presentación y adaptación a móvil.
- `game.js`: configuración, escenas, movimiento, colisiones y reglas de la misión.
- `visuals.js`: texturas, iluminación, partículas, propulsor, escudo y portal animado.
- `assets/orbita.svg`: símbolo original del proyecto.
- `vendor/phaser.min.js`: copia de respaldo de Phaser.
- `vendor/PHASER-LICENSE.md`: licencia MIT de Phaser.

## Cómo explicar el código en clase

El taller usa el ciclo `preload`, `create`, `update`. Este proyecto conserva esa estructura:

1. **Configuración:** `MISSION` contiene tiempo, velocidad, escudo y posiciones del mapa. Al final del archivo se crea `new Phaser.Game(...)` con física Arcade.
2. **`preload()`** prepara las texturas de la nave y del escenario.
3. **`create()`** crea al jugador, los cristales y asteroides; configura teclado, límites del mundo, cámara y detección de contacto con `physics.add.overlap`.
4. **`update()`** lee las teclas, aplica velocidad a la nave y descuenta el tiempo. La cámara sigue al jugador con `startFollow`.
5. **Reglas:** `collectCrystal()` suma energía; `hitAsteroid()` resta escudo; `enterPortal()` comprueba que estén los ocho cristales; `finishMission()` muestra el resultado.
6. **Interfaz:** `updateHUD()` actualiza los contadores; `togglePause()` detiene y reanuda la misión; `startMission()` restablece la partida.
7. **Arte:** `makeTextures()` y `drawRoute()` están en `visuals.js` y solo dibujan. El movimiento por capas del fondo usa diferentes factores de desplazamiento. Las animaciones de recogida, impacto y llegada al portal están separadas de las reglas.

Las funciones de arte están en un archivo independiente para poder explicar primero las reglas del juego. Este proyecto amplía el ejemplo básico del taller con recolección, colisiones, tiempo y estados de partida. Las texturas se preparan una sola vez; los efectos temporales se destruyen al terminar y se limpian al reiniciar. La preferencia de movimiento reducido del dispositivo desactiva partículas, destellos y transiciones.

## Publicar en GitHub Pages

1. Usa el repositorio **público** de la organización de tu grupo: [2026B-sof-jueg-gr1/anrango-burga-stalin-rene-jueg-gr1](https://github.com/2026B-sof-jueg-gr1/anrango-burga-stalin-rene-jueg-gr1).
2. Coloca los archivos de este proyecto en la **raíz del repositorio**. `index.html` debe quedar junto al README, para que Pages encuentre el juego directamente. La carpeta `tmp/` contiene material de trabajo y no forma parte de la entrega.
3. Guarda y sube los cambios a la rama principal.
4. En GitHub, abre **Settings → Pages → Deploy from a branch**.
5. Elige la rama principal y la carpeta **/(root)** y guarda.
6. Espera a que termine el despliegue y abre el enlace publicado para verificar la partida.

El archivo `.nojekyll` permite servir los recursos estáticos directamente. Se utilizan rutas relativas compatibles con Pages.

## Entrega en Teams

Completa este mensaje con tu información y los enlaces reales:

```text
Mi Proyecto Phaser – [Tus Nombres y Apellidos]
Link al juego: [Enlace de GitHub Pages]
Link al código: [Enlace del repositorio]
```

Después, juega y comenta los proyectos de al menos dos compañeros, como indica la guía del taller.

## Créditos

Programado en JavaScript con [Phaser 3](https://phaser.io/), distribuido bajo licencia MIT. Gráficos originales dibujados con Canvas y SVG. Tipografías DM Sans y Space Grotesk servidas por Google Fonts.

Referencias técnicas: [cámaras de Phaser](https://docs.phaser.io/phaser/concepts/cameras) y [física Arcade](https://docs.phaser.io/phaser/concepts/physics/arcade).
