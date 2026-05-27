import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CitasService } from './citas.service';
import { Citas } from './entities/cita.entity';
import { CreateCitaInput } from './dto/create-cita.input';
import { UpdateCitaInput } from './dto/update-cita.input';

@Resolver(() => Citas)
export class CitasResolver {
  constructor(private readonly citasService: CitasService) {}

  @Mutation(() => Citas, { description: 'Agenda una cita presencial o desde flujo automatizado' })
  crearCitas(
    @Args('datos') datos: CreateCitaInput,
  ): Promise<Citas> {
    return this.citasService.crearCitas(datos);
  }

  @Query(() => [Citas], { name: 'listarCitas', description: 'Retorna todas las citas ordenadas por fecha' })
  listarCitas(): Promise<Citas[]> {
    return this.citasService.listarCitas();
  }

  @Query(() => [Citas], { name: 'listarCitasPorPaciente', description: 'Retorna las citas de un paciente' })
  listarCitasPorPaciente(
    @Args('pacienteId', { type: () => Int }) pacienteId: number,
  ): Promise<Citas[]> {
    return this.citasService.listarCitasPorPaciente(pacienteId);
  }

  @Query(() => [Citas], { name: 'listarCitasPorEmpleadoYFecha', description: 'Retorna la agenda de un fisioterapeuta en una fecha' })
  listarCitasPorEmpleadoYFecha(
    @Args('empleadoId', { type: () => Int }) empleadoId: number,
    @Args('fecha') fecha: string,
  ): Promise<Citas[]> {
    return this.citasService.listarCitasPorEmpleadoYFecha(empleadoId, fecha);
  }

  @Query(() => [Citas], { name: 'listarCitasProximas', description: 'Retorna citas próximas para envío de recordatorios' })
  listarCitasProximas(
    @Args('horasAntelacion', { type: () => Int, defaultValue: 24 }) horasAntelacion: number,
  ): Promise<Citas[]> {
    return this.citasService.listarCitasProximas(horasAntelacion);
  }

  @Query(() => Citas, { name: 'verCita', description: 'Busca una cita por su ID' })
  verCita(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Citas> {
    return this.citasService.verCita(id);
  }

  @Mutation(() => Citas, { description: 'Actualiza los datos de una cita existente' })
  editarCita(
    @Args('datos') datos: UpdateCitaInput,
  ): Promise<Citas> {
    return this.citasService.editarCita(datos);
  }

  @Mutation(() => Citas, { description: 'Confirma una cita cambiando su estado a CONFIRMADA' })
  confirmarCita(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Citas> {
    return this.citasService.confirmarCita(id);
  }

  @Mutation(() => Citas, { description: 'Cancela una cita cambiando su estado a CANCELADA' })
  cancelarCita(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Citas> {
    return this.citasService.cancelarCita(id);
  }

  @Mutation(() => Citas, { description: 'Elimina una cita del sistema' })
  eliminarCita(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Citas> {
    return this.citasService.eliminarCita(id);
  }
}
