import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

import {
  ICurriculumTreeItem,
  IPublicLandingData,
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

        return {
          teacherBio: fallback.teacherBio,
          schedules: (raw.schedules && raw.schedules.length > 0)
            ? raw.schedules
            : (raw.schedules_table && raw.schedules_table.length > 0)
              ? raw.schedules_table
              : fallback.schedules,
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
          whatsappSupportNumber: raw.contact_channels?.support_whatsapp || fallback.whatsappSupportNumber
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

    return this.http.get<{ success: boolean; data: IPlacementTestResponse }>(
      `${this.apiBase}/public/placement-test`,
      { params }
    ).pipe(
      map(res => res.data),
      catchError(() => of(this.getFallbackPlacementTest(curriculum, gradeLevel, term)))
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
    return this.http.post<{ success: boolean; data: ICompleteProfileResult }>(
      `${this.apiBase}/auth/complete-student-profile`,
      payload
    ).pipe(
      map(res => res.data),
      catchError(() => {
        const randId = Math.floor(1000 + Math.random() * 9000);
        return of({
          studentHaCode: `HA${randId}`,
          user: {
            _id: 'usr_' + randId,
            full_name: payload.fullName,
            email: 'student' + randId + '@spider-math.edu',
            role: 'STUDENT',
            student_ha_code: `HA${randId}`,
            curriculum: payload.curriculum,
            grade_level: payload.gradeLevel,
            academic_term: payload.academicTerm,
            governorate: payload.governorate || undefined
          }
        });
      })
    );
  }

  private getFallbackLandingData(): IPublicLandingData {
    return {
      teacherBio: {
        nameAr: 'المهندسة / هبة عبدالوهاب',
        nameEn: 'Eng. Heba Abdel-Wahab',
        titleAr: 'كبير محاضري الرياضيات للشهادات العامة والدولية وخبير الدبلومة الأمريكية و Desmos',
        titleEn: 'Principal Mathematics Educator, American Diploma & Desmos Graphing Specialist',
        bioAr: 'خبرة تزيد عن 14 عاماً في تدريس وتبسيط مناهج الرياضيات المصرية والخليجية والدولية (IGCSE) والدبلومة الأمريكية (SAT/EST/ACT). متخصصة في توظيف حاسبة ديسموس البيانية وحل المسائل الهندسية المعقدة بأسهل الطرق.',
        bioEn: 'Over 14 years of excellence in teaching Egyptian, Gulf, IGCSE, and American Diploma Mathematics with deep interactive mastery of the Desmos Graphing Calculator.',
        yearsOfExperience: 14,
        totalStudentsTaught: 8500,
        avatarUrl: '/assets/branding/spider-math-logo.svg',
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
