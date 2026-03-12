"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageRecordModule = void 0;
const common_1 = require("@nestjs/common");
const usage_record_service_1 = require("./usage-record.service");
const usage_record_controller_1 = require("./usage-record.controller");
let UsageRecordModule = class UsageRecordModule {
};
exports.UsageRecordModule = UsageRecordModule;
exports.UsageRecordModule = UsageRecordModule = __decorate([
    (0, common_1.Module)({
        controllers: [usage_record_controller_1.UsageRecordController],
        providers: [usage_record_service_1.UsageRecordService],
    })
], UsageRecordModule);
//# sourceMappingURL=usage-record.module.js.map