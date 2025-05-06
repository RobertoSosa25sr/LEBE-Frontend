import { Injectable } from '@angular/core';
import { ButtonConfig } from '../interfaces/button-config.interface';
import { AuthService, MenuItem } from './auth.service';
import { ActionType, ACTION_ICONS, ACTION_COLORS } from '../shared/constants/action-types.constants';

@Injectable({
    providedIn: 'root'
})
export class ActionButtonService {
    constructor(private authService: AuthService) {}

    getTableActions(entityType: 'user' | 'case' | 'client' | 'appointment'): ButtonConfig[] {
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
                case 'appointment':
                    return item.route === '/appointments';
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
                tooltip: `Editar ${entityType}`,
                type: 'outline',
                size: 'small'
            });
        }

        if (menuItem.actions.includes('delete')) {
            baseActions.push({
                icon: ActionType.DELETE,
                tooltip: `Eliminar ${entityType}`,
                type: 'outline',
                size: 'small'
            });
        }

        console.log(`Actions for ${entityType}:`, baseActions);
        return baseActions;
    }
} 