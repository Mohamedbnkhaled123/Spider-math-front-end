/**
 * Spider Math Educational Platform (v2.2)
 * Unit Mathematical Art, Formulas, Vector Symbols & Watermarks Utility
 * 
 * Provides distinctive, attractive mathematical motifs for every study unit
 * (Calculus, Analytical Geometry, Algebra, Trigonometry, Matrices, Vectors, Statistics).
 */

export interface UnitMathTheme {
  themeKey: 'calculus' | 'geometry' | 'algebra' | 'trigonometry' | 'matrices' | 'vectors' | 'statistics' | 'series';
  badge: string;
  formula: string;
  tagAr: string;
  tagEn: string;
  accentClass: string;
  svgPath: string;
}

export const UNIT_MATH_THEMES: UnitMathTheme[] = [
  {
    themeKey: 'calculus',
    badge: '∫ dx',
    formula: '∫ f(x) dx = F(x) + C',
    tagAr: 'تفاضل وتكامل',
    tagEn: 'Calculus & Analysis',
    accentClass: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
    svgPath: 'M12 40V8 M12 40H40 M24 10C27 10 29 12 28 16L24 32C23 36 25 38 28 38 M18 24H34'
  },
  {
    themeKey: 'trigonometry',
    badge: 'sin θ',
    formula: 'sin²(θ) + cos²(θ) = 1',
    tagAr: 'حساب مثلثات',
    tagEn: 'Trigonometry',
    accentClass: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10',
    svgPath: 'M10 38H38V14L10 38Z M10 24C16 12 22 36 28 24C34 12 40 36 44 24'
  },
  {
    themeKey: 'algebra',
    badge: 'f(x)',
    formula: 'x = (-b ± √(b² - 4ac)) / 2a',
    tagAr: 'جبر ومعادلات',
    tagEn: 'Algebra & Functions',
    accentClass: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
    svgPath: 'M24 6V42 M6 24H42 M10 12C16 36 32 36 38 12'
  },
  {
    themeKey: 'geometry',
    badge: 'π r²',
    formula: 'a² + b² = c²  •  V = ⁴⁄₃ π r³',
    tagAr: 'هندسة فراغية وتحليلية',
    tagEn: 'Analytical Geometry',
    accentClass: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
    svgPath: 'M24 4A20 20 0 1 0 24 44A20 20 0 1 0 24 4Z M24 8L40 36H8L24 8Z'
  },
  {
    themeKey: 'matrices',
    badge: '[A]⁻¹',
    formula: 'det(A - λI) = 0',
    tagAr: 'مصفوفات ومحددات',
    tagEn: 'Matrices & Linear Systems',
    accentClass: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    svgPath: 'M16 10H10V38H16 M32 10H38V38H32 M18 18H20 M28 18H30 M18 30H20 M28 30H30'
  },
  {
    themeKey: 'vectors',
    badge: 'u⃗ × v⃗',
    formula: 'u⃗ • v⃗ = |u⃗||v⃗| cos(θ)',
    tagAr: 'متجهات واستاتيكا',
    tagEn: 'Vectors & Mechanics',
    accentClass: 'text-rose-400 border-rose-400/30 bg-rose-400/10',
    svgPath: 'M8 40L8 12M8 12L5 16M8 12L11 16 M8 40L36 40M36 40L32 37M36 40L32 43 M8 40L34 14M34 14L28 15M34 14L33 20'
  },
  {
    themeKey: 'statistics',
    badge: 'σ²',
    formula: 'P(A ∪ B) = P(A) + P(B) - P(A ∩ B)',
    tagAr: 'إحصاء واحتمالات',
    tagEn: 'Probability & Statistics',
    accentClass: 'text-teal-400 border-teal-400/30 bg-teal-400/10',
    svgPath: 'M6 38H42 M8 38C14 38 18 36 20 26C22 16 24 10 24 10C24 10 26 16 28 26C30 36 34 38 40 38 M24 10V38'
  },
  {
    themeKey: 'series',
    badge: '∑ xi',
    formula: '∑ₙ a•rⁿ⁻¹ = a / (1 - r)',
    tagAr: 'متتابعات ومتسلسلات',
    tagEn: 'Sequences & Series',
    accentClass: 'text-indigo-400 border-indigo-400/30 bg-indigo-400/10',
    svgPath: 'M38 10H12L26 24L12 38H38 M20 4V8 M20 40V44'
  }
];

/**
 * Returns a deterministic mathematical visual theme for a given unit based on its title or index.
 */
export function getUnitMathTheme(unit: any, index: number = 0): UnitMathTheme {
  const title = ((unit?.title_ar || unit?.titleAr || unit?.title_en || unit?.titleEn || '') as string).toLowerCase();
  
  if (title.includes('تفاضل') || title.includes('تكامل') || title.includes('اشتقاق') || title.includes('calculus') || title.includes('derivative') || title.includes('integral')) {
    return UNIT_MATH_THEMES[0];
  }
  if (title.includes('مثلث') || title.includes('زاوي') || title.includes('trig') || title.includes('sin') || title.includes('cos')) {
    return UNIT_MATH_THEMES[1];
  }
  if (title.includes('جبر') || title.includes('دوال') || title.includes('معادل') || title.includes('algebra') || title.includes('polynomial')) {
    return UNIT_MATH_THEMES[2];
  }
  if (title.includes('هندس') || title.includes('دائر') || title.includes('مجسم') || title.includes('geometr') || title.includes('circle')) {
    return UNIT_MATH_THEMES[3];
  }
  if (title.includes('مصفوف') || title.includes('محدد') || title.includes('matrix') || title.includes('determinant')) {
    return UNIT_MATH_THEMES[4];
  }
  if (title.includes('متجه') || title.includes('استاتيك') || title.includes('ديناميك') || title.includes('قو') || title.includes('vector') || title.includes('mechanic')) {
    return UNIT_MATH_THEMES[5];
  }
  if (title.includes('احتمال') || title.includes('إحصاء') || title.includes('توزيع') || title.includes('prob') || title.includes('stat')) {
    return UNIT_MATH_THEMES[6];
  }
  if (title.includes('متتابع') || title.includes('متسلسل') || title.includes('series') || title.includes('sequence')) {
    return UNIT_MATH_THEMES[7];
  }

  // Fallback cyclic selection by index or hash
  const hash = Math.abs(hashString(title || String(index || 0)));
  return UNIT_MATH_THEMES[hash % UNIT_MATH_THEMES.length];
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

/**
 * Checks if a unit currently has zero content (0 lectures and 0 quizzes/assessments).
 */
export function isUnitContentEmpty(unit: any): boolean {
  if (!unit) return true;

  if (unit.is_coming_soon === true || unit.comingSoon === true) {
    return true;
  }

  // Calculate total lectures across all possible representation fields
  const lecturesCount = Math.max(
    Number(unit.total_lectures_count) || 0,
    Number(unit.lectures_count) || 0,
    Number(unit.totalLectures) || 0,
    Array.isArray(unit.lectures) ? unit.lectures.length : 0
  );

  // Calculate total quizzes/assessments across all possible representation fields
  const assessmentsCount = Math.max(
    Number(unit.total_assessments_count) || 0,
    Number(unit.quizzes_count) || 0,
    Number(unit.totalQuizzes) || 0,
    Number(unit.total_questions_count) || 0,
    Array.isArray(unit.assessments) ? unit.assessments.length : 0,
    Array.isArray(unit.quizzes) ? unit.quizzes.length : 0
  );

  return lecturesCount === 0 && assessmentsCount === 0;
}

export const COMING_SOON_DATA = {
  titleAr: 'قريباً — المحتوى قيد الإعداد',
  titleEn: 'Coming Soon — Content In Preparation',
  descAr: 'تقوم المهندسة / هبة عبد الوهاب حالياً بتجهيز المحاضرات والفيديوهات المشروحة والتمارين التفاعلية لهذه الوحدة، وسيتم إتاحتها قريباً جداً بأعلى معايير الجودة!',
  descEn: 'Eng. Heba Abdel-Wahab is currently preparing the lectures, secure video solutions, and interactive quizzes for this unit. It will be released soon!'
};

