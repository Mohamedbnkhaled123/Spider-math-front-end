import { AppIconName } from '../app-icon/app-icon.component';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 2: Teacher Virtual Math Keyboard Models
 */

export type MathKeyboardCategory = 'BASIC' | 'ALGEBRA' | 'GEOMETRY' | 'CALCULUS';

export interface IMathSymbolKey {
  label: string; // KaTeX code to display on key or display symbol
  latex: string; // LaTeX code to insert
  cursorOffset?: number; // Cursor position offset from insertion end
  ariaLabel?: string;
  category: MathKeyboardCategory;
}

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
  { label: '\\sqrt{\\phantom{x}}', latex: '\\sqrt{}', cursorOffset: -1, category: 'BASIC', ariaLabel: 'Square root' },
  { label: '\\therefore', latex: '\\therefore', category: 'BASIC', ariaLabel: 'Therefore' },
  { label: '\\because', latex: '\\because', category: 'BASIC', ariaLabel: 'Because' },

  // --- ALGEBRA & FRACTIONS ---
  { label: '\\frac{a}{b}', latex: '\\frac{}{}', cursorOffset: -3, category: 'ALGEBRA', ariaLabel: 'Fraction' },
  { label: '\\sqrt{x}', latex: '\\sqrt{}', cursorOffset: -1, category: 'ALGEBRA', ariaLabel: 'Square root of x' },
  { label: '\\sqrt[n]{x}', latex: '\\sqrt[]{}', cursorOffset: -3, category: 'ALGEBRA', ariaLabel: 'Nth root' },
  { label: 'x^2', latex: 'x^2', category: 'ALGEBRA', ariaLabel: 'x squared' },
  { label: 'x^n', latex: 'x^{}', cursorOffset: -1, category: 'ALGEBRA', ariaLabel: 'x power n' },
  { label: 'x_n', latex: 'x_{}', cursorOffset: -1, category: 'ALGEBRA', ariaLabel: 'x subscript n' },
  { label: '|x|', latex: '||', cursorOffset: -1, category: 'ALGEBRA', ariaLabel: 'Absolute value' },
  { label: '\\log', latex: '\\log()', cursorOffset: -1, category: 'ALGEBRA', ariaLabel: 'Logarithm' },
  { label: '\\log_a b', latex: '\\log_{}()', cursorOffset: -3, category: 'ALGEBRA', ariaLabel: 'Log base a of b' },
  { label: '\\ln', latex: '\\ln()', cursorOffset: -1, category: 'ALGEBRA', ariaLabel: 'Natural log' },
  { label: '(x)', latex: '()', cursorOffset: -1, category: 'ALGEBRA', ariaLabel: 'Parentheses' },
  { label: '[x]', latex: '[]', cursorOffset: -1, category: 'ALGEBRA', ariaLabel: 'Square brackets' },
  { label: '\\{x\\}', latex: '\\{\\}', cursorOffset: -2, category: 'ALGEBRA', ariaLabel: 'Braces' },
  { label: 'f(x)', latex: 'f()', cursorOffset: -1, category: 'ALGEBRA', ariaLabel: 'Function f of x' },
  { label: 'g(x)', latex: 'g()', cursorOffset: -1, category: 'ALGEBRA', ariaLabel: 'Function g of x' },
  { label: 'x', latex: 'x', category: 'ALGEBRA', ariaLabel: 'Variable x' },
  { label: 'y', latex: 'y', category: 'ALGEBRA', ariaLabel: 'Variable y' },
  { label: 'z', latex: 'z', category: 'ALGEBRA', ariaLabel: 'Variable z' },
  { label: 'a', latex: 'a', category: 'ALGEBRA', ariaLabel: 'Variable a' },
  { label: 'b', latex: 'b', category: 'ALGEBRA', ariaLabel: 'Variable b' },
  { label: 'c', latex: 'c', category: 'ALGEBRA', ariaLabel: 'Variable c' },
  { label: 'n', latex: 'n', category: 'ALGEBRA', ariaLabel: 'Variable n' },
  { label: 'e^x', latex: 'e^{}', cursorOffset: -1, category: 'ALGEBRA', ariaLabel: 'e to the power x' },
  { label: '10^x', latex: '10^{}', cursorOffset: -1, category: 'ALGEBRA', ariaLabel: '10 to the power x' },

  // --- GEOMETRY & ANGLES ---
  { label: '\\triangle', latex: '\\triangle', category: 'GEOMETRY', ariaLabel: 'Triangle' },
  { label: '\\angle', latex: '\\angle', category: 'GEOMETRY', ariaLabel: 'Angle' },
  { label: '\\perp', latex: '\\perp', category: 'GEOMETRY', ariaLabel: 'Perpendicular' },
  { label: '\\parallel', latex: '\\parallel', category: 'GEOMETRY', ariaLabel: 'Parallel' },
  { label: '^{\\circ}', latex: '^{\\circ}', category: 'GEOMETRY', ariaLabel: 'Degree' },
  { label: '\\overleftrightarrow{AB}', latex: '\\overleftrightarrow{AB}', category: 'GEOMETRY', ariaLabel: 'Line AB' },
  { label: '\\overline{AB}', latex: '\\overline{AB}', category: 'GEOMETRY', ariaLabel: 'Segment AB' },
  { label: '\\vec{v}', latex: '\\vec{v}', category: 'GEOMETRY', ariaLabel: 'Vector v' },
  { label: '\\sin', latex: '\\sin()', cursorOffset: -1, category: 'GEOMETRY', ariaLabel: 'Sine' },
  { label: '\\cos', latex: '\\cos()', cursorOffset: -1, category: 'GEOMETRY', ariaLabel: 'Cosine' },
  { label: '\\tan', latex: '\\tan()', cursorOffset: -1, category: 'GEOMETRY', ariaLabel: 'Tangent' },
  { label: '\\cot', latex: '\\cot()', cursorOffset: -1, category: 'GEOMETRY', ariaLabel: 'Cotangent' },
  { label: '\\sec', latex: '\\sec()', cursorOffset: -1, category: 'GEOMETRY', ariaLabel: 'Secant' },
  { label: '\\csc', latex: '\\csc()', cursorOffset: -1, category: 'GEOMETRY', ariaLabel: 'Cosecant' },
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
  { label: '\\int_a^b', latex: '\\int_{a}^{b}', category: 'CALCULUS', ariaLabel: 'Definite integral' },
  { label: '\\iint', latex: '\\iint', category: 'CALCULUS', ariaLabel: 'Double integral' },
  { label: '\\frac{d}{dx}', latex: '\\frac{d}{dx}', category: 'CALCULUS', ariaLabel: 'Derivative d/dx' },
  { label: '\\frac{dy}{dx}', latex: '\\frac{dy}{dx}', category: 'CALCULUS', ariaLabel: 'Derivative dy/dx' },
  { label: '\\frac{\\partial}{\\partial x}', latex: '\\frac{\\partial}{\\partial x}', category: 'CALCULUS', ariaLabel: 'Partial derivative' },
  { label: '\\sum', latex: '\\sum_{i=1}^{n}', category: 'CALCULUS', ariaLabel: 'Summation' },
  { label: '\\prod', latex: '\\prod_{i=1}^{n}', category: 'CALCULUS', ariaLabel: 'Product' },
  { label: '\\lim_{x \\to 0}', latex: '\\lim_{x \\to 0}', category: 'CALCULUS', ariaLabel: 'Limit x to 0' },
  { label: '\\lim_{x \\to \\infty}', latex: '\\lim_{x \\to \\infty}', category: 'CALCULUS', ariaLabel: 'Limit x to infinity' },
  { label: "f'(x)", latex: "f'(x)", category: 'CALCULUS', ariaLabel: 'First derivative' },
  { label: "f''(x)", latex: "f''(x)", category: 'CALCULUS', ariaLabel: 'Second derivative' },
  { label: 'dx', latex: 'dx', category: 'CALCULUS', ariaLabel: 'dx differential' },
  { label: 'dy', latex: 'dy', category: 'CALCULUS', ariaLabel: 'dy differential' },
  { label: 'dt', latex: 'dt', category: 'CALCULUS', ariaLabel: 'dt differential' },
  { label: '\\Delta x', latex: '\\Delta x', category: 'CALCULUS', ariaLabel: 'Delta x' },
  { label: '\\to', latex: '\\to', category: 'CALCULUS', ariaLabel: 'Approaches' }
];
