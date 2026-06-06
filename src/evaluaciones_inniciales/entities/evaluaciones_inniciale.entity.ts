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
  NivelIntensidad,
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

  @Field(() => CategoriaSemaforo, { nullable: true })
  @Column({ type: 'enum', enum: CategoriaSemaforo, nullable: true })
  categoria_semaforo?: CategoriaSemaforo;

  /** Nullable para compatibilidad con evaluaciones pre-migración */
  @Field(() => NivelIntensidad, { nullable: true })
  @Column({ type: 'enum', enum: NivelIntensidad, nullable: true })
  nivel?: NivelIntensidad;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  justificacion_semaforo?: string;

  @Field(() => CategoriaTrabajo, { nullable: true })
  @Column({ type: 'enum', enum: CategoriaTrabajo, nullable: true })
  categoria_trabajo?: CategoriaTrabajo;

  @Field(() => CategoriaEnfermedad, { nullable: true })
  @Column({ type: 'enum', enum: CategoriaEnfermedad, nullable: true })
  categoria_enfermedad?: CategoriaEnfermedad;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  descripcion_enfermedad?: string;

  /** Derivado de la categoría semáforo: rojo=120, amarillo=90, verde=45 */
  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  tiempo_sesion_minutos?: number;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  observaciones?: string;
}
