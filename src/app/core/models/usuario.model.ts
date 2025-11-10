export enum UserRole {
  ADMIN = 'admin',
  MEDICO = 'medico',
  CLIENTE = 'cliente',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
}

export enum Especialidad {
  MEDICINA_GENERAL = 'MEDICINA_GENERAL',
  PEDIATRIA = 'PEDIATRIA',
  GINECOLOGIA = 'GINECOLOGIA',
  CARDIOLOGIA = 'CARDIOLOGIA',
  DERMATOLOGIA = 'DERMATOLOGIA',
  PSIQUIATRIA = 'PSIQUIATRIA',
  ODONTOLOGIA = 'ODONTOLOGIA',
  OFTALMOLOGIA = 'OFTALMOLOGIA',
}

export interface MedicoProfile {
  id: string;
  especialidades: Especialidad[];
  numeroLicencia: string;
  telefonoCodigoPais?: string;
  telefonoNumero?: string;
  tokensDisponibles: number;
}

export interface Usuario {
  id: string;
  email: string;
  nombreCompleto: string;
  role: UserRole;
  avatarUrl?: string;
  emailVerified: boolean;
  provider: AuthProvider;
  medico?: MedicoProfile;
}

export interface AuthResponse {
  usuario: Usuario;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  nombreCompleto: string;
  especialidades?: Especialidad[];
  numeroLicencia: string;
  telefono?: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}
