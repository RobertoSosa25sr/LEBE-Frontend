import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, TableConfig } from '../../components/data-table/data-table.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { Report } from '../../models/report.model';
import { ReportService } from '../../services/report.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    DataTableComponent,
    SearchBarComponent,
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

  tableConfig: TableConfig<Report> = {
    keyField: 'user',
    columns: [
      { 
        key: 'user',
        label: 'Nombres',
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
          
          return item.appointments.map((appointment: any) => 
            `${formatDate(appointment.start_datetime)}`
          ).join('<br>');
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
            return 'Sin clientes';
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
            return item.statistics?.total_cases || 0;
          }
          
          if (!item.appointments || item.appointments.length === 0) {
            return 'Sin casos';
          }
          
          return item.appointments.map((appointment: any) => 
            `${appointment.case?.id}`
          ).join('<br>');
        }
      }
    ],
    showActions: false,
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
  };

  constructor(
    private reportService: ReportService,
    private notificationService: NotificationService
  ) {
    this.reportService = reportService;
  }

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports() {
    this.isLoading = true;
    this.reportService.getReports(this.currentPage, this.perPage, this.searchTerm)
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
} 

