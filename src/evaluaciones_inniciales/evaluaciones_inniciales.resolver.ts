import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { EvaluacionesInnicialesService } from './evaluaciones_inniciales.service';
import { EvaluacionesIniciales } from './entities/evaluaciones_inniciale.entity';
import { CreateEvaluacionesInnicialeInput } from './dto/create-evaluaciones_inniciale.input';
import { UpdateEvaluacionesInnicialeInput } from './dto/update-evaluaciones_inniciale.input';

/** Contexto de usuario extraído del JWT que el gateway ya verificó y reenvió. */
interface CtxUsuario {
  usuarioId: number;
  roles: string[];
  personaId: number | null;
}

@Resolver(() => EvaluacionesIniciales)
export class EvaluacionesInnicialesResolver {
  constructor(private readonly service: EvaluacionesInnicialesService) {}

  /**
   * Decodifica el payload del JWT desde el header Authorization.
   * No re-verifica la firma: el gateway ya validó el token; aquí solo
   * necesitamos leer sub, roles y persona.id para el filtrado interno.
   */
  private extraerContexto(req: any): CtxUsuario {
    try {
      const authHeader: string = req?.headers?.authorization ?? '';
      const token = authHeader.replace('Bearer ', '');
      if (!token) return { usuarioId: 0, roles: [], personaId: null };
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString('utf8'),
      );
      return {
        usuarioId: Number(payload.sub ?? 0),
        roles: Array.isArray(payload.roles) ? payload.roles : [],
        personaId: payload.persona?.id ? Number(payload.persona.id) : null,
      };
    } catch {
      return { usuarioId: 0, roles: [], personaId: null };
    }
  }

  @Mutation(() => EvaluacionesIniciales, {
    description: 'Registra la evaluación clínica inicial de un paciente',
  })
  crearEvaluacionesIniciales(
    @Args('datos') datos: CreateEvaluacionesInnicialeInput,
    @Context() { req }: any,
  ): Promise<EvaluacionesIniciales> {
    return this.service.crearEvaluacionesIniciales(datos);
  }

  @Query(() => [EvaluacionesIniciales], {
    name: 'listarEvaluacionesIniciales',
    description:
      'Retorna evaluaciones filtradas por rol: admin/director/recepcionista ven todo; fisioterapeuta solo las suyas; paciente solo las propias',
  })
  listarEvaluacionesIniciales(@Context() { req }: any): Promise<EvaluacionesIniciales[]> {
    const { usuarioId, roles, personaId } = this.extraerContexto(req);
    return this.service.listarEvaluacionesIniciales(usuarioId, roles, personaId);
  }

  @Query(() => [EvaluacionesIniciales], {
    name: 'listarEvaluacionesPorPaciente',
    description:
      'Retorna evaluaciones de un paciente con visibilidad restringida por rol',
  })
  listarEvaluacionesPorPaciente(
    @Args('pacienteId', { type: () => Int }) pacienteId: number,
    @Context() { req }: any,
  ): Promise<EvaluacionesIniciales[]> {
    const { usuarioId, roles, personaId } = this.extraerContexto(req);
    return this.service.listarEvaluacionesPorPaciente(
      pacienteId,
      usuarioId,
      roles,
      personaId,
    );
  }

  @Query(() => EvaluacionesIniciales, {
    name: 'verEvaluacionInicial',
    description: 'Busca una evaluación inicial por su ID',
  })
  verEvaluacionInicial(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<EvaluacionesIniciales> {
    return this.service.verEvaluacionInicial(id);
  }

  @Mutation(() => EvaluacionesIniciales, {
    description: 'Actualiza los campos de una evaluación clínica existente',
  })
  editarEvaluacionInicial(
    @Args('datos') datos: UpdateEvaluacionesInnicialeInput,
  ): Promise<EvaluacionesIniciales> {
    return this.service.editarEvaluacionInicial(datos);
  }

  @Mutation(() => EvaluacionesIniciales, {
    description: 'Elimina una evaluación clínica del sistema',
  })
  eliminarEvaluacionInicial(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<EvaluacionesIniciales> {
    return this.service.eliminarEvaluacionInicial(id);
  }
}
