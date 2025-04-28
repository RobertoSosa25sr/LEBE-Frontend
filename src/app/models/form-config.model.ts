import { FormControl, FormGroup } from '@angular/forms';

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'select';
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  errorMessages?: {
    required?: string;
    minlength?: string;
    maxlength?: string;
    pattern?: string;
  };
  options?: { value: string; label: string }[];
}

export interface FormConfig {
  title: string;
  fields: FormFieldConfig[];
  submitButtonText: string;
  cancelButtonText: string;
  formGroup: FormGroup;
}

export interface TableColumnConfig {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

export interface TableConfig {
  columns: TableColumnConfig[];
  actions?: {
    type: 'button' | 'icon';
    icon?: string;
    label?: string;
    color?: string;
    tooltip?: string;
    onClick: (item: any) => void;
  }[];
} 