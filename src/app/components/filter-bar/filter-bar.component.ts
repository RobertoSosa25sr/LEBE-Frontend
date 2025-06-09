import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, HostListener } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SearchBarComponent } from "../search-bar/search-bar.component";
import { InputFieldComponent } from "../input-field/input-field.component";
import { InputFieldConfig } from "../../interfaces/Input-field-config.interface";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { Subscription } from "rxjs";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, SearchBarComponent, InputFieldComponent, ReactiveFormsModule, FormsModule],
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.css']
})
export class FilterBarComponent implements OnInit, OnDestroy {
  @Input() filterConfig: InputFieldConfig[] = [];
  @Input() responseDataKey: string = '';
  @Input() dateFilter: boolean = false;
  @Input() placeholder: string = 'Buscar...';
  @Output() search = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<any>();
  form: FormGroup;
  private formSubscription: Subscription = new Subscription();

  dateOptions = {
    past: ['Ayer', 'Semana pasada', 'Mes pasado'],
    future: ['Hoy', 'Mañana', 'Esta semana', 'Siguiente semana', 'Este mes', 'Siguiente mes']
  };
  currentDateOption: string = 'Todos';
  currentPastIndex: number = -1;
  currentFutureIndex: number = -1;
  showDatePicker: boolean = false;
  selectedDate: string = '';
  isCustomDate: boolean = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({});
  }

  ngOnInit() {
    this.initializeForm();
    this.formSubscription = this.form.valueChanges.subscribe(values => {
      this.filterChange.emit(values);
    });
  }

  ngOnDestroy() {
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }
  }

  private initializeForm() {
    if (this.filterConfig.length > 0) {
      const formControls: { [key: string]: any } = {};
      this.filterConfig.forEach(filter => {
        if (filter.formControlName) {
          if (filter.showAllOption) {
            formControls[filter.formControlName] = [[]];
          } else {
            formControls[filter.formControlName] = [filter.value || ''];
          }
        }
      });
      this.form = this.fb.group(formControls);
    }
  }

  onSearch(searchTerm: string) {
    this.search.emit(searchTerm);
  }

  getFieldValue(filter: InputFieldConfig): string {
    return filter.formControlName || '';
  }

  getFilterReadonly(filter: InputFieldConfig): boolean {
    return filter.readonly || false;
  }

  getFilterRequired(filter: InputFieldConfig): boolean {
    return filter.required || false;
  }

  getFilterNullable(filter: InputFieldConfig): boolean {
    return filter.nullable || false;
  }

  getFilterShowAllOption(filter: InputFieldConfig): boolean {
    return filter.showAllOption || false;
  }

  isLeftArrowDisabled(): boolean {
    return this.currentPastIndex === this.dateOptions.past.length - 1;
  }

  isRightArrowDisabled(): boolean {
    return this.currentFutureIndex === this.dateOptions.future.length - 1;
  }

  onDateSelected() {
    if (this.selectedDate) {
      const [year, month, day] = this.selectedDate.split('-').map(Number);
      const date = new Date(year, month - 1, day, 12, 0, 0);
      const formattedDate = date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      this.currentDateOption = formattedDate;
      this.isCustomDate = true;
      this.currentPastIndex = -1;
      this.currentFutureIndex = -1;
      this.filterChange.emit({ ...this.form.value, dateFilter: formattedDate });
    }
  }

  navigateDate(direction: 'left' | 'right') {
    if (this.isCustomDate) {
      this.isCustomDate = false;
      this.currentDateOption = 'Todos';
      this.currentPastIndex = -1;
      this.currentFutureIndex = -1;
      this.selectedDate = '';
      this.filterChange.emit({ ...this.form.value, dateFilter: 'Todos' });
      return;
    }

    if (direction === 'left') {
      if (this.currentPastIndex === -1) {
        if (this.currentFutureIndex !== -1) {
          // If we're in future navigation, return to Hoy
          this.currentFutureIndex = -1;
          this.currentDateOption = 'Todos';
        } else {
          // If we're at Hoy, start past navigation
          this.currentPastIndex = 0;
          this.currentDateOption = this.dateOptions.past[0];
        }
      } else if (!this.isLeftArrowDisabled()) {
        // Continue past navigation
        this.currentPastIndex++;
        this.currentDateOption = this.dateOptions.past[this.currentPastIndex];
      }
    } else {
      if (this.currentFutureIndex === -1) {
        if (this.currentPastIndex !== -1) {
          // If we're in past navigation, return to Hoy
          this.currentPastIndex = -1;
          this.currentDateOption = 'Todos';
        } else {
          // If we're at Hoy, start future navigation
          this.currentFutureIndex = 0;
          this.currentDateOption = this.dateOptions.future[0];
        }
      } else if (!this.isRightArrowDisabled()) {
        // Continue future navigation
        this.currentFutureIndex++;
        this.currentDateOption = this.dateOptions.future[this.currentFutureIndex];
      }
    }
    
    this.filterChange.emit({ ...this.form.value, dateFilter: this.currentDateOption });
  }
}
