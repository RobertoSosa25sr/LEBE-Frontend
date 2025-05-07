import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../components/button/button.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { DataTableComponent, TableConfig } from '../../components/data-table/data-table.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { Client } from '../../models/client.model';
import { ClientService } from '../../services/client.service';
import { ActionButtonService } from '../../services/action-button.service';
import { InputFieldConfig } from '../../interfaces/Input-field-config.interface';
import { ButtonConfig } from '../../interfaces/button-config.interface';
import { ActionType } from '../../shared/constants/action-types.constants';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
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
  selectedClient: Client | null = null;
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
  };

  tableConfig: TableConfig<Client> = {
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
        key: 'phone',
        label: 'Teléfono',
        headerAlign: 'left',
        cellAlign: 'left'
      },
      { 
        key: 'email',
        label: 'Correo',
        headerAlign: 'left',
        cellAlign: 'left',
        cellStyle: (item: Client) => item?.email ? (item.email.includes('@') ? 'success' : 'warning') : 'default'
      }
    ],
    showActions: true,
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
  };

  constructor(
    private clientService: ClientService,
    private actionButtonService: ActionButtonService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.clientService = clientService;
    this.form = this.fb.group({
      id: ['', Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', Validators.required],
      phone: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadClients();
    this.actionButtons = this.actionButtonService.getTableActions('client');
  }

  loadClients() {
    this.isLoading = true;
    this.clientService.getClients(this.currentPage, this.perPage, this.searchTerm)
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
          this.notificationService.error('Error al cargar los clientes');
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

  onNewClientClick() {
    this.inputNewClientFields = [
      { label: 'Nombres', type: 'text', placeholder: '', formControlName: 'first_name', required: true, nullable: false, variant: 'secondary', size: 'medium', width: 'full'},
      { label: 'Apellidos', type: 'text', placeholder: '', formControlName: 'last_name', required: true, nullable: false, variant: 'secondary', size: 'medium', width: 'full'},
      { label: 'Cédula', type: 'text', placeholder: '', formControlName: 'id', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      { label: 'Teléfono', type: 'text', placeholder: '', formControlName: 'phone', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
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
      id: this.form.get('id')?.value || '',
      first_name: this.form.get('first_name')?.value || '',
      last_name: this.form.get('last_name')?.value || '',
      email: this.form.get('email')?.value || '',
      phone: this.form.get('phone')?.value || ''
    };

    this.clientService.createClient(formData)
      .subscribe({
        next: (response) => {
          this.loadClients();
          this.showNewClientModal = false;
          this.isLoading = false;
          this.form.reset();

          this.inputNewClientFields = [
            { label: 'Nombres', type: 'text', placeholder: '', formControlName: 'first_name', required: true, nullable: false, variant: 'secondary', size: 'medium', width: 'full'},
            { label: 'Apellidos', type: 'text', placeholder: '', formControlName: 'last_name', required: true, nullable: false, variant: 'secondary', size: 'medium', width: 'full'},
            { label: 'Cédula', type: 'text', placeholder: '', formControlName: 'id', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
            { label: 'Teléfono', type: 'text', placeholder: '', formControlName: 'phone', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
            { label: 'Correo', placeholder: 'Correo', type: 'email' , formControlName: 'email', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'}
          ];
          this.notificationService.success('Cliente creado correctamente');
        },
        error: (error) => {
          this.isLoading = false;
          this.form.reset();
          this.inputNewClientFields = [];
          this.showNewClientModal = false;
          this.notificationService.error('Error al crear el cliente ' + error.error.message);
        }
      });
  }

  onDeleteClick(client: Client) {
    this.selectedClient = client;
    this.showDeleteModal = true;
  }

  onDeleteCancel() {
    this.showDeleteModal = false;
    this.selectedClient = null;
  }

  onDeleteConfirm() {
    if (this.selectedClient) {
      this.isLoading = true;
      this.clientService.deleteClient(this.selectedClient.id)
        .subscribe({
          next: () => {
            this.loadClients();
            this.showDeleteModal = false;
            this.selectedClient = null;
            this.notificationService.success('Cliente eliminado correctamente');
          },
          error: (error) => {
            this.notificationService.error('Error al eliminar el cliente');
            this.isLoading = false;
            this.showDeleteModal = false;
            this.selectedClient = null;
          }
        });
    }
  }

  onEditClick(client: Client) {
    if (!client) return;
    
    this.selectedClient = client;
    this.form.reset();
    this.form.patchValue({
      id: client.id,
      first_name: client.first_name,
      last_name: client.last_name,
      email: client.email,
      phone: client.phone
    });

    this.inputEditFields = [
      { label: 'Nombres', type: 'text', placeholder: client.first_name, formControlName: 'first_name', readonly: true, required: false, nullable: false, variant: 'secondary', size: 'medium', width: 'full'},
      { label: 'Apellidos', type: 'text', placeholder: client.last_name, formControlName: 'last_name', readonly: true, required: false, nullable: false, variant: 'secondary', size: 'medium', width: 'full'},
      { label: 'Cédula', type: 'text', placeholder: client.id, formControlName: 'id', readonly: true, required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      { label: 'Teléfono', type: 'text', placeholder: "Teléfono", value: client.phone, formControlName: 'phone', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      { label: 'Correo', type: 'email', placeholder: "Correo", value: client.email, formControlName: 'email', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'}
    ];
    this.showEditModal = true;
  }

  onEditCancel() {
    this.showEditModal = false;
    this.selectedClient = null;
  }

  onEditConfirm() {
    if (this.selectedClient) {
      this.isLoading = true;
      const formData = this.form.getRawValue();
      
      this.clientService.updateClient(this.selectedClient.id, formData.email, formData.phone)
        .subscribe({
          next: () => {
            this.loadClients();
            this.showEditModal = false;
            this.selectedClient = null;
            this.isLoading = false;
            this.notificationService.success('Cliente actualizado correctamente');
          },
          error: (error) => {
            this.notificationService.error('Error al actualizar el cliente ' + error.error.message);
            this.isLoading = false;
          }
        });
    }
  }


  onTableAction(event: { type: string; item: Client }) {
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