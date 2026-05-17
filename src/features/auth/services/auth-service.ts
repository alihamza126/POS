import { AuditService } from '../../audit/services/audit-service';
import { UserRepository } from '../repositories/user-repository';
import { APP_CONFIG } from '../../../shared/constants/config';

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
      // In a real app, use bcrypt or similar for hashing
      // For this demo/POS setup, we'll store a "hash" (plain for now as it's dev)
      await UserRepository.createUser('admin', 'admin123', 'admin');
    }
  }

  static async login(username: string, password: any): Promise<AuthResult> {
    await this.seedDefaultAdmin();

    const userRecord = await UserRepository.findByUsername(username);

    if (
      userRecord &&
      userRecord.passwordHash === password &&
      userRecord.active
    ) {
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

    return {
      success: false,
      message: 'Invalid credentials',
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

  static async createUser(username: string, passwordHash: string, role: string, adminUserId: string): Promise<any> {
    const existing = await UserRepository.findByUsername(username);
    if (existing) {
      throw new Error(`Username ${username} already exists`);
    }
    const newUser = await UserRepository.createUser(username, passwordHash, role as any);
    
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

  static async changePassword(username: string, newPasswordHash: string, adminUserId: string): Promise<any> {
    await UserRepository.updatePassword(username, newPasswordHash);

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
