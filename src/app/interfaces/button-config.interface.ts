export interface ButtonConfig {
    label: string;
    size?: 'small' | 'medium' | 'large';
    fullWidth?: boolean;
    loading?: boolean;
    disabled?: boolean;
    icon?: string;
    routerLink?: string[];
    action?: () => void;
    type?: 'primary' | 'secondary' | 'outline';
    backgroundColor?: 'purple' | 'green' | 'red';
    
}
