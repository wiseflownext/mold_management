import { Module } from '@nestjs/common';
import { UsageRecordService } from './usage-record.service';
import { UsageRecordController } from './usage-record.controller';
import { ReminderModule } from '../reminder/reminder.module';

@Module({
  imports: [ReminderModule],
  controllers: [UsageRecordController],
  providers: [UsageRecordService],
})
export class UsageRecordModule {}
