import bcrypt from 'bcryptjs';
import { AuditService } from '../../audit/services/audit-service';
import { UserRepository } from '../repositories/user-repository';
import { APP_CONFIG } from '../../../shared/constants/config';

const BCRYPT_ROUNDS = 10;
// bcrypt hashes always start with one of these prefixes — anything else
// stored in `passwordHash` predates hashing and is legacy plaintext.
const BCRYPT_PREFIX = /^\$2[aby]?\$/;

function isBcryptHash(value: string): boolean {
  return BCRYPT_PREFIX.test(value);
}

export interface UserSession {
  id: string;
  name: string;
  role: string;
  branchId: string;
}

export interface AuthResult {
  success: boolean;
  user?: UserSession;
  message?: string;
}

export class AuthService {
  private static async seedDefaultAdmin() {
    const userCount = await UserRepository.count();
    if (userCount === 0) {
      const hash = bcrypt.hashSync('admin123', BCRYPT_ROUNDS);
      await UserRepository.createUser('admin', hash, 'admin');
    }
  }

  static async login(username: string, password: any): Promise<AuthResult> {
    await this.seedDefaultAdmin();

    const userRecord = await UserRepository.findByUsername(username);

    if (!userRecord || !userRecord.active) {
      return { success: false, message: 'Invalid credentials' };
    }

    // Self-healing migration: any account created before hashing was added
    // has a plaintext passwordHash. Verify it the old way exactly once, and
    // if it matches, transparently re-hash it with bcrypt so it never has
    // to be compared in plaintext again.
    let passwordMatches: boolean;
    if (isBcryptHash(userRecord.passwordHash)) {
      passwordMatches = bcrypt.compareSync(String(password), userRecord.passwordHash);
    } else {
      passwordMatches = userRecord.passwordHash === password;
      if (passwordMatches) {
        const newHash = bcrypt.hashSync(String(password), BCRYPT_ROUNDS);
        await UserRepository.updatePassword(userRecord.username, newHash);
      }
    }

    if (!passwordMatches) {
      return { success: false, message: 'Invalid credentials' };
    }

    const user: UserSession = {
      id: userRecord.id,
      name: userRecord.username,
      role: userRecord.role,
      branchId: APP_CONFIG.branch.defaultId, // Default branch from config
    };

    // Log the login event
    await AuditService.log({
      userId: user.id,
      deviceId: APP_CONFIG.branch.defaultDeviceId,
      branchId: user.branchId,
      action: 'AUTH_LOGIN',
      entity: 'user',
      entityId: user.id,
    });

    return {
      success: true,
      user,
    };
  }

  static async logout(userId: string, branchId: string): Promise<void> {
    await AuditService.log({
      userId,
      deviceId: APP_CONFIG.branch.defaultDeviceId,
      branchId,
      action: 'AUTH_LOGOUT',
      entity: 'user',
      entityId: userId,
    });
  }

  static async getUsers(): Promise<any[]> {
    const list = await UserRepository.listAllUsers();
    return list.map(u => ({
      id: u.id,
      name: u.username,
      role: u.role,
      branchId: APP_CONFIG.branch.defaultId,
      active: u.active
    }));
  }

  static async createUser(username: string, password: string, role: string, adminUserId: string): Promise<any> {
    const existing = await UserRepository.findByUsername(username);
    if (existing) {
      throw new Error(`Username ${username} already exists`);
    }
    const hash = bcrypt.hashSync(password, BCRYPT_ROUNDS);
    const newUser = await UserRepository.createUser(username, hash, role as any);

    await AuditService.log({
      userId: adminUserId,
      deviceId: APP_CONFIG.branch.defaultDeviceId,
      branchId: APP_CONFIG.branch.defaultId,
      action: 'USER_CREATED',
      entity: 'user',
      entityId: newUser.id,
      newValue: JSON.stringify({ username, role }),
    });

    return { success: true };
  }

  static async changePassword(username: string, newPassword: string, adminUserId: string): Promise<any> {
    const hash = bcrypt.hashSync(newPassword, BCRYPT_ROUNDS);
    await UserRepository.updatePassword(username, hash);

    await AuditService.log({
      userId: adminUserId,
      deviceId: APP_CONFIG.branch.defaultDeviceId,
      branchId: APP_CONFIG.branch.defaultId,
      action: 'USER_PASSWORD_CHANGED',
      entity: 'user',
      entityId: username,
    });

    return { success: true };
  }
}

export default AuthService;
