import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkshopService {
  constructor(private prisma: PrismaService) {}

  async create(name: string) {
    const companyId = this.prisma.requireCompanyId();
    const exists = await this.prisma.workshop.findFirst({ where: { companyId, name } });
    if (exists) throw new ConflictException('车间名已存在');
    return this.prisma.workshop.create({ data: { companyId, name } });
  }

  findAll() {
    const companyId = this.prisma.requireCompanyId();
    return this.prisma.workshop.findMany({ where: { companyId }, orderBy: { createdAt: 'asc' } });
  }

  async update(id: number, name: string) {
    const companyId = this.prisma.requireCompanyId();
    const ws = await this.prisma.workshop.findFirst({ where: { id, companyId } });
    if (!ws) throw new NotFoundException('车间不存在');
    return this.prisma.workshop.update({ where: { id }, data: { name } });
  }

  async remove(id: number) {
    const companyId = this.prisma.requireCompanyId();
    const ws = await this.prisma.workshop.findFirst({ where: { id, companyId } });
    if (!ws) throw new NotFoundException('车间不存在');

    const [moldCount, userCount] = await Promise.all([
      this.prisma.mold.count({ where: { workshopId: id, companyId } }),
      this.prisma.user.count({ where: { workshopId: id, companyId } }),
    ]);

    if (moldCount > 0) throw new ConflictException(`该车间下有 ${moldCount} 个模具，无法删除`);
    if (userCount > 0) throw new ConflictException(`该车间下有 ${userCount} 个用户，无法删除`);

    return this.prisma.workshop.delete({ where: { id } });
  }
}
