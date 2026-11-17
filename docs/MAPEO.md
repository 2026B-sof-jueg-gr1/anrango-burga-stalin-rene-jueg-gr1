# Motor musical y partituras

## Archivo, reloj y duración

Cada destino usa el MP3 elegido en `assets/music/<destino>.mp3`. `src/music-catalog.js` declara artista, título, duración y SHA-256. `assets/scores/<destino>.json` contiene tres dificultades sobre ese archivo exacto. La carga contrasta hash y duración con el audio decodificado antes de iniciar.

`RhythmAudio.Transport` programa un AudioBufferSourceNode y calcula el tiempo escuchado con `AudioContext.getOutputTimestamp()`. Si el navegador no lo ofrece, utiliza el reloj del contexto y su estimación de latencia. Los timestamps de teclado se convierten al mismo dominio temporal. El ajuste de sincronización en milisegundos desplaza juntos la representación y el juicio.

No se acumulan deltas de animación para decidir cuándo llega una nota. Su posición horizontal es `receptor + (nota.time - canción.time) × velocidad`. Al pausar se detiene la fuente y se conserva el cursor; al continuar se crea una fuente desde esa posición con una cuenta atrás. La partida solo termina normalmente cuando ha transcurrido el archivo de audio completo.

Referencias de la plataforma: [reloj de salida](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/getOutputTimestamp), [programación de una fuente](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/start).

## Formato actual

```json
{
  "version": 2,
  "audio": {"id": "aurora", "sha256": "…", "duration": 152.230023},
  "difficulties": {
    "easy": {
      "version": 2,
      "difficulty": "easy",
      "duration": 152.230023,
      "notes": [
        {"time": 3.024, "end": 3.024, "action": 1, "kind": "enemy"},
        {"time": 3.675, "end": 5.497, "action": 1, "kind": "enemy"}
      ],
      "bosses": [{"time": 95.5, "end": 105.5, "required": 28}],
      "encounters": [{"time": 40, "end": 55}]
    }
  }
}
```

El ejemplo ilustra la estructura, no sustituye un mapa completo. `action: 0` es F/suelo y `action: 1`, J/aire. `end > time` es un sostenido. Dos notas con el mismo `time` en alturas distintas forman una doble. `kind: "projectile"` representa un disparo del guardián. Las otras dificultades se llaman `normal` y `hard`.

Los intervalos de alternancia reservan una frase sin notas normales ni colas que invadan su plazo. El validador rechaza solapamientos por altura, tiempos fuera del audio y objetivos de alternancia imposibles.

## Cómo se construyeron los 24 mapas

`scripts/build-rhythm.py` analiza los archivos originales con librosa, NumPy y SciPy. Separa novedades graves y agudas, detecta ataques y refina su comienzo con una microenvolvente de 5,8 ms. Rastrea el pulso local usando referencias para resolver ambigüedades de media velocidad. Los ataques no se redondean a esa rejilla: conservan sus tiempos medidos.

Las frases alternan pulso, respuesta entre alturas, escaleras y contratiempos. Fácil deja más pausas; Medio incorpora respuestas y dobles; Difícil añade subdivisiones y mayor densidad. Los sostenidos parten de energía armónica sostenida y terminan en una caída medida o en otro ataque real que permita respirar antes de la siguiente nota. Las dobles se reservan para acentos, dejando libres ambas alturas.

Las fuentes medibles están en `assets/scores/source/`. Cada nota conserva el índice de su ataque; las colas indican `tailSource` y, cuando corresponde, `tailAttack`. `assets/scores/report.json` resume notas, sostenidos, dobles y proyectiles. Una revisión musical puede cambiar qué instrumento sigue una frase sin alterar el motor ni el audio.

Para regenerar:

```powershell
python -m pip install -r scripts/audio-requirements.txt
python scripts/build-rhythm.py
# Recompone desde el análisis guardado, sin volver a decodificar:
python scripts/build-rhythm.py --charts-only
# Solo una canción:
python scripts/build-rhythm.py --only aurora
```

Los resultados son deterministas. Si cambias el MP3 debes regenerar su análisis, mapas y catálogo. Para editar un mapa a mano, modifica sus tiempos absolutos en el JSON y valida con las pruebas antes de publicar; volver a componer reemplaza esa edición. Los módulos de importación de la etapa anterior se conservan como material histórico, pero su panel no forma parte de la interfaz actual.

## Juicio y sostenidos

El motor acepta una entrada por pulsación física. Mantener una tecla no genera golpes repetidos. Se busca la nota pendiente más cercana de su altura y se compara el error absoluto con las ventanas de la dificultad. El sostenido juzga cabeza y cola; soltar demasiado pronto pierde la cola una sola vez. La cola se completa automáticamente cuando se ha mantenido la tecla hasta el final.

Pausar libera las teclas sin regalar la cola. Durante la cuenta atrás se puede recuperar la tecla de un sostenido; al volver al audio hay 400 ms de margen. Recuperarlo no vuelve a puntuar su cabeza.

Los aciertos alimentan energía y combo; los fallos quitan energía. Las pulsaciones en la altura incorrecta junto a una nota no otorgan puntos y penalizan precisión. Al final se necesita energía y al menos 60% de precisión. Los bonus del jefe no inflan la precisión de las notas.

## Jefes con plazo y bonus

El intervalo musical determina el comienzo y el cierre del desafío. Su mínimo depende de la duración y la dificultad: aproximadamente 2,8, 4,2 o 5,8 alternancias por segundo.

- Solo cuenta alternar F/J; repetir la misma tecla o el auto repeat no suma.
- Se exige un intervalo mínimo de 35 ms entre alternancias válidas.
- Cada alternancia válida suma 25 puntos.
- Romper el mínimo concede 3.000 puntos una sola vez.
- Cada alternancia adicional dentro del plazo concede **100 puntos extra**.
- El desafío sigue abierto después de romper el escudo. Se cierra al vencer su tiempo.
- Si no se alcanza el mínimo, el guardián escapa, rompe el combo y quita 18 de energía. La canción continúa mientras quede energía.

El bonus está limitado por el plazo real y las pulsaciones físicas, sin cerrar anticipadamente el contador. Los resultados muestran cuántos guardianes se superaron y el bonus adicional obtenido.

## Verificación

Las pruebas recorren las 24 partituras con entradas perfectas, comprueban los hashes de los ocho MP3, el origen temporal de ataques y colas, dobles, pausas, fallos, repetición de teclas, bonus y deadlines. El navegador decodifica las ocho pistas y revisa los patrones y seis tamaños de ventana. Una prueba adicional reproduce Altale completa con audio real, pausa durante un sostenido y alternancia hasta acumular bonus.
