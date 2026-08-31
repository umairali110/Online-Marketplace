import { IsIn } from 'class-validator';

export class UpdateJobStatusDto {
  @IsIn(['COMPLETED', 'CANCELLED'])
  status!: 'COMPLETED' | 'CANCELLED';
}