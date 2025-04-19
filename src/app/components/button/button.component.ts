import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css']
})
export class ButtonComponent {
  @Input() type: 'primary' | 'secondary' | 'outline' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() disabled: boolean = false;
  @Input() fullWidth: boolean = false;
  @Input() loading: boolean = false;
  @Input() backgroundColor: 'purple' | 'green' | 'red' = 'purple';
}
