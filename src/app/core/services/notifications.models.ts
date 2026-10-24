export interface INotificationItem {
  readonly _id: string;
  readonly recipient_id?: string;
  readonly recipient_role?: string;
  readonly alert_category: string;
  readonly title_ar: string;
  readonly title_en: string;
  readonly body_ar: string;
  readonly body_en: string;
  readonly action_url?: string | null;
  readonly youtube_solution_url?: string | null;
  readonly is_read: boolean;
  readonly created_at: string;
}

export interface INotificationsPagination {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
}

export interface INotificationsResponse {
  readonly notifications: INotificationItem[];
  readonly unreadCount: number;
  readonly pagination?: INotificationsPagination;
}
