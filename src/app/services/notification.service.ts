import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Notification, NotificationType } from '../components/notification/notification.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<Notification | null>(null);
  private timeoutId: any;

  get notification$(): Observable<Notification | null> {
    return this.notificationSubject.asObservable();
  }

  show(notification: Notification): void {
    this.notificationSubject.next(notification);
    
    if (notification.duration) {
      this.clearTimeout();
      this.timeoutId = setTimeout(() => {
        this.hide();
      }, notification.duration);
    }
  }

  success(message: string, duration: number = 3000): void {
    this.show({ type: 'success', message, duration });
  }

  error(message: string, duration: number = 5000): void {
    this.show({ type: 'error', message, duration });
  }

  warning(message: string, duration: number = 4000): void {
    this.show({ type: 'warning', message, duration });
  }

  info(message: string, duration: number = 3000): void {
    this.show({ type: 'info', message, duration });
  }

  hide(): void {
    this.clearTimeout();
    this.notificationSubject.next(null);
  }

  private clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
} 