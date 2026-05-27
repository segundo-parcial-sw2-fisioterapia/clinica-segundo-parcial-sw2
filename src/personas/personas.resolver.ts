import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PersonasService } from './personas.service';
import { Personas } from './entities/persona.entity';
import { CreatePersonaInput } from './dto/create-persona.input';
import { UpdatePersonaInput } from './dto/update-persona.input';

@Resolver(() => Personas)
export class PersonasResolver {
  constructor(private readonly personasService: PersonasService) {}

  @Mutation(() => Personas, { description: 'Registra una nueva persona en el sistema' })
  crearPersonas(
    @Args('datos') datos: CreatePersonaInput,
  ): Promise<Personas> {
    return this.personasService.crearPersonas(datos);
  }

  @Query(() => [Personas], { name: 'listarPersonas', description: 'Retorna todas las personas registradas' })
  listarPersonas(): Promise<Personas[]> {
    return this.personasService.listarPersonas();
  }

  @Query(() => Personas, { name: 'verPersona', description: 'Busca una persona por su ID' })
  verPersona(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Personas> {
    return this.personasService.verPersona(id);
  }

  @Query(() => [Personas], { name: 'buscarPersonas', description: 'Busca personas por nombre, apellido o CI' })
  buscarPersonas(
    @Args('termino') termino: string,
  ): Promise<Personas[]> {
    return this.personasService.buscarPersonas(termino);
  }

  @Mutation(() => Personas, { description: 'Actualiza los datos de una persona existente' })
  editarPersona(
    @Args('datos') datos: UpdatePersonaInput,
  ): Promise<Personas> {
    return this.personasService.editarPersona(datos);
  }

  @Mutation(() => Personas, { description: 'Elimina una persona del sistema' })
  eliminarPersona(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Personas> {
    return this.personasService.eliminarPersona(id);
  }
}
