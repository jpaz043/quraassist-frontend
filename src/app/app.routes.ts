import { Routes } from '@angular/router';
import { AuthLayout } from './layouts/auth/auth.layout';
import { MainLayout } from './layouts/main/main.layout';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component')
          .then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component')
          .then(m => m.RegisterComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component')
          .then(m => m.ForgotPasswordComponent)
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./features/auth/reset-password/reset-password.component')
          .then(m => m.ResetPasswordComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'agenda',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/agenda/agenda.component')
              .then(m => m.AgendaComponent)
          },
          {
            path: 'calendario',
            loadComponent: () => import('./features/agenda/calendario/calendario.component')
              .then(m => m.CalendarioComponent)
          },
          {
            path: 'citas/nueva',
            loadComponent: () => import('./features/agenda/cita-form/cita-form.component')
              .then(m => m.CitaFormComponent)
          },
          {
            path: 'citas/:id',
            loadComponent: () => import('./features/agenda/cita-detalle/cita-detalle.component')
              .then(m => m.CitaDetalleComponent)
          },
          {
            path: 'citas/editar/:id',
            loadComponent: () => import('./features/agenda/cita-form/cita-form.component')
              .then(m => m.CitaFormComponent)
          },
          // Rutas legacy para compatibilidad (redirigen a las nuevas rutas)
          {
            path: 'nueva',
            redirectTo: 'citas/nueva',
            pathMatch: 'full'
          },
          {
            path: 'editar/:id',
            redirectTo: 'citas/editar/:id',
            pathMatch: 'full'
          }
        ]
      },
      {
        path: 'consultas',
        children: [
          {
            path: 'nueva',
            loadComponent: () => import('./features/consultas/consulta-form/consulta-form.component')
              .then(m => m.ConsultaFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/consultas/consulta-detalle/consulta-detalle.component')
              .then(m => m.ConsultaDetalleComponent)
          },
          {
            path: 'paciente/:pacienteId/historia',
            loadComponent: () => import('./features/consultas/historia-clinica/historia-clinica.component')
              .then(m => m.HistoriaClinicaComponent)
          }
        ]
      },
      {
        path: 'pacientes',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/pacientes/pacientes.component')
              .then(m => m.PacientesComponent)
          },
          {
            path: 'perfil/:id',
            loadComponent: () => import('./features/pacientes/perfil/perfil.component')
              .then(m => m.PerfilPacienteComponent)
          },
          {
            path: 'nuevo',
            loadComponent: () => import('./features/pacientes/paciente-form/paciente-form.component')
              .then(m => m.PacienteFormComponent)
          },
          {
            path: 'editar/:id',
            loadComponent: () => import('./features/pacientes/paciente-form/paciente-form.component')
              .then(m => m.PacienteFormComponent)
          }
        ]
      },
      {
        path: 'mensajes',
        loadComponent: () => import('./features/mensajes/mensajes.component')
          .then(m => m.MensajesComponent)
      },
      {
        path: 'whatsapp',
        loadComponent: () => import('./features/whatsapp/whatsapp.component')
          .then(m => m.WhatsAppComponent)
      },
      {
        path: 'tokens',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/tokens/tokens.component')
              .then(m => m.TokensComponent)
          },
          {
            path: 'pago',
            loadComponent: () => import('./features/tokens/pago/pago.component')
              .then(m => m.PagoComponent)
          },
          {
            path: 'exito',
            loadComponent: () => import('./features/tokens/exito/exito.component')
              .then(m => m.ExitoComponent)
          }
        ]
      },
      {
        path: 'bloqueos',
        loadComponent: () => import('./features/horarios/bloqueos.component')
          .then(m => m.BloqueosComponent)
      },
      // Redirect legacy /horarios route to /bloqueos
      {
        path: 'horarios',
        redirectTo: 'bloqueos',
        pathMatch: 'full'
      },
      {
        path: 'ubicaciones',
        loadComponent: () => import('./features/perfil/ubicaciones/ubicaciones.component')
          .then(m => m.UbicacionesComponent)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./features/perfil/perfil-medico/perfil-medico.component')
          .then(m => m.PerfilMedicoComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
