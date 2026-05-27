import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ejercicios } from './entities/ejercicio.entity';
import { CreateEjercicioInput } from './dto/create-ejercicio.input';
import { UpdateEjercicioInput } from './dto/update-ejercicio.input';
import { CategoriaTrabajo } from '../compartido/enums';

@Injectable()
export class EjerciciosService {
  constructor(
    @InjectRepository(Ejercicios)
    private readonly ejerciciosRepository: Repository<Ejercicios>,
  ) {}

  /**
   * Agrega un nuevo ejercicio al catálogo terapéutico.
   *
   * @param datos - Datos del ejercicio a registrar.
   * @returns El ejercicio creado.
   */
  async crearEjercicios(datos: CreateEjercicioInput): Promise<Ejercicios> {
    const ejercicio = this.ejerciciosRepository.create(datos);
    return this.ejerciciosRepository.save(ejercicio);
  }

  /**
   * Retorna el catálogo completo de ejercicios disponibles.
   *
   * @returns Lista de ejercicios.
   */
  async listarEjercicios(): Promise<Ejercicios[]> {
    return this.ejerciciosRepository.find();
  }

  /**
   * Filtra los ejercicios disponibles por categoría de zona corporal.
   *
   * @param categoria - Categoría de trabajo a filtrar.
   * @returns Lista de ejercicios de la categoría indicada.
   */
  async listarEjerciciosPorCategoria(categoria: CategoriaTrabajo): Promise<Ejercicios[]> {
    return this.ejerciciosRepository.find({ where: { categoria_trabajo: categoria } });
  }

  /**
   * Busca un ejercicio por su identificador único.
   *
   * @param id - ID del ejercicio.
   * @returns El ejercicio encontrado.
   * @throws NotFoundException si el ejercicio no existe.
   */
  async verEjercicio(id: number): Promise<Ejercicios> {
    const ejercicio = await this.ejerciciosRepository.findOne({ where: { id } });
    if (!ejercicio) throw new NotFoundException(`Ejercicio con id ${id} no encontrado`);
    return ejercicio;
  }

  /**
   * Actualiza los datos de un ejercicio del catálogo.
   *
   * @param datos - Campos a actualizar, incluye el id.
   * @returns El ejercicio actualizado.
   */
  async editarEjercicio(datos: UpdateEjercicioInput): Promise<Ejercicios> {
    const { id, ...campos } = datos;
    await this.verEjercicio(id);
    await this.ejerciciosRepository.update(id, campos);
    return this.verEjercicio(id);
  }

  /**
   * Elimina un ejercicio del catálogo.
   *
   * @param id - ID del ejercicio a eliminar.
   * @returns El ejercicio eliminado.
   */
  async eliminarEjercicio(id: number): Promise<Ejercicios> {
    const ejercicio = await this.verEjercicio(id);
    await this.ejerciciosRepository.delete(id);
    return ejercicio;
  }
}
