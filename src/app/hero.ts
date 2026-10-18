import { computed, signal } from '@angular/core';

export type Stat = 'str' | 'int' | 'mag';
export interface Item { id: string; e: string; name: string; stat: Stat; cost: number; lvl: number }
export interface HeroData {
  name: string; av: string; level: number; xp: number; coins: number; points: number;
  stats: Record<Stat, number>; items: Record<string, number>;
}

export const AVATARS = ['🧙', '🦸', '🧝', '🐲', '🤖', '🦄', '🧚', '🧜', '🐱', '🦊'];
export const STATS: { k: Stat; e: string; name: string; hint: string }[] = [
  { k: 'str', e: '💪', name: 'Сила', hint: '+5% монет за каждое очко' },
  { k: 'int', e: '🧠', name: 'Ум', hint: '+5% опыта за каждое очко' },
  { k: 'mag', e: '✨', name: 'Магия', hint: 'каждые 5 очков прощают 1 ошибку в уроке' },
];
export const ITEMS: Item[] = [
  { id: 'sword', e: '🗡️', name: 'Меч', stat: 'str', cost: 20, lvl: 1 },
  { id: 'book', e: '📘', name: 'Книга знаний', stat: 'int', cost: 20, lvl: 1 },
  { id: 'wand', e: '🔮', name: 'Хрустальный шар', stat: 'mag', cost: 30, lvl: 2 },
  { id: 'shield', e: '🛡️', name: 'Щит', stat: 'str', cost: 40, lvl: 3 },
  { id: 'glasses', e: '👓', name: 'Умные очки', stat: 'int', cost: 40, lvl: 3 },
  { id: 'boots', e: '👢', name: 'Сапоги-скороходы', stat: 'str', cost: 60, lvl: 4 },
  { id: 'pet', e: '🐉', name: 'Дракон-питомец', stat: 'mag', cost: 60, lvl: 5 },
  { id: 'crown', e: '👑', name: 'Корона', stat: 'int', cost: 80, lvl: 6 },
  { id: 'ring', e: '💍', name: 'Кольцо силы', stat: 'mag', cost: 120, lvl: 8 },
  { id: 'amulet', e: '🌟', name: 'Звёздный амулет', stat: 'str', cost: 150, lvl: 10 },
];
export const MAX_ITEM_LVL = 5;
export const itemBonus = (i: Item) => Math.ceil(i.cost / 40);
export const itemPrice = (i: Item, owned: number) => i.cost * (owned + 1);

const KEY = 'ek-hero';

export class Hero {
  readonly d = signal<HeroData | null>(this.load());
  readonly need = computed(() => 40 * (this.d()?.level ?? 1));

  private load(): HeroData | null {
    try {
      return JSON.parse(localStorage.getItem(KEY) || 'null');
    } catch {
      return null;
    }
  }

  private save(d: HeroData) {
    this.d.set(d);
    try {
      localStorage.setItem(KEY, JSON.stringify(d));
    } catch {}
  }

  private edit(f: (d: HeroData) => void) {
    const d = structuredClone(this.d()!);
    f(d);
    this.save(d);
  }

  create(name: string, av: string) {
    this.save({ name, av, level: 1, xp: 0, coins: 10, points: 5, stats: { str: 0, int: 0, mag: 0 }, items: {} });
  }

  total(k: Stat) {
    const d = this.d()!;
    return d.stats[k] + ITEMS.filter((i) => i.stat === k).reduce((s, i) => s + itemBonus(i) * (d.items[i.id] || 0), 0);
  }

  forgive() {
    return Math.floor(this.total('mag') / 5);
  }

  addStat(k: Stat) {
    this.edit((d) => {
      if (d.points > 0) {
        d.points--;
        d.stats[k]++;
      }
    });
  }

  canBuy(i: Item) {
    const d = this.d()!;
    const owned = d.items[i.id] || 0;
    return d.level >= i.lvl && owned < MAX_ITEM_LVL && d.coins >= itemPrice(i, owned);
  }

  buy(i: Item) {
    if (!this.canBuy(i)) return;
    this.edit((d) => {
      d.coins -= itemPrice(i, d.items[i.id] || 0);
      d.items[i.id] = (d.items[i.id] || 0) + 1;
    });
  }

  reward(stars: number, first: boolean) {
    const xp = Math.round((stars * 10 + (first ? 20 : 0)) * (1 + 0.05 * this.total('int')));
    const coins = Math.round((stars * 5 + (first ? 10 : 0)) * (1 + 0.05 * this.total('str')));
    let up = 0;
    this.edit((d) => {
      d.coins += coins;
      d.xp += xp;
      while (d.xp >= 40 * d.level) {
        d.xp -= 40 * d.level;
        d.level++;
        d.points += 2;
        up++;
      }
    });
    return { xp, coins, up };
  }
}
