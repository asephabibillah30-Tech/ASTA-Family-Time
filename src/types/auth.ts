export type FamilyRole = 'head_family' | 'member';

export type FamilyRoleTitle = 
  | 'Ayah' 
  | 'Ibu' 
  | 'Kakak' 
  | 'Adik' 
  | 'Kakek' 
  | 'Nenek' 
  | 'Paman' 
  | 'Bibi' 
  | 'Kepala Keluarga' 
  | 'Anggota';

export interface UserAccount {
  id: string;
  familyId: string;
  fullName: string;
  role: FamilyRole;
  roleTitle: FamilyRoleTitle;
  usernameOrEmail?: string;
  pin: string; // 4-digit PIN for member / quick login
  password?: string; // For head of family
  avatar: string;
  color: string;
  lovePoints: number;
  isHead: boolean;
  createdAt: string;
  isOnline?: boolean;
}

export interface FamilyAccount {
  id: string;
  familyName: string;
  familyCode: string; // e.g. "ASTA-8821"
  headUserId: string;
  streakDays: number;
  totalLovePoints: number;
  createdAt: string;
}

export interface AuthSession {
  user: UserAccount;
  family: FamilyAccount;
}

export interface RegisterHeadDTO {
  headFullName: string;
  roleTitle: FamilyRoleTitle;
  familyName: string;
  usernameOrEmail: string;
  password: string;
  pin: string;
  avatar: string;
  color: string;
}

export interface AddMemberDTO {
  fullName: string;
  roleTitle: FamilyRoleTitle;
  pin: string;
  avatar: string;
  color: string;
}
