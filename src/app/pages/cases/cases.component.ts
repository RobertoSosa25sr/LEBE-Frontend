import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../components/button/button.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { DataTableComponent, TableConfig } from '../../components/data-table/data-table.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { InputFieldComponent } from '../../components/input-field/input-field.component';
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
    InputFieldComponent
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
    private caseService: CaseService,
    private userService: UserService,
    private actionButtonService: ActionButtonService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.caseService = caseService;
    this.userService = userService;
    this.form = this.fb.group({
      id: ['', Validators.required],
      manager_id: [''],
      client_id: [''],
      status: [''],
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
          this.cases = response.data?.data || [];
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
        apiService: this.userService, 
        apiMethod: 'getUsers', 
        apiServiceParams: [], 
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
        apiServiceParams: [], 
        fieldToShow: 'full_name', 
        nullable: false, 
        variant: 'secondary', 
        size: 'medium', 
        width: 'full'
      }
    ];
    this.showNewCaseModal = true;
  }

  onNewCaseCancel() {
    this.showNewCaseModal = false;
  }

  onNewCaseConfirm() {
    this.isLoading = true;
    const formData = {
      id: this.form.get('id')?.value || '',
      manager_id: this.form.get('manager_id')?.value || '',
      client_id: this.form.get('client_id')?.value || '',
      status: this.form.get('status')?.value || '',
    }

    this.caseService.createCase(formData)
      .subscribe({
        next: (response) => {
          this.loadCases();
          this.showNewCaseModal = false;
          this.isLoading = false;
          this.form.reset();

          this.inputNewCaseFields = [
            { label: 'Nombres', type: 'text', placeholder: '', formControlName: 'first_name', required: true, nullable: false, variant: 'secondary', size: 'medium', width: 'full'},
            { label: 'Apellidos', type: 'text', placeholder: '', formControlName: 'last_name', required: true, nullable: false, variant: 'secondary', size: 'medium', width: 'full'},
            { label: 'Cédula', type: 'text', placeholder: '', formControlName: 'id', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
            { label: 'Contraseña', placeholder: 'Contraseña', type: 'password' , formControlName: 'password', required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
            { label: 'Rol', placeholder: 'Sin acceso', type: 'dropdown-select', value: '', formControlName: 'roles', options: Object.values(ROLES), required: false, nullable: true, variant: 'secondary', size: 'medium', width: '50%'}
          ];
          this.notificationService.success('Usuario creado correctamente');
        },
        error: (error) => {
          this.isLoading = false;
          this.form.reset();
          this.inputNewCaseFields = [];
          this.showNewCaseModal = false;
          this.notificationService.error('Error al crear el caso');
        }
      });
  }

  onDeleteClick(caseData: Case) {
    this.selectedCase = caseData;
    this.showDeleteModal = true;
  }

  onDeleteCancel() {
    this.showDeleteModal = false;
    this.selectedCase = null;
  }

  onDeleteConfirm() {
    if (this.selectedCase) {
      this.isLoading = true;
      this.caseService.deleteCase(this.selectedCase.id)
        .subscribe({
          next: () => {
            this.loadCases();
            this.showDeleteModal = false;
            this.selectedCase = null;
            this.notificationService.success('Caso eliminado correctamente');
          },
          error: (error) => {
            this.notificationService.error('Error al eliminar el caso');
            this.isLoading = false;
            this.showDeleteModal = false;
            this.selectedCase = null;
          }
        });
    }
  }

  onEditClick(caseData: Case) {
    if (!caseData) return;
    
    this.selectedCase = caseData;
    this.form.reset();
    this.form.patchValue({
      id: caseData.id,
      manager_id: caseData.manager_id,
      client_id: caseData.client_id,
      status: caseData.status
    });

    this.inputEditFields = [
      { label: 'Encargado', type: 'text', placeholder: caseData.manager_id, formControlName: 'manager_id', readonly: true, required: false, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      { label: 'Cliente', type: 'text', placeholder: caseData.client_id, formControlName: 'client_id', readonly: true, required: false, nullable: false, variant: 'secondary', size: 'medium', width: '50%'},
      { label: 'Estado', type: 'dropdown', value: caseData.status, formControlName: 'status', readonly: false, required: true, nullable: false, variant: 'secondary', size: 'medium', width: '50%', options: Object.values(CASE_STATUS)},

    ];
    this.showEditModal = true;
  }

  onEditCancel() {
    this.showEditModal = false;
    this.selectedCase = null;
  }

  onEditConfirm() {
    if (this.selectedCase) {
      this.isLoading = true;
      const formData = this.form.getRawValue();
      
      this.caseService.updateCase(this.selectedCase.id, formData)
        .subscribe({
          next: () => {
            this.loadCases();
            this.showEditModal = false;
            this.selectedCase = null;
            this.isLoading = false;
            this.notificationService.success('Caso actualizado correctamente');
          },
          error: (error) => {
            this.notificationService.error('Error al actualizar el caso');
            this.isLoading = false;
          }
        });
    }
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

