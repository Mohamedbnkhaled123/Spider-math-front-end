import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { PdfPageViewerComponent } from './pdf-page-viewer.component';

describe('PdfPageViewerComponent', () => {
  let component: PdfPageViewerComponent;
  let fixture: ComponentFixture<PdfPageViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfPageViewerComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PdfPageViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the PDF page viewer component with default state', () => {
    expect(component).toBeTruthy();
    expect(component.currentPage()).toBe(1);
    expect(component.zoomFactor()).toBe(1.0);
    expect(component.scale()).toBe(2.0);
  });

  it('should clamp zoom factor between 0.5 and 2.5', () => {
    component.zoomIn();
    expect(component.zoomFactor()).toBe(1.25);

    // Zoom out multiple times
    component.zoomOut();
    component.zoomOut();
    component.zoomOut();
    expect(component.zoomFactor()).toBe(0.5);

    component.zoomOut(); // Should not go below 0.5
    expect(component.zoomFactor()).toBe(0.5);

    component.resetZoom();
    expect(component.zoomFactor()).toBe(1.0);
  });

  it('should not navigate to page beyond totalPages or below 1', () => {
    // Total pages is 0 initially
    component.prevPage();
    expect(component.currentPage()).toBe(1);

    component.nextPage();
    expect(component.currentPage()).toBe(1);
  });

  it('should navigate correctly when totalPages is set', () => {
    component.totalPages.set(5);

    component.goToPage(3);
    expect(component.currentPage()).toBe(3);

    component.nextPage();
    expect(component.currentPage()).toBe(4);

    component.prevPage();
    expect(component.currentPage()).toBe(3);

    // Clamps to 5
    component.goToPage(10);
    expect(component.currentPage()).toBe(5);

    // Clamps to 1
    component.goToPage(0);
    expect(component.currentPage()).toBe(1);
  });

  it('should set errorMessage and emit errorOccurred when document fails to load', async () => {
    let emittedError: string | null = null;
    component.errorOccurred.subscribe((err) => {
      emittedError = err;
    });

    // Provide invalid ArrayBuffer
    const corruptedData = new ArrayBuffer(8);
    await component.loadDocument(corruptedData);

    expect(component.errorMessage()).toBeTruthy();
    expect(emittedError).toBeTruthy();
    expect(component.isLoading()).toBe(false);
  });

  it('should enforce dir="ltr" on canvas viewport, wrapper, and main canvas', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const viewport = compiled.querySelector('.viewer-canvas-viewport') as HTMLElement;
    const wrapper = compiled.querySelector('.canvas-wrapper') as HTMLElement;
    const canvas = compiled.querySelector('canvas') as HTMLCanvasElement;

    expect(viewport.getAttribute('dir')).toBe('ltr');
    expect(wrapper.getAttribute('dir')).toBe('ltr');
    expect(canvas.getAttribute('dir')).toBe('ltr');
  });

  it('should visually scale canvas-wrapper width via --pdf-zoom when zooming in, out, and resetting', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    hostEl.style.width = '320px';
    hostEl.style.display = 'block';
    document.body.appendChild(hostEl);
    fixture.detectChanges();

    try {
      const viewport = hostEl.querySelector('.viewer-canvas-viewport') as HTMLElement;
      const wrapper = hostEl.querySelector('.canvas-wrapper') as HTMLElement;
      const canvas = hostEl.querySelector('canvas') as HTMLCanvasElement;
      canvas.width = 600;
      canvas.height = 800;

      // Viewport must not flex-center overflowing content (prevents clipped left scroll)
      expect(viewport.classList.contains('justify-center')).toBeFalse();
      expect(canvas.classList.contains('max-w-full')).toBeFalse();

      const baseWidth = wrapper.getBoundingClientRect().width;
      expect(baseWidth).toBeGreaterThan(200);
      expect(wrapper.style.getPropertyValue('--pdf-zoom').trim()).toBe('1');

      const zoomInBtn = hostEl.querySelector('button[title="تكبير"]') as HTMLButtonElement;
      const zoomOutBtn = hostEl.querySelector('button[title="تصغير"]') as HTMLButtonElement;
      const resetBtn = hostEl.querySelector('button[title="إعادة الضبط"]') as HTMLButtonElement;

      zoomInBtn.click();
      fixture.detectChanges();
      expect(component.zoomFactor()).toBe(1.25);
      expect(resetBtn.textContent?.trim()).toBe('125%');
      expect(wrapper.style.getPropertyValue('--pdf-zoom').trim()).toBe('1.25');
      expect(wrapper.style.width).toBe('125%');
      const zoomedInWidth = wrapper.getBoundingClientRect().width;
      // Account for classic scrollbar appearing on Windows when zoomed content exceeds viewport height
      expect(zoomedInWidth).toBeGreaterThan(baseWidth * 1.15);

      zoomInBtn.click();
      fixture.detectChanges();
      expect(component.zoomFactor()).toBe(1.5);
      expect(wrapper.style.width).toBe('150%');
      expect(wrapper.getBoundingClientRect().width).toBeGreaterThan(zoomedInWidth);
      expect(viewport.scrollWidth).toBeGreaterThan(viewport.clientWidth);

      // Zoom all the way to max 250% without degrading canvas backing dimensions
      zoomInBtn.click();
      zoomInBtn.click();
      zoomInBtn.click();
      zoomInBtn.click();
      zoomInBtn.click();
      fixture.detectChanges();
      expect(component.zoomFactor()).toBe(2.5);
      expect(zoomInBtn.disabled).toBeTrue();
      expect(wrapper.style.width).toBe('250%');
      expect(canvas.width).toBe(600);
      expect(canvas.height).toBe(800);

      resetBtn.click();
      fixture.detectChanges();
      expect(component.zoomFactor()).toBe(1.0);
      expect(wrapper.style.width).toBe('100%');
      expect(Math.abs(wrapper.getBoundingClientRect().width - baseWidth)).toBeLessThan(2);

      zoomOutBtn.click();
      zoomOutBtn.click();
      fixture.detectChanges();
      expect(component.zoomFactor()).toBe(0.5);
      expect(zoomOutBtn.disabled).toBeTrue();
      expect(wrapper.style.width).toBe('50%');
      expect(resetBtn.textContent?.trim()).toBe('50%');
      expect(wrapper.getBoundingClientRect().width).toBeLessThan(baseWidth * 0.55);
      expect(canvas.width).toBe(600);
    } finally {
      hostEl.remove();
    }
  });
});
