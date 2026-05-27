import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PlanesTratamientosService } from './planes_tratamientos.service';
import { PlanesTratamientos } from './entities/planes_tratamiento.entity';
import { CreatePlanesTratamientoInput } from './dto/create-planes_tratamiento.input';
import { UpdatePlanesTratamientoInput } from './dto/update-planes_tratamiento.input';

@Resolver(() => PlanesTratamientos)
export class PlanesTratamientosResolver {
  constructor(private readonly service: PlanesTratamientosService) {}

  @Mutation(() => PlanesTratamientos, { description: 'Registra un nuevo plan de tratamiento para un paciente' })
  crearPlanesTratamientos(
    @Args('datos') datos: CreatePlanesTratamientoInput,
  ): Promise<PlanesTratamientos> {
    return this.service.crearPlanesTratamientos(datos);
  }

  @Query(() => [PlanesTratamientos], { name: 'listarPlanesTratamientos', description: 'Retorna todos los planes de tratamiento' })
  listarPlanesTratamientos(): Promise<PlanesTratamientos[]> {
    return this.service.listarPlanesTratamientos();
  }

  @Query(() => [PlanesTratamientos], { name: 'listarPlanesPorPaciente', description: 'Retorna los planes de tratamiento de un paciente' })
  listarPlanesPorPaciente(
    @Args('pacienteId', { type: () => Int }) pacienteId: number,
  ): Promise<PlanesTratamientos[]> {
    return this.service.listarPlanesPorPaciente(pacienteId);
  }

  @Query(() => PlanesTratamientos, { name: 'verPlanTratamiento', description: 'Busca un plan de tratamiento por su ID' })
  verPlanTratamiento(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<PlanesTratamientos> {
    return this.service.verPlanTratamiento(id);
  }

  @Mutation(() => PlanesTratamientos, { description: 'Actualiza los campos de un plan de tratamiento existente' })
  editarPlanTratamiento(
    @Args('datos') datos: UpdatePlanesTratamientoInput,
  ): Promise<PlanesTratamientos> {
    return this.service.editarPlanTratamiento(datos);
  }

  @Mutation(() => PlanesTratamientos, { description: 'Elimina un plan de tratamiento del sistema' })
  eliminarPlanTratamiento(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<PlanesTratamientos> {
    return this.service.eliminarPlanTratamiento(id);
  }
}
