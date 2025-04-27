import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActionButtonComponent, ActionButtonConfig } from '../action-button/action-button.component';

export type TextAlignment = 'left' | 'center' | 'right';
export type RowStyle = 'default' | 'disabled' | 'emphasis' | 'warning' | 'success';
export type CellStyle = 'default' | 'disabled' | 'emphasis' | 'warning' | 'success';

export interface ColumnConfig<T> {
  key: keyof T;
  label: string;
  headerAlign?: TextAlignment;
  cellAlign?: TextAlignment;
  showPhoto?: boolean;
  photoField?: keyof T;
  cellStyle?: (item: T) => CellStyle;
  headerClass?: string;
}

export interface TableConfig<T> {
  columns: ColumnConfig<T>[];
  showActions?: boolean;
  actionButtons?: ActionButtonConfig<T>[];
  pageSize?: number;
  currentPage?: number;
  totalItems?: number;
  keyField: keyof T;
  rowStyle?: (item: T) => RowStyle;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, RouterModule, ActionButtonComponent],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css']
})
export class DataTableComponent<T> {
  @Input() data: T[] = [];
  @Input() config: TableConfig<T> = { columns: [], keyField: 'id' as keyof T };
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

  getValue(item: T, key: keyof T): unknown {
    return item[key];
  }

  getItemId(item: T): string {
    return String(this.getValue(item, this.config.keyField));
  }

  getButtonConfig(button: ActionButtonConfig<T>, itemId: string): ActionButtonConfig<T> {
    if (Array.isArray(button.routerLink)) {
      return {
        ...button,
        routerLink: button.routerLink.map((link: string) => link === ':id' ? itemId : link)
      };
    }
    return button;
  }

  handleAction(button: ActionButtonConfig<T>, item: T): void {
    if (button.action) {
      button.action(item);
    }
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