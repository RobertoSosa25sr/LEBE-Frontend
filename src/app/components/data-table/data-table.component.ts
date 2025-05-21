import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonConfig } from '../../interfaces/button-config.interface';
import { ButtonComponent } from '../button/button.component';
export type TextAlignment = 'left' | 'center' | 'right';
export type RowStyle = 'default' | 'disabled' | 'emphasis' | 'warning' | 'success';
export type CellStyle = 'default' | 'disabled' | 'emphasis' | 'warning' | 'success';
export type IconStyle = 'info' | 'danger' | 'success' | 'warning' | 'attention';

export interface ColumnConfig<T> {
  key: keyof T | string;
  label: string;
  headerAlign?: TextAlignment;
  cellAlign?: TextAlignment;
  showPhoto?: boolean;
  photoField?: keyof T;
  cellStyle?: (item: T) => CellStyle;
  cellValue?: (item: any) => string | number;
  headerClass?: string;
  width?: string;
  truncate?: boolean;
  showIcon?: boolean;
  iconStyle?: (item: T) => IconStyle;
}

export interface TableConfig<T> {
  columns: ColumnConfig<T>[];
  showActions?: boolean;
  actionButtons?: ButtonConfig[];
  pageSize?: number;
  currentPage?: number;
  totalItems?: number;
  keyField: keyof T;
  rowStyle?: (item: T) => RowStyle;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css']
})
export class DataTableComponent<T> {
  @Input() data: T[] = [];
  @Input() config: TableConfig<T> = { columns: [], keyField: 'id' as keyof T };
  @Input() actionButtons: ButtonConfig[] = [];
  @Output() pageChange = new EventEmitter<number>();
  @Output() search = new EventEmitter<string>();
  @Output() action = new EventEmitter<{ type: string; item: T }>();

  currentPage = 1;
  itemsPerPage = 10;
  searchTerm = '';

  get paginatedData(): T[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.data.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil((this.config.totalItems || this.data.length) / (this.config.pageSize || this.itemsPerPage));
  }

  get paginationRange(): { from: number; to: number } {
    const pageSize = this.config.pageSize || this.itemsPerPage;
    const currentPage = this.config.currentPage || this.currentPage;
    const totalItems = this.config.totalItems || this.data.length;
    return {
      from: (currentPage - 1) * pageSize + 1,
      to: Math.min(currentPage * pageSize, totalItems)
    };
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.pageChange.emit(page);
    }
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.search.emit(term);
  }

  getValue(item: T, key: keyof T | string): unknown {
    if (typeof key === 'string') {
      return (item as any)[key];
    }
    return item[key];
  }

  getItemId(item: T): string {
    return String(this.getValue(item, this.config.keyField));
  }

  getButtonConfig(button: ButtonConfig, itemId: string): ButtonConfig {
    if (Array.isArray(button.routerLink)) {
      return {
        ...button,
        routerLink: button.routerLink.map((link: string) => link === ':id' ? itemId : link)
      };
    }
    return button;
  }

  handleAction(button: ButtonConfig, item: T): void {
    this.action.emit({ type: button.icon || '', item });
  }

  getRowStyle(item: T): RowStyle {
    return this.config.rowStyle ? this.config.rowStyle(item) : 'default';
  }

  getCellStyle(item: T, column: ColumnConfig<T>): CellStyle {
    return column.cellStyle ? column.cellStyle(item) : 'default';
  }

  getInitials(name: string): string {
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  }
} 