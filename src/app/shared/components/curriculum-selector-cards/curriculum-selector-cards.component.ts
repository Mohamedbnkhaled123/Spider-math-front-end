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
import { RouterLink } from '@angular/router';
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
  readonly langService = inject(LangService);

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

  // Computed: Merges CANONICAL_CURRICULUM_TREE with dynamic availability flags from MongoDB
  readonly curriculumCards = computed<ICurriculumUiCard[]>(() => {
    const rawTree = this.dynamicTree();
    return CANONICAL_CURRICULUM_TREE.map(node => {
      const serverCurriculum = rawTree.find(c => c.curriculum === node.code);
      const availableGrades: IGradeLevelAvailability[] = node.grades.map(grade => {
        const serverGrade = serverCurriculum?.gradeLevels.find(g => g.gradeLevel === grade.code);
        const hasPublished = serverGrade ? serverGrade.hasPublishedUnits : true;
        const count = serverGrade ? serverGrade.totalPublishedUnitsCount : 3;
        const isAvail = serverGrade ? serverGrade.isAvailable : true;
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
        isAvailable: serverCurriculum ? serverCurriculum.hasPublishedUnits : true,
        publishedUnitsCount: serverCurriculum ? serverCurriculum.totalPublishedUnitsCount : 12
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

  selectCurriculum(code: CurriculumCode): void {
    this.selectedCurriculumCode.set(code);
    const curr = this.curriculumCards().find(c => c.code === code);
    if (curr && curr.availableGrades.length > 0) {
      // Pick first available grade if current selection doesn't match
      const exists = curr.availableGrades.some(g => g.code === this.selectedGradeCode());
      if (!exists) {
        this.selectedGradeCode.set(curr.availableGrades[0].code);
      }
    }
    this.emitSelection();
  }

  selectGrade(gradeCode: string): void {
    this.selectedGradeCode.set(gradeCode);
    this.emitSelection();
  }

  selectTerm(term: AcademicTermCode): void {
    this.selectedTermCode.set(term);
    this.emitSelection();
  }

  private emitSelection(): void {
    this.selectionChange.emit({
      curriculum: this.selectedCurriculumCode(),
      gradeLevel: this.selectedGradeCode(),
      academicTerm: this.selectedTermCode()
    });
  }
}
