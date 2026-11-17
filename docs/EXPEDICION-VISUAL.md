# La canción de vuelta — dirección de arte y narrativa

## Entrega actual

Una expedición musical de ocho destinos, ampliable mediante el catálogo. Cada escenario tiene una canción completa, tres partituras, puntuación y guardianes con plazo. La narrativa y el arte se conservan; las notas ahora toman su posición del reloj musical.

La pantalla de título conserva la ilustración que ya funcionaba. El resto de la presentación adopta una dirección de manga a color: contornos índigo, cel shading, marfil, lavanda, coral y turquesa. Los escenarios tienen detalle y personalidad sin llenar de objetos pequeños la zona de lectura.

## Un control y tres dificultades

**Órbita Pulso** usa únicamente F para el suelo y J para el aire. El control por mouse queda retirado del diseño. Los ocho niveles tienen Fácil, Medio y Difícil, elegibles en su ficha; cambian las frases, densidad, anticipación y ventanas de juicio, manteniendo la canción completa.

La interfaz utiliza nombres directos: Jugar, Seleccionar nivel, Cómo jugar, Configuración, Recuerdos y Resultados. Los nombres de lugares y el texto narrativo conservan la ambientación. Los receptores incorporan disco oscuro, contorno claro, coral/turquesa y letras F/J; se dibujan por encima de los efectos para mantener su lectura.

## Identidades por destino

| Destino | Escenario | Criaturas | Guardián | Movimiento y efecto |
| --- | --- | --- | --- | --- |
| Puerto Aurora | Puerto marfil al amanecer, nubes lavanda | Mensajero de andén y mantarraya postal | Custodio del equipaje | Tráfico orbital y pequeños fragmentos postales |
| Jardines de Io | Invernaderos suspendidos, agua y flores coral | Escarabajo semilla y colibrí de riego | Jardinero de cristal | Pétalos y hojas |
| Cinturón de Chatarra | Cascos de naves, cobre, luz de atardecer | Reptador de cobre y avispa de turbina | Grúa Titán | Chispas y piezas compactas |
| Núcleo de Rebote | Anillos de gravedad, orquídea y pistacho | Armadillo giroscópico y medusa de gravedad | Bailarín de anillos | Órbitas suaves y aros |
| Mar de Iones | Océano turquesa y tormenta lejana | Zorro de marea y medusa de tormenta | Leviatán de iones | Ondas y trazos eléctricos |
| Abismo de Plasma | Observatorio de cristal y constelaciones | Erizo astral y raya de prisma | Quimera del observatorio | Estrellas y conexiones |
| Órbita Libre | Cometas, velas solares y espacio abierto | Liebre de cometa y golondrina solar | Nave de las velas | Tránsito de velas y estelas |
| Faro Zero | Puerto del regreso, faro marfil y amanecer | Guardián de porcelana y golondrina del faro | Custodio del amanecer | Luz suave y fragmentos solares |

Cada destino tiene fondo y portada propios. Se producen cuatro cuadros por criatura, tres poses por guardián y doce poses para Elia. Los atlas conservan sus proporciones originales; las dimensiones se leen de los PNG y se registran con `node scripts/index-art.cjs`. El apoyo del personaje se calibra con la línea real del suelo de cada ilustración.

Los impactos son locales y breves, con partículas acotadas y sin grandes flashes blancos. El entorno y el suelo tienen movimiento propio; los ajustes permiten detenerlo, reducir animación y graduar los efectos.

Los golpes usan las criaturas de cada lugar. Las estelas tienen estrella, barra y final visible; las dobles conectan ambas alturas e indican F+J. Los desafíos muestran F↔J, mínimo, plazo y bonus. El panel cambia a turquesa al romper el escudo y continúa contando hasta finalizar. La vista muestra puntuación, combo, precisión, energía y progreso de la canción.

## El cómic dentro del recorrido

Después de la portada aparecen las tres frases originales sobre negro, con escritura progresiva. Los recuerdos se reservan para los logros: terminar la canción con energía y al menos 60% de precisión desbloquea su capítulo y la primera victoria desbloquea también el prólogo. El botón para leer aparece en los resultados de éxito. Los fallos y la salida anticipada no conceden recuerdos. El archivo permite releerlos mediante páginas, sin scrollbar vertical; los capítulos bloqueados llevan al nivel correspondiente. Los logros narrativos de la versión visual anterior se conservan.

Son nueve páginas y treinta y seis viñetas. El arte se compone con marcos de distinto ancho, papel cálido, recuadros de narración, bocadillos con cola y onomatopeyas. Los diálogos son texto HTML accesible y legible, no letras incrustadas en las imágenes. Se puede alternar entre página completa y viñetas ampliadas; en pantallas pequeñas se comienza ampliado.

Las fuentes Outfit y Comic Neue se sirven localmente, con sus licencias OFL. No se necesitan peticiones a un proveedor de fuentes mientras se juega.

## Extender el recorrido

1. Añadir un destino en `src/worlds.js` con sus recursos y anclaje de suelo.
2. Añadir su página y diálogos en `src/comic.js`.
3. Incorporar los recursos y regenerar `src/art-sizes.js`.
4. Verificar F/J, las tres dificultades, el desbloqueo tras completar y el cómic en las pruebas de navegador.

Los menús, el archivo y la navegación recorren los datos. No hay una condición fija de seis u ocho destinos para dar por terminada toda la aventura. El cierre de esta primera ruta deja abierta la búsqueda de otras colonias.
