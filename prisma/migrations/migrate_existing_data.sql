-- 多租户数据迁移 SQL
-- 在生产库执行前，先确保 schema 已迁移（prisma migrate deploy）
-- 本脚本将所有现有数据归属到 id=1 的默认公司

-- Step 1: 确保默认公司存在
INSERT IGNORE INTO companies (id, name, code, is_active, created_at, updated_at)
VALUES (1, '默认公司', 'default', 1, NOW(), NOW());

-- Step 2: 更新所有表的 company_id（新字段默认值为 0 或 NULL，需要设为 1）
UPDATE users SET company_id = 1 WHERE company_id = 0 OR company_id IS NULL;
UPDATE workshops SET company_id = 1 WHERE company_id = 0 OR company_id IS NULL;
UPDATE molds SET company_id = 1 WHERE company_id = 0 OR company_id IS NULL;
UPDATE usage_records SET company_id = 1 WHERE company_id = 0 OR company_id IS NULL;
UPDATE maintenance_records SET company_id = 1 WHERE company_id = 0 OR company_id IS NULL;
UPDATE notifications SET company_id = 1 WHERE company_id = 0 OR company_id IS NULL;
UPDATE audit_logs SET company_id = 1 WHERE company_id = 0 OR company_id IS NULL;
UPDATE reminder_settings SET company_id = 1 WHERE company_id = 0 OR company_id IS NULL;

-- Step 3: 验证
SELECT 'companies' AS tbl, COUNT(*) AS cnt FROM companies
UNION ALL SELECT 'users', COUNT(*) FROM users WHERE company_id = 1
UNION ALL SELECT 'workshops', COUNT(*) FROM workshops WHERE company_id = 1
UNION ALL SELECT 'molds', COUNT(*) FROM molds WHERE company_id = 1
UNION ALL SELECT 'usage_records', COUNT(*) FROM usage_records WHERE company_id = 1
UNION ALL SELECT 'maintenance_records', COUNT(*) FROM maintenance_records WHERE company_id = 1
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications WHERE company_id = 1
UNION ALL SELECT 'audit_logs', COUNT(*) FROM audit_logs WHERE company_id = 1
UNION ALL SELECT 'reminder_settings', COUNT(*) FROM reminder_settings WHERE company_id = 1;
