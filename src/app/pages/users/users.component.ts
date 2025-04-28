import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../components/button/button.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { DataTableComponent, TableConfig } from '../../components/data-table/data-table.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { UserService } from '../../services/user.service';
import { User, UserResponse } from '../../models/user.model';
import { ActionButtonService } from '../../services/action-button.service';
import { InputFieldConfig } from '../../interfaces/Input-field-config.interface';
import { ButtonConfig } from '../../interfaces/button-config.interface';
import { ROLES } from '../../shared/constants/roles.constants';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { ApiResponse, PaginatedResponse } from '../../models/api-response.model';
import { CreateUserRequest } from '../../models/user.model';
@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ButtonComponent, 
    ModalComponent,
    DataTableComponent,
    SearchBarComponent
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  showDeleteModal = false;
  showEditModal = false;
  showNewUserModal = false;
  selectedUser: User | null = null;
  isLoading = false;
  currentPage = 1;
  perPage = 10;
  total = 0;
  lastPage = 1;
  from = 0;
  to = 0;
  searchTerm = '';
  actionButtons: ButtonConfig[] = [];
  inputEditFields: InputFieldConfig[] = [];
  inputNewUserFields: InputFieldConfig[] = [];
  form: FormGroup;

  buttonNewUserConfig: ButtonConfig = {
    label: 'Nuevo',
    size: 'medium',
    backgroundColor: 'green',
    type: 'secondary'
  };

  tableConfig: TableConfig<User> = {
    keyField: 'id',
    columns: [
      { 
        key: 'full_name',
        label: 'Nombres',
        showPhoto: true,
        photoField: 'profile_photo_url',
        headerAlign: 'left',
        cellAlign: 'left'
      },
      { 
        key: 'id',
        label: 'Cédula',
        headerAlign: 'left',
        cellAlign: 'left'
      },
      { 
        key: 'roles',
        label: 'Roles',
        headerAlign: 'left',
        cellAlign: 'left',
        cellStyle: (item) => item.roles.includes('admin') ? 'emphasis' : 'default'
      }
    ],
    showActions: true,
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    rowStyle: (item) => item.roles.includes('admin') ? 'emphasis' : 'default'
  };

  constructor(
    private userService: UserService,
    private actionButtonService: ActionButtonService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.form = this.fb.group({
      id: ['', Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      password: ['', Validators.required],
      roles: [[]]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.actionButtons = this.actionButtonService.getTableActions('user').map(button => {
      if (button.icon === 'delete') {
        return {
          ...button,
          action: (user: User) => this.onDeleteClick(user)
        };
      }
      if (button.icon === 'update') {
        return {
          ...button,
          action: (user: User) => this.onEditClick(user)
        };
      }
      return button;
    });
  }

  loadUsers() {
    this.isLoading = true;
    this.userService.getUsers(this.currentPage, this.perPage, this.searchTerm)
      .subscribe({
        next: (response: ApiResponse<PaginatedResponse<UserResponse>>) => {
          this.users = response.data?.data || [];
          this.total = response.data?.total || 0;
          this.currentPage = response.data?.page || 1;
          this.lastPage = response.data?.last_page || 1;
          this.from = response.data?.from || 0;
          this.to = response.data?.to || 0;
          
          this.tableConfig = {
            ...this.tableConfig,
            currentPage: this.currentPage,
            pageSize: this.perPage,
            totalItems: this.total
          };
          
          this.isLoading = false;
        },
        error: (error) => {
          this.notificationService.error('Error al cargar los usuarios');
          this.isLoading = false;
        }
      });
  }

  onSearch(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.currentPage = 1;
    this.loadUsers();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadUsers();
  }

  onDeleteClick(user: User) {
    this.selectedUser = user;
    this.showDeleteModal = true;
  }

  onEditClick(user: User) {
    if (!user) return;
    
    this.selectedUser = user;
    this.form.patchValue({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      roles: user.roles
    });

    this.inputEditFields = [
      { label: 'Nombres', type: 'text', placeholder: user.first_name, formControlName: 'first_name', readonly: true, required: false, nullable: false, variant: 'secondary', size: 'medium', width: 'full'},
      { label: 'Apellidos', type: 'text', placeholder: user.last_name, formControlName: 'last_name', readonly: true, required: false, nullable: false, variant: 'secondary', size: 'medium', width: 'full'},
      { label: 'Cédula', type: 'text', value: user.id.toString(), formControlName: 'id', readonly: true, required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      { label: 'Contraseña', placeholder: 'Contraseña', type: 'password', formControlName: 'password', required: false, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      { label: 'Rol', placeholder: 'Sin acceso', type: 'dropdown-select', value: user.roles, formControlName: 'roles', options: Object.values(ROLES), required: false, nullable: true, variant: 'secondary', size: 'medium', width: '50%'}
    ];
    this.showEditModal = true;
  }

  onDeleteConfirm() {
    if (this.selectedUser) {
      this.isLoading = true;
      this.userService.deleteUser(this.selectedUser.id)
        .subscribe({
          next: () => {
            this.loadUsers();
            this.showDeleteModal = false;
            this.selectedUser = null;
            this.notificationService.success('Usuario eliminado correctamente');  
          },
          error: (error) => {
            this.isLoading = false;
            this.showDeleteModal = false;
            this.selectedUser = null;
            this.notificationService.error('Error al eliminar el usuario');
          }
        });
    }
  }

  onEditConfirm() {
    if (this.selectedUser) {
      this.isLoading = true;
      const currentRoles = this.form.get('roles')?.value || [];
      
      // Ensure roles is always an array
      const roles = Array.isArray(currentRoles) ? currentRoles : [currentRoles];
      
      const formData = {
        id: this.selectedUser.id,
        first_name: this.selectedUser.first_name,
        last_name: this.selectedUser.last_name,
        roles: roles
      };

      this.userService.updateUser(this.selectedUser.id, formData)
        .subscribe({
          next: () => {
            this.loadUsers();
            this.showEditModal = false;
            this.selectedUser = null;
            this.isLoading = false;
            this.notificationService.success('Usuario actualizado correctamente');
          },
          error: (error) => {
            this.notificationService.error('Error al actualizar el usuario' + error.error.message);
            this.isLoading = false;
          }
        });
    }
  }
  

  onDeleteCancel() {
    this.showDeleteModal = false;
    this.selectedUser = null;
  }

  onEditCancel() {
    this.showEditModal = false;
    this.selectedUser = null;
  }

  onNewUserClick() {
    this.inputNewUserFields = [
      { label: 'Nombres', type: 'text', placeholder: '', formControlName: 'first_name', required: true, nullable: false, variant: 'secondary', size: 'medium', width: 'full'},
      { label: 'Apellidos', type: 'text', placeholder: '', formControlName: 'last_name', required: true, nullable: false, variant: 'secondary', size: 'medium', width: 'full'},
      { label: 'Cédula', type: 'text', placeholder: '', formControlName: 'id', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      { label: 'Contraseña', placeholder: 'Contraseña', type: 'password' , formControlName: 'password', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      { label: 'Rol', placeholder: 'Sin acceso', type: 'dropdown-select', value: '', formControlName: 'roles', options: Object.values(ROLES), required: false, nullable: true, variant: 'secondary', size: 'medium', width: '50%'}
    ];
    this.showNewUserModal = true;
  }

  onNewUserCancel() {
    this.showNewUserModal = false;
  }

  onNewUserConfirm() {
    this.isLoading = true;
    interface FormData {
      id: string;
      first_name: string;
      last_name: string;
      password: string;
      roles: string | string[];
    }

    const formData: FormData = {
      id: this.form.get('id')?.value || '',
      first_name: this.form.get('first_name')?.value || '',
      last_name: this.form.get('last_name')?.value || '',
      password: this.form.get('password')?.value || '',
      roles: this.form.get('roles')?.value || []
    };

    const newUser: CreateUserRequest = {
      id: formData.id,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: `${formData.first_name.toLowerCase()}.${formData.last_name.toLowerCase()}@example.com`,
      password: formData.password,
      roles: Array.isArray(formData.roles) ? formData.roles : [formData.roles]
    };

    this.userService.createUser(newUser)
      .subscribe({
        next: (response) => {
          this.loadUsers();
          this.showNewUserModal = false;
          this.isLoading = false;
          this.form.reset();
          this.notificationService.success('Usuario creado correctamente');
        },
        error: (error) => {
          this.isLoading = false;
          this.form.reset();
          this.showNewUserModal = false;
          this.notificationService.error('Error al crear el usuario: ' + error.error.message);
        }
      });
  }
} 