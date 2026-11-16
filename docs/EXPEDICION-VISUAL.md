# La canción de vuelta — dirección de arte y narrativa

## Entrega actual

Una expedición silenciosa de ocho destinos, ampliable mediante el catálogo. Las canciones, las partituras y las puntuaciones musicales se decidirán en la siguiente etapa. El recorrido actual permite probar las animaciones y golpes, conocer las máquinas, explorar todos los escenarios y descubrir el cómic.

La pantalla de título conserva la ilustración que ya funcionaba. El resto de la presentación adopta una dirección de manga a color: contornos índigo, cel shading, marfil, lavanda, coral y turquesa. Los escenarios tienen detalle y personalidad sin llenar de objetos pequeños la zona de lectura.

## Dos modos de la misma expedición

- **Órbita Pulso:** F golpea abajo; J impulsa y golpea arriba.
- **Órbita Vector:** mouse para elegir la altura, Z o X para golpear.

Las pestañas están encima de las portadas en el selector de rutas. La ficha de una estación muestra el control elegido, sin cambiarlo allí. Ambos modos comparten los destinos y la historia. El código conserva identificadores compatibles con los controles anteriores; sus nombres públicos son Pulso y Vector.

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

## El cómic dentro del recorrido

El prólogo muestra la promesa de Elia, la evacuación, los años de aislamiento y la respuesta inesperada. Cada estación descubre una página nueva al recuperar su recuerdo. El archivo permite releerlas. Las páginas aún no descubiertas llevan al destino correspondiente.

Son nueve páginas y treinta y seis viñetas. El arte se compone con marcos de distinto ancho, papel cálido, recuadros de narración, bocadillos con cola y onomatopeyas. Los diálogos son texto HTML accesible y legible, no letras incrustadas en las imágenes. Se puede alternar entre página completa y viñetas ampliadas; en pantallas pequeñas se comienza ampliado.

Las fuentes Outfit y Comic Neue se sirven localmente, con sus licencias OFL. No se necesitan peticiones a un proveedor de fuentes mientras se juega.

## Extender el recorrido

1. Añadir un destino en `src/worlds.js` con sus recursos y anclaje de suelo.
2. Añadir su página y diálogos en `src/comic.js`.
3. Incorporar los recursos y regenerar `src/art-sizes.js`.
4. Verificar ambos controles y el cómic en las pruebas de navegador.

Los menús, el archivo y la navegación recorren los datos. No hay una condición fija de seis u ocho destinos para dar por terminada toda la aventura. El cierre de esta primera ruta deja abierta la búsqueda de otras colonias.
