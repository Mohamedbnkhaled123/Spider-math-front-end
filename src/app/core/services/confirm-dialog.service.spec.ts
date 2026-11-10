import { TestBed } from '@angular/core/testing';
import { ConfirmDialogService, ConfirmDialogConfig } from './confirm-dialog.service';

describe('ConfirmDialogService', () => {
  let service: ConfirmDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConfirmDialogService]
    });
    service = TestBed.inject(ConfirmDialogService);
  });

  it('should initialize with dialog closed and default state', () => {
    const s = service.state();
    expect(s.isOpen).toBeFalse();
    expect(s.config.title).toBe('');
    expect(s.config.message).toBe('');
  });

  it('should set isOpen to true and assign config defaults upon confirm()', () => {
    const config: ConfirmDialogConfig = {
      title: 'Test Title',
      message: 'Test Message'
    };

    service.confirm(config);
    const s = service.state();

    expect(s.isOpen).toBeTrue();
    expect(s.config.title).toBe('Test Title');
    expect(s.config.message).toBe('Test Message');
    expect(s.config.confirmLabel).toBe('تأكيد');
    expect(s.config.cancelLabel).toBe('إلغاء');
    expect(s.config.isDestructive).toBeFalse();
    expect(s.config.icon).toBe('alert-triangle');
  });

  it('should set destructive icon default to log-out when isDestructive is true', () => {
    service.confirm({
      title: 'Destructive Action',
      message: 'Are you sure?',
      isDestructive: true
    });

    const s = service.state();
    expect(s.config.isDestructive).toBeTrue();
    expect(s.config.icon).toBe('log-out');
  });

  it('should preserve custom icon and button labels if provided', () => {
    service.confirm({
      title: 'Custom Action',
      message: 'Custom Msg',
      confirmLabel: 'Proceed',
      cancelLabel: 'Dismiss',
      icon: 'check-circle'
    });

    const s = service.state();
    expect(s.config.confirmLabel).toBe('Proceed');
    expect(s.config.cancelLabel).toBe('Dismiss');
    expect(s.config.icon).toBe('check-circle');
  });

  it('should resolve Promise to true when handleConfirm() is invoked', async () => {
    const promise = service.confirm({
      title: 'Confirm Me',
      message: 'Please confirm'
    });

    expect(service.state().isOpen).toBeTrue();
    service.handleConfirm();

    const result = await promise;
    expect(result).toBeTrue();
    expect(service.state().isOpen).toBeFalse();
  });

  it('should resolve Promise to false when handleCancel() is invoked', async () => {
    const promise = service.confirm({
      title: 'Cancel Me',
      message: 'Please cancel'
    });

    expect(service.state().isOpen).toBeTrue();
    service.handleCancel();

    const result = await promise;
    expect(result).toBeFalse();
    expect(service.state().isOpen).toBeFalse();
  });

  it('should resolve previous pending Promise to false if confirm() is triggered again while open', async () => {
    const firstPromise = service.confirm({
      title: 'First Dialog',
      message: 'First msg'
    });

    const secondPromise = service.confirm({
      title: 'Second Dialog',
      message: 'Second msg'
    });

    const firstResult = await firstPromise;
    expect(firstResult).toBeFalse();

    expect(service.state().isOpen).toBeTrue();
    expect(service.state().config.title).toBe('Second Dialog');

    service.handleConfirm();
    const secondResult = await secondPromise;
    expect(secondResult).toBeTrue();
    expect(service.state().isOpen).toBeFalse();
  });

  it('should resolve to false and reset state when close() is invoked directly', async () => {
    const promise = service.confirm({
      title: 'Direct Close',
      message: 'Close test'
    });

    service.close();
    const result = await promise;
    expect(result).toBeFalse();
    expect(service.state().isOpen).toBeFalse();
  });
});
