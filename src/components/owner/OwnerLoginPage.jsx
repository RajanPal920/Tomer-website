import React, { useState } from 'react';
import {
  Shield,
  Lock,
  User,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import BrandLogo from '../BrandLogo';
import { login, changeOwnerPassword } from '../../services/authService';

export default function OwnerLoginPage({ onNavigate, onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'change_password'

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Change password form state
  const [cpUsername, setCpUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status and feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Password criteria helper
  const isNewPasswordLongEnough = newPassword.length >= 12;
  const hasLetterAndSymbol = /[a-zA-Z]/.test(newPassword) && /[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(newPassword);
  const doPasswordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Handle Standard Sign In
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const result = await login(username.trim(), password, rememberMe);
      if (result.success) {
        if (onLoginSuccess) {
          onLoginSuccess(result.user);
        } else if (onNavigate) {
          onNavigate('/owner/dashboard');
        }
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please check credentials.');
      }
    } catch {
      setErrorMessage('A network error occurred. Please verify your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Change Password with Server Verification & Auto-Login
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const targetUser = (cpUsername || username).trim();
    if (!targetUser) {
      setErrorMessage('Owner username is required.');
      return;
    }

    if (!currentPassword) {
      setErrorMessage('Please enter your current password.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setErrorMessage('Please enter and confirm your new password.');
      return;
    }

    if (newPassword.length < 12) {
      setErrorMessage('New password must be at least 12 characters long for security.');
      return;
    }

    if (!hasLetterAndSymbol) {
      setErrorMessage('New password must contain both letters and numbers or special characters.');
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMessage('New password cannot be the same as your current password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation password do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await changeOwnerPassword({
        username: targetUser,
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (result.success) {
        setSuccessMessage('Password changed successfully! Authenticating session & redirecting to Dashboard...');
        
        // Reset password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

        // Automatically navigate after establishing verified session
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess(result.user);
          } else if (onNavigate) {
            onNavigate('/owner/dashboard');
          }
        }, 700);
      } else {
        setErrorMessage(result.error || 'Password change failed. Please verify your current password.');
      }
    } catch {
      setErrorMessage('A network error occurred. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-royal/30 selection:text-white">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-radial-gradient from-navy-900/60 to-navy-950 pointer-events-none" />

      {/* Back to Website Button */}
      <div className="absolute top-6 left-6 z-10">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white hover:text-stone-light text-xs font-semibold backdrop-blur-md transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Website</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <BrandLogo variant="on-dark" size="large" className="mb-3 shadow-lg" />
          <h1 className="font-serif text-2xl sm:text-3xl text-white font-normal tracking-tight">
            Owner & Administration Portal
          </h1>
          <p className="mt-1.5 text-xs text-white/90 tracking-wide uppercase">
            Exclusive Property Management & Client Advisory Desk
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-modal border border-stone p-6 sm:p-8">
          {/* Mode Switcher Segmented Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone/30 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-navy text-white shadow-xs'
                  : 'text-muted hover:text-charcoal'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-royal" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('change_password');
                setErrorMessage('');
                setSuccessMessage('');
                if (username && !cpUsername) {
                  setCpUsername(username);
                }
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                mode === 'change_password'
                  ? 'bg-navy text-white shadow-xs'
                  : 'text-muted hover:text-charcoal'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-royal" />
              <span>Change Password</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* MODE 1: LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="login-username"
                  className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5"
                >
                  Owner Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="login-username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    required
                    disabled={isLoading}
                    placeholder="Enter administrator username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-ivory/50 border border-stone rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-charcoal placeholder-muted focus:outline-none focus:ring-2 focus:ring-royal focus:bg-white transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    disabled={isLoading}
                    placeholder="Enter secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-ivory/50 border border-stone rounded-xl pl-10 pr-11 py-2.5 text-sm text-charcoal placeholder-muted focus:outline-none focus:ring-2 focus:ring-royal focus:bg-white transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted hover:text-navy transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer text-muted hover:text-charcoal">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                    className="w-4 h-4 text-royal rounded border-stone focus:ring-royal"
                  />
                  <span>Keep session active</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setMode('change_password');
                    setErrorMessage('');
                    setSuccessMessage('');
                    if (username) setCpUsername(username);
                  }}
                  className="text-royal hover:text-navy font-semibold hover:underline"
                >
                  Change Password?
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-navy hover:bg-navy-900 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-royal-light" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 text-brandRed flex-shrink-0" />
                      <span>Sign In to Dashboard</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* MODE 2: CHANGE PASSWORD FORM */
            <form onSubmit={handleChangePassword} className="space-y-4 animate-fadeIn">
              <div>
                <label
                  htmlFor="cp-username"
                  className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5"
                >
                  Owner Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="cp-username"
                    name="cpUsername"
                    type="text"
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    required
                    disabled={isLoading}
                    placeholder="Enter owner username"
                    value={cpUsername}
                    onChange={(e) => setCpUsername(e.target.value)}
                    className="w-full bg-ivory/50 border border-stone rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-charcoal placeholder-muted focus:outline-none focus:ring-2 focus:ring-royal focus:bg-white transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="cp-current-password"
                  className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5"
                >
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="cp-current-password"
                    name="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    disabled={isLoading}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-ivory/50 border border-stone rounded-xl pl-10 pr-11 py-2.5 text-sm text-charcoal placeholder-muted focus:outline-none focus:ring-2 focus:ring-royal focus:bg-white transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted hover:text-navy transition-colors"
                    aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="cp-new-password"
                    className="block text-xs font-bold uppercase tracking-wider text-charcoal"
                  >
                    New Password
                  </label>
                  <span className={`text-[11px] font-mono ${newPassword.length >= 12 ? 'text-emerald-600 font-bold' : 'text-muted'}`}>
                    {newPassword.length} / 12+ chars
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="cp-new-password"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    disabled={isLoading}
                    placeholder="Minimum 12 characters (letters + numbers/symbols)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-ivory/50 border border-stone rounded-xl pl-10 pr-11 py-2.5 text-sm text-charcoal placeholder-muted focus:outline-none focus:ring-2 focus:ring-royal focus:bg-white transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted hover:text-navy transition-colors"
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="cp-confirm-password"
                  className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="cp-confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    disabled={isLoading}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-ivory/50 border border-stone rounded-xl pl-10 pr-11 py-2.5 text-sm text-charcoal placeholder-muted focus:outline-none focus:ring-2 focus:ring-royal focus:bg-white transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted hover:text-navy transition-colors"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements Guidance */}
              <div className="p-3 bg-stone/20 rounded-xl space-y-1 text-[11px] text-muted">
                <div className="flex items-center gap-1.5">
                  <span className={isNewPasswordLongEnough ? 'text-emerald-600 font-bold' : 'text-stone-dark'}>
                    {isNewPasswordLongEnough ? '✓' : '•'} At least 12 characters long
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={hasLetterAndSymbol ? 'text-emerald-600 font-bold' : 'text-stone-dark'}>
                    {hasLetterAndSymbol ? '✓' : '•'} Contains both letters and numbers/symbols
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={doPasswordsMatch ? 'text-emerald-600 font-bold' : 'text-stone-dark'}>
                    {doPasswordsMatch ? '✓' : '•'} New password and confirmation match
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  disabled={isLoading}
                  className="px-4 py-3 rounded-xl border border-stone hover:bg-ivory text-charcoal font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-navy hover:bg-navy-900 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-royal-light" />
                      <span>Verifying & Updating...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 text-royal-light flex-shrink-0" />
                      <span>Update Password & Enter Dashboard</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Security Notice */}
          <div className="mt-6 pt-5 border-t border-stone/60 text-center text-[11px] text-muted space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-navy font-semibold">
              <Shield className="w-3.5 h-3.5 text-royal" />
              <span>Server-Enforced Access Control</span>
            </div>
            <p className="text-[10px] text-muted">
              Password changes update the persistent production database and immediately establish an authenticated session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
