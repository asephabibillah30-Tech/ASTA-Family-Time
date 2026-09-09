import type { FamilyAccount, UserAccount, RegisterHeadDTO, AddMemberDTO, AuthSession } from '../../types/auth';

// Storage Keys
const FAMILIES_KEY = 'asta_db_families';
const USERS_KEY = 'asta_db_users';
const CURRENT_SESSION_KEY = 'asta_db_auth_session';

// Initial Demo Family & Users
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
    password: '123',
    pin: '1234',
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
    pin: '1234',
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
    pin: '1234',
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
    pin: '1234',
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

// Generate unique Family Code: "ASTA-XXXX"
export function generateFamilyCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `ASTA-${num}`;
}

class DatabaseService {
  private families: FamilyAccount[];
  private users: UserAccount[];

  constructor() {
    this.families = loadData<FamilyAccount[]>(FAMILIES_KEY, [DEFAULT_FAMILY]);
    this.users = loadData<UserAccount[]>(USERS_KEY, DEFAULT_USERS);
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

  // --- FAMILIES TABLE ---
  public getFamilies(): FamilyAccount[] {
    return this.families;
  }

  public getFamilyById(id: string): FamilyAccount | undefined {
    return this.families.find(f => f.id === id);
  }

  public getFamilyByCode(code: string): FamilyAccount | undefined {
    const cleanCode = code.trim().toUpperCase();
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

  // --- REGISTER HEAD OF FAMILY (Creates Family & First User) ---
  public registerHeadOfFamily(dto: RegisterHeadDTO): AuthSession {
    const familyId = `fam-${Date.now()}`;
    const headUserId = `usr-${Date.now()}`;
    const familyCode = generateFamilyCode();

    const newFamily: FamilyAccount = {
      id: familyId,
      familyName: dto.familyName.trim() || 'Keluarga Bahagia',
      familyCode,
      headUserId,
      streakDays: 1,
      totalLovePoints: 100,
      createdAt: new Date().toISOString()
    };

    const newHeadUser: UserAccount = {
      id: headUserId,
      familyId,
      fullName: dto.headFullName.trim(),
      role: 'head_family',
      roleTitle: dto.roleTitle || 'Ayah',
      usernameOrEmail: dto.usernameOrEmail.trim().toLowerCase(),
      password: dto.password,
      pin: dto.pin || '1234',
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
      throw new Error('Hanya Kepala Keluarga yang memiliki izin untuk menambahkan anggota keluarga baru.');
    }

    const newMemberId = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newMember: UserAccount = {
      id: newMemberId,
      familyId,
      fullName: dto.fullName.trim(),
      role: 'member',
      roleTitle: dto.roleTitle,
      pin: dto.pin || '1234',
      avatar: dto.avatar || '👦',
      color: dto.color || 'bg-amber-500',
      lovePoints: 50,
      isHead: false,
      createdAt: new Date().toISOString()
    };

    this.users = [...this.users, newMember];
    saveData(USERS_KEY, this.users);
    return newMember;
  }

  // --- UPDATE MEMBER (By Head or Self) ---
  public updateMember(
    requesterUserId: string,
    memberId: string,
    updates: Partial<UserAccount>
  ): UserAccount {
    const requester = this.getUserById(requesterUserId);
    if (!requester) throw new Error('Pengguna tidak ditemukan.');

    const targetUser = this.getUserById(memberId);
    if (!targetUser) throw new Error('Anggota keluarga tidak ditemukan.');

    // Only head can edit others; member can only edit self avatar/pin
    if (!requester.isHead && requester.id !== memberId) {
      throw new Error('Hanya Kepala Keluarga yang dapat mengedit profil anggota lain.');
    }

    // Protect isHead from being revoked arbitrarily
    if (updates.isHead !== undefined && !requester.isHead) {
      delete updates.isHead;
    }

    this.users = this.users.map(u => {
      if (u.id === memberId) {
        return { ...u, ...updates };
      }
      return u;
    });

    saveData(USERS_KEY, this.users);
    return this.getUserById(memberId)!;
  }

  // --- DELETE MEMBER (Exclusive privilege of Head of Family) ---
  public deleteMemberByHead(requesterUserId: string, memberId: string): void {
    const requester = this.getUserById(requesterUserId);
    if (!requester || !requester.isHead) {
      throw new Error('Hanya Kepala Keluarga yang berhak menghapus anggota keluarga.');
    }

    if (requester.id === memberId) {
      throw new Error('Kepala Keluarga tidak dapat menghapus akunnya sendiri.');
    }

    this.users = this.users.filter(u => u.id !== memberId);
    saveData(USERS_KEY, this.users);
  }

  // --- AUTHENTICATION: LOGIN AS HEAD (Email + Password) ---
  public loginHead(usernameOrEmail: string, passwordOrPin: string): AuthSession {
    const cleanUser = usernameOrEmail.trim().toLowerCase();
    const user = this.users.find(u => 
      u.usernameOrEmail?.toLowerCase() === cleanUser || u.fullName.toLowerCase() === cleanUser
    );

    if (!user) {
      throw new Error('Akun tidak ditemukan. Pastikan email atau username benar.');
    }

    if (user.password && user.password !== passwordOrPin && user.pin !== passwordOrPin) {
      throw new Error('Password atau PIN salah.');
    }

    const family = this.getFamilyById(user.familyId);
    if (!family) {
      throw new Error('Data keluarga tidak ditemukan.');
    }

    const session: AuthSession = { user, family };
    this.saveSession(session);
    return session;
  }

  // --- AUTHENTICATION: QUICK LOGIN MEMBER (Family Code + Member ID + PIN) ---
  public loginMemberWithCode(familyCode: string, userId: string, pin: string): AuthSession {
    const family = this.getFamilyByCode(familyCode);
    if (!family) {
      throw new Error('Kode Keluarga tidak valid. Contoh: ASTA-2026');
    }

    const user = this.users.find(u => u.id === userId && u.familyId === family.id);
    if (!user) {
      throw new Error('Anggota keluarga tidak ditemukan dalam kode keluarga ini.');
    }

    if (user.pin && user.pin !== pin) {
      throw new Error('PIN anggota salah.');
    }

    const session: AuthSession = { user, family };
    this.saveSession(session);
    return session;
  }

  // --- SESSION PERSISTENCE ---
  public getSavedSession(): AuthSession | null {
    return loadData<AuthSession | null>(CURRENT_SESSION_KEY, {
      user: DEFAULT_USERS[0],
      family: DEFAULT_FAMILY
    });
  }

  public saveSession(session: AuthSession | null): void {
    saveData(CURRENT_SESSION_KEY, session);
  }

  public clearSession(): void {
    localStorage.removeItem(CURRENT_SESSION_KEY);
  }
}

export const db = new DatabaseService();
