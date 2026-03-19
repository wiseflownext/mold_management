import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, QueryUserDto } from './dto/user.dto';

const userSelect = {
  id: true, username: true, name: true, phone: true, role: true,
  companyId: true, workshopId: true, workshop: true, lastLogin: true, createdAt: true,
};

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const companyId = this.prisma.requireCompanyId();
    const exists = await this.prisma.user.findFirst({
      where: { companyId, username: dto.username },
    });
    if (exists) throw new ConflictException('用户名已存在');
    return this.prisma.user.create({
      data: { ...dto, companyId, role: dto.role as any, password: await bcrypt.hash(dto.password, 10) },
      select: userSelect,
    });
  }

  async findAll(query: QueryUserDto) {
    const companyId = this.prisma.requireCompanyId();
    const { keyword, role, page = 1, pageSize = 20 } = query;
    const where: any = { companyId };
    if (keyword) where.OR = [{ username: { contains: keyword } }, { name: { contains: keyword } }];
    if (role) where.role = role;

    const [list, total] = await Promise.all([
      this.prisma.user.findMany({ where, select: userSelect, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      this.prisma.user.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }

  async findOne(id: number) {
    const companyId = this.prisma.requireCompanyId();
    const user = await this.prisma.user.findFirst({ where: { id, companyId }, select: userSelect });
    if (!user) throw new NotFoundException('用户不存在');
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findOne(id);
    return this.prisma.user.update({ where: { id }, data: dto as any, select: userSelect });
  }

  async resetPassword(id: number, newPassword: string) {
    await this.findOne(id);
    await this.prisma.user.update({ where: { id }, data: { password: await bcrypt.hash(newPassword, 10) } });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id } });
  }
}
