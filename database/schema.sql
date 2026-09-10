-- ==========================================================
-- ASTA FAMILY TIME - POSTGRESQL RELATIONAL DATABASE SCHEMA
-- ==========================================================
-- Deskripsi: Skema database lengkap dengan relasi Foreign Keys,
-- Row-Level Security (RLS), Indeks Performa, dan Trigger Otomatis.
-- ==========================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABEL FAMILIES (Grup Keluarga)
CREATE TABLE IF NOT EXISTS families (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    family_name VARCHAR(150) NOT NULL,
    family_code VARCHAR(20) UNIQUE NOT NULL,
    head_user_id TEXT,
    streak_days INT DEFAULT 1,
    total_love_points INT DEFAULT 100,
    settings JSONB DEFAULT '{"soundEnabled": true, "darkMode": false}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABEL USERS (Pengguna & Anggota Keluarga)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'member' CHECK (role IN ('head_family', 'member')),
    role_title VARCHAR(50) NOT NULL DEFAULT 'Anggota',
    username VARCHAR(100),
    email VARCHAR(100),
    password_hash TEXT,
    pin VARCHAR(100) DEFAULT '1234',
    avatar VARCHAR(20) DEFAULT '👨‍💼',
    color VARCHAR(30) DEFAULT 'bg-blue-500',
    love_points INT DEFAULT 50,
    is_head BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Hubungkan Foreign Key head_user_id pada tabel families
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_families_head_user'
    ) THEN 
        ALTER TABLE families 
        ADD CONSTRAINT fk_families_head_user 
        FOREIGN KEY (head_user_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF; 
END $$;

-- 4. TABEL CHAT_MESSAGES (Obrolan Keluarga)
-- 4. TABEL CHAT_MESSAGES (Obrolan Keluarga)
CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    sender_id TEXT,
    sender_name VARCHAR(100) NOT NULL,
    sender_avatar VARCHAR(20) NOT NULL,
    sender_color VARCHAR(30) NOT NULL,
    message_text TEXT NOT NULL,
    media_type VARCHAR(20) DEFAULT 'text',
    reactions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABEL PLANNER_EVENTS (Agenda & Kalender Keluarga)
CREATE TABLE IF NOT EXISTS planner_events (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    event_date DATE NOT NULL,
    event_time VARCHAR(20),
    assigned_to_user_id TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABEL JOURNAL_ENTRIES (Jurnal & Diary Keluarga)
CREATE TABLE IF NOT EXISTS journal_entries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    author_id TEXT,
    player_name VARCHAR(100),
    player_avatar VARCHAR(20),
    mood VARCHAR(30) NOT NULL,
    story TEXT NOT NULL,
    highlights TEXT[],
    likes INT DEFAULT 0,
    entry_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABEL MEMORIES (Galeri Kenangan & Foto Keluarga)
CREATE TABLE IF NOT EXISTS memories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    author_id TEXT,
    title VARCHAR(150) NOT NULL,
    caption TEXT,
    album VARCHAR(100) DEFAULT 'Family Moments',
    tags TEXT[],
    likes INT DEFAULT 1,
    memory_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABEL APPRECIATIONS (Poin Cinta & Apresiasi)
CREATE TABLE IF NOT EXISTS appreciations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    from_user_id TEXT,
    from_player_name VARCHAR(100),
    from_player_avatar VARCHAR(20),
    to_user_id TEXT,
    to_player_name VARCHAR(100),
    to_player_avatar VARCHAR(20),
    category VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    love_points INT DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. TABEL HABITS (Kebiasaan Positif Harian)
CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    emoji VARCHAR(20) DEFAULT '⭐',
    target_frequency VARCHAR(50) DEFAULT 'daily',
    completed_by_users JSONB DEFAULT '[]'::jsonb,
    streak INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. TABEL FINANCE_TRANSACTIONS (Pencatatan Keuangan Keluarga)
CREATE TABLE IF NOT EXISTS finance_transactions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    type VARCHAR(20) NOT NULL,
    amount BIGINT NOT NULL,
    category VARCHAR(50) NOT NULL,
    transaction_date DATE DEFAULT CURRENT_DATE,
    logged_by_user_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. TABEL SAVINGS_TARGETS (Target Tabungan Impian Keluarga)
CREATE TABLE IF NOT EXISTS savings_targets (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    target_amount BIGINT NOT NULL,
    current_amount BIGINT DEFAULT 0,
    emoji VARCHAR(20) DEFAULT '🎯',
    deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. TABEL GAME_HISTORY (Riwayat Permainan Kartu, UNO, Ludo, Monopoli)
CREATE TABLE IF NOT EXISTS game_history (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    game_type VARCHAR(50) NOT NULL,
    winner_user_id TEXT,
    participants JSONB DEFAULT '[]'::jsonb,
    points_awarded INT DEFAULT 50,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. INDEKS UNTUK PERFORMA QUERY
CREATE INDEX IF NOT EXISTS idx_users_family_id ON users(family_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_family_id ON chat_messages(family_id);
CREATE INDEX IF NOT EXISTS idx_planner_events_family_id ON planner_events(family_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_family_id ON journal_entries(family_id);
CREATE INDEX IF NOT EXISTS idx_memories_family_id ON memories(family_id);
CREATE INDEX IF NOT EXISTS idx_finance_family_id ON finance_transactions(family_id);
CREATE INDEX IF NOT EXISTS idx_savings_family_id ON savings_targets(family_id);
CREATE INDEX IF NOT EXISTS idx_game_history_family_id ON game_history(family_id);

-- 14. TABEL SECURITY_AUDIT_LOGS
CREATE TABLE IF NOT EXISTS security_audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    family_id TEXT,
    user_id TEXT,
    user_name VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    details TEXT,
    ip_or_device VARCHAR(100) DEFAULT 'Web Client',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_security_logs_family ON security_audit_logs(family_id);

-- 15. ROW LEVEL SECURITY (RLS) POLICIES - IZINKAN AKSES ANON DARI CLIENT WEB
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all on families" ON families;
CREATE POLICY "Allow anon all on families" ON families FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all on users" ON users;
CREATE POLICY "Allow anon all on users" ON users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all on chat_messages" ON chat_messages;
CREATE POLICY "Allow anon all on chat_messages" ON chat_messages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE planner_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all on planner_events" ON planner_events;
CREATE POLICY "Allow anon all on planner_events" ON planner_events FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all on journal_entries" ON journal_entries;
CREATE POLICY "Allow anon all on journal_entries" ON journal_entries FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all on memories" ON memories;
CREATE POLICY "Allow anon all on memories" ON memories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE appreciations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all on appreciations" ON appreciations;
CREATE POLICY "Allow anon all on appreciations" ON appreciations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all on habits" ON habits;
CREATE POLICY "Allow anon all on habits" ON habits FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all on finance_transactions" ON finance_transactions;
CREATE POLICY "Allow anon all on finance_transactions" ON finance_transactions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE savings_targets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all on savings_targets" ON savings_targets;
CREATE POLICY "Allow anon all on savings_targets" ON savings_targets FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all on game_history" ON game_history;
CREATE POLICY "Allow anon all on game_history" ON game_history FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all on security_audit_logs" ON security_audit_logs;
CREATE POLICY "Allow anon all on security_audit_logs" ON security_audit_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
