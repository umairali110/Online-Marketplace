import { IsOptional, IsString } from 'class-validator';

export class CreateThreadDto {
  @IsString()
  otherUserId!: string;

  @IsOptional()
  @IsString()
  jobPostId?: string;
}