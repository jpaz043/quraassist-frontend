import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  handleHttpError(error: any, context: string = 'Operación'): any {
    console.error(`${context} error:`, error);

    let errorMessage = `Error en ${context.toLowerCase()}`;

    if (error.status === 400) {
      errorMessage = 'Datos inválidos. Verifique la información';
    } else if (error.status === 401) {
      errorMessage = 'Sesión expirada. Inicie sesión nuevamente';
    } else if (error.status === 403) {
      errorMessage = 'No tiene permisos para realizar esta acción';
    } else if (error.status === 404) {
      errorMessage = 'Recurso no encontrado';
    } else if (error.status === 409) {
      errorMessage = 'Conflicto de datos. El recurso ya existe';
    } else if (error.status === 429) {
      errorMessage = 'Demasiadas solicitudes. Intente más tarde';
    } else if (error.status === 500) {
      errorMessage = 'Error interno del servidor. Intente más tarde';
    } else if (error.status === 0) {
      errorMessage = 'Error de conexión. Verifique su conexión a internet';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    return throwError(() => ({
      ...error,
      message: errorMessage,
      context: context
    }));
  }

  getErrorMessage(error: any): string {
    return error.message || 'Ha ocurrido un error inesperado';
  }

  isNetworkError(error: any): boolean {
    return error.status === 0 || !error.status;
  }

  isAuthError(error: any): boolean {
    return error.status === 401 || error.status === 403;
  }

  isValidationError(error: any): boolean {
    return error.status === 400;
  }
}