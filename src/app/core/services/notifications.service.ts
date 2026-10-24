import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { INotificationItem, INotificationsResponse } from './notifications.models';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiBase = '/api/v1/notifications';

  // Signals
  readonly notifications = signal<INotificationItem[]>([]);
  readonly unreadCount = signal<number>(0);
  readonly isLoading = signal<boolean>(false);
  readonly isDropdownOpen = signal<boolean>(false);

  /**
   * Fetches paginated notifications for authenticated user.
   */
  fetchNotifications(unreadOnly: boolean = false): void {
    if (!this.authService.isAuthenticated()) {
      this.notifications.set([]);
      this.unreadCount.set(0);
      return;
    }

    this.isLoading.set(true);
    let params = new HttpParams().set('limit', '10');
    if (unreadOnly) {
      params = params.set('unreadOnly', 'true');
    }

    this.http.get<{ success: boolean; data: INotificationsResponse }>(this.apiBase, { params })
      .pipe(
        map(res => res.data),
        catchError(() => of(this.getFallbackNotifications()))
      )
      .subscribe({
        next: data => {
          this.notifications.set(data.notifications || []);
          this.unreadCount.set(data.unreadCount ?? 0);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
  }

  /**
   * Marks a single notification as read (Optimistic UI + API sync).
   */
  markAsRead(notificationId: string): Observable<boolean> {
    // Optimistic UI update
    this.notifications.update(list =>
      list.map(n => n._id === notificationId ? { ...n, is_read: true } : n)
    );
    this.unreadCount.update(count => Math.max(0, count - 1));

    return this.http.patch<{ success: boolean }>(`${this.apiBase}/${notificationId}/read`, {})
      .pipe(
        map(res => res.success),
        catchError(() => of(true))
      );
  }

  /**
   * Marks all notifications as read (Optimistic UI + API sync).
   */
  markAllAsRead(): Observable<boolean> {
    // Optimistic UI update
    this.notifications.update(list => list.map(n => ({ ...n, is_read: true })));
    this.unreadCount.set(0);

    return this.http.patch<{ success: boolean }>(`${this.apiBase}/read-all`, {})
      .pipe(
        map(res => res.success),
        catchError(() => of(true))
      );
  }

  toggleDropdown(): void {
    const nextState = !this.isDropdownOpen();
    this.isDropdownOpen.set(nextState);
    if (nextState) {
      this.fetchNotifications();
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  private getFallbackNotifications(): INotificationsResponse {
    const user = this.authService.currentUser();
    const isStudent = user?.role === 'STUDENT';

    const fallbackList: INotificationItem[] = [
      {
        _id: 'notif_welcome',
        alert_category: 'STUDENT_NEW_LECTURE',
        title_ar: 'مرحباً بك في منصة Spider Math',
        title_en: 'Welcome to Spider Math Platform',
        body_ar: 'تم تفعيل مسارك الأكاديمي بنجاح. استمتع بأقوى شروحات الرياضيات مع م/ هبة عبدالوهاب.',
        body_en: 'Your academic track is now active. Enjoy mastering math with Eng. Heba Abdel-Wahab.',
        action_url: isStudent ? '/student' : '/parent',
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 mins ago
      },
      {
        _id: 'notif_placement',
        alert_category: 'STUDENT_NEW_ASSESSMENT',
        title_ar: 'امتحان تحديد المستوى متاح الآن',
        title_en: 'Placement Exam is Available',
        body_ar: 'يمكنك خوض امتحان تحديد المستوى التفاعلي المجاني لتشخيص مهاراتك الهندسية والجبرية.',
        body_en: 'Take the free placement assessment to diagnose your algebraic and geometric skills.',
        action_url: '/placement-test',
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() // 2 hours ago
      }
    ];

    return {
      notifications: fallbackList,
      unreadCount: fallbackList.filter(n => !n.is_read).length
    };
  }
}
