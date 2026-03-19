import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MoldService } from '../mold/mold.service';
import { ReminderService } from '../reminder/reminder.service';
import { NotificationService } from '../notification/notification.service';

@Controller('home')
@UseGuards(JwtAuthGuard)
export class HomeController {
  constructor(
    private moldService: MoldService,
    private reminderService: ReminderService,
    private notificationService: NotificationService,
  ) {}

  @Get('dashboard')
  async dashboard(@CurrentUser('id') userId: number) {
    const [statistics, todaySummary, alerts, unreadCount] = await Promise.all([
      this.moldService.getStatistics(),
      this.moldService.getTodaySummary(),
      this.reminderService.getMaintenanceAlerts(),
      this.notificationService.getUnreadCount(userId),
    ]);
    return { statistics, todaySummary, alerts, unreadCount };
  }
}
