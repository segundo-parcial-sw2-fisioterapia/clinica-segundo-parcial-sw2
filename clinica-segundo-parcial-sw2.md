# Subsistema Clínico — `clinica-segundo-parcial-sw2`

**Framework:** NestJS (Node.js / TypeScript)  
**Base de Datos:** PostgreSQL (relacional)  
**Protocolo Externo:** GraphQL (Code First con Apollo Driver)  
**Proveedor Cloud:** AWS  
**Almacenamiento de Archivos:** Amazon S3  

---

## 1. Función del Subsistema

Es el **núcleo clínico y de identidad** del ERP. Concentra todo el dominio médico del centro de rehabilitación y fisioterapia, además de ser el hogar de la gestión de usuarios (ya que el usuario pertenece al paciente o al personal).

### Responsabilidades principales

- Registro y gestión del ciclo de vida de pacientes
- Gestión de usuarios con roles y permisos de acceso
- Evaluación inicial con tres categorías de clasificación (semáforo, trabajo, enfermedad)
- Historial clínico completo del paciente
- Plan de tratamiento con ejercicios personalizados
- Gestión de citas (presenciales y desde flujo automatizado WhatsApp)
- Gestión de sesiones presenciales con evolución clínica
- Registro de sesiones domiciliarias con resultados de Deep Learning
- Almacenamiento de videos de ejercicio en S3
- Invocación interna al microservicio `ia-analisis-pose` para análisis postural
- Invocación interna a `blockchain-firmas` para firma de documentos clínicos
- Exposición de datos clínicos mediante GraphQL para el frontend Angular y la app móvil React Native

---

## 2. Estándares de Codificación Aplicables

### 2.1 Base de Datos (PostgreSQL)

| Regla | Estándar | Ejemplo correcto | Ejemplo incorrecto |
|---|---|---|---|
| Tablas | Plural, minúsculas, `snake_case` | `pacientes`, `evaluaciones_iniciales` | `paciente`, `EvaluacionInicial` |
| Columnas | Minúsculas, `snake_case` | `fecha_nacimiento`, `nivel_dolor_reportado` | `fechaNacimiento` |
| PK | Siempre `id` | `id` (UUID) | `paciente_id` como PK |
| FK | Tabla origen + `_id` | `paciente_id`, `ejercicio_id` | `fk_paciente` |

### 2.2 Código TypeScript (NestJS)

| Elemento | Convención | Ejemplo |
|---|---|---|
| Clases / Entidades / Modelos | `PascalCase`, plural, español | `Pacientes`, `EvaluacionesIniciales`, `PlanesTratamientos` |
| Métodos (colección) | `camelCase`, verbo infinitivo, plural | `listarPacientes()`, `crearUsuarios()` |
| Métodos (registro único) | `camelCase`, verbo infinitivo, singular | `editarPaciente()`, `verUsuario()` |
| Variables (singular) | `camelCase` | `pacienteActual`, `fechaInicio` |
| Variables (colección) | `camelCase`, plural | `listaPacientes`, `ejerciciosAsignados` |

### 2.3 Documentación de Métodos

Todo método con lógica de negocio debe tener un comentario de documentación (JSDoc) que explique **qué hace**, **qué recibe** y **qué devuelve**.

```typescript
/**
 * Registra la evaluación inicial del paciente y calcula
 * el tiempo de sesión según la categoría semáforo.
 *
 * @param pacienteId - Identificador único del paciente.
 * @param datosEvaluacion - Datos de la evaluación inicial.
 * @returns La evaluación inicial creada con la frecuencia calculada.
 */
async registrarEvaluacionInicial(
  pacienteId: string,
  datosEvaluacion: CreateEvaluacionInicialInput,
): Promise<EvaluacionesIniciales> {
  // Lógica del método...
}
```

### 2.4 Estructura del Repositorio

```text
/ clinica-segundo-parcial-sw2
  ├── src/                  # Código fuente del microservicio
  ├── .env.example          # Plantilla de variables (SIN valores reales)
  ├── .env                  # Variables locales (IGNORADO EN GIT)
  ├── Dockerfile            # Imagen del servicio
  ├── docker-compose.yml    # Orquestación del servicio + PostgreSQL
  └── README.md             # Documentación del microservicio
```

---

## 3. Entidades del Microservicio

Este subsistema gestiona **10 entidades** en PostgreSQL con relaciones fuertes e integridad referencial.

---

### 3.1 `usuarios`

Identidad digital de cualquier actor que pueda iniciar sesión. Vinculado 1:1 con `personas`.

| Atributo | Tipo | Descripción |
|---|---|---|
| `id` | UUID (PK) | Identificador único |
| `correo` | VARCHAR(150) | Credencial de acceso y canal de notificación |
| `contrasena_hash` | VARCHAR(255) | Hash bcrypt de la contraseña |
| `roles` | ENUM[] | `paciente`, `fisioterapeuta`, `recepcionista`, `administrador`, `contador`, `director` |
| `estado` | ENUM | `activo`, `inactivo`, `suspendido` |
| `fecha_creacion` | TIMESTAMP | Auditoría de creación |
| `ultimo_acceso` | TIMESTAMP | Detección de cuentas inactivas |
| `persona_id` | UUID (FK → personas) | Persona física vinculada |

---

### 3.2 `personas`

Datos personales comunes de todos los individuos. Normalización para evitar duplicidad.

| Atributo | Tipo | Descripción |
|---|---|---|
| `id` | UUID (PK) | Identificador único |
| `nombre` | VARCHAR(100) | Nombre |
| `apellido` | VARCHAR(100) | Apellido |
| `ci` | VARCHAR(20) | Cédula de identidad |
| `telefono` | VARCHAR(20) | Contacto directo |

---

### 3.3 `pacientes`

Entidad clínica central. Hereda de `personas` mediante FK. Ancla de historial, evaluaciones y sesiones.

| Atributo | Tipo | Descripción |
|---|---|---|
| `id` | UUID (PK) | Identificador único |
| `persona_id` | UUID (FK → personas) | Relación 1:1 con datos base |
| `fecha_nacimiento` | DATE | Fecha de nacimiento |
| `direccion` | TEXT | Ubicación del paciente |
| `sexo` | ENUM | `masculino`, `femenino`, `otro` |
| `estado` | ENUM | `activo`, `inactivo`, `alta_medica` |
| `fecha_registro` | TIMESTAMP | Auditoría de ingreso |

---

### 3.4 `evaluaciones_iniciales`

Primera valoración clínica. Contiene las tres categorías de clasificación (semáforo, trabajo, enfermedad).

| Atributo | Tipo | Descripción |
|---|---|---|
| `id` | UUID (PK) | Identificador único |
| `paciente_id` | UUID (FK → pacientes) | Paciente evaluado |
| `empleado_id` | UUID | Fisioterapeuta que evaluó (referencia a `gestion-administrativa`) |
| `fecha_evaluacion` | TIMESTAMP | Fecha y hora |
| `categoria_semaforo` | ENUM | `rojo`, `amarillo`, `verde` |
| `justificacion_semaforo` | TEXT | Justificación clínica |
| `categoria_trabajo` | ENUM | `superior`, `extremidad_superior`, `torax_cintura`, `extremidad_inferior` |
| `categoria_enfermedad` | ENUM | `paralisis_facial`, `discapacidad_motora`, `cadera_desalineada`, `espalda_desviada`, `lesion_brazo`, `lesion_pierna`, `lesion_pie`, `obesidad`, `post_acv`, `otro` |
| `descripcion_enfermedad` | TEXT | Detalle clínico adicional |
| `tiempo_sesion_minutos` | INTEGER | Derivado de la categoría semáforo (45, 90 o 120 min) |
| `frecuencia_sesion` | ENUM | `diaria`, `semanal`, `mensual` |
| `observaciones` | TEXT | Notas del fisioterapeuta |
| `es_vigente` | BOOLEAN | Si es la evaluación activa |

---

### 3.5 `planes_tratamientos`

Conjunto de ejercicios y directrices terapéuticas tras la evaluación inicial.

| Atributo | Tipo | Descripción |
|---|---|---|
| `id` | UUID (PK) | Identificador único |
| `paciente_id` | UUID (FK → pacientes) | Paciente del plan |
| `evaluacion_inicial_id` | UUID (FK → evaluaciones_iniciales) | Evaluación que originó el plan |
| `empleado_id` | UUID | Profesional que diseñó el plan |
| `fecha_inicio` | DATE | Inicio de vigencia |
| `fecha_fin_estimada` | DATE | Fecha estimada de alta (predicción ML) |
| `objetivo_terapeutico` | TEXT | Meta clínica |
| `estado` | ENUM | `activo`, `completado`, `suspendido` |
| `observaciones` | TEXT | Indicaciones adicionales |

---

### 3.6 `ejercicios`

Catálogo de ejercicios terapéuticos disponibles.

| Atributo | Tipo | Descripción |
|---|---|---|
| `id` | UUID (PK) | Identificador único |
| `nombre` | VARCHAR(100) | Nombre del ejercicio |
| `descripcion` | TEXT | Instrucciones de ejecución |
| `categoria_trabajo` | ENUM | Zona corporal aplicable |
| `repeticiones_sugeridas` | INTEGER | Repeticiones base |
| `duracion_segundos` | INTEGER | Duración si es por tiempo |
| `url_video_referencia` | VARCHAR(500) | Ruta en S3 del video de referencia |
| `nivel_dificultad` | ENUM | `bajo`, `medio`, `alto` |

---

### 3.7 `planes_ejercicios` *(tabla de relación)*

Relaciona un plan de tratamiento con ejercicios, con parámetros personalizados.

| Atributo | Tipo | Descripción |
|---|---|---|
| `id` | UUID (PK) | Identificador único |
| `plan_tratamiento_id` | UUID (FK → planes_tratamientos) | Plan al que pertenece |
| `ejercicio_id` | UUID (FK → ejercicios) | Ejercicio asignado |
| `repeticiones` | INTEGER | Repeticiones personalizadas |
| `series` | INTEGER | Número de series |
| `frecuencia` | ENUM | `diaria`, `interdiaria`, `semanal` |
| `orden` | INTEGER | Orden de ejecución |
| `activo` | BOOLEAN | Permite desactivar sin eliminar |

---

### 3.8 `citas`

Agendamiento de sesiones presenciales (recepción o flujo WhatsApp).

| Atributo | Tipo | Descripción |
|---|---|---|
| `id` | UUID (PK) | Identificador único |
| `paciente_id` | UUID (FK → pacientes) | Paciente que asiste |
| `empleado_id` | UUID | Fisioterapeuta que atenderá |
| `fecha_hora` | TIMESTAMP | Fecha y hora exacta |
| `duracion_minutos` | INTEGER | Derivada de categoría semáforo |
| `tipo` | ENUM | `primera_vez`, `seguimiento`, `control` |
| `origen` | ENUM | `recepcion`, `whatsapp`, `sistema` |
| `estado` | ENUM | `programada`, `confirmada`, `asistida`, `cancelada`, `reprogramada` |
| `observaciones` | TEXT | Notas al agendar |
| `fecha_creacion` | TIMESTAMP | Auditoría de creación |

---

### 3.9 `sesiones`

Registro de sesiones presenciales ejecutadas. Contiene evolución clínica.

| Atributo | Tipo | Descripción |
|---|---|---|
| `id` | UUID (PK) | Identificador único |
| `cita_id` | UUID (FK → citas) | Cita que originó la sesión |
| `paciente_id` | UUID (FK → pacientes) | Paciente atendido |
| `empleado_id` | UUID | Fisioterapeuta que condujo la sesión |
| `fecha_hora_inicio` | TIMESTAMP | Inicio real |
| `fecha_hora_fin` | TIMESTAMP | Fin real |
| `observaciones_clinicas` | TEXT | Notas de evolución |
| `nivel_dolor_reportado` | INTEGER | Escala 0–10 al inicio |
| `nivel_dolor_post` | INTEGER | Escala 0–10 al finalizar |
| `estado_sesion` | ENUM | `abierta`, `cerrada`, `firmada` |
| `url_documento_firmado` | VARCHAR(500) | Ruta en S3 del documento firmado |
| `hash_blockchain` | VARCHAR(255) | Hash de `blockchain-firmas` |

---

### 3.10 `sesiones_domiciliarias`

Sesiones de ejercicio realizadas en casa con asistencia de Deep Learning.

| Atributo | Tipo | Descripción |
|---|---|---|
| `id` | UUID (PK) | Identificador único |
| `paciente_id` | UUID (FK → pacientes) | Paciente que realizó la sesión |
| `plan_ejercicio_id` | UUID (FK → planes_ejercicios) | Ejercicio específico realizado |
| `fecha_hora` | TIMESTAMP | Cuándo se realizó |
| `repeticiones_completadas` | INTEGER | Conteo automático por Deep Learning |
| `puntuacion` | INTEGER | Puntuación 0–100 por calidad de ejecución |
| `xp_ganado` | INTEGER | Puntos de experiencia (gamificación) |
| `correcciones_emitidas` | TEXT | JSON con correcciones posturales detectadas |
| `url_video` | VARCHAR(500) | Ruta en S3 del video (opcional) |
| `analizado_por_ia` | BOOLEAN | `true` = servidor, `false` = on-device (TFLite) |

---

## 4. Módulos del Subsistema

Este subsistema cubre **6 módulos** del levantamiento de requisitos:

| # | Módulo | Descripción |
|---|---|---|
| 1 | Gestión de Usuarios | Ciclo de vida de todos los actores: registro, edición, roles, permisos |
| 2 | Gestión de Citas | Agendamiento manual (recepción) y automatizado (WhatsApp/n8n) |
| 3 | Gestión Clínica y Evaluación Inicial | Evaluación con 3 categorías, historial clínico, plan de tratamiento, alta médica |
| 4 | Gestión de Sesiones | Control de sesiones presenciales: apertura, ejercicios, evolución, cierre y firma |
| 5 | Ejercicios Domiciliarios con IA (App Móvil) | Plan de ejercicios, análisis postural con Deep Learning, conteo de repeticiones, gamificación |
| 6 | Citas y Sesiones del Paciente (App Móvil) | Consulta de citas, historial de sesiones, frecuencia programada, notificaciones push |

---

## 5. Casos de Uso Involucrados

### Módulo 1 — Gestión de Usuarios

| ID | Caso de Uso | Actor Principal |
|---|---|---|
| CU-01 | Registrar paciente | Recepcionista / n8n |
| CU-03 | Editar datos personales del usuario | Usuario autenticado |
| CU-04 | Consultar perfil de usuario | Usuario autenticado |
| CU-05 | Inactivar o dar de baja usuario | Administrador |
| CU-06 | Buscar usuario por criterios (nombre, CI, teléfono) | Recepcionista / Administrador |
| CU-07 | Gestionar roles y permisos de acceso | Administrador |

### Módulo 2 — Gestión de Citas

| ID | Caso de Uso | Actor Principal |
|---|---|---|
| CU-08 | Agendar cita desde recepción | Recepcionista |
| CU-09 | Solicitar primera cita por WhatsApp (automatizado) | Paciente / n8n |
| CU-11 | Consultar disponibilidad de horarios | Recepcionista / n8n |
| CU-12 | Confirmar cita y enviar comprobante por Gmail | Sistema (n8n) |
| CU-13 | Cancelar o reprogramar cita | Recepcionista / Paciente |
| CU-14 | Consultar agenda del fisioterapeuta (web) | Fisioterapeuta |
| CU-15 | Recibir recordatorio de cita por push y Gmail | Sistema (n8n) |

### Módulo 3 — Gestión Clínica y Evaluación Inicial

| ID | Caso de Uso | Actor Principal |
|---|---|---|
| CU-16 | Registrar evaluación inicial del paciente | Fisioterapeuta |
| CU-17 | Asignar categoría semáforo (Rojo / Amarillo / Verde) | Fisioterapeuta |
| CU-18 | Asignar categoría de trabajo (zona corporal) | Fisioterapeuta |
| CU-19 | Asignar categoría de enfermedad / situación clínica | Fisioterapeuta |
| CU-20 | Definir frecuencia de sesiones según evaluación | Fisioterapeuta |
| CU-21 | Asignar plan de tratamiento con ejercicios personalizados | Fisioterapeuta |
| CU-22 | Registrar evolución del paciente por sesión | Fisioterapeuta |
| CU-23 | Consultar historial clínico completo | Fisioterapeuta |
| CU-24 | Generar reporte clínico de progreso | Fisioterapeuta |
| CU-25 | Registrar alta médica del paciente | Fisioterapeuta |
| CU-26 | Actualizar categoría de semáforo según avance | Fisioterapeuta |

### Módulo 4 — Gestión de Sesiones

| ID | Caso de Uso | Actor Principal |
|---|---|---|
| CU-27 | Abrir sesión de fisioterapia | Fisioterapeuta |
| CU-28 | Registrar ejercicios ejecutados en sesión | Fisioterapeuta |
| CU-29 | Anotar observaciones clínicas del fisioterapeuta | Fisioterapeuta |
| CU-30 | Cerrar y firmar sesión | Fisioterapeuta |
| CU-31 | Consultar sesiones anteriores del paciente | Fisioterapeuta |

### Módulo 5 — Ejercicios Domiciliarios con IA (App Móvil)

| ID | Caso de Uso | Actor Principal |
|---|---|---|
| CU-32 | Consultar plan de ejercicios domiciliarios asignado | Paciente |
| CU-33 | Iniciar ejercicio con análisis postural en tiempo real | Paciente |
| CU-34 | Recibir corrección postural inmediata por Deep Learning | Paciente / IA |
| CU-35 | Contabilizar repeticiones automáticamente | Paciente / IA |
| CU-36 | Registrar sesión domiciliaria completada | Paciente |
| CU-37 | Recibir resumen de sesión (puntos, XP, rachas) | Paciente |

### Módulo 6 — Citas y Sesiones del Paciente (App Móvil)

| ID | Caso de Uso | Actor Principal |
|---|---|---|
| CU-38 | Consultar próximas citas programadas | Paciente |
| CU-39 | Ver frecuencia de sesiones asignada | Paciente |
| CU-40 | Consultar historial de sesiones y evolución clínica | Paciente |
| CU-41 | Recibir notificación push de recordatorio de cita | Paciente |
| CU-42 | Consultar detalles de sesión individual | Paciente |

---

## 6. Historias de Usuario

### Módulo 1 — Gestión de Usuarios

**HU-01** — Como **recepcionista**, quiero registrar un nuevo paciente ingresando sus datos personales (nombre, apellido, CI, teléfono, fecha de nacimiento, dirección), para que quede habilitado en el sistema y pueda agendar su primera cita.

**HU-02** — Como **administrador**, quiero editar los datos personales de cualquier usuario del sistema, para mantener la información actualizada cuando un paciente o empleado lo solicite.

**HU-03** — Como **administrador**, quiero inactivar o dar de baja a un usuario, para que no pueda acceder al sistema sin eliminarlo permanentemente de la base de datos.

**HU-04** — Como **recepcionista**, quiero buscar usuarios por nombre, CI o teléfono, para ubicar rápidamente al paciente cuando se presente en el centro o llame.

**HU-05** — Como **administrador**, quiero asignar y modificar roles de acceso a cada usuario (paciente, fisioterapeuta, recepcionista, administrador, contador, director), para que cada actor solo acceda a las funcionalidades que le corresponden.

### Módulo 2 — Gestión de Citas

**HU-06** — Como **recepcionista**, quiero agendar una cita seleccionando al paciente, al fisioterapeuta disponible, la fecha y la hora, para garantizar que el paciente sea atendido en el horario correcto.

**HU-07** — Como **paciente**, quiero solicitar mi primera cita a través de WhatsApp respondiendo las preguntas del flujo automatizado, para registrarme y agendar sin necesidad de ir presencialmente al centro.

**HU-08** — Como **recepcionista**, quiero consultar los horarios disponibles de cada fisioterapeuta, para ofrecer al paciente las opciones reales de agendamiento.

**HU-09** — Como **recepcionista**, quiero cancelar o reprogramar una cita existente, para ajustar la agenda cuando el paciente lo solicite.

**HU-10** — Como **fisioterapeuta**, quiero consultar mi agenda del día y de la semana, para planificar mi carga de trabajo y preparar las sesiones.

### Módulo 3 — Gestión Clínica y Evaluación Inicial

**HU-11** — Como **fisioterapeuta**, quiero registrar la evaluación inicial del paciente asignando las tres categorías (semáforo, zona de trabajo y enfermedad), para que el sistema calcule automáticamente el tiempo de sesión y la frecuencia recomendada.

**HU-12** — Como **fisioterapeuta**, quiero diseñar un plan de tratamiento seleccionando ejercicios del catálogo y personalizando las repeticiones, series y frecuencia para cada uno, para que el paciente tenga un programa adaptado a su condición.

**HU-13** — Como **fisioterapeuta**, quiero consultar el historial clínico completo de un paciente (evaluaciones, sesiones, evolución, niveles de dolor), para tomar decisiones informadas durante la consulta.

**HU-14** — Como **fisioterapeuta**, quiero actualizar la categoría semáforo de un paciente cuando su estado clínico mejore o empeore, para que la frecuencia de sesiones se ajuste a su condición actual.

**HU-15** — Como **fisioterapeuta**, quiero registrar el alta médica de un paciente cuando haya completado su tratamiento exitosamente, para cerrar su ciclo clínico en el sistema.

### Módulo 4 — Gestión de Sesiones

**HU-16** — Como **fisioterapeuta**, quiero abrir una sesión presencial vinculada a una cita, para registrar los ejercicios realizados, el nivel de dolor y las observaciones clínicas durante la atención.

**HU-17** — Como **fisioterapeuta**, quiero cerrar y firmar digitalmente la sesión al finalizar la atención, para que el registro quede inmutable y trazable con Blockchain.

**HU-18** — Como **fisioterapeuta**, quiero consultar las sesiones anteriores de un paciente, para comparar su evolución y ajustar el tratamiento si es necesario.

### Módulo 5 — Ejercicios Domiciliarios con IA (App Móvil)

**HU-19** — Como **paciente**, quiero ver el plan de ejercicios que me asignó mi fisioterapeuta desde la app móvil, para saber qué ejercicios debo realizar hoy en casa.

**HU-20** — Como **paciente**, quiero activar la cámara de mi teléfono y que el sistema analice mi postura en tiempo real mientras hago un ejercicio, para recibir correcciones inmediatas como "Baja más la cadera" o "No subas el hombro".

**HU-21** — Como **paciente**, quiero que el sistema cuente automáticamente mis repeticiones mediante análisis de movimiento, para no tener que contar manualmente y concentrarme en la ejecución correcta.

**HU-22** — Como **paciente**, quiero recibir al finalizar un resumen de mi sesión domiciliaria (puntuación, XP ganados, racha de días), para motivarme a continuar con el tratamiento.

**HU-23** — Como **paciente**, quiero poder realizar mis ejercicios sin conexión a internet usando el modelo TensorFlow Lite en mi dispositivo, para que la sesión se sincronice cuando recupere la conexión.

### Módulo 6 — Citas y Sesiones del Paciente (App Móvil)

**HU-24** — Como **paciente**, quiero consultar mis próximas citas programadas desde la app móvil, para saber cuándo debo asistir al centro.

**HU-25** — Como **paciente**, quiero ver la frecuencia de sesiones que me asignó el fisioterapeuta (diaria, semanal, mensual), para entender mi plan de tratamiento.

**HU-26** — Como **paciente**, quiero consultar mi historial de sesiones asistidas y mi evolución clínica, para ver cómo he progresado en mi rehabilitación.

**HU-27** — Como **paciente**, quiero recibir una notificación push de recordatorio antes de cada cita programada, para no olvidar asistir al centro.

---

## 7. Integraciones con Otros Microservicios

| Microservicio | Tipo de Comunicación | Propósito |
|---|---|---|
| `puerta-enlace` | GraphQL (federado) | Punto de entrada único. Valida JWT y enruta peticiones |
| `ia-analisis-pose` | REST interno | Recibe video/frames y devuelve análisis postural, esqueleto articular y correcciones |
| `blockchain-firmas` | REST interno | Recibe documento, calcula hash SHA-256 y lo registra en Ethereum Sepolia |
| `gestion-administrativa` | Referencia por ID (sin FK directa) | `empleado_id` referencia a la tabla `empleados` en el otro microservicio |
| `bi-automatizacion` | Eventos / REST | Publica eventos clínicos (sesión completada, alta médica) para KPIs de BI |

---

## 8. Módulos NestJS Existentes en el Proyecto

```text
src/
├── pacientes/
├── personas/
├── usuarios/
├── evaluaciones_inniciales/
├── planes_tratamientos/
├── ejercicios/
├── planes_ejercicios/
├── citas/
├── sesiones/
├── sesiones_docmiciliarias/
├── app.module.ts
└── main.ts
```

Cada carpeta fue generada con `nest g res <nombre>` usando GraphQL (Code First) con CRUD.

---

## 9. Variables de Entorno Requeridas

```env
# Servidor
PORT=3000
NODE_ENV=development
JWT_SECRET=<secreto-seguro>
BASE_URL=http://localhost:3000

# PostgreSQL
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=<contraseña>
DATABASE_NAME=uagrm_db
DATABASE_SSL=false

# AWS S3
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=<clave>
AWS_SECRET_ACCESS_KEY=<secreto>
AWS_S3_BUCKET_NAME=<nombre-bucket>
```

---

*Documento elaborado para la asignatura INF 423 — Ingeniería de Software II*  
*Facultad de Ciencias de la Computación y Telecomunicaciones — UAGRM*
