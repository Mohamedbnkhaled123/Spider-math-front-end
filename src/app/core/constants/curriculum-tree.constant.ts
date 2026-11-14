/**
 * Spider Math Educational Platform — Canonical Academic UI Hierarchy Tree
 * Version: v2.3
 *
 * 1. Curriculum Track (CURRICULUMS)
 *    └── 2. Grade Level (GRADE_LEVELS_BY_CURRICULUM)
 *        └── 3. Academic Term (ACADEMIC_TERMS: TERM_1, TERM_2 where applicable)
 *            └── 4. Unit Package (UnitPackage)
 *                └── 5. Lectures & Assessments
 */

export const CURRICULUM_CODES = [
  'EGYPTIAN',
  'GULF',
  'INTERNATIONAL',
  'AMERICAN'
] as const;

export type CurriculumCode = (typeof CURRICULUM_CODES)[number];

export const ACADEMIC_TERM_CODES = ['TERM_1', 'TERM_2'] as const;
export type AcademicTermCode = (typeof ACADEMIC_TERM_CODES)[number];

/**
 * Pure helper function to determine whether a given curriculum operates on academic terms (Term 1 / Term 2).
 * Only EGYPTIAN and GULF have academic terms. AMERICAN and INTERNATIONAL operate continuously without terms.
 */
export function curriculumHasTerms(curriculumCode: string | null | undefined): boolean {
  return curriculumCode === 'EGYPTIAN' || curriculumCode === 'GULF';
}

export interface IGradeLevelMeta {
  readonly code: string;
  readonly titleAr: string;
  readonly titleEn: string;
  readonly shortLabelAr: string;
  readonly shortLabelEn: string;
  readonly stageAr: string;
  readonly stageEn: string;
  readonly subjectAr?: string;
  readonly subjectEn?: string;
  readonly branchAr?: string;
  readonly branchEn?: string;
  readonly tracks?: readonly { readonly code: string; readonly titleAr: string; readonly titleEn: string; }[];
}

export interface ITermMeta {
  readonly code: AcademicTermCode;
  readonly titleAr: string;
  readonly titleEn: string;
  readonly labelAr: string;
  readonly labelEn: string;
}

export interface ICurriculumNode {
  readonly code: CurriculumCode;
  readonly titleAr: string;
  readonly titleEn: string;
  readonly subtitleAr: string;
  readonly subtitleEn: string;
  readonly taglineAr: string;
  readonly taglineEn: string;
  readonly descriptionAr: string;
  readonly descriptionEn: string;
  readonly iconName: string;
  readonly mathWatermarkSymbol: 'π' | 'Σ' | '∞' | '✦';
  readonly accentColorHex: string;
  readonly badgeTextAr: string;
  readonly badgeTextEn: string;
  readonly hasTerms: boolean;
  readonly grades: readonly IGradeLevelMeta[];
  readonly terms: readonly ITermMeta[];
}

export const CANONICAL_ACADEMIC_TERMS: readonly ITermMeta[] = [
  {
    code: 'TERM_1',
    titleAr: 'الفصل الدراسي الأول',
    titleEn: 'First Term (Fall Semester)',
    labelAr: 'الترم الأول',
    labelEn: 'Term 1'
  },
  {
    code: 'TERM_2',
    titleAr: 'الفصل الدراسي الثاني',
    titleEn: 'Second Term (Spring Semester)',
    labelAr: 'الترم الثاني',
    labelEn: 'Term 2'
  }
] as const;

export interface IGulfStageDefinition {
  readonly code: string;
  readonly nameAr: string;
  readonly nameEn: string;
  readonly gradeCodes: readonly string[];
}

export interface IGulfCountryData {
  readonly code: 'SA' | 'QA' | 'AE' | 'KW';
  readonly nameAr: string;
  readonly nameEn: string;
  readonly flagEmoji: string;
  readonly stages: readonly IGulfStageDefinition[];
  readonly grades: readonly IGradeLevelMeta[];
}

export const GULF_COUNTRIES_DATA: readonly IGulfCountryData[] = [
  // 1. المملكة العربية السعودية (ابتدائي 1-6، متوسط 7-9، ثانوي 10-12)
  {
    code: 'SA',
    nameAr: 'المملكة العربية السعودية',
    nameEn: 'Saudi Arabia',
    flagEmoji: '🇸🇦',
    stages: [
      {
        code: 'SECONDARY',
        nameAr: 'المرحلة الثانوية',
        nameEn: 'Secondary Stage',
        gradeCodes: ['GRADE_12', 'GRADE_11', 'GRADE_10']
      },
      {
        code: 'INTERMEDIATE',
        nameAr: 'المرحلة المتوسطة',
        nameEn: 'Intermediate Stage',
        gradeCodes: ['GRADE_9', 'GRADE_8', 'GRADE_7']
      },
      {
        code: 'PRIMARY',
        nameAr: 'المرحلة الابتدائية',
        nameEn: 'Primary Stage',
        gradeCodes: ['GRADE_6', 'GRADE_5', 'GRADE_4', 'GRADE_3', 'GRADE_2', 'GRADE_1']
      }
    ],
    grades: [
      {
        code: 'GRADE_12',
        titleAr: 'الصف الثالث الثانوي (السعودية)',
        titleEn: 'Grade 12 (3rd Secondary — KSA)',
        shortLabelAr: '٣ ثانوي',
        shortLabelEn: 'Sec 3',
        stageAr: 'المرحلة الثانوية',
        stageEn: 'Secondary Stage'
      },
      {
        code: 'GRADE_11',
        titleAr: 'الصف الثاني الثانوي (السعودية)',
        titleEn: 'Grade 11 (2nd Secondary — KSA)',
        shortLabelAr: '٢ ثانوي',
        shortLabelEn: 'Sec 2',
        stageAr: 'المرحلة الثانوية',
        stageEn: 'Secondary Stage'
      },
      {
        code: 'GRADE_10',
        titleAr: 'الصف الأول الثانوي (السعودية)',
        titleEn: 'Grade 10 (1st Secondary — KSA)',
        shortLabelAr: '١ ثانوي',
        shortLabelEn: 'Sec 1',
        stageAr: 'المرحلة الثانوية',
        stageEn: 'Secondary Stage'
      },
      {
        code: 'GRADE_9',
        titleAr: 'الصف الثالث المتوسط (السعودية)',
        titleEn: 'Grade 9 (3rd Intermediate — KSA)',
        shortLabelAr: '٣ متوسط',
        shortLabelEn: 'Inter 3',
        stageAr: 'المرحلة المتوسطة',
        stageEn: 'Intermediate Stage'
      },
      {
        code: 'GRADE_8',
        titleAr: 'الصف الثاني المتوسط (السعودية)',
        titleEn: 'Grade 8 (2nd Intermediate — KSA)',
        shortLabelAr: '٢ متوسط',
        shortLabelEn: 'Inter 2',
        stageAr: 'المرحلة المتوسطة',
        stageEn: 'Intermediate Stage'
      },
      {
        code: 'GRADE_7',
        titleAr: 'الصف الأول المتوسط (السعودية)',
        titleEn: 'Grade 7 (1st Intermediate — KSA)',
        shortLabelAr: '١ متوسط',
        shortLabelEn: 'Inter 1',
        stageAr: 'المرحلة المتوسطة',
        stageEn: 'Intermediate Stage'
      },
      {
        code: 'GRADE_6',
        titleAr: 'الصف السادس الابتدائي (السعودية)',
        titleEn: 'Grade 6 (Primary — KSA)',
        shortLabelAr: '٦ ابتدائي',
        shortLabelEn: 'Pri 6',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary Stage'
      },
      {
        code: 'GRADE_5',
        titleAr: 'الصف الخامس الابتدائي (السعودية)',
        titleEn: 'Grade 5 (Primary — KSA)',
        shortLabelAr: '٥ ابتدائي',
        shortLabelEn: 'Pri 5',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary Stage'
      },
      {
        code: 'GRADE_4',
        titleAr: 'الصف الرابع الابتدائي (السعودية)',
        titleEn: 'Grade 4 (Primary — KSA)',
        shortLabelAr: '٤ ابتدائي',
        shortLabelEn: 'Pri 4',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary Stage'
      },
      {
        code: 'GRADE_3',
        titleAr: 'الصف الثالث الابتدائي (السعودية)',
        titleEn: 'Grade 3 (Primary — KSA)',
        shortLabelAr: '٣ ابتدائي',
        shortLabelEn: 'Pri 3',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary Stage'
      },
      {
        code: 'GRADE_2',
        titleAr: 'الصف الثاني الابتدائي (السعودية)',
        titleEn: 'Grade 2 (Primary — KSA)',
        shortLabelAr: '٢ ابتدائي',
        shortLabelEn: 'Pri 2',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary Stage'
      },
      {
        code: 'GRADE_1',
        titleAr: 'الصف الأول الابتدائي (السعودية)',
        titleEn: 'Grade 1 (Primary — KSA)',
        shortLabelAr: '١ ابتدائي',
        shortLabelEn: 'Pri 1',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary Stage'
      }
    ]
  },

  // 2. دولة قطر (ابتدائي 1-6، إعدادي 7-9، ثانوي 10-12)
  {
    code: 'QA',
    nameAr: 'دولة قطر',
    nameEn: 'Qatar',
    flagEmoji: '🇶🇦',
    stages: [
      {
        code: 'SECONDARY',
        nameAr: 'المرحلة الثانوية',
        nameEn: 'Secondary Stage',
        gradeCodes: ['GRADE_12', 'GRADE_11', 'GRADE_10']
      },
      {
        code: 'PREPARATORY',
        nameAr: 'المرحلة الإعدادية',
        nameEn: 'Preparatory Stage',
        gradeCodes: ['GRADE_9', 'GRADE_8', 'GRADE_7']
      },
      {
        code: 'PRIMARY',
        nameAr: 'المرحلة الابتدائية',
        nameEn: 'Primary Stage',
        gradeCodes: ['GRADE_6', 'GRADE_5', 'GRADE_4', 'GRADE_3', 'GRADE_2', 'GRADE_1']
      }
    ],
    grades: [
      {
        code: 'GRADE_12',
        titleAr: 'الصف الثاني عشر الثانوي (قطر)',
        titleEn: 'Grade 12 (Secondary — Qatar)',
        shortLabelAr: '١٢ ثانوي',
        shortLabelEn: 'Sec 12',
        stageAr: 'المرحلة الثانوية',
        stageEn: 'Secondary Stage'
      },
      {
        code: 'GRADE_11',
        titleAr: 'الصف الحادي عشر الثانوي (قطر)',
        titleEn: 'Grade 11 (Secondary — Qatar)',
        shortLabelAr: '١١ ثانوي',
        shortLabelEn: 'Sec 11',
        stageAr: 'المرحلة الثانوية',
        stageEn: 'Secondary Stage'
      },
      {
        code: 'GRADE_10',
        titleAr: 'الصف العاشر الثانوي (قطر)',
        titleEn: 'Grade 10 (Secondary — Qatar)',
        shortLabelAr: '١٠ ثانوي',
        shortLabelEn: 'Sec 10',
        stageAr: 'المرحلة الثانوية',
        stageEn: 'Secondary Stage'
      },
      {
        code: 'GRADE_9',
        titleAr: 'الصف التاسع - الثالث الإعدادي (قطر)',
        titleEn: 'Grade 9 (3rd Preparatory — Qatar)',
        shortLabelAr: '٣ إعدادي',
        shortLabelEn: 'Prep 3',
        stageAr: 'المرحلة الإعدادية',
        stageEn: 'Preparatory Stage'
      },
      {
        code: 'GRADE_8',
        titleAr: 'الصف الثامن - الثاني الإعدادي (قطر)',
        titleEn: 'Grade 8 (2nd Preparatory — Qatar)',
        shortLabelAr: '٢ إعدادي',
        shortLabelEn: 'Prep 2',
        stageAr: 'المرحلة الإعدادية',
        stageEn: 'Preparatory Stage'
      },
      {
        code: 'GRADE_7',
        titleAr: 'الصف السابع - الأول الإعدادي (قطر)',
        titleEn: 'Grade 7 (1st Preparatory — Qatar)',
        shortLabelAr: '١ إعدادي',
        shortLabelEn: 'Prep 1',
        stageAr: 'المرحلة الإعدادية',
        stageEn: 'Preparatory Stage'
      },
      {
        code: 'GRADE_6',
        titleAr: 'الصف السادس الابتدائي (قطر)',
        titleEn: 'Grade 6 (Primary — Qatar)',
        shortLabelAr: '٦ ابتدائي',
        shortLabelEn: 'Pri 6',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary Stage'
      },
      {
        code: 'GRADE_5',
        titleAr: 'الصف الخامس الابتدائي (قطر)',
        titleEn: 'Grade 5 (Primary — Qatar)',
        shortLabelAr: '٥ ابتدائي',
        shortLabelEn: 'Pri 5',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary Stage'
      },
      {
        code: 'GRADE_4',
        titleAr: 'الصف الرابع الابتدائي (قطر)',
        titleEn: 'Grade 4 (Primary — Qatar)',
        shortLabelAr: '٤ ابتدائي',
        shortLabelEn: 'Pri 4',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary Stage'
      },
      {
        code: 'GRADE_3',
        titleAr: 'الصف الثالث الابتدائي (قطر)',
        titleEn: 'Grade 3 (Primary — Qatar)',
        shortLabelAr: '٣ ابتدائي',
        shortLabelEn: 'Pri 3',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary Stage'
      },
      {
        code: 'GRADE_2',
        titleAr: 'الصف الثاني الابتدائي (قطر)',
        titleEn: 'Grade 2 (Primary — Qatar)',
        shortLabelAr: '٢ ابتدائي',
        shortLabelEn: 'Pri 2',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary Stage'
      },
      {
        code: 'GRADE_1',
        titleAr: 'الصف الأول الابتدائي (قطر)',
        titleEn: 'Grade 1 (Primary — Qatar)',
        shortLabelAr: '١ ابتدائي',
        shortLabelEn: 'Pri 1',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary Stage'
      }
    ]
  },

  // 3. الإمارات العربية المتحدة (الحلقة الأولى 1-4، الحلقة الثانية 5-8، الحلقة الثالثة 9-12)
  {
    code: 'AE',
    nameAr: 'الإمارات العربية المتحدة',
    nameEn: 'United Arab Emirates',
    flagEmoji: '🇦🇪',
    stages: [
      {
        code: 'CYCLE_3',
        nameAr: 'الحلقة الثالثة',
        nameEn: 'Cycle 3 (Grades 9-12)',
        gradeCodes: ['GRADE_12', 'GRADE_11', 'GRADE_10', 'GRADE_9']
      },
      {
        code: 'CYCLE_2',
        nameAr: 'الحلقة الثانية',
        nameEn: 'Cycle 2 (Grades 5-8)',
        gradeCodes: ['GRADE_8', 'GRADE_7', 'GRADE_6', 'GRADE_5']
      },
      {
        code: 'CYCLE_1',
        nameAr: 'الحلقة الأولى',
        nameEn: 'Cycle 1 (Grades 1-4)',
        gradeCodes: ['GRADE_4', 'GRADE_3', 'GRADE_2', 'GRADE_1']
      }
    ],
    grades: [
      {
        code: 'GRADE_12',
        titleAr: 'الصف الثاني عشر - الحلقة 3 (الإمارات)',
        titleEn: 'Grade 12 (Cycle 3 — UAE)',
        shortLabelAr: 'صف ١٢',
        shortLabelEn: 'Gr 12',
        stageAr: 'الحلقة الثالثة',
        stageEn: 'Cycle 3'
      },
      {
        code: 'GRADE_11',
        titleAr: 'الصف الحادي عشر - الحلقة 3 (الإمارات)',
        titleEn: 'Grade 11 (Cycle 3 — UAE)',
        shortLabelAr: 'صف ١١',
        shortLabelEn: 'Gr 11',
        stageAr: 'الحلقة الثالثة',
        stageEn: 'Cycle 3'
      },
      {
        code: 'GRADE_10',
        titleAr: 'الصف العاشر - الحلقة 3 (الإمارات)',
        titleEn: 'Grade 10 (Cycle 3 — UAE)',
        shortLabelAr: 'صف ١٠',
        shortLabelEn: 'Gr 10',
        stageAr: 'الحلقة الثالثة',
        stageEn: 'Cycle 3'
      },
      {
        code: 'GRADE_9',
        titleAr: 'الصف التاسع - الحلقة 3 (الإمارات)',
        titleEn: 'Grade 9 (Cycle 3 — UAE)',
        shortLabelAr: 'صف ٩',
        shortLabelEn: 'Gr 9',
        stageAr: 'الحلقة الثالثة',
        stageEn: 'Cycle 3'
      },
      {
        code: 'GRADE_8',
        titleAr: 'الصف الثامن - الحلقة 2 (الإمارات)',
        titleEn: 'Grade 8 (Cycle 2 — UAE)',
        shortLabelAr: 'صف ٨',
        shortLabelEn: 'Gr 8',
        stageAr: 'الحلقة الثانية',
        stageEn: 'Cycle 2'
      },
      {
        code: 'GRADE_7',
        titleAr: 'الصف السابع - الحلقة 2 (الإمارات)',
        titleEn: 'Grade 7 (Cycle 2 — UAE)',
        shortLabelAr: 'صف ٧',
        shortLabelEn: 'Gr 7',
        stageAr: 'الحلقة الثانية',
        stageEn: 'Cycle 2'
      },
      {
        code: 'GRADE_6',
        titleAr: 'الصف السادس - الحلقة 2 (الإمارات)',
        titleEn: 'Grade 6 (Cycle 2 — UAE)',
        shortLabelAr: 'صف ٦',
        shortLabelEn: 'Gr 6',
        stageAr: 'الحلقة الثانية',
        stageEn: 'Cycle 2'
      },
      {
        code: 'GRADE_5',
        titleAr: 'الصف الخامس - الحلقة 2 (الإمارات)',
        titleEn: 'Grade 5 (Cycle 2 — UAE)',
        shortLabelAr: 'صف ٥',
        shortLabelEn: 'Gr 5',
        stageAr: 'الحلقة الثانية',
        stageEn: 'Cycle 2'
      },
      {
        code: 'GRADE_4',
        titleAr: 'الصف الرابع - الحلقة 1 (الإمارات)',
        titleEn: 'Grade 4 (Cycle 1 — UAE)',
        shortLabelAr: 'صف ٤',
        shortLabelEn: 'Gr 4',
        stageAr: 'الحلقة الأولى',
        stageEn: 'Cycle 1'
      },
      {
        code: 'GRADE_3',
        titleAr: 'الصف الثالث - الحلقة 1 (الإمارات)',
        titleEn: 'Grade 3 (Cycle 1 — UAE)',
        shortLabelAr: 'صف ٣',
        shortLabelEn: 'Gr 3',
        stageAr: 'الحلقة الأولى',
        stageEn: 'Cycle 1'
      },
      {
        code: 'GRADE_2',
        titleAr: 'الصف الثاني - الحلقة 1 (الإمارات)',
        titleEn: 'Grade 2 (Cycle 1 — UAE)',
        shortLabelAr: 'صف ٢',
        shortLabelEn: 'Gr 2',
        stageAr: 'الحلقة الأولى',
        stageEn: 'Cycle 1'
      },
      {
        code: 'GRADE_1',
        titleAr: 'الصف الأول - الحلقة 1 (الإمارات)',
        titleEn: 'Grade 1 (Cycle 1 — UAE)',
        shortLabelAr: 'صف ١',
        shortLabelEn: 'Gr 1',
        stageAr: 'الحلقة الأولى',
        stageEn: 'Cycle 1'
      }
    ]
  },

  // 4. دولة الكويت (ابتدائي 1-5، متوسط 6-9، ثانوي 10-12)
  {
    code: 'KW',
    nameAr: 'دولة الكويت',
    nameEn: 'Kuwait',
    flagEmoji: '🇰🇼',
    stages: [
      {
        code: 'SECONDARY',
        nameAr: 'المرحلة الثانوية',
        nameEn: 'Secondary Stage',
        gradeCodes: ['GRADE_12', 'GRADE_11', 'GRADE_10']
      },
      {
        code: 'INTERMEDIATE',
        nameAr: 'المرحلة المتوسطة',
        nameEn: 'Intermediate Stage',
        gradeCodes: ['GRADE_9', 'GRADE_8', 'GRADE_7', 'GRADE_6']
      },
      {
        code: 'PRIMARY',
        nameAr: 'المرحلة الابتدائية',
        nameEn: 'Primary Stage',
        gradeCodes: ['GRADE_5', 'GRADE_4', 'GRADE_3', 'GRADE_2', 'GRADE_1']
      }
    ],
    grades: [
      {
        code: 'GRADE_12',
        titleAr: 'الصف الثاني عشر الثانوي (الكويت)',
        titleEn: 'Grade 12 (Secondary — Kuwait)',
        shortLabelAr: '١٢ ثانوي',
        shortLabelEn: 'Sec 12',
        stageAr: 'المرحلة الثانوية',
        stageEn: 'Secondary Stage'
      },
      {
        code: 'GRADE_11',
        titleAr: 'الصف الحادي عشر الثانوي (الكويت)',
        titleEn: 'Grade 11 (Secondary — Kuwait)',
        shortLabelAr: '١١ ثانوي',
        shortLabelEn: 'Sec 11',
        stageAr: 'المرحلة الثانوية',
        stageEn: 'Secondary Stage'
      },
      {
        code: 'GRADE_10',
        titleAr: 'الصف العاشر الثانوي (الكويت)',
        titleEn: 'Grade 10 (Secondary — Kuwait)',
        shortLabelAr: '١٠ ثانوي',
        shortLabelEn: 'Sec 10',
        stageAr: 'المرحلة الثانوية',
        stageEn: 'Secondary Stage'
      },
      {
        code: 'GRADE_9',
        titleAr: 'الصف التاسع المتوسط (الكويت)',
        titleEn: 'Grade 9 (Intermediate — Kuwait)',
        shortLabelAr: '٩ متوسط',
        shortLabelEn: 'Inter 9',
        stageAr: 'المرحلة المتوسطة',
        stageEn: 'Intermediate Stage'
      },
      {
        code: 'GRADE_8',
        titleAr: 'الصف الثامن المتوسط (الكويت)',
        titleEn: 'Grade 8 (Intermediate — Kuwait)',
        shortLabelAr: '٨ متوسط',
        shortLabelEn: 'Inter 8',
        stageAr: 'المرحلة المتوسطة',
        stageEn: 'Intermediate Stage'
      },
      {
        code: 'GRADE_7',
        titleAr: 'الصف السابع المتوسط (الكويت)',
        titleEn: 'Grade 7 (Intermediate — Kuwait)',
        shortLabelAr: '٧ متوسط',
        shortLabelEn: 'Inter 7',
        stageAr: 'المرحلة المتوسطة',
        stageEn: 'Intermediate Stage'
      },
      {
        code: 'GRADE_6',
        titleAr: 'الصف السادس المتوسط (الكويت)',
        titleEn: 'Grade 6 (Intermediate — Kuwait)',
        shortLabelAr: '٦ متوسط',
        shortLabelEn: 'Inter 6',
        stageAr: 'المرحلة المتوسطة',
        stageEn: 'Intermediate Stage'
      },
      {
        code: 'GRADE_5',
        titleAr: 'الصف الخامس الابتدائي (الكويت)',
        titleEn: 'Grade 5 (Primary — Kuwait)',
        shortLabelAr: '٥ ابتدائي',
        shortLabelEn: 'Pri 5',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary Stage'
      },
      {
        code: 'GRADE_4',
        titleAr: 'الصف الرابع الابتدائي (الكويت)',
        titleEn: 'Grade 4 (Primary — Kuwait)',
        shortLabelAr: '٤ ابتدائي',
        shortLabelEn: 'Pri 4',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary Stage'
      },
      {
        code: 'GRADE_3',
        titleAr: 'الصف الثالث الابتدائي (الكويت)',
        titleEn: 'Grade 3 (Primary — Kuwait)',
        shortLabelAr: '٣ ابتدائي',
        shortLabelEn: 'Pri 3',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary Stage'
      },
      {
        code: 'GRADE_2',
        titleAr: 'الصف الثاني الابتدائي (الكويت)',
        titleEn: 'Grade 2 (Primary — Kuwait)',
        shortLabelAr: '٢ ابتدائي',
        shortLabelEn: 'Pri 2',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary Stage'
      },
      {
        code: 'GRADE_1',
        titleAr: 'الصف الأول الابتدائي (الكويت)',
        titleEn: 'Grade 1 (Primary — Kuwait)',
        shortLabelAr: '١ ابتدائي',
        shortLabelEn: 'Pri 1',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary Stage'
      }
    ]
  }
] as const;

export const CANONICAL_CURRICULUM_TREE: readonly ICurriculumNode[] = [
  // 1. المنهج المصري (الابتدائي، الإعدادي، الثانوي العام 2027، والبكالوريا)
  {
    code: 'EGYPTIAN',
    titleAr: 'المنهج المصري',
    titleEn: 'Egyptian Curriculum',
    subtitleAr: 'من الأساسيات للتميّز',
    subtitleEn: 'From Fundamentals to Thanaweya Amma Excellence',
    taglineAr: 'من الأساسيات للتميّز',
    taglineEn: 'From Fundamentals to Excellence',
    descriptionAr: 'تغطية شاملة ومبسطة لمادة الرياضيات لجميع المراحل من الابتدائي وحتى الثانوية العامة والبكالوريا بأحدث طرق التدريس وحل نماذج الامتحانات الوزارية والتجريبية.',
    descriptionEn: 'Comprehensive and structured mathematics curriculum from Primary 1 through Thanaweya Amma & Baccalaureate with intensive exam workouts.',
    iconName: 'pyramid',
    mathWatermarkSymbol: 'π',
    accentColorHex: '#6D28D9',
    badgeTextAr: 'الأكثر طلباً',
    badgeTextEn: 'Most Popular',
    hasTerms: true,
    terms: CANONICAL_ACADEMIC_TERMS,
    grades: [
      // المرحلة الثانوية — الفرع الأول: الثانوية العامة المصرية 2027
      {
        code: 'SEC_3',
        titleAr: 'الصف الثالث الثانوي (الثانوية العامة - علمي / رياضة / أدبي)',
        titleEn: 'Secondary 3 (Grade 12 — Thanaweya Amma — Science / Math / Literary)',
        shortLabelAr: '٣ ثانوي',
        shortLabelEn: 'Sec 3',
        stageAr: 'المرحلة الثانوية العامة',
        stageEn: 'Secondary Stage (Thanaweya Amma)',
        branchAr: 'الثانوية العامة',
        branchEn: 'Thanaweya Amma',
        tracks: [
          { code: 'SCIENCE', titleAr: 'علمي علوم', titleEn: 'Science' },
          { code: 'MATH', titleAr: 'علمي رياضة', titleEn: 'Math' },
          { code: 'LITERARY', titleAr: 'أدبي', titleEn: 'Literary' }
        ]
      },
      {
        code: 'SEC_2',
        titleAr: 'الصف الثاني الثانوي (علمي / أدبي)',
        titleEn: 'Secondary 2 (Grade 11 — Science / Math / Literary)',
        shortLabelAr: '٢ ثانوي',
        shortLabelEn: 'Sec 2',
        stageAr: 'المرحلة الثانوية العامة',
        stageEn: 'Secondary Stage (Thanaweya Amma)',
        branchAr: 'الثانوية العامة',
        branchEn: 'Thanaweya Amma',
        tracks: [
          { code: 'SCIENCE', titleAr: 'علمي', titleEn: 'Science' },
          { code: 'MATH', titleAr: 'علمي رياضة', titleEn: 'Math' },
          { code: 'LITERARY', titleAr: 'أدبي', titleEn: 'Literary' }
        ]
      },
      {
        code: 'SEC_1',
        titleAr: 'الصف الأول الثانوي',
        titleEn: 'Secondary 1 (Grade 10)',
        shortLabelAr: '١ ثانوي',
        shortLabelEn: 'Sec 1',
        stageAr: 'المرحلة الثانوية العامة',
        stageEn: 'Secondary Stage (Thanaweya Amma)',
        branchAr: 'الثانوية العامة',
        branchEn: 'Thanaweya Amma'
      },

      // المرحلة الثانوية — الفرع الثاني: نظام البكالوريا 2027
      {
        code: 'BACC_12',
        titleAr: 'الصف الثاني عشر - المرحلة الأساسية (البكالوريا)',
        titleEn: 'Grade 12 — Main Stage (Baccalaureate)',
        shortLabelAr: '١٢ بكالوريا',
        shortLabelEn: 'Bacc 12',
        stageAr: 'مرحلة البكالوريا',
        stageEn: 'Baccalaureate Stage',
        branchAr: 'البكالوريا',
        branchEn: 'Baccalaureate',
        tracks: [
          { code: 'MEDICINE_LIFE_SCIENCE', titleAr: 'طب وعلوم الحياة', titleEn: 'Medicine & Life Science' },
          { code: 'ENGINEERING_COMPUTER_SCIENCE', titleAr: 'هندسة وحاسبات', titleEn: 'Engineering & Computer Science' },
          { code: 'BUSINESS', titleAr: 'أعمال وإدارة', titleEn: 'Business' },
          { code: 'ARTS_HUMANITIES', titleAr: 'فنون وإنسانيات', titleEn: 'Arts & Humanities' }
        ]
      },
      {
        code: 'BACC_11',
        titleAr: 'الصف الحادي عشر - المرحلة الأساسية (البكالوريا)',
        titleEn: 'Grade 11 — Main Stage (Baccalaureate)',
        shortLabelAr: '١١ بكالوريا',
        shortLabelEn: 'Bacc 11',
        stageAr: 'مرحلة البكالوريا',
        stageEn: 'Baccalaureate Stage',
        branchAr: 'البكالوريا',
        branchEn: 'Baccalaureate',
        tracks: [
          { code: 'MEDICINE_LIFE_SCIENCE', titleAr: 'طب وعلوم الحياة', titleEn: 'Medicine & Life Science' },
          { code: 'ENGINEERING_COMPUTER_SCIENCE', titleAr: 'هندسة وحاسبات', titleEn: 'Engineering & Computer Science' },
          { code: 'BUSINESS', titleAr: 'أعمال وإدارة', titleEn: 'Business' },
          { code: 'ARTS_HUMANITIES', titleAr: 'فنون وإنسانيات', titleEn: 'Arts & Humanities' }
        ]
      },
      {
        code: 'BACC_10',
        titleAr: 'الصف العاشر - المرحلة التمهيدية (البكالوريا)',
        titleEn: 'Grade 10 — Preparatory Stage (Baccalaureate)',
        shortLabelAr: '١٠ بكالوريا',
        shortLabelEn: 'Bacc 10',
        stageAr: 'مرحلة البكالوريا',
        stageEn: 'Baccalaureate Stage',
        branchAr: 'البكالوريا',
        branchEn: 'Baccalaureate'
      },

      // المرحلة الإعدادية (الصفوف 7 - 9: جبر + هندسة)
      {
        code: 'PREP_3',
        titleAr: 'الصف الثالث الإعدادي (الشهادة الإعدادية - جبر + هندسة)',
        titleEn: 'Prep 3 (Grade 9 — General Certificate — Algebra + Geometry)',
        shortLabelAr: '٣ إعدادي',
        shortLabelEn: 'Prep 3',
        stageAr: 'المرحلة الإعدادية',
        stageEn: 'Preparatory Stage',
        subjectAr: 'جبر + هندسة',
        subjectEn: 'Algebra + Geometry'
      },
      {
        code: 'PREP_2',
        titleAr: 'الصف الثاني الإعدادي (جبر + هندسة)',
        titleEn: 'Prep 2 (Grade 8 — Algebra + Geometry)',
        shortLabelAr: '٢ إعدادي',
        shortLabelEn: 'Prep 2',
        stageAr: 'المرحلة الإعدادية',
        stageEn: 'Preparatory Stage',
        subjectAr: 'جبر + هندسة',
        subjectEn: 'Algebra + Geometry'
      },
      {
        code: 'PREP_1',
        titleAr: 'الصف الأول الإعدادي (جبر + هندسة)',
        titleEn: 'Prep 1 (Grade 7 — Algebra + Geometry)',
        shortLabelAr: '١ إعدادي',
        shortLabelEn: 'Prep 1',
        stageAr: 'المرحلة الإعدادية',
        stageEn: 'Preparatory Stage',
        subjectAr: 'جبر + هندسة',
        subjectEn: 'Algebra + Geometry'
      },

      // المرحلة الابتدائية (الصفوف 1 - 6)
      {
        code: 'PRI_6',
        titleAr: 'الصف السادس الابتدائي',
        titleEn: 'Primary 6 (Grade 6)',
        shortLabelAr: '٦ ابتدائي',
        shortLabelEn: 'Pri 6',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary Stage'
      },
      {
        code: 'PRI_5',
        titleAr: 'الصف الخامس الابتدائي',
        titleEn: 'Primary 5 (Grade 5)',
        shortLabelAr: '٥ ابتدائي',
        shortLabelEn: 'Pri 5',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary Stage'
      },
      {
        code: 'PRI_4',
        titleAr: 'الصف الرابع الابتدائي',
        titleEn: 'Primary 4 (Grade 4)',
        shortLabelAr: '٤ ابتدائي',
        shortLabelEn: 'Pri 4',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary Stage'
      },
      {
        code: 'PRI_3',
        titleAr: 'الصف الثالث الابتدائي',
        titleEn: 'Primary 3 (Grade 3)',
        shortLabelAr: '٣ ابتدائي',
        shortLabelEn: 'Pri 3',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary Stage'
      },
      {
        code: 'PRI_2',
        titleAr: 'الصف الثاني الابتدائي',
        titleEn: 'Primary 2 (Grade 2)',
        shortLabelAr: '٢ ابتدائي',
        shortLabelEn: 'Pri 2',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary Stage'
      },
      {
        code: 'PRI_1',
        titleAr: 'الصف الأول الابتدائي',
        titleEn: 'Primary 1 (Grade 1)',
        shortLabelAr: '١ ابتدائي',
        shortLabelEn: 'Pri 1',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary Stage'
      }
    ]
  },

  // 2. المنهج الخليجي (السعودية، قطر، الإمارات، الكويت — مع تطبيق الترمين الدراسيين)
  {
    code: 'GULF',
    titleAr: 'المنهج الخليجي',
    titleEn: 'Gulf Curriculum',
    subtitleAr: 'شرح واضح وتدريب مستمر',
    subtitleEn: 'Clear Explanations & Continuous Practice',
    taglineAr: 'شرح واضح وتدريب مستمر',
    taglineEn: 'Clear Explanation & Continuous Practice',
    descriptionAr: 'منهج مخصص لطلاب دول الخليج العربي (السعودية، الإمارات، الكويت، قطر) متوافق مع المعايير الوزارية والتقسيمات الدراسية المعتمدة من الابتدائي حتى الثانوي.',
    descriptionEn: 'Custom curriculum tailored to Saudi, Qatari, Emirati, and Kuwaiti ministerial standards from Grade 1 through Grade 12 with continuous assessments.',
    iconName: 'landmark',
    mathWatermarkSymbol: 'Σ',
    accentColorHex: '#0891B2',
    badgeTextAr: 'معتمد خليجياً',
    badgeTextEn: 'GCC Accredited',
    hasTerms: true,
    terms: CANONICAL_ACADEMIC_TERMS,
    grades: [
      {
        code: 'GRADE_12',
        titleAr: 'الصف الثاني عشر (توجيهي / ثالث ثانوي)',
        titleEn: 'Grade 12 (Senior / Thanaweya / Cycle 3)',
        shortLabelAr: 'صف ١٢',
        shortLabelEn: 'Gr 12',
        stageAr: 'المرحلة الثانوية (السعودية، قطر، الكويت) • الحلقة 3 (الإمارات)',
        stageEn: 'Secondary (KSA, Qatar, Kuwait) • Cycle 3 (UAE)'
      },
      {
        code: 'GRADE_11',
        titleAr: 'الصف الحادي عشر (ثاني ثانوي)',
        titleEn: 'Grade 11 (Secondary 2 / Cycle 3)',
        shortLabelAr: 'صف ١١',
        shortLabelEn: 'Gr 11',
        stageAr: 'المرحلة الثانوية (السعودية، قطر، الكويت) • الحلقة 3 (الإمارات)',
        stageEn: 'Secondary (KSA, Qatar, Kuwait) • Cycle 3 (UAE)'
      },
      {
        code: 'GRADE_10',
        titleAr: 'الصف العاشر (أول ثانوي)',
        titleEn: 'Grade 10 (Secondary 1 / Cycle 3)',
        shortLabelAr: 'صف ١٠',
        shortLabelEn: 'Gr 10',
        stageAr: 'المرحلة الثانوية (السعودية، قطر، الكويت) • الحلقة 3 (الإمارات)',
        stageEn: 'Secondary (KSA, Qatar, Kuwait) • Cycle 3 (UAE)'
      },
      {
        code: 'GRADE_9',
        titleAr: 'الصف التاسع',
        titleEn: 'Grade 9 (Intermediate / Prep / Cycle 3)',
        shortLabelAr: 'صف ٩',
        shortLabelEn: 'Gr 9',
        stageAr: 'المتوسطة (السعودية، الكويت) • الإعدادية (قطر) • الحلقة 3 (الإمارات)',
        stageEn: 'Intermediate (KSA, Kuwait) • Prep (Qatar) • Cycle 3 (UAE)'
      },
      {
        code: 'GRADE_8',
        titleAr: 'الصف الثامن',
        titleEn: 'Grade 8 (Intermediate / Prep / Cycle 2)',
        shortLabelAr: 'صف ٨',
        shortLabelEn: 'Gr 8',
        stageAr: 'المتوسطة (السعودية، الكويت) • الإعدادية (قطر) • الحلقة 2 (الإمارات)',
        stageEn: 'Intermediate (KSA, Kuwait) • Prep (Qatar) • Cycle 2 (UAE)'
      },
      {
        code: 'GRADE_7',
        titleAr: 'الصف السابع',
        titleEn: 'Grade 7 (Intermediate / Prep / Cycle 2)',
        shortLabelAr: 'صف ٧',
        shortLabelEn: 'Gr 7',
        stageAr: 'المتوسطة (السعودية، الكويت) • الإعدادية (قطر) • الحلقة 2 (الإمارات)',
        stageEn: 'Intermediate (KSA, Kuwait) • Prep (Qatar) • Cycle 2 (UAE)'
      },
      {
        code: 'GRADE_6',
        titleAr: 'الصف السادس',
        titleEn: 'Grade 6 (Primary / Intermediate / Cycle 2)',
        shortLabelAr: 'صف ٦',
        shortLabelEn: 'Gr 6',
        stageAr: 'الابتدائية (السعودية، قطر) • المتوسطة (الكويت) • الحلقة 2 (الإمارات)',
        stageEn: 'Primary (KSA, Qatar) • Intermediate (Kuwait) • Cycle 2 (UAE)'
      },
      {
        code: 'GRADE_5',
        titleAr: 'الصف الخامس الابتدائي',
        titleEn: 'Grade 5 (Primary / Cycle 2)',
        shortLabelAr: 'صف ٥',
        shortLabelEn: 'Gr 5',
        stageAr: 'المرحلة الابتدائية (السعودية، قطر، الكويت) • الحلقة 2 (الإمارات)',
        stageEn: 'Primary (KSA, Qatar, Kuwait) • Cycle 2 (UAE)'
      },
      {
        code: 'GRADE_4',
        titleAr: 'الصف الرابع الابتدائي',
        titleEn: 'Grade 4 (Primary / Cycle 1)',
        shortLabelAr: 'صف ٤',
        shortLabelEn: 'Gr 4',
        stageAr: 'المرحلة الابتدائية (السعودية، قطر، الكويت) • الحلقة 1 (الإمارات)',
        stageEn: 'Primary (KSA, Qatar, Kuwait) • Cycle 1 (UAE)'
      },
      {
        code: 'GRADE_3',
        titleAr: 'الصف الثالث الابتدائي',
        titleEn: 'Grade 3 (Primary / Cycle 1)',
        shortLabelAr: 'صف ٣',
        shortLabelEn: 'Gr 3',
        stageAr: 'المرحلة الابتدائية (السعودية، قطر، الكويت) • الحلقة 1 (الإمارات)',
        stageEn: 'Primary (KSA, Qatar, Kuwait) • Cycle 1 (UAE)'
      },
      {
        code: 'GRADE_2',
        titleAr: 'الصف الثاني الابتدائي',
        titleEn: 'Grade 2 (Primary / Cycle 1)',
        shortLabelAr: 'صف ٢',
        shortLabelEn: 'Gr 2',
        stageAr: 'المرحلة الابتدائية (السعودية، قطر، الكويت) • الحلقة 1 (الإمارات)',
        stageEn: 'Primary (KSA, Qatar, Kuwait) • Cycle 1 (UAE)'
      },
      {
        code: 'GRADE_1',
        titleAr: 'الصف الأول الابتدائي',
        titleEn: 'Grade 1 (Primary / Cycle 1)',
        shortLabelAr: 'صف ١',
        shortLabelEn: 'Gr 1',
        stageAr: 'المرحلة الابتدائية (السعودية، قطر، الكويت) • الحلقة 1 (الإمارات)',
        stageEn: 'Primary (KSA, Qatar, Kuwait) • Cycle 1 (UAE)'
      }
    ]
  },

  // 3. المناهج الدولية (المنهج الأمريكي Gr 1-12 والمنهج البريطاني KS1-KS4 & A-Level — بدون ترم أول وثاني)
  {
    code: 'INTERNATIONAL',
    titleAr: 'المناهج الدولية (American & British Curriculum)',
    titleEn: 'International Curricula (American & British Curriculum)',
    subtitleAr: 'رياضيات بمعايير عالمية',
    subtitleEn: 'World-Class Global Mathematical Standards',
    taglineAr: 'رياضيات بمعايير عالمية',
    taglineEn: 'World-Class Global Standards',
    descriptionAr: 'برنامج دولي شامل يغطي المنهج الأمريكي (Grades 1-12) ومناهج كامبريدج وإديكسل البريطانية (KS1-KS4 IGCSE & Sixth Form A-Level) بنظام سنوي مستمر دون تقسيم ترم أول وثان.',
    descriptionEn: 'Comprehensive international program covering the American Curriculum (Grades 1-12) and British Curriculum (Cambridge & Edexcel IGCSE & A-Level) on a continuous yearly cycle without terms.',
    iconName: 'globe',
    mathWatermarkSymbol: '∞',
    accentColorHex: '#9333EA',
    badgeTextAr: 'معايير كامبريدج وإديكسل والمنهج الأمريكي',
    badgeTextEn: 'Cambridge & Edexcel & US Curriculum',
    hasTerms: false,
    terms: [],
    grades: [
      // المسار الأمريكي: المرحلة الابتدائية (Elementary Grades 1-5)
      {
        code: 'US_GRADE_1',
        titleAr: 'المنهج الأمريكي - الصف الأول (Grade 1)',
        titleEn: 'American Curriculum — Grade 1 (Elementary)',
        shortLabelAr: 'Gr 1 US',
        shortLabelEn: 'Gr 1',
        stageAr: 'المرحلة الابتدائية الأمريكية',
        stageEn: 'Elementary School (Grades 1-5)',
        branchAr: 'المنهج الأمريكي',
        branchEn: 'American Curriculum'
      },
      {
        code: 'US_GRADE_2',
        titleAr: 'المنهج الأمريكي - الصف الثاني (Grade 2)',
        titleEn: 'American Curriculum — Grade 2 (Elementary)',
        shortLabelAr: 'Gr 2 US',
        shortLabelEn: 'Gr 2',
        stageAr: 'المرحلة الابتدائية الأمريكية',
        stageEn: 'Elementary School (Grades 1-5)',
        branchAr: 'المنهج الأمريكي',
        branchEn: 'American Curriculum'
      },
      {
        code: 'US_GRADE_3',
        titleAr: 'المنهج الأمريكي - الصف الثالث (Grade 3)',
        titleEn: 'American Curriculum — Grade 3 (Elementary)',
        shortLabelAr: 'Gr 3 US',
        shortLabelEn: 'Gr 3',
        stageAr: 'المرحلة الابتدائية الأمريكية',
        stageEn: 'Elementary School (Grades 1-5)',
        branchAr: 'المنهج الأمريكي',
        branchEn: 'American Curriculum'
      },
      {
        code: 'US_GRADE_4',
        titleAr: 'المنهج الأمريكي - الصف الرابع (Grade 4)',
        titleEn: 'American Curriculum — Grade 4 (Elementary)',
        shortLabelAr: 'Gr 4 US',
        shortLabelEn: 'Gr 4',
        stageAr: 'المرحلة الابتدائية الأمريكية',
        stageEn: 'Elementary School (Grades 1-5)',
        branchAr: 'المنهج الأمريكي',
        branchEn: 'American Curriculum'
      },
      {
        code: 'US_GRADE_5',
        titleAr: 'المنهج الأمريكي - الصف الخامس (Grade 5)',
        titleEn: 'American Curriculum — Grade 5 (Elementary)',
        shortLabelAr: 'Gr 5 US',
        shortLabelEn: 'Gr 5',
        stageAr: 'المرحلة الابتدائية الأمريكية',
        stageEn: 'Elementary School (Grades 1-5)',
        branchAr: 'المنهج الأمريكي',
        branchEn: 'American Curriculum'
      },

      // المسار الأمريكي: المرحلة المتوسطة (Middle School Grades 6-8)
      {
        code: 'US_GRADE_6',
        titleAr: 'المنهج الأمريكي - الصف السادس (Grade 6)',
        titleEn: 'American Curriculum — Grade 6 (Middle School)',
        shortLabelAr: 'Gr 6 US',
        shortLabelEn: 'Gr 6',
        stageAr: 'المرحلة المتوسطة الأمريكية',
        stageEn: 'Middle School (Grades 6-8)',
        branchAr: 'المنهج الأمريكي',
        branchEn: 'American Curriculum'
      },
      {
        code: 'US_GRADE_7',
        titleAr: 'المنهج الأمريكي - الصف السابع (Pre-Algebra)',
        titleEn: 'American Curriculum — Grade 7 (Pre-Algebra)',
        shortLabelAr: 'Gr 7 US',
        shortLabelEn: 'Gr 7',
        stageAr: 'المرحلة المتوسطة الأمريكية',
        stageEn: 'Middle School (Grades 6-8)',
        branchAr: 'المنهج الأمريكي',
        branchEn: 'American Curriculum'
      },
      {
        code: 'US_GRADE_8',
        titleAr: 'المنهج الأمريكي - الصف الثامن (Algebra Foundations)',
        titleEn: 'American Curriculum — Grade 8 (Algebra Foundations)',
        shortLabelAr: 'Gr 8 US',
        shortLabelEn: 'Gr 8',
        stageAr: 'المرحلة المتوسطة الأمريكية',
        stageEn: 'Middle School (Grades 6-8)',
        branchAr: 'المنهج الأمريكي',
        branchEn: 'American Curriculum'
      },

      // المسار الأمريكي: المرحلة الثانوية (High School Grades 9-12)
      {
        code: 'US_GRADE_9',
        titleAr: 'المنهج الأمريكي - الصف التاسع (Algebra I)',
        titleEn: 'American Curriculum — Grade 9 (Algebra I)',
        shortLabelAr: 'Gr 9 US',
        shortLabelEn: 'Gr 9',
        stageAr: 'المرحلة الثانوية الأمريكية',
        stageEn: 'High School (Grades 9-12)',
        branchAr: 'المنهج الأمريكي',
        branchEn: 'American Curriculum'
      },
      {
        code: 'US_GRADE_10',
        titleAr: 'المنهج الأمريكي - الصف العاشر (Geometry)',
        titleEn: 'American Curriculum — Grade 10 (Geometry)',
        shortLabelAr: 'Gr 10 US',
        shortLabelEn: 'Gr 10',
        stageAr: 'المرحلة الثانوية الأمريكية',
        stageEn: 'High School (Grades 9-12)',
        branchAr: 'المنهج الأمريكي',
        branchEn: 'American Curriculum'
      },
      {
        code: 'US_GRADE_11',
        titleAr: 'المنهج الأمريكي - الصف الحادي عشر (Algebra II / Pre-Calc)',
        titleEn: 'American Curriculum — Grade 11 (Algebra II / Pre-Calc)',
        shortLabelAr: 'Gr 11 US',
        shortLabelEn: 'Gr 11',
        stageAr: 'المرحلة الثانوية الأمريكية',
        stageEn: 'High School (Grades 9-12)',
        branchAr: 'المنهج الأمريكي',
        branchEn: 'American Curriculum'
      },
      {
        code: 'US_GRADE_12',
        titleAr: 'المنهج الأمريكي - الصف الثاني عشر (AP Calculus / Statistics)',
        titleEn: 'American Curriculum — Grade 12 (AP Calculus & Stats)',
        shortLabelAr: 'Gr 12 US',
        shortLabelEn: 'Gr 12',
        stageAr: 'المرحلة الثانوية الأمريكية',
        stageEn: 'High School (Grades 9-12)',
        branchAr: 'المنهج الأمريكي',
        branchEn: 'American Curriculum'
      },

      // المسار البريطاني (British Curriculum: KS1-KS4 IGCSE & Sixth Form A-Level)
      {
        code: 'IGCSE_YEAR_1',
        titleAr: 'السنة الأولى البريطانية (Primary Key Stage 1 - Year 1)',
        titleEn: 'British Curriculum — Primary Key Stage 1 (Year 1)',
        shortLabelAr: 'Year 1',
        shortLabelEn: 'Yr 1',
        stageAr: 'المرحلة الابتدائية البريطانية (Key Stage 1)',
        stageEn: 'British Primary (Key Stage 1)',
        branchAr: 'المنهج البريطاني',
        branchEn: 'British Curriculum'
      },
      {
        code: 'IGCSE_YEAR_2',
        titleAr: 'السنة الثانية البريطانية (Primary Key Stage 1 - Year 2)',
        titleEn: 'British Curriculum — Primary Key Stage 1 (Year 2)',
        shortLabelAr: 'Year 2',
        shortLabelEn: 'Yr 2',
        stageAr: 'المرحلة الابتدائية البريطانية (Key Stage 1)',
        stageEn: 'British Primary (Key Stage 1)',
        branchAr: 'المنهج البريطاني',
        branchEn: 'British Curriculum'
      },
      {
        code: 'IGCSE_YEAR_3',
        titleAr: 'السنة الثالثة البريطانية (Primary Key Stage 2 - Year 3)',
        titleEn: 'British Curriculum — Primary Key Stage 2 (Year 3)',
        shortLabelAr: 'Year 3',
        shortLabelEn: 'Yr 3',
        stageAr: 'المرحلة الابتدائية البريطانية (Key Stage 2)',
        stageEn: 'British Primary (Key Stage 2)',
        branchAr: 'المنهج البريطاني',
        branchEn: 'British Curriculum'
      },
      {
        code: 'IGCSE_YEAR_4',
        titleAr: 'السنة الرابعة البريطانية (Primary Key Stage 2 - Year 4)',
        titleEn: 'British Curriculum — Primary Key Stage 2 (Year 4)',
        shortLabelAr: 'Year 4',
        shortLabelEn: 'Yr 4',
        stageAr: 'المرحلة الابتدائية البريطانية (Key Stage 2)',
        stageEn: 'British Primary (Key Stage 2)',
        branchAr: 'المنهج البريطاني',
        branchEn: 'British Curriculum'
      },
      {
        code: 'IGCSE_YEAR_5',
        titleAr: 'السنة الخامسة البريطانية (Primary Key Stage 2 - Year 5)',
        titleEn: 'British Curriculum — Primary Key Stage 2 (Year 5)',
        shortLabelAr: 'Year 5',
        shortLabelEn: 'Yr 5',
        stageAr: 'المرحلة الابتدائية البريطانية (Key Stage 2)',
        stageEn: 'British Primary (Key Stage 2)',
        branchAr: 'المنهج البريطاني',
        branchEn: 'British Curriculum'
      },
      {
        code: 'IGCSE_YEAR_6',
        titleAr: 'السنة السادسة البريطانية (Primary Key Stage 2 - Year 6)',
        titleEn: 'British Curriculum — Primary Key Stage 2 (Year 6)',
        shortLabelAr: 'Year 6',
        shortLabelEn: 'Yr 6',
        stageAr: 'المرحلة الابتدائية البريطانية (Key Stage 2)',
        stageEn: 'British Primary (Key Stage 2)',
        branchAr: 'المنهج البريطاني',
        branchEn: 'British Curriculum'
      },
      {
        code: 'IGCSE_YEAR_7',
        titleAr: 'السنة السابعة البريطانية (Secondary Key Stage 3 - Year 7)',
        titleEn: 'British Curriculum — Secondary Key Stage 3 (Year 7)',
        shortLabelAr: 'Year 7',
        shortLabelEn: 'Yr 7',
        stageAr: 'المرحلة الثانوية الدنيا (Key Stage 3)',
        stageEn: 'Lower Secondary (Key Stage 3)',
        branchAr: 'المنهج البريطاني',
        branchEn: 'British Curriculum'
      },
      {
        code: 'IGCSE_YEAR_8',
        titleAr: 'السنة الثامنة البريطانية (Secondary Key Stage 3 - Year 8)',
        titleEn: 'British Curriculum — Secondary Key Stage 3 (Year 8)',
        shortLabelAr: 'Year 8',
        shortLabelEn: 'Yr 8',
        stageAr: 'المرحلة الثانوية الدنيا (Key Stage 3)',
        stageEn: 'Lower Secondary (Key Stage 3)',
        branchAr: 'المنهج البريطاني',
        branchEn: 'British Curriculum'
      },
      {
        code: 'IGCSE_YEAR_9',
        titleAr: 'السنة التاسعة البريطانية (Secondary Key Stage 3 - Year 9 / Pre-IG)',
        titleEn: 'British Curriculum — Secondary Key Stage 3 (Year 9 / Pre-IGCSE)',
        shortLabelAr: 'Year 9',
        shortLabelEn: 'Yr 9',
        stageAr: 'المرحلة الثانوية الدنيا (Key Stage 3)',
        stageEn: 'Lower Secondary (Key Stage 3)',
        branchAr: 'المنهج البريطاني',
        branchEn: 'British Curriculum'
      },
      {
        code: 'IGCSE_OL',
        titleAr: 'مستوى IGCSE Ordinary Level (Key Stage 4 — Year 10-11)',
        titleEn: 'IGCSE O-Level Math (Key Stage 4 — Year 10-11)',
        shortLabelAr: 'IGCSE OL',
        shortLabelEn: 'IG OL',
        stageAr: 'مرحلة شهادة الـ IGCSE (Key Stage 4)',
        stageEn: 'Key Stage 4 (IGCSE)',
        branchAr: 'المنهج البريطاني',
        branchEn: 'British Curriculum'
      },
      {
        code: 'IGCSE_AS',
        titleAr: 'مستوى IGCSE AS-Level (Sixth Form — Year 12)',
        titleEn: 'IGCSE AS-Level Math (Sixth Form — Year 12)',
        shortLabelAr: 'IGCSE AS',
        shortLabelEn: 'IG AS',
        stageAr: 'المستوى المتقدم التكميلي (Sixth Form)',
        stageEn: 'Sixth Form (AS-Level)',
        branchAr: 'المنهج البريطاني',
        branchEn: 'British Curriculum'
      },
      {
        code: 'IGCSE_AL',
        titleAr: 'مستوى IGCSE A-Level الكامل (Sixth Form — Year 13)',
        titleEn: 'IGCSE Full A-Level Math (Sixth Form — Year 13)',
        shortLabelAr: 'IGCSE AL',
        shortLabelEn: 'IG AL',
        stageAr: 'المستوى المتقدم الكامل (Sixth Form)',
        stageEn: 'Sixth Form (A-Level)',
        branchAr: 'المنهج البريطاني',
        branchEn: 'British Curriculum'
      }
    ]
  },

  // 4. الدبلومة الأمريكية (امتحانات القبول الجامعي الخمسة: SAT • EST 1 • EST 2 • ACT 1 • ACT 2 — بدون ترم أول وثاني)
  {
    code: 'AMERICAN',
    titleAr: 'الدبلومة الأمريكية (SAT • EST • ACT)',
    titleEn: 'American Diploma (SAT • EST • ACT)',
    subtitleAr: 'امتحانات القبول الجامعي المؤهلة للجامعات',
    subtitleEn: 'Standardized University Entrance Exams',
    taglineAr: 'SAT • EST • ACT',
    taglineEn: 'SAT • EST • ACT',
    descriptionAr: 'برنامج تحضيري مكثف لاختبارات الدبلومة الأمريكية المعتمدة للقبول الجامعي (SAT • EST 1 • EST 2 • ACT 1 • ACT 2) مع احتراف الآلة الحاسبة البيانية Desmos ونماذج المحاكاة الرسمية دون تقسيم ترم أول وثان.',
    descriptionEn: 'Intensive standardized exam preparation for American Diploma entrance exams (SAT, EST 1, EST 2, ACT 1, ACT 2) with Desmos mastery and official practice tests without term divisions.',
    iconName: 'graduation-cap',
    mathWatermarkSymbol: '✦',
    accentColorHex: '#00B4D8',
    badgeTextAr: 'سكور 800 في الماث',
    badgeTextEn: 'Target 800 Math Score',
    hasTerms: false,
    terms: [],
    grades: [
      {
        code: 'SAT',
        titleAr: 'اختبار SAT (Digital SAT Math)',
        titleEn: 'Digital SAT Math Exam',
        shortLabelAr: 'SAT',
        shortLabelEn: 'SAT',
        stageAr: 'امتحانات القبول بالدبلومة الأمريكية',
        stageEn: 'American Diploma (Entrance Exams)'
      },
      {
        code: 'EST_1',
        titleAr: 'اختبار EST 1 (Egyptian Scholastic Test I)',
        titleEn: 'EST 1 Math (Literacy I Math)',
        shortLabelAr: 'EST 1',
        shortLabelEn: 'EST 1',
        stageAr: 'امتحانات القبول بالدبلومة الأمريكية',
        stageEn: 'American Diploma (Entrance Exams)'
      },
      {
        code: 'EST_2',
        titleAr: 'اختبار EST 2 (Egyptian Scholastic Test II)',
        titleEn: 'EST 2 Math (Advanced Mathematics)',
        shortLabelAr: 'EST 2',
        shortLabelEn: 'EST 2',
        stageAr: 'امتحانات القبول بالدبلومة الأمريكية',
        stageEn: 'American Diploma (Entrance Exams)'
      },
      {
        code: 'ACT_1',
        titleAr: 'اختبار ACT 1 (American College Testing I)',
        titleEn: 'ACT 1 Math (60 Questions Drills)',
        shortLabelAr: 'ACT 1',
        shortLabelEn: 'ACT 1',
        stageAr: 'امتحانات القبول بالدبلومة الأمريكية',
        stageEn: 'American Diploma (Entrance Exams)'
      },
      {
        code: 'ACT_2',
        titleAr: 'اختبار ACT 2 (American College Testing II)',
        titleEn: 'ACT 2 Math (Advanced Trigonometry & Functions)',
        shortLabelAr: 'ACT 2',
        shortLabelEn: 'ACT 2',
        stageAr: 'امتحانات القبول بالدبلومة الأمريكية',
        stageEn: 'American Diploma (Entrance Exams)'
      }
    ]
  }
] as const;

/**
 * Fast lookup utilities
 */
export function findCurriculumByCode(code: string): ICurriculumNode | undefined {
  return CANONICAL_CURRICULUM_TREE.find(c => c.code === code);
}

export function findGradeByCode(curriculumCode: string, gradeCode: string): IGradeLevelMeta | undefined {
  const curriculum = findCurriculumByCode(curriculumCode);
  return curriculum?.grades.find(g => g.code === gradeCode);
}

export function findTermByCode(termCode: string): ITermMeta | undefined {
  return CANONICAL_ACADEMIC_TERMS.find(t => t.code === termCode);
}

export function findGulfCountry(code: string): IGulfCountryData | undefined {
  return GULF_COUNTRIES_DATA.find(c => c.code === code);
}

export function getGulfCountryGrades(countryCode: string): readonly IGradeLevelMeta[] {
  const country = findGulfCountry(countryCode);
  return country ? country.grades : (findCurriculumByCode('GULF')?.grades || []);
}
