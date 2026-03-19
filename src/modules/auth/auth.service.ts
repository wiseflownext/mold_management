import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(companyCode: string, username: string, password: string) {
    const company = await this.prisma.company.findUnique({
      where: { code: companyCode },
    });
    if (!company || !company.isActive) {
      throw new UnauthorizedException('公司编码无效或已停用');
    }

    const user = await this.prisma.user.findFirst({
      where: { companyId: company.id, username },
      include: { workshop: true },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

    const payload = { sub: user.id, role: user.role, companyId: company.id };
    return {
      accessToken: this.jwt.sign(payload),
      refreshToken: this.jwt.sign(payload, { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }),
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        companyId: company.id,
        companyName: company.name,
        workshop: user.workshop?.name,
        workshopId: user.workshopId,
      },
    };
  }

  async refreshToken(token: string) {
    try {
      const decoded = this.jwt.verify(token);
      const payload = { sub: decoded.sub, role: decoded.role, companyId: decoded.companyId };
      return {
        accessToken: this.jwt.sign(payload),
        refreshToken: this.jwt.sign(payload, { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }),
      };
    } catch {
      throw new UnauthorizedException('令牌已过期');
    }
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
      throw new BadRequestException('原密码错误');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: await bcrypt.hash(newPassword, 10) },
    });
  }
}
