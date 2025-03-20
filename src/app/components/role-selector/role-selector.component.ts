import { Component, EventEmitter, Input, Output, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-role-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-selector.component.html',
  styleUrls: ['./role-selector.component.css']
})
export class RoleSelectorComponent implements OnInit {
  @Input() selectedRole: string = 'admin';
  @Output() roleChange = new EventEmitter<string>();

  isOpen = false;

  roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'user', label: 'Usuario' }
  ];

  ngOnInit() {
    // Ensure the initial value is emitted
    this.roleChange.emit(this.selectedRole);
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
    return selectedRole ? selectedRole.label : 'Administrador';
  }
} 