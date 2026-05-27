import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Pacientes } from '../../pacientes/entities/paciente.entity';
import { EvaluacionesIniciales } from '../../evaluaciones_inniciales/entities/evaluaciones_inniciale.entity';
import { EstadoPlanTratamiento } from '../../compartido/enums';

@ObjectType()
@Entity('planes_tratamientos')
export class PlanesTratamientos {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Pacientes)
  @ManyToOne(() => Pacientes, { nullable: false, eager: true })
  @JoinColumn({ name: 'paciente_id' })
  paciente: Pacientes;

  @Field(() => EvaluacionesIniciales, { nullable: true })
  @ManyToOne(() => EvaluacionesIniciales, { nullable: true, eager: true })
  @JoinColumn({ name: 'evaluacion_inicial_id' })
  evaluacion_inicial?: EvaluacionesIniciales;

  /** ID del profesional que diseñó el plan (gestion-administrativa) */
  @Field(() => Int)
  @Column({ type: 'int', name: 'empleado_id' })
  empleado_id: number;

  @Field()
  @Column({ type: 'date' })
  fecha_inicio: string;

  @Field({ nullable: true })
  @Column({ type: 'date', nullable: true })
  fecha_fin_estimada?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  objetivo_terapeutico?: string;

  @Field(() => EstadoPlanTratamiento)
  @Column({
    type: 'enum',
    enum: EstadoPlanTratamiento,
    default: EstadoPlanTratamiento.ACTIVO,
  })
  estado: EstadoPlanTratamiento;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  observaciones?: string;
}
