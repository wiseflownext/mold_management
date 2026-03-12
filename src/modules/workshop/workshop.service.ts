import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkshopService {
  constructor(private prisma: PrismaService) {}

  async create(name: string) {
    const exists = await this.prisma.workshop.findUnique({ where: { name } });
    if (exists) throw new ConflictException('车间名已存在');
    return this.prisma.workshop.create({ data: { name } });
  }

  findAll() {
    return this.prisma.workshop.findMany({ orderBy: { createdAt: 'asc' } });
  }

  async update(id: number, name: string) {
    const ws = await this.prisma.workshop.findUnique({ where: { id } });
    if (!ws) throw new NotFoundException('车间不存在');
    return this.prisma.workshop.update({ where: { id }, data: { name } });
  }

  async remove(id: number) {
    const ws = await this.prisma.workshop.findUnique({ where: { id } });
    if (!ws) throw new NotFoundException('车间不存在');
    return this.prisma.workshop.delete({ where: { id } });
  }
}
