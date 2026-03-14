import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUsageRecordDto, QueryUsageRecordDto } from './dto/usage-record.dto';

@Injectable()
export class UsageRecordService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUsageRecordDto, operatorId: number) {
    const mold = await this.prisma.mold.findUnique({ where: { id: dto.moldId } });
    if (!mold) throw new NotFoundException('模具不存在');

    const [record] = await this.prisma.$transaction([
      this.prisma.usageRecord.create({
        data: {
          moldId: dto.moldId,
          product: dto.product,
          quantity: dto.quantity,
          shift: dto.shift as any,
          recordDate: new Date(dto.recordDate),
          operatorId,
          note: dto.note,
        },
        include: { mold: { select: { moldNumber: true, workshop: { select: { name: true } } } }, operator: { select: { name: true } } },
      }),
      this.prisma.mold.update({
        where: { id: dto.moldId },
        data: {
          usageCount: { increment: dto.quantity },
          firstUseDate: mold.firstUseDate ? undefined : new Date(dto.recordDate),
        },
      }),
    ]);
    return record;
  }

  async findAll(query: QueryUsageRecordDto) {
    const { moldId, operatorId, startDate, endDate, page = 1, pageSize = 20 } = query;
    const where: any = {};
    if (moldId) where.moldId = moldId;
    if (operatorId) where.operatorId = operatorId;
    if (startDate || endDate) {
      where.recordDate = {};
      if (startDate) where.recordDate.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.recordDate.lte = end;
      }
    }

    const [list, total] = await Promise.all([
      this.prisma.usageRecord.findMany({
        where,
        include: { mold: { select: { moldNumber: true, workshop: { select: { name: true } } } }, operator: { select: { name: true } } },
        orderBy: { recordDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.usageRecord.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }

  async remove(id: number) {
    const record = await this.prisma.usageRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('记录不存在');

    await this.prisma.$transaction([
      this.prisma.usageRecord.delete({ where: { id } }),
      this.prisma.mold.update({
        where: { id: record.moldId },
        data: { usageCount: { decrement: record.quantity } },
      }),
    ]);
  }
}
