import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Cloudinary } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { byRadius } from '@cloudinary/url-gen/actions/roundCorners';
import { focusOn } from '@cloudinary/url-gen/qualifiers/gravity';
import { face } from '@cloudinary/url-gen/qualifiers/focusOn';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { environment } from '../../../environments/environment';

export interface CloudinaryUploadResponse {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  imageType: ImageType;
}

export enum ImageType {
  AVATAR = 'avatar',
  DOCUMENTO = 'documento',
  RESULTADO = 'resultado',
  UBICACION = 'ubicacion',
}

export interface CloudinaryUploadOptions {
  imageType: ImageType;
}

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private readonly http = inject(HttpClient);
  private readonly cloudinary: Cloudinary;

  constructor() {
    // Inicializar Cloudinary SDK solo para generar URLs optimizadas
    this.cloudinary = new Cloudinary({
      cloud: {
        cloudName: environment.cloudinary.cloudName
      }
    });
  }

  /**
   * Subir imagen a Cloudinary a través del backend con optimización automática
   */
  uploadImage(
    file: File,
    options: CloudinaryUploadOptions
  ): Observable<CloudinaryUploadResponse> {
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      return throwError(() => new Error('El archivo debe ser una imagen'));
    }

    // Validar tamaño según tipo de imagen
    const maxSize = options.imageType === ImageType.AVATAR || options.imageType === ImageType.UBICACION
      ? 5 * 1024 * 1024   // 5MB para avatares y ubicaciones
      : 10 * 1024 * 1024; // 10MB para documentos y resultados

    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return throwError(() => new Error(`La imagen no debe superar ${maxSizeMB}MB`));
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('imageType', options.imageType);

    // Subir a través del backend (nota: el backend tiene prefijo /api/v1)
    return this.http.post<CloudinaryUploadResponse>(`${environment.apiUrl}/api/v1/cloudinary/upload`, formData, {
      withCredentials: true
    }).pipe(
      catchError(error => {
        console.error('Error al subir imagen a Cloudinary:', error);
        const errorMessage = error.error?.message || 'Error al subir la imagen. Intenta nuevamente.';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Subir avatar de médico (optimizado para rostros)
   */
  uploadAvatar(file: File): Observable<string> {
    return this.uploadImage(file, {
      imageType: ImageType.AVATAR
    }).pipe(
      map(response => response.url)
    );
  }

  /**
   * Subir foto de ubicación/consultorio
   */
  uploadUbicacionFoto(file: File): Observable<string> {
    return this.uploadImage(file, {
      imageType: ImageType.UBICACION
    }).pipe(
      map(response => response.url)
    );
  }

  /**
   * Subir documento médico
   */
  uploadDocumento(file: File): Observable<CloudinaryUploadResponse> {
    return this.uploadImage(file, {
      imageType: ImageType.DOCUMENTO
    });
  }

  /**
   * Subir resultado médico (análisis, radiografías, etc.)
   */
  uploadResultado(file: File): Observable<CloudinaryUploadResponse> {
    return this.uploadImage(file, {
      imageType: ImageType.RESULTADO
    });
  }

  /**
   * Generar URL optimizada para avatar (redonda, enfocada en rostro)
   */
  getAvatarUrl(publicIdOrUrl: string, size: number = 150): string {
    try {
      // Si es una URL completa de Cloudinary, extraer el public_id
      let publicId = publicIdOrUrl;
      if (publicIdOrUrl.includes('cloudinary.com')) {
        const matches = publicIdOrUrl.match(/\/v\d+\/(.+)\.\w+$/);
        if (matches && matches[1]) {
          publicId = matches[1];
        }
      }

      const image = this.cloudinary.image(publicId);

      image
        .resize(fill().width(size).height(size).gravity(focusOn(face())))
        .roundCorners(byRadius(size / 2)) // Hacer circular
        .format('auto') // WebP cuando el navegador lo soporte
        .quality('auto'); // Optimización automática de calidad

      return image.toURL();
    } catch (error) {
      console.error('Error generando URL de avatar:', error);
      // Fallback a URL por defecto
      return '/assets/images/default-avatar.png';
    }
  }

  /**
   * Generar URL optimizada para foto de ubicación
   */
  getUbicacionFotoUrl(publicIdOrUrl: string, width: number = 800, height: number = 600): string {
    try {
      let publicId = publicIdOrUrl;
      if (publicIdOrUrl.includes('cloudinary.com')) {
        const matches = publicIdOrUrl.match(/\/v\d+\/(.+)\.\w+$/);
        if (matches && matches[1]) {
          publicId = matches[1];
        }
      }

      const image = this.cloudinary.image(publicId);

      image
        .resize(fill().width(width).height(height).gravity(autoGravity()))
        .format('auto')
        .quality('auto');

      return image.toURL();
    } catch (error) {
      console.error('Error generando URL de ubicación:', error);
      return '/assets/images/default-location.png';
    }
  }

  /**
   * Generar thumbnail pequeño
   */
  getThumbnailUrl(publicIdOrUrl: string, size: number = 80): string {
    try {
      let publicId = publicIdOrUrl;
      if (publicIdOrUrl.includes('cloudinary.com')) {
        const matches = publicIdOrUrl.match(/\/v\d+\/(.+)\.\w+$/);
        if (matches && matches[1]) {
          publicId = matches[1];
        }
      }

      const image = this.cloudinary.image(publicId);

      image
        .resize(fill().width(size).height(size).gravity(autoGravity()))
        .format('auto')
        .quality('auto');

      return image.toURL();
    } catch (error) {
      console.error('Error generando thumbnail:', error);
      return '';
    }
  }

  /**
   * Validar archivo antes de subir
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // Validar tipo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Formato no válido. Solo se permiten JPG, PNG y WebP'
      };
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'La imagen no debe superar 5MB'
      };
    }

    return { valid: true };
  }

  /**
   * Eliminar imagen de Cloudinary
   */
  deleteImage(urlOrPublicId: string): Observable<boolean> {
    return this.http.request<{ message: string; result: any }>('DELETE', `${environment.apiUrl}/api/v1/cloudinary/delete`, {
      body: { url: urlOrPublicId },
      withCredentials: true
    }).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error al eliminar imagen:', error);
        const errorMessage = error.error?.message || 'Error al eliminar la imagen';
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
