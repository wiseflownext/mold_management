import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, ResetPasswordDto, QueryUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditLogService } from '../audit-log/audit-log.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private service: UserService, private audit: AuditLogService) {}

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateUserDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles('admin')
  findAll(@Query() query: QueryUserDto) {
    return this.service.findAll(query);
  }

  @Get('profile')
  getProfile(@CurrentUser('id') id: number) {
    return this.service.findOne(id);
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.service.update(id, dto);
  }

  @Put(':id/reset-password')
  @Roles('admin')
  async resetPassword(@Param('id', ParseIntPipe) id: number, @Body() dto: ResetPasswordDto, @CurrentUser() user: any, @Req() req: any) {
    await this.service.resetPassword(id, dto.newPassword);
    this.audit.log({ companyId: user.companyId, userId: user.id, userName: user.name, action: 'RESET_PASSWORD', targetType: 'user', targetId: id, ip: req.ip });
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any, @Req() req: any) {
    const target = await this.service.findOne(id);
    await this.service.remove(id);
    this.audit.log({ companyId: user.companyId, userId: user.id, userName: user.name, action: 'DELETE', targetType: 'user', targetId: id, detail: `删除用户 ${target.name}`, ip: req.ip });
  }
}
