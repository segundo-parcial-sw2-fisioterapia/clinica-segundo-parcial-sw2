import { InputType, Field, Int, PartialType, OmitType } from '@nestjs/graphql';
import { IsInt } from 'class-validator';
import { CreatePlanesTratamientoInput } from './create-planes_tratamiento.input';

@InputType()
export class UpdatePlanesTratamientoInput extends PartialType(
  OmitType(CreatePlanesTratamientoInput, ['pacienteId', 'empleadoId'] as const),
) {
  @Field(() => Int)
  @IsInt()
  id: number;
}
