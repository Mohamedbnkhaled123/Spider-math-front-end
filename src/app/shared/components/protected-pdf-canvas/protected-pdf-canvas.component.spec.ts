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
    expect(component.scale()).toBe(initial);
    component.zoomIn();
    expect(component.zoomScale()).toBe(initial + 0.25);
    expect(component.scale()).toBe(initial + 0.25);
    component.zoomOut();
    expect(component.zoomScale()).toBe(initial);
    expect(component.scale()).toBe(initial);
  });

  it('should enforce dir="ltr" on canvas and wrapper containers', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('.pdf-canvas-container') as HTMLElement;
    const sheet = compiled.querySelector('.canvas-sheet') as HTMLElement;
    const canvas = compiled.querySelector('canvas') as HTMLCanvasElement;

    expect(container.getAttribute('dir')).toBe('ltr');
    expect(sheet.getAttribute('dir')).toBe('ltr');
    expect(canvas.getAttribute('dir')).toBe('ltr');
  });

  it('should reset zoom to 1.25 on resetZoom', () => {
    component.zoomIn();
    component.zoomIn();
    expect(component.scale()).toBe(1.75);
    component.resetZoom();
    expect(component.scale()).toBe(1.25);
  });
});
