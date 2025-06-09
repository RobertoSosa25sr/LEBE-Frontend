import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  if (authService.getToken()) {
    return true;
  }
  notificationService.warning("Inicie sesión para continuar");
  return router.parseUrl('/login');
};