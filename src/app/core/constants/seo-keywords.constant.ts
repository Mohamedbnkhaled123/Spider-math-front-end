// ==============================================================================
// Spider Math Platform — High-Converting SEO Keywords Catalog (75 Dedicated Pages)
// Generated automatically with deep bilingual metadata, schemas, and syllabus.
// ==============================================================================

export type SeoKeywordCategory =
  | 'brand'
  | 'teacher'
  | 'baccalaureate'
  | 'reviews'
  | 'grades'
  | 'curricula'
  | 'american_diploma';

export interface ISeoFaqItem {
  readonly questionAr: string;
  readonly questionEn: string;
  readonly answerAr: string;
  readonly answerEn: string;
}

export interface ISeoFeatureCard {
  readonly titleAr: string;
  readonly titleEn: string;
  readonly descAr: string;
  readonly descEn: string;
  readonly icon: string;
}

export interface ISeoSyllabusItem {
  readonly titleAr: string;
  readonly titleEn: string;
  readonly detailsAr: string;
  readonly detailsEn: string;
}

export interface ISeoCategoryMeta {
  readonly id: SeoKeywordCategory;
  readonly nameAr: string;
  readonly nameEn: string;
  readonly descAr: string;
  readonly descEn: string;
}

export interface ISeoKeywordPage {
  readonly id: string;
  readonly slug: string;
  readonly slugAliases: readonly string[];
  readonly category: SeoKeywordCategory;
  readonly categoryNameAr: string;
  readonly categoryNameEn: string;
  readonly keywordAr: string;
  readonly keywordEn: string;
  readonly pageTitleAr: string;
  readonly pageTitleEn: string;
  readonly metaDescriptionAr: string;
  readonly metaDescriptionEn: string;
  readonly tagsAr: readonly string[];
  readonly tagsEn: readonly string[];
  readonly badgeAr: string;
  readonly badgeEn: string;
  readonly headlineAr: string;
  readonly headlineEn: string;
  readonly subheadlineAr: string;
  readonly subheadlineEn: string;
  readonly overviewAr: string;
  readonly overviewEn: string;
  readonly features: readonly ISeoFeatureCard[];
  readonly syllabus: readonly ISeoSyllabusItem[];
  readonly targetAudienceAr: string;
  readonly targetAudienceEn: string;
  readonly faqs: readonly ISeoFaqItem[];
  readonly relatedSlugs: readonly string[];
}

export const SEO_KEYWORD_CATEGORIES: readonly ISeoCategoryMeta[] = [
  {
    "id": "brand",
    "nameAr": "اسم المنصة",
    "nameEn": "Platform Identity",
    "descAr": "الكلمات المفتاحية الرسمية لمنصة سبايدر ماث التعليمية للرياضيات",
    "descEn": "Official Spider Math Educational Platform brand keywords and identity"
  },
  {
    "id": "teacher",
    "nameAr": "ميس هبه عياد (هبه عبد الوهاب)",
    "nameEn": "Eng. Heba Abdel-Wahab (Heba Ayad)",
    "descAr": "العلامة الشخصية والشروحات المباشرة مع المهندسة هبة عبدالوهاب",
    "descEn": "Personal brand, lectures, and courses by Eng. Heba Abdel-Wahab"
  },
  {
    "id": "baccalaureate",
    "nameAr": "البكالوريا",
    "nameEn": "Baccalaureate Mathematics",
    "descAr": "كورس ومراجعات وامتحانات البكالوريا رياضيات والفرق بينها وبين الثانوية العامة",
    "descEn": "Baccalaureate math curriculum, courses, past papers, and comparative guides"
  },
  {
    "id": "reviews",
    "nameAr": "المراجعات وليالي الامتحان",
    "nameEn": "Final & Night-Before Exam Reviews",
    "descAr": "مراجعات ليلة الامتحان للثانوية العامة والبكالوريا وتالتة إعدادي والملخصات PDF",
    "descEn": "High-yield night-before exam revision, formula summaries, and PDF study guides"
  },
  {
    "id": "grades",
    "nameAr": "الصفوف والمراحل الدراسية",
    "nameEn": "Grade Levels (Primary to Grade 12)",
    "descAr": "شروحات الرياضيات لكافة الصفوف من الرابع الابتدائي حتى تالتة ثانوي و Grade 12",
    "descEn": "Grade-by-grade mathematics lessons covering Primary 4 through Grade 12"
  },
  {
    "id": "curricula",
    "nameAr": "المناهج المختلفة",
    "nameEn": "Educational Curricula",
    "descAr": "المنهج المصري، الأزهر، اللغات، البكالوريا، المنهج السعودي والبريطاني IG",
    "descEn": "Egyptian, Al-Azhar, Language schools, Saudi, and British IGCSE curricula"
  },
  {
    "id": "american_diploma",
    "nameAr": "الدبلومة الأمريكية (SAT • EST • ACT)",
    "nameEn": "American Diploma (SAT • EST • ACT)",
    "descAr": "شرح وكورسات SAT و EST و ACT وكيفية تحقيق 800 في الماث وأسرار حاسبة ديسموس",
    "descEn": "Digital SAT, EST, and ACT Math mastery, 800-score blueprints, and Desmos strategies"
  }
];

export const SEO_KEYWORD_PAGES: readonly ISeoKeywordPage[] = [
  {
    "id": "spider-math-ar",
    "slug": "spider-math",
    "slugAliases": [
      "سبايدر-ماث",
      "spider-math-arabic"
    ],
    "category": "brand",
    "categoryNameAr": "اسم المنصة",
    "categoryNameEn": "Platform Identity",
    "keywordAr": "سبايدر ماث",
    "keywordEn": "Spider Math",
    "pageTitleAr": "سبايدر ماث | أقوى منصة لشرح الرياضيات والماث اونلاين — ميس هبة عياد",
    "pageTitleEn": "Spider Math | Premier Mathematics Learning Platform — Eng. Heba Ayad",
    "metaDescriptionAr": "منصة سبايدر ماث التعليمية الرائدة في تدريس الرياضيات والماث للثانوية العامة والدبلومة الأمريكية والبكالوريا بإشراف المهندسة هبة عبدالوهاب.",
    "metaDescriptionEn": "Spider Math educational platform: top-tier mathematics courses for American Diploma (SAT/EST), Baccalaureate, Thanaweya Amma, and IGCSE by Eng. Heba Abdel-Wahab.",
    "tagsAr": [
      "سبايدر ماث",
      "منصة سبايدر ماث",
      "هبه عياد",
      "رياضيات اونلاين"
    ],
    "tagsEn": [
      "Spider Math",
      "Math Platform",
      "Heba Ayad",
      "Online Math"
    ],
    "badgeAr": "المنصة الرسمية",
    "badgeEn": "Official Platform",
    "headlineAr": "منصة سبايدر ماث — رحلتك نحو الدرجة النهائية في الرياضيات",
    "headlineEn": "Spider Math Platform — Your Fast Track to Mathematics Mastery",
    "subheadlineAr": "نظام تعليمي متكامل يجمع بين الشرح المفاهيمي المبسط وتدريبات الذكاء الاصطناعي واستراتيجيات حاسبة ديسموس المتطورة.",
    "subheadlineEn": "An advanced educational ecosystem combining conceptual depth, interactive question banks, and Desmos calculator speed mastery.",
    "overviewAr": "تأسست منصة سبايدر ماث لتكون الوجهة الأولى للطلاب الطامحين للتفوق الرياضي من خلال شروحات تفاعلية وبنوك أسئلة متجددة وامتحانات دورية بإشراف المهندسة هبة عبدالوهاب.",
    "overviewEn": "Spider Math Platform turns mathematics from a challenging subject into a competitive advantage through state-of-the-art interactive teaching tools.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "الدبلومة الأمريكية (Digital SAT • EST • ACT)",
        "titleEn": "American Diploma (SAT • EST • ACT)",
        "detailsAr": "تغطية شاملة لجميع محاور الجبر والإحصاء والهندسة مع حل آلاف الأسئلة.",
        "detailsEn": "Comprehensive prep for Heart of Algebra, Advanced Math, and Geometry."
      },
      {
        "titleAr": "البكالوريا والثانوية العامة",
        "titleEn": "Baccalaureate & Thanaweya Amma",
        "detailsAr": "تفاضل، تكامل، جبر، هندسة فراغية، واستاتيكا وديناميكا بأعلى المعايير.",
        "detailsEn": "Calculus, Algebra, Solid Geometry, and Mechanics aligned with exam blueprints."
      }
    ],
    "targetAudienceAr": "طلاب الثانوية العامة، البكالوريا، والدبلومة الأمريكية الراغبين في التفوق الأكاديمي.",
    "targetAudienceEn": "High school, Baccalaureate, and American Diploma students aiming for maximum exam scores.",
    "faqs": [
      {
        "questionAr": "ما هي طرق الدفع والاشتراك المتاحة؟",
        "questionEn": "What payment and subscription methods are supported?",
        "answerAr": "نوفر الدفع عبر فودافون كاش، محافظ الهاتف، البطاقات الائتمانية وفوري مع تفعيل فوري للاشتراك.",
        "answerEn": "We support Vodafone Cash, mobile wallets, credit cards, and Fawry with immediate access."
      },
      {
        "questionAr": "هل المحتوى متوافق مع المدارس اللغات والعربي؟",
        "questionEn": "Is the content suitable for both Language and Arabic schools?",
        "answerAr": "نعم، نوفر مسارات منفصلة لشرح الماث باللغة الإنجليزية وشرح الرياضيات باللغة العربية مع توضيح المصطلحات.",
        "answerEn": "Yes! We offer distinct tracks for English Math and Arabic Mathematics with clear terminology."
      }
    ],
    "relatedSlugs": [
      "spider-math-platform",
      "heba-ayad",
      "sat-math-explanation",
      "baccalaureate-math-explanation"
    ]
  },
  {
    "id": "spider-math-en",
    "slug": "spider-math-en",
    "slugAliases": [
      "spider-math-english",
      "spider-math-global"
    ],
    "category": "brand",
    "categoryNameAr": "اسم المنصة",
    "categoryNameEn": "Platform Identity",
    "keywordAr": "Spider Math",
    "keywordEn": "Spider Math (Global)",
    "pageTitleAr": "Spider Math | Premier Mathematics Learning Academy — Eng. Heba Ayad",
    "pageTitleEn": "Spider Math | Premier Mathematics Learning Academy — Eng. Heba Ayad",
    "metaDescriptionAr": "Spider Math Academy delivers top-tier mathematics courses for SAT, EST, ACT, and IGCSE students led by Eng. Heba Abdel-Wahab.",
    "metaDescriptionEn": "Spider Math Academy delivers top-tier mathematics courses for SAT, EST, ACT, and IGCSE students led by Eng. Heba Abdel-Wahab.",
    "tagsAr": [
      "Spider Math",
      "Math Academy",
      "Digital SAT",
      "IGCSE Math"
    ],
    "tagsEn": [
      "Spider Math",
      "Math Academy",
      "Digital SAT",
      "IGCSE Math"
    ],
    "badgeAr": "Global Academy",
    "badgeEn": "Global Academy",
    "headlineAr": "Spider Math — World-Class Mathematics Instruction",
    "headlineEn": "Spider Math — World-Class Mathematics Instruction",
    "subheadlineAr": "Empowering international and bilingual students with high-impact strategies, Desmos hacks, and deep conceptual clarity.",
    "subheadlineEn": "Empowering international and bilingual students with high-impact strategies, Desmos hacks, and deep conceptual clarity.",
    "overviewAr": "Spider Math provides world-class mathematical coaching designed for students preparing for standardized international exams and competitive university entrance assessments.",
    "overviewEn": "Spider Math provides world-class mathematical coaching designed for students preparing for standardized international exams and competitive university entrance assessments.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "Digital SAT & EST Modules",
        "titleEn": "Digital SAT & EST Modules",
        "detailsAr": "تغطية مكثفة للجبر والدوال وحيل الرسوم البيانية.",
        "detailsEn": "Intensive drills on functions, coordinate geometry, and polynomials."
      }
    ],
    "targetAudienceAr": "Students in American and British international diploma tracks aiming for top university admissions.",
    "targetAudienceEn": "Students in American and British international diploma tracks aiming for top university admissions.",
    "faqs": [
      {
        "questionAr": "Are the practice tests timed?",
        "questionEn": "Are the practice tests timed?",
        "answerAr": "نعم، تحاكي الاختبارات نفس التوقيت ونظام واجهة الامتحان الحقيقي.",
        "answerEn": "Yes, practice exams replicate exact official testing interface and timing conditions."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "spidermath",
      "sat-math-explanation",
      "heba-ayad-sat-math"
    ]
  },
  {
    "id": "spidermath",
    "slug": "spidermath",
    "slugAliases": [
      "spidermath-portal",
      "spidermath-hub"
    ],
    "category": "brand",
    "categoryNameAr": "اسم المنصة",
    "categoryNameEn": "Platform Identity",
    "keywordAr": "SpiderMath",
    "keywordEn": "SpiderMath Hub",
    "pageTitleAr": "SpiderMath | المنصة التفاعلية للرياضيات — المهندسة هبة عبدالوهاب",
    "pageTitleEn": "SpiderMath | Interactive Mathematics Learning Hub — Eng. Heba Abdel-Wahab",
    "metaDescriptionAr": "تعرف على SpiderMath، المنصة الرقمية الذكية لدراسة الرياضيات والماث بأحدث الوسائل التفاعلية مع ميس هبة عياد.",
    "metaDescriptionEn": "Explore SpiderMath: the smart interactive hub for mastering high school and standardized mathematics.",
    "tagsAr": [
      "SpiderMath",
      "سبايدر ماث",
      "تعليم رياضيات",
      "هبه عياد"
    ],
    "tagsEn": [
      "SpiderMath",
      "Math EdTech",
      "Heba Ayad"
    ],
    "badgeAr": "المنظومة الذكية",
    "badgeEn": "Smart Ecosystem",
    "headlineAr": "SpiderMath — حيث تجتمع التكنولوجيا بحب الرياضيات",
    "headlineEn": "SpiderMath — Where Technology Meets Mathematical Passion",
    "subheadlineAr": "بيئة تعلم ذكية مرنة تمنحك الثقة الكاملة لحل أصعب المسائل بأساليب غير تقليدية.",
    "subheadlineEn": "A smart flexible learning environment empowering you to solve the toughest math problems effortlessly.",
    "overviewAr": "SpiderMath تجمع بين المحاضرات المسجلة فائقة الجودة وبنك التمارين التفاعلي لتقديم تجربة تعليمية متميزة لكل طالب.",
    "overviewEn": "SpiderMath blends high-production video lectures with interactive worksheets for a transformative study journey.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "الجبر والهندسة التحليلية",
        "titleEn": "Algebra & Analytic Geometry",
        "detailsAr": "المعادلات، المتباينات، القطوع المخروطية، والمصفوفات.",
        "detailsEn": "Linear systems, quadratic models, conic sections, and matrices."
      }
    ],
    "targetAudienceAr": "طلاب كافة المراحل الباحثين عن نظام دراسي رقمي مريح وفعال.",
    "targetAudienceEn": "Students seeking a streamlined, effective digital mathematics journey.",
    "faqs": [
      {
        "questionAr": "هل المحتوى متاح على الهاتف والكمبيوتر؟",
        "questionEn": "Is content accessible on phones and PCs?",
        "answerAr": "نعم، المنصة تعمل بكفاءة تامة على الهواتف والأجهزة اللوحية وأجهزة الكمبيوتر.",
        "answerEn": "Yes, SpiderMath is fully responsive across all phones, tablets, and computers."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "spider-math-platform",
      "heba-ayad"
    ]
  },
  {
    "id": "spider-math-platform-ar",
    "slug": "spider-math-platform-ar",
    "slugAliases": [
      "منصة-سبايدر-ماث",
      "منصة-سبايدر-ماث-التعليمية"
    ],
    "category": "brand",
    "categoryNameAr": "اسم المنصة",
    "categoryNameEn": "Platform Identity",
    "keywordAr": "منصة سبايدر ماث",
    "keywordEn": "Spider Math Educational Platform",
    "pageTitleAr": "منصة سبايدر ماث | البوابة التعليمية الأولى للرياضيات في مصر والشرق الأوسط",
    "pageTitleEn": "Spider Math Educational Platform | Leading Middle East Mathematics Portal",
    "metaDescriptionAr": "منصة سبايدر ماث التعليمية: شروحات كاملة، بنوك أسئلة، ومراجعات ليلة الامتحان مع المهندسة هبة عبدالوهاب (هبه عياد).",
    "metaDescriptionEn": "Spider Math Educational Platform: complete courses, question banks, and night-before exam reviews by Eng. Heba Abdel-Wahab.",
    "tagsAr": [
      "منصة سبايدر ماث",
      "سبايدر ماث",
      "رياضيات اون لاين",
      "هبه عياد"
    ],
    "tagsEn": [
      "Spider Math Platform",
      "Online Math Portal",
      "Heba Ayad"
    ],
    "badgeAr": "البوابة التعليمية",
    "badgeEn": "Educational Portal",
    "headlineAr": "منصة سبايدر ماث — دليلك الشامل للدرجة النهائية",
    "headlineEn": "Spider Math Platform — Your Complete Roadmap to Top Marks",
    "subheadlineAr": "منظومة تعليمية متكاملة مصممة خصيصاً لطلاب الثانوية العامة والدبلومة الأمريكية والشهادات المعادلة.",
    "subheadlineEn": "A fully-integrated learning management system tailored for Thanaweya Amma and American Diploma candidates.",
    "overviewAr": "توفر منصة سبايدر ماث شروحات دقيقة لكل جزيئات المنهج، مع كبسولات مراجعة مركزة واختبارات دورية تصحح إلكترونياً وبشرياً لضمان أفضل النتائج.",
    "overviewEn": "Providing in-depth coverage for every syllabus concept paired with bite-sized review capsules and comprehensive mock tests.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "مسار الثانوية العامة والبكالوريا",
        "titleEn": "Thanaweya Amma & Baccalaureate Track",
        "detailsAr": "خطة متكاملة تبدأ من أغسطس وحتى ليلة الامتحان بأعلى معدلات التحصيل.",
        "detailsEn": "A comprehensive academic roadmap from kickoff to the final exam."
      }
    ],
    "targetAudienceAr": "الطلاب الذين يبحثون عن متابعة دورية وانضباط دراسي حقيقي.",
    "targetAudienceEn": "Students who value disciplined study routines and continuous academic feedback.",
    "faqs": [
      {
        "questionAr": "كيف يتم تصحيح الواجبات والامتحانات؟",
        "questionEn": "How are assignments and tests graded?",
        "answerAr": "يتم التصحيح آلياً للأسئلة الموضوعية، وتصحيح تفصيلي بواسطة فريق العمل للأسئلة المقالية مع توضيح الخطوات.",
        "answerEn": "Automated instant grading for MCQs plus manual step-by-step grading for written questions."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "spider-math-platform",
      "heba-ayad"
    ]
  },
  {
    "id": "spider-math-platform",
    "slug": "spider-math-platform",
    "slugAliases": [
      "منصة-spider-math",
      "spider-math-platform-official"
    ],
    "category": "brand",
    "categoryNameAr": "اسم المنصة",
    "categoryNameEn": "Platform Identity",
    "keywordAr": "منصة Spider Math",
    "keywordEn": "Platform Spider Math",
    "pageTitleAr": "منصة Spider Math | المنصة الأكاديمية الأولى للتفوق الرياضي",
    "pageTitleEn": "Platform Spider Math | The Academic Standard in Mathematics",
    "metaDescriptionAr": "انضم إلى منصة Spider Math واستمتع بتجربة تعلم فريدة تضمن لك التفوق في الرياضيات بمناهجها المختلفة.",
    "metaDescriptionEn": "Join Platform Spider Math for an unparalleled online learning experience with guaranteed math score enhancements.",
    "tagsAr": [
      "منصة Spider Math",
      "Spider Math Platform",
      "هبه عياد"
    ],
    "tagsEn": [
      "Platform Spider Math",
      "Spider Math",
      "Online Education"
    ],
    "badgeAr": "الأكاديمية الرقمية",
    "badgeEn": "Digital Academy",
    "headlineAr": "منصة Spider Math — التميز في الرياضيات يبدأ من هنا",
    "headlineEn": "Platform Spider Math — Mathematics Excellence Starts Here",
    "subheadlineAr": "شروحات ذكية تجمع بين عمق التأسيس وسرعة الحل في الامتحانات الرسمية.",
    "subheadlineEn": "Smart pedagogy uniting rock-solid conceptual foundations with rapid exam execution.",
    "overviewAr": "تقدم منصة Spider Math محتوى أكاديمياً عالي الجودة معداً خصيصاً لتمكين الطلاب من استيعاب المفاهيم المجردة وتحويلها إلى مهارة عملية وسرعة في الإجابة.",
    "overviewEn": "Delivering elite educational resources designed to transform abstract mathematical theory into rapid problem-solving fluency.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "المناهج المصرية والدولية",
        "titleEn": "National & International Syllabi",
        "detailsAr": "تغطية شاملة لمناهج اللغات والعربي والدبلومة الأمريكية.",
        "detailsEn": "Complete coverage for National, Bilingual, and American Diploma streams."
      }
    ],
    "targetAudienceAr": "طلاب جميع المناهج الراغبون في التفوق التام.",
    "targetAudienceEn": "All students aspiring toward total mathematical mastery.",
    "faqs": [
      {
        "questionAr": "هل يتوفر اشتراك شهري أم ترم كامل؟",
        "questionEn": "Are monthly or full-semester packages available?",
        "answerAr": "نوفر باقات شهرية مرنة وباقات ترم وسنة كاملة مع خصومات خاصة.",
        "answerEn": "We offer flexible monthly subscriptions as well as discounted term and full-year packages."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "spider-math-platform-ar",
      "heba-ayad"
    ]
  },
  {
    "id": "spider-math-for-mathematics-ar",
    "slug": "spider-math-for-mathematics-ar",
    "slugAliases": [
      "سبايدر-ماث-للرياضيات",
      "سبايدر-ماث-رياضيات"
    ],
    "category": "brand",
    "categoryNameAr": "اسم المنصة",
    "categoryNameEn": "Platform Identity",
    "keywordAr": "سبايدر ماث للرياضيات",
    "keywordEn": "Spider Math for Mathematics (Arabic)",
    "pageTitleAr": "سبايدر ماث للرياضيات | التخصص الأكاديمي والاحتراف مع ميس هبة عياد",
    "pageTitleEn": "Spider Math for Mathematics | Academic Specialization — Miss Heba Ayad",
    "metaDescriptionAr": "سبايدر ماث للرياضيات: الوجهة المتخصصة لطلاب الإعدادي والثانوي والدبلومة الأمريكية لتحقيق الدرجة النهائية مع ميس هبة عياد.",
    "metaDescriptionEn": "Spider Math for Mathematics: the specialized destination for Prep, Secondary, and American Diploma students.",
    "tagsAr": [
      "سبايدر ماث للرياضيات",
      "رياضيات",
      "هبه عياد",
      "ماث"
    ],
    "tagsEn": [
      "Spider Math for Mathematics",
      "Math Tutoring",
      "Heba Ayad"
    ],
    "badgeAr": "التخصص الأكاديمي",
    "badgeEn": "Academic Specialization",
    "headlineAr": "سبايدر ماث للرياضيات — لأن الرياضيات تحتاج إلى متخصص",
    "headlineEn": "Spider Math for Mathematics — Because Math Requires Dedicated Specialists",
    "subheadlineAr": "تركيز كامل على فروع الرياضيات دون أي تشتيت لنضمن لك التفوق المطلق.",
    "subheadlineEn": "Total dedication to mathematical sciences with zero distractions for guaranteed excellence.",
    "overviewAr": "في سبايدر ماث للرياضيات، نوفر بيئة دراسية متخصصة تركز على تنمية التفكير المنطقي والمهارات الحسابية العليا لتمكين الطالب من حل أي مسألة مهما بلغت صعوبتها.",
    "overviewEn": "Providing a dedicated mathematics ecosystem focused on higher logical thinking, visual proofs, and advanced algebra.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "فروع الرياضيات البحتة والتطبيقية",
        "titleEn": "Pure & Applied Mathematics",
        "detailsAr": "تأصيل علمي دقيق مع تدريب مكثف على المسائل المركبة متعددة الخطوات.",
        "detailsEn": "Rigorous theoretical foundations paired with multi-step complex problem drills."
      }
    ],
    "targetAudienceAr": "طلاب شعبة علمي رياضة وطلاب الماث المتقدمين في المدارس الرسمية والخاصة.",
    "targetAudienceEn": "High school STEM and Math track students seeking top honors.",
    "faqs": [
      {
        "questionAr": "هل تغطي المنصة فرعي الاستاتيكا والديناميكا؟",
        "questionEn": "Do you cover Statics and Dynamics?",
        "answerAr": "نعم، المنصة تقدم كورس ميكانيكا متكامل يشمل الشرح النظري، الرسوم التوضيحية، وحل مئات المسائل من بنك المعرفة.",
        "answerEn": "Yes, we provide full Mechanics courses with animated physics vectors, theory, and hundreds of solved problems."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "spider-math-for-mathematics",
      "calculus-differentiation-night-exam-revision"
    ]
  },
  {
    "id": "spider-math-for-mathematics",
    "slug": "spider-math-for-mathematics",
    "slugAliases": [
      "spider-math-للرياضيات",
      "spider-math-mathematics-portal"
    ],
    "category": "brand",
    "categoryNameAr": "اسم المنصة",
    "categoryNameEn": "Platform Identity",
    "keywordAr": "Spider Math للرياضيات",
    "keywordEn": "Spider Math for Mathematics",
    "pageTitleAr": "Spider Math للرياضيات | التميز الأكاديمي والشرح المتقدم — ميس هبة عياد",
    "pageTitleEn": "Spider Math for Mathematics | Advanced Academic Tutoring — Miss Heba Ayad",
    "metaDescriptionAr": "تعرف على Spider Math للرياضيات: كورسات تفاعلية، شروحات ديسموس، ومراجعات حصرية للدبلومة الأمريكية والثانوية العامة.",
    "metaDescriptionEn": "Discover Spider Math for Mathematics: interactive courses, Desmos mastery, and exclusive exam prep.",
    "tagsAr": [
      "Spider Math للرياضيات",
      "ماث",
      "رياضيات",
      "هبه عياد"
    ],
    "tagsEn": [
      "Spider Math for Mathematics",
      "Math Prep",
      "Heba Ayad"
    ],
    "badgeAr": "Advanced Math",
    "badgeEn": "Advanced Math",
    "headlineAr": "Spider Math للرياضيات — رحلتك نحو التميز الأكاديمي",
    "headlineEn": "Spider Math for Mathematics — Your Journey to Academic Honors",
    "subheadlineAr": "استراتيجيات ذكية ومناهج شاملة تضمن لك أعلى الدرجات في اختبارات الرياضيات والماث.",
    "subheadlineEn": "Smart strategies and comprehensive curricula ensuring top scores in all math tests.",
    "overviewAr": "تم تصميم مساقات Spider Math للرياضيات لتواكب أحدث المعايير الدولية والوطنية، موفرة للطالب كل الأدوات اللازمة للفهم والتدريب والتقييم المستمر.",
    "overviewEn": "Engineered to match national and international standards, equipping students with rigorous practice, diagnostics, and reviews.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "منهج الماث الدولي والوطني",
        "titleEn": "Dual International & National Tracks",
        "detailsAr": "شروحات تناسب طلبة اللغات والدولية بالتفصيل.",
        "detailsEn": "Tailored explanations for bilingual, IGCSE, and American students."
      }
    ],
    "targetAudienceAr": "طلاب المدارس اللغات والدولية الطامحون لأعلى التقديرات.",
    "targetAudienceEn": "Bilingual and international students aiming for straight A*s and 800 scores.",
    "faqs": [
      {
        "questionAr": "هل هناك حصص تدريب على حل المسائل في وقت قياسي؟",
        "questionEn": "Are there speed training sessions?",
        "answerAr": "نعم، نوفر ورش عمل دورية لتدريب الطلاب على حل 20 مسألة في 20 دقيقة باستخدام استراتيجيات ذكية.",
        "answerEn": "Yes, we run regular speed-drill workshops training students to tackle 20 problems in 20 minutes."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "spider-math-for-mathematics-ar",
      "sat-math-explanation"
    ]
  },
  {
    "id": "spider-math-brand",
    "slug": "spider-math-brand",
    "slugAliases": [
      "سبايدر-ماث-spider-math",
      "spider-math-dual-brand"
    ],
    "category": "brand",
    "categoryNameAr": "اسم المنصة",
    "categoryNameEn": "Platform Identity",
    "keywordAr": "سبايدر ماث - Spider Math",
    "keywordEn": "Spider Math - سبايدر ماث",
    "pageTitleAr": "سبايدر ماث - Spider Math | العلامة الرائدة في تدريس الرياضيات بالعربي والإنجليزي",
    "pageTitleEn": "Spider Math - سبايدر ماث | The Premier Bilingual Mathematics Brand",
    "metaDescriptionAr": "سبايدر ماث - Spider Math: المنظومة التعليمية الرائدة بإشراف المهندسة هبة عبدالوهاب لتدريس الرياضيات بالعربي واللغات.",
    "metaDescriptionEn": "Spider Math: the trusted educational system led by Eng. Heba Abdel-Wahab for Arabic and English math curricula.",
    "tagsAr": [
      "سبايدر ماث - Spider Math",
      "سبايدر ماث",
      "Spider Math",
      "هبه عياد"
    ],
    "tagsEn": [
      "Spider Math",
      "Dual Brand",
      "Math Tutoring"
    ],
    "badgeAr": "العلامة المعتمدة",
    "badgeEn": "Certified Brand",
    "headlineAr": "سبايدر ماث - Spider Math — علامة التميز في الرياضيات",
    "headlineEn": "Spider Math — The Benchmark of Mathematical Mastery",
    "subheadlineAr": "الاسم الذي اختاره آلاف الطلاب وأولياء الأمور للوصول إلى أعلى المراتب الأكاديمية.",
    "subheadlineEn": "The platform trusted by thousands of ambitious students and parents year after year.",
    "overviewAr": "تجمع علامة سبايدر ماث - Spider Math بين هيبة التدريس الأكاديمي وحداثة التقنيات التفاعلية، لتضع بين يديك كل ما يلزم للتميز في الرياضيات من شروحات ومراجعات وامتحانات.",
    "overviewEn": "Bridging pedagogical mastery and sleek digital design, Spider Math delivers everything you need to dominate mathematics exams.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "المنهج الكامل مع المراجعة النهائية",
        "titleEn": "Comprehensive Curriculum & Revisions",
        "detailsAr": "تغطية متوازنة على مدار العام تنتهي بمعسكرات المراجعة وليالي الامتحان.",
        "detailsEn": "A balanced yearly schedule capped with high-intensity night-before exam bootcamps."
      }
    ],
    "targetAudienceAr": "كل طالب يبحث عن تجربة تعليمية تجمع بين متعة التعلم وضمان النتيجة.",
    "targetAudienceEn": "Every student seeking joyful learning coupled with guaranteed exam excellence.",
    "faqs": [
      {
        "questionAr": "كيف أتواصل مع الدعم الفني أو خدمة العملاء؟",
        "questionEn": "How do I reach technical support or customer care?",
        "answerAr": "فريق الدعم الفني متاح على مدار الساعة عبر الواتساب والتيليجرام لمساعدتك في أي استفسار تقني أو أكاديمي.",
        "answerEn": "Our support team is available 24/7 via WhatsApp and Telegram to assist you with any tech or academic inquiry."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "spider-math-platform",
      "heba-ayad"
    ]
  },
  {
    "id": "heba-ayad",
    "slug": "heba-ayad",
    "slugAliases": [
      "هبه-عياد"
    ],
    "category": "teacher",
    "categoryNameAr": "ميس هبه عياد (هبه عبد الوهاب)",
    "categoryNameEn": "Eng. Heba Abdel-Wahab (Heba Ayad)",
    "keywordAr": "هبه عياد",
    "keywordEn": "Heba Ayad",
    "pageTitleAr": "هبه عياد | شرح الرياضيات والماث اونلاين على منصة سبايدر ماث",
    "pageTitleEn": "Heba Ayad | Mathematics & Math Lessons on Spider Math Platform",
    "metaDescriptionAr": "تعرف على هبه عياد وكورسات شرح الرياضيات والماث للدبلومة الأمريكية والبكالوريا والثانوية العامة بأحدث أساليب حاسبة ديسموس.",
    "metaDescriptionEn": "Learn with Heba Ayad on Spider Math Platform: advanced mathematics prep for American Diploma, Baccalaureate, and Thanaweya Amma.",
    "tagsAr": [
      "هبه عياد",
      "هبه عياد",
      "هبه عبد الوهاب",
      "سبايدر ماث",
      "شرح رياضيات"
    ],
    "tagsEn": [
      "Heba Ayad",
      "Heba Ayad",
      "Heba Abdel-Wahab",
      "Spider Math",
      "Math Tutor"
    ],
    "badgeAr": "معلمة الرياضيات",
    "badgeEn": "Senior Lecturer",
    "headlineAr": "هبه عياد — خبرة هندسية وأسلوب مبسط في شرح أصعب فروع الرياضيات",
    "headlineEn": "Heba Ayad — Engineering Expertise & Intuitive Math Instruction",
    "subheadlineAr": "المهندسة هبة عبدالوهاب تضع بين يديك خلاصة خبرتها الأكاديمية لتبسيط أكثر المفاهيم الرياضية تعقيداً.",
    "subheadlineEn": "Eng. Heba Abdel-Wahab delivers elite academic mastery to transform difficult concepts into effortless solutions.",
    "overviewAr": "تقدم هبه عياد محتوى تعليمياً فريداً يركز على استيعاب الطالب للمنطق الرياضي واستخدام التكنولوجيا الحديثة مثل حاسبة ديسموس والرسوم التفاعلية لضمان الحصول على الدرجات النهائية وتجاوز الامتحانات التنافسية بثقة تامة.",
    "overviewEn": "Heba Ayad provides a unique pedagogical approach emphasizing logical intuition, Desmos calculator techniques, and continuous personalized feedback to guarantee top honors.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "استراتيجيات الشرح والتطبيق",
        "titleEn": "Pedagogical Framework",
        "detailsAr": "محاضرات مسجلة عالية الوضوح مع ورش تطبيقية مباشرة وشيتات محلولة.",
        "detailsEn": "High-definition video lectures paired with live workshops and step-by-step booklets."
      },
      {
        "titleAr": "بنوك الأسئلة والامتحانات الدورية",
        "titleEn": "Question Banks & Mock Exams",
        "detailsAr": "تدريب على أحدث نماذج الامتحانات الوزارية والدولية.",
        "detailsEn": "Simulations matching the latest official ministerial and College Board standards."
      }
    ],
    "targetAudienceAr": "طلاب المدارس العامة واللغات والدبلومة الأمريكية الراغبون في الشرح المباشر مع ميس هبة.",
    "targetAudienceEn": "Students in national, bilingual, and international tracks seeking guidance from Eng. Heba.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني الاشتراك في كورس هبه عياد؟",
        "questionEn": "How do I enroll in Heba Ayad's course?",
        "answerAr": "يمكنك التسجيل على المنصة مجاناً واختيار مرحلتك الدراسية ثم تفعيل الكورس فورياً عبر وسائل الدفع الإلكتروني.",
        "answerEn": "Sign up for free, select your curriculum grade, and instantly activate access using digital payment options."
      },
      {
        "questionAr": "هل يمكن التواصل المباشر مع ميس هبة لطرح الأسئلة؟",
        "questionEn": "Can students ask Eng. Heba questions directly?",
        "answerAr": "نعم، المنصة توفر قنوات تيليجرام وواتساب مخصصة ومراجعات لايف أسبوعية للإجابة على جميع الاستفسارات.",
        "answerEn": "Yes! Dedicated Telegram and WhatsApp channels plus weekly live Q&A sessions ensure direct support."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "heba-ayad",
      "sat-math-explanation",
      "baccalaureate-math-explanation"
    ]
  },
  {
    "id": "heba-abdelwahab",
    "slug": "heba-abdelwahab",
    "slugAliases": [
      "هبه-عبد-الوهاب",
      "هبه-عبدالوهاب"
    ],
    "category": "teacher",
    "categoryNameAr": "ميس هبه عياد (هبه عبد الوهاب)",
    "categoryNameEn": "Eng. Heba Abdel-Wahab (Heba Ayad)",
    "keywordAr": "هبه عبد الوهاب",
    "keywordEn": "Heba Abdelwahab",
    "pageTitleAr": "هبه عبد الوهاب | شرح الرياضيات والماث اونلاين على منصة سبايدر ماث",
    "pageTitleEn": "Heba Abdelwahab | Mathematics & Math Lessons on Spider Math Platform",
    "metaDescriptionAr": "تعرف على هبه عبد الوهاب وكورسات شرح الرياضيات والماث للدبلومة الأمريكية والبكالوريا والثانوية العامة بأحدث أساليب حاسبة ديسموس.",
    "metaDescriptionEn": "Learn with Heba Abdelwahab on Spider Math Platform: advanced mathematics prep for American Diploma, Baccalaureate, and Thanaweya Amma.",
    "tagsAr": [
      "هبه عبد الوهاب",
      "هبه عياد",
      "هبه عبد الوهاب",
      "سبايدر ماث",
      "شرح رياضيات"
    ],
    "tagsEn": [
      "Heba Abdelwahab",
      "Heba Ayad",
      "Heba Abdel-Wahab",
      "Spider Math",
      "Math Tutor"
    ],
    "badgeAr": "المهندسة المحاضرة",
    "badgeEn": "Lead Instructor",
    "headlineAr": "المهندسة هبه عبد الوهاب — مؤسسة منصة سبايدر ماث التعليمية",
    "headlineEn": "Eng. Heba Abdelwahab — Founder of Spider Math Educational Platform",
    "subheadlineAr": "المهندسة هبة عبدالوهاب تضع بين يديك خلاصة خبرتها الأكاديمية لتبسيط أكثر المفاهيم الرياضية تعقيداً.",
    "subheadlineEn": "Eng. Heba Abdel-Wahab delivers elite academic mastery to transform difficult concepts into effortless solutions.",
    "overviewAr": "تقدم هبه عبد الوهاب محتوى تعليمياً فريداً يركز على استيعاب الطالب للمنطق الرياضي واستخدام التكنولوجيا الحديثة مثل حاسبة ديسموس والرسوم التفاعلية لضمان الحصول على الدرجات النهائية وتجاوز الامتحانات التنافسية بثقة تامة.",
    "overviewEn": "Heba Abdelwahab provides a unique pedagogical approach emphasizing logical intuition, Desmos calculator techniques, and continuous personalized feedback to guarantee top honors.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "استراتيجيات الشرح والتطبيق",
        "titleEn": "Pedagogical Framework",
        "detailsAr": "محاضرات مسجلة عالية الوضوح مع ورش تطبيقية مباشرة وشيتات محلولة.",
        "detailsEn": "High-definition video lectures paired with live workshops and step-by-step booklets."
      },
      {
        "titleAr": "بنوك الأسئلة والامتحانات الدورية",
        "titleEn": "Question Banks & Mock Exams",
        "detailsAr": "تدريب على أحدث نماذج الامتحانات الوزارية والدولية.",
        "detailsEn": "Simulations matching the latest official ministerial and College Board standards."
      }
    ],
    "targetAudienceAr": "طلاب المدارس العامة واللغات والدبلومة الأمريكية الراغبون في الشرح المباشر مع ميس هبة.",
    "targetAudienceEn": "Students in national, bilingual, and international tracks seeking guidance from Eng. Heba.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني الاشتراك في كورس هبه عبد الوهاب؟",
        "questionEn": "How do I enroll in Heba Abdelwahab's course?",
        "answerAr": "يمكنك التسجيل على المنصة مجاناً واختيار مرحلتك الدراسية ثم تفعيل الكورس فورياً عبر وسائل الدفع الإلكتروني.",
        "answerEn": "Sign up for free, select your curriculum grade, and instantly activate access using digital payment options."
      },
      {
        "questionAr": "هل يمكن التواصل المباشر مع ميس هبة لطرح الأسئلة؟",
        "questionEn": "Can students ask Eng. Heba questions directly?",
        "answerAr": "نعم، المنصة توفر قنوات تيليجرام وواتساب مخصصة ومراجعات لايف أسبوعية للإجابة على جميع الاستفسارات.",
        "answerEn": "Yes! Dedicated Telegram and WhatsApp channels plus weekly live Q&A sessions ensure direct support."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "heba-ayad",
      "sat-math-explanation",
      "baccalaureate-math-explanation"
    ]
  },
  {
    "id": "hebaayad",
    "slug": "hebaayad",
    "slugAliases": [
      "hebaayad-name"
    ],
    "category": "teacher",
    "categoryNameAr": "ميس هبه عياد (هبه عبد الوهاب)",
    "categoryNameEn": "Eng. Heba Abdel-Wahab (Heba Ayad)",
    "keywordAr": "Hebaayad",
    "keywordEn": "Hebaayad Brand",
    "pageTitleAr": "Hebaayad | شرح الرياضيات والماث اونلاين على منصة سبايدر ماث",
    "pageTitleEn": "Hebaayad Brand | Mathematics & Math Lessons on Spider Math Platform",
    "metaDescriptionAr": "تعرف على Hebaayad وكورسات شرح الرياضيات والماث للدبلومة الأمريكية والبكالوريا والثانوية العامة بأحدث أساليب حاسبة ديسموس.",
    "metaDescriptionEn": "Learn with Hebaayad Brand on Spider Math Platform: advanced mathematics prep for American Diploma, Baccalaureate, and Thanaweya Amma.",
    "tagsAr": [
      "Hebaayad",
      "هبه عياد",
      "هبه عبد الوهاب",
      "سبايدر ماث",
      "شرح رياضيات"
    ],
    "tagsEn": [
      "Hebaayad Brand",
      "Heba Ayad",
      "Heba Abdel-Wahab",
      "Spider Math",
      "Math Tutor"
    ],
    "badgeAr": "العلامة الشخصية",
    "badgeEn": "Personal Brand",
    "headlineAr": "Hebaayad — الاسم الأبرز في تدريس الماث للدبلومة الأمريكية والثانوية العامة",
    "headlineEn": "Hebaayad — The Leading Brand in High-Stakes Standardized Math",
    "subheadlineAr": "المهندسة هبة عبدالوهاب تضع بين يديك خلاصة خبرتها الأكاديمية لتبسيط أكثر المفاهيم الرياضية تعقيداً.",
    "subheadlineEn": "Eng. Heba Abdel-Wahab delivers elite academic mastery to transform difficult concepts into effortless solutions.",
    "overviewAr": "تقدم Hebaayad محتوى تعليمياً فريداً يركز على استيعاب الطالب للمنطق الرياضي واستخدام التكنولوجيا الحديثة مثل حاسبة ديسموس والرسوم التفاعلية لضمان الحصول على الدرجات النهائية وتجاوز الامتحانات التنافسية بثقة تامة.",
    "overviewEn": "Hebaayad Brand provides a unique pedagogical approach emphasizing logical intuition, Desmos calculator techniques, and continuous personalized feedback to guarantee top honors.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "استراتيجيات الشرح والتطبيق",
        "titleEn": "Pedagogical Framework",
        "detailsAr": "محاضرات مسجلة عالية الوضوح مع ورش تطبيقية مباشرة وشيتات محلولة.",
        "detailsEn": "High-definition video lectures paired with live workshops and step-by-step booklets."
      },
      {
        "titleAr": "بنوك الأسئلة والامتحانات الدورية",
        "titleEn": "Question Banks & Mock Exams",
        "detailsAr": "تدريب على أحدث نماذج الامتحانات الوزارية والدولية.",
        "detailsEn": "Simulations matching the latest official ministerial and College Board standards."
      }
    ],
    "targetAudienceAr": "طلاب المدارس العامة واللغات والدبلومة الأمريكية الراغبون في الشرح المباشر مع ميس هبة.",
    "targetAudienceEn": "Students in national, bilingual, and international tracks seeking guidance from Eng. Heba.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني الاشتراك في كورس Hebaayad؟",
        "questionEn": "How do I enroll in Hebaayad Brand's course?",
        "answerAr": "يمكنك التسجيل على المنصة مجاناً واختيار مرحلتك الدراسية ثم تفعيل الكورس فورياً عبر وسائل الدفع الإلكتروني.",
        "answerEn": "Sign up for free, select your curriculum grade, and instantly activate access using digital payment options."
      },
      {
        "questionAr": "هل يمكن التواصل المباشر مع ميس هبة لطرح الأسئلة؟",
        "questionEn": "Can students ask Eng. Heba questions directly?",
        "answerAr": "نعم، المنصة توفر قنوات تيليجرام وواتساب مخصصة ومراجعات لايف أسبوعية للإجابة على جميع الاستفسارات.",
        "answerEn": "Yes! Dedicated Telegram and WhatsApp channels plus weekly live Q&A sessions ensure direct support."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "heba-ayad",
      "sat-math-explanation",
      "baccalaureate-math-explanation"
    ]
  },
  {
    "id": "heba-ayad-en",
    "slug": "heba-ayad-en",
    "slugAliases": [
      "heba-ayad-english"
    ],
    "category": "teacher",
    "categoryNameAr": "ميس هبه عياد (هبه عبد الوهاب)",
    "categoryNameEn": "Eng. Heba Abdel-Wahab (Heba Ayad)",
    "keywordAr": "Heba Ayad",
    "keywordEn": "Heba Ayad (English)",
    "pageTitleAr": "Heba Ayad | شرح الرياضيات والماث اونلاين على منصة سبايدر ماث",
    "pageTitleEn": "Heba Ayad (English) | Mathematics & Math Lessons on Spider Math Platform",
    "metaDescriptionAr": "تعرف على Heba Ayad وكورسات شرح الرياضيات والماث للدبلومة الأمريكية والبكالوريا والثانوية العامة بأحدث أساليب حاسبة ديسموس.",
    "metaDescriptionEn": "Learn with Heba Ayad (English) on Spider Math Platform: advanced mathematics prep for American Diploma, Baccalaureate, and Thanaweya Amma.",
    "tagsAr": [
      "Heba Ayad",
      "هبه عياد",
      "هبه عبد الوهاب",
      "سبايدر ماث",
      "شرح رياضيات"
    ],
    "tagsEn": [
      "Heba Ayad (English)",
      "Heba Ayad",
      "Heba Abdel-Wahab",
      "Spider Math",
      "Math Tutor"
    ],
    "badgeAr": "Math Specialist",
    "badgeEn": "Math Specialist",
    "headlineAr": "Heba Ayad — Master Standardized Tests with Proven Strategies",
    "headlineEn": "Heba Ayad — Master Standardized Tests with Proven Strategies",
    "subheadlineAr": "المهندسة هبة عبدالوهاب تضع بين يديك خلاصة خبرتها الأكاديمية لتبسيط أكثر المفاهيم الرياضية تعقيداً.",
    "subheadlineEn": "Eng. Heba Abdel-Wahab delivers elite academic mastery to transform difficult concepts into effortless solutions.",
    "overviewAr": "تقدم Heba Ayad محتوى تعليمياً فريداً يركز على استيعاب الطالب للمنطق الرياضي واستخدام التكنولوجيا الحديثة مثل حاسبة ديسموس والرسوم التفاعلية لضمان الحصول على الدرجات النهائية وتجاوز الامتحانات التنافسية بثقة تامة.",
    "overviewEn": "Heba Ayad (English) provides a unique pedagogical approach emphasizing logical intuition, Desmos calculator techniques, and continuous personalized feedback to guarantee top honors.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "استراتيجيات الشرح والتطبيق",
        "titleEn": "Pedagogical Framework",
        "detailsAr": "محاضرات مسجلة عالية الوضوح مع ورش تطبيقية مباشرة وشيتات محلولة.",
        "detailsEn": "High-definition video lectures paired with live workshops and step-by-step booklets."
      },
      {
        "titleAr": "بنوك الأسئلة والامتحانات الدورية",
        "titleEn": "Question Banks & Mock Exams",
        "detailsAr": "تدريب على أحدث نماذج الامتحانات الوزارية والدولية.",
        "detailsEn": "Simulations matching the latest official ministerial and College Board standards."
      }
    ],
    "targetAudienceAr": "طلاب المدارس العامة واللغات والدبلومة الأمريكية الراغبون في الشرح المباشر مع ميس هبة.",
    "targetAudienceEn": "Students in national, bilingual, and international tracks seeking guidance from Eng. Heba.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني الاشتراك في كورس Heba Ayad؟",
        "questionEn": "How do I enroll in Heba Ayad (English)'s course?",
        "answerAr": "يمكنك التسجيل على المنصة مجاناً واختيار مرحلتك الدراسية ثم تفعيل الكورس فورياً عبر وسائل الدفع الإلكتروني.",
        "answerEn": "Sign up for free, select your curriculum grade, and instantly activate access using digital payment options."
      },
      {
        "questionAr": "هل يمكن التواصل المباشر مع ميس هبة لطرح الأسئلة؟",
        "questionEn": "Can students ask Eng. Heba questions directly?",
        "answerAr": "نعم، المنصة توفر قنوات تيليجرام وواتساب مخصصة ومراجعات لايف أسبوعية للإجابة على جميع الاستفسارات.",
        "answerEn": "Yes! Dedicated Telegram and WhatsApp channels plus weekly live Q&A sessions ensure direct support."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "heba-ayad",
      "sat-math-explanation",
      "baccalaureate-math-explanation"
    ]
  },
  {
    "id": "heba-abdelwahab-en",
    "slug": "heba-abdelwahab-en",
    "slugAliases": [
      "heba-abdelwahab-english"
    ],
    "category": "teacher",
    "categoryNameAr": "ميس هبه عياد (هبه عبد الوهاب)",
    "categoryNameEn": "Eng. Heba Abdel-Wahab (Heba Ayad)",
    "keywordAr": "Heba Abdelwahab",
    "keywordEn": "Heba Abdelwahab (English)",
    "pageTitleAr": "Heba Abdelwahab | شرح الرياضيات والماث اونلاين على منصة سبايدر ماث",
    "pageTitleEn": "Heba Abdelwahab (English) | Mathematics & Math Lessons on Spider Math Platform",
    "metaDescriptionAr": "تعرف على Heba Abdelwahab وكورسات شرح الرياضيات والماث للدبلومة الأمريكية والبكالوريا والثانوية العامة بأحدث أساليب حاسبة ديسموس.",
    "metaDescriptionEn": "Learn with Heba Abdelwahab (English) on Spider Math Platform: advanced mathematics prep for American Diploma, Baccalaureate, and Thanaweya Amma.",
    "tagsAr": [
      "Heba Abdelwahab",
      "هبه عياد",
      "هبه عبد الوهاب",
      "سبايدر ماث",
      "شرح رياضيات"
    ],
    "tagsEn": [
      "Heba Abdelwahab (English)",
      "Heba Ayad",
      "Heba Abdel-Wahab",
      "Spider Math",
      "Math Tutor"
    ],
    "badgeAr": "Executive Educator",
    "badgeEn": "Executive Educator",
    "headlineAr": "Heba Abdelwahab — Transforming Mathematics Education Through Technology",
    "headlineEn": "Heba Abdelwahab — Transforming Mathematics Education Through Technology",
    "subheadlineAr": "المهندسة هبة عبدالوهاب تضع بين يديك خلاصة خبرتها الأكاديمية لتبسيط أكثر المفاهيم الرياضية تعقيداً.",
    "subheadlineEn": "Eng. Heba Abdel-Wahab delivers elite academic mastery to transform difficult concepts into effortless solutions.",
    "overviewAr": "تقدم Heba Abdelwahab محتوى تعليمياً فريداً يركز على استيعاب الطالب للمنطق الرياضي واستخدام التكنولوجيا الحديثة مثل حاسبة ديسموس والرسوم التفاعلية لضمان الحصول على الدرجات النهائية وتجاوز الامتحانات التنافسية بثقة تامة.",
    "overviewEn": "Heba Abdelwahab (English) provides a unique pedagogical approach emphasizing logical intuition, Desmos calculator techniques, and continuous personalized feedback to guarantee top honors.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "استراتيجيات الشرح والتطبيق",
        "titleEn": "Pedagogical Framework",
        "detailsAr": "محاضرات مسجلة عالية الوضوح مع ورش تطبيقية مباشرة وشيتات محلولة.",
        "detailsEn": "High-definition video lectures paired with live workshops and step-by-step booklets."
      },
      {
        "titleAr": "بنوك الأسئلة والامتحانات الدورية",
        "titleEn": "Question Banks & Mock Exams",
        "detailsAr": "تدريب على أحدث نماذج الامتحانات الوزارية والدولية.",
        "detailsEn": "Simulations matching the latest official ministerial and College Board standards."
      }
    ],
    "targetAudienceAr": "طلاب المدارس العامة واللغات والدبلومة الأمريكية الراغبون في الشرح المباشر مع ميس هبة.",
    "targetAudienceEn": "Students in national, bilingual, and international tracks seeking guidance from Eng. Heba.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني الاشتراك في كورس Heba Abdelwahab؟",
        "questionEn": "How do I enroll in Heba Abdelwahab (English)'s course?",
        "answerAr": "يمكنك التسجيل على المنصة مجاناً واختيار مرحلتك الدراسية ثم تفعيل الكورس فورياً عبر وسائل الدفع الإلكتروني.",
        "answerEn": "Sign up for free, select your curriculum grade, and instantly activate access using digital payment options."
      },
      {
        "questionAr": "هل يمكن التواصل المباشر مع ميس هبة لطرح الأسئلة؟",
        "questionEn": "Can students ask Eng. Heba questions directly?",
        "answerAr": "نعم، المنصة توفر قنوات تيليجرام وواتساب مخصصة ومراجعات لايف أسبوعية للإجابة على جميع الاستفسارات.",
        "answerEn": "Yes! Dedicated Telegram and WhatsApp channels plus weekly live Q&A sessions ensure direct support."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "heba-ayad",
      "sat-math-explanation",
      "baccalaureate-math-explanation"
    ]
  },
  {
    "id": "heba-abdelwahab-lowercase",
    "slug": "heba-abdelwahab-lowercase",
    "slugAliases": [
      "heba-abdelwahab-lower"
    ],
    "category": "teacher",
    "categoryNameAr": "ميس هبه عياد (هبه عبد الوهاب)",
    "categoryNameEn": "Eng. Heba Abdel-Wahab (Heba Ayad)",
    "keywordAr": "Heba abdelwahab",
    "keywordEn": "Heba abdelwahab Portal",
    "pageTitleAr": "Heba abdelwahab | شرح الرياضيات والماث اونلاين على منصة سبايدر ماث",
    "pageTitleEn": "Heba abdelwahab Portal | Mathematics & Math Lessons on Spider Math Platform",
    "metaDescriptionAr": "تعرف على Heba abdelwahab وكورسات شرح الرياضيات والماث للدبلومة الأمريكية والبكالوريا والثانوية العامة بأحدث أساليب حاسبة ديسموس.",
    "metaDescriptionEn": "Learn with Heba abdelwahab Portal on Spider Math Platform: advanced mathematics prep for American Diploma, Baccalaureate, and Thanaweya Amma.",
    "tagsAr": [
      "Heba abdelwahab",
      "هبه عياد",
      "هبه عبد الوهاب",
      "سبايدر ماث",
      "شرح رياضيات"
    ],
    "tagsEn": [
      "Heba abdelwahab Portal",
      "Heba Ayad",
      "Heba Abdel-Wahab",
      "Spider Math",
      "Math Tutor"
    ],
    "badgeAr": "أكاديمية هبة",
    "badgeEn": "Heba Academy",
    "headlineAr": "Heba abdelwahab — كورسات تفاعلية وتمارين مكثفة لجميع المراحل",
    "headlineEn": "Heba abdelwahab — Interactive Courses & Intensive Drills for All Stages",
    "subheadlineAr": "المهندسة هبة عبدالوهاب تضع بين يديك خلاصة خبرتها الأكاديمية لتبسيط أكثر المفاهيم الرياضية تعقيداً.",
    "subheadlineEn": "Eng. Heba Abdel-Wahab delivers elite academic mastery to transform difficult concepts into effortless solutions.",
    "overviewAr": "تقدم Heba abdelwahab محتوى تعليمياً فريداً يركز على استيعاب الطالب للمنطق الرياضي واستخدام التكنولوجيا الحديثة مثل حاسبة ديسموس والرسوم التفاعلية لضمان الحصول على الدرجات النهائية وتجاوز الامتحانات التنافسية بثقة تامة.",
    "overviewEn": "Heba abdelwahab Portal provides a unique pedagogical approach emphasizing logical intuition, Desmos calculator techniques, and continuous personalized feedback to guarantee top honors.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "استراتيجيات الشرح والتطبيق",
        "titleEn": "Pedagogical Framework",
        "detailsAr": "محاضرات مسجلة عالية الوضوح مع ورش تطبيقية مباشرة وشيتات محلولة.",
        "detailsEn": "High-definition video lectures paired with live workshops and step-by-step booklets."
      },
      {
        "titleAr": "بنوك الأسئلة والامتحانات الدورية",
        "titleEn": "Question Banks & Mock Exams",
        "detailsAr": "تدريب على أحدث نماذج الامتحانات الوزارية والدولية.",
        "detailsEn": "Simulations matching the latest official ministerial and College Board standards."
      }
    ],
    "targetAudienceAr": "طلاب المدارس العامة واللغات والدبلومة الأمريكية الراغبون في الشرح المباشر مع ميس هبة.",
    "targetAudienceEn": "Students in national, bilingual, and international tracks seeking guidance from Eng. Heba.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني الاشتراك في كورس Heba abdelwahab؟",
        "questionEn": "How do I enroll in Heba abdelwahab Portal's course?",
        "answerAr": "يمكنك التسجيل على المنصة مجاناً واختيار مرحلتك الدراسية ثم تفعيل الكورس فورياً عبر وسائل الدفع الإلكتروني.",
        "answerEn": "Sign up for free, select your curriculum grade, and instantly activate access using digital payment options."
      },
      {
        "questionAr": "هل يمكن التواصل المباشر مع ميس هبة لطرح الأسئلة؟",
        "questionEn": "Can students ask Eng. Heba questions directly?",
        "answerAr": "نعم، المنصة توفر قنوات تيليجرام وواتساب مخصصة ومراجعات لايف أسبوعية للإجابة على جميع الاستفسارات.",
        "answerEn": "Yes! Dedicated Telegram and WhatsApp channels plus weekly live Q&A sessions ensure direct support."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "heba-ayad",
      "sat-math-explanation",
      "baccalaureate-math-explanation"
    ]
  },
  {
    "id": "miss-heba-ayad",
    "slug": "miss-heba-ayad",
    "slugAliases": [
      "ميس-هبه-عياد",
      "مس-هبه-عياد"
    ],
    "category": "teacher",
    "categoryNameAr": "ميس هبه عياد (هبه عبد الوهاب)",
    "categoryNameEn": "Eng. Heba Abdel-Wahab (Heba Ayad)",
    "keywordAr": "ميس هبه عياد",
    "keywordEn": "Miss Heba Ayad",
    "pageTitleAr": "ميس هبه عياد | شرح الرياضيات والماث اونلاين على منصة سبايدر ماث",
    "pageTitleEn": "Miss Heba Ayad | Mathematics & Math Lessons on Spider Math Platform",
    "metaDescriptionAr": "تعرف على ميس هبه عياد وكورسات شرح الرياضيات والماث للدبلومة الأمريكية والبكالوريا والثانوية العامة بأحدث أساليب حاسبة ديسموس.",
    "metaDescriptionEn": "Learn with Miss Heba Ayad on Spider Math Platform: advanced mathematics prep for American Diploma, Baccalaureate, and Thanaweya Amma.",
    "tagsAr": [
      "ميس هبه عياد",
      "هبه عياد",
      "هبه عبد الوهاب",
      "سبايدر ماث",
      "شرح رياضيات"
    ],
    "tagsEn": [
      "Miss Heba Ayad",
      "Heba Ayad",
      "Heba Abdel-Wahab",
      "Spider Math",
      "Math Tutor"
    ],
    "badgeAr": "ميس الرياضيات",
    "badgeEn": "Beloved Teacher",
    "headlineAr": "ميس هبه عياد — الشرح الممتع والمتابعة الأبوية خطوة بخطوة",
    "headlineEn": "Miss Heba Ayad — Engaging Explanations & Dedicated Step-by-Step Mentorship",
    "subheadlineAr": "المهندسة هبة عبدالوهاب تضع بين يديك خلاصة خبرتها الأكاديمية لتبسيط أكثر المفاهيم الرياضية تعقيداً.",
    "subheadlineEn": "Eng. Heba Abdel-Wahab delivers elite academic mastery to transform difficult concepts into effortless solutions.",
    "overviewAr": "تقدم ميس هبه عياد محتوى تعليمياً فريداً يركز على استيعاب الطالب للمنطق الرياضي واستخدام التكنولوجيا الحديثة مثل حاسبة ديسموس والرسوم التفاعلية لضمان الحصول على الدرجات النهائية وتجاوز الامتحانات التنافسية بثقة تامة.",
    "overviewEn": "Miss Heba Ayad provides a unique pedagogical approach emphasizing logical intuition, Desmos calculator techniques, and continuous personalized feedback to guarantee top honors.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "استراتيجيات الشرح والتطبيق",
        "titleEn": "Pedagogical Framework",
        "detailsAr": "محاضرات مسجلة عالية الوضوح مع ورش تطبيقية مباشرة وشيتات محلولة.",
        "detailsEn": "High-definition video lectures paired with live workshops and step-by-step booklets."
      },
      {
        "titleAr": "بنوك الأسئلة والامتحانات الدورية",
        "titleEn": "Question Banks & Mock Exams",
        "detailsAr": "تدريب على أحدث نماذج الامتحانات الوزارية والدولية.",
        "detailsEn": "Simulations matching the latest official ministerial and College Board standards."
      }
    ],
    "targetAudienceAr": "طلاب المدارس العامة واللغات والدبلومة الأمريكية الراغبون في الشرح المباشر مع ميس هبة.",
    "targetAudienceEn": "Students in national, bilingual, and international tracks seeking guidance from Eng. Heba.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني الاشتراك في كورس ميس هبه عياد؟",
        "questionEn": "How do I enroll in Miss Heba Ayad's course?",
        "answerAr": "يمكنك التسجيل على المنصة مجاناً واختيار مرحلتك الدراسية ثم تفعيل الكورس فورياً عبر وسائل الدفع الإلكتروني.",
        "answerEn": "Sign up for free, select your curriculum grade, and instantly activate access using digital payment options."
      },
      {
        "questionAr": "هل يمكن التواصل المباشر مع ميس هبة لطرح الأسئلة؟",
        "questionEn": "Can students ask Eng. Heba questions directly?",
        "answerAr": "نعم، المنصة توفر قنوات تيليجرام وواتساب مخصصة ومراجعات لايف أسبوعية للإجابة على جميع الاستفسارات.",
        "answerEn": "Yes! Dedicated Telegram and WhatsApp channels plus weekly live Q&A sessions ensure direct support."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "heba-ayad",
      "sat-math-explanation",
      "baccalaureate-math-explanation"
    ]
  },
  {
    "id": "miss-heba-abdelwahab",
    "slug": "miss-heba-abdelwahab",
    "slugAliases": [
      "ميس-هبه-عبد-الوهاب"
    ],
    "category": "teacher",
    "categoryNameAr": "ميس هبه عياد (هبه عبد الوهاب)",
    "categoryNameEn": "Eng. Heba Abdel-Wahab (Heba Ayad)",
    "keywordAr": "ميس هبه عبد الوهاب",
    "keywordEn": "Miss Heba Abdelwahab",
    "pageTitleAr": "ميس هبه عبد الوهاب | شرح الرياضيات والماث اونلاين على منصة سبايدر ماث",
    "pageTitleEn": "Miss Heba Abdelwahab | Mathematics & Math Lessons on Spider Math Platform",
    "metaDescriptionAr": "تعرف على ميس هبه عبد الوهاب وكورسات شرح الرياضيات والماث للدبلومة الأمريكية والبكالوريا والثانوية العامة بأحدث أساليب حاسبة ديسموس.",
    "metaDescriptionEn": "Learn with Miss Heba Abdelwahab on Spider Math Platform: advanced mathematics prep for American Diploma, Baccalaureate, and Thanaweya Amma.",
    "tagsAr": [
      "ميس هبه عبد الوهاب",
      "هبه عياد",
      "هبه عبد الوهاب",
      "سبايدر ماث",
      "شرح رياضيات"
    ],
    "tagsEn": [
      "Miss Heba Abdelwahab",
      "Heba Ayad",
      "Heba Abdel-Wahab",
      "Spider Math",
      "Math Tutor"
    ],
    "badgeAr": "الريادة التعليمية",
    "badgeEn": "Master Mentor",
    "headlineAr": "ميس هبه عبد الوهاب — طريقك الأضمن لتحقيق الدرجات النهائية في الامتحانات",
    "headlineEn": "Miss Heba Abdelwahab — Your Guaranteed Track to 100% Exam Marks",
    "subheadlineAr": "المهندسة هبة عبدالوهاب تضع بين يديك خلاصة خبرتها الأكاديمية لتبسيط أكثر المفاهيم الرياضية تعقيداً.",
    "subheadlineEn": "Eng. Heba Abdel-Wahab delivers elite academic mastery to transform difficult concepts into effortless solutions.",
    "overviewAr": "تقدم ميس هبه عبد الوهاب محتوى تعليمياً فريداً يركز على استيعاب الطالب للمنطق الرياضي واستخدام التكنولوجيا الحديثة مثل حاسبة ديسموس والرسوم التفاعلية لضمان الحصول على الدرجات النهائية وتجاوز الامتحانات التنافسية بثقة تامة.",
    "overviewEn": "Miss Heba Abdelwahab provides a unique pedagogical approach emphasizing logical intuition, Desmos calculator techniques, and continuous personalized feedback to guarantee top honors.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "استراتيجيات الشرح والتطبيق",
        "titleEn": "Pedagogical Framework",
        "detailsAr": "محاضرات مسجلة عالية الوضوح مع ورش تطبيقية مباشرة وشيتات محلولة.",
        "detailsEn": "High-definition video lectures paired with live workshops and step-by-step booklets."
      },
      {
        "titleAr": "بنوك الأسئلة والامتحانات الدورية",
        "titleEn": "Question Banks & Mock Exams",
        "detailsAr": "تدريب على أحدث نماذج الامتحانات الوزارية والدولية.",
        "detailsEn": "Simulations matching the latest official ministerial and College Board standards."
      }
    ],
    "targetAudienceAr": "طلاب المدارس العامة واللغات والدبلومة الأمريكية الراغبون في الشرح المباشر مع ميس هبة.",
    "targetAudienceEn": "Students in national, bilingual, and international tracks seeking guidance from Eng. Heba.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني الاشتراك في كورس ميس هبه عبد الوهاب؟",
        "questionEn": "How do I enroll in Miss Heba Abdelwahab's course?",
        "answerAr": "يمكنك التسجيل على المنصة مجاناً واختيار مرحلتك الدراسية ثم تفعيل الكورس فورياً عبر وسائل الدفع الإلكتروني.",
        "answerEn": "Sign up for free, select your curriculum grade, and instantly activate access using digital payment options."
      },
      {
        "questionAr": "هل يمكن التواصل المباشر مع ميس هبة لطرح الأسئلة؟",
        "questionEn": "Can students ask Eng. Heba questions directly?",
        "answerAr": "نعم، المنصة توفر قنوات تيليجرام وواتساب مخصصة ومراجعات لايف أسبوعية للإجابة على جميع الاستفسارات.",
        "answerEn": "Yes! Dedicated Telegram and WhatsApp channels plus weekly live Q&A sessions ensure direct support."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "heba-ayad",
      "sat-math-explanation",
      "baccalaureate-math-explanation"
    ]
  },
  {
    "id": "heba-ayad-mathematics",
    "slug": "heba-ayad-mathematics",
    "slugAliases": [
      "هبه-عياد-رياضيات"
    ],
    "category": "teacher",
    "categoryNameAr": "ميس هبه عياد (هبه عبد الوهاب)",
    "categoryNameEn": "Eng. Heba Abdel-Wahab (Heba Ayad)",
    "keywordAr": "هبه عياد رياضيات",
    "keywordEn": "Heba Ayad Mathematics",
    "pageTitleAr": "هبه عياد رياضيات | شرح الرياضيات والماث اونلاين على منصة سبايدر ماث",
    "pageTitleEn": "Heba Ayad Mathematics | Mathematics & Math Lessons on Spider Math Platform",
    "metaDescriptionAr": "تعرف على هبه عياد رياضيات وكورسات شرح الرياضيات والماث للدبلومة الأمريكية والبكالوريا والثانوية العامة بأحدث أساليب حاسبة ديسموس.",
    "metaDescriptionEn": "Learn with Heba Ayad Mathematics on Spider Math Platform: advanced mathematics prep for American Diploma, Baccalaureate, and Thanaweya Amma.",
    "tagsAr": [
      "هبه عياد رياضيات",
      "هبه عياد",
      "هبه عبد الوهاب",
      "سبايدر ماث",
      "شرح رياضيات"
    ],
    "tagsEn": [
      "Heba Ayad Mathematics",
      "Heba Ayad",
      "Heba Abdel-Wahab",
      "Spider Math",
      "Math Tutor"
    ],
    "badgeAr": "قسم الرياضيات",
    "badgeEn": "Mathematics Division",
    "headlineAr": "هبه عياد رياضيات — تدريس معمق لفروع الجبر والتفاضل والميكانيكا",
    "headlineEn": "Heba Ayad Mathematics — In-Depth Algebra, Calculus, and Mechanics Mastery",
    "subheadlineAr": "المهندسة هبة عبدالوهاب تضع بين يديك خلاصة خبرتها الأكاديمية لتبسيط أكثر المفاهيم الرياضية تعقيداً.",
    "subheadlineEn": "Eng. Heba Abdel-Wahab delivers elite academic mastery to transform difficult concepts into effortless solutions.",
    "overviewAr": "تقدم هبه عياد رياضيات محتوى تعليمياً فريداً يركز على استيعاب الطالب للمنطق الرياضي واستخدام التكنولوجيا الحديثة مثل حاسبة ديسموس والرسوم التفاعلية لضمان الحصول على الدرجات النهائية وتجاوز الامتحانات التنافسية بثقة تامة.",
    "overviewEn": "Heba Ayad Mathematics provides a unique pedagogical approach emphasizing logical intuition, Desmos calculator techniques, and continuous personalized feedback to guarantee top honors.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "استراتيجيات الشرح والتطبيق",
        "titleEn": "Pedagogical Framework",
        "detailsAr": "محاضرات مسجلة عالية الوضوح مع ورش تطبيقية مباشرة وشيتات محلولة.",
        "detailsEn": "High-definition video lectures paired with live workshops and step-by-step booklets."
      },
      {
        "titleAr": "بنوك الأسئلة والامتحانات الدورية",
        "titleEn": "Question Banks & Mock Exams",
        "detailsAr": "تدريب على أحدث نماذج الامتحانات الوزارية والدولية.",
        "detailsEn": "Simulations matching the latest official ministerial and College Board standards."
      }
    ],
    "targetAudienceAr": "طلاب المدارس العامة واللغات والدبلومة الأمريكية الراغبون في الشرح المباشر مع ميس هبة.",
    "targetAudienceEn": "Students in national, bilingual, and international tracks seeking guidance from Eng. Heba.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني الاشتراك في كورس هبه عياد رياضيات؟",
        "questionEn": "How do I enroll in Heba Ayad Mathematics's course?",
        "answerAr": "يمكنك التسجيل على المنصة مجاناً واختيار مرحلتك الدراسية ثم تفعيل الكورس فورياً عبر وسائل الدفع الإلكتروني.",
        "answerEn": "Sign up for free, select your curriculum grade, and instantly activate access using digital payment options."
      },
      {
        "questionAr": "هل يمكن التواصل المباشر مع ميس هبة لطرح الأسئلة؟",
        "questionEn": "Can students ask Eng. Heba questions directly?",
        "answerAr": "نعم، المنصة توفر قنوات تيليجرام وواتساب مخصصة ومراجعات لايف أسبوعية للإجابة على جميع الاستفسارات.",
        "answerEn": "Yes! Dedicated Telegram and WhatsApp channels plus weekly live Q&A sessions ensure direct support."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "heba-ayad",
      "sat-math-explanation",
      "baccalaureate-math-explanation"
    ]
  },
  {
    "id": "heba-ayad-math",
    "slug": "heba-ayad-math",
    "slugAliases": [
      "هبه-عياد-ماث"
    ],
    "category": "teacher",
    "categoryNameAr": "ميس هبه عياد (هبه عبد الوهاب)",
    "categoryNameEn": "Eng. Heba Abdel-Wahab (Heba Ayad)",
    "keywordAr": "هبه عياد ماث",
    "keywordEn": "Heba Ayad Math",
    "pageTitleAr": "هبه عياد ماث | شرح الرياضيات والماث اونلاين على منصة سبايدر ماث",
    "pageTitleEn": "Heba Ayad Math | Mathematics & Math Lessons on Spider Math Platform",
    "metaDescriptionAr": "تعرف على هبه عياد ماث وكورسات شرح الرياضيات والماث للدبلومة الأمريكية والبكالوريا والثانوية العامة بأحدث أساليب حاسبة ديسموس.",
    "metaDescriptionEn": "Learn with Heba Ayad Math on Spider Math Platform: advanced mathematics prep for American Diploma, Baccalaureate, and Thanaweya Amma.",
    "tagsAr": [
      "هبه عياد ماث",
      "هبه عياد",
      "هبه عبد الوهاب",
      "سبايدر ماث",
      "شرح رياضيات"
    ],
    "tagsEn": [
      "Heba Ayad Math",
      "Heba Ayad",
      "Heba Abdel-Wahab",
      "Spider Math",
      "Math Tutor"
    ],
    "badgeAr": "International Math",
    "badgeEn": "International Math",
    "headlineAr": "هبه عياد ماث — كورسات اللغات والدبلومة الأمريكية بأحدث أساليب ديسموس",
    "headlineEn": "Heba Ayad Math — Language Schools & American Diploma Desmos Tactics",
    "subheadlineAr": "المهندسة هبة عبدالوهاب تضع بين يديك خلاصة خبرتها الأكاديمية لتبسيط أكثر المفاهيم الرياضية تعقيداً.",
    "subheadlineEn": "Eng. Heba Abdel-Wahab delivers elite academic mastery to transform difficult concepts into effortless solutions.",
    "overviewAr": "تقدم هبه عياد ماث محتوى تعليمياً فريداً يركز على استيعاب الطالب للمنطق الرياضي واستخدام التكنولوجيا الحديثة مثل حاسبة ديسموس والرسوم التفاعلية لضمان الحصول على الدرجات النهائية وتجاوز الامتحانات التنافسية بثقة تامة.",
    "overviewEn": "Heba Ayad Math provides a unique pedagogical approach emphasizing logical intuition, Desmos calculator techniques, and continuous personalized feedback to guarantee top honors.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "استراتيجيات الشرح والتطبيق",
        "titleEn": "Pedagogical Framework",
        "detailsAr": "محاضرات مسجلة عالية الوضوح مع ورش تطبيقية مباشرة وشيتات محلولة.",
        "detailsEn": "High-definition video lectures paired with live workshops and step-by-step booklets."
      },
      {
        "titleAr": "بنوك الأسئلة والامتحانات الدورية",
        "titleEn": "Question Banks & Mock Exams",
        "detailsAr": "تدريب على أحدث نماذج الامتحانات الوزارية والدولية.",
        "detailsEn": "Simulations matching the latest official ministerial and College Board standards."
      }
    ],
    "targetAudienceAr": "طلاب المدارس العامة واللغات والدبلومة الأمريكية الراغبون في الشرح المباشر مع ميس هبة.",
    "targetAudienceEn": "Students in national, bilingual, and international tracks seeking guidance from Eng. Heba.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني الاشتراك في كورس هبه عياد ماث؟",
        "questionEn": "How do I enroll in Heba Ayad Math's course?",
        "answerAr": "يمكنك التسجيل على المنصة مجاناً واختيار مرحلتك الدراسية ثم تفعيل الكورس فورياً عبر وسائل الدفع الإلكتروني.",
        "answerEn": "Sign up for free, select your curriculum grade, and instantly activate access using digital payment options."
      },
      {
        "questionAr": "هل يمكن التواصل المباشر مع ميس هبة لطرح الأسئلة؟",
        "questionEn": "Can students ask Eng. Heba questions directly?",
        "answerAr": "نعم، المنصة توفر قنوات تيليجرام وواتساب مخصصة ومراجعات لايف أسبوعية للإجابة على جميع الاستفسارات.",
        "answerEn": "Yes! Dedicated Telegram and WhatsApp channels plus weekly live Q&A sessions ensure direct support."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "heba-ayad",
      "sat-math-explanation",
      "baccalaureate-math-explanation"
    ]
  },
  {
    "id": "mathematics-lessons-with-heba-ayad",
    "slug": "mathematics-lessons-with-heba-ayad",
    "slugAliases": [
      "شرح-رياضيات-مع-هبه-عياد"
    ],
    "category": "teacher",
    "categoryNameAr": "ميس هبه عياد (هبه عبد الوهاب)",
    "categoryNameEn": "Eng. Heba Abdel-Wahab (Heba Ayad)",
    "keywordAr": "شرح رياضيات مع هبه عياد",
    "keywordEn": "Mathematics Lessons with Heba Ayad",
    "pageTitleAr": "شرح رياضيات مع هبه عياد | شرح الرياضيات والماث اونلاين على منصة سبايدر ماث",
    "pageTitleEn": "Mathematics Lessons with Heba Ayad | Mathematics & Math Lessons on Spider Math Platform",
    "metaDescriptionAr": "تعرف على شرح رياضيات مع هبه عياد وكورسات شرح الرياضيات والماث للدبلومة الأمريكية والبكالوريا والثانوية العامة بأحدث أساليب حاسبة ديسموس.",
    "metaDescriptionEn": "Learn with Mathematics Lessons with Heba Ayad on Spider Math Platform: advanced mathematics prep for American Diploma, Baccalaureate, and Thanaweya Amma.",
    "tagsAr": [
      "شرح رياضيات مع هبه عياد",
      "هبه عياد",
      "هبه عبد الوهاب",
      "سبايدر ماث",
      "شرح رياضيات"
    ],
    "tagsEn": [
      "Mathematics Lessons with Heba Ayad",
      "Heba Ayad",
      "Heba Abdel-Wahab",
      "Spider Math",
      "Math Tutor"
    ],
    "badgeAr": "شروحات حصرية",
    "badgeEn": "Exclusive Lessons",
    "headlineAr": "شرح رياضيات مع هبه عياد — فهم حقيقي قبل الحفظ وتطبيق عملي مستمر",
    "headlineEn": "Mathematics Lessons with Heba Ayad — Intuitive Understanding & Continuous Practice",
    "subheadlineAr": "المهندسة هبة عبدالوهاب تضع بين يديك خلاصة خبرتها الأكاديمية لتبسيط أكثر المفاهيم الرياضية تعقيداً.",
    "subheadlineEn": "Eng. Heba Abdel-Wahab delivers elite academic mastery to transform difficult concepts into effortless solutions.",
    "overviewAr": "تقدم شرح رياضيات مع هبه عياد محتوى تعليمياً فريداً يركز على استيعاب الطالب للمنطق الرياضي واستخدام التكنولوجيا الحديثة مثل حاسبة ديسموس والرسوم التفاعلية لضمان الحصول على الدرجات النهائية وتجاوز الامتحانات التنافسية بثقة تامة.",
    "overviewEn": "Mathematics Lessons with Heba Ayad provides a unique pedagogical approach emphasizing logical intuition, Desmos calculator techniques, and continuous personalized feedback to guarantee top honors.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "استراتيجيات الشرح والتطبيق",
        "titleEn": "Pedagogical Framework",
        "detailsAr": "محاضرات مسجلة عالية الوضوح مع ورش تطبيقية مباشرة وشيتات محلولة.",
        "detailsEn": "High-definition video lectures paired with live workshops and step-by-step booklets."
      },
      {
        "titleAr": "بنوك الأسئلة والامتحانات الدورية",
        "titleEn": "Question Banks & Mock Exams",
        "detailsAr": "تدريب على أحدث نماذج الامتحانات الوزارية والدولية.",
        "detailsEn": "Simulations matching the latest official ministerial and College Board standards."
      }
    ],
    "targetAudienceAr": "طلاب المدارس العامة واللغات والدبلومة الأمريكية الراغبون في الشرح المباشر مع ميس هبة.",
    "targetAudienceEn": "Students in national, bilingual, and international tracks seeking guidance from Eng. Heba.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني الاشتراك في كورس شرح رياضيات مع هبه عياد؟",
        "questionEn": "How do I enroll in Mathematics Lessons with Heba Ayad's course?",
        "answerAr": "يمكنك التسجيل على المنصة مجاناً واختيار مرحلتك الدراسية ثم تفعيل الكورس فورياً عبر وسائل الدفع الإلكتروني.",
        "answerEn": "Sign up for free, select your curriculum grade, and instantly activate access using digital payment options."
      },
      {
        "questionAr": "هل يمكن التواصل المباشر مع ميس هبة لطرح الأسئلة؟",
        "questionEn": "Can students ask Eng. Heba questions directly?",
        "answerAr": "نعم، المنصة توفر قنوات تيليجرام وواتساب مخصصة ومراجعات لايف أسبوعية للإجابة على جميع الاستفسارات.",
        "answerEn": "Yes! Dedicated Telegram and WhatsApp channels plus weekly live Q&A sessions ensure direct support."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "heba-ayad",
      "sat-math-explanation",
      "baccalaureate-math-explanation"
    ]
  },
  {
    "id": "math-lessons-with-heba-ayad",
    "slug": "math-lessons-with-heba-ayad",
    "slugAliases": [
      "شرح-ماث-مع-هبه-عياد"
    ],
    "category": "teacher",
    "categoryNameAr": "ميس هبه عياد (هبه عبد الوهاب)",
    "categoryNameEn": "Eng. Heba Abdel-Wahab (Heba Ayad)",
    "keywordAr": "شرح ماث مع هبه عياد",
    "keywordEn": "Math Lessons with Heba Ayad",
    "pageTitleAr": "شرح ماث مع هبه عياد | شرح الرياضيات والماث اونلاين على منصة سبايدر ماث",
    "pageTitleEn": "Math Lessons with Heba Ayad | Mathematics & Math Lessons on Spider Math Platform",
    "metaDescriptionAr": "تعرف على شرح ماث مع هبه عياد وكورسات شرح الرياضيات والماث للدبلومة الأمريكية والبكالوريا والثانوية العامة بأحدث أساليب حاسبة ديسموس.",
    "metaDescriptionEn": "Learn with Math Lessons with Heba Ayad on Spider Math Platform: advanced mathematics prep for American Diploma, Baccalaureate, and Thanaweya Amma.",
    "tagsAr": [
      "شرح ماث مع هبه عياد",
      "هبه عياد",
      "هبه عبد الوهاب",
      "سبايدر ماث",
      "شرح رياضيات"
    ],
    "tagsEn": [
      "Math Lessons with Heba Ayad",
      "Heba Ayad",
      "Heba Abdel-Wahab",
      "Spider Math",
      "Math Tutor"
    ],
    "badgeAr": "دروس تفاعلية",
    "badgeEn": "Interactive Sessions",
    "headlineAr": "شرح ماث مع هبه عياد — اكتشف أسهل الطرق لحل مسائل الماث المعقدة",
    "headlineEn": "Math Lessons with Heba Ayad — The Easiest Shortcuts for Intricate Math Questions",
    "subheadlineAr": "المهندسة هبة عبدالوهاب تضع بين يديك خلاصة خبرتها الأكاديمية لتبسيط أكثر المفاهيم الرياضية تعقيداً.",
    "subheadlineEn": "Eng. Heba Abdel-Wahab delivers elite academic mastery to transform difficult concepts into effortless solutions.",
    "overviewAr": "تقدم شرح ماث مع هبه عياد محتوى تعليمياً فريداً يركز على استيعاب الطالب للمنطق الرياضي واستخدام التكنولوجيا الحديثة مثل حاسبة ديسموس والرسوم التفاعلية لضمان الحصول على الدرجات النهائية وتجاوز الامتحانات التنافسية بثقة تامة.",
    "overviewEn": "Math Lessons with Heba Ayad provides a unique pedagogical approach emphasizing logical intuition, Desmos calculator techniques, and continuous personalized feedback to guarantee top honors.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "استراتيجيات الشرح والتطبيق",
        "titleEn": "Pedagogical Framework",
        "detailsAr": "محاضرات مسجلة عالية الوضوح مع ورش تطبيقية مباشرة وشيتات محلولة.",
        "detailsEn": "High-definition video lectures paired with live workshops and step-by-step booklets."
      },
      {
        "titleAr": "بنوك الأسئلة والامتحانات الدورية",
        "titleEn": "Question Banks & Mock Exams",
        "detailsAr": "تدريب على أحدث نماذج الامتحانات الوزارية والدولية.",
        "detailsEn": "Simulations matching the latest official ministerial and College Board standards."
      }
    ],
    "targetAudienceAr": "طلاب المدارس العامة واللغات والدبلومة الأمريكية الراغبون في الشرح المباشر مع ميس هبة.",
    "targetAudienceEn": "Students in national, bilingual, and international tracks seeking guidance from Eng. Heba.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني الاشتراك في كورس شرح ماث مع هبه عياد؟",
        "questionEn": "How do I enroll in Math Lessons with Heba Ayad's course?",
        "answerAr": "يمكنك التسجيل على المنصة مجاناً واختيار مرحلتك الدراسية ثم تفعيل الكورس فورياً عبر وسائل الدفع الإلكتروني.",
        "answerEn": "Sign up for free, select your curriculum grade, and instantly activate access using digital payment options."
      },
      {
        "questionAr": "هل يمكن التواصل المباشر مع ميس هبة لطرح الأسئلة؟",
        "questionEn": "Can students ask Eng. Heba questions directly?",
        "answerAr": "نعم، المنصة توفر قنوات تيليجرام وواتساب مخصصة ومراجعات لايف أسبوعية للإجابة على جميع الاستفسارات.",
        "answerEn": "Yes! Dedicated Telegram and WhatsApp channels plus weekly live Q&A sessions ensure direct support."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "heba-ayad",
      "sat-math-explanation",
      "baccalaureate-math-explanation"
    ]
  },
  {
    "id": "heba-ayad-mathematics-platform",
    "slug": "heba-ayad-mathematics-platform",
    "slugAliases": [
      "منصة-هبه-عياد-للرياضيات"
    ],
    "category": "teacher",
    "categoryNameAr": "ميس هبه عياد (هبه عبد الوهاب)",
    "categoryNameEn": "Eng. Heba Abdel-Wahab (Heba Ayad)",
    "keywordAr": "منصة هبه عياد للرياضيات",
    "keywordEn": "Heba Ayad Mathematics Platform",
    "pageTitleAr": "منصة هبه عياد للرياضيات | شرح الرياضيات والماث اونلاين على منصة سبايدر ماث",
    "pageTitleEn": "Heba Ayad Mathematics Platform | Mathematics & Math Lessons on Spider Math Platform",
    "metaDescriptionAr": "تعرف على منصة هبه عياد للرياضيات وكورسات شرح الرياضيات والماث للدبلومة الأمريكية والبكالوريا والثانوية العامة بأحدث أساليب حاسبة ديسموس.",
    "metaDescriptionEn": "Learn with Heba Ayad Mathematics Platform on Spider Math Platform: advanced mathematics prep for American Diploma, Baccalaureate, and Thanaweya Amma.",
    "tagsAr": [
      "منصة هبه عياد للرياضيات",
      "هبه عياد",
      "هبه عبد الوهاب",
      "سبايدر ماث",
      "شرح رياضيات"
    ],
    "tagsEn": [
      "Heba Ayad Mathematics Platform",
      "Heba Ayad",
      "Heba Abdel-Wahab",
      "Spider Math",
      "Math Tutor"
    ],
    "badgeAr": "المنصة الرسمية",
    "badgeEn": "Official Portal",
    "headlineAr": "منصة هبه عياد للرياضيات — كل ما يحتاجه طالب الرياضيات في مكان واحد",
    "headlineEn": "Heba Ayad Mathematics Platform — Everything a Math Student Needs Under One Roof",
    "subheadlineAr": "المهندسة هبة عبدالوهاب تضع بين يديك خلاصة خبرتها الأكاديمية لتبسيط أكثر المفاهيم الرياضية تعقيداً.",
    "subheadlineEn": "Eng. Heba Abdel-Wahab delivers elite academic mastery to transform difficult concepts into effortless solutions.",
    "overviewAr": "تقدم منصة هبه عياد للرياضيات محتوى تعليمياً فريداً يركز على استيعاب الطالب للمنطق الرياضي واستخدام التكنولوجيا الحديثة مثل حاسبة ديسموس والرسوم التفاعلية لضمان الحصول على الدرجات النهائية وتجاوز الامتحانات التنافسية بثقة تامة.",
    "overviewEn": "Heba Ayad Mathematics Platform provides a unique pedagogical approach emphasizing logical intuition, Desmos calculator techniques, and continuous personalized feedback to guarantee top honors.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "استراتيجيات الشرح والتطبيق",
        "titleEn": "Pedagogical Framework",
        "detailsAr": "محاضرات مسجلة عالية الوضوح مع ورش تطبيقية مباشرة وشيتات محلولة.",
        "detailsEn": "High-definition video lectures paired with live workshops and step-by-step booklets."
      },
      {
        "titleAr": "بنوك الأسئلة والامتحانات الدورية",
        "titleEn": "Question Banks & Mock Exams",
        "detailsAr": "تدريب على أحدث نماذج الامتحانات الوزارية والدولية.",
        "detailsEn": "Simulations matching the latest official ministerial and College Board standards."
      }
    ],
    "targetAudienceAr": "طلاب المدارس العامة واللغات والدبلومة الأمريكية الراغبون في الشرح المباشر مع ميس هبة.",
    "targetAudienceEn": "Students in national, bilingual, and international tracks seeking guidance from Eng. Heba.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني الاشتراك في كورس منصة هبه عياد للرياضيات؟",
        "questionEn": "How do I enroll in Heba Ayad Mathematics Platform's course?",
        "answerAr": "يمكنك التسجيل على المنصة مجاناً واختيار مرحلتك الدراسية ثم تفعيل الكورس فورياً عبر وسائل الدفع الإلكتروني.",
        "answerEn": "Sign up for free, select your curriculum grade, and instantly activate access using digital payment options."
      },
      {
        "questionAr": "هل يمكن التواصل المباشر مع ميس هبة لطرح الأسئلة؟",
        "questionEn": "Can students ask Eng. Heba questions directly?",
        "answerAr": "نعم، المنصة توفر قنوات تيليجرام وواتساب مخصصة ومراجعات لايف أسبوعية للإجابة على جميع الاستفسارات.",
        "answerEn": "Yes! Dedicated Telegram and WhatsApp channels plus weekly live Q&A sessions ensure direct support."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "heba-ayad",
      "sat-math-explanation",
      "baccalaureate-math-explanation"
    ]
  },
  {
    "id": "heba-ayad-spider-math",
    "slug": "heba-ayad-spider-math",
    "slugAliases": [
      "هبه-عياد-spider-math"
    ],
    "category": "teacher",
    "categoryNameAr": "ميس هبه عياد (هبه عبد الوهاب)",
    "categoryNameEn": "Eng. Heba Abdel-Wahab (Heba Ayad)",
    "keywordAr": "هبه عياد Spider Math",
    "keywordEn": "Heba Ayad Spider Math",
    "pageTitleAr": "هبه عياد Spider Math | شرح الرياضيات والماث اونلاين على منصة سبايدر ماث",
    "pageTitleEn": "Heba Ayad Spider Math | Mathematics & Math Lessons on Spider Math Platform",
    "metaDescriptionAr": "تعرف على هبه عياد Spider Math وكورسات شرح الرياضيات والماث للدبلومة الأمريكية والبكالوريا والثانوية العامة بأحدث أساليب حاسبة ديسموس.",
    "metaDescriptionEn": "Learn with Heba Ayad Spider Math on Spider Math Platform: advanced mathematics prep for American Diploma, Baccalaureate, and Thanaweya Amma.",
    "tagsAr": [
      "هبه عياد Spider Math",
      "هبه عياد",
      "هبه عبد الوهاب",
      "سبايدر ماث",
      "شرح رياضيات"
    ],
    "tagsEn": [
      "Heba Ayad Spider Math",
      "Heba Ayad",
      "Heba Abdel-Wahab",
      "Spider Math",
      "Math Tutor"
    ],
    "badgeAr": "المنظومة المشتركة",
    "badgeEn": "Unified Ecosystem",
    "headlineAr": "هبه عياد Spider Math — القوة الأكاديمية المدعومة بأحدث التقنيات الرقمية",
    "headlineEn": "Heba Ayad Spider Math — Academic Rigor Powered by Advanced EdTech",
    "subheadlineAr": "المهندسة هبة عبدالوهاب تضع بين يديك خلاصة خبرتها الأكاديمية لتبسيط أكثر المفاهيم الرياضية تعقيداً.",
    "subheadlineEn": "Eng. Heba Abdel-Wahab delivers elite academic mastery to transform difficult concepts into effortless solutions.",
    "overviewAr": "تقدم هبه عياد Spider Math محتوى تعليمياً فريداً يركز على استيعاب الطالب للمنطق الرياضي واستخدام التكنولوجيا الحديثة مثل حاسبة ديسموس والرسوم التفاعلية لضمان الحصول على الدرجات النهائية وتجاوز الامتحانات التنافسية بثقة تامة.",
    "overviewEn": "Heba Ayad Spider Math provides a unique pedagogical approach emphasizing logical intuition, Desmos calculator techniques, and continuous personalized feedback to guarantee top honors.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "استراتيجيات الشرح والتطبيق",
        "titleEn": "Pedagogical Framework",
        "detailsAr": "محاضرات مسجلة عالية الوضوح مع ورش تطبيقية مباشرة وشيتات محلولة.",
        "detailsEn": "High-definition video lectures paired with live workshops and step-by-step booklets."
      },
      {
        "titleAr": "بنوك الأسئلة والامتحانات الدورية",
        "titleEn": "Question Banks & Mock Exams",
        "detailsAr": "تدريب على أحدث نماذج الامتحانات الوزارية والدولية.",
        "detailsEn": "Simulations matching the latest official ministerial and College Board standards."
      }
    ],
    "targetAudienceAr": "طلاب المدارس العامة واللغات والدبلومة الأمريكية الراغبون في الشرح المباشر مع ميس هبة.",
    "targetAudienceEn": "Students in national, bilingual, and international tracks seeking guidance from Eng. Heba.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني الاشتراك في كورس هبه عياد Spider Math؟",
        "questionEn": "How do I enroll in Heba Ayad Spider Math's course?",
        "answerAr": "يمكنك التسجيل على المنصة مجاناً واختيار مرحلتك الدراسية ثم تفعيل الكورس فورياً عبر وسائل الدفع الإلكتروني.",
        "answerEn": "Sign up for free, select your curriculum grade, and instantly activate access using digital payment options."
      },
      {
        "questionAr": "هل يمكن التواصل المباشر مع ميس هبة لطرح الأسئلة؟",
        "questionEn": "Can students ask Eng. Heba questions directly?",
        "answerAr": "نعم، المنصة توفر قنوات تيليجرام وواتساب مخصصة ومراجعات لايف أسبوعية للإجابة على جميع الاستفسارات.",
        "answerEn": "Yes! Dedicated Telegram and WhatsApp channels plus weekly live Q&A sessions ensure direct support."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "heba-ayad",
      "sat-math-explanation",
      "baccalaureate-math-explanation"
    ]
  },
  {
    "id": "spider-math-with-heba-ayad",
    "slug": "spider-math-with-heba-ayad",
    "slugAliases": [
      "spider-math-مع-هبه-عياد"
    ],
    "category": "teacher",
    "categoryNameAr": "ميس هبه عياد (هبه عبد الوهاب)",
    "categoryNameEn": "Eng. Heba Abdel-Wahab (Heba Ayad)",
    "keywordAr": "Spider Math مع هبه عياد",
    "keywordEn": "Spider Math with Heba Ayad",
    "pageTitleAr": "Spider Math مع هبه عياد | شرح الرياضيات والماث اونلاين على منصة سبايدر ماث",
    "pageTitleEn": "Spider Math with Heba Ayad | Mathematics & Math Lessons on Spider Math Platform",
    "metaDescriptionAr": "تعرف على Spider Math مع هبه عياد وكورسات شرح الرياضيات والماث للدبلومة الأمريكية والبكالوريا والثانوية العامة بأحدث أساليب حاسبة ديسموس.",
    "metaDescriptionEn": "Learn with Spider Math with Heba Ayad on Spider Math Platform: advanced mathematics prep for American Diploma, Baccalaureate, and Thanaweya Amma.",
    "tagsAr": [
      "Spider Math مع هبه عياد",
      "هبه عياد",
      "هبه عبد الوهاب",
      "سبايدر ماث",
      "شرح رياضيات"
    ],
    "tagsEn": [
      "Spider Math with Heba Ayad",
      "Heba Ayad",
      "Heba Abdel-Wahab",
      "Spider Math",
      "Math Tutor"
    ],
    "badgeAr": "تجربة التعلم",
    "badgeEn": "Learning Experience",
    "headlineAr": "Spider Math مع هبه عياد — تجربة تعليمية فريدة تضمن لك التفوق في الامتحانات",
    "headlineEn": "Spider Math with Heba Ayad — A Unique Journey Guaranteeing Academic Honors",
    "subheadlineAr": "المهندسة هبة عبدالوهاب تضع بين يديك خلاصة خبرتها الأكاديمية لتبسيط أكثر المفاهيم الرياضية تعقيداً.",
    "subheadlineEn": "Eng. Heba Abdel-Wahab delivers elite academic mastery to transform difficult concepts into effortless solutions.",
    "overviewAr": "تقدم Spider Math مع هبه عياد محتوى تعليمياً فريداً يركز على استيعاب الطالب للمنطق الرياضي واستخدام التكنولوجيا الحديثة مثل حاسبة ديسموس والرسوم التفاعلية لضمان الحصول على الدرجات النهائية وتجاوز الامتحانات التنافسية بثقة تامة.",
    "overviewEn": "Spider Math with Heba Ayad provides a unique pedagogical approach emphasizing logical intuition, Desmos calculator techniques, and continuous personalized feedback to guarantee top honors.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "استراتيجيات الشرح والتطبيق",
        "titleEn": "Pedagogical Framework",
        "detailsAr": "محاضرات مسجلة عالية الوضوح مع ورش تطبيقية مباشرة وشيتات محلولة.",
        "detailsEn": "High-definition video lectures paired with live workshops and step-by-step booklets."
      },
      {
        "titleAr": "بنوك الأسئلة والامتحانات الدورية",
        "titleEn": "Question Banks & Mock Exams",
        "detailsAr": "تدريب على أحدث نماذج الامتحانات الوزارية والدولية.",
        "detailsEn": "Simulations matching the latest official ministerial and College Board standards."
      }
    ],
    "targetAudienceAr": "طلاب المدارس العامة واللغات والدبلومة الأمريكية الراغبون في الشرح المباشر مع ميس هبة.",
    "targetAudienceEn": "Students in national, bilingual, and international tracks seeking guidance from Eng. Heba.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني الاشتراك في كورس Spider Math مع هبه عياد؟",
        "questionEn": "How do I enroll in Spider Math with Heba Ayad's course?",
        "answerAr": "يمكنك التسجيل على المنصة مجاناً واختيار مرحلتك الدراسية ثم تفعيل الكورس فورياً عبر وسائل الدفع الإلكتروني.",
        "answerEn": "Sign up for free, select your curriculum grade, and instantly activate access using digital payment options."
      },
      {
        "questionAr": "هل يمكن التواصل المباشر مع ميس هبة لطرح الأسئلة؟",
        "questionEn": "Can students ask Eng. Heba questions directly?",
        "answerAr": "نعم، المنصة توفر قنوات تيليجرام وواتساب مخصصة ومراجعات لايف أسبوعية للإجابة على جميع الاستفسارات.",
        "answerEn": "Yes! Dedicated Telegram and WhatsApp channels plus weekly live Q&A sessions ensure direct support."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "heba-ayad",
      "sat-math-explanation",
      "baccalaureate-math-explanation"
    ]
  },
  {
    "id": "heba-ayad-math-course",
    "slug": "heba-ayad-math-course",
    "slugAliases": [
      "كورس-رياضيات-هبه-عياد"
    ],
    "category": "teacher",
    "categoryNameAr": "ميس هبه عياد (هبه عبد الوهاب)",
    "categoryNameEn": "Eng. Heba Abdel-Wahab (Heba Ayad)",
    "keywordAr": "كورس رياضيات هبه عياد",
    "keywordEn": "Heba Ayad Mathematics Course",
    "pageTitleAr": "كورس رياضيات هبه عياد | شرح الرياضيات والماث اونلاين على منصة سبايدر ماث",
    "pageTitleEn": "Heba Ayad Mathematics Course | Mathematics & Math Lessons on Spider Math Platform",
    "metaDescriptionAr": "تعرف على كورس رياضيات هبه عياد وكورسات شرح الرياضيات والماث للدبلومة الأمريكية والبكالوريا والثانوية العامة بأحدث أساليب حاسبة ديسموس.",
    "metaDescriptionEn": "Learn with Heba Ayad Mathematics Course on Spider Math Platform: advanced mathematics prep for American Diploma, Baccalaureate, and Thanaweya Amma.",
    "tagsAr": [
      "كورس رياضيات هبه عياد",
      "هبه عياد",
      "هبه عبد الوهاب",
      "سبايدر ماث",
      "شرح رياضيات"
    ],
    "tagsEn": [
      "Heba Ayad Mathematics Course",
      "Heba Ayad",
      "Heba Abdel-Wahab",
      "Spider Math",
      "Math Tutor"
    ],
    "badgeAr": "الكورس الشامل",
    "badgeEn": "Comprehensive Course",
    "headlineAr": "كورس رياضيات هبه عياد — المنهاج المتكامل من التأسيس حتى المراجعة النهائية",
    "headlineEn": "Heba Ayad Mathematics Course — Complete Roadmap from Basics to Exam Night",
    "subheadlineAr": "المهندسة هبة عبدالوهاب تضع بين يديك خلاصة خبرتها الأكاديمية لتبسيط أكثر المفاهيم الرياضية تعقيداً.",
    "subheadlineEn": "Eng. Heba Abdel-Wahab delivers elite academic mastery to transform difficult concepts into effortless solutions.",
    "overviewAr": "تقدم كورس رياضيات هبه عياد محتوى تعليمياً فريداً يركز على استيعاب الطالب للمنطق الرياضي واستخدام التكنولوجيا الحديثة مثل حاسبة ديسموس والرسوم التفاعلية لضمان الحصول على الدرجات النهائية وتجاوز الامتحانات التنافسية بثقة تامة.",
    "overviewEn": "Heba Ayad Mathematics Course provides a unique pedagogical approach emphasizing logical intuition, Desmos calculator techniques, and continuous personalized feedback to guarantee top honors.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "استراتيجيات الشرح والتطبيق",
        "titleEn": "Pedagogical Framework",
        "detailsAr": "محاضرات مسجلة عالية الوضوح مع ورش تطبيقية مباشرة وشيتات محلولة.",
        "detailsEn": "High-definition video lectures paired with live workshops and step-by-step booklets."
      },
      {
        "titleAr": "بنوك الأسئلة والامتحانات الدورية",
        "titleEn": "Question Banks & Mock Exams",
        "detailsAr": "تدريب على أحدث نماذج الامتحانات الوزارية والدولية.",
        "detailsEn": "Simulations matching the latest official ministerial and College Board standards."
      }
    ],
    "targetAudienceAr": "طلاب المدارس العامة واللغات والدبلومة الأمريكية الراغبون في الشرح المباشر مع ميس هبة.",
    "targetAudienceEn": "Students in national, bilingual, and international tracks seeking guidance from Eng. Heba.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني الاشتراك في كورس كورس رياضيات هبه عياد؟",
        "questionEn": "How do I enroll in Heba Ayad Mathematics Course's course?",
        "answerAr": "يمكنك التسجيل على المنصة مجاناً واختيار مرحلتك الدراسية ثم تفعيل الكورس فورياً عبر وسائل الدفع الإلكتروني.",
        "answerEn": "Sign up for free, select your curriculum grade, and instantly activate access using digital payment options."
      },
      {
        "questionAr": "هل يمكن التواصل المباشر مع ميس هبة لطرح الأسئلة؟",
        "questionEn": "Can students ask Eng. Heba questions directly?",
        "answerAr": "نعم، المنصة توفر قنوات تيليجرام وواتساب مخصصة ومراجعات لايف أسبوعية للإجابة على جميع الاستفسارات.",
        "answerEn": "Yes! Dedicated Telegram and WhatsApp channels plus weekly live Q&A sessions ensure direct support."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "heba-ayad",
      "sat-math-explanation",
      "baccalaureate-math-explanation"
    ]
  },
  {
    "id": "heba-ayad-math-revision",
    "slug": "heba-ayad-math-revision",
    "slugAliases": [
      "مراجعة-رياضيات-هبه-عياد"
    ],
    "category": "teacher",
    "categoryNameAr": "ميس هبه عياد (هبه عبد الوهاب)",
    "categoryNameEn": "Eng. Heba Abdel-Wahab (Heba Ayad)",
    "keywordAr": "مراجعة رياضيات هبه عياد",
    "keywordEn": "Heba Ayad Mathematics Revision",
    "pageTitleAr": "مراجعة رياضيات هبه عياد | شرح الرياضيات والماث اونلاين على منصة سبايدر ماث",
    "pageTitleEn": "Heba Ayad Mathematics Revision | Mathematics & Math Lessons on Spider Math Platform",
    "metaDescriptionAr": "تعرف على مراجعة رياضيات هبه عياد وكورسات شرح الرياضيات والماث للدبلومة الأمريكية والبكالوريا والثانوية العامة بأحدث أساليب حاسبة ديسموس.",
    "metaDescriptionEn": "Learn with Heba Ayad Mathematics Revision on Spider Math Platform: advanced mathematics prep for American Diploma, Baccalaureate, and Thanaweya Amma.",
    "tagsAr": [
      "مراجعة رياضيات هبه عياد",
      "هبه عياد",
      "هبه عبد الوهاب",
      "سبايدر ماث",
      "شرح رياضيات"
    ],
    "tagsEn": [
      "Heba Ayad Mathematics Revision",
      "Heba Ayad",
      "Heba Abdel-Wahab",
      "Spider Math",
      "Math Tutor"
    ],
    "badgeAr": "معسكر المراجعة",
    "badgeEn": "Revision Bootcamp",
    "headlineAr": "مراجعة رياضيات هبه عياد — كبسولات مركزة وأقوى بنك أسئلة متوقع في الامتحانات",
    "headlineEn": "Heba Ayad Mathematics Revision — High-Yield Capsules & Predicted Exam Questions",
    "subheadlineAr": "المهندسة هبة عبدالوهاب تضع بين يديك خلاصة خبرتها الأكاديمية لتبسيط أكثر المفاهيم الرياضية تعقيداً.",
    "subheadlineEn": "Eng. Heba Abdel-Wahab delivers elite academic mastery to transform difficult concepts into effortless solutions.",
    "overviewAr": "تقدم مراجعة رياضيات هبه عياد محتوى تعليمياً فريداً يركز على استيعاب الطالب للمنطق الرياضي واستخدام التكنولوجيا الحديثة مثل حاسبة ديسموس والرسوم التفاعلية لضمان الحصول على الدرجات النهائية وتجاوز الامتحانات التنافسية بثقة تامة.",
    "overviewEn": "Heba Ayad Mathematics Revision provides a unique pedagogical approach emphasizing logical intuition, Desmos calculator techniques, and continuous personalized feedback to guarantee top honors.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "استراتيجيات الشرح والتطبيق",
        "titleEn": "Pedagogical Framework",
        "detailsAr": "محاضرات مسجلة عالية الوضوح مع ورش تطبيقية مباشرة وشيتات محلولة.",
        "detailsEn": "High-definition video lectures paired with live workshops and step-by-step booklets."
      },
      {
        "titleAr": "بنوك الأسئلة والامتحانات الدورية",
        "titleEn": "Question Banks & Mock Exams",
        "detailsAr": "تدريب على أحدث نماذج الامتحانات الوزارية والدولية.",
        "detailsEn": "Simulations matching the latest official ministerial and College Board standards."
      }
    ],
    "targetAudienceAr": "طلاب المدارس العامة واللغات والدبلومة الأمريكية الراغبون في الشرح المباشر مع ميس هبة.",
    "targetAudienceEn": "Students in national, bilingual, and international tracks seeking guidance from Eng. Heba.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني الاشتراك في كورس مراجعة رياضيات هبه عياد؟",
        "questionEn": "How do I enroll in Heba Ayad Mathematics Revision's course?",
        "answerAr": "يمكنك التسجيل على المنصة مجاناً واختيار مرحلتك الدراسية ثم تفعيل الكورس فورياً عبر وسائل الدفع الإلكتروني.",
        "answerEn": "Sign up for free, select your curriculum grade, and instantly activate access using digital payment options."
      },
      {
        "questionAr": "هل يمكن التواصل المباشر مع ميس هبة لطرح الأسئلة؟",
        "questionEn": "Can students ask Eng. Heba questions directly?",
        "answerAr": "نعم، المنصة توفر قنوات تيليجرام وواتساب مخصصة ومراجعات لايف أسبوعية للإجابة على جميع الاستفسارات.",
        "answerEn": "Yes! Dedicated Telegram and WhatsApp channels plus weekly live Q&A sessions ensure direct support."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "heba-ayad",
      "sat-math-explanation",
      "baccalaureate-math-explanation"
    ]
  },
  {
    "id": "night-exam-revision-with-heba-ayad",
    "slug": "night-exam-revision-with-heba-ayad",
    "slugAliases": [
      "مراجعة-ليلة-الامتحان-مع-هبه-عياد"
    ],
    "category": "teacher",
    "categoryNameAr": "ميس هبه عياد (هبه عبد الوهاب)",
    "categoryNameEn": "Eng. Heba Abdel-Wahab (Heba Ayad)",
    "keywordAr": "مراجعة ليلة الامتحان مع هبه عياد",
    "keywordEn": "Night-Before Exam Revision with Heba Ayad",
    "pageTitleAr": "مراجعة ليلة الامتحان مع هبه عياد | شرح الرياضيات والماث اونلاين على منصة سبايدر ماث",
    "pageTitleEn": "Night-Before Exam Revision with Heba Ayad | Mathematics & Math Lessons on Spider Math Platform",
    "metaDescriptionAr": "تعرف على مراجعة ليلة الامتحان مع هبه عياد وكورسات شرح الرياضيات والماث للدبلومة الأمريكية والبكالوريا والثانوية العامة بأحدث أساليب حاسبة ديسموس.",
    "metaDescriptionEn": "Learn with Night-Before Exam Revision with Heba Ayad on Spider Math Platform: advanced mathematics prep for American Diploma, Baccalaureate, and Thanaweya Amma.",
    "tagsAr": [
      "مراجعة ليلة الامتحان مع هبه عياد",
      "هبه عياد",
      "هبه عبد الوهاب",
      "سبايدر ماث",
      "شرح رياضيات"
    ],
    "tagsEn": [
      "Night-Before Exam Revision with Heba Ayad",
      "Heba Ayad",
      "Heba Abdel-Wahab",
      "Spider Math",
      "Math Tutor"
    ],
    "badgeAr": "ليلة الامتحان",
    "badgeEn": "Night-Before Exam",
    "headlineAr": "مراجعة ليلة الامتحان مع هبه عياد — تثبيت القوانين وحل التريكات الصعبة بثقة",
    "headlineEn": "Night-Before Exam Revision with Heba Ayad — Formula Mastery & Tough Trick Walkthroughs",
    "subheadlineAr": "المهندسة هبة عبدالوهاب تضع بين يديك خلاصة خبرتها الأكاديمية لتبسيط أكثر المفاهيم الرياضية تعقيداً.",
    "subheadlineEn": "Eng. Heba Abdel-Wahab delivers elite academic mastery to transform difficult concepts into effortless solutions.",
    "overviewAr": "تقدم مراجعة ليلة الامتحان مع هبه عياد محتوى تعليمياً فريداً يركز على استيعاب الطالب للمنطق الرياضي واستخدام التكنولوجيا الحديثة مثل حاسبة ديسموس والرسوم التفاعلية لضمان الحصول على الدرجات النهائية وتجاوز الامتحانات التنافسية بثقة تامة.",
    "overviewEn": "Night-Before Exam Revision with Heba Ayad provides a unique pedagogical approach emphasizing logical intuition, Desmos calculator techniques, and continuous personalized feedback to guarantee top honors.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "استراتيجيات الشرح والتطبيق",
        "titleEn": "Pedagogical Framework",
        "detailsAr": "محاضرات مسجلة عالية الوضوح مع ورش تطبيقية مباشرة وشيتات محلولة.",
        "detailsEn": "High-definition video lectures paired with live workshops and step-by-step booklets."
      },
      {
        "titleAr": "بنوك الأسئلة والامتحانات الدورية",
        "titleEn": "Question Banks & Mock Exams",
        "detailsAr": "تدريب على أحدث نماذج الامتحانات الوزارية والدولية.",
        "detailsEn": "Simulations matching the latest official ministerial and College Board standards."
      }
    ],
    "targetAudienceAr": "طلاب المدارس العامة واللغات والدبلومة الأمريكية الراغبون في الشرح المباشر مع ميس هبة.",
    "targetAudienceEn": "Students in national, bilingual, and international tracks seeking guidance from Eng. Heba.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني الاشتراك في كورس مراجعة ليلة الامتحان مع هبه عياد؟",
        "questionEn": "How do I enroll in Night-Before Exam Revision with Heba Ayad's course?",
        "answerAr": "يمكنك التسجيل على المنصة مجاناً واختيار مرحلتك الدراسية ثم تفعيل الكورس فورياً عبر وسائل الدفع الإلكتروني.",
        "answerEn": "Sign up for free, select your curriculum grade, and instantly activate access using digital payment options."
      },
      {
        "questionAr": "هل يمكن التواصل المباشر مع ميس هبة لطرح الأسئلة؟",
        "questionEn": "Can students ask Eng. Heba questions directly?",
        "answerAr": "نعم، المنصة توفر قنوات تيليجرام وواتساب مخصصة ومراجعات لايف أسبوعية للإجابة على جميع الاستفسارات.",
        "answerEn": "Yes! Dedicated Telegram and WhatsApp channels plus weekly live Q&A sessions ensure direct support."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "heba-ayad",
      "sat-math-explanation",
      "baccalaureate-math-explanation"
    ]
  },
  {
    "id": "heba-ayad-baccalaureate",
    "slug": "heba-ayad-baccalaureate",
    "slugAliases": [
      "هبه-عياد-بكالوريا"
    ],
    "category": "teacher",
    "categoryNameAr": "ميس هبه عياد (هبه عبد الوهاب)",
    "categoryNameEn": "Eng. Heba Abdel-Wahab (Heba Ayad)",
    "keywordAr": "هبه عياد بكالوريا",
    "keywordEn": "Heba Ayad Baccalaureate",
    "pageTitleAr": "هبه عياد بكالوريا | شرح الرياضيات والماث اونلاين على منصة سبايدر ماث",
    "pageTitleEn": "Heba Ayad Baccalaureate | Mathematics & Math Lessons on Spider Math Platform",
    "metaDescriptionAr": "تعرف على هبه عياد بكالوريا وكورسات شرح الرياضيات والماث للدبلومة الأمريكية والبكالوريا والثانوية العامة بأحدث أساليب حاسبة ديسموس.",
    "metaDescriptionEn": "Learn with Heba Ayad Baccalaureate on Spider Math Platform: advanced mathematics prep for American Diploma, Baccalaureate, and Thanaweya Amma.",
    "tagsAr": [
      "هبه عياد بكالوريا",
      "هبه عياد",
      "هبه عبد الوهاب",
      "سبايدر ماث",
      "شرح رياضيات"
    ],
    "tagsEn": [
      "Heba Ayad Baccalaureate",
      "Heba Ayad",
      "Heba Abdel-Wahab",
      "Spider Math",
      "Math Tutor"
    ],
    "badgeAr": "تخصص البكالوريا",
    "badgeEn": "Baccalaureate Specialist",
    "headlineAr": "هبه عياد بكالوريا — إعداد استثنائي لامتحانات البكالوريا وتحقيق أعلى التقديرات",
    "headlineEn": "Heba Ayad Baccalaureate — Elite Preparation for High-Scoring Baccalaureate Honors",
    "subheadlineAr": "المهندسة هبة عبدالوهاب تضع بين يديك خلاصة خبرتها الأكاديمية لتبسيط أكثر المفاهيم الرياضية تعقيداً.",
    "subheadlineEn": "Eng. Heba Abdel-Wahab delivers elite academic mastery to transform difficult concepts into effortless solutions.",
    "overviewAr": "تقدم هبه عياد بكالوريا محتوى تعليمياً فريداً يركز على استيعاب الطالب للمنطق الرياضي واستخدام التكنولوجيا الحديثة مثل حاسبة ديسموس والرسوم التفاعلية لضمان الحصول على الدرجات النهائية وتجاوز الامتحانات التنافسية بثقة تامة.",
    "overviewEn": "Heba Ayad Baccalaureate provides a unique pedagogical approach emphasizing logical intuition, Desmos calculator techniques, and continuous personalized feedback to guarantee top honors.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "استراتيجيات الشرح والتطبيق",
        "titleEn": "Pedagogical Framework",
        "detailsAr": "محاضرات مسجلة عالية الوضوح مع ورش تطبيقية مباشرة وشيتات محلولة.",
        "detailsEn": "High-definition video lectures paired with live workshops and step-by-step booklets."
      },
      {
        "titleAr": "بنوك الأسئلة والامتحانات الدورية",
        "titleEn": "Question Banks & Mock Exams",
        "detailsAr": "تدريب على أحدث نماذج الامتحانات الوزارية والدولية.",
        "detailsEn": "Simulations matching the latest official ministerial and College Board standards."
      }
    ],
    "targetAudienceAr": "طلاب المدارس العامة واللغات والدبلومة الأمريكية الراغبون في الشرح المباشر مع ميس هبة.",
    "targetAudienceEn": "Students in national, bilingual, and international tracks seeking guidance from Eng. Heba.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني الاشتراك في كورس هبه عياد بكالوريا؟",
        "questionEn": "How do I enroll in Heba Ayad Baccalaureate's course?",
        "answerAr": "يمكنك التسجيل على المنصة مجاناً واختيار مرحلتك الدراسية ثم تفعيل الكورس فورياً عبر وسائل الدفع الإلكتروني.",
        "answerEn": "Sign up for free, select your curriculum grade, and instantly activate access using digital payment options."
      },
      {
        "questionAr": "هل يمكن التواصل المباشر مع ميس هبة لطرح الأسئلة؟",
        "questionEn": "Can students ask Eng. Heba questions directly?",
        "answerAr": "نعم، المنصة توفر قنوات تيليجرام وواتساب مخصصة ومراجعات لايف أسبوعية للإجابة على جميع الاستفسارات.",
        "answerEn": "Yes! Dedicated Telegram and WhatsApp channels plus weekly live Q&A sessions ensure direct support."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "heba-ayad",
      "sat-math-explanation",
      "baccalaureate-math-explanation"
    ]
  },
  {
    "id": "heba-ayad-thanaweya-amma",
    "slug": "heba-ayad-thanaweya-amma",
    "slugAliases": [
      "هبه-عياد-ثانوية-عامة"
    ],
    "category": "teacher",
    "categoryNameAr": "ميس هبه عياد (هبه عبد الوهاب)",
    "categoryNameEn": "Eng. Heba Abdel-Wahab (Heba Ayad)",
    "keywordAr": "هبه عياد ثانوية عامة",
    "keywordEn": "Heba Ayad Thanaweya Amma",
    "pageTitleAr": "هبه عياد ثانوية عامة | شرح الرياضيات والماث اونلاين على منصة سبايدر ماث",
    "pageTitleEn": "Heba Ayad Thanaweya Amma | Mathematics & Math Lessons on Spider Math Platform",
    "metaDescriptionAr": "تعرف على هبه عياد ثانوية عامة وكورسات شرح الرياضيات والماث للدبلومة الأمريكية والبكالوريا والثانوية العامة بأحدث أساليب حاسبة ديسموس.",
    "metaDescriptionEn": "Learn with Heba Ayad Thanaweya Amma on Spider Math Platform: advanced mathematics prep for American Diploma, Baccalaureate, and Thanaweya Amma.",
    "tagsAr": [
      "هبه عياد ثانوية عامة",
      "هبه عياد",
      "هبه عبد الوهاب",
      "سبايدر ماث",
      "شرح رياضيات"
    ],
    "tagsEn": [
      "Heba Ayad Thanaweya Amma",
      "Heba Ayad",
      "Heba Abdel-Wahab",
      "Spider Math",
      "Math Tutor"
    ],
    "badgeAr": "أوائل الثانوية",
    "badgeEn": "Thanaweya Amma Honors",
    "headlineAr": "هبه عياد ثانوية عامة — صناعة أوائل الجمهورية في الرياضيات البحتة والتطبيقية",
    "headlineEn": "Heba Ayad Thanaweya Amma — Breeding Top Rankers in Pure and Applied Mathematics",
    "subheadlineAr": "المهندسة هبة عبدالوهاب تضع بين يديك خلاصة خبرتها الأكاديمية لتبسيط أكثر المفاهيم الرياضية تعقيداً.",
    "subheadlineEn": "Eng. Heba Abdel-Wahab delivers elite academic mastery to transform difficult concepts into effortless solutions.",
    "overviewAr": "تقدم هبه عياد ثانوية عامة محتوى تعليمياً فريداً يركز على استيعاب الطالب للمنطق الرياضي واستخدام التكنولوجيا الحديثة مثل حاسبة ديسموس والرسوم التفاعلية لضمان الحصول على الدرجات النهائية وتجاوز الامتحانات التنافسية بثقة تامة.",
    "overviewEn": "Heba Ayad Thanaweya Amma provides a unique pedagogical approach emphasizing logical intuition, Desmos calculator techniques, and continuous personalized feedback to guarantee top honors.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "استراتيجيات الشرح والتطبيق",
        "titleEn": "Pedagogical Framework",
        "detailsAr": "محاضرات مسجلة عالية الوضوح مع ورش تطبيقية مباشرة وشيتات محلولة.",
        "detailsEn": "High-definition video lectures paired with live workshops and step-by-step booklets."
      },
      {
        "titleAr": "بنوك الأسئلة والامتحانات الدورية",
        "titleEn": "Question Banks & Mock Exams",
        "detailsAr": "تدريب على أحدث نماذج الامتحانات الوزارية والدولية.",
        "detailsEn": "Simulations matching the latest official ministerial and College Board standards."
      }
    ],
    "targetAudienceAr": "طلاب المدارس العامة واللغات والدبلومة الأمريكية الراغبون في الشرح المباشر مع ميس هبة.",
    "targetAudienceEn": "Students in national, bilingual, and international tracks seeking guidance from Eng. Heba.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني الاشتراك في كورس هبه عياد ثانوية عامة؟",
        "questionEn": "How do I enroll in Heba Ayad Thanaweya Amma's course?",
        "answerAr": "يمكنك التسجيل على المنصة مجاناً واختيار مرحلتك الدراسية ثم تفعيل الكورس فورياً عبر وسائل الدفع الإلكتروني.",
        "answerEn": "Sign up for free, select your curriculum grade, and instantly activate access using digital payment options."
      },
      {
        "questionAr": "هل يمكن التواصل المباشر مع ميس هبة لطرح الأسئلة؟",
        "questionEn": "Can students ask Eng. Heba questions directly?",
        "answerAr": "نعم، المنصة توفر قنوات تيليجرام وواتساب مخصصة ومراجعات لايف أسبوعية للإجابة على جميع الاستفسارات.",
        "answerEn": "Yes! Dedicated Telegram and WhatsApp channels plus weekly live Q&A sessions ensure direct support."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "heba-ayad",
      "sat-math-explanation",
      "baccalaureate-math-explanation"
    ]
  },
  {
    "id": "heba-ayad-sat-math",
    "slug": "heba-ayad-sat-math",
    "slugAliases": [
      "هبه-عياد-sat-math"
    ],
    "category": "teacher",
    "categoryNameAr": "ميس هبه عياد (هبه عبد الوهاب)",
    "categoryNameEn": "Eng. Heba Abdel-Wahab (Heba Ayad)",
    "keywordAr": "Heba Ayad SAT Math",
    "keywordEn": "Heba Ayad SAT Math Prep",
    "pageTitleAr": "Heba Ayad SAT Math | شرح الرياضيات والماث اونلاين على منصة سبايدر ماث",
    "pageTitleEn": "Heba Ayad SAT Math Prep | Mathematics & Math Lessons on Spider Math Platform",
    "metaDescriptionAr": "تعرف على Heba Ayad SAT Math وكورسات شرح الرياضيات والماث للدبلومة الأمريكية والبكالوريا والثانوية العامة بأحدث أساليب حاسبة ديسموس.",
    "metaDescriptionEn": "Learn with Heba Ayad SAT Math Prep on Spider Math Platform: advanced mathematics prep for American Diploma, Baccalaureate, and Thanaweya Amma.",
    "tagsAr": [
      "Heba Ayad SAT Math",
      "هبه عياد",
      "هبه عبد الوهاب",
      "سبايدر ماث",
      "شرح رياضيات"
    ],
    "tagsEn": [
      "Heba Ayad SAT Math Prep",
      "Heba Ayad",
      "Heba Abdel-Wahab",
      "Spider Math",
      "Math Tutor"
    ],
    "badgeAr": "800 Blueprint",
    "badgeEn": "800 Blueprint",
    "headlineAr": "Heba Ayad SAT Math — خريطة طريقك نحو سكور 800 في Digital SAT Math",
    "headlineEn": "Heba Ayad SAT Math — Your Exact Roadmap to an 800 in Digital SAT Math",
    "subheadlineAr": "المهندسة هبة عبدالوهاب تضع بين يديك خلاصة خبرتها الأكاديمية لتبسيط أكثر المفاهيم الرياضية تعقيداً.",
    "subheadlineEn": "Eng. Heba Abdel-Wahab delivers elite academic mastery to transform difficult concepts into effortless solutions.",
    "overviewAr": "تقدم Heba Ayad SAT Math محتوى تعليمياً فريداً يركز على استيعاب الطالب للمنطق الرياضي واستخدام التكنولوجيا الحديثة مثل حاسبة ديسموس والرسوم التفاعلية لضمان الحصول على الدرجات النهائية وتجاوز الامتحانات التنافسية بثقة تامة.",
    "overviewEn": "Heba Ayad SAT Math Prep provides a unique pedagogical approach emphasizing logical intuition, Desmos calculator techniques, and continuous personalized feedback to guarantee top honors.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "استراتيجيات الشرح والتطبيق",
        "titleEn": "Pedagogical Framework",
        "detailsAr": "محاضرات مسجلة عالية الوضوح مع ورش تطبيقية مباشرة وشيتات محلولة.",
        "detailsEn": "High-definition video lectures paired with live workshops and step-by-step booklets."
      },
      {
        "titleAr": "بنوك الأسئلة والامتحانات الدورية",
        "titleEn": "Question Banks & Mock Exams",
        "detailsAr": "تدريب على أحدث نماذج الامتحانات الوزارية والدولية.",
        "detailsEn": "Simulations matching the latest official ministerial and College Board standards."
      }
    ],
    "targetAudienceAr": "طلاب المدارس العامة واللغات والدبلومة الأمريكية الراغبون في الشرح المباشر مع ميس هبة.",
    "targetAudienceEn": "Students in national, bilingual, and international tracks seeking guidance from Eng. Heba.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني الاشتراك في كورس Heba Ayad SAT Math؟",
        "questionEn": "How do I enroll in Heba Ayad SAT Math Prep's course?",
        "answerAr": "يمكنك التسجيل على المنصة مجاناً واختيار مرحلتك الدراسية ثم تفعيل الكورس فورياً عبر وسائل الدفع الإلكتروني.",
        "answerEn": "Sign up for free, select your curriculum grade, and instantly activate access using digital payment options."
      },
      {
        "questionAr": "هل يمكن التواصل المباشر مع ميس هبة لطرح الأسئلة؟",
        "questionEn": "Can students ask Eng. Heba questions directly?",
        "answerAr": "نعم، المنصة توفر قنوات تيليجرام وواتساب مخصصة ومراجعات لايف أسبوعية للإجابة على جميع الاستفسارات.",
        "answerEn": "Yes! Dedicated Telegram and WhatsApp channels plus weekly live Q&A sessions ensure direct support."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "heba-ayad",
      "sat-math-explanation",
      "baccalaureate-math-explanation"
    ]
  },
  {
    "id": "heba-ayad-est-math",
    "slug": "heba-ayad-est-math",
    "slugAliases": [
      "هبه-عياد-est-math"
    ],
    "category": "teacher",
    "categoryNameAr": "ميس هبه عياد (هبه عبد الوهاب)",
    "categoryNameEn": "Eng. Heba Abdel-Wahab (Heba Ayad)",
    "keywordAr": "Heba Ayad EST Math",
    "keywordEn": "Heba Ayad EST Math Prep",
    "pageTitleAr": "Heba Ayad EST Math | شرح الرياضيات والماث اونلاين على منصة سبايدر ماث",
    "pageTitleEn": "Heba Ayad EST Math Prep | Mathematics & Math Lessons on Spider Math Platform",
    "metaDescriptionAr": "تعرف على Heba Ayad EST Math وكورسات شرح الرياضيات والماث للدبلومة الأمريكية والبكالوريا والثانوية العامة بأحدث أساليب حاسبة ديسموس.",
    "metaDescriptionEn": "Learn with Heba Ayad EST Math Prep on Spider Math Platform: advanced mathematics prep for American Diploma, Baccalaureate, and Thanaweya Amma.",
    "tagsAr": [
      "Heba Ayad EST Math",
      "هبه عياد",
      "هبه عبد الوهاب",
      "سبايدر ماث",
      "شرح رياضيات"
    ],
    "tagsEn": [
      "Heba Ayad EST Math Prep",
      "Heba Ayad",
      "Heba Abdel-Wahab",
      "Spider Math",
      "Math Tutor"
    ],
    "badgeAr": "EST 1 & 2",
    "badgeEn": "EST 1 & 2",
    "headlineAr": "Heba Ayad EST Math — التفوق المضمون في اختبارات EST للقبول الجامعي في مصر",
    "headlineEn": "Heba Ayad EST Math — Guaranteed Excellence in Egyptian Scholastic Tests (EST)",
    "subheadlineAr": "المهندسة هبة عبدالوهاب تضع بين يديك خلاصة خبرتها الأكاديمية لتبسيط أكثر المفاهيم الرياضية تعقيداً.",
    "subheadlineEn": "Eng. Heba Abdel-Wahab delivers elite academic mastery to transform difficult concepts into effortless solutions.",
    "overviewAr": "تقدم Heba Ayad EST Math محتوى تعليمياً فريداً يركز على استيعاب الطالب للمنطق الرياضي واستخدام التكنولوجيا الحديثة مثل حاسبة ديسموس والرسوم التفاعلية لضمان الحصول على الدرجات النهائية وتجاوز الامتحانات التنافسية بثقة تامة.",
    "overviewEn": "Heba Ayad EST Math Prep provides a unique pedagogical approach emphasizing logical intuition, Desmos calculator techniques, and continuous personalized feedback to guarantee top honors.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "استراتيجيات الشرح والتطبيق",
        "titleEn": "Pedagogical Framework",
        "detailsAr": "محاضرات مسجلة عالية الوضوح مع ورش تطبيقية مباشرة وشيتات محلولة.",
        "detailsEn": "High-definition video lectures paired with live workshops and step-by-step booklets."
      },
      {
        "titleAr": "بنوك الأسئلة والامتحانات الدورية",
        "titleEn": "Question Banks & Mock Exams",
        "detailsAr": "تدريب على أحدث نماذج الامتحانات الوزارية والدولية.",
        "detailsEn": "Simulations matching the latest official ministerial and College Board standards."
      }
    ],
    "targetAudienceAr": "طلاب المدارس العامة واللغات والدبلومة الأمريكية الراغبون في الشرح المباشر مع ميس هبة.",
    "targetAudienceEn": "Students in national, bilingual, and international tracks seeking guidance from Eng. Heba.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني الاشتراك في كورس Heba Ayad EST Math؟",
        "questionEn": "How do I enroll in Heba Ayad EST Math Prep's course?",
        "answerAr": "يمكنك التسجيل على المنصة مجاناً واختيار مرحلتك الدراسية ثم تفعيل الكورس فورياً عبر وسائل الدفع الإلكتروني.",
        "answerEn": "Sign up for free, select your curriculum grade, and instantly activate access using digital payment options."
      },
      {
        "questionAr": "هل يمكن التواصل المباشر مع ميس هبة لطرح الأسئلة؟",
        "questionEn": "Can students ask Eng. Heba questions directly?",
        "answerAr": "نعم، المنصة توفر قنوات تيليجرام وواتساب مخصصة ومراجعات لايف أسبوعية للإجابة على جميع الاستفسارات.",
        "answerEn": "Yes! Dedicated Telegram and WhatsApp channels plus weekly live Q&A sessions ensure direct support."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "heba-ayad",
      "sat-math-explanation",
      "baccalaureate-math-explanation"
    ]
  },
  {
    "id": "heba-ayad-sat",
    "slug": "heba-ayad-sat",
    "slugAliases": [
      "هبه-عياد-sat"
    ],
    "category": "teacher",
    "categoryNameAr": "ميس هبه عياد (هبه عبد الوهاب)",
    "categoryNameEn": "Eng. Heba Abdel-Wahab (Heba Ayad)",
    "keywordAr": "هبه عياد SAT",
    "keywordEn": "Heba Ayad SAT Coaching",
    "pageTitleAr": "هبه عياد SAT | شرح الرياضيات والماث اونلاين على منصة سبايدر ماث",
    "pageTitleEn": "Heba Ayad SAT Coaching | Mathematics & Math Lessons on Spider Math Platform",
    "metaDescriptionAr": "تعرف على هبه عياد SAT وكورسات شرح الرياضيات والماث للدبلومة الأمريكية والبكالوريا والثانوية العامة بأحدث أساليب حاسبة ديسموس.",
    "metaDescriptionEn": "Learn with Heba Ayad SAT Coaching on Spider Math Platform: advanced mathematics prep for American Diploma, Baccalaureate, and Thanaweya Amma.",
    "tagsAr": [
      "هبه عياد SAT",
      "هبه عياد",
      "هبه عبد الوهاب",
      "سبايدر ماث",
      "شرح رياضيات"
    ],
    "tagsEn": [
      "Heba Ayad SAT Coaching",
      "Heba Ayad",
      "Heba Abdel-Wahab",
      "Spider Math",
      "Math Tutor"
    ],
    "badgeAr": "SAT Mastery",
    "badgeEn": "SAT Mastery",
    "headlineAr": "هبه عياد SAT — استراتيجيات ذكية لحل أصعب أقسام الماث في اختبار SAT الدولي",
    "headlineEn": "Heba Ayad SAT — Smart Strategies for Conquering SAT Math Sections",
    "subheadlineAr": "المهندسة هبة عبدالوهاب تضع بين يديك خلاصة خبرتها الأكاديمية لتبسيط أكثر المفاهيم الرياضية تعقيداً.",
    "subheadlineEn": "Eng. Heba Abdel-Wahab delivers elite academic mastery to transform difficult concepts into effortless solutions.",
    "overviewAr": "تقدم هبه عياد SAT محتوى تعليمياً فريداً يركز على استيعاب الطالب للمنطق الرياضي واستخدام التكنولوجيا الحديثة مثل حاسبة ديسموس والرسوم التفاعلية لضمان الحصول على الدرجات النهائية وتجاوز الامتحانات التنافسية بثقة تامة.",
    "overviewEn": "Heba Ayad SAT Coaching provides a unique pedagogical approach emphasizing logical intuition, Desmos calculator techniques, and continuous personalized feedback to guarantee top honors.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "استراتيجيات الشرح والتطبيق",
        "titleEn": "Pedagogical Framework",
        "detailsAr": "محاضرات مسجلة عالية الوضوح مع ورش تطبيقية مباشرة وشيتات محلولة.",
        "detailsEn": "High-definition video lectures paired with live workshops and step-by-step booklets."
      },
      {
        "titleAr": "بنوك الأسئلة والامتحانات الدورية",
        "titleEn": "Question Banks & Mock Exams",
        "detailsAr": "تدريب على أحدث نماذج الامتحانات الوزارية والدولية.",
        "detailsEn": "Simulations matching the latest official ministerial and College Board standards."
      }
    ],
    "targetAudienceAr": "طلاب المدارس العامة واللغات والدبلومة الأمريكية الراغبون في الشرح المباشر مع ميس هبة.",
    "targetAudienceEn": "Students in national, bilingual, and international tracks seeking guidance from Eng. Heba.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني الاشتراك في كورس هبه عياد SAT؟",
        "questionEn": "How do I enroll in Heba Ayad SAT Coaching's course?",
        "answerAr": "يمكنك التسجيل على المنصة مجاناً واختيار مرحلتك الدراسية ثم تفعيل الكورس فورياً عبر وسائل الدفع الإلكتروني.",
        "answerEn": "Sign up for free, select your curriculum grade, and instantly activate access using digital payment options."
      },
      {
        "questionAr": "هل يمكن التواصل المباشر مع ميس هبة لطرح الأسئلة؟",
        "questionEn": "Can students ask Eng. Heba questions directly?",
        "answerAr": "نعم، المنصة توفر قنوات تيليجرام وواتساب مخصصة ومراجعات لايف أسبوعية للإجابة على جميع الاستفسارات.",
        "answerEn": "Yes! Dedicated Telegram and WhatsApp channels plus weekly live Q&A sessions ensure direct support."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "heba-ayad",
      "sat-math-explanation",
      "baccalaureate-math-explanation"
    ]
  },
  {
    "id": "heba-ayad-est",
    "slug": "heba-ayad-est",
    "slugAliases": [
      "هبه-عياد-est"
    ],
    "category": "teacher",
    "categoryNameAr": "ميس هبه عياد (هبه عبد الوهاب)",
    "categoryNameEn": "Eng. Heba Abdel-Wahab (Heba Ayad)",
    "keywordAr": "هبه عياد EST",
    "keywordEn": "Heba Ayad EST Coaching",
    "pageTitleAr": "هبه عياد EST | شرح الرياضيات والماث اونلاين على منصة سبايدر ماث",
    "pageTitleEn": "Heba Ayad EST Coaching | Mathematics & Math Lessons on Spider Math Platform",
    "metaDescriptionAr": "تعرف على هبه عياد EST وكورسات شرح الرياضيات والماث للدبلومة الأمريكية والبكالوريا والثانوية العامة بأحدث أساليب حاسبة ديسموس.",
    "metaDescriptionEn": "Learn with Heba Ayad EST Coaching on Spider Math Platform: advanced mathematics prep for American Diploma, Baccalaureate, and Thanaweya Amma.",
    "tagsAr": [
      "هبه عياد EST",
      "هبه عياد",
      "هبه عبد الوهاب",
      "سبايدر ماث",
      "شرح رياضيات"
    ],
    "tagsEn": [
      "Heba Ayad EST Coaching",
      "Heba Ayad",
      "Heba Abdel-Wahab",
      "Spider Math",
      "Math Tutor"
    ],
    "badgeAr": "EST Specialist",
    "badgeEn": "EST Specialist",
    "headlineAr": "هبه عياد EST — الكورس التأسيسي والمتقدم لطلاب الدبلومة الأمريكية في مصر",
    "headlineEn": "Heba Ayad EST — Complete Diagnostic and Advanced Program for EST Candidates",
    "subheadlineAr": "المهندسة هبة عبدالوهاب تضع بين يديك خلاصة خبرتها الأكاديمية لتبسيط أكثر المفاهيم الرياضية تعقيداً.",
    "subheadlineEn": "Eng. Heba Abdel-Wahab delivers elite academic mastery to transform difficult concepts into effortless solutions.",
    "overviewAr": "تقدم هبه عياد EST محتوى تعليمياً فريداً يركز على استيعاب الطالب للمنطق الرياضي واستخدام التكنولوجيا الحديثة مثل حاسبة ديسموس والرسوم التفاعلية لضمان الحصول على الدرجات النهائية وتجاوز الامتحانات التنافسية بثقة تامة.",
    "overviewEn": "Heba Ayad EST Coaching provides a unique pedagogical approach emphasizing logical intuition, Desmos calculator techniques, and continuous personalized feedback to guarantee top honors.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "استراتيجيات الشرح والتطبيق",
        "titleEn": "Pedagogical Framework",
        "detailsAr": "محاضرات مسجلة عالية الوضوح مع ورش تطبيقية مباشرة وشيتات محلولة.",
        "detailsEn": "High-definition video lectures paired with live workshops and step-by-step booklets."
      },
      {
        "titleAr": "بنوك الأسئلة والامتحانات الدورية",
        "titleEn": "Question Banks & Mock Exams",
        "detailsAr": "تدريب على أحدث نماذج الامتحانات الوزارية والدولية.",
        "detailsEn": "Simulations matching the latest official ministerial and College Board standards."
      }
    ],
    "targetAudienceAr": "طلاب المدارس العامة واللغات والدبلومة الأمريكية الراغبون في الشرح المباشر مع ميس هبة.",
    "targetAudienceEn": "Students in national, bilingual, and international tracks seeking guidance from Eng. Heba.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني الاشتراك في كورس هبه عياد EST؟",
        "questionEn": "How do I enroll in Heba Ayad EST Coaching's course?",
        "answerAr": "يمكنك التسجيل على المنصة مجاناً واختيار مرحلتك الدراسية ثم تفعيل الكورس فورياً عبر وسائل الدفع الإلكتروني.",
        "answerEn": "Sign up for free, select your curriculum grade, and instantly activate access using digital payment options."
      },
      {
        "questionAr": "هل يمكن التواصل المباشر مع ميس هبة لطرح الأسئلة؟",
        "questionEn": "Can students ask Eng. Heba questions directly?",
        "answerAr": "نعم، المنصة توفر قنوات تيليجرام وواتساب مخصصة ومراجعات لايف أسبوعية للإجابة على جميع الاستفسارات.",
        "answerEn": "Yes! Dedicated Telegram and WhatsApp channels plus weekly live Q&A sessions ensure direct support."
      }
    ],
    "relatedSlugs": [
      "spider-math",
      "heba-ayad",
      "sat-math-explanation",
      "baccalaureate-math-explanation"
    ]
  },
  {
    "id": "baccalaureate-math-explanation",
    "slug": "baccalaureate-math-explanation",
    "slugAliases": [
      "شرح-رياضيات-البكالوريا"
    ],
    "category": "baccalaureate",
    "categoryNameAr": "البكالوريا",
    "categoryNameEn": "Baccalaureate Mathematics",
    "keywordAr": "شرح رياضيات البكالوريا",
    "keywordEn": "Baccalaureate Math Lessons",
    "pageTitleAr": "شرح رياضيات البكالوريا | منصة سبايدر ماث التعليمية — ميس هبة عياد",
    "pageTitleEn": "Baccalaureate Math Lessons | Spider Math Platform — Eng. Heba Ayad",
    "metaDescriptionAr": "دليلك الكامل لـ شرح رياضيات البكالوريا: شروحات تفصيلية، حل امتحانات، ومقارنات دقيقة بإشراف المهندسة هبة عبدالوهاب على سبايدر ماث.",
    "metaDescriptionEn": "Comprehensive guide to Baccalaureate Math Lessons: detailed video lectures, solved mock exams, and complete curriculum breakdowns on Spider Math.",
    "tagsAr": [
      "شرح رياضيات البكالوريا",
      "رياضيات البكالوريا",
      "سبايدر ماث",
      "هبه عياد",
      "امتحانات بكالوريا"
    ],
    "tagsEn": [
      "Baccalaureate Math Lessons",
      "Baccalaureate Math",
      "Spider Math",
      "Heba Ayad",
      "Past Papers"
    ],
    "badgeAr": "منهج البكالوريا",
    "badgeEn": "Baccalaureate Syllabus",
    "headlineAr": "شرح رياضيات البكالوريا — التفوق في التحليل الرياضي والجبر والهندسة",
    "headlineEn": "Baccalaureate Mathematics Lessons — Analytical & Algebraic Excellence",
    "subheadlineAr": "منهج البكالوريا يتطلب فهماً رياضياً دقيقاً، وهنا نوفر لك الخطة المتكاملة للتفوق.",
    "subheadlineEn": "The Baccalaureate curriculum demands analytical rigor; we provide the exact blueprint for top marks.",
    "overviewAr": "يقدم مسار شرح رياضيات البكالوريا على سبايدر ماث شرحاً عميقاً لكل دروس التحليل الرياضي، الاحتمالات، الهندسة الفضائية، والمتتاليات مع حلول مفصلة للامتحانات الوطنية لتأهيلك لأعلى الدرجات.",
    "overviewEn": "Our Baccalaureate Math Lessons track offers thorough coverage of calculus, functions, probability, solid geometry, and sequences with official past-exam walkthroughs.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "التحليل الرياضي والدوال العددية",
        "titleEn": "Mathematical Analysis & Functions",
        "detailsAr": "النهايات، الاتصال، الاشتقاق، الدوال اللوغاريتمية والأسية، وحساب التكامل.",
        "detailsEn": "Limits, continuity, differentiation, logs & exponentials, and integration."
      },
      {
        "titleAr": "الهندسة الفضائية والأعداد العقدية",
        "titleEn": "Spatial Geometry & Complex Numbers",
        "detailsAr": "الجداء السلمي، الفلكة، المستويات في الفضاء، والأعداد المركبة وتطبيقاتها.",
        "detailsEn": "Dot products, spheres, 3D planes, and complex number operations."
      }
    ],
    "targetAudienceAr": "طلاب مسار البكالوريا وأولياء أمورهم الباحثين عن شرح معتمد ونتائج مثبتة.",
    "targetAudienceEn": "Baccalaureate students and parents seeking proven instruction and top exam outcomes.",
    "faqs": [
      {
        "questionAr": "ما الفرق الجوهري بين البكالوريا والثانوية العامة في الرياضيات؟",
        "questionEn": "What is the main difference between Baccalaureate and Thanaweya Amma math?",
        "answerAr": "تركز البكالوريا على البراهين الرياضية والتحليل المفاهيمي المتعمق والأعداد العقدية، بينما تعتمد الثانوية العامة أكثر على السرعة والتطبيقات الفيزيائية والميكانيكا.",
        "answerEn": "Baccalaureate focuses on mathematical proofs, complex numbers, and rigorous analysis, whereas Thanaweya Amma emphasizes speed, applied mechanics, and calculus."
      },
      {
        "questionAr": "هل الكورس يتضمن حل امتحانات الدورات السابقة؟",
        "questionEn": "Does the course include solved past national exams?",
        "answerAr": "نعم، يتم حل وتحليل امتحانات آخر 10 سنوات مع سلم التنقيط المعتمد ونماذج الإجابة الرسمية.",
        "answerEn": "Yes! We solve and analyze the last 10 years of official exams with exact grading rubrics."
      }
    ],
    "relatedSlugs": [
      "baccalaureate-math-explanation",
      "difference-baccalaureate-and-thanaweya-amma",
      "solved-baccalaureate-math-exams",
      "spider-math"
    ]
  },
  {
    "id": "baccalaureate-math-online-course",
    "slug": "baccalaureate-math-online-course",
    "slugAliases": [
      "كورس-رياضيات-البكالوريا-اون-لاين"
    ],
    "category": "baccalaureate",
    "categoryNameAr": "البكالوريا",
    "categoryNameEn": "Baccalaureate Mathematics",
    "keywordAr": "كورس رياضيات البكالوريا اون لاين",
    "keywordEn": "Online Baccalaureate Math Course",
    "pageTitleAr": "كورس رياضيات البكالوريا اون لاين | منصة سبايدر ماث التعليمية — ميس هبة عياد",
    "pageTitleEn": "Online Baccalaureate Math Course | Spider Math Platform — Eng. Heba Ayad",
    "metaDescriptionAr": "دليلك الكامل لـ كورس رياضيات البكالوريا اون لاين: شروحات تفصيلية، حل امتحانات، ومقارنات دقيقة بإشراف المهندسة هبة عبدالوهاب على سبايدر ماث.",
    "metaDescriptionEn": "Comprehensive guide to Online Baccalaureate Math Course: detailed video lectures, solved mock exams, and complete curriculum breakdowns on Spider Math.",
    "tagsAr": [
      "كورس رياضيات البكالوريا اون لاين",
      "رياضيات البكالوريا",
      "سبايدر ماث",
      "هبه عياد",
      "امتحانات بكالوريا"
    ],
    "tagsEn": [
      "Online Baccalaureate Math Course",
      "Baccalaureate Math",
      "Spider Math",
      "Heba Ayad",
      "Past Papers"
    ],
    "badgeAr": "كورس اونلاين",
    "badgeEn": "Online Course",
    "headlineAr": "كورس رياضيات البكالوريا اون لاين — دراسة مرنة وشاملة من منزلك مع ميس هبة",
    "headlineEn": "Online Baccalaureate Math Course — Flexible & Comprehensive Study at Home",
    "subheadlineAr": "منهج البكالوريا يتطلب فهماً رياضياً دقيقاً، وهنا نوفر لك الخطة المتكاملة للتفوق.",
    "subheadlineEn": "The Baccalaureate curriculum demands analytical rigor; we provide the exact blueprint for top marks.",
    "overviewAr": "يقدم مسار كورس رياضيات البكالوريا اون لاين على سبايدر ماث شرحاً عميقاً لكل دروس التحليل الرياضي، الاحتمالات، الهندسة الفضائية، والمتتاليات مع حلول مفصلة للامتحانات الوطنية لتأهيلك لأعلى الدرجات.",
    "overviewEn": "Our Online Baccalaureate Math Course track offers thorough coverage of calculus, functions, probability, solid geometry, and sequences with official past-exam walkthroughs.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "التحليل الرياضي والدوال العددية",
        "titleEn": "Mathematical Analysis & Functions",
        "detailsAr": "النهايات، الاتصال، الاشتقاق، الدوال اللوغاريتمية والأسية، وحساب التكامل.",
        "detailsEn": "Limits, continuity, differentiation, logs & exponentials, and integration."
      },
      {
        "titleAr": "الهندسة الفضائية والأعداد العقدية",
        "titleEn": "Spatial Geometry & Complex Numbers",
        "detailsAr": "الجداء السلمي، الفلكة، المستويات في الفضاء، والأعداد المركبة وتطبيقاتها.",
        "detailsEn": "Dot products, spheres, 3D planes, and complex number operations."
      }
    ],
    "targetAudienceAr": "طلاب مسار البكالوريا وأولياء أمورهم الباحثين عن شرح معتمد ونتائج مثبتة.",
    "targetAudienceEn": "Baccalaureate students and parents seeking proven instruction and top exam outcomes.",
    "faqs": [
      {
        "questionAr": "ما الفرق الجوهري بين البكالوريا والثانوية العامة في الرياضيات؟",
        "questionEn": "What is the main difference between Baccalaureate and Thanaweya Amma math?",
        "answerAr": "تركز البكالوريا على البراهين الرياضية والتحليل المفاهيمي المتعمق والأعداد العقدية، بينما تعتمد الثانوية العامة أكثر على السرعة والتطبيقات الفيزيائية والميكانيكا.",
        "answerEn": "Baccalaureate focuses on mathematical proofs, complex numbers, and rigorous analysis, whereas Thanaweya Amma emphasizes speed, applied mechanics, and calculus."
      },
      {
        "questionAr": "هل الكورس يتضمن حل امتحانات الدورات السابقة؟",
        "questionEn": "Does the course include solved past national exams?",
        "answerAr": "نعم، يتم حل وتحليل امتحانات آخر 10 سنوات مع سلم التنقيط المعتمد ونماذج الإجابة الرسمية.",
        "answerEn": "Yes! We solve and analyze the last 10 years of official exams with exact grading rubrics."
      }
    ],
    "relatedSlugs": [
      "baccalaureate-math-explanation",
      "difference-baccalaureate-and-thanaweya-amma",
      "solved-baccalaureate-math-exams",
      "spider-math"
    ]
  },
  {
    "id": "1st-year-baccalaureate-math",
    "slug": "1st-year-baccalaureate-math",
    "slugAliases": [
      "شرح-رياضيات-اولى-بكالوريا"
    ],
    "category": "baccalaureate",
    "categoryNameAr": "البكالوريا",
    "categoryNameEn": "Baccalaureate Mathematics",
    "keywordAr": "شرح رياضيات اولى بكالوريا",
    "keywordEn": "1st Year Baccalaureate Math",
    "pageTitleAr": "شرح رياضيات اولى بكالوريا | منصة سبايدر ماث التعليمية — ميس هبة عياد",
    "pageTitleEn": "1st Year Baccalaureate Math | Spider Math Platform — Eng. Heba Ayad",
    "metaDescriptionAr": "دليلك الكامل لـ شرح رياضيات اولى بكالوريا: شروحات تفصيلية، حل امتحانات، ومقارنات دقيقة بإشراف المهندسة هبة عبدالوهاب على سبايدر ماث.",
    "metaDescriptionEn": "Comprehensive guide to 1st Year Baccalaureate Math: detailed video lectures, solved mock exams, and complete curriculum breakdowns on Spider Math.",
    "tagsAr": [
      "شرح رياضيات اولى بكالوريا",
      "رياضيات البكالوريا",
      "سبايدر ماث",
      "هبه عياد",
      "امتحانات بكالوريا"
    ],
    "tagsEn": [
      "1st Year Baccalaureate Math",
      "Baccalaureate Math",
      "Spider Math",
      "Heba Ayad",
      "Past Papers"
    ],
    "badgeAr": "أولى بكالوريا",
    "badgeEn": "1st Year Baccalaureate",
    "headlineAr": "شرح رياضيات اولى بكالوريا — التأسيس المتين في الدوال والمتتاليات والمنطق",
    "headlineEn": "1st Year Baccalaureate Math — Strong Foundations in Functions & Sequences",
    "subheadlineAr": "منهج البكالوريا يتطلب فهماً رياضياً دقيقاً، وهنا نوفر لك الخطة المتكاملة للتفوق.",
    "subheadlineEn": "The Baccalaureate curriculum demands analytical rigor; we provide the exact blueprint for top marks.",
    "overviewAr": "يقدم مسار شرح رياضيات اولى بكالوريا على سبايدر ماث شرحاً عميقاً لكل دروس التحليل الرياضي، الاحتمالات، الهندسة الفضائية، والمتتاليات مع حلول مفصلة للامتحانات الوطنية لتأهيلك لأعلى الدرجات.",
    "overviewEn": "Our 1st Year Baccalaureate Math track offers thorough coverage of calculus, functions, probability, solid geometry, and sequences with official past-exam walkthroughs.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "التحليل الرياضي والدوال العددية",
        "titleEn": "Mathematical Analysis & Functions",
        "detailsAr": "النهايات، الاتصال، الاشتقاق، الدوال اللوغاريتمية والأسية، وحساب التكامل.",
        "detailsEn": "Limits, continuity, differentiation, logs & exponentials, and integration."
      },
      {
        "titleAr": "الهندسة الفضائية والأعداد العقدية",
        "titleEn": "Spatial Geometry & Complex Numbers",
        "detailsAr": "الجداء السلمي، الفلكة، المستويات في الفضاء، والأعداد المركبة وتطبيقاتها.",
        "detailsEn": "Dot products, spheres, 3D planes, and complex number operations."
      }
    ],
    "targetAudienceAr": "طلاب مسار البكالوريا وأولياء أمورهم الباحثين عن شرح معتمد ونتائج مثبتة.",
    "targetAudienceEn": "Baccalaureate students and parents seeking proven instruction and top exam outcomes.",
    "faqs": [
      {
        "questionAr": "ما الفرق الجوهري بين البكالوريا والثانوية العامة في الرياضيات؟",
        "questionEn": "What is the main difference between Baccalaureate and Thanaweya Amma math?",
        "answerAr": "تركز البكالوريا على البراهين الرياضية والتحليل المفاهيمي المتعمق والأعداد العقدية، بينما تعتمد الثانوية العامة أكثر على السرعة والتطبيقات الفيزيائية والميكانيكا.",
        "answerEn": "Baccalaureate focuses on mathematical proofs, complex numbers, and rigorous analysis, whereas Thanaweya Amma emphasizes speed, applied mechanics, and calculus."
      },
      {
        "questionAr": "هل الكورس يتضمن حل امتحانات الدورات السابقة؟",
        "questionEn": "Does the course include solved past national exams?",
        "answerAr": "نعم، يتم حل وتحليل امتحانات آخر 10 سنوات مع سلم التنقيط المعتمد ونماذج الإجابة الرسمية.",
        "answerEn": "Yes! We solve and analyze the last 10 years of official exams with exact grading rubrics."
      }
    ],
    "relatedSlugs": [
      "baccalaureate-math-explanation",
      "difference-baccalaureate-and-thanaweya-amma",
      "solved-baccalaureate-math-exams",
      "spider-math"
    ]
  },
  {
    "id": "2nd-year-baccalaureate-math",
    "slug": "2nd-year-baccalaureate-math",
    "slugAliases": [
      "شرح-رياضيات-تانية-بكالوريا"
    ],
    "category": "baccalaureate",
    "categoryNameAr": "البكالوريا",
    "categoryNameEn": "Baccalaureate Mathematics",
    "keywordAr": "شرح رياضيات تانية بكالوريا",
    "keywordEn": "2nd Year Baccalaureate Math",
    "pageTitleAr": "شرح رياضيات تانية بكالوريا | منصة سبايدر ماث التعليمية — ميس هبة عياد",
    "pageTitleEn": "2nd Year Baccalaureate Math | Spider Math Platform — Eng. Heba Ayad",
    "metaDescriptionAr": "دليلك الكامل لـ شرح رياضيات تانية بكالوريا: شروحات تفصيلية، حل امتحانات، ومقارنات دقيقة بإشراف المهندسة هبة عبدالوهاب على سبايدر ماث.",
    "metaDescriptionEn": "Comprehensive guide to 2nd Year Baccalaureate Math: detailed video lectures, solved mock exams, and complete curriculum breakdowns on Spider Math.",
    "tagsAr": [
      "شرح رياضيات تانية بكالوريا",
      "رياضيات البكالوريا",
      "سبايدر ماث",
      "هبه عياد",
      "امتحانات بكالوريا"
    ],
    "tagsEn": [
      "2nd Year Baccalaureate Math",
      "Baccalaureate Math",
      "Spider Math",
      "Heba Ayad",
      "Past Papers"
    ],
    "badgeAr": "تانية بكالوريا",
    "badgeEn": "2nd Year Baccalaureate",
    "headlineAr": "شرح رياضيات تانية بكالوريا — سنة التخرج والتحصيل العالي نحو كليات القمة",
    "headlineEn": "2nd Year Baccalaureate Math — Senior Year Mastery for Top University Admissions",
    "subheadlineAr": "منهج البكالوريا يتطلب فهماً رياضياً دقيقاً، وهنا نوفر لك الخطة المتكاملة للتفوق.",
    "subheadlineEn": "The Baccalaureate curriculum demands analytical rigor; we provide the exact blueprint for top marks.",
    "overviewAr": "يقدم مسار شرح رياضيات تانية بكالوريا على سبايدر ماث شرحاً عميقاً لكل دروس التحليل الرياضي، الاحتمالات، الهندسة الفضائية، والمتتاليات مع حلول مفصلة للامتحانات الوطنية لتأهيلك لأعلى الدرجات.",
    "overviewEn": "Our 2nd Year Baccalaureate Math track offers thorough coverage of calculus, functions, probability, solid geometry, and sequences with official past-exam walkthroughs.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "التحليل الرياضي والدوال العددية",
        "titleEn": "Mathematical Analysis & Functions",
        "detailsAr": "النهايات، الاتصال، الاشتقاق، الدوال اللوغاريتمية والأسية، وحساب التكامل.",
        "detailsEn": "Limits, continuity, differentiation, logs & exponentials, and integration."
      },
      {
        "titleAr": "الهندسة الفضائية والأعداد العقدية",
        "titleEn": "Spatial Geometry & Complex Numbers",
        "detailsAr": "الجداء السلمي، الفلكة، المستويات في الفضاء، والأعداد المركبة وتطبيقاتها.",
        "detailsEn": "Dot products, spheres, 3D planes, and complex number operations."
      }
    ],
    "targetAudienceAr": "طلاب مسار البكالوريا وأولياء أمورهم الباحثين عن شرح معتمد ونتائج مثبتة.",
    "targetAudienceEn": "Baccalaureate students and parents seeking proven instruction and top exam outcomes.",
    "faqs": [
      {
        "questionAr": "ما الفرق الجوهري بين البكالوريا والثانوية العامة في الرياضيات؟",
        "questionEn": "What is the main difference between Baccalaureate and Thanaweya Amma math?",
        "answerAr": "تركز البكالوريا على البراهين الرياضية والتحليل المفاهيمي المتعمق والأعداد العقدية، بينما تعتمد الثانوية العامة أكثر على السرعة والتطبيقات الفيزيائية والميكانيكا.",
        "answerEn": "Baccalaureate focuses on mathematical proofs, complex numbers, and rigorous analysis, whereas Thanaweya Amma emphasizes speed, applied mechanics, and calculus."
      },
      {
        "questionAr": "هل الكورس يتضمن حل امتحانات الدورات السابقة؟",
        "questionEn": "Does the course include solved past national exams?",
        "answerAr": "نعم، يتم حل وتحليل امتحانات آخر 10 سنوات مع سلم التنقيط المعتمد ونماذج الإجابة الرسمية.",
        "answerEn": "Yes! We solve and analyze the last 10 years of official exams with exact grading rubrics."
      }
    ],
    "relatedSlugs": [
      "baccalaureate-math-explanation",
      "difference-baccalaureate-and-thanaweya-amma",
      "solved-baccalaureate-math-exams",
      "spider-math"
    ]
  },
  {
    "id": "solved-baccalaureate-math-exams",
    "slug": "solved-baccalaureate-math-exams",
    "slugAliases": [
      "امتحانات-البكالوريا-رياضيات-محلولة"
    ],
    "category": "baccalaureate",
    "categoryNameAr": "البكالوريا",
    "categoryNameEn": "Baccalaureate Mathematics",
    "keywordAr": "امتحانات البكالوريا رياضيات محلولة",
    "keywordEn": "Solved Baccalaureate Math Exams",
    "pageTitleAr": "امتحانات البكالوريا رياضيات محلولة | منصة سبايدر ماث التعليمية — ميس هبة عياد",
    "pageTitleEn": "Solved Baccalaureate Math Exams | Spider Math Platform — Eng. Heba Ayad",
    "metaDescriptionAr": "دليلك الكامل لـ امتحانات البكالوريا رياضيات محلولة: شروحات تفصيلية، حل امتحانات، ومقارنات دقيقة بإشراف المهندسة هبة عبدالوهاب على سبايدر ماث.",
    "metaDescriptionEn": "Comprehensive guide to Solved Baccalaureate Math Exams: detailed video lectures, solved mock exams, and complete curriculum breakdowns on Spider Math.",
    "tagsAr": [
      "امتحانات البكالوريا رياضيات محلولة",
      "رياضيات البكالوريا",
      "سبايدر ماث",
      "هبه عياد",
      "امتحانات بكالوريا"
    ],
    "tagsEn": [
      "Solved Baccalaureate Math Exams",
      "Baccalaureate Math",
      "Spider Math",
      "Heba Ayad",
      "Past Papers"
    ],
    "badgeAr": "امتحانات محلولة",
    "badgeEn": "Solved Past Papers",
    "headlineAr": "امتحانات البكالوريا رياضيات محلولة — نماذج امتحانات رسمية بالحل النموذجي والخطوات",
    "headlineEn": "Solved Baccalaureate Math Exams — Official Past Papers with Step-by-Step Keys",
    "subheadlineAr": "منهج البكالوريا يتطلب فهماً رياضياً دقيقاً، وهنا نوفر لك الخطة المتكاملة للتفوق.",
    "subheadlineEn": "The Baccalaureate curriculum demands analytical rigor; we provide the exact blueprint for top marks.",
    "overviewAr": "يقدم مسار امتحانات البكالوريا رياضيات محلولة على سبايدر ماث شرحاً عميقاً لكل دروس التحليل الرياضي، الاحتمالات، الهندسة الفضائية، والمتتاليات مع حلول مفصلة للامتحانات الوطنية لتأهيلك لأعلى الدرجات.",
    "overviewEn": "Our Solved Baccalaureate Math Exams track offers thorough coverage of calculus, functions, probability, solid geometry, and sequences with official past-exam walkthroughs.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "التحليل الرياضي والدوال العددية",
        "titleEn": "Mathematical Analysis & Functions",
        "detailsAr": "النهايات، الاتصال، الاشتقاق، الدوال اللوغاريتمية والأسية، وحساب التكامل.",
        "detailsEn": "Limits, continuity, differentiation, logs & exponentials, and integration."
      },
      {
        "titleAr": "الهندسة الفضائية والأعداد العقدية",
        "titleEn": "Spatial Geometry & Complex Numbers",
        "detailsAr": "الجداء السلمي، الفلكة، المستويات في الفضاء، والأعداد المركبة وتطبيقاتها.",
        "detailsEn": "Dot products, spheres, 3D planes, and complex number operations."
      }
    ],
    "targetAudienceAr": "طلاب مسار البكالوريا وأولياء أمورهم الباحثين عن شرح معتمد ونتائج مثبتة.",
    "targetAudienceEn": "Baccalaureate students and parents seeking proven instruction and top exam outcomes.",
    "faqs": [
      {
        "questionAr": "ما الفرق الجوهري بين البكالوريا والثانوية العامة في الرياضيات؟",
        "questionEn": "What is the main difference between Baccalaureate and Thanaweya Amma math?",
        "answerAr": "تركز البكالوريا على البراهين الرياضية والتحليل المفاهيمي المتعمق والأعداد العقدية، بينما تعتمد الثانوية العامة أكثر على السرعة والتطبيقات الفيزيائية والميكانيكا.",
        "answerEn": "Baccalaureate focuses on mathematical proofs, complex numbers, and rigorous analysis, whereas Thanaweya Amma emphasizes speed, applied mechanics, and calculus."
      },
      {
        "questionAr": "هل الكورس يتضمن حل امتحانات الدورات السابقة؟",
        "questionEn": "Does the course include solved past national exams?",
        "answerAr": "نعم، يتم حل وتحليل امتحانات آخر 10 سنوات مع سلم التنقيط المعتمد ونماذج الإجابة الرسمية.",
        "answerEn": "Yes! We solve and analyze the last 10 years of official exams with exact grading rubrics."
      }
    ],
    "relatedSlugs": [
      "baccalaureate-math-explanation",
      "difference-baccalaureate-and-thanaweya-amma",
      "solved-baccalaureate-math-exams",
      "spider-math"
    ]
  },
  {
    "id": "baccalaureate-math-course-prices",
    "slug": "baccalaureate-math-course-prices",
    "slugAliases": [
      "اسعار-كورس-البكالوريا-رياضيات"
    ],
    "category": "baccalaureate",
    "categoryNameAr": "البكالوريا",
    "categoryNameEn": "Baccalaureate Mathematics",
    "keywordAr": "اسعار كورس البكالوريا رياضيات",
    "keywordEn": "Baccalaureate Math Course Pricing",
    "pageTitleAr": "اسعار كورس البكالوريا رياضيات | منصة سبايدر ماث التعليمية — ميس هبة عياد",
    "pageTitleEn": "Baccalaureate Math Course Pricing | Spider Math Platform — Eng. Heba Ayad",
    "metaDescriptionAr": "دليلك الكامل لـ اسعار كورس البكالوريا رياضيات: شروحات تفصيلية، حل امتحانات، ومقارنات دقيقة بإشراف المهندسة هبة عبدالوهاب على سبايدر ماث.",
    "metaDescriptionEn": "Comprehensive guide to Baccalaureate Math Course Pricing: detailed video lectures, solved mock exams, and complete curriculum breakdowns on Spider Math.",
    "tagsAr": [
      "اسعار كورس البكالوريا رياضيات",
      "رياضيات البكالوريا",
      "سبايدر ماث",
      "هبه عياد",
      "امتحانات بكالوريا"
    ],
    "tagsEn": [
      "Baccalaureate Math Course Pricing",
      "Baccalaureate Math",
      "Spider Math",
      "Heba Ayad",
      "Past Papers"
    ],
    "badgeAr": "الباقات والأسعار",
    "badgeEn": "Pricing & Packages",
    "headlineAr": "اسعار كورس البكالوريا رياضيات — باقات شهرية وفصلية مرنة تناسب جميع الطلاب",
    "headlineEn": "Baccalaureate Math Course Pricing — Flexible Monthly & Semester Plans",
    "subheadlineAr": "منهج البكالوريا يتطلب فهماً رياضياً دقيقاً، وهنا نوفر لك الخطة المتكاملة للتفوق.",
    "subheadlineEn": "The Baccalaureate curriculum demands analytical rigor; we provide the exact blueprint for top marks.",
    "overviewAr": "يقدم مسار اسعار كورس البكالوريا رياضيات على سبايدر ماث شرحاً عميقاً لكل دروس التحليل الرياضي، الاحتمالات، الهندسة الفضائية، والمتتاليات مع حلول مفصلة للامتحانات الوطنية لتأهيلك لأعلى الدرجات.",
    "overviewEn": "Our Baccalaureate Math Course Pricing track offers thorough coverage of calculus, functions, probability, solid geometry, and sequences with official past-exam walkthroughs.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "التحليل الرياضي والدوال العددية",
        "titleEn": "Mathematical Analysis & Functions",
        "detailsAr": "النهايات، الاتصال، الاشتقاق، الدوال اللوغاريتمية والأسية، وحساب التكامل.",
        "detailsEn": "Limits, continuity, differentiation, logs & exponentials, and integration."
      },
      {
        "titleAr": "الهندسة الفضائية والأعداد العقدية",
        "titleEn": "Spatial Geometry & Complex Numbers",
        "detailsAr": "الجداء السلمي، الفلكة، المستويات في الفضاء، والأعداد المركبة وتطبيقاتها.",
        "detailsEn": "Dot products, spheres, 3D planes, and complex number operations."
      }
    ],
    "targetAudienceAr": "طلاب مسار البكالوريا وأولياء أمورهم الباحثين عن شرح معتمد ونتائج مثبتة.",
    "targetAudienceEn": "Baccalaureate students and parents seeking proven instruction and top exam outcomes.",
    "faqs": [
      {
        "questionAr": "ما الفرق الجوهري بين البكالوريا والثانوية العامة في الرياضيات؟",
        "questionEn": "What is the main difference between Baccalaureate and Thanaweya Amma math?",
        "answerAr": "تركز البكالوريا على البراهين الرياضية والتحليل المفاهيمي المتعمق والأعداد العقدية، بينما تعتمد الثانوية العامة أكثر على السرعة والتطبيقات الفيزيائية والميكانيكا.",
        "answerEn": "Baccalaureate focuses on mathematical proofs, complex numbers, and rigorous analysis, whereas Thanaweya Amma emphasizes speed, applied mechanics, and calculus."
      },
      {
        "questionAr": "هل الكورس يتضمن حل امتحانات الدورات السابقة؟",
        "questionEn": "Does the course include solved past national exams?",
        "answerAr": "نعم، يتم حل وتحليل امتحانات آخر 10 سنوات مع سلم التنقيط المعتمد ونماذج الإجابة الرسمية.",
        "answerEn": "Yes! We solve and analyze the last 10 years of official exams with exact grading rubrics."
      }
    ],
    "relatedSlugs": [
      "baccalaureate-math-explanation",
      "difference-baccalaureate-and-thanaweya-amma",
      "solved-baccalaureate-math-exams",
      "spider-math"
    ]
  },
  {
    "id": "difference-baccalaureate-and-thanaweya-amma",
    "slug": "difference-baccalaureate-and-thanaweya-amma",
    "slugAliases": [
      "الفرق-بين-البكالوريا-والثانوية-العامة"
    ],
    "category": "baccalaureate",
    "categoryNameAr": "البكالوريا",
    "categoryNameEn": "Baccalaureate Mathematics",
    "keywordAr": "الفرق بين البكالوريا والثانوية العامة",
    "keywordEn": "Difference Baccalaureate vs Thanaweya Amma",
    "pageTitleAr": "الفرق بين البكالوريا والثانوية العامة | منصة سبايدر ماث التعليمية — ميس هبة عياد",
    "pageTitleEn": "Difference Baccalaureate vs Thanaweya Amma | Spider Math Platform — Eng. Heba Ayad",
    "metaDescriptionAr": "دليلك الكامل لـ الفرق بين البكالوريا والثانوية العامة: شروحات تفصيلية، حل امتحانات، ومقارنات دقيقة بإشراف المهندسة هبة عبدالوهاب على سبايدر ماث.",
    "metaDescriptionEn": "Comprehensive guide to Difference Baccalaureate vs Thanaweya Amma: detailed video lectures, solved mock exams, and complete curriculum breakdowns on Spider Math.",
    "tagsAr": [
      "الفرق بين البكالوريا والثانوية العامة",
      "رياضيات البكالوريا",
      "سبايدر ماث",
      "هبه عياد",
      "امتحانات بكالوريا"
    ],
    "tagsEn": [
      "Difference Baccalaureate vs Thanaweya Amma",
      "Baccalaureate Math",
      "Spider Math",
      "Heba Ayad",
      "Past Papers"
    ],
    "badgeAr": "دليل المقارنة",
    "badgeEn": "Comparison Guide",
    "headlineAr": "الفرق بين البكالوريا والثانوية العامة — مقارنة شاملة للمناهج ونظام التقييم والقبول",
    "headlineEn": "Difference Between Baccalaureate and Thanaweya Amma — In-Depth Analysis",
    "subheadlineAr": "منهج البكالوريا يتطلب فهماً رياضياً دقيقاً، وهنا نوفر لك الخطة المتكاملة للتفوق.",
    "subheadlineEn": "The Baccalaureate curriculum demands analytical rigor; we provide the exact blueprint for top marks.",
    "overviewAr": "يقدم مسار الفرق بين البكالوريا والثانوية العامة على سبايدر ماث شرحاً عميقاً لكل دروس التحليل الرياضي، الاحتمالات، الهندسة الفضائية، والمتتاليات مع حلول مفصلة للامتحانات الوطنية لتأهيلك لأعلى الدرجات.",
    "overviewEn": "Our Difference Baccalaureate vs Thanaweya Amma track offers thorough coverage of calculus, functions, probability, solid geometry, and sequences with official past-exam walkthroughs.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "التحليل الرياضي والدوال العددية",
        "titleEn": "Mathematical Analysis & Functions",
        "detailsAr": "النهايات، الاتصال، الاشتقاق، الدوال اللوغاريتمية والأسية، وحساب التكامل.",
        "detailsEn": "Limits, continuity, differentiation, logs & exponentials, and integration."
      },
      {
        "titleAr": "الهندسة الفضائية والأعداد العقدية",
        "titleEn": "Spatial Geometry & Complex Numbers",
        "detailsAr": "الجداء السلمي، الفلكة، المستويات في الفضاء، والأعداد المركبة وتطبيقاتها.",
        "detailsEn": "Dot products, spheres, 3D planes, and complex number operations."
      }
    ],
    "targetAudienceAr": "طلاب مسار البكالوريا وأولياء أمورهم الباحثين عن شرح معتمد ونتائج مثبتة.",
    "targetAudienceEn": "Baccalaureate students and parents seeking proven instruction and top exam outcomes.",
    "faqs": [
      {
        "questionAr": "ما الفرق الجوهري بين البكالوريا والثانوية العامة في الرياضيات؟",
        "questionEn": "What is the main difference between Baccalaureate and Thanaweya Amma math?",
        "answerAr": "تركز البكالوريا على البراهين الرياضية والتحليل المفاهيمي المتعمق والأعداد العقدية، بينما تعتمد الثانوية العامة أكثر على السرعة والتطبيقات الفيزيائية والميكانيكا.",
        "answerEn": "Baccalaureate focuses on mathematical proofs, complex numbers, and rigorous analysis, whereas Thanaweya Amma emphasizes speed, applied mechanics, and calculus."
      },
      {
        "questionAr": "هل الكورس يتضمن حل امتحانات الدورات السابقة؟",
        "questionEn": "Does the course include solved past national exams?",
        "answerAr": "نعم، يتم حل وتحليل امتحانات آخر 10 سنوات مع سلم التنقيط المعتمد ونماذج الإجابة الرسمية.",
        "answerEn": "Yes! We solve and analyze the last 10 years of official exams with exact grading rubrics."
      }
    ],
    "relatedSlugs": [
      "baccalaureate-math-explanation",
      "difference-baccalaureate-and-thanaweya-amma",
      "solved-baccalaureate-math-exams",
      "spider-math"
    ]
  },
  {
    "id": "night-exam-revision-math",
    "slug": "night-exam-revision-math",
    "slugAliases": [
      "مراجعة-ليلة-الامتحان-رياضيات"
    ],
    "category": "reviews",
    "categoryNameAr": "المراجعات وليالي الامتحان",
    "categoryNameEn": "Final & Night-Before Exam Reviews",
    "keywordAr": "مراجعة ليلة الامتحان رياضيات",
    "keywordEn": "Night-Before Exam Math Revision",
    "pageTitleAr": "مراجعة ليلة الامتحان رياضيات | ميس هبة عياد — سبايدر ماث",
    "pageTitleEn": "Night-Before Exam Math Revision | Miss Heba Ayad — Spider Math",
    "metaDescriptionAr": "أقوى مراجعة ليلة الامتحان رياضيات: مراجعة مكثفة، حل تريكات، ملخصات PDF، وأهم التوقعات الامتحانية مع المهندسة هبة عبدالوهاب.",
    "metaDescriptionEn": "Ultimate Night-Before Exam Math Revision: intensive workshops, tricky problem walkthroughs, PDF cheat sheets, and predicted questions on Spider Math.",
    "tagsAr": [
      "مراجعة ليلة الامتحان رياضيات",
      "مراجعة رياضيات",
      "ليلة الامتحان",
      "هبه عياد",
      "ملخص PDF"
    ],
    "tagsEn": [
      "Night-Before Exam Math Revision",
      "Math Revision",
      "Night Before Exam",
      "Heba Ayad",
      "PDF Summary"
    ],
    "badgeAr": "ليلة الامتحان",
    "badgeEn": "Night-Before Exam",
    "headlineAr": "مراجعة ليلة الامتحان رياضيات — خريطة الإنقاذ السريع وتجميع القوانين الهامة",
    "headlineEn": "Night-Before Exam Math Revision — Rapid Formula Review & Survival Blueprint",
    "subheadlineAr": "الساعات الأخيرة قبل الامتحان هي الحاسمة؛ رتب أفكارك وتدرب على أهم المسائل المتوقعة.",
    "subheadlineEn": "The final hours before the test are decisive; organize your formulas and tackle predicted questions.",
    "overviewAr": "صُممت ورشة مراجعة ليلة الامتحان رياضيات لتقدم للطالب شحنة مكثفة من الثقة والمعرفة المركزة: تجميع القوانين في صفحة واحدة، استعراض تريكات الامتحان الأكثر تكراراً، وتدريب عملي على نماذج امتحانية مطابقة لنظام الوزارة.",
    "overviewEn": "Our Night-Before Exam Math Revision bootcamp delivers concentrated confidence: one-page formula sheets, most frequent exam traps, and realistic mock exam drills.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "كبسولة القوانين والعلاقات الرياضية",
        "titleEn": "Formula Capsule & Cheat Sheets",
        "detailsAr": "تجميع ذكي لكل القوانين مع إرشادات متى تستخدم كل قانون.",
        "detailsEn": "Smart formula compilation with clear criteria for applying each rule."
      },
      {
        "titleAr": "حل الأسئلة الأكثر توقعاً وتكراراً",
        "titleEn": "High-Probability Exam Problems",
        "detailsAr": "حل مسائل مستوحاة من الامتحانات التجريبية ونماذج التوجيه.",
        "detailsEn": "Step-by-step solutions for experimental and ministerial model questions."
      }
    ],
    "targetAudienceAr": "الطلاب المقبلون على امتحانات نصف العام أو نهاية العام الراغبون في تثبيت معلوماتهم.",
    "targetAudienceEn": "Students sitting for midterms or final exams needing high-yield consolidation.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني تحميل مراجعة ليلة الامتحان رياضيات بصيغة PDF؟",
        "questionEn": "How do I download Night-Before Exam Math Revision in PDF format?",
        "answerAr": "الملخص متاح للتحميل المباشر وبشكل مجاني بجودة طباعة فائقة لجميع الطلاب المسجلين بالمنصة.",
        "answerEn": "The summary is available for direct high-resolution PDF download for all registered students."
      },
      {
        "questionAr": "هل تكفي مراجعة ليلة الامتحان وحدها؟",
        "questionEn": "Is the night-before revision enough on its own?",
        "answerAr": "المراجعة مصممة لترتيب أفكارك وتذكيرك بأهم النظريات والتريكات، ويفضل أن تقترن بحل شيتات التدريب المرفقة.",
        "answerEn": "It organizes your knowledge and highlights high-yield traps; pair it with the attached drill sheets for maximum results."
      }
    ],
    "relatedSlugs": [
      "night-exam-revision-math",
      "night-exam-math-summary-pdf",
      "final-math-comprehensive-revision",
      "spider-math"
    ]
  },
  {
    "id": "baccalaureate-night-exam-math-revision",
    "slug": "baccalaureate-night-exam-math-revision",
    "slugAliases": [
      "مراجعة-ليلة-الامتحان-رياضيات-البكالوريا"
    ],
    "category": "reviews",
    "categoryNameAr": "المراجعات وليالي الامتحان",
    "categoryNameEn": "Final & Night-Before Exam Reviews",
    "keywordAr": "مراجعة ليلة الامتحان رياضيات البكالوريا",
    "keywordEn": "Baccalaureate Night-Before Exam Math",
    "pageTitleAr": "مراجعة ليلة الامتحان رياضيات البكالوريا | ميس هبة عياد — سبايدر ماث",
    "pageTitleEn": "Baccalaureate Night-Before Exam Math | Miss Heba Ayad — Spider Math",
    "metaDescriptionAr": "أقوى مراجعة ليلة الامتحان رياضيات البكالوريا: مراجعة مكثفة، حل تريكات، ملخصات PDF، وأهم التوقعات الامتحانية مع المهندسة هبة عبدالوهاب.",
    "metaDescriptionEn": "Ultimate Baccalaureate Night-Before Exam Math: intensive workshops, tricky problem walkthroughs, PDF cheat sheets, and predicted questions on Spider Math.",
    "tagsAr": [
      "مراجعة ليلة الامتحان رياضيات البكالوريا",
      "مراجعة رياضيات",
      "ليلة الامتحان",
      "هبه عياد",
      "ملخص PDF"
    ],
    "tagsEn": [
      "Baccalaureate Night-Before Exam Math",
      "Math Revision",
      "Night Before Exam",
      "Heba Ayad",
      "PDF Summary"
    ],
    "badgeAr": "مراجعة البكالوريا",
    "badgeEn": "Baccalaureate Revision",
    "headlineAr": "مراجعة ليلة الامتحان رياضيات البكالوريا — أهم الأفكار المتوقعة في الامتحان الوطني",
    "headlineEn": "Baccalaureate Night-Before Exam Math — High-Probability Exam Questions",
    "subheadlineAr": "الساعات الأخيرة قبل الامتحان هي الحاسمة؛ رتب أفكارك وتدرب على أهم المسائل المتوقعة.",
    "subheadlineEn": "The final hours before the test are decisive; organize your formulas and tackle predicted questions.",
    "overviewAr": "صُممت ورشة مراجعة ليلة الامتحان رياضيات البكالوريا لتقدم للطالب شحنة مكثفة من الثقة والمعرفة المركزة: تجميع القوانين في صفحة واحدة، استعراض تريكات الامتحان الأكثر تكراراً، وتدريب عملي على نماذج امتحانية مطابقة لنظام الوزارة.",
    "overviewEn": "Our Baccalaureate Night-Before Exam Math bootcamp delivers concentrated confidence: one-page formula sheets, most frequent exam traps, and realistic mock exam drills.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "كبسولة القوانين والعلاقات الرياضية",
        "titleEn": "Formula Capsule & Cheat Sheets",
        "detailsAr": "تجميع ذكي لكل القوانين مع إرشادات متى تستخدم كل قانون.",
        "detailsEn": "Smart formula compilation with clear criteria for applying each rule."
      },
      {
        "titleAr": "حل الأسئلة الأكثر توقعاً وتكراراً",
        "titleEn": "High-Probability Exam Problems",
        "detailsAr": "حل مسائل مستوحاة من الامتحانات التجريبية ونماذج التوجيه.",
        "detailsEn": "Step-by-step solutions for experimental and ministerial model questions."
      }
    ],
    "targetAudienceAr": "الطلاب المقبلون على امتحانات نصف العام أو نهاية العام الراغبون في تثبيت معلوماتهم.",
    "targetAudienceEn": "Students sitting for midterms or final exams needing high-yield consolidation.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني تحميل مراجعة ليلة الامتحان رياضيات البكالوريا بصيغة PDF؟",
        "questionEn": "How do I download Baccalaureate Night-Before Exam Math in PDF format?",
        "answerAr": "الملخص متاح للتحميل المباشر وبشكل مجاني بجودة طباعة فائقة لجميع الطلاب المسجلين بالمنصة.",
        "answerEn": "The summary is available for direct high-resolution PDF download for all registered students."
      },
      {
        "questionAr": "هل تكفي مراجعة ليلة الامتحان وحدها؟",
        "questionEn": "Is the night-before revision enough on its own?",
        "answerAr": "المراجعة مصممة لترتيب أفكارك وتذكيرك بأهم النظريات والتريكات، ويفضل أن تقترن بحل شيتات التدريب المرفقة.",
        "answerEn": "It organizes your knowledge and highlights high-yield traps; pair it with the attached drill sheets for maximum results."
      }
    ],
    "relatedSlugs": [
      "night-exam-revision-math",
      "night-exam-math-summary-pdf",
      "final-math-comprehensive-revision",
      "spider-math"
    ]
  },
  {
    "id": "thanaweya-amma-night-exam-math-revision",
    "slug": "thanaweya-amma-night-exam-math-revision",
    "slugAliases": [
      "مراجعة-ليلة-الامتحان-رياضيات-ثانوية-عامة"
    ],
    "category": "reviews",
    "categoryNameAr": "المراجعات وليالي الامتحان",
    "categoryNameEn": "Final & Night-Before Exam Reviews",
    "keywordAr": "مراجعة ليلة الامتحان رياضيات ثانوية عامة",
    "keywordEn": "Thanaweya Amma Night-Before Exam Math",
    "pageTitleAr": "مراجعة ليلة الامتحان رياضيات ثانوية عامة | ميس هبة عياد — سبايدر ماث",
    "pageTitleEn": "Thanaweya Amma Night-Before Exam Math | Miss Heba Ayad — Spider Math",
    "metaDescriptionAr": "أقوى مراجعة ليلة الامتحان رياضيات ثانوية عامة: مراجعة مكثفة، حل تريكات، ملخصات PDF، وأهم التوقعات الامتحانية مع المهندسة هبة عبدالوهاب.",
    "metaDescriptionEn": "Ultimate Thanaweya Amma Night-Before Exam Math: intensive workshops, tricky problem walkthroughs, PDF cheat sheets, and predicted questions on Spider Math.",
    "tagsAr": [
      "مراجعة ليلة الامتحان رياضيات ثانوية عامة",
      "مراجعة رياضيات",
      "ليلة الامتحان",
      "هبه عياد",
      "ملخص PDF"
    ],
    "tagsEn": [
      "Thanaweya Amma Night-Before Exam Math",
      "Math Revision",
      "Night Before Exam",
      "Heba Ayad",
      "PDF Summary"
    ],
    "badgeAr": "ليالي الثانوية العامة",
    "badgeEn": "Thanaweya Amma Nights",
    "headlineAr": "مراجعة ليلة الامتحان رياضيات ثانوية عامة — مراجعة مركزة لجميع فروع علمي رياضة",
    "headlineEn": "Thanaweya Amma Night-Before Exam Math — Concentrated Review for All Branches",
    "subheadlineAr": "الساعات الأخيرة قبل الامتحان هي الحاسمة؛ رتب أفكارك وتدرب على أهم المسائل المتوقعة.",
    "subheadlineEn": "The final hours before the test are decisive; organize your formulas and tackle predicted questions.",
    "overviewAr": "صُممت ورشة مراجعة ليلة الامتحان رياضيات ثانوية عامة لتقدم للطالب شحنة مكثفة من الثقة والمعرفة المركزة: تجميع القوانين في صفحة واحدة، استعراض تريكات الامتحان الأكثر تكراراً، وتدريب عملي على نماذج امتحانية مطابقة لنظام الوزارة.",
    "overviewEn": "Our Thanaweya Amma Night-Before Exam Math bootcamp delivers concentrated confidence: one-page formula sheets, most frequent exam traps, and realistic mock exam drills.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "كبسولة القوانين والعلاقات الرياضية",
        "titleEn": "Formula Capsule & Cheat Sheets",
        "detailsAr": "تجميع ذكي لكل القوانين مع إرشادات متى تستخدم كل قانون.",
        "detailsEn": "Smart formula compilation with clear criteria for applying each rule."
      },
      {
        "titleAr": "حل الأسئلة الأكثر توقعاً وتكراراً",
        "titleEn": "High-Probability Exam Problems",
        "detailsAr": "حل مسائل مستوحاة من الامتحانات التجريبية ونماذج التوجيه.",
        "detailsEn": "Step-by-step solutions for experimental and ministerial model questions."
      }
    ],
    "targetAudienceAr": "الطلاب المقبلون على امتحانات نصف العام أو نهاية العام الراغبون في تثبيت معلوماتهم.",
    "targetAudienceEn": "Students sitting for midterms or final exams needing high-yield consolidation.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني تحميل مراجعة ليلة الامتحان رياضيات ثانوية عامة بصيغة PDF؟",
        "questionEn": "How do I download Thanaweya Amma Night-Before Exam Math in PDF format?",
        "answerAr": "الملخص متاح للتحميل المباشر وبشكل مجاني بجودة طباعة فائقة لجميع الطلاب المسجلين بالمنصة.",
        "answerEn": "The summary is available for direct high-resolution PDF download for all registered students."
      },
      {
        "questionAr": "هل تكفي مراجعة ليلة الامتحان وحدها؟",
        "questionEn": "Is the night-before revision enough on its own?",
        "answerAr": "المراجعة مصممة لترتيب أفكارك وتذكيرك بأهم النظريات والتريكات، ويفضل أن تقترن بحل شيتات التدريب المرفقة.",
        "answerEn": "It organizes your knowledge and highlights high-yield traps; pair it with the attached drill sheets for maximum results."
      }
    ],
    "relatedSlugs": [
      "night-exam-revision-math",
      "night-exam-math-summary-pdf",
      "final-math-comprehensive-revision",
      "spider-math"
    ]
  },
  {
    "id": "calculus-differentiation-night-exam-revision",
    "slug": "calculus-differentiation-night-exam-revision",
    "slugAliases": [
      "مراجعة-ليلة-الامتحان-تفاضل-وتكامل"
    ],
    "category": "reviews",
    "categoryNameAr": "المراجعات وليالي الامتحان",
    "categoryNameEn": "Final & Night-Before Exam Reviews",
    "keywordAr": "مراجعة ليلة الامتحان تفاضل وتكامل",
    "keywordEn": "Calculus & Differentiation Exam Night Revision",
    "pageTitleAr": "مراجعة ليلة الامتحان تفاضل وتكامل | ميس هبة عياد — سبايدر ماث",
    "pageTitleEn": "Calculus & Differentiation Exam Night Revision | Miss Heba Ayad — Spider Math",
    "metaDescriptionAr": "أقوى مراجعة ليلة الامتحان تفاضل وتكامل: مراجعة مكثفة، حل تريكات، ملخصات PDF، وأهم التوقعات الامتحانية مع المهندسة هبة عبدالوهاب.",
    "metaDescriptionEn": "Ultimate Calculus & Differentiation Exam Night Revision: intensive workshops, tricky problem walkthroughs, PDF cheat sheets, and predicted questions on Spider Math.",
    "tagsAr": [
      "مراجعة ليلة الامتحان تفاضل وتكامل",
      "مراجعة رياضيات",
      "ليلة الامتحان",
      "هبه عياد",
      "ملخص PDF"
    ],
    "tagsEn": [
      "Calculus & Differentiation Exam Night Revision",
      "Math Revision",
      "Night Before Exam",
      "Heba Ayad",
      "PDF Summary"
    ],
    "badgeAr": "تفاضل وتكامل",
    "badgeEn": "Calculus Mastery",
    "headlineAr": "مراجعة ليلة الامتحان تفاضل وتكامل — قوانين الاشتقاق، سلوك الدالة، والتكامل المحدد",
    "headlineEn": "Calculus & Differentiation Exam Night Revision — Derivatives, Curve Sketching & Integrals",
    "subheadlineAr": "الساعات الأخيرة قبل الامتحان هي الحاسمة؛ رتب أفكارك وتدرب على أهم المسائل المتوقعة.",
    "subheadlineEn": "The final hours before the test are decisive; organize your formulas and tackle predicted questions.",
    "overviewAr": "صُممت ورشة مراجعة ليلة الامتحان تفاضل وتكامل لتقدم للطالب شحنة مكثفة من الثقة والمعرفة المركزة: تجميع القوانين في صفحة واحدة، استعراض تريكات الامتحان الأكثر تكراراً، وتدريب عملي على نماذج امتحانية مطابقة لنظام الوزارة.",
    "overviewEn": "Our Calculus & Differentiation Exam Night Revision bootcamp delivers concentrated confidence: one-page formula sheets, most frequent exam traps, and realistic mock exam drills.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "كبسولة القوانين والعلاقات الرياضية",
        "titleEn": "Formula Capsule & Cheat Sheets",
        "detailsAr": "تجميع ذكي لكل القوانين مع إرشادات متى تستخدم كل قانون.",
        "detailsEn": "Smart formula compilation with clear criteria for applying each rule."
      },
      {
        "titleAr": "حل الأسئلة الأكثر توقعاً وتكراراً",
        "titleEn": "High-Probability Exam Problems",
        "detailsAr": "حل مسائل مستوحاة من الامتحانات التجريبية ونماذج التوجيه.",
        "detailsEn": "Step-by-step solutions for experimental and ministerial model questions."
      }
    ],
    "targetAudienceAr": "الطلاب المقبلون على امتحانات نصف العام أو نهاية العام الراغبون في تثبيت معلوماتهم.",
    "targetAudienceEn": "Students sitting for midterms or final exams needing high-yield consolidation.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني تحميل مراجعة ليلة الامتحان تفاضل وتكامل بصيغة PDF؟",
        "questionEn": "How do I download Calculus & Differentiation Exam Night Revision in PDF format?",
        "answerAr": "الملخص متاح للتحميل المباشر وبشكل مجاني بجودة طباعة فائقة لجميع الطلاب المسجلين بالمنصة.",
        "answerEn": "The summary is available for direct high-resolution PDF download for all registered students."
      },
      {
        "questionAr": "هل تكفي مراجعة ليلة الامتحان وحدها؟",
        "questionEn": "Is the night-before revision enough on its own?",
        "answerAr": "المراجعة مصممة لترتيب أفكارك وتذكيرك بأهم النظريات والتريكات، ويفضل أن تقترن بحل شيتات التدريب المرفقة.",
        "answerEn": "It organizes your knowledge and highlights high-yield traps; pair it with the attached drill sheets for maximum results."
      }
    ],
    "relatedSlugs": [
      "night-exam-revision-math",
      "night-exam-math-summary-pdf",
      "final-math-comprehensive-revision",
      "spider-math"
    ]
  },
  {
    "id": "algebra-geometry-night-exam-revision",
    "slug": "algebra-geometry-night-exam-revision",
    "slugAliases": [
      "مراجعة-ليلة-الامتحان-جبر-وهندسة"
    ],
    "category": "reviews",
    "categoryNameAr": "المراجعات وليالي الامتحان",
    "categoryNameEn": "Final & Night-Before Exam Reviews",
    "keywordAr": "مراجعة ليلة الامتحان جبر وهندسة",
    "keywordEn": "Algebra & Geometry Exam Night Revision",
    "pageTitleAr": "مراجعة ليلة الامتحان جبر وهندسة | ميس هبة عياد — سبايدر ماث",
    "pageTitleEn": "Algebra & Geometry Exam Night Revision | Miss Heba Ayad — Spider Math",
    "metaDescriptionAr": "أقوى مراجعة ليلة الامتحان جبر وهندسة: مراجعة مكثفة، حل تريكات، ملخصات PDF، وأهم التوقعات الامتحانية مع المهندسة هبة عبدالوهاب.",
    "metaDescriptionEn": "Ultimate Algebra & Geometry Exam Night Revision: intensive workshops, tricky problem walkthroughs, PDF cheat sheets, and predicted questions on Spider Math.",
    "tagsAr": [
      "مراجعة ليلة الامتحان جبر وهندسة",
      "مراجعة رياضيات",
      "ليلة الامتحان",
      "هبه عياد",
      "ملخص PDF"
    ],
    "tagsEn": [
      "Algebra & Geometry Exam Night Revision",
      "Math Revision",
      "Night Before Exam",
      "Heba Ayad",
      "PDF Summary"
    ],
    "badgeAr": "جبر وهندسة فراغية",
    "badgeEn": "Algebra & Solid Geometry",
    "headlineAr": "مراجعة ليلة الامتحان جبر وهندسة — التباديل، التوافيق، ذات الحدين، ومعادلات الفراغية",
    "headlineEn": "Algebra & Geometry Exam Night Revision — Permutations, Binomial Theorem & 3D Vectors",
    "subheadlineAr": "الساعات الأخيرة قبل الامتحان هي الحاسمة؛ رتب أفكارك وتدرب على أهم المسائل المتوقعة.",
    "subheadlineEn": "The final hours before the test are decisive; organize your formulas and tackle predicted questions.",
    "overviewAr": "صُممت ورشة مراجعة ليلة الامتحان جبر وهندسة لتقدم للطالب شحنة مكثفة من الثقة والمعرفة المركزة: تجميع القوانين في صفحة واحدة، استعراض تريكات الامتحان الأكثر تكراراً، وتدريب عملي على نماذج امتحانية مطابقة لنظام الوزارة.",
    "overviewEn": "Our Algebra & Geometry Exam Night Revision bootcamp delivers concentrated confidence: one-page formula sheets, most frequent exam traps, and realistic mock exam drills.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "كبسولة القوانين والعلاقات الرياضية",
        "titleEn": "Formula Capsule & Cheat Sheets",
        "detailsAr": "تجميع ذكي لكل القوانين مع إرشادات متى تستخدم كل قانون.",
        "detailsEn": "Smart formula compilation with clear criteria for applying each rule."
      },
      {
        "titleAr": "حل الأسئلة الأكثر توقعاً وتكراراً",
        "titleEn": "High-Probability Exam Problems",
        "detailsAr": "حل مسائل مستوحاة من الامتحانات التجريبية ونماذج التوجيه.",
        "detailsEn": "Step-by-step solutions for experimental and ministerial model questions."
      }
    ],
    "targetAudienceAr": "الطلاب المقبلون على امتحانات نصف العام أو نهاية العام الراغبون في تثبيت معلوماتهم.",
    "targetAudienceEn": "Students sitting for midterms or final exams needing high-yield consolidation.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني تحميل مراجعة ليلة الامتحان جبر وهندسة بصيغة PDF؟",
        "questionEn": "How do I download Algebra & Geometry Exam Night Revision in PDF format?",
        "answerAr": "الملخص متاح للتحميل المباشر وبشكل مجاني بجودة طباعة فائقة لجميع الطلاب المسجلين بالمنصة.",
        "answerEn": "The summary is available for direct high-resolution PDF download for all registered students."
      },
      {
        "questionAr": "هل تكفي مراجعة ليلة الامتحان وحدها؟",
        "questionEn": "Is the night-before revision enough on its own?",
        "answerAr": "المراجعة مصممة لترتيب أفكارك وتذكيرك بأهم النظريات والتريكات، ويفضل أن تقترن بحل شيتات التدريب المرفقة.",
        "answerEn": "It organizes your knowledge and highlights high-yield traps; pair it with the attached drill sheets for maximum results."
      }
    ],
    "relatedSlugs": [
      "night-exam-revision-math",
      "night-exam-math-summary-pdf",
      "final-math-comprehensive-revision",
      "spider-math"
    ]
  },
  {
    "id": "3rd-prep-night-exam-math-revision",
    "slug": "3rd-prep-night-exam-math-revision",
    "slugAliases": [
      "مراجعة-ليلة-الامتحان-تالتة-اعدادي"
    ],
    "category": "reviews",
    "categoryNameAr": "المراجعات وليالي الامتحان",
    "categoryNameEn": "Final & Night-Before Exam Reviews",
    "keywordAr": "مراجعة ليلة الامتحان تالتة اعدادي",
    "keywordEn": "3rd Prep Night-Before Exam Math Revision",
    "pageTitleAr": "مراجعة ليلة الامتحان تالتة اعدادي | ميس هبة عياد — سبايدر ماث",
    "pageTitleEn": "3rd Prep Night-Before Exam Math Revision | Miss Heba Ayad — Spider Math",
    "metaDescriptionAr": "أقوى مراجعة ليلة الامتحان تالتة اعدادي: مراجعة مكثفة، حل تريكات، ملخصات PDF، وأهم التوقعات الامتحانية مع المهندسة هبة عبدالوهاب.",
    "metaDescriptionEn": "Ultimate 3rd Prep Night-Before Exam Math Revision: intensive workshops, tricky problem walkthroughs, PDF cheat sheets, and predicted questions on Spider Math.",
    "tagsAr": [
      "مراجعة ليلة الامتحان تالتة اعدادي",
      "مراجعة رياضيات",
      "ليلة الامتحان",
      "هبه عياد",
      "ملخص PDF"
    ],
    "tagsEn": [
      "3rd Prep Night-Before Exam Math Revision",
      "Math Revision",
      "Night Before Exam",
      "Heba Ayad",
      "PDF Summary"
    ],
    "badgeAr": "الشهادة الإعدادية",
    "badgeEn": "3rd Prep Certificate",
    "headlineAr": "مراجعة ليلة الامتحان تالتة اعدادي رياضيات — ملخص الجبر والإحصاء وحساب المثلثات",
    "headlineEn": "3rd Prep Night-Before Exam Math — Algebra, Statistics & Trigonometry Summary",
    "subheadlineAr": "الساعات الأخيرة قبل الامتحان هي الحاسمة؛ رتب أفكارك وتدرب على أهم المسائل المتوقعة.",
    "subheadlineEn": "The final hours before the test are decisive; organize your formulas and tackle predicted questions.",
    "overviewAr": "صُممت ورشة مراجعة ليلة الامتحان تالتة اعدادي لتقدم للطالب شحنة مكثفة من الثقة والمعرفة المركزة: تجميع القوانين في صفحة واحدة، استعراض تريكات الامتحان الأكثر تكراراً، وتدريب عملي على نماذج امتحانية مطابقة لنظام الوزارة.",
    "overviewEn": "Our 3rd Prep Night-Before Exam Math Revision bootcamp delivers concentrated confidence: one-page formula sheets, most frequent exam traps, and realistic mock exam drills.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "كبسولة القوانين والعلاقات الرياضية",
        "titleEn": "Formula Capsule & Cheat Sheets",
        "detailsAr": "تجميع ذكي لكل القوانين مع إرشادات متى تستخدم كل قانون.",
        "detailsEn": "Smart formula compilation with clear criteria for applying each rule."
      },
      {
        "titleAr": "حل الأسئلة الأكثر توقعاً وتكراراً",
        "titleEn": "High-Probability Exam Problems",
        "detailsAr": "حل مسائل مستوحاة من الامتحانات التجريبية ونماذج التوجيه.",
        "detailsEn": "Step-by-step solutions for experimental and ministerial model questions."
      }
    ],
    "targetAudienceAr": "الطلاب المقبلون على امتحانات نصف العام أو نهاية العام الراغبون في تثبيت معلوماتهم.",
    "targetAudienceEn": "Students sitting for midterms or final exams needing high-yield consolidation.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني تحميل مراجعة ليلة الامتحان تالتة اعدادي بصيغة PDF؟",
        "questionEn": "How do I download 3rd Prep Night-Before Exam Math Revision in PDF format?",
        "answerAr": "الملخص متاح للتحميل المباشر وبشكل مجاني بجودة طباعة فائقة لجميع الطلاب المسجلين بالمنصة.",
        "answerEn": "The summary is available for direct high-resolution PDF download for all registered students."
      },
      {
        "questionAr": "هل تكفي مراجعة ليلة الامتحان وحدها؟",
        "questionEn": "Is the night-before revision enough on its own?",
        "answerAr": "المراجعة مصممة لترتيب أفكارك وتذكيرك بأهم النظريات والتريكات، ويفضل أن تقترن بحل شيتات التدريب المرفقة.",
        "answerEn": "It organizes your knowledge and highlights high-yield traps; pair it with the attached drill sheets for maximum results."
      }
    ],
    "relatedSlugs": [
      "night-exam-revision-math",
      "night-exam-math-summary-pdf",
      "final-math-comprehensive-revision",
      "spider-math"
    ]
  },
  {
    "id": "final-math-comprehensive-revision",
    "slug": "final-math-comprehensive-revision",
    "slugAliases": [
      "مراجعة-نهائية-رياضيات"
    ],
    "category": "reviews",
    "categoryNameAr": "المراجعات وليالي الامتحان",
    "categoryNameEn": "Final & Night-Before Exam Reviews",
    "keywordAr": "مراجعة نهائية رياضيات",
    "keywordEn": "Comprehensive Final Math Revision",
    "pageTitleAr": "مراجعة نهائية رياضيات | ميس هبة عياد — سبايدر ماث",
    "pageTitleEn": "Comprehensive Final Math Revision | Miss Heba Ayad — Spider Math",
    "metaDescriptionAr": "أقوى مراجعة نهائية رياضيات: مراجعة مكثفة، حل تريكات، ملخصات PDF، وأهم التوقعات الامتحانية مع المهندسة هبة عبدالوهاب.",
    "metaDescriptionEn": "Ultimate Comprehensive Final Math Revision: intensive workshops, tricky problem walkthroughs, PDF cheat sheets, and predicted questions on Spider Math.",
    "tagsAr": [
      "مراجعة نهائية رياضيات",
      "مراجعة رياضيات",
      "ليلة الامتحان",
      "هبه عياد",
      "ملخص PDF"
    ],
    "tagsEn": [
      "Comprehensive Final Math Revision",
      "Math Revision",
      "Night Before Exam",
      "Heba Ayad",
      "PDF Summary"
    ],
    "badgeAr": "المراجعة النهائية",
    "badgeEn": "Final Comprehensive Revision",
    "headlineAr": "مراجعة نهائية رياضيات — كبسولات شاملة تغطي المنهج كاملاً بالمسائل النموذجية",
    "headlineEn": "Comprehensive Final Math Revision — Complete Course Encapsulation with Models",
    "subheadlineAr": "الساعات الأخيرة قبل الامتحان هي الحاسمة؛ رتب أفكارك وتدرب على أهم المسائل المتوقعة.",
    "subheadlineEn": "The final hours before the test are decisive; organize your formulas and tackle predicted questions.",
    "overviewAr": "صُممت ورشة مراجعة نهائية رياضيات لتقدم للطالب شحنة مكثفة من الثقة والمعرفة المركزة: تجميع القوانين في صفحة واحدة، استعراض تريكات الامتحان الأكثر تكراراً، وتدريب عملي على نماذج امتحانية مطابقة لنظام الوزارة.",
    "overviewEn": "Our Comprehensive Final Math Revision bootcamp delivers concentrated confidence: one-page formula sheets, most frequent exam traps, and realistic mock exam drills.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "كبسولة القوانين والعلاقات الرياضية",
        "titleEn": "Formula Capsule & Cheat Sheets",
        "detailsAr": "تجميع ذكي لكل القوانين مع إرشادات متى تستخدم كل قانون.",
        "detailsEn": "Smart formula compilation with clear criteria for applying each rule."
      },
      {
        "titleAr": "حل الأسئلة الأكثر توقعاً وتكراراً",
        "titleEn": "High-Probability Exam Problems",
        "detailsAr": "حل مسائل مستوحاة من الامتحانات التجريبية ونماذج التوجيه.",
        "detailsEn": "Step-by-step solutions for experimental and ministerial model questions."
      }
    ],
    "targetAudienceAr": "الطلاب المقبلون على امتحانات نصف العام أو نهاية العام الراغبون في تثبيت معلوماتهم.",
    "targetAudienceEn": "Students sitting for midterms or final exams needing high-yield consolidation.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني تحميل مراجعة نهائية رياضيات بصيغة PDF؟",
        "questionEn": "How do I download Comprehensive Final Math Revision in PDF format?",
        "answerAr": "الملخص متاح للتحميل المباشر وبشكل مجاني بجودة طباعة فائقة لجميع الطلاب المسجلين بالمنصة.",
        "answerEn": "The summary is available for direct high-resolution PDF download for all registered students."
      },
      {
        "questionAr": "هل تكفي مراجعة ليلة الامتحان وحدها؟",
        "questionEn": "Is the night-before revision enough on its own?",
        "answerAr": "المراجعة مصممة لترتيب أفكارك وتذكيرك بأهم النظريات والتريكات، ويفضل أن تقترن بحل شيتات التدريب المرفقة.",
        "answerEn": "It organizes your knowledge and highlights high-yield traps; pair it with the attached drill sheets for maximum results."
      }
    ],
    "relatedSlugs": [
      "night-exam-revision-math",
      "night-exam-math-summary-pdf",
      "final-math-comprehensive-revision",
      "spider-math"
    ]
  },
  {
    "id": "night-exam-math-summary-pdf",
    "slug": "night-exam-math-summary-pdf",
    "slugAliases": [
      "ملخص-ليلة-الامتحان-رياضيات-pdf"
    ],
    "category": "reviews",
    "categoryNameAr": "المراجعات وليالي الامتحان",
    "categoryNameEn": "Final & Night-Before Exam Reviews",
    "keywordAr": "ملخص ليلة الامتحان رياضيات PDF",
    "keywordEn": "Night-Before Exam Math Summary PDF",
    "pageTitleAr": "ملخص ليلة الامتحان رياضيات PDF | ميس هبة عياد — سبايدر ماث",
    "pageTitleEn": "Night-Before Exam Math Summary PDF | Miss Heba Ayad — Spider Math",
    "metaDescriptionAr": "أقوى ملخص ليلة الامتحان رياضيات PDF: مراجعة مكثفة، حل تريكات، ملخصات PDF، وأهم التوقعات الامتحانية مع المهندسة هبة عبدالوهاب.",
    "metaDescriptionEn": "Ultimate Night-Before Exam Math Summary PDF: intensive workshops, tricky problem walkthroughs, PDF cheat sheets, and predicted questions on Spider Math.",
    "tagsAr": [
      "ملخص ليلة الامتحان رياضيات PDF",
      "مراجعة رياضيات",
      "ليلة الامتحان",
      "هبه عياد",
      "ملخص PDF"
    ],
    "tagsEn": [
      "Night-Before Exam Math Summary PDF",
      "Math Revision",
      "Night Before Exam",
      "Heba Ayad",
      "PDF Summary"
    ],
    "badgeAr": "تحميل ملخص PDF",
    "badgeEn": "Download PDF Notes",
    "headlineAr": "ملخص ليلة الامتحان رياضيات PDF — حمل مذكرات القوانين المركزة مجاناً بجودة عالية",
    "headlineEn": "Night-Before Exam Math Summary PDF — Download High-Yield Formula Booklets",
    "subheadlineAr": "الساعات الأخيرة قبل الامتحان هي الحاسمة؛ رتب أفكارك وتدرب على أهم المسائل المتوقعة.",
    "subheadlineEn": "The final hours before the test are decisive; organize your formulas and tackle predicted questions.",
    "overviewAr": "صُممت ورشة ملخص ليلة الامتحان رياضيات PDF لتقدم للطالب شحنة مكثفة من الثقة والمعرفة المركزة: تجميع القوانين في صفحة واحدة، استعراض تريكات الامتحان الأكثر تكراراً، وتدريب عملي على نماذج امتحانية مطابقة لنظام الوزارة.",
    "overviewEn": "Our Night-Before Exam Math Summary PDF bootcamp delivers concentrated confidence: one-page formula sheets, most frequent exam traps, and realistic mock exam drills.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "كبسولة القوانين والعلاقات الرياضية",
        "titleEn": "Formula Capsule & Cheat Sheets",
        "detailsAr": "تجميع ذكي لكل القوانين مع إرشادات متى تستخدم كل قانون.",
        "detailsEn": "Smart formula compilation with clear criteria for applying each rule."
      },
      {
        "titleAr": "حل الأسئلة الأكثر توقعاً وتكراراً",
        "titleEn": "High-Probability Exam Problems",
        "detailsAr": "حل مسائل مستوحاة من الامتحانات التجريبية ونماذج التوجيه.",
        "detailsEn": "Step-by-step solutions for experimental and ministerial model questions."
      }
    ],
    "targetAudienceAr": "الطلاب المقبلون على امتحانات نصف العام أو نهاية العام الراغبون في تثبيت معلوماتهم.",
    "targetAudienceEn": "Students sitting for midterms or final exams needing high-yield consolidation.",
    "faqs": [
      {
        "questionAr": "كيف يمكنني تحميل ملخص ليلة الامتحان رياضيات PDF بصيغة PDF؟",
        "questionEn": "How do I download Night-Before Exam Math Summary PDF in PDF format?",
        "answerAr": "الملخص متاح للتحميل المباشر وبشكل مجاني بجودة طباعة فائقة لجميع الطلاب المسجلين بالمنصة.",
        "answerEn": "The summary is available for direct high-resolution PDF download for all registered students."
      },
      {
        "questionAr": "هل تكفي مراجعة ليلة الامتحان وحدها؟",
        "questionEn": "Is the night-before revision enough on its own?",
        "answerAr": "المراجعة مصممة لترتيب أفكارك وتذكيرك بأهم النظريات والتريكات، ويفضل أن تقترن بحل شيتات التدريب المرفقة.",
        "answerEn": "It organizes your knowledge and highlights high-yield traps; pair it with the attached drill sheets for maximum results."
      }
    ],
    "relatedSlugs": [
      "night-exam-revision-math",
      "night-exam-math-summary-pdf",
      "final-math-comprehensive-revision",
      "spider-math"
    ]
  },
  {
    "id": "grade-4-primary-math",
    "slug": "grade-4-primary-math",
    "slugAliases": [
      "شرح-رياضيات-الصف-الرابع-الابتدائي"
    ],
    "category": "grades",
    "categoryNameAr": "الصفوف والمراحل الدراسية",
    "categoryNameEn": "Grade Levels (Primary to Grade 12)",
    "keywordAr": "شرح رياضيات الصف الرابع الابتدائي",
    "keywordEn": "Grade 4 Primary Math Lessons",
    "pageTitleAr": "شرح رياضيات الصف الرابع الابتدائي | منصة سبايدر ماث — ميس هبة عياد",
    "pageTitleEn": "Grade 4 Primary Math Lessons | Spider Math Platform — Miss Heba Ayad",
    "metaDescriptionAr": "كورس شرح رياضيات الصف الرابع الابتدائي: شرح كامل لجميع دروس المنهج، حل تدريبات الكتاب وبنوك الأسئلة مع المهندسة هبة عبدالوهاب.",
    "metaDescriptionEn": "Comprehensive course for Grade 4 Primary Math Lessons: full syllabus lectures, textbook problem workouts, and mock exams by Eng. Heba Abdel-Wahab.",
    "tagsAr": [
      "شرح رياضيات الصف الرابع الابتدائي",
      "شرح رياضيات",
      "سبايدر ماث",
      "هبه عياد",
      "منهج الماث"
    ],
    "tagsEn": [
      "Grade 4 Primary Math Lessons",
      "Math Lessons",
      "Spider Math",
      "Heba Ayad",
      "Grade Curriculum"
    ],
    "badgeAr": "رابعة ابتدائي",
    "badgeEn": "Grade 4 Primary",
    "headlineAr": "شرح رياضيات الصف الرابع الابتدائي — التأسيس السليم في القيمة المكانية والعمليات",
    "headlineEn": "Grade 4 Primary Math Lessons — Place Value & Core Arithmetic Operations",
    "subheadlineAr": "تأسيس علمي متين ينتقل بالطالب خطوة بخطوة من الفهم الأساسي إلى التميز في الامتحانات.",
    "subheadlineEn": "A structured pedagogical journey moving students step-by-step from core intuition to exam dominance.",
    "overviewAr": "يوفر كورس شرح رياضيات الصف الرابع الابتدائي فيديوهات شرح عالية الوضوح لكل درس في المنهج الوزاري واللغات، مع شيتات واجب إلكترونية واختبارات تجريبية موقوتة ومتابعة دورية مع ولي الأمر لضمان الحفاظ على أعلى الدرجات.",
    "overviewEn": "Our Grade 4 Primary Math Lessons curriculum provides crystal-clear videos for every unit, automated homework sheets, timed quizzes, and proactive parent progress tracking.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "الوحدات الدراسية المعتمدة للمنهج",
        "titleEn": "Official Curriculum Units",
        "detailsAr": "تغطية شاملة للمقرر الفصلي والسنوي طبقاً لأحدث تعديلات الوزارة.",
        "detailsEn": "Complete semester and yearly modules aligned with latest guidelines."
      },
      {
        "titleAr": "حل تدريبات وتمارين الامتحانات",
        "titleEn": "Practice Problems & Exam Questions",
        "detailsAr": "حل مئات المسائل المتدرجة في الصعوبة لترسيخ المفاهيم.",
        "detailsEn": "Hundreds of graded practice problems reinforcing every mathematical rule."
      }
    ],
    "targetAudienceAr": "طلاب شرح رياضيات الصف الرابع الابتدائي وأولياء أمورهم الراغبون في متابعة منتظمة وشرح مبسط وممتع.",
    "targetAudienceEn": "Students and parents of Grade 4 Primary Math Lessons seeking reliable, enjoyable, and high-scoring lessons.",
    "faqs": [
      {
        "questionAr": "هل يشمل كورس شرح رياضيات الصف الرابع الابتدائي حل أسئلة كتاب الوزارة وكتاب المعاصر؟",
        "questionEn": "Does Grade 4 Primary Math Lessons include ministry textbook and external book problems?",
        "answerAr": "نعم، نحل تمارين كتاب الوزارة وأهم أفكار الكتب الخارجية المعتمدة وبنك المعرفة.",
        "answerEn": "Yes, we solve ministry textbook exercises plus top problems from leading prep books."
      },
      {
        "questionAr": "هل يتوفر امتحانات شهرية محاكية لاختبارات الشهور؟",
        "questionEn": "Are monthly mock tests provided?",
        "answerAr": "نعم، نوفر نماذج امتحانات شهرية قبل كل اختبار مدرسي لتدريب الطالب على شكل الامتحان.",
        "answerEn": "Yes! We publish full monthly mock exams prior to school tests to build timing and confidence."
      }
    ],
    "relatedSlugs": [
      "grade-4-primary-math",
      "3rd-prep-math",
      "3rd-secondary-math",
      "spider-math"
    ]
  },
  {
    "id": "grade-5-primary-math",
    "slug": "grade-5-primary-math",
    "slugAliases": [
      "شرح-رياضيات-الصف-الخامس-الابتدائي"
    ],
    "category": "grades",
    "categoryNameAr": "الصفوف والمراحل الدراسية",
    "categoryNameEn": "Grade Levels (Primary to Grade 12)",
    "keywordAr": "شرح رياضيات الصف الخامس الابتدائي",
    "keywordEn": "Grade 5 Primary Math Lessons",
    "pageTitleAr": "شرح رياضيات الصف الخامس الابتدائي | منصة سبايدر ماث — ميس هبة عياد",
    "pageTitleEn": "Grade 5 Primary Math Lessons | Spider Math Platform — Miss Heba Ayad",
    "metaDescriptionAr": "كورس شرح رياضيات الصف الخامس الابتدائي: شرح كامل لجميع دروس المنهج، حل تدريبات الكتاب وبنوك الأسئلة مع المهندسة هبة عبدالوهاب.",
    "metaDescriptionEn": "Comprehensive course for Grade 5 Primary Math Lessons: full syllabus lectures, textbook problem workouts, and mock exams by Eng. Heba Abdel-Wahab.",
    "tagsAr": [
      "شرح رياضيات الصف الخامس الابتدائي",
      "شرح رياضيات",
      "سبايدر ماث",
      "هبه عياد",
      "منهج الماث"
    ],
    "tagsEn": [
      "Grade 5 Primary Math Lessons",
      "Math Lessons",
      "Spider Math",
      "Heba Ayad",
      "Grade Curriculum"
    ],
    "badgeAr": "خامسة ابتدائي",
    "badgeEn": "Grade 5 Primary",
    "headlineAr": "شرح رياضيات الصف الخامس الابتدائي — الكسور والعمليات العشرية والهندسة التأسيسية",
    "headlineEn": "Grade 5 Primary Math Lessons — Fractions, Decimals & Foundational Geometry",
    "subheadlineAr": "تأسيس علمي متين ينتقل بالطالب خطوة بخطوة من الفهم الأساسي إلى التميز في الامتحانات.",
    "subheadlineEn": "A structured pedagogical journey moving students step-by-step from core intuition to exam dominance.",
    "overviewAr": "يوفر كورس شرح رياضيات الصف الخامس الابتدائي فيديوهات شرح عالية الوضوح لكل درس في المنهج الوزاري واللغات، مع شيتات واجب إلكترونية واختبارات تجريبية موقوتة ومتابعة دورية مع ولي الأمر لضمان الحفاظ على أعلى الدرجات.",
    "overviewEn": "Our Grade 5 Primary Math Lessons curriculum provides crystal-clear videos for every unit, automated homework sheets, timed quizzes, and proactive parent progress tracking.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "الوحدات الدراسية المعتمدة للمنهج",
        "titleEn": "Official Curriculum Units",
        "detailsAr": "تغطية شاملة للمقرر الفصلي والسنوي طبقاً لأحدث تعديلات الوزارة.",
        "detailsEn": "Complete semester and yearly modules aligned with latest guidelines."
      },
      {
        "titleAr": "حل تدريبات وتمارين الامتحانات",
        "titleEn": "Practice Problems & Exam Questions",
        "detailsAr": "حل مئات المسائل المتدرجة في الصعوبة لترسيخ المفاهيم.",
        "detailsEn": "Hundreds of graded practice problems reinforcing every mathematical rule."
      }
    ],
    "targetAudienceAr": "طلاب شرح رياضيات الصف الخامس الابتدائي وأولياء أمورهم الراغبون في متابعة منتظمة وشرح مبسط وممتع.",
    "targetAudienceEn": "Students and parents of Grade 5 Primary Math Lessons seeking reliable, enjoyable, and high-scoring lessons.",
    "faqs": [
      {
        "questionAr": "هل يشمل كورس شرح رياضيات الصف الخامس الابتدائي حل أسئلة كتاب الوزارة وكتاب المعاصر؟",
        "questionEn": "Does Grade 5 Primary Math Lessons include ministry textbook and external book problems?",
        "answerAr": "نعم، نحل تمارين كتاب الوزارة وأهم أفكار الكتب الخارجية المعتمدة وبنك المعرفة.",
        "answerEn": "Yes, we solve ministry textbook exercises plus top problems from leading prep books."
      },
      {
        "questionAr": "هل يتوفر امتحانات شهرية محاكية لاختبارات الشهور؟",
        "questionEn": "Are monthly mock tests provided?",
        "answerAr": "نعم، نوفر نماذج امتحانات شهرية قبل كل اختبار مدرسي لتدريب الطالب على شكل الامتحان.",
        "answerEn": "Yes! We publish full monthly mock exams prior to school tests to build timing and confidence."
      }
    ],
    "relatedSlugs": [
      "grade-4-primary-math",
      "3rd-prep-math",
      "3rd-secondary-math",
      "spider-math"
    ]
  },
  {
    "id": "grade-6-primary-math",
    "slug": "grade-6-primary-math",
    "slugAliases": [
      "شرح-رياضيات-الصف-السادس-الابتدائي"
    ],
    "category": "grades",
    "categoryNameAr": "الصفوف والمراحل الدراسية",
    "categoryNameEn": "Grade Levels (Primary to Grade 12)",
    "keywordAr": "شرح رياضيات الصف السادس الابتدائي",
    "keywordEn": "Grade 6 Primary Math Lessons",
    "pageTitleAr": "شرح رياضيات الصف السادس الابتدائي | منصة سبايدر ماث — ميس هبة عياد",
    "pageTitleEn": "Grade 6 Primary Math Lessons | Spider Math Platform — Miss Heba Ayad",
    "metaDescriptionAr": "كورس شرح رياضيات الصف السادس الابتدائي: شرح كامل لجميع دروس المنهج، حل تدريبات الكتاب وبنوك الأسئلة مع المهندسة هبة عبدالوهاب.",
    "metaDescriptionEn": "Comprehensive course for Grade 6 Primary Math Lessons: full syllabus lectures, textbook problem workouts, and mock exams by Eng. Heba Abdel-Wahab.",
    "tagsAr": [
      "شرح رياضيات الصف السادس الابتدائي",
      "شرح رياضيات",
      "سبايدر ماث",
      "هبه عياد",
      "منهج الماث"
    ],
    "tagsEn": [
      "Grade 6 Primary Math Lessons",
      "Math Lessons",
      "Spider Math",
      "Heba Ayad",
      "Grade Curriculum"
    ],
    "badgeAr": "ستة ابتدائي",
    "badgeEn": "Grade 6 Primary",
    "headlineAr": "شرح رياضيات الصف السادس الابتدائي — النسب، التناسب، والمعادلات التمهيدية للمرحلة الإعدادية",
    "headlineEn": "Grade 6 Primary Math Lessons — Ratios, Proportions & Algebraic Readiness",
    "subheadlineAr": "تأسيس علمي متين ينتقل بالطالب خطوة بخطوة من الفهم الأساسي إلى التميز في الامتحانات.",
    "subheadlineEn": "A structured pedagogical journey moving students step-by-step from core intuition to exam dominance.",
    "overviewAr": "يوفر كورس شرح رياضيات الصف السادس الابتدائي فيديوهات شرح عالية الوضوح لكل درس في المنهج الوزاري واللغات، مع شيتات واجب إلكترونية واختبارات تجريبية موقوتة ومتابعة دورية مع ولي الأمر لضمان الحفاظ على أعلى الدرجات.",
    "overviewEn": "Our Grade 6 Primary Math Lessons curriculum provides crystal-clear videos for every unit, automated homework sheets, timed quizzes, and proactive parent progress tracking.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "الوحدات الدراسية المعتمدة للمنهج",
        "titleEn": "Official Curriculum Units",
        "detailsAr": "تغطية شاملة للمقرر الفصلي والسنوي طبقاً لأحدث تعديلات الوزارة.",
        "detailsEn": "Complete semester and yearly modules aligned with latest guidelines."
      },
      {
        "titleAr": "حل تدريبات وتمارين الامتحانات",
        "titleEn": "Practice Problems & Exam Questions",
        "detailsAr": "حل مئات المسائل المتدرجة في الصعوبة لترسيخ المفاهيم.",
        "detailsEn": "Hundreds of graded practice problems reinforcing every mathematical rule."
      }
    ],
    "targetAudienceAr": "طلاب شرح رياضيات الصف السادس الابتدائي وأولياء أمورهم الراغبون في متابعة منتظمة وشرح مبسط وممتع.",
    "targetAudienceEn": "Students and parents of Grade 6 Primary Math Lessons seeking reliable, enjoyable, and high-scoring lessons.",
    "faqs": [
      {
        "questionAr": "هل يشمل كورس شرح رياضيات الصف السادس الابتدائي حل أسئلة كتاب الوزارة وكتاب المعاصر؟",
        "questionEn": "Does Grade 6 Primary Math Lessons include ministry textbook and external book problems?",
        "answerAr": "نعم، نحل تمارين كتاب الوزارة وأهم أفكار الكتب الخارجية المعتمدة وبنك المعرفة.",
        "answerEn": "Yes, we solve ministry textbook exercises plus top problems from leading prep books."
      },
      {
        "questionAr": "هل يتوفر امتحانات شهرية محاكية لاختبارات الشهور؟",
        "questionEn": "Are monthly mock tests provided?",
        "answerAr": "نعم، نوفر نماذج امتحانات شهرية قبل كل اختبار مدرسي لتدريب الطالب على شكل الامتحان.",
        "answerEn": "Yes! We publish full monthly mock exams prior to school tests to build timing and confidence."
      }
    ],
    "relatedSlugs": [
      "grade-4-primary-math",
      "3rd-prep-math",
      "3rd-secondary-math",
      "spider-math"
    ]
  },
  {
    "id": "1st-prep-math",
    "slug": "1st-prep-math",
    "slugAliases": [
      "شرح-رياضيات-اولى-اعدادي"
    ],
    "category": "grades",
    "categoryNameAr": "الصفوف والمراحل الدراسية",
    "categoryNameEn": "Grade Levels (Primary to Grade 12)",
    "keywordAr": "شرح رياضيات اولى اعدادي",
    "keywordEn": "1st Prep Math Lessons",
    "pageTitleAr": "شرح رياضيات اولى اعدادي | منصة سبايدر ماث — ميس هبة عياد",
    "pageTitleEn": "1st Prep Math Lessons | Spider Math Platform — Miss Heba Ayad",
    "metaDescriptionAr": "كورس شرح رياضيات اولى اعدادي: شرح كامل لجميع دروس المنهج، حل تدريبات الكتاب وبنوك الأسئلة مع المهندسة هبة عبدالوهاب.",
    "metaDescriptionEn": "Comprehensive course for 1st Prep Math Lessons: full syllabus lectures, textbook problem workouts, and mock exams by Eng. Heba Abdel-Wahab.",
    "tagsAr": [
      "شرح رياضيات اولى اعدادي",
      "شرح رياضيات",
      "سبايدر ماث",
      "هبه عياد",
      "منهج الماث"
    ],
    "tagsEn": [
      "1st Prep Math Lessons",
      "Math Lessons",
      "Spider Math",
      "Heba Ayad",
      "Grade Curriculum"
    ],
    "badgeAr": "أولى إعدادي",
    "badgeEn": "1st Prep",
    "headlineAr": "شرح رياضيات اولى اعدادي — مدخل علم الجبر والحدود والمقادير الجبرية ونظريات الهندسة",
    "headlineEn": "1st Prep Math Lessons — Algebraic Expressions & Fundamental Geometric Theorems",
    "subheadlineAr": "تأسيس علمي متين ينتقل بالطالب خطوة بخطوة من الفهم الأساسي إلى التميز في الامتحانات.",
    "subheadlineEn": "A structured pedagogical journey moving students step-by-step from core intuition to exam dominance.",
    "overviewAr": "يوفر كورس شرح رياضيات اولى اعدادي فيديوهات شرح عالية الوضوح لكل درس في المنهج الوزاري واللغات، مع شيتات واجب إلكترونية واختبارات تجريبية موقوتة ومتابعة دورية مع ولي الأمر لضمان الحفاظ على أعلى الدرجات.",
    "overviewEn": "Our 1st Prep Math Lessons curriculum provides crystal-clear videos for every unit, automated homework sheets, timed quizzes, and proactive parent progress tracking.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "الوحدات الدراسية المعتمدة للمنهج",
        "titleEn": "Official Curriculum Units",
        "detailsAr": "تغطية شاملة للمقرر الفصلي والسنوي طبقاً لأحدث تعديلات الوزارة.",
        "detailsEn": "Complete semester and yearly modules aligned with latest guidelines."
      },
      {
        "titleAr": "حل تدريبات وتمارين الامتحانات",
        "titleEn": "Practice Problems & Exam Questions",
        "detailsAr": "حل مئات المسائل المتدرجة في الصعوبة لترسيخ المفاهيم.",
        "detailsEn": "Hundreds of graded practice problems reinforcing every mathematical rule."
      }
    ],
    "targetAudienceAr": "طلاب شرح رياضيات اولى اعدادي وأولياء أمورهم الراغبون في متابعة منتظمة وشرح مبسط وممتع.",
    "targetAudienceEn": "Students and parents of 1st Prep Math Lessons seeking reliable, enjoyable, and high-scoring lessons.",
    "faqs": [
      {
        "questionAr": "هل يشمل كورس شرح رياضيات اولى اعدادي حل أسئلة كتاب الوزارة وكتاب المعاصر؟",
        "questionEn": "Does 1st Prep Math Lessons include ministry textbook and external book problems?",
        "answerAr": "نعم، نحل تمارين كتاب الوزارة وأهم أفكار الكتب الخارجية المعتمدة وبنك المعرفة.",
        "answerEn": "Yes, we solve ministry textbook exercises plus top problems from leading prep books."
      },
      {
        "questionAr": "هل يتوفر امتحانات شهرية محاكية لاختبارات الشهور؟",
        "questionEn": "Are monthly mock tests provided?",
        "answerAr": "نعم، نوفر نماذج امتحانات شهرية قبل كل اختبار مدرسي لتدريب الطالب على شكل الامتحان.",
        "answerEn": "Yes! We publish full monthly mock exams prior to school tests to build timing and confidence."
      }
    ],
    "relatedSlugs": [
      "grade-4-primary-math",
      "3rd-prep-math",
      "3rd-secondary-math",
      "spider-math"
    ]
  },
  {
    "id": "2nd-prep-math",
    "slug": "2nd-prep-math",
    "slugAliases": [
      "شرح-رياضيات-تانية-اعدادي"
    ],
    "category": "grades",
    "categoryNameAr": "الصفوف والمراحل الدراسية",
    "categoryNameEn": "Grade Levels (Primary to Grade 12)",
    "keywordAr": "شرح رياضيات تانية اعدادي",
    "keywordEn": "2nd Prep Math Lessons",
    "pageTitleAr": "شرح رياضيات تانية اعدادي | منصة سبايدر ماث — ميس هبة عياد",
    "pageTitleEn": "2nd Prep Math Lessons | Spider Math Platform — Miss Heba Ayad",
    "metaDescriptionAr": "كورس شرح رياضيات تانية اعدادي: شرح كامل لجميع دروس المنهج، حل تدريبات الكتاب وبنوك الأسئلة مع المهندسة هبة عبدالوهاب.",
    "metaDescriptionEn": "Comprehensive course for 2nd Prep Math Lessons: full syllabus lectures, textbook problem workouts, and mock exams by Eng. Heba Abdel-Wahab.",
    "tagsAr": [
      "شرح رياضيات تانية اعدادي",
      "شرح رياضيات",
      "سبايدر ماث",
      "هبه عياد",
      "منهج الماث"
    ],
    "tagsEn": [
      "2nd Prep Math Lessons",
      "Math Lessons",
      "Spider Math",
      "Heba Ayad",
      "Grade Curriculum"
    ],
    "badgeAr": "تانية إعدادي",
    "badgeEn": "2nd Prep",
    "headlineAr": "شرح رياضيات تانية اعدادي — التحليل الرياضي، الجذور التكعيبية، ونظرية فيثاغورس وإقليدس",
    "headlineEn": "2nd Prep Math Lessons — Factoring, Cube Roots & Classical Geometric Proofs",
    "subheadlineAr": "تأسيس علمي متين ينتقل بالطالب خطوة بخطوة من الفهم الأساسي إلى التميز في الامتحانات.",
    "subheadlineEn": "A structured pedagogical journey moving students step-by-step from core intuition to exam dominance.",
    "overviewAr": "يوفر كورس شرح رياضيات تانية اعدادي فيديوهات شرح عالية الوضوح لكل درس في المنهج الوزاري واللغات، مع شيتات واجب إلكترونية واختبارات تجريبية موقوتة ومتابعة دورية مع ولي الأمر لضمان الحفاظ على أعلى الدرجات.",
    "overviewEn": "Our 2nd Prep Math Lessons curriculum provides crystal-clear videos for every unit, automated homework sheets, timed quizzes, and proactive parent progress tracking.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "الوحدات الدراسية المعتمدة للمنهج",
        "titleEn": "Official Curriculum Units",
        "detailsAr": "تغطية شاملة للمقرر الفصلي والسنوي طبقاً لأحدث تعديلات الوزارة.",
        "detailsEn": "Complete semester and yearly modules aligned with latest guidelines."
      },
      {
        "titleAr": "حل تدريبات وتمارين الامتحانات",
        "titleEn": "Practice Problems & Exam Questions",
        "detailsAr": "حل مئات المسائل المتدرجة في الصعوبة لترسيخ المفاهيم.",
        "detailsEn": "Hundreds of graded practice problems reinforcing every mathematical rule."
      }
    ],
    "targetAudienceAr": "طلاب شرح رياضيات تانية اعدادي وأولياء أمورهم الراغبون في متابعة منتظمة وشرح مبسط وممتع.",
    "targetAudienceEn": "Students and parents of 2nd Prep Math Lessons seeking reliable, enjoyable, and high-scoring lessons.",
    "faqs": [
      {
        "questionAr": "هل يشمل كورس شرح رياضيات تانية اعدادي حل أسئلة كتاب الوزارة وكتاب المعاصر؟",
        "questionEn": "Does 2nd Prep Math Lessons include ministry textbook and external book problems?",
        "answerAr": "نعم، نحل تمارين كتاب الوزارة وأهم أفكار الكتب الخارجية المعتمدة وبنك المعرفة.",
        "answerEn": "Yes, we solve ministry textbook exercises plus top problems from leading prep books."
      },
      {
        "questionAr": "هل يتوفر امتحانات شهرية محاكية لاختبارات الشهور؟",
        "questionEn": "Are monthly mock tests provided?",
        "answerAr": "نعم، نوفر نماذج امتحانات شهرية قبل كل اختبار مدرسي لتدريب الطالب على شكل الامتحان.",
        "answerEn": "Yes! We publish full monthly mock exams prior to school tests to build timing and confidence."
      }
    ],
    "relatedSlugs": [
      "grade-4-primary-math",
      "3rd-prep-math",
      "3rd-secondary-math",
      "spider-math"
    ]
  },
  {
    "id": "3rd-prep-math",
    "slug": "3rd-prep-math",
    "slugAliases": [
      "شرح-رياضيات-تالتة-اعدادي"
    ],
    "category": "grades",
    "categoryNameAr": "الصفوف والمراحل الدراسية",
    "categoryNameEn": "Grade Levels (Primary to Grade 12)",
    "keywordAr": "شرح رياضيات تالتة اعدادي",
    "keywordEn": "3rd Prep Math Lessons",
    "pageTitleAr": "شرح رياضيات تالتة اعدادي | منصة سبايدر ماث — ميس هبة عياد",
    "pageTitleEn": "3rd Prep Math Lessons | Spider Math Platform — Miss Heba Ayad",
    "metaDescriptionAr": "كورس شرح رياضيات تالتة اعدادي: شرح كامل لجميع دروس المنهج، حل تدريبات الكتاب وبنوك الأسئلة مع المهندسة هبة عبدالوهاب.",
    "metaDescriptionEn": "Comprehensive course for 3rd Prep Math Lessons: full syllabus lectures, textbook problem workouts, and mock exams by Eng. Heba Abdel-Wahab.",
    "tagsAr": [
      "شرح رياضيات تالتة اعدادي",
      "شرح رياضيات",
      "سبايدر ماث",
      "هبه عياد",
      "منهج الماث"
    ],
    "tagsEn": [
      "3rd Prep Math Lessons",
      "Math Lessons",
      "Spider Math",
      "Heba Ayad",
      "Grade Curriculum"
    ],
    "badgeAr": "تالتة إعدادي (الشهادة)",
    "badgeEn": "3rd Prep (Certificate)",
    "headlineAr": "شرح رياضيات تالتة اعدادي — سنة الشهادة الإعدادية: حساب المثلثات والجبر والدوال والهندسة التحليلية",
    "headlineEn": "3rd Prep Math Lessons — Trigonometry, Quadratic Functions & Coordinate Geometry",
    "subheadlineAr": "تأسيس علمي متين ينتقل بالطالب خطوة بخطوة من الفهم الأساسي إلى التميز في الامتحانات.",
    "subheadlineEn": "A structured pedagogical journey moving students step-by-step from core intuition to exam dominance.",
    "overviewAr": "يوفر كورس شرح رياضيات تالتة اعدادي فيديوهات شرح عالية الوضوح لكل درس في المنهج الوزاري واللغات، مع شيتات واجب إلكترونية واختبارات تجريبية موقوتة ومتابعة دورية مع ولي الأمر لضمان الحفاظ على أعلى الدرجات.",
    "overviewEn": "Our 3rd Prep Math Lessons curriculum provides crystal-clear videos for every unit, automated homework sheets, timed quizzes, and proactive parent progress tracking.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "الوحدات الدراسية المعتمدة للمنهج",
        "titleEn": "Official Curriculum Units",
        "detailsAr": "تغطية شاملة للمقرر الفصلي والسنوي طبقاً لأحدث تعديلات الوزارة.",
        "detailsEn": "Complete semester and yearly modules aligned with latest guidelines."
      },
      {
        "titleAr": "حل تدريبات وتمارين الامتحانات",
        "titleEn": "Practice Problems & Exam Questions",
        "detailsAr": "حل مئات المسائل المتدرجة في الصعوبة لترسيخ المفاهيم.",
        "detailsEn": "Hundreds of graded practice problems reinforcing every mathematical rule."
      }
    ],
    "targetAudienceAr": "طلاب شرح رياضيات تالتة اعدادي وأولياء أمورهم الراغبون في متابعة منتظمة وشرح مبسط وممتع.",
    "targetAudienceEn": "Students and parents of 3rd Prep Math Lessons seeking reliable, enjoyable, and high-scoring lessons.",
    "faqs": [
      {
        "questionAr": "هل يشمل كورس شرح رياضيات تالتة اعدادي حل أسئلة كتاب الوزارة وكتاب المعاصر؟",
        "questionEn": "Does 3rd Prep Math Lessons include ministry textbook and external book problems?",
        "answerAr": "نعم، نحل تمارين كتاب الوزارة وأهم أفكار الكتب الخارجية المعتمدة وبنك المعرفة.",
        "answerEn": "Yes, we solve ministry textbook exercises plus top problems from leading prep books."
      },
      {
        "questionAr": "هل يتوفر امتحانات شهرية محاكية لاختبارات الشهور؟",
        "questionEn": "Are monthly mock tests provided?",
        "answerAr": "نعم، نوفر نماذج امتحانات شهرية قبل كل اختبار مدرسي لتدريب الطالب على شكل الامتحان.",
        "answerEn": "Yes! We publish full monthly mock exams prior to school tests to build timing and confidence."
      }
    ],
    "relatedSlugs": [
      "grade-4-primary-math",
      "3rd-prep-math",
      "3rd-secondary-math",
      "spider-math"
    ]
  },
  {
    "id": "1st-secondary-math",
    "slug": "1st-secondary-math",
    "slugAliases": [
      "شرح-رياضيات-اولى-ثانوي"
    ],
    "category": "grades",
    "categoryNameAr": "الصفوف والمراحل الدراسية",
    "categoryNameEn": "Grade Levels (Primary to Grade 12)",
    "keywordAr": "شرح رياضيات اولى ثانوي",
    "keywordEn": "1st Secondary Math Lessons",
    "pageTitleAr": "شرح رياضيات اولى ثانوي | منصة سبايدر ماث — ميس هبة عياد",
    "pageTitleEn": "1st Secondary Math Lessons | Spider Math Platform — Miss Heba Ayad",
    "metaDescriptionAr": "كورس شرح رياضيات اولى ثانوي: شرح كامل لجميع دروس المنهج، حل تدريبات الكتاب وبنوك الأسئلة مع المهندسة هبة عبدالوهاب.",
    "metaDescriptionEn": "Comprehensive course for 1st Secondary Math Lessons: full syllabus lectures, textbook problem workouts, and mock exams by Eng. Heba Abdel-Wahab.",
    "tagsAr": [
      "شرح رياضيات اولى ثانوي",
      "شرح رياضيات",
      "سبايدر ماث",
      "هبه عياد",
      "منهج الماث"
    ],
    "tagsEn": [
      "1st Secondary Math Lessons",
      "Math Lessons",
      "Spider Math",
      "Heba Ayad",
      "Grade Curriculum"
    ],
    "badgeAr": "أولى ثانوي",
    "badgeEn": "1st Secondary",
    "headlineAr": "شرح رياضيات اولى ثانوي — المصفوفات، المتجهات، وحساب المثلثات المتقدم للثانوية العامة",
    "headlineEn": "1st Secondary Math Lessons — Matrices, Vectors & Advanced High School Trigonometry",
    "subheadlineAr": "تأسيس علمي متين ينتقل بالطالب خطوة بخطوة من الفهم الأساسي إلى التميز في الامتحانات.",
    "subheadlineEn": "A structured pedagogical journey moving students step-by-step from core intuition to exam dominance.",
    "overviewAr": "يوفر كورس شرح رياضيات اولى ثانوي فيديوهات شرح عالية الوضوح لكل درس في المنهج الوزاري واللغات، مع شيتات واجب إلكترونية واختبارات تجريبية موقوتة ومتابعة دورية مع ولي الأمر لضمان الحفاظ على أعلى الدرجات.",
    "overviewEn": "Our 1st Secondary Math Lessons curriculum provides crystal-clear videos for every unit, automated homework sheets, timed quizzes, and proactive parent progress tracking.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "الوحدات الدراسية المعتمدة للمنهج",
        "titleEn": "Official Curriculum Units",
        "detailsAr": "تغطية شاملة للمقرر الفصلي والسنوي طبقاً لأحدث تعديلات الوزارة.",
        "detailsEn": "Complete semester and yearly modules aligned with latest guidelines."
      },
      {
        "titleAr": "حل تدريبات وتمارين الامتحانات",
        "titleEn": "Practice Problems & Exam Questions",
        "detailsAr": "حل مئات المسائل المتدرجة في الصعوبة لترسيخ المفاهيم.",
        "detailsEn": "Hundreds of graded practice problems reinforcing every mathematical rule."
      }
    ],
    "targetAudienceAr": "طلاب شرح رياضيات اولى ثانوي وأولياء أمورهم الراغبون في متابعة منتظمة وشرح مبسط وممتع.",
    "targetAudienceEn": "Students and parents of 1st Secondary Math Lessons seeking reliable, enjoyable, and high-scoring lessons.",
    "faqs": [
      {
        "questionAr": "هل يشمل كورس شرح رياضيات اولى ثانوي حل أسئلة كتاب الوزارة وكتاب المعاصر؟",
        "questionEn": "Does 1st Secondary Math Lessons include ministry textbook and external book problems?",
        "answerAr": "نعم، نحل تمارين كتاب الوزارة وأهم أفكار الكتب الخارجية المعتمدة وبنك المعرفة.",
        "answerEn": "Yes, we solve ministry textbook exercises plus top problems from leading prep books."
      },
      {
        "questionAr": "هل يتوفر امتحانات شهرية محاكية لاختبارات الشهور؟",
        "questionEn": "Are monthly mock tests provided?",
        "answerAr": "نعم، نوفر نماذج امتحانات شهرية قبل كل اختبار مدرسي لتدريب الطالب على شكل الامتحان.",
        "answerEn": "Yes! We publish full monthly mock exams prior to school tests to build timing and confidence."
      }
    ],
    "relatedSlugs": [
      "grade-4-primary-math",
      "3rd-prep-math",
      "3rd-secondary-math",
      "spider-math"
    ]
  },
  {
    "id": "2nd-secondary-math",
    "slug": "2nd-secondary-math",
    "slugAliases": [
      "شرح-رياضيات-تانية-ثانوي"
    ],
    "category": "grades",
    "categoryNameAr": "الصفوف والمراحل الدراسية",
    "categoryNameEn": "Grade Levels (Primary to Grade 12)",
    "keywordAr": "شرح رياضيات تانية ثانوي",
    "keywordEn": "2nd Secondary Math Lessons",
    "pageTitleAr": "شرح رياضيات تانية ثانوي | منصة سبايدر ماث — ميس هبة عياد",
    "pageTitleEn": "2nd Secondary Math Lessons | Spider Math Platform — Miss Heba Ayad",
    "metaDescriptionAr": "كورس شرح رياضيات تانية ثانوي: شرح كامل لجميع دروس المنهج، حل تدريبات الكتاب وبنوك الأسئلة مع المهندسة هبة عبدالوهاب.",
    "metaDescriptionEn": "Comprehensive course for 2nd Secondary Math Lessons: full syllabus lectures, textbook problem workouts, and mock exams by Eng. Heba Abdel-Wahab.",
    "tagsAr": [
      "شرح رياضيات تانية ثانوي",
      "شرح رياضيات",
      "سبايدر ماث",
      "هبه عياد",
      "منهج الماث"
    ],
    "tagsEn": [
      "2nd Secondary Math Lessons",
      "Math Lessons",
      "Spider Math",
      "Heba Ayad",
      "Grade Curriculum"
    ],
    "badgeAr": "تانية ثانوي علمي وأدبي",
    "badgeEn": "2nd Secondary",
    "headlineAr": "شرح رياضيات تانية ثانوي — التفاضل والتكامل والدوال الحقيقية وقواعد الجيب وجيب التمام",
    "headlineEn": "2nd Secondary Math Lessons — Real Functions, Calculus & Sine/Cosine Laws",
    "subheadlineAr": "تأسيس علمي متين ينتقل بالطالب خطوة بخطوة من الفهم الأساسي إلى التميز في الامتحانات.",
    "subheadlineEn": "A structured pedagogical journey moving students step-by-step from core intuition to exam dominance.",
    "overviewAr": "يوفر كورس شرح رياضيات تانية ثانوي فيديوهات شرح عالية الوضوح لكل درس في المنهج الوزاري واللغات، مع شيتات واجب إلكترونية واختبارات تجريبية موقوتة ومتابعة دورية مع ولي الأمر لضمان الحفاظ على أعلى الدرجات.",
    "overviewEn": "Our 2nd Secondary Math Lessons curriculum provides crystal-clear videos for every unit, automated homework sheets, timed quizzes, and proactive parent progress tracking.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "الوحدات الدراسية المعتمدة للمنهج",
        "titleEn": "Official Curriculum Units",
        "detailsAr": "تغطية شاملة للمقرر الفصلي والسنوي طبقاً لأحدث تعديلات الوزارة.",
        "detailsEn": "Complete semester and yearly modules aligned with latest guidelines."
      },
      {
        "titleAr": "حل تدريبات وتمارين الامتحانات",
        "titleEn": "Practice Problems & Exam Questions",
        "detailsAr": "حل مئات المسائل المتدرجة في الصعوبة لترسيخ المفاهيم.",
        "detailsEn": "Hundreds of graded practice problems reinforcing every mathematical rule."
      }
    ],
    "targetAudienceAr": "طلاب شرح رياضيات تانية ثانوي وأولياء أمورهم الراغبون في متابعة منتظمة وشرح مبسط وممتع.",
    "targetAudienceEn": "Students and parents of 2nd Secondary Math Lessons seeking reliable, enjoyable, and high-scoring lessons.",
    "faqs": [
      {
        "questionAr": "هل يشمل كورس شرح رياضيات تانية ثانوي حل أسئلة كتاب الوزارة وكتاب المعاصر؟",
        "questionEn": "Does 2nd Secondary Math Lessons include ministry textbook and external book problems?",
        "answerAr": "نعم، نحل تمارين كتاب الوزارة وأهم أفكار الكتب الخارجية المعتمدة وبنك المعرفة.",
        "answerEn": "Yes, we solve ministry textbook exercises plus top problems from leading prep books."
      },
      {
        "questionAr": "هل يتوفر امتحانات شهرية محاكية لاختبارات الشهور؟",
        "questionEn": "Are monthly mock tests provided?",
        "answerAr": "نعم، نوفر نماذج امتحانات شهرية قبل كل اختبار مدرسي لتدريب الطالب على شكل الامتحان.",
        "answerEn": "Yes! We publish full monthly mock exams prior to school tests to build timing and confidence."
      }
    ],
    "relatedSlugs": [
      "grade-4-primary-math",
      "3rd-prep-math",
      "3rd-secondary-math",
      "spider-math"
    ]
  },
  {
    "id": "3rd-secondary-math",
    "slug": "3rd-secondary-math",
    "slugAliases": [
      "شرح-رياضيات-تالتة-ثانوي"
    ],
    "category": "grades",
    "categoryNameAr": "الصفوف والمراحل الدراسية",
    "categoryNameEn": "Grade Levels (Primary to Grade 12)",
    "keywordAr": "شرح رياضيات تالتة ثانوي",
    "keywordEn": "3rd Secondary Math Lessons",
    "pageTitleAr": "شرح رياضيات تالتة ثانوي | منصة سبايدر ماث — ميس هبة عياد",
    "pageTitleEn": "3rd Secondary Math Lessons | Spider Math Platform — Miss Heba Ayad",
    "metaDescriptionAr": "كورس شرح رياضيات تالتة ثانوي: شرح كامل لجميع دروس المنهج، حل تدريبات الكتاب وبنوك الأسئلة مع المهندسة هبة عبدالوهاب.",
    "metaDescriptionEn": "Comprehensive course for 3rd Secondary Math Lessons: full syllabus lectures, textbook problem workouts, and mock exams by Eng. Heba Abdel-Wahab.",
    "tagsAr": [
      "شرح رياضيات تالتة ثانوي",
      "شرح رياضيات",
      "سبايدر ماث",
      "هبه عياد",
      "منهج الماث"
    ],
    "tagsEn": [
      "3rd Secondary Math Lessons",
      "Math Lessons",
      "Spider Math",
      "Heba Ayad",
      "Grade Curriculum"
    ],
    "badgeAr": "تالتة ثانوي (شهادة)",
    "badgeEn": "3rd Secondary (Thanaweya)",
    "headlineAr": "شرح رياضيات تالتة ثانوي — المسار الأقوى لشعبة علمي رياضة: تفاضل، جبر فراغية، واستاتيكا وديناميكا",
    "headlineEn": "3rd Secondary Math Lessons — Elite STEM Math: Calculus, Solid Geometry & Mechanics",
    "subheadlineAr": "تأسيس علمي متين ينتقل بالطالب خطوة بخطوة من الفهم الأساسي إلى التميز في الامتحانات.",
    "subheadlineEn": "A structured pedagogical journey moving students step-by-step from core intuition to exam dominance.",
    "overviewAr": "يوفر كورس شرح رياضيات تالتة ثانوي فيديوهات شرح عالية الوضوح لكل درس في المنهج الوزاري واللغات، مع شيتات واجب إلكترونية واختبارات تجريبية موقوتة ومتابعة دورية مع ولي الأمر لضمان الحفاظ على أعلى الدرجات.",
    "overviewEn": "Our 3rd Secondary Math Lessons curriculum provides crystal-clear videos for every unit, automated homework sheets, timed quizzes, and proactive parent progress tracking.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "الوحدات الدراسية المعتمدة للمنهج",
        "titleEn": "Official Curriculum Units",
        "detailsAr": "تغطية شاملة للمقرر الفصلي والسنوي طبقاً لأحدث تعديلات الوزارة.",
        "detailsEn": "Complete semester and yearly modules aligned with latest guidelines."
      },
      {
        "titleAr": "حل تدريبات وتمارين الامتحانات",
        "titleEn": "Practice Problems & Exam Questions",
        "detailsAr": "حل مئات المسائل المتدرجة في الصعوبة لترسيخ المفاهيم.",
        "detailsEn": "Hundreds of graded practice problems reinforcing every mathematical rule."
      }
    ],
    "targetAudienceAr": "طلاب شرح رياضيات تالتة ثانوي وأولياء أمورهم الراغبون في متابعة منتظمة وشرح مبسط وممتع.",
    "targetAudienceEn": "Students and parents of 3rd Secondary Math Lessons seeking reliable, enjoyable, and high-scoring lessons.",
    "faqs": [
      {
        "questionAr": "هل يشمل كورس شرح رياضيات تالتة ثانوي حل أسئلة كتاب الوزارة وكتاب المعاصر؟",
        "questionEn": "Does 3rd Secondary Math Lessons include ministry textbook and external book problems?",
        "answerAr": "نعم، نحل تمارين كتاب الوزارة وأهم أفكار الكتب الخارجية المعتمدة وبنك المعرفة.",
        "answerEn": "Yes, we solve ministry textbook exercises plus top problems from leading prep books."
      },
      {
        "questionAr": "هل يتوفر امتحانات شهرية محاكية لاختبارات الشهور؟",
        "questionEn": "Are monthly mock tests provided?",
        "answerAr": "نعم، نوفر نماذج امتحانات شهرية قبل كل اختبار مدرسي لتدريب الطالب على شكل الامتحان.",
        "answerEn": "Yes! We publish full monthly mock exams prior to school tests to build timing and confidence."
      }
    ],
    "relatedSlugs": [
      "grade-4-primary-math",
      "3rd-prep-math",
      "3rd-secondary-math",
      "spider-math"
    ]
  },
  {
    "id": "math-grade-10",
    "slug": "math-grade-10",
    "slugAliases": [
      "ماث-grade-10"
    ],
    "category": "grades",
    "categoryNameAr": "الصفوف والمراحل الدراسية",
    "categoryNameEn": "Grade Levels (Primary to Grade 12)",
    "keywordAr": "ماث Grade 10",
    "keywordEn": "Math Grade 10 Lessons",
    "pageTitleAr": "ماث Grade 10 | منصة سبايدر ماث — ميس هبة عياد",
    "pageTitleEn": "Math Grade 10 Lessons | Spider Math Platform — Miss Heba Ayad",
    "metaDescriptionAr": "كورس ماث Grade 10: شرح كامل لجميع دروس المنهج، حل تدريبات الكتاب وبنوك الأسئلة مع المهندسة هبة عبدالوهاب.",
    "metaDescriptionEn": "Comprehensive course for Math Grade 10 Lessons: full syllabus lectures, textbook problem workouts, and mock exams by Eng. Heba Abdel-Wahab.",
    "tagsAr": [
      "ماث Grade 10",
      "شرح رياضيات",
      "سبايدر ماث",
      "هبه عياد",
      "منهج الماث"
    ],
    "tagsEn": [
      "Math Grade 10 Lessons",
      "Math Lessons",
      "Spider Math",
      "Heba Ayad",
      "Grade Curriculum"
    ],
    "badgeAr": "Grade 10",
    "badgeEn": "Grade 10",
    "headlineAr": "ماث Grade 10 — Linear Systems, Quadratic Functions, and Geometry Readiness",
    "headlineEn": "Math Grade 10 — Linear Systems, Quadratic Functions, and Geometry Readiness",
    "subheadlineAr": "تأسيس علمي متين ينتقل بالطالب خطوة بخطوة من الفهم الأساسي إلى التميز في الامتحانات.",
    "subheadlineEn": "A structured pedagogical journey moving students step-by-step from core intuition to exam dominance.",
    "overviewAr": "يوفر كورس ماث Grade 10 فيديوهات شرح عالية الوضوح لكل درس في المنهج الوزاري واللغات، مع شيتات واجب إلكترونية واختبارات تجريبية موقوتة ومتابعة دورية مع ولي الأمر لضمان الحفاظ على أعلى الدرجات.",
    "overviewEn": "Our Math Grade 10 Lessons curriculum provides crystal-clear videos for every unit, automated homework sheets, timed quizzes, and proactive parent progress tracking.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "الوحدات الدراسية المعتمدة للمنهج",
        "titleEn": "Official Curriculum Units",
        "detailsAr": "تغطية شاملة للمقرر الفصلي والسنوي طبقاً لأحدث تعديلات الوزارة.",
        "detailsEn": "Complete semester and yearly modules aligned with latest guidelines."
      },
      {
        "titleAr": "حل تدريبات وتمارين الامتحانات",
        "titleEn": "Practice Problems & Exam Questions",
        "detailsAr": "حل مئات المسائل المتدرجة في الصعوبة لترسيخ المفاهيم.",
        "detailsEn": "Hundreds of graded practice problems reinforcing every mathematical rule."
      }
    ],
    "targetAudienceAr": "طلاب ماث Grade 10 وأولياء أمورهم الراغبون في متابعة منتظمة وشرح مبسط وممتع.",
    "targetAudienceEn": "Students and parents of Math Grade 10 Lessons seeking reliable, enjoyable, and high-scoring lessons.",
    "faqs": [
      {
        "questionAr": "هل يشمل كورس ماث Grade 10 حل أسئلة كتاب الوزارة وكتاب المعاصر؟",
        "questionEn": "Does Math Grade 10 Lessons include ministry textbook and external book problems?",
        "answerAr": "نعم، نحل تمارين كتاب الوزارة وأهم أفكار الكتب الخارجية المعتمدة وبنك المعرفة.",
        "answerEn": "Yes, we solve ministry textbook exercises plus top problems from leading prep books."
      },
      {
        "questionAr": "هل يتوفر امتحانات شهرية محاكية لاختبارات الشهور؟",
        "questionEn": "Are monthly mock tests provided?",
        "answerAr": "نعم، نوفر نماذج امتحانات شهرية قبل كل اختبار مدرسي لتدريب الطالب على شكل الامتحان.",
        "answerEn": "Yes! We publish full monthly mock exams prior to school tests to build timing and confidence."
      }
    ],
    "relatedSlugs": [
      "grade-4-primary-math",
      "3rd-prep-math",
      "3rd-secondary-math",
      "spider-math"
    ]
  },
  {
    "id": "math-grade-11",
    "slug": "math-grade-11",
    "slugAliases": [
      "ماث-grade-11"
    ],
    "category": "grades",
    "categoryNameAr": "الصفوف والمراحل الدراسية",
    "categoryNameEn": "Grade Levels (Primary to Grade 12)",
    "keywordAr": "ماث Grade 11",
    "keywordEn": "Math Grade 11 Lessons",
    "pageTitleAr": "ماث Grade 11 | منصة سبايدر ماث — ميس هبة عياد",
    "pageTitleEn": "Math Grade 11 Lessons | Spider Math Platform — Miss Heba Ayad",
    "metaDescriptionAr": "كورس ماث Grade 11: شرح كامل لجميع دروس المنهج، حل تدريبات الكتاب وبنوك الأسئلة مع المهندسة هبة عبدالوهاب.",
    "metaDescriptionEn": "Comprehensive course for Math Grade 11 Lessons: full syllabus lectures, textbook problem workouts, and mock exams by Eng. Heba Abdel-Wahab.",
    "tagsAr": [
      "ماث Grade 11",
      "شرح رياضيات",
      "سبايدر ماث",
      "هبه عياد",
      "منهج الماث"
    ],
    "tagsEn": [
      "Math Grade 11 Lessons",
      "Math Lessons",
      "Spider Math",
      "Heba Ayad",
      "Grade Curriculum"
    ],
    "badgeAr": "Grade 11",
    "badgeEn": "Grade 11",
    "headlineAr": "ماث Grade 11 — Precalculus, Polynomials, and Digital SAT Preparation",
    "headlineEn": "Math Grade 11 — Precalculus, Polynomials, and Digital SAT Preparation",
    "subheadlineAr": "تأسيس علمي متين ينتقل بالطالب خطوة بخطوة من الفهم الأساسي إلى التميز في الامتحانات.",
    "subheadlineEn": "A structured pedagogical journey moving students step-by-step from core intuition to exam dominance.",
    "overviewAr": "يوفر كورس ماث Grade 11 فيديوهات شرح عالية الوضوح لكل درس في المنهج الوزاري واللغات، مع شيتات واجب إلكترونية واختبارات تجريبية موقوتة ومتابعة دورية مع ولي الأمر لضمان الحفاظ على أعلى الدرجات.",
    "overviewEn": "Our Math Grade 11 Lessons curriculum provides crystal-clear videos for every unit, automated homework sheets, timed quizzes, and proactive parent progress tracking.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "الوحدات الدراسية المعتمدة للمنهج",
        "titleEn": "Official Curriculum Units",
        "detailsAr": "تغطية شاملة للمقرر الفصلي والسنوي طبقاً لأحدث تعديلات الوزارة.",
        "detailsEn": "Complete semester and yearly modules aligned with latest guidelines."
      },
      {
        "titleAr": "حل تدريبات وتمارين الامتحانات",
        "titleEn": "Practice Problems & Exam Questions",
        "detailsAr": "حل مئات المسائل المتدرجة في الصعوبة لترسيخ المفاهيم.",
        "detailsEn": "Hundreds of graded practice problems reinforcing every mathematical rule."
      }
    ],
    "targetAudienceAr": "طلاب ماث Grade 11 وأولياء أمورهم الراغبون في متابعة منتظمة وشرح مبسط وممتع.",
    "targetAudienceEn": "Students and parents of Math Grade 11 Lessons seeking reliable, enjoyable, and high-scoring lessons.",
    "faqs": [
      {
        "questionAr": "هل يشمل كورس ماث Grade 11 حل أسئلة كتاب الوزارة وكتاب المعاصر؟",
        "questionEn": "Does Math Grade 11 Lessons include ministry textbook and external book problems?",
        "answerAr": "نعم، نحل تمارين كتاب الوزارة وأهم أفكار الكتب الخارجية المعتمدة وبنك المعرفة.",
        "answerEn": "Yes, we solve ministry textbook exercises plus top problems from leading prep books."
      },
      {
        "questionAr": "هل يتوفر امتحانات شهرية محاكية لاختبارات الشهور؟",
        "questionEn": "Are monthly mock tests provided?",
        "answerAr": "نعم، نوفر نماذج امتحانات شهرية قبل كل اختبار مدرسي لتدريب الطالب على شكل الامتحان.",
        "answerEn": "Yes! We publish full monthly mock exams prior to school tests to build timing and confidence."
      }
    ],
    "relatedSlugs": [
      "grade-4-primary-math",
      "3rd-prep-math",
      "3rd-secondary-math",
      "spider-math"
    ]
  },
  {
    "id": "math-grade-12",
    "slug": "math-grade-12",
    "slugAliases": [
      "ماث-grade-12"
    ],
    "category": "grades",
    "categoryNameAr": "الصفوف والمراحل الدراسية",
    "categoryNameEn": "Grade Levels (Primary to Grade 12)",
    "keywordAr": "ماث Grade 12",
    "keywordEn": "Math Grade 12 Lessons",
    "pageTitleAr": "ماث Grade 12 | منصة سبايدر ماث — ميس هبة عياد",
    "pageTitleEn": "Math Grade 12 Lessons | Spider Math Platform — Miss Heba Ayad",
    "metaDescriptionAr": "كورس ماث Grade 12: شرح كامل لجميع دروس المنهج، حل تدريبات الكتاب وبنوك الأسئلة مع المهندسة هبة عبدالوهاب.",
    "metaDescriptionEn": "Comprehensive course for Math Grade 12 Lessons: full syllabus lectures, textbook problem workouts, and mock exams by Eng. Heba Abdel-Wahab.",
    "tagsAr": [
      "ماث Grade 12",
      "شرح رياضيات",
      "سبايدر ماث",
      "هبه عياد",
      "منهج الماث"
    ],
    "tagsEn": [
      "Math Grade 12 Lessons",
      "Math Lessons",
      "Spider Math",
      "Heba Ayad",
      "Grade Curriculum"
    ],
    "badgeAr": "Grade 12",
    "badgeEn": "Grade 12",
    "headlineAr": "ماث Grade 12 — AP Calculus, Advanced Statistics, and College Entrance Mastery",
    "headlineEn": "Math Grade 12 — AP Calculus, Advanced Statistics, and College Entrance Mastery",
    "subheadlineAr": "تأسيس علمي متين ينتقل بالطالب خطوة بخطوة من الفهم الأساسي إلى التميز في الامتحانات.",
    "subheadlineEn": "A structured pedagogical journey moving students step-by-step from core intuition to exam dominance.",
    "overviewAr": "يوفر كورس ماث Grade 12 فيديوهات شرح عالية الوضوح لكل درس في المنهج الوزاري واللغات، مع شيتات واجب إلكترونية واختبارات تجريبية موقوتة ومتابعة دورية مع ولي الأمر لضمان الحفاظ على أعلى الدرجات.",
    "overviewEn": "Our Math Grade 12 Lessons curriculum provides crystal-clear videos for every unit, automated homework sheets, timed quizzes, and proactive parent progress tracking.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "الوحدات الدراسية المعتمدة للمنهج",
        "titleEn": "Official Curriculum Units",
        "detailsAr": "تغطية شاملة للمقرر الفصلي والسنوي طبقاً لأحدث تعديلات الوزارة.",
        "detailsEn": "Complete semester and yearly modules aligned with latest guidelines."
      },
      {
        "titleAr": "حل تدريبات وتمارين الامتحانات",
        "titleEn": "Practice Problems & Exam Questions",
        "detailsAr": "حل مئات المسائل المتدرجة في الصعوبة لترسيخ المفاهيم.",
        "detailsEn": "Hundreds of graded practice problems reinforcing every mathematical rule."
      }
    ],
    "targetAudienceAr": "طلاب ماث Grade 12 وأولياء أمورهم الراغبون في متابعة منتظمة وشرح مبسط وممتع.",
    "targetAudienceEn": "Students and parents of Math Grade 12 Lessons seeking reliable, enjoyable, and high-scoring lessons.",
    "faqs": [
      {
        "questionAr": "هل يشمل كورس ماث Grade 12 حل أسئلة كتاب الوزارة وكتاب المعاصر؟",
        "questionEn": "Does Math Grade 12 Lessons include ministry textbook and external book problems?",
        "answerAr": "نعم، نحل تمارين كتاب الوزارة وأهم أفكار الكتب الخارجية المعتمدة وبنك المعرفة.",
        "answerEn": "Yes, we solve ministry textbook exercises plus top problems from leading prep books."
      },
      {
        "questionAr": "هل يتوفر امتحانات شهرية محاكية لاختبارات الشهور؟",
        "questionEn": "Are monthly mock tests provided?",
        "answerAr": "نعم، نوفر نماذج امتحانات شهرية قبل كل اختبار مدرسي لتدريب الطالب على شكل الامتحان.",
        "answerEn": "Yes! We publish full monthly mock exams prior to school tests to build timing and confidence."
      }
    ],
    "relatedSlugs": [
      "grade-4-primary-math",
      "3rd-prep-math",
      "3rd-secondary-math",
      "spider-math"
    ]
  },
  {
    "id": "egyptian-curriculum-math",
    "slug": "egyptian-curriculum-math",
    "slugAliases": [
      "شرح-رياضيات-المنهج-المصري"
    ],
    "category": "curricula",
    "categoryNameAr": "المناهج المختلفة",
    "categoryNameEn": "Educational Curricula",
    "keywordAr": "شرح رياضيات المنهج المصري",
    "keywordEn": "Egyptian Curriculum Math Lessons",
    "pageTitleAr": "شرح رياضيات المنهج المصري | منصة سبايدر ماث — ميس هبة عياد",
    "pageTitleEn": "Egyptian Curriculum Math Lessons | Spider Math Platform — Miss Heba Ayad",
    "metaDescriptionAr": "كورس شرح رياضيات المنهج المصري: شرح معتمد وشامل لكل فصول المنهج مع مذكرات PDF وتدريبات امتحانية تفاعلية مع المهندسة هبة عبدالوهاب.",
    "metaDescriptionEn": "Complete course for Egyptian Curriculum Math Lessons: accredited video lectures, comprehensive PDF notes, and realistic exam practice on Spider Math.",
    "tagsAr": [
      "شرح رياضيات المنهج المصري",
      "مناهج الرياضيات",
      "سبايدر ماث",
      "هبه عياد",
      "ماث اونلاين"
    ],
    "tagsEn": [
      "Egyptian Curriculum Math Lessons",
      "Math Curricula",
      "Spider Math",
      "Heba Ayad",
      "Online Education"
    ],
    "badgeAr": "المنهج المصري",
    "badgeEn": "Egyptian Curriculum",
    "headlineAr": "شرح رياضيات المنهج المصري — من الابتدائي حتى الثانوية العامة بأحدث أساليب التقييم",
    "headlineEn": "Egyptian Curriculum Math Lessons — From Primary to Thanaweya Amma",
    "subheadlineAr": "تنوع المناهج يتطلب خبرة عميقة بكل نظام تعليمي وخصوصية امتحاناته.",
    "subheadlineEn": "Diverse curricula require deep pedagogical mastery of each system’s unique exam format.",
    "overviewAr": "نوفر في شرح رياضيات المنهج المصري مساراً تعليمياً مخصصاً يراعي طبيعة الاختبارات الخاصة بهذا المنهج، سواء أكانت ورقية مقالية أو رقمية اختيارية، مع تدريبات نوعية وبنوك أسئلة مستمرة لتثبيت المعلومات.",
    "overviewEn": "In our Egyptian Curriculum Math Lessons pathway, we tailor the instruction to the exact testing philosophy of the board, offering specialized drill sheets and continuous assessments.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "محاور المنهج التخصصية",
        "titleEn": "Curriculum Core Modules",
        "detailsAr": "تغطية المفاهيم الرياضية الخاصة بهذا المنهج بدقة.",
        "detailsEn": "Rigorous coverage of the mathematical concepts native to this board."
      },
      {
        "titleAr": "بنوك أسئلة مطابقة للاختبار الرسمي",
        "titleEn": "Official Specimen Question Banks",
        "detailsAr": "تدريب مكثف على نماذج ومسائل مطابقة للامتحانات الرسمية.",
        "detailsEn": "Intensive drills mirroring official sample and past papers."
      }
    ],
    "targetAudienceAr": "طلاب هذا المنهج وأولياء أمورهم الراغبون في تحقيق درجات استثنائية.",
    "targetAudienceEn": "Students and parents in this curriculum track aiming for exceptional exam performance.",
    "faqs": [
      {
        "questionAr": "هل يناسب كورس شرح رياضيات المنهج المصري التعديلات الوزارية الأخيرة؟",
        "questionEn": "Is Egyptian Curriculum Math Lessons updated for the latest educational amendments?",
        "answerAr": "نعم، نقوم بتحديث المحاضرات والشيتات فور صدور أي تعديلات رسمية من الجهات التعليمية.",
        "answerEn": "Yes! We update our video modules and handouts immediately upon official board releases."
      }
    ],
    "relatedSlugs": [
      "egyptian-curriculum-math",
      "american-diploma-math",
      "british-igcse-math",
      "spider-math"
    ]
  },
  {
    "id": "egyptian-baccalaureate-math",
    "slug": "egyptian-baccalaureate-math",
    "slugAliases": [
      "شرح-رياضيات-البكالوريا-المصرية"
    ],
    "category": "curricula",
    "categoryNameAr": "المناهج المختلفة",
    "categoryNameEn": "Educational Curricula",
    "keywordAr": "شرح رياضيات البكالوريا المصرية",
    "keywordEn": "Egyptian Baccalaureate Math Lessons",
    "pageTitleAr": "شرح رياضيات البكالوريا المصرية | منصة سبايدر ماث — ميس هبة عياد",
    "pageTitleEn": "Egyptian Baccalaureate Math Lessons | Spider Math Platform — Miss Heba Ayad",
    "metaDescriptionAr": "كورس شرح رياضيات البكالوريا المصرية: شرح معتمد وشامل لكل فصول المنهج مع مذكرات PDF وتدريبات امتحانية تفاعلية مع المهندسة هبة عبدالوهاب.",
    "metaDescriptionEn": "Complete course for Egyptian Baccalaureate Math Lessons: accredited video lectures, comprehensive PDF notes, and realistic exam practice on Spider Math.",
    "tagsAr": [
      "شرح رياضيات البكالوريا المصرية",
      "مناهج الرياضيات",
      "سبايدر ماث",
      "هبه عياد",
      "ماث اونلاين"
    ],
    "tagsEn": [
      "Egyptian Baccalaureate Math Lessons",
      "Math Curricula",
      "Spider Math",
      "Heba Ayad",
      "Online Education"
    ],
    "badgeAr": "البكالوريا المصرية",
    "badgeEn": "Egyptian Baccalaureate",
    "headlineAr": "شرح رياضيات البكالوريا المصرية — المنهاج المطور لاكتساب الفكر الهندسي والتحليلي",
    "headlineEn": "Egyptian Baccalaureate Math Lessons — Advanced Analytical & Engineering Mindset",
    "subheadlineAr": "تنوع المناهج يتطلب خبرة عميقة بكل نظام تعليمي وخصوصية امتحاناته.",
    "subheadlineEn": "Diverse curricula require deep pedagogical mastery of each system’s unique exam format.",
    "overviewAr": "نوفر في شرح رياضيات البكالوريا المصرية مساراً تعليمياً مخصصاً يراعي طبيعة الاختبارات الخاصة بهذا المنهج، سواء أكانت ورقية مقالية أو رقمية اختيارية، مع تدريبات نوعية وبنوك أسئلة مستمرة لتثبيت المعلومات.",
    "overviewEn": "In our Egyptian Baccalaureate Math Lessons pathway, we tailor the instruction to the exact testing philosophy of the board, offering specialized drill sheets and continuous assessments.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "محاور المنهج التخصصية",
        "titleEn": "Curriculum Core Modules",
        "detailsAr": "تغطية المفاهيم الرياضية الخاصة بهذا المنهج بدقة.",
        "detailsEn": "Rigorous coverage of the mathematical concepts native to this board."
      },
      {
        "titleAr": "بنوك أسئلة مطابقة للاختبار الرسمي",
        "titleEn": "Official Specimen Question Banks",
        "detailsAr": "تدريب مكثف على نماذج ومسائل مطابقة للامتحانات الرسمية.",
        "detailsEn": "Intensive drills mirroring official sample and past papers."
      }
    ],
    "targetAudienceAr": "طلاب هذا المنهج وأولياء أمورهم الراغبون في تحقيق درجات استثنائية.",
    "targetAudienceEn": "Students and parents in this curriculum track aiming for exceptional exam performance.",
    "faqs": [
      {
        "questionAr": "هل يناسب كورس شرح رياضيات البكالوريا المصرية التعديلات الوزارية الأخيرة؟",
        "questionEn": "Is Egyptian Baccalaureate Math Lessons updated for the latest educational amendments?",
        "answerAr": "نعم، نقوم بتحديث المحاضرات والشيتات فور صدور أي تعديلات رسمية من الجهات التعليمية.",
        "answerEn": "Yes! We update our video modules and handouts immediately upon official board releases."
      }
    ],
    "relatedSlugs": [
      "egyptian-curriculum-math",
      "american-diploma-math",
      "british-igcse-math",
      "spider-math"
    ]
  },
  {
    "id": "thanaweya-amma-math",
    "slug": "thanaweya-amma-math",
    "slugAliases": [
      "شرح-رياضيات-الثانوية-العامة"
    ],
    "category": "curricula",
    "categoryNameAr": "المناهج المختلفة",
    "categoryNameEn": "Educational Curricula",
    "keywordAr": "شرح رياضيات الثانوية العامة",
    "keywordEn": "Thanaweya Amma Math Lessons",
    "pageTitleAr": "شرح رياضيات الثانوية العامة | منصة سبايدر ماث — ميس هبة عياد",
    "pageTitleEn": "Thanaweya Amma Math Lessons | Spider Math Platform — Miss Heba Ayad",
    "metaDescriptionAr": "كورس شرح رياضيات الثانوية العامة: شرح معتمد وشامل لكل فصول المنهج مع مذكرات PDF وتدريبات امتحانية تفاعلية مع المهندسة هبة عبدالوهاب.",
    "metaDescriptionEn": "Complete course for Thanaweya Amma Math Lessons: accredited video lectures, comprehensive PDF notes, and realistic exam practice on Spider Math.",
    "tagsAr": [
      "شرح رياضيات الثانوية العامة",
      "مناهج الرياضيات",
      "سبايدر ماث",
      "هبه عياد",
      "ماث اونلاين"
    ],
    "tagsEn": [
      "Thanaweya Amma Math Lessons",
      "Math Curricula",
      "Spider Math",
      "Heba Ayad",
      "Online Education"
    ],
    "badgeAr": "الثانوية العامة",
    "badgeEn": "Thanaweya Amma",
    "headlineAr": "شرح رياضيات الثانوية العامة — معسكر التفوق لفرعي الرياضيات البحتة والتطبيقية",
    "headlineEn": "Thanaweya Amma Math Lessons — The Premier Camp for Pure & Applied Math",
    "subheadlineAr": "تنوع المناهج يتطلب خبرة عميقة بكل نظام تعليمي وخصوصية امتحاناته.",
    "subheadlineEn": "Diverse curricula require deep pedagogical mastery of each system’s unique exam format.",
    "overviewAr": "نوفر في شرح رياضيات الثانوية العامة مساراً تعليمياً مخصصاً يراعي طبيعة الاختبارات الخاصة بهذا المنهج، سواء أكانت ورقية مقالية أو رقمية اختيارية، مع تدريبات نوعية وبنوك أسئلة مستمرة لتثبيت المعلومات.",
    "overviewEn": "In our Thanaweya Amma Math Lessons pathway, we tailor the instruction to the exact testing philosophy of the board, offering specialized drill sheets and continuous assessments.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "محاور المنهج التخصصية",
        "titleEn": "Curriculum Core Modules",
        "detailsAr": "تغطية المفاهيم الرياضية الخاصة بهذا المنهج بدقة.",
        "detailsEn": "Rigorous coverage of the mathematical concepts native to this board."
      },
      {
        "titleAr": "بنوك أسئلة مطابقة للاختبار الرسمي",
        "titleEn": "Official Specimen Question Banks",
        "detailsAr": "تدريب مكثف على نماذج ومسائل مطابقة للامتحانات الرسمية.",
        "detailsEn": "Intensive drills mirroring official sample and past papers."
      }
    ],
    "targetAudienceAr": "طلاب هذا المنهج وأولياء أمورهم الراغبون في تحقيق درجات استثنائية.",
    "targetAudienceEn": "Students and parents in this curriculum track aiming for exceptional exam performance.",
    "faqs": [
      {
        "questionAr": "هل يناسب كورس شرح رياضيات الثانوية العامة التعديلات الوزارية الأخيرة؟",
        "questionEn": "Is Thanaweya Amma Math Lessons updated for the latest educational amendments?",
        "answerAr": "نعم، نقوم بتحديث المحاضرات والشيتات فور صدور أي تعديلات رسمية من الجهات التعليمية.",
        "answerEn": "Yes! We update our video modules and handouts immediately upon official board releases."
      }
    ],
    "relatedSlugs": [
      "egyptian-curriculum-math",
      "american-diploma-math",
      "british-igcse-math",
      "spider-math"
    ]
  },
  {
    "id": "al-azhar-curriculum-math",
    "slug": "al-azhar-curriculum-math",
    "slugAliases": [
      "شرح-رياضيات-الازهر"
    ],
    "category": "curricula",
    "categoryNameAr": "المناهج المختلفة",
    "categoryNameEn": "Educational Curricula",
    "keywordAr": "شرح رياضيات الازهر",
    "keywordEn": "Al-Azhar Curriculum Math Lessons",
    "pageTitleAr": "شرح رياضيات الازهر | منصة سبايدر ماث — ميس هبة عياد",
    "pageTitleEn": "Al-Azhar Curriculum Math Lessons | Spider Math Platform — Miss Heba Ayad",
    "metaDescriptionAr": "كورس شرح رياضيات الازهر: شرح معتمد وشامل لكل فصول المنهج مع مذكرات PDF وتدريبات امتحانية تفاعلية مع المهندسة هبة عبدالوهاب.",
    "metaDescriptionEn": "Complete course for Al-Azhar Curriculum Math Lessons: accredited video lectures, comprehensive PDF notes, and realistic exam practice on Spider Math.",
    "tagsAr": [
      "شرح رياضيات الازهر",
      "مناهج الرياضيات",
      "سبايدر ماث",
      "هبه عياد",
      "ماث اونلاين"
    ],
    "tagsEn": [
      "Al-Azhar Curriculum Math Lessons",
      "Math Curricula",
      "Spider Math",
      "Heba Ayad",
      "Online Education"
    ],
    "badgeAr": "الأزهر الشريف",
    "badgeEn": "Al-Azhar Curriculum",
    "headlineAr": "شرح رياضيات الازهر — تدريس مخصص للثانوية الأزهرية يراعي نمط الأسئلة المقالية والموضوعية",
    "headlineEn": "Al-Azhar Curriculum Math Lessons — Tailored for Al-Azhar High School Formats",
    "subheadlineAr": "تنوع المناهج يتطلب خبرة عميقة بكل نظام تعليمي وخصوصية امتحاناته.",
    "subheadlineEn": "Diverse curricula require deep pedagogical mastery of each system’s unique exam format.",
    "overviewAr": "نوفر في شرح رياضيات الازهر مساراً تعليمياً مخصصاً يراعي طبيعة الاختبارات الخاصة بهذا المنهج، سواء أكانت ورقية مقالية أو رقمية اختيارية، مع تدريبات نوعية وبنوك أسئلة مستمرة لتثبيت المعلومات.",
    "overviewEn": "In our Al-Azhar Curriculum Math Lessons pathway, we tailor the instruction to the exact testing philosophy of the board, offering specialized drill sheets and continuous assessments.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "محاور المنهج التخصصية",
        "titleEn": "Curriculum Core Modules",
        "detailsAr": "تغطية المفاهيم الرياضية الخاصة بهذا المنهج بدقة.",
        "detailsEn": "Rigorous coverage of the mathematical concepts native to this board."
      },
      {
        "titleAr": "بنوك أسئلة مطابقة للاختبار الرسمي",
        "titleEn": "Official Specimen Question Banks",
        "detailsAr": "تدريب مكثف على نماذج ومسائل مطابقة للامتحانات الرسمية.",
        "detailsEn": "Intensive drills mirroring official sample and past papers."
      }
    ],
    "targetAudienceAr": "طلاب هذا المنهج وأولياء أمورهم الراغبون في تحقيق درجات استثنائية.",
    "targetAudienceEn": "Students and parents in this curriculum track aiming for exceptional exam performance.",
    "faqs": [
      {
        "questionAr": "هل يناسب كورس شرح رياضيات الازهر التعديلات الوزارية الأخيرة؟",
        "questionEn": "Is Al-Azhar Curriculum Math Lessons updated for the latest educational amendments?",
        "answerAr": "نعم، نقوم بتحديث المحاضرات والشيتات فور صدور أي تعديلات رسمية من الجهات التعليمية.",
        "answerEn": "Yes! We update our video modules and handouts immediately upon official board releases."
      }
    ],
    "relatedSlugs": [
      "egyptian-curriculum-math",
      "american-diploma-math",
      "british-igcse-math",
      "spider-math"
    ]
  },
  {
    "id": "american-diploma-math",
    "slug": "american-diploma-math",
    "slugAliases": [
      "شرح-ماث-الدبلومة-الامريكية"
    ],
    "category": "curricula",
    "categoryNameAr": "المناهج المختلفة",
    "categoryNameEn": "Educational Curricula",
    "keywordAr": "شرح ماث الدبلومة الامريكية",
    "keywordEn": "American Diploma Math Lessons",
    "pageTitleAr": "شرح ماث الدبلومة الامريكية | منصة سبايدر ماث — ميس هبة عياد",
    "pageTitleEn": "American Diploma Math Lessons | Spider Math Platform — Miss Heba Ayad",
    "metaDescriptionAr": "كورس شرح ماث الدبلومة الامريكية: شرح معتمد وشامل لكل فصول المنهج مع مذكرات PDF وتدريبات امتحانية تفاعلية مع المهندسة هبة عبدالوهاب.",
    "metaDescriptionEn": "Complete course for American Diploma Math Lessons: accredited video lectures, comprehensive PDF notes, and realistic exam practice on Spider Math.",
    "tagsAr": [
      "شرح ماث الدبلومة الامريكية",
      "مناهج الرياضيات",
      "سبايدر ماث",
      "هبه عياد",
      "ماث اونلاين"
    ],
    "tagsEn": [
      "American Diploma Math Lessons",
      "Math Curricula",
      "Spider Math",
      "Heba Ayad",
      "Online Education"
    ],
    "badgeAr": "الدبلومة الأمريكية",
    "badgeEn": "American Diploma",
    "headlineAr": "شرح ماث الدبلومة الامريكية — احتراف اختبارات SAT و EST و ACT باستراتيجيات ديسموس",
    "headlineEn": "American Diploma Math Lessons — Conquering SAT, EST, and ACT with Desmos Hacks",
    "subheadlineAr": "تنوع المناهج يتطلب خبرة عميقة بكل نظام تعليمي وخصوصية امتحاناته.",
    "subheadlineEn": "Diverse curricula require deep pedagogical mastery of each system’s unique exam format.",
    "overviewAr": "نوفر في شرح ماث الدبلومة الامريكية مساراً تعليمياً مخصصاً يراعي طبيعة الاختبارات الخاصة بهذا المنهج، سواء أكانت ورقية مقالية أو رقمية اختيارية، مع تدريبات نوعية وبنوك أسئلة مستمرة لتثبيت المعلومات.",
    "overviewEn": "In our American Diploma Math Lessons pathway, we tailor the instruction to the exact testing philosophy of the board, offering specialized drill sheets and continuous assessments.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "محاور المنهج التخصصية",
        "titleEn": "Curriculum Core Modules",
        "detailsAr": "تغطية المفاهيم الرياضية الخاصة بهذا المنهج بدقة.",
        "detailsEn": "Rigorous coverage of the mathematical concepts native to this board."
      },
      {
        "titleAr": "بنوك أسئلة مطابقة للاختبار الرسمي",
        "titleEn": "Official Specimen Question Banks",
        "detailsAr": "تدريب مكثف على نماذج ومسائل مطابقة للامتحانات الرسمية.",
        "detailsEn": "Intensive drills mirroring official sample and past papers."
      }
    ],
    "targetAudienceAr": "طلاب هذا المنهج وأولياء أمورهم الراغبون في تحقيق درجات استثنائية.",
    "targetAudienceEn": "Students and parents in this curriculum track aiming for exceptional exam performance.",
    "faqs": [
      {
        "questionAr": "هل يناسب كورس شرح ماث الدبلومة الامريكية التعديلات الوزارية الأخيرة؟",
        "questionEn": "Is American Diploma Math Lessons updated for the latest educational amendments?",
        "answerAr": "نعم، نقوم بتحديث المحاضرات والشيتات فور صدور أي تعديلات رسمية من الجهات التعليمية.",
        "answerEn": "Yes! We update our video modules and handouts immediately upon official board releases."
      }
    ],
    "relatedSlugs": [
      "egyptian-curriculum-math",
      "american-diploma-math",
      "british-igcse-math",
      "spider-math"
    ]
  },
  {
    "id": "british-igcse-math",
    "slug": "british-igcse-math",
    "slugAliases": [
      "شرح-ماث-المنهج-البريطاني-ig"
    ],
    "category": "curricula",
    "categoryNameAr": "المناهج المختلفة",
    "categoryNameEn": "Educational Curricula",
    "keywordAr": "شرح ماث المنهج البريطاني IG",
    "keywordEn": "British Curriculum IGCSE Math",
    "pageTitleAr": "شرح ماث المنهج البريطاني IG | منصة سبايدر ماث — ميس هبة عياد",
    "pageTitleEn": "British Curriculum IGCSE Math | Spider Math Platform — Miss Heba Ayad",
    "metaDescriptionAr": "كورس شرح ماث المنهج البريطاني IG: شرح معتمد وشامل لكل فصول المنهج مع مذكرات PDF وتدريبات امتحانية تفاعلية مع المهندسة هبة عبدالوهاب.",
    "metaDescriptionEn": "Complete course for British Curriculum IGCSE Math: accredited video lectures, comprehensive PDF notes, and realistic exam practice on Spider Math.",
    "tagsAr": [
      "شرح ماث المنهج البريطاني IG",
      "مناهج الرياضيات",
      "سبايدر ماث",
      "هبه عياد",
      "ماث اونلاين"
    ],
    "tagsEn": [
      "British Curriculum IGCSE Math",
      "Math Curricula",
      "Spider Math",
      "Heba Ayad",
      "Online Education"
    ],
    "badgeAr": "المنهج البريطاني IG",
    "badgeEn": "British IGCSE",
    "headlineAr": "شرح ماث المنهج البريطاني IG — كامبريدج وإديكسل OL و AL مع حلول Past Papers كاملة",
    "headlineEn": "British Curriculum IGCSE Math — Cambridge & Edexcel OL/AL Past Paper Workouts",
    "subheadlineAr": "تنوع المناهج يتطلب خبرة عميقة بكل نظام تعليمي وخصوصية امتحاناته.",
    "subheadlineEn": "Diverse curricula require deep pedagogical mastery of each system’s unique exam format.",
    "overviewAr": "نوفر في شرح ماث المنهج البريطاني IG مساراً تعليمياً مخصصاً يراعي طبيعة الاختبارات الخاصة بهذا المنهج، سواء أكانت ورقية مقالية أو رقمية اختيارية، مع تدريبات نوعية وبنوك أسئلة مستمرة لتثبيت المعلومات.",
    "overviewEn": "In our British Curriculum IGCSE Math pathway, we tailor the instruction to the exact testing philosophy of the board, offering specialized drill sheets and continuous assessments.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "محاور المنهج التخصصية",
        "titleEn": "Curriculum Core Modules",
        "detailsAr": "تغطية المفاهيم الرياضية الخاصة بهذا المنهج بدقة.",
        "detailsEn": "Rigorous coverage of the mathematical concepts native to this board."
      },
      {
        "titleAr": "بنوك أسئلة مطابقة للاختبار الرسمي",
        "titleEn": "Official Specimen Question Banks",
        "detailsAr": "تدريب مكثف على نماذج ومسائل مطابقة للامتحانات الرسمية.",
        "detailsEn": "Intensive drills mirroring official sample and past papers."
      }
    ],
    "targetAudienceAr": "طلاب هذا المنهج وأولياء أمورهم الراغبون في تحقيق درجات استثنائية.",
    "targetAudienceEn": "Students and parents in this curriculum track aiming for exceptional exam performance.",
    "faqs": [
      {
        "questionAr": "هل يناسب كورس شرح ماث المنهج البريطاني IG التعديلات الوزارية الأخيرة؟",
        "questionEn": "Is British Curriculum IGCSE Math updated for the latest educational amendments?",
        "answerAr": "نعم، نقوم بتحديث المحاضرات والشيتات فور صدور أي تعديلات رسمية من الجهات التعليمية.",
        "answerEn": "Yes! We update our video modules and handouts immediately upon official board releases."
      }
    ],
    "relatedSlugs": [
      "egyptian-curriculum-math",
      "american-diploma-math",
      "british-igcse-math",
      "spider-math"
    ]
  },
  {
    "id": "igcse-math-explanation",
    "slug": "igcse-math-explanation",
    "slugAliases": [
      "شرح-igcse-math"
    ],
    "category": "curricula",
    "categoryNameAr": "المناهج المختلفة",
    "categoryNameEn": "Educational Curricula",
    "keywordAr": "شرح IGCSE Math",
    "keywordEn": "IGCSE Math Lessons & Past Papers",
    "pageTitleAr": "شرح IGCSE Math | منصة سبايدر ماث — ميس هبة عياد",
    "pageTitleEn": "IGCSE Math Lessons & Past Papers | Spider Math Platform — Miss Heba Ayad",
    "metaDescriptionAr": "كورس شرح IGCSE Math: شرح معتمد وشامل لكل فصول المنهج مع مذكرات PDF وتدريبات امتحانية تفاعلية مع المهندسة هبة عبدالوهاب.",
    "metaDescriptionEn": "Complete course for IGCSE Math Lessons & Past Papers: accredited video lectures, comprehensive PDF notes, and realistic exam practice on Spider Math.",
    "tagsAr": [
      "شرح IGCSE Math",
      "مناهج الرياضيات",
      "سبايدر ماث",
      "هبه عياد",
      "ماث اونلاين"
    ],
    "tagsEn": [
      "IGCSE Math Lessons & Past Papers",
      "Math Curricula",
      "Spider Math",
      "Heba Ayad",
      "Online Education"
    ],
    "badgeAr": "IGCSE Math",
    "badgeEn": "IGCSE Math",
    "headlineAr": "شرح IGCSE Math — استراتيجيات الحصول على 9 / A* في امتحانات Cambridge & Pearson",
    "headlineEn": "IGCSE Math Lessons — Strategies to Secure Grade 9 / A* in Cambridge & Pearson",
    "subheadlineAr": "تنوع المناهج يتطلب خبرة عميقة بكل نظام تعليمي وخصوصية امتحاناته.",
    "subheadlineEn": "Diverse curricula require deep pedagogical mastery of each system’s unique exam format.",
    "overviewAr": "نوفر في شرح IGCSE Math مساراً تعليمياً مخصصاً يراعي طبيعة الاختبارات الخاصة بهذا المنهج، سواء أكانت ورقية مقالية أو رقمية اختيارية، مع تدريبات نوعية وبنوك أسئلة مستمرة لتثبيت المعلومات.",
    "overviewEn": "In our IGCSE Math Lessons & Past Papers pathway, we tailor the instruction to the exact testing philosophy of the board, offering specialized drill sheets and continuous assessments.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "محاور المنهج التخصصية",
        "titleEn": "Curriculum Core Modules",
        "detailsAr": "تغطية المفاهيم الرياضية الخاصة بهذا المنهج بدقة.",
        "detailsEn": "Rigorous coverage of the mathematical concepts native to this board."
      },
      {
        "titleAr": "بنوك أسئلة مطابقة للاختبار الرسمي",
        "titleEn": "Official Specimen Question Banks",
        "detailsAr": "تدريب مكثف على نماذج ومسائل مطابقة للامتحانات الرسمية.",
        "detailsEn": "Intensive drills mirroring official sample and past papers."
      }
    ],
    "targetAudienceAr": "طلاب هذا المنهج وأولياء أمورهم الراغبون في تحقيق درجات استثنائية.",
    "targetAudienceEn": "Students and parents in this curriculum track aiming for exceptional exam performance.",
    "faqs": [
      {
        "questionAr": "هل يناسب كورس شرح IGCSE Math التعديلات الوزارية الأخيرة؟",
        "questionEn": "Is IGCSE Math Lessons & Past Papers updated for the latest educational amendments?",
        "answerAr": "نعم، نقوم بتحديث المحاضرات والشيتات فور صدور أي تعديلات رسمية من الجهات التعليمية.",
        "answerEn": "Yes! We update our video modules and handouts immediately upon official board releases."
      }
    ],
    "relatedSlugs": [
      "egyptian-curriculum-math",
      "american-diploma-math",
      "british-igcse-math",
      "spider-math"
    ]
  },
  {
    "id": "languages-schools-math",
    "slug": "languages-schools-math",
    "slugAliases": [
      "شرح-ماث-لغات"
    ],
    "category": "curricula",
    "categoryNameAr": "المناهج المختلفة",
    "categoryNameEn": "Educational Curricula",
    "keywordAr": "شرح ماث لغات",
    "keywordEn": "Languages Schools Math Lessons",
    "pageTitleAr": "شرح ماث لغات | منصة سبايدر ماث — ميس هبة عياد",
    "pageTitleEn": "Languages Schools Math Lessons | Spider Math Platform — Miss Heba Ayad",
    "metaDescriptionAr": "كورس شرح ماث لغات: شرح معتمد وشامل لكل فصول المنهج مع مذكرات PDF وتدريبات امتحانية تفاعلية مع المهندسة هبة عبدالوهاب.",
    "metaDescriptionEn": "Complete course for Languages Schools Math Lessons: accredited video lectures, comprehensive PDF notes, and realistic exam practice on Spider Math.",
    "tagsAr": [
      "شرح ماث لغات",
      "مناهج الرياضيات",
      "سبايدر ماث",
      "هبه عياد",
      "ماث اونلاين"
    ],
    "tagsEn": [
      "Languages Schools Math Lessons",
      "Math Curricula",
      "Spider Math",
      "Heba Ayad",
      "Online Education"
    ],
    "badgeAr": "مدارس اللغات والرسمية",
    "badgeEn": "Language Schools",
    "headlineAr": "شرح ماث لغات — تدريس المناهج باللغة الإنجليزية لمدارس اللغات والتجريبية والمتميزة",
    "headlineEn": "Languages Schools Math Lessons — English Instruction for Experimental & Private Schools",
    "subheadlineAr": "تنوع المناهج يتطلب خبرة عميقة بكل نظام تعليمي وخصوصية امتحاناته.",
    "subheadlineEn": "Diverse curricula require deep pedagogical mastery of each system’s unique exam format.",
    "overviewAr": "نوفر في شرح ماث لغات مساراً تعليمياً مخصصاً يراعي طبيعة الاختبارات الخاصة بهذا المنهج، سواء أكانت ورقية مقالية أو رقمية اختيارية، مع تدريبات نوعية وبنوك أسئلة مستمرة لتثبيت المعلومات.",
    "overviewEn": "In our Languages Schools Math Lessons pathway, we tailor the instruction to the exact testing philosophy of the board, offering specialized drill sheets and continuous assessments.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "محاور المنهج التخصصية",
        "titleEn": "Curriculum Core Modules",
        "detailsAr": "تغطية المفاهيم الرياضية الخاصة بهذا المنهج بدقة.",
        "detailsEn": "Rigorous coverage of the mathematical concepts native to this board."
      },
      {
        "titleAr": "بنوك أسئلة مطابقة للاختبار الرسمي",
        "titleEn": "Official Specimen Question Banks",
        "detailsAr": "تدريب مكثف على نماذج ومسائل مطابقة للامتحانات الرسمية.",
        "detailsEn": "Intensive drills mirroring official sample and past papers."
      }
    ],
    "targetAudienceAr": "طلاب هذا المنهج وأولياء أمورهم الراغبون في تحقيق درجات استثنائية.",
    "targetAudienceEn": "Students and parents in this curriculum track aiming for exceptional exam performance.",
    "faqs": [
      {
        "questionAr": "هل يناسب كورس شرح ماث لغات التعديلات الوزارية الأخيرة؟",
        "questionEn": "Is Languages Schools Math Lessons updated for the latest educational amendments?",
        "answerAr": "نعم، نقوم بتحديث المحاضرات والشيتات فور صدور أي تعديلات رسمية من الجهات التعليمية.",
        "answerEn": "Yes! We update our video modules and handouts immediately upon official board releases."
      }
    ],
    "relatedSlugs": [
      "egyptian-curriculum-math",
      "american-diploma-math",
      "british-igcse-math",
      "spider-math"
    ]
  },
  {
    "id": "saudi-curriculum-math",
    "slug": "saudi-curriculum-math",
    "slugAliases": [
      "شرح-رياضيات-المنهج-السعودي"
    ],
    "category": "curricula",
    "categoryNameAr": "المناهج المختلفة",
    "categoryNameEn": "Educational Curricula",
    "keywordAr": "شرح رياضيات المنهج السعودي",
    "keywordEn": "Saudi Curriculum Math Lessons",
    "pageTitleAr": "شرح رياضيات المنهج السعودي | منصة سبايدر ماث — ميس هبة عياد",
    "pageTitleEn": "Saudi Curriculum Math Lessons | Spider Math Platform — Miss Heba Ayad",
    "metaDescriptionAr": "كورس شرح رياضيات المنهج السعودي: شرح معتمد وشامل لكل فصول المنهج مع مذكرات PDF وتدريبات امتحانية تفاعلية مع المهندسة هبة عبدالوهاب.",
    "metaDescriptionEn": "Complete course for Saudi Curriculum Math Lessons: accredited video lectures, comprehensive PDF notes, and realistic exam practice on Spider Math.",
    "tagsAr": [
      "شرح رياضيات المنهج السعودي",
      "مناهج الرياضيات",
      "سبايدر ماث",
      "هبه عياد",
      "ماث اونلاين"
    ],
    "tagsEn": [
      "Saudi Curriculum Math Lessons",
      "Math Curricula",
      "Spider Math",
      "Heba Ayad",
      "Online Education"
    ],
    "badgeAr": "المنهج السعودي والخليجي",
    "badgeEn": "Saudi Curriculum",
    "headlineAr": "شرح رياضيات المنهج السعودي — مسارات ومقررات المرحلة المتوسطة والثانوية مع تدريبات التحصيلي والقدرات",
    "headlineEn": "Saudi Curriculum Math Lessons — Middle & High School Tracks plus Tahsili & Qudurat",
    "subheadlineAr": "تنوع المناهج يتطلب خبرة عميقة بكل نظام تعليمي وخصوصية امتحاناته.",
    "subheadlineEn": "Diverse curricula require deep pedagogical mastery of each system’s unique exam format.",
    "overviewAr": "نوفر في شرح رياضيات المنهج السعودي مساراً تعليمياً مخصصاً يراعي طبيعة الاختبارات الخاصة بهذا المنهج، سواء أكانت ورقية مقالية أو رقمية اختيارية، مع تدريبات نوعية وبنوك أسئلة مستمرة لتثبيت المعلومات.",
    "overviewEn": "In our Saudi Curriculum Math Lessons pathway, we tailor the instruction to the exact testing philosophy of the board, offering specialized drill sheets and continuous assessments.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "محاور المنهج التخصصية",
        "titleEn": "Curriculum Core Modules",
        "detailsAr": "تغطية المفاهيم الرياضية الخاصة بهذا المنهج بدقة.",
        "detailsEn": "Rigorous coverage of the mathematical concepts native to this board."
      },
      {
        "titleAr": "بنوك أسئلة مطابقة للاختبار الرسمي",
        "titleEn": "Official Specimen Question Banks",
        "detailsAr": "تدريب مكثف على نماذج ومسائل مطابقة للامتحانات الرسمية.",
        "detailsEn": "Intensive drills mirroring official sample and past papers."
      }
    ],
    "targetAudienceAr": "طلاب هذا المنهج وأولياء أمورهم الراغبون في تحقيق درجات استثنائية.",
    "targetAudienceEn": "Students and parents in this curriculum track aiming for exceptional exam performance.",
    "faqs": [
      {
        "questionAr": "هل يناسب كورس شرح رياضيات المنهج السعودي التعديلات الوزارية الأخيرة؟",
        "questionEn": "Is Saudi Curriculum Math Lessons updated for the latest educational amendments?",
        "answerAr": "نعم، نقوم بتحديث المحاضرات والشيتات فور صدور أي تعديلات رسمية من الجهات التعليمية.",
        "answerEn": "Yes! We update our video modules and handouts immediately upon official board releases."
      }
    ],
    "relatedSlugs": [
      "egyptian-curriculum-math",
      "american-diploma-math",
      "british-igcse-math",
      "spider-math"
    ]
  },
  {
    "id": "sat-math-explanation",
    "slug": "sat-math-explanation",
    "slugAliases": [
      "شرح-sat-math"
    ],
    "category": "american_diploma",
    "categoryNameAr": "الدبلومة الأمريكية (SAT • EST • ACT)",
    "categoryNameEn": "American Diploma (SAT • EST • ACT)",
    "keywordAr": "شرح SAT Math",
    "keywordEn": "SAT Math Lessons & Strategy",
    "pageTitleAr": "شرح SAT Math | كورس الماث للدبلومة الأمريكية — ميس هبة عياد",
    "pageTitleEn": "SAT Math Lessons & Strategy | American Diploma Math Hub — Miss Heba Ayad",
    "metaDescriptionAr": "كل ما يخص شرح SAT Math: استراتيجيات ديسموس، خطة 800، حل امتحانات سابقة، وأسعار الباقات مع المهندسة هبة عبدالوهاب على سبايدر ماث.",
    "metaDescriptionEn": "Master SAT Math Lessons & Strategy: Desmos shortcuts, 800 blueprints, official question banks, and transparent pricing on Spider Math Platform.",
    "tagsAr": [
      "شرح SAT Math",
      "SAT Math",
      "EST Math",
      "ACT Math",
      "الدبلومة الأمريكية",
      "ديسموس"
    ],
    "tagsEn": [
      "SAT Math Lessons & Strategy",
      "SAT Math",
      "EST Math",
      "ACT Math",
      "American Diploma",
      "Desmos Calculator"
    ],
    "badgeAr": "Digital SAT",
    "badgeEn": "Digital SAT",
    "headlineAr": "شرح SAT Math — أسرار Digital SAT وحيل حاسبة ديسموس لتحقيق سكور 800",
    "headlineEn": "SAT Math Lessons & Strategy — Digital SAT Mastery & Desmos Speed Hacks",
    "subheadlineAr": "في اختبارات الدبلومة الأمريكية، السرعة واستخدام ديسموس هما مفتاح الـ 800.",
    "subheadlineEn": "In American Diploma standardized tests, pacing and Desmos mastery unlock the 800.",
    "overviewAr": "يقدم كورس شرح SAT Math تدريباً مكثفاً على التعامل مع بنك أسئلة College Board واختبارات EST الرسمية، مع التركيز على استراتيجيات الحل الذكي باستخدام حاسبة ديسموس المدمجة والتخلص من فخاخ الوقت في Module 2 الصعب.",
    "overviewEn": "Our SAT Math Lessons & Strategy program delivers deep training on College Board question banks and official EST exams, focusing on Desmos graphical shortcuts, eliminating traps, and mastering hard Module 2 sections.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "Heart of Algebra & Advanced Math",
        "titleEn": "Heart of Algebra & Advanced Math",
        "detailsAr": "المعادلات الخطية، الأنظمة، الدوال التربيعية، كثيرات الحدود، والمتباينات.",
        "detailsEn": "Linear systems, quadratic models, complex polynomials, and inequalities."
      },
      {
        "titleAr": "Problem Solving, Data Analysis & Geometry",
        "titleEn": "Problem Solving, Data Analysis & Geometry",
        "detailsAr": "النسب، الإحصاء، الاحتمالات، الدوائر، وحساب المثلثات المتقدم.",
        "detailsEn": "Ratios, scatterplots, statistics, circles, and right-triangle trigonometry."
      }
    ],
    "targetAudienceAr": "طلاب الدبلومة الأمريكية في مصر والخليج الراغبون في تحقيق سكور 800 للالتحاق بكليات الهندسة والطب.",
    "targetAudienceEn": "American Diploma students across Egypt and the Gulf striving for an 800 score.",
    "faqs": [
      {
        "questionAr": "كيف تضمن الحصول على سكور 800 في SAT Math؟",
        "questionEn": "How can I ensure an 800 score in SAT Math?",
        "answerAr": "من خلال الخطة الثلاثية: إتقان مفاهيم الجبر والإحصاء، الاحتراف التام لحاسبة ديسموس، وإدارة دفتر أخطاء يومي (Error Log) لعدم تكرار أي خطأ.",
        "answerEn": "Through the 3-pillar method: conceptual mastery, full Desmos fluency, and keeping an active Error Log to eliminate mistakes."
      },
      {
        "questionAr": "ما هو الفرق الأساسي بين SAT و EST و ACT في الماث؟",
        "questionEn": "What is the main difference between SAT, EST, and ACT in Math?",
        "answerAr": "اختبار SAT رقمي بالكامل ويعتمد على ديسموس في جميع الأسئلة، واختبار EST مخصص للجامعات المصرية بفرعي EST 1 و EST 2، بينما يعتمد ACT على 60 سؤالاً في 60 دقيقة بسرعة عالية جداً.",
        "answerEn": "Digital SAT uses Desmos natively; EST is specifically aligned with Egyptian universities; ACT is a high-speed 60-question/60-minute paper test."
      }
    ],
    "relatedSlugs": [
      "sat-math-explanation",
      "how-to-score-800-in-sat-math",
      "difference-between-sat-act-est",
      "spider-math"
    ]
  },
  {
    "id": "sat-math-online-course",
    "slug": "sat-math-online-course",
    "slugAliases": [
      "كورس-sat-math-اون-لاين"
    ],
    "category": "american_diploma",
    "categoryNameAr": "الدبلومة الأمريكية (SAT • EST • ACT)",
    "categoryNameEn": "American Diploma (SAT • EST • ACT)",
    "keywordAr": "كورس SAT Math اون لاين",
    "keywordEn": "Online SAT Math Course & Prep",
    "pageTitleAr": "كورس SAT Math اون لاين | كورس الماث للدبلومة الأمريكية — ميس هبة عياد",
    "pageTitleEn": "Online SAT Math Course & Prep | American Diploma Math Hub — Miss Heba Ayad",
    "metaDescriptionAr": "كل ما يخص كورس SAT Math اون لاين: استراتيجيات ديسموس، خطة 800، حل امتحانات سابقة، وأسعار الباقات مع المهندسة هبة عبدالوهاب على سبايدر ماث.",
    "metaDescriptionEn": "Master Online SAT Math Course & Prep: Desmos shortcuts, 800 blueprints, official question banks, and transparent pricing on Spider Math Platform.",
    "tagsAr": [
      "كورس SAT Math اون لاين",
      "SAT Math",
      "EST Math",
      "ACT Math",
      "الدبلومة الأمريكية",
      "ديسموس"
    ],
    "tagsEn": [
      "Online SAT Math Course & Prep",
      "SAT Math",
      "EST Math",
      "ACT Math",
      "American Diploma",
      "Desmos Calculator"
    ],
    "badgeAr": "كورس SAT كامل",
    "badgeEn": "Full SAT Course",
    "headlineAr": "كورس SAT Math اون لاين — المعسكر التدريبي المتكامل لجميع أقسام الجبر والدوال والهندسة",
    "headlineEn": "Online SAT Math Course & Prep — Comprehensive Bootcamp Covering All Modules",
    "subheadlineAr": "في اختبارات الدبلومة الأمريكية، السرعة واستخدام ديسموس هما مفتاح الـ 800.",
    "subheadlineEn": "In American Diploma standardized tests, pacing and Desmos mastery unlock the 800.",
    "overviewAr": "يقدم كورس كورس SAT Math اون لاين تدريباً مكثفاً على التعامل مع بنك أسئلة College Board واختبارات EST الرسمية، مع التركيز على استراتيجيات الحل الذكي باستخدام حاسبة ديسموس المدمجة والتخلص من فخاخ الوقت في Module 2 الصعب.",
    "overviewEn": "Our Online SAT Math Course & Prep program delivers deep training on College Board question banks and official EST exams, focusing on Desmos graphical shortcuts, eliminating traps, and mastering hard Module 2 sections.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "Heart of Algebra & Advanced Math",
        "titleEn": "Heart of Algebra & Advanced Math",
        "detailsAr": "المعادلات الخطية، الأنظمة، الدوال التربيعية، كثيرات الحدود، والمتباينات.",
        "detailsEn": "Linear systems, quadratic models, complex polynomials, and inequalities."
      },
      {
        "titleAr": "Problem Solving, Data Analysis & Geometry",
        "titleEn": "Problem Solving, Data Analysis & Geometry",
        "detailsAr": "النسب، الإحصاء، الاحتمالات، الدوائر، وحساب المثلثات المتقدم.",
        "detailsEn": "Ratios, scatterplots, statistics, circles, and right-triangle trigonometry."
      }
    ],
    "targetAudienceAr": "طلاب الدبلومة الأمريكية في مصر والخليج الراغبون في تحقيق سكور 800 للالتحاق بكليات الهندسة والطب.",
    "targetAudienceEn": "American Diploma students across Egypt and the Gulf striving for an 800 score.",
    "faqs": [
      {
        "questionAr": "كيف تضمن الحصول على سكور 800 في SAT Math؟",
        "questionEn": "How can I ensure an 800 score in SAT Math?",
        "answerAr": "من خلال الخطة الثلاثية: إتقان مفاهيم الجبر والإحصاء، الاحتراف التام لحاسبة ديسموس، وإدارة دفتر أخطاء يومي (Error Log) لعدم تكرار أي خطأ.",
        "answerEn": "Through the 3-pillar method: conceptual mastery, full Desmos fluency, and keeping an active Error Log to eliminate mistakes."
      },
      {
        "questionAr": "ما هو الفرق الأساسي بين SAT و EST و ACT في الماث؟",
        "questionEn": "What is the main difference between SAT, EST, and ACT in Math?",
        "answerAr": "اختبار SAT رقمي بالكامل ويعتمد على ديسموس في جميع الأسئلة، واختبار EST مخصص للجامعات المصرية بفرعي EST 1 و EST 2، بينما يعتمد ACT على 60 سؤالاً في 60 دقيقة بسرعة عالية جداً.",
        "answerEn": "Digital SAT uses Desmos natively; EST is specifically aligned with Egyptian universities; ACT is a high-speed 60-question/60-minute paper test."
      }
    ],
    "relatedSlugs": [
      "sat-math-explanation",
      "how-to-score-800-in-sat-math",
      "difference-between-sat-act-est",
      "spider-math"
    ]
  },
  {
    "id": "how-to-score-800-in-sat-math",
    "slug": "how-to-score-800-in-sat-math",
    "slugAliases": [
      "ازاي-اجيب-800-في-sat-math",
      "كيف-احصل-على-800-sat-math"
    ],
    "category": "american_diploma",
    "categoryNameAr": "الدبلومة الأمريكية (SAT • EST • ACT)",
    "categoryNameEn": "American Diploma (SAT • EST • ACT)",
    "keywordAr": "ازاي اجيب 800 في SAT Math",
    "keywordEn": "How to Score 800 in SAT Math Guide",
    "pageTitleAr": "ازاي اجيب 800 في SAT Math | كورس الماث للدبلومة الأمريكية — ميس هبة عياد",
    "pageTitleEn": "How to Score 800 in SAT Math Guide | American Diploma Math Hub — Miss Heba Ayad",
    "metaDescriptionAr": "كل ما يخص ازاي اجيب 800 في SAT Math: استراتيجيات ديسموس، خطة 800، حل امتحانات سابقة، وأسعار الباقات مع المهندسة هبة عبدالوهاب على سبايدر ماث.",
    "metaDescriptionEn": "Master How to Score 800 in SAT Math Guide: Desmos shortcuts, 800 blueprints, official question banks, and transparent pricing on Spider Math Platform.",
    "tagsAr": [
      "ازاي اجيب 800 في SAT Math",
      "SAT Math",
      "EST Math",
      "ACT Math",
      "الدبلومة الأمريكية",
      "ديسموس"
    ],
    "tagsEn": [
      "How to Score 800 in SAT Math Guide",
      "SAT Math",
      "EST Math",
      "ACT Math",
      "American Diploma",
      "Desmos Calculator"
    ],
    "badgeAr": "800 Roadmap",
    "badgeEn": "800 Roadmap",
    "headlineAr": "ازاي اجيب 800 في SAT Math — الخطة الذهبية والخطوات العملية لتحقيق السكور المثالي",
    "headlineEn": "How to Score 800 in SAT Math — The Step-by-Step Blueprint to a Perfect Score",
    "subheadlineAr": "في اختبارات الدبلومة الأمريكية، السرعة واستخدام ديسموس هما مفتاح الـ 800.",
    "subheadlineEn": "In American Diploma standardized tests, pacing and Desmos mastery unlock the 800.",
    "overviewAr": "يقدم كورس ازاي اجيب 800 في SAT Math تدريباً مكثفاً على التعامل مع بنك أسئلة College Board واختبارات EST الرسمية، مع التركيز على استراتيجيات الحل الذكي باستخدام حاسبة ديسموس المدمجة والتخلص من فخاخ الوقت في Module 2 الصعب.",
    "overviewEn": "Our How to Score 800 in SAT Math Guide program delivers deep training on College Board question banks and official EST exams, focusing on Desmos graphical shortcuts, eliminating traps, and mastering hard Module 2 sections.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "Heart of Algebra & Advanced Math",
        "titleEn": "Heart of Algebra & Advanced Math",
        "detailsAr": "المعادلات الخطية، الأنظمة، الدوال التربيعية، كثيرات الحدود، والمتباينات.",
        "detailsEn": "Linear systems, quadratic models, complex polynomials, and inequalities."
      },
      {
        "titleAr": "Problem Solving, Data Analysis & Geometry",
        "titleEn": "Problem Solving, Data Analysis & Geometry",
        "detailsAr": "النسب، الإحصاء، الاحتمالات، الدوائر، وحساب المثلثات المتقدم.",
        "detailsEn": "Ratios, scatterplots, statistics, circles, and right-triangle trigonometry."
      }
    ],
    "targetAudienceAr": "طلاب الدبلومة الأمريكية في مصر والخليج الراغبون في تحقيق سكور 800 للالتحاق بكليات الهندسة والطب.",
    "targetAudienceEn": "American Diploma students across Egypt and the Gulf striving for an 800 score.",
    "faqs": [
      {
        "questionAr": "كيف تضمن الحصول على سكور 800 في SAT Math؟",
        "questionEn": "How can I ensure an 800 score in SAT Math?",
        "answerAr": "من خلال الخطة الثلاثية: إتقان مفاهيم الجبر والإحصاء، الاحتراف التام لحاسبة ديسموس، وإدارة دفتر أخطاء يومي (Error Log) لعدم تكرار أي خطأ.",
        "answerEn": "Through the 3-pillar method: conceptual mastery, full Desmos fluency, and keeping an active Error Log to eliminate mistakes."
      },
      {
        "questionAr": "ما هو الفرق الأساسي بين SAT و EST و ACT في الماث؟",
        "questionEn": "What is the main difference between SAT, EST, and ACT in Math?",
        "answerAr": "اختبار SAT رقمي بالكامل ويعتمد على ديسموس في جميع الأسئلة، واختبار EST مخصص للجامعات المصرية بفرعي EST 1 و EST 2، بينما يعتمد ACT على 60 سؤالاً في 60 دقيقة بسرعة عالية جداً.",
        "answerEn": "Digital SAT uses Desmos natively; EST is specifically aligned with Egyptian universities; ACT is a high-speed 60-question/60-minute paper test."
      }
    ],
    "relatedSlugs": [
      "sat-math-explanation",
      "how-to-score-800-in-sat-math",
      "difference-between-sat-act-est",
      "spider-math"
    ]
  },
  {
    "id": "est-math-explanation",
    "slug": "est-math-explanation",
    "slugAliases": [
      "شرح-est-math"
    ],
    "category": "american_diploma",
    "categoryNameAr": "الدبلومة الأمريكية (SAT • EST • ACT)",
    "categoryNameEn": "American Diploma (SAT • EST • ACT)",
    "keywordAr": "شرح EST Math",
    "keywordEn": "EST Math Lessons & Strategy",
    "pageTitleAr": "شرح EST Math | كورس الماث للدبلومة الأمريكية — ميس هبة عياد",
    "pageTitleEn": "EST Math Lessons & Strategy | American Diploma Math Hub — Miss Heba Ayad",
    "metaDescriptionAr": "كل ما يخص شرح EST Math: استراتيجيات ديسموس، خطة 800، حل امتحانات سابقة، وأسعار الباقات مع المهندسة هبة عبدالوهاب على سبايدر ماث.",
    "metaDescriptionEn": "Master EST Math Lessons & Strategy: Desmos shortcuts, 800 blueprints, official question banks, and transparent pricing on Spider Math Platform.",
    "tagsAr": [
      "شرح EST Math",
      "SAT Math",
      "EST Math",
      "ACT Math",
      "الدبلومة الأمريكية",
      "ديسموس"
    ],
    "tagsEn": [
      "EST Math Lessons & Strategy",
      "SAT Math",
      "EST Math",
      "ACT Math",
      "American Diploma",
      "Desmos Calculator"
    ],
    "badgeAr": "EST 1 & EST 2",
    "badgeEn": "EST 1 & EST 2",
    "headlineAr": "شرح EST Math — دليلك الأقوى لاجتياز اختبارات القبول الجامعي للدبلومة الأمريكية في مصر",
    "headlineEn": "EST Math Lessons & Strategy — Mastering Egyptian Scholastic Tests for University",
    "subheadlineAr": "في اختبارات الدبلومة الأمريكية، السرعة واستخدام ديسموس هما مفتاح الـ 800.",
    "subheadlineEn": "In American Diploma standardized tests, pacing and Desmos mastery unlock the 800.",
    "overviewAr": "يقدم كورس شرح EST Math تدريباً مكثفاً على التعامل مع بنك أسئلة College Board واختبارات EST الرسمية، مع التركيز على استراتيجيات الحل الذكي باستخدام حاسبة ديسموس المدمجة والتخلص من فخاخ الوقت في Module 2 الصعب.",
    "overviewEn": "Our EST Math Lessons & Strategy program delivers deep training on College Board question banks and official EST exams, focusing on Desmos graphical shortcuts, eliminating traps, and mastering hard Module 2 sections.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "Heart of Algebra & Advanced Math",
        "titleEn": "Heart of Algebra & Advanced Math",
        "detailsAr": "المعادلات الخطية، الأنظمة، الدوال التربيعية، كثيرات الحدود، والمتباينات.",
        "detailsEn": "Linear systems, quadratic models, complex polynomials, and inequalities."
      },
      {
        "titleAr": "Problem Solving, Data Analysis & Geometry",
        "titleEn": "Problem Solving, Data Analysis & Geometry",
        "detailsAr": "النسب، الإحصاء، الاحتمالات، الدوائر، وحساب المثلثات المتقدم.",
        "detailsEn": "Ratios, scatterplots, statistics, circles, and right-triangle trigonometry."
      }
    ],
    "targetAudienceAr": "طلاب الدبلومة الأمريكية في مصر والخليج الراغبون في تحقيق سكور 800 للالتحاق بكليات الهندسة والطب.",
    "targetAudienceEn": "American Diploma students across Egypt and the Gulf striving for an 800 score.",
    "faqs": [
      {
        "questionAr": "كيف تضمن الحصول على سكور 800 في SAT Math؟",
        "questionEn": "How can I ensure an 800 score in SAT Math?",
        "answerAr": "من خلال الخطة الثلاثية: إتقان مفاهيم الجبر والإحصاء، الاحتراف التام لحاسبة ديسموس، وإدارة دفتر أخطاء يومي (Error Log) لعدم تكرار أي خطأ.",
        "answerEn": "Through the 3-pillar method: conceptual mastery, full Desmos fluency, and keeping an active Error Log to eliminate mistakes."
      },
      {
        "questionAr": "ما هو الفرق الأساسي بين SAT و EST و ACT في الماث؟",
        "questionEn": "What is the main difference between SAT, EST, and ACT in Math?",
        "answerAr": "اختبار SAT رقمي بالكامل ويعتمد على ديسموس في جميع الأسئلة، واختبار EST مخصص للجامعات المصرية بفرعي EST 1 و EST 2، بينما يعتمد ACT على 60 سؤالاً في 60 دقيقة بسرعة عالية جداً.",
        "answerEn": "Digital SAT uses Desmos natively; EST is specifically aligned with Egyptian universities; ACT is a high-speed 60-question/60-minute paper test."
      }
    ],
    "relatedSlugs": [
      "sat-math-explanation",
      "how-to-score-800-in-sat-math",
      "difference-between-sat-act-est",
      "spider-math"
    ]
  },
  {
    "id": "act-math-explanation",
    "slug": "act-math-explanation",
    "slugAliases": [
      "شرح-act-math"
    ],
    "category": "american_diploma",
    "categoryNameAr": "الدبلومة الأمريكية (SAT • EST • ACT)",
    "categoryNameEn": "American Diploma (SAT • EST • ACT)",
    "keywordAr": "شرح ACT Math",
    "keywordEn": "ACT Math Lessons & Strategy",
    "pageTitleAr": "شرح ACT Math | كورس الماث للدبلومة الأمريكية — ميس هبة عياد",
    "pageTitleEn": "ACT Math Lessons & Strategy | American Diploma Math Hub — Miss Heba Ayad",
    "metaDescriptionAr": "كل ما يخص شرح ACT Math: استراتيجيات ديسموس، خطة 800، حل امتحانات سابقة، وأسعار الباقات مع المهندسة هبة عبدالوهاب على سبايدر ماث.",
    "metaDescriptionEn": "Master ACT Math Lessons & Strategy: Desmos shortcuts, 800 blueprints, official question banks, and transparent pricing on Spider Math Platform.",
    "tagsAr": [
      "شرح ACT Math",
      "SAT Math",
      "EST Math",
      "ACT Math",
      "الدبلومة الأمريكية",
      "ديسموس"
    ],
    "tagsEn": [
      "ACT Math Lessons & Strategy",
      "SAT Math",
      "EST Math",
      "ACT Math",
      "American Diploma",
      "Desmos Calculator"
    ],
    "badgeAr": "ACT Math",
    "badgeEn": "ACT Math",
    "headlineAr": "شرح ACT Math — مهارات حل 60 سؤالاً في 60 دقيقة بدقة وسرعة متناهية",
    "headlineEn": "ACT Math Lessons & Strategy — Conquering 60 Questions in 60 Minutes",
    "subheadlineAr": "في اختبارات الدبلومة الأمريكية، السرعة واستخدام ديسموس هما مفتاح الـ 800.",
    "subheadlineEn": "In American Diploma standardized tests, pacing and Desmos mastery unlock the 800.",
    "overviewAr": "يقدم كورس شرح ACT Math تدريباً مكثفاً على التعامل مع بنك أسئلة College Board واختبارات EST الرسمية، مع التركيز على استراتيجيات الحل الذكي باستخدام حاسبة ديسموس المدمجة والتخلص من فخاخ الوقت في Module 2 الصعب.",
    "overviewEn": "Our ACT Math Lessons & Strategy program delivers deep training on College Board question banks and official EST exams, focusing on Desmos graphical shortcuts, eliminating traps, and mastering hard Module 2 sections.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "Heart of Algebra & Advanced Math",
        "titleEn": "Heart of Algebra & Advanced Math",
        "detailsAr": "المعادلات الخطية، الأنظمة، الدوال التربيعية، كثيرات الحدود، والمتباينات.",
        "detailsEn": "Linear systems, quadratic models, complex polynomials, and inequalities."
      },
      {
        "titleAr": "Problem Solving, Data Analysis & Geometry",
        "titleEn": "Problem Solving, Data Analysis & Geometry",
        "detailsAr": "النسب، الإحصاء، الاحتمالات، الدوائر، وحساب المثلثات المتقدم.",
        "detailsEn": "Ratios, scatterplots, statistics, circles, and right-triangle trigonometry."
      }
    ],
    "targetAudienceAr": "طلاب الدبلومة الأمريكية في مصر والخليج الراغبون في تحقيق سكور 800 للالتحاق بكليات الهندسة والطب.",
    "targetAudienceEn": "American Diploma students across Egypt and the Gulf striving for an 800 score.",
    "faqs": [
      {
        "questionAr": "كيف تضمن الحصول على سكور 800 في SAT Math؟",
        "questionEn": "How can I ensure an 800 score in SAT Math?",
        "answerAr": "من خلال الخطة الثلاثية: إتقان مفاهيم الجبر والإحصاء، الاحتراف التام لحاسبة ديسموس، وإدارة دفتر أخطاء يومي (Error Log) لعدم تكرار أي خطأ.",
        "answerEn": "Through the 3-pillar method: conceptual mastery, full Desmos fluency, and keeping an active Error Log to eliminate mistakes."
      },
      {
        "questionAr": "ما هو الفرق الأساسي بين SAT و EST و ACT في الماث؟",
        "questionEn": "What is the main difference between SAT, EST, and ACT in Math?",
        "answerAr": "اختبار SAT رقمي بالكامل ويعتمد على ديسموس في جميع الأسئلة، واختبار EST مخصص للجامعات المصرية بفرعي EST 1 و EST 2، بينما يعتمد ACT على 60 سؤالاً في 60 دقيقة بسرعة عالية جداً.",
        "answerEn": "Digital SAT uses Desmos natively; EST is specifically aligned with Egyptian universities; ACT is a high-speed 60-question/60-minute paper test."
      }
    ],
    "relatedSlugs": [
      "sat-math-explanation",
      "how-to-score-800-in-sat-math",
      "difference-between-sat-act-est",
      "spider-math"
    ]
  },
  {
    "id": "difference-between-sat-act-est",
    "slug": "difference-between-sat-act-est",
    "slugAliases": [
      "الفرق-بين-sat-و-act-و-est",
      "الفرق-بين-sat-و-est"
    ],
    "category": "american_diploma",
    "categoryNameAr": "الدبلومة الأمريكية (SAT • EST • ACT)",
    "categoryNameEn": "American Diploma (SAT • EST • ACT)",
    "keywordAr": "الفرق بين SAT و ACT و EST",
    "keywordEn": "Difference Between SAT, ACT, and EST",
    "pageTitleAr": "الفرق بين SAT و ACT و EST | كورس الماث للدبلومة الأمريكية — ميس هبة عياد",
    "pageTitleEn": "Difference Between SAT, ACT, and EST | American Diploma Math Hub — Miss Heba Ayad",
    "metaDescriptionAr": "كل ما يخص الفرق بين SAT و ACT و EST: استراتيجيات ديسموس، خطة 800، حل امتحانات سابقة، وأسعار الباقات مع المهندسة هبة عبدالوهاب على سبايدر ماث.",
    "metaDescriptionEn": "Master Difference Between SAT, ACT, and EST: Desmos shortcuts, 800 blueprints, official question banks, and transparent pricing on Spider Math Platform.",
    "tagsAr": [
      "الفرق بين SAT و ACT و EST",
      "SAT Math",
      "EST Math",
      "ACT Math",
      "الدبلومة الأمريكية",
      "ديسموس"
    ],
    "tagsEn": [
      "Difference Between SAT, ACT, and EST",
      "SAT Math",
      "EST Math",
      "ACT Math",
      "American Diploma",
      "Desmos Calculator"
    ],
    "badgeAr": "دليل المقارنة الشامل",
    "badgeEn": "Standardized Tests Guide",
    "headlineAr": "الفرق بين SAT و ACT و EST — مقارنة شاملة في الصيغة وعدد الأسئلة والقبول الجامعي",
    "headlineEn": "Difference Between SAT, ACT, and EST — Complete Comparative Analysis",
    "subheadlineAr": "في اختبارات الدبلومة الأمريكية، السرعة واستخدام ديسموس هما مفتاح الـ 800.",
    "subheadlineEn": "In American Diploma standardized tests, pacing and Desmos mastery unlock the 800.",
    "overviewAr": "يقدم كورس الفرق بين SAT و ACT و EST تدريباً مكثفاً على التعامل مع بنك أسئلة College Board واختبارات EST الرسمية، مع التركيز على استراتيجيات الحل الذكي باستخدام حاسبة ديسموس المدمجة والتخلص من فخاخ الوقت في Module 2 الصعب.",
    "overviewEn": "Our Difference Between SAT, ACT, and EST program delivers deep training on College Board question banks and official EST exams, focusing on Desmos graphical shortcuts, eliminating traps, and mastering hard Module 2 sections.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "Heart of Algebra & Advanced Math",
        "titleEn": "Heart of Algebra & Advanced Math",
        "detailsAr": "المعادلات الخطية، الأنظمة، الدوال التربيعية، كثيرات الحدود، والمتباينات.",
        "detailsEn": "Linear systems, quadratic models, complex polynomials, and inequalities."
      },
      {
        "titleAr": "Problem Solving, Data Analysis & Geometry",
        "titleEn": "Problem Solving, Data Analysis & Geometry",
        "detailsAr": "النسب، الإحصاء، الاحتمالات، الدوائر، وحساب المثلثات المتقدم.",
        "detailsEn": "Ratios, scatterplots, statistics, circles, and right-triangle trigonometry."
      }
    ],
    "targetAudienceAr": "طلاب الدبلومة الأمريكية في مصر والخليج الراغبون في تحقيق سكور 800 للالتحاق بكليات الهندسة والطب.",
    "targetAudienceEn": "American Diploma students across Egypt and the Gulf striving for an 800 score.",
    "faqs": [
      {
        "questionAr": "كيف تضمن الحصول على سكور 800 في SAT Math؟",
        "questionEn": "How can I ensure an 800 score in SAT Math?",
        "answerAr": "من خلال الخطة الثلاثية: إتقان مفاهيم الجبر والإحصاء، الاحتراف التام لحاسبة ديسموس، وإدارة دفتر أخطاء يومي (Error Log) لعدم تكرار أي خطأ.",
        "answerEn": "Through the 3-pillar method: conceptual mastery, full Desmos fluency, and keeping an active Error Log to eliminate mistakes."
      },
      {
        "questionAr": "ما هو الفرق الأساسي بين SAT و EST و ACT في الماث؟",
        "questionEn": "What is the main difference between SAT, EST, and ACT in Math?",
        "answerAr": "اختبار SAT رقمي بالكامل ويعتمد على ديسموس في جميع الأسئلة، واختبار EST مخصص للجامعات المصرية بفرعي EST 1 و EST 2، بينما يعتمد ACT على 60 سؤالاً في 60 دقيقة بسرعة عالية جداً.",
        "answerEn": "Digital SAT uses Desmos natively; EST is specifically aligned with Egyptian universities; ACT is a high-speed 60-question/60-minute paper test."
      }
    ],
    "relatedSlugs": [
      "sat-math-explanation",
      "how-to-score-800-in-sat-math",
      "difference-between-sat-act-est",
      "spider-math"
    ]
  },
  {
    "id": "american-diploma-math-course-prices",
    "slug": "american-diploma-math-course-prices",
    "slugAliases": [
      "اسعار-كورس-ماث-دبلومة-امريكية"
    ],
    "category": "american_diploma",
    "categoryNameAr": "الدبلومة الأمريكية (SAT • EST • ACT)",
    "categoryNameEn": "American Diploma (SAT • EST • ACT)",
    "keywordAr": "اسعار كورس ماث دبلومة امريكية",
    "keywordEn": "American Diploma Math Course Pricing",
    "pageTitleAr": "اسعار كورس ماث دبلومة امريكية | كورس الماث للدبلومة الأمريكية — ميس هبة عياد",
    "pageTitleEn": "American Diploma Math Course Pricing | American Diploma Math Hub — Miss Heba Ayad",
    "metaDescriptionAr": "كل ما يخص اسعار كورس ماث دبلومة امريكية: استراتيجيات ديسموس، خطة 800، حل امتحانات سابقة، وأسعار الباقات مع المهندسة هبة عبدالوهاب على سبايدر ماث.",
    "metaDescriptionEn": "Master American Diploma Math Course Pricing: Desmos shortcuts, 800 blueprints, official question banks, and transparent pricing on Spider Math Platform.",
    "tagsAr": [
      "اسعار كورس ماث دبلومة امريكية",
      "SAT Math",
      "EST Math",
      "ACT Math",
      "الدبلومة الأمريكية",
      "ديسموس"
    ],
    "tagsEn": [
      "American Diploma Math Course Pricing",
      "SAT Math",
      "EST Math",
      "ACT Math",
      "American Diploma",
      "Desmos Calculator"
    ],
    "badgeAr": "الأسعار والباقات",
    "badgeEn": "Pricing & Offers",
    "headlineAr": "اسعار كورس ماث دبلومة امريكية — باقات موفرة لكورسات SAT و EST و ACT مع تجربة مجانية",
    "headlineEn": "American Diploma Math Course Pricing — Flexible Plans for SAT, EST & ACT",
    "subheadlineAr": "في اختبارات الدبلومة الأمريكية، السرعة واستخدام ديسموس هما مفتاح الـ 800.",
    "subheadlineEn": "In American Diploma standardized tests, pacing and Desmos mastery unlock the 800.",
    "overviewAr": "يقدم كورس اسعار كورس ماث دبلومة امريكية تدريباً مكثفاً على التعامل مع بنك أسئلة College Board واختبارات EST الرسمية، مع التركيز على استراتيجيات الحل الذكي باستخدام حاسبة ديسموس المدمجة والتخلص من فخاخ الوقت في Module 2 الصعب.",
    "overviewEn": "Our American Diploma Math Course Pricing program delivers deep training on College Board question banks and official EST exams, focusing on Desmos graphical shortcuts, eliminating traps, and mastering hard Module 2 sections.",
    "features": [
      {
        "titleAr": "شرح مفهوم ومبسط",
        "titleEn": "Conceptual Clarity",
        "descAr": "تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.",
        "descEn": "Visual, step-by-step breakdowns of the most demanding mathematical concepts.",
        "icon": "sparkles"
      },
      {
        "titleAr": "حاسبة ديسموس Desmos",
        "titleEn": "Desmos Speed Mastery",
        "descAr": "تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.",
        "descEn": "Speed-solving graphical tactics that save more than half the test time.",
        "icon": "calculator"
      },
      {
        "titleAr": "امتحان تحديد مستوى",
        "titleEn": "Diagnostic Placement",
        "descAr": "تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.",
        "descEn": "Instant smart diagnostic assessment highlighting strengths and weaknesses.",
        "icon": "target"
      },
      {
        "titleAr": "متابعة ودعم مستمر",
        "titleEn": "Direct Mentor Support",
        "descAr": "تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.",
        "descEn": "Continuous doubt clearing, detailed feedback, and parent monitoring reports.",
        "icon": "shield"
      }
    ],
    "syllabus": [
      {
        "titleAr": "Heart of Algebra & Advanced Math",
        "titleEn": "Heart of Algebra & Advanced Math",
        "detailsAr": "المعادلات الخطية، الأنظمة، الدوال التربيعية، كثيرات الحدود، والمتباينات.",
        "detailsEn": "Linear systems, quadratic models, complex polynomials, and inequalities."
      },
      {
        "titleAr": "Problem Solving, Data Analysis & Geometry",
        "titleEn": "Problem Solving, Data Analysis & Geometry",
        "detailsAr": "النسب، الإحصاء، الاحتمالات، الدوائر، وحساب المثلثات المتقدم.",
        "detailsEn": "Ratios, scatterplots, statistics, circles, and right-triangle trigonometry."
      }
    ],
    "targetAudienceAr": "طلاب الدبلومة الأمريكية في مصر والخليج الراغبون في تحقيق سكور 800 للالتحاق بكليات الهندسة والطب.",
    "targetAudienceEn": "American Diploma students across Egypt and the Gulf striving for an 800 score.",
    "faqs": [
      {
        "questionAr": "كيف تضمن الحصول على سكور 800 في SAT Math؟",
        "questionEn": "How can I ensure an 800 score in SAT Math?",
        "answerAr": "من خلال الخطة الثلاثية: إتقان مفاهيم الجبر والإحصاء، الاحتراف التام لحاسبة ديسموس، وإدارة دفتر أخطاء يومي (Error Log) لعدم تكرار أي خطأ.",
        "answerEn": "Through the 3-pillar method: conceptual mastery, full Desmos fluency, and keeping an active Error Log to eliminate mistakes."
      },
      {
        "questionAr": "ما هو الفرق الأساسي بين SAT و EST و ACT في الماث؟",
        "questionEn": "What is the main difference between SAT, EST, and ACT in Math?",
        "answerAr": "اختبار SAT رقمي بالكامل ويعتمد على ديسموس في جميع الأسئلة، واختبار EST مخصص للجامعات المصرية بفرعي EST 1 و EST 2، بينما يعتمد ACT على 60 سؤالاً في 60 دقيقة بسرعة عالية جداً.",
        "answerEn": "Digital SAT uses Desmos natively; EST is specifically aligned with Egyptian universities; ACT is a high-speed 60-question/60-minute paper test."
      }
    ],
    "relatedSlugs": [
      "sat-math-explanation",
      "how-to-score-800-in-sat-math",
      "difference-between-sat-act-est",
      "spider-math"
    ]
  }
];

/**
 * Normalizes Arabic letters (removes diacritics, normalizes Alef, Ta Marbuta, Alef Maqsura, spaces).
 */
export function normalizeArabicText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove Tashkeel
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ـ+/g, '') // remove Tatweel
    .replace(/عبد\s+/g, 'عبد')
    .trim();
}

/**
 * Normalizes input string to match keyword slug or aliases cleanly.
 */
export function normalizeSlug(raw: string): string {
  try {
    const decoded = decodeURIComponent(raw).trim().toLowerCase();
    const normalizedArabic = normalizeArabicText(decoded);
    return normalizedArabic.replace(/[\s_]+/g, '-');
  } catch {
    const normalizedArabic = normalizeArabicText(raw.trim().toLowerCase());
    return normalizedArabic.replace(/[\s_]+/g, '-');
  }
}

/**
 * Fast lookup finder supporting primary slug, slug aliases, normalized Arabic, and direct translations.
 */
export function findSeoKeywordBySlug(rawSlug: string): ISeoKeywordPage | undefined {
  if (!rawSlug) return undefined;
  const normalized = normalizeSlug(rawSlug);

  return SEO_KEYWORD_PAGES.find((item) => {
    // 1. Direct slug match
    if (item.slug === rawSlug || normalizeSlug(item.slug) === normalized) return true;

    // 2. Slug aliases match
    if (item.slugAliases && item.slugAliases.some((alias) => alias === rawSlug || normalizeSlug(alias) === normalized)) {
      return true;
    }

    // 3. Arabic keyword match
    if (item.keywordAr === rawSlug || normalizeSlug(item.keywordAr) === normalized) {
      return true;
    }

    // 4. English keyword match
    if (item.keywordEn.toLowerCase() === rawSlug.toLowerCase() || normalizeSlug(item.keywordEn) === normalized) {
      return true;
    }

    return false;
  });
}
