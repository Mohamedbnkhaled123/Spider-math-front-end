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
  {
    code: 'EGYPTIAN',
    titleAr: 'المنهج المصري',
    titleEn: 'Egyptian Curriculum',
    subtitleAr: 'من الأساسيات للتميّز',
    subtitleEn: 'From Fundamentals to Thanaweya Amma Excellence',
    taglineAr: 'من الأساسيات للتميّز',
    taglineEn: 'From Fundamentals to Excellence',
    descriptionAr: 'تغطية شاملة ومبسطة لمادة الرياضيات للمرحلتين الإعدادية والثانوية العامة بأحدث طرق التدريس وحل نماذج الامتحانات الوزارية والتجريبية.',
    descriptionEn: 'Comprehensive and structured mathematics curriculum for Preparatory and Secondary stages with intensive Thanaweya Amma exam workouts.',
    iconName: 'pyramid',
    mathWatermarkSymbol: 'π',
    accentColorHex: '#6D28D9',
    badgeTextAr: 'الأكثر طلباً',
    badgeTextEn: 'Most Popular',
    terms: CANONICAL_ACADEMIC_TERMS,
    grades: [
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
  {
    code: 'GULF',
    titleAr: 'المنهج الخليجي',
    titleEn: 'Gulf Curriculum',
    subtitleAr: 'شرح واضح وتدريب مستمر',
    subtitleEn: 'Clear Explanations & Continuous Practice',
    taglineAr: 'شرح واضح وتدريب مستمر',
    taglineEn: 'Clear Explanation & Continuous Practice',
    descriptionAr: 'منهج مخصص لطلاب دول الخليج العربي (السعودية، الإمارات، الكويت، قطر، عمان، البحرين) متوافق مع المعايير الوزارية والكتب المعتمدة.',
    descriptionEn: 'Custom curriculum tailored to Saudi, Emirati and GCC ministerial standards from Grade 7 through Grade 12 with continuous assessments.',
    iconName: 'landmark',
    mathWatermarkSymbol: 'Σ',
    accentColorHex: '#0891B2',
    badgeTextAr: 'معتمد خليجياً',
    badgeTextEn: 'GCC Accredited',
    terms: CANONICAL_ACADEMIC_TERMS,
    grades: [
      {
        code: 'GRADE_7',
        titleAr: 'الصف السابع (أول متوسط)',
        titleEn: 'Grade 7 (Middle 1)',
        shortLabelAr: 'صف ٧',
        shortLabelEn: 'Gr 7',
        stageAr: 'المتوسطة',
        stageEn: 'Middle School'
      },
      {
        code: 'GRADE_8',
        titleAr: 'الصف الثامن (ثاني متوسط)',
        titleEn: 'Grade 8 (Middle 2)',
        shortLabelAr: 'صف ٨',
        shortLabelEn: 'Gr 8',
        stageAr: 'المتوسطة',
        stageEn: 'Middle School'
      },
      {
        code: 'GRADE_9',
        titleAr: 'الصف التاسع (ثالث متوسط)',
        titleEn: 'Grade 9 (Middle 3)',
        shortLabelAr: 'صف ٩',
        shortLabelEn: 'Gr 9',
        stageAr: 'المتوسطة',
        stageEn: 'Middle School'
      },
      {
        code: 'GRADE_10',
        titleAr: 'الصف العاشر (أول ثانوي)',
        titleEn: 'Grade 10 (High School 1)',
        shortLabelAr: 'صف ١٠',
        shortLabelEn: 'Gr 10',
        stageAr: 'الثانوية',
        stageEn: 'High School'
      },
      {
        code: 'GRADE_11',
        titleAr: 'الصف الحادي عشر (ثاني ثانوي)',
        titleEn: 'Grade 11 (High School 2)',
        shortLabelAr: 'صف ١١',
        shortLabelEn: 'Gr 11',
        stageAr: 'الثانوية',
        stageEn: 'High School'
      },
      {
        code: 'GRADE_12',
        titleAr: 'الصف الثاني عشر (ثالث ثانوي)',
        titleEn: 'Grade 12 (Senior Year)',
        shortLabelAr: 'صف ١٢',
        shortLabelEn: 'Gr 12',
        stageAr: 'الثانوية',
        stageEn: 'High School'
      }
    ]
  },
  {
    code: 'INTERNATIONAL',
    titleAr: 'المناهج الدولية (IGCSE / British)',
    titleEn: 'International Curricula (IGCSE / British)',
    subtitleAr: 'رياضيات بمعايير عالمية',
    subtitleEn: 'World-Class Global Mathematical Standards',
    taglineAr: 'رياضيات بمعايير عالمية',
    taglineEn: 'World-Class Global Standards',
    descriptionAr: 'برنامج مكثف لمناهج كامبريدج وبيرسون إديكسل (Cambridge & Edexcel) يشمل شرحاً دقيقاً للمفاهيم وحل أحدث امتحانات الـ Past Papers بأسلوب مبسط.',
    descriptionEn: 'Specialized Cambridge & Edexcel past paper problem-solving strategies, topic classifications, and mark scheme masterclasses.',
    iconName: 'globe',
    mathWatermarkSymbol: '∞',
    accentColorHex: '#9333EA',
    badgeTextAr: 'معايير كامبريدج وإديكسل',
    badgeTextEn: 'Cambridge & Edexcel',
    terms: CANONICAL_ACADEMIC_TERMS,
    grades: [
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
  {
    code: 'AMERICAN',
    titleAr: 'الدبلومة الأمريكية (SAT • EST • ACT)',
    titleEn: 'American Diploma (SAT • EST • ACT)',
    subtitleAr: 'SAT • EST • ACT',
    subtitleEn: 'Digital SAT • EST I & II • ACT Math Prep',
    taglineAr: 'SAT • EST • ACT',
    taglineEn: 'SAT • EST • ACT',
    descriptionAr: 'كورس تأهيلي متقدم لاختبارات القبول الجامعي الأمريكية والمصرية، يركز على استراتيجيات التفكير الرياضي السريع واحتراف استخدام حاسبة ديسموس (Desmos).',
    descriptionEn: 'Advanced college readiness prep focusing on time management, mental math shortcuts, and masterclass proficiency in the Desmos Graphing Calculator.',
    iconName: 'graduation-cap',
    mathWatermarkSymbol: '✦',
    accentColorHex: '#00B4D8',
    badgeTextAr: 'سكور 800 في الماث',
    badgeTextEn: 'Target 800 Math Score',
    terms: CANONICAL_ACADEMIC_TERMS,
    grades: [
      {
        code: 'GRADE_9',
        titleAr: 'الصف التاسع الأمريكي (Grade 9 — Algebra I)',
        titleEn: 'Grade 9 (Algebra I & Intro Geometry)',
        shortLabelAr: 'Gr 9 US',
        shortLabelEn: 'Gr 9 US',
        stageAr: 'المرحلة الثانوية الأمريكية',
        stageEn: 'High School'
      },
      {
        code: 'GRADE_10',
        titleAr: 'الصف العاشر الأمريكي (Grade 10 — Geometry & Algebra II)',
        titleEn: 'Grade 10 (Geometry & Advanced Algebra II)',
        shortLabelAr: 'Gr 10 US',
        shortLabelEn: 'Gr 10 US',
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
