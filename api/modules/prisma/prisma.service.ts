import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('🗄️  Database connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🗄️  Database disconnected');
  }

  async cleanDb() {
    // Utilitaire pour nettoyer la DB en test
    if (process.env.NODE_ENV === 'production') return;
    
    const models = Reflect.ownKeys(this).filter((key) => key[0] !== '_');
    
    return Promise.all(
      models.map((modelKey) => (this as any)[modelKey].deleteMany()),
    );
  }
}
