import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CelebrationModalComponent } from './celebration-modal.component';
import {
  CELEBRATION_PHRASES_PERFECT,
  CELEBRATION_PHRASES_CLOSE,
  CELEBRATION_PHRASES_BELOW_70
} from './celebration-messages.data';

describe('CelebrationModalComponent', () => {
  let component: CelebrationModalComponent;
  let fixture: ComponentFixture<CelebrationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CelebrationModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CelebrationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create celebration modal component', () => {
    expect(component).toBeTruthy();
  });

  it('should compute 3 stars for >= 90% score', () => {
    fixture.componentRef.setInput('score', 18);
    fixture.componentRef.setInput('totalScore', 20);
    fixture.detectChanges();

    expect(component.computedPercentage()).toBe(90);
    expect(component.computedStarsCount()).toBe(3);
    expect(component.computedRank()).toBe(1);
    expect(component.computedRankTitle()).toContain('الأول');
  });

  it('should compute 2 stars for 70-89% score', () => {
    fixture.componentRef.setInput('score', 15);
    fixture.componentRef.setInput('totalScore', 20);
    fixture.detectChanges();

    expect(component.computedPercentage()).toBe(75);
    expect(component.computedStarsCount()).toBe(2);
    expect(component.computedRank()).toBe(2);
    expect(component.computedRankTitle()).toContain('الثاني');
  });

  it('should compute 1 star for < 70% score', () => {
    fixture.componentRef.setInput('score', 10);
    fixture.componentRef.setInput('totalScore', 20);
    fixture.detectChanges();

    expect(component.computedPercentage()).toBe(50);
    expect(component.computedStarsCount()).toBe(1);
    expect(component.computedRankTitle()).toContain('الانطلاق');
  });

  it('should scale ribbons and fireworks for >= 70% and strictly hide for scores < 70% (including 50%-69%)', () => {
    // 1. Tier 1: Maximum intensity (>= 95%): 65 ribbons, fireworks visible
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('score', 20); // 100%
    fixture.componentRef.setInput('totalScore', 20);
    fixture.detectChanges();

    expect(component.ribbons().length).toBe(65);
    expect(component.isAboveAverage()).toBeTrue();
    expect(component.isCelebrationEligible()).toBeTrue();

    const hostEl: HTMLElement = fixture.nativeElement;
    expect(hostEl.querySelector('[data-testid="lottie-fireworks-layer"]')).toBeTruthy();

    // 1b. Tier 2: High intensity (85% - 94%): 40 ribbons
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    fixture.componentRef.setInput('score', 18); // 90%
    fixture.componentRef.setInput('totalScore', 20);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    expect(component.ribbons().length).toBe(40);
    expect(component.isCelebrationEligible()).toBeTrue();

    // 1c. Tier 3: Moderate intensity (70% - 84%): 20 ribbons
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    fixture.componentRef.setInput('score', 15); // 75%
    fixture.componentRef.setInput('totalScore', 20);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    expect(component.ribbons().length).toBe(20);
    expect(component.isCelebrationEligible()).toBeTrue();

    // 2. Score between 50% and 69% ("انطلاق"): STRICTLY ZERO ribbons & celebration modal not rendered!
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    fixture.componentRef.setInput('score', 12); // 60%
    fixture.componentRef.setInput('totalScore', 20);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    expect(component.computedPercentage()).toBe(60);
    expect(component.isAboveAverage()).toBeFalse();
    expect(component.isCelebrationEligible()).toBeFalse();
    expect(component.ribbons().length).toBe(0);
    expect(hostEl.querySelector('.celebration-backdrop')).toBeNull();
    expect(hostEl.querySelector('[data-testid="lottie-fireworks-layer"]')).toBeNull();

    // 3. Below 50% score (e.g. 40%): STRICTLY ZERO ribbons & celebration modal not rendered!
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    fixture.componentRef.setInput('score', 8); // 40%
    fixture.componentRef.setInput('totalScore', 20);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    expect(component.computedPercentage()).toBe(40);
    expect(component.isAboveAverage()).toBeFalse();
    expect(component.isCelebrationEligible()).toBeFalse();
    expect(component.ribbons().length).toBe(0);
    expect(hostEl.querySelector('.celebration-backdrop')).toBeNull();
    expect(hostEl.querySelector('[data-testid="lottie-fireworks-layer"]')).toBeNull();
  });

  it('should select random motivating phrases matching score category', () => {
    // Category 1: 100% Perfect Score
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    fixture.componentRef.setInput('score', 20);
    fixture.componentRef.setInput('totalScore', 20);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const perfectMessage = component.computedMessage();
    expect(CELEBRATION_PHRASES_PERFECT.ar).toContain(perfectMessage);

    // Category 2: 70% - 99%
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    fixture.componentRef.setInput('score', 16); // 80%
    fixture.componentRef.setInput('totalScore', 20);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const closeMessage = component.computedMessage();
    expect(CELEBRATION_PHRASES_CLOSE.ar).toContain(closeMessage);

    // Category 3: < 70%
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    fixture.componentRef.setInput('score', 10); // 50%
    fixture.componentRef.setInput('totalScore', 20);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const below70Message = component.computedMessage();
    expect(CELEBRATION_PHRASES_BELOW_70.ar).toContain(below70Message);
  });

  it('should strictly contain zero Unicode emojis in titles, badges, and messages', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('score', 20);
    fixture.componentRef.setInput('totalScore', 20);
    fixture.detectChanges();

    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
    expect(emojiRegex.test(component.computedRankTitle())).toBeFalse();
    expect(emojiRegex.test(component.computedMessage())).toBeFalse();
    expect(emojiRegex.test(fixture.nativeElement.innerHTML)).toBeFalse();
  });

  it('should emit closed, returned, and reviewAnswers events and stop sound', () => {
    let closedCalled = false;
    let returnedCalled = false;
    let reviewCalled = false;

    component.closed.subscribe(() => (closedCalled = true));
    component.returned.subscribe(() => (returnedCalled = true));
    component.reviewAnswers.subscribe(() => (reviewCalled = true));

    component.onClose();
    expect(closedCalled).toBe(true);

    component.onReturn();
    expect(returnedCalled).toBe(true);

    component.onReviewAnswers();
    expect(reviewCalled).toBe(true);
  });

  describe('Navbar Clearance and Layering Contract', () => {
    it('should layer celebration backdrop below sticky header and render skip button cleanly', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('score', 20);
      fixture.componentRef.setInput('totalScore', 20);
      fixture.detectChanges();

      const backdrop: HTMLElement | null = fixture.nativeElement.querySelector('.celebration-backdrop');
      expect(backdrop).toBeTruthy();

      const skipBtn: HTMLButtonElement | null = fixture.nativeElement.querySelector('.skip-btn');
      expect(skipBtn).toBeTruthy();

      let skipTriggered = false;
      component.closed.subscribe(() => (skipTriggered = true));
      skipBtn?.click();
      expect(skipTriggered).toBeTrue();
    });
  });

  describe('Low Score (< 70%) Celebration Suppression and XP Line Removal', () => {
    it('should strictly remove the progress line/bar under experience points (XP)', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('score', 20);
      fixture.componentRef.setInput('totalScore', 20);
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      const xpChip = hostEl.querySelector('.chip.c3.xp');
      expect(xpChip).toBeTruthy();

      // Ensure the unwanted horizontal line (.bar) is completely removed from the DOM
      const barElem = hostEl.querySelector('.chip.c3.xp .bar');
      expect(barElem).toBeNull();
      const anyBarElem = hostEl.querySelector('.chip .bar');
      expect(anyBarElem).toBeNull();
    });

    it('should accurately calculate percentage for 5 / 15 as 33% and strictly suppress celebration', () => {
      fixture.componentRef.setInput('score', 5);
      fixture.componentRef.setInput('totalScore', 15);
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      expect(component.computedPercentage()).toBe(33);
      expect(component.isCelebrationEligible()).toBeFalse();
      expect(component.isAboveAverage()).toBeFalse();
      expect(component.computedRank()).toBeNull();
      expect(component.computedRankTitle()).toBe('محاولة تدريبية');
      expect(component.ribbons().length).toBe(0);

      const hostEl: HTMLElement = fixture.nativeElement;
      expect(hostEl.querySelector('.celebration-backdrop')).toBeNull();
      expect(hostEl.querySelector('[data-testid="lottie-fireworks-layer"]')).toBeNull();
    });

    it('should ignore forced Rank 1 inputs if computed score is below 70%', () => {
      fixture.componentRef.setInput('score', 5);
      fixture.componentRef.setInput('totalScore', 15);
      fixture.componentRef.setInput('rank', 1);
      fixture.componentRef.setInput('rankTitle', 'المركز الأول • العلامة الكاملة');
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      expect(component.computedPercentage()).toBe(33);
      expect(component.computedRank()).toBeNull();
      expect(component.computedRankTitle()).toBe('محاولة تدريبية');
      expect(component.isCelebrationEligible()).toBeFalse();
      expect(fixture.nativeElement.querySelector('.celebration-backdrop')).toBeNull();
    });

    it('should strictly override a forced 100% percentage input when score is 5 / 15 (33%)', () => {
      fixture.componentRef.setInput('score', 5);
      fixture.componentRef.setInput('totalScore', 15);
      fixture.componentRef.setInput('percentage', 100);
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      // Mathematically verified ratio (33%) must override fraudulent 100% input
      expect(component.computedPercentage()).toBe(33);
      expect(component.isCelebrationEligible()).toBeFalse();
      expect(fixture.nativeElement.querySelector('.celebration-backdrop')).toBeNull();
    });

    it('should reserve "المركز الأول • العلامة الكاملة" strictly for 100% and not for 90%', () => {
      fixture.componentRef.setInput('score', 18);
      fixture.componentRef.setInput('totalScore', 20); // 90%
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      expect(component.computedPercentage()).toBe(90);
      expect(component.isCelebrationEligible()).toBeTrue();
      expect(component.computedRank()).toBe(1);
      expect(component.computedRankTitle()).toBe('المركز الأول • تفوق باهر');
      expect(component.computedRankTitle()).not.toContain('العلامة الكاملة');

      // Now set to true 100%
      fixture.componentRef.setInput('score', 20);
      fixture.detectChanges();
      expect(component.computedPercentage()).toBe(100);
      expect(component.computedRankTitle()).toBe('المركز الأول • العلامة الكاملة');
    });

    it('should suppress custom rank titles claiming "العلامة الكاملة" if score is less than 100%', () => {
      fixture.componentRef.setInput('score', 16);
      fixture.componentRef.setInput('totalScore', 20); // 80%
      fixture.componentRef.setInput('rankTitle', 'المركز الأول • العلامة الكاملة');
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      expect(component.computedPercentage()).toBe(80);
      // Falsely passed "العلامة الكاملة" is stripped
      expect(component.computedRankTitle()).not.toContain('العلامة الكاملة');
      expect(component.computedRankTitle()).toBe('المركز الثاني • أداء متميز');
    });

    it('should scale student name font size proportionally and render the full name cleanly', () => {
      fixture.componentRef.setInput('score', 20);
      fixture.componentRef.setInput('totalScore', 20);
      fixture.componentRef.setInput('studentName', 'المهندسة / هبة عبدالوهاب');
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      expect(component.nameFontSize()).toBe('3.4cqw');
      const nameEl: HTMLElement | null = fixture.nativeElement.querySelector('#celebration-student-name');
      expect(nameEl).toBeTruthy();
      expect(nameEl?.textContent?.trim()).toBe('المهندسة / هبة عبدالوهاب');
      expect(nameEl?.style.fontSize).toBe('3.4cqw');

      fixture.componentRef.setInput('studentName', 'طالب متميز');
      fixture.detectChanges();
      expect(component.nameFontSize()).toBe('4.6cqw');

      fixture.componentRef.setInput('studentName', 'أحمد محمد محمود إبراهيم عبد الرحمن');
      fixture.detectChanges();
      expect(component.nameFontSize()).toBe('2.9cqw');

      fixture.componentRef.setInput('studentName', 'أحمد محمد محمود إبراهيم عبد الرحمن الشافعي');
      fixture.detectChanges();
      expect(component.nameFontSize()).toBe('2.5cqw');
    });
  });
});
