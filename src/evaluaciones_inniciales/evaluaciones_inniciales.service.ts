import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluacionesIniciales } from './entities/evaluaciones_inniciale.entity';
import { Pacientes } from '../pacientes/entities/paciente.entity';
import { CreateEvaluacionesInnicialeInput } from './dto/create-evaluaciones_inniciale.input';
import { UpdateEvaluacionesInnicialeInput } from './dto/update-evaluaciones_inniciale.input';
import { CategoriaSemaforo } from '../compartido/enums';

/** Minutos de sesión por categoría semáforo según protocolo clínico */
const TIEMPO_POR_SEMAFORO: Record<CategoriaSemaforo, number> = {
  [CategoriaSemaforo.ROJO]: 120,
  [CategoriaSemaforo.AMARILLO]: 90,
  [CategoriaSemaforo.VERDE]: 45,
};

const ROLES_ACCESO_TOTAL = ['administrador', 'director', 'recepcionista'];

@Injectable()
export class EvaluacionesInnicialesService {
  constructor(
    @InjectRepository(EvaluacionesIniciales)
    private readonly evaluacionesRepository: Repository<EvaluacionesIniciales>,
    @InjectRepository(Pacientes)
    private readonly pacientesRepository: Repository<Pacientes>,
  ) {}

  /**
   * Registra la evaluación inicial del paciente y calcula el tiempo de sesión
   * según la categoría semáforo.
   *
   * @param datos - Datos de la evaluación inicial.
   * @returns La evaluación inicial creada con el tiempo calculado.
   */
  async crearEvaluacionesIniciales(
    datos: CreateEvaluacionesInnicialeInput,
  ): Promise<EvaluacionesIniciales> {
    const tiempo_sesion_minutos = datos.categoria_semaforo
      ? TIEMPO_POR_SEMAFORO[datos.categoria_semaforo]
      : undefined;

    const evaluacion = this.evaluacionesRepository.create({
      paciente: { id: datos.pacienteId } as Pacientes,
      empleado_id: datos.empleadoId,
      fecha_evaluacion: datos.fecha_evaluacion,
      categoria_semaforo: datos.categoria_semaforo,
      nivel: datos.nivel,
      justificacion_semaforo: datos.justificacion_semaforo,
      categoria_trabajo: datos.categoria_trabajo,
      categoria_enfermedad: datos.categoria_enfermedad,
      descripcion_enfermedad: datos.descripcion_enfermedad,
      tiempo_sesion_minutos,
      observaciones: datos.observaciones,
    });
    return this.evaluacionesRepository.save(evaluacion);
  }

  private async obtenerEmpleadoIdPorPersonaId(personaId: number): Promise<number | null> {
    const url = process.env.GESTION_ADMINISTRATIVA_URL || 'http://localhost:3001/graphql';
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query($termino: String!) {
              buscarEmpleados(termino: $termino) {
                id
                personaId
              }
            }
          `,
          variables: { termino: '' },
        }),
      });
      const result = (await response.json()) as any;
      if (result?.errors) {
        console.error('GraphQL errors from administratiba:', result.errors);
        return null;
      }
      const empleados = result?.data?.buscarEmpleados || [];
      const emp = empleados.find((e: any) => Number(e.personaId) === personaId);
      return emp ? Number(emp.id) : null;
    } catch (error) {
      console.error('Error fetching employee ID from administratiba:', error);
      return null;
    }
  }

  /**
   * Retorna evaluaciones según el rol del solicitante:
   * - administrador / director / recepcionista → todas
   * - fisioterapeuta → solo las que tiene asignadas (empleado_id obtenido de gestion-adm)
   * - paciente → solo las de su propio perfil (vía persona_id del JWT)
   *
   * @param usuarioId - sub del JWT.
   * @param roles - Array de roles del JWT.
   * @param personaId - persona.id del JWT.
   */
  async listarEvaluacionesIniciales(
    usuarioId: number,
    roles: string[],
    personaId: number | null,
  ): Promise<EvaluacionesIniciales[]> {
    if (roles.some(r => ROLES_ACCESO_TOTAL.includes(r))) {
      return this.evaluacionesRepository.find();
    }

    if (roles.includes('fisioterapeuta') && personaId) {
      const empleadoId = await this.obtenerEmpleadoIdPorPersonaId(personaId);
      if (empleadoId === null) return [];
      return this.evaluacionesRepository.find({
        where: { empleado_id: empleadoId },
      });
    }

    if (roles.includes('paciente') && personaId) {
      const paciente = await this.pacientesRepository.findOne({
        where: { persona: { id: personaId } },
      });
      if (!paciente) return [];
      return this.evaluacionesRepository.find({
        where: { paciente: { id: paciente.id } },
      });
    }

    return [];
  }

  /**
   * Retorna evaluaciones de un paciente específico con visibilidad restringida:
   * - administrador / director / recepcionista → todas
   * - fisioterapeuta → solo si el paciente tiene evaluaciones asignadas a él
   * - paciente → solo si el paciente solicitado le pertenece (persona_id)
   */
  async listarEvaluacionesPorPaciente(
    pacienteId: number,
    usuarioId: number,
    roles: string[],
    personaId: number | null,
  ): Promise<EvaluacionesIniciales[]> {
    if (roles.some(r => ROLES_ACCESO_TOTAL.includes(r))) {
      return this.evaluacionesRepository.find({
        where: { paciente: { id: pacienteId } },
      });
    }

    if (roles.includes('fisioterapeuta') && personaId) {
      const empleadoId = await this.obtenerEmpleadoIdPorPersonaId(personaId);
      if (empleadoId === null) return [];
      return this.evaluacionesRepository.find({
        where: {
          paciente: { id: pacienteId },
          empleado_id: empleadoId,
        },
      });
    }

    if (roles.includes('paciente') && personaId) {
      const paciente = await this.pacientesRepository.findOne({
        where: { persona: { id: personaId } },
      });
      if (!paciente || paciente.id !== pacienteId) return [];
      return this.evaluacionesRepository.find({
        where: { paciente: { id: pacienteId } },
      });
    }

    return [];
  }

  /**
   * Busca una evaluación inicial por su identificador único.
   *
   * @param id - ID de la evaluación.
   * @returns La evaluación encontrada.
   * @throws NotFoundException si la evaluación no existe.
   */
  async verEvaluacionInicial(id: number): Promise<EvaluacionesIniciales> {
    const evaluacion = await this.evaluacionesRepository.findOne({ where: { id } });
    if (!evaluacion)
      throw new NotFoundException(`Evaluación inicial con id ${id} no encontrada`);
    return evaluacion;
  }

  /**
   * Actualiza campos de una evaluación inicial existente.
   * Si se cambia la categoría semáforo, recalcula el tiempo de sesión.
   *
   * @param datos - Campos a actualizar, incluye el id.
   * @returns La evaluación actualizada.
   */
  async editarEvaluacionInicial(
    datos: UpdateEvaluacionesInnicialeInput,
  ): Promise<EvaluacionesIniciales> {
    const { id, ...campos } = datos;
    await this.verEvaluacionInicial(id);

    if (campos.categoria_semaforo) {
      (campos as any).tiempo_sesion_minutos =
        TIEMPO_POR_SEMAFORO[campos.categoria_semaforo];
    }

    await this.evaluacionesRepository.update(id, campos);
    return this.verEvaluacionInicial(id);
  }

  /**
   * Elimina una evaluación inicial del sistema.
   *
   * @param id - ID de la evaluación a eliminar.
   * @returns La evaluación eliminada.
   */
  async eliminarEvaluacionInicial(id: number): Promise<EvaluacionesIniciales> {
    const evaluacion = await this.verEvaluacionInicial(id);
    await this.evaluacionesRepository.delete(id);
    return evaluacion;
  }
}
