"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    const hash = await bcrypt.hash('admin123', 10);
    await prisma.workshop.createMany({
        data: [
            { name: '挤出车间', isDefault: true },
            { name: '后续车间', isDefault: true },
        ],
        skipDuplicates: true,
    });
    const ws = await prisma.workshop.findFirst({ where: { name: '挤出车间' } });
    await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            name: '管理员',
            phone: '13800138001',
            password: hash,
            role: 'admin',
            workshopId: ws?.id,
        },
    });
    const operatorHash = await bcrypt.hash('user123', 10);
    await prisma.user.upsert({
        where: { username: 'operator1' },
        update: {},
        create: {
            username: 'operator1',
            name: '操作员',
            phone: '13800138002',
            password: operatorHash,
            role: 'operator',
            workshopId: ws?.id,
        },
    });
    for (const mt of ['COMPRESSION', 'EXTRUSION', 'CORNER']) {
        await prisma.reminderSetting.upsert({
            where: { moldType: mt },
            update: {},
            create: {
                moldType: mt,
                enabled: true,
                remainingThreshold: mt === 'COMPRESSION' ? 300 : mt === 'EXTRUSION' ? 200 : 150,
                warningPercent: 80,
                overduePercent: 100,
            },
        });
    }
    console.log('Seed completed');
}
main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map