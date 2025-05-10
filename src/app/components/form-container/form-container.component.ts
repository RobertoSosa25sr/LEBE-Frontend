import { Component, Input, Output, EventEmitter, AfterViewInit, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { InputFieldConfig } from '../../interfaces/Input-field-config.interface';
import { InputFieldComponent } from '../input-field/input-field.component';
import { ButtonComponent } from '../button/button.component';
import { ButtonConfig } from '../../interfaces/button-config.interface';
import { ActionType } from '../../shared/constants/action-types.constants';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-form-container',
  standalone: true,
  imports: [CommonModule, InputFieldComponent, ButtonComponent, ReactiveFormsModule],
  templateUrl: './form-container.component.html',
  styleUrls: ['./form-container.component.css']
})
export class FormContainerComponent implements AfterViewInit, OnInit {
  @Input() title: string = '';
  @Input() maxWidth: string = '100%';
  @Input() form: FormGroup = new FormGroup({});
  @Input() submitButtonText: string = 'Submit';
  @Input() cancelButtonText: string = 'Cancel';
  @Input() showCancelButton: boolean = true;
  @Input() inputFields: InputFieldConfig[] = [];
  @Input() submitButtonConfig: ButtonConfig = {
    label: 'Submit',
    type: 'primary',
    backgroundColor: 'green',
    icon: ActionType.CREATE,
    disabled: false
  };
  @Input() cancelButtonConfig: ButtonConfig = {
    label: 'Cancel',
    type: 'outline',
    backgroundColor: '',
    disabled: false
  };
  @Input() apiService: any;
  @Input() apiMethod: string = '';
  @Input() apiServiceParams: any[] = [];
  @Input() responseDataKey: string = '';
  @Input() successMessage: string = 'Operación exitosa';
  @Input() successRedirect: string = '';
  @Input() apiErrorMessage: string = 'Error al realizar la operación';
  @Output() onSubmit = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSuccess = new EventEmitter<any>();
  @Output() onError = new EventEmitter<any>();
  errorMessage: string | null = null;
  isErrorVisible = false;
  initialFormValues: any = {};
  originalFieldConfigs: { [key: string]: boolean } = {};

  groupedInputFields: { row: number; columns: InputFieldConfig[] }[] = [];

  constructor(
    private cdr: ChangeDetectorRef, 
    private fb: FormBuilder,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.groupInputFields();
    this.storeOriginalFieldConfigs();
  }

  private initializeForm() {
    if (Object.keys(this.form.controls).length === 0 && this.inputFields.length > 0) {
      const formControls: { [key: string]: FormControl } = {};
      this.inputFields.forEach(field => {
        if (field.formControlName) {
          const validators = field.required ? [Validators.required] : [];
          const initialValue = field.value || (field.type === 'dropdown-select' ? [] : '');
          formControls[field.formControlName] = new FormControl(initialValue, validators);
        }
      });
      this.form = this.fb.group(formControls);
    }

    if (this.inputFields.length > 0) {
      this.initializeFormTracking();
    }
  }

  private initializeFormTracking() {
    this.initialFormValues = { ...this.form.value };
    
    this.form.valueChanges.subscribe(() => {
      this.updateSubmitButtonState();
    });

    this.updateSubmitButtonState();
  }

  private updateSubmitButtonState() {
    if (this.inputFields.length === 0) {
      this.submitButtonConfig = {
        ...this.submitButtonConfig,
        disabled: false
      };
      return;
    }

    const hasChanges = this.hasFormChanges();
    this.submitButtonConfig = {
      ...this.submitButtonConfig,
      disabled: !hasChanges
    };
  }

  private hasFormChanges(): boolean {
    const currentValues = this.form.value;
    
    return Object.keys(currentValues).some(key => {
      const currentValue = currentValues[key];
      const initialValue = this.initialFormValues[key];
      
      if (Array.isArray(currentValue) && Array.isArray(initialValue)) {
        return JSON.stringify(currentValue.sort()) !== JSON.stringify(initialValue.sort());
      }

      if (typeof currentValue === 'object' && currentValue !== null) {
        return JSON.stringify(currentValue) !== JSON.stringify(initialValue);
      }

      return currentValue !== initialValue;
    });
  }

  handleSubmit() {
    this.submitButtonConfig = {
      ...this.submitButtonConfig,
      disabled: true
    };
    this.cancelButtonConfig = {
      ...this.cancelButtonConfig,
      disabled: true
    };
    for (const field of this.inputFields) {
      field.readonly = true;
    }
    if (this.inputFields.length > 0 && !this.form.valid) {
      this.showFormErrors();
      return;
    }
      if (this.apiService && this.apiMethod) {
      this.handleApiCall();
    } else {
      this.onSubmit.emit(this.form.value);
    }
  }

  private handleApiCall() {
    const formData = this.form.value;
    let apiCall$: Observable<any>;

    if (this.apiServiceParams && this.apiServiceParams.length > 0) {
      // If we have service params, they should be the first arguments
      apiCall$ = this.apiService[this.apiMethod](...this.apiServiceParams, formData);
    } else {
      // For all methods, pass the form data as a single object
      apiCall$ = this.apiService[this.apiMethod](formData);
    }

    if (apiCall$ instanceof Observable) {
      apiCall$.subscribe({
        next: (response) => {
          if (this.successMessage) {
            this.notificationService.success(this.successMessage);
          }
          if (this.successRedirect) {
            this.router.navigate([this.successRedirect]);
          }
          this.onSuccess.emit(response);
        },
        error: (error) => {
          this.notificationService.error(error.error.message || this.apiErrorMessage);
          this.onError.emit(error);
          this.resetFormState();
        }
      });
    }
  }

  private resetFormState() {
    this.submitButtonConfig = {
      ...this.submitButtonConfig,
      disabled: false
    };
    this.cancelButtonConfig = {
      ...this.cancelButtonConfig,
      disabled: false
    };
    // Restore original readonly states
    this.inputFields.forEach(field => {
      if (field.formControlName) {
        field.readonly = this.originalFieldConfigs[field.formControlName];
      }
    });
  }

  private showFormErrors() {
    const invalidFields = this.inputFields.filter(field => {
      if (!field.required || !field.formControlName) return false;
      const control = this.form.get(field.formControlName);
      return control?.invalid;
    });

    if (invalidFields.length > 0) {
      const fieldLabels = invalidFields.map(field => field.label || field.formControlName).join(', ');
      this.errorMessage = `Los siguientes campos son requeridos: ${fieldLabels}`;
      this.isErrorVisible = true;
      
      setTimeout(() => {
        this.isErrorVisible = false;
        setTimeout(() => {
          this.errorMessage = null;
          this.cdr.detectChanges();
        }, 300);
      }, 3000);
    }
  }

  handleCancel() {
    this.cleanForm();
    this.onCancel.emit();
  }

  private cleanForm() {
    this.form.reset();
    this.initialFormValues = {};
    
    this.inputFields.forEach(field => {
      if (field.formControlName) {
        field.value = field.type === 'dropdown-select' ? [] : '';
      }
    });

    this.updateSubmitButtonState();
  }

  getFieldValue(field: InputFieldConfig): string {
    return field.formControlName || '';
  }

  getFieldReadonly(field: InputFieldConfig): boolean {
    return field.readonly || false;
  }

  getFieldRequired(field: InputFieldConfig): boolean {
    return field.required || false;
  }

  getFieldNullable(field: InputFieldConfig): boolean {
    return field.nullable || false;
  }

  private groupInputFields() {
    this.groupedInputFields = [];
    let currentRow = 1;
    let currentColumns: InputFieldConfig[] = [];

    this.inputFields.forEach((field, index) => {
      const width = field.width || 'full';
      
      if (width === 'full') {
        if (currentColumns.length > 0) {
          this.groupedInputFields.push({ row: currentRow, columns: [...currentColumns] });
          currentColumns = [];
          currentRow++;
        }
        this.groupedInputFields.push({ row: currentRow, columns: [field] });
        currentRow++;
      } else if (width === '50%') {
        currentColumns.push(field);
        if (currentColumns.length === 2 || index === this.inputFields.length - 1) {
          this.groupedInputFields.push({ row: currentRow, columns: [...currentColumns] });
          currentColumns = [];
          currentRow++;
        }
      }
    });
  }

  private storeOriginalFieldConfigs() {
    this.inputFields.forEach(field => {
      if (field.formControlName) {
        this.originalFieldConfigs[field.formControlName] = field.readonly || false;
      }
    });
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }
}
