import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { SeoMetaService } from '../../../core/seo-theme-i18n/seo-meta.service';
import {
  SEO_KEYWORD_PAGES,
  SEO_KEYWORD_CATEGORIES,
  ISeoKeywordPage
} from '../../../core/constants/seo-keywords.constant';

@Component({
  selector: 'app-seo-topics-index',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AppIconComponent],
  templateUrl: './seo-topics-index.component.html',
  styleUrl: './seo-topics-index.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeoTopicsIndexComponent implements OnInit {
  readonly langService = inject(LangService);
  private readonly seoService = inject(SeoMetaService);

  readonly searchQuery = signal<string>('');
  readonly selectedCategory = signal<string>('all');

  readonly categories = SEO_KEYWORD_CATEGORIES;
  readonly allTopics = SEO_KEYWORD_PAGES;

  readonly filteredTopics = computed<ISeoKeywordPage[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const cat = this.selectedCategory();

    return this.allTopics.filter((t) => {
      // Category filter
      if (cat !== 'all' && t.category !== cat) {
        return false;
      }

      // Query filter
      if (!query) return true;

      const matchAr = t.keywordAr.toLowerCase().includes(query) ||
        t.pageTitleAr.toLowerCase().includes(query) ||
        t.tagsAr.some((tag) => tag.toLowerCase().includes(query));

      const matchEn = t.keywordEn.toLowerCase().includes(query) ||
        t.pageTitleEn.toLowerCase().includes(query) ||
        t.tagsEn.some((tag) => tag.toLowerCase().includes(query));

      const matchSlug = t.slug.toLowerCase().includes(query);

      return matchAr || matchEn || matchSlug;
    });
  });

  ngOnInit(): void {
    this.setupPageSeo();
  }

  setCategory(catId: string): void {
    this.selectedCategory.set(catId);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  private setupPageSeo(): void {
    const isAr = this.langService.isArabic();
    const title = isAr
      ? 'فهرس مواضيع ومناهج سبايدر ماث | دليل الرياضيات والماث الشامل — ميس هبة عياد'
      : 'Topics & Curricula Directory | Spider Math Platform — Eng. Heba Ayad';

    const description = isAr
      ? 'استعرض كافة الموضوعات والمناهج وشروحات الرياضيات للدبلومة الأمريكية والبكالوريا والثانوية العامة والشهادة الإعدادية مع المهندسة هبة عبدالوهاب.'
      : 'Browse all 75 mathematics courses, curricula, and exam guides for SAT, EST, Baccalaureate, and Thanaweya Amma by Eng. Heba Abdel-Wahab.';

    this.seoService.setCustomPageSeo({
      title,
      description,
      canonicalUrl: 'https://spider-math.com/topics',
      keywords: isAr
        ? ['فهرس سبايدر ماث', 'مناهج الرياضيات', 'هبه عياد', 'SAT Math', 'البكالوريا', 'الثانوية العامة']
        : ['Spider Math Directory', 'Math Topics', 'Heba Ayad', 'SAT Math', 'Baccalaureate'],
      ogType: 'website'
    });

    // Ingest ItemList Schema.org for Google crawlers
    const itemListSchema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: title,
      description,
      numberOfItems: this.allTopics.length,
      itemListElement: this.allTopics.map((topic, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: isAr ? topic.keywordAr : topic.keywordEn,
        url: `https://spider-math.com/topic/${topic.slug}`
      }))
    };

    this.seoService.injectSchemaJsonLd(itemListSchema, 'schema-topics-itemlist-jsonld');
  }
}
