import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Master categories definition
const categories = [
  {
    id: 'brand',
    nameAr: 'اسم المنصة',
    nameEn: 'Platform Identity',
    descAr: 'الكلمات المفتاحية الرسمية لمنصة سبايدر ماث التعليمية للرياضيات',
    descEn: 'Official Spider Math Educational Platform brand keywords and identity'
  },
  {
    id: 'teacher',
    nameAr: 'ميس هبه عياد (هبه عبد الوهاب)',
    nameEn: 'Eng. Heba Abdel-Wahab (Heba Ayad)',
    descAr: 'العلامة الشخصية والشروحات المباشرة مع المهندسة هبة عبدالوهاب',
    descEn: 'Personal brand, lectures, and courses by Eng. Heba Abdel-Wahab'
  },
  {
    id: 'baccalaureate',
    nameAr: 'البكالوريا',
    nameEn: 'Baccalaureate Mathematics',
    descAr: 'كورس ومراجعات وامتحانات البكالوريا رياضيات والفرق بينها وبين الثانوية العامة',
    descEn: 'Baccalaureate math curriculum, courses, past papers, and comparative guides'
  },
  {
    id: 'reviews',
    nameAr: 'المراجعات وليالي الامتحان',
    nameEn: 'Final & Night-Before Exam Reviews',
    descAr: 'مراجعات ليلة الامتحان للثانوية العامة والبكالوريا وتالتة إعدادي والملخصات PDF',
    descEn: 'High-yield night-before exam revision, formula summaries, and PDF study guides'
  },
  {
    id: 'grades',
    nameAr: 'الصفوف والمراحل الدراسية',
    nameEn: 'Grade Levels (Primary to Grade 12)',
    descAr: 'شروحات الرياضيات لكافة الصفوف من الرابع الابتدائي حتى تالتة ثانوي و Grade 12',
    descEn: 'Grade-by-grade mathematics lessons covering Primary 4 through Grade 12'
  },
  {
    id: 'curricula',
    nameAr: 'المناهج المختلفة',
    nameEn: 'Educational Curricula',
    descAr: 'المنهج المصري، الأزهر، اللغات، البكالوريا، المنهج السعودي والبريطاني IG',
    descEn: 'Egyptian, Al-Azhar, Language schools, Saudi, and British IGCSE curricula'
  },
  {
    id: 'american_diploma',
    nameAr: 'الدبلومة الأمريكية (SAT • EST • ACT)',
    nameEn: 'American Diploma (SAT • EST • ACT)',
    descAr: 'شرح وكورسات SAT و EST و ACT وكيفية تحقيق 800 في الماث وأسرار حاسبة ديسموس',
    descEn: 'Digital SAT, EST, and ACT Math mastery, 800-score blueprints, and Desmos strategies'
  }
];

function k(
  id, slug, slugAliases, category, keywordAr, keywordEn,
  pageTitleAr, pageTitleEn, metaDescriptionAr, metaDescriptionEn,
  tagsAr, tagsEn, badgeAr, badgeEn,
  headlineAr, headlineEn, subheadlineAr, subheadlineEn,
  overviewAr, overviewEn, features, syllabus,
  targetAudienceAr, targetAudienceEn, faqs, relatedSlugs
) {
  const cat = categories.find((c) => c.id === category);
  return {
    id, slug, slugAliases: slugAliases || [], category,
    categoryNameAr: cat?.nameAr || '', categoryNameEn: cat?.nameEn || '',
    keywordAr, keywordEn, pageTitleAr, pageTitleEn,
    metaDescriptionAr, metaDescriptionEn, tagsAr, tagsEn,
    badgeAr, badgeEn, headlineAr, headlineEn, subheadlineAr, subheadlineEn,
    overviewAr, overviewEn, features, syllabus,
    targetAudienceAr, targetAudienceEn, faqs, relatedSlugs
  };
}

const defaultFeatures = [
  { titleAr: 'شرح مفهوم ومبسط', titleEn: 'Conceptual Clarity', descAr: 'تبسيط أصعب الأفكار والنظريات بخطوات منطقية متسلسلة ورسوم بيانية تفاعلية.', descEn: 'Visual, step-by-step breakdowns of the most demanding mathematical concepts.', icon: 'sparkles' },
  { titleAr: 'حاسبة ديسموس Desmos', titleEn: 'Desmos Speed Mastery', descAr: 'تقنيات وحيل الحل البياني السريع التي توفر أكثر من نصف زمن الامتحان.', descEn: 'Speed-solving graphical tactics that save more than half the test time.', icon: 'calculator' },
  { titleAr: 'امتحان تحديد مستوى', titleEn: 'Diagnostic Placement', descAr: 'تقييم فوري وتحليلي لتحديد مستواك الحقيقي ونقاط القوة والضعف بدقة.', descEn: 'Instant smart diagnostic assessment highlighting strengths and weaknesses.', icon: 'target' },
  { titleAr: 'متابعة ودعم مستمر', titleEn: 'Direct Mentor Support', descAr: 'تواصل مباشر لحل أي استفسار وتصحيح تفصيلي للواجبات والامتحانات الدورية.', descEn: 'Continuous doubt clearing, detailed feedback, and parent monitoring reports.', icon: 'shield' }
];

const list = [];

// =========================================================================
// Category 1: اسم المنصة بالعربي والإنجليش (8 items)
// =========================================================================
list.push(
  k('spider-math-ar', 'spider-math', ['سبايدر-ماث', 'spider-math-arabic'], 'brand',
    'سبايدر ماث', 'Spider Math',
    'سبايدر ماث | أقوى منصة لشرح الرياضيات والماث اونلاين — ميس هبة عياد',
    'Spider Math | Premier Mathematics Learning Platform — Eng. Heba Ayad',
    'منصة سبايدر ماث التعليمية الرائدة في تدريس الرياضيات والماث للثانوية العامة والدبلومة الأمريكية والبكالوريا بإشراف المهندسة هبة عبدالوهاب.',
    'Spider Math educational platform: top-tier mathematics courses for American Diploma (SAT/EST), Baccalaureate, Thanaweya Amma, and IGCSE by Eng. Heba Abdel-Wahab.',
    ['سبايدر ماث', 'منصة سبايدر ماث', 'هبه عياد', 'رياضيات اونلاين'], ['Spider Math', 'Math Platform', 'Heba Ayad', 'Online Math'],
    'المنصة الرسمية', 'Official Platform',
    'منصة سبايدر ماث — رحلتك نحو الدرجة النهائية في الرياضيات',
    'Spider Math Platform — Your Fast Track to Mathematics Mastery',
    'نظام تعليمي متكامل يجمع بين الشرح المفاهيمي المبسط وتدريبات الذكاء الاصطناعي واستراتيجيات حاسبة ديسموس المتطورة.',
    'An advanced educational ecosystem combining conceptual depth, interactive question banks, and Desmos calculator speed mastery.',
    'تأسست منصة سبايدر ماث لتكون الوجهة الأولى للطلاب الطامحين للتفوق الرياضي من خلال شروحات تفاعلية وبنوك أسئلة متجددة وامتحانات دورية بإشراف المهندسة هبة عبدالوهاب.',
    'Spider Math Platform turns mathematics from a challenging subject into a competitive advantage through state-of-the-art interactive teaching tools.',
    defaultFeatures,
    [
      { titleAr: 'الدبلومة الأمريكية (Digital SAT • EST • ACT)', titleEn: 'American Diploma (SAT • EST • ACT)', detailsAr: 'تغطية شاملة لجميع محاور الجبر والإحصاء والهندسة مع حل آلاف الأسئلة.', detailsEn: 'Comprehensive prep for Heart of Algebra, Advanced Math, and Geometry.' },
      { titleAr: 'البكالوريا والثانوية العامة', titleEn: 'Baccalaureate & Thanaweya Amma', detailsAr: 'تفاضل، تكامل، جبر، هندسة فراغية، واستاتيكا وديناميكا بأعلى المعايير.', detailsEn: 'Calculus, Algebra, Solid Geometry, and Mechanics aligned with exam blueprints.' }
    ],
    'طلاب الثانوية العامة، البكالوريا، والدبلومة الأمريكية الراغبين في التفوق الأكاديمي.',
    'High school, Baccalaureate, and American Diploma students aiming for maximum exam scores.',
    [
      { questionAr: 'ما هي طرق الدفع والاشتراك المتاحة؟', questionEn: 'What payment and subscription methods are supported?', answerAr: 'نوفر الدفع عبر فودافون كاش، محافظ الهاتف، البطاقات الائتمانية وفوري مع تفعيل فوري للاشتراك.', answerEn: 'We support Vodafone Cash, mobile wallets, credit cards, and Fawry with immediate access.' },
      { questionAr: 'هل المحتوى متوافق مع المدارس اللغات والعربي؟', questionEn: 'Is the content suitable for both Language and Arabic schools?', answerAr: 'نعم، نوفر مسارات منفصلة لشرح الماث باللغة الإنجليزية وشرح الرياضيات باللغة العربية مع توضيح المصطلحات.', answerEn: 'Yes! We offer distinct tracks for English Math and Arabic Mathematics with clear terminology.' }
    ],
    ['spider-math-platform', 'heba-ayad', 'sat-math-explanation', 'baccalaureate-math-explanation']
  ),

  k('spider-math-en', 'spider-math-en', ['spider-math-english', 'spider-math-global'], 'brand',
    'Spider Math', 'Spider Math (Global)',
    'Spider Math | Premier Mathematics Learning Academy — Eng. Heba Ayad',
    'Spider Math | Premier Mathematics Learning Academy — Eng. Heba Ayad',
    'Spider Math Academy delivers top-tier mathematics courses for SAT, EST, ACT, and IGCSE students led by Eng. Heba Abdel-Wahab.',
    'Spider Math Academy delivers top-tier mathematics courses for SAT, EST, ACT, and IGCSE students led by Eng. Heba Abdel-Wahab.',
    ['Spider Math', 'Math Academy', 'Digital SAT', 'IGCSE Math'], ['Spider Math', 'Math Academy', 'Digital SAT', 'IGCSE Math'],
    'Global Academy', 'Global Academy',
    'Spider Math — World-Class Mathematics Instruction',
    'Spider Math — World-Class Mathematics Instruction',
    'Empowering international and bilingual students with high-impact strategies, Desmos hacks, and deep conceptual clarity.',
    'Empowering international and bilingual students with high-impact strategies, Desmos hacks, and deep conceptual clarity.',
    'Spider Math provides world-class mathematical coaching designed for students preparing for standardized international exams and competitive university entrance assessments.',
    'Spider Math provides world-class mathematical coaching designed for students preparing for standardized international exams and competitive university entrance assessments.',
    defaultFeatures,
    [
      { titleAr: 'Digital SAT & EST Modules', titleEn: 'Digital SAT & EST Modules', detailsAr: 'تغطية مكثفة للجبر والدوال وحيل الرسوم البيانية.', detailsEn: 'Intensive drills on functions, coordinate geometry, and polynomials.' }
    ],
    'Students in American and British international diploma tracks aiming for top university admissions.',
    'Students in American and British international diploma tracks aiming for top university admissions.',
    [
      { questionAr: 'Are the practice tests timed?', questionEn: 'Are the practice tests timed?', answerAr: 'نعم، تحاكي الاختبارات نفس التوقيت ونظام واجهة الامتحان الحقيقي.', answerEn: 'Yes, practice exams replicate exact official testing interface and timing conditions.' }
    ],
    ['spider-math', 'spidermath', 'sat-math-explanation', 'heba-ayad-sat-math']
  ),

  k('spidermath', 'spidermath', ['spidermath-portal', 'spidermath-hub'], 'brand',
    'SpiderMath', 'SpiderMath Hub',
    'SpiderMath | المنصة التفاعلية للرياضيات — المهندسة هبة عبدالوهاب',
    'SpiderMath | Interactive Mathematics Learning Hub — Eng. Heba Abdel-Wahab',
    'تعرف على SpiderMath، المنصة الرقمية الذكية لدراسة الرياضيات والماث بأحدث الوسائل التفاعلية مع ميس هبة عياد.',
    'Explore SpiderMath: the smart interactive hub for mastering high school and standardized mathematics.',
    ['SpiderMath', 'سبايدر ماث', 'تعليم رياضيات', 'هبه عياد'], ['SpiderMath', 'Math EdTech', 'Heba Ayad'],
    'المنظومة الذكية', 'Smart Ecosystem',
    'SpiderMath — حيث تجتمع التكنولوجيا بحب الرياضيات',
    'SpiderMath — Where Technology Meets Mathematical Passion',
    'بيئة تعلم ذكية مرنة تمنحك الثقة الكاملة لحل أصعب المسائل بأساليب غير تقليدية.',
    'A smart flexible learning environment empowering you to solve the toughest math problems effortlessly.',
    'SpiderMath تجمع بين المحاضرات المسجلة فائقة الجودة وبنك التمارين التفاعلي لتقديم تجربة تعليمية متميزة لكل طالب.',
    'SpiderMath blends high-production video lectures with interactive worksheets for a transformative study journey.',
    defaultFeatures,
    [
      { titleAr: 'الجبر والهندسة التحليلية', titleEn: 'Algebra & Analytic Geometry', detailsAr: 'المعادلات، المتباينات، القطوع المخروطية، والمصفوفات.', detailsEn: 'Linear systems, quadratic models, conic sections, and matrices.' }
    ],
    'طلاب كافة المراحل الباحثين عن نظام دراسي رقمي مريح وفعال.',
    'Students seeking a streamlined, effective digital mathematics journey.',
    [
      { questionAr: 'هل المحتوى متاح على الهاتف والكمبيوتر؟', questionEn: 'Is content accessible on phones and PCs?', answerAr: 'نعم، المنصة تعمل بكفاءة تامة على الهواتف والأجهزة اللوحية وأجهزة الكمبيوتر.', answerEn: 'Yes, SpiderMath is fully responsive across all phones, tablets, and computers.' }
    ],
    ['spider-math', 'spider-math-platform', 'heba-ayad']
  ),

  k('spider-math-platform-ar', 'spider-math-platform-ar', ['منصة-سبايدر-ماث', 'منصة-سبايدر-ماث-التعليمية'], 'brand',
    'منصة سبايدر ماث', 'Spider Math Educational Platform',
    'منصة سبايدر ماث | البوابة التعليمية الأولى للرياضيات في مصر والشرق الأوسط',
    'Spider Math Educational Platform | Leading Middle East Mathematics Portal',
    'منصة سبايدر ماث التعليمية: شروحات كاملة، بنوك أسئلة، ومراجعات ليلة الامتحان مع المهندسة هبة عبدالوهاب (هبه عياد).',
    'Spider Math Educational Platform: complete courses, question banks, and night-before exam reviews by Eng. Heba Abdel-Wahab.',
    ['منصة سبايدر ماث', 'سبايدر ماث', 'رياضيات اون لاين', 'هبه عياد'], ['Spider Math Platform', 'Online Math Portal', 'Heba Ayad'],
    'البوابة التعليمية', 'Educational Portal',
    'منصة سبايدر ماث — دليلك الشامل للدرجة النهائية',
    'Spider Math Platform — Your Complete Roadmap to Top Marks',
    'منظومة تعليمية متكاملة مصممة خصيصاً لطلاب الثانوية العامة والدبلومة الأمريكية والشهادات المعادلة.',
    'A fully-integrated learning management system tailored for Thanaweya Amma and American Diploma candidates.',
    'توفر منصة سبايدر ماث شروحات دقيقة لكل جزيئات المنهج، مع كبسولات مراجعة مركزة واختبارات دورية تصحح إلكترونياً وبشرياً لضمان أفضل النتائج.',
    'Providing in-depth coverage for every syllabus concept paired with bite-sized review capsules and comprehensive mock tests.',
    defaultFeatures,
    [
      { titleAr: 'مسار الثانوية العامة والبكالوريا', titleEn: 'Thanaweya Amma & Baccalaureate Track', detailsAr: 'خطة متكاملة تبدأ من أغسطس وحتى ليلة الامتحان بأعلى معدلات التحصيل.', detailsEn: 'A comprehensive academic roadmap from kickoff to the final exam.' }
    ],
    'الطلاب الذين يبحثون عن متابعة دورية وانضباط دراسي حقيقي.',
    'Students who value disciplined study routines and continuous academic feedback.',
    [
      { questionAr: 'كيف يتم تصحيح الواجبات والامتحانات؟', questionEn: 'How are assignments and tests graded?', answerAr: 'يتم التصحيح آلياً للأسئلة الموضوعية، وتصحيح تفصيلي بواسطة فريق العمل للأسئلة المقالية مع توضيح الخطوات.', answerEn: 'Automated instant grading for MCQs plus manual step-by-step grading for written questions.' }
    ],
    ['spider-math', 'spider-math-platform', 'heba-ayad']
  ),

  k('spider-math-platform', 'spider-math-platform', ['منصة-spider-math', 'spider-math-platform-official'], 'brand',
    'منصة Spider Math', 'Platform Spider Math',
    'منصة Spider Math | المنصة الأكاديمية الأولى للتفوق الرياضي',
    'Platform Spider Math | The Academic Standard in Mathematics',
    'انضم إلى منصة Spider Math واستمتع بتجربة تعلم فريدة تضمن لك التفوق في الرياضيات بمناهجها المختلفة.',
    'Join Platform Spider Math for an unparalleled online learning experience with guaranteed math score enhancements.',
    ['منصة Spider Math', 'Spider Math Platform', 'هبه عياد'], ['Platform Spider Math', 'Spider Math', 'Online Education'],
    'الأكاديمية الرقمية', 'Digital Academy',
    'منصة Spider Math — التميز في الرياضيات يبدأ من هنا',
    'Platform Spider Math — Mathematics Excellence Starts Here',
    'شروحات ذكية تجمع بين عمق التأسيس وسرعة الحل في الامتحانات الرسمية.',
    'Smart pedagogy uniting rock-solid conceptual foundations with rapid exam execution.',
    'تقدم منصة Spider Math محتوى أكاديمياً عالي الجودة معداً خصيصاً لتمكين الطلاب من استيعاب المفاهيم المجردة وتحويلها إلى مهارة عملية وسرعة في الإجابة.',
    'Delivering elite educational resources designed to transform abstract mathematical theory into rapid problem-solving fluency.',
    defaultFeatures,
    [
      { titleAr: 'المناهج المصرية والدولية', titleEn: 'National & International Syllabi', detailsAr: 'تغطية شاملة لمناهج اللغات والعربي والدبلومة الأمريكية.', detailsEn: 'Complete coverage for National, Bilingual, and American Diploma streams.' }
    ],
    'طلاب جميع المناهج الراغبون في التفوق التام.',
    'All students aspiring toward total mathematical mastery.',
    [
      { questionAr: 'هل يتوفر اشتراك شهري أم ترم كامل؟', questionEn: 'Are monthly or full-semester packages available?', answerAr: 'نوفر باقات شهرية مرنة وباقات ترم وسنة كاملة مع خصومات خاصة.', answerEn: 'We offer flexible monthly subscriptions as well as discounted term and full-year packages.' }
    ],
    ['spider-math', 'spider-math-platform-ar', 'heba-ayad']
  ),

  k('spider-math-for-mathematics-ar', 'spider-math-for-mathematics-ar', ['سبايدر-ماث-للرياضيات', 'سبايدر-ماث-رياضيات'], 'brand',
    'سبايدر ماث للرياضيات', 'Spider Math for Mathematics (Arabic)',
    'سبايدر ماث للرياضيات | التخصص الأكاديمي والاحتراف مع ميس هبة عياد',
    'Spider Math for Mathematics | Academic Specialization — Miss Heba Ayad',
    'سبايدر ماث للرياضيات: الوجهة المتخصصة لطلاب الإعدادي والثانوي والدبلومة الأمريكية لتحقيق الدرجة النهائية مع ميس هبة عياد.',
    'Spider Math for Mathematics: the specialized destination for Prep, Secondary, and American Diploma students.',
    ['سبايدر ماث للرياضيات', 'رياضيات', 'هبه عياد', 'ماث'], ['Spider Math for Mathematics', 'Math Tutoring', 'Heba Ayad'],
    'التخصص الأكاديمي', 'Academic Specialization',
    'سبايدر ماث للرياضيات — لأن الرياضيات تحتاج إلى متخصص',
    'Spider Math for Mathematics — Because Math Requires Dedicated Specialists',
    'تركيز كامل على فروع الرياضيات دون أي تشتيت لنضمن لك التفوق المطلق.',
    'Total dedication to mathematical sciences with zero distractions for guaranteed excellence.',
    'في سبايدر ماث للرياضيات، نوفر بيئة دراسية متخصصة تركز على تنمية التفكير المنطقي والمهارات الحسابية العليا لتمكين الطالب من حل أي مسألة مهما بلغت صعوبتها.',
    'Providing a dedicated mathematics ecosystem focused on higher logical thinking, visual proofs, and advanced algebra.',
    defaultFeatures,
    [
      { titleAr: 'فروع الرياضيات البحتة والتطبيقية', titleEn: 'Pure & Applied Mathematics', detailsAr: 'تأصيل علمي دقيق مع تدريب مكثف على المسائل المركبة متعددة الخطوات.', detailsEn: 'Rigorous theoretical foundations paired with multi-step complex problem drills.' }
    ],
    'طلاب شعبة علمي رياضة وطلاب الماث المتقدمين في المدارس الرسمية والخاصة.',
    'High school STEM and Math track students seeking top honors.',
    [
      { questionAr: 'هل تغطي المنصة فرعي الاستاتيكا والديناميكا؟', questionEn: 'Do you cover Statics and Dynamics?', answerAr: 'نعم، المنصة تقدم كورس ميكانيكا متكامل يشمل الشرح النظري، الرسوم التوضيحية، وحل مئات المسائل من بنك المعرفة.', answerEn: 'Yes, we provide full Mechanics courses with animated physics vectors, theory, and hundreds of solved problems.' }
    ],
    ['spider-math', 'spider-math-for-mathematics', 'calculus-differentiation-night-exam-revision']
  ),

  k('spider-math-for-mathematics', 'spider-math-for-mathematics', ['spider-math-للرياضيات', 'spider-math-mathematics-portal'], 'brand',
    'Spider Math للرياضيات', 'Spider Math for Mathematics',
    'Spider Math للرياضيات | التميز الأكاديمي والشرح المتقدم — ميس هبة عياد',
    'Spider Math for Mathematics | Advanced Academic Tutoring — Miss Heba Ayad',
    'تعرف على Spider Math للرياضيات: كورسات تفاعلية، شروحات ديسموس، ومراجعات حصرية للدبلومة الأمريكية والثانوية العامة.',
    'Discover Spider Math for Mathematics: interactive courses, Desmos mastery, and exclusive exam prep.',
    ['Spider Math للرياضيات', 'ماث', 'رياضيات', 'هبه عياد'], ['Spider Math for Mathematics', 'Math Prep', 'Heba Ayad'],
    'Advanced Math', 'Advanced Math',
    'Spider Math للرياضيات — رحلتك نحو التميز الأكاديمي',
    'Spider Math for Mathematics — Your Journey to Academic Honors',
    'استراتيجيات ذكية ومناهج شاملة تضمن لك أعلى الدرجات في اختبارات الرياضيات والماث.',
    'Smart strategies and comprehensive curricula ensuring top scores in all math tests.',
    'تم تصميم مساقات Spider Math للرياضيات لتواكب أحدث المعايير الدولية والوطنية، موفرة للطالب كل الأدوات اللازمة للفهم والتدريب والتقييم المستمر.',
    'Engineered to match national and international standards, equipping students with rigorous practice, diagnostics, and reviews.',
    defaultFeatures,
    [
      { titleAr: 'منهج الماث الدولي والوطني', titleEn: 'Dual International & National Tracks', detailsAr: 'شروحات تناسب طلبة اللغات والدولية بالتفصيل.', detailsEn: 'Tailored explanations for bilingual, IGCSE, and American students.' }
    ],
    'طلاب المدارس اللغات والدولية الطامحون لأعلى التقديرات.',
    'Bilingual and international students aiming for straight A*s and 800 scores.',
    [
      { questionAr: 'هل هناك حصص تدريب على حل المسائل في وقت قياسي؟', questionEn: 'Are there speed training sessions?', answerAr: 'نعم، نوفر ورش عمل دورية لتدريب الطلاب على حل 20 مسألة في 20 دقيقة باستخدام استراتيجيات ذكية.', answerEn: 'Yes, we run regular speed-drill workshops training students to tackle 20 problems in 20 minutes.' }
    ],
    ['spider-math', 'spider-math-for-mathematics-ar', 'sat-math-explanation']
  ),

  k('spider-math-brand', 'spider-math-brand', ['سبايدر-ماث-spider-math', 'spider-math-dual-brand'], 'brand',
    'سبايدر ماث - Spider Math', 'Spider Math - سبايدر ماث',
    'سبايدر ماث - Spider Math | العلامة الرائدة في تدريس الرياضيات بالعربي والإنجليزي',
    'Spider Math - سبايدر ماث | The Premier Bilingual Mathematics Brand',
    'سبايدر ماث - Spider Math: المنظومة التعليمية الرائدة بإشراف المهندسة هبة عبدالوهاب لتدريس الرياضيات بالعربي واللغات.',
    'Spider Math: the trusted educational system led by Eng. Heba Abdel-Wahab for Arabic and English math curricula.',
    ['سبايدر ماث - Spider Math', 'سبايدر ماث', 'Spider Math', 'هبه عياد'], ['Spider Math', 'Dual Brand', 'Math Tutoring'],
    'العلامة المعتمدة', 'Certified Brand',
    'سبايدر ماث - Spider Math — علامة التميز في الرياضيات',
    'Spider Math — The Benchmark of Mathematical Mastery',
    'الاسم الذي اختاره آلاف الطلاب وأولياء الأمور للوصول إلى أعلى المراتب الأكاديمية.',
    'The platform trusted by thousands of ambitious students and parents year after year.',
    'تجمع علامة سبايدر ماث - Spider Math بين هيبة التدريس الأكاديمي وحداثة التقنيات التفاعلية، لتضع بين يديك كل ما يلزم للتميز في الرياضيات من شروحات ومراجعات وامتحانات.',
    'Bridging pedagogical mastery and sleek digital design, Spider Math delivers everything you need to dominate mathematics exams.',
    defaultFeatures,
    [
      { titleAr: 'المنهج الكامل مع المراجعة النهائية', titleEn: 'Comprehensive Curriculum & Revisions', detailsAr: 'تغطية متوازنة على مدار العام تنتهي بمعسكرات المراجعة وليالي الامتحان.', detailsEn: 'A balanced yearly schedule capped with high-intensity night-before exam bootcamps.' }
    ],
    'كل طالب يبحث عن تجربة تعليمية تجمع بين متعة التعلم وضمان النتيجة.',
    'Every student seeking joyful learning coupled with guaranteed exam excellence.',
    [
      { questionAr: 'كيف أتواصل مع الدعم الفني أو خدمة العملاء؟', questionEn: 'How do I reach technical support or customer care?', answerAr: 'فريق الدعم الفني متاح على مدار الساعة عبر الواتساب والتيليجرام لمساعدتك في أي استفسار تقني أو أكاديمي.', answerEn: 'Our support team is available 24/7 via WhatsApp and Telegram to assist you with any tech or academic inquiry.' }
    ],
    ['spider-math', 'spider-math-platform', 'heba-ayad']
  )
);

// =========================================================================
// Category 2: اسمي - Teacher Identity & Personal Brand (24 items)
// =========================================================================
const teacherItems = [
  { slug: 'heba-ayad', alias: ['هبه-عياد'], ar: 'هبه عياد', en: 'Heba Ayad', badgeAr: 'معلمة الرياضيات', badgeEn: 'Senior Lecturer', headlineAr: 'هبه عياد — خبرة هندسية وأسلوب مبسط في شرح أصعب فروع الرياضيات', headlineEn: 'Heba Ayad — Engineering Expertise & Intuitive Math Instruction' },
  { slug: 'heba-abdelwahab', alias: ['هبه-عبد-الوهاب', 'هبه-عبدالوهاب'], ar: 'هبه عبد الوهاب', en: 'Heba Abdelwahab', badgeAr: 'المهندسة المحاضرة', badgeEn: 'Lead Instructor', headlineAr: 'المهندسة هبه عبد الوهاب — مؤسسة منصة سبايدر ماث التعليمية', headlineEn: 'Eng. Heba Abdelwahab — Founder of Spider Math Educational Platform' },
  { slug: 'hebaayad', alias: ['hebaayad-name'], ar: 'Hebaayad', en: 'Hebaayad Brand', badgeAr: 'العلامة الشخصية', badgeEn: 'Personal Brand', headlineAr: 'Hebaayad — الاسم الأبرز في تدريس الماث للدبلومة الأمريكية والثانوية العامة', headlineEn: 'Hebaayad — The Leading Brand in High-Stakes Standardized Math' },
  { slug: 'heba-ayad-en', alias: ['heba-ayad-english'], ar: 'Heba Ayad', en: 'Heba Ayad (English)', badgeAr: 'Math Specialist', badgeEn: 'Math Specialist', headlineAr: 'Heba Ayad — Master Standardized Tests with Proven Strategies', headlineEn: 'Heba Ayad — Master Standardized Tests with Proven Strategies' },
  { slug: 'heba-abdelwahab-en', alias: ['heba-abdelwahab-english'], ar: 'Heba Abdelwahab', en: 'Heba Abdelwahab (English)', badgeAr: 'Executive Educator', badgeEn: 'Executive Educator', headlineAr: 'Heba Abdelwahab — Transforming Mathematics Education Through Technology', headlineEn: 'Heba Abdelwahab — Transforming Mathematics Education Through Technology' },
  { slug: 'heba-abdelwahab-lowercase', alias: ['heba-abdelwahab-lower'], ar: 'Heba abdelwahab', en: 'Heba abdelwahab Portal', badgeAr: 'أكاديمية هبة', badgeEn: 'Heba Academy', headlineAr: 'Heba abdelwahab — كورسات تفاعلية وتمارين مكثفة لجميع المراحل', headlineEn: 'Heba abdelwahab — Interactive Courses & Intensive Drills for All Stages' },
  { slug: 'miss-heba-ayad', alias: ['ميس-هبه-عياد', 'مس-هبه-عياد'], ar: 'ميس هبه عياد', en: 'Miss Heba Ayad', badgeAr: 'ميس الرياضيات', badgeEn: 'Beloved Teacher', headlineAr: 'ميس هبه عياد — الشرح الممتع والمتابعة الأبوية خطوة بخطوة', headlineEn: 'Miss Heba Ayad — Engaging Explanations & Dedicated Step-by-Step Mentorship' },
  { slug: 'miss-heba-abdelwahab', alias: ['ميس-هبه-عبد-الوهاب'], ar: 'ميس هبه عبد الوهاب', en: 'Miss Heba Abdelwahab', badgeAr: 'الريادة التعليمية', badgeEn: 'Master Mentor', headlineAr: 'ميس هبه عبد الوهاب — طريقك الأضمن لتحقيق الدرجات النهائية في الامتحانات', headlineEn: 'Miss Heba Abdelwahab — Your Guaranteed Track to 100% Exam Marks' },
  { slug: 'heba-ayad-mathematics', alias: ['هبه-عياد-رياضيات'], ar: 'هبه عياد رياضيات', en: 'Heba Ayad Mathematics', badgeAr: 'قسم الرياضيات', badgeEn: 'Mathematics Division', headlineAr: 'هبه عياد رياضيات — تدريس معمق لفروع الجبر والتفاضل والميكانيكا', headlineEn: 'Heba Ayad Mathematics — In-Depth Algebra, Calculus, and Mechanics Mastery' },
  { slug: 'heba-ayad-math', alias: ['هبه-عياد-ماث'], ar: 'هبه عياد ماث', en: 'Heba Ayad Math', badgeAr: 'International Math', badgeEn: 'International Math', headlineAr: 'هبه عياد ماث — كورسات اللغات والدبلومة الأمريكية بأحدث أساليب ديسموس', headlineEn: 'Heba Ayad Math — Language Schools & American Diploma Desmos Tactics' },
  { slug: 'mathematics-lessons-with-heba-ayad', alias: ['شرح-رياضيات-مع-هبه-عياد'], ar: 'شرح رياضيات مع هبه عياد', en: 'Mathematics Lessons with Heba Ayad', badgeAr: 'شروحات حصرية', badgeEn: 'Exclusive Lessons', headlineAr: 'شرح رياضيات مع هبه عياد — فهم حقيقي قبل الحفظ وتطبيق عملي مستمر', headlineEn: 'Mathematics Lessons with Heba Ayad — Intuitive Understanding & Continuous Practice' },
  { slug: 'math-lessons-with-heba-ayad', alias: ['شرح-ماث-مع-هبه-عياد'], ar: 'شرح ماث مع هبه عياد', en: 'Math Lessons with Heba Ayad', badgeAr: 'دروس تفاعلية', badgeEn: 'Interactive Sessions', headlineAr: 'شرح ماث مع هبه عياد — اكتشف أسهل الطرق لحل مسائل الماث المعقدة', headlineEn: 'Math Lessons with Heba Ayad — The Easiest Shortcuts for Intricate Math Questions' },
  { slug: 'heba-ayad-mathematics-platform', alias: ['منصة-هبه-عياد-للرياضيات'], ar: 'منصة هبه عياد للرياضيات', en: 'Heba Ayad Mathematics Platform', badgeAr: 'المنصة الرسمية', badgeEn: 'Official Portal', headlineAr: 'منصة هبه عياد للرياضيات — كل ما يحتاجه طالب الرياضيات في مكان واحد', headlineEn: 'Heba Ayad Mathematics Platform — Everything a Math Student Needs Under One Roof' },
  { slug: 'heba-ayad-spider-math', alias: ['هبه-عياد-spider-math'], ar: 'هبه عياد Spider Math', en: 'Heba Ayad Spider Math', badgeAr: 'المنظومة المشتركة', badgeEn: 'Unified Ecosystem', headlineAr: 'هبه عياد Spider Math — القوة الأكاديمية المدعومة بأحدث التقنيات الرقمية', headlineEn: 'Heba Ayad Spider Math — Academic Rigor Powered by Advanced EdTech' },
  { slug: 'spider-math-with-heba-ayad', alias: ['spider-math-مع-هبه-عياد'], ar: 'Spider Math مع هبه عياد', en: 'Spider Math with Heba Ayad', badgeAr: 'تجربة التعلم', badgeEn: 'Learning Experience', headlineAr: 'Spider Math مع هبه عياد — تجربة تعليمية فريدة تضمن لك التفوق في الامتحانات', headlineEn: 'Spider Math with Heba Ayad — A Unique Journey Guaranteeing Academic Honors' },
  { slug: 'heba-ayad-math-course', alias: ['كورس-رياضيات-هبه-عياد'], ar: 'كورس رياضيات هبه عياد', en: 'Heba Ayad Mathematics Course', badgeAr: 'الكورس الشامل', badgeEn: 'Comprehensive Course', headlineAr: 'كورس رياضيات هبه عياد — المنهاج المتكامل من التأسيس حتى المراجعة النهائية', headlineEn: 'Heba Ayad Mathematics Course — Complete Roadmap from Basics to Exam Night' },
  { slug: 'heba-ayad-math-revision', alias: ['مراجعة-رياضيات-هبه-عياد'], ar: 'مراجعة رياضيات هبه عياد', en: 'Heba Ayad Mathematics Revision', badgeAr: 'معسكر المراجعة', badgeEn: 'Revision Bootcamp', headlineAr: 'مراجعة رياضيات هبه عياد — كبسولات مركزة وأقوى بنك أسئلة متوقع في الامتحانات', headlineEn: 'Heba Ayad Mathematics Revision — High-Yield Capsules & Predicted Exam Questions' },
  { slug: 'night-exam-revision-with-heba-ayad', alias: ['مراجعة-ليلة-الامتحان-مع-هبه-عياد'], ar: 'مراجعة ليلة الامتحان مع هبه عياد', en: 'Night-Before Exam Revision with Heba Ayad', badgeAr: 'ليلة الامتحان', badgeEn: 'Night-Before Exam', headlineAr: 'مراجعة ليلة الامتحان مع هبه عياد — تثبيت القوانين وحل التريكات الصعبة بثقة', headlineEn: 'Night-Before Exam Revision with Heba Ayad — Formula Mastery & Tough Trick Walkthroughs' },
  { slug: 'heba-ayad-baccalaureate', alias: ['هبه-عياد-بكالوريا'], ar: 'هبه عياد بكالوريا', en: 'Heba Ayad Baccalaureate', badgeAr: 'تخصص البكالوريا', badgeEn: 'Baccalaureate Specialist', headlineAr: 'هبه عياد بكالوريا — إعداد استثنائي لامتحانات البكالوريا وتحقيق أعلى التقديرات', headlineEn: 'Heba Ayad Baccalaureate — Elite Preparation for High-Scoring Baccalaureate Honors' },
  { slug: 'heba-ayad-thanaweya-amma', alias: ['هبه-عياد-ثانوية-عامة'], ar: 'هبه عياد ثانوية عامة', en: 'Heba Ayad Thanaweya Amma', badgeAr: 'أوائل الثانوية', badgeEn: 'Thanaweya Amma Honors', headlineAr: 'هبه عياد ثانوية عامة — صناعة أوائل الجمهورية في الرياضيات البحتة والتطبيقية', headlineEn: 'Heba Ayad Thanaweya Amma — Breeding Top Rankers in Pure and Applied Mathematics' },
  { slug: 'heba-ayad-sat-math', alias: ['هبه-عياد-sat-math'], ar: 'Heba Ayad SAT Math', en: 'Heba Ayad SAT Math Prep', badgeAr: '800 Blueprint', badgeEn: '800 Blueprint', headlineAr: 'Heba Ayad SAT Math — خريطة طريقك نحو سكور 800 في Digital SAT Math', headlineEn: 'Heba Ayad SAT Math — Your Exact Roadmap to an 800 in Digital SAT Math' },
  { slug: 'heba-ayad-est-math', alias: ['هبه-عياد-est-math'], ar: 'Heba Ayad EST Math', en: 'Heba Ayad EST Math Prep', badgeAr: 'EST 1 & 2', badgeEn: 'EST 1 & 2', headlineAr: 'Heba Ayad EST Math — التفوق المضمون في اختبارات EST للقبول الجامعي في مصر', headlineEn: 'Heba Ayad EST Math — Guaranteed Excellence in Egyptian Scholastic Tests (EST)' },
  { slug: 'heba-ayad-sat', alias: ['هبه-عياد-sat'], ar: 'هبه عياد SAT', en: 'Heba Ayad SAT Coaching', badgeAr: 'SAT Mastery', badgeEn: 'SAT Mastery', headlineAr: 'هبه عياد SAT — استراتيجيات ذكية لحل أصعب أقسام الماث في اختبار SAT الدولي', headlineEn: 'Heba Ayad SAT — Smart Strategies for Conquering SAT Math Sections' },
  { slug: 'heba-ayad-est', alias: ['هبه-عياد-est'], ar: 'هبه عياد EST', en: 'Heba Ayad EST Coaching', badgeAr: 'EST Specialist', badgeEn: 'EST Specialist', headlineAr: 'هبه عياد EST — الكورس التأسيسي والمتقدم لطلاب الدبلومة الأمريكية في مصر', headlineEn: 'Heba Ayad EST — Complete Diagnostic and Advanced Program for EST Candidates' }
];

teacherItems.forEach((t) => {
  list.push(
    k(
      t.slug, t.slug, t.alias, 'teacher',
      t.ar, t.en,
      `${t.ar} | شرح الرياضيات والماث اونلاين على منصة سبايدر ماث`,
      `${t.en} | Mathematics & Math Lessons on Spider Math Platform`,
      `تعرف على ${t.ar} وكورسات شرح الرياضيات والماث للدبلومة الأمريكية والبكالوريا والثانوية العامة بأحدث أساليب حاسبة ديسموس.`,
      `Learn with ${t.en} on Spider Math Platform: advanced mathematics prep for American Diploma, Baccalaureate, and Thanaweya Amma.`,
      [t.ar, 'هبه عياد', 'هبه عبد الوهاب', 'سبايدر ماث', 'شرح رياضيات'],
      [t.en, 'Heba Ayad', 'Heba Abdel-Wahab', 'Spider Math', 'Math Tutor'],
      t.badgeAr, t.badgeEn,
      t.headlineAr, t.headlineEn,
      'المهندسة هبة عبدالوهاب تضع بين يديك خلاصة خبرتها الأكاديمية لتبسيط أكثر المفاهيم الرياضية تعقيداً.',
      'Eng. Heba Abdel-Wahab delivers elite academic mastery to transform difficult concepts into effortless solutions.',
      `تقدم ${t.ar} محتوى تعليمياً فريداً يركز على استيعاب الطالب للمنطق الرياضي واستخدام التكنولوجيا الحديثة مثل حاسبة ديسموس والرسوم التفاعلية لضمان الحصول على الدرجات النهائية وتجاوز الامتحانات التنافسية بثقة تامة.`,
      `${t.en} provides a unique pedagogical approach emphasizing logical intuition, Desmos calculator techniques, and continuous personalized feedback to guarantee top honors.`,
      defaultFeatures,
      [
        { titleAr: 'استراتيجيات الشرح والتطبيق', titleEn: 'Pedagogical Framework', detailsAr: 'محاضرات مسجلة عالية الوضوح مع ورش تطبيقية مباشرة وشيتات محلولة.', detailsEn: 'High-definition video lectures paired with live workshops and step-by-step booklets.' },
        { titleAr: 'بنوك الأسئلة والامتحانات الدورية', titleEn: 'Question Banks & Mock Exams', detailsAr: 'تدريب على أحدث نماذج الامتحانات الوزارية والدولية.', detailsEn: 'Simulations matching the latest official ministerial and College Board standards.' }
      ],
      'طلاب المدارس العامة واللغات والدبلومة الأمريكية الراغبون في الشرح المباشر مع ميس هبة.',
      'Students in national, bilingual, and international tracks seeking guidance from Eng. Heba.',
      [
        { questionAr: `كيف يمكنني الاشتراك في كورس ${t.ar}؟`, questionEn: `How do I enroll in ${t.en}'s course?`, answerAr: 'يمكنك التسجيل على المنصة مجاناً واختيار مرحلتك الدراسية ثم تفعيل الكورس فورياً عبر وسائل الدفع الإلكتروني.', answerEn: 'Sign up for free, select your curriculum grade, and instantly activate access using digital payment options.' },
        { questionAr: 'هل يمكن التواصل المباشر مع ميس هبة لطرح الأسئلة؟', questionEn: 'Can students ask Eng. Heba questions directly?', answerAr: 'نعم، المنصة توفر قنوات تيليجرام وواتساب مخصصة ومراجعات لايف أسبوعية للإجابة على جميع الاستفسارات.', answerEn: 'Yes! Dedicated Telegram and WhatsApp channels plus weekly live Q&A sessions ensure direct support.' }
      ],
      ['spider-math', 'heba-ayad', 'sat-math-explanation', 'baccalaureate-math-explanation']
    )
  );
});

// =========================================================================
// Category 3: البكالوريا - Baccalaureate (7 items)
// =========================================================================
const baccalaureateItems = [
  { slug: 'baccalaureate-math-explanation', alias: ['شرح-رياضيات-البكالوريا'], ar: 'شرح رياضيات البكالوريا', en: 'Baccalaureate Math Lessons', badgeAr: 'منهج البكالوريا', badgeEn: 'Baccalaureate Syllabus', headlineAr: 'شرح رياضيات البكالوريا — التفوق في التحليل الرياضي والجبر والهندسة', headlineEn: 'Baccalaureate Mathematics Lessons — Analytical & Algebraic Excellence' },
  { slug: 'baccalaureate-math-online-course', alias: ['كورس-رياضيات-البكالوريا-اون-لاين'], ar: 'كورس رياضيات البكالوريا اون لاين', en: 'Online Baccalaureate Math Course', badgeAr: 'كورس اونلاين', badgeEn: 'Online Course', headlineAr: 'كورس رياضيات البكالوريا اون لاين — دراسة مرنة وشاملة من منزلك مع ميس هبة', headlineEn: 'Online Baccalaureate Math Course — Flexible & Comprehensive Study at Home' },
  { slug: '1st-year-baccalaureate-math', alias: ['شرح-رياضيات-اولى-بكالوريا'], ar: 'شرح رياضيات اولى بكالوريا', en: '1st Year Baccalaureate Math', badgeAr: 'أولى بكالوريا', badgeEn: '1st Year Baccalaureate', headlineAr: 'شرح رياضيات اولى بكالوريا — التأسيس المتين في الدوال والمتتاليات والمنطق', headlineEn: '1st Year Baccalaureate Math — Strong Foundations in Functions & Sequences' },
  { slug: '2nd-year-baccalaureate-math', alias: ['شرح-رياضيات-تانية-بكالوريا'], ar: 'شرح رياضيات تانية بكالوريا', en: '2nd Year Baccalaureate Math', badgeAr: 'تانية بكالوريا', badgeEn: '2nd Year Baccalaureate', headlineAr: 'شرح رياضيات تانية بكالوريا — سنة التخرج والتحصيل العالي نحو كليات القمة', headlineEn: '2nd Year Baccalaureate Math — Senior Year Mastery for Top University Admissions' },
  { slug: 'solved-baccalaureate-math-exams', alias: ['امتحانات-البكالوريا-رياضيات-محلولة'], ar: 'امتحانات البكالوريا رياضيات محلولة', en: 'Solved Baccalaureate Math Exams', badgeAr: 'امتحانات محلولة', badgeEn: 'Solved Past Papers', headlineAr: 'امتحانات البكالوريا رياضيات محلولة — نماذج امتحانات رسمية بالحل النموذجي والخطوات', headlineEn: 'Solved Baccalaureate Math Exams — Official Past Papers with Step-by-Step Keys' },
  { slug: 'baccalaureate-math-course-prices', alias: ['اسعار-كورس-البكالوريا-رياضيات'], ar: 'اسعار كورس البكالوريا رياضيات', en: 'Baccalaureate Math Course Pricing', badgeAr: 'الباقات والأسعار', badgeEn: 'Pricing & Packages', headlineAr: 'اسعار كورس البكالوريا رياضيات — باقات شهرية وفصلية مرنة تناسب جميع الطلاب', headlineEn: 'Baccalaureate Math Course Pricing — Flexible Monthly & Semester Plans' },
  { slug: 'difference-baccalaureate-and-thanaweya-amma', alias: ['الفرق-بين-البكالوريا-والثانوية-العامة'], ar: 'الفرق بين البكالوريا والثانوية العامة', en: 'Difference Baccalaureate vs Thanaweya Amma', badgeAr: 'دليل المقارنة', badgeEn: 'Comparison Guide', headlineAr: 'الفرق بين البكالوريا والثانوية العامة — مقارنة شاملة للمناهج ونظام التقييم والقبول', headlineEn: 'Difference Between Baccalaureate and Thanaweya Amma — In-Depth Analysis' }
];

baccalaureateItems.forEach((b) => {
  list.push(
    k(
      b.slug, b.slug, b.alias, 'baccalaureate',
      b.ar, b.en,
      `${b.ar} | منصة سبايدر ماث التعليمية — ميس هبة عياد`,
      `${b.en} | Spider Math Platform — Eng. Heba Ayad`,
      `دليلك الكامل لـ ${b.ar}: شروحات تفصيلية، حل امتحانات، ومقارنات دقيقة بإشراف المهندسة هبة عبدالوهاب على سبايدر ماث.`,
      `Comprehensive guide to ${b.en}: detailed video lectures, solved mock exams, and complete curriculum breakdowns on Spider Math.`,
      [b.ar, 'رياضيات البكالوريا', 'سبايدر ماث', 'هبه عياد', 'امتحانات بكالوريا'],
      [b.en, 'Baccalaureate Math', 'Spider Math', 'Heba Ayad', 'Past Papers'],
      b.badgeAr, b.badgeEn,
      b.headlineAr, b.headlineEn,
      'منهج البكالوريا يتطلب فهماً رياضياً دقيقاً، وهنا نوفر لك الخطة المتكاملة للتفوق.',
      'The Baccalaureate curriculum demands analytical rigor; we provide the exact blueprint for top marks.',
      `يقدم مسار ${b.ar} على سبايدر ماث شرحاً عميقاً لكل دروس التحليل الرياضي، الاحتمالات، الهندسة الفضائية، والمتتاليات مع حلول مفصلة للامتحانات الوطنية لتأهيلك لأعلى الدرجات.`,
      `Our ${b.en} track offers thorough coverage of calculus, functions, probability, solid geometry, and sequences with official past-exam walkthroughs.`,
      defaultFeatures,
      [
        { titleAr: 'التحليل الرياضي والدوال العددية', titleEn: 'Mathematical Analysis & Functions', detailsAr: 'النهايات، الاتصال، الاشتقاق، الدوال اللوغاريتمية والأسية، وحساب التكامل.', detailsEn: 'Limits, continuity, differentiation, logs & exponentials, and integration.' },
        { titleAr: 'الهندسة الفضائية والأعداد العقدية', titleEn: 'Spatial Geometry & Complex Numbers', detailsAr: 'الجداء السلمي، الفلكة، المستويات في الفضاء، والأعداد المركبة وتطبيقاتها.', detailsEn: 'Dot products, spheres, 3D planes, and complex number operations.' }
      ],
      'طلاب مسار البكالوريا وأولياء أمورهم الباحثين عن شرح معتمد ونتائج مثبتة.',
      'Baccalaureate students and parents seeking proven instruction and top exam outcomes.',
      [
        { questionAr: 'ما الفرق الجوهري بين البكالوريا والثانوية العامة في الرياضيات؟', questionEn: 'What is the main difference between Baccalaureate and Thanaweya Amma math?', answerAr: 'تركز البكالوريا على البراهين الرياضية والتحليل المفاهيمي المتعمق والأعداد العقدية، بينما تعتمد الثانوية العامة أكثر على السرعة والتطبيقات الفيزيائية والميكانيكا.', answerEn: 'Baccalaureate focuses on mathematical proofs, complex numbers, and rigorous analysis, whereas Thanaweya Amma emphasizes speed, applied mechanics, and calculus.' },
        { questionAr: 'هل الكورس يتضمن حل امتحانات الدورات السابقة؟', questionEn: 'Does the course include solved past national exams?', answerAr: 'نعم، يتم حل وتحليل امتحانات آخر 10 سنوات مع سلم التنقيط المعتمد ونماذج الإجابة الرسمية.', answerEn: 'Yes! We solve and analyze the last 10 years of official exams with exact grading rubrics.' }
      ],
      ['baccalaureate-math-explanation', 'difference-baccalaureate-and-thanaweya-amma', 'solved-baccalaureate-math-exams', 'spider-math']
    )
  );
});

// =========================================================================
// Category 4: المراجعات - Final & Night-Before Exam Reviews (8 items)
// =========================================================================
const reviewItems = [
  { slug: 'night-exam-revision-math', alias: ['مراجعة-ليلة-الامتحان-رياضيات'], ar: 'مراجعة ليلة الامتحان رياضيات', en: 'Night-Before Exam Math Revision', badgeAr: 'ليلة الامتحان', badgeEn: 'Night-Before Exam', headlineAr: 'مراجعة ليلة الامتحان رياضيات — خريطة الإنقاذ السريع وتجميع القوانين الهامة', headlineEn: 'Night-Before Exam Math Revision — Rapid Formula Review & Survival Blueprint' },
  { slug: 'baccalaureate-night-exam-math-revision', alias: ['مراجعة-ليلة-الامتحان-رياضيات-البكالوريا'], ar: 'مراجعة ليلة الامتحان رياضيات البكالوريا', en: 'Baccalaureate Night-Before Exam Math', badgeAr: 'مراجعة البكالوريا', badgeEn: 'Baccalaureate Revision', headlineAr: 'مراجعة ليلة الامتحان رياضيات البكالوريا — أهم الأفكار المتوقعة في الامتحان الوطني', headlineEn: 'Baccalaureate Night-Before Exam Math — High-Probability Exam Questions' },
  { slug: 'thanaweya-amma-night-exam-math-revision', alias: ['مراجعة-ليلة-الامتحان-رياضيات-ثانوية-عامة'], ar: 'مراجعة ليلة الامتحان رياضيات ثانوية عامة', en: 'Thanaweya Amma Night-Before Exam Math', badgeAr: 'ليالي الثانوية العامة', badgeEn: 'Thanaweya Amma Nights', headlineAr: 'مراجعة ليلة الامتحان رياضيات ثانوية عامة — مراجعة مركزة لجميع فروع علمي رياضة', headlineEn: 'Thanaweya Amma Night-Before Exam Math — Concentrated Review for All Branches' },
  { slug: 'calculus-differentiation-night-exam-revision', alias: ['مراجعة-ليلة-الامتحان-تفاضل-وتكامل'], ar: 'مراجعة ليلة الامتحان تفاضل وتكامل', en: 'Calculus & Differentiation Exam Night Revision', badgeAr: 'تفاضل وتكامل', badgeEn: 'Calculus Mastery', headlineAr: 'مراجعة ليلة الامتحان تفاضل وتكامل — قوانين الاشتقاق، سلوك الدالة، والتكامل المحدد', headlineEn: 'Calculus & Differentiation Exam Night Revision — Derivatives, Curve Sketching & Integrals' },
  { slug: 'algebra-geometry-night-exam-revision', alias: ['مراجعة-ليلة-الامتحان-جبر-وهندسة'], ar: 'مراجعة ليلة الامتحان جبر وهندسة', en: 'Algebra & Geometry Exam Night Revision', badgeAr: 'جبر وهندسة فراغية', badgeEn: 'Algebra & Solid Geometry', headlineAr: 'مراجعة ليلة الامتحان جبر وهندسة — التباديل، التوافيق، ذات الحدين، ومعادلات الفراغية', headlineEn: 'Algebra & Geometry Exam Night Revision — Permutations, Binomial Theorem & 3D Vectors' },
  { slug: '3rd-prep-night-exam-math-revision', alias: ['مراجعة-ليلة-الامتحان-تالتة-اعدادي'], ar: 'مراجعة ليلة الامتحان تالتة اعدادي', en: '3rd Prep Night-Before Exam Math Revision', badgeAr: 'الشهادة الإعدادية', badgeEn: '3rd Prep Certificate', headlineAr: 'مراجعة ليلة الامتحان تالتة اعدادي رياضيات — ملخص الجبر والإحصاء وحساب المثلثات', headlineEn: '3rd Prep Night-Before Exam Math — Algebra, Statistics & Trigonometry Summary' },
  { slug: 'final-math-comprehensive-revision', alias: ['مراجعة-نهائية-رياضيات'], ar: 'مراجعة نهائية رياضيات', en: 'Comprehensive Final Math Revision', badgeAr: 'المراجعة النهائية', badgeEn: 'Final Comprehensive Revision', headlineAr: 'مراجعة نهائية رياضيات — كبسولات شاملة تغطي المنهج كاملاً بالمسائل النموذجية', headlineEn: 'Comprehensive Final Math Revision — Complete Course Encapsulation with Models' },
  { slug: 'night-exam-math-summary-pdf', alias: ['ملخص-ليلة-الامتحان-رياضيات-pdf'], ar: 'ملخص ليلة الامتحان رياضيات PDF', en: 'Night-Before Exam Math Summary PDF', badgeAr: 'تحميل ملخص PDF', badgeEn: 'Download PDF Notes', headlineAr: 'ملخص ليلة الامتحان رياضيات PDF — حمل مذكرات القوانين المركزة مجاناً بجودة عالية', headlineEn: 'Night-Before Exam Math Summary PDF — Download High-Yield Formula Booklets' }
];

reviewItems.forEach((r) => {
  list.push(
    k(
      r.slug, r.slug, r.alias, 'reviews',
      r.ar, r.en,
      `${r.ar} | ميس هبة عياد — سبايدر ماث`,
      `${r.en} | Miss Heba Ayad — Spider Math`,
      `أقوى ${r.ar}: مراجعة مكثفة، حل تريكات، ملخصات PDF، وأهم التوقعات الامتحانية مع المهندسة هبة عبدالوهاب.`,
      `Ultimate ${r.en}: intensive workshops, tricky problem walkthroughs, PDF cheat sheets, and predicted questions on Spider Math.`,
      [r.ar, 'مراجعة رياضيات', 'ليلة الامتحان', 'هبه عياد', 'ملخص PDF'],
      [r.en, 'Math Revision', 'Night Before Exam', 'Heba Ayad', 'PDF Summary'],
      r.badgeAr, r.badgeEn,
      r.headlineAr, r.headlineEn,
      'الساعات الأخيرة قبل الامتحان هي الحاسمة؛ رتب أفكارك وتدرب على أهم المسائل المتوقعة.',
      'The final hours before the test are decisive; organize your formulas and tackle predicted questions.',
      `صُممت ورشة ${r.ar} لتقدم للطالب شحنة مكثفة من الثقة والمعرفة المركزة: تجميع القوانين في صفحة واحدة، استعراض تريكات الامتحان الأكثر تكراراً، وتدريب عملي على نماذج امتحانية مطابقة لنظام الوزارة.`,
      `Our ${r.en} bootcamp delivers concentrated confidence: one-page formula sheets, most frequent exam traps, and realistic mock exam drills.`,
      defaultFeatures,
      [
        { titleAr: 'كبسولة القوانين والعلاقات الرياضية', titleEn: 'Formula Capsule & Cheat Sheets', detailsAr: 'تجميع ذكي لكل القوانين مع إرشادات متى تستخدم كل قانون.', detailsEn: 'Smart formula compilation with clear criteria for applying each rule.' },
        { titleAr: 'حل الأسئلة الأكثر توقعاً وتكراراً', titleEn: 'High-Probability Exam Problems', detailsAr: 'حل مسائل مستوحاة من الامتحانات التجريبية ونماذج التوجيه.', detailsEn: 'Step-by-step solutions for experimental and ministerial model questions.' }
      ],
      'الطلاب المقبلون على امتحانات نصف العام أو نهاية العام الراغبون في تثبيت معلوماتهم.',
      'Students sitting for midterms or final exams needing high-yield consolidation.',
      [
        { questionAr: `كيف يمكنني تحميل ${r.ar} بصيغة PDF؟`, questionEn: `How do I download ${r.en} in PDF format?`, answerAr: 'الملخص متاح للتحميل المباشر وبشكل مجاني بجودة طباعة فائقة لجميع الطلاب المسجلين بالمنصة.', answerEn: 'The summary is available for direct high-resolution PDF download for all registered students.' },
        { questionAr: 'هل تكفي مراجعة ليلة الامتحان وحدها؟', questionEn: 'Is the night-before revision enough on its own?', answerAr: 'المراجعة مصممة لترتيب أفكارك وتذكيرك بأهم النظريات والتريكات، ويفضل أن تقترن بحل شيتات التدريب المرفقة.', answerEn: 'It organizes your knowledge and highlights high-yield traps; pair it with the attached drill sheets for maximum results.' }
      ],
      ['night-exam-revision-math', 'night-exam-math-summary-pdf', 'final-math-comprehensive-revision', 'spider-math']
    )
  );
});

// =========================================================================
// Category 5: الصفوف - Grade Levels (12 items)
// =========================================================================
const gradeItems = [
  { slug: 'grade-4-primary-math', alias: ['شرح-رياضيات-الصف-الرابع-الابتدائي'], ar: 'شرح رياضيات الصف الرابع الابتدائي', en: 'Grade 4 Primary Math Lessons', badgeAr: 'رابعة ابتدائي', badgeEn: 'Grade 4 Primary', headlineAr: 'شرح رياضيات الصف الرابع الابتدائي — التأسيس السليم في القيمة المكانية والعمليات', headlineEn: 'Grade 4 Primary Math Lessons — Place Value & Core Arithmetic Operations' },
  { slug: 'grade-5-primary-math', alias: ['شرح-رياضيات-الصف-الخامس-الابتدائي'], ar: 'شرح رياضيات الصف الخامس الابتدائي', en: 'Grade 5 Primary Math Lessons', badgeAr: 'خامسة ابتدائي', badgeEn: 'Grade 5 Primary', headlineAr: 'شرح رياضيات الصف الخامس الابتدائي — الكسور والعمليات العشرية والهندسة التأسيسية', headlineEn: 'Grade 5 Primary Math Lessons — Fractions, Decimals & Foundational Geometry' },
  { slug: 'grade-6-primary-math', alias: ['شرح-رياضيات-الصف-السادس-الابتدائي'], ar: 'شرح رياضيات الصف السادس الابتدائي', en: 'Grade 6 Primary Math Lessons', badgeAr: 'ستة ابتدائي', badgeEn: 'Grade 6 Primary', headlineAr: 'شرح رياضيات الصف السادس الابتدائي — النسب، التناسب، والمعادلات التمهيدية للمرحلة الإعدادية', headlineEn: 'Grade 6 Primary Math Lessons — Ratios, Proportions & Algebraic Readiness' },
  { slug: '1st-prep-math', alias: ['شرح-رياضيات-اولى-اعدادي'], ar: 'شرح رياضيات اولى اعدادي', en: '1st Prep Math Lessons', badgeAr: 'أولى إعدادي', badgeEn: '1st Prep', headlineAr: 'شرح رياضيات اولى اعدادي — مدخل علم الجبر والحدود والمقادير الجبرية ونظريات الهندسة', headlineEn: '1st Prep Math Lessons — Algebraic Expressions & Fundamental Geometric Theorems' },
  { slug: '2nd-prep-math', alias: ['شرح-رياضيات-تانية-اعدادي'], ar: 'شرح رياضيات تانية اعدادي', en: '2nd Prep Math Lessons', badgeAr: 'تانية إعدادي', badgeEn: '2nd Prep', headlineAr: 'شرح رياضيات تانية اعدادي — التحليل الرياضي، الجذور التكعيبية، ونظرية فيثاغورس وإقليدس', headlineEn: '2nd Prep Math Lessons — Factoring, Cube Roots & Classical Geometric Proofs' },
  { slug: '3rd-prep-math', alias: ['شرح-رياضيات-تالتة-اعدادي'], ar: 'شرح رياضيات تالتة اعدادي', en: '3rd Prep Math Lessons', badgeAr: 'تالتة إعدادي (الشهادة)', badgeEn: '3rd Prep (Certificate)', headlineAr: 'شرح رياضيات تالتة اعدادي — سنة الشهادة الإعدادية: حساب المثلثات والجبر والدوال والهندسة التحليلية', headlineEn: '3rd Prep Math Lessons — Trigonometry, Quadratic Functions & Coordinate Geometry' },
  { slug: '1st-secondary-math', alias: ['شرح-رياضيات-اولى-ثانوي'], ar: 'شرح رياضيات اولى ثانوي', en: '1st Secondary Math Lessons', badgeAr: 'أولى ثانوي', badgeEn: '1st Secondary', headlineAr: 'شرح رياضيات اولى ثانوي — المصفوفات، المتجهات، وحساب المثلثات المتقدم للثانوية العامة', headlineEn: '1st Secondary Math Lessons — Matrices, Vectors & Advanced High School Trigonometry' },
  { slug: '2nd-secondary-math', alias: ['شرح-رياضيات-تانية-ثانوي'], ar: 'شرح رياضيات تانية ثانوي', en: '2nd Secondary Math Lessons', badgeAr: 'تانية ثانوي علمي وأدبي', badgeEn: '2nd Secondary', headlineAr: 'شرح رياضيات تانية ثانوي — التفاضل والتكامل والدوال الحقيقية وقواعد الجيب وجيب التمام', headlineEn: '2nd Secondary Math Lessons — Real Functions, Calculus & Sine/Cosine Laws' },
  { slug: '3rd-secondary-math', alias: ['شرح-رياضيات-تالتة-ثانوي'], ar: 'شرح رياضيات تالتة ثانوي', en: '3rd Secondary Math Lessons', badgeAr: 'تالتة ثانوي (شهادة)', badgeEn: '3rd Secondary (Thanaweya)', headlineAr: 'شرح رياضيات تالتة ثانوي — المسار الأقوى لشعبة علمي رياضة: تفاضل، جبر فراغية، واستاتيكا وديناميكا', headlineEn: '3rd Secondary Math Lessons — Elite STEM Math: Calculus, Solid Geometry & Mechanics' },
  { slug: 'math-grade-10', alias: ['ماث-grade-10'], ar: 'ماث Grade 10', en: 'Math Grade 10 Lessons', badgeAr: 'Grade 10', badgeEn: 'Grade 10', headlineAr: 'ماث Grade 10 — Linear Systems, Quadratic Functions, and Geometry Readiness', headlineEn: 'Math Grade 10 — Linear Systems, Quadratic Functions, and Geometry Readiness' },
  { slug: 'math-grade-11', alias: ['ماث-grade-11'], ar: 'ماث Grade 11', en: 'Math Grade 11 Lessons', badgeAr: 'Grade 11', badgeEn: 'Grade 11', headlineAr: 'ماث Grade 11 — Precalculus, Polynomials, and Digital SAT Preparation', headlineEn: 'Math Grade 11 — Precalculus, Polynomials, and Digital SAT Preparation' },
  { slug: 'math-grade-12', alias: ['ماث-grade-12'], ar: 'ماث Grade 12', en: 'Math Grade 12 Lessons', badgeAr: 'Grade 12', badgeEn: 'Grade 12', headlineAr: 'ماث Grade 12 — AP Calculus, Advanced Statistics, and College Entrance Mastery', headlineEn: 'Math Grade 12 — AP Calculus, Advanced Statistics, and College Entrance Mastery' }
];

gradeItems.forEach((g) => {
  list.push(
    k(
      g.slug, g.slug, g.alias, 'grades',
      g.ar, g.en,
      `${g.ar} | منصة سبايدر ماث — ميس هبة عياد`,
      `${g.en} | Spider Math Platform — Miss Heba Ayad`,
      `كورس ${g.ar}: شرح كامل لجميع دروس المنهج، حل تدريبات الكتاب وبنوك الأسئلة مع المهندسة هبة عبدالوهاب.`,
      `Comprehensive course for ${g.en}: full syllabus lectures, textbook problem workouts, and mock exams by Eng. Heba Abdel-Wahab.`,
      [g.ar, 'شرح رياضيات', 'سبايدر ماث', 'هبه عياد', 'منهج الماث'],
      [g.en, 'Math Lessons', 'Spider Math', 'Heba Ayad', 'Grade Curriculum'],
      g.badgeAr, g.badgeEn,
      g.headlineAr, g.headlineEn,
      'تأسيس علمي متين ينتقل بالطالب خطوة بخطوة من الفهم الأساسي إلى التميز في الامتحانات.',
      'A structured pedagogical journey moving students step-by-step from core intuition to exam dominance.',
      `يوفر كورس ${g.ar} فيديوهات شرح عالية الوضوح لكل درس في المنهج الوزاري واللغات، مع شيتات واجب إلكترونية واختبارات تجريبية موقوتة ومتابعة دورية مع ولي الأمر لضمان الحفاظ على أعلى الدرجات.`,
      `Our ${g.en} curriculum provides crystal-clear videos for every unit, automated homework sheets, timed quizzes, and proactive parent progress tracking.`,
      defaultFeatures,
      [
        { titleAr: 'الوحدات الدراسية المعتمدة للمنهج', titleEn: 'Official Curriculum Units', detailsAr: 'تغطية شاملة للمقرر الفصلي والسنوي طبقاً لأحدث تعديلات الوزارة.', detailsEn: 'Complete semester and yearly modules aligned with latest guidelines.' },
        { titleAr: 'حل تدريبات وتمارين الامتحانات', titleEn: 'Practice Problems & Exam Questions', detailsAr: 'حل مئات المسائل المتدرجة في الصعوبة لترسيخ المفاهيم.', detailsEn: 'Hundreds of graded practice problems reinforcing every mathematical rule.' }
      ],
      `طلاب ${g.ar} وأولياء أمورهم الراغبون في متابعة منتظمة وشرح مبسط وممتع.`,
      `Students and parents of ${g.en} seeking reliable, enjoyable, and high-scoring lessons.`,
      [
        { questionAr: `هل يشمل كورس ${g.ar} حل أسئلة كتاب الوزارة وكتاب المعاصر؟`, questionEn: `Does ${g.en} include ministry textbook and external book problems?`, answerAr: 'نعم، نحل تمارين كتاب الوزارة وأهم أفكار الكتب الخارجية المعتمدة وبنك المعرفة.', answerEn: 'Yes, we solve ministry textbook exercises plus top problems from leading prep books.' },
        { questionAr: 'هل يتوفر امتحانات شهرية محاكية لاختبارات الشهور؟', questionEn: 'Are monthly mock tests provided?', answerAr: 'نعم، نوفر نماذج امتحانات شهرية قبل كل اختبار مدرسي لتدريب الطالب على شكل الامتحان.', answerEn: 'Yes! We publish full monthly mock exams prior to school tests to build timing and confidence.' }
      ],
      ['grade-4-primary-math', '3rd-prep-math', '3rd-secondary-math', 'spider-math']
    )
  );
});

// =========================================================================
// Category 6: المناهج المختلفة - Various Curricula (9 items)
// =========================================================================
const curriculaItems = [
  { slug: 'egyptian-curriculum-math', alias: ['شرح-رياضيات-المنهج-المصري'], ar: 'شرح رياضيات المنهج المصري', en: 'Egyptian Curriculum Math Lessons', badgeAr: 'المنهج المصري', badgeEn: 'Egyptian Curriculum', headlineAr: 'شرح رياضيات المنهج المصري — من الابتدائي حتى الثانوية العامة بأحدث أساليب التقييم', headlineEn: 'Egyptian Curriculum Math Lessons — From Primary to Thanaweya Amma' },
  { slug: 'egyptian-baccalaureate-math', alias: ['شرح-رياضيات-البكالوريا-المصرية'], ar: 'شرح رياضيات البكالوريا المصرية', en: 'Egyptian Baccalaureate Math Lessons', badgeAr: 'البكالوريا المصرية', badgeEn: 'Egyptian Baccalaureate', headlineAr: 'شرح رياضيات البكالوريا المصرية — المنهاج المطور لاكتساب الفكر الهندسي والتحليلي', headlineEn: 'Egyptian Baccalaureate Math Lessons — Advanced Analytical & Engineering Mindset' },
  { slug: 'thanaweya-amma-math', alias: ['شرح-رياضيات-الثانوية-العامة'], ar: 'شرح رياضيات الثانوية العامة', en: 'Thanaweya Amma Math Lessons', badgeAr: 'الثانوية العامة', badgeEn: 'Thanaweya Amma', headlineAr: 'شرح رياضيات الثانوية العامة — معسكر التفوق لفرعي الرياضيات البحتة والتطبيقية', headlineEn: 'Thanaweya Amma Math Lessons — The Premier Camp for Pure & Applied Math' },
  { slug: 'al-azhar-curriculum-math', alias: ['شرح-رياضيات-الازهر'], ar: 'شرح رياضيات الازهر', en: 'Al-Azhar Curriculum Math Lessons', badgeAr: 'الأزهر الشريف', badgeEn: 'Al-Azhar Curriculum', headlineAr: 'شرح رياضيات الازهر — تدريس مخصص للثانوية الأزهرية يراعي نمط الأسئلة المقالية والموضوعية', headlineEn: 'Al-Azhar Curriculum Math Lessons — Tailored for Al-Azhar High School Formats' },
  { slug: 'american-diploma-math', alias: ['شرح-ماث-الدبلومة-الامريكية'], ar: 'شرح ماث الدبلومة الامريكية', en: 'American Diploma Math Lessons', badgeAr: 'الدبلومة الأمريكية', badgeEn: 'American Diploma', headlineAr: 'شرح ماث الدبلومة الامريكية — احتراف اختبارات SAT و EST و ACT باستراتيجيات ديسموس', headlineEn: 'American Diploma Math Lessons — Conquering SAT, EST, and ACT with Desmos Hacks' },
  { slug: 'british-igcse-math', alias: ['شرح-ماث-المنهج-البريطاني-ig'], ar: 'شرح ماث المنهج البريطاني IG', en: 'British Curriculum IGCSE Math', badgeAr: 'المنهج البريطاني IG', badgeEn: 'British IGCSE', headlineAr: 'شرح ماث المنهج البريطاني IG — كامبريدج وإديكسل OL و AL مع حلول Past Papers كاملة', headlineEn: 'British Curriculum IGCSE Math — Cambridge & Edexcel OL/AL Past Paper Workouts' },
  { slug: 'igcse-math-explanation', alias: ['شرح-igcse-math'], ar: 'شرح IGCSE Math', en: 'IGCSE Math Lessons & Past Papers', badgeAr: 'IGCSE Math', badgeEn: 'IGCSE Math', headlineAr: 'شرح IGCSE Math — استراتيجيات الحصول على 9 / A* في امتحانات Cambridge & Pearson', headlineEn: 'IGCSE Math Lessons — Strategies to Secure Grade 9 / A* in Cambridge & Pearson' },
  { slug: 'languages-schools-math', alias: ['شرح-ماث-لغات'], ar: 'شرح ماث لغات', en: 'Languages Schools Math Lessons', badgeAr: 'مدارس اللغات والرسمية', badgeEn: 'Language Schools', headlineAr: 'شرح ماث لغات — تدريس المناهج باللغة الإنجليزية لمدارس اللغات والتجريبية والمتميزة', headlineEn: 'Languages Schools Math Lessons — English Instruction for Experimental & Private Schools' },
  { slug: 'saudi-curriculum-math', alias: ['شرح-رياضيات-المنهج-السعودي'], ar: 'شرح رياضيات المنهج السعودي', en: 'Saudi Curriculum Math Lessons', badgeAr: 'المنهج السعودي والخليجي', badgeEn: 'Saudi Curriculum', headlineAr: 'شرح رياضيات المنهج السعودي — مسارات ومقررات المرحلة المتوسطة والثانوية مع تدريبات التحصيلي والقدرات', headlineEn: 'Saudi Curriculum Math Lessons — Middle & High School Tracks plus Tahsili & Qudurat' }
];

curriculaItems.forEach((c) => {
  list.push(
    k(
      c.slug, c.slug, c.alias, 'curricula',
      c.ar, c.en,
      `${c.ar} | منصة سبايدر ماث — ميس هبة عياد`,
      `${c.en} | Spider Math Platform — Miss Heba Ayad`,
      `كورس ${c.ar}: شرح معتمد وشامل لكل فصول المنهج مع مذكرات PDF وتدريبات امتحانية تفاعلية مع المهندسة هبة عبدالوهاب.`,
      `Complete course for ${c.en}: accredited video lectures, comprehensive PDF notes, and realistic exam practice on Spider Math.`,
      [c.ar, 'مناهج الرياضيات', 'سبايدر ماث', 'هبه عياد', 'ماث اونلاين'],
      [c.en, 'Math Curricula', 'Spider Math', 'Heba Ayad', 'Online Education'],
      c.badgeAr, c.badgeEn,
      c.headlineAr, c.headlineEn,
      'تنوع المناهج يتطلب خبرة عميقة بكل نظام تعليمي وخصوصية امتحاناته.',
      'Diverse curricula require deep pedagogical mastery of each system’s unique exam format.',
      `نوفر في ${c.ar} مساراً تعليمياً مخصصاً يراعي طبيعة الاختبارات الخاصة بهذا المنهج، سواء أكانت ورقية مقالية أو رقمية اختيارية، مع تدريبات نوعية وبنوك أسئلة مستمرة لتثبيت المعلومات.`,
      `In our ${c.en} pathway, we tailor the instruction to the exact testing philosophy of the board, offering specialized drill sheets and continuous assessments.`,
      defaultFeatures,
      [
        { titleAr: 'محاور المنهج التخصصية', titleEn: 'Curriculum Core Modules', detailsAr: 'تغطية المفاهيم الرياضية الخاصة بهذا المنهج بدقة.', detailsEn: 'Rigorous coverage of the mathematical concepts native to this board.' },
        { titleAr: 'بنوك أسئلة مطابقة للاختبار الرسمي', titleEn: 'Official Specimen Question Banks', detailsAr: 'تدريب مكثف على نماذج ومسائل مطابقة للامتحانات الرسمية.', detailsEn: 'Intensive drills mirroring official sample and past papers.' }
      ],
      'طلاب هذا المنهج وأولياء أمورهم الراغبون في تحقيق درجات استثنائية.',
      'Students and parents in this curriculum track aiming for exceptional exam performance.',
      [
        { questionAr: `هل يناسب كورس ${c.ar} التعديلات الوزارية الأخيرة؟`, questionEn: `Is ${c.en} updated for the latest educational amendments?`, answerAr: 'نعم، نقوم بتحديث المحاضرات والشيتات فور صدور أي تعديلات رسمية من الجهات التعليمية.', answerEn: 'Yes! We update our video modules and handouts immediately upon official board releases.' }
      ],
      ['egyptian-curriculum-math', 'american-diploma-math', 'british-igcse-math', 'spider-math']
    )
  );
});

// =========================================================================
// Category 7: الدبلومة الامريكية - American Diploma (7 items)
// =========================================================================
const americanItems = [
  { slug: 'sat-math-explanation', alias: ['شرح-sat-math'], ar: 'شرح SAT Math', en: 'SAT Math Lessons & Strategy', badgeAr: 'Digital SAT', badgeEn: 'Digital SAT', headlineAr: 'شرح SAT Math — أسرار Digital SAT وحيل حاسبة ديسموس لتحقيق سكور 800', headlineEn: 'SAT Math Lessons & Strategy — Digital SAT Mastery & Desmos Speed Hacks' },
  { slug: 'sat-math-online-course', alias: ['كورس-sat-math-اون-لاين'], ar: 'كورس SAT Math اون لاين', en: 'Online SAT Math Course & Prep', badgeAr: 'كورس SAT كامل', badgeEn: 'Full SAT Course', headlineAr: 'كورس SAT Math اون لاين — المعسكر التدريبي المتكامل لجميع أقسام الجبر والدوال والهندسة', headlineEn: 'Online SAT Math Course & Prep — Comprehensive Bootcamp Covering All Modules' },
  { slug: 'how-to-score-800-in-sat-math', alias: ['ازاي-اجيب-800-في-sat-math', 'كيف-احصل-على-800-sat-math'], ar: 'ازاي اجيب 800 في SAT Math', en: 'How to Score 800 in SAT Math Guide', badgeAr: '800 Roadmap', badgeEn: '800 Roadmap', headlineAr: 'ازاي اجيب 800 في SAT Math — الخطة الذهبية والخطوات العملية لتحقيق السكور المثالي', headlineEn: 'How to Score 800 in SAT Math — The Step-by-Step Blueprint to a Perfect Score' },
  { slug: 'est-math-explanation', alias: ['شرح-est-math'], ar: 'شرح EST Math', en: 'EST Math Lessons & Strategy', badgeAr: 'EST 1 & EST 2', badgeEn: 'EST 1 & EST 2', headlineAr: 'شرح EST Math — دليلك الأقوى لاجتياز اختبارات القبول الجامعي للدبلومة الأمريكية في مصر', headlineEn: 'EST Math Lessons & Strategy — Mastering Egyptian Scholastic Tests for University' },
  { slug: 'act-math-explanation', alias: ['شرح-act-math'], ar: 'شرح ACT Math', en: 'ACT Math Lessons & Strategy', badgeAr: 'ACT Math', badgeEn: 'ACT Math', headlineAr: 'شرح ACT Math — مهارات حل 60 سؤالاً في 60 دقيقة بدقة وسرعة متناهية', headlineEn: 'ACT Math Lessons & Strategy — Conquering 60 Questions in 60 Minutes' },
  { slug: 'difference-between-sat-act-est', alias: ['الفرق-بين-sat-و-act-و-est', 'الفرق-بين-sat-و-est'], ar: 'الفرق بين SAT و ACT و EST', en: 'Difference Between SAT, ACT, and EST', badgeAr: 'دليل المقارنة الشامل', badgeEn: 'Standardized Tests Guide', headlineAr: 'الفرق بين SAT و ACT و EST — مقارنة شاملة في الصيغة وعدد الأسئلة والقبول الجامعي', headlineEn: 'Difference Between SAT, ACT, and EST — Complete Comparative Analysis' },
  { slug: 'american-diploma-math-course-prices', alias: ['اسعار-كورس-ماث-دبلومة-امريكية'], ar: 'اسعار كورس ماث دبلومة امريكية', en: 'American Diploma Math Course Pricing', badgeAr: 'الأسعار والباقات', badgeEn: 'Pricing & Offers', headlineAr: 'اسعار كورس ماث دبلومة امريكية — باقات موفرة لكورسات SAT و EST و ACT مع تجربة مجانية', headlineEn: 'American Diploma Math Course Pricing — Flexible Plans for SAT, EST & ACT' }
];

americanItems.forEach((a) => {
  list.push(
    k(
      a.slug, a.slug, a.alias, 'american_diploma',
      a.ar, a.en,
      `${a.ar} | كورس الماث للدبلومة الأمريكية — ميس هبة عياد`,
      `${a.en} | American Diploma Math Hub — Miss Heba Ayad`,
      `كل ما يخص ${a.ar}: استراتيجيات ديسموس، خطة 800، حل امتحانات سابقة، وأسعار الباقات مع المهندسة هبة عبدالوهاب على سبايدر ماث.`,
      `Master ${a.en}: Desmos shortcuts, 800 blueprints, official question banks, and transparent pricing on Spider Math Platform.`,
      [a.ar, 'SAT Math', 'EST Math', 'ACT Math', 'الدبلومة الأمريكية', 'ديسموس'],
      [a.en, 'SAT Math', 'EST Math', 'ACT Math', 'American Diploma', 'Desmos Calculator'],
      a.badgeAr, a.badgeEn,
      a.headlineAr, a.headlineEn,
      'في اختبارات الدبلومة الأمريكية، السرعة واستخدام ديسموس هما مفتاح الـ 800.',
      'In American Diploma standardized tests, pacing and Desmos mastery unlock the 800.',
      `يقدم كورس ${a.ar} تدريباً مكثفاً على التعامل مع بنك أسئلة College Board واختبارات EST الرسمية، مع التركيز على استراتيجيات الحل الذكي باستخدام حاسبة ديسموس المدمجة والتخلص من فخاخ الوقت في Module 2 الصعب.`,
      `Our ${a.en} program delivers deep training on College Board question banks and official EST exams, focusing on Desmos graphical shortcuts, eliminating traps, and mastering hard Module 2 sections.`,
      defaultFeatures,
      [
        { titleAr: 'Heart of Algebra & Advanced Math', titleEn: 'Heart of Algebra & Advanced Math', detailsAr: 'المعادلات الخطية، الأنظمة، الدوال التربيعية، كثيرات الحدود، والمتباينات.', detailsEn: 'Linear systems, quadratic models, complex polynomials, and inequalities.' },
        { titleAr: 'Problem Solving, Data Analysis & Geometry', titleEn: 'Problem Solving, Data Analysis & Geometry', detailsAr: 'النسب، الإحصاء، الاحتمالات، الدوائر، وحساب المثلثات المتقدم.', detailsEn: 'Ratios, scatterplots, statistics, circles, and right-triangle trigonometry.' }
      ],
      'طلاب الدبلومة الأمريكية في مصر والخليج الراغبون في تحقيق سكور 800 للالتحاق بكليات الهندسة والطب.',
      'American Diploma students across Egypt and the Gulf striving for an 800 score.',
      [
        { questionAr: 'كيف تضمن الحصول على سكور 800 في SAT Math؟', questionEn: 'How can I ensure an 800 score in SAT Math?', answerAr: 'من خلال الخطة الثلاثية: إتقان مفاهيم الجبر والإحصاء، الاحتراف التام لحاسبة ديسموس، وإدارة دفتر أخطاء يومي (Error Log) لعدم تكرار أي خطأ.', answerEn: 'Through the 3-pillar method: conceptual mastery, full Desmos fluency, and keeping an active Error Log to eliminate mistakes.' },
        { questionAr: 'ما هو الفرق الأساسي بين SAT و EST و ACT في الماث؟', questionEn: 'What is the main difference between SAT, EST, and ACT in Math?', answerAr: 'اختبار SAT رقمي بالكامل ويعتمد على ديسموس في جميع الأسئلة، واختبار EST مخصص للجامعات المصرية بفرعي EST 1 و EST 2، بينما يعتمد ACT على 60 سؤالاً في 60 دقيقة بسرعة عالية جداً.', answerEn: 'Digital SAT uses Desmos natively; EST is specifically aligned with Egyptian universities; ACT is a high-speed 60-question/60-minute paper test.' }
      ],
      ['sat-math-explanation', 'how-to-score-800-in-sat-math', 'difference-between-sat-act-est', 'spider-math']
    )
  );
});

console.log(`Total keywords defined: ${list.length}`);
if (list.length !== 75) {
  console.error(`ERROR: Expected exactly 75 keywords, but found ${list.length}`);
  process.exit(1);
}

// 1. Output TypeScript constant file
const tsPath = path.resolve(projectRoot, 'src/app/core/constants/seo-keywords.constant.ts');
const tsContent = `// ==============================================================================
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

export const SEO_KEYWORD_CATEGORIES: readonly ISeoCategoryMeta[] = ${JSON.stringify(categories, null, 2)};

export const SEO_KEYWORD_PAGES: readonly ISeoKeywordPage[] = ${JSON.stringify(list, null, 2)};

/**
 * Normalizes Arabic letters (removes diacritics, normalizes Alef, Ta Marbuta, Alef Maqsura, spaces).
 */
export function normalizeArabicText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\\u064B-\\u065F\\u0670]/g, '') // remove Tashkeel
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ـ+/g, '') // remove Tatweel
    .replace(/عبد\\s+/g, 'عبد')
    .trim();
}

/**
 * Normalizes input string to match keyword slug or aliases cleanly.
 */
export function normalizeSlug(raw: string): string {
  try {
    const decoded = decodeURIComponent(raw).trim().toLowerCase();
    const normalizedArabic = normalizeArabicText(decoded);
    return normalizedArabic.replace(/[\\s_]+/g, '-');
  } catch {
    const normalizedArabic = normalizeArabicText(raw.trim().toLowerCase());
    return normalizedArabic.replace(/[\\s_]+/g, '-');
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
`;

fs.writeFileSync(tsPath, tsContent, 'utf8');
console.log(`[SUCCESS] Wrote TypeScript keywords constant: ${tsPath} (${(tsContent.length / 1024).toFixed(1)} KB)`);

// 2. Generate public/sitemap.xml
const sitemapPath = path.resolve(projectRoot, 'public/sitemap.xml');
const currentDate = new Date().toISOString().split('T')[0];

const coreRoutes = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: 'topics', priority: '0.9', changefreq: 'daily' },
  { path: 'placement-test', priority: '0.8', changefreq: 'weekly' },
  { path: 'login', priority: '0.6', changefreq: 'monthly' }
];

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

// Add core routes
for (const r of coreRoutes) {
  const url = `https://spider-math.com${r.path ? '/' + r.path : ''}`;
  xml += `  <url>
    <loc>${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>\n`;
}

// Add all 75 keyword topic pages
for (const item of list) {
  const topicUrl = `https://spider-math.com/topic/${item.slug}`;
  xml += `  <url>
    <loc>${topicUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>\n`;
}

xml += `</urlset>\n`;

fs.writeFileSync(sitemapPath, xml, 'utf8');
console.log(`[SUCCESS] Wrote public/sitemap.xml: ${sitemapPath} (${coreRoutes.length + list.length} URLs)`);
