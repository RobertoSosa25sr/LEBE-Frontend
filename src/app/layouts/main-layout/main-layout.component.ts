import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, NavigationEnd, Router } from '@angular/router';
import { SideMenuComponent } from '../../components/side-menu/side-menu.component';
import { LogoComponent } from '../../components/logo/logo.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, SideMenuComponent, LogoComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  currentTitle = '';
  isMenuCollapsed = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Set initial title based on current route
    this.updateTitle(this.router.url);

    // Update title on navigation
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateTitle(event.url);
      }
    });
  }

  onMenuCollapsed(collapsed: boolean) {
    this.isMenuCollapsed = collapsed;
  }

  private updateTitle(url: string) {
    // Get the menu items from the auth service
    const menuItems = this.authService.getMenuItems();
    
    // Find the menu item that matches the current route
    const currentMenuItem = menuItems.find(item => item.route === url);
    
    // Set the title from the menu item or empty string if not found
    this.currentTitle = currentMenuItem?.label || '';
  }
} 