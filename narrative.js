/* Dirección de escenas independiente de las partituras y del reloj musical. */
'use strict';
window.OrbitaNarrative = {
  faro: {
    intro: [
      ['sira', 'Una luz en el silencio', 'Aquí Faro 07. Si alguien recibe esto… la luz sigue encendida.', 'beacon', 'FARO 07 / SEÑAL AISLADA'],
      ['sira', 'La melodía que guardé', 'Tocaba estas notas para mi hija. Antes de que la red cayera.', 'memory', 'ARCHIVO PERSONAL / HACE 17 AÑOS'],
      ['nomad', 'Lleva su voz', 'Nomad, sigue la señal. Quizá alguien todavía pueda responder.', 'route', 'DESTINO DESCONOCIDO / BUSCANDO']
    ],
    outro: [
      ['elia', 'Reconozco esas notas', 'Es la canción que mi madre tocaba en el taller.', 'memory', 'RESPUESTA / SEÑAL RECUPERADA'],
      ['elia', 'Sigo aquí', 'Soy Elia. Ya no vivo donde ella recuerda.', 'beacon', 'COLONIA DEL UMBRAL / LOCALIZADA'],
      ['elia', 'Ahora me toca a mí', 'Dile que tengo una respuesta. Esta vez la voy a tocar yo.', 'guitar', 'NUEVA TRANSMISIÓN / LISTA']
    ]
  },
  sira: {
    intro: [
      ['elia', 'Diecisiete años después', 'Quizá sigue esperando una voz de niña.', 'memory', 'UMBRAL / TALLER DE ELIA'],
      ['elia', 'Hecha con mis manos', 'Construí esta guitarra. Su melodía ahora también es mía.', 'guitar', 'INSTRUMENTO / CONSTRUCCIÓN PROPIA'],
      ['elia', 'Que escuche quién soy', 'Lleva las dos partes juntas, Nomad.', 'duet', 'DOS VOCES / UNA CANCIÓN']
    ],
    outro: [
      ['sira', '¿La construiste tú?', 'Esa guitarra… Elia, ¿la construiste tú?', 'guitar', 'SIRA / ESCUCHANDO'],
      ['elia', 'Y mi propio mundo', 'Y el taller, mamá. Construí mi propio taller.', 'beacon', 'ELIA / TRANSMITIENDO'],
      ['sira', 'Cuéntamelo todo', 'Tenemos mucho que escuchar.', 'duet', 'CONVERSACIÓN / REANUDADA']
    ]
  },
  storm: {
    intro: [
      ['nomad', 'El último faro', 'El corredor se cierra. Solo queda un enlace.', 'storm', 'CORREDOR CERO / INTERFERENCIA'],
      ['both', 'Ninguna cruza sola', 'Sira envía su pulso. Elia, su respuesta.', 'duet', 'DOS SEÑALES / EN SINCRONÍA'],
      ['nomad', 'Recuerda la canción', 'Cuando suba la estática, mantén las dos voces.', 'route', 'NOMAD / PREPARADA PARA CRUZAR']
    ],
    outro: [
      ['sira', 'Al otro lado', 'Aquí Faro 07. Enlace restaurado.', 'beacon', 'RED AURORA / EN LÍNEA'],
      ['elia', 'Ya llegué', 'Mamá, no hace falta que vuelvas a empezar la canción.', 'memory', 'ELIA / CANAL ABIERTO'],
      ['sira', 'Te estoy escuchando', 'Lo sé. Ahora te estoy escuchando.', 'duet', 'SIRA + ELIA / CONECTADAS'],
      ['nomad', 'Cada señal, una historia', 'Otra voz acaba de llegar. El viaje continúa.', 'route', 'NOMAD / NUEVO DESTINO']
    ]
  }
};
window.OrbitaMotifs = {
  beacon: '<circle cx="100" cy="100" r="67"/><ellipse cx="100" cy="100" rx="30" ry="82" transform="rotate(35 100 100)"/><circle cx="100" cy="100" r="13" class="motif-core"/><path d="M100 3v17M100 180v17M3 100h17M180 100h17"/>',
  memory: '<path d="M32 130V69l51-12v62M112 110V49l51-12v62"/><ellipse cx="22" cy="132" rx="11" ry="8"/><ellipse cx="73" cy="121" rx="11" ry="8"/><ellipse cx="102" cy="112" rx="11" ry="8"/><ellipse cx="153" cy="101" rx="11" ry="8"/><path class="motif-soft" d="M20 165h160M20 177h120"/>',
  guitar: '<path d="M116 95l43-60 15 9-43 61c19 27 8 60-17 72-27 13-61-1-65-29-4-22 12-37 32-38 1-21 18-28 35-15Z"/><path d="m78 151 90-113M71 144l91-111M66 143l19 13M154 28l26 17-7 13-27-17Z"/><circle cx="106" cy="119" r="14"/>',
  route: '<circle cx="25" cy="151" r="8"/><circle cx="174" cy="48" r="16"/><path stroke-dasharray="4 7" d="M37 148C150 154 42 48 153 48"/><path d="m91 85 17 35-16-7-13 12Z"/>',
  duet: '<path d="M6 100c24-90 43-90 67 0s43 90 67 0 37-60 54 0"/><path class="motif-answer" d="M6 100c24 90 43 90 67 0s43-90 67 0 37 60 54 0"/><circle cx="100" cy="100" r="84" class="motif-soft"/>',
  storm: '<path d="m117 13-61 88h39l-12 86 62-107h-39Z"/><path class="motif-soft" d="m34 25-14 29 19 20-17 36 16 36M167 23l16 29-18 22 17 36-15 36"/>'
};
