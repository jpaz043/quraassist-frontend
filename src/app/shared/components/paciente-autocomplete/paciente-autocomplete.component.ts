import { Component, forwardRef, OnInit, inject, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import { PacientesService } from '../../../features/pacientes/pacientes.service';
import { Paciente } from '../../../core/models';

export interface PacienteSeleccionado {
  id?: string;              // UUID si existe
  nombreCompleto: string;
  telefono: string;
  email?: string;
  esNuevo: boolean;         // true si es un paciente nuevo a crear
}

@Component({
  selector: 'app-paciente-autocomplete',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, NgClass],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PacienteAutocompleteComponent),
      multi: true
    }
  ],
  template: `
    <div class="relative">
      <!-- Input de búsqueda -->
      <div class="relative">
        <input
          type="text"
          [formControl]="searchControl"
          class="input-medical w-full pr-10"
          placeholder="Buscar por nombre o teléfono..."
          (focus)="onFocus()"
          (blur)="onBlur()"
          autocomplete="off"
        >
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            *ngIf="!isLoading"
            class="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <svg
            *ngIf="isLoading"
            class="animate-spin w-5 h-5 text-primary-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </div>

      <!-- Paciente seleccionado -->
      <div
        *ngIf="selectedPaciente && !showDropdown"
        class="mt-2 p-3 bg-primary-50 border border-primary-200 rounded-lg flex items-center justify-between"
      >
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div>
            <p class="font-medium text-gray-900">
              {{selectedPaciente.nombreCompleto}}
              <span
                *ngIf="selectedPaciente.esNuevo"
                class="ml-2 text-xs bg-success-100 text-success-700 px-2 py-0.5 rounded-full"
              >
                Nuevo
              </span>
            </p>
            <p class="text-sm text-gray-600">{{selectedPaciente.telefono}}</p>
          </div>
        </div>
        <button
          type="button"
          (click)="clearSelection()"
          class="text-gray-400 hover:text-gray-600"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Dropdown de resultados -->
      <div
        *ngIf="showDropdown && (pacientes.length > 0 || canCreateNew)"
        class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
      >
        <!-- Resultados existentes -->
        <button
          *ngFor="let paciente of pacientes"
          type="button"
          (mousedown)="selectPaciente(paciente)"
          class="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-50 transition-colors"
        >
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div class="flex-1">
              <p class="font-medium text-gray-900">{{paciente.nombreCompleto}}</p>
              <p class="text-sm text-gray-600">{{paciente.telefono}}</p>
            </div>
          </div>
        </button>

        <!-- Opción para crear nuevo paciente -->
        <button
          *ngIf="canCreateNew && searchControl.value && searchControl.value.length >= 3"
          type="button"
          (mousedown)="createNewPaciente()"
          class="w-full px-4 py-3 text-left hover:bg-primary-50 border-t-2 border-primary-200 focus:outline-none transition-colors"
        >
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="font-medium text-success-700">Crear nuevo paciente</p>
              <p class="text-sm text-gray-600">Con el nombre "{{searchControl.value}}"</p>
            </div>
          </div>
        </button>

        <!-- Sin resultados -->
        <div
          *ngIf="pacientes.length === 0 && searchControl.value && searchControl.value.length >= 3 && !canCreateNew"
          class="px-4 py-8 text-center text-gray-500"
        >
          <svg class="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p>No se encontraron pacientes</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class PacienteAutocompleteComponent implements ControlValueAccessor, OnInit, OnDestroy {
  private pacientesService = inject(PacientesService);

  searchControl = new FormControl('');
  pacientes: Paciente[] = [];
  selectedPaciente: PacienteSeleccionado | null = null;
  showDropdown = false;
  isLoading = false;
  canCreateNew = true; // Permite crear nuevos pacientes

  private searchSubscription?: Subscription;
  private onChange: (value: PacienteSeleccionado | null) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    // Búsqueda con debounce
    this.searchSubscription = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(value => value !== null && value.length >= 2),
      switchMap(query => {
        this.isLoading = true;
        return this.pacientesService.searchPacientesQuick(query!);
      })
    ).subscribe({
      next: (response) => {
        this.pacientes = response.data;
        this.isLoading = false;
        this.showDropdown = true;
      },
      error: (error) => {
        console.error('Error en búsqueda:', error);
        this.isLoading = false;
        this.pacientes = [];
      }
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  onFocus(): void {
    if (this.pacientes.length > 0 || this.searchControl.value) {
      this.showDropdown = true;
    }
  }

  onBlur(): void {
    // Delay para permitir click en opciones
    setTimeout(() => {
      this.showDropdown = false;
    }, 200);
  }

  selectPaciente(paciente: Paciente): void {
    this.selectedPaciente = {
      id: paciente.id,
      nombreCompleto: paciente.nombreCompleto,
      telefono: paciente.telefono,
      email: paciente.email,
      esNuevo: false
    };

    this.searchControl.setValue(paciente.nombreCompleto, { emitEvent: false });
    this.showDropdown = false;
    this.onChange(this.selectedPaciente);
    this.onTouched();
  }

  createNewPaciente(): void {
    const searchValue = this.searchControl.value || '';

    this.selectedPaciente = {
      nombreCompleto: searchValue,
      telefono: '', // Se debe llenar en el formulario
      esNuevo: true
    };

    this.showDropdown = false;
    this.onChange(this.selectedPaciente);
    this.onTouched();
  }

  clearSelection(): void {
    this.selectedPaciente = null;
    this.searchControl.setValue('', { emitEvent: false });
    this.pacientes = [];
    this.onChange(null);
    this.onTouched();
  }

  // ControlValueAccessor interface
  writeValue(value: PacienteSeleccionado | null): void {
    this.selectedPaciente = value;
    if (value) {
      this.searchControl.setValue(value.nombreCompleto, { emitEvent: false });
    } else {
      this.searchControl.setValue('', { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.searchControl.disable();
    } else {
      this.searchControl.enable();
    }
  }
}
