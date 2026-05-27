import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuarios } from './entities/usuario.entity';
import { Personas } from '../personas/entities/persona.entity';
import { CreateUsuarioInput } from './dto/create-usuario.input';
import { UpdateUsuarioInput } from './dto/update-usuario.input';
import { EstadoUsuario } from '../compartido/enums';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuarios)
    private readonly usuariosRepository: Repository<Usuarios>,
  ) {}

  /**
   * Crea un nuevo usuario, hasheando la contraseña con bcrypt.
   *
   * @param datos - Datos del usuario, incluye contraseña en texto plano.
   * @returns El usuario creado (sin el hash de contraseña en GraphQL).
   * @throws ConflictException si el correo ya está registrado.
   */
  async crearUsuarios(datos: CreateUsuarioInput): Promise<Usuarios> {
    const existe = await this.usuariosRepository.findOne({
      where: { correo: datos.correo },
    });
    if (existe) throw new ConflictException(`El correo ${datos.correo} ya está registrado`);

    const contrasena_hash = await bcrypt.hash(datos.contrasena, 10);
    const usuario = this.usuariosRepository.create({
      correo: datos.correo,
      contrasena_hash,
      roles: datos.roles,
      estado: datos.estado ?? EstadoUsuario.ACTIVO,
      persona: { id: datos.personaId } as Personas,
    });
    return this.usuariosRepository.save(usuario);
  }


  /**
   * Retorna el listado completo de usuarios con su persona vinculada.
   *
   * @returns Lista de usuarios.
   */
  async listarUsuarios(): Promise<Usuarios[]> {
    return this.usuariosRepository.find();
  }

  /**
   * Busca un usuario por su identificador único.
   *
   * @param id - ID del usuario.
   * @returns El usuario encontrado con su persona.
   * @throws NotFoundException si el usuario no existe.
   */
  async verUsuario(id: number): Promise<Usuarios> {
    const usuario = await this.usuariosRepository.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    return usuario;
  }

  /**
   * Busca un usuario por su correo electrónico.
   *
   * @param correo - Correo del usuario.
   * @returns El usuario encontrado o null.
   */
  async verUsuarioPorCorreo(correo: string): Promise<Usuarios | null> {
    return this.usuariosRepository.findOne({ where: { correo } });
  }

  /**
   * Actualiza datos del usuario. Si se incluye una nueva contraseña, la hashea.
   *
   * @param datos - Campos a actualizar, incluye el id.
   * @returns El usuario actualizado.
   */
  async editarUsuario(datos: UpdateUsuarioInput): Promise<Usuarios> {
    const { id, contrasena, ...campos } = datos;
    await this.verUsuario(id);

    const actualizacion: Partial<Usuarios> = { ...campos };
    if (contrasena) {
      actualizacion.contrasena_hash = await bcrypt.hash(contrasena, 10);
    }

    await this.usuariosRepository.update(id, actualizacion);
    return this.verUsuario(id);
  }

  /**
   * Inactiva un usuario cambiando su estado a INACTIVO.
   *
   * @param id - ID del usuario.
   * @returns El usuario con estado actualizado.
   */
  async inactivarUsuario(id: number): Promise<Usuarios> {
    await this.verUsuario(id);
    await this.usuariosRepository.update(id, { estado: EstadoUsuario.INACTIVO });
    return this.verUsuario(id);
  }

  /**
   * Elimina un usuario del sistema de forma permanente.
   *
   * @param id - ID del usuario a eliminar.
   * @returns El usuario eliminado.
   */
  async eliminarUsuario(id: number): Promise<Usuarios> {
    const usuario = await this.verUsuario(id);
    await this.usuariosRepository.delete(id);
    return usuario;
  }
}
