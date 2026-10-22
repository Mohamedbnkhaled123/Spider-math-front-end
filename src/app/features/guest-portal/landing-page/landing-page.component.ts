import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import {
  CANONICAL_CURRICULUM_TREE,
  ICurriculumNode,
  CurriculumCode
} from '../../../core/constants/curriculum-tree.constant';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { SeoMetaService } from '../../../core/seo-theme-i18n/seo-meta.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslocoPipe],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPageComponent implements OnInit {
  readonly langService = inject(LangService);
  private readonly seoMetaService = inject(SeoMetaService);

  readonly curriculumTree = CANONICAL_CURRICULUM_TREE;
  readonly selectedCurriculumCode = signal<CurriculumCode>('EGYPTIAN');

  readonly selectedCurriculum = computed<ICurriculumNode>(() => {
    return (
      this.curriculumTree.find(c => c.code === this.selectedCurriculumCode()) ??
      this.curriculumTree[0]
    );
  });

  ngOnInit(): void {
    this.seoMetaService.setDefaultPlatformSeo(this.langService.currentLang());
  }

  selectCurriculum(code: CurriculumCode): void {
    this.selectedCurriculumCode.set(code);
  }
}
