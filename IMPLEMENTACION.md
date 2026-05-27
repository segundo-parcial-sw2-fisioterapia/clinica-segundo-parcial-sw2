# Documentación de Implementación — `clinica-segundo-parcial-sw2`

**Fecha:** 2026-05-25  
**Framework:** NestJS 11 + TypeORM + GraphQL Code First + Apollo  
**Base de datos:** PostgreSQL  
**Prefijo REST global:** `/api`  

---

## 1. Paquetes pnpm que faltan instalar

Ejecuta los siguientes comandos antes de levantar el proyecto:

```bash
# Hasheo de contraseñas
pnpm add bcrypt
pnpm add -D @types/bcrypt

# Variable de entorno adicional requerida para n8n
# (agregar al .env y .env.example)
# N8N_API_KEY=<clave-secreta-para-n8n>
```

> **Nota sobre versiones en package.json:**
> - `"typeorm": "^1.0.0"` — No existe versión estable 1.0.0 de TypeORM. Cambiar a `"typeorm": "^0.3.21"`.
> - `"@nestjs/typeorm": "^11.0.1"` — Verificar que esta versión es compatible con TypeORM 0.3.x.

---

## 2. Variable de entorno adicional requerida

Agregar al `.env` y `.env.example`:

```env
# Clave API para autenticar peticiones de n8n al controlador REST
N8N_API_KEY=<clave-secreta-generada>
```

---

## 3. Estructura de archivos implementados

```
src/
├── compartido/
│   ├── enums/
│   │   └── index.ts                        ← 15 ENUMs registrados en GraphQL
│   ├── guards/
│   │   └── api-key.guard.ts                ← Guard API Key para endpoints n8n
│   ├── n8n/
│   │   ├── dto/
│   │   │   ├── registrar-paciente-n8n.dto.ts
│   │   │   ├── solicitar-cita-n8n.dto.ts
│   │   │   └── respuesta-n8n.dto.ts
│   │   ├── n8n-citas.service.ts            ← Lógica de integración con n8n
│   │   └── n8n-citas.controller.ts         ← Endpoints REST para n8n
│   └── compartido.module.ts
├── personas/           → entity, dto (create/update), service, resolver, module
├── usuarios/           → entity, dto (create/update), service, resolver, module
├── pacientes/          → entity, dto (create/update), service, resolver, module
├── evaluaciones_inniciales/  → entity, dto, service, resolver, module
├── planes_tratamientos/ → entity, dto, service, resolver, module
├── ejercicios/         → entity, dto, service, resolver, module
├── planes_ejercicios/  → entity, dto, service, resolver, module
├── citas/              → entity, dto, service, resolver, module
├── sesiones/           → entity, dto, service, resolver, module
└── sesiones_docmiciliarias/ → entity, dto, service, resolver, module
```

---

## 4. Entidades implementadas (10)

| Entidad (Clase) | Tabla PostgreSQL | Descripción |
|---|---|---|
| `Personas` | `personas` | Datos personales base |
| `Usuarios` | `usuarios` | Cuentas de acceso; contraseña con bcrypt |
| `Pacientes` | `pacientes` | Registro clínico del paciente |
| `EvaluacionesIniciales` | `evaluaciones_iniciales` | Evaluación clínica con 3 categorías |
| `PlanesTratamientos` | `planes_tratamientos` | Plan terapéutico del paciente |
| `Ejercicios` | `ejercicios` | Catálogo de ejercicios terapéuticos |
| `PlanesEjercicios` | `planes_ejercicios` | Relación plan-ejercicio con parámetros |
| `Citas` | `citas` | Agendamiento presencial y automatizado |
| `Sesiones` | `sesiones` | Sesiones presenciales con evolución |
| `SesionesDomiciliarias` | `sesiones_domiciliarias` | Sesiones en casa con análisis IA |

> **Nota de typos en carpetas generadas:** `evaluaciones_inniciales/` (doble n) y `sesiones_docmiciliarias/` (docmiciliarias). Las carpetas se mantienen tal como fueron generadas. Los nombres de clase y tabla de BD son **correctos**.

---

## 5. ENUMs implementados (15)

| Enum | Valores |
|---|---|
| `RolUsuario` | `paciente`, `fisioterapeuta`, `recepcionista`, `administrador`, `contador`, `director` |
| `EstadoUsuario` | `activo`, `inactivo`, `suspendido` |
| `SexoPaciente` | `masculino`, `femenino`, `otro` |
| `EstadoPaciente` | `activo`, `inactivo`, `alta_medica` |
| `CategoriaSemaforo` | `rojo`, `amarillo`, `verde` |
| `CategoriaTrabajo` | `superior`, `extremidad_superior`, `torax_cintura`, `extremidad_inferior` |
| `CategoriaEnfermedad` | `paralisis_facial`, `discapacidad_motora`, `cadera_desalineada`, `espalda_desviada`, `lesion_brazo`, `lesion_pierna`, `lesion_pie`, `obesidad`, `post_acv`, `otro` |
| `FrecuenciaSesion` | `diaria`, `semanal`, `mensual` |
| `EstadoPlanTratamiento` | `activo`, `completado`, `suspendido` |
| `NivelDificultadEjercicio` | `bajo`, `medio`, `alto` |
| `FrecuenciaPlanEjercicio` | `diaria`, `interdiaria`, `semanal` |
| `TipoCita` | `primera_vez`, `seguimiento`, `control` |
| `OrigenCita` | `recepcion`, `whatsapp`, `sistema` |
| `EstadoCita` | `programada`, `confirmada`, `asistida`, `cancelada`, `reprogramada` |
| `EstadoSesion` | `abierta`, `cerrada`, `firmada` |

---

## 6. GraphQL CRUD por módulo

### Personas
| Operación | Tipo | Descripción |
|---|---|---|
| `crearPersonas(datos)` | Mutation | Registra una persona |
| `listarPersonas` | Query | Todas las personas |
| `verPersona(id)` | Query | Persona por ID |
| `buscarPersonas(termino)` | Query | Búsqueda por nombre/apellido/CI |
| `editarPersona(datos)` | Mutation | Actualiza datos personales |
| `eliminarPersona(id)` | Mutation | Elimina una persona |

### Usuarios
| Operación | Tipo | Descripción |
|---|---|---|
| `crearUsuarios(datos)` | Mutation | Crea usuario (hashea contraseña) |
| `listarUsuarios` | Query | Todos los usuarios |
| `verUsuario(id)` | Query | Usuario por ID |
| `editarUsuario(datos)` | Mutation | Actualiza rol/estado/contraseña |
| `inactivarUsuario(id)` | Mutation | Cambia estado a INACTIVO (CU-05) |
| `eliminarUsuario(id)` | Mutation | Elimina usuario permanentemente |

### Pacientes
| Operación | Tipo | Descripción |
|---|---|---|
| `crearPacientes(datos)` | Mutation | Registra paciente (CU-01) |
| `listarPacientes` | Query | Todos los pacientes |
| `verPaciente(id)` | Query | Paciente por ID |
| `buscarPacientes(termino)` | Query | Búsqueda por nombre/CI/teléfono (CU-06) |
| `editarPaciente(datos)` | Mutation | Actualiza datos clínicos |
| `altaMedicaPaciente(id)` | Mutation | Alta médica (CU-25) |
| `eliminarPaciente(id)` | Mutation | Elimina paciente |

### EvaluacionesIniciales
| Operación | Tipo | Descripción |
|---|---|---|
| `crearEvaluacionesIniciales(datos)` | Mutation | Registra evaluación, calcula tiempo por semáforo (CU-16…20) |
| `listarEvaluacionesIniciales` | Query | Todas las evaluaciones |
| `listarEvaluacionesPorPaciente(pacienteId)` | Query | Historial de evaluaciones del paciente |
| `verEvaluacionInicial(id)` | Query | Evaluación por ID |
| `editarEvaluacionInicial(datos)` | Mutation | Actualiza evaluación (CU-26) |
| `eliminarEvaluacionInicial(id)` | Mutation | Elimina evaluación |

### PlanesTratamientos
| Operación | Tipo | Descripción |
|---|---|---|
| `crearPlanesTratamientos(datos)` | Mutation | Crea plan terapéutico (CU-21) |
| `listarPlanesTratamientos` | Query | Todos los planes |
| `listarPlanesPorPaciente(pacienteId)` | Query | Planes de un paciente |
| `verPlanTratamiento(id)` | Query | Plan por ID |
| `editarPlanTratamiento(datos)` | Mutation | Actualiza plan |
| `eliminarPlanTratamiento(id)` | Mutation | Elimina plan |

### Ejercicios
| Operación | Tipo | Descripción |
|---|---|---|
| `crearEjercicios(datos)` | Mutation | Agrega ejercicio al catálogo |
| `listarEjercicios` | Query | Catálogo completo |
| `listarEjerciciosPorCategoria(categoria)` | Query | Filtro por zona corporal |
| `verEjercicio(id)` | Query | Ejercicio por ID |
| `editarEjercicio(datos)` | Mutation | Actualiza ejercicio |
| `eliminarEjercicio(id)` | Mutation | Elimina ejercicio |

### PlanesEjercicios
| Operación | Tipo | Descripción |
|---|---|---|
| `crearPlanesEjercicios(datos)` | Mutation | Asigna ejercicio al plan con parámetros |
| `listarPlanesEjercicios` | Query | Todos los ejercicios asignados |
| `listarEjerciciosDePlan(planTratamientoId)` | Query | Ejercicios de un plan (CU-32) |
| `verPlanEjercicio(id)` | Query | Plan-ejercicio por ID |
| `editarPlanEjercicio(datos)` | Mutation | Actualiza parámetros del ejercicio |
| `eliminarPlanEjercicio(id)` | Mutation | Desasigna ejercicio del plan |

### Citas
| Operación | Tipo | Descripción |
|---|---|---|
| `crearCitas(datos)` | Mutation | Agenda cita (CU-08) |
| `listarCitas` | Query | Todas las citas |
| `listarCitasPorPaciente(pacienteId)` | Query | Citas de un paciente (CU-38) |
| `listarCitasPorEmpleadoYFecha(empleadoId, fecha)` | Query | Agenda del fisioterapeuta (CU-14) |
| `listarCitasProximas(horasAntelacion)` | Query | Citas próximas para recordatorios (CU-15) |
| `verCita(id)` | Query | Cita por ID |
| `editarCita(datos)` | Mutation | Actualiza/reprograma cita (CU-13) |
| `confirmarCita(id)` | Mutation | Confirma cita (CU-12) |
| `cancelarCita(id)` | Mutation | Cancela cita (CU-13) |
| `eliminarCita(id)` | Mutation | Elimina cita |

### Sesiones
| Operación | Tipo | Descripción |
|---|---|---|
| `crearSesiones(datos)` | Mutation | Abre sesión presencial (CU-27) |
| `listarSesiones` | Query | Todas las sesiones |
| `listarSesionesPorPaciente(pacienteId)` | Query | Historial clínico (CU-31, CU-40) |
| `verSesion(id)` | Query | Sesión por ID (CU-42) |
| `editarSesion(datos)` | Mutation | Registra evolución/observaciones (CU-28, CU-29) |
| `cerrarYFirmarSesion(id, urlDoc, hash)` | Mutation | Cierra y firma con blockchain (CU-30) |
| `eliminarSesion(id)` | Mutation | Elimina sesión |

### SesionesDomiciliarias
| Operación | Tipo | Descripción |
|---|---|---|
| `crearSesionesDomiciliarias(datos)` | Mutation | Registra sesión con resultado IA (CU-36) |
| `listarSesionesDomiciliarias` | Query | Todas las sesiones domiciliarias |
| `listarSesionesDomiciliariasPorPaciente(pacienteId)` | Query | Sesiones de un paciente (CU-37) |
| `verSesionDomiciliaria(id)` | Query | Sesión domiciliaria por ID |
| `editarSesionDomiciliaria(datos)` | Mutation | Actualiza/sincroniza sesión offline |
| `eliminarSesionDomiciliaria(id)` | Mutation | Elimina sesión domiciliaria |

---

## 7. Endpoint de autenticación — para el gateway (puerta-enlace)

> Aunque el login no es un caso de uso de este subsistema, este microservicio expone un endpoint REST interno para que el **gateway** (`puerta-enlace-segundo-parcial-sw2`) valide credenciales y emita el JWT.

### Flujo de login

```
Cliente (Angular / App Móvil)
        │
        │  POST /graphql → mutation login(correo, contrasena)
        ▼
puerta-enlace-segundo-parcial-sw2  (gateway)
        │
        │  POST http://clinica-service:3000/api/auth/login
        │  Body: { "correo": "...", "contrasena": "..." }
        ▼
clinica-segundo-parcial-sw2  (este microservicio)
        │  Valida bcrypt, verifica estado ACTIVO, actualiza ultimo_acceso
        │  Retorna: { usuarioId, correo, roles[], personaId, nombre, apellido }
        ▼
puerta-enlace  →  firma JWT con los datos recibidos  →  devuelve token al cliente
```

### Detalle del endpoint

| Campo | Valor |
|---|---|
| **Método** | `POST` |
| **URL** | `http://<host-clinica>:<port>/api/auth/login` |
| **Autenticación** | Ninguna (es llamada interna entre microservicios) |
| **Content-Type** | `application/json` |

**Request body:**
```json
{
  "correo": "fisioterapeuta@clinica.com",
  "contrasena": "MiContrasena123"
}
```

**Response 200 — Credenciales válidas:**
```json
{
  "usuarioId": "550e8400-e29b-41d4-a716-446655440000",
  "correo": "fisioterapeuta@clinica.com",
  "roles": ["fisioterapeuta"],
  "personaId": "660e8400-e29b-41d4-a716-446655440001",
  "nombre": "Carlos",
  "apellido": "Mamani"
}
```

**Response 401 — Credenciales inválidas o usuario inactivo:**
```json
{
  "statusCode": 401,
  "message": "Credenciales inválidas"
}
```

**Response 401 — Usuario suspendido/inactivo:**
```json
{
  "statusCode": 401,
  "message": "El usuario está inactivo. Contacte al administrador."
}
```

### Archivos implementados

```
src/compartido/auth/
├── dto/
│   ├── login.dto.ts               ← { correo, contrasena }
│   └── usuario-autenticado.dto.ts ← Respuesta al gateway
├── auth.service.ts                ← Valida bcrypt, estado y actualiza ultimo_acceso
└── auth.controller.ts             ← POST /api/auth/login
```

### Configuración recomendada en el gateway

En `puerta-enlace-segundo-parcial-sw2`, el servicio que llama a este endpoint debe:

1. Usar la URL interna del servicio (variable de entorno `CLINICA_SERVICE_URL`).
2. NO exponer este endpoint hacia el exterior — debe ser una llamada interna de red privada.
3. Después de recibir la respuesta exitosa, firmar un JWT con `usuarioId`, `correo` y `roles` como claims.

```env
# En puerta-enlace .env
CLINICA_SERVICE_URL=http://clinica-segundo-parcial-sw2:3000
```

```typescript
// Ejemplo en puerta-enlace (pseudocódigo)
const response = await fetch(`${CLINICA_SERVICE_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ correo, contrasena }),
});
const usuario = await response.json(); // UsuarioAutenticadoDto
const token = jwt.sign({ sub: usuario.usuarioId, roles: usuario.roles }, JWT_SECRET);
```

---

## 8. Integración n8n — Endpoints REST (prefijo `/api/n8n`)

**Prefijo completo:** `/api/n8n`  
**Autenticación:** Header `x-n8n-api-key: <N8N_API_KEY>`

| Método | Ruta completa | CU | Descripción |
|---|---|---|---|
| `POST` | `/api/n8n/pacientes` | CU-01, CU-09 | Registra paciente desde WhatsApp. Si CI ya existe, retorna el existente |
| `GET` | `/api/n8n/disponibilidad?empleadoId=&fecha=&duracion=` | CU-11 | Retorna bloques horarios libres del fisioterapeuta |
| `POST` | `/api/n8n/citas` | CU-08, CU-09 | Agenda cita con origen WHATSAPP |
| `PATCH` | `/api/n8n/citas/:id/confirmar` | CU-12 | Confirma una cita programada |
| `PATCH` | `/api/n8n/citas/:id/cancelar` | CU-13 | Cancela una cita |
| `GET` | `/api/n8n/citas/recordatorios?horas=24` | CU-15 | Lista citas próximas para recordatorios |

### Payload `POST /n8n/pacientes`
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "ci": "1234567",
  "telefono": "70000001",
  "fecha_nacimiento": "1990-05-15",
  "direccion": "Av. Principal 123"
}
```

### Payload `POST /n8n/citas`
```json
{
  "pacienteId": "uuid-del-paciente",
  "empleadoId": "uuid-del-empleado",
  "fecha_hora": "2025-06-01T10:00:00",
  "observaciones": "Primera consulta desde WhatsApp"
}
```

---

## 8. Casos de Uso cubiertos por módulo

### Módulo 1 — Gestión de Usuarios

| CU | Implementado en | Descripción |
|---|---|---|
| CU-01 | `PacientesService.crearPacientes`, `N8nCitasService.registrarPacienteDesdeWhatsApp` | Registrar paciente |
| CU-03 | `PersonasService.editarPersona`, `UsuariosService.editarUsuario` | Editar datos personales |
| CU-04 | `UsuariosResolver.verUsuario`, `PacientesResolver.verPaciente` | Consultar perfil |
| CU-05 | `UsuariosService.inactivarUsuario` → Mutation `inactivarUsuario` | Inactivar usuario |
| CU-06 | `PacientesService.buscarPacientes`, `PersonasService.buscarPersonas` | Buscar por nombre/CI/teléfono |
| CU-07 | `UsuariosService.editarUsuario` (campo `roles`) | Gestionar roles |

### Módulo 2 — Gestión de Citas

| CU | Implementado en | Descripción |
|---|---|---|
| CU-08 | `CitasService.crearCitas` → Mutation `crearCitas` | Agendar desde recepción |
| CU-09 | `POST /n8n/citas` + `POST /n8n/pacientes` | Primera cita por WhatsApp |
| CU-11 | `GET /n8n/disponibilidad` | Consultar disponibilidad |
| CU-12 | `CitasService.confirmarCita` + `PATCH /n8n/citas/:id/confirmar` | Confirmar cita |
| CU-13 | `CitasService.cancelarCita` + `PATCH /n8n/citas/:id/cancelar` | Cancelar/reprogramar |
| CU-14 | `CitasResolver.listarCitasPorEmpleadoYFecha` | Agenda del fisioterapeuta |
| CU-15 | `GET /n8n/citas/recordatorios` | Recordatorios push/email via n8n |

### Módulo 3 — Gestión Clínica y Evaluación Inicial

| CU | Implementado en | Descripción |
|---|---|---|
| CU-16..20 | `EvaluacionesInnicialesService.crearEvaluacionesIniciales` | Registrar evaluación con 3 categorías |
| CU-21 | `PlanesTratamientosService.crearPlanesTratamientos` + `PlanesEjerciciosService.crearPlanesEjercicios` | Plan con ejercicios |
| CU-22 | `SesionesService.editarSesion` | Evolución clínica por sesión |
| CU-23 | `SesionesResolver.listarSesionesPorPaciente` + `EvaluacionesInnicialesResolver.listarEvaluacionesPorPaciente` | Historial completo |
| CU-25 | `PacientesService.altaMedicaPaciente` → Mutation `altaMedicaPaciente` | Alta médica |
| CU-26 | `EvaluacionesInnicialesService.editarEvaluacionInicial` (campo `categoria_semaforo`) | Actualizar semáforo |

### Módulo 4 — Gestión de Sesiones

| CU | Implementado en | Descripción |
|---|---|---|
| CU-27 | `SesionesService.crearSesiones` → Mutation `crearSesiones` | Abrir sesión |
| CU-28 | `SesionesService.editarSesion` | Registrar ejercicios ejecutados |
| CU-29 | `SesionesService.editarSesion` (campo `observaciones_clinicas`) | Anotar observaciones |
| CU-30 | `SesionesService.cerrarYFirmarSesion` → Mutation `cerrarYFirmarSesion` | Cerrar y firmar con blockchain |
| CU-31 | `SesionesResolver.listarSesionesPorPaciente` | Historial de sesiones |

### Módulo 5 — Ejercicios Domiciliarios con IA (App Móvil)

| CU | Implementado en | Descripción |
|---|---|---|
| CU-32 | `PlanesEjerciciosResolver.listarEjerciciosDePlan` | Consultar plan de ejercicios |
| CU-33..35 | El análisis lo realiza `ia-analisis-pose` (microservicio externo) | Análisis postural IA |
| CU-36 | `SesionesDocmiciliariasService.crearSesionesDomiciliarias` | Registrar sesión completada |
| CU-37 | `SesionesDocmiciliariasResolver.listarSesionesDomiciliariasPorPaciente` | Resumen (puntos, XP) |

### Módulo 6 — Citas y Sesiones del Paciente (App Móvil)

| CU | Implementado en | Descripción |
|---|---|---|
| CU-38 | `CitasResolver.listarCitasPorPaciente` | Consultar próximas citas |
| CU-39 | `EvaluacionesInnicialesResolver.listarEvaluacionesPorPaciente` (campo `frecuencia_sesion`) | Ver frecuencia asignada |
| CU-40 | `SesionesResolver.listarSesionesPorPaciente` | Historial de sesiones |
| CU-41 | `GET /n8n/citas/recordatorios` → n8n gestiona push | Notificaciones push |
| CU-42 | `SesionesResolver.verSesion` | Detalles de sesión individual |

---

## 9. Lógica de negocio destacada

### Cálculo automático `tiempo_sesion_minutos` (EvaluacionesIniciales)
Al registrar una evaluación inicial, el servicio calcula automáticamente el tiempo según:

| `categoria_semaforo` | `tiempo_sesion_minutos` |
|---|---|
| `ROJO` | 120 min |
| `AMARILLO` | 90 min |
| `VERDE` | 45 min |

Este valor también se recalcula si se edita la categoría semáforo posteriormente.

### Unicidad de evaluación vigente
Al crear una nueva evaluación inicial, el servicio marca como `es_vigente = false` todas las evaluaciones previas del mismo paciente, garantizando solo una evaluación activa.

### Contraseña segura
`UsuariosService.crearUsuarios` nunca almacena contraseñas en texto plano. Usa `bcrypt.hash(contrasena, 10)` antes de persistir.

### Detección de duplicados en n8n
`N8nCitasService.registrarPacienteDesdeWhatsApp` verifica si la CI ya existe antes de crear una nueva persona/paciente, evitando duplicados cuando el mismo usuario vuelve a contactar por WhatsApp.

---

## 10. Consideraciones de despliegue

1. **Variables de entorno**: Revisar `.env.example` y configurar `.env` con los valores reales.
2. **TypeORM synchronize**: `synchronize: true` solo para desarrollo. En producción usar migraciones.
3. **Enum arrays PostgreSQL**: La columna `usuarios.roles` usa `type: 'enum', array: true`. Si TypeORM falla al crear la tabla, aplicar la migración manualmente con `CREATE TYPE rol_usuario AS ENUM (...)`.
4. **bcrypt**: Instalar antes de levantar: `pnpm add bcrypt @types/bcrypt`.
5. **n8n API Key**: Generar una clave fuerte y agregarla a `.env` como `N8N_API_KEY`.

---

*Implementado para INF 423 — Ingeniería de Software II — UAGRM*
