import { Component, Input, forwardRef, EventEmitter, Output, HostListener } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input-field.component.html',
  styleUrls: ['./input-field.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputFieldComponent),
      multi: true
    }
  ]
})
export class InputFieldComponent implements ControlValueAccessor {

  @Input() placeholder?: string = '';
  @Input() type: string = 'text';
  @Input() value?: string;
  @Input() options?: string[];
  @Input() label?: string;
  @Input() required: boolean = false;
  @Input() readonly: boolean = false;
  @Input() pattern: string = '';
  @Input() variant?: 'primary' | 'secondary' | 'tertiary';
  @Input() size?: 'small' | 'medium' | 'large';
  @Input() width?: 'full' | '50%';
  @Input() selectedOption?: string;
  @Input() formControlName: string = '';
  @Output() optionChange = new EventEmitter<string>();
  onChange: any = () => {};
  onTouch: any = () => {};
  isDropdownOpen: boolean = false;

  writeValue(value: any): void {
    this.value = value;
    this.selectedOption = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onOptionChange(option: string): void {
    this.selectedOption = option;
    this.value = option;
    this.onChange(option);
    this.optionChange.emit(option);
    this.isDropdownOpen = false;
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  getSelectedOption(): string {
    return this.selectedOption || this.placeholder || '';
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-selector')) {
      this.isDropdownOpen = false;
    }
  }	

}
