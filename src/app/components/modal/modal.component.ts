import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputFieldConfig } from '../../interfaces/Input-field-config.interface';
import { FormContainerComponent } from '../form-container/form-container.component';
import { ButtonConfig } from '../../interfaces/button-config.interface';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, FormContainerComponent],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  @Input() title: string = '¿Estás seguro?';
  @Input() inputFields: InputFieldConfig[] = [];
  @Input() confirmLabel: string = 'Confirmar';
  @Input() cancelLabel: string = 'Cancelar';
  @Input() initialValues: any = {};
  @Input() form: FormGroup = new FormGroup({});
  @Input() apiService: any;
  @Input() apiMethod: string = '';
  @Input() apiServiceParams: any[] = [];
  @Input() responseDataKey: string = '';
  @Input() successMessage: string = 'Operación exitosa';
  @Input() successRedirect: string = '';
  @Input() apiErrorMessage: string = 'Error al realizar la operación';
  @Input() show: boolean = true;
  @Output() confirm = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();
  @Output() success = new EventEmitter<any>();
  @Output() error = new EventEmitter<any>();

  submitButtonConfig: ButtonConfig;
  cancelButtonConfig: ButtonConfig;

  constructor() {
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
    this.submitButtonConfig.label = this.confirmLabel;
    this.cancelButtonConfig.label = this.cancelLabel;
  }

  handleSubmit(formData: any) {
    this.confirm.emit(formData);
  }

  handleCancel() {
    this.cancel.emit();
  }

  handleSuccess(response: any) {
    this.show = false;
    this.success.emit(response);
  }

  handleError(error: any) {
    this.error.emit(error);
  }
} 