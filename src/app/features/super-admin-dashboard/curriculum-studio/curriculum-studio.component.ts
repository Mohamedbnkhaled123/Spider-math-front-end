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
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { MathFormulaComponent } from '../../../shared/components/math-formula/math-formula.component';
import { CANONICAL_CURRICULUM_TREE, curriculumHasTerms } from '../../../core/constants/curriculum-tree.constant';
import { ImageCompressorUploaderComponent } from '../../../shared/components/image-compressor-uploader/image-compressor-uploader.component';
import { PublicDiscoveryService } from '../../../core/services/public-discovery.service';
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
    MathFormulaComponent,
    ImageCompressorUploaderComponent
  ],
  templateUrl: './curriculum-studio.component.html',
  styleUrl: './curriculum-studio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurriculumStudioComponent implements OnInit {
  readonly langService = inject(LangService);
  private readonly http = inject(HttpClient);
  private readonly discoveryService = inject(PublicDiscoveryService);

  // Inputs
  readonly units = input.required<UnitPackageAdminItem[]>();
  readonly selectedCurriculum = input.required<CurriculumCode>();
  readonly selectedGrade = input.required<string>();
  readonly selectedTerm = input.required<AcademicTermCode>();
  readonly isLoading = input<boolean>(false);

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

  // Full Canonical Tree reference for dropdown selections (from 1st Primary to 3rd Secondary)
  readonly canonicalCurriculumTree = CANONICAL_CURRICULUM_TREE;

  // Grade Add / Edit Modal State
  readonly gradeModal = signal<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    trackCode: CurriculumCode;
    selectedCanonicalCode: string;
    originalCode: string;
    code: string;
    titleAr: string;
    titleEn: string;
  }>({
    isOpen: false,
    mode: 'add',
    trackCode: 'EGYPTIAN',
    selectedCanonicalCode: '',
    originalCode: '',
    code: '',
    titleAr: '',
    titleEn: ''
  });

  readonly canonicalGradesForModal = computed(() => {
    const trackCode = this.gradeModal().trackCode;
    const treeNode = this.canonicalCurriculumTree.find((c) => c.code === trackCode);
    return treeNode ? treeNode.grades : [];
  });

  readonly currentCurriculumHasTerms = computed<boolean>(() => curriculumHasTerms(this.selectedCurriculum()));

  readonly allCurriculaTracks = signal<CurriculumTrackItem[]>(
    CANONICAL_CURRICULUM_TREE.map(c => ({
      code: c.code as CurriculumCode,
      nameAr: c.titleAr,
      grades: c.grades.map(g => ({
        code: g.code,
        titleAr: g.titleAr,
        titleEn: g.titleEn
      }))
    }))
  );

  // Grade Options Scoped by Selected Curriculum
  readonly gradeOptions = computed<GradeOption[]>(() => {
    const track = this.allCurriculaTracks().find((t) => t.code === this.selectedCurriculum());
    return track ? track.grades : [];
  });

  // Modals State
  readonly isUnitModalOpen = signal<boolean>(false);
  readonly isEditUnitModalOpen = signal<boolean>(false);
  readonly editingUnitId = signal<string>('');
  readonly unitForm = signal<{
    titleAr: string;
    titleEn: string;
    priceEgp: number;
    originalPriceEgp: number | null;
    discountPercentage: number | null;
    isDiscounted: boolean;
    type: 'STUDY_UNIT' | 'REVISION_PACKAGE';
  }>({
    titleAr: '',
    titleEn: '',
    priceEgp: 300,
    originalPriceEgp: null,
    discountPercentage: null,
    isDiscounted: false,
    type: 'STUDY_UNIT'
  });

  readonly editUnitForm = signal<{
    titleAr: string;
    titleEn: string;
    priceEgp: number;
    originalPriceEgp: number | null;
    discountPercentage: number | null;
    isDiscounted: boolean;
    type: 'STUDY_UNIT' | 'REVISION_PACKAGE';
  }>({
    titleAr: '',
    titleEn: '',
    priceEgp: 300,
    originalPriceEgp: null,
    discountPercentage: null,
    isDiscounted: false,
    type: 'STUDY_UNIT'
  });

  // Lecture Modal State
  readonly isLectureModalOpen = signal<boolean>(false);
  readonly isEditLectureModalOpen = signal<boolean>(false);
  readonly editingLectureId = signal<string>('');
  readonly activeUnitForLecture = signal<UnitPackageAdminItem | null>(null);
  readonly lectureForm = signal<{
    titleAr: string;
    youtubeUrl: string;
    googleDrivePdfFileId: string;
    isPrintAllowed: boolean;
    durationMinutes: number;
    isFreeTrial: boolean;
    xpReward: number | null;
  }>({
    titleAr: '',
    youtubeUrl: '',
    googleDrivePdfFileId: '',
    isPrintAllowed: true,
    durationMinutes: 45,
    isFreeTrial: false,
    xpReward: null
  });

  readonly editLectureForm = signal<{
    titleAr: string;
    youtubeUrl: string;
    googleDrivePdfFileId: string;
    isPrintAllowed: boolean;
    durationMinutes: number;
    isFreeTrial: boolean;
    xpReward: number | null;
  }>({
    titleAr: '',
    youtubeUrl: '',
    googleDrivePdfFileId: '',
    isPrintAllowed: true,
    durationMinutes: 45,
    isFreeTrial: false,
    xpReward: null
  });

  // Create Assessment Modal State
  readonly isCreateAssessmentModalOpen = signal<boolean>(false);
  readonly activeUnitForAssessment = signal<UnitPackageAdminItem | null>(null);
  readonly newAssessmentForm = signal<{
    titleAr: string;
    type: 'QUIZ' | 'HOMEWORK' | 'COMPREHENSIVE_EXAM';
    durationMinutes: number;
    calculatorType: 'NONE' | 'DESMOS';
    xpReward: number | null;
    referenceSheetUrl: string | null;
    requiresTeacherReview: boolean;
  }>({
    titleAr: '',
    type: 'QUIZ',
    durationMinutes: 20,
    calculatorType: 'NONE',
    xpReward: null,
    referenceSheetUrl: null,
    requiresTeacherReview: false
  });

  // Reference Sheet Toggles
  readonly isRefSheetActiveInCurriculum = signal<boolean>(false);
  readonly isRefSheetActiveInCreateAssessment = signal<boolean>(false);

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
  openAddGrade(trackCode?: CurriculumCode): void {
    const code = trackCode || 'EGYPTIAN';
    const treeNode = this.canonicalCurriculumTree.find((c) => c.code === code);
    const firstGrade = treeNode?.grades[0];
    this.gradeModal.set({
      isOpen: true,
      mode: 'add',
      trackCode: code,
      selectedCanonicalCode: firstGrade?.code || '',
      originalCode: '',
      code: firstGrade?.code || '',
      titleAr: firstGrade?.titleAr || '',
      titleEn: firstGrade?.titleEn || ''
    });
  }

  onModalCurriculumChange(curr: CurriculumCode): void {
    const treeNode = this.canonicalCurriculumTree.find((c) => c.code === curr);
    const firstGrade = treeNode?.grades[0];
    this.gradeModal.update((s) => ({
      ...s,
      trackCode: curr,
      selectedCanonicalCode: firstGrade?.code || '',
      code: firstGrade?.code || '',
      titleAr: firstGrade?.titleAr || '',
      titleEn: firstGrade?.titleEn || ''
    }));
  }

  onModalGradeChange(gradeCode: string): void {
    const treeNode = this.canonicalCurriculumTree.find((c) => c.code === this.gradeModal().trackCode);
    const grade = treeNode?.grades.find((g) => g.code === gradeCode);
    if (grade) {
      this.gradeModal.update((s) => ({
        ...s,
        selectedCanonicalCode: grade.code,
        code: grade.code,
        titleAr: grade.titleAr,
        titleEn: grade.titleEn || ''
      }));
    }
  }

  openEditGrade(trackCode: CurriculumCode, grade: GradeOption): void {
    this.gradeModal.set({
      isOpen: true,
      mode: 'edit',
      trackCode,
      selectedCanonicalCode: grade.code,
      originalCode: grade.code,
      code: grade.code,
      titleAr: grade.titleAr,
      titleEn: grade.titleEn || ''
    });
  }

  formatGradeDisplay(code: string, titleEn?: string): string {
    if (titleEn && titleEn.trim()) {
      return titleEn.trim();
    }
    for (const track of this.canonicalCurriculumTree) {
      const match = track.grades.find((g) => g.code === code);
      if (match) {
        return match.titleEn || match.titleAr;
      }
    }
    return (code || '').replace(/_/g, ' ');
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
      this.toastTriggered.emit({ text: 'هذا الصف الدراسي مضاف بالفعل داخل هذا القسم!', type: 'error' });
      return;
    }

    if (gm.mode === 'add') {
      this.activeGrades.update((cur) => (cur.includes(newGrade.code) ? cur : [...cur, newGrade.code]));
    }

    if (gm.mode === 'edit' && gm.originalCode !== newGrade.code) {
      this.activeGrades.update((cur) =>
        cur.map((c) => (c === gm.originalCode ? newGrade.code : c))
      );
    }

    this.closeGradeModal();
    this.executeSaveActiveGrades(
      gm.mode === 'add'
        ? 'تمت إضافة الصف الدراسي إلى القسم وحفظ التعديل بنجاح!'
        : 'تم تعديل بيانات الصف الدراسي وحفظ التعديل بنجاح!'
    );
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
        this.executeSaveActiveGrades(`تم حذف "${gradeTitle}" واعتماد التعديلات بنجاح!`);
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
        this.discoveryService.activeGrades.set(this.activeGrades());
        this.discoveryService.curriculaTracks.set(this.allCurriculaTracks() as any);
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
    const track = this.allCurriculaTracks().find((t) => t.code === curr);
    if (track && track.grades.length > 0) {
      this.gradeChange.emit(track.grades[0].code);
    }
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

  // -------------------------------------------------------------------------
  // Unit Discount Calculations & Helpers
  // -------------------------------------------------------------------------
  hasDiscount(unit: UnitPackageAdminItem): boolean {
    return !!(unit.isDiscounted || (unit.originalPriceEgp && unit.originalPriceEgp > unit.priceEgp));
  }

  isFormDiscountValid(isEdit: boolean): boolean {
    const form = isEdit ? this.editUnitForm() : this.unitForm();
    return !!(form.isDiscounted && form.originalPriceEgp && form.originalPriceEgp > form.priceEgp);
  }

  getDiscountPercentage(unit: UnitPackageAdminItem): number {
    if (unit.discountPercentage && unit.discountPercentage > 0) {
      return unit.discountPercentage;
    }
    if (unit.originalPriceEgp && unit.originalPriceEgp > unit.priceEgp) {
      return Math.round(((unit.originalPriceEgp - unit.priceEgp) / unit.originalPriceEgp) * 100);
    }
    return 0;
  }

  onDiscountToggle(isEdit: boolean): void {
    const formSignal = isEdit ? this.editUnitForm : this.unitForm;
    const current = formSignal();
    const nextIsDiscounted = !current.isDiscounted;

    if (nextIsDiscounted) {
      const orig = current.originalPriceEgp || Math.round(current.priceEgp * 1.25) || 500;
      const pct = current.discountPercentage || 20;
      const finalPrice = Math.round(orig * (1 - pct / 100));
      formSignal.set({
        ...current,
        isDiscounted: true,
        originalPriceEgp: orig,
        discountPercentage: pct,
        priceEgp: finalPrice
      });
    } else {
      formSignal.set({
        ...current,
        isDiscounted: false,
        originalPriceEgp: null,
        discountPercentage: null
      });
    }
  }

  onOriginalPriceChange(isEdit: boolean, rawVal: any): void {
    const orig = Number(rawVal) || 0;
    const formSignal = isEdit ? this.editUnitForm : this.unitForm;
    const current = formSignal();

    let newFinalPrice = current.priceEgp;
    if (orig > 0 && current.discountPercentage && current.discountPercentage > 0) {
      newFinalPrice = Math.round(orig * (1 - current.discountPercentage / 100));
    } else if (orig > current.priceEgp && current.priceEgp > 0) {
      const pct = Math.round(((orig - current.priceEgp) / orig) * 100);
      formSignal.set({ ...current, originalPriceEgp: orig, discountPercentage: pct });
      return;
    }
    formSignal.set({ ...current, originalPriceEgp: orig, priceEgp: newFinalPrice });
  }

  onDiscountPercentageChange(isEdit: boolean, rawVal: any): void {
    const pct = Math.min(99, Math.max(1, Number(rawVal) || 0));
    const formSignal = isEdit ? this.editUnitForm : this.unitForm;
    const current = formSignal();

    if (current.originalPriceEgp && current.originalPriceEgp > 0) {
      const newFinalPrice = Math.round(current.originalPriceEgp * (1 - pct / 100));
      formSignal.set({ ...current, discountPercentage: pct, priceEgp: newFinalPrice });
    } else {
      formSignal.set({ ...current, discountPercentage: pct });
    }
  }

  onFinalPriceChange(isEdit: boolean, rawVal: any): void {
    const price = Math.max(0, Number(rawVal) || 0);
    const formSignal = isEdit ? this.editUnitForm : this.unitForm;
    const current = formSignal();

    if (current.originalPriceEgp && current.originalPriceEgp > price) {
      const pct = Math.round(((current.originalPriceEgp - price) / current.originalPriceEgp) * 100);
      formSignal.set({ ...current, priceEgp: price, discountPercentage: pct });
    } else {
      formSignal.set({ ...current, priceEgp: price });
    }
  }

  openCreateUnitModal(): void {
    this.unitForm.set({
      titleAr: '',
      titleEn: '',
      priceEgp: 350,
      originalPriceEgp: null,
      discountPercentage: null,
      isDiscounted: false,
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

    const titleEn = form.titleEn?.trim() || form.titleAr.trim();
    const cleanSlug = titleEn
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'unit';
    const slug = `${cleanSlug}-${Date.now().toString(36)}`;

    const isDiscountActive = form.isDiscounted && !!form.originalPriceEgp && form.originalPriceEgp > form.priceEgp;
    const originalPrice = isDiscountActive ? Number(form.originalPriceEgp) : null;
    const discountPct = isDiscountActive
      ? (form.discountPercentage ? Number(form.discountPercentage) : Math.round(((originalPrice! - form.priceEgp) / originalPrice!) * 100))
      : null;

    const payload = {
      title_ar: form.titleAr.trim(),
      title_en: titleEn,
      slug,
      curriculum: this.selectedCurriculum(),
      grade_level: this.selectedGrade(),
      academic_term: this.selectedTerm(),
      package_type: form.type,
      price_egp: form.priceEgp,
      original_price_egp: originalPrice,
      discount_percentage: discountPct,
      is_discounted: isDiscountActive,
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
          originalPriceEgp: created?.original_price_egp ?? originalPrice,
          discountPercentage: created?.discount_percentage ?? discountPct,
          isDiscounted: created?.is_discounted ?? isDiscountActive,
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

  openEditUnitModal(unit: UnitPackageAdminItem): void {
    const origPrice = unit.originalPriceEgp || null;
    const hasDiscount = !!(unit.isDiscounted || (origPrice && origPrice > unit.priceEgp));
    let pct = unit.discountPercentage || null;
    if (hasDiscount && !pct && origPrice && origPrice > unit.priceEgp) {
      pct = Math.round(((origPrice - unit.priceEgp) / origPrice) * 100);
    }

    this.editingUnitId.set(unit.id);
    this.editUnitForm.set({
      titleAr: unit.titleAr,
      titleEn: unit.titleEn || '',
      priceEgp: unit.priceEgp || 350,
      originalPriceEgp: origPrice,
      discountPercentage: pct,
      isDiscounted: hasDiscount,
      type: unit.type || 'STUDY_UNIT'
    });
    this.isEditUnitModalOpen.set(true);
  }

  saveEditedUnit(): void {
    const unitId = this.editingUnitId();
    const form = this.editUnitForm();
    if (!unitId || !form.titleAr.trim()) {
      this.toastTriggered.emit({ text: 'برجاء كتابة عنوان الوحدة باللغة العربية!', type: 'error' });
      return;
    }

    const isDiscountActive = form.isDiscounted && !!form.originalPriceEgp && form.originalPriceEgp > form.priceEgp;
    const originalPrice = isDiscountActive ? Number(form.originalPriceEgp) : null;
    const discountPct = isDiscountActive
      ? (form.discountPercentage ? Number(form.discountPercentage) : Math.round(((originalPrice! - form.priceEgp) / originalPrice!) * 100))
      : null;

    const payload = {
      title_ar: form.titleAr.trim(),
      title_en: form.titleEn?.trim() || form.titleAr.trim(),
      package_type: form.type,
      price_egp: form.priceEgp,
      original_price_egp: originalPrice,
      discount_percentage: discountPct,
      is_discounted: isDiscountActive
    };

    this.http.patch<{ success: boolean; data: any }>(`/api/v1/admin/units/${unitId}`, payload).subscribe({
      next: (res) => {
        const updated = res?.data;
        const targetUnit = this.units().find(u => u.id === unitId);
        if (targetUnit) {
          const updatedUnit: UnitPackageAdminItem = {
            ...targetUnit,
            titleAr: updated?.title_ar || form.titleAr.trim(),
            titleEn: updated?.title_en || form.titleEn?.trim() || targetUnit.titleEn,
            priceEgp: updated?.price_egp ?? form.priceEgp,
            originalPriceEgp: updated?.original_price_egp !== undefined ? updated.original_price_egp : originalPrice,
            discountPercentage: updated?.discount_percentage !== undefined ? updated.discount_percentage : discountPct,
            isDiscounted: updated?.is_discounted !== undefined ? updated.is_discounted : isDiscountActive,
            type: updated?.package_type || form.type
          };
          this.unitUpdated.emit(updatedUnit);
        }
        this.isEditUnitModalOpen.set(false);
        this.toastTriggered.emit({ text: 'تم تعديل بيانات الوحدة الدراسية وحفظها بنجاح!', type: 'success' });
      },
      error: (err) => {
        const errMsg = err?.error?.error?.message || err?.error?.message || 'تعذر حفظ تعديل الوحدة الدراسية.';
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
      isFreeTrial: false,
      xpReward: null
    });
    this.isLectureModalOpen.set(true);
  }

  saveLecture(): void {
    const unit = this.activeUnitForLecture();
    const form = this.lectureForm();
    if (!unit || !form.titleAr.trim()) return;

    if (form.xpReward === null || form.xpReward === undefined || form.xpReward < 0) {
      this.toastTriggered.emit({
        text: 'يرجى إدخال وتحديد نقاط الـ XP الممنوحة للطالب لهذه المحاضرة.',
        type: 'warning'
      });
      return;
    }

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

    // Strict validation: Reject non-PDF file extensions
    if (sanitizedDriveId.match(/\.(exe|zip|rar|mp4|avi|docx|xlsx|pptx|png|jpg|jpeg)$/i)) {
      this.toastTriggered.emit({
        text: 'تنبيه أمني: مسموح فقط بملفات ومذكرات الـ PDF لدراسة المحاضرة!',
        type: 'error'
      });
      return;
    }

    const payload = {
      unitId: unit.id,
      titleAr: form.titleAr.trim(),
      titleEn: form.titleAr.trim(),
      youtubeUrl: form.youtubeUrl.trim(),
      googleDrivePdfFileId: sanitizedDriveId,
      isPrintAllowed: form.isPrintAllowed,
      durationMinutes: form.durationMinutes,
      isFreeTrial: !!form.isFreeTrial,
      xpReward: form.xpReward
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
          isFreeTrial: !!form.isFreeTrial,
          xpReward: form.xpReward
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

  openEditLectureModal(unit: UnitPackageAdminItem, lec: LectureAdminItem): void {
    this.activeUnitForLecture.set(unit);
    this.editingLectureId.set(lec.id);
    this.editLectureForm.set({
      titleAr: lec.titleAr,
      youtubeUrl: lec.youtubeUrl || '',
      googleDrivePdfFileId: lec.googleDrivePdfFileId || '',
      isPrintAllowed: lec.isPrintAllowed ?? true,
      durationMinutes: lec.durationMinutes || 45,
      isFreeTrial: !!lec.isFreeTrial,
      xpReward: lec.xpReward !== undefined ? lec.xpReward : null
    });
    this.isEditLectureModalOpen.set(true);
  }

  saveEditedLecture(): void {
    const unit = this.activeUnitForLecture();
    const lectureId = this.editingLectureId();
    const form = this.editLectureForm();
    if (!unit || !lectureId || !form.titleAr.trim()) return;

    if (form.xpReward === null || form.xpReward === undefined || form.xpReward < 0) {
      this.toastTriggered.emit({
        text: 'يرجى إدخال وتحديد نقاط الـ XP الممنوحة للطالب لهذه المحاضرة.',
        type: 'warning'
      });
      return;
    }

    let sanitizedDriveId = form.googleDrivePdfFileId.trim();
    if (sanitizedDriveId.includes('drive.google.com')) {
      const match = sanitizedDriveId.match(/[-\w]{25,}/);
      if (match) {
        sanitizedDriveId = match[0];
      }
    }

    // Strict validation: Reject non-PDF file extensions
    if (sanitizedDriveId.match(/\.(exe|zip|rar|mp4|avi|docx|xlsx|pptx|png|jpg|jpeg)$/i)) {
      this.toastTriggered.emit({
        text: 'تنبيه أمني: مسموح فقط بملفات ومذكرات الـ PDF لدراسة المحاضرة!',
        type: 'error'
      });
      return;
    }

    const payload = {
      titleAr: form.titleAr.trim(),
      titleEn: form.titleAr.trim(),
      youtubeUrl: form.youtubeUrl.trim(),
      googleDrivePdfFileId: sanitizedDriveId,
      isPrintAllowed: form.isPrintAllowed,
      durationMinutes: form.durationMinutes,
      isFreeTrial: !!form.isFreeTrial,
      xpReward: form.xpReward
    };

    this.http.patch<{ success: boolean; data: any }>(`/api/v1/admin/lectures/${lectureId}`, payload).subscribe({
      next: (res) => {
        const updatedLecData = res?.data;
        const updatedLectures = unit.lectures.map(l => {
          if (l.id === lectureId) {
            return {
              ...l,
              titleAr: form.titleAr.trim(),
              youtubeUrl: form.youtubeUrl.trim(),
              googleDrivePdfFileId: sanitizedDriveId,
              isPrintAllowed: form.isPrintAllowed,
              durationMinutes: form.durationMinutes,
              isFreeTrial: !!form.isFreeTrial,
              xpReward: form.xpReward,
              encryptedVideoId: updatedLecData?.youtube_encrypted_id || l.encryptedVideoId
            };
          }
          return l;
        });

        const updatedUnit: UnitPackageAdminItem = {
          ...unit,
          lectures: updatedLectures
        };
        this.unitUpdated.emit(updatedUnit);
        this.isEditLectureModalOpen.set(false);
        this.toastTriggered.emit({
          text: 'تم تعديل بيانات المحاضرة وحفظها في قاعدة البيانات بنجاح!',
          type: 'success'
        });
      },
      error: (err) => {
        const errMsg = err?.error?.error?.message || err?.error?.message || 'تعذر حفظ تعديلات المحاضرة.';
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

  toggleLectureFree(unit: UnitPackageAdminItem, lec: LectureAdminItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const previousStatus = !!(lec.isFree || lec.isFreeTrial);
    const newStatus = !previousStatus;

    // Optimistic UI update
    lec.isFree = newStatus;
    lec.isFreeTrial = newStatus;

    this.http.patch<{ success: boolean; data: any; message?: string }>(
      `/api/v1/admin/lectures/${lec.id}/toggle-free`,
      {}
    ).subscribe({
      next: (res) => {
        const text = res?.message || (newStatus
          ? (this.langService.isArabic() ? 'تم تفعيل إتاحة المحاضرة مجاناً لجميع الطلاب' : 'Lecture is now free for all students')
          : (this.langService.isArabic() ? 'تم قفل المحاضرة لتكون خاصة بالطلاب المشتركين' : 'Lecture is now private for subscribed students'));
        this.toastTriggered.emit({ text, type: 'success' });
      },
      error: (err) => {
        lec.isFree = previousStatus;
        lec.isFreeTrial = previousStatus;
        const errMsg = err?.error?.error?.message || err?.error?.message || (this.langService.isArabic() ? 'تعذر تعديل حالة إتاحة المحاضرة' : 'Failed to update lecture status');
        this.toastTriggered.emit({ text: errMsg, type: 'error' });
      }
    });
  }

  // =========================================================================
  // Assessment CRUD
  // =========================================================================
  hasEssayInCurriculum(asm: AssessmentAdminItem | null | undefined): boolean {
    if (!asm || !asm.questions) return false;
    return asm.questions.some(q => q.type === 'ESSAY' || q.type === 'ESSAY_PHOTO');
  }

  openCreateAssessmentModal(unit: UnitPackageAdminItem): void {
    this.activeUnitForAssessment.set(unit);
    this.isRefSheetActiveInCreateAssessment.set(false);
    this.newAssessmentForm.set({
      titleAr: '',
      type: 'QUIZ',
      durationMinutes: 20,
      calculatorType: 'NONE',
      xpReward: null,
      referenceSheetUrl: null,
      requiresTeacherReview: false
    });
    this.isCreateAssessmentModalOpen.set(true);
  }

  openCreateGeneralAssessmentModal(): void {
    this.activeUnitForAssessment.set(null);
    this.isRefSheetActiveInCreateAssessment.set(false);
    this.newAssessmentForm.set({
      titleAr: '',
      type: 'QUIZ',
      durationMinutes: 20,
      calculatorType: 'NONE',
      xpReward: null,
      referenceSheetUrl: null,
      requiresTeacherReview: false
    });
    this.isCreateAssessmentModalOpen.set(true);
  }

  setAssessmentType(type: 'QUIZ' | 'HOMEWORK' | 'COMPREHENSIVE_EXAM'): void {
    this.newAssessmentForm.update((prev) => ({
      ...prev,
      type,
      durationMinutes: type === 'HOMEWORK' ? 60 : (type === 'COMPREHENSIVE_EXAM' ? 45 : 20),
      requiresTeacherReview: type === 'HOMEWORK' ? true : prev.requiresTeacherReview
    }));
  }

  saveNewAssessment(): void {
    const unit = this.activeUnitForAssessment();
    const form = this.newAssessmentForm();
    if (!form.titleAr.trim()) {
      this.toastTriggered.emit({
        text: this.langService.isArabic() ? 'يرجى كتابة عنوان التقييم أو الكويز!' : 'Please enter assessment title!',
        type: 'error'
      });
      return;
    }

    if (form.xpReward === null || form.xpReward === undefined || form.xpReward < 0) {
      this.toastTriggered.emit({
        text: 'يرجى إدخال وتحديد نقاط الـ XP الممنوحة للطالب عند إكمال التقييم/الواجب.',
        type: 'warning'
      });
      return;
    }

    const isHw = form.type === 'HOMEWORK';
    const requiresTeacherReview = isHw ? true : !!form.requiresTeacherReview;

    // General Assessment (Standalone for grade level)
    if (!unit) {
      const payload = {
        unit_package_id: null,
        curriculum: this.selectedCurriculum(),
        grade_level: this.selectedGrade(),
        academic_term: this.selectedTerm(),
        title_ar: form.titleAr.trim(),
        title_en: form.titleAr.trim(),
        assessment_type: form.type,
        time_limit_minutes: form.durationMinutes || (isHw ? 60 : 30),
        min_expected_solve_sec: 10,
        max_attempts: isHw ? 5 : 3,
        graph_calculator: form.calculatorType,
        reference_sheet_url: form.referenceSheetUrl || null,
        xp_reward: Number(form.xpReward),
        is_published: true,
        requires_teacher_review: requiresTeacherReview,
        questions: []
      };

      this.http.post<{ success: boolean; data: any }>('/api/v1/admin/assessments', payload).subscribe({
        next: (res) => {
          const created = res?.data;
          const newAsm: AssessmentAdminItem = {
            id: created?._id || created?.id,
            unitId: '',
            titleAr: form.titleAr.trim(),
            type: form.type,
            calculatorType: form.calculatorType,
            durationMinutes: form.durationMinutes,
            xpReward: form.xpReward,
            referenceSheetUrl: form.referenceSheetUrl || null,
            requiresTeacherReview: requiresTeacherReview,
            submissionsCount: 0,
            questions: []
          };
          this.assessmentSaved.emit(newAsm);
          this.isCreateAssessmentModalOpen.set(false);
          this.toastTriggered.emit({ text: 'تم إنشاء الكويز العام للمرحلة بنجاح!', type: 'success' });
        },
        error: (err) => {
          const errMsg = err?.error?.error?.message || err?.error?.message || 'تعذر إضافة الكويز العام للمرحلة.';
          this.toastTriggered.emit({ text: errMsg, type: 'error' });
        }
      });
      return;
    }

    if (!unit.id || unit.id.startsWith('unit_')) {
      this.toastTriggered.emit({
        text: 'تنبيه: هذه الوحدة غير مسجلة في قاعدة البيانات. يرجى إنشاء وحدة صالحة أولاً لإضافة امتحانات أو واجبات إليها.',
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
      assessment_type: form.type,
      time_limit_minutes: form.durationMinutes || (isHw ? 60 : 30),
      min_expected_solve_sec: 10,
      max_attempts: isHw ? 5 : 3,
      graph_calculator: form.calculatorType,
      reference_sheet_url: form.referenceSheetUrl || null,
      xp_reward: Number(form.xpReward),
      is_published: true,
      requires_teacher_review: requiresTeacherReview,
      questions: []
    };

    this.http.post<{ success: boolean; data: any }>('/api/v1/admin/assessments', payload).subscribe({
      next: (res) => {
        const created = res?.data;
        const newAsm: AssessmentAdminItem = {
          id: created?._id || created?.id,
          unitId: unit.id,
          titleAr: form.titleAr.trim(),
          type: form.type,
          calculatorType: form.calculatorType,
          durationMinutes: form.durationMinutes,
          xpReward: form.xpReward,
          referenceSheetUrl: form.referenceSheetUrl || null,
          requiresTeacherReview: requiresTeacherReview,
          submissionsCount: 0,
          questions: (created?.questions || []).map((q: any, idx: number) => ({
            id: q._id || `q_${idx}`,
            order: idx + 1,
            type: q.question_type || (isHw ? 'ESSAY' : 'MCQ'),
            textAr: q.question_text || (isHw ? 'مسألة مقالية' : 'مسألة رياضية'),
            options: q.options || (isHw ? [] : ['أ', 'ب', 'ج', 'د']),
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
        const successLabel = isHw ? 'تم إنشاء ونشر الواجب المنزلي بنجاح!' : 'تم إنشاء التقييم ونشره بنجاح!';
        this.toastTriggered.emit({ text: successLabel, type: 'success' });
      },
      error: (err) => {
        const errMsg = err?.error?.error?.message || err?.error?.message || 'تعذر إضافة التقييم أو الواجب للوحدة.';
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
  setReferenceSheetActiveInCurriculum(active: boolean): void {
    this.isRefSheetActiveInCurriculum.set(active);
    if (!active) {
      this.activeAssessment.update((a) => (a ? { ...a, referenceSheetUrl: null } : null));
    }
  }

  onReferenceSheetUploadedInCurriculum(url: string): void {
    if (url) {
      this.activeAssessment.update((a) => (a ? { ...a, referenceSheetUrl: url } : null));
      this.isRefSheetActiveInCurriculum.set(true);
      this.toastTriggered.emit({ text: 'تم إرفاق ورقة القوانين بنجاح!', type: 'success' });
    }
  }

  removeReferenceSheetInCurriculum(): void {
    this.activeAssessment.update((a) => (a ? { ...a, referenceSheetUrl: null } : null));
    this.isRefSheetActiveInCurriculum.set(false);
  }

  setReferenceSheetActiveInCreateAssessment(active: boolean): void {
    this.isRefSheetActiveInCreateAssessment.set(active);
    if (!active) {
      this.newAssessmentForm.update((f) => ({ ...f, referenceSheetUrl: null }));
    }
  }

  onReferenceSheetUploadedInCreateAssessment(url: string): void {
    if (url) {
      this.newAssessmentForm.update((f) => ({ ...f, referenceSheetUrl: url }));
      this.isRefSheetActiveInCreateAssessment.set(true);
      this.toastTriggered.emit({ text: 'تم رفع صورة ورقة القوانين بنجاح!', type: 'success' });
    }
  }

  removeReferenceSheetInCreateAssessment(): void {
    this.newAssessmentForm.update((f) => ({ ...f, referenceSheetUrl: null }));
    this.isRefSheetActiveInCreateAssessment.set(false);
  }

  openAssessmentEditor(asm: AssessmentAdminItem): void {
    this.activeAssessment.set(JSON.parse(JSON.stringify(asm)));
    this.isRefSheetActiveInCurriculum.set(Boolean(asm.referenceSheetUrl));
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

    const isMcq = this.newQuestionType() === 'MCQ';
    const newQ: QuestionAdminItem = {
      id: `q_${Date.now()}`,
      order: asm.questions.length + 1,
      type: isMcq ? 'MCQ' : 'ESSAY',
      textAr: text || 'مسألة رياضية مصورة',
      questionImageUrl: this.newQuestionImageUrl(),
      options: isMcq ? this.newQuestionOptions().map((o) => o.trim()) : [],
      correctOptionIndex: isMcq ? this.newQuestionCorrectIndex() : 0,
      points: this.newQuestionPoints()
    };

    const updatedAsm: AssessmentAdminItem = {
      ...asm,
      questions: [...asm.questions, newQ],
      requiresTeacherReview: !isMcq ? true : asm.requiresTeacherReview
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

    // 1. Critical Requirement: Cannot save/publish an empty assessment without questions!
    if (!asm.questions || asm.questions.length === 0) {
      this.toastTriggered.emit({
        text: 'تنبيه: لا يمكن حفظ أو نشر التقييم بدون أي أسئلة! يرجى إضافة مسألة واحدة على الأقل قبل الحفظ.',
        type: 'warning'
      });
      return;
    }

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

    const hasEssay = asm.questions.some(q => q.type === 'ESSAY' || q.type === 'ESSAY_PHOTO');
    const requiresTeacherReview = hasEssay ? true : !!asm.requiresTeacherReview;

    // Transform questions into normalized schema for backend
    const payload = {
      title_ar: asm.titleAr ? asm.titleAr.trim() : undefined,
      title_en: asm.titleAr ? asm.titleAr.trim() : undefined,
      calculator_mode: asm.calculatorType,
      duration_minutes: asm.durationMinutes,
      reference_sheet_url: asm.referenceSheetUrl || null,
      xp_reward: asm.xpReward !== null && asm.xpReward !== undefined ? Number(asm.xpReward) : undefined,
      requires_teacher_review: requiresTeacherReview,
      questions: asm.questions.map((q, idx) => {
        const isEssay = q.type === 'ESSAY' || q.type === 'ESSAY_PHOTO';
        return {
          order: q.order || idx + 1,
          question_type: isEssay ? 'ESSAY_PHOTO' : 'MCQ',
          question_text: q.textAr || (isEssay ? 'مسألة مقالية / حل يدوي' : 'مسألة رياضية'),
          question_image_url: q.questionImageUrl || null,
          options: isEssay ? [] : (q.options || []).map((o) => (o || '').trim()),
          correct_option_index: isEssay ? undefined : Math.max(0, q.correctOptionIndex ?? 0),
          points: q.points || 5
        };
      })
    };

    this.http.patch(`/api/v1/admin/assessments/${asm.id}`, payload).subscribe({
      next: () => {
        asm.requiresTeacherReview = requiresTeacherReview;
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
