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
          return [];
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
          total_lectures_count: u.total_lectures_count || 0,
          total_questions_count: u.total_questions_count || 0,
          is_popular: u.is_popular,
          is_subscribed: u.is_subscribed || false,
          is_free_trial: u.is_free_trial || false,
          features_ar: u.features_ar || ['محاضرات تفاعلية مع حاسبة ديسموس', 'واجبات أسبوعية مصححة من المعلمة', 'بنك أسئلة ذكي واختبارات دورية'],
          features_en: u.features_en || ['Interactive lectures with Desmos', 'Weekly teacher-graded homework', 'Smart question bank & quizzes']
        }));
      }),
      catchError(() => of([]))
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
}
