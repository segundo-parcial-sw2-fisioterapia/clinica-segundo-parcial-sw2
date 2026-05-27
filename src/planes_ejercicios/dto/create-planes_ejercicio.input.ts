import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';
import { FrecuenciaPlanEjercicio } from '../../compartido/enums';

@InputType()
export class CreatePlanesEjercicioInput {
  @Field(() => Int)
  @IsInt()
  planTratamientoId: number;

  @Field(() => Int)
  @IsInt()
  ejercicioId: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  repeticiones?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  series?: number;

  @Field(() => FrecuenciaPlanEjercicio)
  @IsEnum(FrecuenciaPlanEjercicio)
  frecuencia: FrecuenciaPlanEjercicio;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  orden?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
