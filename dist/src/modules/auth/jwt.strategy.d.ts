import { Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(prisma: PrismaService);
    validate(payload: {
        sub: number;
        role: string;
    }): Promise<{
        id: number;
        username: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        workshopId: number | null;
    }>;
}
export {};
