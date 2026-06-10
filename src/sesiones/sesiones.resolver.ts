import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SesionesService } from './sesiones.service';
import { Sesiones } from './entities/sesione.entity';
import { CreateSesioneInput } from './dto/create-sesione.input';
import { UpdateSesioneInput } from './dto/update-sesione.input';

@Resolver(() => Sesiones)
export class SesionesResolver {
  constructor(private readonly service: SesionesService) {}

  @Mutation(() => Sesiones, { description: 'Crea una sesión de fisioterapia vinculada a un plan de tratamiento' })
  crearSesiones(
    @Args('datos') datos: CreateSesioneInput,
  ): Promise<Sesiones> {
    return this.service.crearSesiones(datos);
  }

  @Query(() => [Sesiones], { name: 'listarSesiones', description: 'Retorna todas las sesiones en el sistema' })
  listarSesiones(): Promise<Sesiones[]> {
    return this.service.listarSesiones();
  }

  @Query(() => [Sesiones], { name: 'listarSesionesPorEmpleado', description: 'Retorna las sesiones asignadas a un fisioterapeuta específico' })
  listarSesionesPorEmpleado(
    @Args('empleadoId', { type: () => Int }) empleadoId: number,
  ): Promise<Sesiones[]> {
    return this.service.listarSesionesPorEmpleado(empleadoId);
  }

  @Query(() => [Sesiones], { name: 'listarSesionesPorPaciente', description: 'Retorna el historial de sesiones de un paciente' })
  listarSesionesPorPaciente(
    @Args('pacienteId', { type: () => Int }) pacienteId: number,
  ): Promise<Sesiones[]> {
    return this.service.listarSesionesPorPaciente(pacienteId);
  }

  @Query(() => [Sesiones], { name: 'listarSesionesPorPlan', description: 'Retorna todas las sesiones de un plan de tratamiento' })
  listarSesionesPorPlan(
    @Args('planTratamientoId', { type: () => Int }) planTratamientoId: number,
  ): Promise<Sesiones[]> {
    return this.service.listarSesionesPorPlan(planTratamientoId);
  }

  @Query(() => [Sesiones], { name: 'listarSesionesPorMensualidad', description: 'Retorna las sesiones cubiertas por una mensualidad' })
  listarSesionesPorMensualidad(
    @Args('mensualidadId', { type: () => Int }) mensualidadId: number,
  ): Promise<Sesiones[]> {
    return this.service.listarSesionesPorMensualidad(mensualidadId);
  }

  @Query(() => Sesiones, { name: 'verSesion', description: 'Busca una sesión por su ID' })
  verSesion(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Sesiones> {
    return this.service.verSesion(id);
  }

  @Mutation(() => Sesiones, { description: 'Actualiza datos clínicos de una sesión (solo fisioterapeuta, rechaza sesiones cerradas)' })
  editarSesion(
    @Args('datos') datos: UpdateSesioneInput,
  ): Promise<Sesiones> {
    return this.service.editarSesion(datos);
  }

  @Mutation(() => Sesiones, { description: 'Asigna o reasigna un fisioterapeuta a una sesión (recepcionista / administrador)' })
  asignarFisioterapeuta(
    @Args('id', { type: () => Int }) id: number,
    @Args('empleadoId', { type: () => Int }) empleadoId: number,
  ): Promise<Sesiones> {
    return this.service.asignarFisioterapeuta(id, empleadoId);
  }

  @Mutation(() => Sesiones, { description: 'Inicia una sesión HABILITADA: cambia a ABIERTA y registra hora de inicio' })
  iniciarSesion(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Sesiones> {
    return this.service.iniciarSesion(id);
  }

  @Mutation(() => Sesiones, { description: 'Cierra una sesión ABIERTA: cambia a CERRADA y registra hora de fin' })
  cerrarSesion(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Sesiones> {
    return this.service.cerrarSesion(id);
  }

  @Mutation(() => Sesiones, { description: 'Cierra una sesión registrando el hash de firma digital (MS-6)' })
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
