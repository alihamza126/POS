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
}

export default AuthService;
