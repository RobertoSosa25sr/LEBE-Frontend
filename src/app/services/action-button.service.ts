import { Injectable } from '@angular/core';
import { ActionButtonConfig } from '../interfaces/action-button-config.interface';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class ActionButtonService {
    constructor(private authService: AuthService) {}

    getTableActions(entityType: 'user' | 'case' | 'client'): ActionButtonConfig[] {
        const userRole = this.authService.getUserRole();
        const baseActions: ActionButtonConfig[] = [];

        switch (entityType) {
            case 'user':
                if (userRole === 'Administrator') {
                    baseActions.push(
                        {
                            icon: 'edit',
                            routerLink: ['/users', ':id', 'edit'],
                            tooltip: 'Editar usuario'
                        },
                        {
                            icon: 'delete',
                            action: (id: number) => this.deleteUser(id),
                            tooltip: 'Eliminar usuario'
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
} 