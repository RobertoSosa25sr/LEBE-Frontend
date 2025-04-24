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
  @Output() optionChange = new EventEmitter<string | string[]>();
  onChange: any = () => {};
  onTouch: any = () => {};
  isDropdownOpen: boolean = false;

  writeValue(value: any): void {
    this.value = value;
    if (this.type === 'dropdown-select') {
      this.selectedOption = Array.isArray(value) ? value : [value].filter(Boolean);
    } else {
      this.selectedOption = value || '';
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
    this.onChange(this.value);
  }

  onOptionChange(option: string): void {
    if (this.type === 'dropdown-select') {
      let currentSelection = Array.isArray(this.selectedOption) ? this.selectedOption : [];
      const index = currentSelection.indexOf(option);
      
      if (index === -1) {
        currentSelection.push(option);
      } else {
        currentSelection.splice(index, 1);
      }
      
      this.selectedOption = currentSelection;
      this.value = currentSelection;
      this.onChange(currentSelection);
      this.optionChange.emit(currentSelection);
    } else {
      this.selectedOption = option;
      this.value = option;
      this.onChange(option);
      this.optionChange.emit(option);
      this.isDropdownOpen = false;
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
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
    
    // Only close if clicking outside the dropdown button
    if (!dropdownElement) {
      this.isDropdownOpen = false;
    }
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const optionsContainer = target.closest('.options-container');
    
    // Close dropdown when mouse leaves the options container
    if (optionsContainer) {
      this.isDropdownOpen = false;
    }
  }

}
