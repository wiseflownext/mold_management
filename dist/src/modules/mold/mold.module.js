"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoldModule = void 0;
const common_1 = require("@nestjs/common");
const mold_service_1 = require("./mold.service");
const mold_controller_1 = require("./mold.controller");
let MoldModule = class MoldModule {
};
exports.MoldModule = MoldModule;
exports.MoldModule = MoldModule = __decorate([
    (0, common_1.Module)({
        controllers: [mold_controller_1.MoldController],
        providers: [mold_service_1.MoldService],
        exports: [mold_service_1.MoldService],
    })
], MoldModule);
//# sourceMappingURL=mold.module.js.map