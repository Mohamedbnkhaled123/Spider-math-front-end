import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let service: ConfirmDialogService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [ConfirmDialogService]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(ConfirmDialogService);
    fixture.detectChanges();
  });

  it('should not render modal backdrop when dialog is closed', () => {
    const backdrop = fixture.nativeElement.querySelector('#confirm-modal-backdrop');
    expect(backdrop).toBeNull();
  });

  it('should render modal dialog with title, message, and buttons when open', async () => {
    service.confirm({
      title: 'تأكيد تسجيل الخروج',
      message: 'هل أنت متأكد من تسجيل الخروج؟',
      confirmLabel: 'تسجيل الخروج',
      cancelLabel: 'إلغاء',
      isDestructive: true
    });
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('#confirm-modal-backdrop');
    const title = fixture.nativeElement.querySelector('#confirm-modal-title');
    const msg = fixture.nativeElement.querySelector('#confirm-modal-message');
    const cancelBtn = fixture.nativeElement.querySelector('#confirm-modal-cancel-btn');
    const proceedBtn = fixture.nativeElement.querySelector('#confirm-modal-proceed-btn');

    expect(backdrop).toBeTruthy();
    expect(title.textContent).toContain('تأكيد تسجيل الخروج');
    expect(msg.textContent).toContain('هل أنت متأكد من تسجيل الخروج؟');
    expect(cancelBtn.textContent).toContain('إلغاء');
    expect(proceedBtn.textContent).toContain('تسجيل الخروج');
  });

  it('should call handleConfirm and resolve true when proceed button is clicked', async () => {
    const confirmPromise = service.confirm({
      title: 'Test Proceed',
      message: 'Testing proceed action'
    });
    fixture.detectChanges();

    const proceedBtn = fixture.nativeElement.querySelector('#confirm-modal-proceed-btn');
    proceedBtn.click();
    fixture.detectChanges();

    const result = await confirmPromise;
    expect(result).toBeTrue();
    expect(service.state().isOpen).toBeFalse();
  });

  it('should call handleCancel and resolve false when cancel button is clicked', async () => {
    const confirmPromise = service.confirm({
      title: 'Test Cancel',
      message: 'Testing cancel action'
    });
    fixture.detectChanges();

    const cancelBtn = fixture.nativeElement.querySelector('#confirm-modal-cancel-btn');
    cancelBtn.click();
    fixture.detectChanges();

    const result = await confirmPromise;
    expect(result).toBeFalse();
    expect(service.state().isOpen).toBeFalse();
  });

  it('should dismiss and resolve false when clicking outside on the backdrop', async () => {
    const confirmPromise = service.confirm({
      title: 'Backdrop Click Test',
      message: 'Click outside to close'
    });
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('#confirm-modal-backdrop');
    backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    const result = await confirmPromise;
    expect(result).toBeFalse();
    expect(service.state().isOpen).toBeFalse();
  });

  it('should NOT dismiss when clicking inside the modal card', () => {
    service.confirm({
      title: 'Card Click Test',
      message: 'Click inside should not close'
    });
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('#confirm-modal-card');
    card.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(service.state().isOpen).toBeTrue();
  });

  it('should dismiss and resolve false when Escape key is pressed', async () => {
    const confirmPromise = service.confirm({
      title: 'Escape Key Test',
      message: 'Press ESC to close'
    });
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    const result = await confirmPromise;
    expect(result).toBeFalse();
    expect(service.state().isOpen).toBeFalse();
  });
});
