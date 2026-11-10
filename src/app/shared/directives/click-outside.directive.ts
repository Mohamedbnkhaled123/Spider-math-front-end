import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  OnDestroy,
  Output,
  inject,
  input,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * ClickOutsideDirective
 * Standalone Angular directive that emits an event when a click or tap
 * occurs outside the host element.
 *
 * Safe for Server-Side Rendering (SSR) and reactive to DOM connectivity.
 */
@Directive({
  selector: '[appClickOutside]',
  standalone: true
})
export class ClickOutsideDirective implements OnDestroy {
  private readonly elementRef = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);

  readonly appClickOutsideInput = input<any>(undefined, { alias: 'appClickOutside' });
  readonly clickOutsideEnabled = input<boolean>(true);

  @Output() readonly appClickOutside = new EventEmitter<MouseEvent>();

  private isDestroyed = false;

  ngOnDestroy(): void {
    this.isDestroyed = true;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isDestroyed || !isPlatformBrowser(this.platformId)) {
      return;
    }

    // Check if directive is disabled via clickOutsideEnabled or appClickOutside boolean
    if (!this.clickOutsideEnabled() || this.appClickOutsideInput() === false) {
      return;
    }

    const hostEl = this.elementRef.nativeElement as HTMLElement | null;
    if (!hostEl || !hostEl.isConnected) {
      return;
    }

    const target = event.target as Node | null;
    if (!target) {
      return;
    }

    const isInside =
      hostEl.contains(target) ||
      (typeof event.composedPath === 'function' && event.composedPath().includes(hostEl));

    if (!isInside) {
      this.appClickOutside.emit(event);
    }
  }
}
