import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CelebrationModalComponent } from './celebration-modal.component';

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
  });

  it('should scale ribbons density based on rank/score', () => {
    // When open with 90% score, ribbon count should be high (58)
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('score', 19);
    fixture.componentRef.setInput('totalScore', 20);
    fixture.detectChanges();

    expect(component.ribbons().length).toBe(58);

    // When score is lower, ribbon count should diminish
    fixture.componentRef.setInput('score', 8);
    fixture.componentRef.setInput('totalScore', 20);
    fixture.detectChanges();

    // Re-trigger open to regenerate ribbons
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    expect(component.ribbons().length).toBe(12);
  });

  it('should emit closed, returned, and reviewAnswers events', () => {
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
