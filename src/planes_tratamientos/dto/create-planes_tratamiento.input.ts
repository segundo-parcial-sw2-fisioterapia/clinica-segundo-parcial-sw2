import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
} from 'class-validator';
import { EstadoPlanTratamiento } from '../../compartido/enums';

@InputType()
export class CreatePlanesTratamientoInput {
  @Field(() => Int)
  @IsInt()
  evaluacionInicialId: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  fecha_inicio: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  objetivo_terapeutico?: string;

  @Field(() => EstadoPlanTratamiento, { nullable: true })
  @IsOptional()
  @IsEnum(EstadoPlanTratamiento)
  estado?: EstadoPlanTratamiento;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @Field(() => Int)
  @IsInt()
  duracionMesesEstimada: number;

  @Field(() => Int)
  @IsInt()
  numeroSesionesMes: number;

  /** ID de la tarifa del catálogo en gestion-administrativa */
  @Field(() => Int)
  @IsInt()
  tarifaId: number;
}

