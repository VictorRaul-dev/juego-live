import type { GameSave, ShopItem } from '../core/types';
import { SHOP_ITEMS } from '../data/shopItems';

/** Look up a shop item by id. Undefined for an unequipped slot. */
export function itemById(id: string | undefined): ShopItem | undefined {
  if (!id) return undefined;
  return SHOP_ITEMS.find((i) => i.id === id);
}

/**
 * Texture key conventions for real/placeholder art, shared by every scene that
 * needs to resolve a cosmetic to a texture. Keeping these as pure functions
 * (no Phaser) lets the mapping be unit-tested and reused consistently.
 *
 * - Scooter items may provide a full-body character skin: `skin-<id>` (idle)
 *   and `skin-<id>-slide` (sliding pose). When absent, the item's `tint` is
 *   applied to the base character art as a lightweight recolour instead.
 * - Every shop item gets a small 64x64 icon at `acc-<id>`, used for shop
 *   preview cards and the equipped-loadout strip. TextureFactory always
 *   generates a procedural placeholder for these, so the key never resolves
 *   to nothing even before real art is dropped in.
 */
export function scooterSkinKey(itemId: string): string {
  return `skin-${itemId}`;
}

export function scooterSkinSlideKey(itemId: string): string {
  return `skin-${itemId}-slide`;
}

export function accessoryIconKey(itemId: string): string {
  return `acc-${itemId}`;
}

export interface EquippedLoadout {
  scooter?: ShopItem;
  wheels?: ShopItem;
  lights?: ShopItem;
  sticker?: ShopItem;
  collar?: ShopItem;
  hat?: ShopItem;
  glasses?: ShopItem;
  trail?: ShopItem;
}

/** Resolve every equipped category id into its full ShopItem (or undefined). */
export function resolveLoadout(equipped: GameSave['equippedItems']): EquippedLoadout {
  return {
    scooter: itemById(equipped.scooter),
    wheels: itemById(equipped.wheels),
    lights: itemById(equipped.lights),
    sticker: itemById(equipped.sticker),
    collar: itemById(equipped.collar),
    hat: itemById(equipped.hat),
    glasses: itemById(equipped.glasses),
    trail: itemById(equipped.trail),
  };
}

/** All currently-equipped item ids, in a stable category order. */
export function equippedItemIds(equipped: GameSave['equippedItems']): string[] {
  const order: Array<keyof GameSave['equippedItems']> = [
    'scooter',
    'lights',
    'wheels',
    'sticker',
    'collar',
    'hat',
    'glasses',
    'trail',
  ];
  return order.map((k) => equipped[k]).filter((id): id is string => Boolean(id));
}
