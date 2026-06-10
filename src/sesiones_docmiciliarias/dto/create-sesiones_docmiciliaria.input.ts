import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

@InputType()
export class CreateSesionesDocmiciliariaInput {
  @Field(() => Int)
  @IsInt()
  pacienteId: number;

  @Field(() => Int)
  @IsInt()
  planEjercicioId: number;

  @Field()
  @IsNotEmpty()
  fecha_hora: Date;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  repeticiones_completadas?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  puntuacion?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  xp_ganado?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  correcciones_emitidas?: string;
}
