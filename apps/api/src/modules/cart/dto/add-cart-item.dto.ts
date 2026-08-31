import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AddCartItemDto {
  @IsString()
  storeListingId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  qty?: number;
}