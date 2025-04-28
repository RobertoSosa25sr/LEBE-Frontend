import { Component, Input, Output, EventEmitter, AfterViewInit, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { InputFieldConfig } from '../../interfaces/Input-field-config.interface';
import { InputFieldComponent } from '../input-field/input-field.component';
import { ButtonComponent } from '../button/button.component';
import { ButtonConfig } from '../../interfaces/button-config.interface';
import { ActionType } from '../../shared/constants/action-types.constants';

@Component({
  selector: 'app-form-container',
  standalone: true,
  imports: [CommonModule, InputFieldComponent, ButtonComponent, ReactiveFormsModule],
  templateUrl: './form-container.component.html',
  styleUrls: ['./form-container.component.css']
})
export class FormContainerComponent implements AfterViewInit, OnInit {
  @Input() title: string = '';
  @Input() maxWidth: string = 'fit-content';
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
  @Output() onSubmit = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();
  errorMessage: string | null = null;
  isErrorVisible = false;
  initialFormValues: any = {};

  groupedInputFields: { row: number; columns: InputFieldConfig[] }[] = [];

  constructor(private cdr: ChangeDetectorRef, private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
    this.groupInputFields();
  }

  private initializeForm() {
    // Create form controls if they don't exist
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

    // Initialize form tracking only if there are input fields
    if (this.inputFields.length > 0) {
      this.initializeFormTracking();
    }
  }

  private initializeFormTracking() {
    // Store initial form values
    this.initialFormValues = { ...this.form.value };
    
    // Subscribe to form value changes
    this.form.valueChanges.subscribe(() => {
      this.updateSubmitButtonState();
    });

    // Initial state of submit button
    this.updateSubmitButtonState();
  }

  private updateSubmitButtonState() {
    // If there are no input fields, keep the button enabled
    if (this.inputFields.length === 0) {
      this.submitButtonConfig = {
        ...this.submitButtonConfig,
        disabled: false
      };
      return;
    }

    // If there are input fields, enable the button if there are any changes
    const hasChanges = this.hasFormChanges();
    this.submitButtonConfig = {
      ...this.submitButtonConfig,
      disabled: !hasChanges
    };
  }

  private hasFormChanges(): boolean {
    const currentValues = this.form.value;
    
    // Compare each field value with its initial value
    return Object.keys(currentValues).some(key => {
      const currentValue = currentValues[key];
      const initialValue = this.initialFormValues[key];

      // Handle arrays (like in dropdowns)
      if (Array.isArray(currentValue) && Array.isArray(initialValue)) {
        return JSON.stringify(currentValue.sort()) !== JSON.stringify(initialValue.sort());
      }

      // Handle objects (like in complex inputs)
      if (typeof currentValue === 'object' && currentValue !== null) {
        return JSON.stringify(currentValue) !== JSON.stringify(initialValue);
      }

      // Handle other types (strings, numbers, etc.)
      return currentValue !== initialValue;
    });
  }

  handleSubmit() {
    if (this.inputFields.length > 0 && !this.form.valid) {
      this.showFormErrors();
      return;
    }
    this.onSubmit.emit(this.form.value);
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
    // Reset form values
    this.form.reset();
    
    // Reset initial values
    this.initialFormValues = {};
    
    // Reset input fields values
    this.inputFields.forEach(field => {
      if (field.formControlName) {
        field.value = field.type === 'dropdown-select' ? [] : '';
      }
    });

    // Update button state
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

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }
}
