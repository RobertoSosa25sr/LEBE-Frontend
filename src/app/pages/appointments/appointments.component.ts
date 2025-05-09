import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../components/button/button.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { DataTableComponent, TableConfig } from '../../components/data-table/data-table.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
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
@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ButtonComponent, 
    ModalComponent,
    DataTableComponent,
    SearchBarComponent
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

  buttonNewAppointmentConfig: ButtonConfig = {
    label: 'Nuevo',
    size: 'medium',
    backgroundColor: 'green',
    type: 'secondary'
  };

  tableConfig: TableConfig<Appointment> = {
    keyField: 'id',
    columns: [
      { 
        key: 'ticket_number',
        label: '#',
        headerAlign: 'left',
        cellAlign: 'left'
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
          const options: Intl.DateTimeFormatOptions = { 
            day: 'numeric', 
            month: 'long',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true 
          };
          return date.toLocaleDateString('es-ES', options);
        }
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
        cellAlign: 'left'
      },
      {
        key: 'result',
        label: 'Resultado',
        headerAlign: 'left',
        cellAlign: 'left',
      }
    ],
    showActions: true,
    currentPage: 1,
    pageSize: 10,
    totalItems: 0
  };

  constructor(
    private appointmentService: AppointmentService,
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
    this.loadAppointments();
    this.actionButtons = this.actionButtonService.getTableActions('appointment');
  }

  loadAppointments() {
    this.isLoading = true;
    this.appointmentService.getAppointments(this.currentPage, this.perPage, this.searchTerm)
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

    // Subscribe to client_id changes to update case search
    this.form.get('client_id')?.valueChanges.subscribe(clientId => {
      if (clientId) {
        // Find the case field in inputNewAppointmentFields
        const caseField = this.inputNewAppointmentFields.find(field => field.formControlName === 'case_id');
        if (caseField) {
          caseField.readonly = false;
          caseField.apiServiceParams = [{client_id: clientId}];
          // Reset case_id when client changes
          this.form.get('case_id')?.setValue('');
        }
      } else {
        // Find the case field in inputNewAppointmentFields
        const caseField = this.inputNewAppointmentFields.find(field => field.formControlName === 'case_id');
        if (caseField) {
          caseField.readonly = true;
          caseField.apiServiceParams = [];
          // Reset case_id when client is cleared
          this.form.get('case_id')?.setValue('');
        }
      }
    });

    this.showNewAppointmentModal = true;
  }

  onNewAppointmentCancel() {
    this.showNewAppointmentModal = false;
  }

  onNewAppointmentConfirm() {
    this.isLoading = true;
    const formData = this.form.getRawValue();
    
    // Format the datetime to match the required format
    const startDate = new Date(formData.start_datetime);
    const formattedStartDate = startDate.toISOString().slice(0, 19).replace('T', ' ');
    
    // Format duration to HH:mm format
    const duration = formData.duration;
    const formattedDuration = duration.split(':').slice(0, 2).join(':');
    
    const requestData = {
      ...formData,
      start_datetime: formattedStartDate,
      duration: formattedDuration,
      status: 'pendiente'
    };

    this.appointmentService.createAppointment(requestData)
      .subscribe({
        next: (response) => {
          this.loadAppointments();
          this.showNewAppointmentModal = false;
          this.isLoading = false;
          this.form.reset();
          this.notificationService.success('Cita creada correctamente');
        },
        error: (error) => {
          this.isLoading = false;
          this.form.reset();
          this.inputNewAppointmentFields = [];
          this.showNewAppointmentModal = false;
          this.notificationService.error('Error al crear la cita');
        }
      });
  }

  onDeleteClick(appointment: Appointment) {
    this.selectedAppointment = appointment;
    this.showDeleteModal = true;
  }

  onDeleteCancel() {
    this.showDeleteModal = false;
    this.selectedAppointment = null;
  }

  onDeleteConfirm() {
    if (this.selectedAppointment) {
      this.isLoading = true;
      this.appointmentService.deleteAppointment(this.selectedAppointment.id.toString())
        .subscribe({
          next: () => {
            this.loadAppointments();
            this.showDeleteModal = false;
            this.selectedAppointment = null;
            this.notificationService.success('Cita eliminada correctamente');
          },
          error: (error) => {
            this.notificationService.error('Error al eliminar la cita');
            this.isLoading = false;
            this.showDeleteModal = false;
            this.selectedAppointment = null;
          }
        });
    }
  }

  onEditClick(appointment: Appointment) {
    if (!appointment) return;
    
    this.selectedAppointment = appointment;
    this.form.reset();
    
    const startDate = new Date(appointment.start_datetime);
    const formattedStartDate = startDate.toISOString().slice(0, 16);
    
    const [hours, minutes] = appointment.duration.split(':');
    const formattedDuration = `${hours}:${minutes}`;
    
    this.form.patchValue({
      id: appointment.id,
      responsible_id: appointment.responsible_id,
      client_id: appointment.client_id,
      case_id: appointment.case_id,
      subject: appointment.subject,
      start_datetime: formattedStartDate,
      duration: formattedDuration,
      status: appointment.status,
      result: appointment.result
    });

    this.inputEditFields = [
      {label: 'Responsable', type: 'text', value: appointment.responsible_id, formControlName: 'responsible_id', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      {label: 'Cliente', type: 'text', value: appointment.client_id, formControlName: 'client_id', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      { label: 'Asunto', type: 'text', value: appointment.subject, formControlName: 'subject', required: true, nullable: false, variant: 'secondary', size: 'medium', width: 'full'},
      { label: 'Fecha y hora', type: 'datetime-local', value: formattedStartDate, formControlName: 'start_datetime', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      { label: 'Duración', type: 'time', value: formattedDuration, formControlName: 'duration', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      { label: 'Resultado', type: 'text-area', value: appointment.result, formControlName: 'result', required: false, nullable: false, variant: 'secondary', size: 'medium', width: 'full'}
    ];
    this.showEditModal = true;
  }

  onEditCancel() {
    this.showEditModal = false;
    this.selectedAppointment = null;
  }

  onEditConfirm() {
    if (this.selectedAppointment) {
      this.isLoading = true;
      const formData = this.form.getRawValue();
      
      this.appointmentService.updateAppointment(this.selectedAppointment.id.toString(), formData)
        .subscribe({
          next: () => {
            this.loadAppointments();
            this.showEditModal = false;
            this.selectedAppointment = null;
            this.isLoading = false;
            this.notificationService.success('Cita actualizada correctamente');
          },
          error: (error) => {
            this.notificationService.error('Error al actualizar la cita');
            this.isLoading = false;
          }
        });
    }
  }

  onTableAction(event: { type: string; item: Appointment }) {
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

