import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentRef } from '@angular/core';
import { ImageCompressorUploaderComponent } from './image-compressor-uploader.component';

describe('ImageCompressorUploaderComponent', () => {
  let component: ImageCompressorUploaderComponent;
  let componentRef: ComponentRef<ImageCompressorUploaderComponent>;
  let fixture: ComponentFixture<ImageCompressorUploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageCompressorUploaderComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageCompressorUploaderComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('uploadTarget', 'homework');
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should enforce max 2 files for homework and 1 file for question', () => {
    expect(component.maxFilesAllowed()).toBe(2);

    componentRef.setInput('uploadTarget', 'question');
    fixture.detectChanges();
    expect(component.maxFilesAllowed()).toBe(1);
  });

  it('should handle 90-degree clockwise and counter-clockwise rotations', () => {
    component.items.set([
      {
        id: 'img_1',
        originalFile: new File([''], 'test.png'),
        compressedBlob: new Blob(),
        previewUrl: 'blob:test',
        originalSizeKb: 100,
        compressedSizeKb: 30,
        rotationDeg: 0,
        uploadStatus: 'PENDING'
      }
    ]);
    component.activePreviewIndex.set(0);

    // Rotate clockwise -> 90deg
    component.rotateClockwise();
    expect(component.items()[0].rotationDeg).toBe(90);

    // Rotate clockwise -> 180deg
    component.rotateClockwise();
    expect(component.items()[0].rotationDeg).toBe(180);

    // Rotate counter-clockwise -> 90deg
    component.rotateCounterClockwise();
    expect(component.items()[0].rotationDeg).toBe(90);
  });

  it('should toggle clarity confirmation correctly', () => {
    expect(component.isClarityConfirmed()).toBeFalse();
    component.toggleClarityConfirmation();
    expect(component.isClarityConfirmed()).toBeTrue();
  });
});
