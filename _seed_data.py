import paramiko, json, os, re, random, io, sys
from datetime import datetime, timedelta

HOST = '121.40.172.33'
USER = 'root'
PASSWD = 'Wiseflow0616!'
DB_HOST = 'rm-bp1utj5t5iv59542v.mysql.rds.aliyuncs.com'
DB_USER = 'mold_management_ai'
DB_PASS = 'mold_management_ai0312'
DB_NAME = 'mold_management'

BASE = r'e:\APP\mold_management\data_demo\模具编号体系'

TYPE_MAP = {'模压': '模压模具', '口型': '口型模具', '接角': '接角模具'}
UNIT_MAP = {'挤出车间': 1, '后序车间': 2, '后续车间': 2}

def parse_date(v):
    if v is None: return None
    s = str(v).strip().rstrip('.')
    # "2023.4.17" or "2021.9.20"
    parts = s.split('.')
    if len(parts) == 3:
        y, m, d = parts
        y = int(y)
        if y < 100: y += 2000
        return f'{y:04d}-{int(m):02d}-{int(d):02d}'
    if len(parts) == 2:
        y, m = parts
        y = int(float(y))
        if y < 100: y += 2000
        m = int(float(m))
        return f'{y:04d}-{m:02d}-01'
    return None

def esc(v):
    if v is None: return 'NULL'
    s = str(v).replace("\\", "\\\\").replace("'", "\\'")
    return f"'{s}'"

def load_json(name):
    with open(os.path.join(BASE, name), 'r', encoding='utf-8') as f:
        return json.load(f)

sql_lines = []
sql_lines.append("SET NAMES utf8mb4;")
sql_lines.append("SET FOREIGN_KEY_CHECKS=0;")

# load all molds
files = [('模压模具.json', '模压'), ('口型模具.json', '口型'), ('接角模具.json', '接角')]
all_molds = []
for fname, prefix in files:
    data = load_json(fname)
    for item in data:
        mold_no = item['moldNo']
        mold_type = TYPE_MAP[prefix]
        unit = item.get('unit')
        ws_id = UNIT_MAP.get(unit) if unit else None
        fud = parse_date(item.get('firstUseDate'))
        dl = random.randint(3000, 10000)
        mc = random.randint(500, 2000)
        uc = random.randint(0, dl // 2)
        status = '在用'
        if uc > dl * 0.95:
            status = random.choice(['停用', '报废'])
        elif random.random() < 0.08:
            status = '维修中'
        all_molds.append({
            'moldNumber': mold_no,
            'type': mold_type,
            'workshopId': ws_id,
            'firstUseDate': fud,
            'designLife': dl,
            'maintenanceCycle': mc,
            'usageCount': uc,
            'status': status,
            'products': item.get('products', []),
        })

# insert molds
for m in all_molds:
    fud_sql = f"'{m['firstUseDate']}'" if m['firstUseDate'] else 'NULL'
    ws_sql = str(m['workshopId']) if m['workshopId'] else 'NULL'
    sql_lines.append(
        f"INSERT INTO molds (mold_number, `type`, workshop_id, first_use_date, design_life, maintenance_cycle, usage_count, status, created_at, updated_at) "
        f"VALUES ({esc(m['moldNumber'])}, {esc(m['type'])}, {ws_sql}, {fud_sql}, {m['designLife']}, {m['maintenanceCycle']}, {m['usageCount']}, {esc(m['status'])}, NOW(), NOW()) "
        f"ON DUPLICATE KEY UPDATE updated_at=NOW();"
    )

# insert products
for m in all_molds:
    for p in m['products']:
        pname = p.get('name') or ''
        if not pname: continue
        sql_lines.append(
            f"INSERT INTO mold_products (mold_id, customer, model, name, part_number, created_at) "
            f"SELECT id, {esc(p.get('customer'))}, {esc(p.get('model'))}, {esc(pname)}, {esc(str(p.get('partNo', '')) if p.get('partNo') else None)}, NOW() "
            f"FROM molds WHERE mold_number={esc(m['moldNumber'])} LIMIT 1;"
        )

# test data: usage records (last 30 days, ~200 records)
shifts = ['早班', '中班', '晚班']
products_pool = ['前面罩缓冲块', '门槛密封条', '车门侧密封条', '玻璃导槽密封胶条', '尾门密封条', '过线圈', '车门缓冲块', '门洞密封条', '侧围密封条', '挡泥条']
for i in range(200):
    days_ago = random.randint(0, 30)
    rd = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d')
    qty = random.randint(50, 500)
    shift = random.choice(shifts)
    product = random.choice(products_pool)
    op_id = random.choice([1, 2])
    sql_lines.append(
        f"INSERT INTO usage_records (mold_id, product, quantity, shift, record_date, operator_id, created_at) "
        f"SELECT id, {esc(product)}, {qty}, {esc(shift)}, '{rd}', {op_id}, NOW() "
        f"FROM molds ORDER BY RAND() LIMIT 1;"
    )

# update usage_count for molds that have usage records
sql_lines.append(
    "UPDATE molds m SET usage_count = ("
    "  SELECT COALESCE(SUM(ur.quantity), 0) FROM usage_records ur WHERE ur.mold_id = m.id"
    ");"
)

# test data: maintenance records (last 90 days, ~50 records)
maint_types = ['保养', '维修']
maint_contents = [
    '定期保养，清洗模具表面', '更换密封件', '模具抛光处理', '修复型腔磨损',
    '检查冷却水道', '更换顶针', '修复分型面', '清理排气槽',
    '更换弹簧', '修复合模面', '校准定位销', '更换导柱导套',
]
for i in range(50):
    days_ago = random.randint(0, 90)
    rd = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d')
    mt = random.choice(maint_types)
    content = random.choice(maint_contents)
    op_id = random.choice([1, 2])
    sql_lines.append(
        f"INSERT INTO maintenance_records (mold_id, `type`, content, record_date, operator_id, created_at) "
        f"SELECT id, {esc(mt)}, {esc(content)}, '{rd}', {op_id}, NOW() "
        f"FROM molds ORDER BY RAND() LIMIT 1;"
    )

sql_lines.append("SET FOREIGN_KEY_CHECKS=1;")

sql_content = '\n'.join(sql_lines)

print(f"Generated {len(sql_lines)} SQL statements, {len(all_molds)} molds")

# Upload SQL via SFTP
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(HOST, username=USER, password=PASSWD)

sftp = c.open_sftp()
with sftp.file('/tmp/seed_data.sql', 'w') as f:
    f.write(sql_content)
sftp.close()
print("Uploaded SQL to server")

# Execute SQL
cmd = f"mysql -h {DB_HOST} -u {DB_USER} -p'{DB_PASS}' {DB_NAME} < /tmp/seed_data.sql 2>&1"
stdin, stdout, stderr = c.exec_command(cmd, timeout=120)
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
out = stdout.read().decode('utf-8', errors='replace')
err = stderr.read().decode('utf-8', errors='replace')
code = stdout.channel.recv_exit_status()
if out: print(out)
if err: print(err)
print(f"Exit code: {code}")

# Verify
cmd2 = f"mysql -h {DB_HOST} -u {DB_USER} -p'{DB_PASS}' {DB_NAME} -e 'SELECT COUNT(*) AS molds FROM molds; SELECT COUNT(*) AS products FROM mold_products; SELECT COUNT(*) AS usage_recs FROM usage_records; SELECT COUNT(*) AS maint_recs FROM maintenance_records;' 2>&1"
stdin, stdout, stderr = c.exec_command(cmd2, timeout=30)
out2 = stdout.read().decode('utf-8', errors='replace')
print(out2)

c.close()
print("Done!")
