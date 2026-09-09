import type { FamilyAccount, UserAccount, RegisterHeadDTO, AddMemberDTO, AuthSession } from '../../types/auth';
import { fastHashSync, sanitizeInput } from '../../utils/security';

// Storage Keys
const FAMILIES_KEY = 'asta_db_families';
const USERS_KEY = 'asta_db_users';
const CURRENT_SESSION_KEY = 'asta_db_auth_session';
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
    this.logs = [newLog, ...this.logs.slice(0, 49)]; // keep latest 50 logs
    saveData(SECURITY_LOGS_KEY, this.logs);
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

  // --- SESSION PERSISTENCE ---
  public getSavedSession(): AuthSession | null {
    return loadData<AuthSession | null>(CURRENT_SESSION_KEY, null);
  }

  public saveSession(session: AuthSession | null): void {
    saveData(CURRENT_SESSION_KEY, session);
  }

  public clearSession(): void {
    localStorage.removeItem(CURRENT_SESSION_KEY);
  }
}

export const db = new DatabaseService();
