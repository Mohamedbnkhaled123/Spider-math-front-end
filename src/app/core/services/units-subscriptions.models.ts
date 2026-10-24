export interface IUnitPackageItem {
  readonly _id: string;
  readonly curriculum: string;
  readonly grade_level: string;
  readonly academic_term: string;
  readonly type: 'STUDY_UNIT' | 'FINAL_REVISION';
  readonly title_ar: string;
  readonly title_en: string;
  readonly description_ar: string;
  readonly description_en: string;
  readonly price_egp: number;
  readonly original_price_egp?: number;
  readonly total_lectures_count: number;
  readonly total_questions_count: number;
  readonly is_popular?: boolean;
  readonly is_subscribed?: boolean;
  readonly is_free_trial?: boolean;
  readonly features_ar?: string[];
  readonly features_en?: string[];
}

export interface IWhatsAppLinkResponse {
  readonly whatsappUrl: string;
  readonly studentCode?: string;
  readonly unitTitle?: string;
  readonly priceEgp?: number;
}
