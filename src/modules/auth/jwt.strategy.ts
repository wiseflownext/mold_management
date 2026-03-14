import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: (() => {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('JWT_SECRET 环境变量未设置');
        return secret;
      })(),
    });
  }

  async validate(payload: { sub: number; role: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException();
    return { id: user.id, username: user.username, name: user.name, role: user.role, workshopId: user.workshopId };
  }
}
