import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Usuarios } from '../../usuarios/entities/usuario.entity';

/**
 * Endpoint REST interno para validación de credenciales.
 * Consumido exclusivamente por el gateway (puerta-enlace) para
 * verificar usuario/contraseña antes de emitir el JWT.
 *
 * Ruta completa: POST /api/auth/login
 */
@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Valida las credenciales recibidas del gateway.
   * Retorna los datos del usuario para que el gateway firme el JWT.
   * Devuelve 401 si las credenciales son incorrectas o el usuario está inactivo.
   *
   * POST /api/auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() datos: LoginDto): Promise<Usuarios> {
    return this.authService.validarCredenciales(datos);
  }
}

