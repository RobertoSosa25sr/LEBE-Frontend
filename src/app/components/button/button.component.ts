import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonConfig } from '../../interfaces/button-config.interface';
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css']
})
export class ButtonComponent {
  @Input() buttonConfig: ButtonConfig = {
    type: 'primary',
    backgroundColor: 'purple',
    label: '',
    size: 'medium',
    fullWidth: false,
    loading: false,
    disabled: false,
    icon: '',
    routerLink: [],
    action: () => {}
  };
}
