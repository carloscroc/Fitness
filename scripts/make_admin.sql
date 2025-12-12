-- make_admin.sql
BEGIN;
INSERT INTO profiles (id, is_admin, created_at, updated_at)
VALUES ('<USER_UUID>', true, now(), now())
ON CONFLICT (id) DO UPDATE SET is_admin = true, updated_at = now();
COMMIT;
