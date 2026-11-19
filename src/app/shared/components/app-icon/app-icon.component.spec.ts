import { TestBed } from '@angular/core/testing';
import { AppIconComponent } from './app-icon.component';

describe('AppIconComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppIconComponent]
    }).compileComponents();
  });

  it('should create the icon component', () => {
    const fixture = TestBed.createComponent(AppIconComponent);
    fixture.componentRef.setInput('name', 'globe');
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the target placement icon with concentric circles and an arrow hitting the center', () => {
    const fixture = TestBed.createComponent(AppIconComponent);
    fixture.componentRef.setInput('name', 'target');
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('circle').length).toBeGreaterThanOrEqual(3);
    expect(el.querySelector('path')).toBeTruthy();
    expect(el.querySelectorAll('polyline').length).toBeGreaterThanOrEqual(2);
  });
});
