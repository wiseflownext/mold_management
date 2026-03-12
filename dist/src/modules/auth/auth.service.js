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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const prisma_service_1 = require("../../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    async login(username, password) {
        const user = await this.prisma.user.findUnique({
            where: { username },
            include: { workshop: true },
        });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new common_1.UnauthorizedException('用户名或密码错误');
        }
        await this.prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
        const payload = { sub: user.id, role: user.role };
        return {
            accessToken: this.jwt.sign(payload),
            refreshToken: this.jwt.sign(payload, { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }),
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                workshop: user.workshop?.name,
            },
        };
    }
    async refreshToken(token) {
        try {
            const decoded = this.jwt.verify(token);
            const payload = { sub: decoded.sub, role: decoded.role };
            return {
                accessToken: this.jwt.sign(payload),
                refreshToken: this.jwt.sign(payload, { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }),
            };
        }
        catch {
            throw new common_1.UnauthorizedException('令牌已过期');
        }
    }
    async changePassword(userId, oldPassword, newPassword) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
            throw new common_1.BadRequestException('原密码错误');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: await bcrypt.hash(newPassword, 10) },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map