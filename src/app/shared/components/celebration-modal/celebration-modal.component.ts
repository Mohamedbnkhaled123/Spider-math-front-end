import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  input,
  output,
  effect,
  inject,
  PLATFORM_ID,
  OnDestroy,
  ElementRef,
  viewChild
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import confetti from 'canvas-confetti';
import lottie, { AnimationItem } from 'lottie-web';
import { CELEBRATION_FIREWORKS_DATA } from './success-celebration.data';

export interface RibbonItem {
  id: number;
  left: string;
  width: string;
  height: string;
  background: string;
  duration: string;
  delay: string;
  transform: string;
}

const RIBBON_GRADIENTS = [
  'linear-gradient(180deg, #ffe27a, #d89a00)', // Gold
  'linear-gradient(180deg, #34d399, #059669)', // Emerald
  'linear-gradient(180deg, #38bdf8, #0284c7)', // Cyan
  'linear-gradient(180deg, #c084fc, #7c3aed)', // Purple
  'linear-gradient(180deg, #fb7185, #e11d48)', // Ruby/Coral
  'linear-gradient(180deg, #fb923c, #ea580c)', // Sunset orange
  'linear-gradient(180deg, #67e8f9, #0891b2)', // Deep Sky
  'linear-gradient(180deg, #fde047, #ca8a04)', // Sun yellow
  'linear-gradient(180deg, #f472b6, #db2777)', // Hot pink
  'linear-gradient(180deg, #ffffff, #cbd5e1)'  // Silver sheen
];

@Component({
  selector: 'app-celebration-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './celebration-modal.component.html',
  styleUrls: ['./celebration-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CelebrationModalComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Inputs
  readonly isOpen = input<boolean>(false);
  readonly studentName = input<string>('طالب متميز');
  readonly score = input<number>(0);
  readonly totalScore = input<number>(20);
  readonly percentage = input<number | undefined>(undefined);
  readonly rank = input<1 | 2 | 3 | null>(null);
  readonly rankTitle = input<string | undefined>(undefined);
  readonly message = input<string | undefined>(undefined);
  readonly xpEarned = input<number>(100);
  readonly isLevelUp = input<boolean | undefined>(undefined);
  readonly returnUrl = input<string>('/student');
  readonly returnLabel = input<string>('متابعة');
  readonly reviewLabel = input<string>('شوف الإجابات');
  readonly showReviewButton = input<boolean>(true);

  // Outputs
  readonly closed = output<void>();
  readonly returned = output<void>();
  readonly reviewAnswers = output<void>();

  // Template Element References
  readonly lottieFireworksContainer = viewChild<ElementRef<HTMLElement>>('lottieFireworksContainer');
  private lottieAnim: AnimationItem | null = null;

  // State Signals
  readonly isAnimationActive = signal<boolean>(false);
  readonly displayedScore = signal<string>('0/20');
  readonly displayedPercentage = signal<string>('0%');
  readonly displayedXp = signal<string>('+0 XP');
  readonly xpProgressPercent = signal<string>('0%');
  readonly isLevelUpVisible = signal<boolean>(false);

  readonly starStates = signal<Array<{ on: boolean; lit: boolean }>>([
    { on: false, lit: false },
    { on: false, lit: false },
    { on: false, lit: false }
  ]);

  readonly ribbons = signal<RibbonItem[]>([]);

  private activeTimers: any[] = [];
  private activeIntervals: any[] = [];
  private activeAnimFrames: number[] = [];

  // Computed Values
  readonly computedPercentage = computed<number>(() => {
    const custom = this.percentage();
    if (custom !== undefined && custom !== null && !isNaN(custom)) {
      return Math.min(100, Math.max(0, Math.round(custom)));
    }
    const tot = Math.max(1, this.totalScore());
    return Math.min(100, Math.max(0, Math.round((this.score() / tot) * 100)));
  });

  readonly isAboveAverage = computed<boolean>(() => {
    return this.computedPercentage() >= 50;
  });

  readonly computedRank = computed<1 | 2 | 3 | null>(() => {
    const r = this.rank();
    if (r === 1 || r === 2 || r === 3) return r;
    const pct = this.computedPercentage();
    if (pct >= 90) return 1;
    if (pct >= 75) return 2;
    if (pct >= 60) return 3;
    return null;
  });

  readonly computedStarsCount = computed<number>(() => {
    const pct = this.computedPercentage();
    if (pct >= 90) return 3;
    if (pct >= 70) return 2;
    return 1;
  });

  readonly computedRankTitle = computed<string>(() => {
    const custom = this.rankTitle();
    if (custom) return custom;
    const r = this.computedRank();
    if (r === 1) return 'المركز الأول • العلامة الكاملة';
    if (r === 2) return 'المركز الثاني • أداء متميز';
    if (r === 3) return 'المركز الثالث • نتيجة رائعة';
    const pct = this.computedPercentage();
    if (pct >= 85) return 'أداء متفوق';
    if (pct >= 50) return 'نتيجة معتمدة';
    return 'محاولة تدريبية';
  });

  readonly computedMessage = computed<string>(() => {
    const custom = this.message();
    if (custom) return custom;
    const r = this.computedRank();
    if (r === 1) return 'أداء استثنائي! كمّل بنفس الحماس والتميز';
    if (r === 2) return 'شغل ممتاز! خطوة واحدة وتصل للقمة';
    if (r === 3) return 'أحسنت صنعاً! استمر في التقدم والتفوق';
    const pct = this.computedPercentage();
    if (pct >= 85) return 'مستوى مبهر، استمر في الصعود والتألق';
    if (pct >= 50) return 'جهد رائع، راجع الإجابات لتعزيز الفهم';
    return 'استمر في الممارسة والتدريب للوصول لأعلى المراتب';
  });

  constructor() {
    effect(() => {
      const open = this.isOpen();
      if (open) {
        if (this.isBrowser) {
          // Play celebration sequence
          this.playCelebration();
        }
      } else {
        this.clearAnimationState();
      }
    });
  }

  ngOnDestroy(): void {
    this.clearAnimationState();
  }

  private clearAnimationState(): void {
    this.activeTimers.forEach(t => clearTimeout(t));
    this.activeTimers = [];
    this.activeIntervals.forEach(i => clearInterval(i));
    this.activeIntervals = [];

    if (this.isBrowser) {
      this.activeAnimFrames.forEach(f => cancelAnimationFrame(f));
      this.activeAnimFrames = [];
      try {
        confetti.reset();
      } catch {}
    }

    if (this.lottieAnim) {
      try {
        this.lottieAnim.destroy();
      } catch {}
      this.lottieAnim = null;
    }

    this.isAnimationActive.set(false);
  }

  private playCelebration(): void {
    this.clearAnimationState();

    const g = Math.max(0, this.score());
    const tot = Math.max(1, this.totalScore());
    const pct = this.computedPercentage();
    const xp = Math.max(0, this.xpEarned());
    const starsCount = this.computedStarsCount();
    const rank = this.computedRank();

    // Reset initial counter texts
    this.displayedScore.set(`0/${tot}`);
    this.displayedPercentage.set('0%');
    this.displayedXp.set('+0 XP');
    this.xpProgressPercent.set(`${xp % 100 || (xp ? 100 : 0)}%`);

    // Level up check
    const levelUp = this.isLevelUp() !== undefined ? !!this.isLevelUp() : xp >= 100;
    this.isLevelUpVisible.set(levelUp);

    // Setup stars
    this.starStates.set([
      { on: starsCount >= 1, lit: false },
      { on: starsCount >= 2, lit: false },
      { on: starsCount >= 3, lit: false }
    ]);

    // Schedule star twinkle after pop
    for (let i = 0; i < starsCount; i++) {
      const timer = setTimeout(() => {
        this.starStates.update(list => {
          const updated = [...list];
          if (updated[i]) {
            updated[i] = { ...updated[i], lit: true };
          }
          return updated;
        });
      }, 1600 + i * 350 + 700);
      this.activeTimers.push(timer);
    }

    // Generate ribbons density scaled by score & rank:
    // Strictly ZERO ribbons if below average (< 50%)
    if (pct < 50) {
      this.ribbons.set([]);
    } else {
      let ribbonCount = 20;
      if (rank === 1 || pct >= 90) {
        ribbonCount = 58; // High density for top achievers
      } else if (rank === 2 || pct >= 75) {
        ribbonCount = 38; // Medium-high density
      } else if (rank === 3 || pct >= 60) {
        ribbonCount = 22; // Medium density
      } else {
        ribbonCount = 12; // Diminished density for average scores
      }

      const generatedRibbons: RibbonItem[] = [];
      for (let i = 0; i < ribbonCount; i++) {
        const colorGrad = RIBBON_GRADIENTS[i % RIBBON_GRADIENTS.length];
        const left = `${Math.random() * 96 + 2}%`;
        const width = `${(1.6 + Math.random() * 1.0).toFixed(2)}cqw`;
        const height = `${(4.8 + Math.random() * 3.8).toFixed(2)}cqw`;
        const duration = `${(3.2 + Math.random() * 3.2).toFixed(2)}s`;
        const delay = `${(Math.random() * 4.2).toFixed(2)}s`;
        const transform = `rotate(${Math.round(Math.random() * 180)}deg)`;

        generatedRibbons.push({
          id: i,
          left,
          width,
          height,
          background: colorGrad,
          duration,
          delay,
          transform
        });
      }
      this.ribbons.set(generatedRibbons);
    }

    // Trigger stage animation
    setTimeout(() => {
      this.isAnimationActive.set(true);
    }, 20);

    // Number counters tick up smoothly starting at 3000ms
    this.animateCounter(3000, 2200, p => {
      const curr = Math.round(g * p);
      this.displayedScore.set(`${curr}/${tot}`);
    });

    this.animateCounter(3000, 3000, p => {
      const currPct = Math.round(pct * p);
      this.displayedPercentage.set(`${currPct}%`);
    });

    this.animateCounter(3000, 2600, p => {
      const currXp = Math.round(xp * p);
      this.displayedXp.set(`+${currXp} XP`);
    });

    // Trigger canvas-confetti showers strictly for students >= 50%
    this.triggerConfetti(pct, rank);

    // Initialize Lottie fireworks animation (Farhan Razak)
    if (this.isAboveAverage()) {
      this.initLottieFireworks();
    }
  }

  private initLottieFireworks(): void {
    if (!this.isBrowser) return;

    if (this.lottieAnim) {
      try {
        this.lottieAnim.destroy();
      } catch {}
      this.lottieAnim = null;
    }

    // Attempt to mount Lottie into container
    const tryMount = () => {
      const containerRef = this.lottieFireworksContainer();
      if (!containerRef?.nativeElement) return false;

      try {
        this.lottieAnim = lottie.loadAnimation({
          container: containerRef.nativeElement,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData: CELEBRATION_FIREWORKS_DATA as any
        });
        return true;
      } catch (err) {
        console.warn('Lottie fireworks init error:', err);
        return false;
      }
    };

    if (!tryMount()) {
      const timer = setTimeout(() => {
        tryMount();
      }, 60);
      this.activeTimers.push(timer);
    }
  }

  private triggerConfetti(pct: number, rank: 1 | 2 | 3 | null): void {
    if (!this.isBrowser) return;

    // "و القصاصات متظهرش للي جايبين اقل من المتوسط"
    // Average threshold is 50%. Below 50%: STRICTLY NO CONFETTI!
    if (pct < 50) return;

    try {
      if (pct >= 85 || rank === 1 || rank === 2) {
        // High Achievers / Rank 1 & 2: Massive celebration burst + dual side cannons!
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.55 },
          colors: ['#ffe27a', '#ffd23f', '#e11d48', '#38bdf8', '#c084fc', '#34d399', '#ffffff'],
          zIndex: 2100
        });

        // Continuous celebratory cannons
        const end = Date.now() + 2600;
        const interval = setInterval(() => {
          if (Date.now() > end) {
            clearInterval(interval);
            return;
          }
          confetti({
            particleCount: 35,
            angle: 60,
            spread: 55,
            origin: { x: 0.05, y: 0.7 },
            colors: ['#ffe27a', '#ffd23f', '#c084fc', '#38bdf8'],
            zIndex: 2100
          });
          confetti({
            particleCount: 35,
            angle: 120,
            spread: 55,
            origin: { x: 0.95, y: 0.7 },
            colors: ['#ffe27a', '#ffd23f', '#fb7185', '#34d399'],
            zIndex: 2100
          });
        }, 350);
        this.activeIntervals.push(interval);
      } else if (pct >= 70 || rank === 3) {
        // Very Good / Rank 3: Medium-high density shower
        confetti({
          particleCount: 80,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#ffe27a', '#d89a00', '#34d399', '#38bdf8', '#c084fc'],
          zIndex: 2100
        });
      } else {
        // Average (50% - 69%): Gentle celebratory burst
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#ffe27a', '#34d399', '#38bdf8'],
          zIndex: 2100
        });
      }
    } catch (err) {
      console.warn('Canvas confetti error:', err);
    }
  }

  private animateCounter(delayMs: number, durationMs: number, onTick: (progress: number) => void): void {
    if (!this.isBrowser) return;

    const startTimer = setTimeout(() => {
      const t0 = performance.now();
      const tick = () => {
        const elapsed = performance.now() - t0;
        const linear = Math.min(1, Math.max(0, elapsed / durationMs));
        // Quadratic ease in-out curve
        const eased = linear < 0.5 ? 2 * linear * linear : 1 - Math.pow(-2 * linear + 2, 2) / 2;
        onTick(eased);
        if (linear < 1) {
          const frameId = requestAnimationFrame(tick);
          this.activeAnimFrames.push(frameId);
        }
      };
      const initialFrame = requestAnimationFrame(tick);
      this.activeAnimFrames.push(initialFrame);
    }, delayMs);

    this.activeTimers.push(startTimer);
  }

  onClose(): void {
    this.clearAnimationState();
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    // Backdrop click dismisses
    this.onClose();
  }

  onReturn(): void {
    this.clearAnimationState();
    this.returned.emit();
  }

  onReviewAnswers(): void {
    this.clearAnimationState();
    this.reviewAnswers.emit();
  }
}
