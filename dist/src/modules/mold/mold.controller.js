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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoldController = void 0;
const common_1 = require("@nestjs/common");
const mold_service_1 = require("./mold.service");
const mold_dto_1 = require("./dto/mold.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let MoldController = class MoldController {
    constructor(moldService) {
        this.moldService = moldService;
    }
    create(dto) {
        return this.moldService.create(dto);
    }
    findAll(query) {
        return this.moldService.findAll(query);
    }
    getStatistics() {
        return this.moldService.getStatistics();
    }
    getTodaySummary() {
        return this.moldService.getTodaySummary();
    }
    findOne(id) {
        return this.moldService.findOne(id);
    }
    update(id, dto) {
        return this.moldService.update(id, dto);
    }
    updateDesignLife(id, dto, userId) {
        return this.moldService.updateDesignLife(id, dto, userId);
    }
    remove(id) {
        return this.moldService.remove(id);
    }
    addProduct(id, data) {
        return this.moldService.addProduct(id, data);
    }
    removeProduct(productId) {
        return this.moldService.removeProduct(productId);
    }
};
exports.MoldController = MoldController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mold_dto_1.CreateMoldDto]),
    __metadata("design:returntype", void 0)
], MoldController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mold_dto_1.QueryMoldDto]),
    __metadata("design:returntype", void 0)
], MoldController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('statistics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MoldController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('today-summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MoldController.prototype, "getTodaySummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], MoldController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, mold_dto_1.UpdateMoldDto]),
    __metadata("design:returntype", void 0)
], MoldController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/design-life'),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, mold_dto_1.UpdateDesignLifeDto, Number]),
    __metadata("design:returntype", void 0)
], MoldController.prototype, "updateDesignLife", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], MoldController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/products'),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], MoldController.prototype, "addProduct", null);
__decorate([
    (0, common_1.Delete)('products/:productId'),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('productId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], MoldController.prototype, "removeProduct", null);
exports.MoldController = MoldController = __decorate([
    (0, common_1.Controller)('molds'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [mold_service_1.MoldService])
], MoldController);
//# sourceMappingURL=mold.controller.js.map