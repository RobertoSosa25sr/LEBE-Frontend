import { Injectable } from '@angular/core';
import { ButtonConfig } from '../interfaces/button-config.interface';
import { AuthService } from './auth.service';
import { ActionType, ACTION_ICONS, ACTION_COLORS } from '../shared/constants/action-types.constants';

@Injectable({
    providedIn: 'root'
})
export class ActionButtonService {
    constructor(private authService: AuthService) {}

    getTableActions(entityType: 'user' | 'case' | 'client'): ButtonConfig[] {
        const userRole = this.authService.getUserRole();
        const baseActions: ButtonConfig[] = [];

        switch (entityType) {
            case 'user':
                if (userRole === 'Administrator') {
                    baseActions.push(
                        {
                            icon: ActionType.UPDATE,
                            action: (user: any) => this.editUser(user),
                            tooltip: 'Editar usuario',
                            type: 'outline',
                            size: 'small'
                        },
                        {
                            icon: ActionType.DELETE,
                            action: (id: number) => this.deleteUser(id),
                            tooltip: 'Eliminar usuario',
                            type: 'outline',
                            size: 'small'
                        }
                    );
                }
                break;
            case 'client':
                if (userRole === 'Administrator') {
                    baseActions.push(
                        {
                            icon: ActionType.UPDATE,
                            action: (client: any) => this.editClient(client),
                            tooltip: 'Editar cliente',
                            type: 'outline',
                            size: 'small'
                        },
                        {
                            icon: ActionType.DELETE,
                            action: (id: number) => this.deleteClient(id),
                            tooltip: 'Eliminar cliente',
                            type: 'outline',
                            size: 'small'
                        }
                    );
                }
                break;
        }

        return baseActions;
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
} 