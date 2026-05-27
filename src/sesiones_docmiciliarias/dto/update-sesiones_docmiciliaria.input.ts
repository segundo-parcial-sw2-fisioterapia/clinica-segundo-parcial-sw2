import { InputType, Field, Int, PartialType, OmitType } from '@nestjs/graphql';
import { IsInt } from 'class-validator';
import { CreateSesionesDocmiciliariaInput } from './create-sesiones_docmiciliaria.input';

@InputType()
export class UpdateSesionesDocmiciliariaInput extends PartialType(
  OmitType(CreateSesionesDocmiciliariaInput, ['pacienteId', 'planEjercicioId'] as const),
) {
  @Field(() => Int)
  @IsInt()
  id: number;
}
