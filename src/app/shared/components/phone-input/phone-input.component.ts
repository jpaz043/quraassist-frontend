import { Component, Input, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'app-phone-input',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxMaskDirective],
  providers: [
    provideNgxMask(),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true
    }
  ],
  template: `
    <div class="phone-input-container">
      <label *ngIf="label" [for]="inputId" class="phone-label">
        {{ label }}
        <span *ngIf="required" class="text-red-500">*</span>
      </label>

      <div class="phone-input-wrapper">
        <!-- Prefijo fijo de Honduras -->
        <div class="phone-prefix">
          <span class="flag">🇭🇳</span>
          <span class="code">+504</span>
        </div>

        <!-- Input con máscara -->
        <input
          [id]="inputId"
          type="tel"
          class="phone-input"
          [class.error]="showError()"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [(ngModel)]="phoneNumber"
          (ngModelChange)="onInputChange($event)"
          (blur)="onTouched()"
          mask="0000-0000"
          [showMaskTyped]="true"
          [dropSpecialCharacters]="false"
          prefix=""
          autocomplete="tel" />

        <!-- Ícono de validación -->
        <div class="validation-icon" *ngIf="phoneNumber && !disabled">
          <span *ngIf="isValid()" class="material-icons-outlined text-green-600">check_circle</span>
          <span *ngIf="!isValid() && touched" class="material-icons-outlined text-red-600">error</span>
        </div>
      </div>

      <!-- Mensaje de ayuda o error -->
      <div class="helper-text">
        <span *ngIf="!showError()" class="text-xs text-gray-500">
          {{ helperText || 'Formato: 9999-9999' }}
        </span>
        <span *ngIf="showError()" class="text-xs text-red-600">
          {{ errorMessage }}
        </span>
      </div>

      <!-- Preview del número completo -->
      <div *ngIf="phoneNumber && isValid()" class="phone-preview">
        <span class="material-icons-outlined text-gray-400">phone</span>
        <span class="text-sm text-gray-600">{{ getFullPhoneNumber() }}</span>
      </div>
    </div>
  `,
  styles: [`
    .phone-input-container {
      width: 100%;
    }

    .phone-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .phone-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.2s;
    }

    .phone-input-wrapper:focus-within {
      border-color: #26A8DB;
      box-shadow: 0 0 0 3px rgba(38, 168, 219, 0.1);
    }

    .phone-input-wrapper.error {
      border-color: #dc2626;
    }

    .phone-prefix {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0 0.75rem;
      background: #f9fafb;
      border-right: 1px solid #d1d5db;
      height: 100%;
      min-height: 42px;
    }

    .flag {
      font-size: 1.25rem;
      line-height: 1;
    }

    .code {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      white-space: nowrap;
    }

    .phone-input {
      flex: 1;
      padding: 0.625rem 0.75rem;
      border: none;
      font-size: 0.875rem;
      outline: none;
      background: white;
    }

    .phone-input:disabled {
      background: #f9fafb;
      color: #9ca3af;
      cursor: not-allowed;
    }

    .phone-input::placeholder {
      color: #9ca3af;
    }

    .phone-input.error {
      background: #fef2f2;
    }

    .validation-icon {
      display: flex;
      align-items: center;
      padding: 0 0.75rem;
    }

    .validation-icon .material-icons-outlined {
      font-size: 20px;
    }

    .helper-text {
      margin-top: 0.25rem;
      min-height: 18px;
    }

    .phone-preview {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 6px;
    }

    .phone-preview .material-icons-outlined {
      font-size: 18px;
    }
  `]
})
export class PhoneInputComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '9999-9999';
  @Input() required: boolean = false;
  @Input() helperText: string = '';
  @Input() errorMessage: string = 'Número de teléfono inválido';
  @Input() disabled: boolean = false;

  inputId = `phone-input-${Math.random().toString(36).substr(2, 9)}`;
  phoneNumber: string = '';
  touched: boolean = false;

  onChange: any = () => {};
  onTouched: any = () => {};

  /**
   * Valida que el número tenga 8 dígitos (sin contar el guión)
   */
  isValid(): boolean {
    if (!this.phoneNumber) return false;
    const digitsOnly = this.phoneNumber.replace(/\D/g, '');
    return digitsOnly.length === 8;
  }

  /**
   * Muestra error si está tocado, requerido y no válido
   */
  showError(): boolean {
    return this.touched && this.required && !this.isValid();
  }

  /**
   * Retorna el número completo con prefijo de Honduras
   */
  getFullPhoneNumber(): string {
    return `+504 ${this.phoneNumber}`;
  }

  /**
   * Maneja cambios en el input
   */
  onInputChange(value: string): void {
    this.phoneNumber = value;

    // Si está completo, emitir el número completo con prefijo
    if (this.isValid()) {
      this.onChange(this.getFullPhoneNumber());
    } else {
      this.onChange(value);
    }
  }

  // ===== Implementación de ControlValueAccessor =====

  writeValue(value: string): void {
    if (value) {
      // Si viene con prefijo +504, quitarlo
      const cleaned = value.replace(/^\+504\s*/, '');
      this.phoneNumber = cleaned;
    } else {
      this.phoneNumber = '';
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
