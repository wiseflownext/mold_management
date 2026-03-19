# 多租户改造 — 安全实施方案（不影响线上）

> 核心原则：**线上 main 分支和服务一个字都不动，新功能在独立分支 + 独立环境开发验证，最后一次性切换上线。**

---

## 当前线上现状

| 项目 | 现状 |
|------|------|
| 服务器 | `121.40.172.33` |
| 后端 | `/opt/mold-api` → PM2 `mold-api`，端口 `3001`，Nginx 代理到 `8088` |
| 数据库 | 同机 MySQL |
| 分支 | `main`（线上直接拉取） |
| 部署 | `deploy.py` → SSH → git pull main → prisma push → build → pm2 restart |
| App | 硬编码 `http://121.40.172.33:8088/api` |

---

## 实施策略：三件事完全隔离

```
┌──────────────────────────────────────────────────────────┐
│                    线上环境（不动）                         │
│  分支: main                                               │
│  服务: PM2 mold-api → :3001 → Nginx :8088                │
│  数据库: mold_management                                  │
│  App: 指向 :8088                                          │
│  ➜ 继续正常运行，不做任何改动                                │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                  开发环境（新建）                           │
│  分支: feature/multi-tenancy                              │
│  服务: PM2 mold-api-dev → :3002                           │
│  数据库: mold_management_dev（独立库）                      │
│  App: 开发时切到 :3002                                     │
│  ➜ 所有改造工作在这里进行                                   │
└──────────────────────────────────────────────────────────┘

         ┃ 开发完成、测试通过后 ┃
         ▼
┌──────────────────────────────────────────────────────────┐
│                  一次性切换上线                             │
│  merge → main                                             │
│  迁移生产数据库                                            │
│  部署新版后端                                              │
│  发布新版 App                                              │
└──────────────────────────────────────────────────────────┘
```

---

## Step 1：创建开发分支

在本地：

```bash
cd /Users/tim/Documents/mold_management
git checkout -b feature/multi-tenancy
```

**从此刻起，所有多租户改动只在这个分支上进行。**
线上 `main` 分支有 bug 要修？切回 `main` 修，修完可以 `cherry-pick` 到开发分支。

---

## Step 2：服务器上搭建独立开发环境

SSH 到服务器，执行以下操作：

### 2.1 创建独立开发数据库

```bash
mysql -u root -p

# 创建新库
CREATE DATABASE mold_management_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 从生产库复制一份数据用于开发测试
mysqldump -u root -p mold_management > /tmp/mold_backup.sql
mysql -u root -p mold_management_dev < /tmp/mold_backup.sql
```

### 2.2 部署独立开发实例

```bash
# 克隆一份代码到新目录
cd /opt
git clone /opt/mold-api mold-api-dev
cd mold-api-dev
git checkout feature/multi-tenancy    # 或等你推送后 git fetch && checkout

# 创建独立 .env 文件（指向开发库）
cat > .env << 'EOF'
DATABASE_URL="mysql://root:yourpassword@localhost:3306/mold_management_dev"
JWT_SECRET="dev-jwt-secret-different-from-prod"
JWT_REFRESH_EXPIRES=7d
PORT=3002
EOF

# 安装依赖 & 构建
npm install
npx prisma generate
npm run build
```

### 2.3 独立 PM2 进程

创建 `ecosystem.dev.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'mold-api-dev',           // 不同的名字！
    script: 'dist/src/main.js',
    instances: 1,                     // 开发环境 1 个实例够了
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development',
      PORT: 3002,                     // 不同的端口！
    },
    max_memory_restart: '400M',
    error_file: '/var/log/mold-api-dev/error.log',
    out_file: '/var/log/mold-api-dev/out.log',
  }],
};
```

```bash
mkdir -p /var/log/mold-api-dev
pm2 start ecosystem.dev.config.js

# 验证两个服务并行运行
pm2 status
# ┌─────────────────┬────┬─────────┬──────┐
# │ name            │ id │ mode    │ port │
# ├─────────────────┼────┼─────────┼──────┤
# │ mold-api        │ 0  │ cluster │ 3001 │  ← 线上（不动）
# │ mold-api        │ 1  │ cluster │ 3001 │  ← 线上（不动）
# │ mold-api-dev    │ 2  │ fork    │ 3002 │  ← 开发（新建）
# └─────────────────┴────┴─────────┴──────┘
```

### 2.4 Nginx 加一个开发入口（可选）

```nginx
# 在 Nginx 中加一个 server block，不影响原有的
server {
    listen 8089;                       # 开发用端口
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
nginx -t && nginx -s reload
```

现在：
- `http://121.40.172.33:8088` → 线上服务（不动）
- `http://121.40.172.33:8089` → 开发服务（随便折腾）

---

## Step 3：Flutter App 开发环境切换

在 `api.dart` 中加入环境切换能力：

```dart
class ApiConfig {
  ApiConfig._();

  // 开发时切换这里，或用环境变量
  static const bool _isDev = false;

  static const String baseUrl = _isDev
      ? 'http://121.40.172.33:8089/api'     // 开发环境
      : 'http://121.40.172.33:8088/api';    // 生产环境

  // ... 其余不变
}
```

开发多租户功能时把 `_isDev = true`，提交代码时它仍在 `feature/multi-tenancy` 分支上，不影响 `main` 分支的 App。

---

## Step 4：开发工作流

```
日常开发循环：

1. 本地 feature/multi-tenancy 分支写代码
2. git push origin feature/multi-tenancy
3. SSH 到服务器：
   cd /opt/mold-api-dev
   git pull origin feature/multi-tenancy
   npx prisma migrate dev     ← 只影响 mold_management_dev 库
   npx prisma generate
   npm run build
   pm2 restart mold-api-dev
4. Flutter App 连 :8089 测试
5. 线上 :8088 完全不受影响
```

可以写一个 `deploy-dev.py` 简化这个流程：

```python
# deploy_dev.py — 部署到开发环境（不影响线上）
import paramiko, sys, io

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('121.40.172.33', username='root', password='xxx')

cmds = [
    'cd /opt/mold-api-dev ; git pull origin feature/multi-tenancy',
    'cd /opt/mold-api-dev ; npx prisma migrate dev --name auto',
    'cd /opt/mold-api-dev ; npx prisma generate',
    'cd /opt/mold-api-dev ; npm run build',
    'cd /opt/mold-api-dev ; pm2 restart mold-api-dev',
    'sleep 2 ; pm2 status',
]

for cmd in cmds:
    print(f'\n>>> {cmd}')
    _, stdout, stderr = ssh.exec_command(cmd, timeout=120)
    print(stdout.read().decode())
    err = stderr.read().decode()
    if err.strip(): print(err.strip())

ssh.close()
print('\nDev deploy done.')
```

---

## Step 5：线上有 bug 怎么办？

```bash
# 切回 main 修 bug
git stash                          # 暂存开发中的改动
git checkout main
# ... 修 bug ...
git commit -m "fix: xxx"
python deploy.py                   # 正常部署线上

# 回到开发分支，合并修复
git checkout feature/multi-tenancy
git stash pop
git merge main                     # 把 bugfix 合入开发分支
```

---

## Step 6：最终上线切换（开发测试全部通过后）

这是唯一会影响线上的时刻，一次性完成：

```
上线日操作清单：

□ 1. 通知用户：今晚 XX:XX 停服维护 30 分钟
□ 2. 备份生产数据库
      mysqldump -u root -p mold_management > backup_$(date +%Y%m%d).sql
□ 3. 合并分支
      git checkout main
      git merge feature/multi-tenancy
      git push origin main
□ 4. 在生产库执行迁移
      cd /opt/mold-api
      git pull origin main
      npx prisma migrate deploy          # 执行所有迁移（加表、加字段）
      # 数据迁移：INSERT INTO companies ... / UPDATE users SET company_id = 1 ...
□ 5. 构建部署
      npm run build
      pm2 restart mold-api
□ 6. 验证线上功能
□ 7. 发布新版 Flutter App（含登录页公司编码）
□ 8. 清理
      pm2 stop mold-api-dev
      pm2 delete mold-api-dev
□ 9. 如果出问题 → 回滚
      mysql -u root -p mold_management < backup_xxx.sql
      git revert HEAD
      npm run build && pm2 restart mold-api
```

---

## 总结：你现在要做的就三件事

| 序号 | 做什么 | 在哪做 | 影响线上？ |
|------|--------|--------|-----------|
| **1** | `git checkout -b feature/multi-tenancy` | 本地 | 否 |
| **2** | 服务器上创建 `mold_management_dev` 库 + `/opt/mold-api-dev` 目录 + PM2 `mold-api-dev` 进程 | 服务器 | 否 |
| **3** | 开始在分支上写多租户代码，部署到 dev 环境测试 | 本地+服务器 dev | 否 |

**线上的 `main` 分支、`/opt/mold-api` 目录、`mold_management` 数据库、PM2 `mold-api` 进程——全都不碰。**
