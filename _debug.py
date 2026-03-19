import paramiko, sys

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('121.40.172.33', username='root', password='Wiseflow0616!', timeout=15)

def run(cmd):
    _, o, e = ssh.exec_command(cmd, timeout=30)
    out = o.read().decode('utf-8', errors='replace')
    if out: sys.stdout.buffer.write(out.encode('utf-8', errors='replace'))

import json
# Get token
_, o, _ = ssh.exec_command('curl -s http://localhost:3001/api/auth/login -X POST -H "Content-Type: application/json" -d \'{"username":"admin","password":"admin123"}\'', timeout=15)
token = json.loads(o.read().decode())['data']['accessToken']

# Test upload with a dummy file
run(f'echo "test" > /tmp/test.jpg && curl -v -s http://localhost:3001/api/upload -H "Authorization: Bearer {token}" -F "file=@/tmp/test.jpg;type=image/jpeg" 2>&1')

ssh.close()
