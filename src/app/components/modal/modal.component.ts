import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputFieldConfig } from '../../interfaces/Input-field-config.interface';
import { FormContainerComponent } from '../form-container/form-container.component';
import { InputFieldComponent } from '../input-field/input-field.component';
import { ButtonComponent } from '../button/button.component';
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, FormContainerComponent, InputFieldComponent, ButtonComponent],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  @Input() title: string = '¿Estás seguro?';
  @Input() inputFields: InputFieldConfig[] = [];
  @Input() confirmLabel: string = 'Confirmar';
  @Input() cancelLabel: string = 'Cancelar';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
} 