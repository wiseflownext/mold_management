import { Controller, Get, Put, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { UpdateReminderSettingDto } from './dto/reminder.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('reminders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReminderController {
  constructor(private service: ReminderService) {}

  @Get('settings')
  findAll() {
    return this.service.findAll();
  }

  @Put('settings/:id')
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReminderSettingDto) {
    return this.service.update(id, dto);
  }

  @Get('alerts')
  getAlerts() {
    return this.service.getMaintenanceAlerts();
  }
}
