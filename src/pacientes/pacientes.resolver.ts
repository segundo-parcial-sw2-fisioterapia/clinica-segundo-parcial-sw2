import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PacientesService } from './pacientes.service';
import { Pacientes } from './entities/paciente.entity';
import { CreatePacienteInput } from './dto/create-paciente.input';
import { UpdatePacienteInput } from './dto/update-paciente.input';

@Resolver(() => Pacientes)
export class PacientesResolver {
  constructor(private readonly pacientesService: PacientesService) {}

  @Mutation(() => Pacientes, { description: 'Registra un nuevo paciente vinculado a una persona' })
  crearPacientes(
    @Args('datos') datos: CreatePacienteInput,
  ): Promise<Pacientes> {
    return this.pacientesService.crearPacientes(datos);
  }

  @Query(() => [Pacientes], { name: 'listarPacientes', description: 'Retorna todos los pacientes registrados' })
  listarPacientes(): Promise<Pacientes[]> {
    return this.pacientesService.listarPacientes();
  }

  @Query(() => Pacientes, { name: 'verPaciente', description: 'Busca un paciente por su ID' })
  verPaciente(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Pacientes> {
    return this.pacientesService.verPaciente(id);
  }

  @Query(() => [Pacientes], { name: 'pacientesPorIds', description: 'Busca múltiples pacientes por sus IDs — endpoint interno para microservicios' })
  pacientesPorIds(
    @Args('ids', { type: () => [Int] }) ids: number[],
  ): Promise<Pacientes[]> {
    return this.pacientesService.buscarPorIds(ids);
  }

  @Query(() => [Pacientes], { name: 'buscarPacientes', description: 'Busca pacientes por nombre, CI o teléfono' })
  buscarPacientes(
    @Args('termino') termino: string,
  ): Promise<Pacientes[]> {
    return this.pacientesService.buscarPacientes(termino);
  }

  @Mutation(() => Pacientes, { description: 'Actualiza los datos clínicos de un paciente' })
  editarPaciente(
    @Args('datos') datos: UpdatePacienteInput,
  ): Promise<Pacientes> {
    return this.pacientesService.editarPaciente(datos);
  }

  @Mutation(() => Pacientes, { description: 'Registra el alta médica de un paciente clínico' })
  altaMedicaPaciente(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Pacientes> {
    return this.pacientesService.altaMedicaPaciente(id);
  }

  @Mutation(() => Pacientes, { description: 'Elimina un paciente de la clínica permanentemente' })
  eliminarPaciente(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Pacientes> {
    return this.pacientesService.eliminarPaciente(id);
  }
}
