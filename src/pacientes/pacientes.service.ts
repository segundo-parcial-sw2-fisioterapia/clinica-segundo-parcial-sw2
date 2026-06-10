import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Pacientes } from './entities/paciente.entity';
import { Personas } from '../personas/entities/persona.entity';
import { CreatePacienteInput } from './dto/create-paciente.input';
import { UpdatePacienteInput } from './dto/update-paciente.input';
import { EstadoPaciente } from '../compartido/enums';

@Injectable()
export class PacientesService {
  constructor(
    @InjectRepository(Pacientes)
    private readonly pacientesRepository: Repository<Pacientes>,
  ) {}

  /**
   * Registra un nuevo paciente vinculado a una persona existente.
   *
   * @param datos - Datos del paciente, incluye el personaId.
   * @returns El paciente creado con su persona.
   */
  async crearPacientes(datos: CreatePacienteInput): Promise<Pacientes> {
    // Validar si la persona ya tiene un perfil de paciente
    const pacienteExistente = await this.pacientesRepository.findOne({
      where: { persona: { id: datos.personaId } },
    });
    if (pacienteExistente) {
      throw new ConflictException(
        `Esta persona (ID: ${datos.personaId}) ya tiene un perfil de paciente registrado.`,
      );
    }

    const paciente = this.pacientesRepository.create({
      fecha_nacimiento: datos.fecha_nacimiento,
      direccion: datos.direccion,
      sexo: datos.sexo,
      estado: datos.estado ?? EstadoPaciente.ACTIVO,
      persona: { id: datos.personaId } as Personas,
    });
    const guardado = await this.pacientesRepository.save(paciente);
    return this.verPaciente(guardado.id);
  }

  /**
   * Retorna el listado completo de pacientes con sus datos personales.
   *
   * @returns Lista de pacientes.
   */
  async listarPacientes(): Promise<Pacientes[]> {
    return this.pacientesRepository.find();
  }

  /**
   * Busca un paciente por su identificador único.
   *
   * @param id - ID del paciente.
   * @returns El paciente encontrado.
   * @throws NotFoundException si el paciente no existe.
   */
  async verPaciente(id: number): Promise<Pacientes> {
    const paciente = await this.pacientesRepository.findOne({ where: { id } });
    if (!paciente) throw new NotFoundException(`Paciente con id ${id} no encontrado`);
    return paciente;
  }

  /**
   * Retorna los pacientes cuyos IDs coinciden con los proporcionados.
   * Endpoint interno para enriquecimiento por lotes desde gestion-administrativa.
   */
  async buscarPorIds(ids: number[]): Promise<Pacientes[]> {
    if (!ids || ids.length === 0) return [];
    return this.pacientesRepository.find({ where: { id: In(ids) } });
  }

  /**
   * Busca pacientes por nombre, apellido, CI o teléfono de su persona asociada.
   *
   * @param termino - Texto a buscar.
   * @returns Lista de pacientes que coinciden con el término.
   */
  async buscarPacientes(termino: string): Promise<Pacientes[]> {
    return this.pacientesRepository
      .createQueryBuilder('pac')
      .leftJoinAndSelect('pac.persona', 'per')
      .where(
        'per.nombre ILIKE :t OR per.apellido ILIKE :t OR per.ci ILIKE :t OR per.telefono ILIKE :t',
        { t: `%${termino}%` },
      )
      .getMany();
  }

  /**
   * Actualiza los datos clínicos de un paciente.
   *
   * @param datos - Campos a actualizar, incluye el id.
   * @returns El paciente actualizado.
   */
  async editarPaciente(datos: UpdatePacienteInput): Promise<Pacientes> {
    const { id, ...campos } = datos;
    await this.verPaciente(id);
    await this.pacientesRepository.update(id, campos);
    return this.verPaciente(id);
  }

  /**
   * Registra el alta médica del paciente cambiando su estado.
   *
   * @param id - ID del paciente.
   * @returns El paciente con estado ALTA_MEDICA.
   */
  async altaMedicaPaciente(id: number): Promise<Pacientes> {
    await this.verPaciente(id);
    await this.pacientesRepository.update(id, { estado: EstadoPaciente.ALTA_MEDICA });
    return this.verPaciente(id);
  }

  /**
   * Elimina un paciente del sistema de forma permanente.
   *
   * @param id - ID del paciente a eliminar.
   * @returns El paciente eliminado.
   */
  async eliminarPaciente(id: number): Promise<Pacientes> {
    const paciente = await this.verPaciente(id);
    await this.pacientesRepository.delete(id);
    return paciente;
  }
}
