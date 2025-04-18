export interface InputFieldConfig {
    label: string;
    type: 'text' | 'password' | 'email' | 'number' | 'dropdown';
    placeholder?: string;
    value?: string;
    options?: string[];
  } 