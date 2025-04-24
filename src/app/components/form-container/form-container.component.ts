import { Component, Input, Output, EventEmitter, AfterViewInit, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { InputFieldConfig } from '../../interfaces/Input-field-config.interface';
import { InputFieldComponent } from '../input-field/input-field.component';
import { ButtonComponent } from '../button/button.component';
import { ButtonConfig } from '../../interfaces/button-config.interface';

@Component({
  selector: 'app-form-container',
  standalone: true,
  imports: [CommonModule, InputFieldComponent, ButtonComponent, ReactiveFormsModule],
  templateUrl: './form-container.component.html',
  styleUrls: ['./form-container.component.css']
})
export class FormContainerComponent implements AfterViewInit, OnInit {
  @Input() title: string = '';
  @Input() maxWidth: string = '400px';
  @Input() form: FormGroup = new FormGroup({});
  @Input() submitButtonText: string = 'Submit';
  @Input() cancelButtonText: string = 'Cancel';
  @Input() inputFields: InputFieldConfig[] = [];
  @Input() submitButtonConfig: ButtonConfig = {label: 'Submit'};
  @Input() cancelButtonConfig: ButtonConfig = {label: ''};
  @Output() onSubmit = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();
  errorMessage: string | null = null;
  isLoading = false;
  isErrorVisible = false;

  constructor(private cdr: ChangeDetectorRef, private fb: FormBuilder) {}

  ngOnInit() {
    if (Object.keys(this.form.controls).length === 0 && this.inputFields.length > 0) {
      const formControls: { [key: string]: FormControl } = {};
      this.inputFields.forEach(field => {
        if (field.formControlName) {
          const validators = field.required ? [Validators.required] : [];
          const initialValue = field.value || '';
          formControls[field.formControlName] = new FormControl(initialValue, validators);
        }
      });
      this.form = this.fb.group(formControls);
    }
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  handleSubmit() {
    const invalidFields = this.inputFields.filter(field => {
      if (!field.required || !field.formControlName) return false;
      const control = this.form.get(field.formControlName);
      return control?.invalid;
    });

    if (invalidFields.length === 0) {
      this.isLoading = true;
      this.isErrorVisible = false;
      this.errorMessage = null;

      // Clean the form data before emitting
      const formData = { ...this.form.value };
      Object.keys(formData).forEach(key => {
        const field = this.inputFields.find(f => f.formControlName === key);
        if (field?.nullable === false && (!formData[key] || formData[key] === '')) {
          delete formData[key];
        }
      });

      console.log('Form data to emit:', formData);

      this.onSubmit.emit(formData);
    } else {
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
    this.onCancel.emit();
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    return '';
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
}
