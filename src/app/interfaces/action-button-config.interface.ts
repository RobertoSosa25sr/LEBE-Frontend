export interface ActionButtonConfig<T = any> {
    icon: 'edit' | 'delete' | 'cancel' | 'more';
    routerLink?: string[];
    action?: (item: T) => void;
    tooltip: string;
} 