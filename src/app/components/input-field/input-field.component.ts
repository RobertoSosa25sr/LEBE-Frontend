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
  @Input() formControl?: FormControl;
  @Input() apiService?: any;
  @Input() apiMethod?: string = '';
  @Input() apiServiceParams?: any[] = [];
  @Input() fieldToShow?: string = '';
  @Input() fieldToSend?: string = '';
  @Input() responseDataKey: string = ''; 
  @Output() optionChange = new EventEmitter<string | string[]>();
  onChange: any = () => {};
  onTouch: any = () => {};
  isDropdownOpen: boolean = false;
  searchResults: any[] = [];

  ngOnInit() {
    console.log('InputFieldComponent initialized with:', {
      type: this.type,
      apiService: this.apiService,
      apiMethod: this.apiMethod,
      apiServiceParams: this.apiServiceParams
    });
  }

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
    } else if (this.type === 'search' && value) {
      // For search type, if we have a selectedOption, use that as the display value
      if (this.selectedOption) {
        this.value = this.selectedOption;
      } else {
        // If no selectedOption, try to fetch the display value
        if (this.apiService && this.apiMethod) {
          this.apiService[this.apiMethod](
            1,
            1,
            '',
            this.apiServiceParams
          ).subscribe({
            next: (response: any) => {
              let data = response;
              if (response?.data?.data) {
                data = response.data.data;
              } else if (response?.data) {
                data = response.data;
              } else if (response?.[this.responseDataKey]) {
                data = response[this.responseDataKey];
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
      this.onChange(date);
    } else if (this.type === 'time' && this.value) {
      const [hours, minutes] = this.value.split(':');
      this.onChange(`${hours}:${minutes}:00`);
    } else {
      this.onChange(this.value);
    }
    
    this.onTouch();
  }

  onSearch(searchTerm: string) {
    console.log('InputField onSearch called with:', {
      searchTerm,
      apiService: this.apiService,
      apiMethod: this.apiMethod,
      apiServiceParams: this.apiServiceParams
    });
    
    if (!this.apiService) {
      console.error('API Service is not defined');
      return;
    }

    if (!this.apiMethod) {
      console.error('API Method is not defined');
      return;
    }

    if (typeof this.apiService[this.apiMethod] !== 'function') {
      console.error(`Method ${this.apiMethod} does not exist on the API Service`);
      return;
    }

    this.isDropdownOpen = true;
    
    console.log('Calling service method with params:', {
      page: 1,
      limit: 10,
      searchTerm,
      serviceParams: this.apiServiceParams
    });
    
    this.apiService[this.apiMethod](
      1, 
      10, 
      searchTerm,
      this.apiServiceParams
    ).subscribe({
      next: (response: any) => {
        console.log('API Response:', response);
        let data = response;
        
        if (response?.data?.data) {
          data = response.data.data;
        } else if (response?.data) {
          data = response.data;
        } else if (response?.[this.responseDataKey]) {
          data = response[this.responseDataKey];
        }

        if (Array.isArray(data)) {
          this.searchResults = data;
          console.log('Search Results:', this.searchResults);
          
          if (this.fieldToShow) {
            this.options = this.searchResults.map(item => item[this.fieldToShow!]);
          } else {
            this.options = this.searchResults.map(item => item.full_name || item.email);
          }
          console.log('Options:', this.options);
        } else {
          console.warn('Unexpected API response structure:', response);
          this.options = [];
        }
      },
      error: (error: any) => {
        console.error('API Error:', error);
        this.options = [];
      }
    });
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
      // Find the selected item from searchResults
      const selectedItem = this.searchResults.find(item => 
        item[this.fieldToShow || 'full_name'] === option
      );
      
      this.selectedOption = option;
      // Use fieldToSend if provided, otherwise fallback to id or the option itself
      this.value = selectedItem ? (selectedItem[this.fieldToSend || 'id'] || selectedItem.id) : option;
      this.onChange(this.value);
      this.onTouch();
      this.optionChange.emit(this.value);
      this.isDropdownOpen = false;
      
      // Update form control if it exists
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
      // If opening dropdown and we have an API service, trigger initial search
      if (this.isDropdownOpen && this.apiService && this.apiMethod) {
        this.onSearch('');
      }
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
