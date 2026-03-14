import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { MoldModule } from './modules/mold/mold.module';
import { UsageRecordModule } from './modules/usage-record/usage-record.module';
import { MaintenanceRecordModule } from './modules/maintenance-record/maintenance-record.module';
import { WorkshopModule } from './modules/workshop/workshop.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ReminderModule } from './modules/reminder/reminder.module';
import { ReportModule } from './modules/report/report.module';
import { UploadModule } from './modules/upload/upload.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { HomeModule } from './modules/home/home.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UserModule,
    MoldModule,
    UsageRecordModule,
    MaintenanceRecordModule,
    WorkshopModule,
    NotificationModule,
    ReminderModule,
    ReportModule,
    UploadModule,
    AuditLogModule,
    HomeModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
