# Configuración de Environments

## Archivos de Environment

Esta aplicación utiliza archivos de environment para gestionar diferentes configuraciones según el entorno de ejecución.

### Archivos

- **`src/environments/environment.ts`**: Configuración para desarrollo
- **`src/environments/environment.prod.ts`**: Configuración para producción

### Configuración

#### Desarrollo (`environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: '' // URL base vacía para desarrollo (el proxy maneja el redireccionamiento)
};
```

- En desarrollo, las URLs son relativas (`/api/v1/...`)
- El proxy de Angular (configurado en `proxy.conf.json`) redirige automáticamente a `http://localhost:3000`
- No necesitas cambiar la configuración para desarrollo local

#### Producción (`environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.cura.com' // Reemplazar con la URL real del backend
};
```

- **IMPORTANTE**: Actualiza `apiUrl` con la URL real de tu backend en producción
- El build de producción reemplazará automáticamente `environment.ts` por `environment.prod.ts` gracias a la configuración en `angular.json`

## Cómo Usar

### Desarrollo
```bash
npm start
```
El servidor de desarrollo usará `environment.ts` y las URLs serán relativas, aprovechando el proxy.

### Producción
```bash
npm run build:prod
```
El build usará `environment.prod.ts` automáticamente y las URLs serán absolutas.

## Servicios Actualizados

Los siguientes servicios ahora usan `environment.apiUrl`:
- `AuthService` - `/api/v1/auth`
- `DashboardService` - `/api/v1`
- `MedicosService` - `/api/v1/medicos`
- `TokenService` - `/api/v1/tokens`
- `PacientesService` - `/api/v1/pacientes`
- `AgendaService` - `/api/v1/citas`
- `MensajesService` - `/api/v1/mensajes`

## File Replacements

La configuración en `angular.json` asegura que al hacer build de producción, Angular reemplace automáticamente:

```json
"fileReplacements": [
  {
    "replace": "src/environments/environment.ts",
    "with": "src/environments/environment.prod.ts"
  }
]
```

## Proxy de Desarrollo

El archivo `proxy.conf.json` sigue siendo necesario para desarrollo:
```json
{
  "/api/v1": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

Esto permite que las peticiones a `/api/v1/*` en desarrollo se redirijan automáticamente al backend en `http://localhost:3000`.

