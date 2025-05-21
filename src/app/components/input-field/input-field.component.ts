import { Component, Input, forwardRef, EventEmitter, Output, HostListener, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { ApiResponse, PaginatedResponse } from '../../models/api-response.model';

@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [CommonModule, SearchBarComponent],
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
export class InputFieldComponent implements ControlValueAccessor, OnInit {

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
  @Input() showAllOption: boolean = false;
  @Input() formControl?: FormControl;
  @Input() apiService?: any;
  @Input() apiMethod?: string = '';
  @Input() apiServiceParams?: any[] = [];
  @Input() fieldToShow?: string = '';
  @Input() fieldToSend?: string = '';
  @Input() responseDataKey: string = ''; 
  @Input() showSelectedOptions: boolean = true;
  @Output() optionChange = new EventEmitter<string | string[]>();
  onChange: any = () => {};
  onTouch: any = () => {};
  isDropdownOpen: boolean = false;
  searchResults: any[] = [];

  ngOnInit() {
    if (this.options && this.showAllOption) {
      this.options = ['Todos', ...this.options];
      this.selectedOption = ['Todos'];
      this.value = [];
      this.onChange(this.value);
      
      if (this.formControl) {
        this.formControl.setValue([]);
      }
    }
  }

  writeValue(value: any): void {
    if (this.type === 'dropdown-select') {
      if (this.showAllOption && (!value || (Array.isArray(value) && value.length === 0))) {
        this.value = [];
        this.selectedOption = ['Todos'];
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
    } else if (this.type === 'search' && value) {
      if (this.selectedOption) {
        this.value = this.selectedOption;
      } else {
        if (this.apiService && this.apiMethod) {
          this.apiService[this.apiMethod](
            1,
            1,
            value,
            this.apiServiceParams
          ).subscribe({
            next: (response: any) => {
              let data = response;
              if (response?.[this.responseDataKey]) {
                data = response[this.responseDataKey];
                console.log('data from responseDataKey',data);
              }  if (response?.data) {
                data = response.data;
                console.log('data from data',data);
              } 

              if (Array.isArray(data)) {
                const item = data.find((item: any) => item[this.fieldToSend || 'id'] === value);
                if (item && this.fieldToShow) {
                  this.value = item[this.fieldToShow];
                  this.selectedOption = this.value;
                }
              }
            }
          });
        }
      }
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
      if (!isNaN(date.getTime())) {

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        this.onChange(formattedDate);
      }
    } else if (this.type === 'time' && this.value) {
      const [hours, minutes] = this.value.split(':');
      this.onChange(`${hours}:${minutes}:00`);
    } else {
      this.onChange(this.value);
    }
    
    this.onTouch();
  }

  onSearch(searchTerm: string) {
    
    if (!this.apiService) {
      return;
    }

    if (!this.apiMethod) {
      return;
    }

    if (typeof this.apiService[this.apiMethod] !== 'function') {
      return;
    }

    this.isDropdownOpen = true;
    
    
    
    this.apiService[this.apiMethod](
      1, 
      10, 
      searchTerm,
      this.apiServiceParams
    ).subscribe({
      next: (response: any) => {
        let data = response;
        
       if (response?.[this.responseDataKey]) {
          data = response[this.responseDataKey];
        }  if (response?.data) {
          data = response.data;
        } 

        if (Array.isArray(data)) {
          this.searchResults = data;
          
          if (this.fieldToShow) {
            this.options = this.searchResults.map(item => item[this.fieldToShow!]);
          } else {
            this.options = this.searchResults.map(item => item.full_name || item.email);
          }
        } else {
          this.options = [];
        }
      },
      error: (error: any) => {
        this.options = [];
      }
    });
  }

  onOptionChange(option: string): void {
    if (this.type === 'dropdown-select') {
      let currentSelection = Array.isArray(this.selectedOption) ? [...this.selectedOption] : [];
      
      if (option === 'Todos') {
        // If "Todos" is selected, clear all other selections
        currentSelection = ['Todos'];
      } else {
        // If a regular option is selected, remove "Todos" if present
        currentSelection = currentSelection.filter(opt => opt !== 'Todos');
        
      const index = currentSelection.indexOf(option);
      if (index === -1) {
        currentSelection.push(option);
      } else {
        currentSelection.splice(index, 1);
      }
      }
      
      // If "Todos" is selected, don't send any value
      const valueToSend = currentSelection.includes('Todos') ? [] : currentSelection;
      
      this.selectedOption = currentSelection;
      this.value = valueToSend;
      this.onChange(valueToSend);
      this.onTouch();
      this.optionChange.emit(valueToSend);
      
      if (this.formControl) {
        this.formControl.setValue(valueToSend);
        this.formControl.markAsDirty();
        this.formControl.markAsTouched();
      }
    } else {
      const selectedItem = this.searchResults.find(item => 
        item[this.fieldToShow || 'full_name'] === option
      );
      
      this.selectedOption = option;
      this.value = selectedItem ? (selectedItem[this.fieldToSend || 'id'] || selectedItem.id) : option;
      this.onChange(this.value);
      this.onTouch();
      this.optionChange.emit(this.value);
      this.isDropdownOpen = false;
      
      if (this.formControl) {
        this.formControl.setValue(this.value);
        this.formControl.markAsDirty();
        this.formControl.markAsTouched();
      }
    }
  }

  toggleDropdown(): void {
    if (!this.readonly) {
      this.isDropdownOpen = !this.isDropdownOpen;
      if (this.isDropdownOpen && this.apiService && this.apiMethod) {
        this.onSearch('');
      }
    }
  }

  getSelectedOption(): string {
    if (!this.showSelectedOptions) {
      return this.label || this.placeholder || '';
    }
    
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
