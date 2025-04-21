import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputFieldConfig } from '../../interfaces/Input-field-config.interface';
import { FormContainerComponent } from '../form-container/form-container.component';
import { InputFieldComponent } from '../input-field/input-field.component';
import { ButtonComponent } from '../button/button.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonConfig } from '../../interfaces/button-config.interface';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, FormContainerComponent, ReactiveFormsModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  @Input() title: string = '¿Estás seguro?';
  @Input() inputFields: InputFieldConfig[] = [];
  @Input() confirmLabel: string = 'Confirmar';
  @Input() cancelLabel: string = 'Cancelar';
  @Input() initialValues: any = {};
  @Output() confirm = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;
  submitButtonConfig: ButtonConfig;
  cancelButtonConfig: ButtonConfig;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({});
    this.submitButtonConfig = {
      label: this.confirmLabel,
      size: 'small',
      backgroundColor: 'purple',
      type: 'secondary'
    };
    this.cancelButtonConfig = {
      label: this.cancelLabel,
      size: 'small',
      backgroundColor: 'red',
      type: 'secondary'
    };
  }

  ngOnInit() {
    const formControls: { [key: string]: any } = {};
    this.inputFields.forEach(field => {
      if (field.formControlName) {
        formControls[field.formControlName] = [field.value || '', Validators.required];
      }
    });
    this.form = this.fb.group(formControls);

    this.submitButtonConfig.label = this.confirmLabel;
    this.cancelButtonConfig.label = this.cancelLabel;
  }

  handleSubmit() {
    if (this.form.valid) {
      this.confirm.emit(this.form.value);
    }
  }

  handleCancel() {
    this.cancel.emit();
  }
} 