import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../components/button/button.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { DataTableComponent, TableConfig } from '../../components/data-table/data-table.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
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
@Component({
  selector: 'app-cases',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ButtonComponent, 
    ModalComponent,
    DataTableComponent,
    SearchBarComponent,
  ],
  templateUrl: './cases.component.html',
  styleUrls: ['./cases.component.css']
})
export class CasesComponent implements OnInit {
  cases: Case[] = [];
  showDeleteModal = false;
  showEditModal = false;
  showNewCaseModal = false;
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

  buttonNewCaseConfig: ButtonConfig = {
    label: 'Nuevo',
    size: 'medium',
    backgroundColor: 'green',
    type: 'secondary'
  };

  tableConfig: TableConfig<Case> = {
    keyField: 'id',
    columns: [
      { 
        key: 'id',
        label: 'Caso',
        headerAlign: 'left',
        cellAlign: 'left'
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
        cellAlign: 'left'
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
  }

  loadCases() {
    this.isLoading = true;
    this.caseService.getCases(this.currentPage, this.perPage, this.searchTerm)
      .subscribe({
        next: (response) => {
          this.cases = response.cases || [];
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

  onTableAction(event: { type: string; item: Case }) {
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

