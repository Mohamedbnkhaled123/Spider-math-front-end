import {
  curriculumHasTerms as treeCurriculumHasTerms,
  findCurriculumByCode,
  findGradeByCode,
  INTERNATIONAL_DIVISIONS_DATA
} from '../../../core/constants/curriculum-tree.constant';
import {
  PromotionEvaluationResult,
  PromotionMode,
  StudentAdminSummary
} from './students-subscriptions-devices.models';

const EGYPTIAN_GRADE_CHAIN: readonly string[] = [
  'PRI_1', 'PRI_2', 'PRI_3', 'PRI_4', 'PRI_5', 'PRI_6',
  'PREP_1', 'PREP_2', 'PREP_3',
  'SEC_1', 'SEC_2', 'SEC_3'
];

const GULF_GRADE_CHAIN: readonly string[] = [
  'GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6',
  'GRADE_7', 'GRADE_8', 'GRADE_9',
  'GRADE_10', 'GRADE_11', 'GRADE_12'
];

const US_K12_GRADE_CHAIN: readonly string[] = [
  'US_GRADE_1', 'US_GRADE_2', 'US_GRADE_3', 'US_GRADE_4', 'US_GRADE_5', 'US_GRADE_6',
  'US_GRADE_7', 'US_GRADE_8',
  'US_GRADE_9', 'US_GRADE_10', 'US_GRADE_11', 'US_GRADE_12'
];

const BRITISH_YEAR_GRADE_CHAIN: readonly string[] = [
  'IGCSE_YEAR_1', 'IGCSE_YEAR_2', 'IGCSE_YEAR_3', 'IGCSE_YEAR_4', 'IGCSE_YEAR_5', 'IGCSE_YEAR_6',
  'IGCSE_YEAR_7', 'IGCSE_YEAR_8', 'IGCSE_YEAR_9',
  'IGCSE_YEAR_10', 'IGCSE_YEAR_11', 'IGCSE_YEAR_12', 'IGCSE_YEAR_13'
];

const BRITISH_EXAM_GRADE_CHAIN: readonly string[] = [
  'IGCSE_OL', 'IGCSE_AS', 'IGCSE_AL'
];

const AMERICAN_LEGACY_HS_CHAIN: readonly string[] = [
  'GRADE_9', 'GRADE_10', 'GRADE_11', 'GRADE_12'
];

export function normalizePromotionCurriculum(curriculum?: string | null, gradeLevel?: string | null): string {
  const cleanCurr = (curriculum || '').trim().toUpperCase();
  const cleanGrade = (gradeLevel || '').trim().toUpperCase();

  let normCurr = cleanCurr;
  if (!normCurr) normCurr = '';
  else if (cleanCurr === 'EGYPTIAN' || cleanCurr.includes('EGYPT') || cleanCurr.includes('مصر')) normCurr = 'EGYPTIAN';
  else if (cleanCurr === 'GULF' || cleanCurr.includes('GULF') || cleanCurr.includes('خليج')) normCurr = 'GULF';
  else if (cleanCurr === 'INTERNATIONAL' || cleanCurr.includes('INT') || cleanCurr.includes('IGCSE') || cleanCurr.includes('بريطان') || cleanCurr.includes('دول')) normCurr = 'INTERNATIONAL';
  else if (cleanCurr === 'AMERICAN' || cleanCurr.includes('AMER') || cleanCurr.includes('أمر')) normCurr = 'AMERICAN';

  if (normCurr === 'AMERICAN' && /^US_GRADE_\d+$/.test(cleanGrade)) {
    return 'INTERNATIONAL';
  }
  return normCurr;
}

export function curriculumSupportsTerms(curriculum?: string | null, gradeLevel?: string | null): boolean {
  const effective = normalizePromotionCurriculum(curriculum, gradeLevel);
  return treeCurriculumHasTerms(effective);
}

export function resolveNextGrade(
  curriculum?: string | null,
  gradeLevel?: string | null
): { nextGrade: string | null; isTerminal: boolean } {
  const effective = normalizePromotionCurriculum(curriculum, gradeLevel);
  const normGrade = (gradeLevel || '').trim().toUpperCase();
  if (!effective || !normGrade || normGrade === '—') {
    return { nextGrade: null, isTerminal: false };
  }

  let chain: readonly string[] | null = null;
  if (effective === 'EGYPTIAN') {
    chain = EGYPTIAN_GRADE_CHAIN;
  } else if (effective === 'GULF') {
    chain = GULF_GRADE_CHAIN;
  } else if (effective === 'INTERNATIONAL') {
    if (normGrade.startsWith('US_GRADE_')) {
      chain = US_K12_GRADE_CHAIN;
    } else if (normGrade.startsWith('IGCSE_YEAR_')) {
      chain = BRITISH_YEAR_GRADE_CHAIN;
    } else if (BRITISH_EXAM_GRADE_CHAIN.includes(normGrade)) {
      chain = BRITISH_EXAM_GRADE_CHAIN;
    }
  } else if (effective === 'AMERICAN') {
    if (AMERICAN_LEGACY_HS_CHAIN.includes(normGrade)) {
      chain = AMERICAN_LEGACY_HS_CHAIN;
    } else {
      return { nextGrade: null, isTerminal: true };
    }
  }

  if (!chain) {
    return { nextGrade: null, isTerminal: true };
  }

  const idx = chain.indexOf(normGrade);
  if (idx === -1 || idx >= chain.length - 1) {
    return { nextGrade: null, isTerminal: true };
  }

  return { nextGrade: chain[idx + 1]!, isTerminal: false };
}

export function evaluateStudentForPromotion(
  student: StudentAdminSummary,
  mode: PromotionMode
): PromotionEvaluationResult {
  const effectiveCurr = normalizePromotionCurriculum(student.curriculum, student.gradeLevel);
  const normGrade = (student.gradeLevel || '').trim().toUpperCase();
  const hasTerms = curriculumSupportsTerms(student.curriculum, student.gradeLevel);
  const currentTerm: 'TERM_1' | 'TERM_2' | null = hasTerms
    ? (student.academicTerm === 'TERM_2' ? 'TERM_2' : 'TERM_1')
    : null;

  if (student.role && student.role !== 'STUDENT') {
    return {
      eligible: false,
      status: 'INELIGIBLE_NOT_STUDENT',
      isGraduating: false,
      hasTerms,
      currentCurriculum: effectiveCurr,
      currentGrade: normGrade,
      currentTerm,
      nextGrade: null,
      nextTerm: null,
      reasonAr: 'حساب ولي أمر',
      reasonEn: 'Parent Account'
    };
  }

  if (student.isArchived) {
    return {
      eligible: false,
      status: 'INELIGIBLE_ARCHIVED',
      isGraduating: false,
      hasTerms,
      currentCurriculum: effectiveCurr,
      currentGrade: normGrade,
      currentTerm,
      nextGrade: null,
      nextTerm: null,
      reasonAr: 'بالأرشيف بالفعل',
      reasonEn: 'Already Archived'
    };
  }

  if (student.isProfileCompleted === false || !effectiveCurr || !normGrade || normGrade === '—') {
    return {
      eligible: false,
      status: 'INELIGIBLE_INCOMPLETE_PROFILE',
      isGraduating: false,
      hasTerms,
      currentCurriculum: effectiveCurr,
      currentGrade: normGrade,
      currentTerm,
      nextGrade: null,
      nextTerm: null,
      reasonAr: 'بيانات غير مكتملة',
      reasonEn: 'Incomplete Profile'
    };
  }

  if (mode === 'TERM') {
    if (!hasTerms) {
      return {
        eligible: false,
        status: 'INELIGIBLE_NO_TERMS',
        isGraduating: false,
        hasTerms: false,
        currentCurriculum: effectiveCurr,
        currentGrade: normGrade,
        currentTerm: null,
        nextGrade: null,
        nextTerm: null,
        reasonAr: 'منهج بدون ترم (غير مؤهل)',
        reasonEn: 'Curriculum has no terms'
      };
    }

    if (currentTerm === 'TERM_2') {
      return {
        eligible: false,
        status: 'INELIGIBLE_ALREADY_TERM_2',
        isGraduating: false,
        hasTerms: true,
        currentCurriculum: effectiveCurr,
        currentGrade: normGrade,
        currentTerm: 'TERM_2',
        nextGrade: null,
        nextTerm: null,
        reasonAr: 'في الترم الثاني بالفعل',
        reasonEn: 'Already in Term 2'
      };
    }

    return {
      eligible: true,
      status: 'PROMOTABLE',
      isGraduating: false,
      hasTerms: true,
      currentCurriculum: effectiveCurr,
      currentGrade: normGrade,
      currentTerm: 'TERM_1',
      nextGrade: normGrade,
      nextTerm: 'TERM_2'
    };
  }

  const { nextGrade, isTerminal } = resolveNextGrade(student.curriculum, student.gradeLevel);
  if (isTerminal || !nextGrade) {
    return {
      eligible: true,
      status: 'GRADUATING',
      isGraduating: true,
      hasTerms,
      currentCurriculum: effectiveCurr,
      currentGrade: normGrade,
      currentTerm,
      nextGrade: null,
      nextTerm: null,
      reasonAr: 'تخرج (نهاية المرحلة)',
      reasonEn: 'Graduating (Final Grade)'
    };
  }

  return {
    eligible: true,
    status: 'PROMOTABLE',
    isGraduating: false,
    hasTerms,
    currentCurriculum: effectiveCurr,
    currentGrade: normGrade,
    currentTerm,
    nextGrade,
    nextTerm: hasTerms ? 'TERM_1' : null
  };
}

export function getCurriculumDisplayLabel(curriculumCode: string | null | undefined, gradeLevel: string | null | undefined, isArabic: boolean): string {
  const effective = normalizePromotionCurriculum(curriculumCode, gradeLevel);
  const found = findCurriculumByCode(effective);
  if (found) {
    return isArabic ? found.titleAr : found.titleEn;
  }
  return curriculumCode || '—';
}

export function getGradeDisplayLabel(
  curriculumCode: string | null | undefined,
  gradeCode: string | null | undefined,
  isArabic: boolean
): string {
  if (!gradeCode) return '—';
  const effective = normalizePromotionCurriculum(curriculumCode, gradeCode);
  const normGrade = gradeCode.trim().toUpperCase();

  const meta = findGradeByCode(effective, normGrade);
  if (meta) {
    return isArabic ? meta.shortLabelAr || meta.titleAr : meta.shortLabelEn || meta.titleEn;
  }

  for (const div of INTERNATIONAL_DIVISIONS_DATA) {
    const divGrade = div.grades.find((g) => g.code === normGrade);
    if (divGrade) {
      return isArabic ? divGrade.shortLabelAr || divGrade.titleAr : divGrade.shortLabelEn || divGrade.titleEn;
    }
  }

  if (normGrade === 'SAT_MATH') return isArabic ? 'Digital SAT Math' : 'SAT Math';
  if (normGrade === 'EST_MATH') return isArabic ? 'EST Math' : 'EST Math';
  if (normGrade === 'ACT_MATH') return isArabic ? 'ACT Math' : 'ACT Math';

  return gradeCode;
}

export function getTermDisplayLabel(
  curriculumCode: string | null | undefined,
  gradeLevel: string | null | undefined,
  term: string | null | undefined,
  isArabic: boolean
): string {
  if (!curriculumSupportsTerms(curriculumCode, gradeLevel)) {
    return isArabic ? 'بدون ترم' : 'No Term';
  }
  if (term === 'TERM_2') {
    return isArabic ? 'الترم الثاني' : 'Term 2';
  }
  return isArabic ? 'الترم الأول' : 'Term 1';
}
