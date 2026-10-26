import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { InteractiveGradingStudioComponent } from './interactive-grading-studio.component';

describe('InteractiveGradingStudioComponent', () => {
  let component: InteractiveGradingStudioComponent;
  let fixture: ComponentFixture<InteractiveGradingStudioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InteractiveGradingStudioComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InteractiveGradingStudioComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('pendingSubmissions', []);
    fixture.detectChanges();
  });

  it('should create interactive grading studio component', () => {
    expect(component).toBeTruthy();
  });

  it('should adjust zoom levels appropriately', () => {
    expect(component.canvasZoom()).toBe(1);
    component.zoomIn();
    expect(component.canvasZoom()).toBe(1.25);
    component.zoomOut();
    expect(component.canvasZoom()).toBe(1);
  });

  it('should rotate canvas by 90 degrees intervals', () => {
    expect(component.canvasRotation()).toBe(0);
    component.rotateCanvas();
    expect(component.canvasRotation()).toBe(90);
    component.rotateCanvas();
    expect(component.canvasRotation()).toBe(180);
  });
});
