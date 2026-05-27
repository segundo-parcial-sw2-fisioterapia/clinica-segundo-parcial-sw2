import { ObjectType, Field, Int, HideField } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Personas } from '../../personas/entities/persona.entity';
import { EstadoUsuario, RolUsuario } from '../../compartido/enums';

@ObjectType()
@Entity('usuarios')
export class Usuarios {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ type: 'varchar', length: 150, unique: true })
  correo: string;

  /** Hash bcrypt de la contraseña — nunca expuesto por GraphQL */
  @HideField()
  @Column({ type: 'varchar', length: 255 })
  contrasena_hash: string;

  @Field(() => [RolUsuario])
  @Column({ type: 'enum', enum: RolUsuario, array: true, default: [] })
  roles: RolUsuario[];

  @Field(() => EstadoUsuario)
  @Column({
    type: 'enum',
    enum: EstadoUsuario,
    default: EstadoUsuario.ACTIVO,
  })
  estado: EstadoUsuario;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamp' })
  fecha_creacion: Date;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  ultimo_acceso?: Date;

  @Field(() => Personas, { nullable: true })
  @OneToOne(() => Personas, { eager: true, nullable: true })
  @JoinColumn({ name: 'persona_id' })
  persona?: Personas;
}
