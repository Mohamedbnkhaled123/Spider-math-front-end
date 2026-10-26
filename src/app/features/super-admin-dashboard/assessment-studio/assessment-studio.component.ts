import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
  output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { ImageCompressorUploaderComponent } from '../../../shared/components/image-compressor-uploader/image-compressor-uploader.component';
import {
  AssessmentItem,
  AssessmentQuestionItem
} from './assessment-studio.models';
import {
  CurriculumCode,
  AcademicTermCode,
  CalculatorMode,
  QuestionType,
  GradeOption,
  CurriculumTrackItem
} from '../curriculum-studio/curriculum-studio.models';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 14: Dedicated Assessment & Exam Studio Component
 * 
 * Centralized Assessment Bank, Safe Exam Creator, Question Level Visual Editor,
 * Strict Grade-Level Isolation, and Custom In-App Decision Confirmation.
 */
import { ScheduleAlarmPickerComponent } from '../../../shared/components/schedule-alarm-picker/schedule-alarm-picker.component';

/**
 * Timezone Drift Fix (Fix #2): Converts UTC/ISO timestamp to local input string (YYYY-MM-DDTHH:mm)
 * preserving browser local time without UTC offset skew.
 */
export function toLocalDatetimeInputValue(isoDateStr?: string | null): string {
  if (!isoDateStr) return '';
  const d = new Date(isoDateStr);
  if (isNaN(d.getTime())) return '';
  const tzOffsetMs = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

@Component({
  selector: 'app-assessment-studio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppIconComponent,
    ImageCompressorUploaderComponent,
    ScheduleAlarmPickerComponent
  ],
  templateUrl: './assessment-studio.component.html',
  styleUrl: './assessment-studio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssessmentStudioComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly toastTriggered = output<{ text: string; type: 'success' | 'warning' | 'error' }>();

  // Filter Signals
  readonly selectedCurriculum = signal<CurriculumCode>('EGYPTIAN');
  readonly selectedGrade = signal<string>('SEC_3');
  readonly selectedTerm = signal<AcademicTermCode>('TERM_1');

  // State
  readonly assessmentsList = signal<AssessmentItem[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);

  // Active Grades & Tracks State
  readonly activeGrades = signal<string[]>(['SEC_3']);
  readonly allCurriculaTracks = signal<CurriculumTrackItem[]>([
    {
      code: 'EGYPTIAN',
      nameAr: 'المنهج المصري',
      grades: [
        { code: 'SEC_3', titleAr: 'الصف الثالث الثانوي (Thanaweya)', titleEn: 'Secondary 3' },
        { code: 'SEC_2', titleAr: 'الصف الثاني الثانوي', titleEn: 'Secondary 2' },
        { code: 'SEC_1', titleAr: 'الصف الأول الثانوي', titleEn: 'Secondary 1' },
        { code: 'PREP_3', titleAr: 'الصف الثالث الإعدادي', titleEn: 'Prep 3' }
      ]
    },
    {
      code: 'GULF',
      nameAr: 'المنهج الخليجي',
      grades: [
        { code: 'GRADE_12', titleAr: 'الصف الثاني عشر (توجيهي)', titleEn: 'Grade 12' },
        { code: 'GRADE_11', titleAr: 'الصف الحادي عشر', titleEn: 'Grade 11' },
        { code: 'GRADE_10', titleAr: 'الصف العاشر', titleEn: 'Grade 10' }
      ]
    },
    {
      code: 'INTERNATIONAL',
      nameAr: 'IGCSE / البريطانية',
      grades: [
        { code: 'IGCSE_AL', titleAr: 'A-Level Mathematics (9709)', titleEn: 'Cambridge / Edexcel A-Level' },
        { code: 'IGCSE_AS', titleAr: 'AS-Level Pure & Mechanics', titleEn: 'AS-Level Math' },
        { code: 'IGCSE_OL', titleAr: 'O-Level Extended Math (0580)', titleEn: 'IGCSE O-Level' }
      ]
    },
    {
      code: 'AMERICAN',
      nameAr: 'SAT / الأمريكية',
      grades: [
        { code: 'SAT_MATH', titleAr: 'Digital SAT Math (Hard Modules)', titleEn: 'SAT Digital Math' },
        { code: 'ACT_MATH', titleAr: 'ACT Math Mastery', titleEn: 'ACT Mathematics' },
        { code: 'EST_MATH', titleAr: 'EST I & EST II Math', titleEn: 'EST Math' }
      ]
    }
  ]);

  readonly gradeOptions = computed<GradeOption[]>(() => {
    const track = this.allCurriculaTracks().find((t) => t.code === this.selectedCurriculum());
    return track ? track.grades : [];
  });

  // Filtered Assessments strictly isolated by Grade Level and Curriculum
  readonly scopedAssessments = computed<AssessmentItem[]>(() => {
    return this.assessmentsList().filter(
      (a) =>
        a.curriculum === this.selectedCurriculum() &&
        a.gradeLevel === this.selectedGrade() &&
        a.term === this.selectedTerm()
    );
  });

  // In-App Confirmation Modal State (Zero JavaScript window.confirm)
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

  // Create Assessment Modal State
  readonly isCreateModalOpen = signal<boolean>(false);
  readonly createForm = signal<{
    titleAr: string;
    titleEn: string;
    curriculum: CurriculumCode;
    gradeLevel: string;
    term: AcademicTermCode;
    durationMinutes: number;
    passPercentage: number;
    maxAttempts: number;
    isScheduled: boolean;
    availableFrom: string | null;
    availableUntil: string | null;
    calculatorType: CalculatorMode;
    isPlacementTest: boolean;
  }>({
    titleAr: '',
    titleEn: '',
    curriculum: 'EGYPTIAN',
    gradeLevel: 'SEC_3',
    term: 'TERM_1',
    durationMinutes: 45,
    passPercentage: 60,
    maxAttempts: 1,
    isScheduled: false,
    availableFrom: null,
    availableUntil: null,
    calculatorType: 'NONE',
    isPlacementTest: false
  });

  readonly createGradeOptions = computed<GradeOption[]>(() => {
    const formCurr = this.createForm().curriculum;
    const track = this.allCurriculaTracks().find((t) => t.code === formCurr);
    return track ? track.grades : [];
  });

  // Question & Settings Safe Visual Editor State
  readonly isEditorOpen = signal<boolean>(false);
  readonly editorActiveTab = signal<'SETTINGS' | 'QUESTIONS'>('SETTINGS');
  readonly activeAssessment = signal<AssessmentItem | null>(null);
  readonly autoRegradeWarning = signal<boolean>(false);
  readonly editorErrorMessage = signal<string | null>(null);
  readonly createErrorMessage = signal<string | null>(null);

  readonly editorGradeOptions = computed<GradeOption[]>(() => {
    const asm = this.activeAssessment();
    if (!asm) return [];
    const track = this.allCurriculaTracks().find((t) => t.code === asm.curriculum);
    return track ? track.grades : [];
  });

  // New Question Form Inside Safe Visual Editor
  readonly newQuestionType = signal<QuestionType>('MCQ');
  readonly newQuestionTextAr = signal<string>('');
  readonly newQuestionImageUrl = signal<string | null>(null);
  readonly newQuestionOptions = signal<string[]>(['', '', '', '']);
  readonly newQuestionCorrectIndex = signal<number>(0);
  readonly newQuestionPoints = signal<number>(5);
  readonly newQuestionYoutubeUrl = signal<string>('');

  ngOnInit(): void {
    this.loadTracksAndActiveGrades();
    this.loadAssessments();
  }

  loadTracksAndActiveGrades(): void {
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

  loadAssessments(): void {
    this.isLoading.set(true);
    const curr = this.selectedCurriculum();
    const gr = this.selectedGrade();
    const tm = this.selectedTerm();

    this.http.get<{ success: boolean; data: any[] }>(
      `/api/v1/admin/assessments?curriculum=${curr}&gradeLevel=${gr}&academicTerm=${tm}`
    ).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        const raw = res?.data || [];
        const items: AssessmentItem[] = raw.map((a: any) => {
          const fromIso = a.available_from ? new Date(a.available_from).toISOString() : null;
          const untilIso = a.available_until ? new Date(a.available_until).toISOString() : null;
          return {
            id: a._id || a.id,
            titleAr: a.title_ar || a.titleAr,
            titleEn: a.title_en || a.titleEn || '',
            curriculum: a.curriculum,
            gradeLevel: a.grade_level || a.gradeLevel,
            term: a.academic_term || a.term || 'TERM_1',
            calculatorType: (a.graph_calculator === 'DESMOS' || a.calculator_mode === 'DESMOS' || a.calculatorType === 'DESMOS') ? 'DESMOS' : 'NONE',
            durationMinutes: a.time_limit_minutes || a.duration_minutes || a.durationMinutes || 45,
            passPercentage: a.pass_percentage ?? a.passPercentage ?? 60,
            maxAttempts: a.max_attempts ?? a.maxAttempts ?? 1,
            availableFrom: fromIso,
            availableUntil: untilIso,
            isScheduled: !!(fromIso || untilIso),
            totalPoints: a.total_points || 20,
            isPublished: !!a.is_published,
            isPlacementTest: !!a.is_placement_test,
            submissionsCount: a.submissions_count || 0,
            questions: (a.questions || []).map((q: any, idx: number) => ({
              id: q._id || `q_${idx}`,
              order: q.order || idx + 1,
              type: q.question_type || q.type || 'MCQ',
              textAr: q.question_text || q.text_ar || q.textAr || '',
              questionImageUrl: q.question_image_url || null,
              options: q.options || [],
              correctOptionIndex: q.correct_option_index ?? 0,
              points: q.points || 5,
              explanationAr: q.model_answer_text || q.explanation_ar || '',
              youtubeSolutionUrl: q.youtube_solution_url || q.youtubeSolutionUrl || null
            }))
          };
        });
        this.assessmentsList.set(items);
      },
      error: () => {
        this.isLoading.set(false);
        this.assessmentsList.set([]);
      }
    });
  }

  isGradeActive(gradeCode: string): boolean {
    return this.activeGrades().includes(gradeCode);
  }

  selectCurriculum(curr: CurriculumCode): void {
    this.selectedCurriculum.set(curr);
    const firstGrade = this.gradeOptions()[0]?.code || 'SEC_3';
    this.selectedGrade.set(firstGrade);
    this.loadAssessments();
  }

  selectGrade(grade: string): void {
    this.selectedGrade.set(grade);
    this.loadAssessments();
  }

  selectTerm(term: AcademicTermCode): void {
    this.selectedTerm.set(term);
    this.loadAssessments();
  }

  // =========================================================================
  // In-App Confirmation Modal (Strictly Zero window.confirm)
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
  // Create Assessment
  // =========================================================================
  openCreateModal(): void {
    const track = this.allCurriculaTracks().find((t) => t.code === this.selectedCurriculum());
    const initialGrade = track?.grades.some((g) => g.code === this.selectedGrade())
      ? this.selectedGrade()
      : (track?.grades[0]?.code || 'SEC_3');

    this.createErrorMessage.set(null);
    this.createForm.set({
      titleAr: '',
      titleEn: '',
      curriculum: this.selectedCurriculum(),
      gradeLevel: initialGrade,
      term: this.selectedTerm(),
      durationMinutes: 45,
      passPercentage: 60,
      maxAttempts: 1,
      isScheduled: false,
      availableFrom: null,
      availableUntil: null,
      calculatorType: 'NONE',
      isPlacementTest: false
    });
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.createErrorMessage.set(null);
    this.isCreateModalOpen.set(false);
  }

  showCreateError(msg: string): void {
    this.createErrorMessage.set(msg);
    this.toastTriggered.emit({ text: msg, type: 'error' });
  }

  showEditorError(msg: string, tab?: 'SETTINGS' | 'QUESTIONS'): void {
    this.editorErrorMessage.set(msg);
    if (tab) {
      this.editorActiveTab.set(tab);
    }
    this.toastTriggered.emit({ text: msg, type: 'error' });
  }

  onCurriculumChangeInCreate(curr: CurriculumCode): void {
    const track = this.allCurriculaTracks().find((t) => t.code === curr);
    const firstGrade = track?.grades[0]?.code || 'SEC_3';
    this.createForm.update((f) => ({
      ...f,
      curriculum: curr,
      gradeLevel: firstGrade
    }));
  }

  saveNewAssessment(): void {
    this.createErrorMessage.set(null);
    const form = this.createForm();
    if (!form.titleAr.trim()) {
      this.showCreateError('يرجى إدخال عنوان الامتحان باللغة العربية!');
      return;
    }

    if (form.isScheduled) {
      if (!form.availableFrom && !form.availableUntil) {
        this.showCreateError('تنبيه: قمتِ بتفعيل الجدولة، يرجى ضبط موعد التنزيل أو الإغلاق من التقويم، أو إلغاء تفعيل الجدولة.');
        return;
      }
      if (form.availableFrom && form.availableUntil) {
        if (new Date(form.availableUntil) <= new Date(form.availableFrom)) {
          this.showCreateError('تنبيه: موعد إغلاق الامتحان يجب أن يكون بعد موعد بدء وتنزيل الامتحان!');
          return;
        }
      }
    }

    this.isSaving.set(true);
    const payload = {
      title_ar: form.titleAr.trim(),
      title_en: form.titleEn.trim() || form.titleAr.trim(),
      curriculum: form.curriculum,
      grade_level: form.gradeLevel,
      academic_term: form.term,
      assessment_type: form.isPlacementTest ? 'COMPREHENSIVE_EXAM' : 'QUIZ',
      calculator_mode: form.calculatorType,
      graph_calculator: form.calculatorType,
      duration_minutes: form.durationMinutes,
      time_limit_minutes: form.durationMinutes,
      pass_percentage: form.passPercentage,
      max_attempts: form.maxAttempts || 1,
      available_from: form.isScheduled && form.availableFrom ? new Date(form.availableFrom).toISOString() : null,
      available_until: form.isScheduled && form.availableUntil ? new Date(form.availableUntil).toISOString() : null,
      is_placement_test: !!form.isPlacementTest,
      is_published: true,
      questions: []
    };

    this.http.post<{ success: boolean; data: any }>('/api/v1/admin/assessments', payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeCreateModal();
        this.loadAssessments();
        this.toastTriggered.emit({
          text: `تم إنشاء الامتحان وتخصيصه لـ (${form.gradeLevel}) بنجاح!`,
          type: 'success'
        });
      },
      error: (err) => {
        this.isSaving.set(false);
        let errorMsg = err?.error?.error?.message || err?.error?.message;
        if (err?.error?.error?.details && Array.isArray(err.error.error.details)) {
          const first = err.error.error.details[0];
          if (first?.message) errorMsg = first.message;
        }
        if (!errorMsg) {
          errorMsg = 'تعذر إنشاء الامتحان. يرجى مراجعة البيانات المدخلة.';
        }
        this.showCreateError(errorMsg);
      }
    });
  }

  // =========================================================================
  // Toggle Publish Status
  // =========================================================================
  togglePublish(item: AssessmentItem): void {
    const nextState = !item.isPublished;
    const actionText = nextState ? 'نشر وتفعيل' : 'إلغاء نشر';

    this.openConfirm(
      `تأكيد ${actionText} الامتحان`,
      `هل تودين ${actionText} امتحان "${item.titleAr}"؟ ${nextState ? 'سيصبح متاحاً للحل فوراً لطلاب ' + item.gradeLevel : 'سيتم إخفاؤه عن الطلاب وتحويله لمسودة'}.`,
      () => {
        this.http.patch(`/api/v1/admin/assessments/${item.id}`, { is_published: nextState }).subscribe({
          next: () => {
            this.assessmentsList.update((list) =>
              list.map((a) => (a.id === item.id ? { ...a, isPublished: nextState } : a))
            );
            this.toastTriggered.emit({
              text: `تم ${actionText} الامتحان بنجاح!`,
              type: 'success'
            });
          },
          error: (err) => {
            this.toastTriggered.emit({
              text: err?.error?.message || `تعذر ${actionText} الامتحان.`,
              type: 'error'
            });
          }
        });
      },
      !nextState,
      nextState ? 'نعم، انشر الامتحان' : 'نعم، قم بإلغاء النشر',
      'تراجع'
    );
  }

  // =========================================================================
  // Delete Assessment
  // =========================================================================
  deleteAssessment(item: AssessmentItem): void {
    this.openConfirm(
      'تأكيد حذف الامتحان نهائياً',
      `هل أنت متأكدة من حذف امتحان "${item.titleAr}" المخصص لـ (${item.gradeLevel})؟ هذا الإجراء غير قابل للتراجع.`,
      () => {
        this.http.delete(`/api/v1/admin/assessments/${item.id}`).subscribe({
          next: () => {
            this.assessmentsList.update((list) => list.filter((a) => a.id !== item.id));
            this.toastTriggered.emit({ text: 'تم حذف الامتحان بنجاح!', type: 'warning' });
          },
          error: (err) => {
            this.toastTriggered.emit({
              text: err?.error?.message || 'تعذر حذف الامتحان من قاعدة البيانات.',
              type: 'error'
            });
          }
        });
      },
      true,
      'نعم، احذف الامتحان',
      'إلغاء'
    );
  }

  // =========================================================================
  // Question Safe Visual Editor & Settings
  // =========================================================================
  openEditor(item: AssessmentItem, initialTab: 'SETTINGS' | 'QUESTIONS' = 'SETTINGS'): void {
    const copy: AssessmentItem = JSON.parse(JSON.stringify(item));
    // Ensure scheduling flag is properly set if availableFrom or availableUntil exists
    copy.isScheduled = !!(copy.availableFrom || copy.availableUntil);
    this.activeAssessment.set(copy);
    this.editorActiveTab.set(initialTab);
    this.editorErrorMessage.set(null);
    this.autoRegradeWarning.set(false);
    this.newQuestionTextAr.set('');
    this.newQuestionImageUrl.set(null);
    this.newQuestionOptions.set(['', '', '', '']);
    this.newQuestionCorrectIndex.set(0);
    this.newQuestionPoints.set(5);
    this.isEditorOpen.set(true);
  }

  closeEditor(): void {
    this.editorErrorMessage.set(null);
    this.isEditorOpen.set(false);
    this.activeAssessment.set(null);
  }

  setEditorTab(tab: 'SETTINGS' | 'QUESTIONS'): void {
    this.editorErrorMessage.set(null);
    this.editorActiveTab.set(tab);
  }

  onCurriculumChangeInEditor(curr: CurriculumCode): void {
    const asm = this.activeAssessment();
    if (!asm || asm.submissionsCount > 0) return;
    const track = this.allCurriculaTracks().find((t) => t.code === curr);
    const firstGrade = track?.grades[0]?.code || 'SEC_3';
    this.activeAssessment.set({
      ...asm,
      curriculum: curr,
      gradeLevel: firstGrade
    });
  }

  onQuestionImageUploaded(url: string): void {
    this.newQuestionImageUrl.set(url);
    this.toastTriggered.emit({ text: 'تم ضغط ورفع صورة المسألة بنجاح!', type: 'success' });
  }

  updateOption(index: number, value: string): void {
    this.newQuestionOptions.update((opts) => {
      const copy = [...opts];
      copy[index] = value;
      return copy;
    });
  }

  addQuestion(): void {
    const asm = this.activeAssessment();
    if (!asm) return;

    const text = this.newQuestionTextAr().trim();
    if (!text && !this.newQuestionImageUrl()) {
      this.toastTriggered.emit({
        text: 'يرجى كتابة نص السؤال أو رفع صورة المسألة الرياضية!',
        type: 'error'
      });
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

    const newQ: AssessmentQuestionItem = {
      id: `q_${Date.now()}`,
      order: asm.questions.length + 1,
      type: this.newQuestionType(),
      textAr: text || 'مسألة رياضية مصورة',
      questionImageUrl: this.newQuestionImageUrl(),
      options: this.newQuestionType() === 'MCQ' ? this.newQuestionOptions().map((o) => o.trim()) : [],
      correctOptionIndex: this.newQuestionType() === 'MCQ' ? this.newQuestionCorrectIndex() : -1,
      points: this.newQuestionPoints(),
      youtubeSolutionUrl: this.newQuestionYoutubeUrl().trim() || null
    };

    const nextQuestions = [...asm.questions, newQ];
    const updatedAsm: AssessmentItem = {
      ...asm,
      questions: nextQuestions,
      totalPoints: nextQuestions.reduce((sum, q) => sum + (q.points || 1), 0)
    };
    this.activeAssessment.set(updatedAsm);

    // Reset Form
    this.newQuestionTextAr.set('');
    this.newQuestionImageUrl.set(null);
    this.newQuestionOptions.set(['', '', '', '']);
    this.newQuestionCorrectIndex.set(0);
    this.newQuestionYoutubeUrl.set('');
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
        this.activeAssessment.set({
          ...asm,
          questions: filtered,
          totalPoints: filtered.reduce((sum, q) => sum + (q.points || 1), 0)
        });
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

  saveAssessmentEditor(): void {
    const asm = this.activeAssessment();
    if (!asm) return;

    this.editorErrorMessage.set(null);

    if (!asm.titleAr.trim()) {
      this.showEditorError('يرجى إدخال عنوان الامتحان باللغة العربية!', 'SETTINGS');
      return;
    }

    if (asm.isScheduled) {
      if (!asm.availableFrom && !asm.availableUntil) {
        this.showEditorError('تنبيه: قمتِ بتفعيل الجدولة، يرجى ضبط موعد التنزيل أو الإغلاق من التقويم، أو إلغاء تفعيل الجدولة.', 'SETTINGS');
        return;
      }
      if (asm.availableFrom && asm.availableUntil) {
        if (new Date(asm.availableUntil) <= new Date(asm.availableFrom)) {
          this.showEditorError('تنبيه: موعد إغلاق الامتحان يجب أن يكون بعد موعد بدء وتنزيل الامتحان!', 'SETTINGS');
          return;
        }
      }
    }

    // Pre-flight validation on all questions in this assessment
    for (let i = 0; i < asm.questions.length; i++) {
      const q = asm.questions[i];
      if (q.type === 'MCQ') {
        const opts = (q.options || []).map((o) => (o || '').trim());
        if (opts.length < 2) {
          this.showEditorError(`السؤال رقم ${q.order}: يجب أن يحتوي على خيارين على الأقل.`, 'QUESTIONS');
          return;
        }

        // Empty check
        if (opts.some((o) => !o)) {
          this.showEditorError(`السؤال رقم ${q.order}: يحتوي على خيار إجابة فارغ! يرجى ملء جميع الخيارات.`, 'QUESTIONS');
          return;
        }

        // Duplicate check (CRITICAL REQUIREMENT)
        const unique = new Set(opts);
        if (unique.size < opts.length) {
          this.showEditorError(`السؤال رقم ${q.order}: يحتوي على خيارات إجابة متطابقة! لا يمكن أن تتكرر نفس الإجابة في أكثر من خيار.`, 'QUESTIONS');
          return;
        }

        // Correct option bounds check
        if (q.correctOptionIndex === undefined || q.correctOptionIndex === null || q.correctOptionIndex < 0 || q.correctOptionIndex >= opts.length) {
          this.showEditorError(`السؤال رقم ${q.order}: يرجى تحديد الإجابة الصحيحة من بين الخيارات المتاحة.`, 'QUESTIONS');
          return;
        }
      }
    }

    this.isSaving.set(true);

    // Transform full assessment settings & questions into normalized schema for backend
    const payload = {
      title_ar: asm.titleAr.trim(),
      title_en: (asm.titleEn || '').trim() || asm.titleAr.trim(),
      curriculum: asm.curriculum,
      grade_level: asm.gradeLevel,
      academic_term: asm.term,
      calculator_mode: asm.calculatorType,
      graph_calculator: asm.calculatorType,
      duration_minutes: asm.durationMinutes,
      time_limit_minutes: asm.durationMinutes,
      pass_percentage: asm.passPercentage,
      max_attempts: asm.maxAttempts || 1,
      available_from: asm.isScheduled && asm.availableFrom ? new Date(asm.availableFrom).toISOString() : null,
      available_until: asm.isScheduled && asm.availableUntil ? new Date(asm.availableUntil).toISOString() : null,
      is_placement_test: !!asm.isPlacementTest,
      questions: asm.questions.map((q, idx) => ({
        _id: q.id && !q.id.startsWith('q_') ? q.id : undefined,
        order: q.order || idx + 1,
        question_type: q.type || 'MCQ',
        question_text: q.textAr || 'مسألة رياضية',
        question_image_url: q.questionImageUrl || null,
        options: (q.options || []).map((o) => o.trim()),
        correct_option_index: Number(q.correctOptionIndex ?? 0),
        points: Number(q.points || 1),
        model_answer_text: q.explanationAr || '',
        youtube_solution_url: q.youtubeSolutionUrl || null
      }))
    };

    this.http.patch(`/api/v1/admin/assessments/${asm.id}`, payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.assessmentsList.update((list) =>
          list.map((a) => (a.id === asm.id ? asm : a))
        );
        this.closeEditor();
        this.loadAssessments();
        this.toastTriggered.emit({
          text: this.autoRegradeWarning()
            ? 'تم حفظ الامتحان وتفعيل إعادة التصحيح التلقائي للطلاب المسلمين بنجاح!'
            : 'تم حفظ وتحديث إعدادات وبنك أسئلة الامتحان بنجاح!',
          type: 'success'
        });
      },
      error: (err) => {
        this.isSaving.set(false);
        let errorMsg = err?.error?.error?.message || err?.error?.message;
        if (err?.error?.error?.details && Array.isArray(err.error.error.details)) {
          const first = err.error.error.details[0];
          if (first?.message) errorMsg = first.message;
        }
        if (!errorMsg) {
          errorMsg = 'تعذر حفظ وتحديث إعدادات الامتحان. يرجى مراجعة البيانات المدخلة.';
        }
        this.showEditorError(errorMsg);
      }
    });
  }
}
