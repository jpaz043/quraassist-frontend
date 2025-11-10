# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

🏥 **Cura Frontend** - PWA médica para Honduras
Frontend de la plataforma web PWA para médicos hondureños que gestiona consultas, pacientes y comunicaciones mediante WhatsApp automático. MVP enfocado en validación de mercado con modelo de suscripciones y tokens.

**Visión**: "Crear la herramienta más intuitiva para que médicos hondureños gestionen su práctica diaria, enviando recordatorios automáticos por WhatsApp y optimizando su tiempo con inteligencia artificial."

### Usuarios Objetivo
- Médicos independientes en Honduras
- Especialistas con consulta privada  
- Profesionales que atienden 10-50 pacientes por semana
- Médicos que quieren modernizar su práctica

## Development Commands

### Core Development Tasks
- `npm start` or `ng serve` - Start development server on http://localhost:4200
- `npm run build` - Build the project for production (outputs to `dist/cura-frontend`)
- `npm run watch` - Build in development mode with file watching
- `npm test` or `ng test` - Run unit tests with Karma and Jasmine

### Angular CLI Commands
- `ng generate component component-name` - Generate new component
- `ng generate service service-name` - Generate new service
- `ng generate directive|pipe|guard|interface|enum|module [name]` - Generate other Angular artifacts
- `ng help` - Get help with Angular CLI commands

## 🚀 MVP Features

### 1. Dashboard Inteligente
- Vista del día actual con citas, confirmaciones y pendientes
- KPIs visuales: citas hoy, % confirmación, mensajes enviados, tokens disponibles
- Resumen diario generado por IA con sugerencias accionables
- Acciones rápidas: Nueva cita, nuevo paciente, enviar recordatorio

### 2. Agenda Visual
- Vista semanal y diaria estilo Google Calendar
- Creación rápida: click en horario = nueva cita
- Estados visuales: confirmada (verde), pendiente (amarillo), completada (azul)
- Drag & drop para mover citas (futuro)

### 3. Gestión de Pacientes
- Registro rápido con consentimiento para WhatsApp
- Búsqueda inteligente por nombre/teléfono
- Historial de citas y comunicaciones
- Etiquetas personalizables

### 4. Recordatorios WhatsApp
- Plantillas por especialidad (odontología, pediatría, medicina general)
- Envío automático o manual
- Confirmación de pacientes desde WhatsApp
- Tracking de entregas y respuestas

### 5. Sistema de Tokens
- Cada acción consume tokens (recordatorio = 1 token)
- Saldo visible en tiempo real
- Compra de tokens adicionales
- Límites mensuales por plan

## 🎨 Design System

### Paleta de Colores Médica
```scss
$primary: #26A8DB;      // Azul médico confiable
$secondary: #999999;    // Gris profesional
$success: #10B981;      // Verde confirmación
$warning: #F59E0B;      // Amarillo pendiente
$error: #EF4444;        // Rojo cancelación
```

### Principios de Diseño
- **Claridad Médica**: Información crítica siempre visible
- **Eficiencia**: Máximo 2 clicks para acciones comunes
- **Confianza**: Diseño profesional que inspire credibilidad
- **Móvil-First**: Optimizado para tablets y teléfonos
- **Accesibilidad**: Contraste alto, texto legible

## Architecture and Structure

### Tech Stack
- **Angular 18+** con Standalone Components
- **Tailwind CSS** (NO estilos personalizados)
- **PWA** con Service Worker
- **Reactive Forms** para formularios
- **HTTPClient** para APIs
- **JWT** para autenticación

### Folder Structure (SOLID Principles)
```
src/app/
├── core/           # Servicios singleton, guards, modelos
│   ├── services/   # AuthService, TokenService, etc.
│   ├── guards/     # AuthGuard, RoleGuard
│   ├── models/     # Interfaces y tipos
│   └── interceptors/ # HTTP interceptors
├── shared/         # Componentes reutilizables
│   ├── components/ # Botones, modales, cards
│   ├── pipes/      # Pipes personalizados
│   └── directives/ # Directivas personalizadas
├── features/       # Módulos por funcionalidad
│   ├── dashboard/  # Dashboard inteligente
│   ├── agenda/     # Calendario y citas
│   ├── pacientes/  # Gestión de pacientes
│   ├── mensajes/   # WhatsApp y comunicaciones
│   ├── tokens/     # Sistema de créditos
│   └── suscripciones/ # Stripe y planes
└── layouts/        # Layouts principales
    ├── auth/       # Layout de autenticación
    └── main/       # Layout principal de app
```

### Application Bootstrap
- Uses Angular's `bootstrapApplication()` function in `src/main.ts`
- Configuration is centralized in `src/app/app.config.ts`
- Router configuration is in `src/app/app.routes.ts`
- PWA configuration in `ngsw-config.json`

## 🚨 Critical Requirements

### Security
- ✅ Autenticación JWT con refresh tokens
- ✅ Validación de entrada en TODOS los endpoints
- ✅ Rate limiting: 100 requests/min por IP
- ✅ CORS configurado correctamente
- ✅ Variables de entorno para secretos
- ✅ Logs de auditoría para acciones críticas

### Performance
- ✅ Lazy loading en Angular
- ✅ Paginación en listas >20 elementos
- ✅ Caché en servicios frecuentes
- ✅ PWA con caché offline básico
- ✅ Compresión gzip en producción

### Medical Data Compliance
- ✅ Consentimiento explícito para WhatsApp
- ✅ Encriptación de datos sensibles
- ✅ Logs de acceso a información paciente
- ✅ Políticas de retención de datos

## Development Guidelines

### Component Architecture
- Use **standalone components** (no modules)
- Follow single responsibility principle
- Implement OnPush change detection for performance
- Use reactive forms for all user input

### Styling with Tailwind
- NEVER create custom SCSS files
- Use Tailwind utilities exclusively
- Implement design system colors as Tailwind config
- Mobile-first responsive design

### Medical UX Standards
- **Time to first value**: <60 segundos desde registro
- **Clicks para enviar recordatorio**: 2 máximo
- **Tiempo para crear cita**: <30 segundos
- **Loading states**: Profesionales, no interrumpir
- **Error handling**: Claro y accionable

### Code Quality
- TypeScript strict mode enabled
- All APIs must use typed DTOs
- Implement proper error boundaries
- Use dependency injection throughout
- Follow Angular style guide

### Testing Strategy
- Unit tests for all services and components
- Integration tests for critical user flows
- E2E tests for main medical workflows
- Performance testing for mobile devices

## Mentalidad de Desarrollo

### Piensen como Médicos
- **Tiempo es dinero**: Cada segundo ahorrado cuenta
- **Cero errores**: La información debe ser 100% confiable
- **Simplicidad**: Interfaz intuitiva sin capacitación
- **Disponibilidad**: Debe funcionar siempre, en cualquier dispositivo

### Definition of Done (DoD)
- ✅ Código revisado por al menos un compañero
- ✅ Pruebas unitarias básicas implementadas
- ✅ Validado en dispositivos móviles
- ✅ Error handling completo
- ✅ Performance testing básico
- ✅ Security check completado