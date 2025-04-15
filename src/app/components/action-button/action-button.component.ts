import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface ActionButtonConfig<T = any> {
  icon: 'edit' | 'delete' | 'cancel' | 'more';
  action?: (item: T) => void;
  routerLink?: string[] | ((item: T) => string[]);
  tooltip?: string;
}

@Component({
  selector: 'app-action-button',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <button 
      class="action-button"
      [class]="getColorClass()"
      (click)="onClick()"
      [routerLink]="routerLink"
      [title]="config.tooltip">
      <i [class]="getIconClass()"></i>
    </button>
  `,
  styleUrls: ['./action-button.component.css']
})
export class ActionButtonComponent<T = any> {
  @Input() config!: ActionButtonConfig<T>;
  @Input() item!: T;
  @Output() action = new EventEmitter<void>();

  get routerLink() {
    if (typeof this.config.routerLink === 'function') {
      return this.config.routerLink(this.item);
    }
    return this.config.routerLink;
  }

  getIconClass(): string {
    switch (this.config.icon) {
      case 'delete':
        return 'fa-regular fa-trash-can';
      case 'cancel':
        return 'fa-solid fa-xmark';
      case 'more':
        return 'fa-solid fa-list';
      case 'edit':
        return 'fa-regular fa-pen-to-square';
      default:
        return 'fa-solid fa-question';
    }
  }

  getColorClass(): string {
    switch (this.config.icon) {
      case 'edit':
        return 'edit';
      case 'delete':
        return 'danger';
      case 'cancel':
        return 'cancel';
      case 'more':
        return 'more';
      default:
        return 'edit';
    }
  }

  onClick() {
    if (this.config.action) {
      this.config.action(this.item);
    }
    this.action.emit();
  }
} 