/**
 * Run this script to create the user_presence table in Supabase
 * Usage: node database/create-presence-table.mjs
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fmeckvddykaqoeayypeq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KqwPhNuR1EhfWmQOC_KWag_oZ4C4Hsm';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test table by doing a select - if it fails, print SQL to create it
async function main() {
  console.log('🔍 Mengecek apakah tabel user_presence sudah ada...');
  
  const { error } = await supabase
    .from('user_presence')
    .select('user_id')
    .limit(1);

  if (!error) {
    console.log('✅ Tabel user_presence SUDAH ADA dan berfungsi!');
    return;
  }

  console.log('❌ Tabel user_presence BELUM ADA. Error:', error.message);
  console.log('');
  console.log('='.repeat(60));
  console.log('📋 Jalankan SQL berikut di Supabase Dashboard > SQL Editor:');
  console.log('='.repeat(60));
  console.log(`
CREATE TABLE IF NOT EXISTS user_presence (
    user_id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_online BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_user_presence_family ON user_presence(family_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_last_seen ON user_presence(last_seen_at);

ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all on user_presence" ON user_presence;
CREATE POLICY "Allow anon all on user_presence" ON user_presence 
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
`);
  console.log('='.repeat(60));
  console.log('');
  console.log('Setelah menjalankan SQL di atas, status online akan berfungsi cross-device!');
}

main();
