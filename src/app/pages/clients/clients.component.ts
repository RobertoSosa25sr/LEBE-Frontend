import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../components/button/button.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { DataTableComponent, TableConfig } from '../../components/data-table/data-table.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { UserService, Client } from '../../services/user.service';
import { ActionButtonService } from '../../services/action-button.service';
import { InputFieldConfig } from '../../interfaces/Input-field-config.interface';
import { ButtonConfig } from '../../interfaces/button-config.interface';
import { ActionType } from '../../shared/constants/action-types.constants';
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
  selectedUser: Client | null = null;
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
  inputNewClientFields: InputFieldConfig[] = [];
  form: FormGroup;

  buttonNewClientConfig: ButtonConfig = {
    label: 'Nuevo',
    size: 'medium',
    backgroundColor: 'green',
    type: 'secondary',
    //icon: ActionType.CREATE
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
    this.actionButtons = this.actionButtonService.getTableActions('client').map(button => {
      if (button.icon === ActionType.DELETE) {
        return {
          ...button,
          action: (client: Client) => this.onDeleteClick(client)
        };
      }
      if (button.icon === ActionType.UPDATE) {
        return {
          ...button,
          action: (client: Client) => this.onEditClick(client)
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

  onDeleteClick(user: Client) {
    this.selectedUser = user;
    this.showDeleteModal = true;
  }

  onEditClick(client: Client) {
    if (!client) return;
    
    this.selectedUser = client;
    this.inputEditFields = [
      { label: 'Nombres completos', type: 'text', value: client.name, formControlName: 'name', readonly: true, required: false, nullable: false, variant: 'secondary', size: 'medium', width: 'full'},
      { label: 'Cédula', type: 'text', value: client.id_number, formControlName: 'id_number', readonly: true, required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      { label: 'Correo', placeholder: 'Correo', type: 'email', value: client.email, formControlName: 'email', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'}
    ];
    this.showEditModal = true;
  }

  onDeleteConfirm() {
    if (this.selectedUser) {
      this.isLoading = true;
      this.userService.deleteClient(this.selectedUser.id_number)
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
      const newEmail = this.form.get('email')?.value;
      
      this.userService.updateClientEmail(this.selectedUser.id_number, newEmail)
        .subscribe({
          next: () => {
            this.loadClients();
            this.showEditModal = false;
            this.selectedUser = null;
            this.isLoading = false;
          },
          error: (error) => {
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
    const formData = {
      id_number: this.form.get('id_number')?.value || '',
      name: this.form.get('name')?.value || '',
      email: this.form.get('email')?.value || ''
    };

    this.userService.createClient(formData)
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