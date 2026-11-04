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

        const rawSchedules = Array.isArray(raw.schedulesTable)
          ? raw.schedulesTable
          : Array.isArray(raw.schedules_table)
            ? raw.schedules_table
            : Array.isArray(raw.schedules)
              ? raw.schedules
              : [];

        const normalizedSchedules: IScheduleItem[] = rawSchedules.map((s: any) => ({
          curriculum: s.curriculum || 'EGYPTIAN',
          gradeLevel: s.gradeLevel || s.grade_level || 'SEC_3',
          term: s.term || s.academic_term || 'TERM_1',
          dayOfWeekAr: s.dayOfWeekAr || s.days_ar || s.dayOfWeek || 'الأحد والثلاثاء',
          dayOfWeekEn: s.dayOfWeekEn || s.days_en || 'Sun & Tue',
          dayOfWeek: s.dayOfWeek || s.days_ar || s.dayOfWeekAr || 'الأحد والثلاثاء',
          timeSlot: s.timeSlot || s.time_slot || '',
          lectureTitleAr: s.lectureTitleAr || s.lectureSubject || s.lecture_subject || '',
          lectureTitleEn: s.lectureTitleEn || '',
          lectureSubject: s.lectureSubject || s.lecture_subject || s.lectureTitleAr || ''
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
          activeAcademicTerm: raw.activeAcademicTerm || raw.active_academic_term || fallback.activeAcademicTerm || 'TERM_1',
          announcementBannerTextEn: raw.announcementBannerTextEn || raw.announcement_banner_text_en || '✦ 20% Limited Discount on Term 1 Master Packages for Platform Launch ✦',

          heroBadgeAr: raw.heroBadgeAr || raw.hero_badge_ar || 'Spider Math✦ المنظومة الهندسية الرائدة',
          heroBadgeEn: raw.heroBadgeEn || raw.hero_badge_en || 'Spider Math✦ Engineering Excellence',
          heroCtaPrimaryAr: raw.heroCtaPrimaryAr || raw.hero_cta_primary_ar || 'اختار منهجك وابدأ الآن',
          heroCtaPrimaryEn: raw.heroCtaPrimaryEn || raw.hero_cta_primary_en || 'Choose Your Curriculum & Begin',
          heroCtaSecondaryAr: raw.heroCtaSecondaryAr || raw.hero_cta_secondary_ar || 'امتحان تحديد المستوى المجاني',
          heroCtaSecondaryEn: raw.heroCtaSecondaryEn || raw.hero_cta_secondary_en || 'Free Placement Test',

          teacherNameAr: raw.teacherNameAr || raw.teacher_name_ar || fallback.teacherBio.nameAr,
          teacherNameEn: raw.teacherNameEn || raw.teacher_name_en || fallback.teacherBio.nameEn,
          teacherTitleAr: raw.teacherTitleAr || raw.teacher_title_ar || fallback.teacherBio.titleAr,
          teacherTitleEn: raw.teacherTitleEn || raw.teacher_title_en || fallback.teacherBio.titleEn,
          teacherBioAr: raw.teacherBioAr || raw.teacher_bio_ar || fallback.teacherBio.bioAr,
          teacherBioEn: raw.teacherBioEn || raw.teacher_bio_en || fallback.teacherBio.bioEn,
          teacherQualificationsAr: (raw.teacherQualificationsAr && raw.teacherQualificationsAr.length > 0)
            ? raw.teacherQualificationsAr
            : (raw.teacher_qualifications_ar && raw.teacher_qualifications_ar.length > 0)
              ? raw.teacher_qualifications_ar
              : fallback.teacherBio.qualifications,
          teacherQualificationsEn: (raw.teacherQualificationsEn && raw.teacherQualificationsEn.length > 0)
            ? raw.teacherQualificationsEn
            : (raw.teacher_qualifications_en && raw.teacher_qualifications_en.length > 0)
              ? raw.teacher_qualifications_en
              : [
                'B.Sc. in Engineering — Cairo University with Honors',
                'Certified International Desmos Graphing Calculator Specialist',
                'Certified Instructor for SAT I/II, EST I/II and ACT Math',
                'Consistent top scores and highest student rankings year over year'
              ],
          teacherWhatsappCtaAr: raw.teacherWhatsappCtaAr || raw.teacher_whatsapp_cta_ar || 'تواصل مباشرة مع فريق م/ هبة عبر واتساب',
          teacherWhatsappCtaEn: raw.teacherWhatsappCtaEn || raw.teacher_whatsapp_cta_en || 'Direct WhatsApp Consultation',

          curriculumBadgeAr: raw.curriculumBadgeAr || raw.curriculum_badge_ar || 'المسارات الأكاديمية والمناهج',
          curriculumBadgeEn: raw.curriculumBadgeEn || raw.curriculum_badge_en || 'Academic Tracks & Curriculums',
          curriculumTitleAr: raw.curriculumTitleAr || raw.curriculum_title_ar || 'اختر منهجك الدراسي وابدأ رحلة التفوق',
          curriculumTitleEn: raw.curriculumTitleEn || raw.curriculum_title_en || 'Choose Your Curriculum & Begin Mastery',
          curriculumSubtitleAr: raw.curriculumSubtitleAr || raw.curriculum_subtitle_ar || 'مناهج تعليمية متكاملة مصممة بأعلى معايير الجودة لتناسب نظامك الدراسي',
          curriculumSubtitleEn: raw.curriculumSubtitleEn || raw.curriculum_subtitle_en || 'Comprehensive educational tracks designed with high engineering standards',

          placementBadgeAr: raw.placementBadgeAr || raw.placement_badge_ar || 'اختبار تحديد المستوى وتشخيص المهارات الرياضية',
          placementBadgeEn: raw.placementBadgeEn || raw.placement_badge_en || 'Free Placement & Diagnostic Assessment',
          placementHeadlineAr: raw.placementHeadlineAr || raw.placement_headline_ar || 'ابدأ اختبار تحديد المستوى واكتشف نقاط قوتك وضعفك',
          placementHeadlineEn: raw.placementHeadlineEn || raw.placement_headline_en || 'Assess Your Skills & Discover Your Strengths',
          placementSubtitleAr: raw.placementSubtitleAr || raw.placement_subtitle_ar || 'تقييم تشخيصي تفاعلي ذكي يقيس مهاراتك التأسيسية وحل المسائل التحليلية لتحديد خطتك الأكاديمية بدقة وبإشراف مباشر من المهندسة هبة عبدالوهاب.',
          placementSubtitleEn: raw.placementSubtitleEn || raw.placement_subtitle_en || 'Interactive diagnostic assessment designed to evaluate core foundational concepts and analytical problem solving with instant insights.',
          placementFeature1Ar: raw.placementFeature1Ar || raw.placement_feature_1_ar || 'تقييم ذكي ومباشر',
          placementFeature1En: raw.placementFeature1En || raw.placement_feature_1_en || 'Instant Diagnostic Feedback',
          placementFeature2Ar: raw.placementFeature2Ar || raw.placement_feature_2_ar || 'تقرير مفصل بنقاط القوة والضعف',
          placementFeature2En: raw.placementFeature2En || raw.placement_feature_2_en || 'Strengths & Weaknesses Report',
          placementFeature3Ar: raw.placementFeature3Ar || raw.placement_feature_3_ar || 'متابعة شخصية من م/ هبة عبدالوهاب',
          placementFeature3En: raw.placementFeature3En || raw.placement_feature_3_en || 'Eng. Heba Follow-up',
          placementCtaAr: raw.placementCtaAr || raw.placement_cta_ar || 'ابدأ اختبار تحديد المستوى الآن',
          placementCtaEn: raw.placementCtaEn || raw.placement_cta_en || 'Start Diagnostic Assessment Now',

          scheduleBadgeAr: raw.scheduleBadgeAr || raw.schedule_badge_ar || 'جدول المواعيد والحصص',
          scheduleBadgeEn: raw.scheduleBadgeEn || raw.schedule_badge_en || 'Live Lecture Schedule',
          scheduleTitleAr: raw.scheduleTitleAr || raw.schedule_title_ar || 'مواعيد المحاضرات والبث المباشر',
          scheduleTitleEn: raw.scheduleTitleEn || raw.schedule_title_en || 'Class Timetable & Streaming Schedule',
          scheduleSubtitleAr: raw.scheduleSubtitleAr || raw.schedule_subtitle_ar || 'يتم تحديث المواعيد وفقاً للتوقيت المحلي لمدينة القاهرة',
          scheduleSubtitleEn: raw.scheduleSubtitleEn || raw.schedule_subtitle_en || 'Times shown in Cairo Local Time (GMT+3)',

          pricingBadgeAr: raw.pricingBadgeAr || raw.pricing_badge_ar || 'الباقات الدراسية والمراجعات',
          pricingBadgeEn: raw.pricingBadgeEn || raw.pricing_badge_en || 'Packages & Tuition Plans',
          pricingTitleAr: raw.pricingTitleAr || raw.pricing_title_ar || 'استثمر في مستقبلك الأكاديمي بأعلى معايير الجودة',
          pricingTitleEn: raw.pricingTitleEn || raw.pricing_title_en || 'Transparent Tuition & Revision Packages',
          pricingSubtitleAr: raw.pricingSubtitleAr || raw.pricing_subtitle_ar || 'خطط دراسية مرنة ومراجعات نهائية مكثفة تضمن لك التفوق بأفضل الأسعار',
          pricingSubtitleEn: raw.pricingSubtitleEn || raw.pricing_subtitle_en || 'Flexible study units and intensive final revisions engineered for mastery',

          teacherBio: {
            nameAr: raw.teacherNameAr || raw.teacher_name_ar || fallback.teacherBio.nameAr,
            nameEn: raw.teacherNameEn || raw.teacher_name_en || fallback.teacherBio.nameEn,
            titleAr: raw.teacherTitleAr || raw.teacher_title_ar || fallback.teacherBio.titleAr,
            titleEn: raw.teacherTitleEn || raw.teacher_title_en || fallback.teacherBio.titleEn,
            bioAr: raw.teacherBioAr || raw.teacher_bio_ar || fallback.teacherBio.bioAr,
            bioEn: raw.teacherBioEn || raw.teacher_bio_en || fallback.teacherBio.bioEn,
            yearsOfExperience: fallback.teacherBio.yearsOfExperience,
            totalStudentsTaught: fallback.teacherBio.totalStudentsTaught,
            avatarUrl: fallback.teacherBio.avatarUrl,
            qualifications: (raw.teacherQualificationsAr && raw.teacherQualificationsAr.length > 0)
              ? raw.teacherQualificationsAr
              : (raw.teacher_qualifications_ar && raw.teacher_qualifications_ar.length > 0)
                ? raw.teacher_qualifications_ar
                : fallback.teacherBio.qualifications
          },
          schedules: normalizedSchedules,
          pricingPackages: (raw.pricingPackages && raw.pricingPackages.length > 0)
            ? raw.pricingPackages
            : (raw.pricing_packages && raw.pricing_packages.length > 0)
              ? raw.pricing_packages
              : fallback.pricingPackages,
          whatsappSupportNumber: raw.supportWhatsapp || raw.contact_channels?.support_whatsapp || raw.contact_channels?.subscription_whatsapp || fallback.whatsappSupportNumber,
          contactChannels: raw.contact_channels || raw.contactChannels || undefined,
          landingUnitIds: raw.landingUnitIds || raw.landing_unit_ids || []
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
      map(res => res.data)
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
      heroVideoUrl: 'https://www.youtube.com/watch?v=AOtzdDq7vrI',
      announcementBannerText: '✦ خصم 20% لفترة محدودة على اشتراك باقات الترم الأول بمناسبة تدشين المنصة ✦',
      isAnnouncementActive: true,
      activeAcademicYear: '2026 / 2027',
      activeAcademicTerm: 'TERM_1',
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
      schedules: [],
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
      whatsappSupportNumber: '',
      contactChannels: {
        subscription_whatsapp: '',
        support_whatsapp: ''
      }
    };
  }
}
