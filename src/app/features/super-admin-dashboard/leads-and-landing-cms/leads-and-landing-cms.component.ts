import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  inject,
  effect,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import {
  CmsConfigAdminItem,
  LeadAdminItem,
  ScheduleRow
} from './leads-and-landing-cms.models';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 14: Leads CRM & Landing Page CMS Component
 * 
 * Manages customer inquiries (Leads) with 1-click WhatsApp deep links,
 * and pure Landing Page content (Headlines, Announcements, Schedules Table scoped by Curriculum/Grade/Term).
 * Strictly zero SEO fields (RULES.md Section 1.3 & 5.6).
 */
@Component({
  selector: 'app-leads-and-landing-cms',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconComponent],
  templateUrl: './leads-and-landing-cms.component.html',
  styleUrl: './leads-and-landing-cms.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LeadsAndLandingCmsComponent implements OnInit {
  private readonly http = inject(HttpClient);

  // Inputs
  readonly leadsList = input.required<LeadAdminItem[]>();
  readonly cmsConfig = input.required<CmsConfigAdminItem>();

  // Outputs
  readonly cmsConfigSaved = output<CmsConfigAdminItem>();
  readonly leadStatusUpdated = output<{ leadId: string; status: 'NEW' | 'CONTACTED' | 'REGISTERED' }>();
  readonly toastTriggered = output<{ text: string; type: 'success' | 'warning' | 'error' }>();

  // Local Editable Copy of CMS Config
  readonly editableCms = signal<CmsConfigAdminItem>({
    heroHeadlineAr: '',
    heroSubheadlineAr: '',
    heroVideoUrl: '',
    announcementBannerText: '',
    isAnnouncementActive: true,
    supportWhatsapp: '01012345678',
    activeAcademicYear: '2026 / 2027',
    schedulesTable: []
  });

  // New Schedule Row Form
  readonly newSchedule = signal<ScheduleRow>({
    curriculum: 'EGYPTIAN',
    gradeLevel: 'SEC_3',
    term: 'TERM_1',
    dayOfWeek: 'الأحد والثلاثاء',
    timeSlot: '07:00 م - 09:00 م',
    lectureSubject: 'تفاضل وتكامل وحساب مثلثات'
  });

  constructor() {
    effect(() => {
      const config = this.cmsConfig();
      if (config) {
        this.editableCms.set(JSON.parse(JSON.stringify(config)));
      }
    });
  }

  // Set initial editable copy when input is ready
  ngOnInit(): void {
    const config = this.cmsConfig();
    if (config) {
      this.editableCms.set(JSON.parse(JSON.stringify(config)));
    }
  }

  // Open WhatsApp Link directly for Lead
  openWhatsAppLead(phone: string): void {
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      clean = '2' + clean; // Egypt prefix
    }
    const url = `https://wa.me/${clean}?text=${encodeURIComponent('أهلاً بحضرتك من منصة سبايدر ماث مع المهندسة هبة عبدالوهاب. بخصوص استفسارك عن الاشتراك:')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  // Update Lead Status
  setLeadStatus(lead: LeadAdminItem, status: 'NEW' | 'CONTACTED' | 'REGISTERED'): void {
    this.http.patch(`/api/v1/admin/leads/${lead.id}/status`, { status }).subscribe({
      next: () => {
        this.leadStatusUpdated.emit({ leadId: lead.id, status });
        this.toastTriggered.emit({ text: `تم تحديث حالة العميل إلى ${status}!`, type: 'success' });
      },
      error: (err) => {
        this.toastTriggered.emit({
          text: err?.error?.message || 'تعذر تحديث حالة العميل.',
          type: 'error'
        });
      }
    });
  }

  // Schedule Rows Management
  addScheduleRow(): void {
    const s = this.newSchedule();
    const currentList = this.editableCms().schedulesTable || [];
    this.editableCms.update((cfg) => ({
      ...cfg,
      schedulesTable: [...currentList, { ...s }]
    }));
    this.toastTriggered.emit({ text: 'تمت إضافة الموعد لجدول الحصص الأسبوعية!', type: 'success' });
  }

  removeScheduleRow(index: number): void {
    this.editableCms.update((cfg) => ({
      ...cfg,
      schedulesTable: (cfg.schedulesTable || []).filter((_, i) => i !== index)
    }));
  }

  // Save Pure CMS Configuration
  saveCms(): void {
    const payload = this.editableCms();
    this.http.put('/api/v1/admin/cms-config', payload).subscribe({
      next: () => {
        this.cmsConfigSaved.emit(payload);
        this.toastTriggered.emit({
          text: 'تم حفظ ونشر تعديلات محتوى الصفحة الرئيسية بنجاح على المنصة!',
          type: 'success'
        });
      },
      error: (err) => {
        this.toastTriggered.emit({
          text: err?.error?.message || 'تعذر حفظ تعديلات الصفحة الرئيسية. يرجى التأكد من صحة البيانات.',
          type: 'error'
        });
      }
    });
  }
}
