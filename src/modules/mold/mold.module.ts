import { Module } from '@nestjs/common';
import { MoldService } from './mold.service';
import { MoldController } from './mold.controller';

@Module({
  controllers: [MoldController],
  providers: [MoldService],
  exports: [MoldService],
})
export class MoldModule {}
