import { Component, Input, Output, EventEmitter, OnInit, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface TimeSlot {
  time: string;
  available: boolean;
  isPast?: boolean;
}

export interface DateTimeSelection {
  date: Date;
  time: string;
}

@Component({
  selector: 'app-date-time-picker',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateTimePickerComponent),
      multi: true
    }
  ],
  template: `
    <div class="flex flex-col lg:flex-row gap-6 p-6 bg-white rounded-lg border border-gray-200">
      <!-- Mini Calendario -->
      <div class="flex-shrink-0">
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <!-- Header del calendario -->
          <div class="flex items-center justify-between mb-4">
            <button
              type="button"
              (click)="previousMonth()"
              class="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <span class="material-icons-outlined text-gray-600">chevron_left</span>
            </button>

            <h3 class="text-base font-semibold text-gray-900">
              {{ getMonthName() }} {{ currentYear }}
            </h3>

            <button
              type="button"
              (click)="nextMonth()"
              class="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <span class="material-icons-outlined text-gray-600">chevron_right</span>
            </button>
          </div>

          <!-- Días de la semana -->
          <div class="grid grid-cols-7 gap-1 mb-2">
            <div *ngFor="let day of ['D', 'L', 'M', 'M', 'J', 'V', 'S']"
                 class="text-center text-xs font-medium text-gray-500 py-1">
              {{ day }}
            </div>
          </div>

          <!-- Días del mes -->
          <div class="grid grid-cols-7 gap-1">
            <button
              *ngFor="let day of calendarDays"
              type="button"
              (click)="selectDate(day)"
              [disabled]="!day.isCurrentMonth || day.isPast"
              [class]="getDayClasses(day)"
            >
              {{ day.day }}
            </button>
          </div>
        </div>

        <!-- Leyenda -->
        <div class="mt-4 space-y-2 text-sm">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-primary-500 rounded"></div>
            <span class="text-gray-600">Fecha seleccionada</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-gray-200 rounded"></div>
            <span class="text-gray-600">No disponible</span>
          </div>
        </div>
      </div>

      <!-- Selección de Horarios -->
      <div class="flex-1">
        <div *ngIf="selectedDate" class="space-y-4">
          <!-- Fecha seleccionada -->
          <div class="flex items-center justify-between pb-4 border-b border-gray-200">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">
                {{ formatSelectedDate() }}
              </h3>
              <p class="text-sm text-gray-500 mt-1">
                Seleccione un horario disponible
              </p>
            </div>
            <span class="material-icons-outlined text-primary-500 text-3xl">
              event_available
            </span>
          </div>

          <!-- Grid de horarios -->
          <div *ngIf="!loadingSlots && timeSlots.length > 0" class="space-y-4">
            <!-- Mañana -->
            <div *ngIf="getMorningSlots().length > 0">
              <h4 class="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <span class="material-icons-outlined text-yellow-500 text-lg">wb_sunny</span>
                Mañana (8:00 - 12:00)
              </h4>
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                <button
                  *ngFor="let slot of getMorningSlots()"
                  type="button"
                  (click)="selectTime(slot)"
                  [disabled]="!slot.available || slot.isPast"
                  [class]="getTimeSlotClasses(slot)"
                >
                  <span class="material-icons-outlined text-sm mr-1">schedule</span>
                  {{ slot.time }}
                </button>
              </div>
            </div>

            <!-- Tarde -->
            <div *ngIf="getAfternoonSlots().length > 0">
              <h4 class="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <span class="material-icons-outlined text-orange-500 text-lg">wb_twilight</span>
                Tarde (12:00 - 18:00)
              </h4>
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                <button
                  *ngFor="let slot of getAfternoonSlots()"
                  type="button"
                  (click)="selectTime(slot)"
                  [disabled]="!slot.available || slot.isPast"
                  [class]="getTimeSlotClasses(slot)"
                >
                  <span class="material-icons-outlined text-sm mr-1">schedule</span>
                  {{ slot.time }}
                </button>
              </div>
            </div>
          </div>

          <!-- Loading state -->
          <div *ngIf="loadingSlots" class="flex flex-col items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p class="text-gray-500 mt-4">Cargando horarios disponibles...</p>
          </div>

          <!-- Sin horarios disponibles -->
          <div *ngIf="!loadingSlots && timeSlots.length === 0"
               class="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <span class="material-icons-outlined text-gray-400 text-5xl mb-3">
              event_busy
            </span>
            <p class="text-gray-600 font-medium">No hay horarios disponibles</p>
            <p class="text-sm text-gray-500 mt-1">Por favor seleccione otra fecha</p>
          </div>
        </div>

        <!-- Estado inicial -->
        <div *ngIf="!selectedDate"
             class="flex flex-col items-center justify-center py-16 text-center">
          <span class="material-icons-outlined text-gray-300 text-6xl mb-4">
            calendar_month
          </span>
          <p class="text-gray-500 font-medium">Seleccione una fecha</p>
          <p class="text-sm text-gray-400 mt-1">para ver los horarios disponibles</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DateTimePickerComponent implements OnInit, ControlValueAccessor {
  private _availableSlots: string[] = [];

  @Input()
  set availableSlots(value: string[]) {
    this._availableSlots = value;
    if (this.selectedDate) {
      this.loadTimeSlots();
    }
  }
  get availableSlots(): string[] {
    return this._availableSlots;
  }

  @Input() minDate: Date = new Date();
  @Output() dateTimeSelected = new EventEmitter<DateTimeSelection>();
  @Output() dateSelected = new EventEmitter<Date>();

  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  calendarDays: any[] = [];
  selectedDate: Date | null = null;
  selectedTime: string | null = null;
  timeSlots: TimeSlot[] = [];
  loadingSlots = false;

  private onChange: any = () => {};
  private onTouched: any = () => {};

  ngOnInit(): void {
    this.generateCalendar();
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    if (value) {
      this.selectedDate = value.date;
      this.selectedTime = value.time;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // Calendar generation
  generateCalendar(): void {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const prevLastDay = new Date(this.currentYear, this.currentMonth, 0);

    const startingDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const prevMonthDays = prevLastDay.getDate();

    this.calendarDays = [];

    // Días del mes anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      this.calendarDays.push({
        day,
        date: new Date(this.currentYear, this.currentMonth - 1, day),
        isCurrentMonth: false,
        isPast: true
      });
    }

    // Días del mes actual
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(this.currentYear, this.currentMonth, day);
      date.setHours(0, 0, 0, 0);

      this.calendarDays.push({
        day,
        date,
        isCurrentMonth: true,
        isPast: date < this.minDate,
        isToday: date.getTime() === today.getTime(),
        isSelected: this.selectedDate &&
                    date.getTime() === this.selectedDate.getTime()
      });
    }

    // Días del mes siguiente
    const remainingDays = 42 - this.calendarDays.length;
    for (let day = 1; day <= remainingDays; day++) {
      this.calendarDays.push({
        day,
        date: new Date(this.currentYear, this.currentMonth + 1, day),
        isCurrentMonth: false,
        isPast: true
      });
    }
  }

  previousMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }

  selectDate(day: any): void {
    if (!day.isCurrentMonth || day.isPast) return;

    this.selectedDate = day.date;
    this.selectedTime = null;
    this.timeSlots = []; // Limpiar slots anteriores
    this.generateCalendar();
    this.dateSelected.emit(day.date); // Emit para que el padre cargue horarios
    this.onTouched();
  }

  loadTimeSlots(): void {
    if (!this.selectedDate) return;

    this.loadingSlots = true;

    // Procesar los slots disponibles con detección de horarios pasados
    const now = new Date();
    const isToday = this.selectedDate.toDateString() === now.toDateString();

    this.timeSlots = this.availableSlots.map(time => {
      const [hours, minutes] = time.split(':').map(Number);
      const slotDate = new Date(this.selectedDate!);
      slotDate.setHours(hours, minutes, 0, 0);

      return {
        time,
        available: true,
        isPast: isToday && slotDate < now
      };
    });

    this.loadingSlots = false;
  }

  selectTime(slot: TimeSlot): void {
    if (!slot.available || slot.isPast) return;

    this.selectedTime = slot.time;

    const selection: DateTimeSelection = {
      date: this.selectedDate!,
      time: slot.time
    };

    this.onChange(selection);
    this.dateTimeSelected.emit(selection);
  }

  // Helper methods
  getMonthName(): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[this.currentMonth];
  }

  formatSelectedDate(): string {
    if (!this.selectedDate) return '';

    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    const dayName = days[this.selectedDate.getDay()];
    const day = this.selectedDate.getDate();
    const month = months[this.selectedDate.getMonth()];
    const year = this.selectedDate.getFullYear();

    return `${dayName}, ${day} de ${month} de ${year}`;
  }

  getMorningSlots(): TimeSlot[] {
    return this.timeSlots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0]);
      return hour >= 8 && hour < 12;
    });
  }

  getAfternoonSlots(): TimeSlot[] {
    return this.timeSlots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0]);
      return hour >= 12 && hour < 18;
    });
  }

  getDayClasses(day: any): string {
    const baseClasses = 'w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200';

    if (!day.isCurrentMonth) {
      return `${baseClasses} text-gray-300 cursor-not-allowed`;
    }

    if (day.isPast) {
      return `${baseClasses} text-gray-300 cursor-not-allowed bg-gray-50`;
    }

    if (day.isSelected) {
      return `${baseClasses} bg-primary-500 text-white shadow-md scale-105`;
    }

    if (day.isToday) {
      return `${baseClasses} border-2 border-primary-500 text-primary-600 hover:bg-primary-50`;
    }

    return `${baseClasses} text-gray-700 hover:bg-primary-50 hover:text-primary-600`;
  }

  getTimeSlotClasses(slot: TimeSlot): string {
    const baseClasses = 'flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200';

    if (!slot.available || slot.isPast) {
      return `${baseClasses} bg-gray-100 text-gray-400 cursor-not-allowed line-through`;
    }

    if (this.selectedTime === slot.time) {
      return `${baseClasses} bg-primary-500 text-white shadow-md scale-105`;
    }

    return `${baseClasses} bg-white border-2 border-gray-200 text-gray-700 hover:border-primary-500 hover:bg-primary-50 hover:text-primary-600 hover:shadow-md`;
  }
}
