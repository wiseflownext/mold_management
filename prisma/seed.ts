import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.upsert({
    where: { code: 'default' },
    update: {},
    create: { name: '默认公司', code: 'default' },
  });

  console.log(`Company: ${company.name} (id=${company.id})`);

  const hash = await bcrypt.hash('admin123', 10);

  await prisma.workshop.upsert({
    where: { companyId_name: { companyId: company.id, name: '挤出车间' } },
    update: {},
    create: { companyId: company.id, name: '挤出车间', isDefault: true },
  });
  await prisma.workshop.upsert({
    where: { companyId_name: { companyId: company.id, name: '后续车间' } },
    update: {},
    create: { companyId: company.id, name: '后续车间', isDefault: true },
  });

  const ws = await prisma.workshop.findFirst({ where: { companyId: company.id, name: '挤出车间' } });

  await prisma.user.upsert({
    where: { companyId_username: { companyId: company.id, username: 'admin' } },
    update: {},
    create: {
      companyId: company.id,
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
    where: { companyId_username: { companyId: company.id, username: 'operator1' } },
    update: {},
    create: {
      companyId: company.id,
      username: 'operator1',
      name: '操作员',
      phone: '13800138002',
      password: operatorHash,
      role: 'operator',
      workshopId: ws?.id,
    },
  });

  for (const mt of ['COMPRESSION', 'EXTRUSION', 'CORNER'] as const) {
    await prisma.reminderSetting.upsert({
      where: { companyId_moldType: { companyId: company.id, moldType: mt } },
      update: {},
      create: {
        companyId: company.id,
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
