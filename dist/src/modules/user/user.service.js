"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcryptjs");
const prisma_service_1 = require("../../prisma/prisma.service");
const userSelect = { id: true, username: true, name: true, phone: true, role: true, workshopId: true, workshop: true, lastLogin: true, createdAt: true };
let UserService = class UserService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const exists = await this.prisma.user.findUnique({ where: { username: dto.username } });
        if (exists)
            throw new common_1.ConflictException('用户名已存在');
        return this.prisma.user.create({
            data: { ...dto, role: dto.role, password: await bcrypt.hash(dto.password, 10) },
            select: userSelect,
        });
    }
    async findAll(query) {
        const { keyword, role, page = 1, pageSize = 20 } = query;
        const where = {};
        if (keyword)
            where.OR = [{ username: { contains: keyword } }, { name: { contains: keyword } }];
        if (role)
            where.role = role;
        const [list, total] = await Promise.all([
            this.prisma.user.findMany({ where, select: userSelect, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
            this.prisma.user.count({ where }),
        ]);
        return { list, total, page, pageSize };
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({ where: { id }, select: userSelect });
        if (!user)
            throw new common_1.NotFoundException('用户不存在');
        return user;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.user.update({ where: { id }, data: dto, select: userSelect });
    }
    async resetPassword(id, newPassword) {
        await this.findOne(id);
        await this.prisma.user.update({ where: { id }, data: { password: await bcrypt.hash(newPassword, 10) } });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.user.delete({ where: { id } });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map