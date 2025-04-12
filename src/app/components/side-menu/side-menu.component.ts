import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmationModalComponent],
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css']
})
export class SideMenuComponent implements OnInit {
  isCollapsed = false;
  showLogoutModal = false;
  menuItems: MenuItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.menuItems = this.authService.getMenuItems();     
  }

  toggleMenu() {
    this.isCollapsed = !this.isCollapsed;
  }

  onLogoutClick() {
    this.showLogoutModal = true;
  }

  onLogoutConfirm() {
    this.authService.logout();
    this.showLogoutModal = false;
    this.router.navigate(['/login']);
  }

  onLogoutCancel() {
    this.showLogoutModal = false;
  }
} 