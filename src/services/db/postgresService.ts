import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface PostgresConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConnected: boolean;
  isCustomConnected: boolean;
  statusText: string;
  lastChecked?: string;
}

const STORAGE_KEY_SUPA_URL = 'asta_supabase_url';
const STORAGE_KEY_SUPA_KEY = 'asta_supabase_key';

class PostgresService {
  private client: SupabaseClient | null = null;
  private config: PostgresConfig;

  constructor() {
    const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_SUPA_URL) || '' : '';
    const storedKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_SUPA_KEY) || '' : '';

    const envSupaUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';
    const envSupaKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';

    const effectiveUrl = storedUrl || envSupaUrl || '';
    const effectiveKey = storedKey || envSupaKey || '';

    const isCustom = Boolean(effectiveUrl && effectiveKey);

    this.config = {
      supabaseUrl: effectiveUrl,
      supabaseAnonKey: effectiveKey,
      isConnected: isCustom,
      isCustomConnected: isCustom,
      statusText: isCustom 
        ? 'Supabase PostgreSQL Cloud Terhubung 🟢' 
        : 'Database PostgreSQL Siap (Offline-First) 🟡'
    };

    if (effectiveUrl && effectiveKey) {
      try {
        this.client = createClient(effectiveUrl, effectiveKey);
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

  public updateCredentials(url: string, anonKey: string): boolean {
    try {
      const cleanUrl = url.trim();
      const cleanKey = anonKey.trim();

      if (cleanUrl && cleanKey) {
        localStorage.setItem(STORAGE_KEY_SUPA_URL, cleanUrl);
        localStorage.setItem(STORAGE_KEY_SUPA_KEY, cleanKey);
        this.client = createClient(cleanUrl, cleanKey);
        this.config = {
          supabaseUrl: cleanUrl,
          supabaseAnonKey: cleanKey,
          isConnected: true,
          isCustomConnected: true,
          statusText: 'Supabase Cloud Terhubung 🟢',
          lastChecked: new Date().toLocaleTimeString()
        };
      } else {
        localStorage.removeItem(STORAGE_KEY_SUPA_URL);
        localStorage.removeItem(STORAGE_KEY_SUPA_KEY);
        this.client = null;
        this.config = {
          supabaseUrl: '',
          supabaseAnonKey: '',
          isConnected: false,
          isCustomConnected: false,
          statusText: 'Database PostgreSQL Siap (Offline-First) 🟡'
        };
      }
      return true;
    } catch (err) {
      console.error('Error updating Supabase credentials:', err);
      return false;
    }
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
