import { Module } from '@nestjs/common';
import { MaintenanceRecordService } from './maintenance-record.service';
import { MaintenanceRecordController } from './maintenance-record.controller';

@Module({
  controllers: [MaintenanceRecordController],
  providers: [MaintenanceRecordService],
})
export class MaintenanceRecordModule {}
