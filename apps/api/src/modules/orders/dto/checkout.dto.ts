import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CheckoutDto {
  @IsString()
  addressId!: string;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  trustCoinsToRedeem?: number;
}