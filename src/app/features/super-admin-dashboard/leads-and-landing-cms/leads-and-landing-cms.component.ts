import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
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
  LeadAdminItem
} from './leads-and-landing-cms.models';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 14: Leads CRM & Landing Page CMS Component
 * 
 * Manages customer inquiries (Leads) with 1-click WhatsApp deep links,
 * and pure Landing Page content (Headlines, Announcements, Schedules Table, and Showcased Units Scoped by Curriculum).
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

  // Tabs: 'AR' (Arabic Content) | 'EN' (English Content) | 'GENERAL' (Media, Video, WhatsApp, Schedules) | 'UNITS' (Showcased Units)
  readonly activeCmsTab = signal<'AR' | 'EN' | 'GENERAL' | 'UNITS'>('AR');

  // Local Editable Copy of CMS Config
  readonly editableCms = signal<CmsConfigAdminItem>({
    announcementBannerText: '',
    announcementBannerTextEn: '',
    isAnnouncementActive: true,

    heroHeadlineAr: '',
    heroHeadlineEn: '',
    heroSubheadlineAr: '',
    heroSubheadlineEn: '',
    heroBadgeAr: '',
    heroBadgeEn: '',
    heroCtaPrimaryAr: '',
    heroCtaPrimaryEn: '',
    heroCtaSecondaryAr: '',
    heroCtaSecondaryEn: '',
    heroVideoUrl: '',

    teacherNameAr: '',
    teacherNameEn: '',
    teacherTitleAr: '',
    teacherTitleEn: '',
    teacherBioAr: '',
    teacherBioEn: '',
    teacherQualificationsAr: [],
    teacherQualificationsEn: [],
    teacherWhatsappCtaAr: '',
    teacherWhatsappCtaEn: '',

    curriculumBadgeAr: '',
    curriculumBadgeEn: '',
    curriculumTitleAr: '',
    curriculumTitleEn: '',
    curriculumSubtitleAr: '',
    curriculumSubtitleEn: '',

    placementBadgeAr: '',
    placementBadgeEn: '',
    placementHeadlineAr: '',
    placementHeadlineEn: '',
    placementSubtitleAr: '',
    placementSubtitleEn: '',
    placementFeature1Ar: '',
    placementFeature1En: '',
    placementFeature2Ar: '',
    placementFeature2En: '',
    placementFeature3Ar: '',
    placementFeature3En: '',
    placementCtaAr: '',
    placementCtaEn: '',

    scheduleBadgeAr: '',
    scheduleBadgeEn: '',
    scheduleTitleAr: '',
    scheduleTitleEn: '',
    scheduleSubtitleAr: '',
    scheduleSubtitleEn: '',

    pricingBadgeAr: '',
    pricingBadgeEn: '',
    pricingTitleAr: '',
    pricingTitleEn: '',
    pricingSubtitleAr: '',
    pricingSubtitleEn: '',

    supportWhatsapp: '01012345678',
    activeAcademicYear: '2026 / 2027',
    activeAcademicTerm: 'TERM_1',
    schedulesTable: [],
    landingUnitIds: []
  });

  // Dynamic Qualification Inputs
  readonly newQualAr = signal<string>('');
  readonly newQualEn = signal<string>('');

  addQualificationAr(): void {
    const text = this.newQualAr().trim();
    if (!text) return;
    this.editableCms.update(cfg => ({
      ...cfg,
      teacherQualificationsAr: [...(cfg.teacherQualificationsAr || []), text]
    }));
    this.newQualAr.set('');
  }

  removeQualificationAr(index: number): void {
    this.editableCms.update(cfg => ({
      ...cfg,
      teacherQualificationsAr: (cfg.teacherQualificationsAr || []).filter((_, i) => i !== index)
    }));
  }

  addQualificationEn(): void {
    const text = this.newQualEn().trim();
    if (!text) return;
    this.editableCms.update(cfg => ({
      ...cfg,
      teacherQualificationsEn: [...(cfg.teacherQualificationsEn || []), text]
    }));
    this.newQualEn.set('');
  }

  removeQualificationEn(index: number): void {
    this.editableCms.update(cfg => ({
      ...cfg,
      teacherQualificationsEn: (cfg.teacherQualificationsEn || []).filter((_, i) => i !== index)
    }));
  }

  // Showcased Units Management
  readonly allUnits = signal<any[]>([]);
  readonly isLoadingUnits = signal<boolean>(false);
  readonly selectedCurriculumForUnits = signal<string>('EGYPTIAN');

  readonly curriculumTabs = [
    { code: 'EGYPTIAN', label: 'المنهج المصري' },
    { code: 'GULF', label: 'المنهج الخليجي' },
    { code: 'INTERNATIONAL', label: 'المنهج الدولي البريطاني' },
    { code: 'AMERICAN', label: 'الدبلومة الأمريكية' }
  ];

  readonly filteredUnits = computed(() => {
    const curr = this.selectedCurriculumForUnits();
    return this.allUnits().filter(u => u.curriculum === curr);
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
    this.fetchUnits();
  }

  fetchUnits(): void {
    this.isLoadingUnits.set(true);
    this.http.get<{ success: boolean; data: any[] }>('/api/v1/units').subscribe({
      next: res => {
        this.allUnits.set(res?.data || []);
        this.isLoadingUnits.set(false);
      },
      error: () => {
        this.allUnits.set([]);
        this.isLoadingUnits.set(false);
      }
    });
  }

  toggleUnitOnLanding(unitId: string): void {
    this.editableCms.update(cfg => {
      const current = cfg.landingUnitIds || [];
      const exists = current.includes(unitId);
      const updated = exists ? current.filter(id => id !== unitId) : [...current, unitId];
      return {
        ...cfg,
        landingUnitIds: updated
      };
    });
  }

  isUnitSelectedForLanding(unitId: string): boolean {
    return (this.editableCms().landingUnitIds || []).includes(unitId);
  }

  selectAllUnitsForCurriculum(): void {
    const idsToAdd = this.filteredUnits().map(u => u._id);
    this.editableCms.update(cfg => {
      const current = new Set(cfg.landingUnitIds || []);
      idsToAdd.forEach(id => current.add(id));
      return {
        ...cfg,
        landingUnitIds: Array.from(current)
      };
    });
    this.toastTriggered.emit({ text: 'تم تحديد جميع وحدات المنهج للعرض للزوار!', type: 'success' });
  }

  deselectAllUnitsForCurriculum(): void {
    const idsToRemove = new Set(this.filteredUnits().map(u => u._id));
    this.editableCms.update(cfg => ({
      ...cfg,
      landingUnitIds: (cfg.landingUnitIds || []).filter(id => !idsToRemove.has(id))
    }));
    this.toastTriggered.emit({ text: 'تم إلغاء تحديد وحدات هذا المنهج من صفحة الهبوط!', type: 'warning' });
  }

  getCurriculumSelectedCount(curriculumCode: string): number {
    const selected = this.editableCms().landingUnitIds || [];
    return this.allUnits().filter(u => u.curriculum === curriculumCode && selected.includes(u._id)).length;
  }

  getCurriculumTotalCount(curriculumCode: string): number {
    return this.allUnits().filter(u => u.curriculum === curriculumCode).length;
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
