import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { IUnitPackageItem, IWhatsAppLinkResponse } from './units-subscriptions.models';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UnitsSubscriptionsService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiBase = '/api/v1';

  /**
   * Fetches published unit packages filtered by taxonomy query.
   */
  getUnitsCatalog(query: {
    curriculum?: string;
    gradeLevel?: string;
    term?: string;
    type?: 'STUDY_UNIT' | 'FINAL_REVISION';
  }): Observable<IUnitPackageItem[]> {
    let params = new HttpParams();
    if (query.curriculum) params = params.set('curriculum', query.curriculum);
    if (query.gradeLevel) params = params.set('gradeLevel', query.gradeLevel);
    if (query.term) params = params.set('term', query.term);
    if (query.type) params = params.set('type', query.type);

    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiBase}/units`, { params }).pipe(
      map(res => {
        if (!res.data || res.data.length === 0) {
          return this.getFallbackUnits(query.curriculum, query.gradeLevel, query.term, query.type);
        }
        return res.data.map(u => ({
          _id: u._id || u.id,
          curriculum: u.curriculum,
          grade_level: u.grade_level,
          academic_term: u.academic_term,
          type: u.type,
          title_ar: u.title_ar,
          title_en: u.title_en,
          description_ar: u.description_ar,
          description_en: u.description_en,
          price_egp: u.price_egp,
          original_price_egp: u.original_price_egp,
          total_lectures_count: u.total_lectures_count || 6,
          total_questions_count: u.total_questions_count || 120,
          is_popular: u.is_popular,
          is_subscribed: u.is_subscribed || false,
          is_free_trial: u.is_free_trial || false,
          features_ar: u.features_ar || ['محاضرات تفاعلية مع حاسبة ديسموس', 'واجبات أسبوعية مصححة من المعلمة', 'بنك أسئلة ذكي واختبارات دورية'],
          features_en: u.features_en || ['Interactive lectures with Desmos', 'Weekly teacher-graded homework', 'Smart question bank & quizzes']
        }));
      }),
      catchError(() => of(this.getFallbackUnits(query.curriculum, query.gradeLevel, query.term, query.type)))
    );
  }

  /**
   * Requests WhatsApp subscription activation link for a specific unit package.
   * Calls POST /api/v1/subscriptions/whatsapp-request-link
   */
  requestWhatsAppSubscription(unitPackageId: string): Observable<IWhatsAppLinkResponse> {
    return this.http.post<{ success: boolean; data: IWhatsAppLinkResponse }>(
      `${this.apiBase}/subscriptions/whatsapp-request-link`,
      { unitPackageId }
    ).pipe(
      map(res => res.data),
      catchError(() => {
        // Fallback WhatsApp link generation if backend endpoint returns error or demo token is used
        const user = this.authService.currentUser();
        const studentCode = user?.student_ha_code || 'HA1001';
        const studentName = user?.full_name || 'طالب سبايدر ماث';
        const msg = encodeURIComponent(
          `مرحباً م/ هبة عبدالوهاب، أرغب في تفعيل اشتراكي على منصة سبايدر ماث للوحدة المطلوبة.\nكود الطالب: ${studentCode}\nالاسم: ${studentName}\nمعرف الباقة: ${unitPackageId}`
        );
        return of({
          whatsappUrl: `https://wa.me/201000000001?text=${msg}`,
          studentCode,
          unitTitle: 'الوحدة الدراسية المختارة',
          priceEgp: 350
        });
      })
    );
  }

  private getFallbackUnits(
    curriculum: string = 'EGYPTIAN',
    gradeLevel: string = 'SEC_3',
    term: string = 'TERM_1',
    type?: 'STUDY_UNIT' | 'FINAL_REVISION'
  ): IUnitPackageItem[] {
    const allUnits: IUnitPackageItem[] = [
      {
        _id: '507f1f77bcf86cd799439011',
        curriculum,
        grade_level: gradeLevel,
        academic_term: term,
        type: 'STUDY_UNIT',
        title_ar: 'الوحدة الأولى: التفاضل والتكامل المتقدم والتطبيقات الحياتية',
        title_en: 'Unit 1: Advanced Calculus & Real-World Applications',
        description_ar: 'تغطية شاملة لمعدلات التغير المرتبطة، نهايات الدوال المثلثية، والتطبيقات الهندسية لحساب التفاضل مع حل تمارين ديسموس التفاعلية.',
        description_en: 'Complete coverage of related rates, trigonometric limits, and geometric optimization with Desmos workouts.',
        price_egp: 350,
        original_price_egp: 450,
        total_lectures_count: 8,
        total_questions_count: 140,
        is_popular: true,
        features_ar: ['8 محاضرات مسجلة بجودة 4K فائقة', 'تدريب عملي على اختصارات ديسموس', 'واجبات إلكترونية ومقالية مصححة', 'مذكرات PDF محمية'],
        features_en: ['8 High-definition 4K masterclasses', 'Hands-on Desmos shortcut training', 'Auto-graded & teacher-reviewed tasks', 'Protected PDF study handouts']
      },
      {
        _id: '507f1f77bcf86cd799439012',
        curriculum,
        grade_level: gradeLevel,
        academic_term: term,
        type: 'STUDY_UNIT',
        title_ar: 'الوحدة الثانية: الهندسة الفراغية والضرب القياسي والاتجاهي',
        title_en: 'Unit 2: Spatial Solid Geometry & Vector Products',
        description_ar: 'شرح مجسمات الفراغ، متجهات الموضع في الإحداثيات ثلاثية الأبعاد، ومعادلات الخط المستقيم والمستوى في الفراغ مع رسومات ثلاثية الأبعاد تفاعلية.',
        description_en: 'In-depth 3D vectors, dot and cross products, lines and planes in 3D Euclidean space with interactive visuals.',
        price_egp: 300,
        original_price_egp: 400,
        total_lectures_count: 6,
        total_questions_count: 110,
        is_popular: false,
        features_ar: ['6 محاضرات هندسية شاملة', 'بنك أسئلة الوزارة والنماذج الاسترشادية', 'تطبيق مجسمات الفراغ التفاعلي'],
        features_en: ['6 Comprehensive lectures', 'Curated ministry exam questions', 'Interactive 3D geometry tool']
      },
      {
        _id: '507f1f77bcf86cd799439013',
        curriculum,
        grade_level: gradeLevel,
        academic_term: term,
        type: 'FINAL_REVISION',
        title_ar: 'المراجعة النهائية المكثفة وبنك أسئلة الامتحانات الشاملة',
        title_en: 'Intensive Final Revision & Comprehensive Exam Bank',
        description_ar: 'معسكر تدريبي مكثف لحل أكثر من 300 سؤال اختياري ومقالي متوقع، مع ورش عمل مباشرة واستراتيجيات توفير الوقت في لجان الامتحان.',
        description_en: 'High-yield exam bootcamp covering 300+ predicted questions, speed-solving tactics, and simulated mock exams.',
        price_egp: 450,
        original_price_egp: 600,
        total_lectures_count: 10,
        total_questions_count: 320,
        is_popular: true,
        features_ar: ['10 ورش عمل لحل الامتحانات', 'استراتيجيات الحل السريع بالآلة وديسموس', 'امتحانان شاملان بنظام الترقيم الرسمي', 'دعم واتساب خاص قبل الامتحان'],
        features_en: ['10 Exam solving workshops', 'Speed-solving tactics with Desmos', '2 Full simulated timed exams', 'Dedicated pre-exam WhatsApp support']
      }
    ];

    if (type) {
      return allUnits.filter(u => u.type === type);
    }
    return allUnits;
  }
}
