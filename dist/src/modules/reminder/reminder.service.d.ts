import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
export declare class ReminderService {
    private prisma;
    private notificationService;
    constructor(prisma: PrismaService, notificationService: NotificationService);
    findAll(): Promise<{
        id: number;
        updatedAt: Date;
        moldType: import(".prisma/client").$Enums.MoldType;
        enabled: boolean;
        remainingThreshold: number;
        warningPercent: number;
        overduePercent: number;
    }[]>;
    update(id: number, data: {
        enabled?: boolean;
        remainingThreshold?: number;
        warningPercent?: number;
        overduePercent?: number;
    }): Promise<{
        id: number;
        updatedAt: Date;
        moldType: import(".prisma/client").$Enums.MoldType;
        enabled: boolean;
        remainingThreshold: number;
        warningPercent: number;
        overduePercent: number;
    }>;
    checkMaintenanceReminders(): Promise<void>;
    private getUsageSinceLastMaintenance;
    getMaintenanceAlerts(): Promise<{
        moldId: number;
        moldNumber: string;
        type: string;
        sinceLastMaint: number;
        maintenanceCycle: number;
        ratio: number;
        level: string;
    }[]>;
}
