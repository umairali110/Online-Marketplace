import { IsEnum } from 'class-validator';
import { DisputeStatus } from '@prisma/client';

export class UpdateDisputeStatusDto {
  @IsEnum(DisputeStatus)
  status!: DisputeStatus;
}