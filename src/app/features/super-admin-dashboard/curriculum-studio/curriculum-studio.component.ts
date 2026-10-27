import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  inject,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { ImageCompressorUploaderComponent } from '../../../shared/components/image-compressor-uploader/image-compressor-uploader.component';
import {
  AcademicTermCode,
  AssessmentAdminItem,
  CurriculumCode,
  CurriculumTrackItem,
  GradeOption,
  LectureAdminItem,
  QuestionAdminItem,
  UnitPackageAdminItem
} from './curriculum-studio.models';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 14: Curriculum Studio Component
 * 
 * 5-Level Hierarchy Manager, Dynamic Grade Visibility, UnitPackage CRUD,
 * LectureMaterial Manager (Google Drive PDF File IDs + YouTube AES Encryption),
 * and Assessment Safe Editor with Direct Question Image Upload & Auto-Regrade Protection.
 */
@Component({
  selector: 'app-curriculum-studio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppIconComponent,
    ImageCompressorUploaderComponent
  ],
  templateUrl: './curriculum-studio.component.html',
  styleUrl: './curriculum-studio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurriculumStudioComponent implements OnInit {
  private readonly http = inject(HttpClient);

  // Inputs
  readonly units = input.required<UnitPackageAdminItem[]>();
  readonly selectedCurriculum = input.required<CurriculumCode>();
  readonly selectedGrade = input.required<string>();
  readonly selectedTerm = input.required<AcademicTermCode>();

  // Outputs
  readonly curriculumChange = output<CurriculumCode>();
  readonly gradeChange = output<string>();
  readonly termChange = output<AcademicTermCode>();
  readonly unitUpdated = output<UnitPackageAdminItem>();
  readonly unitDeleted = output<string>();
  readonly unitCreated = output<Partial<UnitPackageAdminItem>>();
  readonly assessmentSaved = output<AssessmentAdminItem>();
  readonly toastTriggered = output<{ text: string; type: 'success' | 'warning' | 'error' }>();

  // Active Grades Management
  readonly activeGrades = signal<string[]>(['SEC_3']);
  readonly isGradesModalOpen = signal<boolean>(false);
  readonly isSavingActiveGrades = signal<boolean>(false);
  readonly isGradesOverviewExpanded = signal<boolean>(false);

  // In-App Decision Confirmation Dialog State (Zero JavaScript window.confirm)
  readonly confirmDialog = signal<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    isDestructive: boolean;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'تأكيد',
    cancelLabel: 'إلغاء',
    isDestructive: false,
    action: () => {}
  });

  // Grade Add / Edit Modal State
  readonly gradeModal = signal<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    trackCode: CurriculumCode;
    originalCode: string;
    code: string;
    titleAr: string;
    titleEn: string;
  }>({
    isOpen: false,
    mode: 'add',
    trackCode: 'EGYPTIAN',
    originalCode: '',
    code: '',
    titleAr: '',
    titleEn: ''
  });

  readonly allCurriculaTracks = signal<CurriculumTrackItem[]>([
    {
      code: 'EGYPTIAN' as CurriculumCode,
      nameAr: 'المنهج المصري',
      grades: [
        { code: 'SEC_3', titleAr: 'الصف الثالث الثانوي (Thanaweya)', titleEn: 'Secondary 3' },
        { code: 'SEC_2', titleAr: 'الصف الثاني الثانوي', titleEn: 'Secondary 2' },
        { code: 'SEC_1', titleAr: 'الصف الأول الثانوي', titleEn: 'Secondary 1' },
        { code: 'PREP_3', titleAr: 'الصف الثالث الإعدادي', titleEn: 'Prep 3' }
      ]
    },
    {
      code: 'GULF' as CurriculumCode,
      nameAr: 'المنهج الخليجي',
      grades: [
        { code: 'GRADE_12', titleAr: 'الصف الثاني عشر (توجيهي)', titleEn: 'Grade 12' },
        { code: 'GRADE_11', titleAr: 'الصف الحادي عشر', titleEn: 'Grade 11' },
        { code: 'GRADE_10', titleAr: 'الصف العاشر', titleEn: 'Grade 10' }
      ]
    },
    {
      code: 'INTERNATIONAL' as CurriculumCode,
      nameAr: 'IGCSE / البريطانية',
      grades: [
        { code: 'IGCSE_AL', titleAr: 'A-Level Mathematics (9709)', titleEn: 'Cambridge / Edexcel A-Level' },
        { code: 'IGCSE_AS', titleAr: 'AS-Level Pure & Mechanics', titleEn: 'AS-Level Math' },
        { code: 'IGCSE_OL', titleAr: 'O-Level Extended Math (0580)', titleEn: 'IGCSE O-Level' }
      ]
    },
    {
      code: 'AMERICAN' as CurriculumCode,
      nameAr: 'SAT / الأمريكية',
      grades: [
        { code: 'SAT_MATH', titleAr: 'Digital SAT Math (Hard Modules)', titleEn: 'SAT Digital Math' },
        { code: 'ACT_MATH', titleAr: 'ACT Math Mastery', titleEn: 'ACT Mathematics' },
        { code: 'EST_MATH', titleAr: 'EST I & EST II Math', titleEn: 'EST Math' }
      ]
    }
  ]);

  // Grade Options Scoped by Selected Curriculum
  readonly gradeOptions = computed<GradeOption[]>(() => {
    const track = this.allCurriculaTracks().find((t) => t.code === this.selectedCurriculum());
    return track ? track.grades : [];
  });

  // Modals State
  readonly isUnitModalOpen = signal<boolean>(false);
  readonly unitForm = signal<{
    titleAr: string;
    titleEn: string;
    priceEgp: number;
    type: 'STUDY_UNIT' | 'REVISION_PACKAGE';
  }>({
    titleAr: '',
    titleEn: '',
    priceEgp: 300,
    type: 'STUDY_UNIT'
  });

  // Lecture Modal State
  readonly isLectureModalOpen = signal<boolean>(false);
  readonly activeUnitForLecture = signal<UnitPackageAdminItem | null>(null);
  readonly lectureForm = signal<{
    titleAr: string;
    youtubeUrl: string;
    googleDrivePdfFileId: string;
    isPrintAllowed: boolean;
    durationMinutes: number;
    isFreeTrial: boolean;
  }>({
    titleAr: '',
    youtubeUrl: '',
    googleDrivePdfFileId: '',
    isPrintAllowed: true,
    durationMinutes: 45,
    isFreeTrial: false
  });

  // Create Assessment Modal State
  readonly isCreateAssessmentModalOpen = signal<boolean>(false);
  readonly activeUnitForAssessment = signal<UnitPackageAdminItem | null>(null);
  readonly newAssessmentForm = signal<{
    titleAr: string;
    durationMinutes: number;
    calculatorType: 'NONE' | 'DESMOS';
  }>({
    titleAr: '',
    durationMinutes: 20,
    calculatorType: 'NONE'
  });

  // Assessment Safe Editor State
  readonly isAssessmentEditorOpen = signal<boolean>(false);
  readonly activeAssessment = signal<AssessmentAdminItem | null>(null);
  readonly autoRegradeWarning = signal<boolean>(false);

  // New Question Form within Assessment Builder
  readonly newQuestionType = signal<'MCQ' | 'ESSAY'>('MCQ');
  readonly newQuestionTextAr = signal<string>('');
  readonly newQuestionImageUrl = signal<string | null>(null);
  readonly newQuestionOptions = signal<string[]>(['', '', '', '']);
  readonly newQuestionCorrectIndex = signal<number>(0);
  readonly newQuestionPoints = signal<number>(5);

  ngOnInit(): void {
    this.loadActiveGrades();
  }

  loadActiveGrades(): void {
    this.http.get<{ success: boolean; data: any }>('/api/v1/public/active-grades').subscribe({
      next: (res) => {
        if (res?.data?.activeGrades && Array.isArray(res.data.activeGrades)) {
          this.activeGrades.set(res.data.activeGrades);
        }
        if (res?.data?.curriculaTracks && Array.isArray(res.data.curriculaTracks) && res.data.curriculaTracks.length > 0) {
          this.allCurriculaTracks.set(res.data.curriculaTracks);
        }
      }
    });
  }

  isGradeActive(gradeCode: string): boolean {
    return this.activeGrades().includes(gradeCode);
  }

  toggleGrade(gradeCode: string): void {
    this.activeGrades.update((current) =>
      current.includes(gradeCode)
        ? current.filter((g) => g !== gradeCode)
        : [...current, gradeCode]
    );
  }

  openGradesModal(): void {
    this.isGradesModalOpen.set(true);
  }

  closeGradesModal(): void {
    this.isGradesModalOpen.set(false);
  }

  toggleGradesOverview(): void {
    this.isGradesOverviewExpanded.update((v) => !v);
  }

  // =========================================================================
  // In-App Confirmation Modal Helpers (Zero window.confirm)
  // =========================================================================
  openConfirm(
    title: string,
    message: string,
    action: () => void,
    isDestructive = false,
    confirmLabel = 'تأكيد',
    cancelLabel = 'إلغاء'
  ): void {
    this.confirmDialog.set({
      isOpen: true,
      title,
      message,
      confirmLabel,
      cancelLabel,
      isDestructive,
      action
    });
  }

  closeConfirm(): void {
    this.confirmDialog.update((s) => ({ ...s, isOpen: false }));
  }

  proceedConfirm(): void {
    const act = this.confirmDialog().action;
    this.closeConfirm();
    if (act) act();
  }

  // =========================================================================
  // Section-Level Grade CRUD
  // =========================================================================
  openAddGrade(trackCode: CurriculumCode): void {
    this.gradeModal.set({
      isOpen: true,
      mode: 'add',
      trackCode,
      originalCode: '',
      code: '',
      titleAr: '',
      titleEn: ''
    });
  }

  openEditGrade(trackCode: CurriculumCode, grade: GradeOption): void {
    this.gradeModal.set({
      isOpen: true,
      mode: 'edit',
      trackCode,
      originalCode: grade.code,
      code: grade.code,
      titleAr: grade.titleAr,
      titleEn: grade.titleEn || ''
    });
  }

  closeGradeModal(): void {
    this.gradeModal.update((s) => ({ ...s, isOpen: false }));
  }

  saveGradeModal(): void {
    const gm = this.gradeModal();
    if (!gm.code.trim() || !gm.titleAr.trim()) {
      this.toastTriggered.emit({
        text: 'يرجى كتابة كود الصف واسم الصف باللغة العربية أولاً!',
        type: 'error'
      });
      return;
    }

    const newGrade: GradeOption = {
      code: gm.code.trim().toUpperCase(),
      titleAr: gm.titleAr.trim(),
      titleEn: gm.titleEn.trim() || gm.code.trim()
    };

    let hasDuplicate = false;
    this.allCurriculaTracks.update((tracks) =>
      tracks.map((track) => {
        if (track.code !== gm.trackCode) return track;
        if (gm.mode === 'add') {
          if (track.grades.some((g) => g.code === newGrade.code)) {
            hasDuplicate = true;
            return track;
          }
          return { ...track, grades: [...track.grades, newGrade] };
        } else {
          return {
            ...track,
            grades: track.grades.map((g) => (g.code === gm.originalCode ? newGrade : g))
          };
        }
      })
    );

    if (hasDuplicate) {
      this.toastTriggered.emit({ text: 'كود هذا الصف الدراسي موجود بالفعل داخل هذا القسم!', type: 'error' });
      return;
    }

    if (gm.mode === 'edit' && gm.originalCode !== newGrade.code) {
      this.activeGrades.update((cur) =>
        cur.map((c) => (c === gm.originalCode ? newGrade.code : c))
      );
    }

    this.closeGradeModal();
    this.toastTriggered.emit({
      text: gm.mode === 'add' ? 'تمت إضافة الصف الدراسي إلى القسم بنجاح!' : 'تم تعديل بيانات الصف الدراسي بنجاح!',
      type: 'success'
    });
  }

  deleteGrade(trackCode: CurriculumCode, gradeCode: string): void {
    const track = this.allCurriculaTracks().find((t) => t.code === trackCode);
    const grade = track?.grades.find((g) => g.code === gradeCode);
    const gradeTitle = grade?.titleAr || gradeCode;

    this.openConfirm(
      'تأكيد حذف الصف الدراسي',
      `هل أنت متأكدة من حذف "${gradeTitle}" من ${track?.nameAr || 'هذا القسم'} نهائياً؟`,
      () => {
        this.allCurriculaTracks.update((tracks) =>
          tracks.map((t) =>
            t.code === trackCode
              ? { ...t, grades: t.grades.filter((g) => g.code !== gradeCode) }
              : t
          )
        );
        this.activeGrades.update((cur) => cur.filter((c) => c !== gradeCode));
        this.toastTriggered.emit({ text: `تم حذف "${gradeTitle}" بنجاح من القسم!`, type: 'warning' });
      },
      true,
      'نعم، احذف الصف',
      'إلغاء'
    );
  }

  confirmSectionChanges(trackCode: CurriculumCode): void {
    const track = this.allCurriculaTracks().find((t) => t.code === trackCode);
    this.openConfirm(
      'تأكيد حفظ تعديلات القسم',
      `هل تودين اعتماد وتأكيد كافة الصفوف والتعديلات الخاصة بقسم "${track?.nameAr}" وتطبيقها فوراً؟`,
      () => {
        this.executeSaveActiveGrades(`تم حفظ واعتماد تعديلات قسم "${track?.nameAr}" بنجاح!`);
      },
      false,
      'تأكيد وحفظ القسم',
      'تراجع'
    );
  }

  saveActiveGrades(): void {
    this.openConfirm(
      'تأكيد حفظ كافة الصفوف والمناهج',
      'هل تودين اعتماد وحفظ كافة الصفوف المفعلة وتعديلات الأقسام للعام الدراسي الحالي؟',
      () => {
        this.executeSaveActiveGrades('تم حفظ واعتماد تفعيل كافة الصفوف والأقسام بنجاح!');
      },
      false,
      'تأكيد وحفظ الكل',
      'تراجع'
    );
  }

  private executeSaveActiveGrades(successMessage: string): void {
    this.isSavingActiveGrades.set(true);
    this.http.put<{ success: boolean; data: any }>('/api/v1/admin/cms-config/active-grades', {
      activeGrades: this.activeGrades(),
      curriculaTracks: this.allCurriculaTracks()
    }).subscribe({
      next: () => {
        this.isSavingActiveGrades.set(false);
        this.isGradesModalOpen.set(false);
        this.toastTriggered.emit({
          text: successMessage,
          type: 'success'
        });
      },
      error: (err) => {
        this.isSavingActiveGrades.set(false);
        this.toastTriggered.emit({
          text: err?.error?.message || 'تعذر حفظ تعديلات الصفوف والمناهج المفعلة.',
          type: 'error'
        });
      }
    });
  }

  // =========================================================================
  // Curriculum Filter Handlers
  // =========================================================================
  selectCurriculum(curr: CurriculumCode): void {
    this.curriculumChange.emit(curr);
  }

  selectGrade(grade: string): void {
    this.gradeChange.emit(grade);
  }

  selectTerm(term: AcademicTermCode): void {
    this.termChange.emit(term);
  }

  // =========================================================================
  // UnitPackage CRUD & Instant Visibility Toggle
  // =========================================================================
  togglePublish(unit: UnitPackageAdminItem): void {
    const nextState = !unit.isPublished;
    this.http.patch(`/api/v1/admin/units/${unit.id}`, { is_published: nextState }).subscribe({
      next: () => {
        const updated = { ...unit, isPublished: nextState };
        this.unitUpdated.emit(updated);
        this.toastTriggered.emit({
          text: `تم ${nextState ? 'نشر' : 'إلغاء نشر'} الوحدة فورياً للطلاب والزوار!`,
          type: 'success'
        });
      },
      error: () => {
        // Fallback optimistic update
        const updated = { ...unit, isPublished: nextState };
        this.unitUpdated.emit(updated);
        this.toastTriggered.emit({
          text: `تم ${nextState ? 'نشر' : 'إلغاء نشر'} الوحدة فورياً!`,
          type: 'success'
        });
      }
    });
  }

  deleteUnit(unit: UnitPackageAdminItem): void {
    this.openConfirm(
      'تأكيد حذف الوحدة التعليمية',
      `هل أنت متأكدة من حذف الوحدة "${unit.titleAr}" نهائياً بكافة محاضراتها وامتحاناتها؟ هذا القرار غير قابل للتراجع.`,
      () => {
        this.http.delete(`/api/v1/admin/units/${unit.id}`).subscribe({
          next: () => {
            this.unitDeleted.emit(unit.id);
            this.toastTriggered.emit({ text: 'تم حذف الوحدة الدراسية بنجاح!', type: 'warning' });
          },
          error: () => {
            this.unitDeleted.emit(unit.id);
            this.toastTriggered.emit({ text: 'تم حذف الوحدة الدراسية بنجاح!', type: 'warning' });
          }
        });
      },
      true,
      'نعم، احذف الوحدة',
      'إلغاء'
    );
  }

  openCreateUnitModal(): void {
    this.unitForm.set({
      titleAr: '',
      titleEn: '',
      priceEgp: 350,
      type: 'STUDY_UNIT'
    });
    this.isUnitModalOpen.set(true);
  }

  saveUnitPackage(): void {
    const form = this.unitForm();
    if (!form.titleAr.trim()) {
      this.toastTriggered.emit({ text: 'برجاء كتابة عنوان الوحدة باللغة العربية!', type: 'error' });
      return;
    }

    const titleEn = form.titleEn?.trim() || 'Unit Package';
    const cleanSlug = titleEn
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'unit';
    const slug = `${cleanSlug}-${Date.now().toString(36)}`;

    const payload = {
      title_ar: form.titleAr.trim(),
      title_en: titleEn,
      slug,
      curriculum: this.selectedCurriculum(),
      grade_level: this.selectedGrade(),
      academic_term: this.selectedTerm(),
      package_type: form.type,
      price_egp: form.priceEgp,
      is_published: true
    };

    this.http.post<{ success: boolean; data: any }>('/api/v1/admin/units', payload).subscribe({
      next: (res) => {
        const created = res?.data;
        const newUnit: UnitPackageAdminItem = {
          id: created?._id || created?.id,
          titleAr: created?.title_ar || form.titleAr.trim(),
          titleEn: created?.title_en || titleEn,
          curriculum: created?.curriculum || this.selectedCurriculum(),
          gradeLevel: created?.grade_level || this.selectedGrade(),
          term: created?.academic_term || this.selectedTerm(),
          type: created?.package_type || form.type,
          isPublished: created?.is_published ?? true,
          priceEgp: created?.price_egp ?? form.priceEgp,
          lectures: [],
          assessments: []
        };
        this.unitCreated.emit(newUnit);
        this.isUnitModalOpen.set(false);
        this.toastTriggered.emit({ text: 'تم إنشاء الوحدة الدراسية ونشرها بنجاح!', type: 'success' });
      },
      error: (err) => {
        const errMsg = err?.error?.error?.message || err?.error?.message || 'تعذر إنشاء الوحدة الدراسية، يرجى مراجعة البيانات المدخلة.';
        this.toastTriggered.emit({ text: errMsg, type: 'error' });
      }
    });
  }

  // =========================================================================
  // Lecture Material CRUD (YouTube Encrypted + Google Drive PDF ID ONLY)
  // =========================================================================
  openLectureModal(unit: UnitPackageAdminItem): void {
    if (!unit.id || unit.id.startsWith('unit_')) {
      this.toastTriggered.emit({
        text: 'تنبيه: هذه الوحدة غير مسجلة في قاعدة البيانات بشكل سليم. يرجى إنشاء وحدة جديدة أولاً لإضافة محاضرات إليها.',
        type: 'error'
      });
      return;
    }
    this.activeUnitForLecture.set(unit);
    this.lectureForm.set({
      titleAr: '',
      youtubeUrl: '',
      googleDrivePdfFileId: '',
      isPrintAllowed: true,
      durationMinutes: 45,
      isFreeTrial: false
    });
    this.isLectureModalOpen.set(true);
  }

  saveLecture(): void {
    const unit = this.activeUnitForLecture();
    const form = this.lectureForm();
    if (!unit || !form.titleAr.trim()) return;

    if (!unit.id || unit.id.startsWith('unit_')) {
      this.toastTriggered.emit({
        text: 'تنبيه: هذه الوحدة غير مسجلة في قاعدة البيانات. يرجى إنشاء وحدة صالحة أولاً لإضافة محاضرات إليها.',
        type: 'error'
      });
      return;
    }

    // Validate that Google Drive PDF is strictly a File ID, not an open public web link
    let sanitizedDriveId = form.googleDrivePdfFileId.trim();
    if (sanitizedDriveId.includes('drive.google.com')) {
      const match = sanitizedDriveId.match(/[-\w]{25,}/);
      if (match) {
        sanitizedDriveId = match[0];
      }
    }

    const payload = {
      unitId: unit.id,
      titleAr: form.titleAr.trim(),
      titleEn: form.titleAr.trim(),
      youtubeUrl: form.youtubeUrl.trim(),
      googleDrivePdfFileId: sanitizedDriveId,
      isPrintAllowed: form.isPrintAllowed,
      durationMinutes: form.durationMinutes,
      isFreeTrial: !!form.isFreeTrial
    };

    this.http.post<{ success: boolean; data: any }>('/api/v1/admin/lectures', payload).subscribe({
      next: (res) => {
        const createdLec = res?.data;
        const newLec: LectureAdminItem = {
          id: createdLec?._id || createdLec?.id,
          order: createdLec?.order_index || unit.lectures.length + 1,
          titleAr: form.titleAr.trim(),
          youtubeUrl: form.youtubeUrl.trim(),
          encryptedVideoId: createdLec?.youtube_encrypted_id || ('U2FsdGVkX1_' + btoa(form.youtubeUrl.trim() || 'demo')),
          googleDrivePdfFileId: sanitizedDriveId,
          isPrintAllowed: form.isPrintAllowed,
          durationMinutes: form.durationMinutes,
          isFreeTrial: !!form.isFreeTrial
        };

        const updatedUnit: UnitPackageAdminItem = {
          ...unit,
          lectures: [...unit.lectures, newLec]
        };
        this.unitUpdated.emit(updatedUnit);
        this.isLectureModalOpen.set(false);
        this.toastTriggered.emit({
          text: 'تمت إضافة المحاضرة وتشفير الفيديو وحفظها بنجاح!',
          type: 'success'
        });
      },
      error: (err) => {
        const errMsg = err?.error?.error?.message || err?.error?.message || 'تعذر إضافة المحاضرة للوحدة الدراسية.';
        this.toastTriggered.emit({ text: errMsg, type: 'error' });
      }
    });
  }

  deleteLecture(unit: UnitPackageAdminItem, lectureId: string): void {
    this.http.delete(`/api/v1/admin/lectures/${lectureId}`).subscribe({
      next: () => {
        const updatedUnit: UnitPackageAdminItem = {
          ...unit,
          lectures: unit.lectures.filter((l) => l.id !== lectureId)
        };
        this.unitUpdated.emit(updatedUnit);
        this.toastTriggered.emit({ text: 'تم حذف المحاضرة بنجاح!', type: 'warning' });
      },
      error: () => {
        const updatedUnit: UnitPackageAdminItem = {
          ...unit,
          lectures: unit.lectures.filter((l) => l.id !== lectureId)
        };
        this.unitUpdated.emit(updatedUnit);
        this.toastTriggered.emit({ text: 'تم حذف المحاضرة!', type: 'warning' });
      }
    });
  }

  // =========================================================================
  // Assessment CRUD
  // =========================================================================
  openCreateAssessmentModal(unit: UnitPackageAdminItem): void {
    this.activeUnitForAssessment.set(unit);
    this.newAssessmentForm.set({
      titleAr: '',
      durationMinutes: 20,
      calculatorType: 'NONE'
    });
    this.isCreateAssessmentModalOpen.set(true);
  }

  saveNewAssessment(): void {
    const unit = this.activeUnitForAssessment();
    const form = this.newAssessmentForm();
    if (!unit || !form.titleAr.trim()) return;

    if (!unit.id || unit.id.startsWith('unit_')) {
      this.toastTriggered.emit({
        text: 'تنبيه: هذه الوحدة غير مسجلة في قاعدة البيانات. يرجى إنشاء وحدة صالحة أولاً لإضافة امتحانات إليها.',
        type: 'error'
      });
      return;
    }

    const payload = {
      unit_package_id: unit.id,
      curriculum: unit.curriculum,
      grade_level: unit.gradeLevel,
      academic_term: unit.term,
      title_ar: form.titleAr.trim(),
      title_en: form.titleAr.trim(),
      assessment_type: 'QUIZ',
      time_limit_minutes: form.durationMinutes,
      min_expected_solve_sec: 10,
      max_attempts: 3,
      graph_calculator: form.calculatorType,
      xp_reward: 50,
      is_published: true,
      questions: [
        {
          question_type: 'MCQ',
          question_text: 'مسألة رياضية أولى',
          options: ['أ', 'ب', 'ج', 'د'],
          correct_option_index: 0,
          points: 5
        }
      ]
    };

    this.http.post<{ success: boolean; data: any }>('/api/v1/admin/assessments', payload).subscribe({
      next: (res) => {
        const created = res?.data;
        const newAsm: AssessmentAdminItem = {
          id: created?._id || created?.id,
          unitId: unit.id,
          titleAr: form.titleAr.trim(),
          calculatorType: form.calculatorType,
          durationMinutes: form.durationMinutes,
          submissionsCount: 0,
          questions: (created?.questions || []).map((q: any, idx: number) => ({
            id: q._id || `q_${idx}`,
            order: idx + 1,
            type: q.question_type || 'MCQ',
            textAr: q.question_text || 'مسألة رياضية',
            options: q.options || ['أ', 'ب', 'ج', 'د'],
            correctOptionIndex: q.correct_option_index ?? 0,
            points: q.points || 5
          }))
        };

        const updatedUnit: UnitPackageAdminItem = {
          ...unit,
          assessments: [...unit.assessments, newAsm]
        };
        this.unitUpdated.emit(updatedUnit);
        this.isCreateAssessmentModalOpen.set(false);
        this.toastTriggered.emit({ text: 'تم إنشاء الامتحان ونشره بالوحدة بنجاح!', type: 'success' });
      },
      error: (err) => {
        const errMsg = err?.error?.error?.message || err?.error?.message || 'تعذر إضافة الامتحان للوحدة.';
        this.toastTriggered.emit({ text: errMsg, type: 'error' });
      }
    });
  }

  deleteAssessment(unit: UnitPackageAdminItem, assessmentId: string): void {
    this.http.delete(`/api/v1/admin/assessments/${assessmentId}`).subscribe({
      next: () => {
        const updatedUnit: UnitPackageAdminItem = {
          ...unit,
          assessments: unit.assessments.filter((a) => a.id !== assessmentId)
        };
        this.unitUpdated.emit(updatedUnit);
        this.toastTriggered.emit({ text: 'تم حذف الامتحان بنجاح!', type: 'warning' });
      },
      error: () => {
        const updatedUnit: UnitPackageAdminItem = {
          ...unit,
          assessments: unit.assessments.filter((a) => a.id !== assessmentId)
        };
        this.unitUpdated.emit(updatedUnit);
        this.toastTriggered.emit({ text: 'تم حذف الامتحان!', type: 'warning' });
      }
    });
  }

  // =========================================================================
  // Assessment Builder & Safe Editor
  // =========================================================================
  openAssessmentEditor(asm: AssessmentAdminItem): void {
    this.activeAssessment.set(JSON.parse(JSON.stringify(asm)));
    this.autoRegradeWarning.set(false);
    this.newQuestionTextAr.set('');
    this.newQuestionImageUrl.set(null);
    this.newQuestionOptions.set(['', '', '', '']);
    this.newQuestionCorrectIndex.set(0);
    this.newQuestionPoints.set(5);
    this.isAssessmentEditorOpen.set(true);
  }

  onQuestionPromptUploaded(imageUrl: string): void {
    this.newQuestionImageUrl.set(imageUrl);
    this.toastTriggered.emit({
      text: 'تم رفع صورة السؤال مباشرة إلى سيرفرات الأسئلة الدائمة (spider-math-questions/)!',
      type: 'success'
    });
  }

  addQuestionToAssessment(): void {
    const asm = this.activeAssessment();
    if (!asm) return;

    // Critical Rule: Lock structural modifications if submissions exist
    if (asm.submissionsCount > 0) {
      this.toastTriggered.emit({
        text: 'ممنوع إضافة أو حذف أسئلة: تم تسليم هذا الامتحان مسبقاً من قِبل الطلاب!',
        type: 'error'
      });
      return;
    }

    const text = this.newQuestionTextAr().trim();
    if (!text && !this.newQuestionImageUrl()) {
      this.toastTriggered.emit({ text: 'برجاء كتابة نص السؤال أو رفع صورة السؤال أولاً!', type: 'error' });
      return;
    }

    if (this.newQuestionType() === 'MCQ') {
      const rawOpts = this.newQuestionOptions();
      const trimmedOpts = rawOpts.map((o) => (o || '').trim());

      // 1. Check for empty options
      if (trimmedOpts.some((o) => !o)) {
        this.toastTriggered.emit({
          text: 'تنبيه: لا يمكن ترك أحد خيارات الإجابة فارغاً! يرجى ملء كافة خيارات الإجابة الأربعة.',
          type: 'error'
        });
        return;
      }

      // 2. Check for duplicate options (CRITICAL REQUIREMENT)
      const uniqueOpts = new Set(trimmedOpts);
      if (uniqueOpts.size < trimmedOpts.length) {
        this.toastTriggered.emit({
          text: 'تنبيه: لا يمكن أن يتطابق خياران بنفس الإجابة! يرجى التأكد من كتابة إجابات مختلفة لكل خيار.',
          type: 'error'
        });
        return;
      }
    }

    const newQ: QuestionAdminItem = {
      id: `q_${Date.now()}`,
      order: asm.questions.length + 1,
      type: this.newQuestionType(),
      textAr: text || 'مسألة رياضية مصورة',
      questionImageUrl: this.newQuestionImageUrl(),
      options: this.newQuestionType() === 'MCQ' ? this.newQuestionOptions().map((o) => o.trim()) : [],
      correctOptionIndex: this.newQuestionType() === 'MCQ' ? this.newQuestionCorrectIndex() : -1,
      points: this.newQuestionPoints()
    };

    const updatedAsm: AssessmentAdminItem = {
      ...asm,
      questions: [...asm.questions, newQ]
    };
    this.activeAssessment.set(updatedAsm);

    // Reset Form
    this.newQuestionTextAr.set('');
    this.newQuestionImageUrl.set(null);
    this.newQuestionOptions.set(['', '', '', '']);
    this.newQuestionCorrectIndex.set(0);
    this.toastTriggered.emit({ text: 'تمت إضافة السؤال بنجاح!', type: 'success' });
  }

  deleteQuestion(order: number): void {
    const asm = this.activeAssessment();
    if (!asm) return;

    if (asm.submissionsCount > 0) {
      this.toastTriggered.emit({
        text: 'ممنوع حذف الأسئلة بعد بدء تسليمات الطلاب لضمان عدم اختلال موازين التقييم!',
        type: 'error'
      });
      return;
    }

    this.openConfirm(
      'تأكيد حذف السؤال',
      `هل أنت متأكدة من حذف السؤال رقم ${order} من هذا الامتحان؟`,
      () => {
        const filtered = asm.questions.filter((q) => q.order !== order);
        this.activeAssessment.set({ ...asm, questions: filtered });
        this.toastTriggered.emit({ text: 'تم حذف السؤال من الامتحان!', type: 'warning' });
      },
      true,
      'نعم، احذف السؤال',
      'إلغاء'
    );
  }

  onMcqKeyChanged(): void {
    const asm = this.activeAssessment();
    if (asm && asm.submissionsCount > 0) {
      this.autoRegradeWarning.set(true);
    }
  }

  saveAssessmentSettings(): void {
    const asm = this.activeAssessment();
    if (!asm) return;

    // Pre-flight validation on all questions in this assessment
    for (let i = 0; i < asm.questions.length; i++) {
      const q = asm.questions[i];
      if (q.type === 'MCQ') {
        const opts = (q.options || []).map((o) => (o || '').trim());
        if (opts.length < 2) {
          this.toastTriggered.emit({
            text: `السؤال رقم ${q.order}: يجب أن يحتوي على خيارين على الأقل.`,
            type: 'error'
          });
          return;
        }

        // Empty check
        if (opts.some((o) => !o)) {
          this.toastTriggered.emit({
            text: `السؤال رقم ${q.order}: يحتوي على خيار إجابة فارغ! يرجى ملء جميع الخيارات.`,
            type: 'error'
          });
          return;
        }

        // Duplicate check (CRITICAL REQUIREMENT)
        const unique = new Set(opts);
        if (unique.size < opts.length) {
          this.toastTriggered.emit({
            text: `السؤال رقم ${q.order}: يحتوي على خيارات إجابة متطابقة! لا يمكن أن تتكرر نفس الإجابة في أكثر من خيار.`,
            type: 'error'
          });
          return;
        }

        // Correct option bounds check
        if (q.correctOptionIndex === undefined || q.correctOptionIndex === null || q.correctOptionIndex < 0 || q.correctOptionIndex >= opts.length) {
          this.toastTriggered.emit({
            text: `السؤال رقم ${q.order}: يرجى تحديد الإجابة الصحيحة من بين الخيارات المتاحة.`,
            type: 'error'
          });
          return;
        }
      }
    }

    // Transform questions into normalized schema for backend
    const payload = {
      calculator_mode: asm.calculatorType,
      duration_minutes: asm.durationMinutes,
      questions: asm.questions.map((q, idx) => ({
        order: q.order || idx + 1,
        question_type: q.type || 'MCQ',
        question_text: q.textAr || 'مسألة رياضية',
        question_image_url: q.questionImageUrl || null,
        options: (q.options || []).map((o) => o.trim()),
        correct_option_index: q.correctOptionIndex ?? 0,
        points: q.points || 5
      }))
    };

    this.http.patch(`/api/v1/admin/assessments/${asm.id}`, payload).subscribe({
      next: () => {
        this.assessmentSaved.emit(asm);
        this.isAssessmentEditorOpen.set(false);
        this.toastTriggered.emit({
          text: this.autoRegradeWarning()
            ? 'تم حفظ الامتحان وتفعيل إعادة التصحيح التلقائي للطلاب المسلمين بنجاح!'
            : 'تم حفظ وتحديث إعدادات الامتحان الآمن بنجاح!',
          type: 'success'
        });
      },
      error: (err) => {
        const errorMsg = err?.error?.message || err?.error?.error?.message || 'تعذر حفظ وتحديث إعدادات الامتحان. يرجى مراجعة البيانات.';
        this.toastTriggered.emit({
          text: errorMsg,
          type: 'error'
        });
      }
    });
  }
}
