import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { AuthService } from '../../../core/auth/auth.service';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { SwrCacheService } from '../../../core/services/swr-cache.service';
import { ChildAcademicMonitorComponent } from '../child-academic-monitor/child-academic-monitor.component';
import { LinkedChildSummary, LinkChildRequestPayload } from './parent-shell.models';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 13: Multi-Child Parent Shell Component
 * Multi-Child Switcher Bar, Link Child Modal (HAxxxx) & Embedded Academic Monitor
 */
@Component({
  selector: 'app-parent-shell',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconComponent, ChildAcademicMonitorComponent],
  templateUrl: './parent-shell.component.html',
  styleUrl: './parent-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParentShellComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private readonly swrCache = inject(SwrCacheService);
  readonly authService = inject(AuthService);
  readonly langService = inject(LangService);

  readonly linkedChildren = signal<LinkedChildSummary[]>([]);
  readonly selectedChildId = signal<string>('');
  readonly isLoadingChildren = signal<boolean>(false);

  // Link child modal state
  readonly isLinkModalOpen = signal<boolean>(false);
  readonly linkHaCode = signal<string>('');
  readonly isLinking = signal<boolean>(false);
  readonly linkError = signal<string | null>(null);
  readonly linkSuccess = signal<string | null>(null);

  readonly selectedChild = computed(() => {
    const id = this.selectedChildId();
    return this.linkedChildren().find((c) => c.studentId === id) ?? null;
  });

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const parentId = this.authService.currentUser()?._id || 'parent_me';
    const cacheKey = `parent_children_${parentId}`;
    const cached = this.swrCache.get<LinkedChildSummary[]>(cacheKey);
    if (cached && cached.length > 0) {
      this.linkedChildren.set(cached);
      this.selectedChildId.set(cached[0].studentId);
      this.isLoadingChildren.set(false);
    } else {
      this.isLoadingChildren.set(true);
    }
    this.fetchLinkedChildren();
  }

  fetchLinkedChildren(): void {
    const parentId = this.authService.currentUser()?._id || 'parent_me';
    const cacheKey = `parent_children_${parentId}`;

    this.http.get<any>('/api/v1/parent/children-list').subscribe({
      next: (res) => {
        const children = res?.data?.children || res?.children || (Array.isArray(res?.data) ? res.data : []);
        if (Array.isArray(children) && children.length > 0) {
          this.linkedChildren.set(children);
          this.swrCache.set(cacheKey, children);
          if (!this.selectedChildId() || !children.some(c => c.studentId === this.selectedChildId())) {
            this.selectedChildId.set(children[0].studentId);
          }
          this.isLoadingChildren.set(false);
        } else {
          if (!this.swrCache.has(cacheKey)) {
            this.linkedChildren.set([]);
            this.selectedChildId.set('');
          }
          this.isLoadingChildren.set(false);
        }
      },
      error: () => {
        if (!this.swrCache.has(cacheKey)) {
          this.linkedChildren.set([]);
          this.selectedChildId.set('');
        }
        this.isLoadingChildren.set(false);
      }
    });
  }

  selectChild(studentId: string): void {
    if (this.selectedChildId() !== studentId) {
      this.selectedChildId.set(studentId);
    }
  }

  openLinkModal(): void {
    this.linkHaCode.set('');
    this.linkError.set(null);
    this.linkSuccess.set(null);
    this.isLinkModalOpen.set(true);
  }

  closeLinkModal(): void {
    this.isLinkModalOpen.set(false);
    this.linkError.set(null);
    this.linkSuccess.set(null);
  }

  onHaCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.linkHaCode.set(input.value.toUpperCase().trim());
  }

  submitLinkChild(): void {
    const code = this.linkHaCode().toUpperCase().trim();
    if (!code) {
      this.linkError.set(this.langService.isArabic() ? 'أدخل كود الطالب (HAxxxx)' : 'Enter student code (HAxxxx)');
      return;
    }

    const haRegex = /^HA\d{4,}$/i;
    if (!haRegex.test(code)) {
      this.linkError.set(this.langService.isArabic() ? 'صيغة الكود غير صالحة (مثال: HA4920)' : 'Invalid code format (e.g. HA4920)');
      return;
    }

    this.isLinking.set(true);
    this.linkError.set(null);
    this.linkSuccess.set(null);

    const payload: LinkChildRequestPayload = {
      studentCode: code,
      student_ha_code: code
    };

    this.http.post<{ success: boolean; message: string; child?: LinkedChildSummary }>('/api/v1/auth/parent/link-additional-child', payload).subscribe({
      next: (res) => {
        this.isLinking.set(false);
        this.linkSuccess.set(res?.message || (this.langService.isArabic() ? 'تم ربط الحساب بنجاح!' : 'Student account linked!'));
        this.fetchLinkedChildren();
        setTimeout(() => this.closeLinkModal(), 1500);
      },
      error: (err) => {
        this.isLinking.set(false);
        const serverMsg = err?.error?.message || err?.error?.error?.message || (this.langService.isArabic() ? 'تعذر ربط الحساب. تحقق من الكود ورقم الهاتف.' : 'Unable to link account. Verify code and phone.');
        this.linkError.set(serverMsg);
      }
    });
  }
}
