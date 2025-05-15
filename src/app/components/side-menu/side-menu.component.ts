import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ModalComponent } from '../modal/modal.component';
import { NotificationService } from '../../services/notification.service';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalComponent],
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css']
})
export class SideMenuComponent implements OnInit {
  @Output() collapsed = new EventEmitter<boolean>();
  isCollapsed = false;
  showLogoutModal = false;
  menuItems$: any;
  menuItems: MenuItem[] = [];
  currentUser$: any;
  currentUser: any;

  constructor(
    public authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.menuItems$ = this.authService.menuItems$;
    this.menuItems = this.authService.getMenuItems();
    this.currentUser$ = this.authService.currentUser$;
    this.currentUser = this.authService.getCurrentUser();
  }

  toggleMenu() {
    this.isCollapsed = !this.isCollapsed;
    this.collapsed.emit(this.isCollapsed);
  }

  onLogoutClick() {
    this.showLogoutModal = true;
  }

  onLogoutSuccess(response: any) {
    this.showLogoutModal = false;
    this.router.navigate(['/login']);
  }

  onLogoutError(error: any) {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onLogoutCancel() {
    this.showLogoutModal = false;
  }
} 