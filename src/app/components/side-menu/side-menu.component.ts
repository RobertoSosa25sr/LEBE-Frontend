import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ModalComponent } from '../modal/modal.component';
import { NotificationService } from '../../services/notification.service';
import { ButtonComponent } from '../button/button.component';
import { InputFieldConfig } from '../../interfaces/Input-field-config.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalComponent],
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css']
})
export class SideMenuComponent implements OnInit {
  @Output() collapsed = new EventEmitter<boolean>();
  isCollapsed = false;
  showLogoutModal = false;
  showPasswordModal = false;
  menuItems$: any;
  menuItems: MenuItem[] = [];
  currentUser$: any;
  currentUser: any;
  form: FormGroup;
  inputPasswordFields: InputFieldConfig[] = [];

  constructor(
    public authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private fb: FormBuilder,
    public userService: UserService
  ) {
    this.form = this.fb.group({
      current_password: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.menuItems$ = this.authService.menuItems$;
    this.menuItems = this.authService.getMenuItems();
    this.currentUser$ = this.authService.currentUser$;
    this.currentUser = this.authService.getCurrentUser();
    this.inputPasswordFields = [
      {
        label: 'Contraseña actual',
        type: 'password',
        placeholder: 'Ingrese su contraseña actual',
        formControlName: 'current_password',
        required: true,
        nullable: false,
        variant: 'secondary',
        size: 'medium',
        width: 'full'
      },
      {
        label: 'Nueva contraseña',
        type: 'password',
        placeholder: 'Ingrese su nueva contraseña',
        formControlName: 'password',
        required: true,
        nullable: false,
        variant: 'secondary',
        size: 'medium',
        width: 'full'
      },
      {
        label: 'Confirmar contraseña',
        type: 'password',
        placeholder: 'Confirme su nueva contraseña',
        formControlName: 'password_confirmation',
        required: true,
        nullable: false,
        variant: 'secondary',
        size: 'medium',
        width: 'full'
      }
    ];
  }

  toggleMenu() {
    this.isCollapsed = !this.isCollapsed;
    this.collapsed.emit(this.isCollapsed);
  }

  onLogoutClick() {
    this.showLogoutModal = true;
  }

  onLogoutSuccess(response: any) {
    this.showLogoutModal = false;
    this.router.navigate(['/login']);
  }

  onLogoutError(error: any) {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onLogoutCancel() {
    this.showLogoutModal = false;
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('password_confirmation');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
  }

  onSettingsClick() {
    this.form.reset();
    this.showPasswordModal = true;
  }

  onPasswordUpdateSuccess(response: any) {
    this.showPasswordModal = false;
    this.form.reset();
  }

  onPasswordUpdateError(error: any) {
  }

  onPasswordUpdateCancel() {
    this.showPasswordModal = false;
    this.form.reset();
  }
} 