import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly cls: ClsService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = await super.canActivate(context);
    if (result) {
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      if (user?.companyId) {
        this.cls.set('companyId', user.companyId);
      }
      if (user?.id) {
        this.cls.set('userId', user.id);
      }
    }
    return result as boolean;
  }
}
