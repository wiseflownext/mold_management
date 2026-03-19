"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const user_module_1 = require("./modules/user/user.module");
const mold_module_1 = require("./modules/mold/mold.module");
const usage_record_module_1 = require("./modules/usage-record/usage-record.module");
const maintenance_record_module_1 = require("./modules/maintenance-record/maintenance-record.module");
const workshop_module_1 = require("./modules/workshop/workshop.module");
const notification_module_1 = require("./modules/notification/notification.module");
const reminder_module_1 = require("./modules/reminder/reminder.module");
const report_module_1 = require("./modules/report/report.module");
const upload_module_1 = require("./modules/upload/upload.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            mold_module_1.MoldModule,
            usage_record_module_1.UsageRecordModule,
            maintenance_record_module_1.MaintenanceRecordModule,
            workshop_module_1.WorkshopModule,
            notification_module_1.NotificationModule,
            reminder_module_1.ReminderModule,
            report_module_1.ReportModule,
            upload_module_1.UploadModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map