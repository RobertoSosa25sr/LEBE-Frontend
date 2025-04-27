import { Injectable } from '@angular/core';
import { ButtonConfig } from '../interfaces/button-config.interface';
import { AuthService, MenuItem } from './auth.service';
import { ActionType, ACTION_ICONS, ACTION_COLORS } from '../shared/constants/action-types.constants';

@Injectable({
    providedIn: 'root'
})
export class ActionButtonService {
    constructor(private authService: AuthService) {}

    getTableActions(entityType: 'user' | 'case' | 'client'): ButtonConfig[] {
        const baseActions: ButtonConfig[] = [];
        const menuItems = this.authService.getMenuItems();
        
        if (!menuItems || menuItems.length === 0) {
            console.warn('No menu items found');
            return baseActions;
        }

        const menuItem = menuItems.find(item => {
            switch (entityType) {
                case 'user':
                    return item.route === '/users';
                case 'case':
                    return item.route === '/cases';
                case 'client':
                    return item.route === '/clients';
                default:
                    return false;
            }
        });

        if (!menuItem) {
            console.warn(`No menu item found for ${entityType}`);
            return baseActions;
        }

        console.log(`Menu item found for ${entityType}:`, menuItem);

        if (menuItem.actions.includes('update')) {
            baseActions.push({
                icon: ActionType.UPDATE,
                action: (item: any) => this.editItem(entityType, item),
                tooltip: `Editar ${entityType}`,
                type: 'outline',
                size: 'small'
            });
        }

        if (menuItem.actions.includes('delete')) {
            baseActions.push({
                icon: ActionType.DELETE,
                action: (item: any) => this.deleteItem(entityType, item),
                tooltip: `Eliminar ${entityType}`,
                type: 'outline',
                size: 'small'
            });
        }

        console.log(`Actions for ${entityType}:`, baseActions);
        return baseActions;
    }

    private editItem(entityType: string, item: any): void {
        switch (entityType) {
            case 'user':
                this.editUser(item);
                break;
            case 'client':
                this.editClient(item);
                break;
            case 'case':
                this.editCase(item);
                break;
        }
    }

    private deleteItem(entityType: string, item: any): void {
        switch (entityType) {
            case 'user':
                this.deleteUser(item);
                break;
            case 'client':
                this.deleteClient(item);
                break;
            case 'case':
                this.deleteCase(item);
                break;
        }
    }

    private deleteUser(user: any): void {
        console.log('Delete user:', user);
    }

    private editUser(user: any): void {
        console.log('Edit user:', user);
    }

    private deleteClient(client: any): void {
        console.log('Delete client:', client);
    }

    private editClient(client: any): void {
        console.log('Edit client:', client);
    }

    private deleteCase(caseItem: any): void {
        console.log('Delete case:', caseItem);
    }

    private editCase(caseItem: any): void {
        console.log('Edit case:', caseItem);
    }
} 