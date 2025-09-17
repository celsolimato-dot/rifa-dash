// Re-export the real auth context
export { RealAuthProvider as AuthProvider, useRealAuth as useAuth } from './RealAuthContext';
export type { AuthUser as User } from './RealAuthContext';
export type UserRole = 'admin' | 'client';