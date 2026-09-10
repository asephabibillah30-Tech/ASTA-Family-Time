import type { FamilyAccount, UserAccount, RegisterHeadDTO, AddMemberDTO, AuthSession } from '../../types/auth';
import { fastHashSync, sanitizeInput } from '../../utils/security';
import { postgresService } from './postgresService';

// Storage Keys
const FAMILIES_KEY = 'asta_db_families';
const USERS_KEY = 'asta_db_users';
const SECURITY_LOGS_KEY = 'asta_db_security_logs';

export interface SecurityAuditLog {
  id: string;
  familyId?: string;
  userId?: string;
  userName?: string;
  action: string;
  status: 'SUCCESS' | 'FAILED' | 'WARNING' | 'BLOCKED';
  details: string;
  timestamp: string;
}

function loadData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out legacy demo family and users
        const cleaned = parsed.filter((item: any) => 
          item.id !== 'fam-asta-default' && 
          item.id !== 'usr-ayah' && 
          item.id !== 'usr-ibu' && 
          item.id !== 'usr-kakak' && 
          item.id !== 'usr-adik' &&
          item.familyId !== 'fam-asta-default'
        );
        return cleaned as unknown as T;
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error loading DB key:', key, err);
  }
  return fallback;
}

function saveData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving DB key:', key, err);
  }
}

export function generateFamilyCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `ASTA-${num}`;
}

class DatabaseService {
  private families: FamilyAccount[];
  private users: UserAccount[];
  private logs: SecurityAuditLog[];

  constructor() {
    this.families = loadData<FamilyAccount[]>(FAMILIES_KEY, []);
    this.users = loadData<UserAccount[]>(USERS_KEY, []);
    this.logs = loadData<SecurityAuditLog[]>(SECURITY_LOGS_KEY, [
      {
        id: 'log-init',
        userName: 'Sistem ASTA',
        action: 'INICIALISASI_DATABASE_AMAN',
        status: 'SUCCESS',
        details: 'Enkripsi SHA-256 dan Row-Level Security aktif.',
        timestamp: new Date().toISOString()
      }
    ]);
    this.initSync().catch(console.warn);
  }

  public async initSync(): Promise<void> {
    await this.syncLocalToCloud();
    await this.syncFromCloud();
  }

  public async syncLocalToCloud(): Promise<void> {
    const supabase = postgresService.getClient();
    if (!supabase) return;

    try {
      // 1. Upsert all families first (tanpa head_user_id untuk menghindari FK deadlock)
      for (const f of this.families) {
        const { error } = await supabase.from('families').upsert({
          id: f.id,
          family_name: f.familyName || 'Keluarga ASTA',
          family_code: f.familyCode || 'ASTA-2026',
          head_user_id: null,
          streak_days: f.streakDays || 1,
          total_love_points: f.totalLovePoints || 100
        }, { onConflict: 'id' });
        if (error) console.error('❌ Supabase families upsert error:', error.message, error.details);
        else console.log(`✅ Supabase family synced: ${f.familyName} (${f.id})`);
      }

      // 2. Upsert all users (sekarang family_id sudah pasti ada di tabel families)
      for (const u of this.users) {
        const payload: Record<string, any> = {
          id: u.id,
          family_id: u.familyId,
          full_name: u.fullName || 'Anggota Keluarga',
          role: u.role || 'member',
          role_title: u.roleTitle || 'Anggota',
          username: u.usernameOrEmail || null,
          password_hash: u.password || null,
          pin: u.pin || null,
          avatar: u.avatar || '👨‍💼',
          color: u.color || 'bg-blue-500',
          love_points: u.lovePoints || 50,
          is_head: Boolean(u.isHead)
        };
        const { error } = await supabase.from('users').upsert(payload, { onConflict: 'id' });
        if (error) console.error(`❌ Supabase user (${u.fullName}) upsert error:`, error.message, error.details);
        else console.log(`✅ Supabase user synced: ${u.fullName} (${u.id})`);
      }

      // 3. Update head_user_id di tabel families setelah user berhasil di-insert
      for (const f of this.families) {
        if (f.headUserId) {
          await supabase.from('families').update({ head_user_id: f.headUserId }).eq('id', f.id);
        }
      }
    } catch (err) {
      console.warn('Sync local to cloud failed:', err);
    }
  }

  public async syncFromCloud(): Promise<void> {
    const supabase = postgresService.getClient();
    if (!supabase) return;
    try {
      const { data: cloudFamilies, error: famError } = await supabase
        .from('families')
        .select('*')
        .order('created_at', { ascending: false });

      if (!famError && cloudFamilies) {
        this.families = cloudFamilies
          .filter(f => f.id !== 'fam-asta-default')
          .map(f => ({
            id: f.id,
            familyName: f.family_name,
            familyCode: f.family_code,
            headUserId: f.head_user_id,
            streakDays: f.streak_days || 1,
            totalLovePoints: f.total_love_points || 100,
            createdAt: f.created_at
          }));
        saveData(FAMILIES_KEY, this.families);
      }

      const { data: cloudUsers, error: usrError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (!usrError && cloudUsers) {
        this.users = cloudUsers
          .filter(u => u.family_id !== 'fam-asta-default' && u.id !== 'usr-ayah' && u.id !== 'usr-ibu' && u.id !== 'usr-kakak' && u.id !== 'usr-adik')
          .map(u => ({
            id: u.id,
            familyId: u.family_id,
            fullName: u.full_name,
            role: u.role as any,
            roleTitle: u.role_title,
            usernameOrEmail: u.username || u.email,
            password: u.password_hash,
            pin: u.pin,
            avatar: u.avatar || '👨‍💼',
            color: u.color || 'bg-blue-500',
            lovePoints: u.love_points || 50,
            isHead: u.is_head || false,
            createdAt: u.created_at
          }));
        saveData(USERS_KEY, this.users);
      }
    } catch (err) {
      console.warn('Cloud sync error:', err);
    }
  }

  // --- SECURITY AUDIT LOGGING ---
  public logSecurity(
    action: string,
    status: SecurityAuditLog['status'],
    details: string,
    familyId?: string,
    userId?: string,
    userName?: string
  ) {
    const newLog: SecurityAuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      familyId,
      userId,
      userName: userName || 'Anonim',
      action,
      status,
      details,
      timestamp: new Date().toISOString()
    };
    this.logs = [newLog, ...this.logs.slice(0, 49)];
    saveData(SECURITY_LOGS_KEY, this.logs);

    const supabase = postgresService.getClient();
    if (supabase && familyId) {
      const payload: Record<string, any> = {
        id: newLog.id,
        family_id: familyId,
        user_name: userName || 'Anonim',
        action: action || 'AUDIT',
        status: status || 'SUCCESS',
        details: details || ''
      };
      if (userId) payload.user_id = userId;

      Promise.resolve(supabase.from('security_audit_logs').insert(payload)).catch(() => {});
    }
  }

  public getSecurityLogs(familyId?: string): SecurityAuditLog[] {
    if (!familyId) return this.logs;
    return this.logs.filter(l => !l.familyId || l.familyId === familyId);
  }

  // --- FAMILIES TABLE ---
  public getFamilies(): FamilyAccount[] {
    return this.families;
  }

  public getFamilyById(id: string): FamilyAccount | undefined {
    return this.families.find(f => f.id === id);
  }

  public getFamilyByCode(code: string): FamilyAccount | undefined {
    const cleanCode = sanitizeInput(code).toUpperCase();
    return this.families.find(f => f.familyCode.toUpperCase() === cleanCode);
  }

  // --- USERS TABLE ---
  public getUsers(): UserAccount[] {
    return this.users;
  }

  public getUsersByFamily(familyId: string): UserAccount[] {
    return this.users.filter(u => u.familyId === familyId);
  }

  public getUserById(userId: string): UserAccount | undefined {
    return this.users.find(u => u.id === userId);
  }

  // --- REGISTER HEAD OF FAMILY ---
  public registerHeadOfFamily(dto: RegisterHeadDTO): AuthSession {
    const familyId = `fam-${Date.now()}`;
    const headUserId = `usr-${Date.now()}`;
    const familyCode = generateFamilyCode();

    const cleanHeadName = sanitizeInput(dto.headFullName);
    const cleanFamilyName = sanitizeInput(dto.familyName) || 'Keluarga Bahagia';
    const cleanUser = sanitizeInput(dto.usernameOrEmail).toLowerCase();

    // Securely hash password and PIN
    const passwordHash = fastHashSync(dto.password);
    const pinHash = fastHashSync(dto.pin || '1234');

    const newFamily: FamilyAccount = {
      id: familyId,
      familyName: cleanFamilyName,
      familyCode,
      headUserId,
      streakDays: 1,
      totalLovePoints: 100,
      createdAt: new Date().toISOString()
    };

    const newHeadUser: UserAccount = {
      id: headUserId,
      familyId,
      fullName: cleanHeadName,
      role: 'head_family',
      roleTitle: dto.roleTitle || 'Ayah',
      usernameOrEmail: cleanUser,
      password: passwordHash,
      pin: pinHash,
      avatar: dto.avatar || '👨‍💼',
      color: dto.color || 'bg-blue-500',
      lovePoints: 100,
      isHead: true,
      createdAt: new Date().toISOString()
    };

    this.families = [newFamily, ...this.families];
    this.users = [newHeadUser, ...this.users];

    saveData(FAMILIES_KEY, this.families);
    saveData(USERS_KEY, this.users);

    const supabase = postgresService.getClient();
    if (supabase) {
      (async () => {
        try {
          // 1. Insert Family First
          const { error: fErr } = await supabase.from('families').upsert({
            id: familyId,
            family_name: cleanFamilyName,
            family_code: familyCode,
            streak_days: 1,
            total_love_points: 100
          }, { onConflict: 'id' });
          if (fErr) console.error('❌ Supabase family registration error:', fErr.message, fErr.details);
          else console.log('✅ Supabase family registered:', familyId);

          // 2. Insert User Next (satisfies Foreign Key)
          const { error: uErr } = await supabase.from('users').upsert({
            id: headUserId,
            family_id: familyId,
            full_name: cleanHeadName,
            role: 'head_family',
            role_title: dto.roleTitle || 'Ayah',
            username: cleanUser,
            password_hash: passwordHash,
            pin: pinHash,
            avatar: dto.avatar || '👨‍💼',
            color: dto.color || 'bg-blue-500',
            love_points: 100,
            is_head: true
          }, { onConflict: 'id' });
          if (uErr) console.error('❌ Supabase user registration error:', uErr.message, uErr.details);
          else console.log('✅ Supabase user registered:', headUserId);

          // 3. Link head_user_id
          await supabase.from('families').update({ head_user_id: headUserId }).eq('id', familyId);
        } catch (err) {
          console.error('❌ Supabase registration sync failed:', err);
        }
      })();
    } else {
      console.warn('⚠️ Cannot sync registration to Supabase: Supabase client is null.');
    }

    this.logSecurity('DAFTAR_KEPALA_KELUARGA', 'SUCCESS', `Keluarga ${cleanFamilyName} dibuat dengan kode ${familyCode}`, familyId, headUserId, cleanHeadName);

    const session: AuthSession = { user: newHeadUser, family: newFamily };
    this.saveSession(session);
    return session;
  }

  // --- ADD FAMILY MEMBER (Exclusive privilege of Head of Family) ---
  public addMemberByHead(
    requesterUserId: string,
    familyId: string,
    dto: AddMemberDTO
  ): UserAccount {
    const requester = this.getUserById(requesterUserId);
    if (!requester || requester.familyId !== familyId || !requester.isHead) {
      this.logSecurity('TAMBAH_ANGGOTA_DITOLAK', 'BLOCKED', 'Upaya penambahan anggota tanpa izin Kepala Keluarga.', familyId, requesterUserId);
      throw new Error('Hanya Kepala Keluarga yang memiliki izin untuk menambahkan anggota keluarga baru.');
    }

    const cleanName = sanitizeInput(dto.fullName);
    const pinHash = fastHashSync(dto.pin || '1234');
    const newMemberId = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newMember: UserAccount = {
      id: newMemberId,
      familyId,
      fullName: cleanName,
      role: 'member',
      roleTitle: dto.roleTitle,
      pin: pinHash,
      avatar: dto.avatar || '👦',
      color: dto.color || 'bg-amber-500',
      lovePoints: 50,
      isHead: false,
      createdAt: new Date().toISOString()
    };

    this.users = [...this.users, newMember];
    saveData(USERS_KEY, this.users);

    const supabase = postgresService.getClient();
    if (supabase) {
      (async () => {
        try {
          const { error } = await supabase.from('users').upsert({
            id: newMemberId,
            family_id: familyId,
            full_name: cleanName,
            role: 'member',
            role_title: dto.roleTitle,
            pin: pinHash,
            avatar: dto.avatar || '👦',
            color: dto.color || 'bg-amber-500',
            love_points: 50,
            is_head: false
          }, { onConflict: 'id' });
          if (error) console.error('Supabase add member error:', error.message, error.details);
        } catch (e) {
          console.error('Supabase add member failed:', e);
        }
      })();
    }

    this.logSecurity('TAMBAH_ANGGOTA', 'SUCCESS', `Anggota ${cleanName} (${dto.roleTitle}) ditambahkan oleh ${requester.fullName}`, familyId, requesterUserId, requester.fullName);
    return newMember;
  }

  // --- DELETE MEMBER ---
  public deleteMemberByHead(requesterUserId: string, memberId: string): void {
    const requester = this.getUserById(requesterUserId);
    if (!requester || !requester.isHead) {
      this.logSecurity('HAPUS_ANGGOTA_DITOLAK', 'BLOCKED', 'Upaya penghapusan anggota tanpa izin Kepala Keluarga.', requester?.familyId, requesterUserId);
      throw new Error('Hanya Kepala Keluarga yang berhak menghapus anggota keluarga.');
    }

    if (requester.id === memberId) {
      throw new Error('Kepala Keluarga tidak dapat menghapus akunnya sendiri.');
    }

    const targetUser = this.getUserById(memberId);
    this.users = this.users.filter(u => u.id !== memberId);
    saveData(USERS_KEY, this.users);

    const supabase = postgresService.getClient();
    if (supabase) {
      Promise.resolve(supabase.from('users').delete().eq('id', memberId)).catch(console.warn);
    }

    this.logSecurity('HAPUS_ANGGOTA', 'WARNING', `Anggota ${targetUser?.fullName} dihapus oleh ${requester.fullName}`, requester.familyId, requesterUserId, requester.fullName);
  }

  // --- CHANGE PASSWORD (Secured) ---
  public changePassword(userId: string, oldPass: string, newPass: string): void {
    const user = this.getUserById(userId);
    if (!user) throw new Error('Pengguna tidak ditemukan.');

    const oldHash = fastHashSync(oldPass);
    if (user.password && user.password !== oldHash && user.password !== oldPass) {
      this.logSecurity('GANTI_PASSWORD_GAGAL', 'FAILED', 'Password lama salah.', user.familyId, userId, user.fullName);
      throw new Error('Password lama tidak cocok.');
    }

    const newHash = fastHashSync(newPass);
    this.users = this.users.map(u => u.id === userId ? { ...u, password: newHash } : u);
    saveData(USERS_KEY, this.users);

    const supabase = postgresService.getClient();
    if (supabase) {
      Promise.resolve(supabase.from('users').update({ password_hash: newHash }).eq('id', userId)).catch(console.warn);
    }

    this.logSecurity('GANTI_PASSWORD_SUKSES', 'SUCCESS', 'Password berhasil diperbarui.', user.familyId, userId, user.fullName);
  }

  // --- CHANGE PIN (Secured) ---
  public changePin(userId: string, oldPin: string, newPin: string): void {
    const user = this.getUserById(userId);
    if (!user) throw new Error('Pengguna tidak ditemukan.');

    const oldHash = fastHashSync(oldPin);
    if (user.pin && user.pin !== oldHash && user.pin !== oldPin) {
      this.logSecurity('GANTI_PIN_GAGAL', 'FAILED', 'PIN lama salah.', user.familyId, userId, user.fullName);
      throw new Error('PIN lama tidak cocok.');
    }

    const newHash = fastHashSync(newPin);
    this.users = this.users.map(u => u.id === userId ? { ...u, pin: newHash } : u);
    saveData(USERS_KEY, this.users);

    const supabase = postgresService.getClient();
    if (supabase) {
      Promise.resolve(supabase.from('users').update({ pin: newHash }).eq('id', userId)).catch(console.warn);
    }

    this.logSecurity('GANTI_PIN_SUKSES', 'SUCCESS', 'PIN berhasil diperbarui.', user.familyId, userId, user.fullName);
  }

  // --- AUTHENTICATION: LOGIN AS HEAD ---
  public loginHead(usernameOrEmail: string, passwordOrPin: string): AuthSession {
    const cleanUser = sanitizeInput(usernameOrEmail).toLowerCase();
    const cleanPass = passwordOrPin.trim();

    const user = this.users.find(u => 
      u.usernameOrEmail?.toLowerCase() === cleanUser || u.fullName.toLowerCase() === cleanUser
    );

    if (!user) {
      this.logSecurity('LOGIN_KEPALA_GAGAL', 'FAILED', `Username ${cleanUser} tidak ditemukan.`);
      throw new Error('Akun tidak ditemukan. Pastikan email atau username benar.');
    }

    const inputHash = fastHashSync(cleanPass);
    const isValid = (user.password && (user.password === inputHash || user.password === cleanPass)) ||
                    (user.pin && (user.pin === inputHash || user.pin === cleanPass));

    if (!isValid) {
      this.logSecurity('LOGIN_KEPALA_GAGAL', 'FAILED', 'Password/PIN salah.', user.familyId, user.id, user.fullName);
      throw new Error('Password atau PIN salah.');
    }

    const family = this.getFamilyById(user.familyId);
    if (!family) throw new Error('Data keluarga tidak ditemukan.');

    this.logSecurity('LOGIN_KEPALA_SUKSES', 'SUCCESS', 'Masuk berhasil sebagai Kepala Keluarga.', family.id, user.id, user.fullName);

    const session: AuthSession = { user, family };
    this.saveSession(session);
    return session;
  }

  // --- AUTHENTICATION: LOGIN AS MEMBER ---
  public loginMemberWithCode(familyCode: string, userId: string, pin: string): AuthSession {
    const cleanCode = sanitizeInput(familyCode).toUpperCase();
    const family = this.getFamilyByCode(cleanCode);
    if (!family) {
      this.logSecurity('LOGIN_ANGGOTA_GAGAL', 'FAILED', `Kode keluarga ${cleanCode} tidak valid.`);
      throw new Error('Kode Keluarga tidak valid. Contoh: ASTA-2026');
    }

    const user = this.users.find(u => u.id === userId && u.familyId === family.id);
    if (!user) {
      throw new Error('Anggota keluarga tidak ditemukan dalam kode keluarga ini.');
    }

    const inputHash = fastHashSync(pin.trim());
    const isValid = (user.pin && (user.pin === inputHash || user.pin === pin.trim()));

    if (!isValid) {
      this.logSecurity('LOGIN_ANGGOTA_GAGAL', 'FAILED', 'PIN anggota salah.', family.id, user.id, user.fullName);
      throw new Error('PIN anggota salah.');
    }

    this.logSecurity('LOGIN_ANGGOTA_SUKSES', 'SUCCESS', `Masuk berhasil sebagai ${user.fullName} (${user.roleTitle})`, family.id, user.id, user.fullName);

    const session: AuthSession = { user, family };
    this.saveSession(session);
    return session;
  }

  // --- PERSISTENT SESSION MANAGEMENT ---
  public getSavedSession(): AuthSession | null {
    try {
      if (typeof window === 'undefined') return null;
      const raw = localStorage.getItem('asta_active_session_v2') || sessionStorage.getItem('asta_active_session_v2');
      if (raw) {
        const parsed: AuthSession = JSON.parse(raw);
        if (parsed && parsed.user && parsed.user.id && parsed.family && parsed.family.id) {
          return parsed;
        }
      }
    } catch {
      return null;
    }
    return null;
  }

  public saveSession(session: AuthSession | null): void {
    try {
      if (typeof window === 'undefined') return;
      if (session) {
        const json = JSON.stringify(session);
        localStorage.setItem('asta_active_session_v2', json);
        sessionStorage.setItem('asta_active_session_v2', json);
      } else {
        this.clearSession();
      }
    } catch (err) {
      console.error('Error saving session:', err);
    }
  }

  public clearSession(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('asta_active_session_v2');
        sessionStorage.removeItem('asta_active_session_v2');
        localStorage.removeItem('asta_db_auth_session');
      }
    } catch (err) {
      console.error('Error clearing session:', err);
    }
  }
}

export const db = new DatabaseService();
