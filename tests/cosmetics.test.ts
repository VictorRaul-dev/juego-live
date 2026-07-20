import { describe, it, expect } from 'vitest';
import {
  accessoryIconKey,
  equippedItemIds,
  itemById,
  resolveLoadout,
  scooterSkinKey,
  scooterSkinSlideKey,
} from '../src/systems/Cosmetics';
import { DEFAULT_EQUIPPED, DEFAULT_OWNED, SHOP_ITEMS } from '../src/data/shopItems';
import { createDefaultSave } from '../src/services/SaveService';

describe('texture key conventions', () => {
  it('derives scooter skin keys from the item id', () => {
    expect(scooterSkinKey('scooter-blue')).toBe('skin-scooter-blue');
    expect(scooterSkinSlideKey('scooter-blue')).toBe('skin-scooter-blue-slide');
  });

  it('derives accessory icon keys from the item id', () => {
    expect(accessoryIconKey('hat-cap')).toBe('acc-hat-cap');
  });
});

describe('itemById / resolveLoadout', () => {
  it('returns undefined for an empty slot', () => {
    expect(itemById(undefined)).toBeUndefined();
    expect(itemById('does-not-exist')).toBeUndefined();
  });

  it('resolves every equipped category to its full ShopItem', () => {
    const save = createDefaultSave();
    const loadout = resolveLoadout(save.equippedItems);
    expect(loadout.scooter?.id).toBe('scooter-pink');
    expect(loadout.collar?.id).toBe('collar-purple');
    expect(loadout.lights?.id).toBe('lights-white');
    expect(loadout.trail).toBeUndefined(); // nothing equipped by default
  });
});

describe('equippedItemIds', () => {
  it('lists only non-empty equipped slots in a stable order', () => {
    const save = createDefaultSave();
    const ids = equippedItemIds(save.equippedItems);
    expect(ids).toEqual(['scooter-pink', 'lights-white', 'collar-purple']);
  });

  it('grows as more categories are equipped', () => {
    const save = createDefaultSave();
    save.equippedItems.trail = 'trail-flame';
    save.equippedItems.hat = 'hat-cap';
    const ids = equippedItemIds(save.equippedItems);
    expect(ids).toContain('trail-flame');
    expect(ids).toContain('hat-cap');
    expect(ids.length).toBe(5);
  });
});

describe('shop catalogue integrity', () => {
  it('has unique item ids', () => {
    const ids = SHOP_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every default-owned item exists in the catalogue', () => {
    for (const id of DEFAULT_OWNED) {
      expect(SHOP_ITEMS.some((i) => i.id === id)).toBe(true);
    }
  });

  it('every default-equipped item is owned by default', () => {
    for (const id of Object.values(DEFAULT_EQUIPPED)) {
      expect(DEFAULT_OWNED).toContain(id);
    }
  });

  it('covers every shop category with at least one item', () => {
    const categories = new Set(SHOP_ITEMS.map((i) => i.category));
    for (const c of ['scooter', 'wheels', 'lights', 'sticker', 'collar', 'hat', 'glasses', 'trail']) {
      expect(categories.has(c as never)).toBe(true);
    }
  });

  it('prices are non-negative and free items are already owned', () => {
    for (const item of SHOP_ITEMS) {
      expect(item.price).toBeGreaterThanOrEqual(0);
      if (item.price === 0) expect(DEFAULT_OWNED).toContain(item.id);
    }
  });
});
