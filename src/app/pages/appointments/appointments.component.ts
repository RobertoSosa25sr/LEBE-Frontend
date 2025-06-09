import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../components/button/button.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { DataTableComponent, TableConfig } from '../../components/data-table/data-table.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { FilterBarComponent } from '../../components/filter-bar/filter-bar.component';
import { Appointment } from '../../models/appointment.model';
import { AppointmentService } from '../../services/appointments.service';
import { ActionButtonService } from '../../services/action-button.service';
import { InputFieldConfig } from '../../interfaces/Input-field-config.interface';
import { ButtonConfig } from '../../interfaces/button-config.interface';
import { ActionType } from '../../shared/constants/action-types.constants';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { ROLES } from '../../shared/constants/roles.constants';
import { ClientService } from '../../services/client.service';
import { UserService } from '../../services/user.service';
import { CaseService } from '../../services/case.service';
import { APPOINTMENT_STATUS } from '../../shared/constants/appointment-status.contants';
@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ButtonComponent, 
    ModalComponent,
    DataTableComponent,
    FilterBarComponent
  ],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  showDeleteModal = false;
  showEditModal = false;
  showNewAppointmentModal = false;
  selectedAppointment: Appointment | null = null;
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
  inputNewAppointmentFields: InputFieldConfig[] = [];
  form: FormGroup;
  filterConfig: InputFieldConfig[] = [];
  filterParams: any = {};

  buttonNewAppointmentConfig: ButtonConfig = {
    label: 'Nuevo',
    size: 'medium',
    backgroundColor: 'green',
    type: 'secondary',
    tooltip: 'Nueva cita'
  };

  tableConfig: TableConfig<Appointment> = {
    keyField: 'id',
    columns: [
      { 
        key: 'ticket_number',
        label: '#',
        headerAlign: 'left',
        cellAlign: 'left',
        showIcon: true,
        iconStyle: (item: any) => {
          switch(item.status) {
            case APPOINTMENT_STATUS.PENDING:
              return 'info';
            case APPOINTMENT_STATUS.CANCELLED:
              return 'danger';
            case APPOINTMENT_STATUS.RESCHEDULED:
              return 'warning';
            case APPOINTMENT_STATUS.COMPLETED:
              return 'success';
            default:
              return 'attention';
          }
        }
      },
      {
        key: 'responsible_id',
        label: 'Responsable',
        headerAlign: 'left',
        cellAlign: 'left',
        cellValue: (item: any) => item.responsible?.full_name || ''
      },
      { 
        key: 'subject',
        label: 'Asunto',
        headerAlign: 'left',
        cellAlign: 'left'
      },
      { 
        key: 'start_datetime',
        label: 'Fecha y hora',
        headerAlign: 'left',
        cellAlign: 'left',
        cellValue: (item: any) => {
          const date = new Date(item.start_datetime);
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          // Reset time part for date comparison
          const dateWithoutTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          const todayWithoutTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const tomorrowWithoutTime = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
          const yesterdayWithoutTime = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
          
          let dateStr = '';
          if (dateWithoutTime.getTime() === todayWithoutTime.getTime()) {
            dateStr = 'Hoy';
          } else if (dateWithoutTime.getTime() === tomorrowWithoutTime.getTime()) {
            dateStr = 'Mañana';
          } else if (dateWithoutTime.getTime() === yesterdayWithoutTime.getTime()) {
            dateStr = 'Ayer';
          } else {
            dateStr = date.toLocaleDateString('es-ES', { 
              day: 'numeric', 
              month: 'long'
            });
          }
          
          // Add time
          const timeStr = date.toLocaleTimeString('es-ES', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: false
          });
          
          return `${dateStr}, ${timeStr}`;
        },
      },
      { 
        key: 'client_id',
        label: 'Cliente',
        headerAlign: 'left',
        cellAlign: 'left',
        cellValue: (item: any) => item.client?.full_name || ''
      },
      {  
        key: 'case_id', 
        label: 'Caso',
        headerAlign: 'left',
        cellAlign: 'left',
      },
      {
        key: 'result',
        label: 'Resultado',
        headerAlign: 'left',
        cellAlign: 'left',
        truncate: true
      }
    ],
    showActions: true,
    currentPage: 1,
    pageSize: 10,
    totalItems: 0
  };

  constructor(
    public appointmentService: AppointmentService,
    private actionButtonService: ActionButtonService,
    private clientService: ClientService,
    private userService: UserService,
    private caseService: CaseService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.appointmentService = appointmentService;
    this.form = this.fb.group({
      responsible_id: ['', Validators.required],
      client_id: ['', Validators.required],
      case_id: [''],
      subject: ['', Validators.required],
      start_datetime: ['', Validators.required],
      duration: [''],
      status: [''],
      result: ['']
    });
  }

  ngOnInit(): void {
    this.filterParams = {
      status: [],
      date_range: 'Todos'
    };
    
    this.loadAppointments();
    this.actionButtons = this.actionButtonService.getTableActions('appointment');
    this.filterConfig = [
      {
        showSelectedOptions: false,
        showAllOption: true,
        type: 'dropdown-select',
        placeholder: 'Estado',
        formControlName: 'status',
        options: Object.values(APPOINTMENT_STATUS),
        variant: 'tertiary',
        size: 'medium'
      }
    ];
  }

  loadAppointments() {
    this.isLoading = true;
    this.appointmentService.getAppointments(this.currentPage, this.perPage, this.searchTerm, [this.filterParams])
      .subscribe({
        next: (response) => {
          this.appointments = response.appointments || [];
          this.total = response.pagination.total || 0;
          this.currentPage = response.pagination.current_page || 1;
          this.lastPage = response.pagination.last_page || 1;
          this.from = response.pagination.from || 0;
          this.to = response.pagination.to || 0;
          
          this.tableConfig = {
            ...this.tableConfig,
            currentPage: this.currentPage,
            pageSize: this.perPage,
            totalItems: this.total
          };
          
          this.isLoading = false;
        },
        error: (error) => {
          this.notificationService.error('Error al cargar las citas');
          this.isLoading = false;
        }
      });
  }

  onSearch(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.currentPage = 1;
    this.loadAppointments();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadAppointments();
  }

  onNewAppointmentClick() {
    this.inputNewAppointmentFields = [
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
        fieldToSend: 'id',
        nullable: false, 
        variant: 'secondary', 
        size: 'medium', 
        width: 'full'
      },
      { 
        label: 'Responsable', 
        type: 'search', 
        placeholder: 'Buscar responsable...', 
        formControlName: 'responsible_id', 
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
      },
      { 
        label: 'Caso', 
        type: 'search', 
        placeholder: 'Buscar caso...', 
        formControlName: 'case_id', 
        required: false, 
        readonly: !this.form.get('client_id')?.value,
        apiService: this.caseService, 
        apiMethod: 'getCases', 
        apiServiceParams: this.form.get('client_id')?.value ? [{client_id: this.form.get('client_id')?.value}] : [],
        responseDataKey: 'cases',
        fieldToShow: 'id',
        fieldToSend: 'id',
        nullable: false, 
        variant: 'secondary', 
        size: 'medium', 
        width: 'full'
      },
      {label: 'Asunto', type: 'text', placeholder: 'Ingrese el asunto', formControlName: 'subject', required: true, nullable: false, variant: 'secondary', size: 'medium', width: 'full'},
      {label: 'Fecha y hora', type: 'datetime-local', placeholder: '', formControlName: 'start_datetime', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      {label: 'Duración', type: 'time', placeholder: '', formControlName: 'duration', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
    ];

    this.form.get('client_id')?.valueChanges.subscribe(clientId => {
      if (clientId) {
        const caseField = this.inputNewAppointmentFields.find(field => field.formControlName === 'case_id');
        if (caseField) {
          caseField.readonly = false;
          caseField.apiServiceParams = [{client_id: clientId}];
          this.form.get('case_id')?.setValue('');
        }
      } else {
        const caseField = this.inputNewAppointmentFields.find(field => field.formControlName === 'case_id');
        if (caseField) {
          caseField.readonly = true;
          caseField.apiServiceParams = [];
          this.form.get('case_id')?.setValue('');
        }
      }
    });

    this.showNewAppointmentModal = true;
  }

  onNewAppointmentSuccess(response: any) {
    this.showNewAppointmentModal = false;
    this.form.reset();
    this.loadAppointments();
  }

  onNewAppointmentError(error: any) {
  }

  onNewAppointmentCancel() {
    this.showNewAppointmentModal = false;
    this.form.reset();
  }

  onDeleteClick(appointment: Appointment) {
    this.selectedAppointment = appointment;
    this.showDeleteModal = true;
  }

  onDeleteSuccess(response: any) {
    this.showDeleteModal = false;
    this.selectedAppointment = null;
    this.loadAppointments();
  }

  
  onDeleteError(error: any) {
    this.showDeleteModal = false;
    this.selectedAppointment = null;
  }

  onDeleteCancel() {
    this.showDeleteModal = false;
    this.selectedAppointment = null;
  }

  onEditClick(appointment: Appointment) {
    if (!appointment) return;
    
    this.selectedAppointment = appointment; 
    this.form.patchValue({
      id: appointment.id,
      responsible_id: appointment.responsible_id,
      client_id: appointment.client_id,
      case_id: appointment.case_id,
      subject: appointment.subject,
      start_datetime: appointment.start_datetime,
      duration: appointment.duration,
      status: appointment.status,
      result: appointment.result
    });

    this.inputEditFields = [
      { 
        label: 'Cliente', 
        type: 'search', 
        placeholder: 'Buscar cliente...', 
        formControlName: 'client_id', 
        required: true, 
        readonly: true,
        apiService: this.clientService, 
        apiMethod: 'getClients', 
        apiServiceParams: [],
        responseDataKey: 'clients',
        fieldToShow: 'full_name',
        fieldToSend: 'id',
        nullable: false, 
        variant: 'secondary', 
        size: 'medium', 
        width: 'full'
      },
      { 
        label: 'Responsable', 
        type: 'search', 
        placeholder: 'Buscar responsable...', 
        formControlName: 'responsible_id', 
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
      },
      { 
        label: 'Caso', 
        type: 'search', 
        placeholder: 'Buscar caso...', 
        formControlName: 'case_id', 
        required: false, 
        readonly: !this.form.get('client_id')?.value,
        apiService: this.caseService, 
        apiMethod: 'getCases', 
        apiServiceParams: this.form.get('client_id')?.value ? [{client_id: this.form.get('client_id')?.value}] : [],
        responseDataKey: 'cases',
        fieldToShow: 'id',
        fieldToSend: 'id',
        nullable: false, 
        variant: 'secondary', 
        size: 'medium', 
        width: 'full'
      },
      {label: 'Asunto', type: 'text', placeholder: 'Ingrese el asunto', formControlName: 'subject', required: true, nullable: false, variant: 'secondary', size: 'medium', width: 'full'},
      {label: 'Fecha y hora', type: 'datetime-local', placeholder: '', formControlName: 'start_datetime', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      {label: 'Duración', type: 'time', placeholder: '', formControlName: 'duration', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      {label: 'Estado', type: 'dropdown', placeholder: 'Seleccione el estado', formControlName: 'status', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%', options: Object.values(APPOINTMENT_STATUS)},
      {label: 'Resultado', type: 'text-area', placeholder: 'Ingrese el resultado', formControlName: 'result', required: true, nullable: false, variant: 'secondary', size: 'medium', width: 'full'},
    ];
    this.showEditModal = true;
  }

  onEditSuccess(response: any) {
    this.showEditModal = false;
    this.selectedAppointment = null;
    this.form.reset();
    this.loadAppointments();
  }

  onEditError(error: any) {
  }

  onEditCancel() {
    this.showEditModal = false;
    this.selectedAppointment = null;
    this.form.reset();
  }

  onTableAction(event: { type: string; item: Appointment }) {
    switch (event.type) {
      case ActionType.UPDATE:
        this.onEditClick(event.item);
        break;
      case ActionType.DELETE:
        this.onDeleteClick(event.item);
        break;
    }
  }

  onFilterChange(filters: any) {
    // Ensure filters is an object
    const safeFilters = filters || {};
    
    // Handle both status and date filters
    this.filterParams = {
      status: safeFilters.status || [],
      date_range: safeFilters.dateFilter || 'Todos' // Use 'Hoy' as default if no date filter is selected
    };
    
    this.currentPage = 1;
    this.loadAppointments();
  }

} 

