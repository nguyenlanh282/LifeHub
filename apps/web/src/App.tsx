import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Wallet,
  CheckSquare,
  Wrench,
  Plus,
  Bell,
  Wifi,
  Calendar,
  AlertTriangle,
  TrendingDown,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Clock,
  X,
  CreditCard,
  PieChart as PieIcon,
  ArrowUpRight,
  TrendingUp,
  Flame,
  FileText,
  Search,
  Check,
  Utensils,
  Zap,
  Car,
  ShoppingBag,
  Coffee,
  QrCode,
  Download,
  Smartphone,
  Info,
  CheckCircle2,
  LogOut,
  UserCheck,
  User
} from 'lucide-react';

type ModuleTab = 'dashboard' | 'finance' | 'tasks' | 'assets' | 'daily';

const API_BASE = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.'))
  ? ''
  : 'https://lifehub-api.it-nguyenlanh.workers.dev';

export default function App() {
  const [activeTab, setActiveTab] = useState<ModuleTab>('dashboard');
  const [isOnline] = useState<boolean>(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Current User State (Loaded from localStorage)
  const [currentUser, setCurrentUser] = useState<any>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('lifehub_user');
    return stored ? JSON.parse(stored) : {
      id: 'usr_g_default',
      name: 'Lành Guru',
      email: 'lanh.guru@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      provider: 'google',
    };
  });

  // Detect if PWA is running in standalone mode
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true ||
      document.referrer.startsWith('android-app://');
    const storedValue = localStorage.getItem('pwa_installed') === 'true';
    return isStandalone || storedValue;
  });

  // State to manually dismiss PWA banner forever
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('pwa_banner_dismissed') === 'true';
  });

  // Task Filter
  const [taskFilter, setTaskFilter] = useState<'all' | 'recurring' | 'due' | 'done'>('all');

  // Quick Add Form State
  const [newTxnNote, setNewTxnNote] = useState('');
  const [newTxnAmount, setNewTxnAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('cat_food');
  const [selectedWalletId, setSelectedWalletId] = useState('');

  // Listen to PWA install prompt & OAuth PostMessage events
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      localStorage.setItem('pwa_installed', 'true');
      setDeferredPrompt(null);
    };

    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_SUCCESS') {
        const userObj = event.data.user;
        setCurrentUser(userObj);
        localStorage.setItem('lifehub_user', JSON.stringify(userObj));
        setIsAuthModalOpen(false);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('message', handleOAuthMessage);

    fetchData();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('message', handleOAuthMessage);
    };
  }, []);

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      const mockName = provider === 'google' ? 'Đăng nhập Google' : 'Đăng nhập Facebook';
      const mockEmail = provider === 'google' ? 'lanh.google@gmail.com' : 'lanh.facebook@gmail.com';

      const res = await fetch(`${API_BASE}/api/auth/social-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          name: mockName,
          email: mockEmail,
          avatarUrl: provider === 'google'
            ? 'https://lh3.googleusercontent.com/a/default-user'
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        }),
      });

      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        localStorage.setItem('lifehub_user', JSON.stringify(data.user));
        setIsAuthModalOpen(false);
      }
    } catch (err) {
      console.error('Social login error:', err);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('lifehub_user');
  };

  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
          localStorage.setItem('pwa_installed', 'true');
        }
        setDeferredPrompt(null);
      });
    } else {
      setIsInstallGuideOpen(true);
    }
  };

  const handleDismissBanner = () => {
    setIsBannerDismissed(true);
    localStorage.setItem('pwa_banner_dismissed', 'true');
  };

  const fetchData = () => {
    fetch(`${API_BASE}/api/daily/dashboard`)
      .then((res) => res.json())
      .then((data) => setDashboardData(data))
      .catch(() => {});

    fetch(`${API_BASE}/api/tasks`)
      .then((res) => res.json())
      .then((data) => setTasks(data.tasks || []))
      .catch(() => {});

    fetch(`${API_BASE}/api/finance/wallets`)
      .then((res) => res.json())
      .then((data) => {
        setWallets(data.wallets || []);
        if (data.wallets?.length > 0) setSelectedWalletId(data.wallets[0].id);
      })
      .catch(() => {});

    fetch(`${API_BASE}/api/assets`)
      .then((res) => res.json())
      .then((data) => setAssets(data.assets || []))
      .catch(() => {});
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'done' ? 'open' : 'done';
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
    );

    await fetch(`${API_BASE}/api/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    }).catch(() => {});
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxnAmount) return;

    const amountMinor = parseInt(newTxnAmount, 10);
    const newTxn = {
      amountMinor,
      type: 'expense',
      note: newTxnNote || 'Chi tiêu nhanh',
      categoryId: selectedCategory,
      occurredOn: new Date().toISOString().split('T')[0],
      walletId: selectedWalletId || wallets[0]?.id || 'wal_cash',
    };

    await fetch(`${API_BASE}/api/finance/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTxn),
    }).catch(() => {});

    fetchData();
    setNewTxnNote('');
    setNewTxnAmount('');
    setIsAddModalOpen(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'recurring') return !!t.rrule;
    if (taskFilter === 'done') return t.status === 'done';
    if (taskFilter === 'due') return t.status !== 'done';
    return true;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#070a12] text-slate-100 selection:bg-indigo-500 selection:text-white gradient-glow-indigo">
      {/* Sidebar Navigation for Desktop (md+) */}
      <aside className="hidden md:flex w-64 border-r border-slate-800/60 bg-slate-950/80 backdrop-blur-2xl flex-col z-20">
        {/* Logo Header */}
        <div className="p-5 border-b border-slate-800/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
              LifeHub
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">PRO MAX</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              {currentUser ? currentUser.name : 'Gia Đình Lành (Personal)'}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('finance')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'finance'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Chi Tiêu & Ví Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'tasks'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <div className="flex-1 flex items-center justify-between">
              <span>Công Việc (RRULE)</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-bold border border-slate-700">
                {tasks.filter((t) => t.status === 'open').length}
              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('assets')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'assets'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Thiết Bị & Bảo Trì</span>
          </button>

          <button
            onClick={() => setActiveTab('daily')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'daily'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Sinh Hoạt & Habits</span>
          </button>
        </nav>

        {/* User Card & Logout / Login Button */}
        <div className="p-4 border-t border-slate-800/60 space-y-2.5">
          {currentUser ? (
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <img
                  src={currentUser.avatarUrl || 'https://lh3.googleusercontent.com/a/default-user'}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30 shrink-0"
                />
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 capitalize truncate">
                    {currentUser.provider === 'google' ? '🟢 Google' : '🔵 Facebook'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all shrink-0"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>Đăng Nhập Social</span>
            </button>
          )}

          {!isInstalled && !isBannerDismissed && (
            <button
              onClick={handleInstallPWA}
              className="w-full py-2 px-3 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Cài Đặt App PWA</span>
            </button>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Ghi Khoản Chi (+ Touch)</span>
          </button>
        </div>
      </aside>

      {/* Main Content Shell */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#0a0e17] pb-20 md:pb-0 z-10">
        {/* Top Header */}
        <header className="h-14 md:h-16 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <div className="md:hidden w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-extrabold text-white tracking-tight capitalize">
                {activeTab === 'dashboard' && 'Dashboard Center'}
                {activeTab === 'finance' && 'Thu Chi & Quản Lý Ngân Sách'}
                {activeTab === 'tasks' && 'Lịch Công Việc & Tái Diễn'}
                {activeTab === 'assets' && 'Thiết Bị & Lịch Bảo Trì Xe'}
                {activeTab === 'daily' && 'Nhật Ký & Thói Quen Hằng Ngày'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Social Auth Login Button / User Profile Header Badge */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-900 border border-slate-800">
                <img
                  src={currentUser.avatarUrl || 'https://lh3.googleusercontent.com/a/default-user'}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover ring-2 ring-indigo-500/30"
                />
                <span className="text-xs font-extrabold text-slate-200 hidden sm:inline">{currentUser.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold uppercase">
                  {currentUser.provider || 'OAuth'}
                </span>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 active:scale-95 transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>Đăng Nhập</span>
              </button>
            )}

            {!isInstalled && !isBannerDismissed ? (
              <button
                onClick={handleInstallPWA}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-indigo-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 active:scale-95 transition-all"
                title="Cài đặt PWA lên màn hình chính"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cài PWA</span>
              </button>
            ) : (
              <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> App Ready
              </span>
            )}

            <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 relative transition-all active:scale-95">
              <Bell className="w-4 h-4 md:w-5 md:h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Main Workspace Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* PWA Banner Option on Dashboard with Dismiss X Button */}
          {activeTab === 'dashboard' && !isInstalled && !isBannerDismissed && (
            <div className="glass-panel p-4 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/60 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-indigo-500/10 relative">
              <button
                onClick={handleDismissBanner}
                className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/50"
                title="Tắt thông báo này"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 pr-6 sm:pr-0">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">Cài Đặt LifeHub Lên Màn Hình Chính</h4>
                  <p className="text-xs text-slate-300 mt-0.5">Trải nghiệm ứng dụng full màn hình, nhận nhắc nhở và chạy mượt offline.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  onClick={handleInstallPWA}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs shadow-md shadow-indigo-500/30 hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Hướng Dẫn / Cài Đặt</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Horizontal Scroll Stats Carousel on Mobile */}
              <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                {/* Stat Card 1 */}
                <div className="min-w-[270px] md:min-w-0 flex-1 glass-panel glass-panel-interactive p-4 md:p-5 rounded-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Chi Tiêu Tháng Này</span>
                    <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                      <TrendingDown className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-white tracking-tight">
                      {(dashboardData?.summary?.monthlyExpensesMinor || 4250000).toLocaleString('vi-VN')} ₫
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Hôm nay: <strong className="text-indigo-300 font-bold">{(dashboardData?.summary?.todayExpensesMinor || 150000).toLocaleString('vi-VN')} ₫</strong>
                    </div>
                  </div>
                  <div className="mt-3.5 pt-2.5 border-t border-slate-800/60">
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-medium">
                      <span>Ngân sách 10.000.000 ₫</span>
                      <span className="font-bold text-indigo-300">42.5%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: '42.5%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Stat Card 2 */}
                <div className="min-w-[270px] md:min-w-0 flex-1 glass-panel glass-panel-interactive p-4 md:p-5 rounded-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Việc Cần Làm Today</span>
                    <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/20">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-white tracking-tight">
                      {dashboardData?.summary?.tasksDueTodayCount || tasks.length} Việc
                    </div>
                    <div className="text-xs text-rose-400 mt-1 flex items-center gap-1 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{dashboardData?.summary?.overdueTasksCount || 1} việc quá hạn</span>
                    </div>
                  </div>
                  <div
                    onClick={() => setActiveTab('tasks')}
                    className="mt-3.5 pt-2.5 border-t border-slate-800/60 text-xs text-indigo-400 font-bold flex items-center justify-between cursor-pointer"
                  >
                    <span>Xem danh sách việc</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Stat Card 3 */}
                <div className="min-w-[270px] md:min-w-0 flex-1 glass-panel glass-panel-interactive p-4 md:p-5 rounded-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Sắp Tới Hạn (14 Ngày)</span>
                    <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-white tracking-tight">
                      {dashboardData?.summary?.upcomingRemindersCount || 4} Mục
                    </div>
                    <div className="text-xs text-slate-400 mt-1 font-medium">Bảo trì & Hóa đơn định kỳ</div>
                  </div>
                  <div
                    onClick={() => setActiveTab('assets')}
                    className="mt-3.5 pt-2.5 border-t border-slate-800/60 text-xs text-amber-400 font-bold flex items-center justify-between cursor-pointer"
                  >
                    <span>Xem lịch bảo trì</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Stat Card 4 */}
                <div className="min-w-[270px] md:min-w-0 flex-1 glass-panel glass-panel-interactive p-4 md:p-5 rounded-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Trạng Thái Hệ Thống</span>
                    <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-emerald-400 tracking-tight">An Toàn</div>
                    <div className="text-xs text-slate-400 mt-1 font-medium">Không vượt hạn mức</div>
                  </div>
                  <div className="mt-3.5 pt-2.5 border-t border-slate-800/60 text-xs text-slate-400 flex items-center justify-between font-medium">
                    <span>Tồn kho vật tư: Đủ</span>
                  </div>
                </div>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="glass-panel p-4 md:p-6 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                      <h3 className="font-extrabold text-white flex items-center gap-2 text-sm md:text-base">
                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                        Danh Sách Việc Tới Hạn (Cloudflare D1 Live)
                      </h3>
                      <button
                        onClick={() => setActiveTab('tasks')}
                        className="text-xs font-bold text-indigo-400 hover:underline"
                      >
                        Quản lý →
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`flex items-start md:items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border transition-all ${
                            task.status === 'done' ? 'border-slate-800/30 opacity-50' : 'border-slate-800/80 hover:border-indigo-500/40'
                          }`}
                        >
                          <div className="flex items-start md:items-center gap-3">
                            <button
                              onClick={() => handleToggleTask(task.id, task.status)}
                              className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all mt-0.5 md:mt-0 active:scale-90 ${
                                task.status === 'done'
                                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-500 text-white shadow-sm'
                                  : 'border-slate-700 bg-slate-950 text-transparent hover:border-indigo-500'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </button>
                            <div>
                              <p className={`font-bold text-sm ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                                {task.title}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                {task.rrule && (
                                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                                    Lặp: {task.rrule}
                                  </span>
                                )}
                                <span className="text-[11px] text-slate-400 font-medium">Hạn: {task.dueOn || 'Hôm nay'}</span>
                              </div>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md shrink-0 ml-2 ${
                              task.priority === 'high'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 pro-max-badge'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {task.priority || 'normal'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Budget Ring */}
                  <div className="glass-panel p-5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                      <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                        <PieIcon className="w-4 h-4 text-purple-400" />
                        Phân Bổ Ngân Sách
                      </h3>
                      <span className="text-[11px] font-bold text-indigo-400">Tháng 7</span>
                    </div>

                    <div className="flex items-center justify-around py-2">
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-800"
                            strokeWidth="3.8"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-indigo-500"
                            strokeDasharray="45, 100"
                            strokeWidth="3.8"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-purple-500"
                            strokeDasharray="30, 100"
                            strokeDashoffset="-45"
                            strokeWidth="3.8"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute text-center">
                          <span className="text-xs font-black text-white">42.5%</span>
                          <p className="text-[9px] text-slate-400 font-semibold">ĐÃ DÙNG</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                          <span className="text-slate-300">Ăn uống (45%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                          <span className="text-slate-300">Hóa đơn (30%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                          <span className="text-slate-300">Khác (25%)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Wallets */}
                  <div className="glass-panel p-5 rounded-2xl space-y-4">
                    <h3 className="font-extrabold text-white text-sm flex items-center gap-2 border-b border-slate-800/60 pb-3">
                      <Wallet className="w-4 h-4 text-indigo-400" />
                      Số Dư Ví Ledger
                    </h3>

                    <div className="space-y-3">
                      {wallets.map((wallet) => (
                        <div key={wallet.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold text-slate-400">{wallet.name}</p>
                            <p className="text-base font-black text-white mt-0.5">
                              {(wallet.balanceMinor || wallet.openingBalanceMinor || 0).toLocaleString('vi-VN')} ₫
                            </p>
                          </div>
                          <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                            {wallet.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FINANCE */}
          {activeTab === 'finance' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-indigo-500">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Tổng Số Dư Ví</span>
                  <div className="text-2xl font-black text-white mt-1">17.900.000 ₫</div>
                  <p className="text-xs text-slate-400 mt-1 font-medium">2 Ví đang hoạt động</p>
                </div>
                <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-emerald-500">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Thu Nhập Tháng 7</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">+25.000.000 ₫</div>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Lương & Thu nhập phụ</p>
                </div>
                <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-rose-500">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Chi Tiêu Tháng 7</span>
                  <div className="text-2xl font-black text-rose-400 mt-1">-4.250.000 ₫</div>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Chi ăn uống, hóa đơn</p>
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-extrabold text-white text-base">Lịch Sử Giao Dịch Gần Đây</h3>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" /> Ghi khoản chi
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
                        <Utensils className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white">Ăn tối cùng gia đình</p>
                        <p className="text-xs text-slate-400 font-medium">Ăn uống • Ví Tiền Mặt • 26/07/2026</p>
                      </div>
                    </div>
                    <span className="font-black text-sm text-rose-400">-150.000 ₫</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h3 className="text-lg font-extrabold text-white">Quản Lý Công Việc & Lịch Tái Diễn (RRULE)</h3>

                <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setTaskFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      taskFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => setTaskFilter('recurring')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      taskFilter === 'recurring' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Định Kỳ
                  </button>
                  <button
                    onClick={() => setTaskFilter('due')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      taskFilter === 'due' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Cần Làm
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTasks.map((t) => (
                  <div key={t.id} className="glass-panel p-5 rounded-2xl space-y-3 border border-slate-800/80">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleTask(t.id, t.status)}
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                            t.status === 'done'
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-700 bg-slate-950 text-transparent hover:border-indigo-500'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                        <h4 className={`font-bold text-base ${t.status === 'done' ? 'line-through text-slate-400' : 'text-white'}`}>
                          {t.title}
                        </h4>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        {t.priority}
                      </span>
                    </div>
                    {t.description && <p className="text-xs text-slate-400 pl-9 font-medium">{t.description}</p>}
                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 pl-9 font-medium">
                      <span>Lặp: {t.rrule || 'Một lần'}</span>
                      <span>Hạn: {t.dueOn}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ASSETS */}
          {activeTab === 'assets' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-white">Danh Mục Thiết Bị & Lịch Bảo Trì Xe/Gia Dụng</h3>
                <button className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 hover:bg-slate-700">
                  <QrCode className="w-4 h-4 text-indigo-400" /> Quét Mã QR
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assets.map((ast) => (
                  <div key={ast.id} className="glass-panel p-5 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-base flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-indigo-400" />
                        {ast.name}
                      </h4>
                      <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {ast.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 space-y-1 font-medium">
                      <p>Danh mục: <strong className="text-slate-200">{ast.category}</strong></p>
                      <p>Vị trí: <strong className="text-slate-200">{ast.location}</strong></p>
                      <p>Hạn bảo hành: <strong className="text-amber-400 font-bold">{ast.warrantyUntil || 'Không rõ'}</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DAILY & HABITS */}
          {activeTab === 'daily' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <h3 className="text-lg font-extrabold text-white">Thói Quen Hằng Ngày & Ghi Chú Sổ Tay</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-panel p-5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-400" /> Đọc sách 30 phút
                    </span>
                    <span className="text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                      🔥 Streak 5 Ngày
                    </span>
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-400" /> Ghi chú Mật Khẩu Wifi
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800 font-mono">
                    Mật khẩu Wifi: SuperFast2026
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button (FAB) on Mobile Screens (< md) */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="md:hidden fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl shadow-indigo-500/40 flex items-center justify-center active:scale-90 transition-all ring-2 ring-indigo-400/30"
        aria-label="Ghi chi mới"
      >
        <Plus className="w-7 h-7 stroke-[3]" />
      </button>

      {/* Bottom Navigation Bar for Mobile (< md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-nav-mobile px-3 py-2 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'dashboard' ? 'text-indigo-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('finance')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'finance' ? 'text-indigo-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px]">Chi Tiêu</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'tasks' ? 'text-indigo-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span className="text-[10px]">Công Việc</span>
        </button>

        <button
          onClick={() => setActiveTab('assets')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'assets' ? 'text-indigo-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wrench className="w-5 h-5" />
          <span className="text-[10px]">Thiết Bị</span>
        </button>

        <button
          onClick={() => setActiveTab('daily')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'daily' ? 'text-indigo-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">Sinh Hoạt</span>
        </button>
      </nav>

      {/* Social OAuth Login Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm p-6 rounded-2xl space-y-5 shadow-2xl border border-indigo-500/30 animate-sheet-up md:animate-none">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Đăng Nhập LifeHub
              </h3>
              <button onClick={() => setIsAuthModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 text-center font-medium">
              Đăng nhập để đồng bộ dữ liệu gia đình & chi tiêu trên nhiều thiết bị.
            </p>

            <div className="space-y-3">
              {/* Google Login Button */}
              <button
                onClick={() => handleSocialLogin('google')}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <GoogleIcon className="w-5 h-5" />
                <span>Tiếp tục với Google</span>
              </button>

              {/* Facebook Login Button */}
              <button
                onClick={() => handleSocialLogin('facebook')}
                className="w-full py-3 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <FacebookIcon className="w-5 h-5 fill-white" />
                <span>Tiếp tục với Facebook</span>
              </button>
            </div>

            <div className="pt-2 text-center border-t border-slate-800">
              <span className="text-[10px] text-slate-500">Bảo mật SSL 256-bit bởi Cloudflare Worker & D1</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Expense Bottom Sheet Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-t-3xl md:rounded-2xl space-y-4 shadow-2xl border border-slate-700/60 animate-sheet-up md:animate-none">
            <div className="w-12 h-1 rounded-full bg-slate-700 mx-auto md:hidden mb-2"></div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                Ghi Khoản Chi Mới
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-wider">Số Tiền (VND)</label>
                <input
                  type="number"
                  placeholder="Ví dụ: 150000"
                  value={newTxnAmount}
                  onChange={(e) => setNewTxnAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-extrabold text-xl focus:outline-none focus:border-indigo-500"
                  required
                  autoFocus
                />
              </div>

              {/* Category Selector Chips */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-wider">Danh Mục Chi</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('cat_food')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      selectedCategory === 'cat_food'
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Utensils className="w-3.5 h-3.5" /> Ăn uống
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('cat_bills')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      selectedCategory === 'cat_bills'
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" /> Hóa đơn
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('cat_transport')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      selectedCategory === 'cat_transport'
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Car className="w-3.5 h-3.5" /> Đi lại
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-wider">Ghi Chú Nội Dung</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Cà phê sáng với bạn bè"
                  value={newTxnNote}
                  onChange={(e) => setNewTxnNote(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-wider">Chọn Ví Thanh Toán</label>
                <select
                  value={selectedWalletId}
                  onChange={(e) => setSelectedWalletId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-semibold focus:outline-none focus:border-indigo-500"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({(w.balanceMinor || w.openingBalanceMinor || 0).toLocaleString('vi-VN')} ₫)
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 md:w-auto px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="w-1/2 md:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-95 text-sm font-extrabold shadow-lg shadow-indigo-500/25 active:scale-95"
                >
                  Lưu Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PWA Installation Instructions Modal */}
      {isInstallGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl space-y-4 shadow-2xl border border-indigo-500/40 animate-sheet-up md:animate-none">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-400" />
                Hướng Dẫn Cài App LifeHub
              </h3>
              <button onClick={() => setIsInstallGuideOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <p className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <AppleIcon className="w-4 h-4" /> Với iPhone / iPad (Safari):
                </p>
                <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-400">
                  <li>Bấm nút <strong>Chia sẻ (Share) ⎋</strong> ở thanh dưới cùng Safari.</li>
                  <li>Cuộn xuống chọn <strong>"Thêm vào Màn hình chính" ➕</strong>.</li>
                  <li>Bấm <strong>Thêm (Add)</strong> ở góc trên bên phải.</li>
                </ol>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" /> Với Android (Chrome):
                </p>
                <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-400">
                  <li>Bấm dấu <strong>3 chấm `⋮`</strong> ở góc trên bên phải Chrome.</li>
                  <li>Chọn <strong>"Cài đặt ứng dụng"</strong> hoặc <strong>"Thêm vào MH chính"</strong>.</li>
                </ol>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={handleDismissBanner}
                className="text-xs text-slate-400 hover:text-slate-200 underline"
              >
                Không hỏi lại nữa
              </button>

              <button
                onClick={() => setIsInstallGuideOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
              >
                Đã Hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GoogleIcon(props: any) {
  return (
    <svg className={props.className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function FacebookIcon(props: any) {
  return (
    <svg className={props.className} viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function AppleIcon(props: any) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.13-1.96.99-3.12-1 .04-2.19.67-2.88 1.48-.6.7-1.12 1.83-.98 2.95 1.12.09 2.22-.49 2.87-1.31z"/>
    </svg>
  );
}
