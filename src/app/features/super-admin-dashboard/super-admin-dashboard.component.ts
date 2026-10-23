import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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
export class SuperAdminDashboardComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly authService = inject(AuthService);
  readonly langService = inject(LangService);

  readonly activeTab = signal<'devices' | 'grading' | 'students'>('students');
  readonly isLoading = signal<boolean>(false);

  // 1. Pending Device Approvals (from Atlas)
  readonly pendingDevices = signal<PendingDeviceRequest[]>([]);

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

  // 3. Registered Users & Students (Live from MongoDB Atlas)
  readonly studentsList = signal<StudentAdminSummary[]>([]);

  ngOnInit(): void {
    this.fetchRealAtlasData();
  }

  fetchRealAtlasData(): void {
    this.isLoading.set(true);

    // 1. Fetch real registered users directly from MongoDB Atlas
    this.http.get<{ success: boolean; data: any[] }>('/api/v1/admin/users/students').subscribe({
      next: (res) => {
        if (res?.data && res.data.length > 0) {
          const mapped: StudentAdminSummary[] = res.data.map((u) => ({
            id: u._id,
            name: u.full_name || 'طالب مسجل',
            haCode: u.student_code || (u.role === 'SUPER_ADMIN' ? 'ADMIN' : '—'),
            curriculum: u.curriculum || (u.role === 'SUPER_ADMIN' ? 'إشراف أكاديمي' : 'المصري'),
            gradeLevel: u.grade_level || (u.role === 'SUPER_ADMIN' ? 'Super Admin' : 'SEC_3'),
            hasActiveSubscription: !!u.has_active_subscription,
            totalXp: u.total_xp || 0,
            approvedDevices: Array.isArray(u.approved_devices) ? u.approved_devices.length : 1,
            isLocked: u.account_lock_status === 'LOCKED'
          }));
          this.studentsList.set(mapped);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });

    // 2. Fetch pending device requests from Atlas
    this.http.get<{ success: boolean; data: any[] }>('/api/v1/admin/device-requests').subscribe({
      next: (res) => {
        if (res?.data && res.data.length > 0) {
          const mappedDevices: PendingDeviceRequest[] = res.data.map((d) => ({
            id: d._id,
            studentName: d.full_name,
            haCode: d.student_code,
            curriculum: d.curriculum || 'المنهج المصري',
            deviceInfo: d.pending_device_req?.device_type || 'Windows PC',
            ipAddress: d.pending_device_req?.ip_address || '127.0.0.1',
            requestedAt: new Date(d.pending_device_req?.requested_at || d.createdAt).toLocaleTimeString('ar-EG'),
            status: d.pending_device_req?.status || 'PENDING'
          }));
          this.pendingDevices.set(mappedDevices);
        }
      }
    });
  }

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
