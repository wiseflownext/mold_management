import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly cls: ClsService) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  get currentCompanyId(): number | undefined {
    return this.cls.get('companyId');
  }

  get currentUserId(): number | undefined {
    return this.cls.get('userId');
  }

  requireCompanyId(): number {
    const id = this.currentCompanyId;
    if (!id) throw new Error('companyId not set in request context');
    return id;
  }
}
