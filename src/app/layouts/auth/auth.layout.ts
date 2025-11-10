import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <!-- Logo y título -->
        <div class="text-center mb-8">
          <img src="/assets/qura-white.png" alt="Qura" class="h-20 mx-auto mb-4">
          <h1 class="text-2xl font-semibold text-white">
            Qura - Plataforma Médica
          </h1>
          <p class="mt-2 text-primary-100">
            La plataforma inteligente para médicos hondureños 🇭🇳
          </p>
        </div>

        <!-- Contenedor de formularios -->
        <div class="bg-white rounded-medical shadow-medical-lg p-8">
          <router-outlet />
        </div>

        <!-- Footer -->
        <div class="mt-8 text-center text-sm text-gray-600">
          <p>
            ¿Necesita ayuda? 
            <a href="mailto:soporte&#64;platformdoctor.hn" class="text-primary-600 hover:text-primary-700">
              Contáctenos
            </a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class AuthLayout {} 