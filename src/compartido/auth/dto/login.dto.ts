import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/** Credenciales que el gateway envía para validar un intento de login */
export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @IsString()
  @IsNotEmpty()
  contrasena: string;
}
