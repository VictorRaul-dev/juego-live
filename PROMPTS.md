# 🖼️ Prompts de IA para el arte de VACA

Prompts listos para copiar/pegar (Midjourney, DALL·E, Leonardo, Firefly, SDXL…)
para generar el arte real del juego. Ver **ASSETS.md** para dónde va cada
archivo y su `key`.

## Reglas de oro (para que encajen en el juego)

1. **Fondo transparente PNG** siempre. Si tu IA no lo hace, genera con fondo
   liso (verde/blanco) y quítalo con remove.bg o el borrador mágico.
2. **Un solo objeto, centrado**, sin sombra pintada debajo (el juego añade la
   sombra), sin suelo, sin texto ni marcas de agua.
3. **Vista**: el personaje y objetos se ven **de frente**; los **vehículos de
   espaldas** (VACA los alcanza por detrás).
4. **Coherencia de VACA**: reutiliza SIEMPRE el mismo "bloque de descripción"
   del personaje (abajo) para que sea la misma perrita en todas las imágenes.
5. Estilo: **semi-realista, render 3D, iluminación cinematográfica**, colorido y
   moderno (como la imagen de referencia).

### Bloque de descripción de VACA (reutilízalo)
> a friendly female mixed-breed dog named VACA, black fur with a white chest,
> a white stripe down the face, partially white paws, wearing a purple collar,
> happy adventurous expression, semi-realistic stylized 3D render

### Sufijo técnico (añádelo al final de casi todos)
> centered, full body, transparent background, isolated, no ground, no shadow,
> no text, no watermark, cinematic lighting, high detail, mobile game asset,
> vertical framing --style raw

*(en Midjourney puedes añadir `--ar 4:5` para el personaje y `--ar 1:1` para
ítems; en otras IAs elige esa proporción)*

---

## 1) Personaje (prioridad máxima)

**`player` → `vaca.png`** (≈512×640, PNG transparente)
```
[BLOQUE VACA], standing upright and riding a pink kick-scooter with turquoise
details and a glowing front headlight, front view facing the camera, both front
paws on the handlebar, dynamic confident pose, [SUFIJO TÉCNICO]
```

**`player-slide` → `vaca-slide.png`** (≈512×512, PNG transparente)
```
[BLOQUE VACA], crouching low and sliding on the same pink kick-scooter with
turquoise details, front view facing the camera, ducking under an obstacle,
[SUFIJO TÉCNICO]
```

---

## 2) Vehículos (vista TRASERA)

**`ob-car` → `car.png`** (≈320×320)
```
a red compact city car seen from directly behind, rear view, brake lights on,
[SUFIJO TÉCNICO]
```
**`ob-taxi` → `taxi.png`** — igual pero: `a yellow taxi cab seen from behind`.
**`ob-bus` → `bus.png`** (≈360×420) — `a green city bus seen from directly behind`.
**`ob-truck` → `truck.png`** (≈360×400) — `a blue delivery truck seen from behind`.

---

## 3) Obstáculos de calle (vista frontal)

**`ob-cone` → `cone.png`** (≈256×256)
```
a single orange traffic cone with a reflective white stripe, front view,
[SUFIJO TÉCNICO]
```
**`ob-box` → `box.png`** — `a cardboard shipping box`.
**`ob-barrier-high` → `barrier-high.png`** (≈320×256) — `a tall red and white road barrier`.
**`ob-barrier-low` → `barrier-low.png`** (≈320×256) — `a raised horizontal road barrier with empty space underneath to slide through`.
**`ob-fence` → `fence.png`** — `a low wooden fence section`.
**`ob-hole` → `hole.png`** (≈320×200) — `an open manhole / hole in the asphalt, top-down slightly angled`.
**`ob-puddle` → `puddle.png`** (≈320×160) — `a shallow water puddle on asphalt, reflective`.
**`ob-sign` → `sign.png`** (≈256×320) — `a yellow triangular warning road sign on a pole`.
**`ob-construction` → `construction.png`** (≈320×320) — `a small construction barrier with warning stripes and a cone`.

---

## 4) Coleccionables y poderes (íconos limpios, ≈128×128)

**`coin` → `coin.png`**
```
a shiny gold coin with a paw-print emblem, front view, glossy, [SUFIJO TÉCNICO]
```
**`bone` → `bone.png`** (≈128×80) — `a cute stylized dog bone treat, cream colored`.
**`key` → `key.png`** — `a golden key with a round head, game icon`.
**`pu-shield`** — `a glossy blue shield power-up game icon`.
**`pu-magnet`** — `a red horseshoe magnet power-up game icon`.
**`pu-double-score`** — `a golden "x2" multiplier power-up game icon`.
**`pu-super-jump`** — `a green upward arrow / spring jump power-up game icon`.
**`pu-turbo`** — `an orange flame / turbo boost power-up game icon`.
**`pu-slow-motion`** — `a purple clock / slow-motion power-up game icon`.

---

## 5) Escenario (opcional)

**`bg-buildings` → `buildings.png`** (≈1080×300, transparente, repetible)
```
a horizontal seamless silhouette strip of a modern city skyline, buildings of
varied heights, flat color silhouette, tileable left-right, transparent
background, no ground, no sky, no text
```

---

## 6) Tienda: skins del scooter (personaje completo)

Misma técnica que `player`: reutiliza el **bloque VACA**, cambia solo el color
del scooter, y genera también la versión "deslizando". Ver ASSETS.md para la
lista completa de `key`/archivo.

**`skin-scooter-blue` → `skin-scooter-blue.png`** (≈512×640)
```
[BLOQUE VACA], standing upright and riding an electric-blue kick-scooter with
turquoise details and a glowing front headlight, front view facing the camera,
both front paws on the handlebar, dynamic confident pose, [SUFIJO TÉCNICO]
```
**`skin-scooter-blue-slide` → `skin-scooter-blue-slide.png`** (≈512×512) — igual
pero: `crouching low and sliding on the same electric-blue kick-scooter, ducking under an obstacle`.

**`skin-scooter-gold` → `skin-scooter-gold.png`** (≈512×640)
```
[BLOQUE VACA], standing upright and riding a shiny gold kick-scooter with
white details and a glowing front headlight, front view facing the camera,
both front paws on the handlebar, dynamic confident pose, [SUFIJO TÉCNICO]
```
**`skin-scooter-gold-slide`** — igual pero agachada/deslizando, mismo scooter dorado.

**`skin-scooter-purple` → `skin-scooter-purple.png`** (≈512×640)
```
[BLOQUE VACA], standing upright and riding a deep purple kick-scooter with
neon pink details and a glowing front headlight, front view facing the camera,
both front paws on the handlebar, dynamic confident pose, [SUFIJO TÉCNICO]
```
**`skin-scooter-purple-slide`** — igual pero agachada/deslizando, mismo scooter púrpura.

> `scooter-pink` (el color inicial) ya está cubierto por `player`/`player-slide`.

---

## 7) Tienda: íconos de artículos (64×64, estilo ícono plano)

Estos son pequeños e independientes del personaje — no necesitan ser
foto-realistas, solo claros y reconocibles a tamaño pequeño. Usa un estilo
de **ícono plano con un toque de brillo/3D sutil**, fondo transparente,
encuadre cuadrado, el objeto solo (sin texto).

**Sufijo de ícono (añádelo a todos los de esta sección):**
> flat icon style, single object centered, transparent background, no text,
> no watermark, soft rim light, square framing, mobile game UI icon --ar 1:1

| key → archivo | prompt |
|---|---|
| `acc-scooter-blue` → `acc-scooter-blue.png` | `a small electric-blue kick-scooter icon with turquoise wheels, [sufijo de ícono]` |
| `acc-scooter-gold` → `acc-scooter-gold.png` | `a small shiny gold kick-scooter icon, [sufijo de ícono]` |
| `acc-scooter-purple` → `acc-scooter-purple.png` | `a small deep purple kick-scooter icon with neon pink details, [sufijo de ícono]` |
| `acc-wheels-neon` → `acc-wheels-neon.png` | `a scooter wheel icon glowing neon green, [sufijo de ícono]` |
| `acc-wheels-fire` → `acc-wheels-fire.png` | `a scooter wheel icon with a fiery orange glow, [sufijo de ícono]` |
| `acc-collar-red` → `acc-collar-red.png` | `a red dog collar icon with a small round tag, [sufijo de ícono]` |
| `acc-hat-cap` → `acc-hat-cap.png` | `a sporty baseball cap icon in turquoise, [sufijo de ícono]` |
| `acc-hat-crown` → `acc-hat-crown.png` | `a small golden crown icon with jewels, [sufijo de ícono]` |
| `acc-glasses-cool` → `acc-glasses-cool.png` | `a pair of stylish black sunglasses icon, [sufijo de ícono]` |
| `acc-lights-red` → `acc-lights-red.png` | `a scooter headlight icon glowing intense red, [sufijo de ícono]` |
| `acc-lights-rainbow` → `acc-lights-rainbow.png` | `a scooter headlight icon glowing magical rainbow colors, [sufijo de ícono]` |
| `acc-sticker-star` → `acc-sticker-star.png` | `a glossy golden star sticker icon, [sufijo de ícono]` |
| `acc-sticker-heart` → `acc-sticker-heart.png` | `a glossy pink heart sticker icon, [sufijo de ícono]` |
| `acc-trail-rainbow` → `acc-trail-rainbow.png` | `a swirl of colorful rainbow sparkle particles icon, [sufijo de ícono]` |
| `acc-trail-flame` → `acc-trail-flame.png` | `a swirl of orange flame particles icon, [sufijo de ícono]` |

---

## Recomendación de orden

1. `player` y `player-slide` (lo que más se nota).
2. `ob-car`, `ob-cone`, `ob-barrier-high`, `ob-barrier-low`, `coin`, `bone`.
3. Skins de scooter (`skin-scooter-*`) — se ven en cuanto las compras y equipas.
4. Íconos de la tienda (`acc-*`) — mejoran las tarjetas y la franja de equipo del menú.
5. El resto de obstáculos, poderes y `bg-buildings` al final.

Empieza con 1-2, súbelos y verifica cómo se ven en el juego antes de generar el
resto (así ajustas el estilo una sola vez).
