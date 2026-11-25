import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Compass,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { IMG_HERO_MOSQUE } from '../data/acehData';
import { AuthStatus, AuthUser, Language, UserRole } from '../types';

interface LoginPageProps {
  initialRole?: UserRole;
  language: Language;
  t: Record<string, string>;
  onAuthSuccess: (token: string, user: AuthUser) => void;
  onBack: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  initialRole = 'user',
  language,
  t,
  onAuthSuccess,
  onBack,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [userMode, setUserMode] = useState<'login' | 'register'>('login');
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Optional initial operator creation during first-run admin bootstrap
  const [createInitialOperator, setCreateInitialOperator] = useState(true);
  const [operatorEmail, setOperatorEmail] = useState('operator@halalexpl-aceh.local');
  const [operatorPassword, setOperatorPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setSelectedRole(initialRole);
  }, [initialRole]);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/status')
      .then((r) => r.json())
      .then((data: AuthStatus) => {
        if (active) setAuthStatus(data);
      })
      .catch(() => {
        // Leave null if offline
      });
    return () => {
      active = false;
    };
  }, []);

  const resetMessages = () => {
    setErrorMsg(null);
  };

  const handleRoleSwitch = (role: UserRole) => {
    setSelectedRole(role);
    setUserMode('login');
    resetMessages();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      // First-run Admin Bootstrap flow
      if (selectedRole === 'admin' && authStatus && !authStatus.adminConfigured) {
        const res = await fetch('/api/auth/bootstrap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
            createOperator: createInitialOperator,
            operatorEmail: operatorEmail.trim(),
            operatorPassword,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || 'Gagal melakukan aktivasi Admin awal.');
          setLoading(false);
          return;
        }
        onAuthSuccess(data.token, data.user);
        return;
      }

      // Public User Registration flow
      if (selectedRole === 'user' && userMode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || 'Registrasi akun gagal.');
          setLoading(false);
          return;
        }
        onAuthSuccess(data.token, data.user);
        return;
      }

      // Standard Role-Aware Login flow (User / Operator / Admin)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          expectedRole: selectedRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Login gagal. Periksa kembali kredensial Anda.');
        setLoading(false);
        return;
      }
      onAuthSuccess(data.token, data.user);
    } catch {
      setErrorMsg(
        language === 'en'
          ? 'Unable to connect to authentication server.'
          : 'Tidak dapat terhubung ke server autentikasi.'
      );
    } finally {
      setLoading(false);
    }
  };

  const isFirstRunAdmin =
    selectedRole === 'admin' && authStatus !== null && !authStatus.adminConfigured;

  const isEnvPasscodeMode =
    (selectedRole === 'admin' && authStatus?.envAdminActive) ||
    (selectedRole === 'operator' && authStatus?.envOperatorActive);

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-[#0F241D] flex flex-col">
      {/* Top Bar */}
      <header className="bg-[#FAFBF9]/95 border-b border-[#065F46]/15">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={onBack}
            className="text-xl font-bold font-editorial tracking-tight text-[#065F46] whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t.brand}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#065F46] bg-[#F2F6F4] hover:bg-[#E2EBE6] border border-[#065F46]/20 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            {t.backToHome}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-10 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-stretch">
          {/* Left Column: Aceh Visual & Role Capabilities */}
          <div className="lg:col-span-6 bg-[#0F241D] text-white rounded-xl overflow-hidden border border-[#065F46]/25 flex flex-col justify-between relative">
            <div className="relative h-56 sm:h-64 overflow-hidden">
              <img
                src={IMG_HERO_MOSQUE}
                alt="Masjid Raya Baiturrahman Aceh"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F241D] via-[#0F241D]/55 to-black/20" />
              <div className="absolute bottom-4 left-6 right-6 space-y-1">
                <p className="text-xs font-medium text-[#5EEAD4] tracking-wide">
                  HalalExpl Aceh · Portal Akses Terintegrasi
                </p>
                <h1 className="text-2xl sm:text-3xl font-semibold text-white">
                  {t.loginPageTitle}
                </h1>
              </div>
            </div>

            <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
              <p className="text-sm text-[#D0E0DA] leading-relaxed">
                {t.loginPageSubtitle}
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 flex items-start gap-3">
                  <Users className="w-4 h-4 text-[#5EEAD4] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-white">{t.roleUser}</p>
                    <p className="text-[#B8CEC5] mt-0.5 leading-relaxed">
                      {language === 'en'
                        ? 'Save personal favorites, build 1–5 day itineraries synced to your account, and calculate trip budgets.'
                        : 'Menyimpan daftar favorit, menyusun itinerary 1–5 hari, serta menghitung estimasi anggaran perjalanan pribadi.'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 flex items-start gap-3">
                  <Compass className="w-4 h-4 text-[#FCD34D] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-white">{t.roleOperator}</p>
                    <p className="text-[#B8CEC5] mt-0.5 leading-relaxed">
                      {language === 'en'
                        ? 'Manage destination records, update halal certification statuses, and curate Muslim-friendly stays.'
                        : 'Mengelola data destinasi wisata, memperbarui status sertifikasi halal kuliner/UMKM, dan data akomodasi.'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-[#6EE7B7] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-white">{t.roleAdmin}</p>
                    <p className="text-[#B8CEC5] mt-0.5 leading-relaxed">
                      {language === 'en'
                        ? 'Full catalog governance including tour packages, Operator/User account management, and seed data reset.'
                        : 'Kontrol penuh seluruh katalog & paket wisata, manajemen akun Operator/User, serta reset data awal.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Role Selector & Auth Form */}
          <div className="lg:col-span-6 bg-white border border-[#065F46]/15 rounded-xl p-6 sm:p-8 flex flex-col justify-center space-y-6">
            {/* Segmented Role Tabs */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-[#3D524A]">
                {language === 'en' ? 'Select Login Role' : 'Pilih Peran Akses'}
              </span>
              <div
                role="tablist"
                aria-label="Pilih Peran Login"
                className="grid grid-cols-3 gap-1.5 p-1 bg-[#F2F6F4] border border-[#065F46]/15 rounded-lg"
              >
                {(
                  [
                    { key: 'user', label: language === 'en' ? 'User' : 'User' },
                    { key: 'operator', label: 'Operator' },
                    { key: 'admin', label: 'Admin' },
                  ] as const
                ).map((tab) => {
                  const active = selectedRole === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => handleRoleSwitch(tab.key)}
                      className={`py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-[#065F46] text-white'
                          : 'text-[#3D524A] hover:text-[#0F241D]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* User Mode Switch (Login / Register) */}
            {selectedRole === 'user' && (
              <div className="flex items-center gap-4 border-b border-[#065F46]/10 pb-3 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setUserMode('login');
                    resetMessages();
                  }}
                  className={`font-semibold pb-1 border-b-2 transition-colors cursor-pointer ${
                    userMode === 'login'
                      ? 'border-[#065F46] text-[#065F46]'
                      : 'border-transparent text-[#5B7068] hover:text-[#0F241D]'
                  }`}
                >
                  {language === 'en' ? 'Sign In (User)' : 'Masuk Akun User'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserMode('register');
                    resetMessages();
                  }}
                  className={`font-semibold pb-1 border-b-2 transition-colors cursor-pointer ${
                    userMode === 'register'
                      ? 'border-[#0D9488] text-[#0D9488]'
                      : 'border-transparent text-[#5B7068] hover:text-[#0F241D]'
                  }`}
                >
                  {language === 'en' ? 'Create Account' : 'Daftar Akun Baru'}
                </button>
              </div>
            )}

            {/* Contextual Banner for First-Run Admin Setup */}
            {isFirstRunAdmin && (
              <div className="bg-[#FBF6EE] border border-[#B45309]/25 rounded-lg p-4 text-xs text-[#78350F] space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 shrink-0" aria-hidden="true" />
                  {language === 'en'
                    ? 'First-Run Admin Setup'
                    : 'Aktivasi Awal Akun Admin'}
                </p>
                <p className="leading-relaxed">
                  {language === 'en'
                    ? 'No Administrator has been configured yet. Create the primary Admin account below (passwords are salted and hashed on the server). This setup locks automatically once claimed.'
                    : 'Belum ada akun Admin yang diklaim di server. Buat akun Admin utama di bawah ini (kata sandi di-hash aman di server). Formulir ini otomatis terkunci setelah diklaim.'}
                </p>
              </div>
            )}

            {/* Contextual Notice for Operator when none configured yet */}
            {selectedRole === 'operator' &&
              authStatus &&
              !authStatus.operatorConfigured && (
                <div className="bg-[#F2F6F4] border border-[#065F46]/20 rounded-lg p-4 text-xs text-[#3D524A] leading-relaxed">
                  {!authStatus.adminConfigured
                    ? language === 'en'
                      ? 'No Operator account exists yet. Switch to the Admin tab to complete first-run setup (you can create the initial Operator account there).'
                      : 'Belum ada akun Operator terdaftar. Silakan buka tab Admin untuk melakukan aktivasi awal (Anda dapat sekaligus membuat akun Operator awal di sana).'
                    : language === 'en'
                      ? 'Ask an Admin to create your Operator account in the Admin Dashboard -> Account Management.'
                      : 'Akun Operator dibuat oleh Admin melalui Dashboard Admin -> Manajemen Akun.'}
                </div>
              )}

            {errorMsg && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 text-red-800 text-xs font-medium rounded-lg p-3.5"
              >
                {errorMsg}
              </div>
            )}

            {/* Main Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {(isFirstRunAdmin || (selectedRole === 'user' && userMode === 'register')) && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="auth-name"
                    className="block text-xs font-semibold text-[#0F241D]"
                  >
                    {language === 'en' ? 'Full Name' : 'Nama Lengkap'}
                  </label>
                  <div className="relative">
                    <UserCheck
                      className="w-4 h-4 text-[#5B7068] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      id="auth-name"
                      type="text"
                      required
                      minLength={2}
                      maxLength={80}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={
                        isFirstRunAdmin ? 'Administrator HalalExpl' : 'Nama Wisatawan'
                      }
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FAFBF9] border border-[#065F46]/25 rounded-lg focus:outline-none focus:border-[#065F46]"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="auth-email"
                  className="block text-xs font-semibold text-[#0F241D]"
                >
                  {isEnvPasscodeMode
                    ? language === 'en'
                      ? 'Email (optional with server passcode)'
                      : 'Email (opsional jika menggunakan kode akses server)'
                    : 'Email'}
                </label>
                <div className="relative">
                  <Mail
                    className="w-4 h-4 text-[#5B7068] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="auth-email"
                    type="email"
                    required={!isEnvPasscodeMode}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      selectedRole === 'admin'
                        ? 'admin@halalexpl-aceh.local'
                        : selectedRole === 'operator'
                          ? 'operator@halalexpl-aceh.local'
                          : 'wisatawan@contoh.id'
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FAFBF9] border border-[#065F46]/25 rounded-lg focus:outline-none focus:border-[#065F46]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="auth-password"
                  className="block text-xs font-semibold text-[#0F241D]"
                >
                  {isEnvPasscodeMode
                    ? language === 'en'
                      ? 'Password or Server Passcode'
                      : 'Kata Sandi / Kode Akses Server'
                    : language === 'en'
                      ? 'Password'
                      : 'Kata Sandi'}
                </label>
                <div className="relative">
                  <Lock
                    className="w-4 h-4 text-[#5B7068] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="auth-password"
                    type="password"
                    required
                    minLength={
                      isFirstRunAdmin || (selectedRole === 'user' && userMode === 'register')
                        ? 8
                        : 1
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      isFirstRunAdmin || (selectedRole === 'user' && userMode === 'register')
                        ? 'Minimal 8 karakter'
                        : '••••••••'
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FAFBF9] border border-[#065F46]/25 rounded-lg focus:outline-none focus:border-[#065F46]"
                  />
                </div>
              </div>

              {/* Optional Initial Operator Setup during First-Run Admin Bootstrap */}
              {isFirstRunAdmin && (
                <div className="pt-2 border-t border-[#065F46]/10 space-y-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#0F241D] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createInitialOperator}
                      onChange={(e) => setCreateInitialOperator(e.target.checked)}
                      className="accent-[#065F46] w-4 h-4"
                    />
                    {language === 'en'
                      ? 'Also create initial Operator account now'
                      : 'Sekaligus buat akun Operator awal sekarang'}
                  </label>

                  {createInitialOperator && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F2F6F4] p-3.5 rounded-lg">
                      <div className="space-y-1">
                        <label
                          htmlFor="op-init-email"
                          className="block text-[11px] font-semibold text-[#0F241D]"
                        >
                          Email Operator
                        </label>
                        <input
                          id="op-init-email"
                          type="email"
                          required={createInitialOperator}
                          value={operatorEmail}
                          onChange={(e) => setOperatorEmail(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-[#065F46]/20 rounded-md"
                        />
                      </div>
                      <div className="space-y-1">
                        <label
                          htmlFor="op-init-pass"
                          className="block text-[11px] font-semibold text-[#0F241D]"
                        >
                          Kata Sandi Operator (min. 8)
                        </label>
                        <input
                          id="op-init-pass"
                          type="password"
                          required={createInitialOperator}
                          minLength={8}
                          value={operatorPassword}
                          onChange={(e) => setOperatorPassword(e.target.value)}
                          placeholder="Minimal 8 karakter"
                          className="w-full px-3 py-2 text-xs bg-white border border-[#065F46]/20 rounded-md"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#065F46] hover:bg-[#054E3A] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
              >
                {loading
                  ? language === 'en'
                    ? 'Verifying...'
                    : 'Memverifikasi...'
                  : isFirstRunAdmin
                    ? language === 'en'
                      ? 'Claim Admin & Sign In'
                      : 'Aktifkan Admin & Masuk'
                    : selectedRole === 'user' && userMode === 'register'
                      ? language === 'en'
                        ? 'Register User Account'
                        : 'Daftar Akun User'
                      : `${t.loginBtn} (${selectedRole.toUpperCase()})`}
              </button>
            </form>

            <p className="text-[11px] text-[#5B7068] leading-relaxed border-t border-[#065F46]/10 pt-4">
              {language === 'en'
                ? 'Sessions use signed Bearer tokens stored strictly in memory for security.'
                : 'Sesi menggunakan token Bearer bertanda tangan yang diverifikasi oleh server dan disimpan hanya di memori aplikasi.'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
