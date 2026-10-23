import {
  Directive,
  HostListener,
  input,
  ElementRef,
  Renderer2,
  OnInit,
  inject
} from '@angular/core';

@Directive({
  selector: '[appPreventContextCopy]',
  standalone: true
})
export class PreventContextCopyDirective implements OnInit {
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  readonly allowSelection = input<boolean>(false);
  readonly allowContextMenu = input<boolean>(false);

  ngOnInit(): void {
    if (!this.allowSelection()) {
      const native = this.el.nativeElement;
      this.renderer.setStyle(native, 'user-select', 'none');
      this.renderer.setStyle(native, '-webkit-user-select', 'none');
      this.renderer.setStyle(native, '-webkit-touch-callout', 'none');
    }
  }

  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: MouseEvent): void {
    if (!this.allowContextMenu()) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  @HostListener('selectstart', ['$event'])
  onSelectStart(event: Event): void {
    if (!this.allowSelection()) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    const isCtrlOrCmd = event.ctrlKey || event.metaKey;

    // Block Ctrl+S (Save), Ctrl+P (Print), Ctrl+U (View Source), Ctrl+C (Copy)
    if (isCtrlOrCmd && (key === 's' || key === 'p' || key === 'u' || key === 'c')) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // Block F12 (DevTools shortcut)
    if (event.key === 'F12') {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // Block Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C (DevTools inspect shortcuts)
    if (isCtrlOrCmd && event.shiftKey && (key === 'i' || key === 'j' || key === 'c')) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
