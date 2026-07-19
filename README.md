# 🐾 VACA – Aventura Sin Límites

Un **endless runner** para navegador protagonizado por **VACA**, una perrita de
pelaje negro y blanco que recorre la ciudad sobre su scooter rosado. Esquiva
obstáculos, cambia de carril, salta, deslízate y recoge monedas, huesos y
poderes para llegar lo más lejos posible.

Construido con **Phaser 3 + TypeScript + Vite**, se publica automáticamente en
**GitHub Pages** y funciona como **PWA instalable** (jugable sin conexión tras la
primera carga).

> **Demo:** una vez habilitado GitHub Pages, el juego estará disponible en
> `https://<usuario>.github.io/juego-live/`

---

## 📸 Capturas

Todos los gráficos y sonidos se **generan proceduralmente en tiempo de
ejecución** (no hay archivos binarios de arte ni audio), por lo que no existen
recursos que puedan dar error 404. Los sprites de VACA, obstáculos, monedas,
huesos y poderes son *placeholders originales y claramente reemplazables* — ver
[Cómo añadir sprites](#-cómo-añadir-sprites).

| Menú | Partida | Pausa |
|------|---------|-------|
| Título, mejor distancia, tienda, misiones, niveles, ajustes | 3 carriles, HUD, obstáculos, monedas, poderes | Overlay con reanudar / reiniciar / salir |

---

## 🎮 Controles

**Táctil**

| Gesto | Acción |
|-------|--------|
| Deslizar ←/→ | Cambiar de carril |
| Deslizar ↑ / tocar | Saltar |
| Deslizar ↓ | Deslizarse |

**Teclado**

| Tecla | Acción |
|-------|--------|
| `←` / `A` | Carril izquierdo |
| `→` / `D` | Carril derecho |
| `↑` / `W` / `Espacio` | Saltar |
| `↓` / `S` | Deslizarse |
| `Esc` / `P` | Pausa |

---

## ✨ Características

- **3 carriles** con interpolación suave, salto, deslizamiento e inclinación.
- **Dificultad progresiva y adaptativa** (10 niveles + modo infinito) que sube
  con la distancia y el desempeño, con topes para no volverse injugable.
- **Generación procedural segura**: se combinan *chunks* prevalidados y un
  validador rechaza patrones imposibles (siempre existe una ruta posible).
- **Obstáculos** variados: conos, cajas, barreras altas/bajas, vallas, huecos,
  charcos, autos, taxis, buses, camiones, señales y obras.
- **Coleccionables**: monedas, huesos, llaves.
- **Poderes**: escudo, imán, doble puntuación, súper salto, turbo y cámara lenta,
  con duración mejorable.
- **Tienda** de cosméticos + **mejoras** de habilidades.
- **Misiones diarias** con recompensas (sin duplicar premios).
- **Guardado local** con validación, recuperación ante datos corruptos e
  importar/exportar partida.
- **Audio sintetizado** por Web Audio cuya intensidad sube con la velocidad.
- **PWA** instalable con service worker versionado y pantalla offline.
- **Accesibilidad**: reducir movimiento, alto contraste, vibración configurable,
  pausa automática al perder el foco, i18n (ES/EN).
- **Optimización**: object pooling, reciclaje de sprites y selector de calidad.

---

## 🚀 Instalación local

Requisitos: **Node.js 20+** y **npm**.

```bash
git clone https://github.com/<usuario>/juego-live.git
cd juego-live
npm install
npm run dev
```

Abre la URL que muestra Vite (por defecto `http://localhost:5173`).

### Producción

```bash
npm run build     # comprueba tipos + genera la carpeta dist/
npm run preview   # sirve dist/ localmente
```

### Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | `tsc --noEmit` + `vite build` → `dist/` |
| `npm run preview` | Sirve la build de producción |
| `npm run test` | Pruebas unitarias con Vitest |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

---

## 📁 Estructura del proyecto

```
juego-live/
├── .github/workflows/deploy.yml   # CI: lint + test + build + deploy a Pages
├── public/                        # manifest, service worker, offline, iconos
├── src/
│   ├── config/      # constantes de juego
│   ├── core/        # tipos, estado global, i18n
│   ├── data/        # chunks, niveles, tienda, misiones, mejoras, temas
│   ├── entities/    # Player (VACA + scooter)
│   ├── managers/    # Audio, Input, Obstacle, Collectible (dependen de Phaser)
│   ├── scenes/      # Boot, Preload, MainMenu, LevelSelect, Game, Pause,
│   │                #   Results, Shop, Missions, Settings
│   ├── services/    # SaveService (localStorage)
│   ├── systems/     # Difficulty, ChunkGenerator, Score, PowerUp, Mission
│   │                #   (lógica pura, testeable sin Phaser)
│   ├── ui/          # Button, Background
│   ├── utils/       # TextureFactory (gráficos procedurales), Pool
│   ├── locales/     # es.json, en.json
│   ├── main.ts      # arranque de Phaser + registro del service worker
│   └── style.css
├── tests/           # pruebas Vitest
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

La lógica de juego pura vive en `src/systems/` y `src/services/` **sin importar
Phaser**, lo que permite probarla en Node y respeta los principios SOLID
(cada sistema tiene una responsabilidad única).

---

## 🖼️ Cómo añadir sprites

Los gráficos actuales se generan en `src/utils/TextureFactory.ts` con las claves
de textura `player`, `player-slide`, `coin`, `bone`, `key`, `ob-<tipo>` y
`pu-<tipo>`. Para usar arte real:

1. Coloca las imágenes en `public/assets/images/` (o un atlas en
   `public/assets/sprites/`).
2. En `src/scenes/PreloadScene.ts`, cárgalas **con la misma clave** dentro de
   `preload()`:
   ```ts
   this.load.image('player', 'assets/images/vaca.png');
   this.load.image('ob-cone', 'assets/images/cone.png');
   ```
3. Elimina (o deja como fallback) la llamada correspondiente en
   `TextureFactory`. El resto del juego seguirá funcionando sin cambios.

> Usa rutas **relativas** (sin `/` inicial) para que funcionen bajo el sub-path
> de GitHub Pages.

---

## 🧩 Cómo añadir niveles

Edita `src/data/levels.ts` y añade un objeto `LevelDef` (id, nombre, escenario,
distancia objetivo, dificultad, recompensa y objetivos). Asocia un tema visual en
`src/data/themes.ts` usando el mismo nombre de `scenario`.

## ⚙️ Cómo modificar la dificultad

- Curva global, velocidad y espaciado: `src/systems/DifficultyManager.ts`.
- Velocidades base/máximas y duraciones: `src/config/GameConfig.ts`.
- Patrones de obstáculos: `src/data/chunks.ts` (cada patrón declara con qué
  acción se esquiva; el validador de `ChunkGenerator` garantiza rutas posibles).

---

## 🌐 Cómo desplegar en GitHub Pages

1. Sube el proyecto a un repositorio de GitHub.
2. En **Settings → Pages**, en *Build and deployment*, selecciona
   **GitHub Actions** como *Source*.
3. Cada `push` a `main` ejecuta `.github/workflows/deploy.yml`, que corre
   `npm ci`, `npm run lint`, `npm run test`, `npm run build` y publica `dist/`.
4. El juego quedará en `https://<usuario>.github.io/juego-live/`.

### Cambiar el nombre del repositorio

La ruta base se controla con **una sola constante** en `vite.config.ts`:

```ts
const REPO_NAME = 'juego-live';
```

Cámbiala si renombras el repositorio. En desarrollo/preview la base es `/`; en la
build de CI se usa `/<REPO_NAME>/` automáticamente.

---

## 🧪 Pruebas

`npm run test` cubre:

- progresión y topes de dificultad;
- cálculo de puntuación y multiplicadores;
- validación de *chunks* y rutas posibles;
- generación procedural (sin repetición inmediata, siempre válida);
- guardado, migración, importación y recuperación ante corrupción;
- duración y consumo de poderes;
- misiones (generación diaria determinista y premios sin duplicar);
- economía y desbloqueo de niveles.

---

## 🛠️ Solución de errores comunes

| Problema | Solución |
|----------|----------|
| Recursos con **404** en GitHub Pages | Verifica `REPO_NAME` en `vite.config.ts` y usa rutas relativas. |
| Pantalla en blanco tras desplegar | Asegúrate de que *Pages* use **GitHub Actions** como fuente. |
| El audio no suena | Los navegadores exigen una interacción previa; toca/haz clic una vez. |
| Cambios no aparecen (PWA) | El service worker cachea; recarga o sube `CACHE_VERSION` en `public/sw.js`. |
| Falla `npm ci` en CI | Confirma que `package-lock.json` esté commiteado. |

---

## 📄 Licencia

[MIT](./LICENSE) © 2026 VACA – Aventura Sin Límites.

## 🙌 Créditos

Diseño de juego, desarrollo, UI/UX, sonido y QA: proyecto VACA. Motor:
[Phaser 3](https://phaser.io). Empaquetado con [Vite](https://vitejs.dev).
