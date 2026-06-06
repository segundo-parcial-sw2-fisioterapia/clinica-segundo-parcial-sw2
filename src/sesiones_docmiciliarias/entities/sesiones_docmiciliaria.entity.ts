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
import { PlanesEjercicios } from '../../planes_ejercicios/entities/planes_ejercicio.entity';

@ObjectType()
@Entity('sesiones_domiciliarias')
export class SesionesDomiciliarias {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Pacientes)
  @ManyToOne(() => Pacientes, { nullable: false, eager: true })
  @JoinColumn({ name: 'paciente_id' })
  paciente: Pacientes;

  @Field(() => PlanesEjercicios)
  @ManyToOne(() => PlanesEjercicios, { nullable: false, eager: true })
  @JoinColumn({ name: 'plan_ejercicio_id' })
  plan_ejercicio: PlanesEjercicios;

  @Field(() => Date)
  @Column({ type: 'timestamp' })
  fecha_hora: Date;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  repeticiones_completadas?: number;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  puntuacion?: number;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  xp_ganado?: number;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  correcciones_emitidas?: string;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamp' })
  fecha_creacion: Date;
}
