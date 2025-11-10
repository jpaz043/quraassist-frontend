import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgClass, NgIf],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <!-- Hamburger Button - Mobile Only -->
      <button (click)="toggleSidebar()"
              class="lg:hidden fixed top-4 left-4 z-50 bg-white p-3 rounded-lg border border-gray-300 shadow-lg hover:bg-gray-50 transition-colors">
        <span class="material-icons-outlined text-gray-700">menu</span>
      </button>

      <!-- Overlay - Mobile Only -->
      <div *ngIf="isSidebarOpen"
           (click)="closeSidebar()"
           class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity">
      </div>

      <!-- Sidebar - Responsive with Slide Animation -->
      <aside [class]="'fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-40 shadow-lg transition-transform duration-300 lg:translate-x-0 ' + (isSidebarOpen ? 'translate-x-0' : '-translate-x-full')">
        <div class="h-full flex flex-col">
          <!-- Logo with Close Button -->
          <div class="p-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <img src="/assets/qura-color.png" alt="Qura Logo" class="h-10 w-auto">
                <div>
                  <h1 class="text-lg font-semibold text-gray-900">Qura</h1>
                  <p class="text-xs text-gray-500">Plataforma Médica</p>
                </div>
              </div>
              <!-- Close Button - Mobile Only -->
              <button (click)="closeSidebar()"
                      class="lg:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <span class="material-icons-outlined">close</span>
              </button>
            </div>
          </div>

          <!-- Navegación -->
          <nav class="flex-1 p-4 space-y-1">
            <a routerLink="/dashboard"
               routerLinkActive="bg-primary-50 text-primary-700 border-r-2 border-primary-500"
               class="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-all duration-200 group">
              <span class="material-icons-outlined mr-3 text-gray-500 group-hover:text-primary-500">dashboard</span>
              Dashboard
            </a>

            <a routerLink="/agenda"
               routerLinkActive="bg-primary-50 text-primary-700 border-r-2 border-primary-500"
               class="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-all duration-200 group">
              <span class="material-icons-outlined mr-3 text-gray-500 group-hover:text-primary-500">calendar_today</span>
              Agenda
            </a>

            <a routerLink="/agenda/calendario"
               routerLinkActive="bg-primary-50 text-primary-700 border-r-2 border-primary-500"
               class="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-all duration-200 group ml-4">
              <span class="material-icons-outlined mr-3 text-gray-500 group-hover:text-primary-500">calendar_view_month</span>
              Calendario
            </a>

            <a routerLink="/pacientes"
               routerLinkActive="bg-primary-50 text-primary-700 border-r-2 border-primary-500"
               class="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-all duration-200 group">
              <span class="material-icons-outlined mr-3 text-gray-500 group-hover:text-primary-500">people</span>
              Pacientes
            </a>

            <a routerLink="/whatsapp"
               routerLinkActive="bg-primary-50 text-primary-700 border-r-2 border-primary-500"
               class="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-all duration-200 group">
              <span class="material-icons-outlined mr-3 text-gray-500 group-hover:text-primary-500">chat</span>
              WhatsApp Business
            </a>

            <a routerLink="/tokens"
               routerLinkActive="bg-primary-50 text-primary-700 border-r-2 border-primary-500"
               class="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-all duration-200 group">
              <span class="material-icons-outlined mr-3 text-gray-500 group-hover:text-primary-500">toll</span>
              Tokens & Facturación
            </a>

            <a routerLink="/bloqueos"
               routerLinkActive="bg-primary-50 text-primary-700 border-r-2 border-primary-500"
               class="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-all duration-200 group">
              <span class="material-icons-outlined mr-3 text-gray-500 group-hover:text-primary-500">block</span>
              Bloqueos
            </a>

            <a routerLink="/ubicaciones"
               routerLinkActive="bg-primary-50 text-primary-700 border-r-2 border-primary-500"
               class="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-all duration-200 group">
              <span class="material-icons-outlined mr-3 text-gray-500 group-hover:text-primary-500">location_on</span>
              Ubicaciones
            </a>

            <a routerLink="/perfil"
               routerLinkActive="bg-primary-50 text-primary-700 border-r-2 border-primary-500"
               class="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-all duration-200 group">
              <span class="material-icons-outlined mr-3 text-gray-500 group-hover:text-primary-500">account_circle</span>
              Mi Perfil
            </a>

            <!-- Divider -->
            <div class="my-4 border-t border-gray-200"></div>

            <!-- Links de apoyo -->
            <a href="mailto:soporte@platformdoctor.hn"
               class="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group">
              <span class="material-icons-outlined mr-3 text-gray-400 group-hover:text-primary-500">support</span>
              Soporte Técnico
            </a>
          </nav>

          <!-- Usuario -->
          <div class="p-4 border-t border-gray-200 bg-gray-50">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center shadow-sm">
                  <span class="text-white font-semibold text-sm">
                    {{getUserInitials()}}
                  </span>
                </div>
              </div>
              <div class="ml-3 flex-1">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{authService.currentUser?.nombreCompleto}}
                </p>
                <p class="text-xs text-gray-600 truncate">
                  {{authService.currentUser?.medico?.especialidades?.[0] || authService.currentUser?.role}}
                </p>
                <button (click)="logout()"
                        class="text-xs text-primary-600 hover:text-primary-700 font-medium mt-1">
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Contenido principal - Responsive Margin -->
      <main class="lg:ml-64 flex-1 min-h-screen pt-20 lg:pt-0">
        <router-outlet />
      </main>
    </div>
  `
})
export class MainLayout {
  authService = inject(AuthService);
  isSidebarOpen = false;

  getUserInitials(): string {
    const nombre = this.authService.currentUser?.nombreCompleto || '';
    return nombre
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
} 