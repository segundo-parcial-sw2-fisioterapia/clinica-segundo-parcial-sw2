import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Personas } from './entities/persona.entity';
import { CreatePersonaInput } from './dto/create-persona.input';
import { UpdatePersonaInput } from './dto/update-persona.input';

@Injectable()
export class PersonasService {
  constructor(
    @InjectRepository(Personas)
    private readonly personasRepository: Repository<Personas>,
  ) {}

  /**
   * Registra una nueva persona en el sistema.
   *
   * @param datos - Datos de la persona a registrar.
   * @returns La persona creada.
   */
  async crearPersonas(datos: CreatePersonaInput): Promise<Personas> {
    // Validar unicidad del CI
    const personaExistente = await this.personasRepository.findOne({
      where: { ci: datos.ci },
    });
    if (personaExistente) {
      throw new ConflictException(
        `Ya existe una persona registrada con la Cédula de Identidad (CI) "${datos.ci}".`,
      );
    }

    const persona = this.personasRepository.create(datos);
    return this.personasRepository.save(persona);
  }

  /**
   * Retorna el listado completo de personas registradas.
   *
   * @returns Lista de personas.
   */
  async listarPersonas(): Promise<Personas[]> {
    return this.personasRepository.find();
  }

  /**
   * Busca una persona por su identificador único.
   *
   * @param id - ID de la persona.
   * @returns La persona encontrada.
   * @throws NotFoundException si la persona no existe.
   */
  async verPersona(id: number): Promise<Personas> {
    const persona = await this.personasRepository.findOne({ where: { id } });
    if (!persona) throw new NotFoundException(`Persona con id ${id} no encontrada`);
    return persona;
  }

  /**
   * Busca personas por nombre, apellido o CI (búsqueda parcial).
   *
   * @param termino - Texto a buscar en nombre, apellido o CI.
   * @returns Lista de personas que coinciden con el término.
   */
  async buscarPersonas(termino: string): Promise<Personas[]> {
    return this.personasRepository
      .createQueryBuilder('p')
      .where('p.nombre ILIKE :t OR p.apellido ILIKE :t OR p.ci ILIKE :t', {
        t: `%${termino}%`,
      })
      .getMany();
  }

  /**
   * Actualiza los datos de una persona existente.
   *
   * @param datos - Datos de actualización, incluye el id.
   * @returns La persona actualizada.
   */
  async editarPersona(datos: UpdatePersonaInput): Promise<Personas> {
    const { id, ...campos } = datos;
    await this.verPersona(id);

    if (campos.ci) {
      const personaConMismoCi = await this.personasRepository.findOne({
        where: { ci: campos.ci },
      });
      if (personaConMismoCi && personaConMismoCi.id !== id) {
        throw new ConflictException(
          `No se puede actualizar. Ya existe otro registro con la Cédula de Identidad (CI) "${campos.ci}".`,
        );
      }
    }

    await this.personasRepository.update(id, campos);
    return this.verPersona(id);
  }

  /**
   * Elimina una persona del sistema.
   *
   * @param id - ID de la persona a eliminar.
   * @returns La persona eliminada.
   */
  async eliminarPersona(id: number): Promise<Personas> {
    const persona = await this.verPersona(id);
    await this.personasRepository.delete(id);
    return persona;
  }
}
