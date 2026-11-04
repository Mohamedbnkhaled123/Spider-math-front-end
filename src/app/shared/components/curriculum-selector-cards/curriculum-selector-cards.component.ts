import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  input,
  output,
  inject,
  effect,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AppIconComponent } from '../app-icon/app-icon.component';
import {
  CANONICAL_CURRICULUM_TREE,
  CurriculumCode,
  AcademicTermCode
} from '../../../core/constants/curriculum-tree.constant';
import { PublicDiscoveryService } from '../../../core/services/public-discovery.service';
import { ICurriculumTreeItem } from '../../../core/services/public-discovery.models';
import {
  ICurriculumSelection,
  ICurriculumUiCard,
  IGradeLevelAvailability
} from './curriculum-selector-cards.models';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { AuthService } from '../../../core/auth/auth.service';

export type StageFilterType = 'ALL' | 'PRIMARY' | 'PREPARATORY' | 'SECONDARY';

@Component({
  selector: 'app-curriculum-selector-cards',
  standalone: true,
  imports: [CommonModule, AppIconComponent],
  templateUrl: './curriculum-selector-cards.component.html',
  styleUrl: './curriculum-selector-cards.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurriculumSelectorCardsComponent implements OnInit {
  private readonly discoveryService = inject(PublicDiscoveryService);
  private readonly router = inject(Router);
  readonly langService = inject(LangService);
  readonly authService = inject(AuthService);

  // Inputs
  readonly initialCurriculum = input<CurriculumCode>('EGYPTIAN');
  readonly initialGrade = input<string>('SEC_3');
  readonly initialTerm = input<AcademicTermCode>('TERM_1');
  readonly showDetails = input<boolean>(true);
  readonly landingUnitIds = input<string[] | undefined>();

  // Outputs
  readonly selectionChange = output<ICurriculumSelection>();

  // State Signals
  readonly selectedCurriculumCode = signal<CurriculumCode>('EGYPTIAN');
  readonly selectedGradeCode = signal<string>('SEC_3');
  readonly selectedTermCode = signal<AcademicTermCode>('TERM_1');
  readonly dynamicTree = signal<ICurriculumTreeItem[]>([]);
  readonly isLoading = signal<boolean>(true);

  // Units Catalog State (Real from Atlas)
  readonly publishedUnits = signal<any[]>([]);
  readonly isLoadingUnits = signal<boolean>(false);

  // Unit Preview Modal & Protected Content Auth Gate
  readonly selectedUnitForPreview = signal<any | null>(null);
  readonly unitLectures = signal<any[]>([]);
  readonly isLoadingUnitContents = signal<boolean>(false);
  readonly showAuthGateModal = signal<boolean>(false);

  // Phase 2.3: Frosted Glass Track Modal State
  readonly isTrackModalOpen = signal<boolean>(false);
  readonly modalStep = signal<'GRADES' | 'UNITS'>('GRADES');
  readonly activeStageFilter = signal<StageFilterType>('ALL');

  // Computed: Merges CANONICAL_CURRICULUM_TREE with dynamic availability flags from MongoDB
  readonly curriculumCards = computed<ICurriculumUiCard[]>(() => {
    const rawTree = this.dynamicTree();
    return CANONICAL_CURRICULUM_TREE.map(node => {
      const serverCurriculum = rawTree.find(c => c.curriculum === node.code);
      const availableGrades: IGradeLevelAvailability[] = node.grades.map(grade => {
        const serverGrade = serverCurriculum?.gradeLevels.find(g => g.gradeLevel === grade.code);
        const hasPublished = serverGrade ? serverGrade.hasPublishedUnits : false;
        const count = serverGrade ? serverGrade.totalPublishedUnitsCount : 0;
        const isAvail = serverGrade ? serverGrade.isAvailable : false;
        return {
          ...grade,
          isAvailable: isAvail,
          hasPublishedUnits: hasPublished,
          publishedUnitsCount: count
        };
      });

      return {
        ...node,
        availableGrades,
        isAvailable: serverCurriculum ? serverCurriculum.hasPublishedUnits : false,
        publishedUnitsCount: serverCurriculum ? serverCurriculum.totalPublishedUnitsCount : 0
      };
    });
  });

  // Computed: The currently selected curriculum card
  readonly selectedCurriculum = computed<ICurriculumUiCard>(() => {
    const cards = this.curriculumCards();
    return (
      cards.find(c => c.code === this.selectedCurriculumCode()) ?? cards[0]
    );
  });

  // Filtered grades for the Frosted Glass Modal according to activeStageFilter
  readonly filteredGradesForModal = computed<IGradeLevelAvailability[]>(() => {
    const curr = this.selectedCurriculum();
    if (!curr) return [];
    const filter = this.activeStageFilter();

    return curr.availableGrades.filter(g => {
      if (filter === 'ALL') return true;
      const stageEn = (g.stageEn || '').toLowerCase();
      const code = g.code;
      if (filter === 'PRIMARY') {
        return (
          stageEn.includes('primary') ||
          code.startsWith('PRI') ||
          code.startsWith('GRADE_1') ||
          code.startsWith('GRADE_2') ||
          code.startsWith('GRADE_3') ||
          code.startsWith('GRADE_4') ||
          code.startsWith('GRADE_5') ||
          code.startsWith('GRADE_6')
        );
      }
      if (filter === 'PREPARATORY') {
        return (
          stageEn.includes('prep') ||
          stageEn.includes('middle') ||
          code.startsWith('PREP') ||
          code.startsWith('GRADE_7') ||
          code.startsWith('GRADE_8') ||
          code.startsWith('GRADE_9')
        );
      }
      if (filter === 'SECONDARY') {
        return (
          stageEn.includes('second') ||
          stageEn.includes('high') ||
          code.startsWith('SEC') ||
          code.startsWith('GRADE_10') ||
          code.startsWith('GRADE_11') ||
          code.startsWith('GRADE_12')
        );
      }
      return true;
    });
  });

  // Computed: Selected Grade Object
  readonly currentSelectedGrade = computed<IGradeLevelAvailability | undefined>(() => {
    const curr = this.selectedCurriculum();
    if (!curr) return undefined;
    return curr.availableGrades.find(g => g.code === this.selectedGradeCode()) || curr.availableGrades[0];
  });

  constructor() {
    effect(() => {
      const term = this.initialTerm();
      if (term) {
        this.selectedTermCode.set(term);
        this.loadUnitsForSelection();
      }
    });
  }

  ngOnInit(): void {
    this.selectedCurriculumCode.set(this.initialCurriculum());
    this.selectedGradeCode.set(this.initialGrade());
    this.selectedTermCode.set(this.initialTerm());

    this.loadUnitsForSelection();

    this.discoveryService.getCurriculumTree().subscribe({
      next: tree => {
        this.dynamicTree.set(tree);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  loadUnitsForSelection(): void {
    this.isLoadingUnits.set(true);
    this.discoveryService.getUnitsCatalog(
      this.selectedCurriculumCode(),
      this.selectedGradeCode(),
      this.selectedTermCode()
    ).subscribe({
      next: units => {
        const allowedIds = this.landingUnitIds();
        let filtered = units || [];
        if (allowedIds && allowedIds.length > 0) {
          filtered = filtered.filter(u => allowedIds.includes(u._id));
        }
        this.publishedUnits.set(filtered);
        this.isLoadingUnits.set(false);
      },
      error: () => {
        this.publishedUnits.set([]);
        this.isLoadingUnits.set(false);
      }
    });
  }

  // Card click & modal controls
  openTrackModal(code: CurriculumCode): void {
    this.selectedCurriculumCode.set(code);
    const curr = this.curriculumCards().find(c => c.code === code);
    if (curr && curr.availableGrades.length > 0) {
      const p4 = curr.availableGrades.find(g => g.code === 'PRI_4' || g.code === 'GRADE_4');
      this.selectedGradeCode.set(p4 ? p4.code : curr.availableGrades[0].code);
    }
    this.modalStep.set('GRADES');
    this.activeStageFilter.set('ALL');
    this.isTrackModalOpen.set(true);
    this.emitSelection();
  }

  closeTrackModal(): void {
    this.isTrackModalOpen.set(false);
  }

  setStageFilter(filter: StageFilterType): void {
    this.activeStageFilter.set(filter);
  }

  openGradeUnits(gradeCode: string): void {
    this.selectedGradeCode.set(gradeCode);
    this.modalStep.set('UNITS');
    this.emitSelection();
    this.loadUnitsForSelection();
  }

  backToGrades(): void {
    this.modalStep.set('GRADES');
  }

  selectCurriculum(code: CurriculumCode): void {
    this.openTrackModal(code);
  }

  selectGrade(gradeCode: string): void {
    this.selectedGradeCode.set(gradeCode);
    this.emitSelection();
    this.loadUnitsForSelection();
  }

  selectTerm(term: AcademicTermCode): void {
    this.selectedTermCode.set(term);
    this.emitSelection();
    this.loadUnitsForSelection();
  }

  startPlacementExamForCurrentGrade(): void {
    this.closeTrackModal();
    this.router.navigate(['/placement-test'], {
      queryParams: {
        curriculum: this.selectedCurriculumCode(),
        gradeLevel: this.selectedGradeCode(),
        term: this.selectedTermCode()
      }
    });
  }

  openUnitPreview(unit: any): void {
    this.selectedUnitForPreview.set(unit);
    this.isLoadingUnitContents.set(true);
    this.discoveryService.getUnitContents(unit._id).subscribe({
      next: data => {
        this.unitLectures.set(data?.lectures || []);
        this.isLoadingUnitContents.set(false);
      },
      error: () => {
        this.unitLectures.set([]);
        this.isLoadingUnitContents.set(false);
      }
    });
  }

  closeUnitPreview(): void {
    this.selectedUnitForPreview.set(null);
    this.unitLectures.set([]);
  }

  attemptWatchLecture(unit: any): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/student/units', unit._id]);
    } else {
      this.showAuthGateModal.set(true);
    }
  }

  closeAuthGateModal(): void {
    this.showAuthGateModal.set(false);
  }

  goToLogin(): void {
    this.showAuthGateModal.set(false);
    this.router.navigate(['/login']);
  }

  goToSignup(): void {
    this.showAuthGateModal.set(false);
    this.router.navigate(['/login'], { queryParams: { mode: 'signup' } });
  }

  getGradeLabel(gradeCode?: string): string {
    if (!gradeCode) return '';
    for (const c of CANONICAL_CURRICULUM_TREE) {
      const g = c.grades.find(item => item.code === gradeCode);
      if (g) {
        return this.langService.isArabic()
          ? `${g.stageAr} • ${g.shortLabelAr}`
          : `${g.stageEn} • ${g.shortLabelEn}`;
      }
    }
    return gradeCode;
  }

  getGradeSubtitle(grade: IGradeLevelAvailability): string {
    const isAr = this.langService.isArabic();
    const code = grade.code;

    if (code === 'PRI_4' || code === 'GRADE_4') {
      return isAr ? '6 وحدات • الجبر والحساب' : '6 Units • Algebra & Arithmetic';
    }
    if (code === 'PRI_5' || code === 'GRADE_5') {
      return isAr ? '6 وحدات • أساسيات الرياضيات' : '6 Units • Math Fundamentals';
    }
    if (code === 'PRI_6' || code === 'GRADE_6') {
      return isAr ? '7 وحدات • الهندسة والجبر' : '7 Units • Geometry & Algebra';
    }
    if (code === 'PREP_1' || code === 'GRADE_7') {
      return isAr ? '5 وحدات • الجبر والهندسة' : '5 Units • Algebra & Geometry';
    }
    if (code === 'PREP_2' || code === 'GRADE_8') {
      return isAr ? '6 وحدات • الجبر والهندسة' : '6 Units • Algebra & Geometry';
    }
    if (code === 'PREP_3' || code === 'GRADE_9') {
      return isAr ? '5 وحدات • الجبر، الهندسة وحساب المثلثات' : '5 Units • Algebra, Geometry & Trig';
    }
    if (code === 'SEC_1' || code === 'GRADE_10') {
      return isAr ? '6 وحدات • الجبر، المثلثات والهندسة' : '6 Units • Algebra, Trig & Geometry';
    }
    if (code === 'SEC_2' || code === 'GRADE_11') {
      return isAr ? '8 وحدات • التفاضل، الجبر والميكانيكا' : '8 Units • Calculus, Algebra & Mechanics';
    }
    if (code === 'SEC_3' || code === 'GRADE_12') {
      return isAr ? '10 وحدات • الرياضيات البحتة والتطبيقية' : '10 Units • Pure & Applied Mathematics';
    }

    const count = grade.publishedUnitsCount || 6;
    return isAr ? `${count} وحدات • منهج متكامل` : `${count} Units • Complete Curriculum`;
  }

  getGradeMathIcon(code: string): 'operators' | 'triangle' | 'calculus' {
    if (code.includes('SEC_2') || code.includes('SEC_3') || code.includes('11') || code.includes('12')) {
      return 'calculus';
    }
    if (code.includes('PREP_3') || code.includes('SEC_1') || code.includes('9') || code.includes('10')) {
      return 'triangle';
    }
    return 'operators';
  }

  private emitSelection(): void {
    this.selectionChange.emit({
      curriculum: this.selectedCurriculumCode(),
      gradeLevel: this.selectedGradeCode(),
      academicTerm: this.selectedTermCode()
    });
  }
}
