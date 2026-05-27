import { RolUsuario } from '../../enums';

/**
 * Datos que este microservicio devuelve al gateway tras validar credenciales.
 * El gateway usa estos campos para construir y firmar el JWT.
 */
export class UsuarioAutenticadoDto {
  usuarioId: number;
  correo: string;
  roles: RolUsuario[];
  personaId?: number;
  nombre?: string;
  apellido?: string;
}
