import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormContainerComponent } from '../../components/form-container/form-container.component';
import { LogoComponent } from '../../components/logo/logo.component';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { InputFieldConfig } from '../../interfaces/Input-field-config.interface';
import { ButtonConfig } from '../../interfaces/button-config.interface';
import { ROLES } from '../../shared/constants/roles.constants';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormContainerComponent,
    LogoComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  selectedRole = '';

  inputFields: InputFieldConfig[] = [
    { label: 'Cédula', type: 'text', placeholder: 'Cédula', formControlName: 'id_number', required: true, variant: 'primary', size: 'large'},
    { label: 'Contraseña', type: 'password' , placeholder: 'Contraseña', formControlName: 'password', required: true, variant: 'primary', size: 'large'},
    { label: 'Rol', type: 'dropdown', placeholder: 'Seleccionar rol', formControlName: 'role', required: true, options: Object.values(ROLES), variant: 'primary', size: 'large'}
  ];

  submitButtonConfig: ButtonConfig = {
    label: 'Iniciar Sesión',
    size: 'large',
    fullWidth: true,
    loading: false,
    disabled: false,
    icon: 'login',
    backgroundColor: 'purple',
    type: 'primary'
  };

  cancelButtonConfig: ButtonConfig = {
    label: 'Cancelar',
    size: 'large',
    fullWidth: true,
    type: 'secondary'
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      id_number: ['', [Validators.required]],
      password: ['', [Validators.required]],
      role: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loginForm.get('role')?.valueChanges.subscribe(role => {
      this.selectedRole = role;
    });
  }

  handleSubmit() {
    console.log(this.loginForm.value);
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      const { id_number, password, role } = this.loginForm.value;
      
      this.authService.login(id_number, password, role).subscribe({
        next: () => {
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.isLoading = false;
        }
      });
    }
  }

  handleCancel() {
    this.router.navigate(['/']);
  }
}
