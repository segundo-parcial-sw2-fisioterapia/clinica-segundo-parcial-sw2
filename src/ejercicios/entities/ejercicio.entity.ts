import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CategoriaTrabajo, NivelDificultadEjercicio } from '../../compartido/enums';

@ObjectType()
@Entity('ejercicios')
export class Ejercicios {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Field(() => CategoriaTrabajo)
  @Column({ type: 'enum', enum: CategoriaTrabajo })
  categoria_trabajo: CategoriaTrabajo;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  repeticiones_sugeridas?: number;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  duracion_segundos?: number;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 500, nullable: true })
  url_video_referencia?: string;

  @Field(() => NivelDificultadEjercicio)
  @Column({
    type: 'enum',
    enum: NivelDificultadEjercicio,
    default: NivelDificultadEjercicio.MEDIO,
  })
  nivel_dificultad: NivelDificultadEjercicio;
}
