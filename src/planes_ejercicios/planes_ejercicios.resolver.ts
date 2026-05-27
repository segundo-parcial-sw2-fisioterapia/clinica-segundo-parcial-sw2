import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PlanesEjerciciosService } from './planes_ejercicios.service';
import { PlanesEjercicios } from './entities/planes_ejercicio.entity';
import { CreatePlanesEjercicioInput } from './dto/create-planes_ejercicio.input';
import { UpdatePlanesEjercicioInput } from './dto/update-planes_ejercicio.input';

@Resolver(() => PlanesEjercicios)
export class PlanesEjerciciosResolver {
  constructor(private readonly service: PlanesEjerciciosService) {}

  @Mutation(() => PlanesEjercicios, { description: 'Asigna un ejercicio con parámetros personalizados a un plan de tratamiento' })
  crearPlanesEjercicios(
    @Args('datos') datos: CreatePlanesEjercicioInput,
  ): Promise<PlanesEjercicios> {
    return this.service.crearPlanesEjercicios(datos);
  }

  @Query(() => [PlanesEjercicios], { name: 'listarPlanesEjercicios', description: 'Retorna todos los ejercicios asignados a planes' })
  listarPlanesEjercicios(): Promise<PlanesEjercicios[]> {
    return this.service.listarPlanesEjercicios();
  }

  @Query(() => [PlanesEjercicios], { name: 'listarEjerciciosDePlan', description: 'Retorna los ejercicios asignados a un plan específico' })
  listarEjerciciosDePlan(
    @Args('planTratamientoId', { type: () => Int }) planTratamientoId: number,
  ): Promise<PlanesEjercicios[]> {
    return this.service.listarEjerciciosDePlan(planTratamientoId);
  }

  @Query(() => PlanesEjercicios, { name: 'verPlanEjercicio', description: 'Busca los parámetros de un ejercicio en un plan por su ID' })
  verPlanEjercicio(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<PlanesEjercicios> {
    return this.service.verPlanEjercicio(id);
  }

  @Mutation(() => PlanesEjercicios, { description: 'Actualiza los parámetros personalizados de un ejercicio en el plan' })
  editarPlanEjercicio(
    @Args('datos') datos: UpdatePlanesEjercicioInput,
  ): Promise<PlanesEjercicios> {
    return this.service.editarPlanEjercicio(datos);
  }

  @Mutation(() => PlanesEjercicios, { description: 'Remueve un ejercicio de un plan de tratamiento' })
  eliminarPlanEjercicio(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<PlanesEjercicios> {
    return this.service.eliminarPlanEjercicio(id);
  }
}
