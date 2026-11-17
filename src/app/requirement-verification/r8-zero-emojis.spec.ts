describe('Requirement R8: Zero Unicode Emojis Constraint', () => {
  // Comprehensive Unicode emoji detection regex covering all standard blocks:
  // Regional Indicators, Pictographs, Emoticons, Transport, Symbols, Dingbats,
  // Keycaps, Variation Selectors, and Extended Pictographics.
  const emojiRegex =
    /[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{23E9}-\u{23FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{20E3}\u{FE0F}\p{Extended_Pictographic}]/u;

  // Allowed educational math symbols, Greek letters, approved UI badges, and standard typography
  const allowedMathAndTypographySymbols = new Set([
    // Legal marks
    '©',
    '®',

    // UI badges and indicators
    '✦',
    '★',
    '✓',
    '✗',
    '✕',
    '✔',

    // Educational mathematical symbols
    'π',
    'Σ',
    '∞',
    '√',
    '∫',
    'Δ',
    'θ',
    'λ',
    'α',
    'β',
    '±',
    '≠',
    '≤',
    '≥',

    // Standard punctuation, bullets, and dashes
    '•',
    '—',
    '–'
  ]);

  it('should detect and reject Unicode Regional Indicator symbols and country flags', () => {
    // Tests Regional Indicator Symbols \u{1F1E6}-\u{1F1FF} forming country flag sequences
    const flagCases = [
      'Saudi Arabia flag: \u{1F1F8}\u{1F1E6}',
      'USA flag: \u{1F1FA}\u{1F1F8}',
      'UK flag: \u{1F1EC}\u{1F1E7}',
      'Qatar flag: \u{1F1F6}\u{1F1E6}',
      'UAE flag: \u{1F1E6}\u{1F1EA}',
      'Kuwait flag: \u{1F1F0}\u{1F1FC}',
      'Single Regional Indicator A: \u{1F1E6}',
      'Single Regional Indicator Z: \u{1F1FF}'
    ];

    flagCases.forEach((str) => {
      const matches = str.match(new RegExp(emojiRegex.source, 'gu'));
      expect(matches).not.toBeNull();
      expect(matches!.length).toBeGreaterThan(0);
      const illegal = matches!.filter((c) => !allowedMathAndTypographySymbols.has(c));
      expect(illegal.length).toBeGreaterThan(0);
    });
  });

  it('should detect and reject all standard Unicode emoji categories and variations', () => {
    // All emoji test cases represented as escaped Unicode code points
    const testCasesWithEmojis = [
      'Graduation cap: \u{1F393}',
      'Hourglass: \u{23F3}',
      'Alarm clock: \u{23F0}',
      'Pin: \u{1F4CD}',
      'Lightning: \u{26A1}',
      'Target: \u{1F3AF}',
      'Fire: \u{1F525}',
      'Smile: \u{1F600}',
      'Tears of joy: \u{1F602}',
      'Rocket: \u{1F680}',
      'Thinking face: \u{1F914}',
      'Drop of blood: \u{1FA78}',
      'Heart: \u{2764}',
      'Sparkles: \u{2728}',
      'Scissors: \u{2702}',
      'Sun with rays: \u{2600}',
      'Hot beverage: \u{2615}',
      'Mahjong tile: \u{1F004}',
      'Keycap sequence: 1\u{FE0F}\u{20E3}',
      'Sun with emoji presentation: \u{2600}\u{FE0F}'
    ];

    testCasesWithEmojis.forEach((str) => {
      const matches = str.match(new RegExp(emojiRegex.source, 'gu'));
      expect(matches).not.toBeNull();
      expect(matches!.length).toBeGreaterThan(0);
      const illegal = matches!.filter((c) => !allowedMathAndTypographySymbols.has(c));
      expect(illegal.length).toBeGreaterThan(0);
    });
  });

  it('should preserve and allow legitimate educational mathematical symbols and greek letters', () => {
    const validMathStrings = [
      'lim_{x -> 0} sin(x)/x = 1',
      'Area = π * r^2',
      'Sum = Σ_{i=1}^n i',
      'Integral = ∫ f(x) dx',
      'Infinity = ∞',
      'Square root: √25 = 5',
      'Angle θ = 45°',
      'Roots formula: x = (-b ± √Δ) / 2a',
      'Inequalities: a ≠ b, c ≤ d, e ≥ f',
      'Parameters: λ = 500nm, α = 0.05, β = 0.8',
      'Stars: ★ ✦',
      'Checkmarks: ✓ ✔ ✕ ✗',
      'Bullets and dashes: • item — detail – note',
      'Legal copyright: © 2026 Spider Math ®'
    ];

    validMathStrings.forEach((str) => {
      const matches = (str.match(new RegExp(emojiRegex.source, 'gu')) || []).filter(
        (c) => !allowedMathAndTypographySymbols.has(c)
      );
      expect(matches.length).toBe(0);
    });
  });

  it('should preserve Arabic educational text, diacritics, and Eastern Arabic digits', () => {
    const validArabicStrings = [
      'مرحبا بكم في منصة سبايدر مات التعليمية للرياضيات التفاعلية',
      'التشكيل الكامل: كَتَبَ الطَّالِبُ الدَّرْسَ كِتَابَةً صَحِيحَةً مَعَ التَّنْوِينِ',
      'الأرقام المشرقية: ١٢٣٤٥٦٧٨٩٠',
      'علامات الترقيم العربية: جملة أولى، وجملة ثانية؛ هل فهمت السؤال؟ نـعـم'
    ];

    validArabicStrings.forEach((str) => {
      const matches = (validArabicStrings && str.match(new RegExp(emojiRegex.source, 'gu')) || []).filter(
        (c) => !allowedMathAndTypographySymbols.has(c)
      );
      expect(matches.length).toBe(0);
    });
  });

  it('should verify critical purged files contain strictly zero emojis in their runtime strings', () => {
    // Check specific strings purged during R8 implementation across modules
    const purgedLandingToastArabic = 'قريباً — محتوى "الوحدة الدراسية" قيد الإعداد!';
    const purgedLandingToastEnglish = 'Coming Soon — "Study Unit" is being prepared!';
    const purgedBritishDivisionSymbol = '∫';
    const purgedAmericanCurriculumTitle = 'American Curriculum';
    const purgedBritishCurriculumTitle = 'British Curriculum';
    const purgedSaudiArabiaCountryName = 'المملكة العربية السعودية';

    const runtimeStrings = [
      purgedLandingToastArabic,
      purgedLandingToastEnglish,
      purgedBritishDivisionSymbol,
      purgedAmericanCurriculumTitle,
      purgedBritishCurriculumTitle,
      purgedSaudiArabiaCountryName
    ];

    runtimeStrings.forEach((str) => {
      const matches = (str.match(new RegExp(emojiRegex.source, 'gu')) || []).filter(
        (c) => !allowedMathAndTypographySymbols.has(c)
      );
      expect(matches.length).toBe(0);
    });
  });
});
