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
            return baseActions;
        }

        if (menuItem.actions.includes('update')) {
            baseActions.push({
                icon: ActionType.UPDATE,
                tooltip: `Editar ${this.getEntityName(entityType)}`,
                type: 'outline',
                size: 'small'
            });
        }

        if (menuItem.actions.includes('delete')) {
            baseActions.push({
                icon: ActionType.DELETE,
                tooltip: `Eliminar ${this.getEntityName(entityType)}`,
                type: 'outline',
                size: 'small'
            });
        }

        if (menuItem.actions.includes('read')) {
            baseActions.push({
                icon: ActionType.READ,
                tooltip: `Ver ${this.getEntityName(entityType)}`,
                type: 'outline',
                size: 'small'
            });
        }
        return baseActions;
    }

    private getEntityName(entityType: 'user' | 'case' | 'client' | 'appointment'): string {
        switch (entityType) {
            case 'user':
                return 'usuario';
            case 'case':
                return 'caso';
            case 'client':
                return 'cliente';
            case 'appointment':
                return 'cita';
            default:
                return entityType;
        }
    }
} 