import { InputType, Field, Int, PartialType, OmitType } from '@nestjs/graphql';
import { IsInt } from 'class-validator';
import { CreatePlanesEjercicioInput } from './create-planes_ejercicio.input';

@InputType()
export class UpdatePlanesEjercicioInput extends PartialType(
  OmitType(CreatePlanesEjercicioInput, ['planTratamientoId', 'ejercicioId'] as const),
) {
  @Field(() => Int)
  @IsInt()
  id: number;
}
