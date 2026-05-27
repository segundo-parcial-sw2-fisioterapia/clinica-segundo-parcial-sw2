import { registerEnumType } from '@nestjs/graphql';

export enum RolUsuario {
  PACIENTE = 'paciente',
  FISIOTERAPEUTA = 'fisioterapeuta',
  RECEPCIONISTA = 'recepcionista',
  ADMINISTRADOR = 'administrador',
  CONTADOR = 'contador',
  DIRECTOR = 'director',
}
registerEnumType(RolUsuario, { name: 'RolUsuario', description: 'Roles de acceso del sistema' });

export enum EstadoUsuario {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  SUSPENDIDO = 'suspendido',
}
registerEnumType(EstadoUsuario, { name: 'EstadoUsuario' });

export enum SexoPaciente {
  MASCULINO = 'masculino',
  FEMENINO = 'femenino',
  OTRO = 'otro',
}
registerEnumType(SexoPaciente, { name: 'SexoPaciente' });

export enum EstadoPaciente {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  ALTA_MEDICA = 'alta_medica',
}
registerEnumType(EstadoPaciente, { name: 'EstadoPaciente' });

export enum CategoriaSemaforo {
  ROJO = 'rojo',
  AMARILLO = 'amarillo',
  VERDE = 'verde',
}
registerEnumType(CategoriaSemaforo, { name: 'CategoriaSemaforo' });

export enum CategoriaTrabajo {
  SUPERIOR = 'superior',
  EXTREMIDAD_SUPERIOR = 'extremidad_superior',
  TORAX_CINTURA = 'torax_cintura',
  EXTREMIDAD_INFERIOR = 'extremidad_inferior',
}
registerEnumType(CategoriaTrabajo, { name: 'CategoriaTrabajo' });

export enum CategoriaEnfermedad {
  PARALISIS_FACIAL = 'paralisis_facial',
  DISCAPACIDAD_MOTORA = 'discapacidad_motora',
  CADERA_DESALINEADA = 'cadera_desalineada',
  ESPALDA_DESVIADA = 'espalda_desviada',
  LESION_BRAZO = 'lesion_brazo',
  LESION_PIERNA = 'lesion_pierna',
  LESION_PIE = 'lesion_pie',
  OBESIDAD = 'obesidad',
  POST_ACV = 'post_acv',
  OTRO = 'otro',
}
registerEnumType(CategoriaEnfermedad, { name: 'CategoriaEnfermedad' });

export enum FrecuenciaSesion {
  DIARIA = 'diaria',
  SEMANAL = 'semanal',
  MENSUAL = 'mensual',
}
registerEnumType(FrecuenciaSesion, { name: 'FrecuenciaSesion' });

export enum EstadoPlanTratamiento {
  ACTIVO = 'activo',
  COMPLETADO = 'completado',
  SUSPENDIDO = 'suspendido',
}
registerEnumType(EstadoPlanTratamiento, { name: 'EstadoPlanTratamiento' });

export enum NivelDificultadEjercicio {
  BAJO = 'bajo',
  MEDIO = 'medio',
  ALTO = 'alto',
}
registerEnumType(NivelDificultadEjercicio, { name: 'NivelDificultadEjercicio' });

export enum FrecuenciaPlanEjercicio {
  DIARIA = 'diaria',
  INTERDIARIA = 'interdiaria',
  SEMANAL = 'semanal',
}
registerEnumType(FrecuenciaPlanEjercicio, { name: 'FrecuenciaPlanEjercicio' });

export enum TipoCita {
  PRIMERA_VEZ = 'primera_vez',
  SEGUIMIENTO = 'seguimiento',
  CONTROL = 'control',
}
registerEnumType(TipoCita, { name: 'TipoCita' });

export enum OrigenCita {
  RECEPCION = 'recepcion',
  WHATSAPP = 'whatsapp',
  SISTEMA = 'sistema',
}
registerEnumType(OrigenCita, { name: 'OrigenCita' });

export enum EstadoCita {
  PROGRAMADA = 'programada',
  CONFIRMADA = 'confirmada',
  ASISTIDA = 'asistida',
  CANCELADA = 'cancelada',
  REPROGRAMADA = 'reprogramada',
}
registerEnumType(EstadoCita, { name: 'EstadoCita' });

export enum EstadoSesion {
  ABIERTA = 'abierta',
  CERRADA = 'cerrada',
  FIRMADA = 'firmada',
}
registerEnumType(EstadoSesion, { name: 'EstadoSesion' });
