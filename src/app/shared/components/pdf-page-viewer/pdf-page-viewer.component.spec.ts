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
});
