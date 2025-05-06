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
        key: 'responsible',
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
        cellValue: (item: any) => new Date(item.start_datetime).toLocaleString()
      },
      { 
        key: 'client',
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
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.appointmentService = appointmentService;
    this.form = this.fb.group({
      id:['', Validators.required],
      responsible_id:[''],
      client_id:[''],
      case_id:[''],
      subject:[''],
      start_datetime:[''],
      duration_hours:[''],
      duration_minutes:[''],
      status:[''],
      result:['']
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
          this.appointments = response.data?.data || [];
          this.total = response.data?.total || 0;
          this.currentPage = response.data?.page || 1;
          this.lastPage = response.data?.totalPages || 1;
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
      {label: 'Responsable', type: 'text', placeholder: '', formControlName: 'responsible', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      {label: 'Cliente', type: 'text', placeholder: '', formControlName: 'client', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      {label: 'Caso', type: 'text', placeholder: '', formControlName: 'case_id', required: false, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      { label: 'Fecha y hora', type: 'text', placeholder: '', formControlName: 'start_datetime', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      { label: 'Asunto', type: 'text', placeholder: '', formControlName: 'subject', required: true, nullable: false, variant: 'secondary', size: 'medium', width: 'full'},
      { label: 'Duración (horas)', type: 'number', placeholder: 'Horas', formControlName: 'duration_hours', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      { label: 'Duración (minutos)', type: 'number', placeholder: 'Minutos', formControlName: 'duration_minutes', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      { label: 'Resultado', type: 'text', placeholder: 'Resultado', formControlName: 'result', required: false, nullable: false, variant: 'secondary', size: 'medium', width: 'full'}
    ];
    this.showNewAppointmentModal = true;
  }

  onNewAppointmentCancel() {
    this.showNewAppointmentModal = false;
  }

  onNewAppointmentConfirm() {
    this.isLoading = true;
    const formData = {
      id: this.form.get('id')?.value || '',
      responsible_id: this.form.get('responsible_id')?.value || '',
      client_id: this.form.get('client_id')?.value || '',
      case_id: this.form.get('case_id')?.value || '',
      subject: this.form.get('subject')?.value || '',
      start_datetime: this.form.get('start_datetime')?.value || '',
      duration_hours: this.form.get('duration_hours')?.value || '',
      duration_minutes: this.form.get('duration_minutes')?.value || '',
      status: this.form.get('status')?.value || '',
      result: this.form.get('result')?.value || ''
    }

    this.appointmentService.createAppointment(formData)
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
    this.form.patchValue({
      id: appointment.id,
      subject: appointment.subject,
      start_datetime: appointment.start_datetime,
      duration_hours: appointment.duration_hours,
      duration_minutes: appointment.duration_minutes,
      status: appointment.status,
      result: appointment.result
    });

    this.inputEditFields = [
      {label: 'Responsable', type: 'text', placeholder: '', formControlName: 'responsible_id', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      { label: 'Fecha y hora', type: 'text', placeholder: '', formControlName: 'start_datetime', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      { label: 'Asunto', type: 'text', placeholder: '', formControlName: 'subject', required: true, nullable: false, variant: 'secondary', size: 'medium', width: 'full'},
      { label: 'Duración (horas)', type: 'number', placeholder: 'Horas', formControlName: 'duration_hours', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      { label: 'Duración (minutos)', type: 'number', placeholder: 'Minutos', formControlName: 'duration_minutes', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      { label: 'Resultado', type: 'text', placeholder: 'Resultado', formControlName: 'result', required: false, nullable: false, variant: 'secondary', size: 'medium', width: 'full'}
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

