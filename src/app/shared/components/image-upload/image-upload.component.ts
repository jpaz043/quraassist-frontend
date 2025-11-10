import { Component, EventEmitter, Input, Output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CloudinaryService, CloudinaryUploadResponse, ImageType } from '../../../core/services/cloudinary.service';

export interface ImageUploadResult {
  url: string;
  publicId: string;
}

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="image-upload-container">
      <!-- Preview de imagen -->
      <div class="image-preview-wrapper">
        @if (previewUrl()) {
          <div class="image-preview">
            <img [src]="previewUrl()" [alt]="'Preview de ' + label" class="preview-image" />
            <button
              type="button"
              (click)="removeImage()"
              class="remove-button"
              [disabled]="uploading()"
              title="Eliminar imagen">
              <span class="material-icons-outlined">close</span>
            </button>
          </div>
        } @else {
          <div class="upload-placeholder" [class.dragging]="isDragging()" (click)="fileInput.click()">
            <span class="material-icons-outlined upload-icon">{{ uploadIcon }}</span>
            <p class="upload-text">{{ placeholderText }}</p>
            <p class="upload-hint">{{ hintText }}</p>
          </div>
        }
      </div>

      <!-- Input file oculto -->
      <input
        #fileInput
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        (change)="onFileSelected($event)"
        class="hidden-input"
        [disabled]="uploading()" />

      <!-- Botón de cambiar imagen -->
      @if (previewUrl() && !uploading()) {
        <button
          type="button"
          (click)="fileInput.click()"
          class="change-button">
          <span class="material-icons-outlined">edit</span>
          Cambiar imagen
        </button>
      }

      <!-- Progress bar -->
      @if (uploading()) {
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <p class="progress-text">Subiendo imagen...</p>
        </div>
      }

      <!-- Mensaje de error -->
      @if (errorMessage()) {
        <div class="error-message">
          <span class="material-icons-outlined">error</span>
          {{ errorMessage() }}
        </div>
      }
    </div>
  `,
  styles: [`
    .image-upload-container {
      width: 100%;
    }

    .image-preview-wrapper {
      margin-bottom: 1rem;
    }

    .image-preview {
      position: relative;
      width: 200px;
      height: 200px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .remove-button {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(239, 68, 68, 0.9);
      color: white;
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .remove-button:hover:not(:disabled) {
      background: rgba(220, 38, 38, 1);
      transform: scale(1.1);
    }

    .remove-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .upload-placeholder {
      border: 2px dashed #d1d5db;
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      background: #f9fafb;
    }

    .upload-placeholder:hover {
      border-color: #26A8DB;
      background: #f0f9ff;
    }

    .upload-placeholder.dragging {
      border-color: #26A8DB;
      background: #e0f2fe;
    }

    .upload-icon {
      font-size: 48px;
      color: #9ca3af;
      margin-bottom: 0.5rem;
    }

    .upload-text {
      font-size: 16px;
      font-weight: 500;
      color: #374151;
      margin: 0 0 0.25rem 0;
    }

    .upload-hint {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }

    .hidden-input {
      display: none;
    }

    .change-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      color: #374151;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .change-button:hover {
      background: #f9fafb;
      border-color: #26A8DB;
      color: #26A8DB;
    }

    .progress-container {
      margin-top: 1rem;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #26A8DB 0%, #1e90c9 100%);
      animation: progress 1.5s ease-in-out infinite;
    }

    @keyframes progress {
      0% { width: 0%; }
      50% { width: 70%; }
      100% { width: 100%; }
    }

    .progress-text {
      text-align: center;
      font-size: 14px;
      color: #6b7280;
      margin-top: 0.5rem;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      color: #dc2626;
      font-size: 14px;
      margin-top: 1rem;
    }

    .error-message .material-icons-outlined {
      font-size: 20px;
    }
  `]
})
export class ImageUploadComponent implements OnInit {
  @Input() label: string = 'imagen';
  @Input() uploadIcon: string = 'cloud_upload';
  @Input() placeholderText: string = 'Haz clic o arrastra una imagen';
  @Input() hintText: string = 'JPG, PNG o WebP (máx. 5MB)';
  @Input() currentImageUrl: string | null = null;
  @Input() imageType: ImageType = ImageType.AVATAR; // Tipo de imagen para Cloudinary
  @Input() entityId: string = '';

  @Output() imageUploaded = new EventEmitter<ImageUploadResult>();
  @Output() imageRemoved = new EventEmitter<void>();
  @Output() uploadError = new EventEmitter<string>();

  previewUrl = signal<string | null>(null);
  uploading = signal(false);
  errorMessage = signal<string | null>(null);
  isDragging = signal(false);

  constructor(private cloudinaryService: CloudinaryService) {}

  ngOnInit() {
    if (this.currentImageUrl) {
      this.previewUrl.set(this.currentImageUrl);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    // Resetear errores
    this.errorMessage.set(null);

    // Validar archivo
    const validation = this.cloudinaryService.validateImageFile(file);
    if (!validation.valid) {
      this.errorMessage.set(validation.error!);
      this.uploadError.emit(validation.error!);
      return;
    }

    // Mostrar preview local inmediatamente
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Subir a Cloudinary
    this.uploadToCloudinary(file);
  }

  private uploadToCloudinary(file: File): void {
    this.uploading.set(true);
    this.errorMessage.set(null);

    this.cloudinaryService.uploadImage(file, {
      imageType: this.imageType
    }).subscribe({
      next: (response: CloudinaryUploadResponse) => {
        this.uploading.set(false);
        this.previewUrl.set(response.url);
        this.imageUploaded.emit({
          url: response.url,
          publicId: response.publicId
        });
      },
      error: (error: Error) => {
        this.uploading.set(false);
        const errorMsg = error.message || 'Error al subir la imagen';
        this.errorMessage.set(errorMsg);
        this.uploadError.emit(errorMsg);
        // Limpiar preview en caso de error
        this.previewUrl.set(this.currentImageUrl);
      }
    });
  }

  removeImage(): void {
    this.previewUrl.set(null);
    this.errorMessage.set(null);
    this.imageRemoved.emit();
  }

  // Drag and drop support (opcional, para mejorar UX)
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);

    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }
}
