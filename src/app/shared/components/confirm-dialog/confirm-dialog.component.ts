import {
  Component,
  ChangeDetectionStrategy,
  inject,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { AppIconComponent, AppIconName } from '../app-icon/app-icon.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, AppIconComponent],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent {
  readonly confirmService = inject(ConfirmDialogService);
  readonly dialogState = this.confirmService.state;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.dialogState().isOpen) {
      this.cancel();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancel();
    }
  }

  confirm(): void {
    this.confirmService.handleConfirm();
  }

  cancel(): void {
    this.confirmService.handleCancel();
  }

  getIconName(): AppIconName {
    const icon = this.dialogState().config.icon;
    if (icon) {
      return icon as AppIconName;
    }
    return this.dialogState().config.isDestructive ? 'log-out' : 'alert-triangle';
  }
}
