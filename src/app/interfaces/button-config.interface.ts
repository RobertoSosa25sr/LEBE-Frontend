export interface ButtonConfig<T = any> {
    label?: string;
    size?: 'small' | 'medium' | 'large';
    fullWidth?: boolean;
    loading?: boolean;
    disabled?: boolean;
    icon?: string;
    routerLink?: string[];
    action?: (item: T | undefined) => void;
    type?: 'primary' | 'secondary' | 'outline';
    backgroundColor?: 'purple' | 'green' | 'red' | 'light-blue' | '';
    tooltip?: string;
    onlyIcon?: boolean;
}
