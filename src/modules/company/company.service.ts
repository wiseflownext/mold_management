import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto, InitAdminDto } from './dto/company.dto';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCompanyDto) {
    const exists = await this.prisma.company.findUnique({ where: { code: dto.code } });
    if (exists) throw new ConflictException('公司编码已存在');
    const company = await this.prisma.company.create({ data: dto });

    await this.prisma.reminderSetting.createMany({
      data: [
        { companyId: company.id, moldType: 'COMPRESSION' },
        { companyId: company.id, moldType: 'EXTRUSION' },
        { companyId: company.id, moldType: 'CORNER' },
      ],
    });

    return company;
  }

  async findAll() {
    return this.prisma.company.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { users: true, molds: true, workshops: true } },
      },
    });
  }

  async findOne(id: number) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        _count: { select: { users: true, molds: true, workshops: true } },
      },
    });
    if (!company) throw new NotFoundException('公司不存在');
    return company;
  }

  async update(id: number, dto: UpdateCompanyDto) {
    await this.findOne(id);
    return this.prisma.company.update({ where: { id }, data: dto });
  }

  async initAdmin(companyId: number, dto: InitAdminDto) {
    await this.findOne(companyId);
    const exists = await this.prisma.user.findFirst({
      where: { companyId, username: dto.username },
    });
    if (exists) throw new ConflictException('该公司下用户名已存在');

    return this.prisma.user.create({
      data: {
        companyId,
        username: dto.username,
        password: await bcrypt.hash(dto.password, 10),
        name: dto.name,
        phone: dto.phone,
        role: 'admin',
      },
      select: { id: true, username: true, name: true, role: true, companyId: true },
    });
  }
}
