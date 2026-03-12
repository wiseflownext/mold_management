import { Module } from '@nestjs/common';
import { UsageRecordService } from './usage-record.service';
import { UsageRecordController } from './usage-record.controller';

@Module({
  controllers: [UsageRecordController],
  providers: [UsageRecordService],
})
export class UsageRecordModule {}
