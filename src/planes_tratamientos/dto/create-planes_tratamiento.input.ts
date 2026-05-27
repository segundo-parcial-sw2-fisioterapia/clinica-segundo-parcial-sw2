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
  pacienteId: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  evaluacionInicialId?: number;

  @Field(() => Int)
  @IsInt()
  empleadoId: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  fecha_inicio: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fecha_fin_estimada?: string;

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
}
