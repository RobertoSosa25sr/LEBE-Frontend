import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { DataTableComponent, TableConfig } from '../../components/data-table/data-table.component';
import { FilterBarComponent } from '../../components/filter-bar/filter-bar.component';
import { Report } from '../../models/report.model';
import { ReportService } from '../../services/report.service';
import { NotificationService } from '../../services/notification.service';
import { InputFieldConfig } from '../../interfaces/Input-field-config.interface';
import { APPOINTMENT_STATUS } from '../../shared/constants/appointment-status.contants';
import { CASE_STATUS } from '../../shared/constants/case-status.constants';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    DataTableComponent,
    FilterBarComponent,
    FormsModule
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  reports: Report[] = [];
  isLoading = false;
  currentPage = 1;
  perPage = 10;
  total = 0;
  lastPage = 1;
  from = 0;
  to = 0;
  searchTerm = '';
  showSummary = false;
  form: FormGroup;
  filterConfig: InputFieldConfig[] = [];
  filterParams: any = {};

  constructor(
    private reportService: ReportService,
    private notificationService: NotificationService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.reportService = reportService;
    this.form = this.fb.group({
      date_range: ['', Validators.required],
      appointment_status: [''],
      case_status: ['']
    });
  }

  ngOnInit(): void {
    this.loadReports();
    this.filterParams = {
      date_range: 'Hoy',
      appointment_status: [],
      case_status: []
    };
    this.filterConfig = [
      {
        showSelectedOptions: false,
        showAllOption: true,
        type: 'dropdown-select',
        placeholder: 'Estado de la cita',
        formControlName: 'appointment_status',
        options: Object.values(APPOINTMENT_STATUS),
        variant: 'tertiary',
        size: 'medium'
      },
      {
        showSelectedOptions: false,
        showAllOption: true,
        type: 'dropdown-select',
        placeholder: 'Estado del caso',
        formControlName: 'case_status',
        options: Object.values(CASE_STATUS),
        variant: 'tertiary',
        size: 'medium'
      }
    ];
  }

  loadReports() {
    this.isLoading = true;
    this.reportService.getReports(this.currentPage, this.perPage, this.searchTerm, [this.filterParams])
      .subscribe({
        next: (response) => {
          this.reports = response.reports || [];
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
          this.notificationService.error('Error al cargar el reporte');
          this.isLoading = false;
        }
      });
  }

  onSearch(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.currentPage = 1;
    this.loadReports();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadReports();
  }

  onSummaryToggle() {
    this.tableConfig = {
      ...this.tableConfig,
      columns: [...this.tableConfig.columns]
    };
  }

  onFilterChange(filters: any) {
    const safeFilters = filters || {};
    this.filterParams = {
      date_range: safeFilters.dateFilter || 'Todos',
      appointment_status: safeFilters.appointment_status || [],
      case_status: safeFilters.case_status || []
    };
    this.currentPage = 1;
    this.loadReports();
  }

  getStatisticsHtml(cases: any): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(`
      <div class="stat-row">
        <i class="fa-solid fa-square stat-icon total"></i>
        <span>Total: ${cases.total}</span>
      </div>
      <div class="stat-row">
        <i class="fa-solid fa-square stat-icon closed"></i>
        <span>Cerrados: ${cases.closed}</span>
      </div>
      <div class="stat-row">
        <i class="fa-solid fa-square stat-icon open"></i>
        <span>Abiertos: ${cases.open}</span>
      </div>
      <div class="stat-row">
        <i class="fa-solid fa-square stat-icon in-progress"></i>
        <span>En Proceso: ${cases.in_progress}</span>
      </div>
    `);
  }

  tableConfig: TableConfig<Report> = {
    keyField: 'user',
    columns: [
      { 
        key: 'user',
        label: 'Abogado',
        headerAlign: 'left',
        cellAlign: 'left',
        cellValue: (item: any) => item.user?.full_name || ''
      },
      { 
        key: 'appointments',
        label: 'Citas',
        headerAlign: 'left',
        cellAlign: 'left',
        cellValue: (item: any) => {
          if (this.showSummary) {
            return item.statistics?.total_appointments || 0;
          }
          
          if (!item.appointments || item.appointments.length === 0) {
            return 'Sin citas';
          }
          
          const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            const options: Intl.DateTimeFormatOptions = { 
              day: 'numeric', 
              month: 'long',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true
            };
            return date.toLocaleDateString('es-ES', options);
          };
          
          return item.appointments.map((appointment: any) => {
            let iconClass = '';
            const status = appointment.status.toLowerCase();
            switch(status) {
              case APPOINTMENT_STATUS.COMPLETED.toLowerCase():
                iconClass = 'success';
                break;
              case APPOINTMENT_STATUS.CANCELLED.toLowerCase():
                iconClass = 'danger';
                break;
              case APPOINTMENT_STATUS.RESCHEDULED.toLowerCase():
                iconClass = 'warning';
                break;
              case APPOINTMENT_STATUS.PENDING.toLowerCase():
              default:
                iconClass = 'info';
            }
            return `<i class="fa-solid fa-square stat-icon ${iconClass}"></i> ${formatDate(appointment.start_datetime)}`;
          }).join('<br>');
        }
      },
      { 
        key: 'clients',
        label: 'Clientes',
        headerAlign: 'left',
        cellAlign: 'left',
        cellValue: (item: any) => {
          if (this.showSummary) {
            return item.statistics?.total_clients || 0;
          }
          
          if (!item.appointments || item.appointments.length === 0) {
            return '';
          }
          
          return item.appointments.map((appointment: any) => 
            `${appointment.client?.full_name}`
          ).join('<br>');
        }
      },
      { 
        key: 'cases',
        label: 'Casos',
        headerAlign: 'left',
        cellAlign: 'left',
        cellValue: (item: any) => {
          if (this.showSummary) {
            const cases = item.statistics?.total_cases || { total: 0, closed: 0, open: 0, in_progress: 0 };
            return this.getStatisticsHtml(cases);
          }
          
          if (!item.appointments || item.appointments.length === 0) {
            return '';
          }
          
          return item.appointments.map((appointment: any) => {
            let iconClass = '';
            switch(appointment.case?.status) {
              case CASE_STATUS.OPEN:
                iconClass = 'success';
                break;
              case CASE_STATUS.CLOSED:
                iconClass = 'danger';
                break;
              case CASE_STATUS.IN_PROGRESS:
                iconClass = 'warning';
                break;
              default:
                iconClass = 'info';
            }
            return `<i class="fa-solid fa-square stat-icon ${iconClass}"></i> ${appointment.case?.id}`;
          }).join('<br>');
        }
      }
    ],
    showActions: false,
    currentPage: 1,
    pageSize: 10,
    totalItems: 0
  };
} 

