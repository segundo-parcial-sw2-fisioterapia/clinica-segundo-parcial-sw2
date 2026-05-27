import { InputType, Field, Int, PartialType, OmitType } from '@nestjs/graphql';
import { IsInt } from 'class-validator';
import { CreateSesioneInput } from './create-sesione.input';

@InputType()
export class UpdateSesioneInput extends PartialType(
  OmitType(CreateSesioneInput, ['pacienteId', 'empleadoId'] as const),
) {
  @Field(() => Int)
  @IsInt()
  id: number;
}
