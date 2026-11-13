import { AppIconName } from '../app-icon/app-icon.component';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 2: Teacher Virtual Math Keyboard Models
 */

export type MathKeyboardCategory = 'BASIC' | 'ALGEBRA' | 'GEOMETRY' | 'CALCULUS';

export type VisualTemplateType =
  | 'FRACTION'
  | 'SQRT'
  | 'NTH_ROOT'
  | 'POWER'
  | 'SUBSCRIPT'
  | 'INTEGRAL'
  | 'INDEFINITE_INTEGRAL'
  | 'LIMIT'
  | 'SUMMATION'
  | 'LOG'
  | 'LN'
  | 'ABS'
  | 'PARENS';

export interface IVisualSlot {
  id: string;
  labelAr: string;
  labelEn: string;
  placeholder: string;
  value: string;
}

export interface IVisualTemplate {
  type: VisualTemplateType;
  titleAr: string;
  titleEn: string;
  slots: IVisualSlot[];
  activeSlotIndex: number;
}

export interface IParsedMathSymbol {
  id: string;
  type: VisualTemplateType;
  titleAr: string;
  titleEn: string;
  startIndex: number;
  endIndex: number;
  rawLatex: string;
  displayPreview: string;
  template: IVisualTemplate;
}

export interface IMathSymbolKey {
  label: string; // KaTeX code to display on key or display symbol
  latex: string; // LaTeX code to insert
  cursorOffset?: number; // Cursor position offset from insertion end
  ariaLabel?: string;
  category: MathKeyboardCategory;
  templateType?: VisualTemplateType;
}

export interface INumericKey {
  label: string;
  value: string;
  ariaLabel?: string;
}

/**
 * Converts raw LaTeX commands to clean visual mathematical symbols
 * and strips raw LaTeX delimiters ($...$, $$...$$, \(...\), \[...\]),
 * ensuring no raw LaTeX syntax or delimiters are ever displayed as plain text in the UI.
 */
export function toVisualMath(text: string): string {
  if (!text) return '';
  return text
    .replace(/\$\$/g, '')
    .replace(/(?<!\\)\$/g, '')
    .replace(/\\\[/g, '')
    .replace(/\\\]/g, '')
    .replace(/\\\(/g, '')
    .replace(/\\\)/g, '')
    .replace(/\\le(?![a-zA-Z])/g, '≤')
    .replace(/\\leq(?![a-zA-Z])/g, '≤')
    .replace(/\\ge(?![a-zA-Z])/g, '≥')
    .replace(/\\geq(?![a-zA-Z])/g, '≥')
    .replace(/\\neq(?![a-zA-Z])/g, '≠')
    .replace(/\\ne(?![a-zA-Z])/g, '≠')
    .replace(/\\pm(?![a-zA-Z])/g, '±')
    .replace(/\\mp(?![a-zA-Z])/g, '∓')
    .replace(/\\times(?![a-zA-Z])/g, '×')
    .replace(/\\div(?![a-zA-Z])/g, '÷')
    .replace(/\\approx(?![a-zA-Z])/g, '≈')
    .replace(/\\infty(?![a-zA-Z])/g, '∞')
    .replace(/\\cdot(?![a-zA-Z])/g, '·')
    .replace(/\\in(?![a-zA-Z])/g, '∈')
    .replace(/\\notin(?![a-zA-Z])/g, '∉')
    .replace(/\\subset(?![a-zA-Z])/g, '⊂')
    .replace(/\\subseteq(?![a-zA-Z])/g, '⊆')
    .replace(/\\cup(?![a-zA-Z])/g, '∪')
    .replace(/\\cap(?![a-zA-Z])/g, '∩')
    .replace(/\\therefore(?![a-zA-Z])/g, '∴')
    .replace(/\\because(?![a-zA-Z])/g, '∵')
    .replace(/\\pi(?![a-zA-Z])/g, 'π')
    .replace(/\\theta(?![a-zA-Z])/g, 'θ')
    .replace(/\\alpha(?![a-zA-Z])/g, 'α')
    .replace(/\\beta(?![a-zA-Z])/g, 'β')
    .replace(/\\gamma(?![a-zA-Z])/g, 'γ')
    .replace(/\\Delta(?![a-zA-Z])/g, 'Δ')
    .replace(/\\delta(?![a-zA-Z])/g, 'δ')
    .replace(/\\lambda(?![a-zA-Z])/g, 'λ')
    .replace(/\\omega(?![a-zA-Z])/g, 'ω')
    .replace(/\\angle(?![a-zA-Z])/g, '∠')
    .replace(/\\perp(?![a-zA-Z])/g, '⊥')
    .replace(/\\parallel(?![a-zA-Z])/g, '∥')
    .replace(/\\triangle(?![a-zA-Z])/g, '△')
    .replace(/\\cong(?![a-zA-Z])/g, '≅')
    .replace(/\\sim(?![a-zA-Z])/g, '∼')
    .replace(/\\sin(?![a-zA-Z])/g, 'sin')
    .replace(/\\cos(?![a-zA-Z])/g, 'cos')
    .replace(/\\tan(?![a-zA-Z])/g, 'tan')
    .replace(/\\cot(?![a-zA-Z])/g, 'cot')
    .replace(/\\sec(?![a-zA-Z])/g, 'sec')
    .replace(/\\csc(?![a-zA-Z])/g, 'csc')
    .replace(/\\log(?![a-zA-Z])/g, 'log')
    .replace(/\\ln(?![a-zA-Z])/g, 'ln')
    .replace(/\\lim(?![a-zA-Z])/g, 'lim')
    .replace(/\\to(?![a-zA-Z])/g, '→')
    .replace(/\\rightarrow(?![a-zA-Z])/g, '→')
    .replace(/\\leftarrow(?![a-zA-Z])/g, '←')
    .replace(/\\int(?![a-zA-Z])/g, '∫')
    .replace(/\\iint(?![a-zA-Z])/g, '∬')
    .replace(/\\sum(?![a-zA-Z])/g, '∑')
    .replace(/\\prod(?![a-zA-Z])/g, '∏')
    .replace(/\\degree(?![a-zA-Z])/g, '°')
    .replace(/\^\{\\circ\}|\\circ(?![a-zA-Z])/g, '°')
    .replace(/\\%/g, '%')
    .replace(/\\sqrt\[([^\]]*)\]\{([^}]*)\}/g, '$1√$2')
    .replace(/\\sqrt\{([^}]*)\}/g, '√$1')
    .replace(/\\frac\{d\}\{dx\}/g, 'd/dx')
    .replace(/\\frac\{dy\}\{dx\}/g, 'dy/dx')
    .replace(/\\frac\{\\partial\}\{\\partial x\}/g, '∂/∂x')
    .replace(/\\frac\{1\}\{2\}/g, '½')
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1/$2)')
    .replace(/\\sum_\{([^{}]*)\}\^\{([^{}]*)\}\s*/g, '∑($1 to $2) ')
    .replace(/\\int_\{([^{}]*)\}\^\{([^{}]*)\}\s*/g, '∫($1 to $2) ')
    .replace(/\\lim_\{([^{}]*)\s*\\to\s*([^{}]*)\}\s*/g, 'lim($1→$2) ')
    .replace(/\\log_\{([^{}]*)\}\(([^)]*)\)/g, 'log_$1($2)')
    .replace(/\\ln\(([^)]*)\)/g, 'ln($1)')
    .replace(/\\,\s*dx/g, ' dx')
    .replace(/\^2\b|\^\{2\}/g, '²')
    .replace(/\^3\b|\^\{3\}/g, '³')
    .replace(/\^n\b|\^\{n\}/g, 'ⁿ');
}

/**
 * Strips raw LaTeX delimiters ($...$, $$...$$, \(...\), \[...\]) and formats math symbols
 * cleanly so that users never see raw code delimiters in the user interface.
 * Implemented as a direct alias to `toVisualMath` adhering strictly to DRY (RULES.md §1.1).
 */
export const stripLatexDelimiters = toVisualMath;

export function createVisualTemplate(type: VisualTemplateType): IVisualTemplate {
  switch (type) {
    case 'FRACTION':
      return {
        type: 'FRACTION',
        titleAr: 'تعديل الكسر',
        titleEn: 'Edit Fraction',
        slots: [
          { id: 'num', labelAr: 'البسط', labelEn: 'Numerator', placeholder: '3', value: '' },
          { id: 'den', labelAr: 'المقام', labelEn: 'Denominator', placeholder: '5', value: '' }
        ],
        activeSlotIndex: 0
      };
    case 'SQRT':
      return {
        type: 'SQRT',
        titleAr: 'تعديل الجذر التربيعي',
        titleEn: 'Edit Square Root',
        slots: [
          { id: 'radicand', labelAr: 'ما بداخل الجذر', labelEn: 'Radicand', placeholder: '16', value: '' }
        ],
        activeSlotIndex: 0
      };
    case 'NTH_ROOT':
      return {
        type: 'NTH_ROOT',
        titleAr: 'تعديل الجذر النوني',
        titleEn: 'Edit N-th Root',
        slots: [
          { id: 'degree', labelAr: 'دليل الجذر (n)', labelEn: 'Degree (n)', placeholder: '3', value: '' },
          { id: 'radicand', labelAr: 'ما بداخل الجذر', labelEn: 'Radicand', placeholder: '27', value: '' }
        ],
        activeSlotIndex: 0
      };
    case 'POWER':
      return {
        type: 'POWER',
        titleAr: 'تعديل الأس',
        titleEn: 'Edit Exponent',
        slots: [
          { id: 'base', labelAr: 'الأساس', labelEn: 'Base', placeholder: 'x', value: 'x' },
          { id: 'exp', labelAr: 'الأس', labelEn: 'Exponent', placeholder: '2', value: '2' }
        ],
        activeSlotIndex: 1
      };
    case 'SUBSCRIPT':
      return {
        type: 'SUBSCRIPT',
        titleAr: 'تعديل الدليل السفلي',
        titleEn: 'Edit Subscript',
        slots: [
          { id: 'base', labelAr: 'الرمز الأساسي', labelEn: 'Base', placeholder: 'x', value: 'x' },
          { id: 'sub', labelAr: 'الدليل السفلي', labelEn: 'Subscript', placeholder: '1', value: '1' }
        ],
        activeSlotIndex: 1
      };
    case 'INTEGRAL':
      return {
        type: 'INTEGRAL',
        titleAr: 'تعديل التكامل المحدد',
        titleEn: 'Edit Definite Integral',
        slots: [
          { id: 'lower', labelAr: 'الحد السفلي (a)', labelEn: 'Lower (a)', placeholder: '0', value: '0' },
          { id: 'upper', labelAr: 'الحد العلوي (b)', labelEn: 'Upper (b)', placeholder: '1', value: '1' },
          { id: 'expr', labelAr: 'الدالة f(x)', labelEn: 'Integrand', placeholder: 'x', value: 'x' }
        ],
        activeSlotIndex: 2
      };
    case 'INDEFINITE_INTEGRAL':
      return {
        type: 'INDEFINITE_INTEGRAL',
        titleAr: 'تعديل التكامل غير المحدد',
        titleEn: 'Edit Indefinite Integral',
        slots: [
          { id: 'expr', labelAr: 'الدالة المراد مكاملتها', labelEn: 'Integrand', placeholder: 'x', value: 'x' }
        ],
        activeSlotIndex: 0
      };
    case 'LIMIT':
      return {
        type: 'LIMIT',
        titleAr: 'تعديل النهاية',
        titleEn: 'Edit Limit',
        slots: [
          { id: 'to', labelAr: 'تقترب x من', labelEn: 'x approaches', placeholder: '0', value: '0' },
          { id: 'expr', labelAr: 'الدالة المراد دراستها', labelEn: 'Expression', placeholder: 'f(x)', value: '' }
        ],
        activeSlotIndex: 1
      };
    case 'SUMMATION':
      return {
        type: 'SUMMATION',
        titleAr: 'تعديل التجميع',
        titleEn: 'Edit Summation',
        slots: [
          { id: 'lower', labelAr: 'بداية التجميع', labelEn: 'Lower limit', placeholder: 'i=1', value: 'i=1' },
          { id: 'upper', labelAr: 'نهاية التجميع', labelEn: 'Upper limit', placeholder: 'n', value: 'n' },
          { id: 'expr', labelAr: 'المقدار المراد جمعه', labelEn: 'Expression', placeholder: 'i', value: 'i' }
        ],
        activeSlotIndex: 2
      };
    case 'LOG':
      return {
        type: 'LOG',
        titleAr: 'تعديل اللوغاريتم',
        titleEn: 'Edit Logarithm',
        slots: [
          { id: 'base', labelAr: 'أساس اللوغاريتم (a)', labelEn: 'Base (a)', placeholder: '10', value: '10' },
          { id: 'val', labelAr: 'العدد (b)', labelEn: 'Value (b)', placeholder: 'x', value: 'x' }
        ],
        activeSlotIndex: 1
      };
    case 'LN':
      return {
        type: 'LN',
        titleAr: 'تعديل اللوغاريتم (ln)',
        titleEn: 'Edit Natural Log',
        slots: [
          { id: 'val', labelAr: 'العدد (x)', labelEn: 'Value (x)', placeholder: 'x', value: 'x' }
        ],
        activeSlotIndex: 0
      };
    case 'ABS':
      return {
        type: 'ABS',
        titleAr: 'تعديل القيمة المطلقة',
        titleEn: 'Edit Absolute Value',
        slots: [
          { id: 'val', labelAr: 'ما بداخل المقياس', labelEn: 'Inside Value', placeholder: 'x', value: '' }
        ],
        activeSlotIndex: 0
      };
    case 'PARENS':
      return {
        type: 'PARENS',
        titleAr: 'تعديل الأقواس',
        titleEn: 'Edit Parentheses',
        slots: [
          { id: 'val', labelAr: 'ما بداخل القوسين', labelEn: 'Inside Parentheses', placeholder: 'x', value: '' }
        ],
        activeSlotIndex: 0
      };
  }
}

export function compileTemplateLatex(template: IVisualTemplate): string {
  const s = template.slots;
  switch (template.type) {
    case 'FRACTION': {
      const num = s[0]?.value.trim() || 'a';
      const den = s[1]?.value.trim() || 'b';
      return `\\frac{${num}}{${den}}`;
    }
    case 'SQRT': {
      const rad = s[0]?.value.trim() || 'x';
      return `\\sqrt{${rad}}`;
    }
    case 'NTH_ROOT': {
      const deg = s[0]?.value.trim() || 'n';
      const rad = s[1]?.value.trim() || 'x';
      return `\\sqrt[${deg}]{${rad}}`;
    }
    case 'POWER': {
      const base = s[0]?.value.trim() || 'x';
      const exp = s[1]?.value.trim() || '2';
      return `${base}^{${exp}}`;
    }
    case 'SUBSCRIPT': {
      const base = s[0]?.value.trim() || 'x';
      const sub = s[1]?.value.trim() || '1';
      return `${base}_{${sub}}`;
    }
    case 'INTEGRAL': {
      const a = s[0]?.value.trim() || '0';
      const b = s[1]?.value.trim() || '1';
      const expr = s[2]?.value.trim() || 'x';
      return `\\int_{${a}}^{${b}} ${expr} \\, dx`;
    }
    case 'INDEFINITE_INTEGRAL': {
      const expr = s[0]?.value.trim() || 'x';
      return `\\int ${expr} \\, dx`;
    }
    case 'LIMIT': {
      const to = s[0]?.value.trim() || '0';
      const expr = s[1]?.value.trim() || 'f(x)';
      return `\\lim_{x \\to ${to}} ${expr}`;
    }
    case 'SUMMATION': {
      const lower = s[0]?.value.trim() || 'i=1';
      const upper = s[1]?.value.trim() || 'n';
      const expr = s[2]?.value.trim() || 'i';
      return `\\sum_{${lower}}^{${upper}} ${expr}`;
    }
    case 'LOG': {
      const base = s[0]?.value.trim() || '10';
      const val = s[1]?.value.trim() || 'x';
      return `\\log_{${base}}(${val})`;
    }
    case 'LN': {
      const val = s[0]?.value.trim() || 'x';
      return `\\ln(${val})`;
    }
    case 'ABS': {
      const val = s[0]?.value.trim() || 'x';
      return `|${val}|`;
    }
    case 'PARENS': {
      const val = s[0]?.value.trim() || 'x';
      return `(${val})`;
    }
  }
}

export const NUMERIC_KEYPAD_KEYS: INumericKey[] = [
  { label: '1', value: '1', ariaLabel: 'Digit 1' },
  { label: '2', value: '2', ariaLabel: 'Digit 2' },
  { label: '3', value: '3', ariaLabel: 'Digit 3' },
  { label: '4', value: '4', ariaLabel: 'Digit 4' },
  { label: '5', value: '5', ariaLabel: 'Digit 5' },
  { label: '6', value: '6', ariaLabel: 'Digit 6' },
  { label: '7', value: '7', ariaLabel: 'Digit 7' },
  { label: '8', value: '8', ariaLabel: 'Digit 8' },
  { label: '9', value: '9', ariaLabel: 'Digit 9' },
  { label: '0', value: '0', ariaLabel: 'Digit 0' },
  { label: '.', value: '.', ariaLabel: 'Decimal point' },
  { label: ',', value: ',', ariaLabel: 'Comma' },
  { label: '+', value: '+', ariaLabel: 'Plus' },
  { label: '-', value: '-', ariaLabel: 'Minus' },
  { label: '=', value: '=', ariaLabel: 'Equals' }
];

export interface IMathCategoryTab {
  id: MathKeyboardCategory;
  titleAr: string;
  titleEn: string;
  icon: AppIconName;
}

export const MATH_CATEGORY_TABS: IMathCategoryTab[] = [
  { id: 'BASIC', titleAr: 'رموز وعمليات', titleEn: 'Basic & Ops', icon: 'calculator' },
  { id: 'ALGEBRA', titleAr: 'جبر وأسس وكسور', titleEn: 'Algebra & Roots', icon: 'hash' },
  { id: 'GEOMETRY', titleAr: 'هندسة وزوايا', titleEn: 'Geometry & Angles', icon: 'grid' },
  { id: 'CALCULUS', titleAr: 'تفاضل وتكامل', titleEn: 'Calculus & Limits', icon: 'activity' }
];

export const MATH_KEYBOARD_KEYS: IMathSymbolKey[] = [
  // --- BASIC & OPERATIONS ---
  { label: 'π', latex: 'π', category: 'BASIC', ariaLabel: 'Pi' },
  { label: 'θ', latex: 'θ', category: 'BASIC', ariaLabel: 'Theta' },
  { label: '±', latex: '±', category: 'BASIC', ariaLabel: 'Plus minus' },
  { label: '×', latex: '×', category: 'BASIC', ariaLabel: 'Multiply' },
  { label: '÷', latex: '÷', category: 'BASIC', ariaLabel: 'Divide' },
  { label: '≤', latex: '≤', category: 'BASIC', ariaLabel: 'Less than or equal' },
  { label: '≥', latex: '≥', category: 'BASIC', ariaLabel: 'Greater than or equal' },
  { label: '≠', latex: '≠', category: 'BASIC', ariaLabel: 'Not equal' },
  { label: '≈', latex: '≈', category: 'BASIC', ariaLabel: 'Approximately equal' },
  { label: '=', latex: '=', category: 'BASIC', ariaLabel: 'Equals' },
  { label: '+', latex: '+', category: 'BASIC', ariaLabel: 'Plus' },
  { label: '-', latex: '-', category: 'BASIC', ariaLabel: 'Minus' },
  { label: '·', latex: '·', category: 'BASIC', ariaLabel: 'Dot product' },
  { label: '∞', latex: '∞', category: 'BASIC', ariaLabel: 'Infinity' },
  { label: '∈', latex: '∈', category: 'BASIC', ariaLabel: 'Element of' },
  { label: '∉', latex: '∉', category: 'BASIC', ariaLabel: 'Not element of' },
  { label: '⊂', latex: '⊂', category: 'BASIC', ariaLabel: 'Subset' },
  { label: '∪', latex: '∪', category: 'BASIC', ariaLabel: 'Union' },
  { label: '∩', latex: '∩', category: 'BASIC', ariaLabel: 'Intersection' },
  { label: '%', latex: '%', category: 'BASIC', ariaLabel: 'Percent' },
  { label: '°', latex: '°', category: 'BASIC', ariaLabel: 'Degree' },
  { label: '√', latex: '√', templateType: 'SQRT', category: 'BASIC', ariaLabel: 'Square root' },
  { label: '∴', latex: '∴', category: 'BASIC', ariaLabel: 'Therefore' },
  { label: '∵', latex: '∵', category: 'BASIC', ariaLabel: 'Because' },

  // --- ALGEBRA & FRACTIONS ---
  { label: '½', latex: '½', category: 'ALGEBRA', ariaLabel: 'Fraction half' },
  { label: 'a/b', latex: '\\frac{a}{b}', templateType: 'FRACTION', category: 'ALGEBRA', ariaLabel: 'Fraction' },
  { label: '√x', latex: '√x', templateType: 'SQRT', category: 'ALGEBRA', ariaLabel: 'Square root of x' },
  { label: 'ⁿ√x', latex: 'ⁿ√x', templateType: 'NTH_ROOT', category: 'ALGEBRA', ariaLabel: 'Nth root' },
  { label: 'x²', latex: 'x²', category: 'ALGEBRA', ariaLabel: 'x squared' },
  { label: 'x³', latex: 'x³', category: 'ALGEBRA', ariaLabel: 'x cubed' },
  { label: 'xⁿ', latex: 'xⁿ', category: 'ALGEBRA', ariaLabel: 'x power n' },
  { label: '|x|', latex: '|x|', templateType: 'ABS', category: 'ALGEBRA', ariaLabel: 'Absolute value' },
  { label: 'log', latex: 'log()', templateType: 'LOG', category: 'ALGEBRA', ariaLabel: 'Logarithm' },
  { label: 'ln', latex: 'ln()', templateType: 'LN', category: 'ALGEBRA', ariaLabel: 'Natural log' },
  { label: '(x)', latex: '(x)', templateType: 'PARENS', category: 'ALGEBRA', ariaLabel: 'Parentheses' },
  { label: '[x]', latex: '[x]', category: 'ALGEBRA', ariaLabel: 'Square brackets' },
  { label: '{x}', latex: '{x}', category: 'ALGEBRA', ariaLabel: 'Braces' },
  { label: 'f(x)', latex: 'f(x)', category: 'ALGEBRA', ariaLabel: 'Function f of x' },
  { label: 'g(x)', latex: 'g(x)', category: 'ALGEBRA', ariaLabel: 'Function g of x' },
  { label: 'x', latex: 'x', category: 'ALGEBRA', ariaLabel: 'Variable x' },
  { label: 'y', latex: 'y', category: 'ALGEBRA', ariaLabel: 'Variable y' },
  { label: 'z', latex: 'z', category: 'ALGEBRA', ariaLabel: 'Variable z' },
  { label: 'a', latex: 'a', category: 'ALGEBRA', ariaLabel: 'Variable a' },
  { label: 'b', latex: 'b', category: 'ALGEBRA', ariaLabel: 'Variable b' },
  { label: 'c', latex: 'c', category: 'ALGEBRA', ariaLabel: 'Variable c' },
  { label: 'n', latex: 'n', category: 'ALGEBRA', ariaLabel: 'Variable n' },
  { label: '²', latex: '²', category: 'ALGEBRA', ariaLabel: 'Superscript 2' },
  { label: '³', latex: '³', category: 'ALGEBRA', ariaLabel: 'Superscript 3' },
  { label: 'ⁿ', latex: 'ⁿ', category: 'ALGEBRA', ariaLabel: 'Superscript n' },

  // --- GEOMETRY & ANGLES ---
  { label: '△', latex: '△', category: 'GEOMETRY', ariaLabel: 'Triangle' },
  { label: '∠', latex: '∠', category: 'GEOMETRY', ariaLabel: 'Angle' },
  { label: '⊥', latex: '⊥', category: 'GEOMETRY', ariaLabel: 'Perpendicular' },
  { label: '∥', latex: '∥', category: 'GEOMETRY', ariaLabel: 'Parallel' },
  { label: '°', latex: '°', category: 'GEOMETRY', ariaLabel: 'Degree' },
  { label: 'sin', latex: 'sin()', category: 'GEOMETRY', ariaLabel: 'Sine' },
  { label: 'cos', latex: 'cos()', category: 'GEOMETRY', ariaLabel: 'Cosine' },
  { label: 'tan', latex: 'tan()', category: 'GEOMETRY', ariaLabel: 'Tangent' },
  { label: 'cot', latex: 'cot()', category: 'GEOMETRY', ariaLabel: 'Cotangent' },
  { label: 'sec', latex: 'sec()', category: 'GEOMETRY', ariaLabel: 'Secant' },
  { label: 'csc', latex: 'csc()', category: 'GEOMETRY', ariaLabel: 'Cosecant' },
  { label: 'α', latex: 'α', category: 'GEOMETRY', ariaLabel: 'Alpha' },
  { label: 'β', latex: 'β', category: 'GEOMETRY', ariaLabel: 'Beta' },
  { label: 'γ', latex: 'γ', category: 'GEOMETRY', ariaLabel: 'Gamma' },
  { label: 'Δ', latex: 'Δ', category: 'GEOMETRY', ariaLabel: 'Delta' },
  { label: '≅', latex: '≅', category: 'GEOMETRY', ariaLabel: 'Congruent' },
  { label: '∼', latex: '∼', category: 'GEOMETRY', ariaLabel: 'Similar' },
  { label: 'λ', latex: 'λ', category: 'GEOMETRY', ariaLabel: 'Lambda' },
  { label: 'ω', latex: 'ω', category: 'GEOMETRY', ariaLabel: 'Omega' },

  // --- CALCULUS & LIMITS ---
  { label: '∫', latex: '∫', category: 'CALCULUS', ariaLabel: 'Indefinite integral' },
  { label: '∬', latex: '∬', category: 'CALCULUS', ariaLabel: 'Double integral' },
  { label: 'd/dx', latex: 'd/dx', category: 'CALCULUS', ariaLabel: 'Derivative d/dx' },
  { label: 'dy/dx', latex: 'dy/dx', category: 'CALCULUS', ariaLabel: 'Derivative dy/dx' },
  { label: '∂/∂x', latex: '∂/∂x', category: 'CALCULUS', ariaLabel: 'Partial derivative' },
  { label: '∑', latex: '∑', category: 'CALCULUS', ariaLabel: 'Summation' },
  { label: '∏', latex: '∏', category: 'CALCULUS', ariaLabel: 'Product' },
  { label: 'lim', latex: 'lim', category: 'CALCULUS', ariaLabel: 'Limit' },
  { label: "f'(x)", latex: "f'(x)", category: 'CALCULUS', ariaLabel: 'First derivative' },
  { label: 'dx', latex: 'dx', category: 'CALCULUS', ariaLabel: 'dx differential' },
  { label: 'dy', latex: 'dy', category: 'CALCULUS', ariaLabel: 'dy differential' },
  { label: '→', latex: '→', category: 'CALCULUS', ariaLabel: 'Approaches arrow' }
];

/**
 * Parses all composite mathematical symbols present in text (fractions, roots, powers, integrals, etc.)
 * so the teacher can edit them directly on screen through the visual math keyboard.
 */
export function parseMathSymbolsFromText(text: string): IParsedMathSymbol[] {
  if (!text) return [];

  const candidates: IParsedMathSymbol[] = [];

  // 1. Fractions: \frac{num}{den}
  const fracRegex = /\\frac\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = fracRegex.exec(text)) !== null) {
    const raw = match[0];
    const num = match[1];
    const den = match[2];
    candidates.push({
      id: `sym_frac_${match.index}`,
      type: 'FRACTION',
      titleAr: 'كسر اعتيادي',
      titleEn: 'Fraction',
      startIndex: match.index,
      endIndex: match.index + raw.length,
      rawLatex: raw,
      displayPreview: toVisualMath(raw),
      template: {
        type: 'FRACTION',
        titleAr: 'تعديل الكسر',
        titleEn: 'Edit Fraction',
        slots: [
          { id: 'num', labelAr: 'البسط', labelEn: 'Numerator', placeholder: '3', value: num },
          { id: 'den', labelAr: 'المقام', labelEn: 'Denominator', placeholder: '5', value: den }
        ],
        activeSlotIndex: 0
      }
    });
  }

  // 1b. Visual Fractions: (num/den)
  const visualFracRegex = /\(([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)\)/g;
  while ((match = visualFracRegex.exec(text)) !== null) {
    const raw = match[0];
    const num = match[1];
    const den = match[2];
    candidates.push({
      id: `sym_vfrac_${match.index}`,
      type: 'FRACTION',
      titleAr: 'كسر اعتيادي',
      titleEn: 'Fraction',
      startIndex: match.index,
      endIndex: match.index + raw.length,
      rawLatex: `\\frac{${num}}{${den}}`,
      displayPreview: raw,
      template: {
        type: 'FRACTION',
        titleAr: 'تعديل الكسر',
        titleEn: 'Edit Fraction',
        slots: [
          { id: 'num', labelAr: 'البسط', labelEn: 'Numerator', placeholder: '3', value: num },
          { id: 'den', labelAr: 'المقام', labelEn: 'Denominator', placeholder: '5', value: den }
        ],
        activeSlotIndex: 0
      }
    });
  }

  // 2. Nth Root: \sqrt[deg]{rad}
  const nthRootRegex = /\\sqrt\[([^\]]*)\]\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
  while ((match = nthRootRegex.exec(text)) !== null) {
    const raw = match[0];
    const deg = match[1];
    const rad = match[2];
    candidates.push({
      id: `sym_nth_${match.index}`,
      type: 'NTH_ROOT',
      titleAr: 'جذر نوني',
      titleEn: 'N-th Root',
      startIndex: match.index,
      endIndex: match.index + raw.length,
      rawLatex: raw,
      displayPreview: toVisualMath(raw),
      template: {
        type: 'NTH_ROOT',
        titleAr: 'تعديل الجذر النوني',
        titleEn: 'Edit N-th Root',
        slots: [
          { id: 'degree', labelAr: 'دليل الجذر (n)', labelEn: 'Degree (n)', placeholder: '3', value: deg },
          { id: 'radicand', labelAr: 'ما بداخل الجذر', labelEn: 'Radicand', placeholder: '27', value: rad }
        ],
        activeSlotIndex: 0
      }
    });
  }

  // 2b. Visual Nth Root: deg√rad
  const visualNthRootRegex = /([0-9a-zA-Z]+)√([0-9a-zA-Z]+)/g;
  while ((match = visualNthRootRegex.exec(text)) !== null) {
    const raw = match[0];
    const deg = match[1];
    const rad = match[2];
    candidates.push({
      id: `sym_vnth_${match.index}`,
      type: 'NTH_ROOT',
      titleAr: 'جذر نوني',
      titleEn: 'N-th Root',
      startIndex: match.index,
      endIndex: match.index + raw.length,
      rawLatex: `\\sqrt[${deg}]{${rad}}`,
      displayPreview: raw,
      template: {
        type: 'NTH_ROOT',
        titleAr: 'تعديل الجذر النوني',
        titleEn: 'Edit N-th Root',
        slots: [
          { id: 'degree', labelAr: 'دليل الجذر (n)', labelEn: 'Degree (n)', placeholder: '3', value: deg },
          { id: 'radicand', labelAr: 'ما بداخل الجذر', labelEn: 'Radicand', placeholder: '27', value: rad }
        ],
        activeSlotIndex: 0
      }
    });
  }

  // 3. Square Root: \sqrt{rad} (must not be part of \sqrt[)
  const sqrtRegex = /(?<!\\sqrt\[[^\]]*\])\\sqrt\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
  while ((match = sqrtRegex.exec(text)) !== null) {
    const raw = match[0];
    const rad = match[1];
    candidates.push({
      id: `sym_sqrt_${match.index}`,
      type: 'SQRT',
      titleAr: 'جذر تربيعي',
      titleEn: 'Square Root',
      startIndex: match.index,
      endIndex: match.index + raw.length,
      rawLatex: raw,
      displayPreview: toVisualMath(raw),
      template: {
        type: 'SQRT',
        titleAr: 'تعديل الجذر التربيعي',
        titleEn: 'Edit Square Root',
        slots: [
          { id: 'radicand', labelAr: 'ما بداخل الجذر', labelEn: 'Radicand', placeholder: '16', value: rad }
        ],
        activeSlotIndex: 0
      }
    });
  }

  // 3b. Visual Square Root: √rad (excluding if preceded by deg in deg√rad)
  const visualSqrtRegex = /(?<![0-9a-zA-Z])√([a-zA-Z0-9]+)/g;
  while ((match = visualSqrtRegex.exec(text)) !== null) {
    const raw = match[0];
    const rad = match[1];
    candidates.push({
      id: `sym_vsqrt_${match.index}`,
      type: 'SQRT',
      titleAr: 'جذر تربيعي',
      titleEn: 'Square Root',
      startIndex: match.index,
      endIndex: match.index + raw.length,
      rawLatex: `\\sqrt{${rad}}`,
      displayPreview: raw,
      template: {
        type: 'SQRT',
        titleAr: 'تعديل الجذر التربيعي',
        titleEn: 'Edit Square Root',
        slots: [
          { id: 'radicand', labelAr: 'ما بداخل الجذر', labelEn: 'Radicand', placeholder: '16', value: rad }
        ],
        activeSlotIndex: 0
      }
    });
  }

  // 4. Summation: \sum_{lower}^{upper} expr
  const sumRegex = /\\sum_\{([^{}]*)\}\^\{([^{}]*)\}(?:\s*([^\s$+\-=]+|\S+))?/g;
  while ((match = sumRegex.exec(text)) !== null) {
    const raw = match[0];
    const lower = match[1];
    const upper = match[2];
    const expr = match[3] || 'i';
    candidates.push({
      id: `sym_sum_${match.index}`,
      type: 'SUMMATION',
      titleAr: 'رمز التجميع (سيجما)',
      titleEn: 'Summation',
      startIndex: match.index,
      endIndex: match.index + raw.length,
      rawLatex: raw,
      displayPreview: toVisualMath(raw),
      template: {
        type: 'SUMMATION',
        titleAr: 'تعديل التجميع',
        titleEn: 'Edit Summation',
        slots: [
          { id: 'lower', labelAr: 'بداية التجميع', labelEn: 'Lower limit', placeholder: 'i=1', value: lower },
          { id: 'upper', labelAr: 'نهاية التجميع', labelEn: 'Upper limit', placeholder: 'n', value: upper },
          { id: 'expr', labelAr: 'المقدار المراد جمعه', labelEn: 'Expression', placeholder: 'i', value: expr }
        ],
        activeSlotIndex: 2
      }
    });
  }

  // 5. Definite Integral: \int_{a}^{b} expr \, dx
  const defIntRegex = /\\int_\{([^{}]*)\}\^\{([^{}]*)\}(?:\s*(.*?)(?:\\,\s*dx|\s+dx|(?=\\int|\\sum|\$|\n|$)))?/g;
  while ((match = defIntRegex.exec(text)) !== null) {
    const raw = match[0];
    const a = match[1];
    const b = match[2];
    const expr = (match[3] || 'x').trim();
    candidates.push({
      id: `sym_defint_${match.index}`,
      type: 'INTEGRAL',
      titleAr: 'تكامل محدد',
      titleEn: 'Definite Integral',
      startIndex: match.index,
      endIndex: match.index + raw.length,
      rawLatex: raw,
      displayPreview: toVisualMath(raw),
      template: {
        type: 'INTEGRAL',
        titleAr: 'تعديل التكامل المحدد',
        titleEn: 'Edit Definite Integral',
        slots: [
          { id: 'lower', labelAr: 'الحد السفلي (a)', labelEn: 'Lower (a)', placeholder: '0', value: a },
          { id: 'upper', labelAr: 'الحد العلوي (b)', labelEn: 'Upper (b)', placeholder: '1', value: b },
          { id: 'expr', labelAr: 'الدالة f(x)', labelEn: 'Integrand', placeholder: 'x', value: expr }
        ],
        activeSlotIndex: 2
      }
    });
  }

  // 6. Indefinite Integral: \int expr \, dx (must not have _ or ^ immediately following)
  const indefIntRegex = /(?<!\\int_[^{}]*\^[^{}]*)\\int(?!_[^{}]*\^[^{}]*)(?:\s*(.*?)(?:\\,\s*dx|\s+dx|(?=\\int|\\sum|\$|\n|$)))/g;
  while ((match = indefIntRegex.exec(text)) !== null) {
    const raw = match[0];
    const expr = (match[1] || 'x').trim();
    candidates.push({
      id: `sym_indefint_${match.index}`,
      type: 'INDEFINITE_INTEGRAL',
      titleAr: 'تكامل غير محدد',
      titleEn: 'Indefinite Integral',
      startIndex: match.index,
      endIndex: match.index + raw.length,
      rawLatex: raw,
      displayPreview: toVisualMath(raw),
      template: {
        type: 'INDEFINITE_INTEGRAL',
        titleAr: 'تعديل التكامل غير المحدد',
        titleEn: 'Edit Indefinite Integral',
        slots: [
          { id: 'expr', labelAr: 'الدالة المراد مكاملتها', labelEn: 'Integrand', placeholder: 'x', value: expr }
        ],
        activeSlotIndex: 0
      }
    });
  }

  // 7. Limit: \lim_{x \to val} expr
  const limRegex = /\\lim_\{\s*(?:x\s*\\to\s*)?([^{}]*)\}(?:\s*(.*?)(?=\s*\$|\n|$|\\lim|\\int|\\sum))?/g;
  while ((match = limRegex.exec(text)) !== null) {
    const raw = match[0];
    const toVal = match[1];
    const expr = (match[2] || 'f(x)').trim();
    candidates.push({
      id: `sym_lim_${match.index}`,
      type: 'LIMIT',
      titleAr: 'نهاية رياضية (lim)',
      titleEn: 'Limit (lim)',
      startIndex: match.index,
      endIndex: match.index + raw.length,
      rawLatex: raw,
      displayPreview: toVisualMath(raw),
      template: {
        type: 'LIMIT',
        titleAr: 'تعديل النهاية',
        titleEn: 'Edit Limit',
        slots: [
          { id: 'to', labelAr: 'تقترب x من', labelEn: 'x approaches', placeholder: '0', value: toVal },
          { id: 'expr', labelAr: 'الدالة المراد دراستها', labelEn: 'Expression', placeholder: 'f(x)', value: expr }
        ],
        activeSlotIndex: 1
      }
    });
  }

  // 8. Logarithm: \log_{base}(val)
  const logRegex = /\\log_\{([^{}]*)\}\(([^\)]*)\)/g;
  while ((match = logRegex.exec(text)) !== null) {
    const raw = match[0];
    const base = match[1];
    const val = match[2];
    candidates.push({
      id: `sym_log_${match.index}`,
      type: 'LOG',
      titleAr: 'لوغاريتم',
      titleEn: 'Logarithm',
      startIndex: match.index,
      endIndex: match.index + raw.length,
      rawLatex: raw,
      displayPreview: toVisualMath(raw),
      template: {
        type: 'LOG',
        titleAr: 'تعديل اللوغاريتم',
        titleEn: 'Edit Logarithm',
        slots: [
          { id: 'base', labelAr: 'أساس اللوغاريتم (a)', labelEn: 'Base (a)', placeholder: '10', value: base },
          { id: 'val', labelAr: 'العدد (b)', labelEn: 'Value (b)', placeholder: 'x', value: val }
        ],
        activeSlotIndex: 1
      }
    });
  }

  // 9. Natural Log: \ln(val)
  const lnRegex = /\\ln\(([^\)]*)\)/g;
  while ((match = lnRegex.exec(text)) !== null) {
    const raw = match[0];
    const val = match[1];
    candidates.push({
      id: `sym_ln_${match.index}`,
      type: 'LN',
      titleAr: 'لوغاريتم طبيعي (ln)',
      titleEn: 'Natural Log (ln)',
      startIndex: match.index,
      endIndex: match.index + raw.length,
      rawLatex: raw,
      displayPreview: toVisualMath(raw),
      template: {
        type: 'LN',
        titleAr: 'تعديل اللوغاريتم (ln)',
        titleEn: 'Edit Natural Log',
        slots: [
          { id: 'val', labelAr: 'العدد (x)', labelEn: 'Value (x)', placeholder: 'x', value: val }
        ],
        activeSlotIndex: 0
      }
    });
  }

  // 10. Power: base^{exp} or base^digit (excluding if preceded by \int or \sum)
  const powRegex = /(?<!\\(?:int|sum)[^{}]*)(\b[a-zA-Z0-9\)]+)\^\{([^{}]*)\}|(?<!\\(?:int|sum)[^{}]*)(\b[a-zA-Z0-9\)]+)\^([0-9a-zA-Z])/g;
  while ((match = powRegex.exec(text)) !== null) {
    const raw = match[0];
    const base = match[1] || match[3];
    const exp = match[2] || match[4];
    candidates.push({
      id: `sym_pow_${match.index}`,
      type: 'POWER',
      titleAr: 'أس وقوة',
      titleEn: 'Power',
      startIndex: match.index,
      endIndex: match.index + raw.length,
      rawLatex: raw,
      displayPreview: toVisualMath(raw),
      template: {
        type: 'POWER',
        titleAr: 'تعديل الأس',
        titleEn: 'Edit Power Directly',
        slots: [
          { id: 'base', labelAr: 'الأساس', labelEn: 'Base', placeholder: 'x', value: base },
          { id: 'exp', labelAr: 'الأس', labelEn: 'Exponent', placeholder: '2', value: exp }
        ],
        activeSlotIndex: 1
      }
    });
  }

  // 10b. Visual Power: base[²³ⁿ]
  const visualPowRegex = /([a-zA-Z0-9]+)([²³ⁿ])/g;
  while ((match = visualPowRegex.exec(text)) !== null) {
    const raw = match[0];
    const base = match[1];
    const expChar = match[2];
    const exp = expChar === '²' ? '2' : expChar === '³' ? '3' : 'n';
    candidates.push({
      id: `sym_vpow_${match.index}`,
      type: 'POWER',
      titleAr: 'أس وقوة',
      titleEn: 'Power',
      startIndex: match.index,
      endIndex: match.index + raw.length,
      rawLatex: `${base}^{${exp}}`,
      displayPreview: raw,
      template: {
        type: 'POWER',
        titleAr: 'تعديل الأس',
        titleEn: 'Edit Power Directly',
        slots: [
          { id: 'base', labelAr: 'الأساس', labelEn: 'Base', placeholder: 'x', value: base },
          { id: 'exp', labelAr: 'الأس', labelEn: 'Exponent', placeholder: '2', value: exp }
        ],
        activeSlotIndex: 1
      }
    });
  }

  // 11. Subscript: base_{sub} or base_digit (excluding if preceded by \int, \sum, \lim, \log)
  const subRegex = /(?<!\\(?:int|sum|lim|log)[^{}]*)(\b[a-zA-Z0-9\)]+)_\{([^{}]*)\}|(?<!\\(?:int|sum|lim|log)[^{}]*)(\b[a-zA-Z0-9\)]+)_([0-9a-zA-Z])/g;
  while ((match = subRegex.exec(text)) !== null) {
    const raw = match[0];
    const base = match[1] || match[3];
    const sub = match[2] || match[4];
    candidates.push({
      id: `sym_sub_${match.index}`,
      type: 'SUBSCRIPT',
      titleAr: 'دليل سفلي',
      titleEn: 'Subscript',
      startIndex: match.index,
      endIndex: match.index + raw.length,
      rawLatex: raw,
      displayPreview: toVisualMath(raw),
      template: {
        type: 'SUBSCRIPT',
        titleAr: 'تعديل الدليل السفلي',
        titleEn: 'Edit Subscript',
        slots: [
          { id: 'base', labelAr: 'الرمز الأساسي', labelEn: 'Base', placeholder: 'x', value: base },
          { id: 'sub', labelAr: 'الدليل السفلي', labelEn: 'Subscript', placeholder: '1', value: sub }
        ],
        activeSlotIndex: 1
      }
    });
  }

  // 12. Absolute Value: |val|
  const absRegex = /\|([^|\n]+)\|/g;
  while ((match = absRegex.exec(text)) !== null) {
    const raw = match[0];
    const val = match[1];
    candidates.push({
      id: `sym_abs_${match.index}`,
      type: 'ABS',
      titleAr: 'مقياس / قيمة مطلقة',
      titleEn: 'Absolute Value',
      startIndex: match.index,
      endIndex: match.index + raw.length,
      rawLatex: raw,
      displayPreview: toVisualMath(raw),
      template: {
        type: 'ABS',
        titleAr: 'تعديل القيمة المطلقة',
        titleEn: 'Edit Absolute Value',
        slots: [
          { id: 'val', labelAr: 'ما بداخل المقياس', labelEn: 'Inside Value', placeholder: 'x', value: val }
        ],
        activeSlotIndex: 0
      }
    });
  }

  // 13. Parentheses: (val) (only if inside contains math characters)
  const parensRegex = /\(([^()\n]*[+\-*\/=\\^_{}≤≥≠±×÷√][^()\n]*)\)/g;
  while ((match = parensRegex.exec(text)) !== null) {
    const raw = match[0];
    const val = match[1];
    candidates.push({
      id: `sym_parens_${match.index}`,
      type: 'PARENS',
      titleAr: 'أقواس دائرية',
      titleEn: 'Parentheses',
      startIndex: match.index,
      endIndex: match.index + raw.length,
      rawLatex: raw,
      displayPreview: toVisualMath(raw),
      template: {
        type: 'PARENS',
        titleAr: 'تعديل الأقواس',
        titleEn: 'Edit Parentheses',
        slots: [
          { id: 'val', labelAr: 'ما بداخل القوسين', labelEn: 'Inside Parentheses', placeholder: 'x', value: val }
        ],
        activeSlotIndex: 0
      }
    });
  }

  // Deduplicate and filter out any candidates that overlap with an already-accepted higher-priority candidate
  const nonOverlapping: IParsedMathSymbol[] = [];
  for (const c of candidates) {
    const overlaps = nonOverlapping.some(
      (existing) => c.startIndex < existing.endIndex && c.endIndex > existing.startIndex
    );
    if (!overlaps) {
      nonOverlapping.push(c);
    }
  }

  // Sort by start position
  return nonOverlapping.sort((a, b) => a.startIndex - b.startIndex);
}

/**
 * Finds the parsed math symbol covering the given cursor position.
 * Returns null if cursor is not inside any parsed composite symbol.
 */
export function findSymbolAtCursor(symbols: IParsedMathSymbol[], cursorPos: number): IParsedMathSymbol | null {
  if (!symbols || symbols.length === 0) return null;
  return symbols.find((s) => cursorPos >= s.startIndex && cursorPos <= s.endIndex) || null;
}
