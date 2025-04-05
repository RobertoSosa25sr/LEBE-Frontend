import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css']
})
export class SideMenuComponent {
  @Input() userRole = 'user'; // 'admin' or 'user'
  isCollapsed = false;

  get menuItems() {
    if (this.userRole === 'admin') {
      return [
        { label: 'INICIO', icon: 'home', route: '/home' },
        { label: 'REPORTES', icon: 'assessment', route: '/reports' },
        { label: 'CITAS', icon: 'calendar_today', route: '/appointments' },
        { label: 'CASOS', icon: 'folder', route: '/cases' },
        { label: 'CLIENTES', icon: 'people', route: '/clients' },
        { label: 'USUARIOS', icon: 'person', route: '/users' }
      ];
    } else {
      return [
        { label: 'INICIO', icon: 'home', route: '/home' },
        { label: 'CITAS', icon: 'calendar_today', route: '/appointments' },
        { label: 'CASOS', icon: 'folder', route: '/cases' },
        { label: 'CLIENTES', icon: 'people', route: '/clients' }
      ];
    }
  }

  toggleMenu() {
    this.isCollapsed = !this.isCollapsed;
  }
} 