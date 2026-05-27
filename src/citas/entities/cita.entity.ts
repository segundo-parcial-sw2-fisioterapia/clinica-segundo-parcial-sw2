import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Pacientes } from '../../pacientes/entities/paciente.entity';
import { EstadoCita, OrigenCita, TipoCita } from '../../compartido/enums';

@ObjectType()
@Entity('citas')
export class Citas {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Pacientes)
  @ManyToOne(() => Pacientes, { nullable: false, eager: true })
  @JoinColumn({ name: 'paciente_id' })
  paciente: Pacientes;

  /** ID del fisioterapeuta que atenderá (gestion-administrativa) */
  @Field(() => Int)
  @Column({ type: 'int', name: 'empleado_id' })
  empleado_id: number;

  @Field(() => Date)
  @Column({ type: 'timestamp' })
  fecha_hora: Date;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  duracion_minutos?: number;

  @Field(() => TipoCita)
  @Column({ type: 'enum', enum: TipoCita, default: TipoCita.PRIMERA_VEZ })
  tipo: TipoCita;

  @Field(() => OrigenCita)
  @Column({ type: 'enum', enum: OrigenCita, default: OrigenCita.RECEPCION })
  origen: OrigenCita;

  @Field(() => EstadoCita)
  @Column({ type: 'enum', enum: EstadoCita, default: EstadoCita.PROGRAMADA })
  estado: EstadoCita;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamp' })
  fecha_creacion: Date;
}
