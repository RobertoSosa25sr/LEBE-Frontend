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
    { type: 'text', placeholder: 'Cédula', formControlName: 'id', required: true, variant: 'primary', size: 'large'},
    { type: 'password' , placeholder: 'Contraseña', formControlName: 'password', required: true, variant: 'primary', size: 'large'},
    { type: 'dropdown', placeholder: 'Seleccionar rol', formControlName: 'role', required: true, options: Object.values(ROLES), variant: 'primary', size: 'large'}
  ];

  submitButtonConfig: ButtonConfig = {
    label: 'Iniciar Sesión',
    size: 'large',
    fullWidth: true,
    loading: false,
    disabled: false,
    backgroundColor: 'purple',
    type: 'primary'
  };


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      id: ['', [Validators.required]],
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
      this.submitButtonConfig = {
        ...this.submitButtonConfig,
        loading: true,
        disabled: true
      };
      
      const { id, password, role } = this.loginForm.value;
      
      this.authService.login(id, password, role).subscribe({
        next: () => {
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.isLoading = false;
          this.submitButtonConfig = {
            ...this.submitButtonConfig,
            loading: false,
            disabled: false
          };
        }
      });
    }
  }

}
