import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiLayoutService {
  /**
   * Tracks whether the global brand footer should be suppressed.
   * Suppressed when creating/editing assessments or inside dedicated full-screen workspaces.
   */
  readonly isFooterSuppressed = signal<boolean>(false);

  suppressFooter(suppress = true): void {
    this.isFooterSuppressed.set(suppress);
  }

  restoreFooter(): void {
    this.isFooterSuppressed.set(false);
  }
}
