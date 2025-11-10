import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast, ToastService } from '../../services/toast.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <div
        *ngFor="let toast of toasts$ | async"
        class="pointer-events-auto transform transition-all duration-300 ease-out animate-slide-in"
        [ngClass]="{
          'bg-white border-l-4': true,
          'border-success-500': toast.type === 'success',
          'border-error-500': toast.type === 'error',
          'border-warning-500': toast.type === 'warning',
          'border-primary-500': toast.type === 'info'
        }"
      >
        <div class="flex items-start p-4 rounded-lg shadow-medical-lg">
          <!-- Icon -->
          <div class="flex-shrink-0">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center"
              [ngClass]="{
                'bg-success-50': toast.type === 'success',
                'bg-error-50': toast.type === 'error',
                'bg-warning-50': toast.type === 'warning',
                'bg-primary-50': toast.type === 'info'
              }"
            >
              <!-- Success Icon -->
              <svg
                *ngIf="toast.type === 'success'"
                class="w-5 h-5 text-success-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>

              <!-- Error Icon -->
              <svg
                *ngIf="toast.type === 'error'"
                class="w-5 h-5 text-error-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>

              <!-- Warning Icon -->
              <svg
                *ngIf="toast.type === 'warning'"
                class="w-5 h-5 text-warning-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>

              <!-- Info Icon -->
              <svg
                *ngIf="toast.type === 'info'"
                class="w-5 h-5 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <!-- Content -->
          <div class="ml-3 flex-1">
            <p
              *ngIf="toast.title"
              class="text-sm font-semibold text-neutral-900 mb-1"
            >
              {{ toast.title }}
            </p>
            <p class="text-sm text-neutral-600">
              {{ toast.message }}
            </p>
          </div>

          <!-- Dismiss Button -->
          <button
            *ngIf="toast.dismissible"
            (click)="dismiss(toast.id)"
            class="ml-4 flex-shrink-0 inline-flex text-neutral-400 hover:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-md transition-colors duration-150"
            type="button"
          >
            <span class="sr-only">Cerrar</span>
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ToastComponent implements OnInit {
  toasts$!: Observable<Toast[]>;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toasts$ = this.toastService.toasts$;
  }

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }
}
