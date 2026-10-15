import React, { useState } from 'react';
import { Shield, Lock, User, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import BrandLogo from '../BrandLogo';
import { login } from '../../services/authService';

export default function OwnerLoginPage({ onNavigate, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setErrorMessage('');
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
        <div className="text-center mb-8">
          <BrandLogo variant="on-dark" size="large" className="mb-4 shadow-lg" />
          <h1 className="font-serif text-2xl sm:text-3xl text-white font-normal tracking-tight">
            Owner & Administration Portal
          </h1>
          <p className="mt-2 text-xs text-white tracking-wide uppercase">
            Exclusive Property Management & Client Advisory Desk
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-modal border border-stone p-6 sm:p-9">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5"
              >
                Owner Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  required
                  placeholder="Enter administrator username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-ivory/50 border border-stone rounded-xl pl-10 pr-3.5 py-3 text-sm text-charcoal placeholder-muted focus:outline-none focus:ring-2 focus:ring-royal focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Enter secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-ivory/50 border border-stone rounded-xl pl-10 pr-11 py-3 text-sm text-charcoal placeholder-muted focus:outline-none focus:ring-2 focus:ring-royal focus:bg-white transition-colors"
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

            <div className="flex items-center justify-between text-xs">
              <label className="inline-flex items-center gap-2 cursor-pointer text-muted hover:text-charcoal">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-royal rounded border-stone focus:ring-royal"
                />
                <span>Keep session active</span>
              </label>

              <span className="text-[11px] text-muted">
                Vasai–Palghar Corridor
              </span>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-navy hover:bg-navy-900 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
              >
                <Shield className="w-4 h-4 text-brandRed flex-shrink-0" />
                <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Dashboard'}</span>
              </button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-5 border-t border-stone/60 text-center text-[11px] text-muted space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-navy font-semibold">
              <Shield className="w-3.5 h-3.5 text-royal" />
              <span>Server-Enforced Access Control</span>
            </div>
            <p className="text-[10px] text-muted">
              Only authorized personnel can add, edit, or publish properties on Tomar Enterprises.
            </p>
            <p className="text-[10px] text-muted/80 pt-1">
              Authorized Owner: Run <code className="text-navy font-mono font-semibold bg-stone/40 px-1.5 py-0.5 rounded">npm run setup-owner</code> in your terminal to initialize or reset your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
