# 模具管理系统 — 多租户（多公司）数据隔离技术方案

> 版本：v1.0 | 日期：2026-03-19

---

## 一、背景与目标

当前系统为**单租户**架构，所有数据存储在同一个 MySQL 数据库中，所有用户共享同一份数据。
现需要支持**多家公司**使用同一套系统，且各公司之间数据**完全隔离**——包括用户、模具、车间、使用记录、维保记录、通知、提醒设置等。

### 核心需求

| # | 需求 | 说明 |
|---|------|------|
| 1 | 数据完全隔离 | A 公司的用户无法看到/操作 B 公司的任何数据 |
| 2 | 独立管理 | 每家公司有自己的管理员，可管理本公司用户、车间、提醒设置 |
| 3 | 用户名隔离 | 不同公司可以有相同用户名（如 `admin`） |
| 4 | 平滑升级 | 现有数据无缝迁移为第一个租户 |
| 5 | 运维简单 | 单实例部署，无需为每个公司独立部署 |

---

## 二、方案选型

### 2.1 三种常见多租户方案对比

| 方案 | 描述 | 隔离级别 | 运维成本 | 适用规模 |
|------|------|----------|----------|----------|
| **A. 独立数据库** | 每个租户一个 MySQL 数据库 | ★★★★★ | 高（需管理 N 个库） | 大型 SaaS |
| **B. 共享数据库 + Schema 隔离** | 同一 MySQL 实例，不同 schema | ★★★★ | 中 | 中型 |
| **C. 共享数据库 + 行级隔离** | 同一数据库，每行记录带 `tenantId` | ★★★ | 低 | 中小型 |

### 2.2 推荐方案：C — 行级隔离（Row-Level Tenancy）

**理由：**
- 当前系统规模为**中小型**（模具数百到数千级别），行级隔离完全够用
- 单数据库运维最简单，只需一个 Prisma schema、一次 migrate
- 部署成本低，PM2 单实例即可
- 通过 Prisma 中间件可自动注入租户过滤，代码侵入性小
- 后续如需更强隔离，可升级为方案 A/B

---

## 三、数据库设计变更

### 3.1 新增 `Company` 模型（租户表）

```prisma
model Company {
  id        Int      @id @default(autoincrement())
  name      String   @db.VarChar(100)           // 公司名称
  code      String   @unique @db.VarChar(50)    // 公司唯一编码（用于登录等）
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  users              User[]
  workshops          Workshop[]
  molds              Mold[]
  reminderSettings   ReminderSetting[]
  auditLogs          AuditLog[]

  @@map("companies")
}
```

### 3.2 现有模型加 `companyId` 字段

以下所有模型需新增 `companyId` 外键：

```prisma
model User {
  // ... 现有字段 ...
  companyId  Int      @map("company_id")
  company    Company  @relation(fields: [companyId], references: [id])

  // 用户名改为 公司内唯一（而非全局唯一）
  @@unique([companyId, username])
  @@map("users")
}

model Workshop {
  // ... 现有字段 ...
  companyId  Int      @map("company_id")
  company    Company  @relation(fields: [companyId], references: [id])

  // 车间名称改为公司内唯一
  @@unique([companyId, name])
  @@map("workshops")
}

model Mold {
  // ... 现有字段 ...
  companyId  Int      @map("company_id")
  company    Company  @relation(fields: [companyId], references: [id])

  // 模具编号改为公司内唯一
  @@unique([companyId, moldNumber])
  @@map("molds")
}

model ReminderSetting {
  // ... 现有字段 ...
  companyId  Int      @map("company_id")
  company    Company  @relation(fields: [companyId], references: [id])

  // 每个公司每种模具类型一条配置
  @@unique([companyId, moldType])
  @@map("reminder_settings")
}

model AuditLog {
  // ... 现有字段 ...
  companyId  Int      @map("company_id")
  @@map("audit_logs")
}
```

**注意：** `MoldProduct`、`UsageRecord`、`MaintenanceRecord`、`CertificationLog`、`Notification` 这些子表**不需要**直接加 `companyId`，因为它们通过外键关联到 `Mold` 或 `User`，而 `Mold`/`User` 已有 `companyId`。查询时通过 JOIN 即可实现隔离。但为了**查询性能**和**安全兜底**，建议也给高频查询的子表加上 `companyId`：

```prisma
model UsageRecord {
  // ... 现有字段 ...
  companyId  Int  @map("company_id")
  @@map("usage_records")
}

model MaintenanceRecord {
  // ... 现有字段 ...
  companyId  Int  @map("company_id")
  @@map("maintenance_records")
}

model Notification {
  // ... 现有字段 ...
  companyId  Int  @map("company_id")
  @@map("notifications")
}
```

### 3.3 完整 ER 关系图

```
Company (1) ─── (N) User
   │                  │
   │                  ├── UsageRecord
   │                  ├── MaintenanceRecord
   │                  ├── CertificationLog
   │                  └── Notification
   │
   ├── (N) Workshop
   │
   ├── (N) Mold
   │         ├── MoldProduct
   │         ├── UsageRecord
   │         ├── MaintenanceRecord
   │         ├── CertificationLog
   │         └── Notification
   │
   ├── (N) ReminderSetting
   └── (N) AuditLog
```

### 3.4 索引策略

```prisma
model Mold {
  @@index([companyId, status])
  @@index([companyId, type])
}

model UsageRecord {
  @@index([companyId, recordDate])
}

model MaintenanceRecord {
  @@index([companyId, recordDate])
}

model Notification {
  @@index([companyId, userId, isRead])
}
```

---

## 四、后端架构变更

### 4.1 JWT Payload 扩展

在 JWT token 中加入 `companyId`：

```typescript
// auth.service.ts — login()
const payload = {
  sub: user.id,
  role: user.role,
  companyId: user.companyId,  // 新增
};
```

### 4.2 JwtStrategy 扩展

```typescript
// jwt.strategy.ts — validate()
async validate(payload: { sub: number; role: string; companyId: number }) {
  const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw new UnauthorizedException();
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    workshopId: user.workshopId,
    companyId: user.companyId,  // 新增
  };
}
```

### 4.3 自动租户过滤 — Prisma 中间件（核心）

创建 `TenantMiddleware`，在 Prisma 层自动注入 `companyId` 过滤条件，避免每个 Service 手动传递：

```typescript
// src/prisma/tenant.middleware.ts

const TENANT_MODELS = [
  'User', 'Workshop', 'Mold', 'MoldProduct',
  'UsageRecord', 'MaintenanceRecord', 'CertificationLog',
  'Notification', 'AuditLog', 'ReminderSetting',
];

// 直接带 companyId 的模型
const DIRECT_TENANT_MODELS = [
  'User', 'Workshop', 'Mold',
  'UsageRecord', 'MaintenanceRecord',
  'Notification', 'AuditLog', 'ReminderSetting',
];
```

> **更可靠的做法：** 使用 NestJS 的 `REQUEST` scope + `ClsService`（Continuation-Local Storage）在每次请求中保存 `companyId`，然后在 Prisma 扩展中自动注入。

#### 方案：Prisma Client Extension + CLS

**Step 1: 安装依赖**

```bash
npm install nestjs-cls
```

**Step 2: 创建 TenantContext**

```typescript
// src/common/tenant/tenant.module.ts
import { Module, Global } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';

@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls, req) => {
          // companyId 从 JWT 中提取，由 JwtAuthGuard 设置
          // 此处先预留，auth guard 设置后可用
        },
      },
    }),
  ],
})
export class TenantModule {}
```

**Step 3: 在 JwtAuthGuard 中注入 companyId**

```typescript
// src/common/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private cls: ClsService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = await super.canActivate(context);
    if (result) {
      const request = context.switchToHttp().getRequest();
      this.cls.set('companyId', request.user.companyId);
      this.cls.set('userId', request.user.id);
    }
    return result as boolean;
  }
}
```

**Step 4: 创建带租户感知的 PrismaService**

```typescript
// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private cls: ClsService) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * 获取当前请求的 companyId
   * 用于需要手动过滤的场景
   */
  get currentCompanyId(): number {
    return this.cls.get('companyId');
  }

  /**
   * 构建租户 where 条件
   */
  tenantWhere(extra: Record<string, any> = {}): Record<string, any> {
    return { companyId: this.currentCompanyId, ...extra };
  }
}
```

### 4.4 Service 层改造示例

以 `MoldService` 为例，展示改造方式：

```typescript
// mold.service.ts
@Injectable()
export class MoldService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMoldDto) {
    const companyId = this.prisma.currentCompanyId;

    // 唯一性检查改为公司内唯一
    const exists = await this.prisma.mold.findFirst({
      where: { companyId, moldNumber: dto.moldNumber },
    });
    if (exists) throw new ConflictException('模具编号已存在');

    return this.prisma.mold.create({
      data: {
        ...dto,
        companyId,                    // 自动绑定租户
        workshopId: dto.workshopId,
        products: dto.products?.length
          ? { createMany: { data: dto.products } }
          : undefined,
      },
      include: { products: true, workshop: true },
    });
  }

  async findAll(query: QueryMoldDto) {
    const companyId = this.prisma.currentCompanyId;
    const where: any = { companyId };   // 始终带租户过滤

    if (query.keyword) {
      where.OR = [
        { moldNumber: { contains: query.keyword } },
        { products: { some: { name: { contains: query.keyword } } } },
      ];
    }
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    if (query.workshopId) where.workshopId = query.workshopId;

    const [list, total] = await Promise.all([
      this.prisma.mold.findMany({
        where,
        include: { products: true, workshop: true },
        orderBy: { updatedAt: 'desc' },
        skip: ((query.page || 1) - 1) * (query.pageSize || 20),
        take: query.pageSize || 20,
      }),
      this.prisma.mold.count({ where }),
    ]);

    return { list, total, page: query.page || 1, pageSize: query.pageSize || 20 };
  }

  async findOne(id: number) {
    const companyId = this.prisma.currentCompanyId;
    const mold = await this.prisma.mold.findFirst({
      where: { id, companyId },  // 带租户过滤，防止跨公司访问
      include: { products: true, workshop: true, /* ... */ },
    });
    if (!mold) throw new NotFoundException('模具不存在');
    return mold;
  }

  async getStatistics() {
    const companyId = this.prisma.currentCompanyId;
    const [total, byStatus, byType] = await Promise.all([
      this.prisma.mold.count({ where: { companyId } }),
      this.prisma.mold.groupBy({ by: ['status'], where: { companyId }, _count: true }),
      this.prisma.mold.groupBy({ by: ['type'], where: { companyId }, _count: true }),
    ]);
    return { total, byStatus, byType };
  }

  // ... 其他方法同理
}
```

### 4.5 需要改造的 Service 清单

| Service | 改造内容 |
|---------|---------|
| `AuthService` | login 时查询需带 `companyId`（通过 `companyCode` 确定）；JWT payload 加 `companyId` |
| `UserService` | 所有查询加 `companyId` 过滤；用户名唯一改为公司内唯一 |
| `MoldService` | 所有查询加 `companyId`；模具编号唯一改为公司内唯一 |
| `WorkshopService` | 所有查询加 `companyId`；车间名唯一改为公司内唯一 |
| `UsageRecordService` | 查询加 `companyId`；创建记录带 `companyId` |
| `MaintenanceService` | 同上 |
| `NotificationService` | 同上 |
| `ReminderService` | 提醒设置按公司隔离；告警查询按公司过滤 |
| `ReportService` | 报表查询带 `companyId` |
| `HomeService` | 首页汇总带 `companyId` |
| `AuditLogService` | 审计日志带 `companyId` |
| `UploadService` | OSS 路径增加公司前缀（可选） |

### 4.6 登录流程改造

当前登录仅需 `username + password`。多租户后有两种方式确定公司：

#### 方案 A：登录时携带公司编码（推荐）

```typescript
// dto/login.dto.ts
export class LoginDto {
  @IsString()
  companyCode: string;   // 新增：公司编码

  @IsString()
  username: string;

  @IsString()
  password: string;
}

// auth.service.ts
async login(dto: LoginDto) {
  // 1. 先查公司
  const company = await this.prisma.company.findUnique({
    where: { code: dto.companyCode },
  });
  if (!company || !company.isActive) {
    throw new UnauthorizedException('公司编码无效');
  }

  // 2. 在该公司下查用户
  const user = await this.prisma.user.findFirst({
    where: { companyId: company.id, username: dto.username },
    include: { workshop: true },
  });
  if (!user || !(await bcrypt.compare(dto.password, user.password))) {
    throw new UnauthorizedException('用户名或密码错误');
  }

  // 3. 生成 token（含 companyId）
  const payload = { sub: user.id, role: user.role, companyId: company.id };
  return {
    accessToken: this.jwt.sign(payload),
    refreshToken: this.jwt.sign(payload, { expiresIn: '7d' }),
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      companyId: company.id,
      companyName: company.name,
      workshop: user.workshop?.name,
    },
  };
}
```

#### 方案 B：用户名全局唯一格式 `公司编码\用户名`

不推荐——对用户体验影响大，且改动也不小。

### 4.7 超级管理员（可选）

如果需要一个**平台级管理员**来管理所有公司：

```prisma
enum UserRole {
  superAdmin   // 平台管理员
  admin        // 公司管理员
  operator     // 操作员
}
```

超级管理员不属于任何公司（`companyId` 为 null），可以：
- 创建/编辑/停用公司
- 查看所有公司的数据
- 为公司创建初始管理员

---

## 五、Flutter 客户端改造

### 5.1 登录页面

新增**公司编码**输入框：

```dart
// login_page.dart
class _LoginPageState extends State<LoginPage> {
  final _companyCodeCtrl = TextEditingController();
  final _usernameCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();

  Future<void> _login() async {
    await ref.read(authStateProvider.notifier).login(
      _companyCodeCtrl.text.trim(),   // 新增
      _usernameCtrl.text.trim(),
      _passwordCtrl.text,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          TextField(
            controller: _companyCodeCtrl,
            decoration: InputDecoration(
              labelText: '公司编码',
              prefixIcon: Icon(Icons.business),
            ),
          ),
          TextField(
            controller: _usernameCtrl,
            decoration: InputDecoration(labelText: '用户名'),
          ),
          TextField(
            controller: _passwordCtrl,
            obscureText: true,
            decoration: InputDecoration(labelText: '密码'),
          ),
          // ...
        ],
      ),
    );
  }
}
```

### 5.2 AuthService 改造

```dart
// auth_service.dart
Future<LoginResponse> login(String companyCode, String username, String password) async {
  final resp = await _client.post('/auth/login', data: {
    'companyCode': companyCode,
    'username': username,
    'password': password,
  });
  // 保存 companyCode 到 SharedPreferences（用于下次自动填充）
  final prefs = await SharedPreferences.getInstance();
  await prefs.setString('company_code', companyCode);
  // ... 保存 token、user
}
```

### 5.3 User Model 扩展

```dart
class User {
  final int id;
  final String username;
  final String name;
  final String role;
  final int companyId;          // 新增
  final String companyName;     // 新增
  final String? workshop;
  final int? workshopId;
  // ...
}
```

### 5.4 其他改动

- `ApiClient` 无需改动——`companyId` 已在 JWT token 中，后端自动提取
- 所有 Service/Provider 无需改动——租户过滤在后端完成
- 可选：在 App 顶部/设置页显示当前公司名称

---

## 六、数据迁移方案

### 6.1 迁移步骤

```sql
-- Step 1: 创建 companies 表
CREATE TABLE companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Step 2: 插入默认公司（用于承接现有数据）
INSERT INTO companies (id, name, code) VALUES (1, '默认公司', 'default');

-- Step 3: 各表增加 company_id 列
ALTER TABLE users ADD COLUMN company_id INT NOT NULL DEFAULT 1;
ALTER TABLE workshops ADD COLUMN company_id INT NOT NULL DEFAULT 1;
ALTER TABLE molds ADD COLUMN company_id INT NOT NULL DEFAULT 1;
ALTER TABLE usage_records ADD COLUMN company_id INT NOT NULL DEFAULT 1;
ALTER TABLE maintenance_records ADD COLUMN company_id INT NOT NULL DEFAULT 1;
ALTER TABLE notifications ADD COLUMN company_id INT NOT NULL DEFAULT 1;
ALTER TABLE audit_logs ADD COLUMN company_id INT NOT NULL DEFAULT 1;
ALTER TABLE reminder_settings ADD COLUMN company_id INT NOT NULL DEFAULT 1;

-- Step 4: 添加外键约束
ALTER TABLE users ADD FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE workshops ADD FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE molds ADD FOREIGN KEY (company_id) REFERENCES companies(id);
-- ... 其他表同理

-- Step 5: 调整唯一约束
ALTER TABLE users DROP INDEX username;
ALTER TABLE users ADD UNIQUE INDEX uk_company_username (company_id, username);

ALTER TABLE workshops DROP INDEX name;
ALTER TABLE workshops ADD UNIQUE INDEX uk_company_workshop (company_id, name);

ALTER TABLE molds DROP INDEX mold_number;
ALTER TABLE molds ADD UNIQUE INDEX uk_company_moldnumber (company_id, mold_number);

ALTER TABLE reminder_settings DROP INDEX mold_type;
ALTER TABLE reminder_settings ADD UNIQUE INDEX uk_company_moldtype (company_id, mold_type);

-- Step 6: 添加索引
ALTER TABLE molds ADD INDEX idx_company_status (company_id, status);
ALTER TABLE molds ADD INDEX idx_company_type (company_id, type);
ALTER TABLE usage_records ADD INDEX idx_company_date (company_id, record_date);
ALTER TABLE maintenance_records ADD INDEX idx_company_date (company_id, record_date);
ALTER TABLE notifications ADD INDEX idx_company_user_read (company_id, user_id, is_read);
```

### 6.2 迁移脚本（Prisma Migration）

推荐使用 Prisma Migration 而非手动 SQL：

```bash
# 1. 修改 schema.prisma（加入 Company 模型和所有 companyId 字段）
# 2. 生成迁移
npx prisma migrate dev --name add_multi_tenancy

# 3. 编写数据迁移脚本（在迁移 SQL 中加入）
#    INSERT INTO companies ...
#    UPDATE users SET company_id = 1 ...
```

### 6.3 回滚方案

- 迁移前做完整数据库备份：`mysqldump -u root -p mold_management > backup_before_multitenancy.sql`
- 如果出问题，恢复备份并回退代码

---

## 七、API 接口变更汇总

### 7.1 登录接口

```
POST /api/auth/login

Before:
{ "username": "admin", "password": "123456" }

After:
{ "companyCode": "wiseflow", "username": "admin", "password": "123456" }
```

### 7.2 Response 中增加公司信息

```json
{
  "accessToken": "...",
  "user": {
    "id": 1,
    "username": "admin",
    "name": "管理员",
    "role": "admin",
    "companyId": 1,
    "companyName": "智流科技"
  }
}
```

### 7.3 其余接口不变

所有现有接口的 URL 和参数不变，租户过滤在后端自动完成。客户端只需改登录页面。

### 7.4 新增接口（超级管理员用，可选）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/companies` | 创建公司 |
| GET | `/api/companies` | 公司列表 |
| PUT | `/api/companies/:id` | 编辑公司 |
| PATCH | `/api/companies/:id/toggle` | 启用/停用公司 |
| POST | `/api/companies/:id/init-admin` | 为公司创建初始管理员 |

---

## 八、安全保障

### 8.1 多层防护机制

```
┌─────────────────────────────────────────────────┐
│  Layer 1: JWT Token                             │
│  token 中携带 companyId，每次请求自动校验      │
├─────────────────────────────────────────────────┤
│  Layer 2: JwtAuthGuard + CLS                    │
│  验证 token 后将 companyId 写入请求上下文      │
├─────────────────────────────────────────────────┤
│  Layer 3: Service 层                            │
│  所有查询/写入强制带 companyId 条件             │
├─────────────────────────────────────────────────┤
│  Layer 4: 数据库唯一约束                        │
│  (companyId, username) 等复合唯一索引兜底       │
└─────────────────────────────────────────────────┘
```

### 8.2 防止遗漏的 Code Review Checklist

- [ ] 每个 `prisma.xxx.findMany` / `findFirst` / `count` 都带 `companyId`
- [ ] 每个 `prisma.xxx.create` 的 `data` 都包含 `companyId`
- [ ] `findUnique` 不能仅用 `id`，必须同时带 `companyId`（或改用 `findFirst`）
- [ ] `groupBy` 查询 `where` 中包含 `companyId`
- [ ] `aggregate` 查询 `where` 中包含 `companyId`
- [ ] `delete` / `update` 操作先用 `findFirst({ where: { id, companyId } })` 校验

### 8.3 可选：Prisma 查询拦截器

在 `PrismaService.onModuleInit` 中添加安全拦截，确保带 `companyId` 的模型查询不会遗漏：

```typescript
this.$use(async (params, next) => {
  const tenantModels = ['User', 'Workshop', 'Mold', 'UsageRecord',
    'MaintenanceRecord', 'Notification', 'AuditLog', 'ReminderSetting'];

  if (tenantModels.includes(params.model) && params.action !== 'create') {
    const companyId = this.cls.get('companyId');
    if (companyId) {
      if (['findMany', 'findFirst', 'count', 'aggregate', 'groupBy'].includes(params.action)) {
        params.args.where = { ...params.args.where, companyId };
      }
      if (['updateMany', 'deleteMany'].includes(params.action)) {
        params.args.where = { ...params.args.where, companyId };
      }
    }
  }
  return next(params);
});
```

> **注意：** 这是兜底机制，不应替代 Service 层显式过滤。

---

## 九、实施计划

### Phase 1：数据库和后端（预计 3-4 天）

| 步骤 | 任务 | 预计时间 |
|------|------|---------|
| 1.1 | 修改 Prisma schema，新增 Company 模型和 companyId 字段 | 2h |
| 1.2 | 生成数据库迁移，编写数据迁移 SQL | 2h |
| 1.3 | 安装 `nestjs-cls`，实现 TenantModule 和 CLS 注入 | 3h |
| 1.4 | 改造 AuthService 登录流程 | 2h |
| 1.5 | 改造 JwtStrategy 和 JwtAuthGuard | 1h |
| 1.6 | 改造 PrismaService（加 `currentCompanyId` 等辅助方法） | 1h |
| 1.7 | 逐个改造所有 Service（共 11 个） | 8h |
| 1.8 | 新增 CompanyModule（超级管理员接口） | 3h |
| 1.9 | 全面测试（Swagger / Postman） | 4h |

### Phase 2：Flutter 客户端（预计 1-2 天）

| 步骤 | 任务 | 预计时间 |
|------|------|---------|
| 2.1 | 改造 LoginPage，新增公司编码输入 | 2h |
| 2.2 | 改造 AuthService 和 LoginDto | 1h |
| 2.3 | 扩展 User Model | 0.5h |
| 2.4 | 在设置/个人页面显示公司名称 | 1h |
| 2.5 | 测试完整流程 | 2h |

### Phase 3：部署上线（预计 0.5 天）

| 步骤 | 任务 | 预计时间 |
|------|------|---------|
| 3.1 | 生产环境数据库备份 | 0.5h |
| 3.2 | 执行数据库迁移 | 0.5h |
| 3.3 | 部署新版后端 | 0.5h |
| 3.4 | 发布新版 Flutter App | 0.5h |
| 3.5 | 验证现有数据和功能正常 | 1h |
| 3.6 | 为新客户创建公司和管理员账号 | 0.5h |

---

## 十、后续扩展考虑

| 方向 | 说明 |
|------|------|
| **公司自定义配置** | Company 表可扩展字段：logo、联系方式、许可到期日、功能开关等 |
| **数据存储配额** | 每个公司可设置模具上限、存储空间上限 |
| **独立 OSS 目录** | 文件上传路径加公司前缀 `uploads/{companyCode}/...` |
| **审计增强** | AuditLog 中增加 `companyCode` 便于运维排查 |
| **升级为独立数据库** | 如某客户数据量极大或有合规要求，可将其迁移至独立数据库 |
| **平台管理后台** | 开发 Web 管理后台，供平台管理员管理所有公司 |

---

## 十一、风险与应对

| 风险 | 影响 | 应对 |
|------|------|------|
| Service 改造遗漏某个查询 | 数据泄露 | Prisma 中间件兜底 + Code Review Checklist |
| 迁移时现有数据丢失 | 业务中断 | 迁移前完整备份 + 灰度上线 |
| 性能下降（多了 companyId 过滤） | 响应变慢 | 复合索引 + 数据量监控 |
| JWT 被篡改 companyId | 跨租户访问 | JWT 签名校验保护，且 validate 时从 DB 二次验证 |
| 公司编码记不住 | 用户体验差 | 客户端记住上次输入；或支持公司名称模糊搜索 |

---

## 附录 A：改造涉及文件清单

### 后端

```
prisma/schema.prisma                              — 新增 Company 模型 + companyId 字段
src/prisma/prisma.service.ts                       — 注入 CLS，新增 tenantWhere 等方法
src/common/tenant/tenant.module.ts                 — 新建 TenantModule (CLS)
src/common/guards/jwt-auth.guard.ts                — CLS 注入 companyId
src/modules/auth/auth.service.ts                   — 登录流程改造
src/modules/auth/auth.controller.ts                — LoginDto 变更
src/modules/auth/dto/login.dto.ts                  — 新增 companyCode 字段
src/modules/auth/jwt.strategy.ts                   — payload 加 companyId
src/modules/user/user.service.ts                   — 加租户过滤
src/modules/mold/mold.service.ts                   — 加租户过滤
src/modules/workshop/workshop.service.ts           — 加租户过滤
src/modules/usage-record/usage-record.service.ts   — 加租户过滤
src/modules/maintenance-record/maintenance-record.service.ts — 加租户过滤
src/modules/notification/notification.service.ts   — 加租户过滤
src/modules/reminder/reminder.service.ts           — 加租户过滤
src/modules/report/report.service.ts               — 加租户过滤
src/modules/home/home.service.ts                   — 加租户过滤
src/modules/audit-log/audit-log.service.ts         — 加租户过滤
src/modules/upload/upload.service.ts               — 文件路径加公司前缀（可选）
src/modules/company/ (新建)                        — CompanyModule (CRUD)
src/app.module.ts                                  — 引入 TenantModule、CompanyModule
```

### Flutter

```
lib/pages/login/login_page.dart       — 新增公司编码输入框
lib/services/auth_service.dart        — login 方法增加 companyCode 参数
lib/models/user.dart                  — User 增加 companyId、companyName
lib/providers/auth_provider.dart      — login 方法透传 companyCode
lib/pages/profile/profile_page.dart   — 显示公司名称
lib/pages/profile/settings_page.dart  — 可选：显示公司信息
```
