import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateJobApplicationDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}