import { HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Simple rate limiting interceptor for medical safety
export const rateLimitInterceptor: HttpInterceptorFn = (req, next) => {
  const now = Date.now();
  const requestKey = `${req.method}_${req.url}`;
  
  // Get last request time for this endpoint
  const lastRequestTime = localStorage.getItem(`rate_limit_${requestKey}`);
  
  if (lastRequestTime) {
    const timeDiff = now - parseInt(lastRequestTime);
    const minInterval = 100; // Minimum 100ms between same requests
    
    if (timeDiff < minInterval) {
      return throwError(() => ({
        message: 'Por favor, espere un momento antes de realizar otra solicitud.',
        status: 429,
        timestamp: new Date().toISOString()
      }));
    }
  }
  
  // Store current request time
  localStorage.setItem(`rate_limit_${requestKey}`, now.toString());
  
  return next(req).pipe(
    catchError(error => {
      // If rate limited by server, show user-friendly message
      if (error.status === 429) {
        return throwError(() => ({
          message: 'Ha excedido el límite de solicitudes. Por favor, espere un momento.',
          status: 429,
          timestamp: new Date().toISOString()
        }));
      }
      return throwError(() => error);
    })
  );
};