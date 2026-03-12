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
exports.WorkshopService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let WorkshopService = class WorkshopService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(name) {
        const exists = await this.prisma.workshop.findUnique({ where: { name } });
        if (exists)
            throw new common_1.ConflictException('车间名已存在');
        return this.prisma.workshop.create({ data: { name } });
    }
    findAll() {
        return this.prisma.workshop.findMany({ orderBy: { createdAt: 'asc' } });
    }
    async update(id, name) {
        const ws = await this.prisma.workshop.findUnique({ where: { id } });
        if (!ws)
            throw new common_1.NotFoundException('车间不存在');
        return this.prisma.workshop.update({ where: { id }, data: { name } });
    }
    async remove(id) {
        const ws = await this.prisma.workshop.findUnique({ where: { id } });
        if (!ws)
            throw new common_1.NotFoundException('车间不存在');
        return this.prisma.workshop.delete({ where: { id } });
    }
};
exports.WorkshopService = WorkshopService;
exports.WorkshopService = WorkshopService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkshopService);
//# sourceMappingURL=workshop.service.js.map