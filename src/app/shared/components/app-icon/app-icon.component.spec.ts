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
});
