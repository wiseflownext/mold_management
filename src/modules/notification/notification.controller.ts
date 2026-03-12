import { Controller, Get, Put, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private service: NotificationService) {}

  @Get()
  findAll(
    @CurrentUser('id') userId: number,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.findByUser(userId, +(page || 1), +(pageSize || 20));
  }

  @Get('unread-count')
  unreadCount(@CurrentUser('id') userId: number) {
    return this.service.getUnreadCount(userId);
  }

  @Put(':id/read')
  markRead(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.service.markRead(id, userId);
  }

  @Put('read-all')
  markAllRead(@CurrentUser('id') userId: number) {
    return this.service.markAllRead(userId);
  }
}
