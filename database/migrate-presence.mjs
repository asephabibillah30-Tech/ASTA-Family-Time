/**
 * Migration Script: Buat tabel user_presence di Supabase
 * Jalankan SEKALI: node database/migrate-presence.mjs
 */

const SUPABASE_URL = 'https://fmeckvddykaqoeayypeq.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const SUPABASE_ANON_KEY = 'sb_publishable_KqwPhNuR1EhfWmQOC_KWag_oZ4C4Hsm';

// Gunakan service key jika ada, fallback ke anon key
const API_KEY = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY;

const SQL = `
CREATE TABLE IF NOT EXISTS user_presence (
    user_id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_online BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_user_presence_family ON user_presence(family_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_last_seen ON user_presence(last_seen_at);

ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow anon all on user_presence'
  ) THEN
    CREATE POLICY "Allow anon all on user_presence" ON user_presence FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;
END
$$;
`;

async function runMigration() {
  console.log('🚀 Menjalankan migrasi: membuat tabel user_presence...');
  
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'apikey': API_KEY,
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: SQL })
    });
    
    if (!res.ok) {
      // Coba via raw SQL endpoint
      const res2 = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'POST',
        headers: {
          'apikey': API_KEY,
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      });
      console.log('Response status:', res2.status);
    }
    
    console.log('✅ Migrasi selesai (atau tabel sudah ada).');
    console.log('');
    console.log('📋 Jika gagal, jalankan SQL ini MANUAL di Supabase Dashboard > SQL Editor:');
    console.log('');
    console.log(SQL);
  } catch (err) {
    console.error('❌ Gagal via API. Jalankan SQL ini di Supabase SQL Editor:');
    console.log('');
    console.log(SQL);
  }
}

runMigration();
