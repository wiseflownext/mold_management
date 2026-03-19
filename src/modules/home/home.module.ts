import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { MoldModule } from '../mold/mold.module';
import { ReminderModule } from '../reminder/reminder.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [MoldModule, ReminderModule, NotificationModule],
  controllers: [HomeController],
})
export class HomeModule {}
