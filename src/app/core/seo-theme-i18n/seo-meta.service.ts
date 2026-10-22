import { Injectable, inject, DOCUMENT } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

export interface IPageSeoConfig {
  readonly title: string;
  readonly description: string;
  readonly canonicalUrl?: string;
  readonly keywords?: readonly string[];
  readonly ogImage?: string;
  readonly ogType?: 'website' | 'article' | 'video.other';
}

export interface IUnitPackageSeoInput {
  readonly titleAr: string;
  readonly titleEn: string;
  readonly descriptionAr: string;
  readonly descriptionEn: string;
  readonly curriculum: string;
  readonly gradeLevel: string;
  readonly term: string;
  readonly priceEgp?: number;
  readonly coverImageUrl?: string;
  readonly lecturesCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SeoMetaService {
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly document = inject(DOCUMENT);

  private readonly DEFAULT_BASE_URL = 'https://spider-math.com';
  private readonly DEFAULT_OG_IMAGE = 'https://spider-math.com/assets/branding/spider-math-og.jpg';
  private readonly BRAND_NAME_AR = 'منصة سبايدر ماث التعليمية — المهندسة هبة عبدالوهاب';
  private readonly BRAND_NAME_EN = 'Spider Math Platform — Eng. Heba Abdel-Wahab';

  /**
   * Sets default platform-wide SSR SEO tags and EducationalOrganization Schema.org JSON-LD.
   */
  setDefaultPlatformSeo(lang: 'ar' | 'en' = 'en'): void {
    const isAr = lang === 'ar';
    const title = isAr
      ? `منصة سبايدر ماث التعليمية | المهندسة هبة عبدالوهاب — من الأساسيات للتميّز`
      : `Spider Math Platform | Eng. Heba Abdel-Wahab — World-Class Mathematics Mastery`;

    const description = isAr
      ? `منصة سبايدر ماث التعليمية الرائدة في تدريس الرياضيات للمنهج المصري، الخليجي، المناهج الدولية (IGCSE) والدبلومة الأمريكية (SAT • EST • ACT) بإشراف المهندسة هبة عبدالوهاب.`
      : `Premier mathematics learning platform for Egyptian, Gulf, International (IGCSE/British) and American Diploma curricula led by Eng. Heba Abdel-Wahab.`;

    this.setCustomPageSeo({
      title,
      description,
      canonicalUrl: this.DEFAULT_BASE_URL,
      keywords: isAr
        ? ['سبايدر ماث', 'هبة عبدالوهاب', 'ماث ثانوية عامة', 'IGCSE Math', 'SAT Math', 'ديسموس', 'رياضيات اونلاين']
        : ['Spider Math', 'Heba Abdel-Wahab', 'Thanaweya Amma Math', 'IGCSE Math', 'Digital SAT Math', 'Desmos Calculator'],
      ogImage: this.DEFAULT_OG_IMAGE,
      ogType: 'website'
    });

    this.injectEducationalOrganizationSchema();
  }

  /**
   * 100% Code-Managed SSR SEO Setter for any route.
   */
  setCustomPageSeo(config: IPageSeoConfig): void {
    this.titleService.setTitle(config.title);

    // Standard Meta Tags
    this.metaService.updateTag({ name: 'description', content: config.description });
    if (config.keywords?.length) {
      this.metaService.updateTag({ name: 'keywords', content: config.keywords.join(', ') });
    }
    this.metaService.updateTag({ name: 'author', content: 'Eng. Heba Abdel-Wahab (Spider Math)' });
    this.metaService.updateTag({ name: 'robots', content: 'index, follow, max-image-preview:large' });

    // OpenGraph Tags
    const url = config.canonicalUrl || this.DEFAULT_BASE_URL;
    const image = config.ogImage || this.DEFAULT_OG_IMAGE;
    const type = config.ogType || 'website';

    this.metaService.updateTag({ property: 'og:title', content: config.title });
    this.metaService.updateTag({ property: 'og:description', content: config.description });
    this.metaService.updateTag({ property: 'og:url', content: url });
    this.metaService.updateTag({ property: 'og:image', content: image });
    this.metaService.updateTag({ property: 'og:type', content: type });
    this.metaService.updateTag({ property: 'og:site_name', content: 'Spider Math Educational Platform' });

    // Twitter Card Tags
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: config.title });
    this.metaService.updateTag({ name: 'twitter:description', content: config.description });
    this.metaService.updateTag({ name: 'twitter:image', content: image });

    // Canonical Link
    this.setCanonicalUrl(url);
  }

  /**
   * Sets Code-Managed Course & Unit SEO + Schema.org Course JSON-LD directly from UnitPackage.
   */
  setUnitPackageSeo(unit: IUnitPackageSeoInput, lang: 'ar' | 'en' = 'en'): void {
    const isAr = lang === 'ar';
    const title = isAr
      ? `${unit.titleAr} (${unit.curriculum} - ${unit.gradeLevel}) | سبايدر ماث`
      : `${unit.titleEn} (${unit.curriculum} - ${unit.gradeLevel}) | Spider Math`;

    const description = isAr ? unit.descriptionAr : unit.descriptionEn;
    const canonicalUrl = `${this.DEFAULT_BASE_URL}/units/${unit.curriculum.toLowerCase()}/${unit.gradeLevel.toLowerCase()}`;

    this.setCustomPageSeo({
      title,
      description,
      canonicalUrl,
      ogImage: unit.coverImageUrl || this.DEFAULT_OG_IMAGE,
      ogType: 'article'
    });

    // Inject Schema.org Course
    this.injectCourseSchema(unit);
  }

  /**
   * Injects or updates the canonical <link rel="canonical" href="...">
   */
  setCanonicalUrl(url: string): void {
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  /**
   * Injects dynamic Schema.org JSON-LD script into <head>.
   */
  injectSchemaJsonLd(schema: Record<string, unknown>, scriptId: string = 'spider-math-jsonld'): void {
    let script: HTMLScriptElement | null = this.document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = this.document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      this.document.head.appendChild(script);
    }
    script.text = JSON.stringify(schema);
  }

  private injectEducationalOrganizationSchema(): void {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'Spider Math Platform',
      alternateName: 'منصة سبايدر ماث التعليمية',
      url: this.DEFAULT_BASE_URL,
      logo: `${this.DEFAULT_BASE_URL}/assets/branding/spider-math-logo.svg`,
      description: 'Premier mathematics educational platform led by Eng. Heba Abdel-Wahab.',
      founder: {
        '@type': 'Person',
        name: 'Eng. Heba Abdel-Wahab',
        jobTitle: 'Senior Mathematics Lecturer & Founder'
      },
      sameAs: [
        'https://www.youtube.com/@SpiderMath',
        'https://www.facebook.com/SpiderMath'
      ]
    };
    this.injectSchemaJsonLd(schema, 'schema-educational-org');
  }

  private injectCourseSchema(unit: IUnitPackageSeoInput): void {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: unit.titleEn,
      alternateName: unit.titleAr,
      description: unit.descriptionEn || unit.descriptionAr,
      provider: {
        '@type': 'Organization',
        name: 'Spider Math Platform',
        sameAs: this.DEFAULT_BASE_URL
      },
      instructor: {
        '@type': 'Person',
        name: 'Eng. Heba Abdel-Wahab'
      },
      educationalLevel: unit.gradeLevel,
      about: `${unit.curriculum} Mathematics Course`,
      offers: {
        '@type': 'Offer',
        price: unit.priceEgp ?? 0,
        priceCurrency: 'EGP',
        availability: 'https://schema.org/InStock'
      }
    };
    this.injectSchemaJsonLd(schema, 'schema-course');
  }
}
