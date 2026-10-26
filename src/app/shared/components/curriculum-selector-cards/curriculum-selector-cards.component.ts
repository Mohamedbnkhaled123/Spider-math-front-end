import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  input,
  output,
  inject,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

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

@Component({
  selector: 'app-curriculum-selector-cards',
  standalone: true,
  imports: [CommonModule, RouterLink, AppIconComponent],
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
        this.publishedUnits.set(units || []);
        this.isLoadingUnits.set(false);
      },
      error: () => {
        this.publishedUnits.set([]);
        this.isLoadingUnits.set(false);
      }
    });
  }

  selectCurriculum(code: CurriculumCode): void {
    this.selectedCurriculumCode.set(code);
    const curr = this.curriculumCards().find(c => c.code === code);
    if (curr && curr.availableGrades.length > 0) {
      const exists = curr.availableGrades.some(g => g.code === this.selectedGradeCode());
      if (!exists) {
        this.selectedGradeCode.set(curr.availableGrades[0].code);
      }
    }
    this.emitSelection();
    this.loadUnitsForSelection();
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
      // Logged in student can go directly to unit study workspace
      this.router.navigate(['/student/units', unit._id]);
    } else {
      // Guest: Prompt login/signup modal
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

  private emitSelection(): void {
    this.selectionChange.emit({
      curriculum: this.selectedCurriculumCode(),
      gradeLevel: this.selectedGradeCode(),
      academicTerm: this.selectedTermCode()
    });
  }
}

