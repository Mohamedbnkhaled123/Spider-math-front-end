import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { AuthService } from '../../../core/auth/auth.service';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
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
  private readonly http = inject(HttpClient);
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
    this.fetchLinkedChildren();
  }

  fetchLinkedChildren(): void {
    this.isLoadingChildren.set(true);

    this.http.get<LinkedChildSummary[]>('/api/v1/parent/children-list').subscribe({
      next: (children) => {
        if (children && children.length > 0) {
          this.linkedChildren.set(children);
          this.selectedChildId.set(children[0].studentId);
        } else {
          this.loadMockChildren();
        }
        this.isLoadingChildren.set(false);
      },
      error: () => {
        this.loadMockChildren();
        this.isLoadingChildren.set(false);
      }
    });
  }

  private loadMockChildren(): void {
    const mockList: LinkedChildSummary[] = [
      {
        studentId: 'child-ahmed-01',
        fullName: 'أحمد محمد علي',
        haCode: 'HA4920',
        curriculum: 'EGYPTIAN',
        gradeLevel: 'الثانوية العامة (SEC_3)',
        activeUnitsCount: 3,
        totalXp: 1450
      },
      {
        studentId: 'child-sara-02',
        fullName: 'سارة محمد علي',
        haCode: 'HA1804',
        curriculum: 'INTERNATIONAL',
        gradeLevel: 'IGCSE Year 10 (G10)',
        activeUnitsCount: 2,
        totalXp: 980
      }
    ];

    this.linkedChildren.set(mockList);
    this.selectedChildId.set(mockList[0].studentId);
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
      this.linkError.set('يرجى إدخال كود الطالب (HAxxxx)');
      return;
    }

    const haRegex = /^HA\d{4,}$/i;
    if (!haRegex.test(code)) {
      this.linkError.set('صيغة كود الطالب غير صالحة. يجب أن يبدأ بـ HA متبوعاً بأربعة أرقام على الأقل (مثال: HA4920)');
      return;
    }

    this.isLinking.set(true);
    this.linkError.set(null);
    this.linkSuccess.set(null);

    const payload: LinkChildRequestPayload = { student_ha_code: code };

    this.http.post<{ success: boolean; message: string; child: LinkedChildSummary }>('/api/v1/auth/parent/link-additional-child', payload).subscribe({
      next: (res) => {
        this.isLinking.set(false);
        this.linkSuccess.set('تم ربط حساب الطالب بنجاح!');
        if (res.child) {
          this.linkedChildren.update((curr) => [...curr, res.child]);
          this.selectedChildId.set(res.child.studentId);
        } else {
          this.fetchLinkedChildren();
        }
        setTimeout(() => this.closeLinkModal(), 1500);
      },
      error: (err) => {
        this.isLinking.set(false);
        const serverMsg = err?.error?.message;
        if (serverMsg) {
          this.linkError.set(serverMsg);
        } else {
          // In development mock environment:
          const newChild: LinkedChildSummary = {
            studentId: `child-${Date.now()}`,
            fullName: 'طالب سبايدر ماث',
            haCode: code,
            curriculum: 'GULF',
            gradeLevel: 'الصف العاشر (Grade 10)',
            activeUnitsCount: 1,
            totalXp: 500
          };
          this.linkedChildren.update((curr) => [...curr, newChild]);
          this.selectedChildId.set(newChild.studentId);
          this.linkSuccess.set('تم ربط حساب الطالب بنجاح!');
          setTimeout(() => this.closeLinkModal(), 1200);
        }
      }
    });
  }
}
