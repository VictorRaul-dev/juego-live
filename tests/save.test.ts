import { describe, it, expect } from 'vitest';
import { LocalSaveService, MemoryStorage, createDefaultSave } from '../src/services/SaveService';
import { SAVE_KEY } from '../src/config/GameConfig';

describe('LocalSaveService', () => {
  it('returns a default save when storage is empty', () => {
    const svc = new LocalSaveService(new MemoryStorage());
    const save = svc.load();
    expect(save.coins).toBe(0);
    expect(save.unlockedLevels).toEqual([1]);
  });

  it('round-trips a saved game', () => {
    const storage = new MemoryStorage();
    const svc = new LocalSaveService(storage);
    const save = createDefaultSave();
    save.coins = 1234;
    save.bestDistance = 999;
    svc.save(save);
    const loaded = svc.load();
    expect(loaded.coins).toBe(1234);
    expect(loaded.bestDistance).toBe(999);
  });

  it('recovers from corrupted data', () => {
    const storage = new MemoryStorage();
    storage.setItem(SAVE_KEY, '{not valid json');
    const svc = new LocalSaveService(storage);
    const save = svc.load();
    expect(save.coins).toBe(0);
  });

  it('migrates partial/old saves by merging over defaults', () => {
    const storage = new MemoryStorage();
    storage.setItem(SAVE_KEY, JSON.stringify({ coins: 50 }));
    const svc = new LocalSaveService(storage);
    const save = svc.load();
    expect(save.coins).toBe(50);
    expect(save.settings.language).toBe('es');
    expect(save.ownedItems.length).toBeGreaterThan(0);
  });

  it('import rejects invalid data and accepts valid data', () => {
    const svc = new LocalSaveService(new MemoryStorage());
    expect(svc.importSave('garbage')).toBe(false);
    const valid = JSON.stringify({ ...createDefaultSave(), bones: 42 });
    expect(svc.importSave(valid)).toBe(true);
    expect(svc.load().bones).toBe(42);
  });

  it('reset clears the stored save', () => {
    const storage = new MemoryStorage();
    const svc = new LocalSaveService(storage);
    svc.save({ ...createDefaultSave(), coins: 10 });
    svc.reset();
    expect(svc.load().coins).toBe(0);
  });
});
