import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../components/button/button.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { DataTableComponent, TableConfig } from '../../components/data-table/data-table.component';
import { ActionButtonComponent } from '../../components/action-button/action-button.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { UserService, User, UserListResponse, Client } from '../../services/user.service';
import { ActionButtonService } from '../../services/action-button.service';
import { ActionButtonConfig } from '../../interfaces/action-button-config.interface';
import { InputFieldConfig } from '../../interfaces/Input-field-config.interface';
import { ButtonConfig } from '../../interfaces/button-config.interface';
import { ROLES } from '../../shared/constants/roles.constants';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ButtonComponent, 
    ModalComponent,
    DataTableComponent,
    SearchBarComponent
  ],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  showDeleteModal = false;
  showEditModal = false;
  showNewClientModal = false;
  selectedUser: User | null = null;
  isLoading = false;
  currentPage = 1;
  perPage = 10;
  total = 0;
  lastPage = 1;
  from = 0;
  to = 0;
  searchTerm = '';
  actionButtons: ActionButtonConfig[] = [];
  inputEditFields: InputFieldConfig[] = [];
  inputNewClientFields: InputFieldConfig[] = [];
  form: FormGroup;

  buttonNewClientConfig: ButtonConfig = {
    label: 'Nuevo',
    size: 'medium',
    backgroundColor: 'green',
    type: 'secondary'
  };

  tableConfig: TableConfig<Client> = {
    keyField: 'id_number',
    columns: [
      { 
        key: 'name',
        label: 'Nombres',
        showPhoto: true,
        photoField: 'profile_photo_url',
        headerAlign: 'left',
        cellAlign: 'left'
      },
      { 
        key: 'id_number',
        label: 'Cédula',
        headerAlign: 'left',
        cellAlign: 'left'
      },
      { 
        key: 'email',
        label: 'Correo',
        headerAlign: 'left',
        cellAlign: 'left',
        cellStyle: (item: Client) => item.email.includes('@') ? 'success' : 'warning'
      }
    ],
    showActions: true,
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    rowStyle: (item: Client) => item.roles.includes('admin') ? 'emphasis' : 'default'
  };

  constructor(
    private userService: UserService,
    private actionButtonService: ActionButtonService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      id_number: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadClients();
    this.actionButtons = this.actionButtonService.getTableActions('user').map(button => {
      if (button.icon === 'delete') {
        return {
          ...button,
          action: (user: User) => this.onDeleteClick(user)
        };
      }
      if (button.icon === 'edit') {
        return {
          ...button,
          action: (user: User) => this.onEditClick(user)
        };
      }
      return button;
    });
  }

  loadClients() {
    this.isLoading = true;
    this.userService.getClients(this.currentPage, this.perPage, this.searchTerm)
      .subscribe({
        next: (response) => {
          this.clients = response.clients;
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
          console.error('Error loading clients:', error);
          this.isLoading = false;
        }
      });
  }

  onSearch(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.currentPage = 1;
    this.loadClients();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadClients();
  }

  onDeleteClick(user: User) {
    this.selectedUser = user;
    this.showDeleteModal = true;
  }

  onEditClick(user: User) {
    if (!user) return;
    
    this.selectedUser = user;
    this.inputEditFields = [
      { label: 'Nombres completos', type: 'text', placeholder: user.name , formControlName: 'name', readonly: true, required: false, nullable: false, variant: 'secondary', size: 'medium', width: 'full'},
      { label: 'Cédula', type: 'text', value: user.id_number , formControlName: 'id_number', readonly: true, required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      { label: 'Contraseña', placeholder: 'Contraseña', type: 'password' , formControlName: 'password', required: false, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      { label: 'Rol', placeholder: 'Sin acceso', type: 'dropdown-select', value: user.roles , formControlName: 'roles', options: Object.values(ROLES), required: false, nullable: true, variant: 'secondary', size: 'medium', width: '50%'}
    ];
    this.showEditModal = true;
  }

  onDeleteConfirm() {
    if (this.selectedUser) {
      this.isLoading = true;
      this.userService.deleteUser({ id_number: this.selectedUser.id_number })
        .subscribe({
          next: () => {
            this.loadClients();
            this.showDeleteModal = false;
            this.selectedUser = null;
          },
          error: (error) => {
            this.isLoading = false;
            this.showDeleteModal = false;
            this.selectedUser = null;
          }
        });
    }
  }

  onEditConfirm() {
    if (this.selectedUser) {
      this.isLoading = true;
      this.userService.updateUser(this.selectedUser)
        .subscribe({
          next: () => {
            this.loadClients();
            this.showEditModal = false;
            this.selectedUser = null;
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

  onNewClientClick() {
    this.inputNewClientFields = [
      { label: 'Nombres completos', type: 'text', placeholder: '', formControlName: 'name', required: true, nullable: false, variant: 'secondary', size: 'medium', width: 'full'},
      { label: 'Cédula', type: 'text', placeholder: '', formControlName: 'id_number', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      { label: 'Correo', placeholder: 'Correo', type: 'email' , formControlName: 'email', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'}
    ];
    this.showNewClientModal = true;
  }

  onNewClientCancel() {
    this.showNewClientModal = false;
  }

  onNewClientConfirm() {
    this.isLoading = true;
    interface FormData {
      id_number: string;
      name: string;
      password: string;
      roles: string | string[];
    }

    const formData: FormData = {
      id_number: this.form.get('id_number')?.value || '',
      name: this.form.get('name')?.value || '',
      password: this.form.get('password')?.value || '',
      roles: this.form.get('roles')?.value || []
    };

    const newUser = {
      id_number: formData.id_number,
      name: formData.name,
      password: formData.password,
      roles: Array.isArray(formData.roles) ? formData.roles : formData.roles ? [formData.roles] : []
    };

    this.userService.createUser(newUser)
      .subscribe({
        next: (response) => {
          this.loadClients();
          this.showNewClientModal = false;
          this.isLoading = false;
          this.form.reset();

          this.inputNewClientFields = [
            { label: 'Nombres completos', type: 'text', placeholder: '', formControlName: 'name', required: true, nullable: false, variant: 'secondary', size: 'medium', width: 'full'},
            { label: 'Cédula', type: 'text', placeholder: '', formControlName: 'id_number', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
            { label: 'Correo', placeholder: 'Correo', type: 'email' , formControlName: 'email', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'}
          ];
        },
        error: (error) => {
          this.isLoading = false;
        }
      });
  }
} 