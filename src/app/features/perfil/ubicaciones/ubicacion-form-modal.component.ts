import { Component, OnInit, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UbicacionesService } from '../../../core/services/ubicaciones.service';
import { Ubicacion, CreateUbicacionDto, UpdateUbicacionDto } from '../../../core/models';
import { MapPickerComponent, MapLocation } from '../../../shared/components/map-picker/map-picker.component';

@Component({
  selector: 'app-ubicacion-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MapPickerComponent],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
         (click)="onBackdropClick($event)">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
           (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 class="text-2xl font-bold text-gray-900">
            {{ editMode() ? 'Editar Ubicación' : 'Nueva Ubicación' }}
          </h2>
          <button
            type="button"
            (click)="close()"
            class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Form Content -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-4">
          <!-- Nombre -->
          <div>
            <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la ubicación <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nombre"
              formControlName="nombre"
              placeholder="Ej: Consultorio Centro Médico"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              [class.border-red-500]="form.get('nombre')?.invalid && form.get('nombre')?.touched">
            @if (form.get('nombre')?.invalid && form.get('nombre')?.touched) {
              <p class="mt-1 text-sm text-red-600">El nombre es requerido (máximo 200 caracteres)</p>
            }
          </div>

          <!-- Mapa de Ubicación -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Ubicación en el Mapa
              <span class="text-gray-500 font-normal ml-1">(Opcional)</span>
            </label>
            <app-map-picker
              [initialLocation]="initialMapLocation()"
              [mapHeight]="'350px'"
              (locationSelected)="onLocationSelected($event)">
            </app-map-picker>
          </div>

          <!-- Dirección -->
          <div>
            <label for="direccion" class="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <textarea
              id="direccion"
              formControlName="direccion"
              rows="2"
              placeholder="Ej: Col. Loma Linda, Blvd. Morazán"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"></textarea>
          </div>

          <!-- Ciudad -->
          <div>
            <label for="ciudad" class="block text-sm font-medium text-gray-700 mb-1">
              Ciudad
            </label>
            <input
              type="text"
              id="ciudad"
              formControlName="ciudad"
              placeholder="Ej: Tegucigalpa"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          </div>

          <!-- Teléfono -->
          <div>
            <label for="telefono" class="block text-sm font-medium text-gray-700 mb-1">
              Teléfono de contacto
            </label>
            <input
              type="tel"
              id="telefono"
              formControlName="telefono"
              placeholder="+50422551234"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              [class.border-red-500]="form.get('telefono')?.invalid && form.get('telefono')?.touched">
            @if (form.get('telefono')?.invalid && form.get('telefono')?.touched) {
              <p class="mt-1 text-sm text-red-600">Formato: +504XXXXXXXX</p>
            }
            <p class="mt-1 text-xs text-gray-500">Formato Honduras: +504 seguido de 8 dígitos</p>
          </div>

          <!-- Notas -->
          <div>
            <label for="notas" class="block text-sm font-medium text-gray-700 mb-1">
              Notas adicionales
            </label>
            <textarea
              id="notas"
              formControlName="notas"
              rows="3"
              placeholder="Información adicional sobre la ubicación"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"></textarea>
          </div>

          <!-- Error Message -->
          @if (errorMessage()) {
            <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {{ errorMessage() }}
            </div>
          }

          <!-- Actions -->
          <div class="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              (click)="close()"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="form.invalid || saving()"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              @if (saving()) {
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Guardando...</span>
              } @else {
                <span>{{ editMode() ? 'Actualizar' : 'Crear' }} Ubicación</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class UbicacionFormModalComponent implements OnInit {
  @Input() ubicacion: Ubicacion | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly ubicacionesService = inject(UbicacionesService);

  form!: FormGroup;
  editMode = signal<boolean>(false);
  saving = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  selectedMapLocation = signal<MapLocation | null>(null);
  initialMapLocation = signal<MapLocation | null>(null);

  ngOnInit(): void {
    this.editMode.set(!!this.ubicacion);
    this.initForm();

    // Establecer ubicación inicial en el mapa si existe
    if (this.ubicacion?.coordenadas) {
      const mapLocation: MapLocation = {
        address: this.ubicacion.direccion || '',
        coordinates: this.ubicacion.coordenadas,
        placeId: this.ubicacion.googlePlaceId
      };
      this.initialMapLocation.set(mapLocation);
      this.selectedMapLocation.set(mapLocation);
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      nombre: [
        this.ubicacion?.nombre || '',
        [Validators.required, Validators.maxLength(200)]
      ],
      direccion: [this.ubicacion?.direccion || ''],
      ciudad: [this.ubicacion?.ciudad || '', Validators.maxLength(100)],
      telefono: [
        this.ubicacion?.telefono || '',
        [Validators.pattern(/^\+504\d{8}$/)]
      ],
      notas: [this.ubicacion?.notas || '']
    });
  }

  onLocationSelected(location: MapLocation): void {
    this.selectedMapLocation.set(location);

    // Actualizar automáticamente el campo dirección con la dirección del mapa
    if (location.address && !this.form.get('direccion')?.value) {
      this.form.patchValue({ direccion: location.address });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const formValue = this.form.value;

    if (this.editMode() && this.ubicacion) {
      // Update existing ubicacion
      const updateDto: UpdateUbicacionDto = {
        nombre: formValue.nombre,
        direccion: formValue.direccion || undefined,
        ciudad: formValue.ciudad || undefined,
        telefono: formValue.telefono || undefined,
        notas: formValue.notas || undefined,
        coordenadas: this.selectedMapLocation()?.coordinates,
        googlePlaceId: this.selectedMapLocation()?.placeId
      };

      this.ubicacionesService.updateUbicacion(this.ubicacion.id, updateDto).subscribe({
        next: () => {
          this.saving.set(false);
          this.saved.emit();
        },
        error: (err) => {
          this.saving.set(false);
          this.errorMessage.set('Error al actualizar la ubicación');
          console.error('Error updating ubicacion:', err);
        }
      });
    } else {
      // Create new ubicacion
      const createDto: CreateUbicacionDto = {
        nombre: formValue.nombre,
        direccion: formValue.direccion || undefined,
        ciudad: formValue.ciudad || undefined,
        telefono: formValue.telefono || undefined,
        notas: formValue.notas || undefined,
        coordenadas: this.selectedMapLocation()?.coordinates,
        googlePlaceId: this.selectedMapLocation()?.placeId
      };

      this.ubicacionesService.createUbicacion(createDto).subscribe({
        next: () => {
          this.saving.set(false);
          this.saved.emit();
        },
        error: (err) => {
          this.saving.set(false);
          this.errorMessage.set('Error al crear la ubicación');
          console.error('Error creating ubicacion:', err);
        }
      });
    }
  }

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}
