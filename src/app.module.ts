import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
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

@Module({
  imports: [
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
  ],
})
export class AppModule {}
