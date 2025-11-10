# 🔌 ENDPOINTS BACKEND REQUERIDOS - Platform Doctor

## 📋 RESUMEN

Este documento lista todos los endpoints backend que necesitan ser implementados o verificados para que el frontend funcione correctamente con datos reales.

**Fecha**: 2025-10-26
**Estado**: 🟡 Pendiente implementación backend

---

## 🚨 CRÍTICO - Endpoints Prioritarios

### 1. Dashboard Stats
**Endpoint**: `GET /api/v1/dashboard/stats`

**Descripción**: Estadísticas del dashboard médico en tiempo real

**Response esperado**:
```json
{
  "citasHoy": {
    "total": 8,
    "confirmadas": 6,
    "pendientes": 2,
    "porcentajeConfirmadas": 75
  },
  "mensajes": {
    "total": 24,
    "entregados": 23,
    "porcentajeEntregados": 96
  },
  "tokens": {
    "disponibles": 156,
    "usados": 44,
    "porcentajeUsado": 22
  },
  "pacientes": {
    "nuevos": 12,
    "totalActivos": 156,
    "porcentajeCrecimiento": 33
  }
}
```

**Prioridad**: 🚨 CRÍTICA
**Estado Frontend**: ✅ Implementado y listo para conectar
**Ubicación**: `src/app/features/dashboard/dashboard.service.ts:47`

---

### 2. Próximas Citas del Dashboard
**Endpoint**: `GET /api/v1/citas?fecha=YYYY-MM-DD&limit=4&sort=hora`

**Descripción**: Obtiene las próximas 4 citas del día para el dashboard

**Query params**:
- `fecha`: Fecha en formato ISO (YYYY-MM-DD)
- `limit`: Número máximo de citas (4)
- `sort`: Campo de ordenamiento (hora)

**Response esperado**:
```json
[
  {
    "id": "uuid",
    "paciente": {
      "nombre": "Juan Pérez",
      "iniciales": "JP"
    },
    "motivo": "Control hipertensión",
    "hora": "10:00 AM",
    "estado": "confirmada"
  }
]
```

**Prioridad**: 🚨 CRÍTICA
**Estado Frontend**: ✅ Implementado y listo para conectar
**Ubicación**: `src/app/features/dashboard/dashboard.service.ts:66`

---

### 3. Resumen IA del Dashboard
**Endpoint**: `GET /api/v1/dashboard/resumen-ia`

**Descripción**: Genera un resumen inteligente del día del médico usando IA

**Response esperado**:
```json
{
  "resumen": "📊 RESUMEN DEL DÍA - 26 de octubre de 2025\n\n🏥 ESTADO ACTUAL:\n• 8 citas programadas (75% confirmadas)\n• 2 pacientes pendientes de confirmación\n..."
}
```

**Prioridad**: ⚡ ALTA (puede fallar con graceful fallback)
**Estado Frontend**: ✅ Implementado con fallback
**Ubicación**: `src/app/features/dashboard/dashboard.service.ts:89`

---

### 4. Desactivar Paciente (Soft Delete)
**Endpoint**: `PUT /api/v1/pacientes/:id/deactivate`

**Descripción**: Desactiva un paciente sin borrar sus datos (eliminación lógica)

**Body**: `{}` (vacío)

**Response esperado**:
```json
{
  "id": "uuid",
  "nombreCompleto": "María García",
  "expedienteActivo": false,
  "deletedAt": "2025-10-26T12:00:00Z",
  ...
}
```

**Prioridad**: 🚨 CRÍTICA (seguridad de datos médicos)
**Estado Frontend**: ✅ Implementado
**Ubicación**: `src/app/features/pacientes/pacientes.service.ts:53`

---

### 5. Reactivar Paciente
**Endpoint**: `PUT /api/v1/pacientes/:id/reactivate`

**Descripción**: Reactiva un paciente previamente desactivado

**Body**: `{}` (vacío)

**Response esperado**:
```json
{
  "id": "uuid",
  "nombreCompleto": "María García",
  "expedienteActivo": true,
  "deletedAt": null,
  ...
}
```

**Prioridad**: ⚡ ALTA
**Estado Frontend**: ✅ Implementado
**Ubicación**: `src/app/features/pacientes/pacientes.service.ts:75`

---

### 6. Cancelar Cita con Tracking
**Endpoint**: `PUT /api/v1/citas/:id/cancelar`

**Descripción**: Cancela una cita registrando quién la canceló (médico, paciente o sistema)

**Body**:
```json
{
  "motivo": "Emergencia personal",
  "canceladoPor": "medico",  // enum: "medico" | "paciente" | "sistema"
  "observaciones": "Cancelada por el médico desde la agenda web el 26/10/2025"
}
```

**Response esperado**:
```json
{
  "id": "uuid",
  "estado": "cancelada",
  "fechaCancelacion": "2025-10-26T12:00:00Z",
  "canceladoPor": "medico",
  "motivoCancelacion": "Emergencia personal",
  ...
}
```

**Prioridad**: 🚨 CRÍTICA (requisito del usuario)
**Estado Frontend**: ✅ Implementado
**Ubicación**: `src/app/features/agenda/agenda.service.ts:116`

---

### 7. Historial de Cancelaciones
**Endpoint**: `GET /api/v1/citas/:id/cancelaciones`

**Descripción**: Obtiene el historial completo de cancelaciones de una cita

**Response esperado**:
```json
[
  {
    "citaId": "uuid",
    "fechaCancelacion": "2025-10-26T12:00:00Z",
    "motivo": "Emergencia personal",
    "canceladoPor": "medico",
    "observaciones": "...",
    "usuarioId": "uuid-del-medico"
  }
]
```

**Prioridad**: ⚡ ALTA
**Estado Frontend**: ✅ Implementado
**Ubicación**: `src/app/features/agenda/agenda.service.ts:138`

---

## ⚡ ALTA PRIORIDAD - Performance Critical

### 8. Citas por Rango de Fechas (Batch Request)
**Endpoint**: `GET /api/v1/citas/rango?inicio=YYYY-MM-DD&fin=YYYY-MM-DD`

**Descripción**: Obtiene todas las citas en un rango de fechas (para optimizar calendario mensual)

**Query params**:
- `inicio`: Fecha de inicio (YYYY-MM-DD)
- `fin`: Fecha de fin (YYYY-MM-DD)

**Response esperado**:
```json
{
  "data": [
    {
      "id": "uuid",
      "fechaHora": "2025-10-26T10:00:00Z",
      "duracionMinutos": 30,
      "estado": "confirmada",
      "motivo": "Control",
      "paciente": {
        "id": "uuid",
        "nombreCompleto": "Juan Pérez",
        "telefono": "+504 1234-5678"
      },
      "recordatorioEnviado": true,
      ...
    }
  ],
  "total": 25,
  "rangoInicio": "2025-10-01",
  "rangoFin": "2025-10-31"
}
```

**Prioridad**: ⚡ ALTA (performance crítico)
**Estado Frontend**: ⏳ Pendiente (actualmente hace N requests)
**Impacto**: Reduce de 42 requests HTTP a 1 solo en calendario mensual
**Nota**: El frontend tiene un TODO documentado en `calendario.component.ts:374`

---

## 📊 ENDPOINTS YA IMPLEMENTADOS Y FUNCIONALES

Los siguientes endpoints ya están siendo usados por el frontend:

### Pacientes
- ✅ `GET /api/v1/pacientes` - Listar pacientes con paginación
- ✅ `GET /api/v1/pacientes/:id` - Ver detalles de paciente
- ✅ `POST /api/v1/pacientes` - Crear paciente
- ✅ `PUT /api/v1/pacientes/:id` - Actualizar paciente
- ✅ `POST /api/v1/pacientes/:id/consent-whatsapp` - Dar consentimiento WhatsApp

### Agenda/Citas
- ✅ `GET /api/v1/citas` - Listar citas con filtros
- ✅ `GET /api/v1/citas/:id` - Ver detalles de cita
- ✅ `POST /api/v1/citas` - Crear cita
- ✅ `PUT /api/v1/citas/:id` - Actualizar cita
- ✅ `PUT /api/v1/citas/:id/estado` - Cambiar estado de cita
- ✅ `GET /api/v1/citas/agenda/week?fecha=X` - Citas de la semana
- ✅ `POST /api/v1/citas/:id/recordatorio` - Enviar recordatorio
- ✅ `GET /api/v1/citas/disponibilidad?fecha=X` - Horarios disponibles
- ✅ `PUT /api/v1/citas/:id/mover` - Mover cita a otro horario
- ✅ `PUT /api/v1/citas/:id/confirmar` - Confirmar cita
- ✅ `PUT /api/v1/citas/:id/completar` - Completar cita
- ✅ `GET /api/v1/citas/buscar` - Buscar citas
- ✅ `GET /api/v1/citas/estadisticas` - Estadísticas de citas

### Autenticación
- ✅ `POST /api/v1/auth/login` - Iniciar sesión
- ✅ `POST /api/v1/auth/register` - Registro
- ✅ `POST /api/v1/auth/logout` - Cerrar sesión
- ✅ `POST /api/v1/auth/forgot-password` - Solicitar reset
- ✅ `POST /api/v1/auth/reset-password` - Resetear contraseña

---

## 📝 ENDPOINTS DEPRECADOS (NO USAR)

Los siguientes métodos fueron marcados como deprecated en el frontend:

### ❌ Eliminación Física de Pacientes
**Método deprecado**: `DELETE /api/v1/pacientes/:id`
**Razón**: Riesgo de pérdida de datos médicos
**Reemplazo**: `PUT /api/v1/pacientes/:id/deactivate`

### ❌ Eliminación Física de Citas
**Método deprecado**: `DELETE /api/v1/citas/:id`
**Razón**: Pérdida de historial médico legal
**Reemplazo**: `PUT /api/v1/citas/:id/cancelar` (con tracking)

---

## 🎯 PLAN DE IMPLEMENTACIÓN BACKEND

### Prioridad 1 (Esta Semana)
1. Implementar `PUT /api/v1/pacientes/:id/deactivate`
2. Implementar `PUT /api/v1/pacientes/:id/reactivate`
3. Actualizar `PUT /api/v1/citas/:id/cancelar` para incluir tracking
4. Implementar `GET /api/v1/citas/:id/cancelaciones`

### Prioridad 2 (Próxima Semana)
5. Implementar `GET /api/v1/dashboard/stats`
6. Adaptar `GET /api/v1/citas` para soportar filtros de dashboard
7. Implementar `GET /api/v1/dashboard/resumen-ia`

### Prioridad 3 (Optimización)
8. Implementar `GET /api/v1/citas/rango` para batch requests

---

## 🔍 CÓMO PROBAR LOS ENDPOINTS

### Usar el Frontend Local
El frontend ya está configurado para usar estos endpoints. Simplemente:

1. Levantar el backend en `http://localhost:3000`
2. Levantar el frontend: `npm start`
3. El proxy de Angular redirigirá `/api/*` al backend automáticamente

### Configuración del Proxy
Archivo: `src/proxy.conf.json` (si existe)
```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true
  }
}
```

---

## 📞 CONTACTO

**Frontend Lead**: Claude Code
**Archivo de Análisis**: `BACKEND-CONNECTIVITY-ANALYSIS.md`
**Última actualización**: 2025-10-26

---

## ✅ CHECKLIST DE VALIDACIÓN

Antes de considerar un endpoint como "completo", verificar:

- [ ] Endpoint implementado en backend
- [ ] DTOs de request/response coinciden con frontend
- [ ] Error handling correcto (401, 403, 404, 500)
- [ ] Paginación implementada (donde aplique)
- [ ] Validación de datos de entrada
- [ ] Tests unitarios del endpoint
- [ ] Tests de integración
- [ ] Documentación en Swagger/OpenAPI
- [ ] Frontend probado con datos reales
- [ ] Performance aceptable (< 2 segundos)

---

**Última actualización**: 2025-10-26
**Generado por**: Claude Code
**Estado**: 🟡 EN DESARROLLO
