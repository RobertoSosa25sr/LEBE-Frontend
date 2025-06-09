export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
  autoClose?: boolean;
}

export interface NotificationOptions {
  duration?: number;
  autoClose?: boolean;
}

export const DEFAULT_NOTIFICATION_DURATION = 5000;
export const DEFAULT_AUTO_CLOSE = true; 