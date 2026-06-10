import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlanesTratamientos } from '../../planes_tratamientos/entities/planes_tratamiento.entity';
import { EstadoSesion } from '../../compartido/enums';

@ObjectType()
@Entity('sesiones')
export class Sesiones {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  /** Plan de tratamiento al que pertenece la sesión — nullable para compatibilidad con filas existentes */
  @Field(() => PlanesTratamientos, { nullable: true })
  @ManyToOne(() => PlanesTratamientos, { nullable: true, eager: true })
  @JoinColumn({ name: 'plan_tratamiento_id' })
  plan_tratamiento?: PlanesTratamientos;

  /** Mensualidad que cubre y habilita esta sesión (ref a gestion-administrativa) */
  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', name: 'mensualidad_id', nullable: true })
  mensualidad_id?: number;

  @Field(() => Int)
  @Column({ type: 'int', default: 1 })
  numero_sesion: number;

  /** ID del fisioterapeuta que atiende la sesión (gestion-administrativa) */
  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', name: 'empleado_id', nullable: true })
  empleado_id?: number;

  /** Fecha/hora acordada al planificar; nullable para filas pre-migración */
  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  fecha_hora_programada?: Date;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  fecha_hora_inicio?: Date;

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

  /** El default en DB sigue siendo ABIERTA para evitar el bug de enum en misma transacción.
   *  El service asigna PROGRAMADA explícitamente en cada create. */
  @Field(() => EstadoSesion)
  @Column({ type: 'enum', enum: EstadoSesion, default: EstadoSesion.ABIERTA })
  estado_sesion: EstadoSesion;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 500, nullable: true })
  url_documento_firmado?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 256, nullable: true })
  hash_blockchain?: string;
}
