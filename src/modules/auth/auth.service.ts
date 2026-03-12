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

  async login(username: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { workshop: true },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

    const payload = { sub: user.id, role: user.role };
    return {
      accessToken: this.jwt.sign(payload),
      refreshToken: this.jwt.sign(payload, { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }),
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        workshop: user.workshop?.name,
      },
    };
  }

  async refreshToken(token: string) {
    try {
      const decoded = this.jwt.verify(token);
      const payload = { sub: decoded.sub, role: decoded.role };
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
