import React, { useState, useEffect } from 'react';
import { 
  Users, 
  KeyRound, 
  Plus, 
  ShieldAlert, 
  Check, 
  X,
  UserPlus,
  RefreshCw,
  Lock
} from 'lucide-react';
import { useAuthStore } from '../../../stores/auth-store';

interface UserItem {
  id: string;
  name: string;
  role: 'owner' | 'admin' | 'manager' | 'cashier' | 'accountant';
  active: boolean;
}

export default function UserManagement() {
  const { user: currentUser } = useAuthStore();
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states for creating a user
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'owner' | 'admin' | 'manager' | 'cashier' | 'accountant'>('cashier');
  const [isCreating, setIsCreating] = useState(false);

  // States for changing password
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // @ts-ignore
      const result = await window.api.auth.getUsers();
      setUsersList(result || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      setError('Username and password are required');
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      // @ts-ignore
      await window.api.auth.createUser({
        username: newUsername.trim(),
        password: newPassword.trim(),
        role: newRole,
        adminUserId: currentUser?.id || 'admin'
      });
      setSuccess(`User "${newUsername}" created successfully!`);
      setNewUsername('');
      setNewPassword('');
      setNewRole('cashier');
      setIsCreating(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordVal.trim()) {
      setError('Password is required');
      return;
    }
    if (!selectedUser) return;
    setError(null);
    setSuccess(null);
    try {
      // @ts-ignore
      await window.api.auth.changePassword({
        username: selectedUser.name,
        newPassword: newPasswordVal.trim(),
        adminUserId: currentUser?.id || 'admin'
      });
      setSuccess(`Password for user "${selectedUser.name}" changed successfully!`);
      setNewPasswordVal('');
      setSelectedUser(null);
      setIsChangingPass(false);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-500/10 text-purple-600 border border-purple-200';
      case 'admin':
        return 'bg-red-500/10 text-red-600 border border-red-200';
      case 'manager':
        return 'bg-amber-500/10 text-amber-600 border border-amber-200';
      case 'accountant':
        return 'bg-blue-500/10 text-blue-600 border border-blue-200';
      default:
        return 'bg-emerald-500/10 text-emerald-600 border border-emerald-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 flex items-center gap-3 animate-in fade-in duration-300">
          <ShieldAlert size={20} className="shrink-0" />
          <p className="font-semibold text-sm">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <X size={18} />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200 flex items-center gap-3 animate-in fade-in duration-300">
          <Check size={20} className="shrink-0" />
          <p className="font-semibold text-sm">{success}</p>
          <button onClick={() => setSuccess(null)} className="ml-auto text-emerald-500 hover:text-emerald-700">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User List Panel */}
        <div className="lg:col-span-2 bg-surface rounded-[32px] border border-navy/10 shadow-soft p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-navy/5 rounded-xl flex items-center justify-center text-navy">
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-navy">Terminal Users</h3>
                <p className="text-navy/50 text-xs font-semibold">Active credentials that can access this POS</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={fetchUsers}
                className="p-2.5 rounded-xl border border-navy/10 text-navy hover:bg-navy/5 transition-all"
                title="Refresh user list"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
              <button 
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/95 shadow-md shadow-primary/20 transition-all flex items-center gap-2 text-sm"
              >
                <UserPlus size={16} />
                Add User
              </button>
            </div>
          </div>

          {loading && usersList.length === 0 ? (
            <div className="py-12 text-center text-navy/40 font-medium">Loading active user accounts...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-navy/5 text-navy/40 text-xs font-extrabold uppercase tracking-wider">
                    <th className="py-3 px-4">Username</th>
                    <th className="py-3 px-4">Access Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/5">
                  {usersList.map((usr) => (
                    <tr 
                      key={usr.id} 
                      className={`hover:bg-navy/5 transition-all ${
                        currentUser?.username === usr.name ? 'bg-navy/[0.02] font-semibold' : ''
                      }`}
                    >
                      <td className="py-4 px-4 text-navy font-bold flex items-center gap-2">
                        {usr.name}
                        {currentUser?.username === usr.name && (
                          <span className="text-[10px] bg-navy text-white px-2 py-0.5 rounded-full font-black">
                            YOU
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${getRoleBadgeColor(usr.role)}`}>
                          {usr.role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedUser(usr);
                            setIsChangingPass(true);
                          }}
                          className="px-3 py-1.5 border border-navy/10 text-navy hover:bg-navy/5 rounded-xl font-bold text-xs transition-all inline-flex items-center gap-1.5"
                        >
                          <KeyRound size={12} />
                          Change Password
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info & Setup Panel */}
        <div className="bg-surface rounded-[32px] border border-navy/10 shadow-soft p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-navy">Security Information</h3>
                <p className="text-navy/50 text-xs font-semibold">Offline user accounts & policies</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-navy/5 rounded-2xl space-y-2 border border-navy/10">
                <h4 className="text-sm font-bold text-navy flex items-center gap-1.5">
                  <ShieldAlert size={16} className="text-primary-dark" />
                  Role Responsibilities
                </h4>
                <ul className="text-xs text-navy/60 font-semibold space-y-1.5 list-disc pl-4">
                  <li><strong>Owner/Admin</strong>: Full access to POS, settings, audit logs, and cloud sync.</li>
                  <li><strong>Manager</strong>: POS, products, inventory Adjustments, and supplier orders.</li>
                  <li><strong>Cashier</strong>: Strictly POS, sales processing, and day logs only.</li>
                  <li><strong>Accountant</strong>: Ledger checks, payment recording, and balance sheet exports.</li>
                </ul>
              </div>

              <div className="p-4 bg-navy/5 rounded-2xl space-y-2 border border-navy/10">
                <h4 className="text-sm font-bold text-navy">Offline Local Authentication</h4>
                <p className="text-xs text-navy/60 font-semibold leading-relaxed">
                  Users and passwords are encrypted and checked fully offline inside the SQLite storage, ensuring the terminal functions securely even in total internet failure.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-navy/5">
            <p className="text-[10px] text-navy/40 font-bold text-center">
              A POS Terminal ID: {window.location.hostname || 'LOCAL-001'}
            </p>
          </div>
        </div>

      </div>

      {/* MODAL DIALOGS */}

      {/* Add User Dialog */}
      {isCreating && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-surface w-full max-w-md rounded-[32px] border border-navy/10 shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between border-b border-navy/5 pb-4">
              <h3 className="text-xl font-black text-navy flex items-center gap-2">
                <UserPlus size={22} className="text-primary" />
                Add New Terminal User
              </h3>
              <button 
                onClick={() => setIsCreating(false)} 
                className="p-2 text-navy/50 hover:text-navy hover:bg-navy/5 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy/60">Username</label>
                <input 
                  type="text" 
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. cashier_john"
                  className="w-full px-4 py-3 bg-navy/5 rounded-xl border border-navy/10 focus:outline-none focus:border-primary text-navy font-bold placeholder:text-navy/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy/60">User Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter login password"
                  className="w-full px-4 py-3 bg-navy/5 rounded-xl border border-navy/10 focus:outline-none focus:border-primary text-navy font-bold placeholder:text-navy/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy/60">User Access Role</label>
                <select 
                  value={newRole}
                  // @ts-ignore
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-3 bg-navy/5 rounded-xl border border-navy/10 focus:outline-none focus:border-primary text-navy font-bold"
                >
                  <option value="owner">Owner</option>
                  <option value="admin">Administrator</option>
                  <option value="manager">Manager</option>
                  <option value="cashier">Cashier</option>
                  <option value="accountant">Accountant</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-primary text-white font-black rounded-xl hover:bg-primary/95 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-6"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Dialog */}
      {isChangingPass && selectedUser && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-surface w-full max-w-md rounded-[32px] border border-navy/10 shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between border-b border-navy/5 pb-4">
              <h3 className="text-xl font-black text-navy flex items-center gap-2">
                <KeyRound size={22} className="text-primary" />
                Change Password
              </h3>
              <button 
                onClick={() => {
                  setSelectedUser(null);
                  setIsChangingPass(false);
                }} 
                className="p-2 text-navy/50 hover:text-navy hover:bg-navy/5 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 bg-navy/5 rounded-2xl border border-navy/10">
              <p className="text-xs text-navy/60 font-semibold leading-relaxed">
                You are updating the login password for the user <strong>"{selectedUser.name}"</strong> (Access Level: <strong>{selectedUser.role.toUpperCase()}</strong>).
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy/60">New User Password</label>
                <input 
                  type="password" 
                  value={newPasswordVal}
                  onChange={(e) => setNewPasswordVal(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 bg-navy/5 rounded-xl border border-navy/10 focus:outline-none focus:border-primary text-navy font-bold placeholder:text-navy/20"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-primary text-white font-black rounded-xl hover:bg-primary/95 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-6"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
