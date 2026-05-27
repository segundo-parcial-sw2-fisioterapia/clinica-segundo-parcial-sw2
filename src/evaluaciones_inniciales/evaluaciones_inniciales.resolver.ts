import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { EvaluacionesInnicialesService } from './evaluaciones_inniciales.service';
import { EvaluacionesIniciales } from './entities/evaluaciones_inniciale.entity';
import { CreateEvaluacionesInnicialeInput } from './dto/create-evaluaciones_inniciale.input';
import { UpdateEvaluacionesInnicialeInput } from './dto/update-evaluaciones_inniciale.input';

@Resolver(() => EvaluacionesIniciales)
export class EvaluacionesInnicialesResolver {
  constructor(private readonly service: EvaluacionesInnicialesService) {}

  @Mutation(() => EvaluacionesIniciales, { description: 'Registra la evaluación clínica inicial de un paciente' })
  crearEvaluacionesIniciales(
    @Args('datos') datos: CreateEvaluacionesInnicialeInput,
  ): Promise<EvaluacionesIniciales> {
    return this.service.crearEvaluacionesIniciales(datos);
  }

  @Query(() => [EvaluacionesIniciales], { name: 'listarEvaluacionesIniciales', description: 'Retorna todas las evaluaciones iniciales registradas' })
  listarEvaluacionesIniciales(): Promise<EvaluacionesIniciales[]> {
    return this.service.listarEvaluacionesIniciales();
  }

  @Query(() => [EvaluacionesIniciales], { name: 'listarEvaluacionesPorPaciente', description: 'Retorna el historial de evaluaciones de un paciente' })
  listarEvaluacionesPorPaciente(
    @Args('pacienteId', { type: () => Int }) pacienteId: number,
  ): Promise<EvaluacionesIniciales[]> {
    return this.service.listarEvaluacionesPorPaciente(pacienteId);
  }

  @Query(() => EvaluacionesIniciales, { name: 'verEvaluacionInicial', description: 'Busca una evaluación inicial por su ID' })
  verEvaluacionInicial(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<EvaluacionesIniciales> {
    return this.service.verEvaluacionInicial(id);
  }

  @Mutation(() => EvaluacionesIniciales, { description: 'Actualiza los campos de una evaluación clínica existente' })
  editarEvaluacionInicial(
    @Args('datos') datos: UpdateEvaluacionesInnicialeInput,
  ): Promise<EvaluacionesIniciales> {
    return this.service.editarEvaluacionInicial(datos);
  }

  @Mutation(() => EvaluacionesIniciales, { description: 'Elimina una evaluación clínica del sistema' })
  eliminarEvaluacionInicial(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<EvaluacionesIniciales> {
    return this.service.eliminarEvaluacionInicial(id);
  }
}
