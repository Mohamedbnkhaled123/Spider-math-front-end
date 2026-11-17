import { Injectable, signal, Signal, inject } from '@angular/core';
import { ModalNavigationService } from './modal-navigation.service';

export interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  icon?: string;
}

export interface ConfirmDialogState {
  isOpen: boolean;
  config: ConfirmDialogConfig;
  resolve?: (value: boolean) => void;
}

export interface IConfirmDialogService {
  readonly state: Signal<ConfirmDialogState>;
  confirm(config: ConfirmDialogConfig): Promise<boolean>;
  handleConfirm(): void;
  handleCancel(): void;
  close(): void;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService implements IConfirmDialogService {
  private readonly modalNav = inject(ModalNavigationService);
  private readonly _state = signal<ConfirmDialogState>({
    isOpen: false,
    config: {
      title: '',
      message: ''
    }
  });

  readonly state: Signal<ConfirmDialogState> = this._state.asReadonly();

  confirm(config: ConfirmDialogConfig): Promise<boolean> {
    const current = this._state();
    if (current.isOpen && current.resolve) {
      current.resolve(false);
    }

    return new Promise<boolean>((resolve) => {
      this._state.set({
        isOpen: true,
        config: {
          confirmLabel: 'تأكيد',
          cancelLabel: 'إلغاء',
          isDestructive: false,
          icon: config.isDestructive ? 'log-out' : 'alert-triangle',
          ...config
        },
        resolve
      });
      this.modalNav.registerModal({
        id: 'confirm-dialog',
        close: () => this.handleCancel()
      });
    });
  }

  handleConfirm(): void {
    this.modalNav.dismissModal('confirm-dialog');
    const s = this._state();
    const resolve = s.resolve;
    this._state.set({
      isOpen: false,
      config: { title: '', message: '' },
      resolve: undefined
    });
    if (resolve) {
      resolve(true);
    }
  }

  handleCancel(): void {
    this.modalNav.dismissModal('confirm-dialog');
    const s = this._state();
    const resolve = s.resolve;
    this._state.set({
      isOpen: false,
      config: { title: '', message: '' },
      resolve: undefined
    });
    if (resolve) {
      resolve(false);
    }
  }

  close(): void {
    this.modalNav.dismissModal('confirm-dialog');
    const s = this._state();
    const resolve = s.resolve;
    this._state.set({
      isOpen: false,
      config: { title: '', message: '' },
      resolve: undefined
    });
    if (resolve) {
      resolve(false);
    }
  }
}
