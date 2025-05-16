import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonConfig } from '../../interfaces/button-config.interface';
import { ActionType, ACTION_ICONS, ACTION_COLORS } from '../../shared/constants/action-types.constants';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css']
})
export class ButtonComponent<T = any> {
  @Input() buttonConfig: ButtonConfig = {
    type: 'primary',
    backgroundColor: '',
    label: '',
    size: 'medium',
    fullWidth: false,
    loading: false,
    disabled: false,
    icon: '',
    routerLink: [],
    action: (item: T | undefined) => {}
  };
  @Input() item!: T;
  @Output() action = new EventEmitter<void>();

  getIconClass(): string {
    return ACTION_ICONS[this.buttonConfig.icon as ActionType] || (this.buttonConfig.icon? this.buttonConfig.icon : 'fa-solid fa-question');
  }

  getColorClass(): string {
    return ACTION_COLORS[this.buttonConfig.icon as ActionType] || (this.buttonConfig.backgroundColor? this.buttonConfig.backgroundColor : 'purple');
  }

  onClick() {
    if (this.buttonConfig.action) {
      this.buttonConfig.action(this.item);
    }
    this.action.emit();
  }
}



