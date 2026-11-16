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

  it('should default clearOnSuccess and showItemList to true', () => {
    expect(component.clearOnSuccess()).toBeTrue();
    expect(component.showItemList()).toBeTrue();
  });

  it('should suppress internal items grid when showItemList is false', () => {
    component.items.set([
      {
        id: 'img_1',
        originalFile: new File([''], 'test.png'),
        compressedBlob: new Blob(),
        previewUrl: 'blob:test',
        originalSizeKb: 100,
        compressedSizeKb: 30,
        rotationDeg: 0,
        uploadStatus: 'SUCCESS'
      }
    ]);
    componentRef.setInput('showItemList', false);
    fixture.detectChanges();

    const hostEl: HTMLElement = fixture.nativeElement;
    const itemsGrid = hostEl.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2');
    expect(itemsGrid).toBeNull();
  });

  it('should reset items and uploadProgress on clearItems', () => {
    component.items.set([
      {
        id: 'img_1',
        originalFile: new File([''], 'test.png'),
        compressedBlob: new Blob(),
        previewUrl: '',
        originalSizeKb: 100,
        compressedSizeKb: 30,
        rotationDeg: 0,
        uploadStatus: 'SUCCESS'
      }
    ]);
    component.uploadProgress.set(100);
    component.clearItems();

    expect(component.items().length).toBe(0);
    expect(component.uploadProgress()).toBe(0);
  });

  it('should revoke previous object URLs when new files are processed', async () => {
    spyOn(URL, 'revokeObjectURL');
    component.items.set([
      {
        id: 'img_prev',
        originalFile: new File([''], 'prev.png'),
        compressedBlob: new Blob(),
        previewUrl: 'blob:https://test/prev-blob-123',
        originalSizeKb: 100,
        compressedSizeKb: 30,
        rotationDeg: 0,
        uploadStatus: 'PENDING'
      }
    ]);

    const newFile = new File(['new content'], 'new.png', { type: 'image/png' });
    await component.processFiles([newFile]);

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:https://test/prev-blob-123');
  });

  it('should contain zero Unicode emojis in rendered template', () => {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
    expect(emojiRegex.test(fixture.nativeElement.innerHTML)).toBeFalse();
  });
});
