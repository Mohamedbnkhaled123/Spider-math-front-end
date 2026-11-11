import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
  OnDestroy,
  effect,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { SeoMetaService } from '../../../core/seo-theme-i18n/seo-meta.service';
import { PublicDiscoveryService } from '../../../core/services/public-discovery.service';
import {
  ISeoKeywordPage,
  findSeoKeywordBySlug,
  SEO_KEYWORD_PAGES
} from '../../../core/constants/seo-keywords.constant';

@Component({
  selector: 'app-seo-keyword-page',
  standalone: true,
  imports: [CommonModule, RouterLink, AppIconComponent],
  templateUrl: './seo-keyword-page.component.html',
  styleUrl: './seo-keyword-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeoKeywordPageComponent implements OnInit, OnDestroy {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly langService = inject(LangService);
  private readonly seoService = inject(SeoMetaService);
  private readonly discoveryService = inject(PublicDiscoveryService);
  private readonly platformId = inject(PLATFORM_ID);

  // Dynamic slug from route
  private readonly slugParam = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug') || ''))
  );

  // Resolved keyword page model
  readonly keywordData = computed<ISeoKeywordPage | null>(() => {
    const slug = this.slugParam();
    if (!slug) return null;
    return findSeoKeywordBySlug(slug) || null;
  });

  // UI state
  readonly activeFaqIndex = signal<number | null>(0);
  readonly copiedToast = signal<boolean>(false);

  // Dynamic Contact Data from CMS
  readonly landingData = toSignal(this.discoveryService.getLandingData(), { initialValue: null });
  readonly whatsappNumber = computed(() => {
    const raw = this.landingData()?.whatsappSupportNumber ||
      this.landingData()?.contactChannels?.support_whatsapp ||
      this.landingData()?.contactChannels?.subscription_whatsapp ||
      '201090000000';
    return raw.replace(/[^0-9]/g, '');
  });

  // Related keywords
  readonly relatedKeywords = computed<ISeoKeywordPage[]>(() => {
    const current = this.keywordData();
    if (!current) return [];
    const slugs = current.relatedSlugs || [];
    const matches = slugs
      .map((s) => findSeoKeywordBySlug(s))
      .filter((k): k is ISeoKeywordPage => !!k && k.slug !== current.slug);

    if (matches.length < 4) {
      // Add other keywords from same category
      const sameCategory = SEO_KEYWORD_PAGES.filter(
        (k) => k.category === current.category && k.slug !== current.slug && !matches.includes(k)
      );
      matches.push(...sameCategory.slice(0, 4 - matches.length));
    }

    return matches.slice(0, 4);
  });

  constructor() {
    // Reactively update Title, Meta, OpenGraph, Canonical, and JSON-LD
    effect(() => {
      const data = this.keywordData();
      const isAr = this.langService.isArabic();

      if (!data) {
        this.seoService.setCustomPageSeo({
          title: isAr ? 'الموضوع غير متوفر | سبايدر ماث' : 'Topic Not Found | Spider Math',
          description: isAr
            ? 'نعتذر، لم يتم العثور على هذا الموضوع. تصفح فهرس الموضوعات والمناهج المتاحة.'
            : 'Topic not found. Browse our comprehensive mathematical curricula index.'
        });
        return;
      }

      const title = isAr ? data.pageTitleAr : data.pageTitleEn;
      const description = isAr ? data.metaDescriptionAr : data.metaDescriptionEn;
      const canonicalUrl = `https://spider-math.com/topic/${data.slug}`;
      const keywords = isAr ? [...data.tagsAr] : [...data.tagsEn];

      // Update Meta & Title
      this.seoService.setCustomPageSeo({
        title,
        description,
        canonicalUrl,
        keywords,
        ogType: 'article'
      });

      // Inject Schema.org JSON-LD
      this.injectStructuredData(data, isAr);
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  ngOnDestroy(): void {
    this.seoService.removeSchemaJsonLd('schema-breadcrumb-jsonld');
    this.seoService.removeSchemaJsonLd('schema-course-jsonld');
    this.seoService.removeSchemaJsonLd('schema-faq-jsonld');
  }

  toggleFaq(index: number): void {
    this.activeFaqIndex.update((curr) => (curr === index ? null : index));
  }

  copyPageUrl(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const url = window.location.href;
    navigator.clipboard?.writeText(url).then(() => {
      this.copiedToast.set(true);
      setTimeout(() => this.copiedToast.set(false), 3000);
    });
  }

  getWhatsAppConsultationUrl(): string {
    const data = this.keywordData();
    const phone = this.whatsappNumber();
    const isAr = this.langService.isArabic();
    const topicName = data ? (isAr ? data.keywordAr : data.keywordEn) : '';
    const text = isAr
      ? `مرحباً ميس هبة عياد، أود الاستفسار عن كورس (${topicName}) على منصة سبايدر ماث.`
      : `Hello Miss Heba Ayad, I would like to inquire about the (${topicName}) course on Spider Math.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }

  private injectStructuredData(data: ISeoKeywordPage, isAr: boolean): void {
    const topicUrl = `https://spider-math.com/topic/${data.slug}`;

    // 1. BreadcrumbList Schema
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: isAr ? 'الرئيسية' : 'Home',
          item: 'https://spider-math.com/'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: isAr ? 'فهرس الموضوعات والمناهج' : 'Topics Directory',
          item: 'https://spider-math.com/topics'
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: isAr ? data.keywordAr : data.keywordEn,
          item: topicUrl
        }
      ]
    };
    this.seoService.injectSchemaJsonLd(breadcrumbSchema, 'schema-breadcrumb-jsonld');

    // 2. Course & Educational Content Schema
    const courseSchema = {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: isAr ? data.pageTitleAr : data.pageTitleEn,
      description: isAr ? data.metaDescriptionAr : data.metaDescriptionEn,
      provider: {
        '@type': 'EducationalOrganization',
        name: 'Spider Math Educational Platform',
        alternateName: 'منصة سبايدر ماث التعليمية',
        url: 'https://spider-math.com'
      },
      instructor: {
        '@type': 'Person',
        name: 'Eng. Heba Abdel-Wahab (Heba Ayad)',
        jobTitle: 'Senior Mathematics Lecturer'
      },
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'Online',
        courseWorkload: 'PT10H'
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EGP',
        category: 'Diagnostic Assessment & Starter Lessons',
        availability: 'https://schema.org/InStock'
      }
    };
    this.seoService.injectSchemaJsonLd(courseSchema, 'schema-course-jsonld');

    // 3. FAQPage Schema
    if (data.faqs && data.faqs.length > 0) {
      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: data.faqs.map((f) => ({
          '@type': 'Question',
          name: isAr ? f.questionAr : f.questionEn,
          acceptedAnswer: {
            '@type': 'Answer',
            text: isAr ? f.answerAr : f.answerEn
          }
        }))
      };
      this.seoService.injectSchemaJsonLd(faqSchema, 'schema-faq-jsonld');
    }
  }
}
