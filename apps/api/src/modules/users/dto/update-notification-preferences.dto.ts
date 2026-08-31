import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  emailNewOrder?: boolean;

  @IsOptional()
  @IsBoolean()
  emailLowStock?: boolean;

  @IsOptional()
  @IsBoolean()
  emailJobUpdates?: boolean;

  @IsOptional()
  @IsBoolean()
  emailBackInStock?: boolean;

  @IsOptional()
  @IsBoolean()
  emailAbandonedCart?: boolean;
}