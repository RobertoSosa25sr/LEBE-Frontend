import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputFieldComponent } from '../../components/input-field/input-field.component';
import { ButtonComponent } from '../../components/button/button.component';
import { FormContainerComponent } from '../../components/form-container/form-container.component';
import { LogoComponent } from '../../components/logo/logo.component';
import { RoleSelectorComponent } from '../../components/role-selector/role-selector.component';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputFieldComponent,
    ButtonComponent,
    FormContainerComponent,
    LogoComponent,
    RoleSelectorComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  selectedRole = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      idNumber: ['', [Validators.required]],
      password: ['', [Validators.required]],
      role: ['', Validators.required]
    });
  }

  onRoleChange(role: string) {
    this.selectedRole = role;
    this.loginForm.patchValue({ role });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const { idNumber, password, role } = this.loginForm.value;
      
      this.authService.login(idNumber, password, role).subscribe({
        next: () => {
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error.message || 'Error al iniciar sesión';
        }
      });
    } else {
      this.errorMessage = 'Por favor complete todos los campos correctamente.';
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    return '';
  }
}
