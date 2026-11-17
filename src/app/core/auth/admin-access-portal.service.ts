import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdminAccessPortalService {
  readonly isOpen = signal<boolean>(false);
  readonly portalMode = signal<'teacher' | 'developer'>('teacher');

  openTeacherPortal(): void {
    this.portalMode.set('teacher');
    this.isOpen.set(true);
  }

  openDeveloperPortal(): void {
    this.portalMode.set('developer');
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }
}
