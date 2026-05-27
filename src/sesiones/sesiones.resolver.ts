import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SesionesService } from './sesiones.service';
import { Sesiones } from './entities/sesione.entity';
import { CreateSesioneInput } from './dto/create-sesione.input';
import { UpdateSesioneInput } from './dto/update-sesione.input';

@Resolver(() => Sesiones)
export class SesionesResolver {
  constructor(private readonly service: SesionesService) {}

  @Mutation(() => Sesiones, { description: 'Abre una sesión de fisioterapia vinculada a una cita' })
  crearSesiones(
    @Args('datos') datos: CreateSesioneInput,
  ): Promise<Sesiones> {
    return this.service.crearSesiones(datos);
  }

  @Query(() => [Sesiones], { name: 'listarSesiones', description: 'Retorna todas las sesiones en el sistema' })
  listarSesiones(): Promise<Sesiones[]> {
    return this.service.listarSesiones();
  }

  @Query(() => [Sesiones], { name: 'listarSesionesPorPaciente', description: 'Retorna el historial de sesiones de un paciente' })
  listarSesionesPorPaciente(
    @Args('pacienteId', { type: () => Int }) pacienteId: number,
  ): Promise<Sesiones[]> {
    return this.service.listarSesionesPorPaciente(pacienteId);
  }

  @Query(() => Sesiones, { name: 'verSesion', description: 'Busca una sesión por su ID' })
  verSesion(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Sesiones> {
    return this.service.verSesion(id);
  }

  @Mutation(() => Sesiones, { description: 'Actualiza los datos (observaciones, dolor) de una sesión' })
  editarSesion(
    @Args('datos') datos: UpdateSesioneInput,
  ): Promise<Sesiones> {
    return this.service.editarSesion(datos);
  }

  @Mutation(() => Sesiones, { description: 'Cierra una sesión registrando el hash de firma digital' })
  cerrarYFirmarSesion(
    @Args('id', { type: () => Int }) id: number,
    @Args('urlDocumento') urlDocumento: string,
    @Args('hashBlockchain') hashBlockchain: string,
  ): Promise<Sesiones> {
    return this.service.cerrarYFirmarSesion(id, urlDocumento, hashBlockchain);
  }

  @Mutation(() => Sesiones, { description: 'Elimina una sesión del sistema' })
  eliminarSesion(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Sesiones> {
    return this.service.eliminarSesion(id);
  }
}
