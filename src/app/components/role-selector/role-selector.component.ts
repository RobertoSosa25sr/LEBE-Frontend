import { Component, EventEmitter, Input, Output, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Role {
  value: string;
  label: string;
}

@Component({
  selector: 'app-role-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-selector.component.html',
  styleUrls: ['./role-selector.component.css']
})
export class RoleSelectorComponent implements OnInit {
  @Input() roles: Role[] = [];
  @Input() selectedRole: string = '';
  @Output() roleChange = new EventEmitter<string>();

  isOpen = false;

  ngOnInit() {
    if (this.roles.length > 0 && !this.selectedRole) {
      this.selectedRole = this.roles[0].value;
      this.roleChange.emit(this.selectedRole);
    }
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.role-selector')) {
      this.isOpen = false;
    }
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  selectRole(value: string) {
    this.selectedRole = value;
    this.roleChange.emit(value);
    this.isOpen = false;
  }

  getSelectedLabel(): string {
    const selectedRole = this.roles.find(role => role.value === this.selectedRole);
    return selectedRole ? selectedRole.label : '';
  }
} 