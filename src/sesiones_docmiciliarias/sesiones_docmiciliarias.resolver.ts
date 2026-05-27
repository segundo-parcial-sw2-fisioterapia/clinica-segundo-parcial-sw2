import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SesionesDocmiciliariasService } from './sesiones_docmiciliarias.service';
import { SesionesDomiciliarias } from './entities/sesiones_docmiciliaria.entity';
import { CreateSesionesDocmiciliariaInput } from './dto/create-sesiones_docmiciliaria.input';
import { UpdateSesionesDocmiciliariaInput } from './dto/update-sesiones_docmiciliaria.input';

@Resolver(() => SesionesDomiciliarias)
export class SesionesDocmiciliariasResolver {
  constructor(private readonly service: SesionesDocmiciliariasService) {}

  @Mutation(() => SesionesDomiciliarias, { description: 'Registra una sesión domiciliaria completada por el paciente' })
  crearSesionesDomiciliarias(
    @Args('datos') datos: CreateSesionesDocmiciliariaInput,
  ): Promise<SesionesDomiciliarias> {
    return this.service.crearSesionesDomiciliarias(datos);
  }

  @Query(() => [SesionesDomiciliarias], { name: 'listarSesionesDomiciliarias', description: 'Retorna todas las sesiones domiciliarias registradas' })
  listarSesionesDomiciliarias(): Promise<SesionesDomiciliarias[]> {
    return this.service.listarSesionesDomiciliarias();
  }

  @Query(() => [SesionesDomiciliarias], { name: 'listarSesionesDomiciliariasPorPaciente', description: 'Retorna el historial de sesiones domiciliarias de un paciente' })
  listarSesionesDomiciliariasPorPaciente(
    @Args('pacienteId', { type: () => Int }) pacienteId: number,
  ): Promise<SesionesDomiciliarias[]> {
    return this.service.listarSesionesDomiciliariasPorPaciente(pacienteId);
  }

  @Query(() => SesionesDomiciliarias, { name: 'verSesionDomiciliaria', description: 'Busca una sesión domiciliaria por su ID' })
  verSesionDomiciliaria(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<SesionesDomiciliarias> {
    return this.service.verSesionDomiciliaria(id);
  }

  @Mutation(() => SesionesDomiciliarias, { description: 'Actualiza los datos de una sesión domiciliaria' })
  editarSesionDomiciliaria(
    @Args('datos') datos: UpdateSesionesDocmiciliariaInput,
  ): Promise<SesionesDomiciliarias> {
    return this.service.editarSesionDomiciliaria(datos);
  }

  @Mutation(() => SesionesDomiciliarias, { description: 'Elimina una sesión domiciliaria del sistema' })
  eliminarSesionDomiciliaria(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<SesionesDomiciliarias> {
    return this.service.eliminarSesionDomiciliaria(id);
  }
}
