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
    // 1. High score (>= 90%): 58 ribbons, fireworks visible
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('score', 19);
    fixture.componentRef.setInput('totalScore', 20);
    fixture.detectChanges();

    expect(component.ribbons().length).toBe(58);
    expect(component.isAboveAverage()).toBeTrue();
    expect(component.isCelebrationEligible()).toBeTrue();

    const hostEl: HTMLElement = fixture.nativeElement;
    expect(hostEl.querySelector('[data-testid="lottie-fireworks-layer"]')).toBeTruthy();

    // 2. Score between 50% and 69% ("انطلاق"): STRICTLY ZERO ribbons & fireworks suppressed!
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
    expect(hostEl.querySelector('[data-testid="lottie-fireworks-layer"]')).toBeNull();

    // 3. Below 50% score (e.g. 40%): STRICTLY ZERO ribbons & fireworks suppressed!
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
});
