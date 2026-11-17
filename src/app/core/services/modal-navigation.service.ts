import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface ModalNavigationEntry {
  id: string;
  saveDraft?: () => Promise<void> | void;
  close: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ModalNavigationService {
  private readonly platformId = inject(PLATFORM_ID);
  private modalStack: ModalNavigationEntry[] = [];
  private isProgrammaticDismiss = false;

  readonly openModalCount = signal<number>(0);
  readonly topModalId = signal<string | null>(null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('popstate', this.handlePopState.bind(this));
    }
  }

  registerModal(entry: ModalNavigationEntry): void {
    // If modal with same id is already registered, remove it first
    this.modalStack = this.modalStack.filter((m) => m.id !== entry.id);
    this.modalStack.push(entry);

    this.openModalCount.set(this.modalStack.length);
    this.topModalId.set(entry.id);

    if (isPlatformBrowser(this.platformId)) {
      try {
        window.history.pushState(
          { modalId: entry.id, isModalOverlay: true },
          ''
        );
      } catch (err) {
        console.warn('ModalNavigationService: pushState failed', err);
      }
    }
  }

  async dismissModal(id: string): Promise<void> {
    const idx = this.modalStack.findIndex((m) => m.id === id);
    if (idx === -1) return;

    const isTop = idx === this.modalStack.length - 1;
    this.modalStack.splice(idx, 1);
    this.openModalCount.set(this.modalStack.length);
    this.topModalId.set(
      this.modalStack.length > 0 ? this.modalStack[this.modalStack.length - 1].id : null
    );

    if (isTop && isPlatformBrowser(this.platformId)) {
      this.isProgrammaticDismiss = true;
      try {
        window.history.back();
      } catch {
        this.isProgrammaticDismiss = false;
      }
    }
  }

  async handlePopState(event?: PopStateEvent): Promise<void> {
    if (this.isProgrammaticDismiss) {
      this.isProgrammaticDismiss = false;
      return;
    }

    if (this.modalStack.length === 0) {
      return;
    }

    const topModal = this.modalStack.pop();
    if (!topModal) return;

    this.openModalCount.set(this.modalStack.length);
    this.topModalId.set(
      this.modalStack.length > 0 ? this.modalStack[this.modalStack.length - 1].id : null
    );

    try {
      if (topModal.saveDraft) {
        await Promise.resolve(topModal.saveDraft());
      }
    } catch (saveErr) {
      console.warn('ModalNavigationService: saveDraft failed during popstate', saveErr);
    }

    try {
      topModal.close();
    } catch (closeErr) {
      console.warn('ModalNavigationService: close callback failed', closeErr);
    }
  }

  getStack(): readonly ModalNavigationEntry[] {
    return [...this.modalStack];
  }

  clearStack(): void {
    this.modalStack = [];
    this.openModalCount.set(0);
    this.topModalId.set(null);
  }
}
