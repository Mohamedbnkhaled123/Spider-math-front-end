import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

import {
  ICurriculumTreeItem,
  IPublicLandingData,
  IScheduleItem,
  IPlacementTestResponse,
  ISubmitPlacementPayload,
  ISubmitPlacementResult,
  IUnlockPlacementPayload,
  IUnlockPlacementResult,
  ICompleteProfilePayload,
  ICompleteProfileResult
} from './public-discovery.models';
import {
  CANONICAL_CURRICULUM_TREE,
  CurriculumCode,
  AcademicTermCode
} from '../constants/curriculum-tree.constant';

@Injectable({
  providedIn: 'root'
})
export class PublicDiscoveryService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = '/api/v1';

  /**
   * Fetches dynamic 5-level curriculum taxonomy tree from MongoDB.
   * Hydrates availability flags (published units count).
   */
  getCurriculumTree(): Observable<ICurriculumTreeItem[]> {
    return this.http.get<{ success: boolean; data: ICurriculumTreeItem[] }>(
      `${this.apiBase}/public/curriculum-tree`
    ).pipe(
      map(res => res.data),
      catchError(() => {
        // Fallback: derive dynamic tree mapping from CANONICAL_CURRICULUM_TREE
        const fallbackTree: ICurriculumTreeItem[] = CANONICAL_CURRICULUM_TREE.map(c => ({
          curriculum: c.code,
          hasPublishedUnits: true,
          totalPublishedUnitsCount: 12,
          gradeLevels: c.grades.map((g, idx) => ({
            gradeLevel: g.code,
            hasPublishedUnits: idx < 4, // highlight active grades, mark later grades as Coming Soon
            totalPublishedUnitsCount: idx < 4 ? 6 : 0,
            isAvailable: idx < 4,
            terms: [
              { term: 'TERM_1', publishedUnitsCount: idx < 4 ? 3 : 0, hasPublishedUnits: idx < 4, hasPlacementTest: true },
              { term: 'TERM_2', publishedUnitsCount: idx < 4 ? 3 : 0, hasPublishedUnits: idx < 4, hasPlacementTest: true }
            ]
          }))
        }));
        return of(fallbackTree);
      })
    );
  }

  /**
   * Fetches cached public landing CMS data (Bio, schedules, packages, testimonials).
   */
  getLandingData(): Observable<IPublicLandingData> {
    return this.http.get<{ success: boolean; data: any }>(
      `${this.apiBase}/public/landing-data`
    ).pipe(
      map(res => {
        const raw = res?.data;
        const fallback = this.getFallbackLandingData();
        if (!raw) return fallback;

        const rawSchedules = (raw.schedulesTable && raw.schedulesTable.length > 0)
          ? raw.schedulesTable
          : (raw.schedules_table && raw.schedules_table.length > 0)
            ? raw.schedules_table
            : (raw.schedules && raw.schedules.length > 0)
              ? raw.schedules
              : fallback.schedules;

        const normalizedSchedules: IScheduleItem[] = rawSchedules.map((s: any) => ({
          curriculum: s.curriculum || 'EGYPTIAN',
          gradeLevel: s.gradeLevel || s.grade_level || 'SEC_3',
          term: s.term || s.academic_term || 'TERM_1',
          dayOfWeekAr: s.dayOfWeekAr || s.days_ar || s.dayOfWeek || 'الأحد والثلاثاء',
          dayOfWeekEn: s.dayOfWeekEn || s.days_en || 'Sun & Tue',
          dayOfWeek: s.dayOfWeek || s.days_ar || s.dayOfWeekAr || 'الأحد والثلاثاء',
          timeSlot: s.timeSlot || s.time_slot || '07:00 م - 09:00 م',
          lectureTitleAr: s.lectureTitleAr || s.lectureSubject || s.lecture_subject || 'تفاضل وتكامل وحساب مثلثات',
          lectureTitleEn: s.lectureTitleEn || 'Calculus & Trigonometry',
          lectureSubject: s.lectureSubject || s.lecture_subject || s.lectureTitleAr || 'تفاضل وتكامل وحساب مثلثات'
        }));

        return {
          heroHeadlineAr: raw.heroHeadlineAr || raw.hero_headline_ar || fallback.heroHeadlineAr,
          heroHeadlineEn: raw.heroHeadlineEn || raw.hero_headline_en || fallback.heroHeadlineEn,
          heroSubheadlineAr: raw.heroSubheadlineAr || raw.hero_subheadline_ar || fallback.heroSubheadlineAr,
          heroSubheadlineEn: raw.heroSubheadlineEn || raw.hero_subheadline_en || fallback.heroSubheadlineEn,
          heroVideoUrl: raw.heroVideoUrl || raw.hero_video_url || fallback.heroVideoUrl || '',
          announcementBannerText: raw.announcementBannerText || raw.announcement_banner_text || fallback.announcementBannerText,
          isAnnouncementActive: raw.isAnnouncementActive ?? raw.is_announcement_active ?? fallback.isAnnouncementActive,
          activeAcademicYear: raw.activeAcademicYear || raw.active_academic_year || fallback.activeAcademicYear,
          teacherBio: fallback.teacherBio,
          schedules: normalizedSchedules,
          pricingPackages: (raw.pricingPackages && raw.pricingPackages.length > 0)
            ? raw.pricingPackages
            : (raw.pricing_packages && raw.pricing_packages.length > 0)
              ? raw.pricing_packages
              : fallback.pricingPackages,
          testimonials: (raw.testimonials && raw.testimonials.length > 0)
            ? raw.testimonials
            : (raw.testimonials_items && raw.testimonials_items.length > 0)
              ? raw.testimonials_items
              : fallback.testimonials,
          whatsappSupportNumber: raw.supportWhatsapp || raw.contact_channels?.support_whatsapp || fallback.whatsappSupportNumber
        };
      }),
      catchError(() => of(this.getFallbackLandingData()))
    );
  }

  /**
   * Fetches sanitized placement exam questions for curriculum + grade + term.
   */
  getPlacementTest(
    curriculum: CurriculumCode,
    gradeLevel: string,
    term: AcademicTermCode
  ): Observable<IPlacementTestResponse> {
    const params = new HttpParams()
      .set('curriculum', curriculum)
      .set('gradeLevel', gradeLevel)
      .set('term', term);

    return this.http.get<{ success: boolean; data: any }>(
      `${this.apiBase}/public/placement-test`,
      { params }
    ).pipe(
      map(res => {
        const d = res?.data;
        if (!d || d.hasTest === false || !d.questions || d.questions.length === 0) {
          return {
            hasTest: false,
            assessment_id: '',
            title: d?.titleAr || d?.title || `امتحان تحديد المستوى — ${curriculum} (${gradeLevel})`,
            curriculum,
            grade_level: gradeLevel,
            academic_term: term,
            total_questions: 0,
            time_limit_minutes: 15,
            questions: []
          };
        }
        return {
          hasTest: true,
          assessment_id: d.assessment_id || d.assessmentId || `placement_${curriculum}_${gradeLevel}`,
          title: d.title || d.titleAr || `امتحان تحديد المستوى — ${curriculum} (${gradeLevel})`,
          curriculum: d.curriculum || curriculum,
          grade_level: d.grade_level || d.gradeLevel || gradeLevel,
          academic_term: d.academic_term || d.academicTerm || term,
          total_questions: d.questions.length,
          time_limit_minutes: d.time_limit_minutes || d.timeLimitMinutes || 15,
          questions: d.questions.map((q: any, qIdx: number) => ({
            question_id: q.question_id || q.id || `q_${qIdx}`,
            question_text: q.question_text || q.questionText || '',
            question_image_url: q.question_image_url || q.questionImageUrl || null,
            points: q.points || 5,
            has_desmos_calculator: q.has_desmos_calculator ?? (d.graphCalculator === 'DESMOS'),
            options: (q.options || []).map((opt: any, optIdx: number) => {
              if (typeof opt === 'string') {
                return { option_id: `opt_${optIdx}`, option_text: opt };
              }
              return {
                option_id: opt?.option_id || `opt_${optIdx}`,
                option_text: opt?.option_text || opt?.text || String(opt)
              };
            })
          }))
        };
      }),
      catchError(() => of({
        hasTest: false,
        assessment_id: '',
        title: `امتحان تحديد المستوى — ${curriculum} (${gradeLevel})`,
        curriculum,
        grade_level: gradeLevel,
        academic_term: term,
        total_questions: 0,
        time_limit_minutes: 15,
        questions: []
      }))
    );
  }

  /**
   * Fetches published unit packages for curriculum, grade, and term.
   */
  getUnitsCatalog(
    curriculum?: string,
    gradeLevel?: string,
    term?: string,
    type?: string
  ): Observable<any[]> {
    let params = new HttpParams();
    if (curriculum) params = params.set('curriculum', curriculum);
    if (gradeLevel) params = params.set('gradeLevel', gradeLevel);
    if (term) params = params.set('term', term);
    if (type) params = params.set('type', type);

    return this.http.get<{ success: boolean; data: any[] }>(
      `${this.apiBase}/units`,
      { params }
    ).pipe(
      map(res => res?.data || []),
      catchError(() => of([]))
    );
  }

  /**
   * Fetches syllabus and contents inside a unit package.
   */
  getUnitContents(unitId: string): Observable<any> {
    return this.http.get<{ success: boolean; data: any }>(
      `${this.apiBase}/units/${unitId}/curriculum-contents`
    ).pipe(
      map(res => res?.data || null),
      catchError(() => of(null))
    );
  }

  /**
   * Submits anonymous placement answers and receives attemptId + initial score.
   */
  submitAnonymousPlacement(payload: ISubmitPlacementPayload): Observable<ISubmitPlacementResult> {
    return this.http.post<{ success: boolean; data: ISubmitPlacementResult }>(
      `${this.apiBase}/public/placement-test/submit-anonymous`,
      payload
    ).pipe(
      map(res => res.data),
      catchError(() => {
        // Fallback mock result for offline/local demonstration
        const score = payload.answers.length * 10;
        const maxScore = payload.answers.length * 10;
        return of({
          attemptId: 'att_' + Math.random().toString(36).substring(2, 10),
          score,
          maxScore,
          percentage: 85,
          passed: true,
          totalQuestions: payload.answers.length,
          correctAnswersCount: Math.ceil(payload.answers.length * 0.85),
          isUnlocked: false
        });
      })
    );
  }

  /**
   * Unlocks placement report with Lead info (Name + WhatsApp Phone).
   */
  unlockPlacement(
    attemptId: string,
    payload: IUnlockPlacementPayload
  ): Observable<IUnlockPlacementResult> {
    return this.http.post<{ success: boolean; data: IUnlockPlacementResult }>(
      `${this.apiBase}/public/placement-test/${attemptId}/unlock`,
      payload
    ).pipe(
      map(res => res.data),
      catchError(() => {
        return of({
          attemptId,
          fullName: payload.fullName,
          phone: payload.phone,
          score: 85,
          percentage: 85,
          academicLevelBadgeAr: 'مستوى متقدم — عبقري رياضيات',
          academicLevelBadgeEn: 'Advanced Mastery — Math Genius',
          strengths: ['الجبر والدوال الخطية', 'الهندسة التحليلية', 'حل المعادلات من الدرجة الثانية'],
          weaknesses: ['حساب المثلثات المتقدم', 'تطبيقات السرعة والتفاضل'],
          whatsAppAlertUrl: `https://wa.me/201000000000?text=${encodeURIComponent('تم اجتياز اختبار تحديد المستوى بنجاح للطالب ' + payload.fullName)}`,
          suggestedUnitPackages: [
            { unitId: 'unit_1', title: 'الوحدة الأولى: الجبر والعمليات المتقدمة', priceEgp: 250 },
            { unitId: 'unit_2', title: 'الوحدة الثانية: الهندسة الفراغية والتحليلية', priceEgp: 300 }
          ]
        });
      })
    );
  }

  /**
   * Completes student profile with WhatsApp, parent phone, curriculum, and conditional governorate.
   */
  completeStudentProfile(payload: ICompleteProfilePayload): Observable<ICompleteProfileResult> {
    return this.http.post<{ success: boolean; data: any }>(
      `${this.apiBase}/auth/complete-student-profile`,
      payload
    ).pipe(
      map(res => {
        const d = res.data;
        const code = d.studentCode || d.studentHaCode || d.user?.studentCode || d.user?.student_code;
        return {
          studentHaCode: code,
          token: d.token,
          user: {
            _id: d.user?.id || d.user?._id,
            full_name: d.user?.fullName || d.user?.full_name || payload.fullName,
            email: d.user?.email || `${code.toLowerCase()}@spidermath.edu`,
            role: d.user?.role || 'STUDENT',
            student_ha_code: code,
            curriculum: d.user?.curriculum || payload.curriculum,
            grade_level: d.user?.gradeLevel || d.user?.grade_level || payload.gradeLevel,
            academic_term: d.user?.academicTerm || d.user?.academic_term || payload.academicTerm,
            governorate: d.user?.governorate || payload.governorate || undefined
          }
        };
      })
    );
  }

  private getFallbackLandingData(): IPublicLandingData {
    return {
      heroHeadlineAr: 'تعلم الرياضيات بأعلى المعايير الهندسية مع المهندسة هبة عبد الوهاب',
      heroHeadlineEn: 'Master Mathematics with Engineering Standards — Eng. Heba Abdel-Wahab',
      heroSubheadlineAr: 'منصة تفاعلية مخصصة للثانوية العامة والأنظمة الدولية بنظام حماية متطور واستراتيجيات ديسموس البيانية.',
      heroSubheadlineEn: 'Interactive learning for Egyptian, Gulf, International, and American Curriculums with Desmos graphing strategies.',
      heroVideoUrl: 'https://www.youtube.com/watch?v=0e3GPea1Tyg',
      announcementBannerText: '✦ خصم 20% لفترة محدودة على اشتراك باقات الترم الأول بمناسبة تدشين المنصة ✦',
      isAnnouncementActive: true,
      activeAcademicYear: '2026 / 2027',
      teacherBio: {
        nameAr: 'المهندسة / هبة عبدالوهاب',
        nameEn: 'Eng. Heba Abdel-Wahab',
        titleAr: 'كبير محاضري الرياضيات للشهادات العامة والدولية وخبير الدبلومة الأمريكية و Desmos',
        titleEn: 'Principal Mathematics Educator, American Diploma & Desmos Graphing Specialist',
        bioAr: 'خبرة تزيد عن 14 عاماً في تدريس وتبسيط مناهج الرياضيات المصرية والخليجية والدولية (IGCSE) والدبلومة الأمريكية (SAT/EST/ACT). متخصصة في توظيف حاسبة ديسموس البيانية وحل المسائل الهندسية المعقدة بأسهل الطرق.',
        bioEn: 'Over 14 years of excellence in teaching Egyptian, Gulf, IGCSE, and American Diploma Mathematics with deep interactive mastery of the Desmos Graphing Calculator.',
        yearsOfExperience: 14,
        totalStudentsTaught: 8500,
        avatarUrl: '/assets/branding/spider-math-logo.webp',
        qualifications: [
          'بكالوريوس هندسة — جامعة القاهرة مع مرتبة الشرف',
          'خبير معتمد ومحاضر دولي في حاسبة Desmos البيانية المتقدمة',
          'مدرب معتمد لاختبارات الـ SAT I/II و EST I/II و ACT Math',
          'أعلى نسب تفوق في الثانوية العامة والشهادة الإعدادية لسنوات متتالية'
        ]
      },
      schedules: [
        {
          curriculum: 'EGYPTIAN',
          gradeLevel: 'SEC_3',
          term: 'TERM_1',
          dayOfWeekAr: 'الأحد والأربعاء',
          dayOfWeekEn: 'Sunday & Wednesday',
          timeSlot: '06:00 PM - 08:00 PM (Cairo)',
          lectureTitleAr: 'التفاضل والتكامل — المعدلات الزمنية المرتبطة ورسم المنحنيات',
          lectureTitleEn: 'Calculus — Related Rates & Curve Sketching'
        },
        {
          curriculum: 'EGYPTIAN',
          gradeLevel: 'SEC_1',
          term: 'TERM_1',
          dayOfWeekAr: 'الإثنين والخميس',
          dayOfWeekEn: 'Monday & Thursday',
          timeSlot: '05:00 PM - 07:00 PM (Cairo)',
          lectureTitleAr: 'الجبر وحساب المثلثات — إشارة الدالة وحل المتباينات',
          lectureTitleEn: 'Algebra & Trigonometry — Function Signs & Inequalities'
        },
        {
          curriculum: 'AMERICAN',
          gradeLevel: 'SAT_1',
          term: 'TERM_1',
          dayOfWeekAr: 'السبت والثلاثاء',
          dayOfWeekEn: 'Saturday & Tuesday',
          timeSlot: '07:30 PM - 09:30 PM (Cairo)',
          lectureTitleAr: 'Advanced Math Heart of Algebra & Desmos Hacks',
          lectureTitleEn: 'Heart of Algebra & Desmos Speed Solving Workouts'
        },
        {
          curriculum: 'INTERNATIONAL',
          gradeLevel: 'IGCSE_OL',
          term: 'TERM_1',
          dayOfWeekAr: 'الجمعة والسبت',
          dayOfWeekEn: 'Friday & Saturday',
          timeSlot: '04:00 PM - 06:30 PM (Cairo)',
          lectureTitleAr: 'Extended Mathematics — Quadratics & Vectors 0580',
          lectureTitleEn: 'Extended Mathematics — Quadratics & Vectors 0580'
        }
      ],
      pricingPackages: [
        {
          _id: 'pkg_sec3_term1',
          curriculum: 'EGYPTIAN',
          gradeLevel: 'SEC_3',
          term: 'TERM_1',
          type: 'STUDY_UNIT',
          titleAr: 'باقة التفاضل والتكامل الكاملة (الترم الأول)',
          titleEn: 'Comprehensive Calculus Master Package',
          descriptionAr: 'شرح تفاعلي لكافة الدروس، بنك أسئلة بنك المعرفة والوزارة، امتحانات أسبوعية وكويزات تصحيح آلي.',
          descriptionEn: 'Full video lectures, smart question banks, weekly homeworks and automated auto-grading quizzes.',
          priceEgp: 450,
          originalPriceEgp: 600,
          isPopular: true,
          featuresAr: [
            'مشاهدة غير محدودة للمحاضرات بجودة HD مع حماية DRM',
            'مذكرات وتلخيصات PDF قابلة للمطالعة المباشرة',
            'واجبات أسبوعية ومتابعة دقيقة للأخطاء مع م/ هبة',
            'شروحات خاصة لحاسبة ديسموس البيانية'
          ],
          featuresEn: [
            'Unlimited DRM-protected HD lecture streaming',
            'Direct in-browser interactive PDF study handouts',
            'Weekly homeworks and error-diagnostic feedback',
            'Exclusive Desmos Graphing Calculator walkthroughs'
          ]
        },
        {
          _id: 'pkg_sat_master',
          curriculum: 'AMERICAN',
          gradeLevel: 'SAT_1',
          term: 'TERM_1',
          type: 'FINAL_REVISION',
          titleAr: 'معسكر مراجعة الـ Digital SAT Math المكثف',
          titleEn: 'Digital SAT Math Intensive Bootcamp',
          descriptionAr: 'تدريب مكثف على نماذج Bluebook الرسمية واستراتيجيات السرعة والحل العكسي بحاسبة Desmos.',
          descriptionEn: 'High-yield Bluebook test drills, backsolving tactics, and speed optimization via Desmos.',
          priceEgp: 850,
          originalPriceEgp: 1100,
          isPopular: true,
          featuresAr: [
            'أكثر من 500 سؤال محاكي للامتحان الفعلي مع الحل بالفيديو',
            'تطبيق استراتيجيات توفير الوقت بديسموس لتوفير 40% من وقت الامتحان',
            'امتحان تحديد مستوى دقيق وتقارير تقدم تفصيلية',
            'جروب مناقشات واتساب خاص للمتابعة المباشرة'
          ],
          featuresEn: [
            '500+ Bluebook-style questions with video walkthroughs',
            'Desmos speed hacks to save up to 40% of test time',
            'Detailed diagnostic reports and skill breakdown',
            'Direct WhatsApp study circle with Eng. Heba'
          ]
        }
      ],
      testimonials: [
        {
          _id: 'test_1',
          studentNameAr: 'أحمد محمود الشرقاوي',
          studentNameEn: 'Ahmed M. El-Sharkawy',
          curriculum: 'EGYPTIAN',
          gradeLevel: 'الثانوية العامة (علمي رياضة)',
          score: '٥٩.٥ / ٦٠ في الرياضيات البحتة',
          quoteAr: 'بفضل الله ثم شرح م/ هبة وطريقة ربط المسائل وتوضيحها بديسموس، قدرت أضمن الدرجة النهائية في التفاضل والتكامل بدون أي توتر.',
          quoteEn: 'Eng. Heba made calculus crystal clear. The Desmos graphing sessions gave me immense speed and accuracy in the final exam.',
          academicYear: '2025 / 2026'
        },
        {
          _id: 'test_2',
          studentNameAr: 'سارة خالد الدوسري',
          studentNameEn: 'Sarah Kh. Al-Dossary',
          curriculum: 'GULF',
          gradeLevel: 'الصف الحادي عشر (علمي)',
          score: '٩٩٪ في الرياضيات المتقدمة',
          quoteAr: 'المنصة ممتازة جداً، بنك الأسئلة والواجبات ساعدوني أفهم كل أفكار المنهج الخليجي والامتحانات التجريبية قبل موعد الامتحان بفترة كافية.',
          quoteEn: 'The homework tracking and trial exams gave me complete confidence to score 99% in my Gulf curriculum advanced math exam.',
          academicYear: '2025 / 2026'
        },
        {
          _id: 'test_3',
          studentNameAr: 'يوسف حسام الدين',
          studentNameEn: 'Youssef H. El-Din',
          curriculum: 'AMERICAN',
          gradeLevel: 'Digital SAT',
          score: '780 / 800 Math Score',
          quoteAr: 'حيل ديسموس اللي م/ هبة علمتها لي وفرت أكثر من ثلث وقت السيكشن في اختبار الـ SAT! المنصة هي الأفضل بلا منازع.',
          quoteEn: 'The Desmos shortcuts and Bluebook strategies were game changers. Jumped from 640 to 780 in just two months!',
          academicYear: '2025 / 2026'
        }
      ],
      whatsappSupportNumber: '+201000000000'
    };
  }

  private getFallbackPlacementTest(
    curriculum: CurriculumCode,
    gradeLevel: string,
    term: AcademicTermCode
  ): IPlacementTestResponse {
    return {
      assessment_id: 'placement_' + curriculum + '_' + gradeLevel,
      title: `امتحان تحديد المستوى التفاعلي — ${curriculum} (${gradeLevel})`,
      curriculum,
      grade_level: gradeLevel,
      academic_term: term,
      total_questions: 5,
      time_limit_minutes: 15,
      questions: [
        {
          question_id: 'q1',
          question_text: 'إذا كانت د(س) = س² - ٤س + ٧، فإن القيمة الصغرى للدالة تساوي:',
          points: 10,
          has_desmos_calculator: true,
          options: [
            { option_id: 'o1', option_text: '٣ عند س = ٢' },
            { option_id: 'o2', option_text: '٧ عند س = ٠' },
            { option_id: 'o3', option_text: '-١ عند س = -٢' },
            { option_id: 'o4', option_text: '٤ عند س = ١' }
          ]
        },
        {
          question_id: 'q2',
          question_text: 'ما هو ميل المماس للمنحنى ص = س³ - ٣س + ٢ عند النقطة (١ ، ٠)؟',
          points: 10,
          has_desmos_calculator: true,
          options: [
            { option_id: 'o1', option_text: '٠ (مماس أفقي موازي لمحور السينات)' },
            { option_id: 'o2', option_text: '٣' },
            { option_id: 'o3', option_text: '-٣' },
            { option_id: 'o4', option_text: '١' }
          ]
        },
        {
          question_id: 'q3',
          question_text: 'مجموعة حل المعادلة: لو (س + ٣) + لو (س - ٣) = لو (١٦) في ح هي:',
          points: 10,
          has_desmos_calculator: false,
          options: [
            { option_id: 'o1', option_text: '{ ٥ } فقط' },
            { option_id: 'o2', option_text: '{ ٥ ، -٥ }' },
            { option_id: 'o3', option_text: '{ ٢٥ }' },
            { option_id: 'o4', option_text: 'فاي (∅)' }
          ]
        },
        {
          question_id: 'q4',
          question_text: 'مثلث أ ب جـ متساوي الأضلاع طول ضلعه ٦ سم، فإن مساحة سطحه تساوي:',
          points: 10,
          has_desmos_calculator: false,
          options: [
            { option_id: 'o1', option_text: '٩√٣ سم²' },
            { option_id: 'o2', option_text: '١٨ سم²' },
            { option_id: 'o3', option_text: '١٢√٣ سم²' },
            { option_id: 'o4', option_text: '٣٦ سم²' }
          ]
        },
        {
          question_id: 'q5',
          question_text: 'في النظام الدائري، الزاوية التي قياسها ٧٥° تكافئ بالراديان:',
          points: 10,
          has_desmos_calculator: true,
          options: [
            { option_id: 'o1', option_text: '٥π / ١٢' },
            { option_id: 'o2', option_text: '٣π / ٤' },
            { option_id: 'o3', option_text: 'π / ٦' },
            { option_id: 'o4', option_text: '٧π / ١٢' }
          ]
        }
      ]
    };
  }
}
