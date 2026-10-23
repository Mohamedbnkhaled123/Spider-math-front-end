import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AppIconName =
  | 'globe'
  | 'sun'
  | 'moon'
  | 'lock'
  | 'refresh'
  | 'book-open'
  | 'message-circle'
  | 'home'
  | 'target'
  | 'landmark'
  | 'palmtree'
  | 'graduation-cap'
  | 'sparkles'
  | 'check'
  | 'log-out'
  | 'clock'
  | 'shield'
  | 'award'
  | 'alert-circle'
  | 'phone'
  | 'user'
  | 'map-pin'
  | 'calendar'
  | 'file-text'
  | 'check-circle'
  | 'x'
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-down'
  | 'play'
  | 'star'
  | 'arrow-right'
  | 'arrow-left'
  | 'calculator'
  | 'grid'
  | 'minus'
  | 'minimize'
  | 'maximize'
  | 'plus'
  | 'loader'
  | 'camera'
  | 'image'
  | 'upload-cloud'
  | 'trash'
  | 'rotate-cw'
  | 'rotate-ccw'
  | 'copy'
  | 'external-link'
  | 'activity'
  | 'user-plus'
  | 'video'
  | 'hash'
  | 'log-in';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-icon.component.html',
  styleUrl: './app-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppIconComponent {
  readonly name = input.required<AppIconName>();
  readonly size = input<number>(20);
  readonly className = input<string>('');
  readonly strokeWidth = input<number>(2);
}
