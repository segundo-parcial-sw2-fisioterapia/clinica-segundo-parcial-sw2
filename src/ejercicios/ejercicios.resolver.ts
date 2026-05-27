import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { EjerciciosService } from './ejercicios.service';
import { Ejercicios } from './entities/ejercicio.entity';
import { CreateEjercicioInput } from './dto/create-ejercicio.input';
import { UpdateEjercicioInput } from './dto/update-ejercicio.input';
import { CategoriaTrabajo } from '../compartido/enums';

@Resolver(() => Ejercicios)
export class EjerciciosResolver {
  constructor(private readonly ejerciciosService: EjerciciosService) {}

  @Mutation(() => Ejercicios, { description: 'Agrega un nuevo ejercicio al catálogo terapéutico' })
  crearEjercicios(
    @Args('datos') datos: CreateEjercicioInput,
  ): Promise<Ejercicios> {
    return this.ejerciciosService.crearEjercicios(datos);
  }

  @Query(() => [Ejercicios], { name: 'listarEjercicios', description: 'Retorna el catálogo completo de ejercicios' })
  listarEjercicios(): Promise<Ejercicios[]> {
    return this.ejerciciosService.listarEjercicios();
  }

  @Query(() => [Ejercicios], { name: 'listarEjerciciosPorCategoria', description: 'Filtra ejercicios por categoría de zona corporal' })
  listarEjerciciosPorCategoria(
    @Args('categoria', { type: () => CategoriaTrabajo }) categoria: CategoriaTrabajo,
  ): Promise<Ejercicios[]> {
    return this.ejerciciosService.listarEjerciciosPorCategoria(categoria);
  }

  @Query(() => Ejercicios, { name: 'verEjercicio', description: 'Busca un ejercicio por su ID' })
  verEjercicio(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Ejercicios> {
    return this.ejerciciosService.verEjercicio(id);
  }

  @Mutation(() => Ejercicios, { description: 'Actualiza los datos de un ejercicio del catálogo' })
  editarEjercicio(
    @Args('datos') datos: UpdateEjercicioInput,
  ): Promise<Ejercicios> {
    return this.ejerciciosService.editarEjercicio(datos);
  }

  @Mutation(() => Ejercicios, { description: 'Elimina un ejercicio del catálogo permanentemente' })
  eliminarEjercicio(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Ejercicios> {
    return this.ejerciciosService.eliminarEjercicio(id);
  }
}
