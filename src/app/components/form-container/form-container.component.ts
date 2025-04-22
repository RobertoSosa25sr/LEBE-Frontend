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
  @Output() onSubmit = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  errorMessage: string | null = null;
  isLoading = false;

  constructor(private cdr: ChangeDetectorRef, private fb: FormBuilder) {}

  ngOnInit() {
    if (Object.keys(this.form.controls).length === 0 && this.inputFields.length > 0) {
      const formControls: { [key: string]: FormControl } = {};
      this.inputFields.forEach(field => {
        if (field.formControlName) {
          formControls[field.formControlName] = new FormControl('', Validators.required);
        }
      });
      this.form = this.fb.group(formControls);
    }

    this.form.valueChanges.subscribe(values => {
      console.log('Form values changed:', values);
    });
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  handleSubmit() {
    if (this.form.valid) {
      this.isLoading = true;
      this.errorMessage = null;
      this.onSubmit.emit();
    } else {
      this.errorMessage = 'Por favor complete todos los campos correctamente.';
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
}
