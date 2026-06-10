import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EvaluacionesIniciales } from '../../evaluaciones_inniciales/entities/evaluaciones_inniciale.entity';
import { EstadoPlanTratamiento } from '../../compartido/enums';

@ObjectType()
@Entity('planes_tratamientos')
export class PlanesTratamientos {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => EvaluacionesIniciales)
  @ManyToOne(() => EvaluacionesIniciales, { nullable: false, eager: true })
  @JoinColumn({ name: 'evaluacion_inicial_id' })
  evaluacion_inicial: EvaluacionesIniciales;

  @Field()
  @Column({ type: 'date' })
  fecha_inicio: string;

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

  @Field(() => Int)
  @Column({ type: 'int', default: 1 })
  duracion_meses_estimada: number;

  @Field(() => Int)
  @Column({ type: 'int', default: 1 })
  numero_sesiones_mes: number;

  /** Referencia a la tarifa en gestion-administrativa (sin FK directa entre microservicios) */
  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', name: 'tarifa_id', nullable: true })
  tarifa_id?: number;
}

