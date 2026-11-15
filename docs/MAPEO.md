# Mapeo musical

## Qué cambió

Las notas ya no salen de un patrón repetido sobre el BPM. Cada JSON contiene `time`, `end` y `action` por nota, en segundos desde el principio del archivo de audio completo. El motor no redondea esos tiempos. Un cambio de tempo no obliga a cambiar de canción ni a cortar el audio.

Los 24 mapas incluidos son una primera selección de transitorios reales. La detección separa energía grave y aguda, localiza subidas y deja huecos entre ataques. Las dificultades eligen densidades diferentes. La detección no puede decidir por sí sola qué melodía seguir, si una cola es expresiva ni si una frase resulta cómoda. Esas decisiones requieren escuchar y probar.

## Flujo recomendado: osu! como editor

1. Usa el **mismo MP3** que está en `assets/audio/`. Una versión distinta, incluso con el mismo nombre, puede tener una introducción o silencios diferentes.
2. Crea una partitura **osu!mania de 2 columnas**. La izquierda representa suelo y la derecha, aire. No cambia el estilo lateral del juego; solo usamos el editor para colocar notas.
3. En Timing (F3), ajusta el comienzo, el pulso y los cambios de tempo con el metrónomo. Consulta la [guía oficial de Timing](https://osu.ppy.sh/wiki/en/Client/Beatmap_editor/Timing).
4. Mapea una frase corta. Elige un instrumento protagonista; evita intentar marcar todas las capas de la canción a la vez. En Fácil prioriza acentos claros y pausas. Añade respuestas y contratiempos progresivamente en Medio y Difícil.
5. Marca sostenidos cuando haya una nota o textura que realmente se mantenga. Coloca la cola donde termina esa frase, no donde convenga completar un patrón.
6. Exporta/guarda el `.osu`. Su formato almacena golpes en milisegundos y las colas de los sostenidos. El importador conserva esos tiempos y los cambios de tempo. Véase el [formato oficial .osu](https://osu.ppy.sh/wiki/en/Client/File_formats/osu_(file_format)).
7. Abre el juego con `?editor=1`, elige la estación y la dificultad y pulsa **Partitura → Importar partitura**. Importa el `.osu` o un JSON de Órbita. La selección queda guardada en ese navegador para probarla; no cambia el archivo público.
8. Juega y revisa una frase cada vez. La calibración compensa la latencia del dispositivo; no debe usarse para ocultar un error del mapa. Si el desfase aumenta a lo largo de la canción, revisa el tempo o la versión del audio.
9. Exporta el JSON desde el mismo panel. Para publicarlo, sustituye únicamente la dificultad correspondiente en `assets/charts/<canción>.json` y ejecuta las pruebas. Conserva las otras dos dificultades.

Una importación `.osu` conserva todas sus notas y no añade jefes automáticamente. Para los encuentros especiales, usa el JSON: el jefe móvil ocupa un intervalo y sus notas llevan `kind: "projectile"`. La ráfaga tiene su propio intervalo sin notas normales. Así no se borran notas que el autor colocó deliberadamente.

## Formato mínimo

```json
{
  "version": 1,
  "source": "manual",
  "duration": 156.71147392290248,
  "notes": [
    { "action": 0, "time": 3.127, "end": 3.127 },
    { "action": 1, "time": 4.519, "end": 5.261 },
    { "action": 0, "time": 6.993, "end": 6.993 },
    { "action": 1, "time": 6.993, "end": 6.993 }
  ],
  "moving": null,
  "boss": null
}
```

`action: 0` es suelo y `action: 1`, aire. Dos notas al mismo tiempo en alturas distintas forman una simultánea. Un `end` mayor que `time` forma un sostenido. La duración real del audio prevalece: un JSON no puede recortar la canción. Se rechazan tiempos fuera del archivo, solapamientos en una misma altura e intervalos de escudo que oculten notas.

Los intervalos especiales usan `{ "time": 60, "end": 78 }`. No añadas un escudo encima de notas existentes; reserva una frase para él. Una pista puede tener únicamente notas y ningún jefe si eso favorece su música.

## Estado de esta entrega

Las ocho pistas son las seleccionadas el 14 de noviembre de 2026. Se usa Altale, no After Altale, porque ese es el archivo disponible. Cheatreal dura 4:54 y Galaxy Collapse, 6:47; se conservan enteras. Los BPM del catálogo son las referencias proporcionadas, mientras que los golpes del borrador se colocan en ataques del archivo, sin obligarlos a esa cifra.

Falta una revisión musical de autor para convertir los borradores en mapas definitivos. El importador y la exportación permiten hacer esa revisión por frases sin cambiar el motor, las animaciones ni las configuraciones de 2, 4 u 8 teclas.
