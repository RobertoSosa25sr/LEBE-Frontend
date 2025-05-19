import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../components/button/button.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { DataTableComponent, TableConfig } from '../../components/data-table/data-table.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { ActionButtonService } from '../../services/action-button.service';
import { InputFieldConfig } from '../../interfaces/Input-field-config.interface';
import { ButtonConfig } from '../../interfaces/button-config.interface';
import { ActionType } from '../../shared/constants/action-types.constants';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { ROLES } from '../../shared/constants/roles.constants';
import { FilterBarComponent } from '../../components/filter-bar/filter-bar.component';
@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ButtonComponent, 
    ModalComponent,
    DataTableComponent,
    FilterBarComponent
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
  filterConfig: InputFieldConfig[] = [];
  form: FormGroup;
  filterParams: any = {};

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
    public userService: UserService,
    private actionButtonService: ActionButtonService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.userService = userService;
    this.form = this.fb.group({
      id: ['', Validators.required],
      first_name: [''],
      last_name: [''],
      password: [''],
      roles: [[]]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.actionButtons = this.actionButtonService.getTableActions('user');
    this.filterConfig = [
      {
        showSelectedOptions: false,
        showAllOption: true,
        type: 'dropdown-select',
        placeholder: 'Rol',
        formControlName: 'roles',
        options: ['Sin acceso', ...Object.values(ROLES)],
        variant: 'tertiary',
        size: 'medium'
      }
    ];
  }

  onFilterChange(filters: any) {
    this.filterParams = filters;
    this.currentPage = 1;
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.userService.getUsers(this.currentPage, this.perPage, this.searchTerm, [this.filterParams])
      .subscribe({
        next: (response) => {
          this.users = response.users;
          this.total = response.pagination.total;
          this.currentPage = response.pagination.current_page;
          this.lastPage = response.pagination.last_page;
          this.from = response.pagination.from;
          this.to = response.pagination.to;
          
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

  onNewUserSuccess(response: any) {
    this.showNewUserModal = false;
    this.form.reset();
    this.loadUsers();
  }

  onNewUserError(error: any) {
  }

  onNewUserCancel() {
    this.showNewUserModal = false;
    this.form.reset();
  }

  onDeleteClick(user: User) {
    this.selectedUser = user;
    this.showDeleteModal = true;
  }

  onDeleteSuccess(response: any) {
    this.showDeleteModal = false;
    this.selectedUser = null;
    this.loadUsers();
  }

  onDeleteError(error: any) {
    this.showDeleteModal = false;
    this.selectedUser = null;
  }

  onDeleteCancel() {
    this.showDeleteModal = false;
    this.selectedUser = null;
  }

  onEditClick(user: User) {
    if (!user) return;
    
    this.selectedUser = user;
    this.form.reset();
    this.form.patchValue({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      roles: user.roles
    });

    this.inputEditFields = [
      { label: 'Nombres', type: 'text', placeholder: user.first_name, formControlName: 'first_name', readonly: true, required: false, nullable: false, variant: 'secondary', size: 'medium', width: 'full'},
      { label: 'Apellidos', type: 'text', placeholder: user.last_name, formControlName: 'last_name', readonly: true, required: false, nullable: false, variant: 'secondary', size: 'medium', width: 'full'},
      { label: 'Cédula', type: 'text', placeholder: user.id, formControlName: 'id', readonly: true, required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      { label: 'Contraseña', placeholder: 'Contraseña', type: 'password', formControlName: 'password', required: false, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      { label: 'Rol', placeholder: 'Sin acceso', type: 'dropdown-select', value: user.roles, formControlName: 'roles', options: Object.values(ROLES), required: false, nullable: true, variant: 'secondary', size: 'medium', width: '50%'}
    ];
    this.showEditModal = true;
  }

  onEditSuccess(response: any) {
    this.showEditModal = false;
    this.selectedUser = null;
    this.form.reset();
    this.loadUsers();
  }

  onEditError(error: any) {
  }

  onEditCancel() {
    this.showEditModal = false;
    this.selectedUser = null;
    this.form.reset();
  }

  onTableAction(event: { type: string; item: User }) {
    switch(event.type) {
      case ActionType.DELETE:
        this.onDeleteClick(event.item);
        break;
      case ActionType.UPDATE:
        this.onEditClick(event.item);
        break;
    }
  }

} 

