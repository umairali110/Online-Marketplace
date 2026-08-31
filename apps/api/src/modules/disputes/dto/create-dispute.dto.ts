import { IsString, MinLength } from 'class-validator';

export class CreateDisputeDto {
  @IsString()
  orderId!: string;

  @IsString()
  @MinLength(10)
  reason!: string;
}