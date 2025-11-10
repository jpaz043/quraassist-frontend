import { Component, EventEmitter, Input, Output, OnInit, ViewChild, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule, MapInfoWindow, MapMarker, GoogleMap } from '@angular/google-maps';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface MapLocation {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  placeId?: string;
}

interface PlacePrediction {
  description: string;
  place_id: string;
}

@Component({
  selector: 'app-map-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, GoogleMapsModule],
  template: `
    <div class="map-picker-container">
      <!-- Buscador de direcciones -->
      <div class="search-container">
        <div class="search-wrapper">
          <span class="material-icons-outlined search-icon">search</span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearchInput()"
            (focus)="showSuggestions.set(true)"
            class="search-input"
            placeholder="Buscar dirección en Honduras...">

          @if (searching()) {
            <span class="material-icons-outlined loading-icon">refresh</span>
          }
        </div>

        <!-- Sugerencias de Places API -->
        @if (showSuggestions() && suggestions().length > 0) {
          <div class="suggestions-dropdown">
            @for (suggestion of suggestions(); track suggestion.place_id) {
              <button
                type="button"
                class="suggestion-item"
                (click)="selectSuggestion(suggestion)">
                <span class="material-icons-outlined">location_on</span>
                <span class="suggestion-text">{{ suggestion.description }}</span>
              </button>
            }
          </div>
        }
      </div>

      <!-- Mapa de Google -->
      <div class="map-wrapper">
        @if (mapLoaded()) {
          <google-map
            [height]="mapHeight"
            [width]="'100%'"
            [center]="center()"
            [zoom]="zoom()"
            [options]="mapOptions"
            (mapClick)="onMapClick($event)">

            @if (markerPosition()) {
              <map-marker
                [position]="markerPosition()!"
                [options]="markerOptions">
              </map-marker>
            }
          </google-map>
        } @else {
          <div class="map-loading">
            <span class="material-icons-outlined loading-spinner">refresh</span>
            <p>Cargando mapa...</p>
          </div>
        }
      </div>

      <!-- Información de ubicación seleccionada -->
      @if (selectedLocation()) {
        <div class="location-info">
          <div class="location-header">
            <span class="material-icons-outlined text-primary-600">place</span>
            <h3 class="location-title">Ubicación Seleccionada</h3>
          </div>

          <div class="location-details">
            <div class="detail-row">
              <span class="detail-label">Dirección:</span>
              <span class="detail-value">{{ selectedLocation()!.address }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Coordenadas:</span>
              <span class="detail-value coords">
                {{ selectedLocation()!.coordinates.lat.toFixed(6) }},
                {{ selectedLocation()!.coordinates.lng.toFixed(6) }}
              </span>
            </div>
          </div>

          <button
            type="button"
            class="btn-clear"
            (click)="clearSelection()">
            <span class="material-icons-outlined">close</span>
            Limpiar selección
          </button>
        </div>
      }

      <!-- Instrucciones -->
      @if (!selectedLocation()) {
        <div class="instructions">
          <span class="material-icons-outlined">info</span>
          <p>Busca una dirección o haz clic en el mapa para seleccionar la ubicación exacta</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .map-picker-container {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .search-container {
      position: relative;
    }

    .search-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      color: #9ca3af;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 3rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: #26A8DB;
      box-shadow: 0 0 0 3px rgba(38, 168, 219, 0.1);
    }

    .loading-icon {
      position: absolute;
      right: 1rem;
      color: #26A8DB;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .suggestions-dropdown {
      position: absolute;
      top: calc(100% + 0.5rem);
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      max-height: 300px;
      overflow-y: auto;
      z-index: 10;
    }

    .suggestion-item {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border: none;
      background: white;
      text-align: left;
      cursor: pointer;
      transition: background 0.2s;
      border-bottom: 1px solid #f3f4f6;
    }

    .suggestion-item:last-child {
      border-bottom: none;
    }

    .suggestion-item:hover {
      background: #f9fafb;
    }

    .suggestion-item .material-icons-outlined {
      color: #26A8DB;
      font-size: 20px;
    }

    .suggestion-text {
      font-size: 0.875rem;
      color: #374151;
      flex: 1;
    }

    .map-wrapper {
      width: 100%;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #d1d5db;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .map-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      background: #f9fafb;
      color: #6b7280;
    }

    .loading-spinner {
      font-size: 48px;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    .location-info {
      padding: 1rem;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 8px;
    }

    .location-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .location-title {
      font-size: 1rem;
      font-weight: 600;
      color: #0c4a6e;
      margin: 0;
    }

    .location-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .detail-row {
      display: flex;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .detail-label {
      font-weight: 500;
      color: #0369a1;
      min-width: 100px;
    }

    .detail-value {
      color: #334155;
    }

    .detail-value.coords {
      font-family: 'Courier New', monospace;
      font-size: 0.8125rem;
    }

    .btn-clear {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: white;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      color: #64748b;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-clear:hover {
      background: #f8fafc;
      border-color: #94a3b8;
      color: #475569;
    }

    .instructions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 8px;
      color: #92400e;
      font-size: 0.875rem;
    }

    .instructions .material-icons-outlined {
      color: #f59e0b;
      font-size: 20px;
    }
  `]
})
export class MapPickerComponent implements OnInit {
  private readonly http = inject(HttpClient);

  @Input() initialLocation: MapLocation | null = null;
  @Input() mapHeight: string = '400px';
  @Output() locationSelected = new EventEmitter<MapLocation>();

  @ViewChild(GoogleMap) map?: GoogleMap;
  @ViewChild(MapMarker) marker?: MapMarker;

  // Señales
  mapLoaded = signal(false);
  center = signal<google.maps.LatLngLiteral>(environment.googleMaps.defaultCenter);
  zoom = signal(environment.googleMaps.defaultZoom);
  markerPosition = signal<google.maps.LatLngLiteral | null>(null);
  selectedLocation = signal<MapLocation | null>(null);
  searchQuery = '';
  searching = signal(false);
  suggestions = signal<PlacePrediction[]>([]);
  showSuggestions = signal(false);

  mapOptions: google.maps.MapOptions = {
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  };

  markerOptions: google.maps.MarkerOptions = {
    draggable: true
  };

  ngOnInit(): void {
    this.loadGoogleMapsScript().then(() => {
      // Configurar animación del marcador después de que Google Maps esté cargado
      if (typeof google !== 'undefined' && google.maps) {
        this.markerOptions = {
          draggable: true,
          animation: google.maps.Animation.DROP,
        };
      }

      if (this.initialLocation) {
        this.selectedLocation.set(this.initialLocation);
        this.center.set(this.initialLocation.coordinates);
        this.markerPosition.set(this.initialLocation.coordinates);
        this.zoom.set(16);
      }
    });
  }

  private loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.maps) {
        this.mapLoaded.set(true);
        resolve();
        return;
      }

      const script = document.createElement('script');
      // Cargar la API tradicional de Google Maps (sin 'places' para evitar AutocompleteService legacy)
      // Solo necesitamos Geocoder y el mapa básico
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMaps.apiKey}&language=es&region=HN`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.mapLoaded.set(true);
        resolve();
      };
      script.onerror = (error) => {
        console.error('Error cargando Google Maps:', error);
        reject(error);
      };
      document.head.appendChild(script);
    });
  }

  onMapClick(event: google.maps.MapMouseEvent): void {
    if (event.latLng) {
      const position = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };

      this.markerPosition.set(position);
      this.reverseGeocode(position);
    }
  }

  private reverseGeocode(position: google.maps.LatLngLiteral): void {
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ location: position }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location: MapLocation = {
          address: results[0].formatted_address,
          coordinates: position,
          placeId: results[0].place_id
        };

        this.selectedLocation.set(location);
        this.locationSelected.emit(location);
      }
    });
  }

  onSearchInput(): void {
    if (!this.searchQuery || this.searchQuery.length < 3) {
      this.suggestions.set([]);
      return;
    }

    this.searching.set(true);

    // Usar Geocoding API que sigue siendo soportada (no legacy)
    // Agregamos ", Honduras" para mejorar los resultados
    const geocoder = new google.maps.Geocoder();
    const searchAddress = this.searchQuery.toLowerCase().includes('honduras')
      ? this.searchQuery
      : `${this.searchQuery}, Honduras`;

    geocoder.geocode(
      {
        address: searchAddress,
        componentRestrictions: { country: 'HN' }
      },
      (results, status) => {
        this.searching.set(false);

        if (status === 'OK' && results && results.length > 0) {
          // Convertir resultados del geocoder a formato de sugerencias
          const suggestions = results.slice(0, 5).map(result => ({
            description: result.formatted_address,
            place_id: result.place_id
          }));
          this.suggestions.set(suggestions);
        } else {
          this.suggestions.set([]);
        }
      }
    );
  }

  selectSuggestion(suggestion: PlacePrediction): void {
    this.searchQuery = suggestion.description;
    this.showSuggestions.set(false);
    this.suggestions.set([]);

    // Obtener detalles del lugar usando Geocoder
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ placeId: suggestion.place_id }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const result = results[0];
        const position = {
          lat: result.geometry.location.lat(),
          lng: result.geometry.location.lng()
        };

        const location: MapLocation = {
          address: result.formatted_address,
          coordinates: position,
          placeId: result.place_id
        };

        this.center.set(position);
        this.markerPosition.set(position);
        this.selectedLocation.set(location);
        this.zoom.set(17);
        this.locationSelected.emit(location);
      }
    });
  }

  clearSelection(): void {
    this.markerPosition.set(null);
    this.selectedLocation.set(null);
    this.searchQuery = '';
    this.center.set(environment.googleMaps.defaultCenter);
    this.zoom.set(environment.googleMaps.defaultZoom);
    this.locationSelected.emit({
      address: '',
      coordinates: { lat: 0, lng: 0 }
    });
  }
}
