import { InputType, Field, Int, PartialType, OmitType } from '@nestjs/graphql';
import { IsInt } from 'class-validator';
import { CreateCitaInput } from './create-cita.input';

@InputType()
export class UpdateCitaInput extends PartialType(
  OmitType(CreateCitaInput, ['pacienteId', 'empleadoId'] as const),
) {
  @Field(() => Int)
  @IsInt()
  id: number;
}
