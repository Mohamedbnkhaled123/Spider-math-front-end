import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { ManualImageSlicerModalComponent } from './manual-image-slicer-modal.component';

describe('ManualImageSlicerModalComponent', () => {
  let component: ManualImageSlicerModalComponent;
  let fixture: ComponentFixture<ManualImageSlicerModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualImageSlicerModalComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ManualImageSlicerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the manual image slicer modal component with initial state', () => {
    expect(component).toBeTruthy();
    expect(component.isOpen()).toBe(false);
    expect(component.currentAspectRatio()).toBe('FREE');
    expect(component.isSaving()).toBe(false);
    expect(component.uploadToCloudinary()).toBe(true);
  });

  it('should change aspect ratio signal when setAspectRatio is called', () => {
    component.setAspectRatio('16:9');
    expect(component.currentAspectRatio()).toBe('16:9');

    component.setAspectRatio('1:1');
    expect(component.currentAspectRatio()).toBe('1:1');

    component.setAspectRatio('FREE');
    expect(component.currentAspectRatio()).toBe('FREE');
  });

  it('should close modal and emit cancelled when cancelCrop is invoked', () => {
    let cancelledEmitted = false;
    component.cancelled.subscribe(() => {
      cancelledEmitted = true;
    });

    component.isOpen.set(true);
    expect(component.isOpen()).toBe(true);

    component.cancelCrop();
    expect(component.isOpen()).toBe(false);
    expect(cancelledEmitted).toBe(true);
  });

  it('should NOT emit cancelled when saveAndConfirm saves crop successfully', async () => {
    let cancelledEmitted = false;
    let sliceSavedEmitted = false;

    component.cancelled.subscribe(() => {
      cancelledEmitted = true;
    });
    component.sliceSaved.subscribe(() => {
      sliceSavedEmitted = true;
    });

    component.isOpen.set(true);

    // Mock cropper instance
    const mockCanvas = document.createElement('canvas');
    mockCanvas.width = 100;
    mockCanvas.height = 100;

    (component as any).cropper = {
      getCroppedCanvas: () => mockCanvas,
      destroy: () => {}
    };

    // Save with uploadToCloudinary = false (local blob mode)
    fixture.componentRef.setInput('uploadToCloudinary', false);

    await component.saveAndConfirm();

    expect(sliceSavedEmitted).toBe(true);
    expect(cancelledEmitted).toBe(false); // CRITICAL: cancelled must NOT be emitted on save!
    expect(component.isOpen()).toBe(false);
  });
});
