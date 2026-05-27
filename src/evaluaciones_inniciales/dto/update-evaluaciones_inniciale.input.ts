import { InputType, Field, Int, PartialType, OmitType } from '@nestjs/graphql';
import { IsInt } from 'class-validator';
import { CreateEvaluacionesInnicialeInput } from './create-evaluaciones_inniciale.input';

@InputType()
export class UpdateEvaluacionesInnicialeInput extends PartialType(
  OmitType(CreateEvaluacionesInnicialeInput, ['pacienteId', 'empleadoId'] as const),
) {
  @Field(() => Int)
  @IsInt()
  id: number;
}
