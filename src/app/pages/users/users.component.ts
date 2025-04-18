import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../components/button/button.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { DataTableComponent, TableConfig } from '../../components/data-table/data-table.component';
import { ActionButtonComponent } from '../../components/action-button/action-button.component';
import { UserService, User, UserListResponse } from '../../services/user.service';
import { ActionButtonService } from '../../services/action-button.service';
import { ActionButtonConfig } from '../../interfaces/action-button-config.interface';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ButtonComponent, 
    ModalComponent,
    DataTableComponent,
    ActionButtonComponent
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  showDeleteModal = false;
  selectedUser: User | null = null;
  isLoading = false;
  currentPage = 1;
  perPage = 10;
  total = 0;
  lastPage = 1;
  from = 0;
  to = 0;
  searchTerm = '';
  actionButtons: ActionButtonConfig[] = [];

  tableConfig: TableConfig<User> = {
    columns: [
      { 
        key: 'name',
        label: 'Nombres',
        type: 'user',
        showPhoto: true,
        headerAlign: 'left',
        cellAlign: 'left'
      },
      { 
        key: 'id_number',
        label: 'Cédula',
        type: 'text',
        headerAlign: 'left',
        cellAlign: 'left'
      }
    ],
    showActions: true,
    currentPage: 1,
    pageSize: 10,
    totalItems: 0
  };

  constructor(
    private userService: UserService,
    private actionButtonService: ActionButtonService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.actionButtons = this.actionButtonService.getTableActions('user').map(button => {
      if (button.icon === 'delete') {
        return {
          ...button,
          action: (user: User) => this.onDeleteClick(user)
        };
      }
      return button;
    });
  }

  loadUsers() {
    this.isLoading = true;
    this.userService.getUsers(this.currentPage, this.perPage, this.searchTerm)
      .subscribe({
        next: (response: UserListResponse) => {
          this.users = response.users;
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
          console.error('Error loading users:', error);
          this.isLoading = false;
        }
      });
  }

  onSearch(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.currentPage = 1;
    this.loadUsers();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadUsers();
  }

  onDeleteClick(user: User) {
    this.selectedUser = user;
    this.showDeleteModal = true;
  }

  onDeleteConfirm() {
    if (this.selectedUser) {
      this.isLoading = true;
      this.userService.deleteUser({ id_number: this.selectedUser.id_number })
        .subscribe({
          next: () => {
            this.loadUsers();
            this.showDeleteModal = false;
            this.selectedUser = null;
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            this.isLoading = false;
            this.showDeleteModal = false;
            this.selectedUser = null;
          }
        });
    }
  }

  onDeleteCancel() {
    this.showDeleteModal = false;
    this.selectedUser = null;
  }
} 