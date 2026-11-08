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

export function createVisualTemplate(type: VisualTemplateType): IVisualTemplate {
  switch (type) {
    case 'FRACTION':
      return {
        type: 'FRACTION',
        titleAr: 'تعديل الكسر الرياضي مباشرة',
        titleEn: 'Edit Fraction Directly',
        slots: [
          { id: 'num', labelAr: 'البسط', labelEn: 'Numerator', placeholder: '3', value: '' },
          { id: 'den', labelAr: 'المقام', labelEn: 'Denominator', placeholder: '5', value: '' }
        ],
        activeSlotIndex: 0
      };
    case 'SQRT':
      return {
        type: 'SQRT',
        titleAr: 'تعديل الجذر التربيعي مباشرة',
        titleEn: 'Edit Square Root Directly',
        slots: [
          { id: 'radicand', labelAr: 'ما بداخل الجذر', labelEn: 'Radicand', placeholder: '16', value: '' }
        ],
        activeSlotIndex: 0
      };
    case 'NTH_ROOT':
      return {
        type: 'NTH_ROOT',
        titleAr: 'تعديل الجذر النوني مباشرة',
        titleEn: 'Edit N-th Root Directly',
        slots: [
          { id: 'degree', labelAr: 'دليل الجذر (n)', labelEn: 'Root Index (n)', placeholder: '3', value: '' },
          { id: 'radicand', labelAr: 'ما بداخل الجذر', labelEn: 'Radicand', placeholder: '27', value: '' }
        ],
        activeSlotIndex: 0
      };
    case 'POWER':
      return {
        type: 'POWER',
        titleAr: 'تعديل الأس مباشرة',
        titleEn: 'Edit Power Directly',
        slots: [
          { id: 'base', labelAr: 'الأساس', labelEn: 'Base', placeholder: 'x', value: 'x' },
          { id: 'exp', labelAr: 'الأس', labelEn: 'Exponent', placeholder: '2', value: '2' }
        ],
        activeSlotIndex: 1
      };
    case 'SUBSCRIPT':
      return {
        type: 'SUBSCRIPT',
        titleAr: 'تعديل الدليل السفلي مباشرة',
        titleEn: 'Edit Subscript Directly',
        slots: [
          { id: 'base', labelAr: 'المتغير', labelEn: 'Base Symbol', placeholder: 'x', value: 'x' },
          { id: 'sub', labelAr: 'الدليل السفلي', labelEn: 'Subscript', placeholder: '1', value: '1' }
        ],
        activeSlotIndex: 1
      };
    case 'INTEGRAL':
      return {
        type: 'INTEGRAL',
        titleAr: 'تعديل التكامل المحدد مباشرة',
        titleEn: 'Edit Definite Integral Directly',
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
        titleAr: 'تعديل التكامل غير المحدد مباشرة',
        titleEn: 'Edit Indefinite Integral Directly',
        slots: [
          { id: 'expr', labelAr: 'الدالة f(x)', labelEn: 'Integrand', placeholder: 'x', value: 'x' }
        ],
        activeSlotIndex: 0
      };
    case 'LIMIT':
      return {
        type: 'LIMIT',
        titleAr: 'تعديل النهاية مباشرة',
        titleEn: 'Edit Limit Directly',
        slots: [
          { id: 'to', labelAr: 'تقترب x من', labelEn: 'x approaches', placeholder: '0', value: '0' },
          { id: 'expr', labelAr: 'الدالة المراد دراستها', labelEn: 'Expression', placeholder: 'f(x)', value: '' }
        ],
        activeSlotIndex: 1
      };
    case 'SUMMATION':
      return {
        type: 'SUMMATION',
        titleAr: 'تعديل رمز التجميع (سيجما)',
        titleEn: 'Edit Summation Directly',
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
        titleAr: 'تعديل اللوغاريتم مباشرة',
        titleEn: 'Edit Logarithm Directly',
        slots: [
          { id: 'base', labelAr: 'أساس اللوغاريتم (a)', labelEn: 'Base (a)', placeholder: '10', value: '10' },
          { id: 'val', labelAr: 'العدد (b)', labelEn: 'Value (b)', placeholder: 'x', value: 'x' }
        ],
        activeSlotIndex: 1
      };
    case 'LN':
      return {
        type: 'LN',
        titleAr: 'تعديل اللوغاريتم الطبيعي (ln)',
        titleEn: 'Edit Natural Log Directly',
        slots: [
          { id: 'val', labelAr: 'العدد (x)', labelEn: 'Value (x)', placeholder: 'x', value: 'x' }
        ],
        activeSlotIndex: 0
      };
    case 'ABS':
      return {
        type: 'ABS',
        titleAr: 'تعديل القيمة المطلقة / المقياس',
        titleEn: 'Edit Absolute Value Directly',
        slots: [
          { id: 'val', labelAr: 'ما بداخل المقياس', labelEn: 'Inside Value', placeholder: 'x', value: '' }
        ],
        activeSlotIndex: 0
      };
    case 'PARENS':
      return {
        type: 'PARENS',
        titleAr: 'تعديل ما بداخل القوسين',
        titleEn: 'Edit Parentheses Directly',
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
  { label: '\\pi', latex: '\\pi', category: 'BASIC', ariaLabel: 'Pi' },
  { label: '\\theta', latex: '\\theta', category: 'BASIC', ariaLabel: 'Theta' },
  { label: '\\pm', latex: '\\pm', category: 'BASIC', ariaLabel: 'Plus minus' },
  { label: '\\times', latex: '\\times', category: 'BASIC', ariaLabel: 'Multiply' },
  { label: '\\div', latex: '\\div', category: 'BASIC', ariaLabel: 'Divide' },
  { label: '\\le', latex: '\\le', category: 'BASIC', ariaLabel: 'Less than or equal' },
  { label: '\\ge', latex: '\\ge', category: 'BASIC', ariaLabel: 'Greater than or equal' },
  { label: '\\neq', latex: '\\neq', category: 'BASIC', ariaLabel: 'Not equal' },
  { label: '\\approx', latex: '\\approx', category: 'BASIC', ariaLabel: 'Approximately equal' },
  { label: '=', latex: '=', category: 'BASIC', ariaLabel: 'Equals' },
  { label: '+', latex: '+', category: 'BASIC', ariaLabel: 'Plus' },
  { label: '-', latex: '-', category: 'BASIC', ariaLabel: 'Minus' },
  { label: '\\cdot', latex: '\\cdot', category: 'BASIC', ariaLabel: 'Dot product' },
  { label: '\\infty', latex: '\\infty', category: 'BASIC', ariaLabel: 'Infinity' },
  { label: '\\in', latex: '\\in', category: 'BASIC', ariaLabel: 'Element of' },
  { label: '\\notin', latex: '\\notin', category: 'BASIC', ariaLabel: 'Not element of' },
  { label: '\\subset', latex: '\\subset', category: 'BASIC', ariaLabel: 'Subset' },
  { label: '\\cup', latex: '\\cup', category: 'BASIC', ariaLabel: 'Union' },
  { label: '\\cap', latex: '\\cap', category: 'BASIC', ariaLabel: 'Intersection' },
  { label: '\\%', latex: '\\%', category: 'BASIC', ariaLabel: 'Percent' },
  { label: '^{\\circ}', latex: '^{\\circ}', category: 'BASIC', ariaLabel: 'Degree' },
  { label: '\\sqrt{\\phantom{x}}', latex: '\\sqrt{}', templateType: 'SQRT', category: 'BASIC', ariaLabel: 'Square root' },
  { label: '\\therefore', latex: '\\therefore', category: 'BASIC', ariaLabel: 'Therefore' },
  { label: '\\because', latex: '\\because', category: 'BASIC', ariaLabel: 'Because' },

  // --- ALGEBRA & FRACTIONS ---
  { label: '\\frac{a}{b}', latex: '\\frac{}{}', templateType: 'FRACTION', category: 'ALGEBRA', ariaLabel: 'Fraction' },
  { label: '\\sqrt{x}', latex: '\\sqrt{}', templateType: 'SQRT', category: 'ALGEBRA', ariaLabel: 'Square root of x' },
  { label: '\\sqrt[n]{x}', latex: '\\sqrt[]{}', templateType: 'NTH_ROOT', category: 'ALGEBRA', ariaLabel: 'Nth root' },
  { label: 'x^2', latex: 'x^2', templateType: 'POWER', category: 'ALGEBRA', ariaLabel: 'x squared' },
  { label: 'x^n', latex: 'x^{}', templateType: 'POWER', category: 'ALGEBRA', ariaLabel: 'x power n' },
  { label: 'x_n', latex: 'x_{}', templateType: 'SUBSCRIPT', category: 'ALGEBRA', ariaLabel: 'x subscript n' },
  { label: '|x|', latex: '||', templateType: 'ABS', category: 'ALGEBRA', ariaLabel: 'Absolute value' },
  { label: '\\log', latex: '\\log()', templateType: 'LOG', category: 'ALGEBRA', ariaLabel: 'Logarithm' },
  { label: '\\log_a b', latex: '\\log_{}()', templateType: 'LOG', category: 'ALGEBRA', ariaLabel: 'Log base a of b' },
  { label: '\\ln', latex: '\\ln()', templateType: 'LN', category: 'ALGEBRA', ariaLabel: 'Natural log' },
  { label: '(x)', latex: '()', templateType: 'PARENS', category: 'ALGEBRA', ariaLabel: 'Parentheses' },
  { label: '[x]', latex: '[]', category: 'ALGEBRA', ariaLabel: 'Square brackets' },
  { label: '\\{x\\}', latex: '\\{\\}', category: 'ALGEBRA', ariaLabel: 'Braces' },
  { label: 'f(x)', latex: 'f()', category: 'ALGEBRA', ariaLabel: 'Function f of x' },
  { label: 'g(x)', latex: 'g()', category: 'ALGEBRA', ariaLabel: 'Function g of x' },
  { label: 'x', latex: 'x', category: 'ALGEBRA', ariaLabel: 'Variable x' },
  { label: 'y', latex: 'y', category: 'ALGEBRA', ariaLabel: 'Variable y' },
  { label: 'z', latex: 'z', category: 'ALGEBRA', ariaLabel: 'Variable z' },
  { label: 'a', latex: 'a', category: 'ALGEBRA', ariaLabel: 'Variable a' },
  { label: 'b', latex: 'b', category: 'ALGEBRA', ariaLabel: 'Variable b' },
  { label: 'c', latex: 'c', category: 'ALGEBRA', ariaLabel: 'Variable c' },
  { label: 'n', latex: 'n', category: 'ALGEBRA', ariaLabel: 'Variable n' },
  { label: 'e^x', latex: 'e^{}', templateType: 'POWER', category: 'ALGEBRA', ariaLabel: 'e to the power x' },
  { label: '10^x', latex: '10^{}', templateType: 'POWER', category: 'ALGEBRA', ariaLabel: '10 to the power x' },

  // --- GEOMETRY & ANGLES ---
  { label: '\\triangle', latex: '\\triangle', category: 'GEOMETRY', ariaLabel: 'Triangle' },
  { label: '\\angle', latex: '\\angle', category: 'GEOMETRY', ariaLabel: 'Angle' },
  { label: '\\perp', latex: '\\perp', category: 'GEOMETRY', ariaLabel: 'Perpendicular' },
  { label: '\\parallel', latex: '\\parallel', category: 'GEOMETRY', ariaLabel: 'Parallel' },
  { label: '^{\\circ}', latex: '^{\\circ}', category: 'GEOMETRY', ariaLabel: 'Degree' },
  { label: '\\overleftrightarrow{AB}', latex: '\\overleftrightarrow{AB}', category: 'GEOMETRY', ariaLabel: 'Line AB' },
  { label: '\\overline{AB}', latex: '\\overline{AB}', category: 'GEOMETRY', ariaLabel: 'Segment AB' },
  { label: '\\vec{v}', latex: '\\vec{v}', category: 'GEOMETRY', ariaLabel: 'Vector v' },
  { label: '\\sin', latex: '\\sin()', category: 'GEOMETRY', ariaLabel: 'Sine' },
  { label: '\\cos', latex: '\\cos()', category: 'GEOMETRY', ariaLabel: 'Cosine' },
  { label: '\\tan', latex: '\\tan()', category: 'GEOMETRY', ariaLabel: 'Tangent' },
  { label: '\\cot', latex: '\\cot()', category: 'GEOMETRY', ariaLabel: 'Cotangent' },
  { label: '\\sec', latex: '\\sec()', category: 'GEOMETRY', ariaLabel: 'Secant' },
  { label: '\\csc', latex: '\\csc()', category: 'GEOMETRY', ariaLabel: 'Cosecant' },
  { label: '\\alpha', latex: '\\alpha', category: 'GEOMETRY', ariaLabel: 'Alpha' },
  { label: '\\beta', latex: '\\beta', category: 'GEOMETRY', ariaLabel: 'Beta' },
  { label: '\\gamma', latex: '\\gamma', category: 'GEOMETRY', ariaLabel: 'Gamma' },
  { label: '\\Delta', latex: '\\Delta', category: 'GEOMETRY', ariaLabel: 'Delta' },
  { label: 'm\\angle A', latex: 'm\\angle A', category: 'GEOMETRY', ariaLabel: 'Measure of angle A' },
  { label: '\\cong', latex: '\\cong', category: 'GEOMETRY', ariaLabel: 'Congruent' },
  { label: '\\sim', latex: '\\sim', category: 'GEOMETRY', ariaLabel: 'Similar' },
  { label: '\\lambda', latex: '\\lambda', category: 'GEOMETRY', ariaLabel: 'Lambda' },
  { label: '\\omega', latex: '\\omega', category: 'GEOMETRY', ariaLabel: 'Omega' },

  // --- CALCULUS & LIMITS ---
  { label: '\\int', latex: '\\int', category: 'CALCULUS', ariaLabel: 'Indefinite integral' },
  { label: '\\int_a^b', latex: '\\int_{a}^{b}', templateType: 'INTEGRAL', category: 'CALCULUS', ariaLabel: 'Definite integral' },
  { label: '\\iint', latex: '\\iint', category: 'CALCULUS', ariaLabel: 'Double integral' },
  { label: '\\frac{d}{dx}', latex: '\\frac{d}{dx}', category: 'CALCULUS', ariaLabel: 'Derivative d/dx' },
  { label: '\\frac{dy}{dx}', latex: '\\frac{dy}{dx}', category: 'CALCULUS', ariaLabel: 'Derivative dy/dx' },
  { label: '\\frac{\\partial}{\\partial x}', latex: '\\frac{\\partial}{\\partial x}', category: 'CALCULUS', ariaLabel: 'Partial derivative' },
  { label: '\\sum', latex: '\\sum_{i=1}^{n}', templateType: 'SUMMATION', category: 'CALCULUS', ariaLabel: 'Summation' },
  { label: '\\prod', latex: '\\prod_{i=1}^{n}', category: 'CALCULUS', ariaLabel: 'Product' },
  { label: '\\lim_{x \\to 0}', latex: '\\lim_{x \\to 0}', templateType: 'LIMIT', category: 'CALCULUS', ariaLabel: 'Limit x to 0' },
  { label: '\\lim_{x \\to \\infty}', latex: '\\lim_{x \\to \\infty}', category: 'CALCULUS', ariaLabel: 'Limit x to infinity' },
  { label: "f'(x)", latex: "f'(x)", category: 'CALCULUS', ariaLabel: 'First derivative' },
  { label: "f''(x)", latex: "f''(x)", category: 'CALCULUS', ariaLabel: 'Second derivative' },
  { label: 'dx', latex: 'dx', category: 'CALCULUS', ariaLabel: 'dx differential' },
  { label: 'dy', latex: 'dy', category: 'CALCULUS', ariaLabel: 'dy differential' },
  { label: 'dt', latex: 'dt', category: 'CALCULUS', ariaLabel: 'dt differential' },
  { label: '\\Delta x', latex: '\\Delta x', category: 'CALCULUS', ariaLabel: 'Delta x' },
  { label: '\\to', latex: '\\to', category: 'CALCULUS', ariaLabel: 'Approaches' }
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
      displayPreview: raw,
      template: {
        type: 'FRACTION',
        titleAr: 'تعديل الكسر الرياضي مباشرة',
        titleEn: 'Edit Fraction Directly',
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
      displayPreview: raw,
      template: {
        type: 'NTH_ROOT',
        titleAr: 'تعديل الجذر النوني مباشرة',
        titleEn: 'Edit N-th Root Directly',
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
      displayPreview: raw,
      template: {
        type: 'SQRT',
        titleAr: 'تعديل الجذر التربيعي مباشرة',
        titleEn: 'Edit Square Root Directly',
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
      displayPreview: raw,
      template: {
        type: 'SUMMATION',
        titleAr: 'تعديل رمز التجميع مباشرة',
        titleEn: 'Edit Summation Directly',
        slots: [
          { id: 'lower', labelAr: 'بداية التجميع', labelEn: 'Lower limit', placeholder: 'i=1', value: lower },
          { id: 'upper', labelAr: 'نهاية التجميع', labelEn: 'Upper limit', placeholder: 'n', value: upper },
          { id: 'expr', labelAr: 'المقدار المراد جمعه', labelEn: 'Expression', placeholder: 'i', value: expr }
        ],
        activeSlotIndex: 2
      }
    });
  }

  // 5. Definite Integral: \int_{lower}^{upper} expr
  const intDefRegex = /\\int_\{([^{}]*)\}\^\{([^{}]*)\}(?:\s*([^\\]+?)(?:\\,\s*dx|\s*dx)?)?(?=\s|[+\-=]|$|\\)/g;
  while ((match = intDefRegex.exec(text)) !== null) {
    const raw = match[0];
    const lower = match[1];
    const upper = match[2];
    const expr = (match[3] || 'x').trim();
    candidates.push({
      id: `sym_int_${match.index}`,
      type: 'INTEGRAL',
      titleAr: 'تكامل محدد',
      titleEn: 'Definite Integral',
      startIndex: match.index,
      endIndex: match.index + raw.length,
      rawLatex: raw,
      displayPreview: raw,
      template: {
        type: 'INTEGRAL',
        titleAr: 'تعديل التكامل المحدد مباشرة',
        titleEn: 'Edit Definite Integral Directly',
        slots: [
          { id: 'lower', labelAr: 'الحد السفلي (a)', labelEn: 'Lower (a)', placeholder: '0', value: lower },
          { id: 'upper', labelAr: 'الحد العلوي (b)', labelEn: 'Upper (b)', placeholder: '1', value: upper },
          { id: 'expr', labelAr: 'الدالة f(x)', labelEn: 'Integrand', placeholder: 'x', value: expr }
        ],
        activeSlotIndex: 2
      }
    });
  }

  // 6. Indefinite Integral: \int expr dx
  const intIndefRegex = /(?<!_\{[^{}]*\})\\int(?!\s*_\s*\{)\s+([^\\]+?)(?:\\,\s*dx|\s*dx)(?=\s|[+\-=]|$|\\)/g;
  while ((match = intIndefRegex.exec(text)) !== null) {
    const raw = match[0];
    const expr = (match[1] || 'x').trim();
    candidates.push({
      id: `sym_int_indef_${match.index}`,
      type: 'INDEFINITE_INTEGRAL',
      titleAr: 'تكامل غير محدد',
      titleEn: 'Indefinite Integral',
      startIndex: match.index,
      endIndex: match.index + raw.length,
      rawLatex: raw,
      displayPreview: raw,
      template: {
        type: 'INDEFINITE_INTEGRAL',
        titleAr: 'تعديل التكامل غير المحدد مباشرة',
        titleEn: 'Edit Indefinite Integral Directly',
        slots: [
          { id: 'expr', labelAr: 'الدالة المراد مكاملتها', labelEn: 'Integrand', placeholder: 'x', value: expr }
        ],
        activeSlotIndex: 0
      }
    });
  }

  // 7. Limit: \lim_{var \to target} expr
  const limRegex = /\\lim_\{([a-zA-Z])\s*\\to\s*([^{}]*)\}(?:\s*([^\s$+\-=]+|\S+))?/g;
  while ((match = limRegex.exec(text)) !== null) {
    const raw = match[0];
    const to = match[2];
    const expr = match[3] || 'f(x)';
    candidates.push({
      id: `sym_lim_${match.index}`,
      type: 'LIMIT',
      titleAr: 'نهاية دالة',
      titleEn: 'Limit',
      startIndex: match.index,
      endIndex: match.index + raw.length,
      rawLatex: raw,
      displayPreview: raw,
      template: {
        type: 'LIMIT',
        titleAr: 'تعديل النهاية مباشرة',
        titleEn: 'Edit Limit Directly',
        slots: [
          { id: 'to', labelAr: 'تقترب x من', labelEn: 'x approaches', placeholder: '0', value: to },
          { id: 'expr', labelAr: 'الدالة المراد دراستها', labelEn: 'Expression', placeholder: 'f(x)', value: expr }
        ],
        activeSlotIndex: 1
      }
    });
  }

  // 8. Logarithm: \log_{base}(val) or \log(val)
  const logRegex = /\\log(?:_\{([^{}]*)\})?\(([^\)]*)\)/g;
  while ((match = logRegex.exec(text)) !== null) {
    const raw = match[0];
    const base = match[1] || '10';
    const val = match[2];
    candidates.push({
      id: `sym_log_${match.index}`,
      type: 'LOG',
      titleAr: 'لوغاريتم',
      titleEn: 'Logarithm',
      startIndex: match.index,
      endIndex: match.index + raw.length,
      rawLatex: raw,
      displayPreview: raw,
      template: {
        type: 'LOG',
        titleAr: 'تعديل اللوغاريتم مباشرة',
        titleEn: 'Edit Logarithm Directly',
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
      displayPreview: raw,
      template: {
        type: 'LN',
        titleAr: 'تعديل اللوغاريتم الطبيعي مباشرة',
        titleEn: 'Edit Natural Log Directly',
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
      displayPreview: raw,
      template: {
        type: 'POWER',
        titleAr: 'تعديل الأس مباشرة',
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
      displayPreview: raw,
      template: {
        type: 'SUBSCRIPT',
        titleAr: 'تعديل الدليل السفلي مباشرة',
        titleEn: 'Edit Subscript Directly',
        slots: [
          { id: 'base', labelAr: 'الرمز الأساسي', labelEn: 'Base', placeholder: 'x', value: base },
          { id: 'sub', labelAr: 'الدليل السفلي', labelEn: 'Subscript', placeholder: '1', value: sub }
        ],
        activeSlotIndex: 1
      }
    });
  }

  // 12. Absolute Value: |val|
  const absRegex = /\|([^\|]+)\|/g;
  while ((match = absRegex.exec(text)) !== null) {
    const raw = match[0];
    const val = match[1];
    candidates.push({
      id: `sym_abs_${match.index}`,
      type: 'ABS',
      titleAr: 'قيمة مطلقة / مقياس',
      titleEn: 'Absolute Value',
      startIndex: match.index,
      endIndex: match.index + raw.length,
      rawLatex: raw,
      displayPreview: raw,
      template: {
        type: 'ABS',
        titleAr: 'تعديل القيمة المطلقة مباشرة',
        titleEn: 'Edit Absolute Value Directly',
        slots: [
          { id: 'val', labelAr: 'ما بداخل المقياس', labelEn: 'Inside Value', placeholder: 'x', value: val }
        ],
        activeSlotIndex: 0
      }
    });
  }

  // Sort by startIndex ascending
  candidates.sort((a, b) => a.startIndex - b.startIndex);

  // Filter out any nested sub-matches (outer composite symbol takes priority)
  const result: IParsedMathSymbol[] = [];
  for (const c of candidates) {
    const isContained = result.some(
      (r) => c.startIndex >= r.startIndex && c.endIndex <= r.endIndex
    );
    if (!isContained) {
      result.push(c);
    }
  }

  return result;
}

/**
 * Accurately finds whether the cursor position is inside or on the boundaries of a math symbol.
 */
export function findSymbolAtCursor(symbols: IParsedMathSymbol[], cursorIndex: number): IParsedMathSymbol | null {
  if (!symbols.length || cursorIndex < 0) return null;
  return symbols.find((s) => cursorIndex >= s.startIndex && cursorIndex <= s.endIndex) || null;
}
