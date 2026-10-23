import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon.component';
import { AuthService } from '../../core/auth/auth.service';
import { LangService } from '../../core/seo-theme-i18n/lang.service';

export interface PendingDeviceRequest {
  id: string;
  studentName: string;
  haCode: string;
  curriculum: string;
  deviceInfo: string;
  ipAddress: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface PendingEssayGrading {
  id: string;
  studentName: string;
  haCode: string;
  assessmentTitle: string;
  questionNumber: number;
  questionText: string;
  studentAnswerImageWebp: string;
  maxScore: number;
  awardedScore: number;
  errorNote: string;
  youtubeSolutionUrl: string;
  status: 'PENDING' | 'PUBLISHED';
}

export interface StudentAdminSummary {
  id: string;
  name: string;
  haCode: string;
  curriculum: string;
  gradeLevel: string;
  hasActiveSubscription: boolean;
  totalXp: number;
  approvedDevices: number;
  isLocked: boolean;
}

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AppIconComponent],
  templateUrl: './super-admin-dashboard.component.html',
  styleUrl: './super-admin-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuperAdminDashboardComponent {
  readonly authService = inject(AuthService);
  readonly langService = inject(LangService);

  readonly activeTab = signal<'devices' | 'grading' | 'students'>('devices');

  // 1. Pending Device Approvals (Additive Security Lock HTTP 423)
  readonly pendingDevices = signal<PendingDeviceRequest[]>([
    {
      id: 'req-01',
      studentName: 'عمر خالد محمود',
      haCode: 'HA3109',
      curriculum: 'المنهج المصري — الثانوية العامة',
      deviceInfo: 'Windows 11 PC • Chrome 122.0 (الجهاز الثاني)',
      ipAddress: '156.204.18.92 (القاهرة)',
      requestedAt: 'منذ 15 دقيقة',
      status: 'PENDING'
    },
    {
      id: 'req-02',
      studentName: 'مريم طارق سعيد',
      haCode: 'HA8201',
      curriculum: 'المنهج الكويتي — الصف الحادي عشر',
      deviceInfo: 'iPad Pro iPadOS 17.4 • Safari',
      ipAddress: '188.70.42.110 (الكويت)',
      requestedAt: 'منذ ساعة',
      status: 'PENDING'
    }
  ]);

  // 2. Pending Essay Submissions Grading
  readonly pendingGrading = signal<PendingEssayGrading[]>([
    {
      id: 'sub-01',
      studentName: 'أحمد محمد علي',
      haCode: 'HA4920',
      assessmentTitle: 'امتحان التفاضل النصفي الشامل (الثانوية العامة)',
      questionNumber: 4,
      questionText: 'أوجد معادلة العمودي للمنحنى ص = س² - ٤س + ٣ عند نقطة تقاطعه مع محور الصادات، ثم احسب مساحة المثلث المحصور.',
      studentAnswerImageWebp: '/assets/branding/spider-math-logo.webp',
      maxScore: 10,
      awardedScore: 8,
      errorNote: 'خطوة إيجاد ميل العمودي صحيحة، لكن حدث سهو في ضرب الإشارة السالبة أثناء فك معادلة الخط المستقيم النهائي.',
      youtubeSolutionUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      status: 'PENDING'
    }
  ]);

  // 3. Students Management & Subscriptions
  readonly studentsList = signal<StudentAdminSummary[]>([
    {
      id: 'std-01',
      name: 'أحمد محمد علي',
      haCode: 'HA4920',
      curriculum: 'المصري',
      gradeLevel: 'SEC_3',
      hasActiveSubscription: true,
      totalXp: 1450,
      approvedDevices: 1,
      isLocked: false
    },
    {
      id: 'std-02',
      name: 'سارة محمد علي',
      haCode: 'HA1804',
      curriculum: 'IGCSE',
      gradeLevel: 'Year 10',
      hasActiveSubscription: true,
      totalXp: 980,
      approvedDevices: 1,
      isLocked: false
    },
    {
      id: 'std-03',
      name: 'سارة أحمد محمود',
      haCode: 'HA5521',
      curriculum: 'المصري',
      gradeLevel: 'SEC_2',
      hasActiveSubscription: false,
      totalXp: 0,
      approvedDevices: 1,
      isLocked: false
    }
  ]);

  setTab(tab: 'devices' | 'grading' | 'students'): void {
    this.activeTab.set(tab);
  }

  approveDevice(id: string): void {
    this.pendingDevices.update((list) =>
      list.map((item) => (item.id === id ? { ...item, status: 'APPROVED' as const } : item))
    );
  }

  rejectDevice(id: string): void {
    this.pendingDevices.update((list) =>
      list.map((item) => (item.id === id ? { ...item, status: 'REJECTED' as const } : item))
    );
  }

  publishGrade(id: string): void {
    this.pendingGrading.update((list) =>
      list.map((item) => (item.id === id ? { ...item, status: 'PUBLISHED' as const } : item))
    );
  }

  toggleSubscription(id: string): void {
    this.studentsList.update((list) =>
      list.map((std) => (std.id === id ? { ...std, hasActiveSubscription: !std.hasActiveSubscription } : std))
    );
  }

  toggleAccountLock(id: string): void {
    this.studentsList.update((list) =>
      list.map((std) => (std.id === id ? { ...std, isLocked: !std.isLocked } : std))
    );
  }
}
