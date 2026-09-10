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

// Initial Demo Family & Users (Secured with Fast Hashing)
export const DEFAULT_FAMILY: FamilyAccount = {
  id: 'fam-asta-default',
  familyName: 'Keluarga Harmonis ASTA',
  familyCode: 'ASTA-2026',
  headUserId: 'usr-ayah',
  streakDays: 7,
  totalLovePoints: 120,
  createdAt: '2026-01-01T00:00:00.000Z'
};

export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'usr-ayah',
    familyId: 'fam-asta-default',
    fullName: 'Ayah Asep',
    role: 'head_family',
    roleTitle: 'Ayah',
    usernameOrEmail: 'ayah@asta.com',
    password: fastHashSync('123'),
    pin: fastHashSync('1234'),
    avatar: '👨‍💼',
    color: 'bg-blue-500',
    lovePoints: 120,
    isHead: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-ibu',
    familyId: 'fam-asta-default',
    fullName: 'Ibu Habibah',
    role: 'member',
    roleTitle: 'Ibu',
    usernameOrEmail: 'ibu@asta.com',
    pin: fastHashSync('1234'),
    avatar: '👩‍🍳',
    color: 'bg-rose-500',
    lovePoints: 95,
    isHead: false,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-kakak',
    familyId: 'fam-asta-default',
    fullName: 'Kakak Alif',
    role: 'member',
    roleTitle: 'Kakak',
    usernameOrEmail: 'kakak@asta.com',
    pin: fastHashSync('1234'),
    avatar: '👦',
    color: 'bg-amber-500',
    lovePoints: 80,
    isHead: false,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-adik',
    familyId: 'fam-asta-default',
    fullName: 'Adik Aqila',
    role: 'member',
    roleTitle: 'Adik',
    usernameOrEmail: 'adik@asta.com',
    pin: fastHashSync('1234'),
    avatar: '👧',
    color: 'bg-teal-500',
    lovePoints: 70,
    isHead: false,
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

function loadData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
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
    this.families = loadData<FamilyAccount[]>(FAMILIES_KEY, [DEFAULT_FAMILY]);
    this.users = loadData<UserAccount[]>(USERS_KEY, DEFAULT_USERS);
    this.logs = loadData<SecurityAuditLog[]>(SECURITY_LOGS_KEY, [
      {
        id: 'log-init',
        familyId: DEFAULT_FAMILY.id,
        userName: 'Sistem ASTA',
        action: 'INICIALISASI_DATABASE_AMAN',
        status: 'SUCCESS',
        details: 'Enkripsi SHA-256 dan Row-Level Security aktif.',
        timestamp: new Date().toISOString()
      }
    ]);
    this.ensureDefaultSeeded();
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
      // 1. Upsert all families (termasuk keluarga demo & keluarga baru)
      for (const f of this.families) {
        const { error } = await supabase.from('families').upsert({
          id: f.id,
          family_name: f.familyName,
          family_code: f.familyCode,
          head_user_id: f.headUserId || null,
          streak_days: f.streakDays || 1,
          total_love_points: f.totalLovePoints || 100
        }, { onConflict: 'id' });
        if (error) console.error('Supabase families upsert error:', error.message, error.details);
      }

      // 2. Upsert all users (termasuk pengguna demo & pengguna baru)
      for (const u of this.users) {
        const { error } = await supabase.from('users').upsert({
          id: u.id,
          family_id: u.familyId,
          full_name: u.fullName,
          role: u.role,
          role_title: u.roleTitle,
          username: u.usernameOrEmail || null,
          password_hash: u.password || null,
          pin: u.pin || null,
          avatar: u.avatar || '👨‍💼',
          color: u.color || 'bg-blue-500',
          love_points: u.lovePoints || 50,
          is_head: Boolean(u.isHead)
        }, { onConflict: 'id' });
        if (error) console.error('Supabase users upsert error:', error.message, error.details);
      }
    } catch (err) {
      console.warn('Sync local to cloud failed:', err);
    }
  }

  public async syncFromCloud(): Promise<void> {
    const supabase = postgresService.getClient();
    if (!supabase) return;
    try {
      const { data: cloudFamilies, error: famError } = await supabase.from('families').select('*');
      if (!famError && cloudFamilies && cloudFamilies.length > 0) {
        const mappedFamilies: FamilyAccount[] = cloudFamilies.map(f => ({
          id: f.id,
          familyName: f.family_name,
          familyCode: f.family_code,
          headUserId: f.head_user_id,
          streakDays: f.streak_days || 1,
          totalLovePoints: f.total_love_points || 100,
          createdAt: f.created_at
        }));
        const combined = [...this.families];
        for (const mf of mappedFamilies) {
          const idx = combined.findIndex(x => x.id === mf.id);
          if (idx >= 0) combined[idx] = mf;
          else combined.push(mf);
        }
        this.families = combined;
        saveData(FAMILIES_KEY, this.families);
      }

      const { data: cloudUsers, error: usrError } = await supabase.from('users').select('*');
      if (!usrError && cloudUsers && cloudUsers.length > 0) {
        const mappedUsers: UserAccount[] = cloudUsers.map(u => ({
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
        const combinedUsers = [...this.users];
        for (const mu of mappedUsers) {
          const idx = combinedUsers.findIndex(x => x.id === mu.id);
          if (idx >= 0) combinedUsers[idx] = mu;
          else combinedUsers.push(mu);
        }
        this.users = combinedUsers;
        saveData(USERS_KEY, this.users);
      }
    } catch (err) {
      console.warn('Cloud sync error:', err);
    }
  }

  private ensureDefaultSeeded() {
    if (!this.families || this.families.length === 0) {
      this.families = [DEFAULT_FAMILY];
      saveData(FAMILIES_KEY, this.families);
    }
    if (!this.users || this.users.length === 0) {
      this.users = DEFAULT_USERS;
      saveData(USERS_KEY, this.users);
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
    if (supabase) {
      Promise.resolve(supabase.from('security_audit_logs').insert({
        id: newLog.id,
        family_id: familyId || null,
        user_id: userId || null,
        user_name: userName || 'Anonim',
        action,
        status,
        details,
        ip_or_device: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 80) : 'Web Client'
      })).catch(console.warn);
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
