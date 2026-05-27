import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlanesTratamientos } from '../../planes_tratamientos/entities/planes_tratamiento.entity';
import { Ejercicios } from '../../ejercicios/entities/ejercicio.entity';
import { FrecuenciaPlanEjercicio } from '../../compartido/enums';

@ObjectType()
@Entity('planes_ejercicios')
export class PlanesEjercicios {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => PlanesTratamientos)
  @ManyToOne(() => PlanesTratamientos, { nullable: false, eager: true })
  @JoinColumn({ name: 'plan_tratamiento_id' })
  plan_tratamiento: PlanesTratamientos;

  @Field(() => Ejercicios)
  @ManyToOne(() => Ejercicios, { nullable: false, eager: true })
  @JoinColumn({ name: 'ejercicio_id' })
  ejercicio: Ejercicios;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  repeticiones?: number;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  series?: number;

  @Field(() => FrecuenciaPlanEjercicio)
  @Column({
    type: 'enum',
    enum: FrecuenciaPlanEjercicio,
    default: FrecuenciaPlanEjercicio.DIARIA,
  })
  frecuencia: FrecuenciaPlanEjercicio;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  orden?: number;

  @Field()
  @Column({ type: 'boolean', default: true })
  activo: boolean;
}
