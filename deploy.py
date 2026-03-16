import paramiko, sys, io, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('121.40.172.33', username='root', password='Wiseflow0616!')

cmds = [
    'cd /opt/mold-api ; git stash ; git clean -fd',
    'cd /opt/mold-api ; git pull origin main',
    'cd /opt/mold-api ; npx prisma db push --accept-data-loss',
    'cd /opt/mold-api ; npx prisma generate',
    'cd /opt/mold-api ; npm run build',
    'cd /opt/mold-api ; pm2 restart mold-api',
    'sleep 3 ; pm2 status',
]

for cmd in cmds:
    print(f'\n>>> {cmd}')
    _, stdout, stderr = ssh.exec_command(cmd, timeout=120)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if out.strip(): print(out.strip())
    if err.strip(): print(err.strip())

ssh.close()
print('\nDone.')
