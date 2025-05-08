import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent {
  @Input() placeholder: string = 'Buscar...';
  @Input() type: 'primary' | 'secondary' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Output() search = new EventEmitter<string>();
  searchTerm: string = '';

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm = value;
    this.search.emit(value);
  }
} 