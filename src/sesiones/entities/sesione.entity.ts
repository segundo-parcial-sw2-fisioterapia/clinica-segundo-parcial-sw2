import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Citas } from '../../citas/entities/cita.entity';
import { Pacientes } from '../../pacientes/entities/paciente.entity';
import { EstadoSesion } from '../../compartido/enums';

@ObjectType()
@Entity('sesiones')
export class Sesiones {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Citas, { nullable: true })
  @ManyToOne(() => Citas, { nullable: true, eager: true })
  @JoinColumn({ name: 'cita_id' })
  cita?: Citas;

  @Field(() => Pacientes)
  @ManyToOne(() => Pacientes, { nullable: false, eager: true })
  @JoinColumn({ name: 'paciente_id' })
  paciente: Pacientes;

  /** ID del fisioterapeuta que atiende la sesión (gestion-administrativa) */
  @Field(() => Int)
  @Column({ type: 'int', name: 'empleado_id' })
  empleado_id: number;

  @Field(() => Date)
  @Column({ type: 'timestamp' })
  fecha_hora_inicio: Date;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  fecha_hora_fin?: Date;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  observaciones_clinicas?: string;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  nivel_dolor_reportado?: number;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  nivel_dolor_post?: number;

  @Field(() => EstadoSesion)
  @Column({ type: 'enum', enum: EstadoSesion, default: EstadoSesion.ABIERTA })
  estado_sesion: EstadoSesion;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 500, nullable: true })
  url_documento_firmado?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 256, nullable: true })
  hash_blockchain?: string;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamp' })
  fecha_creacion: Date;
}
