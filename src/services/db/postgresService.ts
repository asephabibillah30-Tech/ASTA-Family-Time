import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface PostgresConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConnected: boolean;
  isCustomConnected: boolean;
  statusText: string;
  lastChecked?: string;
}

class PostgresService {
  private client: SupabaseClient | null = null;
  private config: PostgresConfig;

  constructor() {
    // Read securely only from Vite environment variables (e.g. .env or build secrets)
    const envSupaUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';
    const envSupaKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';

    const hasCloudConfig = Boolean(envSupaUrl && envSupaKey);

    this.config = {
      supabaseUrl: envSupaUrl,
      supabaseAnonKey: envSupaKey,
      isConnected: hasCloudConfig,
      isCustomConnected: hasCloudConfig,
      statusText: hasCloudConfig 
        ? 'Sinkronisasi Cloud Aktif 🟢' 
        : 'Ruang Privat Terenkripsi 🟢'
    };

    if (hasCloudConfig) {
      try {
        this.client = createClient(envSupaUrl, envSupaKey);
      } catch (err) {
        console.warn('Gagal inisialisasi Supabase client:', err);
      }
    }
  }

  public getClient(): SupabaseClient | null {
    return this.client;
  }

  public getConfig(): PostgresConfig {
    return this.config;
  }

  public isCloudConnected(): boolean {
    return Boolean(this.client && this.config.isConnected);
  }

  public async testConnection(url?: string, anonKey?: string): Promise<{ success: boolean; message: string; latencyMs: number }> {
    const targetUrl = (url || this.config.supabaseUrl || '').trim();
    const targetKey = (anonKey || this.config.supabaseAnonKey || '').trim();

    if (!targetUrl || !targetKey) {
      return {
        success: false,
        message: 'Harap masukkan Project URL dan Anon Key Supabase terlebih dahulu.',
        latencyMs: 0
      };
    }

    const start = performance.now();
    try {
      const res = await fetch(targetUrl + '/rest/v1/', {
        headers: {
          apikey: targetKey,
          Authorization: 'Bearer ' + targetKey
        }
      });

      const latencyMs = Math.round(performance.now() - start);

      if (res.ok || res.status === 200 || res.status === 404) {
        return {
          success: true,
          message: 'Koneksi PostgreSQL Supabase Berhasil! (Latensi: ' + latencyMs + 'ms)',
          latencyMs
        };
      } else {
        return {
          success: false,
          message: 'Respon Supabase HTTP ' + res.status + ': ' + res.statusText,
          latencyMs
        };
      }
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - start);
      return {
        success: false,
        message: err?.message || 'Gagal terhubung ke host Supabase.',
        latencyMs
      };
    }
  }
}

export const postgresService = new PostgresService();
