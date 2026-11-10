import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, shareReplay, tap, throwError } from 'rxjs';

export interface TestimonialItem {
  id: string;
  authorName: string;
  authorRole: 'STUDENT' | 'PARENT';
  curriculum: string;
  gradeLevel: string;
  studentStage: string;
  studentGrade: string;
  reviewText: string;
  rating: number;
  createdAt: string;
}

export interface AdminTestimonialItem extends TestimonialItem {
  userId: string;
  userPhone?: string;
  userEmail?: string;
  studentCode?: string;
  isApproved: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedAt?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class TestimonialsService {
  private readonly http = inject(HttpClient);
  private approvedTestimonials$?: Observable<{ success: boolean; data: TestimonialItem[] }>;

  getApprovedTestimonials(): Observable<{ success: boolean; data: TestimonialItem[] }> {
    if (!this.approvedTestimonials$) {
      this.approvedTestimonials$ = this.http
        .get<{ success: boolean; data: TestimonialItem[] }>('/api/v1/public/testimonials')
        .pipe(
          catchError(err => {
            this.approvedTestimonials$ = undefined;
            return throwError(() => err);
          }),
          shareReplay({ bufferSize: 1, refCount: false })
        );
    }
    return this.approvedTestimonials$;
  }

  submitTestimonial(data: { review_text: string; rating?: number }): Observable<{ success: boolean; data: { submitted: boolean; message: string } }> {
    this.approvedTestimonials$ = undefined;
    return this.http.post<{ success: boolean; data: { submitted: boolean; message: string } }>('/api/v1/public/testimonials', data);
  }

  getAllAdminTestimonials(): Observable<{ success: boolean; data: AdminTestimonialItem[] }> {
    return this.http.get<{ success: boolean; data: AdminTestimonialItem[] }>('/api/v1/admin/testimonials');
  }

  updateAdminTestimonial(id: string, data: Partial<AdminTestimonialItem>): Observable<{ success: boolean; data: any }> {
    return this.http.patch<{ success: boolean; data: any }>(`/api/v1/admin/testimonials/${id}`, data).pipe(
      tap(() => {
        this.approvedTestimonials$ = undefined;
      })
    );
  }

  deleteAdminTestimonial(id: string): Observable<{ success: boolean; data: { deleted: boolean } }> {
    return this.http.delete<{ success: boolean; data: { deleted: boolean } }>(`/api/v1/admin/testimonials/${id}`).pipe(
      tap(() => {
        this.approvedTestimonials$ = undefined;
      })
    );
  }
}
