import { NotificationService } from './notification.service';
export declare class NotificationController {
    private service;
    constructor(service: NotificationService);
    findAll(userId: number, page?: string, pageSize?: string): Promise<{
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
    unreadCount(userId: number): Promise<number>;
    markRead(id: number, userId: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllRead(userId: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
