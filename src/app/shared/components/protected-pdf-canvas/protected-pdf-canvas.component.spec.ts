import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ProtectedPdfCanvasComponent } from './protected-pdf-canvas.component';

describe('ProtectedPdfCanvasComponent', () => {
  let component: ProtectedPdfCanvasComponent;
  let fixture: ComponentFixture<ProtectedPdfCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProtectedPdfCanvasComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProtectedPdfCanvasComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('lectureId', 'lec_123');
    fixture.componentRef.setInput('fileId', 'pdf_456');
    fixture.detectChanges();
  });

  it('should create the ProtectedPdfCanvasComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should adjust zoom scale on zoomIn and zoomOut', () => {
    const initial = component.zoomScale();
    component.zoomIn();
    expect(component.zoomScale()).toBe(initial + 0.25);
    component.zoomOut();
    expect(component.zoomScale()).toBe(initial);
  });
});
