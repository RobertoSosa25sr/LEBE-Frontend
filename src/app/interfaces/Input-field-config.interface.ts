export interface InputFieldConfig {
    label?: string;
    type: 'text' | 'password' | 'email' | 'number' | 'dropdown' | 'dropdown-select' | 'datetime-local' | 'time';
    placeholder?: string;
    value?: string | string[];
    options?: string[];
    formControlName?: string;
    variant?: 'primary' | 'secondary' | 'tertiary';
    size?: 'small' | 'medium' | 'large';
    required?: boolean;
    readonly?: boolean;
    pattern?: string;
    selectedOption?: string | string[];
    nullable?: boolean;
    width?: 'full' | '50%';
  } 