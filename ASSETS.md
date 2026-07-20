# 🎨 Guía de arte real (imágenes generadas con IA)

El juego funciona con gráficos **procedurales** (dibujados por código). Puedes
sustituir cualquiera por **imágenes reales** —por ejemplo generadas con IA— para
lograr el look semi-realista de la referencia, **sin tocar el código**.

## Cómo añadir una imagen (3 pasos)

1. Genera/exporta la imagen como **PNG con fondo transparente**.
2. Guárdala en `public/assets/images/`.
3. Declárala en `src/data/assetManifest.ts` añadiendo una línea:

   ```ts
   export const REAL_IMAGES: RealAsset[] = [
     { key: 'player', file: 'vaca.png' },
     { key: 'ob-car', file: 'car.png' },
   ];
   ```

El `key` **debe** coincidir con la clave de textura del juego (tabla de abajo).
Cuando una imagen carga con ese `key`, reemplaza automáticamente al placeholder.
Las que no declares seguirán usando el gráfico procedural. Haz `git add`,
`commit` y `push`: el despliegue las publicará solas.

> ⚠️ Requisitos para que se vea bien y no haya errores 404:
> - **PNG con transparencia** (no JPG con fondo).
> - Nombres **en minúsculas, sin espacios ni acentos** (usa guiones).
> - Rutas relativas: solo el nombre del archivo en `file` (la carpeta ya está fija).

---

## Especificaciones y prompts sugeridos

Orientación del juego: **vertical**. La cámara mira la calle desde atrás de VACA.
Todos los sprites deben verse **de frente/atrás**, centrados, mirando "hacia la
cámara" (como en las miniaturas de la referencia), con **fondo transparente**.

### Personaje (lo más importante)

| key | archivo sugerido | tamaño aprox. | descripción / prompt |
|-----|------------------|---------------|----------------------|
| `player` | `vaca.png` | 512×640 px | Perrita **VACA** (pelaje negro, pecho blanco, franja blanca en el rostro, patas parcialmente blancas, collar morado, expresión alegre) **de pie sobre un scooter rosado con detalles turquesa**, vista frontal, luz cinematográfica, fondo transparente. |
| `player-slide` | `vaca-slide.png` | 512×512 px | La misma VACA **agachada/deslizándose** sobre el scooter, vista frontal, fondo transparente. |

> Consejo para IA: pide "**full body, front view, transparent background, centered, mobile game character, semi-realistic 3D render, cinematic lighting**" y reutiliza la misma descripción de VACA para mantener coherencia.

### Coleccionables y poderes

| key | archivo | tamaño | descripción |
|-----|---------|--------|-------------|
| `coin` | `coin.png` | 128×128 | Moneda dorada con huella de pata. |
| `bone` | `bone.png` | 128×80 | Huesito estilizado. |
| `key` | `key.png` | 128×128 | Llave dorada. |
| `pu-shield` | `pu-shield.png` | 128×128 | Ícono de escudo azul. |
| `pu-magnet` | `pu-magnet.png` | 128×128 | Imán rojo. |
| `pu-double-score` | `pu-double-score.png` | 128×128 | Símbolo "x2" dorado. |
| `pu-super-jump` | `pu-super-jump.png` | 128×128 | Flecha/impulso verde. |
| `pu-turbo` | `pu-turbo.png` | 128×128 | Llamas/turbo naranja. |
| `pu-slow-motion` | `pu-slow-motion.png` | 128×128 | Reloj/cámara lenta púrpura. |

### Obstáculos (vista frontal, apoyados en el suelo)

| key | archivo | tamaño | descripción |
|-----|---------|--------|-------------|
| `ob-cone` | `cone.png` | 256×256 | Cono de tráfico naranja. |
| `ob-box` | `box.png` | 256×256 | Caja de cartón. |
| `ob-barrier-high` | `barrier-high.png` | 320×256 | Barrera alta (se **esquiva** cambiando de carril). |
| `ob-barrier-low` | `barrier-low.png` | 320×256 | Barrera elevada con hueco abajo (se pasa **deslizándose**). |
| `ob-fence` | `fence.png` | 320×256 | Valla de madera (se **salta**). |
| `ob-hole` | `hole.png` | 320×200 | Hueco/alcantarilla en el asfalto. |
| `ob-puddle` | `puddle.png` | 320×160 | Charco de agua. |
| `ob-car` | `car.png` | 320×320 | Auto (vista trasera). |
| `ob-taxi` | `taxi.png` | 320×320 | Taxi amarillo (vista trasera). |
| `ob-bus` | `bus.png` | 360×420 | Autobús (vista trasera). |
| `ob-truck` | `truck.png` | 360×400 | Camión (vista trasera). |
| `ob-sign` | `sign.png` | 256×320 | Señal de tráfico. |
| `ob-construction` | `construction.png` | 320×320 | Zona de obras / maquinaria. |

> Los vehículos se ven **desde atrás** porque VACA los alcanza por detrás.

### Escenario (opcional)

| key | archivo | tamaño | descripción |
|-----|---------|--------|-------------|
| `bg-buildings` | `buildings.png` | 1080×300 | Tira de edificios **repetible horizontalmente** (silueta), fondo transparente. Se usa en dos capas con parallax. |

### Tienda: skins del scooter y accesorios

Cada compra de la tienda se **refleja automáticamente en el juego** (menú y
partida) en cuanto la equipas, incluso sin arte real:

- **Sin imagen**: el color del artículo (`tint`) recolorea la textura base de
  VACA (para scooters), el faro (para luces) o genera una estela de partículas
  (para estelas) — funciona ya, hoy, sin generar nada.
- **Con imagen real**: si añades el PNG con la clave correspondiente, la
  reemplaza automáticamente y se ve con fidelidad total.

**Skins completas de scooter** (personaje entero, mismo criterio que `player`):

| key (idle) | key (deslizando) | artículo | tamaño |
|---|---|---|---|
| `skin-scooter-blue` | `skin-scooter-blue-slide` | Scooter Azul | 512×640 / 512×512 |
| `skin-scooter-gold` | `skin-scooter-gold-slide` | Scooter Dorado | 512×640 / 512×512 |
| `skin-scooter-purple` | `skin-scooter-purple-slide` | Scooter Púrpura | 512×640 / 512×512 |

> `scooter-pink` (el inicial) ya usa `player`/`player-slide` — no necesita skin
> propia. El nombre de archivo sigue la clave: `skin-scooter-blue.png`, etc.

**Íconos de artículos** (tienda + franja de equipo en el menú), 64×64 px,
fondo transparente, estilo ícono plano simple (no hace falta foto-realismo):

| key | archivo | artículo |
|---|---|---|
| `acc-scooter-blue` | `acc-scooter-blue.png` | Scooter Azul |
| `acc-scooter-gold` | `acc-scooter-gold.png` | Scooter Dorado |
| `acc-scooter-purple` | `acc-scooter-purple.png` | Scooter Púrpura |
| `acc-wheels-neon` | `acc-wheels-neon.png` | Ruedas Neón |
| `acc-wheels-fire` | `acc-wheels-fire.png` | Ruedas de Fuego |
| `acc-collar-red` | `acc-collar-red.png` | Collar Rojo |
| `acc-hat-cap` | `acc-hat-cap.png` | Gorra Deportiva |
| `acc-hat-crown` | `acc-hat-crown.png` | Corona |
| `acc-glasses-cool` | `acc-glasses-cool.png` | Gafas de Sol |
| `acc-lights-red` | `acc-lights-red.png` | Luz Roja |
| `acc-lights-rainbow` | `acc-lights-rainbow.png` | Luz Arcoíris |
| `acc-sticker-star` | `acc-sticker-star.png` | Pegatina Estrella |
| `acc-sticker-heart` | `acc-sticker-heart.png` | Pegatina Corazón |
| `acc-trail-rainbow` | `acc-trail-rainbow.png` | Estela Arcoíris |
| `acc-trail-flame` | `acc-trail-flame.png` | Estela de Fuego |

> Convención general: `acc-<id-del-artículo>.png` para cualquier artículo de
> `src/data/shopItems.ts` (el `id` está en ese archivo). Si añades un artículo
> nuevo a la tienda, su ícono sigue la misma regla automáticamente.

---

## Notas

- **Origen de los sprites**: el juego ancla personaje y obstáculos por su base
  (parte inferior), así que deja poco margen transparente debajo del objeto.
- **Escala/perspectiva**: no te preocupes por el tamaño en pantalla; el juego
  aplica la perspectiva y el escalado por profundidad automáticamente.
- Puedes empezar solo con `player` y `player-slide` (es lo que más se nota) e ir
  añadiendo el resto poco a poco.
