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
  userService: UserService;

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
    userService: UserService,
    private actionButtonService: ActionButtonService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.userService = userService;
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
} 