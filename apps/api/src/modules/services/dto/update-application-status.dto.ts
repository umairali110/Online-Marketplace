import { IsIn } from 'class-validator';

export class UpdateApplicationStatusDto {
  @IsIn(['ACCEPTED', 'REJECTED'])
  status!: 'ACCEPTED' | 'REJECTED';
}