import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActionButtonComponent, ActionButtonConfig } from '../action-button/action-button.component';
import { ActionButtonConfig as NewActionButtonConfig } from '../../interfaces/action-button-config.interface';

export type TextAlignment = 'left' | 'center' | 'right';

interface UserInfo {
  name: string;
  photo_url?: string;
}

export interface ColumnConfig {
  key: string;
  label: string;
  type?: 'text' | 'user';
  headerAlign?: TextAlignment;
  cellAlign?: TextAlignment;
  showPhoto?: boolean;
}

export interface TableConfig<T> {
  columns: {
    key: keyof T;
    label: string;
    headerAlign?: 'left' | 'center' | 'right';
    cellAlign?: 'left' | 'center' | 'right';
    type?: 'text' | 'user';
    showPhoto?: boolean;
  }[];
  showActions?: boolean;
  actionButtons?: ActionButtonConfig<T>[];
  pageSize?: number;
  currentPage?: number;
  totalItems?: number;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, RouterModule, ActionButtonComponent],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css']
})
export class DataTableComponent<T extends { id?: number; id_number?: string }> {
  @Input() data: T[] = [];
  @Input() config: TableConfig<T> = { columns: [] };
  @Input() actionButtons: ActionButtonConfig<T>[] = [];
  @Output() pageChange = new EventEmitter<number>();
  @Output() search = new EventEmitter<string>();

  currentPage = 1;
  itemsPerPage = 10;
  searchTerm = '';

  get paginatedData(): T[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.data.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.data.length / this.itemsPerPage);
  }

  get paginationRange(): { from: number; to: number } {
    const pageSize = this.config.pageSize || 10;
    const currentPage = this.config.currentPage || 1;
    return {
      from: (currentPage - 1) * pageSize + 1,
      to: Math.min(currentPage * pageSize, this.config.totalItems || 0)
    };
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.pageChange.emit(page);
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.search.emit(term);
  }

  getValue(item: T, key: keyof T): unknown {
    return item[key];
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  }

  isUserInfo(value: unknown): value is UserInfo {
    return typeof value === 'object' && value !== null && 'name' in value;
  }

  getButtonConfig(button: ActionButtonConfig<T>, itemId: number | string): ActionButtonConfig<T> {
    if (Array.isArray(button.routerLink)) {
      return {
        ...button,
        routerLink: button.routerLink.map((link: string) => link === ':id' ? itemId.toString() : link)
      };
    }
    return button;
  }

  getUserInfo(value: unknown): UserInfo | null {
    return this.isUserInfo(value) ? value : null;
  }

  getItemId(item: T): number | string {
    return item.id ?? item.id_number ?? '';
  }

  handleAction(button: ActionButtonConfig<T>, item: T): void {
    if (button.action) {
      button.action(item);
    }
  }
} 