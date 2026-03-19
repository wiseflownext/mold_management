import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, ChangePasswordDto, RefreshDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditLogService } from '../audit-log/audit-log.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private audit: AuditLogService) {}

  @Post('login')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  async login(@Body() dto: LoginDto, @Req() req: any) {
    const result = await this.authService.login(dto.companyCode, dto.username, dto.password);
    this.audit.log({
      companyId: result.user.companyId,
      userId: result.user.id,
      userName: result.user.name || dto.username,
      action: 'LOGIN',
      targetType: 'auth',
      detail: '登录',
      ip: req.ip,
    }).catch(() => {});
    return result;
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@CurrentUser('id') userId: number, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(userId, dto.oldPassword, dto.newPassword);
  }
}
