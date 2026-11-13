import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  User,
  Lock,
  EyeOff,
  Eye,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, updateAdminInfo } = useAuth();
  const { siteData } = useData();
  const logoUrl = siteData.settings.logoUrl || '/logo.jpg';

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      let authed = false;
      let token = 'token-' + Date.now();
      let user = { username, isFirstLogin: false };

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        if (res.ok) {
          const data = await res.json();
          authed = true;
          token = data.token;
          user = data.user;
        }
      } catch {
        // fallback to local check
      }

      const savedCredsRaw = localStorage.getItem('liyas_admin_saved_creds');
      let matchesSaved = false;
      if (savedCredsRaw) {
        try {
          const savedCreds = JSON.parse(savedCredsRaw);
          if (
            username === savedCreds.username &&
            password === savedCreds.password
          ) {
            matchesSaved = true;
          }
        } catch {
          // ignore
        }
      }

      const matchesDefault =
        username === 'admin' &&
        (password === '8431126242' || password === 'Admin@123');

      if (authed || matchesSaved || matchesDefault) {
        if (password === '8431126242' || password === 'Admin@123') {
          user.isFirstLogin = true;
        }
        login(token, user);
        if (user.isFirstLogin) {
          setNeedsPasswordSetup(true);
        } else {
          setSuccessMsg('Login successful! Redirecting to Dashboard...');
          setTimeout(() => {
            navigate('/admin/dashboard');
          }, 1000);
        }
      } else {
        setErrorMsg(
          'Invalid credentials. Please verify your username and password.'
        );
      }
    } catch {
      setErrorMsg('Network error during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      localStorage.setItem(
        'liyas_admin_saved_creds',
        JSON.stringify({ username, password: newPassword })
      );
      updateAdminInfo({ username, isFirstLogin: false });
      try {
        await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, newPassword }),
        });
      } catch {
        // ignore
      }
      setSuccessMsg('Credentials updated! Redirecting to Admin Dashboard...');
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1200);
    } catch {
      setErrorMsg('Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full p-8 sm:p-10 rounded-[36px] bg-white/60 dark:bg-chocolate-900/80 border border-white/80 dark:border-gold-500/30 shadow-2xl backdrop-blur-2xl space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-gold-400 shadow-md bg-[#FFF9F3] p-0.5">
            <img
              src={logoUrl}
              alt="Liya's Bake Logo"
              className="w-full h-full object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="font-serif text-3xl font-extrabold text-chocolate-900 dark:text-cream-50">
            {needsPasswordSetup ? 'Security Setup Required' : 'Admin Panel Access'}
          </h2>
          <p className="text-xs text-chocolate-700 dark:text-cream-200">
            {needsPasswordSetup
              ? 'You are logged in with default credentials. Please create a new password before continuing.'
              : "Liya's Bake Management Suite"}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {needsPasswordSetup ? (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs">
              <strong>Mandatory First-Time Password Change:</strong> You must change
              your default password before accessing the website settings.
            </div>

            <div>
              <label className="block text-xs font-semibold text-chocolate-900 dark:text-cream-200 mb-1">
                Admin Username
              </label>
              <input
                type="text"
                value={username}
                disabled
                className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-chocolate-800/50 border border-gold-500/20 text-xs text-chocolate-600 dark:text-cream-300 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-chocolate-900 dark:text-cream-200 mb-1">
                New Password (Min 6 chars)
              </label>
              <input
                type="password"
                required
                placeholder="Enter new strong password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-chocolate-800 border border-gold-500/30 text-xs text-chocolate-900 dark:text-cream-100 focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-chocolate-900 dark:text-cream-200 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-chocolate-800 border border-gold-500/30 text-xs text-chocolate-900 dark:text-cream-100 focus:outline-none focus:border-gold-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-chocolate-950 text-xs font-bold uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Set New Password & Continue'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-chocolate-900 dark:text-cream-200 mb-1">
                  Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-chocolate-600/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    id="admin-username-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-chocolate-800 border border-gold-500/30 text-xs text-chocolate-900 dark:text-cream-100 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-chocolate-900 dark:text-cream-200 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-chocolate-600/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    id="admin-password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-chocolate-800 border border-gold-500/30 text-xs text-chocolate-900 dark:text-cream-100 focus:outline-none focus:border-gold-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-chocolate-600/60 hover:text-chocolate-800 dark:hover:text-cream-100 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                id="admin-login-submit-btn"
                className="w-full py-3 px-4 rounded-xl bg-[#3E2723] dark:bg-gold-500 text-white dark:text-chocolate-950 text-xs font-bold uppercase tracking-wider shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Shield className="w-4 h-4" />
                <span>{loading ? 'Authenticating...' : 'Login to Dashboard'}</span>
              </button>
            </form>
        )}

        <div className="text-center pt-2">
          <Link
            to="/"
            className="text-xs text-chocolate-600 dark:text-cream-300 hover:text-gold-600 dark:hover:text-gold-400 transition-colors"
          >
            ← Return to Public Bakery Site
          </Link>
        </div>
      </div>
    </div>
  );
};
