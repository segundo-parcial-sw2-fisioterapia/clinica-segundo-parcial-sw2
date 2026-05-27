import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Personas } from '../../personas/entities/persona.entity';
import { EstadoPaciente, SexoPaciente } from '../../compartido/enums';

@ObjectType()
@Entity('pacientes')
export class Pacientes {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Personas, { nullable: true })
  @OneToOne(() => Personas, { eager: true, nullable: true })
  @JoinColumn({ name: 'persona_id' })
  persona?: Personas;

  @Field({ nullable: true })
  @Column({ type: 'date', nullable: true })
  fecha_nacimiento?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  direccion?: string;

  @Field(() => SexoPaciente, { nullable: true })
  @Column({ type: 'enum', enum: SexoPaciente, nullable: true })
  sexo?: SexoPaciente;

  @Field(() => EstadoPaciente)
  @Column({
    type: 'enum',
    enum: EstadoPaciente,
    default: EstadoPaciente.ACTIVO,
  })
  estado: EstadoPaciente;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamp' })
  fecha_registro: Date;
}
