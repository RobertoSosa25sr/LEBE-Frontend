import { Component, OnInit, HostListener, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, NavigationEnd, Router } from '@angular/router';
import { SideMenuComponent } from '../../components/side-menu/side-menu.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, SideMenuComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit, AfterViewInit {
  currentTitle = '';
  isMenuCollapsed = false;
  isScrolled = false;
  @ViewChild('mainContent') mainContent!: ElementRef;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngAfterViewInit() {
    this.mainContent.nativeElement.addEventListener('scroll', () => {
      this.isScrolled = this.mainContent.nativeElement.scrollTop > 50;
    });
  }

  ngOnInit() {
    this.updateTitle(this.router.url);

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
    const menuItems = this.authService.getMenuItems();
    
    const currentMenuItem = menuItems.find(item => item.route === url);
    
    this.currentTitle = currentMenuItem?.label || '';
  }
} 