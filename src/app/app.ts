import { Component, computed, signal } from '@angular/core';
import { LESSONS, Lesson, Word } from './lessons';
import { AVATARS, Hero, ITEMS, Item, MAX_ITEM_LVL, STATS, itemBonus, itemPrice } from './hero';

type Kind = 'listen' | 'toRu' | 'toEn' | 'build' | 'speak';
interface Q { kind: Kind; w: Word; opts: Word[]; pieces: string[] }

const KEY = 'ek-progress';
const PRAISE = ['Отлично!', 'Супер!', 'Молодец!', 'Great job!', 'Wow!', 'Excellent!'];
const shuffle = <T>(a: T[]) => [...a].sort(() => Math.random() - 0.5);
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9' ]/g, ' ').split(/\s+/).filter(Boolean);
const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

function loadStars(): number[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly lessons = LESSONS;
  readonly avatars = AVATARS;
  readonly statList = STATS;
  readonly items = ITEMS;
  readonly maxItem = MAX_ITEM_LVL;
  readonly bonus = itemBonus;
  readonly price = itemPrice;
  readonly hero = new Hero();
  readonly h = this.hero.d;

  readonly view = signal<'map' | 'lesson' | 'hero' | 'shop'>('map');
  readonly newName = signal('');
  readonly newAv = signal(AVATARS[0]);

  readonly stars = signal<number[]>(loadStars());
  readonly totalStars = computed(() => this.stars().reduce((a, b) => a + (b || 0), 0));
  readonly doneCount = computed(() => this.stars().filter((s) => s > 0).length);

  readonly idx = signal(-1);
  readonly lesson = signal<Lesson | null>(null);
  readonly phase = signal<'learn' | 'quiz' | 'done'>('learn');
  readonly card = signal(0);

  readonly qs = signal<Q[]>([]);
  readonly qi = signal(0);
  readonly q = computed(() => this.qs()[this.qi()]);
  readonly wrong = signal<string[]>([]);
  readonly right = signal(false);
  readonly built = signal<number[]>([]);
  readonly shake = signal(false);
  readonly praise = signal('');
  readonly listening = signal(false);
  readonly heard = signal('');
  readonly earned = signal(0);
  readonly result = signal({ xp: 0, coins: 0, up: 0 });
  private mistakes = 0;
  private ac?: AudioContext;

  createHero() {
    this.hero.create(this.newName().trim() || 'Герой', this.newAv());
    this.view.set('hero');
  }

  ownedItems() {
    const d = this.h()!;
    return ITEMS.filter((i) => d.items[i.id]);
  }

  unlocked(i: number) {
    return i === 0 || (this.stars()[i - 1] || 0) > 0;
  }

  open(i: number) {
    if (!this.unlocked(i)) return;
    const l = LESSONS[i];
    this.idx.set(i);
    this.lesson.set(l);
    this.view.set('lesson');
    this.card.set(0);
    if (l.review) this.startQuiz();
    else {
      this.phase.set('learn');
      this.sayW(l.words[0]);
    }
  }

  home() {
    this.stopListen();
    this.view.set('map');
  }

  nextCard() {
    const words = this.lesson()!.words;
    if (this.card() < words.length - 1) {
      this.card.update((c) => c + 1);
      this.sayW(words[this.card()]);
    } else this.startQuiz();
  }

  startQuiz() {
    const l = this.lesson()!;
    const kinds: Kind[] = l.abc ? ['listen', 'toRu', 'toEn', 'speak'] : ['listen', 'toRu', 'toEn', 'build', 'speak'];
    const make = (w: Word, i: number): Q => {
      let kind = kinds[i % kinds.length];
      if (kind === 'speak' && !SR) kind = 'toEn';
      // Варианты ответа без повторов слов и картинок
      const opts = [w];
      for (const x of shuffle(l.words)) {
        if (opts.length === 4) break;
        if (opts.every((o) => o.en !== x.en && o.e !== x.e && o.ru !== x.ru)) opts.push(x);
      }
      const pieces = w.en.includes(' ') ? w.en.split(' ') : w.en.split('');
      return { kind, w, opts: shuffle(opts), pieces: shuffle(pieces) };
    };
    const qs = [...shuffle(l.words).map((w, i) => make(w, i)), ...shuffle(l.words).map((w, i) => make(w, i + 2))];
    this.qs.set(qs.slice(0, 12));
    this.qi.set(0);
    this.mistakes = 0;
    this.phase.set('quiz');
    this.resetQ();
  }

  private resetQ() {
    this.wrong.set([]);
    this.right.set(false);
    this.built.set([]);
    this.praise.set('');
    this.heard.set('');
    const q = this.q();
    if (q.kind === 'listen') setTimeout(() => this.say(q.w.en), 300);
  }

  pick(o: Word) {
    if (this.right() || this.wrong().includes(o.en)) return;
    if (o === this.q().w) this.ok();
    else this.fail(() => this.wrong.update((a) => [...a, o.en]));
  }

  tapPiece(i: number) {
    if (this.right() || this.built().includes(i)) return;
    this.built.update((b) => [...b, i]);
    const q = this.q();
    if (this.built().length < q.pieces.length) return;
    if (this.builtText() === q.w.en) this.ok();
    else this.fail(() => setTimeout(() => this.built.set([]), 600));
  }

  unbuild(k: number) {
    if (!this.right()) this.built.update((b) => b.filter((_, j) => j !== k));
  }

  builtText() {
    const q = this.q();
    return this.built().map((i) => q.pieces[i]).join(q.w.en.includes(' ') ? ' ' : '');
  }

  // Произношение: для букв говорим слово-пример, для остального — само слово/фразу
  target(w: Word) {
    return w.ex || w.en;
  }

  listen() {
    if (!SR || this.listening() || this.right()) return;
    speechSynthesis.cancel();
    const r = new SR();
    r.lang = 'en-US';
    r.maxAlternatives = 5;
    const goal = norm(this.target(this.q().w));
    r.onresult = (e: any) => {
      const alts: string[] = Array.from(e.results[0] as ArrayLike<{ transcript: string }>).map((a) => a.transcript);
      this.heard.set(alts[0] || '');
      const okAlt = alts.some((t) => {
        const said = norm(t);
        return goal.filter((g) => said.includes(g)).length / goal.length >= 0.7;
      });
      if (okAlt) this.ok();
      else this.fail(() => {});
    };
    r.onerror = () => this.heard.set('…не расслышал, попробуй ещё');
    r.onend = () => this.listening.set(false);
    this.rec = r;
    this.listening.set(true);
    r.start();
  }
  private rec: any;

  private stopListen() {
    try {
      this.rec?.abort();
    } catch {}
    this.listening.set(false);
  }

  skip() {
    this.stopListen();
    this.nextQ();
  }

  private ok() {
    this.right.set(true);
    this.praise.set(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
    this.beep(true);
    this.sayW(this.q().w);
    setTimeout(() => this.nextQ(), 1500);
  }

  private fail(after: () => void) {
    this.mistakes++;
    this.beep(false);
    this.shake.set(true);
    setTimeout(() => this.shake.set(false), 500);
    after();
  }

  private nextQ() {
    if (this.view() !== 'lesson' || this.phase() !== 'quiz') return;
    if (this.qi() < this.qs().length - 1) {
      this.qi.update((i) => i + 1);
      this.resetQ();
    } else this.finish();
  }

  private finish() {
    const m = Math.max(0, this.mistakes - this.hero.forgive());
    const s = m === 0 ? 3 : m <= 3 ? 2 : 1;
    const i = this.idx();
    const first = !(this.stars()[i] > 0);
    this.earned.set(s);
    this.stars.update((a) => {
      const n = [...a];
      n[i] = Math.max(n[i] || 0, s);
      try {
        localStorage.setItem(KEY, JSON.stringify(n));
      } catch {}
      return n;
    });
    this.result.set(this.hero.reward(s, first));
    this.phase.set('done');
    this.say('Well done!');
  }

  sayW(w: Word) {
    this.say(w.ex ? `${w.en}. ${w.ex}` : w.en);
  }

  say(text: string) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.8;
    speechSynthesis.speak(u);
  }

  buy(i: Item) {
    if (!this.hero.canBuy(i)) return;
    this.hero.buy(i);
    this.beep(true);
  }

  private beep(good: boolean) {
    try {
      const c = (this.ac ??= new AudioContext());
      (good ? [523, 659, 784] : [220, 160]).forEach((f, i) => {
        const o = c.createOscillator();
        const g = c.createGain();
        const t = c.currentTime + i * 0.1;
        o.type = 'triangle';
        o.frequency.value = f;
        g.gain.setValueAtTime(0.2, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        o.connect(g).connect(c.destination);
        o.start(t);
        o.stop(t + 0.25);
      });
    } catch {}
  }
}
