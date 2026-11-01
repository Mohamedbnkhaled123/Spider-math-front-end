/**
 * Spider Math Educational Platform — Canonical 5-Level Academic UI Hierarchy Tree
 * Version: v2.2
 *
 * 1. Curriculum Track (CURRICULUMS)
 *    └── 2. Grade Level (GRADE_LEVELS_BY_CURRICULUM)
 *        └── 3. Academic Term (ACADEMIC_TERMS: TERM_1, TERM_2)
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

export interface IGradeLevelMeta {
  readonly code: string;
  readonly titleAr: string;
  readonly titleEn: string;
  readonly shortLabelAr: string;
  readonly shortLabelEn: string;
  readonly stageAr: string;
  readonly stageEn: string;
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

export const CANONICAL_CURRICULUM_TREE: readonly ICurriculumNode[] = [
  // 1. المنهج المصري (من 1 ابتدائي إلى 3 ثانوي)
  {
    code: 'EGYPTIAN',
    titleAr: 'المنهج المصري',
    titleEn: 'Egyptian Curriculum',
    subtitleAr: 'من الأساسيات للتميّز',
    subtitleEn: 'From Fundamentals to Thanaweya Amma Excellence',
    taglineAr: 'من الأساسيات للتميّز',
    taglineEn: 'From Fundamentals to Excellence',
    descriptionAr: 'تغطية شاملة ومبسطة لمادة الرياضيات لجميع المراحل من الابتدائي وحتى الثانوية العامة بأحدث طرق التدريس وحل نماذج الامتحانات الوزارية والتجريبية.',
    descriptionEn: 'Comprehensive and structured mathematics curriculum from Primary 1 through Thanaweya Amma with intensive exam workouts.',
    iconName: 'pyramid',
    mathWatermarkSymbol: 'π',
    accentColorHex: '#6D28D9',
    badgeTextAr: 'الأكثر طلباً',
    badgeTextEn: 'Most Popular',
    terms: CANONICAL_ACADEMIC_TERMS,
    grades: [
      {
        code: 'PRI_1',
        titleAr: 'الصف الأول الابتدائي',
        titleEn: 'Primary 1 (Grade 1)',
        shortLabelAr: '١ ابتدائي',
        shortLabelEn: 'Pri 1',
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
        code: 'PRI_3',
        titleAr: 'الصف الثالث الابتدائي',
        titleEn: 'Primary 3 (Grade 3)',
        shortLabelAr: '٣ ابتدائي',
        shortLabelEn: 'Pri 3',
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
        code: 'PRI_5',
        titleAr: 'الصف الخامس الابتدائي',
        titleEn: 'Primary 5 (Grade 5)',
        shortLabelAr: '٥ ابتدائي',
        shortLabelEn: 'Pri 5',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary Stage'
      },
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
        code: 'PREP_1',
        titleAr: 'الصف الأول الإعدادي',
        titleEn: 'Prep 1 (Grade 7)',
        shortLabelAr: '١ إعدادي',
        shortLabelEn: 'Prep 1',
        stageAr: 'المرحلة الإعدادية',
        stageEn: 'Preparatory Stage'
      },
      {
        code: 'PREP_2',
        titleAr: 'الصف الثاني الإعدادي',
        titleEn: 'Prep 2 (Grade 8)',
        shortLabelAr: '٢ إعدادي',
        shortLabelEn: 'Prep 2',
        stageAr: 'المرحلة الإعدادية',
        stageEn: 'Preparatory Stage'
      },
      {
        code: 'PREP_3',
        titleAr: 'الصف الثالث الإعدادي (الشهادة الإعدادية)',
        titleEn: 'Prep 3 (Grade 9 — General Certificate)',
        shortLabelAr: '٣ إعدادي',
        shortLabelEn: 'Prep 3',
        stageAr: 'المرحلة الإعدادية',
        stageEn: 'Preparatory Stage'
      },
      {
        code: 'SEC_1',
        titleAr: 'الصف الأول الثانوي',
        titleEn: 'Secondary 1 (Grade 10)',
        shortLabelAr: '١ ثانوي',
        shortLabelEn: 'Sec 1',
        stageAr: 'المرحلة الثانوية',
        stageEn: 'Secondary Stage'
      },
      {
        code: 'SEC_2',
        titleAr: 'الصف الثاني الثانوي (علمي / أدبي)',
        titleEn: 'Secondary 2 (Grade 11 — Scientific / Arts)',
        shortLabelAr: '٢ ثانوي',
        shortLabelEn: 'Sec 2',
        stageAr: 'المرحلة الثانوية',
        stageEn: 'Secondary Stage'
      },
      {
        code: 'SEC_3',
        titleAr: 'الصف الثالث الثانوي (الثانوية العامة - علمي رياضة)',
        titleEn: 'Secondary 3 (Grade 12 — Thanaweya Amma Math)',
        shortLabelAr: '٣ ثانوي',
        shortLabelEn: 'Sec 3',
        stageAr: 'المرحلة الثانوية',
        stageEn: 'Secondary Stage'
      }
    ]
  },

  // 2. المنهج الخليجي (من 1 ابتدائي إلى 12 توجيهي)
  {
    code: 'GULF',
    titleAr: 'المنهج الخليجي',
    titleEn: 'Gulf Curriculum',
    subtitleAr: 'شرح واضح وتدريب مستمر',
    subtitleEn: 'Clear Explanations & Continuous Practice',
    taglineAr: 'شرح واضح وتدريب مستمر',
    taglineEn: 'Clear Explanation & Continuous Practice',
    descriptionAr: 'منهج مخصص لطلاب دول الخليج العربي (السعودية، الإمارات، الكويت، قطر، عمان، البحرين) متوافق مع المعايير الوزارية والكتب المعتمدة من الابتدائي حتى الثانوي.',
    descriptionEn: 'Custom curriculum tailored to Saudi, Emirati and GCC ministerial standards from Grade 1 through Grade 12 with continuous assessments.',
    iconName: 'landmark',
    mathWatermarkSymbol: 'Σ',
    accentColorHex: '#0891B2',
    badgeTextAr: 'معتمد خليجياً',
    badgeTextEn: 'GCC Accredited',
    terms: CANONICAL_ACADEMIC_TERMS,
    grades: [
      {
        code: 'GRADE_1',
        titleAr: 'الصف الأول الابتدائي',
        titleEn: 'Grade 1 (Primary 1)',
        shortLabelAr: 'صف ١',
        shortLabelEn: 'Gr 1',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary School'
      },
      {
        code: 'GRADE_2',
        titleAr: 'الصف الثاني الابتدائي',
        titleEn: 'Grade 2 (Primary 2)',
        shortLabelAr: 'صف ٢',
        shortLabelEn: 'Gr 2',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary School'
      },
      {
        code: 'GRADE_3',
        titleAr: 'الصف الثالث الابتدائي',
        titleEn: 'Grade 3 (Primary 3)',
        shortLabelAr: 'صف ٣',
        shortLabelEn: 'Gr 3',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary School'
      },
      {
        code: 'GRADE_4',
        titleAr: 'الصف الرابع الابتدائي',
        titleEn: 'Grade 4 (Primary 4)',
        shortLabelAr: 'صف ٤',
        shortLabelEn: 'Gr 4',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary School'
      },
      {
        code: 'GRADE_5',
        titleAr: 'الصف الخامس الابتدائي',
        titleEn: 'Grade 5 (Primary 5)',
        shortLabelAr: 'صف ٥',
        shortLabelEn: 'Gr 5',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary School'
      },
      {
        code: 'GRADE_6',
        titleAr: 'الصف السادس الابتدائي',
        titleEn: 'Grade 6 (Primary 6)',
        shortLabelAr: 'صف ٦',
        shortLabelEn: 'Gr 6',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary School'
      },
      {
        code: 'GRADE_7',
        titleAr: 'الصف السابع (أول متوسط)',
        titleEn: 'Grade 7 (Middle 1)',
        shortLabelAr: 'صف ٧',
        shortLabelEn: 'Gr 7',
        stageAr: 'المرحلة المتوسطة',
        stageEn: 'Middle School'
      },
      {
        code: 'GRADE_8',
        titleAr: 'الصف الثامن (ثاني متوسط)',
        titleEn: 'Grade 8 (Middle 2)',
        shortLabelAr: 'صف ٨',
        shortLabelEn: 'Gr 8',
        stageAr: 'المرحلة المتوسطة',
        stageEn: 'Middle School'
      },
      {
        code: 'GRADE_9',
        titleAr: 'الصف التاسع (ثالث متوسط)',
        titleEn: 'Grade 9 (Middle 3)',
        shortLabelAr: 'صف ٩',
        shortLabelEn: 'Gr 9',
        stageAr: 'المرحلة المتوسطة',
        stageEn: 'Middle School'
      },
      {
        code: 'GRADE_10',
        titleAr: 'الصف العاشر (أول ثانوي)',
        titleEn: 'Grade 10 (High School 1)',
        shortLabelAr: 'صف ١٠',
        shortLabelEn: 'Gr 10',
        stageAr: 'المرحلة الثانوية',
        stageEn: 'High School'
      },
      {
        code: 'GRADE_11',
        titleAr: 'الصف الحادي عشر (ثاني ثانوي)',
        titleEn: 'Grade 11 (High School 2)',
        shortLabelAr: 'صف ١١',
        shortLabelEn: 'Gr 11',
        stageAr: 'المرحلة الثانوية',
        stageEn: 'High School'
      },
      {
        code: 'GRADE_12',
        titleAr: 'الصف الثاني عشر (توجيهي / ثالث ثانوي)',
        titleEn: 'Grade 12 (Senior Year)',
        shortLabelAr: 'صف ١٢',
        shortLabelEn: 'Gr 12',
        stageAr: 'المرحلة الثانوية',
        stageEn: 'High School'
      }
    ]
  },

  // 3. المناهج الدولية البريطانية (من Year 1 إلى A-Level)
  {
    code: 'INTERNATIONAL',
    titleAr: 'المناهج الدولية (IGCSE / British)',
    titleEn: 'International Curricula (IGCSE / British)',
    subtitleAr: 'رياضيات بمعايير عالمية',
    subtitleEn: 'World-Class Global Mathematical Standards',
    taglineAr: 'رياضيات بمعايير عالمية',
    taglineEn: 'World-Class Global Standards',
    descriptionAr: 'برنامج مكثف لمناهج كامبريدج وبيرسون إديكسل (Cambridge & Edexcel) من المرحلة الابتدائية وحتى الـ A-Level، مع حل مستمر لامتحانات الـ Past Papers.',
    descriptionEn: 'Specialized Cambridge & Edexcel curriculum from Primary through A-Level with comprehensive past paper workouts.',
    iconName: 'globe',
    mathWatermarkSymbol: '∞',
    accentColorHex: '#9333EA',
    badgeTextAr: 'معايير كامبريدج وإديكسل',
    badgeTextEn: 'Cambridge & Edexcel',
    terms: CANONICAL_ACADEMIC_TERMS,
    grades: [
      {
        code: 'IGCSE_YEAR_1',
        titleAr: 'السنة الأولى الدولية (Year 1 / Primary 1)',
        titleEn: 'International Year 1 (Cambridge Primary Stage 1)',
        shortLabelAr: 'Year 1',
        shortLabelEn: 'Yr 1',
        stageAr: 'المرحلة الابتدائية الدولية',
        stageEn: 'Cambridge Primary'
      },
      {
        code: 'IGCSE_YEAR_2',
        titleAr: 'السنة الثانية الدولية (Year 2 / Primary 2)',
        titleEn: 'International Year 2 (Cambridge Primary Stage 2)',
        shortLabelAr: 'Year 2',
        shortLabelEn: 'Yr 2',
        stageAr: 'المرحلة الابتدائية الدولية',
        stageEn: 'Cambridge Primary'
      },
      {
        code: 'IGCSE_YEAR_3',
        titleAr: 'السنة الثالثة الدولية (Year 3 / Primary 3)',
        titleEn: 'International Year 3 (Cambridge Primary Stage 3)',
        shortLabelAr: 'Year 3',
        shortLabelEn: 'Yr 3',
        stageAr: 'المرحلة الابتدائية الدولية',
        stageEn: 'Cambridge Primary'
      },
      {
        code: 'IGCSE_YEAR_4',
        titleAr: 'السنة الرابعة الدولية (Year 4 / Primary 4)',
        titleEn: 'International Year 4 (Cambridge Primary Stage 4)',
        shortLabelAr: 'Year 4',
        shortLabelEn: 'Yr 4',
        stageAr: 'المرحلة الابتدائية الدولية',
        stageEn: 'Cambridge Primary'
      },
      {
        code: 'IGCSE_YEAR_5',
        titleAr: 'السنة الخامسة الدولية (Year 5 / Primary 5)',
        titleEn: 'International Year 5 (Cambridge Primary Stage 5)',
        shortLabelAr: 'Year 5',
        shortLabelEn: 'Yr 5',
        stageAr: 'المرحلة الابتدائية الدولية',
        stageEn: 'Cambridge Primary'
      },
      {
        code: 'IGCSE_YEAR_6',
        titleAr: 'السنة السادسة الدولية (Year 6 / Primary 6)',
        titleEn: 'International Year 6 (Cambridge Primary Stage 6)',
        shortLabelAr: 'Year 6',
        shortLabelEn: 'Yr 6',
        stageAr: 'المرحلة الابتدائية الدولية',
        stageEn: 'Cambridge Primary'
      },
      {
        code: 'IGCSE_YEAR_7',
        titleAr: 'السنة السابعة الدولية (Year 7 / Stage 8)',
        titleEn: 'International Year 7 (Checkpoint Stage 8)',
        shortLabelAr: 'Year 7',
        shortLabelEn: 'Yr 7',
        stageAr: 'المرحلة الإعدادية الدولية',
        stageEn: 'Lower Secondary'
      },
      {
        code: 'IGCSE_YEAR_8',
        titleAr: 'السنة الثامنة الدولية (Year 8 / Stage 9)',
        titleEn: 'International Year 8 (Checkpoint Stage 9)',
        shortLabelAr: 'Year 8',
        shortLabelEn: 'Yr 8',
        stageAr: 'المرحلة الإعدادية الدولية',
        stageEn: 'Lower Secondary'
      },
      {
        code: 'IGCSE_YEAR_9',
        titleAr: 'السنة التاسعة الدولية (Year 9 / Pre-IG)',
        titleEn: 'International Year 9 (Pre-IGCSE)',
        shortLabelAr: 'Year 9',
        shortLabelEn: 'Yr 9',
        stageAr: 'المرحلة الإعدادية الدولية',
        stageEn: 'Pre-IGCSE'
      },
      {
        code: 'IGCSE_OL',
        titleAr: 'المستوى العادي IGCSE Ordinary Level (Core & Extended)',
        titleEn: 'IGCSE O-Level Math (Core & Extended)',
        shortLabelAr: 'IGCSE OL',
        shortLabelEn: 'IG OL',
        stageAr: 'مرحلة الـ IGCSE',
        stageEn: 'IGCSE Stage'
      },
      {
        code: 'IGCSE_AS',
        titleAr: 'المستوى التكميلي المتقدم IGCSE AS-Level (Pure & Mechanics)',
        titleEn: 'IGCSE AS-Level Math (Pure & Mechanics)',
        shortLabelAr: 'IGCSE AS',
        shortLabelEn: 'IG AS',
        stageAr: 'المستوى المتقدم',
        stageEn: 'Advanced Subsidiary'
      },
      {
        code: 'IGCSE_AL',
        titleAr: 'المستوى المتقدم الكامل IGCSE A-Level (A2 Pure & Stats/Mech)',
        titleEn: 'IGCSE A-Level Math (Full A2)',
        shortLabelAr: 'IGCSE AL',
        shortLabelEn: 'IG AL',
        stageAr: 'المستوى المتقدم الكامل',
        stageEn: 'Full A-Level'
      }
    ]
  },

  // 4. الدبلومة الأمريكية (من Grade 1 إلى اختبارات SAT / ACT / EST)
  {
    code: 'AMERICAN',
    titleAr: 'الدبلومة الأمريكية (SAT • EST • ACT)',
    titleEn: 'American Diploma (SAT • EST • ACT)',
    subtitleAr: 'SAT • EST • ACT',
    subtitleEn: 'Digital SAT • EST I & II • ACT Math Prep',
    taglineAr: 'SAT • EST • ACT',
    taglineEn: 'SAT • EST • ACT',
    descriptionAr: 'منهج الدبلومة الأمريكية من المرحلة الابتدائية والمتوسطة وحتى الثانوية واختبارات القبول الجامعي (SAT • EST • ACT) مع احتراف الآلة الحاسبة البيانية (Desmos).',
    descriptionEn: 'Complete American curriculum from Grade 1 through Grade 12 and standardized college readiness testing (SAT, EST, ACT) with Desmos mastery.',
    iconName: 'graduation-cap',
    mathWatermarkSymbol: '✦',
    accentColorHex: '#00B4D8',
    badgeTextAr: 'سكور 800 في الماث',
    badgeTextEn: 'Target 800 Math Score',
    terms: CANONICAL_ACADEMIC_TERMS,
    grades: [
      {
        code: 'US_GRADE_1',
        titleAr: 'الصف الأول الأمريكي (Grade 1)',
        titleEn: 'Grade 1 (Elementary Math)',
        shortLabelAr: 'Gr 1 US',
        shortLabelEn: 'Gr 1',
        stageAr: 'المرحلة الابتدائية الأمريكية',
        stageEn: 'Elementary School'
      },
      {
        code: 'US_GRADE_2',
        titleAr: 'الصف الثاني الأمريكي (Grade 2)',
        titleEn: 'Grade 2 (Elementary Math)',
        shortLabelAr: 'Gr 2 US',
        shortLabelEn: 'Gr 2',
        stageAr: 'المرحلة الابتدائية الأمريكية',
        stageEn: 'Elementary School'
      },
      {
        code: 'US_GRADE_3',
        titleAr: 'الصف الثالث الأمريكي (Grade 3)',
        titleEn: 'Grade 3 (Elementary Math)',
        shortLabelAr: 'Gr 3 US',
        shortLabelEn: 'Gr 3',
        stageAr: 'المرحلة الابتدائية الأمريكية',
        stageEn: 'Elementary School'
      },
      {
        code: 'US_GRADE_4',
        titleAr: 'الصف الرابع الأمريكي (Grade 4)',
        titleEn: 'Grade 4 (Elementary Math)',
        shortLabelAr: 'Gr 4 US',
        shortLabelEn: 'Gr 4',
        stageAr: 'المرحلة الابتدائية الأمريكية',
        stageEn: 'Elementary School'
      },
      {
        code: 'US_GRADE_5',
        titleAr: 'الصف الخامس الأمريكي (Grade 5)',
        titleEn: 'Grade 5 (Elementary Math)',
        shortLabelAr: 'Gr 5 US',
        shortLabelEn: 'Gr 5',
        stageAr: 'المرحلة الابتدائية الأمريكية',
        stageEn: 'Elementary School'
      },
      {
        code: 'US_GRADE_6',
        titleAr: 'الصف السادس الأمريكي (Grade 6)',
        titleEn: 'Grade 6 (Middle School Math)',
        shortLabelAr: 'Gr 6 US',
        shortLabelEn: 'Gr 6',
        stageAr: 'المرحلة المتوسطة الأمريكية',
        stageEn: 'Middle School'
      },
      {
        code: 'US_GRADE_7',
        titleAr: 'الصف السابع الأمريكي (Grade 7 — Pre-Algebra)',
        titleEn: 'Grade 7 (Pre-Algebra)',
        shortLabelAr: 'Gr 7 US',
        shortLabelEn: 'Gr 7',
        stageAr: 'المرحلة المتوسطة الأمريكية',
        stageEn: 'Middle School'
      },
      {
        code: 'US_GRADE_8',
        titleAr: 'الصف الثامن الأمريكي (Grade 8 — Algebra Prep)',
        titleEn: 'Grade 8 (Algebra Foundations)',
        shortLabelAr: 'Gr 8 US',
        shortLabelEn: 'Gr 8',
        stageAr: 'المرحلة المتوسطة الأمريكية',
        stageEn: 'Middle School'
      },
      {
        code: 'GRADE_9',
        titleAr: 'الصف التاسع الأمريكي (Grade 9 — Algebra I)',
        titleEn: 'Grade 9 (Algebra I & Intro Geometry)',
        shortLabelAr: 'Gr 9 US',
        shortLabelEn: 'Gr 9',
        stageAr: 'المرحلة الثانوية الأمريكية',
        stageEn: 'High School'
      },
      {
        code: 'GRADE_10',
        titleAr: 'الصف العاشر الأمريكي (Grade 10 — Geometry & Algebra II)',
        titleEn: 'Grade 10 (Geometry & Advanced Algebra II)',
        shortLabelAr: 'Gr 10 US',
        shortLabelEn: 'Gr 10',
        stageAr: 'المرحلة الثانوية الأمريكية',
        stageEn: 'High School'
      },
      {
        code: 'GRADE_11',
        titleAr: 'الصف الحادي عشر الأمريكي (Grade 11 — Pre-Calculus / Trigonometry)',
        titleEn: 'Grade 11 (Pre-Calculus & Trigonometry)',
        shortLabelAr: 'Gr 11 US',
        shortLabelEn: 'Gr 11',
        stageAr: 'المرحلة الثانوية الأمريكية',
        stageEn: 'High School'
      },
      {
        code: 'GRADE_12',
        titleAr: 'الصف الثاني عشر الأمريكي (Grade 12 — AP Calculus / Statistics)',
        titleEn: 'Grade 12 (AP Calculus & College Prep)',
        shortLabelAr: 'Gr 12 US',
        shortLabelEn: 'Gr 12',
        stageAr: 'المرحلة الثانوية الأمريكية',
        stageEn: 'High School'
      },
      {
        code: 'SAT_1',
        titleAr: 'Digital SAT Math (Section 1 & 2 Modules)',
        titleEn: 'Digital SAT Math (College Board Suite)',
        shortLabelAr: 'SAT I',
        shortLabelEn: 'SAT 1',
        stageAr: 'اختبارات القبول',
        stageEn: 'College Entrance'
      },
      {
        code: 'SAT_2',
        titleAr: 'SAT Subject Math Level 1 & 2',
        titleEn: 'SAT Subject Math (Level 1 & Level 2)',
        shortLabelAr: 'SAT II',
        shortLabelEn: 'SAT 2',
        stageAr: 'اختبارات القبول',
        stageEn: 'College Entrance'
      },
      {
        code: 'SAT_MATH',
        titleAr: 'Digital SAT Math Mastery (Hard Modules)',
        titleEn: 'Digital SAT Math Mastery',
        shortLabelAr: 'SAT Math',
        shortLabelEn: 'SAT Math',
        stageAr: 'اختبارات القبول',
        stageEn: 'College Entrance'
      },
      {
        code: 'EST_1',
        titleAr: 'EST I Math (Egyptian Scholastic Test - Literacy I)',
        titleEn: 'EST I Math (Literacy I Math Section)',
        shortLabelAr: 'EST I',
        shortLabelEn: 'EST 1',
        stageAr: 'اختبارات القبول المصرية',
        stageEn: 'Egyptian Scholastic Test'
      },
      {
        code: 'EST_2',
        titleAr: 'EST II Math (Advanced Math)',
        titleEn: 'EST II Math (Advanced Mathematics)',
        shortLabelAr: 'EST II',
        shortLabelEn: 'EST 2',
        stageAr: 'اختبارات القبول المصرية',
        stageEn: 'Egyptian Scholastic Test'
      },
      {
        code: 'EST_MATH',
        titleAr: 'EST I & EST II Math Prep',
        titleEn: 'EST Math Mastery',
        shortLabelAr: 'EST Math',
        shortLabelEn: 'EST Math',
        stageAr: 'اختبارات القبول المصرية',
        stageEn: 'Egyptian Scholastic Test'
      },
      {
        code: 'ACT_1',
        titleAr: 'ACT Math (60 Questions in 60 Minutes Drill)',
        titleEn: 'ACT Math (60 Questions Drills)',
        shortLabelAr: 'ACT I',
        shortLabelEn: 'ACT 1',
        stageAr: 'اختبارات القبول',
        stageEn: 'College Entrance'
      },
      {
        code: 'ACT_2',
        titleAr: 'ACT Subject Math II',
        titleEn: 'ACT Subject Math II (Advanced Trigonometry & Functions)',
        shortLabelAr: 'ACT II',
        shortLabelEn: 'ACT 2',
        stageAr: 'اختبارات القبول',
        stageEn: 'College Entrance'
      },
      {
        code: 'ACT_MATH',
        titleAr: 'ACT Math Mastery',
        titleEn: 'ACT Mathematics Mastery',
        shortLabelAr: 'ACT Math',
        shortLabelEn: 'ACT Math',
        stageAr: 'اختبارات القبول',
        stageEn: 'College Entrance'
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
