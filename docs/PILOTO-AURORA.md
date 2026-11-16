# Piloto de Puerto Aurora

Entrega para validar la dirección antes de extenderla a los otros siete mapas.

## Cambios jugables

- Fácil: frases de 2–4 golpes con al menos 1,65 segundos de descanso entre grupos originales. Medio y Difícil aumentan la densidad y alternan otros patrones de alturas.
- Dos estelas conservan sus tiempos del borrador original. Los proyectiles tienen 6/8/10 respuestas según dificultad; se conserva la ventana del escudo.
- 99/155/237 objetivos, respectivamente. La duración musical continúa siendo 156,711 segundos.
- Los tiempos parten de ataques previamente detectados del audio. La selección, las alturas y los descansos se organizan en frases. Aún requiere evaluación musical jugando y escuchando; no es un mapa revisado nota por nota.
- Récords separados de la partitura anterior mediante aurora-pilot-v1, además de la separación existente entre teclado y mouse.

src/pilot-score.js y scripts/build-pilot.cjs permiten regenerar las tres partituras. La fuente de ataques y colas se guarda en assets/charts/source/altale-attacks.json. Ejecutar node scripts/build-pilot.cjs; no modifica el audio.

## Claridad y navegación

Aurora estrena fondo al amanecer y una pareja de criaturas postales con cuatro cuadros por animación. El corredor de juego no tiene partículas ambientales. El jefe es más pequeño y sus respuestas no sacuden la cámara ni producen grandes flashes blancos.

Los ajustes separan intensidad de efectos (45 % por defecto), movimiento ambiental y movimiento reducido. A cero se conservan las señales de juego y los impactos mínimos que confirman un golpe. La intensidad limita el número de partículas; los paquetes hacia el jefe y los impactos tienen duración y cantidad acotadas.

El prólogo se muestra antes del primer entrenamiento o del primer vuelo en Aurora. El selector de control aparece antes de practicar. Cada modo guarda su práctica completada; salir antes del final no cuenta como completarla. El aviso previo a elegir mapa permite cambiar entre F/J y mouse + Z/X. La pista final se incorpora a la galería al continuar desde un resultado superado.

## Alcance pendiente

Los ocho mapas siguen desbloqueados. Solo Aurora recibe el nuevo escenario, criaturas, prólogo y pista en esta entrega. Los otros mundos aún deben recibir arte propio, nuevos capítulos y revisión musical. La elección de nuevas canciones queda pendiente; se mantienen los ocho archivos actuales completos.

## Verificación

Las pruebas del motor cubren las 24 partituras, sostenidos, dos controles, bosses, exactitud de duración, procedencia de ataques y descansos del piloto. Las pruebas en Chrome recorren ambos entrenamientos, prólogo, pista, ajustes persistentes, navegación, pausa, récords y distintos tamaños de ventana.
