import paramiko, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('121.40.172.33', username='root', password='Wiseflow0616!')

RDS_HOST = 'rm-bp1utj5t5iv59542v.mysql.rds.aliyuncs.com'
RDS_USER = 'mold_management_ai'
RDS_PASS = 'mold_management_ai0312'
DEV_DB   = 'mold_management_dev'

cmds = [
    # 1. Create dev directory
    'mkdir -p /opt/mold-api-dev /var/log/mold-api-dev',

    # 2. Clone from existing repo
    'if [ ! -d /opt/mold-api-dev/.git ]; then git clone /opt/mold-api /opt/mold-api-dev; fi',

    # 3. Checkout feature branch
    'cd /opt/mold-api-dev && git fetch origin && git checkout feature/multi-tenancy',

    # 4. Create .env for dev (pointing to dev database)
    f'cat > /opt/mold-api-dev/.env << EOF\n'
    f'DATABASE_URL="mysql://{RDS_USER}:{RDS_PASS}@{RDS_HOST}:3306/{DEV_DB}"\n'
    f'JWT_SECRET="dev-mold-jwt-secret-2026"\n'
    f'JWT_REFRESH_EXPIRES=7d\n'
    f'PORT=3002\n'
    f'OSS_REGION=oss-cn-hangzhou\n'
    f'OSS_ACCESS_KEY_ID=LTAI5tN7PTg4vdG9uaAnb3Nq\n'
    f'OSS_ACCESS_KEY_SECRET=AdiiyrtfjUrg1G7zBNYkbizMqDintE\n'
    f'OSS_BUCKET=mold-manage\n'
    f'EOF',

    # 5. Install dependencies
    'cd /opt/mold-api-dev && npm install',

    # 6. Push schema to dev database
    'cd /opt/mold-api-dev && npx prisma db push --accept-data-loss',
    'cd /opt/mold-api-dev && npx prisma generate',

    # 7. Build
    'cd /opt/mold-api-dev && npm run build',

    # 8. Seed dev database
    'cd /opt/mold-api-dev && npx ts-node prisma/seed.ts',

    # 9. Start PM2 dev process
    'cd /opt/mold-api-dev && pm2 start ecosystem.dev.config.js',

    # 10. Configure Nginx dev proxy
    '''cat > /etc/nginx/conf.d/mold-api-dev.conf << 'NGINX'
server {
    listen 8089;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
NGINX''',

    # 11. Reload Nginx
    'nginx -t && nginx -s reload',

    # 12. Check status
    'sleep 2 && pm2 status',
]

for cmd in cmds:
    print(f'\n>>> {cmd[:80]}...' if len(cmd) > 80 else f'\n>>> {cmd}')
    _, stdout, stderr = ssh.exec_command(cmd, timeout=180)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if out.strip(): print(out.strip())
    if err.strip(): print(err.strip())

ssh.close()
print('\n=== Dev environment setup complete! ===')
print('Dev API: http://121.40.172.33:8089/api')
print('Prod API: http://121.40.172.33:8088/api (unchanged)')
