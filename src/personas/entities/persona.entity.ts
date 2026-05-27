import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity('personas')
export class Personas {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Field()
  @Column({ type: 'varchar', length: 100 })
  apellido: string;

  /** Cédula de identidad — única por persona */
  @Field()
  @Column({ type: 'varchar', length: 20, unique: true })
  ci: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono?: string;
}
