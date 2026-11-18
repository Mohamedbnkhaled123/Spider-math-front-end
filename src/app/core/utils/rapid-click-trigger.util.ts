/**
 * Detects rapid multi-click sequences (e.g. 5 taps on footer logo, 12 taps on nav logo)
 * while debouncing single-click navigation/scrolling so multi-taps do not jump away mid-gesture.
 */
export class RapidClickTracker {
  private count = 0;
  private lastClickAt = 0;
  private singleClickTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly threshold: number,
    private readonly maxGapMs = 1200,
    private readonly singleClickDelayMs = 300
  ) {}

  /**
   * Records a click event. Invokes `onThresholdReached` when exact rapid clicks reach `threshold`,
   * or schedules `onSingleClick` if a single isolated click is not followed by another within `singleClickDelayMs`.
   */
  handleClick(
    event: Event | undefined,
    onThresholdReached: () => void,
    onSingleClick?: () => void
  ): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      (event as unknown as { stopImmediatePropagation?: () => void }).stopImmediatePropagation?.();
    }
    const now = Date.now();

    if (this.lastClickAt > 0 && now - this.lastClickAt > this.maxGapMs) {
      this.count = 0;
    }

    if (this.singleClickTimer !== null) {
      clearTimeout(this.singleClickTimer);
      this.singleClickTimer = null;
    }

    this.count += 1;
    this.lastClickAt = now;

    if (this.count >= this.threshold) {
      this.reset();
      onThresholdReached();
      return;
    }

    if (this.count === 1 && onSingleClick) {
      this.singleClickTimer = setTimeout(() => {
        this.singleClickTimer = null;
        if (this.count === 1) {
          this.reset();
          onSingleClick();
        }
      }, this.singleClickDelayMs);
    }
  }

  reset(): void {
    this.count = 0;
    this.lastClickAt = 0;
    if (this.singleClickTimer !== null) {
      clearTimeout(this.singleClickTimer);
      this.singleClickTimer = null;
    }
  }
}
