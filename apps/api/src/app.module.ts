import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/category/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { StoresModule } from './modules/stores/stores.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SellerModule } from './modules/seller/seller.module';
import { DisputesModule } from './modules/disputes/disputes.module';
import { AdminModule } from './modules/admin/admin.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { RiskModule } from './modules/risk/risk.module';
import { AiModule } from './modules/ai/ai.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { ServicesModule } from './modules/services/services.module';
import { ChatModule } from './modules/chat/chat.module';
import { PlatformModule } from './modules/platform/platform.module';
import { SearchModule } from './modules/search/search.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ReturnsModule } from './modules/returns/returns.module';
import { CacheModule } from './common/cache/cache.module';
import { PushModule } from './modules/push/push.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    ScheduleModule.forRoot(), // sane default for every route
    BullModule.forRoot({ connection: { url: process.env.REDIS_URL } }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    StoresModule,
    WishlistModule,
    AddressesModule,
    CartModule,
    OrdersModule,
    TrackingModule,
    ReviewsModule,
    SellerModule,
    DisputesModule,
    AdminModule,
    NotificationsModule,
    RiskModule,
    AiModule,
    UploadsModule,
    ServicesModule,
    ChatModule,
    PlatformModule,
    SearchModule,
    CouponsModule,
    ReturnsModule,
    CacheModule,
    PushModule
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}