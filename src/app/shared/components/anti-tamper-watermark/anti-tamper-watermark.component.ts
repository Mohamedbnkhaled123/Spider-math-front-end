import {
  Component,
  ChangeDetectionStrategy,
  signal,
  input,
  output,
  inject,
  ElementRef,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  viewChild
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { ITamperEvent, IWatermarkPosition } from './anti-tamper-watermark.models';

@Component({
  selector: 'app-anti-tamper-watermark',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './anti-tamper-watermark.component.html',
  styleUrl: './anti-tamper-watermark.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AntiTamperWatermarkComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly el = inject(ElementRef);

  // Inputs
  readonly watermarkText = input.required<string>();
  readonly intervalSeconds = input<number>(7);

  // Outputs
  readonly tamperDetected = output<ITamperEvent>();

  // Viewchild
  readonly floatingPill = viewChild<ElementRef<HTMLElement>>('floatingPill');

  // Signals
  readonly position = signal<IWatermarkPosition>({
    top: '25%',
    left: '35%',
    rotate: '-15deg'
  });

  private mutationObserver: MutationObserver | null = null;
  private intervalTimer: ReturnType<typeof setInterval> | null = null;
  private isSelfHealing = false;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.startPositionRandomizer();
    this.setupMutationObserver();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private startPositionRandomizer(): void {
    const ms = Math.max(3, this.intervalSeconds()) * 1000;
    this.intervalTimer = setInterval(() => {
      this.randomizePosition();
    }, ms);
  }

  private randomizePosition(): void {
    // Generate random coordinates between 10% and 80% to keep watermark well within the player canvas
    const top = Math.floor(Math.random() * 70 + 10) + '%';
    const left = Math.floor(Math.random() * 70 + 10) + '%';
    const rotate = (Math.floor(Math.random() * 30) - 15) + 'deg';

    this.position.set({ top, left, rotate });
  }

  private setupMutationObserver(): void {
    const hostEl: HTMLElement = this.el.nativeElement;

    this.mutationObserver = new MutationObserver(mutations => {
      if (this.isSelfHealing) return;

      for (const mutation of mutations) {
        let isTampered = false;
        let reason = '';

        if (mutation.type === 'attributes') {
          const target = mutation.target as HTMLElement;
          const style = window.getComputedStyle(target);

          if (
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            parseFloat(style.opacity || '1') < 0.05
          ) {
            isTampered = true;
            reason = 'Watermark hidden or opacity reduced via DevTools';
          }
        } else if (mutation.type === 'childList') {
          if (mutation.removedNodes.length > 0) {
            isTampered = true;
            reason = 'Watermark element deleted from DOM tree';
          }
        }

        if (isTampered) {
          this.tamperDetected.emit({
            reason,
            timestamp: Date.now(),
            mutationType: mutation.type
          });

          this.selfHeal(hostEl);
          break;
        }
      }
    });

    this.mutationObserver.observe(hostEl, {
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden', 'id'],
      childList: true,
      subtree: true
    });
  }

  private selfHeal(hostEl: HTMLElement): void {
    this.isSelfHealing = true;
    try {
      // Force element visibility and restore display state
      hostEl.style.display = 'block';
      hostEl.style.visibility = 'visible';
      hostEl.style.opacity = '1';
      hostEl.removeAttribute('hidden');

      // Randomize position immediately
      this.randomizePosition();
    } finally {
      setTimeout(() => {
        this.isSelfHealing = false;
      }, 50);
    }
  }

  private cleanup(): void {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
  }
}
