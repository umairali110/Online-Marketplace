import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(8)
  password!: string;

  // Self-registration only allows CUSTOMER, SELLER, or PROVIDER — ADMIN is never
  // self-registered (set manually via Prisma Studio, as established on Day 8).
  @IsOptional()
  @IsEnum(Role, { message: 'role must be CUSTOMER, SELLER, or PROVIDER' })
  role?: 'CUSTOMER' | 'SELLER' | 'PROVIDER';
}