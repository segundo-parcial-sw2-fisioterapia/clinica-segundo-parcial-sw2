import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/** Payload que envía n8n para registrar un paciente desde el flujo WhatsApp */
export class RegistrarPacienteN8nDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellido: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  ci: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  telefono: string;

  @IsOptional()
  @IsString()
  fecha_nacimiento?: string;

  @IsOptional()
  @IsString()
  direccion?: string;
}
