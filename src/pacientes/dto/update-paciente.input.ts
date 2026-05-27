import { InputType, Field, Int, PartialType, OmitType } from '@nestjs/graphql';
import { IsInt } from 'class-validator';
import { CreatePacienteInput } from './create-paciente.input';

@InputType()
export class UpdatePacienteInput extends PartialType(
  OmitType(CreatePacienteInput, ['personaId'] as const),
) {
  @Field(() => Int)
  @IsInt()
  id: number;
}
