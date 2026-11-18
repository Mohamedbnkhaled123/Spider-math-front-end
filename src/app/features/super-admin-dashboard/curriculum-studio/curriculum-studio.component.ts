import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  inject,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  HostListener
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { ModalNavigationService } from '../../../core/services/modal-navigation.service';
import { AssessmentDraftService } from '../../../core/offline-db/assessment-draft.service';
import { AssessmentDraft } from '../../../core/offline-db/assessment-draft.models';
import { AppIconComponent, AppIconName } from '../../../shared/components/app-icon/app-icon.component';
import { MathFormulaComponent } from '../../../shared/components/math-formula/math-formula.component';
import {
  CANONICAL_CURRICULUM_TREE,
  curriculumHasTerms,
  findGulfCountry,
  getGulfCountryGrades,
  GULF_COUNTRIES_DATA,
  IGradeLevelMeta,
  IGulfCountryData,
  IGulfStageDefinition,
  INTERNATIONAL_DIVISIONS_DATA,
  IInternationalDivisionData,
  IInternationalStageDefinition,
  findInternationalDivision
} from '../../../core/constants/curriculum-tree.constant';
import { ImageCompressorUploaderComponent } from '../../../shared/components/image-compressor-uploader/image-compressor-uploader.component';
import { PublicDiscoveryService } from '../../../core/services/public-discovery.service';
import { AiQuestionExtractionModalComponent } from '../assessment-studio/ai-question-extraction-modal/ai-question-extraction-modal.component';
import { ICachedFileSession } from '../assessment-studio/ai-question-extraction-modal/ai-question-extraction-modal.models';
import { AssessmentQuestionItem } from '../assessment-studio/assessment-studio.models';
import { ManualImageSlicerModalComponent } from '../../../shared/components/manual-image-slicer-modal/manual-image-slicer-modal.component';
import { ISliceResult } from '../../../shared/components/manual-image-slicer-modal/manual-image-slicer-modal.models';
import { MathVirtualKeyboardComponent } from '../../../shared/components/math-virtual-keyboard/math-virtual-keyboard.component';
import {
  stripLatexDelimiters,
  toVisualMath
} from '../../../shared/components/math-virtual-keyboard/math-virtual-keyboard.models';
import {
  AcademicTermCode,
  AssessmentAdminItem,
  CurriculumCode,
  CurriculumTrackItem,
  CurriculumDivisionItem,
  CurriculumStageItem,
  GradeOption,
  LectureAdminItem,
  QuestionAdminItem,
  UnitPackageAdminItem
} from './curriculum-studio.models';

const GRADE_DESCENDING_ORDER: Record<string, number> = {
  // Egyptian / Baccalaureate
  SEC_3: 10,
  SEC_2: 11,
  SEC_1: 12,
  BACC_12: 13,
  BACC_11: 14,
  BACC_10: 15,
  PREP_3: 20,
  PREP_2: 21,
  PREP_1: 22,
  PRI_6: 30,
  PRI_5: 31,
  PRI_4: 32,
  PRI_3: 33,
  PRI_2: 34,
  PRI_1: 35,

  // Gulf
  GRADE_12: 10,
  GRADE_11: 11,
  GRADE_10: 12,
  GRADE_9: 20,
  GRADE_8: 21,
  GRADE_7: 22,
  GRADE_6: 30,
  GRADE_5: 31,
  GRADE_4: 32,
  GRADE_3: 33,
  GRADE_2: 34,
  GRADE_1: 35,

  // International
  IGCSE_AL: 10,
  IGCSE_AS: 11,
  IGCSE_YEAR_13: 12,
  IGCSE_YEAR_12: 13,
  IGCSE_OL: 14,
  IGCSE_YEAR_11: 15,
  IGCSE_YEAR_10: 16,
  IGCSE_YEAR_9: 20,
  IGCSE_YEAR_8: 21,
  IGCSE_YEAR_7: 22,
  IGCSE_YEAR_6: 30,
  IGCSE_YEAR_5: 31,
  IGCSE_YEAR_4: 32,
  IGCSE_YEAR_3: 33,
  IGCSE_YEAR_2: 34,
  IGCSE_YEAR_1: 35,
  US_GRADE_12: 40,
  US_GRADE_11: 41,
  US_GRADE_10: 42,
  US_GRADE_9: 43,
  US_GRADE_8: 44,
  US_GRADE_7: 45,
  US_GRADE_6: 46,
  US_GRADE_5: 47,
  US_GRADE_4: 48,
  US_GRADE_3: 49,
  US_GRADE_2: 50,
  US_GRADE_1: 51,

  // American Diploma
  ACT_2: 10,
  ACT_1: 11,
  ACT_MATH: 12,
  EST_2: 13,
  EST_1: 14,
  EST_MATH: 15,
  SAT_2: 16,
  SAT_1: 17,
  SAT_MATH: 18,
  SAT: 19
};

export function sortGradesDescending(grades: GradeOption[]): GradeOption[] {
  const hasCustomOrder = grades.some((g) => g.order !== undefined);
  if (hasCustomOrder) {
    return [...grades].sort((a, b) => {
      const orderA = a.order ?? GRADE_DESCENDING_ORDER[a.code] ?? 999;
      const orderB = b.order ?? GRADE_DESCENDING_ORDER[b.code] ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return a.code.localeCompare(b.code);
    });
  }
  return [...grades].sort((a, b) => {
    const orderA = GRADE_DESCENDING_ORDER[a.code] ?? 999;
    const orderB = GRADE_DESCENDING_ORDER[b.code] ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return a.code.localeCompare(b.code);
  });
}

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
    ImageCompressorUploaderComponent,
    AiQuestionExtractionModalComponent,
    ManualImageSlicerModalComponent,
    MathVirtualKeyboardComponent
  ],
  templateUrl: './curriculum-studio.component.html',
  styleUrl: './curriculum-studio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurriculumStudioComponent implements OnInit, OnDestroy {
  readonly langService = inject(LangService);
  readonly toVisualMath = toVisualMath;
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
  readonly unitsReordered = output<UnitPackageAdminItem[]>();
  readonly unitDeleted = output<string>();
  readonly unitCreated = output<Partial<UnitPackageAdminItem>>();
  readonly assessmentSaved = output<AssessmentAdminItem>();
  readonly toastTriggered = output<{ text: string; type: 'success' | 'warning' | 'error' }>();

  // Reordering In-Progress States
  readonly isReorderingUnit = signal<boolean>(false);
  readonly isReorderingLecture = signal<boolean>(false);

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

  // Gulf Countries List
  readonly GULF_COUNTRIES = [
    { code: 'SA' as const, nameAr: 'المملكة العربية السعودية', shortNameAr: 'السعودية', nameEn: 'Saudi Arabia', shortNameEn: 'Saudi', flag: '' },
    { code: 'QA' as const, nameAr: 'دولة قطر', shortNameAr: 'قطر', nameEn: 'Qatar', shortNameEn: 'Qatar', flag: '' },
    { code: 'AE' as const, nameAr: 'الإمارات العربية المتحدة', shortNameAr: 'الإمارات', nameEn: 'United Arab Emirates', shortNameEn: 'UAE', flag: '' },
    { code: 'KW' as const, nameAr: 'دولة الكويت', shortNameAr: 'الكويت', nameEn: 'Kuwait', shortNameEn: 'Kuwait', flag: '' }
  ];

  readonly selectedGulfCountry = signal<'SA' | 'QA' | 'AE' | 'KW'>('SA');
  readonly modalGulfCountry = signal<'SA' | 'QA' | 'AE' | 'KW'>('SA');
  readonly modalAddGradeCountry = signal<'SA' | 'QA' | 'AE' | 'KW'>('SA');
  readonly modalAddGradeIntlDivision = signal<'AMERICAN_CURRICULUM' | 'BRITISH_CURRICULUM'>('AMERICAN_CURRICULUM');
  readonly overviewGulfCountry = signal<'SA' | 'QA' | 'AE' | 'KW'>('SA');
  readonly overviewIntlDivision = signal<'AMERICAN_CURRICULUM' | 'BRITISH_CURRICULUM'>('AMERICAN_CURRICULUM');
  readonly expandedOverviewTracks = signal<Record<string, boolean>>({});

  toggleOverviewTrack(trackCode: string): void {
    this.expandedOverviewTracks.update((prev) => ({
      ...prev,
      [trackCode]: !prev[trackCode]
    }));
  }

  isOverviewTrackExpanded(trackCode: string): boolean {
    return !!this.expandedOverviewTracks()[trackCode];
  }

  getActiveGradesCountForList(grades: GradeOption[]): number {
    const activeSet = new Set(this.activeGrades());
    return grades.filter((g) => activeSet.has(g.code)).length;
  }

  selectGulfCountry(code: 'SA' | 'QA' | 'AE' | 'KW'): void {
    this.selectedGulfCountry.set(code);
    const countryData = findGulfCountry(code);
    if (countryData && countryData.grades.length > 0) {
      const exists = countryData.grades.some(g => g.code === this.selectedGrade());
      if (!exists) {
        this.gradeChange.emit(countryData.grades[0].code);
      }
    }
  }

  selectModalGulfCountry(code: 'SA' | 'QA' | 'AE' | 'KW'): void {
    this.modalGulfCountry.set(code);
  }

  onModalAddGradeCountryChange(countryCode: 'SA' | 'QA' | 'AE' | 'KW'): void {
    this.modalAddGradeCountry.set(countryCode);
    const country = findGulfCountry(countryCode);
    const firstGrade = country?.grades[0];
    if (firstGrade) {
      this.gradeModal.update((s) => ({
        ...s,
        selectedCanonicalCode: firstGrade.code,
        code: firstGrade.code,
        titleAr: firstGrade.titleAr,
        titleEn: firstGrade.titleEn || ''
      }));
    }
  }

  getDisplayedGradesForTrack(track: CurriculumTrackItem): GradeOption[] {
    if (track.code === 'GULF') {
      const countryData = findGulfCountry(this.modalGulfCountry());
      if (countryData) {
        return track.grades
          .filter((g) => !g.isCustom || !g.countryCode || g.countryCode === countryData.code)
          .map((g) => {
            if (g.isCustom) {
              return g;
            }
            const countryGrade = countryData.grades.find((cg) => cg.code === g.code);
            return {
              ...g,
              code: g.code,
              titleAr: countryGrade ? countryGrade.titleAr : g.titleAr,
              titleEn: countryGrade ? (countryGrade.titleEn || countryGrade.titleAr) : (g.titleEn || g.titleAr),
              order: g.order,
              isCustom: false
            };
          });
      }
    }
    return track.grades;
  }

  getGulfStagesForModal(track?: CurriculumTrackItem): CurriculumStageItem[] {
    const t = track || this.allCurriculaTracks().find((x) => x.code === 'GULF');
    const countryCode = this.modalGulfCountry();
    const configuredDiv = t?.divisions?.find((d) => d.code === countryCode);
    if (configuredDiv?.stages && configuredDiv.stages.length > 0) {
      return configuredDiv.stages;
    }
    const country = findGulfCountry(countryCode);
    return (country?.stages || []).map((s, idx) => ({
      code: s.code,
      nameAr: s.nameAr,
      nameEn: s.nameEn,
      gradeCodes: [...s.gradeCodes],
      order: idx + 1
    }));
  }

  getGradesForGulfStage(stage: { gradeCodes?: readonly string[] }, track: CurriculumTrackItem): GradeOption[] {
    const displayed = this.getDisplayedGradesForTrack(track);
    const codes = stage.gradeCodes || [];
    return displayed.filter((g) => codes.includes(g.code));
  }

  getOtherGulfGrades(track: CurriculumTrackItem): GradeOption[] {
    const country = findGulfCountry(this.modalGulfCountry());
    if (!country) return [];
    const allStageGradeCodes = new Set(country.stages.flatMap((s) => s.gradeCodes));
    return this.getDisplayedGradesForTrack(track).filter((g) => {
      if (allStageGradeCodes.has(g.code)) return false;
      if (g.countryCode && g.countryCode !== country.code) return false;
      return true;
    });
  }

  getGulfStagesForFilter(): readonly IGulfStageDefinition[] {
    const country = findGulfCountry(this.selectedGulfCountry());
    return country?.stages || [];
  }

  getGradesForStageInFilter(stage: IGulfStageDefinition): GradeOption[] {
    const options = this.gradeOptions();
    return options.filter((g) => stage.gradeCodes.includes(g.code));
  }

  getGulfStagesForAddModal(): readonly IGulfStageDefinition[] {
    const country = findGulfCountry(this.modalAddGradeCountry());
    return country?.stages || [];
  }

  getGradesForStageInAddModal(stage: IGulfStageDefinition): readonly IGradeLevelMeta[] {
    const country = findGulfCountry(this.modalAddGradeCountry());
    if (!country) return [];
    return country.grades.filter((g) => stage.gradeCodes.includes(g.code));
  }

  // International Curriculum 2-Division Management
  readonly modalIntlDivision = signal<'AMERICAN_CURRICULUM' | 'BRITISH_CURRICULUM'>('AMERICAN_CURRICULUM');

  selectModalIntlDivision(code: string): void {
    if (code === 'AMERICAN_CURRICULUM' || code === 'BRITISH_CURRICULUM') {
      this.modalIntlDivision.set(code);
    }
  }

  getDivisionIcon(name?: string, code?: string): AppIconName {
    if (name === 'award' || name === 'graduation-cap' || name === 'book-open' || name === 'globe') {
      return name;
    }
    if (code === 'AMERICAN_CURRICULUM') return 'award';
    if (code === 'BRITISH_CURRICULUM') return 'graduation-cap';
    return 'book-open';
  }

  getCurriculumTrackName(code: CurriculumCode): string {
    const track = this.allCurriculaTracks().find((t) => t.code === code);
    if (code === 'INTERNATIONAL') {
      const isLegacy = !track?.nameAr || track.nameAr.includes('البريطانية');
      if (this.langService.isArabic()) {
        return !isLegacy ? track!.nameAr : 'المناهج الدولية';
      }
      return (!isLegacy && track?.nameEn) ? track.nameEn : 'International Curriculum';
    }
    if (this.langService.isArabic()) {
      return track?.nameAr || code;
    }
    return track?.nameEn || track?.nameAr || code;
  }

  readonly selectedIntlDivision = signal<'AMERICAN_CURRICULUM' | 'BRITISH_CURRICULUM'>('AMERICAN_CURRICULUM');

  selectIntlDivision(code: 'AMERICAN_CURRICULUM' | 'BRITISH_CURRICULUM'): void {
    this.selectedIntlDivision.set(code);
    const stages = this.getIntlStagesForSelectedDivision();
    if (stages.length > 0) {
      const grades = this.getGradesForIntlStageInDivision(stages[0]);
      if (grades.length > 0) {
        this.gradeChange.emit(grades[0].code);
      }
    }
  }

  getIntlDivisions(): { code: 'AMERICAN_CURRICULUM' | 'BRITISH_CURRICULUM'; nameAr: string; nameEn: string; iconName?: string; flag: string }[] {
    const track = this.allCurriculaTracks().find((t) => t.code === 'INTERNATIONAL');
    const configuredDivs = track?.divisions || [];
    return [
      {
        code: 'AMERICAN_CURRICULUM',
        nameAr: configuredDivs.find((d) => d.code === 'AMERICAN_CURRICULUM')?.nameAr || 'المنهج الأمريكي',
        nameEn: configuredDivs.find((d) => d.code === 'AMERICAN_CURRICULUM')?.nameEn || 'American Curriculum',
        iconName: 'award',
        flag: ''
      },
      {
        code: 'BRITISH_CURRICULUM',
        nameAr: configuredDivs.find((d) => d.code === 'BRITISH_CURRICULUM')?.nameAr || 'المنهج البريطاني',
        nameEn: configuredDivs.find((d) => d.code === 'BRITISH_CURRICULUM')?.nameEn || 'British Curriculum',
        iconName: 'graduation-cap',
        flag: ''
      }
    ];
  }

  getIntlStagesForSelectedDivision(): { code: string; nameAr: string; nameEn: string; gradeCodes: readonly string[] }[] {
    const selectedDivCode = this.selectedIntlDivision();
    const track = this.allCurriculaTracks().find((t) => t.code === 'INTERNATIONAL');
    const configuredDiv = track?.divisions?.find((d) => d.code === selectedDivCode);
    const canonDiv = INTERNATIONAL_DIVISIONS_DATA.find((d) => d.code === selectedDivCode);

    if (canonDiv) {
      return canonDiv.stages.map((s) => {
        const configuredStage = configuredDiv?.stages?.find((cs) => cs.code === s.code);
        return {
          code: s.code,
          nameAr: configuredStage?.nameAr || s.nameAr,
          nameEn: configuredStage?.nameEn || s.nameEn,
          gradeCodes: s.gradeCodes
        };
      });
    }
    return [];
  }

  getGradesForIntlStageInDivision(stage: { gradeCodes: readonly string[] }): GradeOption[] {
    const track = this.allCurriculaTracks().find((t) => t.code === 'INTERNATIONAL');
    if (!track) return [];
    return stage.gradeCodes
      .map((code) => track.grades.find((g) => g.code === code))
      .filter((g): g is GradeOption => Boolean(g));
  }

  getIntlDivisionsForFilter(): CurriculumDivisionItem[] {
    const track = this.allCurriculaTracks().find((t) => t.code === 'INTERNATIONAL');
    return track ? this.getIntlDivisionsForModal(track) : [];
  }

  getGradesForIntlStageInFilter(divCode: string, stageCode: string): GradeOption[] {
    const track = this.allCurriculaTracks().find((t) => t.code === 'INTERNATIONAL');
    if (!track) return [];
    const canonDiv = INTERNATIONAL_DIVISIONS_DATA.find((d) => d.code === divCode);
    const canonStage = canonDiv?.stages.find((s) => s.code === stageCode);
    const targetCodes = canonStage ? canonStage.gradeCodes : [];
    return targetCodes
      .map((code) => track.grades.find((g) => g.code === code))
      .filter((g): g is GradeOption => Boolean(g));
  }

  getOtherIntlGradesForFilter(): GradeOption[] {
    const track = this.allCurriculaTracks().find((t) => t.code === 'INTERNATIONAL');
    if (!track) return [];
    const activeDivCode = this.selectedIntlDivision();
    const allStageCodes = new Set(
      INTERNATIONAL_DIVISIONS_DATA.flatMap((d) => d.stages.flatMap((s) => s.gradeCodes))
    );
    return track.grades.filter((g) => {
      if (allStageCodes.has(g.code)) return false;
      if (g.divisionCode && g.divisionCode !== activeDivCode) return false;
      return true;
    });
  }

  getIntlDivisionsForAddModal(): CurriculumDivisionItem[] {
    const track = this.allCurriculaTracks().find((t) => t.code === 'INTERNATIONAL');
    return track ? this.getIntlDivisionsForModal(track) : [];
  }

  getGradeCodesForIntlStage(divCode: string, stageCode: string): readonly string[] {
    const canonDiv = INTERNATIONAL_DIVISIONS_DATA.find((d) => d.code === divCode);
    const canonStage = canonDiv?.stages.find((s) => s.code === stageCode);
    return canonStage ? canonStage.gradeCodes : [];
  }

  getIntlDivisionsForModal(track: CurriculumTrackItem): CurriculumDivisionItem[] {
    if (track.divisions && track.divisions.length > 0) {
      return track.divisions;
    }
    return INTERNATIONAL_DIVISIONS_DATA.map((d) => ({
      code: d.code,
      nameAr: d.nameAr,
      nameEn: d.nameEn,
      iconName: d.iconName,
      stages: d.stages.map((s, idx) => ({
        code: s.code,
        nameAr: s.nameAr,
        nameEn: s.nameEn,
        gradeCodes: [...s.gradeCodes],
        order: idx + 1
      }))
    }));
  }

  getStagesForModalIntlDivision(track: CurriculumTrackItem): CurriculumStageItem[] {
    const divs = this.getIntlDivisionsForModal(track);
    const div = divs.find((d) => d.code === this.modalIntlDivision()) || divs[0];
    return div?.stages || [];
  }

  getGradesForIntlStage(stage: CurriculumStageItem, track: CurriculumTrackItem): GradeOption[] {
    if (!stage) return [];
    const canonicalDiv = INTERNATIONAL_DIVISIONS_DATA.find((d) => d.code === this.modalIntlDivision());
    const canonicalStage = canonicalDiv?.stages.find((s) => s.code === stage.code);
    const targetCodes = stage.gradeCodes && stage.gradeCodes.length > 0 ? stage.gradeCodes : (canonicalStage ? canonicalStage.gradeCodes : []);
    return targetCodes
      .map((code) => track.grades.find((g) => g.code === code))
      .filter((g): g is GradeOption => Boolean(g));
  }

  getOtherIntlGrades(track: CurriculumTrackItem): GradeOption[] {
    const activeDivCode = this.modalIntlDivision();
    const allStageCodes = new Set(
      INTERNATIONAL_DIVISIONS_DATA.flatMap((d) => d.stages.flatMap((s) => s.gradeCodes))
    );
    return track.grades.filter((g) => {
      if (allStageCodes.has(g.code)) return false;
      if (g.divisionCode && g.divisionCode !== activeDivCode) return false;
      return true;
    });
  }

  readonly intlDivisionsData = INTERNATIONAL_DIVISIONS_DATA;

  getCanonicalGradeMeta(code: string): IGradeLevelMeta | undefined {
    return CANONICAL_CURRICULUM_TREE.find((c) => c.code === 'INTERNATIONAL')?.grades.find((g) => g.code === code);
  }

  // Dynamic Title Editing for Tracks, Divisions, and Stages
  readonly titleEditModal = signal<{
    isOpen: boolean;
    type: 'track' | 'division' | 'stage';
    trackCode: CurriculumCode;
    divisionCode?: string;
    stageCode?: string;
    titleAr: string;
    titleEn: string;
    labelAr: string;
    labelEn: string;
  }>({
    isOpen: false,
    type: 'division',
    trackCode: 'INTERNATIONAL',
    divisionCode: '',
    stageCode: '',
    titleAr: '',
    titleEn: '',
    labelAr: '',
    labelEn: ''
  });

  openEditTrackName(trackCode: CurriculumCode): void {
    const track = this.allCurriculaTracks().find((t) => t.code === trackCode);
    this.titleEditModal.set({
      isOpen: true,
      type: 'track',
      trackCode,
      titleAr: track?.nameAr || '',
      titleEn: track?.nameEn || '',
      labelAr: 'تعديل اسم القسم الدراسي',
      labelEn: 'Edit Curriculum Track Title'
    });
  }

  openEditDivisionName(trackCode: CurriculumCode, divisionCode: string): void {
    const track = this.allCurriculaTracks().find((t) => t.code === trackCode);
    const divs = this.getIntlDivisionsForModal(track!);
    const div = divs.find((d) => d.code === divisionCode);
    this.titleEditModal.set({
      isOpen: true,
      type: 'division',
      trackCode,
      divisionCode,
      titleAr: div?.nameAr || '',
      titleEn: div?.nameEn || '',
      labelAr: 'تعديل اسم المسار الدولي',
      labelEn: 'Edit International Division Title'
    });
  }

  openEditStageName(trackCode: CurriculumCode, divisionCode: string, stageCode: string): void {
    const track = this.allCurriculaTracks().find((t) => t.code === trackCode);
    const divs = this.getIntlDivisionsForModal(track!);
    const div = divs.find((d) => d.code === divisionCode);
    const stage = div?.stages?.find((s) => s.code === stageCode);
    this.titleEditModal.set({
      isOpen: true,
      type: 'stage',
      trackCode,
      divisionCode,
      stageCode,
      titleAr: stage?.nameAr || '',
      titleEn: stage?.nameEn || '',
      labelAr: 'تعديل اسم المرحلة الدراسية',
      labelEn: 'Edit Academic Stage Title'
    });
  }

  saveTitleEditModal(): void {
    const modal = this.titleEditModal();
    const cleanAr = modal.titleAr.trim();
    const cleanEn = modal.titleEn.trim();
    if (!cleanAr) {
      this.toastTriggered.emit({ text: 'يرجى إدخال الاسم بالعربية', type: 'error' });
      return;
    }

    this.allCurriculaTracks.update((tracks) =>
      tracks.map((track) => {
        if (track.code !== modal.trackCode) return track;

        if (modal.type === 'track') {
          return { ...track, nameAr: cleanAr, nameEn: cleanEn || cleanAr };
        }

        const currentDivs = this.getIntlDivisionsForModal(track);
        const updatedDivs = currentDivs.map((div) => {
          if (div.code !== modal.divisionCode) return div;

          if (modal.type === 'division') {
            return { ...div, nameAr: cleanAr, nameEn: cleanEn || cleanAr };
          }

          const updatedStages = (div.stages || []).map((st) => {
            if (st.code !== modal.stageCode) return st;
            return { ...st, nameAr: cleanAr, nameEn: cleanEn || cleanAr };
          });
          return { ...div, stages: updatedStages };
        });

        return { ...track, divisions: updatedDivs };
      })
    );

    this.closeTitleEditModal();
    this.executeSaveActiveGrades('تم حفظ الاسم بنجاح', false);
  }

  closeTitleEditModal(): void {
    this.titleEditModal.update((s) => ({ ...s, isOpen: false }));
  }

  isGradeInCurrentTrack(gradeCode: string): boolean {
    const trackCode = this.gradeModal().trackCode;
    const track = this.allCurriculaTracks().find(t => t.code === trackCode);
    return Boolean(track?.grades.some(g => g.code === gradeCode));
  }

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
    if (trackCode === 'GULF') {
      const country = findGulfCountry(this.modalAddGradeCountry());
      return country ? country.grades : [];
    }
    if (trackCode === 'INTERNATIONAL') {
      const divData = findInternationalDivision(this.modalAddGradeIntlDivision());
      return divData ? divData.grades : [];
    }
    const treeNode = this.canonicalCurriculumTree.find((c) => c.code === trackCode);
    return treeNode ? treeNode.grades : [];
  });

  getOverviewGradesForTrack(track: CurriculumTrackItem): GradeOption[] {
    if (track.code === 'GULF') {
      const countryData = findGulfCountry(this.overviewGulfCountry());
      if (countryData) {
        const countryGradeCodes = new Set(countryData.grades.map((cg) => cg.code));
        return track.grades
          .filter((g) => countryGradeCodes.has(g.code) || (g.isCustom && (!g.countryCode || g.countryCode === countryData.code)))
          .map((g) => {
            const countryGrade = countryData.grades.find((cg) => cg.code === g.code);
            return {
              ...g,
              code: g.code,
              titleAr: countryGrade ? countryGrade.titleAr : g.titleAr,
              titleEn: countryGrade ? (countryGrade.titleEn || countryGrade.titleAr) : (g.titleEn || g.titleAr),
              order: g.order,
              isCustom: g.isCustom
            };
          });
      }
    }
    if (track.code === 'INTERNATIONAL') {
      const divData = findInternationalDivision(this.overviewIntlDivision());
      if (divData) {
        const divGradeCodes = new Set(divData.stages.flatMap(s => s.gradeCodes));
        return track.grades.filter(g => divGradeCodes.has(g.code) || (g.isCustom && (!g.divisionCode || g.divisionCode === this.overviewIntlDivision())));
      }
    }
    return track.grades;
  }

  getSelectedGulfCountryName(): string {
    const c = findGulfCountry(this.selectedGulfCountry());
    if (!c) return '';
    return this.langService.isArabic() ? c.nameAr : c.nameEn;
  }

  getSelectedIntlDivisionName(): string {
    const d = findInternationalDivision(this.selectedIntlDivision());
    if (!d) return '';
    return this.langService.isArabic() ? d.nameAr : (d.nameEn || d.nameAr);
  }

  getSelectedGradeTitle(): string {
    const code = this.selectedGrade();
    const opt = this.gradeOptions().find(g => g.code === code);
    if (opt) {
      return this.langService.isArabic() ? opt.titleAr : (opt.titleEn || opt.titleAr);
    }
    return code;
  }

  readonly currentCurriculumHasTerms = computed<boolean>(() => curriculumHasTerms(this.selectedCurriculum()));

  readonly allCurriculaTracks = signal<CurriculumTrackItem[]>(
    CANONICAL_CURRICULUM_TREE.map(c => ({
      code: c.code as CurriculumCode,
      nameAr: c.titleAr,
      nameEn: c.titleEn,
      divisions: c.code === 'INTERNATIONAL'
        ? INTERNATIONAL_DIVISIONS_DATA.map(d => ({
            code: d.code,
            nameAr: d.nameAr,
            nameEn: d.nameEn,
            iconName: d.iconName,
            stages: d.stages.map(s => ({
              code: s.code,
              nameAr: s.nameAr,
              nameEn: s.nameEn,
              gradeCodes: [...s.gradeCodes]
            }))
          }))
        : undefined,
      grades: sortGradesDescending(c.grades.map(g => ({
        code: g.code,
        titleAr: g.titleAr,
        titleEn: g.titleEn
      })))
    }))
  );

  // Grade Options Scoped by Selected Curriculum
  readonly gradeOptions = computed<GradeOption[]>(() => {
    const curr = this.selectedCurriculum();
    if (curr === 'GULF') {
      const countryData = findGulfCountry(this.selectedGulfCountry());
      if (countryData) {
        const canonical = countryData.grades.map(g => ({
          code: g.code,
          titleAr: g.titleAr,
          titleEn: g.titleEn,
          isCustom: false
        }));
        const track = this.allCurriculaTracks().find((t) => t.code === curr);
        const customForCountry = (track?.grades || []).filter(
          g => g.isCustom && (!g.countryCode || g.countryCode === countryData.code)
        );
        return [...canonical, ...customForCountry];
      }
    }
    if (curr === 'INTERNATIONAL') {
      const divData = findInternationalDivision(this.selectedIntlDivision());
      if (divData) {
        const divGradeCodes = new Set(divData.stages.flatMap(s => s.gradeCodes));
        const track = this.allCurriculaTracks().find((t) => t.code === curr);
        const customForDiv = (track?.grades || []).filter(
          g => g.isCustom && (!g.divisionCode || g.divisionCode === this.selectedIntlDivision())
        );
        if (track) {
          const filtered = track.grades.filter(g => divGradeCodes.has(g.code));
          if (filtered.length > 0) return [...filtered, ...customForDiv];
        }
        return [...divData.grades.map(g => ({
          code: g.code,
          titleAr: g.titleAr,
          titleEn: g.titleEn,
          isCustom: false
        })), ...customForDiv];
      }
    }
    const track = this.allCurriculaTracks().find((t) => t.code === curr);
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
    durationMinutes: 0,
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
    durationMinutes: 0,
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
    lectureId: string | null;
    isMultiModule: boolean;
    module1TimeMinutes: number;
    module2TimeMinutes: number;
  }>({
    titleAr: '',
    type: 'QUIZ',
    durationMinutes: 20,
    calculatorType: 'NONE',
    xpReward: null,
    referenceSheetUrl: null,
    requiresTeacherReview: false,
    lectureId: null,
    isMultiModule: false,
    module1TimeMinutes: 35,
    module2TimeMinutes: 35
  });

  // Reference Sheet Toggles
  readonly isRefSheetActiveInCurriculum = signal<boolean>(false);
  readonly isRefSheetActiveInCreateAssessment = signal<boolean>(false);

  // Assessment Draft & Navigation Services
  readonly draftService = inject(AssessmentDraftService);
  readonly modalNav = inject(ModalNavigationService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly pendingDraft = signal<AssessmentDraft | null>(null);

  // Assessment Safe Editor State
  readonly isAssessmentEditorOpen = signal<boolean>(false);
  readonly activeAssessment = signal<AssessmentAdminItem | null>(null);
  readonly autoRegradeWarning = signal<boolean>(false);

  readonly stripLatexDelimiters = stripLatexDelimiters;

  // Question Extraction & Slicing Signals (Scoped per assessment - R3)
  readonly isAiExtractionModalOpen = signal<boolean>(false);
  readonly isManualSlicerOpen = signal<boolean>(false);
  private readonly assessmentFileSessions = signal<Record<string, ICachedFileSession>>({});
  readonly cachedFileSession = computed<ICachedFileSession | null>(() => {
    const asm = this.activeAssessment();
    if (!asm || !asm.id) return null;
    return this.assessmentFileSessions()[asm.id] || null;
  });
  readonly activeQuestionForSlicing = signal<QuestionAdminItem | null>(null);

  // Math Keyboard Signals
  readonly isMathKeyboardOpen = signal<boolean>(false);
  readonly mathKeyboardTarget = signal<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Active Question Editing (R2) & New Question Form within Assessment Builder
  readonly editingQuestionId = signal<string | null>(null);
  readonly newQuestionType = signal<'MCQ' | 'INPUT_TEXT' | 'ESSAY'>('MCQ');
  readonly newQuestionTextAr = signal<string>('');
  readonly newQuestionImageUrl = signal<string | null>(null);
  readonly newQuestionOptions = signal<string[]>(['', '', '', '']);
  readonly newQuestionCorrectIndex = signal<number>(0);
  readonly newQuestionAcceptedAnswers = signal<string[]>(['']);
  readonly newQuestionPoints = signal<number>(5);
  readonly newQuestionModuleIndex = signal<1 | 2>(1);

  // Two-Module Question Filter
  readonly moduleFilterTab = signal<'ALL' | 1 | 2>('ALL');

  readonly module1QuestionsCount = computed(() => {
    return (this.activeAssessment()?.questions || []).filter((q) => q.moduleIndex !== 2).length;
  });

  readonly module2QuestionsCount = computed(() => {
    return (this.activeAssessment()?.questions || []).filter((q) => q.moduleIndex === 2).length;
  });

  readonly filteredQuestions = computed(() => {
    const questions = this.activeAssessment()?.questions || [];
    const filter = this.moduleFilterTab();
    if (filter === 'ALL' || !this.activeAssessment()?.isMultiModule) {
      return questions;
    }
    return questions.filter((q) => (q.moduleIndex === 2 ? 2 : 1) === filter);
  });

  @HostListener('window:beforeunload')
  onBeforeUnload(): void {
    if (this.isAssessmentEditorOpen() && this.activeAssessment()) {
      this.triggerDraftAutoSave(true);
    }
  }

  ngOnInit(): void {
    this.loadActiveGrades();
    this.checkForPendingDrafts();
  }

  ngOnDestroy(): void {
    this.isMathKeyboardOpen.set(false);
    this.mathKeyboardTarget.set(null);
  }

  triggerDraftAutoSave(immediate = false): void {
    const asm = this.activeAssessment();
    if (!asm) return;

    const draft: AssessmentDraft = {
      draftId: asm.id || 'curriculum_assessment_draft',
      assessmentId: asm.id || null,
      draftType: 'EDIT',
      titleAr: asm.titleAr || '',
      titleEn: asm.titleEn || '',
      curriculum: this.selectedCurriculum(),
      gradeLevel: this.selectedGrade(),
      term: this.selectedTerm(),
      calculatorType: asm.calculatorType || 'NONE',
      referenceSheetUrl: asm.referenceSheetUrl || null,
      durationMinutes: asm.durationMinutes || 20,
      isMultiModule: !!asm.isMultiModule,
      module1TimeMinutes: asm.module1TimeMinutes,
      module2TimeMinutes: asm.module2TimeMinutes,
      passPercentage: 60,
      maxAttempts: 1,
      isScheduled: false,
      isPlacementTest: false,
      requiresTeacherReview: !!asm.requiresTeacherReview,
      totalPoints: (asm.questions || []).reduce((sum, q) => sum + (q.points || 1), 0),
      questions: (asm.questions || []).map((q) => ({
        id: q.id,
        order: q.order,
        type: q.type,
        textAr: q.textAr,
        questionImageUrl: q.questionImageUrl || null,
        options: q.options || [],
        correctOptionIndex: q.correctOptionIndex ?? 0,
        acceptedAnswers: q.acceptedAnswers || [],
        points: q.points || 5,
        moduleIndex: q.moduleIndex === 2 ? 2 : 1,
        explanationAr: ''
      })),
      composerSnapshot: {
        editingQuestionId: this.editingQuestionId(),
        type: this.newQuestionType(),
        textAr: this.newQuestionTextAr(),
        imageUrl: this.newQuestionImageUrl(),
        options: this.newQuestionOptions(),
        acceptedAnswers: this.newQuestionAcceptedAnswers(),
        correctIndex: this.newQuestionCorrectIndex(),
        points: this.newQuestionPoints(),
        moduleIndex: this.newQuestionModuleIndex(),
        youtubeUrl: ''
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      unitId: asm.unitId,
      lectureId: asm.lectureId || null,
      assessmentType: asm.type,
      studioContext: 'CURRICULUM_STUDIO'
    };

    if (immediate) {
      this.draftService.saveDraft(draft);
    } else {
      this.draftService.scheduleDebouncedSave(draft, 600);
    }
  }

  async checkForPendingDrafts(): Promise<void> {
    try {
      const latest = await this.draftService.getLatestDraft();
      if (latest && (!latest.studioContext || latest.studioContext === 'CURRICULUM_STUDIO')) {
        this.pendingDraft.set(latest);
      }
    } catch (err) {
      console.warn('Failed to check for pending drafts:', err);
    }
  }

  restoreDraft(draft: AssessmentDraft): void {
    const baseItem: AssessmentAdminItem = {
      id: draft.assessmentId || draft.draftId,
      unitId: draft.unitId || '',
      lectureId: draft.lectureId || null,
      titleAr: draft.titleAr || '',
      titleEn: draft.titleEn || '',
      type: (draft.assessmentType as any) || 'QUIZ',
      calculatorType: draft.calculatorType || 'NONE',
      durationMinutes: draft.durationMinutes || 20,
      isMultiModule: !!draft.isMultiModule,
      module1TimeMinutes: draft.module1TimeMinutes ?? 35,
      module2TimeMinutes: draft.module2TimeMinutes ?? 35,
      submissionsCount: 0,
      referenceSheetUrl: draft.referenceSheetUrl || null,
      requiresTeacherReview: !!draft.requiresTeacherReview,
      questions: (draft.questions || []).map((q, idx) => ({
        id: q.id || `q_${idx}`,
        order: q.order || idx + 1,
        type: q.type,
        textAr: q.textAr || '',
        questionImageUrl: q.questionImageUrl || null,
        options: q.options || [],
        correctOptionIndex: q.correctOptionIndex ?? 0,
        acceptedAnswers: q.acceptedAnswers || [],
        points: q.points || 5,
        moduleIndex: q.moduleIndex === 2 ? 2 : 1
      }))
    };

    this.openAssessmentEditor(baseItem);

    if (draft.composerSnapshot) {
      this.editingQuestionId.set(draft.composerSnapshot.editingQuestionId || null);
      this.newQuestionModuleIndex.set(draft.composerSnapshot.moduleIndex === 2 ? 2 : 1);
      this.newQuestionType.set(
        draft.composerSnapshot.type === 'INPUT_TEXT'
          ? 'INPUT_TEXT'
          : draft.composerSnapshot.type === 'ESSAY' || draft.composerSnapshot.type === 'ESSAY_PHOTO'
            ? 'ESSAY'
            : 'MCQ'
      );
      this.newQuestionTextAr.set(draft.composerSnapshot.textAr || '');
      this.newQuestionImageUrl.set(draft.composerSnapshot.imageUrl || null);
      this.newQuestionOptions.set(draft.composerSnapshot.options || ['', '', '', '']);
      this.newQuestionCorrectIndex.set(draft.composerSnapshot.correctIndex ?? 0);
      this.newQuestionAcceptedAnswers.set(draft.composerSnapshot.acceptedAnswers || ['']);
      this.newQuestionPoints.set(draft.composerSnapshot.points || 5);
    } else {
      this.cancelQuestionEdit();
    }

    this.pendingDraft.set(null);
    this.toastTriggered.emit({
      text: this.langService.isArabic() ? 'تمت استعادة المسودة بنجاح' : 'Draft restored successfully',
      type: 'success'
    });
  }

  async discardDraft(draftId: string): Promise<void> {
    await this.draftService.deleteDraft(draftId);
    this.pendingDraft.set(null);
    this.toastTriggered.emit({
      text: this.langService.isArabic() ? 'تم حذف المسودة' : 'Draft discarded',
      type: 'warning'
    });
  }

  loadActiveGrades(): void {
    this.http.get<{ success: boolean; data: any }>('/api/v1/public/active-grades').subscribe({
      next: (res) => {
        if (res?.data?.activeGrades && Array.isArray(res.data.activeGrades)) {
          this.activeGrades.set(res.data.activeGrades);
        }
        if (res?.data?.curriculaTracks && Array.isArray(res.data.curriculaTracks) && res.data.curriculaTracks.length > 0) {
          const canonical = this.canonicalCurriculumTree;
          const formattedTracks: CurriculumTrackItem[] = res.data.curriculaTracks.map((t: any) => {
            const node = canonical.find((c) => c.code === t.code);
            let divisions = t.divisions;
            let nameAr = t.nameAr || node?.titleAr || t.code;
            let nameEn = t.nameEn || node?.titleEn || t.nameAr;
            let grades = t.grades || [];

            if (t.code === 'INTERNATIONAL') {
              const isLegacy = !t.nameAr || t.nameAr.includes('البريطانية');
              if (isLegacy) {
                nameAr = 'المناهج الدولية';
                nameEn = 'International Curriculum';
              }
              if (!divisions || divisions.length === 0) {
                divisions = INTERNATIONAL_DIVISIONS_DATA.map((d) => ({
                  code: d.code,
                  nameAr: d.nameAr,
                  nameEn: d.nameEn,
                  iconName: d.iconName,
                  stages: d.stages.map((s) => ({
                    code: s.code,
                    nameAr: s.nameAr,
                    nameEn: s.nameEn
                  }))
                }));
              }
              if (!grades || grades.length <= 4) {
                const intlNode = canonical.find((c) => c.code === 'INTERNATIONAL');
                grades = intlNode?.grades ? intlNode.grades.map(g => ({ code: g.code, titleAr: g.titleAr, titleEn: g.titleEn })) : grades;
              }
            }
            return {
              code: t.code,
              nameAr,
              nameEn,
              divisions,
              grades: sortGradesDescending(grades)
            };
          });
          this.allCurriculaTracks.set(formattedTracks);
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
    this.modalGulfCountry.set(this.selectedGulfCountry());
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
    const code = trackCode || (this.selectedCurriculum() as CurriculumCode) || 'EGYPTIAN';
    if (code === 'GULF') {
      this.modalAddGradeCountry.set(this.modalGulfCountry());
    }
    let firstGrade: { code: string; titleAr: string; titleEn?: string } | undefined;
    if (code === 'GULF') {
      const country = findGulfCountry(this.modalAddGradeCountry());
      firstGrade = country?.grades[0];
    } else {
      const treeNode = this.canonicalCurriculumTree.find((c) => c.code === code);
      firstGrade = treeNode?.grades[0];
    }
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
    let firstGrade: { code: string; titleAr: string; titleEn?: string } | undefined;
    if (curr === 'GULF') {
      const country = findGulfCountry(this.modalAddGradeCountry());
      firstGrade = country?.grades[0];
    } else if (curr === 'INTERNATIONAL') {
      const divData = findInternationalDivision(this.modalAddGradeIntlDivision());
      firstGrade = divData?.grades[0];
    } else {
      const treeNode = this.canonicalCurriculumTree.find((c) => c.code === curr);
      firstGrade = treeNode?.grades[0];
    }
    this.gradeModal.update((s) => ({
      ...s,
      trackCode: curr,
      selectedCanonicalCode: firstGrade?.code || '',
      code: firstGrade?.code || '',
      titleAr: firstGrade?.titleAr || '',
      titleEn: firstGrade?.titleEn || ''
    }));
  }

  onModalAddGradeIntlDivisionChange(divCode: 'AMERICAN_CURRICULUM' | 'BRITISH_CURRICULUM'): void {
    this.modalAddGradeIntlDivision.set(divCode);
    const divData = findInternationalDivision(divCode);
    const firstGrade = divData?.grades[0];
    if (firstGrade) {
      this.gradeModal.update((s) => ({
        ...s,
        selectedCanonicalCode: firstGrade.code,
        code: firstGrade.code,
        titleAr: firstGrade.titleAr,
        titleEn: firstGrade.titleEn || ''
      }));
    }
  }

  onModalGradeChange(gradeCode: string): void {
    if (gradeCode === '__CUSTOM__') {
      this.gradeModal.update((s) => ({
        ...s,
        selectedCanonicalCode: '__CUSTOM__',
        code: 'GRADE_CUSTOM',
        titleAr: this.langService.isArabic() ? 'صف دراسي مخصص' : 'Custom Grade',
        titleEn: 'Custom Grade'
      }));
      return;
    }
    let grade: { code: string; titleAr: string; titleEn?: string } | undefined;
    if (this.gradeModal().trackCode === 'GULF') {
      const country = findGulfCountry(this.modalAddGradeCountry());
      grade = country?.grades.find((g) => g.code === gradeCode);
    } else {
      const treeNode = this.canonicalCurriculumTree.find((c) => c.code === this.gradeModal().trackCode);
      grade = treeNode?.grades.find((g) => g.code === gradeCode);
    }
    if (grade) {
      this.gradeModal.update((s) => ({
        ...s,
        selectedCanonicalCode: grade!.code,
        code: grade!.code,
        titleAr: grade!.titleAr,
        titleEn: grade!.titleEn || grade!.code
      }));
    }
  }

  onCustomGradeCodeChange(val: string): void {
    const clean = (val || '').replace(/[^a-zA-Z0-9_]/g, '').toUpperCase();
    this.gradeModal.update((s) => ({ ...s, code: clean }));
  }

  openEditGrade(trackCode: CurriculumCode, grade: GradeOption): void {
    if (trackCode === 'GULF') {
      this.modalAddGradeCountry.set(this.modalGulfCountry());
    }
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
    for (const country of GULF_COUNTRIES_DATA) {
      const match = country.grades.find((g) => g.code === code);
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
    const cleanCode = gm.code.trim().toUpperCase();
    const cleanTitleAr = gm.titleAr.trim();
    const cleanTitleEn = gm.titleEn.trim() || cleanCode;

    if (!cleanCode || !cleanTitleAr) {
      this.toastTriggered.emit({
        text: 'أدخل كود الصف واسمه بالعربية',
        type: 'error'
      });
      return;
    }

    const isGulf = gm.trackCode === 'GULF';
    const isIntl = gm.trackCode === 'INTERNATIONAL';
    const existingTrack = this.allCurriculaTracks().find((t) => t.code === gm.trackCode);
    const existingGrade = existingTrack?.grades.find((g) => g.code === (gm.mode === 'edit' ? gm.originalCode : cleanCode));

    const newGrade: GradeOption = {
      code: cleanCode,
      titleAr: cleanTitleAr,
      titleEn: cleanTitleEn,
      isCustom: true,
      countryCode: isGulf ? (existingGrade?.countryCode || this.modalAddGradeCountry()) : undefined,
      divisionCode: isIntl ? (existingGrade?.divisionCode || this.modalAddGradeIntlDivision()) : undefined,
      stageCode: existingGrade?.stageCode || 'OTHER',
      stageAr: existingGrade?.stageAr || (isIntl ? 'صفوف دراسية دولية أخرى' : 'صفوف دراسية أخرى'),
      stageEn: existingGrade?.stageEn || (isIntl ? 'Other International Grade Levels' : 'Other Grade Levels'),
      shortLabelAr: existingGrade?.shortLabelAr || cleanTitleAr,
      shortLabelEn: existingGrade?.shortLabelEn || cleanTitleEn
    };

    let updatedExisting = false;
    this.allCurriculaTracks.update((tracks) =>
      tracks.map((track) => {
        if (track.code !== gm.trackCode) return track;
        if (gm.mode === 'add') {
          const existingIdx = track.grades.findIndex((g) => g.code === newGrade.code);
          if (existingIdx >= 0) {
            updatedExisting = true;
            const nextGrades = [...track.grades];
            nextGrades[existingIdx] = newGrade;
            return { ...track, grades: sortGradesDescending(nextGrades) };
          }
          return { ...track, grades: sortGradesDescending([...track.grades, newGrade]) };
        } else {
          return {
            ...track,
            grades: sortGradesDescending(track.grades.map((g) => (g.code === gm.originalCode ? newGrade : g)))
          };
        }
      })
    );

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
        ? (updatedExisting
            ? 'تم تحديث الصف'
            : 'تمت إضافة الصف')
        : 'تم تعديل الصف',
      false
    );
  }

  deleteGrade(trackCode: CurriculumCode, gradeCode: string): void {
    const track = this.allCurriculaTracks().find((t) => t.code === trackCode);
    const grade = track?.grades.find((g) => g.code === gradeCode);
    const gradeTitle = grade?.titleAr || gradeCode;

    this.openConfirm(
      'حذف الصف',
      `حذف "${gradeTitle}" نهائياً؟`,
      () => {
        this.allCurriculaTracks.update((tracks) =>
          tracks.map((t) =>
            t.code === trackCode
              ? { ...t, grades: t.grades.filter((g) => g.code !== gradeCode) }
              : t
          )
        );
        this.activeGrades.update((cur) => cur.filter((c) => c !== gradeCode));
        this.executeSaveActiveGrades(`تم حذف "${gradeTitle}"`, false);
      },
      true,
      'حذف',
      'إلغاء'
    );
  }

  isFirstGrade(trackCode: CurriculumCode, gradeCode: string, viewGrades?: GradeOption[]): boolean {
    const list = viewGrades || this.allCurriculaTracks().find((t) => t.code === trackCode)?.grades || [];
    const idx = list.findIndex((g) => g.code === gradeCode);
    return idx <= 0;
  }

  isLastGrade(trackCode: CurriculumCode, gradeCode: string, viewGrades?: GradeOption[]): boolean {
    const list = viewGrades || this.allCurriculaTracks().find((t) => t.code === trackCode)?.grades || [];
    const idx = list.findIndex((g) => g.code === gradeCode);
    return idx < 0 || idx >= list.length - 1;
  }

  moveGradeUp(trackCode: CurriculumCode, gradeCode: string, event?: Event, viewGrades?: GradeOption[]): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    const track = this.allCurriculaTracks().find((t) => t.code === trackCode);
    if (!track) return;

    const list = viewGrades || track.grades;
    const viewIdx = list.findIndex((g) => g.code === gradeCode);
    if (viewIdx <= 0) return;

    const prevGrade = list[viewIdx - 1];
    if (!prevGrade) return;

    const currentGrades = [...track.grades];
    const fromIdx = currentGrades.findIndex((g) => g.code === gradeCode);
    const toIdx = currentGrades.findIndex((g) => g.code === prevGrade.code);
    if (fromIdx < 0 || toIdx < 0) return;

    const temp = currentGrades[fromIdx]!;
    currentGrades[fromIdx] = currentGrades[toIdx]!;
    currentGrades[toIdx] = temp;

    const reindexedGrades = currentGrades.map((g, i) => ({ ...g, order: i + 1 }));

    let updatedDivs = track.divisions;
    if (trackCode === 'INTERNATIONAL') {
      const currentDivs = this.getIntlDivisionsForModal(track);
      updatedDivs = currentDivs.map((d) => {
        const updatedStages = (d.stages || []).map((s) => {
          if (s.gradeCodes && s.gradeCodes.includes(gradeCode) && s.gradeCodes.includes(prevGrade.code)) {
            const codes = [...s.gradeCodes];
            const i1 = codes.indexOf(gradeCode);
            const i2 = codes.indexOf(prevGrade.code);
            const tCode = codes[i1]!;
            codes[i1] = codes[i2]!;
            codes[i2] = tCode;
            return { ...s, gradeCodes: codes };
          }
          return s;
        });
        return { ...d, stages: updatedStages };
      });
    } else if (trackCode === 'GULF') {
      const countryCode = this.modalGulfCountry();
      const currentStages = this.getGulfStagesForModal(track);
      const updatedStages = currentStages.map((s) => {
        if (s.gradeCodes && s.gradeCodes.includes(gradeCode) && s.gradeCodes.includes(prevGrade.code)) {
          const codes = [...s.gradeCodes];
          const i1 = codes.indexOf(gradeCode);
          const i2 = codes.indexOf(prevGrade.code);
          const tCode = codes[i1]!;
          codes[i1] = codes[i2]!;
          codes[i2] = tCode;
          return { ...s, gradeCodes: codes };
        }
        return s;
      });
      const currentDivs = track.divisions || [];
      if (currentDivs.some((d) => d.code === countryCode)) {
        updatedDivs = currentDivs.map((d) => (d.code === countryCode ? { ...d, stages: updatedStages } : d));
      } else {
        updatedDivs = [...currentDivs, { code: countryCode, nameAr: countryCode, stages: updatedStages }];
      }
    }

    this.allCurriculaTracks.update((tracks) =>
      tracks.map((t) => (t.code === trackCode ? { ...t, grades: reindexedGrades, divisions: updatedDivs || t.divisions } : t))
    );

    this.executeSaveActiveGrades(
      this.langService.isArabic() ? 'تم تحديث ترتيب الصفوف بنجاح' : 'Grades order updated successfully',
      false
    );
  }

  moveGradeDown(trackCode: CurriculumCode, gradeCode: string, event?: Event, viewGrades?: GradeOption[]): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    const track = this.allCurriculaTracks().find((t) => t.code === trackCode);
    if (!track) return;

    const list = viewGrades || track.grades;
    const viewIdx = list.findIndex((g) => g.code === gradeCode);
    if (viewIdx < 0 || viewIdx >= list.length - 1) return;

    const nextGrade = list[viewIdx + 1];
    if (!nextGrade) return;

    const currentGrades = [...track.grades];
    const fromIdx = currentGrades.findIndex((g) => g.code === gradeCode);
    const toIdx = currentGrades.findIndex((g) => g.code === nextGrade.code);
    if (fromIdx < 0 || toIdx < 0) return;

    const temp = currentGrades[fromIdx]!;
    currentGrades[fromIdx] = currentGrades[toIdx]!;
    currentGrades[toIdx] = temp;

    const reindexedGrades = currentGrades.map((g, i) => ({ ...g, order: i + 1 }));

    let updatedDivsDown = track.divisions;
    if (trackCode === 'INTERNATIONAL') {
      const currentDivs = this.getIntlDivisionsForModal(track);
      updatedDivsDown = currentDivs.map((d) => {
        const updatedStages = (d.stages || []).map((s) => {
          if (s.gradeCodes && s.gradeCodes.includes(gradeCode) && s.gradeCodes.includes(nextGrade.code)) {
            const codes = [...s.gradeCodes];
            const i1 = codes.indexOf(gradeCode);
            const i2 = codes.indexOf(nextGrade.code);
            const tCode = codes[i1]!;
            codes[i1] = codes[i2]!;
            codes[i2] = tCode;
            return { ...s, gradeCodes: codes };
          }
          return s;
        });
        return { ...d, stages: updatedStages };
      });
    } else if (trackCode === 'GULF') {
      const countryCode = this.modalGulfCountry();
      const currentStages = this.getGulfStagesForModal(track);
      const updatedStages = currentStages.map((s) => {
        if (s.gradeCodes && s.gradeCodes.includes(gradeCode) && s.gradeCodes.includes(nextGrade.code)) {
          const codes = [...s.gradeCodes];
          const i1 = codes.indexOf(gradeCode);
          const i2 = codes.indexOf(nextGrade.code);
          const tCode = codes[i1]!;
          codes[i1] = codes[i2]!;
          codes[i2] = tCode;
          return { ...s, gradeCodes: codes };
        }
        return s;
      });
      const currentDivs = track.divisions || [];
      if (currentDivs.some((d) => d.code === countryCode)) {
        updatedDivsDown = currentDivs.map((d) => (d.code === countryCode ? { ...d, stages: updatedStages } : d));
      } else {
        updatedDivsDown = [...currentDivs, { code: countryCode, nameAr: countryCode, stages: updatedStages }];
      }
    }

    this.allCurriculaTracks.update((tracks) =>
      tracks.map((t) => (t.code === trackCode ? { ...t, grades: reindexedGrades, divisions: updatedDivsDown || t.divisions } : t))
    );

    this.executeSaveActiveGrades(
      this.langService.isArabic() ? 'تم تحديث ترتيب الصفوف بنجاح' : 'Grades order updated successfully',
      false
    );
  }

  moveStageUp(trackCode: CurriculumCode, divisionCode: string, stageCode: string): void {
    const track = this.allCurriculaTracks().find((t) => t.code === trackCode);
    if (!track) return;

    const currentDivs = this.getIntlDivisionsForModal(track);
    const div = currentDivs.find((d) => d.code === divisionCode);
    if (!div || !div.stages || div.stages.length <= 1) return;

    const stageIdx = div.stages.findIndex((s) => s.code === stageCode);
    if (stageIdx <= 0) return;

    const newStages = [...div.stages];
    const temp = newStages[stageIdx]!;
    newStages[stageIdx] = newStages[stageIdx - 1]!;
    newStages[stageIdx - 1] = temp;
    const reindexedStages = newStages.map((s, i) => ({ ...s, order: i + 1 }));

    const updatedDivs = currentDivs.map((d) => (d.code === divisionCode ? { ...d, stages: reindexedStages } : d));

    this.allCurriculaTracks.update((tracks) =>
      tracks.map((t) => (t.code === trackCode ? { ...t, divisions: updatedDivs } : t))
    );

    this.executeSaveActiveGrades(
      this.langService.isArabic() ? 'تم تحديث ترتيب المراحل بنجاح' : 'Stages order updated successfully',
      false
    );
  }

  moveStageDown(trackCode: CurriculumCode, divisionCode: string, stageCode: string): void {
    const track = this.allCurriculaTracks().find((t) => t.code === trackCode);
    if (!track) return;

    const currentDivs = this.getIntlDivisionsForModal(track);
    const div = currentDivs.find((d) => d.code === divisionCode);
    if (!div || !div.stages || div.stages.length <= 1) return;

    const stageIdx = div.stages.findIndex((s) => s.code === stageCode);
    if (stageIdx < 0 || stageIdx >= div.stages.length - 1) return;

    const newStages = [...div.stages];
    const temp = newStages[stageIdx]!;
    newStages[stageIdx] = newStages[stageIdx + 1]!;
    newStages[stageIdx + 1] = temp;
    const reindexedStages = newStages.map((s, i) => ({ ...s, order: i + 1 }));

    const updatedDivs = currentDivs.map((d) => (d.code === divisionCode ? { ...d, stages: reindexedStages } : d));

    this.allCurriculaTracks.update((tracks) =>
      tracks.map((t) => (t.code === trackCode ? { ...t, divisions: updatedDivs } : t))
    );

    this.executeSaveActiveGrades(
      this.langService.isArabic() ? 'تم تحديث ترتيب المراحل بنجاح' : 'Stages order updated successfully',
      false
    );
  }

  moveGulfStageUp(trackCode: CurriculumCode, countryCode: string, stageCode: string): void {
    const track = this.allCurriculaTracks().find((t) => t.code === trackCode);
    if (!track) return;

    const currentStages = [...this.getGulfStagesForModal(track)];
    const stageIdx = currentStages.findIndex((s) => s.code === stageCode);
    if (stageIdx <= 0) return;

    const temp = currentStages[stageIdx]!;
    currentStages[stageIdx] = currentStages[stageIdx - 1]!;
    currentStages[stageIdx - 1] = temp;
    const reindexedStages = currentStages.map((s, i) => ({ ...s, order: i + 1 }));

    const currentDivs = track.divisions || [];
    let updatedDivs: CurriculumDivisionItem[];
    if (currentDivs.some((d) => d.code === countryCode)) {
      updatedDivs = currentDivs.map((d) => (d.code === countryCode ? { ...d, stages: reindexedStages } : d));
    } else {
      updatedDivs = [...currentDivs, { code: countryCode, nameAr: countryCode, stages: reindexedStages }];
    }

    this.allCurriculaTracks.update((tracks) =>
      tracks.map((t) => (t.code === trackCode ? { ...t, divisions: updatedDivs } : t))
    );

    this.executeSaveActiveGrades(
      this.langService.isArabic() ? 'تم تحديث ترتيب المراحل الدراسية بنجاح' : 'Stages order updated successfully',
      false
    );
  }

  moveGulfStageDown(trackCode: CurriculumCode, countryCode: string, stageCode: string): void {
    const track = this.allCurriculaTracks().find((t) => t.code === trackCode);
    if (!track) return;

    const currentStages = [...this.getGulfStagesForModal(track)];
    const stageIdx = currentStages.findIndex((s) => s.code === stageCode);
    if (stageIdx < 0 || stageIdx >= currentStages.length - 1) return;

    const temp = currentStages[stageIdx]!;
    currentStages[stageIdx] = currentStages[stageIdx + 1]!;
    currentStages[stageIdx + 1] = temp;
    const reindexedStages = currentStages.map((s, i) => ({ ...s, order: i + 1 }));

    const currentDivs = track.divisions || [];
    let updatedDivs: CurriculumDivisionItem[];
    if (currentDivs.some((d) => d.code === countryCode)) {
      updatedDivs = currentDivs.map((d) => (d.code === countryCode ? { ...d, stages: reindexedStages } : d));
    } else {
      updatedDivs = [...currentDivs, { code: countryCode, nameAr: countryCode, stages: reindexedStages }];
    }

    this.allCurriculaTracks.update((tracks) =>
      tracks.map((t) => (t.code === trackCode ? { ...t, divisions: updatedDivs } : t))
    );

    this.executeSaveActiveGrades(
      this.langService.isArabic() ? 'تم تحديث ترتيب المراحل الدراسية بنجاح' : 'Stages order updated successfully',
      false
    );
  }

  confirmSectionChanges(trackCode: CurriculumCode): void {
    const track = this.allCurriculaTracks().find((t) => t.code === trackCode);
    this.openConfirm(
      'حفظ تعديلات القسم',
      `حفظ وتطبيق تعديلات "${track?.nameAr}"؟`,
      () => {
        this.executeSaveActiveGrades(`تم حفظ قسم "${track?.nameAr}"`, true);
      },
      false,
      'حفظ',
      'تراجع'
    );
  }

  saveActiveGrades(): void {
    this.openConfirm(
      'حفظ الصفوف والمناهج',
      'حفظ كافة الصفوف والمناهج المفعلة؟',
      () => {
        this.executeSaveActiveGrades('تم حفظ الصفوف والمناهج', true);
      },
      false,
      'حفظ',
      'تراجع'
    );
  }

  private executeSaveActiveGrades(successMessage: string, closeModal = true): void {
    this.isSavingActiveGrades.set(true);
    this.http.put<{ success: boolean; data: any }>('/api/v1/admin/cms-config/active-grades', {
      activeGrades: this.activeGrades(),
      curriculaTracks: this.allCurriculaTracks()
    }).subscribe({
      next: () => {
        this.isSavingActiveGrades.set(false);
        if (closeModal) {
          this.isGradesModalOpen.set(false);
        }
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
          text: err?.error?.message || 'تعذر الحفظ.',
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
    if (curr === 'GULF') {
      const countryData = findGulfCountry(this.selectedGulfCountry());
      if (countryData && countryData.grades.length > 0) {
        this.gradeChange.emit(countryData.grades[0].code);
      }
    } else if (curr === 'INTERNATIONAL') {
      const stages = this.getIntlStagesForSelectedDivision();
      if (stages.length > 0) {
        const grades = this.getGradesForIntlStageInDivision(stages[0]);
        if (grades.length > 0) {
          this.gradeChange.emit(grades[0].code);
        }
      }
    } else {
      const track = this.allCurriculaTracks().find((t) => t.code === curr);
      if (track && track.grades.length > 0) {
        this.gradeChange.emit(track.grades[0].code);
      }
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
          text: `تم ${nextState ? 'نشر' : 'إلغاء نشر'} الوحدة`,
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

  moveUnitUp(index: number): void {
    if (index <= 0 || this.isReorderingUnit()) return;
    this.reorderUnitsByIndex(index, index - 1);
  }

  moveUnitDown(index: number): void {
    const list = this.units();
    if (index >= list.length - 1 || this.isReorderingUnit()) return;
    this.reorderUnitsByIndex(index, index + 1);
  }

  private reorderUnitsByIndex(fromIndex: number, toIndex: number): void {
    const currentList = [...this.units()];
    const temp = currentList[fromIndex];
    const target = currentList[toIndex];
    if (!temp || !target) return;
    currentList[fromIndex] = target;
    currentList[toIndex] = temp;
    const reindexed = currentList.map((u, i) => ({ ...u, order: i + 1 }));
    this.unitsReordered.emit(reindexed);

    this.isReorderingUnit.set(true);
    const reorderPayload = {
      unitIds: reindexed.map((u) => u.id),
      items: reindexed.map((u, idx) => ({ id: u.id, order_index: idx + 1, order: idx + 1 }))
    };

    this.http.put<{ success: boolean }>('/api/v1/admin/curriculum-units/reorder', reorderPayload).subscribe({
      next: () => {
        this.isReorderingUnit.set(false);
        this.toastTriggered.emit({
          text: this.langService.isArabic() ? 'تم تحديث وترتيب الوحدات بنجاح' : 'Units order updated successfully',
          type: 'success'
        });
      },
      error: () => {
        const u1 = reindexed[fromIndex]!;
        const u2 = reindexed[toIndex]!;
        this.http.patch(`/api/v1/admin/units/${u1.id}`, { order_index: u1.order, order: u1.order }).subscribe();
        this.http.patch(`/api/v1/admin/units/${u2.id}`, { order_index: u2.order, order: u2.order }).subscribe({
          next: () => {
            this.isReorderingUnit.set(false);
            this.toastTriggered.emit({
              text: this.langService.isArabic() ? 'تم تحديث وترتيب الوحدات بنجاح' : 'Units order updated successfully',
              type: 'success'
            });
          },
          error: () => {
            this.isReorderingUnit.set(false);
          }
        });
      }
    });
  }

  deleteUnit(unit: UnitPackageAdminItem): void {
    this.openConfirm(
      'حذف الوحدة',
      `حذف الوحدة "${unit.titleAr}" نهائياً؟`,
      () => {
        this.http.delete(`/api/v1/admin/units/${unit.id}`).subscribe({
          next: () => {
            this.unitDeleted.emit(unit.id);
            this.toastTriggered.emit({ text: 'تم حذف الوحدة', type: 'warning' });
          },
          error: () => {
            this.unitDeleted.emit(unit.id);
            this.toastTriggered.emit({ text: 'تم حذف الوحدة', type: 'warning' });
          }
        });
      },
      true,
      'نعم، احذف',
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
      this.toastTriggered.emit({ text: 'أدخل عنوان الوحدة', type: 'error' });
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
          order: created?.order_index ?? (this.units().length + 1),
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
        this.toastTriggered.emit({ text: 'تم إنشاء الوحدة', type: 'success' });
      },
      error: (err) => {
        const errMsg = err?.error?.error?.message || err?.error?.message || 'تعذر الإنشاء. راجع البيانات.';
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
      this.toastTriggered.emit({ text: 'أدخل عنوان الوحدة', type: 'error' });
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
        this.toastTriggered.emit({ text: 'تم تحديث الوحدة', type: 'success' });
      },
      error: (err) => {
        const errMsg = err?.error?.error?.message || err?.error?.message || 'تعذر تحديث الوحدة.';
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
        text: 'أنشئ وحدة صالحة أولاً',
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
      durationMinutes: 0,
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
        text: 'أدخل نقاط XP للمحاضرة',
        type: 'warning'
      });
      return;
    }

    if (!unit.id || unit.id.startsWith('unit_')) {
      this.toastTriggered.emit({
        text: 'أنشئ وحدة صالحة أولاً',
        type: 'error'
      });
      return;
    }

    // Validate that Google Drive PDF is strictly a File ID, not an open public web link
    let sanitizedDriveId = (form.googleDrivePdfFileId || '').trim();
    if (sanitizedDriveId) {
      if (sanitizedDriveId.includes('drive.google.com')) {
        const match = sanitizedDriveId.match(/[-\w]{25,}/);
        if (match) {
          sanitizedDriveId = match[0];
        }
      }

      // Strict validation: Reject non-PDF file extensions
      if (sanitizedDriveId.match(/\.(exe|zip|rar|mp4|avi|docx|xlsx|pptx|png|jpg|jpeg)$/i)) {
        this.toastTriggered.emit({
          text: 'مسموح بملفات PDF فقط',
          type: 'error'
        });
        return;
      }
    }

    if (!form.youtubeUrl?.trim() && !sanitizedDriveId) {
      this.toastTriggered.emit({
        text: 'أدخل رابط فيديو أو ملف PDF على الأقل',
        type: 'warning'
      });
      return;
    }

    const hasVideo = !!(form.youtubeUrl && form.youtubeUrl.trim());
    const payload = {
      unitId: unit.id,
      titleAr: form.titleAr.trim(),
      titleEn: form.titleAr.trim(),
      youtubeUrl: (form.youtubeUrl || '').trim(),
      googleDrivePdfFileId: sanitizedDriveId,
      isPrintAllowed: form.isPrintAllowed,
      durationMinutes: hasVideo ? (form.durationMinutes || 45) : 0,
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
          youtubeUrl: (form.youtubeUrl || '').trim(),
          encryptedVideoId: createdLec?.youtube_encrypted_id || '',
          googleDrivePdfFileId: sanitizedDriveId,
          isPrintAllowed: form.isPrintAllowed,
          durationMinutes: hasVideo ? (form.durationMinutes || 45) : 0,
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
          text: 'تمت إضافة المحاضرة',
          type: 'success'
        });
      },
      error: (err) => {
        const errMsg = err?.error?.error?.message || err?.error?.message || 'تعذر إضافة المحاضرة.';
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
      durationMinutes: lec.durationMinutes || 0,
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
        text: 'أدخل نقاط XP للمحاضرة',
        type: 'warning'
      });
      return;
    }

    let sanitizedDriveId = (form.googleDrivePdfFileId || '').trim();
    if (sanitizedDriveId) {
      if (sanitizedDriveId.includes('drive.google.com')) {
        const match = sanitizedDriveId.match(/[-\w]{25,}/);
        if (match) {
          sanitizedDriveId = match[0];
        }
      }

      // Strict validation: Reject non-PDF file extensions
      if (sanitizedDriveId.match(/\.(exe|zip|rar|mp4|avi|docx|xlsx|pptx|png|jpg|jpeg)$/i)) {
        this.toastTriggered.emit({
          text: 'مسموح بملفات PDF فقط',
          type: 'error'
        });
        return;
      }
    }

    if (!form.youtubeUrl?.trim() && !sanitizedDriveId) {
      this.toastTriggered.emit({
        text: 'أدخل رابط فيديو أو ملف PDF على الأقل',
        type: 'warning'
      });
      return;
    }

    const hasVideo = !!(form.youtubeUrl && form.youtubeUrl.trim());
    const payload = {
      titleAr: form.titleAr.trim(),
      titleEn: form.titleAr.trim(),
      youtubeUrl: (form.youtubeUrl || '').trim(),
      googleDrivePdfFileId: sanitizedDriveId,
      isPrintAllowed: form.isPrintAllowed,
      durationMinutes: hasVideo ? (form.durationMinutes || 45) : 0,
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
              youtubeUrl: (form.youtubeUrl || '').trim(),
              googleDrivePdfFileId: sanitizedDriveId,
              isPrintAllowed: form.isPrintAllowed,
              durationMinutes: hasVideo ? (form.durationMinutes || 45) : 0,
              isFreeTrial: !!form.isFreeTrial,
              xpReward: form.xpReward,
              encryptedVideoId: updatedLecData?.youtube_encrypted_id || (form.youtubeUrl?.trim() ? l.encryptedVideoId : '')
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
          text: 'تم تحديث المحاضرة',
          type: 'success'
        });
      },
      error: (err) => {
        const errMsg = err?.error?.error?.message || err?.error?.message || 'تعذر تحديث المحاضرة.';
        this.toastTriggered.emit({ text: errMsg, type: 'error' });
      }
    });
  }

  moveLectureUp(unit: UnitPackageAdminItem, index: number): void {
    if (index <= 0 || this.isReorderingLecture()) return;
    this.reorderLecturesByIndex(unit, index, index - 1);
  }

  moveLectureDown(unit: UnitPackageAdminItem, index: number): void {
    const list = unit.lectures || [];
    if (index >= list.length - 1 || this.isReorderingLecture()) return;
    this.reorderLecturesByIndex(unit, index, index + 1);
  }

  private reorderLecturesByIndex(unit: UnitPackageAdminItem, fromIndex: number, toIndex: number): void {
    const currentList = [...(unit.lectures || [])];
    const temp = currentList[fromIndex];
    const target = currentList[toIndex];
    if (!temp || !target) return;
    currentList[fromIndex] = target;
    currentList[toIndex] = temp;
    const reindexed = currentList.map((l, i) => ({ ...l, order: i + 1 }));
    const updatedUnit: UnitPackageAdminItem = {
      ...unit,
      lectures: reindexed
    };
    this.unitUpdated.emit(updatedUnit);

    this.isReorderingLecture.set(true);
    const reorderPayload = {
      unitId: unit.id,
      lectureIds: reindexed.map((l) => l.id),
      items: reindexed.map((l, idx) => ({ id: l.id, order_index: idx + 1, order: idx + 1 }))
    };

    this.http.put<{ success: boolean }>('/api/v1/admin/lectures/reorder', reorderPayload).subscribe({
      next: () => {
        this.isReorderingLecture.set(false);
        this.toastTriggered.emit({
          text: this.langService.isArabic() ? 'تم حفظ ترتيب المحاضرات بنجاح' : 'Lectures order saved successfully',
          type: 'success'
        });
      },
      error: () => {
        const l1 = reindexed[fromIndex]!;
        const l2 = reindexed[toIndex]!;
        this.http.patch(`/api/v1/admin/lectures/${l1.id}`, { order_index: l1.order, order: l1.order }).subscribe();
        this.http.patch(`/api/v1/admin/lectures/${l2.id}`, { order_index: l2.order, order: l2.order }).subscribe({
          next: () => {
            this.isReorderingLecture.set(false);
            this.toastTriggered.emit({
              text: this.langService.isArabic() ? 'تم حفظ ترتيب المحاضرات بنجاح' : 'Lectures order saved successfully',
              type: 'success'
            });
          },
          error: () => {
            this.isReorderingLecture.set(false);
          }
        });
      }
    });
  }

  deleteLecture(unit: UnitPackageAdminItem, lectureId: string): void {
    const lec = unit.lectures.find((l) => l.id === lectureId);
    const lecTitle = lec ? ((this.langService.isArabic() ? lec.titleAr : lec.titleEn) || `محاضرة ${lec.order || 1}`) : '';
    const title = this.langService.isArabic() ? 'حذف المحاضرة' : 'Delete Lecture';
    const message = this.langService.isArabic()
      ? `هل أنتِ متأكدة من حذف المحاضرة "${lecTitle}" نهائياً؟ سيتم فك ارتباط أي كويز أو واجب مرتبط بها.`
      : `Are you sure you want to permanently delete lecture "${lecTitle}"? Any linked quizzes or homework will be unlinked.`;

    this.openConfirm(
      title,
      message,
      () => {
        this.http.delete(`/api/v1/admin/lectures/${lectureId}`).subscribe({
          next: () => {
            const updatedAssessments = (unit.assessments || []).map((a) =>
              a.lectureId === lectureId ? { ...a, lectureId: null } : a
            );
            const updatedUnit: UnitPackageAdminItem = {
              ...unit,
              lectures: unit.lectures.filter((l) => l.id !== lectureId).map((l, idx) => ({ ...l, order: idx + 1 })),
              assessments: updatedAssessments
            };
            this.unitUpdated.emit(updatedUnit);
            this.toastTriggered.emit({
              text: this.langService.isArabic() ? 'تم حذف المحاضرة بنجاح' : 'Lecture deleted successfully',
              type: 'warning'
            });
          },
          error: (err) => {
            const errMsg = err?.error?.error?.message || err?.error?.message || (this.langService.isArabic() ? 'تعذر حذف المحاضرة' : 'Failed to delete lecture');
            this.toastTriggered.emit({ text: errMsg, type: 'error' });
          }
        });
      },
      true,
      this.langService.isArabic() ? 'نعم، احذف المحاضرة' : 'Yes, Delete',
      this.langService.isArabic() ? 'إلغاء' : 'Cancel'
    );
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
          ? (this.langService.isArabic() ? 'المحاضرة متاحة مجاناً' : 'Lecture is free')
          : (this.langService.isArabic() ? 'المحاضرة للمشتركين فقط' : 'Lecture is private'));
        this.toastTriggered.emit({ text, type: 'success' });
      },
      error: (err) => {
        lec.isFree = previousStatus;
        lec.isFreeTrial = previousStatus;
        const errMsg = err?.error?.error?.message || err?.error?.message || (this.langService.isArabic() ? 'تعذر تعديل الحالة' : 'Failed to update');
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

  openCreateAssessmentModal(unit: UnitPackageAdminItem, targetLectureId?: string): void {
    this.activeUnitForAssessment.set(unit);
    this.isRefSheetActiveInCreateAssessment.set(false);
    this.newAssessmentForm.set({
      titleAr: '',
      type: 'QUIZ',
      durationMinutes: 20,
      calculatorType: 'NONE',
      xpReward: null,
      referenceSheetUrl: null,
      requiresTeacherReview: false,
      lectureId: targetLectureId || null,
      isMultiModule: false,
      module1TimeMinutes: 35,
      module2TimeMinutes: 35
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
      requiresTeacherReview: false,
      lectureId: null,
      isMultiModule: false,
      module1TimeMinutes: 35,
      module2TimeMinutes: 35
    });
    this.isCreateAssessmentModalOpen.set(true);
  }

  setAssessmentType(type: 'QUIZ' | 'HOMEWORK' | 'COMPREHENSIVE_EXAM'): void {
    this.newAssessmentForm.update((prev) => ({
      ...prev,
      type,
      durationMinutes: type === 'HOMEWORK' ? 60 : (type === 'COMPREHENSIVE_EXAM' ? 45 : 20),
      requiresTeacherReview: type === 'HOMEWORK' ? true : prev.requiresTeacherReview,
      isMultiModule: type === 'HOMEWORK' ? false : prev.isMultiModule
    }));
  }

  saveNewAssessment(): void {
    const unit = this.activeUnitForAssessment();
    const form = this.newAssessmentForm();
    if (!form.titleAr.trim()) {
      this.toastTriggered.emit({
        text: this.langService.isArabic() ? 'أدخل عنوان التقييم' : 'Enter assessment title',
        type: 'error'
      });
      return;
    }

    if (form.xpReward === null || form.xpReward === undefined || form.xpReward < 0) {
      this.toastTriggered.emit({
        text: 'أدخل نقاط XP للتقييم',
        type: 'warning'
      });
      return;
    }

    const isHw = form.type === 'HOMEWORK';
    const isMultiMod = !isHw && !!form.isMultiModule;
    const mod1Time = isMultiMod ? (Number(form.module1TimeMinutes) || 35) : null;
    const mod2Time = isMultiMod ? (Number(form.module2TimeMinutes) || 35) : null;
    const computedDuration = isMultiMod
      ? ((Number(form.module1TimeMinutes) || 35) + (Number(form.module2TimeMinutes) || 35))
      : (form.durationMinutes || (isHw ? 60 : 30));
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
        time_limit_minutes: computedDuration,
        duration_minutes: computedDuration,
        is_multi_module: isMultiMod,
        module_1_time_minutes: mod1Time,
        module_2_time_minutes: mod2Time,
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
            durationMinutes: computedDuration,
            isMultiModule: isMultiMod,
            module1TimeMinutes: mod1Time ?? undefined,
            module2TimeMinutes: mod2Time ?? undefined,
            xpReward: form.xpReward,
            referenceSheetUrl: form.referenceSheetUrl || null,
            requiresTeacherReview: requiresTeacherReview,
            submissionsCount: 0,
            questions: []
          };
          this.assessmentSaved.emit(newAsm);
          this.isCreateAssessmentModalOpen.set(false);
          this.toastTriggered.emit({ text: 'تم إنشاء الكويز', type: 'success' });
        },
        error: (err) => {
          const errMsg = err?.error?.error?.message || err?.error?.message || 'تعذر إنشاء الكويز.';
          this.toastTriggered.emit({ text: errMsg, type: 'error' });
        }
      });
      return;
    }

    if (!unit.id || unit.id.startsWith('unit_')) {
      this.toastTriggered.emit({
        text: 'أنشئ وحدة صالحة أولاً',
        type: 'error'
      });
      return;
    }

    const payload = {
      unit_package_id: unit.id,
      lecture_id: form.lectureId || null,
      curriculum: unit.curriculum,
      grade_level: unit.gradeLevel,
      academic_term: unit.term,
      title_ar: form.titleAr.trim(),
      title_en: form.titleAr.trim(),
      assessment_type: form.type,
      time_limit_minutes: computedDuration,
      duration_minutes: computedDuration,
      is_multi_module: isMultiMod,
      module_1_time_minutes: mod1Time,
      module_2_time_minutes: mod2Time,
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
        const newAsmId = created?._id || created?.id;
        const newAsm: AssessmentAdminItem = {
          id: newAsmId,
          unitId: unit.id,
          lectureId: form.lectureId || null,
          titleAr: form.titleAr.trim(),
          type: form.type,
          calculatorType: form.calculatorType,
          durationMinutes: computedDuration,
          isMultiModule: isMultiMod,
          module1TimeMinutes: mod1Time ?? undefined,
          module2TimeMinutes: mod2Time ?? undefined,
          xpReward: form.xpReward,
          referenceSheetUrl: form.referenceSheetUrl || null,
          requiresTeacherReview: requiresTeacherReview,
          submissionsCount: 0,
          questions: (created?.questions || []).map((q: any, idx: number) => ({
            id: q._id || `q_${idx}`,
            order: idx + 1,
            type: (q.question_type === 'ESSAY_PHOTO' || q.question_type === 'ESSAY')
              ? 'ESSAY'
              : (q.question_type === 'INPUT_TEXT' ? 'INPUT_TEXT' : (isHw ? 'ESSAY' : 'MCQ')),
            textAr: q.question_text || (isHw ? 'مسألة مقالية' : 'مسألة رياضية'),
            options: q.options || (isHw ? [] : ['أ', 'ب', 'ج', 'د']),
            correctOptionIndex: q.correct_option_index ?? 0,
            acceptedAnswers: q.accepted_answers || [],
            points: q.points || 5,
            moduleIndex: isMultiMod ? ((q.module_index as 1 | 2) || 1) : 1
          }))
        };

        const updatedLectures = form.lectureId
          ? unit.lectures.map(l => l.id === form.lectureId ? { ...l, hasAssessment: true, assessmentId: newAsmId } : l)
          : unit.lectures;

        const updatedUnit: UnitPackageAdminItem = {
          ...unit,
          lectures: updatedLectures,
          assessments: [...unit.assessments, newAsm]
        };
        this.unitUpdated.emit(updatedUnit);
        this.isCreateAssessmentModalOpen.set(false);
        const successLabel = isHw ? 'تم إنشاء الواجب' : 'تم إنشاء التقييم';
        this.toastTriggered.emit({ text: successLabel, type: 'success' });
        this.openAssessmentEditor(newAsm);
      },
      error: (err) => {
        const errMsg = err?.error?.error?.message || err?.error?.message || 'تعذر إضافة التقييم.';
        this.toastTriggered.emit({ text: errMsg, type: 'error' });
      }
    });
  }

  deleteAssessment(unit: UnitPackageAdminItem, assessmentId: string): void {
    const asm = unit.assessments.find((a) => a.id === assessmentId);
    const asmTitle = asm ? asm.titleAr : '';
    const title = this.langService.isArabic() ? 'حذف التقييم' : 'Delete Assessment';
    const message = this.langService.isArabic()
      ? `هل أنتِ متأكدة من حذف "${asmTitle}" نهائياً؟ سيتم حذف جميع الأسئلة والتسليمات المرتبطة به.`
      : `Are you sure you want to permanently delete "${asmTitle}"? All questions and submissions will be removed.`;

    this.openConfirm(
      title,
      message,
      () => {
        this.http.delete(`/api/v1/admin/assessments/${assessmentId}`).subscribe({
          next: () => {
            const updatedLectures = (unit.lectures || []).map((l) =>
              l.assessmentId === assessmentId ? { ...l, hasAssessment: false, assessmentId: undefined } : l
            );
            const updatedUnit: UnitPackageAdminItem = {
              ...unit,
              lectures: updatedLectures,
              assessments: unit.assessments.filter((a) => a.id !== assessmentId)
            };
            this.draftService.deleteDraft(assessmentId).catch(() => {});
            this.pendingDraft.set(null);
            this.unitUpdated.emit(updatedUnit);
            this.toastTriggered.emit({
              text: this.langService.isArabic() ? 'تم حذف التقييم بنجاح' : 'Assessment deleted successfully',
              type: 'warning'
            });
          },
          error: (err) => {
            const errMsg = err?.error?.error?.message || err?.error?.message || (this.langService.isArabic() ? 'تعذر حذف التقييم' : 'Failed to delete assessment');
            this.toastTriggered.emit({ text: errMsg, type: 'error' });
          }
        });
      },
      true,
      this.langService.isArabic() ? 'نعم، احذف التقييم' : 'Yes, Delete',
      this.langService.isArabic() ? 'إلغاء' : 'Cancel'
    );
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
      this.toastTriggered.emit({ text: 'تم إرفاق ورقة القوانين', type: 'success' });
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
      this.toastTriggered.emit({ text: 'تم رفع ورقة القوانين', type: 'success' });
    }
  }

  removeReferenceSheetInCreateAssessment(): void {
    this.newAssessmentForm.update((f) => ({ ...f, referenceSheetUrl: null }));
    this.isRefSheetActiveInCreateAssessment.set(false);
  }

  openAssessmentEditor(asm: AssessmentAdminItem): void {
    const cloned = JSON.parse(JSON.stringify(asm));
    cloned.isMultiModule = !!cloned.isMultiModule;
    cloned.module1TimeMinutes = cloned.module1TimeMinutes ?? 35;
    cloned.module2TimeMinutes = cloned.module2TimeMinutes ?? 35;
    this.activeAssessment.set(cloned);
    this.moduleFilterTab.set('ALL');
    this.newQuestionModuleIndex.set(1);
    this.isRefSheetActiveInCurriculum.set(Boolean(asm.referenceSheetUrl));
    this.autoRegradeWarning.set(false);
    this.cancelQuestionEdit();
    this.isMathKeyboardOpen.set(false);
    this.isAssessmentEditorOpen.set(true);

    this.modalNav.registerModal({
      id: 'curriculum-assessment-editor',
      saveDraft: () => this.triggerDraftAutoSave(true),
      close: () => this.closeAssessmentEditor()
    });
  }

  closeAssessmentEditor(): void {
    if (this.isAssessmentEditorOpen() && this.activeAssessment()) {
      this.triggerDraftAutoSave(true);
    }
    this.isMathKeyboardOpen.set(false);
    this.mathKeyboardTarget.set(null);
    this.modalNav.dismissModal('curriculum-assessment-editor');
    this.isAssessmentEditorOpen.set(false);
    this.cancelQuestionEdit();
  }

  // =========================================================================
  // Question Extraction & Slicing Suite
  // =========================================================================
  openAiExtractionModal(): void {
    this.isAiExtractionModalOpen.set(true);
  }

  onQuestionsExtracted(extractedQuestions: AssessmentQuestionItem[]): void {
    const asm = this.activeAssessment();
    if (!asm || extractedQuestions.length === 0) return;

    const currentQuestions = asm.questions || [];
    const startOrder = currentQuestions.length;
    const formattedNewQuestions: QuestionAdminItem[] = extractedQuestions.map((q, idx) => ({
      id: q.id || `q_${Date.now()}_${idx}`,
      order: startOrder + idx + 1,
      type: (q.type === 'INPUT_TEXT' ? 'INPUT_TEXT' : (q.type === 'ESSAY' || q.type === 'ESSAY_PHOTO' ? 'ESSAY' : 'MCQ')) as any,
      textAr: q.textAr || 'مسألة رياضية',
      questionImageUrl: q.questionImageUrl || null,
      options: (q.type === 'MCQ' ? (q.options || []) : []).map((o) => (o || '').trim()),
      correctOptionIndex: q.correctOptionIndex ?? 0,
      acceptedAnswers: q.acceptedAnswers || [],
      points: q.points || 5,
      moduleIndex: q.moduleIndex === 2 ? 2 : 1
    }));

    const updatedQuestions = [...currentQuestions, ...formattedNewQuestions];
    const hasEssay = updatedQuestions.some(q => q.type === 'ESSAY' || q.type === 'ESSAY_PHOTO');
    const updatedAsm: AssessmentAdminItem = {
      ...asm,
      questions: updatedQuestions,
      requiresTeacherReview: hasEssay ? true : asm.requiresTeacherReview
    };
    this.activeAssessment.set(updatedAsm);
    this.triggerDraftAutoSave(true);
    this.toastTriggered.emit({
      text: this.langService.isArabic()
        ? `تم استخراج وحفظ ${extractedQuestions.length} أسئلة بنجاح`
        : `Successfully extracted and added ${extractedQuestions.length} questions`,
      type: 'success'
    });
  }

  onFileSessionCached(session: ICachedFileSession): void {
    const asm = this.activeAssessment();
    if (asm && asm.id) {
      this.assessmentFileSessions.update((sessions) => ({
        ...sessions,
        [asm.id]: session
      }));
    }
    this.toastTriggered.emit({
      text: this.langService.isArabic()
        ? `تم تجهيز صفحة ${session.pageNumber} للقص اليدوي.`
        : `Page ${session.pageNumber} cached and ready for manual crop.`,
      type: 'success'
    });
  }

  onManualSlicingRequestedFromExtraction(session: ICachedFileSession): void {
    const asm = this.activeAssessment();
    if (asm && asm.id) {
      this.assessmentFileSessions.update((sessions) => ({
        ...sessions,
        [asm.id]: session
      }));
    }
    this.openManualSlicerForComposer();
  }

  openManualSlicerForExistingQuestion(q: QuestionAdminItem): void {
    this.activeQuestionForSlicing.set(q);
    this.isManualSlicerOpen.set(true);
  }

  openManualSlicerForComposer(): void {
    this.activeQuestionForSlicing.set(null);
    this.isManualSlicerOpen.set(true);
  }

  onManualSliceSaved(result: ISliceResult): void {
    const q = this.activeQuestionForSlicing();
    if (q) {
      q.questionImageUrl = result.imageUrl;
      const asm = this.activeAssessment();
      if (asm) {
        this.activeAssessment.set({ ...asm });
      }
    } else {
      this.newQuestionImageUrl.set(result.imageUrl);
    }
    this.isManualSlicerOpen.set(false);
    this.activeQuestionForSlicing.set(null);
    this.triggerDraftAutoSave(true);
    this.toastTriggered.emit({
      text: this.langService.isArabic() ? 'تم قص وحفظ صورة السؤال بنجاح' : 'Question cropped and saved successfully',
      type: 'success'
    });
  }

  toggleMathKeyboard(fallbackTarget?: HTMLInputElement | HTMLTextAreaElement): void {
    if (this.isMathKeyboardOpen()) {
      this.isMathKeyboardOpen.set(false);
    } else {
      const currentTarget = this.mathKeyboardTarget();
      if (!currentTarget || !currentTarget.isConnected) {
        if (fallbackTarget) {
          this.mathKeyboardTarget.set(fallbackTarget);
        } else if (typeof document !== 'undefined') {
          const firstTarget = document.querySelector<HTMLTextAreaElement | HTMLInputElement>(
            '#curriculumQuestionComposer .question-input-wrapper textarea, #curriculumQuestionComposer input[type="text"]'
          );
          if (firstTarget) {
            this.mathKeyboardTarget.set(firstTarget);
          }
        }
      }
      this.isMathKeyboardOpen.set(true);
    }
  }

  openMathKeyboard(target: HTMLInputElement | HTMLTextAreaElement): void {
    this.mathKeyboardTarget.set(target);
    this.isMathKeyboardOpen.set(true);
  }

  private normalizeInputElementWithCursor(
    target: HTMLInputElement | HTMLTextAreaElement,
    rawVal: string
  ): string {
    const visualVal = stripLatexDelimiters(rawVal);
    if (target.value !== visualVal) {
      const rawPos = target.selectionStart ?? rawVal.length;
      const adjustedPos = Math.min(stripLatexDelimiters(rawVal.slice(0, rawPos)).length, visualVal.length);
      target.value = visualVal;
      target.setSelectionRange(adjustedPos, adjustedPos);
    }
    return visualVal;
  }

  onMathKeyboardValueChange(val: string): void {
    const target = this.mathKeyboardTarget();
    if (!target) return;
    const visualVal = this.normalizeInputElementWithCursor(target, val);
    if (target.tagName.toLowerCase() === 'textarea') {
      this.newQuestionTextAr.set(visualVal);
    } else {
      const optIdx = target.getAttribute('data-opt-index');
      if (optIdx !== null) {
        this.updateOption(Number(optIdx), visualVal);
      }
      const ansIdx = target.getAttribute('data-ans-index');
      if (ansIdx !== null) {
        this.updateAcceptedAnswer(Number(ansIdx), visualVal);
      }
    }
  }

  onQuestionTextInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    if (!target) return;
    const visualVal = this.normalizeInputElementWithCursor(target, target.value);
    this.newQuestionTextAr.set(visualVal);
  }

  onOptionInput(index: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!target) return;
    const visualVal = this.normalizeInputElementWithCursor(target, target.value);
    this.updateOption(index, visualVal);
  }

  updateOption(index: number, value: string): void {
    const visualVal = toVisualMath(value);
    this.newQuestionOptions.update((opts) => {
      const copy = opts.length === 4 ? [...opts] : [...opts, '', '', ''].slice(0, 4);
      copy[index] = visualVal;
      return copy;
    });
  }

  addAcceptedAnswerOption(): void {
    this.newQuestionAcceptedAnswers.update((ans) => [...ans, '']);
  }

  removeAcceptedAnswerOption(idx: number): void {
    this.newQuestionAcceptedAnswers.update((ans) => {
      if (ans.length <= 1) return [''];
      return ans.filter((_, i) => i !== idx);
    });
  }

  updateAcceptedAnswer(idx: number, eventOrVal: Event | string): void {
    let visualVal: string;
    if (typeof eventOrVal === 'string') {
      visualVal = toVisualMath(eventOrVal);
    } else {
      const target = eventOrVal.target as HTMLInputElement | null;
      visualVal = target ? this.normalizeInputElementWithCursor(target, target.value) : '';
    }
    this.newQuestionAcceptedAnswers.update((ans) => {
      const arr = [...ans];
      arr[idx] = visualVal;
      return arr;
    });
  }

  onQuestionPromptUploaded(imageUrl: string): void {
    this.newQuestionImageUrl.set(imageUrl);
    this.toastTriggered.emit({
      text: 'تم رفع صورة السؤال',
      type: 'success'
    });
  }

  editQuestion(q: QuestionAdminItem): void {
    const targetId = q.id || String(q.order);
    this.editingQuestionId.set(targetId);
    this.newQuestionType.set(q.type === 'ESSAY_PHOTO' ? 'ESSAY' : q.type);
    this.newQuestionTextAr.set(toVisualMath(q.textAr || ''));
    this.newQuestionImageUrl.set(q.questionImageUrl || null);
    const rawOpts = q.options && q.options.length === 4
      ? [...q.options]
      : (q.options?.length ? [...q.options, '', '', ''].slice(0, 4) : ['', '', '', '']);
    this.newQuestionOptions.set(rawOpts.map((o) => toVisualMath(o || '')));
    this.newQuestionAcceptedAnswers.set(
      q.acceptedAnswers && q.acceptedAnswers.length > 0 ? q.acceptedAnswers.map((a) => toVisualMath(a || '')) : ['']
    );
    this.newQuestionCorrectIndex.set(q.correctOptionIndex >= 0 ? q.correctOptionIndex : 0);
    this.newQuestionPoints.set(Math.max(1, Math.min(50, Number(q.points) || 5)));
    this.newQuestionModuleIndex.set(q.moduleIndex === 2 ? 2 : 1);

    if (typeof document !== 'undefined') {
      setTimeout(() => {
        const composerEl = document.getElementById('curriculumQuestionComposer');
        if (composerEl) {
          composerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }

    this.toastTriggered.emit({
      text: this.langService.isArabic()
        ? `جاري تعديل السؤال رقم ${q.order}`
        : `Editing Question #${q.order}`,
      type: 'warning'
    });
  }

  cancelQuestionEdit(): void {
    this.isMathKeyboardOpen.set(false);
    this.mathKeyboardTarget.set(null);
    this.newQuestionTextAr.set('');
    this.newQuestionImageUrl.set(null);
    this.newQuestionOptions.set(['', '', '', '']);
    this.newQuestionCorrectIndex.set(0);
    this.newQuestionAcceptedAnswers.set(['']);
    this.newQuestionPoints.set(5);
    this.newQuestionType.set('MCQ');
    this.newQuestionModuleIndex.set(1);
    this.editingQuestionId.set(null);
  }

  addQuestionToAssessment(): void {
    const asm = this.activeAssessment();
    if (!asm) return;

    const text = this.newQuestionTextAr().trim();
    if (!text && !this.newQuestionImageUrl()) {
      this.toastTriggered.emit({ text: 'أدخل نص السؤال أو صورته', type: 'error' });
      return;
    }

    const qType = this.newQuestionType();

    if (qType === 'MCQ') {
      const rawOpts = this.newQuestionOptions();
      const trimmedOpts = rawOpts.map((o) => (o || '').trim());

      // 1. Check for empty options
      if (trimmedOpts.some((o) => !o)) {
        this.toastTriggered.emit({
          text: 'املأ جميع الخيارات الأربعة',
          type: 'error'
        });
        return;
      }

      // 2. Check for duplicate options (CRITICAL REQUIREMENT)
      const uniqueOpts = new Set(trimmedOpts);
      if (uniqueOpts.size < trimmedOpts.length) {
        this.toastTriggered.emit({
          text: 'الخيارات يجب أن تكون مختلفة',
          type: 'error'
        });
        return;
      }
    } else if (qType === 'INPUT_TEXT') {
      const rawAns = this.newQuestionAcceptedAnswers();
      const trimmedAns = rawAns.map((a) => (a || '').trim()).filter(Boolean);
      if (trimmedAns.length === 0) {
        this.toastTriggered.emit({
          text: 'أدخل إجابة مقبولة واحدة على الأقل',
          type: 'error'
        });
        return;
      }
    }

    const isMcq = qType === 'MCQ';
    const isInputText = qType === 'INPUT_TEXT';
    const isEssay = qType === 'ESSAY';
    const editId = this.editingQuestionId();

    if (editId) {
      // UPDATE EXISTING QUESTION (R2)
      const targetIdx = asm.questions.findIndex((q) => (q.id && q.id === editId) || String(q.order) === editId);
      if (targetIdx === -1) {
        this.cancelQuestionEdit();
        return;
      }

      const existingQ = asm.questions[targetIdx];
      const updatedQ: QuestionAdminItem = {
        ...existingQ,
        type: qType,
        textAr: text || (this.langService.isArabic() ? 'مسألة رياضية مصورة' : 'Visual Math Problem'),
        questionImageUrl: this.newQuestionImageUrl(),
        options: isMcq ? this.newQuestionOptions().map((o) => o.trim()) : [],
        correctOptionIndex: isMcq ? this.newQuestionCorrectIndex() : 0,
        acceptedAnswers: isInputText ? this.newQuestionAcceptedAnswers().map((a) => a.trim()).filter(Boolean) : undefined,
        points: this.newQuestionPoints(),
        moduleIndex: asm.isMultiModule ? (this.newQuestionModuleIndex() === 2 ? 2 : 1) : 1
      };

      const nextQuestions = [...asm.questions];
      nextQuestions[targetIdx] = updatedQ;

      const hasEssayAfter = nextQuestions.some((q) => q.type === 'ESSAY' || q.type === 'ESSAY_PHOTO');
      const updatedAsm: AssessmentAdminItem = {
        ...asm,
        questions: nextQuestions,
        requiresTeacherReview: hasEssayAfter ? true : asm.requiresTeacherReview
      };
      this.activeAssessment.set(updatedAsm);

      if (asm.submissionsCount > 0) {
        this.autoRegradeWarning.set(true);
      }

      this.cancelQuestionEdit();
      this.triggerDraftAutoSave(true);

      this.toastTriggered.emit({
        text: this.langService.isArabic() ? 'تم تحديث السؤال بنجاح' : 'Question updated successfully',
        type: 'success'
      });
    } else {
      // ADD NEW QUESTION
      const newQ: QuestionAdminItem = {
        id: `q_${Date.now()}`,
        order: asm.questions.length + 1,
        type: qType,
        textAr: text || 'مسألة رياضية مصورة',
        questionImageUrl: this.newQuestionImageUrl(),
        options: isMcq ? this.newQuestionOptions().map((o) => o.trim()) : [],
        correctOptionIndex: isMcq ? this.newQuestionCorrectIndex() : 0,
        acceptedAnswers: isInputText ? this.newQuestionAcceptedAnswers().map((a) => a.trim()).filter(Boolean) : undefined,
        points: this.newQuestionPoints(),
        moduleIndex: asm.isMultiModule ? (this.newQuestionModuleIndex() === 2 ? 2 : 1) : 1
      };

      const updatedAsm: AssessmentAdminItem = {
        ...asm,
        questions: [...asm.questions, newQ],
        requiresTeacherReview: isEssay ? true : asm.requiresTeacherReview
      };
      this.activeAssessment.set(updatedAsm);

      this.cancelQuestionEdit();
      this.triggerDraftAutoSave(true);

      this.toastTriggered.emit({ text: 'تمت إضافة السؤال', type: 'success' });
    }
  }

  deleteQuestion(order: number): void {
    const asm = this.activeAssessment();
    if (!asm) return;

    this.openConfirm(
      'حذف السؤال',
      `حذف السؤال رقم ${order}؟`,
      () => {
        const filtered = asm.questions.filter((q) => q.order !== order);
        this.activeAssessment.set({ ...asm, questions: filtered });
        this.triggerDraftAutoSave(true);
        this.toastTriggered.emit({ text: 'تم حذف السؤال', type: 'warning' });
      },
      true,
      'حذف',
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
        text: 'أضف سؤالاً واحداً على الأقل',
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
            text: `س${q.order}: أضف خيارين على الأقل`,
            type: 'error'
          });
          return;
        }

        // Empty check
        if (opts.some((o) => !o)) {
          this.toastTriggered.emit({
            text: `س${q.order}: املأ جميع الخيارات`,
            type: 'error'
          });
          return;
        }

        // Duplicate check (CRITICAL REQUIREMENT)
        const unique = new Set(opts);
        if (unique.size < opts.length) {
          this.toastTriggered.emit({
            text: `س${q.order}: الخيارات متطابقة`,
            type: 'error'
          });
          return;
        }

        // Correct option bounds check
        if (q.correctOptionIndex === undefined || q.correctOptionIndex === null || q.correctOptionIndex < 0 || q.correctOptionIndex >= opts.length) {
          this.toastTriggered.emit({
            text: `س${q.order}: حدد الإجابة الصحيحة`,
            type: 'error'
          });
          return;
        }
      } else if (q.type === 'INPUT_TEXT') {
        const answers = (q.acceptedAnswers || []).map((a) => (a || '').trim()).filter(Boolean);
        if (answers.length === 0) {
          this.toastTriggered.emit({
            text: `س${q.order}: أضف إجابة مقبولة واحدة على الأقل`,
            type: 'error'
          });
          return;
        }
      }
    }

    const isHw = asm.type === 'HOMEWORK';
    const isMultiMod = !isHw && !!asm.isMultiModule;
    const mod1Time = isMultiMod ? (Number(asm.module1TimeMinutes) || 35) : null;
    const mod2Time = isMultiMod ? (Number(asm.module2TimeMinutes) || 35) : null;
    const computedDuration = isMultiMod
      ? ((Number(asm.module1TimeMinutes) || 35) + (Number(asm.module2TimeMinutes) || 35))
      : (asm.durationMinutes || 30);
    const hasEssay = asm.questions.some(q => q.type === 'ESSAY' || q.type === 'ESSAY_PHOTO');
    const requiresTeacherReview = hasEssay ? true : !!asm.requiresTeacherReview;

    // Transform questions into normalized schema for backend
    const payload = {
      is_published: true,
      title_ar: asm.titleAr ? asm.titleAr.trim() : undefined,
      title_en: asm.titleAr ? asm.titleAr.trim() : undefined,
      calculator_mode: asm.calculatorType,
      duration_minutes: computedDuration,
      time_limit_minutes: computedDuration,
      is_multi_module: isMultiMod,
      module_1_time_minutes: mod1Time,
      module_2_time_minutes: mod2Time,
      reference_sheet_url: asm.referenceSheetUrl || null,
      xp_reward: asm.xpReward !== null && asm.xpReward !== undefined ? Number(asm.xpReward) : undefined,
      requires_teacher_review: requiresTeacherReview,
      lecture_id: asm.lectureId !== undefined ? (asm.lectureId || null) : undefined,
      questions: asm.questions.map((q, idx) => {
        const isEssay = q.type === 'ESSAY' || q.type === 'ESSAY_PHOTO';
        const isInputText = q.type === 'INPUT_TEXT';
        const questionType = isEssay ? 'ESSAY_PHOTO' : (isInputText ? 'INPUT_TEXT' : 'MCQ');
        return {
          order: q.order || idx + 1,
          question_type: questionType,
          question_text: q.textAr || (isEssay ? 'مسألة مقالية' : 'مسألة رياضية'),
          question_image_url: q.questionImageUrl || null,
          options: (isEssay || isInputText) ? [] : (q.options || []).map((o) => (o || '').trim()),
          correct_option_index: (isEssay || isInputText) ? undefined : Math.max(0, q.correctOptionIndex ?? 0),
          accepted_answers: isInputText ? (q.acceptedAnswers || []).map((a) => (a || '').trim()).filter(Boolean) : undefined,
          points: q.points || 5,
          module_index: isMultiMod ? (q.moduleIndex === 2 ? 2 : 1) : 1
        };
      })
    };

    this.http.patch(`/api/v1/admin/assessments/${asm.id}`, payload).subscribe({
      next: () => {
        // Guaranteed draft cleanup from Dexie and LocalStorage upon successful save
        this.draftService.deleteDraft(asm.id).catch((err) => {
          console.warn('Error during post-save cleanup:', err);
        });
        this.pendingDraft.set(null);
        this.isMathKeyboardOpen.set(false);
        this.mathKeyboardTarget.set(null);
        this.modalNav.dismissModal('curriculum-assessment-editor');
        asm.isMultiModule = isMultiMod;
        asm.module1TimeMinutes = mod1Time ?? undefined;
        asm.module2TimeMinutes = mod2Time ?? undefined;
        asm.durationMinutes = computedDuration;
        asm.requiresTeacherReview = requiresTeacherReview;
        this.assessmentSaved.emit(asm);
        this.isAssessmentEditorOpen.set(false);
        this.toastTriggered.emit({
          text: this.autoRegradeWarning()
            ? 'تم الحفظ وتفعيل إعادة التصحيح'
            : (asm.type === 'HOMEWORK' ? 'تم حفظ أسئلة الواجب' : 'تم حفظ الامتحان'),
          type: 'success'
        });
      },
      error: (err) => {
        const errorMsg = err?.error?.message || err?.error?.error?.message || 'تعذر الحفظ. راجع البيانات.';
        this.toastTriggered.emit({
          text: errorMsg,
          type: 'error'
        });
      }
    });
  }

  getLectureTitle(unit: UnitPackageAdminItem, lectureId?: string | null): string {
    if (!lectureId) return '';
    const lec = (unit.lectures || []).find((l) => l.id === lectureId);
    return lec ? (this.langService.isArabic() ? lec.titleAr : (lec.titleEn || lec.titleAr)) : '';
  }

  getAssessmentForLecture(unit: UnitPackageAdminItem, lectureId: string): AssessmentAdminItem | undefined {
    return (unit.assessments || []).find((a) => a.lectureId === lectureId);
  }

  getUnitForAssessment(asm: AssessmentAdminItem): UnitPackageAdminItem | undefined {
    return this.units().find((u) => u.id === asm.unitId || (u.assessments || []).some((a) => a.id === asm.id));
  }
}
