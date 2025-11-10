import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  duration?: number;
  dismissible?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$: Observable<Toast[]> = this.toastsSubject.asObservable();

  private defaultDuration = 5000; // 5 segundos

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private show(toast: Omit<Toast, 'id'>): void {
    const id = this.generateId();
    const newToast: Toast = {
      id,
      ...toast,
      duration: toast.duration ?? this.defaultDuration,
      dismissible: toast.dismissible ?? true,
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, newToast]);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => this.dismiss(id), newToast.duration);
    }
  }

  success(message: string, title?: string, duration?: number): void {
    this.show({
      type: 'success',
      message,
      title: title ?? 'Éxito',
      duration,
    });
  }

  error(message: string, title?: string, duration?: number): void {
    this.show({
      type: 'error',
      message,
      title: title ?? 'Error',
      duration: duration ?? 7000, // Los errores duran más
    });
  }

  warning(message: string, title?: string, duration?: number): void {
    this.show({
      type: 'warning',
      message,
      title: title ?? 'Advertencia',
      duration,
    });
  }

  info(message: string, title?: string, duration?: number): void {
    this.show({
      type: 'info',
      message,
      title: title ?? 'Información',
      duration,
    });
  }

  dismiss(id: string): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(toast => toast.id !== id));
  }

  clear(): void {
    this.toastsSubject.next([]);
  }
}
