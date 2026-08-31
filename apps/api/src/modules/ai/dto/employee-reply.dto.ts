import { IsString, MinLength } from 'class-validator';

export class EmployeeReplyDto {
  @IsString()
  @MinLength(2)
  message!: string;
}