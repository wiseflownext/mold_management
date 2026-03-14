import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMaintenanceRecordDto, QueryMaintenanceRecordDto } from './dto/maintenance-record.dto';

@Injectable()
export class MaintenanceRecordService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMaintenanceRecordDto, operatorId: number) {
    const mold = await this.prisma.mold.findUnique({ where: { id: dto.moldId } });
    if (!mold) throw new NotFoundException('模具不存在');
    if (mold.status === 'SCRAPPED') throw new BadRequestException('报废模具禁止录入任何记录');

    return this.prisma.maintenanceRecord.create({
      data: {
        moldId: dto.moldId,
        type: dto.type as any,
        content: dto.content,
        recordDate: new Date(dto.recordDate),
        operatorId,
      },
      include: { mold: { select: { moldNumber: true } }, operator: { select: { name: true } } },
    });
  }

  async findAll(query: QueryMaintenanceRecordDto) {
    const { moldId, operatorId, type, startDate, endDate, page = 1, pageSize = 20 } = query;
    const where: any = {};
    if (moldId) where.moldId = moldId;
    if (operatorId) where.operatorId = operatorId;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.recordDate = {};
      if (startDate) where.recordDate.gte = new Date(startDate);
      if (endDate) where.recordDate.lte = new Date(endDate);
    }

    const [list, total] = await Promise.all([
      this.prisma.maintenanceRecord.findMany({
        where,
        include: { mold: { select: { moldNumber: true } }, operator: { select: { name: true } } },
        orderBy: { recordDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.maintenanceRecord.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }

  async remove(id: number) {
    const record = await this.prisma.maintenanceRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('记录不存在');
    return this.prisma.maintenanceRecord.delete({ where: { id } });
  }
}
