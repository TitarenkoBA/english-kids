import { Component, computed, signal } from '@angular/core';
import { LESSONS, Lesson, Word } from './lessons';

type Kind = 'listen' | 'toRu' | 'toEn' | 'build';
interface Q { kind: Kind; w: Word; opts: Word[]; pieces: string[] }

const KEY = 'ek-stars';
const KINDS: Kind[] = ['listen', 'toRu', 'toEn', 'build'];
const PRAISE = ['Отлично!', 'Супер!', 'Молодец!', 'Great job!', 'Wow!'];
const shuffle = <T>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

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
  readonly stars = signal<number[]>(loadStars());
  readonly totalStars = computed(() => this.stars().reduce((a, b) => a + (b || 0), 0));

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
  readonly earned = signal(0);
  private mistakes = 0;
  private ac?: AudioContext;

  unlocked(i: number) {
    return i === 0 || (this.stars()[i - 1] || 0) > 0;
  }

  open(i: number) {
    if (!this.unlocked(i)) return;
    this.idx.set(i);
    this.lesson.set(LESSONS[i]);
    this.phase.set('learn');
    this.card.set(0);
    this.say(LESSONS[i].words[0].en);
  }

  home() {
    this.lesson.set(null);
  }

  nextCard() {
    const words = this.lesson()!.words;
    if (this.card() < words.length - 1) {
      this.card.update((c) => c + 1);
      this.say(words[this.card()].en);
    } else this.startQuiz();
  }

  startQuiz() {
    const words = this.lesson()!.words;
    const make = (w: Word, kind: Kind): Q => ({
      kind,
      w,
      opts: shuffle([w, ...shuffle(words.filter((x) => x !== w)).slice(0, 3)]),
      pieces: shuffle(w.en.includes(' ') ? w.en.split(' ') : w.en.split('')),
    });
    const qs = [
      ...shuffle(words).map((w, i) => make(w, KINDS[i % 4])),
      ...shuffle(words).map((w, i) => make(w, KINDS[(i + 2) % 4])),
    ].slice(0, 12);
    this.qs.set(qs);
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
    if (this.q().kind === 'listen') setTimeout(() => this.say(this.q().w.en), 300);
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

  private ok() {
    this.right.set(true);
    this.praise.set(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
    this.beep(true);
    this.say(this.q().w.en);
    setTimeout(() => this.nextQ(), 1400);
  }

  private fail(after: () => void) {
    this.mistakes++;
    this.beep(false);
    this.shake.set(true);
    setTimeout(() => this.shake.set(false), 500);
    after();
  }

  private nextQ() {
    if (this.qi() < this.qs().length - 1) {
      this.qi.update((i) => i + 1);
      this.resetQ();
    } else this.finish();
  }

  private finish() {
    const s = this.mistakes === 0 ? 3 : this.mistakes <= 3 ? 2 : 1;
    this.earned.set(s);
    this.stars.update((a) => {
      const n = [...a];
      n[this.idx()] = Math.max(n[this.idx()] || 0, s);
      localStorage.setItem(KEY, JSON.stringify(n));
      return n;
    });
    this.phase.set('done');
    this.say('Well done!');
  }

  say(text: string) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.8;
    speechSynthesis.speak(u);
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
