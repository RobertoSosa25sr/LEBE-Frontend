import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-container.component.html',
  styleUrls: ['./form-container.component.css']
})
export class FormContainerComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() maxWidth: string = '400px';
}
