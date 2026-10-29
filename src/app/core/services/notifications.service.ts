import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { INotificationItem, INotificationsResponse } from './notifications.models';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiBase = '/api/v1/notifications';

  // Signals
  readonly notifications = signal<INotificationItem[]>([]);
  readonly unreadCount = signal<number>(0);
  readonly isLoading = signal<boolean>(false);
  readonly isDropdownOpen = signal<boolean>(false);
  readonly permissionStatus = signal<NotificationPermission>('default');
  readonly isSupported = signal<boolean>(false);
  readonly isPromptDismissed = signal<boolean>(false);
  readonly isServiceWorkerReady = signal<boolean>(false);

  // Internal tracking
  private knownNotificationIds = new Set<string>();
  private isInitialLoadDone = false;
  private pollingTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      if ('Notification' in window) {
        this.isSupported.set(true);
        this.permissionStatus.set(Notification.permission);
      }

      // Check if user previously dismissed banner in this session
      const dismissed = sessionStorage.getItem('spider_notif_prompt_dismissed');
      if (dismissed === 'true') {
        this.isPromptDismissed.set(true);
      }

      this.registerServiceWorker();
      this.initBackgroundPolling();
    }
  }

  /**
   * Registers lightweight ServiceWorker for push & desktop notifications.
   */
  private registerServiceWorker(): void {
    if (!isPlatformBrowser(this.platformId) || !('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        this.isServiceWorkerReady.set(true);
        console.log('[Spider Math] Notifications ServiceWorker registered:', reg.scope);
      })
      .catch((err) => {
        console.warn('[Spider Math] ServiceWorker registration skipped:', err);
      });
  }

  /**
   * Initializes periodic background polling (every 25 seconds).
   */
  private initBackgroundPolling(): void {
    if (this.pollingTimer) return;

    // Check periodically for new notifications when authenticated
    this.pollingTimer = setInterval(() => {
      if (this.authService.isAuthenticated()) {
        this.fetchNotifications(false, true);
      }
    }, 25000);
  }

  /**
   * Requests native Web Notification permission from user browser.
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!isPlatformBrowser(this.platformId) || !('Notification' in window)) {
      this.permissionStatus.set('denied');
      return 'denied';
    }

    try {
      const perm = await Notification.requestPermission();
      this.permissionStatus.set(perm);

      if (perm === 'granted') {
        this.isPromptDismissed.set(true);
        this.playNotificationChime();
        await this.showRealBrowserNotification({
          title: 'Spider Math | تم تفعيل الإشعارات الفورية بنجاح 🔔',
          body: 'ستصلك الآن تنبيهات تصحيح الواجبات والامتحانات والدروس الجديدة حتى عندما تكون خارج المنصة!',
          url: '/'
        });
      }

      return perm;
    } catch (err) {
      console.warn('[Spider Math] Notification permission request error:', err);
      return 'denied';
    }
  }

  /**
   * Dismisses the top floating notification prompt banner for the current session.
   */
  dismissPrompt(): void {
    this.isPromptDismissed.set(true);
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('spider_notif_prompt_dismissed', 'true');
    }
  }

  /**
   * Triggers an immediate test notification for the user to verify native desktop/mobile alerts.
   */
  sendTestNotification(): void {
    this.showRealBrowserNotification({
      title: 'Spider Math | اختبار الإشعارات الفورية 🎯',
      body: 'مبروك! نظام الإشعارات الفورية يعمل بنجاح وستصلك كل التنبيهات حتى أثناء تصفحك لأي موقع آخر!',
      url: '/'
    });
  }

  /**
   * Dispatches a real native OS/Browser notification via ServiceWorker or Notification API.
   */
  async showRealBrowserNotification(opts: {
    title: string;
    body: string;
    url?: string;
    tag?: string;
  }): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    this.playNotificationChime();

    const title = opts.title || 'Spider Math Platform';
    const notifOptions: NotificationOptions = {
      body: opts.body,
      icon: '/assets/branding/spider-math-logo.png',
      badge: '/assets/branding/spider-math-logo.png',
      tag: opts.tag || `spider-${Date.now()}`,
      data: { url: opts.url || '/' }
    };

    // 1. Try ServiceWorker Registration (Standard for Android Chrome and background tabs)
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.showNotification) {
          await reg.showNotification(title, notifOptions);
          return;
        }
      } catch {
        // Fallback to Window Notification below
      }
    }

    // 2. Direct Window Notification (Desktop browsers)
    try {
      const n = new Notification(title, notifOptions);
      n.onclick = (event) => {
        event.preventDefault();
        window.focus();
        if (opts.url) {
          this.router.navigateByUrl(opts.url);
        }
        n.close();
      };
    } catch (err) {
      console.warn('[Spider Math] Native notification instantiation error:', err);
    }
  }

  /**
   * Plays a pleasant, gentle dual-tone notification chime using the Web Audio API.
   */
  playNotificationChime(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Note 1: Bell fundamental (F#5: 740 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(739.99, now);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.45);

      // Note 2: Bell overtone (A#5: 932 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(932.33, now + 0.1);
      gain2.gain.setValueAtTime(0.25, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.7);
    } catch {
      // Audio might be muted or blocked by autoplay policy
    }
  }

  /**
   * Fetches paginated notifications for authenticated user, with real-time new alert detection.
   */
  fetchNotifications(unreadOnly: boolean = false, isBackgroundPolling: boolean = false): void {
    if (!this.authService.isAuthenticated()) {
      this.notifications.set([]);
      this.unreadCount.set(0);
      return;
    }

    if (!isBackgroundPolling) {
      this.isLoading.set(true);
    }

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
        next: (data) => {
          const incomingList = data.notifications || [];
          const newUnreadCount = data.unreadCount ?? 0;

          // If this is a subsequent poll, detect newly arrived unread notifications
          if (this.isInitialLoadDone && this.permissionStatus() === 'granted') {
            const newlyArrived = incomingList.filter(
              (n) => !n.is_read && !this.knownNotificationIds.has(n._id)
            );

            // Dispatch real browser notification for newly arrived items
            for (const notif of newlyArrived) {
              this.showRealBrowserNotification({
                title: notif.title_ar || notif.title_en || 'Spider Math',
                body: notif.body_ar || notif.body_en || 'لديك تنبيه جديد في منصة سبايدر ماث',
                url: notif.action_url || '/',
                tag: notif._id
              });
            }
          }

          // Update tracking IDs
          for (const notif of incomingList) {
            this.knownNotificationIds.add(notif._id);
          }
          this.isInitialLoadDone = true;

          this.notifications.set(incomingList);
          this.unreadCount.set(newUnreadCount);
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
        created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
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
        created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString()
      }
    ];

    return {
      notifications: fallbackList,
      unreadCount: fallbackList.filter(n => !n.is_read).length
    };
  }
}
