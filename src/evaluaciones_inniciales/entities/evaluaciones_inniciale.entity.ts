import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Pacientes } from '../../pacientes/entities/paciente.entity';
import {
  CategoriaSemaforo,
  CategoriaTrabajo,
  CategoriaEnfermedad,
  FrecuenciaSesion,
} from '../../compartido/enums';

@ObjectType()
@Entity('evaluaciones_iniciales')
export class EvaluacionesIniciales {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Pacientes)
  @ManyToOne(() => Pacientes, { nullable: false, eager: true })
  @JoinColumn({ name: 'paciente_id' })
  paciente: Pacientes;

  /** ID del empleado en el microservicio gestion-administrativa */
  @Field(() => Int)
  @Column({ type: 'int', name: 'empleado_id' })
  empleado_id: number;

  @Field(() => Date)
  @Column({ type: 'timestamp' })
  fecha_evaluacion: Date;

  @Field(() => CategoriaSemaforo)
  @Column({ type: 'enum', enum: CategoriaSemaforo })
  categoria_semaforo: CategoriaSemaforo;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  justificacion_semaforo?: string;

  @Field(() => CategoriaTrabajo)
  @Column({ type: 'enum', enum: CategoriaTrabajo })
  categoria_trabajo: CategoriaTrabajo;

  @Field(() => CategoriaEnfermedad)
  @Column({ type: 'enum', enum: CategoriaEnfermedad })
  categoria_enfermedad: CategoriaEnfermedad;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  descripcion_enfermedad?: string;

  /** Derivado de la categoría semáforo: rojo=120, amarillo=90, verde=45 */
  @Field(() => Int)
  @Column({ type: 'int' })
  tiempo_sesion_minutos: number;

  @Field(() => FrecuenciaSesion)
  @Column({ type: 'enum', enum: FrecuenciaSesion })
  frecuencia_sesion: FrecuenciaSesion;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @Field()
  @Column({ type: 'boolean', default: true })
  es_vigente: boolean;
}
