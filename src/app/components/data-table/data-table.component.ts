import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActionButtonComponent, ActionButtonConfig } from '../action-button/action-button.component';

export type TextAlignment = 'left' | 'center' | 'right';

export interface ColumnConfig {
  key: string;
  label: string;
  type?: 'text' | 'user';
  headerAlign?: TextAlignment;
  cellAlign?: TextAlignment;
  showPhoto?: boolean;
}

export interface TableConfig<T = any> {
  columns: ColumnConfig[];
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
export class DataTableComponent<T extends Record<string, any> = any> {
  @Input() config!: TableConfig<T>;
  @Input() data: T[] = [];
  @Output() pageChange = new EventEmitter<number>();
  @Output() action = new EventEmitter<{ action: string, item: T }>();

  get totalPages(): number {
    return Math.ceil((this.config.totalItems || 0) / (this.config.pageSize || 10));
  }

  get paginationRange(): { from: number; to: number } {
    const pageSize = this.config.pageSize || 10;
    const currentPage = this.config.currentPage || 1;
    return {
      from: (currentPage - 1) * pageSize + 1,
      to: Math.min(currentPage * pageSize, this.config.totalItems || 0)
    };
  }

  onPageChange(page: number) {
    this.pageChange.emit(page);
  }

  onAction(action: string, item: T) {
    this.action.emit({ action, item });
  }

  getValue(item: T, key: string): any {
    return item[key];
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
} 