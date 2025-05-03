import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.css']
})
export class LogoComponent {
  @Input() size: 'small' |'large' = 'small';
  @Input() position: 'left' | 'right' = 'left';
  @Input() alt: string = 'Logo';
}
