import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { CurriculumSelectorCardsComponent } from '../../../shared/components/curriculum-selector-cards/curriculum-selector-cards.component';
import { ICurriculumSelection } from '../../../shared/components/curriculum-selector-cards/curriculum-selector-cards.models';
import { PublicDiscoveryService } from '../../../core/services/public-discovery.service';
import { IPublicLandingData, IScheduleItem, IPricingPackage } from '../../../core/services/public-discovery.models';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { SeoMetaService } from '../../../core/seo-theme-i18n/seo-meta.service';
import { CurriculumCode, AcademicTermCode } from '../../../core/constants/curriculum-tree.constant';

@Component({
  selector: 'app-landing-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslocoPipe,
    AppIconComponent,
    CurriculumSelectorCardsComponent
  ],
  templateUrl: './landing-home.component.html',
  styleUrl: './landing-home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingHomeComponent implements OnInit {
  private readonly discoveryService = inject(PublicDiscoveryService);
  private readonly seoMetaService = inject(SeoMetaService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly langService = inject(LangService);

  // User Selection State
  readonly selectedCurriculum = signal<CurriculumCode>('EGYPTIAN');
  readonly selectedGradeLevel = signal<string>('SEC_3');
  readonly selectedTerm = signal<AcademicTermCode>('TERM_1');
  readonly activeUnitTab = signal<'STUDY_UNIT' | 'FINAL_REVISION'>('STUDY_UNIT');

  // Landing Data Signal
  readonly landingData = signal<IPublicLandingData | null>(null);
  readonly isLoading = signal<boolean>(true);

  // Mouse coordinates for interactive Cartesian Spotlight (Animation 4.1)
  readonly mouseX = signal<number>(50);
  readonly mouseY = signal<number>(50);

  // Filtered Schedules Table (Reacts immediately to curriculum, grade, term)
  readonly filteredSchedules = computed<IScheduleItem[]>(() => {
    const data = this.landingData();
    if (!data || !Array.isArray(data.schedules)) return [];
    const curr = this.selectedCurriculum();
    const grade = this.selectedGradeLevel();
    const list = data.schedules.filter(s => s.curriculum === curr && (!s.gradeLevel || s.gradeLevel === grade));
    return list.length > 0 ? list : data.schedules.filter(s => s.curriculum === curr);
  });

  // Filtered Pricing Packages (Reacts immediately to curriculum and activeUnitTab)
  readonly filteredPackages = computed<IPricingPackage[]>(() => {
    const data = this.landingData();
    if (!data || !Array.isArray(data.pricingPackages)) return [];
    const curr = this.selectedCurriculum();
    const tab = this.activeUnitTab();
    const list = data.pricingPackages.filter(p => p.curriculum === curr && p.type === tab);
    if (list.length > 0) return list;
    const tabList = data.pricingPackages.filter(p => p.type === tab);
    return tabList.length > 0 ? tabList : data.pricingPackages.filter(p => p.curriculum === curr);
  });

  ngOnInit(): void {
    this.seoMetaService.setDefaultPlatformSeo(this.langService.currentLang());

    this.discoveryService.getLandingData().subscribe({
      next: data => {
        this.landingData.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  onCurriculumSelectionChanged(selection: ICurriculumSelection): void {
    this.selectedCurriculum.set(selection.curriculum);
    this.selectedGradeLevel.set(selection.gradeLevel);
    this.selectedTerm.set(selection.academicTerm);
  }

  onMouseMove(event: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.round(((event.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((event.clientY - rect.top) / rect.height) * 100);
    this.mouseX.set(x);
    this.mouseY.set(y);
  }

  setUnitTab(tab: 'STUDY_UNIT' | 'FINAL_REVISION'): void {
    this.activeUnitTab.set(tab);
  }

  scrollToSection(sectionId: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  openWhatsAppSupport(): void {
    const data = this.landingData();
    const phone = data?.whatsappSupportNumber || '+201000000000';
    const message = encodeURIComponent(
      this.langService.isArabic()
        ? 'مرحباً، أرغب بالاستفسار عن اشتراكات منصة Spider Math والدروس المتاحة.'
        : 'Hello, I would like to inquire about Spider Math platform subscriptions and courses.'
    );
    if (isPlatformBrowser(this.platformId)) {
      window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
    }
  }
}
