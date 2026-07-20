/// <reference types="vite/client" />
import Phaser from 'phaser';
import './style.css';
import { GAME_HEIGHT, GAME_WIDTH } from './config/GameConfig';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { LevelSelectScene } from './scenes/LevelSelectScene';
import { GameScene } from './scenes/GameScene';
import { PauseScene } from './scenes/PauseScene';
import { ResultsScene } from './scenes/ResultsScene';
import { ShopScene } from './scenes/ShopScene';
import { MissionsScene } from './scenes/MissionsScene';
import { SettingsScene } from './scenes/SettingsScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO, // WebGL with automatic Canvas fallback
  parent: 'game-root',
  backgroundColor: '#140630',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    antialias: true,
    powerPreference: 'high-performance',
  },
  fps: {
    target: 60,
    min: 30,
  },
  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    LevelSelectScene,
    GameScene,
    PauseScene,
    ResultsScene,
    ShopScene,
    MissionsScene,
    SettingsScene,
  ],
};

const game = new Phaser.Game(config);

// Remove the HTML loading splash once Phaser has booted, then refresh the
// scale manager so the canvas bounds used for pointer mapping are up to date
// (guards against a stale first-tap position after layout settles).
game.events.once(Phaser.Core.Events.READY, () => {
  document.getElementById('loading-splash')?.remove();
  game.scale.refresh();
});
window.addEventListener('load', () => game.scale.refresh());
setTimeout(() => game.scale.refresh(), 400);

// Unlock the Web Audio context on the first real user gesture. This lives on
// the window (not a scene) so it survives scene transitions — the first tap on
// the menu reliably enables all sound, respecting browser autoplay policies.
function unlockAudio(): void {
  const audio = game.registry.get('audio') as { unlock(): void; ready: boolean } | undefined;
  audio?.unlock();
  if (audio?.ready) {
    ['pointerdown', 'touchstart', 'keydown'].forEach((ev) =>
      window.removeEventListener(ev, unlockAudio),
    );
  }
}
['pointerdown', 'touchstart', 'keydown'].forEach((ev) =>
  window.addEventListener(ev, unlockAudio, { passive: true }),
);

// Pause the game automatically when the tab loses focus (accessibility + battery).
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) return;
  const gameScene = game.scene.getScene('GameScene');
  if (gameScene && game.scene.isActive('GameScene') && !game.scene.isActive('PauseScene')) {
    gameScene.scene.pause();
    gameScene.scene.launch('PauseScene');
  }
});

// Prevent the page from scrolling / zooming during play.
window.addEventListener(
  'touchmove',
  (e) => {
    if (e.touches.length > 1) e.preventDefault();
  },
  { passive: false },
);
document.addEventListener('gesturestart', (e) => e.preventDefault());

// Register the service worker for offline / PWA support (production only).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker.register(swUrl).catch((err) => {
      console.warn('Service worker no registrado:', err);
    });
  });
}
