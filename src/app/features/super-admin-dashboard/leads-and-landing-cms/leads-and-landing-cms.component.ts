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
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import {
  CmsConfigAdminItem,
  LeadAdminItem,
  HonorBoardItem
} from './leads-and-landing-cms.models';
import { STUDENT_PRESET_AVATARS } from '../../../core/constants/student-avatars.constant';
import { TestimonialsService, AdminTestimonialItem } from '../../../core/services/testimonials.service';

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
  readonly langService = inject(LangService);
  private readonly http = inject(HttpClient);
  private readonly testimonialsService = inject(TestimonialsService);

  // Inputs
  readonly leadsList = input.required<LeadAdminItem[]>();
  readonly cmsConfig = input.required<CmsConfigAdminItem>();
  readonly isLoading = input<boolean>(false);

  // Outputs
  readonly cmsConfigSaved = output<CmsConfigAdminItem>();
  readonly leadStatusUpdated = output<{ leadId: string; status: 'NEW' | 'CONTACTED' | 'REGISTERED' }>();
  readonly toastTriggered = output<{ text: string; type: 'success' | 'warning' | 'error' }>();

  // Preset Student Avatars Constant for Quick Picker
  readonly studentPresetAvatars = STUDENT_PRESET_AVATARS;

  // Tabs: 'AR' (Arabic Content) | 'EN' (English Content) | 'GENERAL' (Media, Video, WhatsApp, Schedules) | 'UNITS' (Showcased Units) | 'TESTIMONIALS' | 'HONOR_BOARD'
  readonly activeCmsTab = signal<'AR' | 'EN' | 'GENERAL' | 'UNITS' | 'TESTIMONIALS' | 'HONOR_BOARD'>('AR');

  // Testimonials State
  readonly adminTestimonials = signal<AdminTestimonialItem[]>([]);
  readonly isLoadingTestimonials = signal<boolean>(false);
  readonly testimonialFilter = signal<'ALL' | 'PENDING' | 'APPROVED'>('ALL');
  readonly editingTestimonialId = signal<string | null>(null);

  readonly filteredTestimonials = computed(() => {
    const list = this.adminTestimonials();
    const filter = this.testimonialFilter();
    if (filter === 'PENDING') return list.filter((t) => !t.isApproved);
    if (filter === 'APPROVED') return list.filter((t) => t.isApproved);
    return list;
  });

  readonly pendingTestimonialsCount = computed(() => {
    return this.adminTestimonials().filter((t) => !t.isApproved).length;
  });

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

    hallOfFameBadgeAr: 'لوحة الشرف • أبطال الرياضيات',
    hallOfFameBadgeEn: 'Hall of Fame • Top Math Masters',
    hallOfFameTitleAr: 'لوحة الشرف والتفوق الأكاديمي',
    hallOfFameTitleEn: 'Academic Hall of Fame & Honor Roll',
    hallOfFameSubtitleAr: 'نخبة طلابنا الذين حققوا العلامات الكاملة وأعلى مراتب التميز والذكاء الرياضي.',
    hallOfFameSubtitleEn: 'Elite students who achieved perfect scores and mathematical excellence across all academic curricula.',
    honorBoardList: [],

    supportWhatsapp: '01012345678',
    supportTelegram: '',
    facebookUrl: '',
    youtubeUrl: '',
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
    this.loadAdminTestimonials();
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

  // =========================================================================
  // Testimonials Operations
  // =========================================================================
  loadAdminTestimonials(): void {
    this.isLoadingTestimonials.set(true);
    this.testimonialsService.getAllAdminTestimonials().subscribe({
      next: (res) => {
        this.adminTestimonials.set(res.data || []);
        this.isLoadingTestimonials.set(false);
      },
      error: () => {
        this.isLoadingTestimonials.set(false);
      }
    });
  }

  toggleTestimonialApproval(item: AdminTestimonialItem): void {
    const nextApproved = !item.isApproved;
    this.testimonialsService.updateAdminTestimonial(item.id, {
      isApproved: nextApproved,
      studentGrade: item.studentGrade,
      reviewText: item.reviewText
    }).subscribe({
      next: () => {
        this.adminTestimonials.update((list) =>
          list.map((t) =>
            t.id === item.id
              ? { ...t, isApproved: nextApproved, status: nextApproved ? 'APPROVED' : 'REJECTED' }
              : t
          )
        );
        this.toastTriggered.emit({
          text: nextApproved ? 'تم اعتماد ونشر رأي الطالب بنجاح على الصفحة الرئيسية!' : 'تم إلغاء نشر الرأي بنجاح.',
          type: 'success'
        });
      },
      error: () => {
        this.toastTriggered.emit({ text: 'تعذر تحديث حالة اعتماد الرأي.', type: 'error' });
      }
    });
  }

  saveTestimonialEdits(item: AdminTestimonialItem): void {
    this.testimonialsService.updateAdminTestimonial(item.id, {
      studentGrade: item.studentGrade,
      reviewText: item.reviewText,
      authorName: item.authorName
    }).subscribe({
      next: () => {
        this.editingTestimonialId.set(null);
        this.toastTriggered.emit({ text: 'تم حفظ وتحديث رأي الطالب ودرجته بنجاح!', type: 'success' });
      },
      error: () => {
        this.toastTriggered.emit({ text: 'تعذر حفظ التعديلات.', type: 'error' });
      }
    });
  }

  deleteTestimonial(item: AdminTestimonialItem): void {
    if (!confirm('هل أنتِ متأكدة من حذف هذا الرأي نهائياً؟')) return;
    this.testimonialsService.deleteAdminTestimonial(item.id).subscribe({
      next: () => {
        this.adminTestimonials.update((list) => list.filter((t) => t.id !== item.id));
        this.toastTriggered.emit({ text: 'تم حذف الرأي بنجاح.', type: 'success' });
      },
      error: () => {
        this.toastTriggered.emit({ text: 'تعذر حذف الرأي.', type: 'error' });
      }
    });
  }

  formatStudentStage(rawStage?: string): string {
    if (!rawStage) return '';
    const replacements: Record<string, string> = {
      'SEC_3': 'الصف الثالث الثانوي',
      'SEC_2': 'الصف الثاني الثانوي',
      'SEC_1': 'الصف الأول الثانوي',
      'PREP_3': 'الصف الثالث الإعدادي',
      'PREP_2': 'الصف الثاني الإعدادي',
      'PREP_1': 'الصف الأول الإعدادي',
      'GRADE_12': 'الصف الثاني عشر',
      'GRADE_11': 'الصف الحادي عشر',
      'GRADE_10': 'الصف العاشر',
      'IGCSE_AL': 'A-Level',
      'IGCSE_AS': 'AS-Level',
      'IGCSE_OL': 'O-Level',
      'SAT_MATH': 'SAT Math',
      'EGYPTIAN': 'المنهج المصري',
      'GULF': 'المنهج الخليجي',
      'INTERNATIONAL': 'البريطانية (IGCSE)',
      'AMERICAN': 'الأمريكية (SAT)'
    };
    let formatted = rawStage;
    for (const [key, val] of Object.entries(replacements)) {
      formatted = formatted.replace(new RegExp(`\\b${key}\\b`, 'g'), val);
    }
    return formatted;
  }

  // =========================================================================
  // Honor Board (لوحة الشرف والتفوق الأكاديمي) Management
  // =========================================================================
  readonly defaultHonorBoardTemplate: HonorBoardItem[] = [
    {
      id: 'honor_1',
      rank: 1,
      nameAr: 'سارة أحمد محمود',
      nameEn: 'Sarah Ahmed Mahmoud',
      systemAr: 'ثانوية عامة (علمي رياضة)',
      systemEn: 'Egyptian Curriculum (Thanaweya)',
      achievementAr: '100% الدرجة النهائية في التفاضل والتكامل',
      achievementEn: '100% Final Score in Calculus & Analysis',
      locationAr: 'القاهرة — مدرسة المتفوقين STEM',
      locationEn: 'Cairo — STEM High School',
      xp: 14850,
      accuracy: 99.8,
      badgeAr: 'المركز الأول على مستوى المنصة',
      badgeEn: 'Rank #1 Platform Champion',
      avatarUrl: '',
      is_active: true
    },
    {
      id: 'honor_2',
      rank: 2,
      nameAr: 'عمر خالد الشناوي',
      nameEn: 'Omar Khaled El-Shenawy',
      systemAr: 'الدبلومة الأمريكية (Digital SAT)',
      systemEn: 'American Diploma (Digital SAT Math)',
      achievementAr: '800 / 800 الدرجة الكاملة في الرياضيات',
      achievementEn: '800 / 800 Perfect Math Score',
      locationAr: 'الجيزة — مدرسة الألسن الدولية',
      locationEn: 'Giza — Al-Alson Int. School',
      xp: 13420,
      accuracy: 98.5,
      badgeAr: 'الدرجة الكاملة SAT',
      badgeEn: 'Perfect SAT Score',
      avatarUrl: '',
      is_active: true
    },
    {
      id: 'honor_3',
      rank: 3,
      nameAr: 'مريم يوسف عبد الرحمن',
      nameEn: 'Mariam Youssef Abdel-Rahman',
      systemAr: 'المنهج الخليجي (الصف 12 متقدم)',
      systemEn: 'Gulf Curriculum (Grade 12 Advanced)',
      achievementAr: '99.8% في الرياضيات المتقدمة',
      achievementEn: '99.8% in Advanced Mathematics',
      locationAr: 'الرياض — مدارس الرواد',
      locationEn: 'Riyadh — Al-Rowad Schools',
      xp: 12910,
      accuracy: 97.2,
      badgeAr: 'تفوق استثنائي',
      badgeEn: 'Exceptional Mastery',
      avatarUrl: '',
      is_active: true
    },
    {
      id: 'honor_4',
      rank: 4,
      nameAr: 'زياد طارق إبراهيم',
      nameEn: 'Ziad Tarek Ibrahim',
      systemAr: 'ثانوية عامة (الجبر والهندسة الفراغية)',
      systemEn: 'Egyptian Curriculum (Algebra & Solid Geom)',
      achievementAr: '100% الدرجة النهائية',
      achievementEn: '100% Final Score',
      locationAr: 'الإسكندرية',
      locationEn: 'Alexandria',
      xp: 11450,
      accuracy: 96.5,
      badgeAr: 'عبقري الجبر',
      badgeEn: 'Algebra Master',
      avatarUrl: '',
      is_active: true
    },
    {
      id: 'honor_5',
      rank: 5,
      nameAr: 'ياسمين حازم المهدي',
      nameEn: 'Yasmine Hazem El-Mahdy',
      systemAr: 'البريطاني الدولي (IGCSE Cambridge)',
      systemEn: 'British Curriculum (IGCSE Cambridge)',
      achievementAr: 'Grade A* في الرياضيات البحتة المتقدمة',
      achievementEn: 'Grade A* in Further Pure Math',
      locationAr: 'القاهرة',
      locationEn: 'Cairo',
      xp: 10900,
      accuracy: 98.0,
      badgeAr: 'امتياز كامبريدج',
      badgeEn: 'Cambridge A*',
      avatarUrl: '',
      is_active: true
    }
  ];

  readonly isHonoreeModalOpen = signal<boolean>(false);
  readonly editingHonoreeIndex = signal<number | null>(null);

  readonly honoreeForm = signal<HonorBoardItem>({
    id: '',
    rank: 1,
    nameAr: '',
    nameEn: '',
    systemAr: '',
    systemEn: '',
    achievementAr: '',
    achievementEn: '',
    locationAr: '',
    locationEn: '',
    xp: 10000,
    accuracy: 99.0,
    badgeAr: '',
    badgeEn: '',
    avatarUrl: '',
    is_active: true
  });

  openAddHonoreeModal(): void {
    const nextRank = (this.editableCms().honorBoardList?.length || 0) + 1;
    this.editingHonoreeIndex.set(null);
    this.honoreeForm.set({
      id: 'honor_' + Date.now(),
      rank: nextRank,
      nameAr: '',
      nameEn: '',
      systemAr: '',
      systemEn: '',
      achievementAr: '',
      achievementEn: '',
      locationAr: '',
      locationEn: '',
      xp: 10000,
      accuracy: 99.0,
      badgeAr: '',
      badgeEn: '',
      avatarUrl: '',
      is_active: true
    });
    this.isHonoreeModalOpen.set(true);
  }

  openEditHonoreeModal(index: number): void {
    const list = this.editableCms().honorBoardList || [];
    const item = list[index];
    if (!item) return;
    this.editingHonoreeIndex.set(index);
    this.honoreeForm.set({ ...item });
    this.isHonoreeModalOpen.set(true);
  }

  closeHonoreeModal(): void {
    this.isHonoreeModalOpen.set(false);
    this.editingHonoreeIndex.set(null);
  }

  onHonoreeAvatarFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.toastTriggered.emit({ text: 'يرجى اختيار ملف صورة صالح (PNG, JPEG, WebP)', type: 'warning' });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      this.toastTriggered.emit({ text: 'حجم الصورة كبير جداً (الحد الأقصى 8 ميجابايت)', type: 'warning' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 320;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          this.honoreeForm.update(f => ({ ...f, avatarUrl: compressed }));
          this.toastTriggered.emit({ text: 'تم تجهيز وحفظ صورة الطالب بنجاح!', type: 'success' });
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  removeHonoreeAvatar(): void {
    this.honoreeForm.update(f => ({ ...f, avatarUrl: '' }));
  }

  saveHonoreeModal(): void {
    const item = { ...this.honoreeForm() };
    if (!item.nameAr || !item.nameAr.trim()) {
      this.toastTriggered.emit({ text: 'يرجى كتابة اسم الطالب بالعربية على الأقل.', type: 'warning' });
      return;
    }
    item.nameAr = item.nameAr.trim();
    if (item.nameEn) item.nameEn = item.nameEn.trim();
    if (item.systemAr) item.systemAr = item.systemAr.trim();
    if (item.systemEn) item.systemEn = item.systemEn.trim();
    if (item.achievementAr) item.achievementAr = item.achievementAr.trim();
    if (item.achievementEn) item.achievementEn = item.achievementEn.trim();
    if (item.locationAr) item.locationAr = item.locationAr.trim();
    if (item.locationEn) item.locationEn = item.locationEn.trim();
    if (item.badgeAr) item.badgeAr = item.badgeAr.trim();
    if (item.badgeEn) item.badgeEn = item.badgeEn.trim();
    if (item.avatarUrl) item.avatarUrl = item.avatarUrl.trim();
    if (!item.id) item.id = 'honor_' + Date.now();
    item.rank = Number(item.rank) || 1;
    item.xp = Number(item.xp) || 0;
    item.accuracy = Number(item.accuracy) || 100;
    if (item.is_active === undefined) item.is_active = true;

    const idx = this.editingHonoreeIndex();
    this.editableCms.update(cfg => {
      const currentList = [...(cfg.honorBoardList || [])];
      if (idx !== null && idx >= 0 && idx < currentList.length) {
        currentList[idx] = item;
      } else {
        currentList.push(item);
      }
      return {
        ...cfg,
        honorBoardList: currentList
      };
    });

    this.closeHonoreeModal();
    this.toastTriggered.emit({ text: 'تم حفظ بيانات الطالب في القائمة بنجاح! تذكري الضغط على "حفظ التعديلات" بالأسفل لنشرها على الموقع.', type: 'success' });
  }

  deleteHonoree(index: number): void {
    if (!confirm('هل أنتِ متأكدة من حذف هذا الطالب من لوحة الشرف؟')) return;
    this.editableCms.update(cfg => {
      const currentList = (cfg.honorBoardList || []).filter((_, i) => i !== index);
      const reindexed = currentList.map((h, i) => ({ ...h, rank: i + 1 }));
      return {
        ...cfg,
        honorBoardList: reindexed
      };
    });
    this.toastTriggered.emit({ text: 'تم حذف الطالب من لوحة الشرف.', type: 'warning' });
  }

  toggleHonoreeStatus(index: number): void {
    this.editableCms.update(cfg => {
      const currentList = [...(cfg.honorBoardList || [])];
      if (currentList[index]) {
        currentList[index] = {
          ...currentList[index],
          is_active: currentList[index].is_active === false ? true : false
        };
      }
      return {
        ...cfg,
        honorBoardList: currentList
      };
    });
  }

  moveHonoreeUp(index: number): void {
    if (index <= 0) return;
    this.editableCms.update(cfg => {
      const currentList = [...(cfg.honorBoardList || [])];
      const temp = currentList[index];
      currentList[index] = currentList[index - 1];
      currentList[index - 1] = temp;
      const reindexed = currentList.map((h, i) => ({ ...h, rank: i + 1 }));
      return {
        ...cfg,
        honorBoardList: reindexed
      };
    });
  }

  moveHonoreeDown(index: number): void {
    const list = this.editableCms().honorBoardList || [];
    if (index >= list.length - 1) return;
    this.editableCms.update(cfg => {
      const currentList = [...(cfg.honorBoardList || [])];
      const temp = currentList[index];
      currentList[index] = currentList[index + 1];
      currentList[index + 1] = temp;
      const reindexed = currentList.map((h, i) => ({ ...h, rank: i + 1 }));
      return {
        ...cfg,
        honorBoardList: reindexed
      };
    });
  }

  populateDefaultHonorees(): void {
    if ((this.editableCms().honorBoardList || []).length > 0) {
      if (!confirm('هذا الإجراء سيستبدل قائمة لوحة الشرف الحالية بالنموذج الافتراضي. هل تريدين المتابعة؟')) return;
    }
    this.editableCms.update(cfg => ({
      ...cfg,
      honorBoardList: JSON.parse(JSON.stringify(this.defaultHonorBoardTemplate))
    }));
    this.toastTriggered.emit({ text: 'تم تحميل نموذج لوحة الشرف بنجاح. يمكنك تعديل أسماء وبيانات الطلاب والضغط على حفظ.', type: 'success' });
  }
}
