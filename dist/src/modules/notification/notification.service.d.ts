import { PrismaService } from '../../prisma/prisma.service';
export declare class NotificationService {
    private prisma;
    constructor(prisma: PrismaService);
    findByUser(userId: number, page?: number, pageSize?: number): Promise<{
        list: ({
            mold: {
                moldNumber: string;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            type: import(".prisma/client").$Enums.NotificationType;
            moldId: number | null;
            userId: number;
            title: string;
            message: string;
            isRead: boolean;
        })[];
        total: number;
        unread: number;
        page: number;
        pageSize: number;
    }>;
    markRead(id: number, userId: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllRead(userId: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getUnreadCount(userId: number): Promise<number>;
    createForAllAdmins(data: {
        type: any;
        title: string;
        message: string;
        moldId?: number;
    }): Promise<void>;
}
