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
exports.UsageRecordController = void 0;
const common_1 = require("@nestjs/common");
const usage_record_service_1 = require("./usage-record.service");
const usage_record_dto_1 = require("./dto/usage-record.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let UsageRecordController = class UsageRecordController {
    constructor(service) {
        this.service = service;
    }
    create(dto, userId) {
        return this.service.create(dto, userId);
    }
    findAll(query) {
        return this.service.findAll(query);
    }
    remove(id) {
        return this.service.remove(id);
    }
};
exports.UsageRecordController = UsageRecordController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [usage_record_dto_1.CreateUsageRecordDto, Number]),
    __metadata("design:returntype", void 0)
], UsageRecordController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [usage_record_dto_1.QueryUsageRecordDto]),
    __metadata("design:returntype", void 0)
], UsageRecordController.prototype, "findAll", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UsageRecordController.prototype, "remove", null);
exports.UsageRecordController = UsageRecordController = __decorate([
    (0, common_1.Controller)('usage-records'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [usage_record_service_1.UsageRecordService])
], UsageRecordController);
//# sourceMappingURL=usage-record.controller.js.map