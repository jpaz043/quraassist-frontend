import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError, BehaviorSubject, Subject } from 'rxjs';
import { map, filter } from 'rxjs/operators';

export interface WhatsAppMensaje {
  id: string;
  conversacionId: string;
  direccion: 'enviado' | 'recibido';
  tipo: 'texto' | 'imagen' | 'audio' | 'documento' | 'ubicacion';
  contenido: string;
  archivo?: {
    url: string;
    nombre: string;
    tipo: string;
    tamaño: number;
  };
  ubicacion?: {
    latitud: number;
    longitud: number;
    nombre?: string;
  };
  timestamp: string;
  estado: 'enviando' | 'enviado' | 'entregado' | 'leido' | 'error';
  error?: string;
  pacienteNombre?: string;
}

export interface WhatsAppConversacion {
  id: string;
  pacienteId: string;
  pacienteNombre: string;
  pacienteTelefono: string;
  pacienteAvatar?: string;
  ultimoMensaje?: WhatsAppMensaje;
  mensajesNoLeidos: number;
  activa: boolean;
  bloqueada: boolean;
  etiquetas: string[];
  notas?: string;
  fechaCreacion: string;
  ultimaActividad: string;
}

export interface WhatsAppEstadisticas {
  mensajesEnviados: number;
  mensajesRecibidos: number;
  conversacionesActivas: number;
  tokensUtilizados: number;
  tiempoRespuestaPromedio: number; // minutos
  satisfaccionPacientes: number; // porcentaje
}

export interface PlantillaMensaje {
  id: string;
  nombre: string;
  categoria: 'recordatorio' | 'educativo' | 'urgente' | 'seguimiento' | 'bienvenida';
  contenido: string;
  variables: string[]; // ej: ['{{nombre}}', '{{fecha}}', '{{medico}}']
  costoTokens: number;
  usosUltimos30Dias: number;
  activa: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {
  private mensajesSubject = new BehaviorSubject<WhatsAppMensaje[]>([]);
  private conversacionesSubject = new BehaviorSubject<WhatsAppConversacion[]>([]);
  private nuevosMensajesSubject = new Subject<WhatsAppMensaje>();

  // Mock data
  private conversacionesMock: WhatsAppConversacion[] = [
    {
      id: 'conv1',
      pacienteId: 'p1',
      pacienteNombre: 'Dr. Juan Carlos Pérez',
      pacienteTelefono: '+504 9999-9999',
      mensajesNoLeidos: 2,
      activa: true,
      bloqueada: false,
      etiquetas: ['VIP', 'Control Mensual'],
      fechaCreacion: '2025-08-01T00:00:00Z',
      ultimaActividad: '2025-09-10T14:30:00Z'
    },
    {
      id: 'conv2',
      pacienteId: 'p2',
      pacienteNombre: 'María Elena Rodríguez',
      pacienteTelefono: '+504 8888-8888',
      mensajesNoLeidos: 0,
      activa: true,
      bloqueada: false,
      etiquetas: ['Primera Consulta'],
      fechaCreacion: '2025-09-01T00:00:00Z',
      ultimaActividad: '2025-09-09T16:45:00Z'
    }
  ];

  private mensajesMock: WhatsAppMensaje[] = [
    {
      id: 'msg1',
      conversacionId: 'conv1',
      direccion: 'enviado',
      tipo: 'texto',
      contenido: 'Buenos días Dr. Pérez, espero que se encuentre bien. Le recordamos que tiene cita programada para mañana miércoles 11 de septiembre a las 9:00 AM. Por favor confirme su asistencia.',
      timestamp: '2025-09-10T08:00:00Z',
      estado: 'leido',
      pacienteNombre: 'Dr. Juan Carlos Pérez'
    },
    {
      id: 'msg2',
      conversacionId: 'conv1',
      direccion: 'recibido',
      tipo: 'texto',
      contenido: 'Buenos días Doctor. Muchas gracias por el recordatorio. Confirmo mi asistencia para mañana a las 9:00 AM.',
      timestamp: '2025-09-10T08:15:00Z',
      estado: 'leido',
      pacienteNombre: 'Dr. Juan Carlos Pérez'
    },
    {
      id: 'msg3',
      conversacionId: 'conv1',
      direccion: 'recibido',
      tipo: 'texto',
      contenido: 'Doctor, una consulta. ¿Debo llevar algún estudio específico para la cita de mañana?',
      timestamp: '2025-09-10T14:30:00Z',
      estado: 'entregado',
      pacienteNombre: 'Dr. Juan Carlos Pérez'
    },
    {
      id: 'msg4',
      conversacionId: 'conv2',
      direccion: 'enviado',
      tipo: 'texto',
      contenido: 'Hola María Elena, espero que esté bien. Le comparto algunos consejos importantes para el manejo de la diabetes que discutimos en la consulta anterior.',
      timestamp: '2025-09-09T16:00:00Z',
      estado: 'leido',
      pacienteNombre: 'María Elena Rodríguez'
    },
    {
      id: 'msg5',
      conversacionId: 'conv2',
      direccion: 'enviado',
      tipo: 'texto',
      contenido: '1. Mantener horarios regulares de comida\n2. Tomar medicamento a la misma hora\n3. Caminar 30 minutos diarios\n4. Revisar niveles de glucosa según indicado',
      timestamp: '2025-09-09T16:01:00Z',
      estado: 'leido',
      pacienteNombre: 'María Elena Rodríguez'
    }
  ];

  private plantillasMock: PlantillaMensaje[] = [
    {
      id: 'plant1',
      nombre: 'Recordatorio de Cita',
      categoria: 'recordatorio',
      contenido: 'Hola {{nombre}}, le recordamos que tiene cita médica el {{fecha}} a las {{hora}}. Por favor confirme su asistencia. Dr. {{medico}}',
      variables: ['{{nombre}}', '{{fecha}}', '{{hora}}', '{{medico}}'],
      costoTokens: 1,
      usosUltimos30Dias: 45,
      activa: true
    },
    {
      id: 'plant2',
      nombre: 'Resultados de Estudios',
      categoria: 'seguimiento',
      contenido: 'Estimado/a {{nombre}}, sus resultados de {{estudio}} ya están listos. {{resultado}}. Cualquier duda, no dude en contactarnos. Dr. {{medico}}',
      variables: ['{{nombre}}', '{{estudio}}', '{{resultado}}', '{{medico}}'],
      costoTokens: 1,
      usosUltimos30Dias: 23,
      activa: true
    },
    {
      id: 'plant3',
      nombre: 'Mensaje Educativo Diabetes',
      categoria: 'educativo',
      contenido: 'Consejos para el control de diabetes:\n1. Mantener horarios de comida\n2. Tomar medicamento según prescripción\n3. Ejercicio regular\n4. Monitoreo de glucosa\n\nDr. {{medico}}',
      variables: ['{{medico}}'],
      costoTokens: 1,
      usosUltimos30Dias: 12,
      activa: true
    },
    {
      id: 'plant4',
      nombre: 'Mensaje Urgente',
      categoria: 'urgente',
      contenido: 'IMPORTANTE: {{nombre}}, necesitamos que se comunique con nosotros a la brevedad. Asunto: {{asunto}}. Tel: {{telefono}}. Dr. {{medico}}',
      variables: ['{{nombre}}', '{{asunto}}', '{{telefono}}', '{{medico}}'],
      costoTokens: 2,
      usosUltimos30Dias: 5,
      activa: true
    },
    {
      id: 'plant5',
      nombre: 'Bienvenida Nuevo Paciente',
      categoria: 'bienvenida',
      contenido: '¡Bienvenido/a {{nombre}}! Gracias por confiar en nosotros. Estamos aquí para cuidar su salud. Cualquier consulta, puede escribirnos por este medio. Dr. {{medico}}',
      variables: ['{{nombre}}', '{{medico}}'],
      costoTokens: 1,
      usosUltimos30Dias: 8,
      activa: true
    }
  ];

  private estadisticasMock: WhatsAppEstadisticas = {
    mensajesEnviados: 234,
    mensajesRecibidos: 189,
    conversacionesActivas: 15,
    tokensUtilizados: 67,
    tiempoRespuestaPromedio: 45,
    satisfaccionPacientes: 94
  };

  constructor() {
    // Asignar último mensaje a cada conversación
    this.asignarUltimosMensajes();
    
    // Simular conexión WebSocket para mensajes en tiempo real
    this.simularMensajesEnTiempoReal();
    
    // Cargar datos iniciales
    this.conversacionesSubject.next(this.conversacionesMock);
    this.mensajesSubject.next(this.mensajesMock);
  }

  // Obtener conversaciones
  getConversaciones(): Observable<WhatsAppConversacion[]> {
    return of(this.conversacionesMock).pipe(delay(800));
  }

  // Obtener mensajes de una conversación específica
  getMensajesConversacion(conversacionId: string): Observable<WhatsAppMensaje[]> {
    return this.mensajesSubject.pipe(
      map(mensajes => mensajes.filter(m => m.conversacionId === conversacionId))
    );
  }

  // Escuchar nuevos mensajes en tiempo real
  getNuevosMensajes(): Observable<WhatsAppMensaje> {
    return this.nuevosMensajesSubject.asObservable();
  }

  // Enviar mensaje
  enviarMensaje(conversacionId: string, contenido: string, tipo: 'texto' | 'imagen' | 'documento' = 'texto'): Observable<WhatsAppMensaje> {
    const nuevoMensaje: WhatsAppMensaje = {
      id: `msg_${Date.now()}`,
      conversacionId,
      direccion: 'enviado',
      tipo,
      contenido,
      timestamp: new Date().toISOString(),
      estado: 'enviando'
    };

    // Agregar mensaje a la lista
    const mensajesActuales = this.mensajesSubject.value;
    this.mensajesSubject.next([...mensajesActuales, nuevoMensaje]);

    // Simular envío
    return of(nuevoMensaje).pipe(
      delay(1000),
      map(mensaje => {
        // Actualizar estado del mensaje
        const mensajes = this.mensajesSubject.value;
        const index = mensajes.findIndex(m => m.id === mensaje.id);
        if (index !== -1) {
          mensajes[index].estado = 'enviado';
          this.mensajesSubject.next([...mensajes]);
        }

        // Actualizar última actividad de la conversación
        this.actualizarUltimaActividad(conversacionId);

        return { ...mensaje, estado: 'enviado' as const };
      })
    );
  }

  // Enviar mensaje usando plantilla
  enviarMensajePlantilla(
    conversacionId: string, 
    plantillaId: string, 
    variables: Record<string, string>
  ): Observable<WhatsAppMensaje> {
    const plantilla = this.plantillasMock.find(p => p.id === plantillaId);
    if (!plantilla) {
      return throwError(() => new Error('Plantilla no encontrada'));
    }

    let contenido = plantilla.contenido;
    
    // Reemplazar variables
    Object.entries(variables).forEach(([key, value]) => {
      contenido = contenido.replace(new RegExp(key, 'g'), value);
    });

    return this.enviarMensaje(conversacionId, contenido);
  }

  // Marcar mensajes como leídos
  marcarComoLeido(conversacionId: string): Observable<void> {
    const conversaciones = this.conversacionesSubject.value;
    const index = conversaciones.findIndex(c => c.id === conversacionId);
    
    if (index !== -1) {
      conversaciones[index].mensajesNoLeidos = 0;
      this.conversacionesSubject.next([...conversaciones]);
    }

    return of(void 0).pipe(delay(200));
  }

  // Obtener plantillas
  getPlantillas(): Observable<PlantillaMensaje[]> {
    return of(this.plantillasMock).pipe(delay(400));
  }

  // Crear nueva plantilla
  crearPlantilla(plantilla: Omit<PlantillaMensaje, 'id' | 'usosUltimos30Dias'>): Observable<PlantillaMensaje> {
    const nuevaPlantilla: PlantillaMensaje = {
      ...plantilla,
      id: `plant_${Date.now()}`,
      usosUltimos30Dias: 0
    };

    this.plantillasMock.push(nuevaPlantilla);
    return of(nuevaPlantilla).pipe(delay(600));
  }

  // Obtener estadísticas
  getEstadisticas(): Observable<WhatsAppEstadisticas> {
    return of(this.estadisticasMock).pipe(delay(500));
  }

  // Buscar conversaciones
  buscarConversaciones(query: string): Observable<WhatsAppConversacion[]> {
    const queryLower = query.toLowerCase();
    const conversacionesFiltradas = this.conversacionesMock.filter(c =>
      c.pacienteNombre.toLowerCase().includes(queryLower) ||
      c.pacienteTelefono.includes(query) ||
      c.etiquetas.some(e => e.toLowerCase().includes(queryLower))
    );

    return of(conversacionesFiltradas).pipe(delay(300));
  }

  // Bloquear/desbloquear conversación
  toggleBloqueoConversacion(conversacionId: string): Observable<void> {
    const conversaciones = this.conversacionesSubject.value;
    const index = conversaciones.findIndex(c => c.id === conversacionId);
    
    if (index !== -1) {
      conversaciones[index].bloqueada = !conversaciones[index].bloqueada;
      this.conversacionesSubject.next([...conversaciones]);
    }

    return of(void 0).pipe(delay(400));
  }

  // Agregar etiqueta a conversación
  agregarEtiqueta(conversacionId: string, etiqueta: string): Observable<void> {
    const conversaciones = this.conversacionesSubject.value;
    const index = conversaciones.findIndex(c => c.id === conversacionId);
    
    if (index !== -1 && !conversaciones[index].etiquetas.includes(etiqueta)) {
      conversaciones[index].etiquetas.push(etiqueta);
      this.conversacionesSubject.next([...conversaciones]);
    }

    return of(void 0).pipe(delay(300));
  }

  // Obtener conversación por paciente ID
  getConversacionPorPaciente(pacienteId: string): Observable<WhatsAppConversacion | null> {
    const conversacion = this.conversacionesMock.find(c => c.pacienteId === pacienteId);
    return of(conversacion || null).pipe(delay(200));
  }

  // Crear nueva conversación
  crearConversacion(pacienteId: string, pacienteNombre: string, pacienteTelefono: string): Observable<WhatsAppConversacion> {
    const nuevaConversacion: WhatsAppConversacion = {
      id: `conv_${Date.now()}`,
      pacienteId,
      pacienteNombre,
      pacienteTelefono,
      mensajesNoLeidos: 0,
      activa: true,
      bloqueada: false,
      etiquetas: [],
      fechaCreacion: new Date().toISOString(),
      ultimaActividad: new Date().toISOString()
    };

    this.conversacionesMock.push(nuevaConversacion);
    const conversaciones = this.conversacionesSubject.value;
    this.conversacionesSubject.next([...conversaciones, nuevaConversacion]);

    return of(nuevaConversacion).pipe(delay(500));
  }

  // Métodos privados
  private asignarUltimosMensajes(): void {
    // Asignar último mensaje a cada conversación
    this.conversacionesMock.forEach(conversacion => {
      const mensajesConversacion = this.mensajesMock
        .filter(m => m.conversacionId === conversacion.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      if (mensajesConversacion.length > 0) {
        conversacion.ultimoMensaje = mensajesConversacion[0];
      }
    });
  }

  private simularMensajesEnTiempoReal(): void {
    // Simular mensajes recibidos ocasionalmente
    setInterval(() => {
      if (Math.random() > 0.8) { // 20% de probabilidad cada 30 segundos
        this.simularMensajeRecibido();
      }
    }, 30000);
  }

  private simularMensajeRecibido(): void {
    const conversacionesActivas = this.conversacionesMock.filter(c => c.activa && !c.bloqueada);
    if (conversacionesActivas.length === 0) return;

    const conversacion = conversacionesActivas[Math.floor(Math.random() * conversacionesActivas.length)];
    const mensajesEjemplo = [
      '¡Hola Doctor! ¿Cómo está?',
      'Tengo una consulta sobre mi medicamento',
      'Muchas gracias por su atención',
      '¿A qué hora es mi próxima cita?',
      'Me siento mucho mejor, gracias'
    ];

    const nuevoMensaje: WhatsAppMensaje = {
      id: `msg_received_${Date.now()}`,
      conversacionId: conversacion.id,
      direccion: 'recibido',
      tipo: 'texto',
      contenido: mensajesEjemplo[Math.floor(Math.random() * mensajesEjemplo.length)],
      timestamp: new Date().toISOString(),
      estado: 'entregado',
      pacienteNombre: conversacion.pacienteNombre
    };

    // Agregar mensaje
    const mensajes = this.mensajesSubject.value;
    this.mensajesSubject.next([...mensajes, nuevoMensaje]);

    // Actualizar conversación
    const conversaciones = this.conversacionesSubject.value;
    const index = conversaciones.findIndex(c => c.id === conversacion.id);
    if (index !== -1) {
      conversaciones[index].mensajesNoLeidos += 1;
      conversaciones[index].ultimaActividad = nuevoMensaje.timestamp;
      conversaciones[index].ultimoMensaje = nuevoMensaje;
      this.conversacionesSubject.next([...conversaciones]);
    }

    // Emitir evento de nuevo mensaje
    this.nuevosMensajesSubject.next(nuevoMensaje);
  }

  private actualizarUltimaActividad(conversacionId: string): void {
    const conversaciones = this.conversacionesSubject.value;
    const index = conversaciones.findIndex(c => c.id === conversacionId);
    
    if (index !== -1) {
      conversaciones[index].ultimaActividad = new Date().toISOString();
      this.conversacionesSubject.next([...conversaciones]);
    }
  }
}