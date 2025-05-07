import { Component, Input, forwardRef, EventEmitter, Output, HostListener } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
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
  @Input() value?: string | string[];
  @Input() options?: string[];
  @Input() label?: string;
  @Input() required: boolean = false;
  @Input() readonly: boolean = false;
  @Input() pattern: string = '';
  @Input() variant?: 'primary' | 'secondary' | 'tertiary';
  @Input() size?: 'small' | 'medium' | 'large';
  @Input() width?: 'full' | '50%';
  @Input() selectedOption?: string | string[] = '';
  @Input() formControlName: string = '';
  @Input() nullable: boolean = false;
  @Input() formControl?: FormControl;
  @Output() optionChange = new EventEmitter<string | string[]>();
  onChange: any = () => {};
  onTouch: any = () => {};
  isDropdownOpen: boolean = false;

  writeValue(value: any): void {
    if (this.type === 'dropdown-select') {
      // Handle both single and multi-select dropdowns
      if (value === null || value === undefined) {
        this.value = [];
        this.selectedOption = [];
      } else {
        this.value = Array.isArray(value) ? value : [value].filter(Boolean);
        this.selectedOption = this.value;
      }
    } else if (this.type === 'datetime-local' && value) {
      const date = new Date(value);
      this.value = date.toISOString().slice(0, 16);
      this.selectedOption = this.value;
    } else if (this.type === 'time' && value) {
      if (typeof value === 'string') {

        const timeParts = value.split(':');
        if (timeParts.length >= 2) {
          this.value = `${timeParts[0]}:${timeParts[1]}`;
        } else {
          this.value = value;
        }
      } else {
        const time = new Date(value);
        this.value = time.toISOString().slice(11, 16);
      }
      this.selectedOption = this.value;
    } else {
      this.value = value || '';
      this.selectedOption = this.value;
    }
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
    
    if (this.type === 'datetime-local' && this.value) {
      const date = new Date(this.value);
      this.onChange(date);
    } else if (this.type === 'time' && this.value) {
      const [hours, minutes] = this.value.split(':');
      this.onChange(`${hours}:${minutes}:00`);
    } else {
      this.onChange(this.value);
    }
    
    this.onTouch();
  }

  onOptionChange(option: string): void {
    if (this.type === 'dropdown-select') {
      let currentSelection = Array.isArray(this.selectedOption) ? [...this.selectedOption] : [];
      const index = currentSelection.indexOf(option);
      
      if (index === -1) {
        currentSelection.push(option);
      } else {
        currentSelection.splice(index, 1);
      }
      
      this.selectedOption = currentSelection;
      this.value = currentSelection;
      this.onChange(currentSelection);
      this.onTouch();
      this.optionChange.emit(currentSelection);
      
      // Update form control if it exists
      if (this.formControl) {
        this.formControl.setValue(currentSelection);
        this.formControl.markAsDirty();
        this.formControl.markAsTouched();
      }
    } else {
      this.selectedOption = option;
      this.value = option;
      this.onChange(option);
      this.onTouch();
      this.optionChange.emit(option);
      this.isDropdownOpen = false;
      
      // Update form control if it exists
      if (this.formControl) {
        this.formControl.setValue(option);
        this.formControl.markAsDirty();
        this.formControl.markAsTouched();
      }
    }
  }

  toggleDropdown(): void {
    if (!this.readonly) {
      this.isDropdownOpen = !this.isDropdownOpen;
    }
  }

  getSelectedOption(): string {
    if (this.type === 'dropdown-select' && Array.isArray(this.selectedOption)) {
      return this.selectedOption.length > 0 ? this.selectedOption.join(', ') : (this.placeholder || 'Select an option');
    }
    return (this.selectedOption as string) || (this.placeholder || 'Select an option');
  }

  isOptionSelected(option: string): boolean {
    if (this.type === 'dropdown-select' && Array.isArray(this.selectedOption)) {
      return this.selectedOption.includes(option);
    }
    return option === this.selectedOption;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;
    const dropdownElement = target.closest('.dropdown-selector');
    
    if (!dropdownElement) {
      this.isDropdownOpen = false;
    }
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const optionsContainer = target.closest('.options-container');
    
    if (optionsContainer) {
      this.isDropdownOpen = false;
    }
  }

}
