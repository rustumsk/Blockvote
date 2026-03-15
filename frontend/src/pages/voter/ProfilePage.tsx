import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Wallet, Shield, AlertTriangle } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import ConnectWalletButton from '../../components/wallet/ConnectWalletButton';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/client';

const ProfilePage = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone ?? '');
    }
  }, [user?.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const updated = await authApi.updateProfile({ name: name.trim(), phone: phone.trim() || null });
      setUser(updated);
      setMessage({ type: 'success', text: 'Profile updated.' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    setDeleting(true);
    try {
      await authApi.deleteAccount();
      logout();
      setDeleteModalOpen(false);
      navigate('/', { replace: true });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to delete account' });
    } finally {
      setDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-bv-bg flex items-center justify-center">
        <p className="text-bv-ink-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bv-bg flex">
      <Sidebar variant="voter" />

      <main className="ml-12 flex-1 p-8 overflow-y-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-bv-ink mb-6">Profile</h1>

        <form onSubmit={handleSave} className="space-y-6">
          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.type === 'success' ? 'bg-bv-accent-muted text-bv-accent border border-bv-accent/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="bg-bv-surface border border-bv-border rounded-2xl p-6 space-y-4">
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              icon={<User size={16} />}
            />
            <Input
              label="Phone (optional)"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              icon={<Phone size={16} />}
            />
            <div>
              <label className="block text-xs text-bv-ink-muted uppercase tracking-wide mb-1.5">Email</label>
              <div className="flex items-center gap-3 bg-bv-bg border border-bv-border rounded-lg px-4 py-3 text-bv-ink-secondary">
                <Mail size={16} className="text-bv-ink-muted" />
                <span>{user.email}</span>
              </div>
              <p className="text-bv-ink-muted text-xs mt-1">Email cannot be changed.</p>
            </div>
            <div>
              <label className="block text-xs text-bv-ink-muted uppercase tracking-wide mb-1.5">Role</label>
              <div className="flex items-center gap-3 bg-bv-bg border border-bv-border rounded-lg px-4 py-3 text-bv-ink-secondary">
                <Shield size={16} className="text-bv-ink-muted" />
                <span>{user.role}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-bv-ink-muted uppercase tracking-wide mb-1.5">Status</label>
              <div className="flex items-center gap-3 bg-bv-bg border border-bv-border rounded-lg px-4 py-3 text-bv-ink-secondary">
                <span className="capitalize">{user.status?.toLowerCase()}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-bv-ink-muted uppercase tracking-wide mb-1.5">Wallet</label>
              {user.walletAddress ? (
                <div className="flex items-center gap-3 bg-bv-bg border border-bv-border rounded-lg px-4 py-3 text-bv-ink-secondary font-mono text-sm">
                  <Wallet size={16} className="text-bv-ink-muted" />
                  <span>{user.walletAddress}</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-bv-ink-muted text-sm">No wallet linked. Connect one to vote on-chain.</p>
                  <ConnectWalletButton variant="outline" size="sm" showIcon />
                </div>
              )}
            </div>
          </div>

          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </form>

        <div className="mt-12 pt-8 border-t border-bv-border">
          <h2 className="text-lg font-semibold text-bv-ink mb-2">Danger zone</h2>
          <p className="text-bv-ink-secondary text-sm mb-4">
            Deleting your account will remove all your data and vote records. This cannot be undone.
          </p>
          <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
            <AlertTriangle size={18} />
            Delete account
          </Button>
        </div>
      </main>

      {deleteModalOpen && (
        <Modal title="Delete account" onClose={() => !deleting && setDeleteModalOpen(false)}>
          <div className="space-y-4">
            <p className="text-bv-ink-secondary text-sm">
              This will permanently delete your account and all associated data. Type <strong className="text-bv-ink">DELETE</strong> to confirm.
            </p>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE"
              className="font-mono"
            />
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="ghost" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== 'DELETE' || deleting}
              >
                {deleting ? 'Deleting...' : 'Delete my account'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProfilePage;
