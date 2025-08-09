import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BusinessModule } from './modules/business/business.module';
import { CategoryModule } from './modules/category/category.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { RedisModule } from './modules/redis/redis.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    BusinessModule,
    CategoryModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
