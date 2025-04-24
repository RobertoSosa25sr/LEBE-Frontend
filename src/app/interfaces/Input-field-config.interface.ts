export interface InputFieldConfig {
    label: string;
    type: 'text' | 'password' | 'email' | 'number' | 'dropdown' | 'dropdown-select';
    placeholder?: string;
    value?: string;
    options?: string[];
    formControlName?: string;
    variant?: 'primary' | 'secondary' | 'tertiary';
    size?: 'small' | 'medium' | 'large';
    required?: boolean;
    readonly?: boolean;
    pattern?: string;
    selectedOption?: string;
    nullable?: boolean;
  } 