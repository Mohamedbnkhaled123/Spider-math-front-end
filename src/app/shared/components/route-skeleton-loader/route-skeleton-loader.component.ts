import { Component, ChangeDetectionStrategy, input, inject, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-route-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './route-skeleton-loader.component.html',
  styleUrl: './route-skeleton-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RouteSkeletonLoaderComponent {
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  /** Explicit layout mode override if provided by caller */
  readonly layoutMode = input<'auto' | 'admin' | 'student' | 'parent' | 'exam' | 'generic'>('auto');

  /** Target URL being navigated to (provided by AppComponent during router events) */
  readonly targetUrl = input<string>('');

  /**
   * Dynamically resolves the visual skeleton archetype matching the route
   */
  readonly resolvedMode = computed<'admin' | 'student' | 'parent' | 'exam' | 'generic'>(() => {
    const explicit = this.layoutMode();
    if (explicit !== 'auto') return explicit;

    const target = this.targetUrl();
    let url = target || this.router.url || '';
    if ((!url || url === '/') && isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
      url = window.location.pathname || '';
    }

    if (url.includes('/admin')) return 'admin';
    if (url.includes('/student') || url.includes('/inactive-student')) return 'student';
    if (url.includes('/parent')) return 'parent';
    if (url.includes('/placement-test') || url.includes('/assessments/') || url.includes('/attempt') || url.includes('/exam') || url.includes('/quiz')) return 'exam';
    return 'generic';
  });
}
