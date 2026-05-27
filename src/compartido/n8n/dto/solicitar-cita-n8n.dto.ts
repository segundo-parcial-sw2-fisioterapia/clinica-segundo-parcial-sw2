import { IsDateString, IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';

/** Payload que envía n8n para agendar una cita desde WhatsApp */
export class SolicitarCitaN8nDto {
  @IsInt()
  pacienteId: number;

  @IsInt()
  empleadoId: number;

  /** Fecha y hora en formato ISO 8601: "2025-06-01T10:00:00" */
  @IsDateString()
  @IsNotEmpty()
  fecha_hora: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
