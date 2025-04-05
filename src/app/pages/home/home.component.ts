import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideMenuComponent } from '../../components/side-menu/side-menu.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SideMenuComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
} 