import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { CategoriaTrabajo, NivelDificultadEjercicio } from '../../compartido/enums';

@InputType()
export class CreateEjercicioInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @Field(() => CategoriaTrabajo)
  @IsEnum(CategoriaTrabajo)
  categoria_trabajo: CategoriaTrabajo;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  repeticiones_sugeridas?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  duracion_segundos?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  url_video_referencia?: string;

  @Field(() => NivelDificultadEjercicio)
  @IsEnum(NivelDificultadEjercicio)
  nivel_dificultad: NivelDificultadEjercicio;
}
