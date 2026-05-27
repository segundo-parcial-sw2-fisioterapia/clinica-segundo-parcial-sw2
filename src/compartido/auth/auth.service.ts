import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuarios } from '../../usuarios/entities/usuario.entity';
import { EstadoUsuario } from '../enums';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuarios)
    private readonly usuariosRepository: Repository<Usuarios>,
  ) {}

  /**
   * Valida las credenciales del usuario y retorna sus datos para que
   * el gateway pueda construir y firmar el JWT.
   *
   * @param datos - Correo y contraseña en texto plano.
   * @returns Datos del usuario autenticado (incluyendo relación persona).
   * @throws UnauthorizedException si las credenciales son incorrectas o el usuario está inactivo.
   */
  async validarCredenciales(datos: LoginDto): Promise<Usuarios> {
    const usuario = await this.usuariosRepository.findOne({
      where: { correo: datos.correo },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (usuario.estado !== EstadoUsuario.ACTIVO) {
      throw new UnauthorizedException(
        `El usuario está ${usuario.estado}. Contacte al administrador.`,
      );
    }

    const contrasenaValida = await bcrypt.compare(
      datos.contrasena,
      usuario.contrasena_hash,
    );

    if (!contrasenaValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Actualiza la marca de último acceso
    usuario.ultimo_acceso = new Date();
    await this.usuariosRepository.save(usuario);

    return usuario;
  }
}

