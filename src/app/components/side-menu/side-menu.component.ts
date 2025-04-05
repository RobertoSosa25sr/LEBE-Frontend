import { Component } from '@angular/core';
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
  isCollapsed = false;

  menuItems = [
    { label: 'INICIO', icon: 'home', route: '/home' },
    { label: 'REPORTES', icon: 'assessment', route: '/reports' },
    { label: 'CITAS', icon: 'calendar_today', route: '/appointments' },
    { label: 'CASOS', icon: 'folder', route: '/cases' },
    { label: 'CLIENTES', icon: 'people', route: '/clients' },
    { label: 'USUARIOS', icon: 'person', route: '/users' }
  ];

  toggleMenu() {
    this.isCollapsed = !this.isCollapsed;
  }
} 