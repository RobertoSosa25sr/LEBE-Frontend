import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../components/button/button.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { DataTableComponent, TableConfig } from '../../components/data-table/data-table.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { FilterBarComponent } from '../../components/filter-bar/filter-bar.component';
import { Case } from '../../models/case.model';
import { CaseService } from '../../services/case.service';
import { ActionButtonService } from '../../services/action-button.service';
import { InputFieldConfig } from '../../interfaces/Input-field-config.interface';
import { ButtonConfig } from '../../interfaces/button-config.interface';
import { ActionType } from '../../shared/constants/action-types.constants';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { ROLES } from '../../shared/constants/roles.constants';
import { CASE_STATUS } from '../../shared/constants/case-status.constants';
import { UserService } from '../../services/user.service';
import { ClientService } from '../../services/client.service';
import { Appointment } from '../../models/appointment.model';
@Component({
  selector: 'app-cases',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ButtonComponent, 
    ModalComponent,
    DataTableComponent,
    FilterBarComponent
  ],
  templateUrl: './cases.component.html',
  styleUrls: ['./cases.component.css']
})
export class CasesComponent implements OnInit {
  cases: Case[] = [];
  appointments: Appointment[] = [];
  showDeleteModal = false;
  showEditModal = false;
  showNewCaseModal = false;
  showAppointments = false;
  selectedCase: Case | null = null;
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
  inputNewCaseFields: InputFieldConfig[] = [];
  form: FormGroup;
  filterConfig: InputFieldConfig[] = [];
  filterParams: any = {};

  buttonNewCaseConfig: ButtonConfig = {
    label: 'Nuevo',
    size: 'medium',
    backgroundColor: 'green',
    type: 'secondary'
  };

  buttonBackConfig: ButtonConfig = {
    size: 'medium',
    backgroundColor: 'light-blue',
    type: 'secondary',
    icon: 'fa fa-arrow-left'
  };

  tableConfig: TableConfig<Case> = {
    keyField: 'id',
    columns: [
      { 
        key: 'id',
        label: 'Caso',
        headerAlign: 'left',
        cellAlign: 'left',
      },
      { 
        key: 'manager_id',
        label: 'Encargado',
        headerAlign: 'left',
        cellAlign: 'left',
        cellValue: (item: any) => item.manager?.full_name || ''
      },
      { 
        key: 'client_id',
        label: 'Cliente',
        headerAlign: 'left',
        cellAlign: 'left',
        cellValue: (item: any) => item.client?.full_name || ''
      },
      { 
        key: 'status',
        label: 'Estado',
        headerAlign: 'left',
        cellAlign: 'left',
        showIcon: true,
        iconStyle: (item: any) => {
          switch(item.status) {
            case CASE_STATUS.OPEN:
              return 'success';
            case CASE_STATUS.CLOSED:
              return 'danger';
            case CASE_STATUS.IN_PROGRESS:
              return 'warning';
            default:
              return 'info';
          }
        }
      },
      {
        key: 'appointment',
        label: 'Último Resultado',
        headerAlign: 'left',
        cellAlign: 'left',
        cellValue: (item: any) => item.appointments[0]?.result || 'Sin resultados'
      }
    ],
    showActions: true,
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    rowStyle: (item) => item.status.includes('admin') ? 'emphasis' : 'default'
  };

  appointmentsTableConfig: TableConfig<Appointment> = {
    keyField: 'id',
    columns: [
      {
        key: 'result',
        label: 'Resultado',
        headerAlign: 'left',
        cellAlign: 'left',
      },
      { 
        key: 'start_datetime',
        label: 'Fecha y hora',
        headerAlign: 'left',
        cellAlign: 'left',
        cellValue: (item: any) => {
          const date = new Date(item.start_datetime);
          return date.toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'long',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true 
          });
        }
      }
    ],
    showActions: false,
    currentPage: 1,
    pageSize: 10,
    totalItems: 0
  };


  constructor(
    public caseService: CaseService,
    private userService: UserService,
    private clientService: ClientService,
    private actionButtonService: ActionButtonService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.form = this.fb.group({
      manager_id: ['', Validators.required],
      client_id: ['', Validators.required],
      status: ['']
    });
  }

  ngOnInit(): void {
    this.loadCases();
    this.actionButtons = this.actionButtonService.getTableActions('case');
    this.filterConfig = [
      {
        showSelectedOptions: false,
        showAllOption: true,
        type: 'dropdown-select',
        placeholder: 'Estado',
        formControlName: 'status',
        options: Object.values(CASE_STATUS),
        variant: 'tertiary',
        size: 'medium'
      }
    ];
  }

  onFilterChange(filters: any) {
    this.filterParams = filters;
    this.currentPage = 1;
    this.loadCases();
  }

  loadCases() {
    this.isLoading = true;
    this.caseService.getCases(this.currentPage, this.perPage, this.searchTerm, [this.filterParams])
      .subscribe({
        next: (response) => {
          this.cases = response.cases;
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
          this.notificationService.error('Error al cargar los casos');
          this.isLoading = false;
        }
      });
  }

  onSearch(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.currentPage = 1;
    this.loadCases();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadCases();
  }

  onNewCaseClick() {
    this.inputNewCaseFields = [
      { 
        label: 'Cliente', 
        type: 'search', 
        placeholder: 'Buscar cliente...', 
        formControlName: 'client_id', 
        required: true, 
        apiService: this.clientService, 
        apiMethod: 'getClients', 
        apiServiceParams: [],
        responseDataKey: 'clients',
        fieldToShow: 'full_name', 
        nullable: false, 
        variant: 'secondary', 
        size: 'medium', 
        width: 'full'
      },
      { 
        label: 'Encargado', 
        type: 'search', 
        placeholder: 'Buscar encargado...', 
        formControlName: 'manager_id', 
        required: true, 
        apiService: this.userService, 
        apiMethod: 'getUsers', 
        apiServiceParams: [{roles: [ROLES.USER]}],
        responseDataKey: 'users',
        fieldToShow: 'full_name', 
        fieldToSend: 'id',
        nullable: false, 
        variant: 'secondary', 
        size: 'medium', 
        width: 'full'
      }
    ];
    this.showNewCaseModal = true;
  }

  onNewCaseSuccess(response: any) {
    this.showNewCaseModal = false;
    this.form.reset();
    this.loadCases();
  }

  onNewCaseError(error: any) {
  }

  onNewCaseCancel() {
    this.showNewCaseModal = false;
    this.form.reset();
  }

  onDeleteClick(caseData: Case) {
    this.selectedCase = caseData;
    this.showDeleteModal = true;
  }

  onDeleteSuccess(response: any) {
    this.showDeleteModal = false;
    this.selectedCase = null;
    this.loadCases();
  }

  onDeleteError(error: any) {
    this.showDeleteModal = false;
    this.selectedCase = null;
  }

  onDeleteCancel() {
    this.showDeleteModal = false;
    this.selectedCase = null;
  }

  onEditClick(caseData: Case) {
    if (!caseData) return;
    
    this.selectedCase = caseData;
    this.form.patchValue({
      id: caseData.id,
      manager_id: caseData.manager.id,
      client_id: caseData.client.id,
      status: caseData.status
    });

    this.inputEditFields = [
      { 
        label: 'Cliente', 
        type: 'search', 
        placeholder: 'Buscar cliente...', 
        formControlName: 'client_id', 
        required: false, 
        readonly: true, 
        nullable: false, 
        variant: 'secondary', 
        size: 'medium', 
        width: 'full',
        apiService: this.clientService,
        apiMethod: 'getClients',
        apiServiceParams: [],
        responseDataKey: 'clients',
        fieldToShow: 'full_name',
        fieldToSend: 'id',
        value: caseData.client.full_name,
        selectedOption: caseData.client.full_name
      },
      { 
        label: 'Encargado', 
        type: 'search', 
        placeholder: 'Buscar encargado...', 
        formControlName: 'manager_id', 
        required: true,
        apiService: this.userService, 
        apiMethod: 'getUsers', 
        apiServiceParams: [{roles: [ROLES.USER]}],
        responseDataKey: 'users',
        fieldToShow: 'full_name',
        fieldToSend: 'id',
        nullable: false, 
        variant: 'secondary', 
        size: 'medium', 
        width: 'full',
        value: caseData.manager.full_name,
        selectedOption: caseData.manager.full_name
      },
      { 
        label: 'Estado', 
        type: 'dropdown', 
        value: caseData.status, 
        formControlName: 'status', 
        readonly: false, 
        required: true, 
        nullable: false, 
        variant: 'secondary', 
        size: 'medium', 
        width: 'full', 
        options: Object.values(CASE_STATUS)
      }
    ];
    this.showEditModal = true;
  }
  
  onEditSuccess(response: any) {
    this.showEditModal = false;
    this.selectedCase = null;
    this.form.reset();
    this.loadCases();
  }

  onEditError(error: any) {
  }

  onEditCancel() {
    this.showEditModal = false;
    this.selectedCase = null;
    this.form.reset();
  }

  onViewClick(caseData: Case) {
    this.isLoading = true;
    this.selectedCase = caseData;
    this.actionButtons = this.actionButtons.map(button => ({
      ...button,
      disabled: true
    }));
    this.caseService.getCase(caseData.id)
      .subscribe({
        next: (response) => {
          if (response.cases && response.cases.length > 0) {
            this.cases = response.cases;
            const selectedCase = response.cases[0];
            this.appointments = selectedCase.appointments as Appointment[];
            
            this.total = response.pagination.total;
            this.currentPage = response.pagination.current_page;
            this.lastPage = response.pagination.last_page;
            this.from = response.pagination.from;
            this.to = response.pagination.to;
            this.showAppointments = true;
            
            this.appointmentsTableConfig = {
              ...this.appointmentsTableConfig,
              currentPage: this.currentPage,
              pageSize: this.perPage,
              totalItems: this.total
            };
          }
          
          this.isLoading = false;
        },
        error: (error) => {
          this.notificationService.error('Error al cargar el caso');
          this.isLoading = false;
        }
      });
  }
  

  onTableAction(event: { type: string; item: Case }) {
    switch(event.type) {
      case ActionType.DELETE:
        this.onDeleteClick(event.item);
        break;
      case ActionType.UPDATE:
        this.onEditClick(event.item);
        break;
      case ActionType.READ:
        this.onViewClick(event.item);
        break;
    }
  }

  onBackClick() {
    this.showAppointments = false;
    this.selectedCase = null;
    this.actionButtons = this.actionButtons.map(button => ({
      ...button,
      disabled: false
    }));
    this.loadCases();
  }

} 

