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
    // PENTING: isOnline TIDAK BOLEH dipersist ke localStorage.
    // Reset semua isOnline ke false saat load — status online hanya dari heartbeat aktif.
    const rawUsers = loadData<UserAccount[]>(USERS_KEY, []);
    this.users = rawUsers.map(u => ({ ...u, isOnline: false }));
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
    // Melakukan sinkronisasi terfokus hanya jika ada sesi keluarga aktif yang tersimpan
    const activeSession = this.getSavedSession();
    if (activeSession?.family?.id) {
      this.syncActiveFamily(activeSession.family.id).catch(() => {});
    }
  }

  /**
   * Sinkronisasi data TERFOKUS hanya untuk keluarga yang sedang aktif/login.
   * Mencegah pembocoran data antar-keluarga dan menjaga privasi pengguna.
   */
  public async syncActiveFamily(familyId: string): Promise<void> {
    if (!familyId) return;
    const supabase = postgresService.getClient();
    if (!supabase) return;

    try {
      // 1. Ambil data keluarga aktif dari cloud
      const { data: cloudFam } = await supabase
        .from('families')
        .select('*')
        .eq('id', familyId)
        .maybeSingle();

      if (cloudFam) {
        const updatedFam: FamilyAccount = {
          id: cloudFam.id,
          familyName: cloudFam.family_name,
          familyCode: cloudFam.family_code,
          headUserId: cloudFam.head_user_id,
          streakDays: cloudFam.streak_days || 1,
          totalLovePoints: cloudFam.total_love_points || 100,
          createdAt: cloudFam.created_at
        };
        const idx = this.families.findIndex(f => f.id === familyId);
        if (idx >= 0) this.families[idx] = updatedFam;
        else this.families.push(updatedFam);
        saveData(FAMILIES_KEY, this.families);
      }

      // 2. Ambil data anggota keluarga aktif dari cloud (difilter strictly berdasarkan family_id)
      const { data: cloudUsers } = await supabase
        .from('users')
        .select('*')
        .eq('family_id', familyId);

      if (cloudUsers && cloudUsers.length > 0) {
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

        // Ganti/update data pengguna untuk keluarga ini di memori lokal
        this.users = [...this.users.filter(u => u.familyId !== familyId), ...mappedUsers];
        saveData(USERS_KEY, this.users);
      }

      // 3. Dorong data offline keluarga aktif ke cloud saat online (Aktivitas Up Data Offline)
      const activeFamLocal = this.families.find(f => f.id === familyId);
      if (activeFamLocal) {
        await supabase.from('families').upsert({
          id: activeFamLocal.id,
          family_name: activeFamLocal.familyName,
          family_code: activeFamLocal.familyCode,
          head_user_id: activeFamLocal.headUserId || null,
          streak_days: activeFamLocal.streakDays,
          total_love_points: activeFamLocal.totalLovePoints
        }, { onConflict: 'id' });
      }

      const activeUsersLocal = this.users.filter(u => u.familyId === familyId);
      for (const u of activeUsersLocal) {
        await supabase.from('users').upsert({
          id: u.id,
          family_id: u.familyId,
          full_name: u.fullName,
          role: u.role,
          role_title: u.roleTitle,
          username: u.usernameOrEmail || null,
          password_hash: u.password || null,
          pin: u.pin || null,
          avatar: u.avatar,
          color: u.color,
          love_points: u.lovePoints,
          is_head: u.isHead
        }, { onConflict: 'id' });
      }
    } catch (e) {
      // Gagal sync offline diam-diam tanpa spam log
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

  public async findFamilyByCodeAsync(code: string): Promise<FamilyAccount | undefined> {
    const cleanCode = sanitizeInput(code).toUpperCase();
    if (!cleanCode) return undefined;

    const localFam = this.getFamilyByCode(cleanCode);
    if (localFam) {
      await this.syncActiveFamily(localFam.id).catch(() => {});
      return this.getFamilyByCode(cleanCode) || localFam;
    }

    const supabase = postgresService.getClient();
    if (supabase) {
      try {
        const { data: cloudFam, error } = await supabase
          .from('families')
          .select('*')
          .eq('family_code', cleanCode)
          .maybeSingle();

        if (!error && cloudFam) {
          await this.syncActiveFamily(cloudFam.id);
          return this.getFamilyByCode(cleanCode);
        }
      } catch (err) {
        // Gagal pencarian cloud diam-diam
      }
    }

    return undefined;
  }


  // --- USERS TABLE ---
  public getUsers(): UserAccount[] {
    return this.users;
  }

  public getUsersByFamily(familyId: string): UserAccount[] {
    const onlineIds = this.getOnlineUserIds(familyId);
    return this.users
      .filter(u => u.familyId === familyId)
      .map(u => ({
        ...u,
        isOnline: onlineIds.includes(u.id)
      }));
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
          if (fErr) console.error('Supabase family registration error:', fErr.message);

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
          if (uErr) console.error('Supabase user registration error:', uErr.message);

          // 3. Link head_user_id
          await supabase.from('families').update({ head_user_id: headUserId }).eq('id', familyId);
        } catch (err) {
          // Silent catch
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

  // --- UPDATE MEMBER PIN BY HEAD ---
  public updateMemberPinByHead(headUserId: string, targetUserId: string, newPin: string): void {
    const headUser = this.getUserById(headUserId);
    if (!headUser?.isHead) throw new Error('Hanya Kepala Keluarga yang memiliki akses mereset PIN anggota.');

    const targetUser = this.getUserById(targetUserId);
    if (!targetUser) throw new Error('Anggota tidak ditemukan.');

    const cleanPin = newPin.trim();
    if (cleanPin.length < 4) throw new Error('PIN minimal 4 digit.');

    const newHash = fastHashSync(cleanPin);
    this.users = this.users.map(u => u.id === targetUserId ? { ...u, pin: newHash } : u);
    saveData(USERS_KEY, this.users);

    const supabase = postgresService.getClient();
    if (supabase) {
      Promise.resolve(supabase.from('users').update({ pin: newHash }).eq('id', targetUserId)).catch(console.warn);
    }

    this.logSecurity('RESET_PIN_ANGGOTA', 'SUCCESS', `PIN untuk ${targetUser.fullName} diperbarui oleh ${headUser.fullName}.`, headUser.familyId, headUserId, headUser.fullName);
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

  public async loginHeadAsync(usernameOrEmail: string, passwordOrPin: string): Promise<AuthSession> {
    try {
      return this.loginHead(usernameOrEmail, passwordOrPin);
    } catch (err: any) {
      const cleanUser = sanitizeInput(usernameOrEmail).toLowerCase();
      const supabase = postgresService.getClient();
      if (supabase && cleanUser) {
        try {
          const { data: cloudUsers } = await supabase
            .from('users')
            .select('*')
            .or(`username.eq.${cleanUser},full_name.ilike.${cleanUser}`);

          if (cloudUsers && cloudUsers.length > 0) {
            const familyId = cloudUsers[0].family_id;
            if (familyId) {
              await this.syncActiveFamily(familyId);
              return this.loginHead(usernameOrEmail, passwordOrPin);
            }
          }
        } catch {
          // ignore cloud fetch error
        }
      }
      throw err;
    }
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
        this.sendHeartbeat(session.family.id, session.user.id);
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

  // --- REAL-TIME USER PRESENCE (ONLINE STATUS - CROSS-DEVICE via Supabase) ---

  /**
   * Kirim heartbeat ke localStorage DAN Supabase (cross-device).
   * Supabase memungkinkan anggota di device berbeda melihat status online.
   */
  public sendHeartbeat(familyId: string, userId: string): void {
    if (!familyId || !userId) return;
    try {
      // 1. Local heartbeat (same-device cross-tab)
      const key = `asta_presence_${familyId}`;
      const raw = localStorage.getItem(key);
      const map: Record<string, number> = raw ? JSON.parse(raw) : {};
      map[userId] = Date.now();
      localStorage.setItem(key, JSON.stringify(map));

      // Broadcast to same-browser tabs
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const ch = new BroadcastChannel(`asta_presence_${familyId}`);
        ch.postMessage({ type: 'PRESENCE_HEARTBEAT', userId, timestamp: Date.now() });
        ch.close();
      }

      // 2. Cloud heartbeat (cross-device via Supabase)
      const supabase = postgresService.getClient();
      if (supabase) {
        supabase.from('user_presence').upsert(
          {
            user_id: userId,
            family_id: familyId,
            last_seen_at: new Date().toISOString(),
            is_online: true
          },
          { onConflict: 'user_id' }
        ).then(({ error }) => {
          if (error) {
            this._ensurePresenceTable(supabase, userId, familyId);
          }
        });
      }
    } catch {
      // ignore
    }
  }

  /**
   * Tandai user offline — hapus dari semua localStorage presence maps dan update Supabase.
   * Dipanggil saat tab disembunyikan / browser ditutup / ganti akun / logout.
   */
  public markUserOffline(familyId: string, userId: string): void {
    if (!familyId || !userId) return;
    try {
      // 1. Hapus dari semua localStorage presence maps
      const keys = [
        `asta_presence_${familyId}`,
        `asta_cloud_presence_${familyId}`,
        `asta_realtime_presence_${familyId}`
      ];
      keys.forEach((key) => {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const map: Record<string, number> = JSON.parse(raw);
            delete map[userId];
            localStorage.setItem(key, JSON.stringify(map));
          } catch { /* ignore */ }
        }
      });

      // Reset in-memory
      this.users = this.users.map(u => u.id === userId ? { ...u, isOnline: false } : u);

      // 2. Update Supabase (set timestamp jauh ke masa lalu agar tidak terdeteksi online)
      const supabase = postgresService.getClient();
      if (supabase) {
        Promise.resolve(supabase.from('user_presence').upsert(
          {
            user_id: userId,
            family_id: familyId,
            last_seen_at: new Date(Date.now() - 600000).toISOString(), // 10 menit lalu
            is_online: false
          },
          { onConflict: 'user_id' }
        )).catch(() => {});
      }

      // Broadcast offline ke tab lain
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const ch = new BroadcastChannel(`asta_presence_${familyId}`);
        ch.postMessage({ type: 'PRESENCE_OFFLINE', userId });
        ch.close();
      }
    } catch {
      // ignore
    }
  }

  /** Buat tabel user_presence jika belum ada via raw SQL exec */
  private async _ensurePresenceTable(supabase: any, userId: string, familyId: string): Promise<void> {
    try {
      await supabase.rpc('create_presence_table_if_not_exists').catch(() => {});
      await supabase.from('user_presence').upsert(
        {
          user_id: userId,
          family_id: familyId,
          last_seen_at: new Date().toISOString(),
          is_online: true
        },
        { onConflict: 'user_id' }
      ).catch(() => {});
    } catch {
      // ignore
    }
  }

  /**
   * Ambil daftar user online secara konsisten & instan.
   */
  public getOnlineUserIds(familyId: string, currentUserId?: string): string[] {
    if (!familyId) return currentUserId ? [currentUserId] : [];
    try {
      const now = Date.now();
      const onlineIds: string[] = [];

      // === Sumber 1: Realtime presence cache ===
      const realtimeKey = `asta_realtime_presence_${familyId}`;
      const realtimeRaw = localStorage.getItem(realtimeKey);
      if (realtimeRaw) {
        try {
          const map: Record<string, number> = JSON.parse(realtimeRaw);
          Object.keys(map).forEach((uid) => {
            if (now - map[uid] < 30000 && !onlineIds.includes(uid)) {
              onlineIds.push(uid);
            }
          });
        } catch { /* ignore */ }
      }

      // === Sumber 2: Local heartbeat (same device, threshold 25 detik) ===
      const key = `asta_presence_${familyId}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const map: Record<string, number> = JSON.parse(raw);
          Object.keys(map).forEach((uid) => {
            if (now - map[uid] < 25000 && !onlineIds.includes(uid)) {
              onlineIds.push(uid);
            }
          });
        } catch { /* ignore */ }
      }

      // === Sumber 3: Supabase cloud presence cache (threshold 30 detik) ===
      const cloudKey = `asta_cloud_presence_${familyId}`;
      const cloudRaw = localStorage.getItem(cloudKey);
      if (cloudRaw) {
        try {
          const cloudMap: Record<string, number> = JSON.parse(cloudRaw);
          Object.keys(cloudMap).forEach((uid) => {
            if (now - cloudMap[uid] < 30000 && !onlineIds.includes(uid)) {
              onlineIds.push(uid);
            }
          });
        } catch { /* ignore */ }
      }

      // User yang sedang aktif menggunakan browser ini selalu online
      if (currentUserId && !onlineIds.includes(currentUserId)) {
        onlineIds.push(currentUserId);
      }

      return onlineIds;
    } catch {
      return currentUserId ? [currentUserId] : [];
    }
  }

  /**
   * Ambil status online dari Supabase secara async dan cache ke localStorage.
   * Dipanggil dari useAuth setiap 15 detik.
   */
  public async fetchCloudPresence(familyId: string): Promise<string[]> {
    if (!familyId) return [];
    const supabase = postgresService.getClient();
    if (!supabase) return [];

    try {
      const cutoff = new Date(Date.now() - 90000).toISOString(); // 90 detik
      const { data, error } = await supabase
        .from('user_presence')
        .select('user_id, last_seen_at')
        .eq('family_id', familyId)
        .gte('last_seen_at', cutoff);

      if (error || !data) return [];

      // Cache ke localStorage agar getOnlineUserIds() bisa menggunakannya secara sinkron
      const cloudMap: Record<string, number> = {};
      const onlineIds: string[] = [];
      for (const row of data) {
        const ts = new Date(row.last_seen_at).getTime();
        cloudMap[row.user_id] = ts;
        onlineIds.push(row.user_id);
      }
      localStorage.setItem(`asta_cloud_presence_${familyId}`, JSON.stringify(cloudMap));

      return onlineIds;
    } catch {
      return [];
    }
  }

  /**
   * Cache daftar online IDs dari Supabase Realtime ke localStorage.
   * Dipanggil dari useAuth saat Realtime event 'sync'/'join'/'leave' diterima.
   * Sehingga getOnlineUserIds() sinkron dengan state WebSocket.
   */
  public cacheOnlineIds(
    familyId: string,
    allIds?: string[],
    changedId?: string,
    action?: 'join' | 'leave'
  ): void {
    try {
      const cacheKey = `asta_realtime_presence_${familyId}`;

      if (allIds) {
        // Set penuh dari event 'sync'
        const map: Record<string, number> = {};
        allIds.forEach(id => { map[id] = Date.now(); });
        localStorage.setItem(cacheKey, JSON.stringify(map));
      } else if (changedId && action) {
        // Update parsial dari event 'join'/'leave'
        const raw = localStorage.getItem(cacheKey);
        const map: Record<string, number> = raw ? JSON.parse(raw) : {};
        if (action === 'join') {
          map[changedId] = Date.now();
        } else {
          delete map[changedId];
        }
        localStorage.setItem(cacheKey, JSON.stringify(map));
      }
    } catch { /* ignore */ }
  }
}

export const db = new DatabaseService();
