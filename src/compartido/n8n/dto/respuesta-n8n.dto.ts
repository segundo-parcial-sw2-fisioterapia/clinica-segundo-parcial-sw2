/** Respuesta estándar devuelta a n8n en todas las operaciones */
export class RespuestaN8nDto {
  exito: boolean;
  mensaje: string;
  datos?: Record<string, any>;
}
