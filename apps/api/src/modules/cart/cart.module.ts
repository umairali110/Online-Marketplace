import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { AbandonedCartProcessor } from './abandoned-cart.processor';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CartController],
  providers: [CartService, AbandonedCartProcessor],
  exports: [CartService],
})
export class CartModule {}