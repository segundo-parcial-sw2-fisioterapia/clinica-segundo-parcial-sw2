import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UsuariosService } from './usuarios.service';
import { Usuarios } from './entities/usuario.entity';
import { CreateUsuarioInput } from './dto/create-usuario.input';
import { UpdateUsuarioInput } from './dto/update-usuario.input';

@Resolver(() => Usuarios)
export class UsuariosResolver {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Mutation(() => Usuarios, { description: 'Crea un nuevo usuario del sistema con contraseña hasheada' })
  crearUsuarios(
    @Args('datos') datos: CreateUsuarioInput,
  ): Promise<Usuarios> {
    return this.usuariosService.crearUsuarios(datos);
  }

  @Query(() => [Usuarios], { name: 'listarUsuarios', description: 'Retorna todos los usuarios del sistema' })
  listarUsuarios(): Promise<Usuarios[]> {
    return this.usuariosService.listarUsuarios();
  }

  @Query(() => Usuarios, { name: 'verUsuario', description: 'Busca un usuario por su ID' })
  verUsuario(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Usuarios> {
    return this.usuariosService.verUsuario(id);
  }

  @Mutation(() => Usuarios, { description: 'Actualiza los datos de un usuario (roles, estado, contraseña)' })
  editarUsuario(
    @Args('datos') datos: UpdateUsuarioInput,
  ): Promise<Usuarios> {
    return this.usuariosService.editarUsuario(datos);
  }

  @Mutation(() => Usuarios, { description: 'Cambia el estado del usuario a INACTIVO sin eliminarlo' })
  inactivarUsuario(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Usuarios> {
    return this.usuariosService.inactivarUsuario(id);
  }

  @Mutation(() => Usuarios, { description: 'Elimina definitivamente un usuario del sistema' })
  eliminarUsuario(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Usuarios> {
    return this.usuariosService.eliminarUsuario(id);
  }
}
