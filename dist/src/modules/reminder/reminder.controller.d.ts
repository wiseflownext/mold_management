import { ReminderService } from './reminder.service';
export declare class ReminderController {
    private service;
    constructor(service: ReminderService);
    findAll(): Promise<{
        id: number;
        updatedAt: Date;
        moldType: import(".prisma/client").$Enums.MoldType;
        enabled: boolean;
        remainingThreshold: number;
        warningPercent: number;
        overduePercent: number;
    }[]>;
    update(id: number, data: any): Promise<{
        id: number;
        updatedAt: Date;
        moldType: import(".prisma/client").$Enums.MoldType;
        enabled: boolean;
        remainingThreshold: number;
        warningPercent: number;
        overduePercent: number;
    }>;
    getAlerts(): Promise<{
        moldId: number;
        moldNumber: string;
        type: string;
        sinceLastMaint: number;
        maintenanceCycle: number;
        ratio: number;
        level: string;
    }[]>;
}
