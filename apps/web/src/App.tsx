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
  User,
  Trash2,
  Edit3,
  Camera,
  UploadCloud,
  Building2,
  CheckSquare2,
  RefreshCw,
  PlusCircle,
  FileImage,
  ArrowDownRight
} from 'lucide-react';

type ModuleTab = 'dashboard' | 'finance' | 'tasks' | 'assets' | 'daily';

const API_BASE =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.'))
    ? ''
    : 'https://lifehub-api.it-nguyenlanh.workers.dev';

export default function App() {
  const [activeTab, setActiveTab] = useState<ModuleTab>('dashboard');
  const [isOnline] = useState<boolean>(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Core Data Lists
  const [transactions, setTransactions] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);

  // Modals Visibility State
  const [isAddTxnModalOpen, setIsAddTxnModalOpen] = useState(false);
  const [isEditTxnModalOpen, setIsEditTxnModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [isEditAssetModalOpen, setIsEditAssetModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isAddWalletModalOpen, setIsAddWalletModalOpen] = useState(false);
  const [isVietQRModalOpen, setIsVietQRModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Selected item state for Edit/Delete/QR
  const [selectedTxn, setSelectedTxn] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  // Current User State
  const [currentUser, setCurrentUser] = useState<any>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('lifehub_user');
    return stored
      ? JSON.parse(stored)
      : {
          id: 'usr_g_default',
          name: 'Lành Guru',
          email: 'lanh.guru@gmail.com',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
          provider: 'google',
        };
  });

  // PWA Standalone Detection & Banner Dismiss
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true ||
      document.referrer.startsWith('android-app://') ||
      localStorage.getItem('pwa_installed') === 'true'
    );
  });
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('pwa_banner_dismissed') === 'true';
  });

  // Filter States
  const [taskFilter, setTaskFilter] = useState<'all' | 'recurring' | 'due' | 'done'>('all');

  // Form Field States
  // 1. Transaction Form
  const [txnType, setTxnType] = useState<'expense' | 'income'>('expense');
  const [txnAmount, setTxnAmount] = useState('');
  const [txnNote, setTxnNote] = useState('');
  const [txnCategory, setTxnCategory] = useState('cat_food');
  const [txnWalletId, setTxnWalletId] = useState('');
  const [txnReceiptUrl, setTxnReceiptUrl] = useState('');

  // 2. Task Form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<'normal' | 'high'>('normal');
  const [taskRrule, setTaskRrule] = useState('');
  const [taskDueOn, setTaskDueOn] = useState(new Date().toISOString().split('T')[0]);

  // 3. Asset Form
  const [assetName, setAssetName] = useState('');
  const [assetCategory, setAssetCategory] = useState('Xe máy & Ô tô');
  const [assetLocation, setAssetLocation] = useState('Nhà riêng');
  const [assetWarranty, setAssetWarranty] = useState('2027-12-31');

  // 4. Note Form
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState('Ghi chú chung');

  // 5. Wallet Form
  const [walletName, setWalletName] = useState('');
  const [walletType, setWalletType] = useState('bank');
  const [walletBalance, setWalletBalance] = useState('');

  // 6. VietQR Form
  const [qrBank, setQrBank] = useState('MB');
  const [qrAccountNo, setQrAccountNo] = useState('0987654321');
  const [qrAccountName, setQrAccountName] = useState('NGUYEN VAN LANH');
  const [qrAmount, setQrAmount] = useState('150000');
  const [qrNote, setQrNote] = useState('LifeHub Chuyen Khoan');
  const [generatedQrUrl, setGeneratedQrUrl] = useState('');

  // Initial Fetch & Event Listeners
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

  const fetchData = () => {
    fetch(`${API_BASE}/api/daily/dashboard`)
      .then((res) => res.json())
      .then((data) => setDashboardData(data))
      .catch(() => {});

    fetch(`${API_BASE}/api/finance/transactions`)
      .then((res) => res.json())
      .then((data) => setTransactions(data.transactions || []))
      .catch(() => {});

    fetch(`${API_BASE}/api/tasks`)
      .then((res) => res.json())
      .then((data) => setTasks(data.tasks || []))
      .catch(() => {});

    fetch(`${API_BASE}/api/finance/wallets`)
      .then((res) => res.json())
      .then((data) => {
        setWallets(data.wallets || []);
        if (data.wallets?.length > 0 && !txnWalletId) setTxnWalletId(data.wallets[0].id);
      })
      .catch(() => {});

    fetch(`${API_BASE}/api/assets`)
      .then((res) => res.json())
      .then((data) => setAssets(data.assets || []))
      .catch(() => {});

    fetch(`${API_BASE}/api/daily/notes`)
      .then((res) => res.json())
      .then((data) => setNotes(data.notes || []))
      .catch(() => {});

    fetch(`${API_BASE}/api/daily/habits`)
      .then((res) => res.json())
      .then((data) => setHabits(data.habits || []))
      .catch(() => {});
  };

  // --- CRUD HANDLERS ---

  // 1. Transaction CRUD
  const handleCreateTxn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txnAmount) return;

    const payload = {
      type: txnType,
      amountMinor: parseInt(txnAmount, 10),
      note: txnNote || (txnType === 'expense' ? 'Khoản chi tiêu' : 'Khoản thu nhập'),
      categoryId: txnCategory,
      occurredOn: new Date().toISOString().split('T')[0],
      walletId: txnWalletId || wallets[0]?.id || 'wal_cash',
      receiptUrl: txnReceiptUrl || null,
    };

    await fetch(`${API_BASE}/api/finance/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});

    fetchData();
    setTxnAmount('');
    setTxnNote('');
    setTxnReceiptUrl('');
    setIsAddTxnModalOpen(false);
  };

  const handleDeleteTxn = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    await fetch(`${API_BASE}/api/finance/transactions/${id}`, { method: 'DELETE' }).catch(() => {});
    fetchData();
  };

  // 2. VietQR Generator Handler
  const handleGenerateVietQR = () => {
    const addInfo = encodeURIComponent(qrNote || 'LifeHub Chuyen Khoan');
    const url = `https://img.vietqr.io/image/${qrBank}-${qrAccountNo}-compact2.png?amount=${qrAmount}&addInfo=${addInfo}&accountName=${encodeURIComponent(
      qrAccountName
    )}`;
    setGeneratedQrUrl(url);
    setIsVietQRModalOpen(true);
  };

  // 3. Receipt Upload & Parse Handler
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setTxnReceiptUrl(base64);

      // Call API upload-receipt
      const res = await fetch(`${API_BASE}/api/finance/upload-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, filename: file.name }),
      }).catch(() => null);

      if (res) {
        const data = await res.json();
        if (data.parsedData) {
          setTxnAmount(String(data.parsedData.amountMinor));
          setTxnNote(data.parsedData.note);
        }
      }
      setIsReceiptModalOpen(false);
      setIsAddTxnModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  // 4. Wallet CRUD
  const handleCreateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletName) return;

    const newW = {
      name: walletName,
      type: walletType,
      openingBalanceMinor: parseInt(walletBalance, 10) || 0,
    };

    await fetch(`${API_BASE}/api/finance/wallets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newW),
    }).catch(() => {});

    fetchData();
    setWalletName('');
    setWalletBalance('');
    setIsAddWalletModalOpen(false);
  };

  // 5. Tasks CRUD
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    const newTaskPayload = {
      title: taskTitle,
      description: taskDesc,
      priority: taskPriority,
      rrule: taskRrule || null,
      dueOn: taskDueOn,
    };

    await fetch(`${API_BASE}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTaskPayload),
    }).catch(() => {});

    fetchData();
    setTaskTitle('');
    setTaskDesc('');
    setTaskRrule('');
    setIsAddTaskModalOpen(false);
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'done' ? 'open' : 'done';
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t)));

    await fetch(`${API_BASE}/api/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    }).catch(() => {});
  };

  const handleDeleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await fetch(`${API_BASE}/api/tasks/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  // 6. Assets CRUD
  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName) return;

    const newAst = {
      name: assetName,
      category: assetCategory,
      location: assetLocation,
      status: 'available',
      warrantyUntil: assetWarranty,
    };

    await fetch(`${API_BASE}/api/assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAst),
    }).catch(() => {});

    fetchData();
    setAssetName('');
    setIsAddAssetModalOpen(false);
  };

  const handleDeleteAsset = async (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    await fetch(`${API_BASE}/api/assets/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  // 7. Notes CRUD
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle) return;

    const newN = { title: noteTitle, content: noteContent, category: noteCategory };
    await fetch(`${API_BASE}/api/daily/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newN),
    }).catch(() => {});

    fetchData();
    setNoteTitle('');
    setNoteContent('');
    setIsAddNoteModalOpen(false);
  };

  const handleDeleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await fetch(`${API_BASE}/api/daily/notes/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  // Social Auth Handlers
  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/social-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          name: provider === 'google' ? 'Lành Guru (Google)' : 'Lành Guru (Facebook)',
          email: provider === 'google' ? 'lanh.google@gmail.com' : 'lanh.facebook@gmail.com',
          avatarUrl:
            provider === 'google'
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

        {/* User Card & Action Buttons */}
        <div className="p-4 border-t border-slate-800/60 space-y-2">
          <button
            onClick={handleGenerateVietQR}
            className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <QrCode className="w-4 h-4 text-indigo-400" />
            <span>Tạo Mã VietQR Ngân Hàng</span>
          </button>

          <button
            onClick={() => setIsAddTxnModalOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Ghi Khoản Chi (+ Touch)</span>
          </button>

          {currentUser && (
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between mt-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <img
                  src={currentUser.avatarUrl || 'https://lh3.googleusercontent.com/a/default-user'}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/30 shrink-0"
                />
                <span className="text-xs font-bold text-white truncate">{currentUser.name}</span>
              </div>
              <button onClick={handleLogout} className="text-slate-400 hover:text-rose-400 p-1" title="Đăng xuất">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
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
                {activeTab === 'dashboard' && 'Dashboard Overview'}
                {activeTab === 'finance' && 'Thu Chi, Ngân Hàng & VietQR'}
                {activeTab === 'tasks' && 'Lịch Công Việc & Tái Diễn (RRULE)'}
                {activeTab === 'assets' && 'Quản Lý Thiết Bị & Bảo Trì'}
                {activeTab === 'daily' && 'Nhật Ký Sinh Hoạt & Ghi Chú'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Quick Action VietQR Button */}
            <button
              onClick={handleGenerateVietQR}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-500/15 text-indigo-300 font-bold text-xs flex items-center gap-1.5 border border-indigo-500/30 active:scale-95"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">VietQR</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-900 border border-slate-800">
                <img
                  src={currentUser.avatarUrl || 'https://lh3.googleusercontent.com/a/default-user'}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover ring-2 ring-indigo-500/30"
                />
                <span className="text-xs font-extrabold text-slate-200 hidden sm:inline">{currentUser.name}</span>
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

            {!isInstalled && !isBannerDismissed && (
              <button
                onClick={handleInstallPWA}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-indigo-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 active:scale-95 transition-all"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cài PWA</span>
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Main Workspace Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-panel p-5 rounded-2xl">
                  <span className="text-[11px] font-extrabold uppercase text-slate-400">Chi Tiêu Tháng Này</span>
                  <div className="text-2xl font-black text-white mt-2">
                    {(dashboardData?.summary?.monthlyExpensesMinor || 4250000).toLocaleString('vi-VN')} ₫
                  </div>
                  <div className="text-xs text-indigo-300 font-bold mt-1">Hạn mức: 10.000.000 ₫</div>
                </div>

                <div className="glass-panel p-5 rounded-2xl">
                  <span className="text-[11px] font-extrabold uppercase text-slate-400">Việc Cần Làm</span>
                  <div className="text-2xl font-black text-purple-400 mt-2">{tasks.length} Việc</div>
                  <div className="text-xs text-rose-400 font-bold mt-1">1 việc quá hạn</div>
                </div>

                <div className="glass-panel p-5 rounded-2xl">
                  <span className="text-[11px] font-extrabold uppercase text-slate-400">Lịch Bảo Trì Xe</span>
                  <div className="text-2xl font-black text-amber-400 mt-2">{assets.length} Thiết bị</div>
                  <div className="text-xs text-amber-300 font-bold mt-1">Hạn thay nhớt 05/08</div>
                </div>

                <div className="glass-panel p-5 rounded-2xl">
                  <span className="text-[11px] font-extrabold uppercase text-slate-400">Ví Ngân Hàng</span>
                  <div className="text-2xl font-black text-emerald-400 mt-2">{wallets.length} Ví Active</div>
                  <div className="text-xs text-slate-400 font-bold mt-1">MB, VCB, Tiền mặt</div>
                </div>
              </div>

              {/* Tasks Preview */}
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-extrabold text-white text-base">Công Việc Cần Làm</h3>
                  <button onClick={() => setIsAddTaskModalOpen(true)} className="text-xs font-bold text-indigo-400 hover:underline">
                    + Thêm Việc Mới
                  </button>
                </div>
                <div className="space-y-2.5">
                  {tasks.map((t) => (
                    <div key={t.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleTask(t.id, t.status)}
                          className={`w-5 h-5 rounded border flex items-center justify-center ${
                            t.status === 'done' ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-700'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <span className={`font-bold text-sm ${t.status === 'done' ? 'line-through text-slate-500' : 'text-white'}`}>
                          {t.title}
                        </span>
                      </div>
                      <button onClick={() => handleDeleteTask(t.id)} className="text-slate-500 hover:text-rose-400 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FINANCE & TRANSACTIONS & VIETQR */}
          {activeTab === 'finance' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-extrabold text-white">Quản Lý Giao Dịch, Ngân Hàng & VietQR</h3>
                  <p className="text-xs text-slate-400">Ghi thu chi, tải ảnh hóa đơn chuyển khoản và tạo mã VietQR thanh toán.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer px-3 py-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 hover:bg-purple-600/30">
                    <Camera className="w-4 h-4" /> Up Ảnh Hóa Đơn
                    <input type="file" accept="image/*" className="hidden" onChange={handleReceiptUpload} />
                  </label>

                  <button
                    onClick={handleGenerateVietQR}
                    className="px-3 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                  >
                    <QrCode className="w-4 h-4" /> Tạo VietQR
                  </button>

                  <button
                    onClick={() => setIsAddTxnModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4" /> Nhập Giao Dịch
                  </button>
                </div>
              </div>

              {/* Wallets & Bank Accounts Bar */}
              <div className="glass-panel p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-400" /> Danh Sách Ví & Tài Khoản Ngân Hàng
                  </h4>
                  <button onClick={() => setIsAddWalletModalOpen(true)} className="text-xs font-bold text-indigo-400 hover:underline">
                    + Thêm Ví Ngân Hàng
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {wallets.map((w) => (
                    <div key={w.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300">{w.name}</span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                          {w.type}
                        </span>
                      </div>
                      <div className="text-lg font-black text-white">
                        {(w.balanceMinor || w.openingBalanceMinor || 0).toLocaleString('vi-VN')} ₫
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transaction Table with Full Delete Action */}
              <div className="glass-panel p-5 rounded-2xl space-y-4">
                <h4 className="font-extrabold text-white text-base border-b border-slate-800 pb-3">Lịch Sử Thu Chi Gần Đây</h4>

                <div className="space-y-2.5">
                  {transactions.map((txn) => (
                    <div key={txn.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2.5 rounded-xl border ${
                            txn.type === 'expense'
                              ? 'bg-rose-500/15 text-rose-400 border-rose-500/20'
                              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          {txn.type === 'expense' ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white">{txn.note || 'Giao dịch thu chi'}</p>
                          <p className="text-xs text-slate-400 font-medium">{txn.occurredOn} • Ví Ngân Hàng</p>
                          {txn.receiptUrl && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-purple-400 font-bold mt-0.5">
                              <FileImage className="w-3 h-3" /> Có ảnh hóa đơn
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`font-black text-sm ${txn.type === 'expense' ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {txn.type === 'expense' ? '-' : '+'}{(txn.amountMinor || 0).toLocaleString('vi-VN')} ₫
                        </span>
                        <button onClick={() => handleDeleteTxn(txn.id)} className="text-slate-500 hover:text-rose-400 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-white">Quản Lý Công Việc & Lịch Tái Diễn</h3>
                <button
                  onClick={() => setIsAddTaskModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" /> Thêm Việc Mới
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTasks.map((t) => (
                  <div key={t.id} className="glass-panel p-5 rounded-2xl space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleTask(t.id, t.status)}
                          className={`w-6 h-6 rounded border flex items-center justify-center ${
                            t.status === 'done' ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-700'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                        <h4 className={`font-bold text-base ${t.status === 'done' ? 'line-through text-slate-500' : 'text-white'}`}>
                          {t.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-400">
                          {t.priority}
                        </span>
                        <button onClick={() => handleDeleteTask(t.id)} className="text-slate-500 hover:text-rose-400 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {t.description && <p className="text-xs text-slate-400 pl-9">{t.description}</p>}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 pl-9 font-medium">
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
                <h3 className="text-lg font-extrabold text-white">Quản Lý Thiết Bị & Lịch Bảo Trì</h3>
                <button
                  onClick={() => setIsAddAssetModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" /> Thêm Thiết Bị
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
                      <button onClick={() => handleDeleteAsset(ast.id)} className="text-slate-500 hover:text-rose-400 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-slate-400 space-y-1 font-medium">
                      <p>Danh mục: <strong className="text-slate-200">{ast.category}</strong></p>
                      <p>Vị trí: <strong className="text-slate-200">{ast.location}</strong></p>
                      <p>Hạn bảo hành: <strong className="text-amber-400 font-bold">{ast.warrantyUntil || '2027'}</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DAILY & NOTES */}
          {activeTab === 'daily' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-white">Ghi Chú Sổ Tay & Thói Quen Hằng Ngày</h3>
                <button
                  onClick={() => setIsAddNoteModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" /> Tạo Ghi Chú
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notes.map((n) => (
                  <div key={n.id} className="glass-panel p-5 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-extrabold text-white text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400" /> {n.title}
                      </span>
                      <button onClick={() => handleDeleteNote(n.id)} className="text-slate-500 hover:text-rose-400 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800 font-mono">
                      {n.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* --- ALL MODALS --- */}

      {/* 1. VietQR Bank Transfer Modal */}
      {isVietQRModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl space-y-4 shadow-2xl border border-indigo-500/40">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <QrCode className="w-5 h-5 text-indigo-400" />
                Mã VietQR Chuyển Khoản Ngân Hàng
              </h3>
              <button onClick={() => setIsVietQRModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Ngân hàng</label>
                  <select
                    value={qrBank}
                    onChange={(e) => setQrBank(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white"
                  >
                    <option value="MB">MB Bank</option>
                    <option value="VCB">Vietcombank</option>
                    <option value="TCB">Techcombank</option>
                    <option value="VPB">VPBank</option>
                    <option value="ICB">VietinBank</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Số tài khoản</label>
                  <input
                    type="text"
                    value={qrAccountNo}
                    onChange={(e) => setQrAccountNo(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Số tiền (VND)</label>
                  <input
                    type="number"
                    value={qrAmount}
                    onChange={(e) => setQrAmount(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nội dung</label>
                  <input
                    type="text"
                    value={qrNote}
                    onChange={(e) => setQrNote(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateVietQR}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md"
              >
                Cập Nhật Mã QR Live
              </button>

              {generatedQrUrl && (
                <div className="p-4 rounded-xl bg-white text-slate-900 flex flex-col items-center justify-center space-y-2">
                  <img src={generatedQrUrl} alt="Mã VietQR" className="w-56 h-56 object-contain" />
                  <p className="text-xs font-bold text-center text-slate-800">Quét bằng ứng dụng Ngân hàng (MB, VCB, TCB...)</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Add Transaction Modal */}
      {isAddTxnModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl space-y-4 shadow-2xl border border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base">Ghi Giao Dịch Mới (Thu / Chi)</h3>
              <button onClick={() => setIsAddTxnModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTxn} className="space-y-3">
              <div className="flex gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setTxnType('expense')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                    txnType === 'expense' ? 'bg-rose-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Khoản Chi (-)
                </button>
                <button
                  type="button"
                  onClick={() => setTxnType('income')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                    txnType === 'income' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Khoản Thu (+)
                </button>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Số Tiền (VND)</label>
                <input
                  type="number"
                  placeholder="150000"
                  value={txnAmount}
                  onChange={(e) => setTxnAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-extrabold text-lg"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Ghi Chú</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Mua sắm siêu thị"
                  value={txnNote}
                  onChange={(e) => setTxnNote(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-medium text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTxnModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold"
                >
                  Hủy
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md">
                  Lưu Giao Dịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Task Modal */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base">Thêm Công Việc Mới</h3>
              <button onClick={() => setIsAddTaskModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Tên Công Việc</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Đóng tiền điện tháng 7"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Chu Kỳ Lặp (RRULE Tái Diễn)</label>
                <select
                  value={taskRrule}
                  onChange={(e) => setTaskRrule(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-bold"
                >
                  <option value="">Không lặp (Một lần)</option>
                  <option value="FREQ=WEEKLY">Hằng tuần (Weekly)</option>
                  <option value="FREQ=MONTHLY;BYMONTHDAY=25">Hằng tháng (Ngày 25)</option>
                  <option value="FREQ=YEARLY">Hằng năm (Yearly)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold"
                >
                  Hủy
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">
                  Tạo Công Việc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add Asset Modal */}
      {isAddAssetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base">Thêm Thiết Bị / Xe Cần Bảo Trì</h3>
              <button onClick={() => setIsAddAssetModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Tên Thiết Bị / Xe</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Xe Honda SH 150i"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Danh Mục</label>
                <select
                  value={assetCategory}
                  onChange={(e) => setAssetCategory(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-bold"
                >
                  <option value="Xe máy & Ô tô">Xe máy & Ô tô</option>
                  <option value="Máy lọc nước & Đồ điện">Máy lọc nước & Đồ điện</option>
                  <option value="Điều hòa & Điện lạnh">Điều hòa & Điện lạnh</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAssetModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold"
                >
                  Hủy
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">
                  Thêm Thiết Bị
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Add Note Modal */}
      {isAddNoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base">Tạo Ghi Chú Sổ Tay</h3>
              <button onClick={() => setIsAddNoteModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Tiêu Đề Ghi Chú</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Mật khẩu Wifi nhà"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nội Dung Ghi Chú</label>
                <textarea
                  rows={3}
                  placeholder="Nhập nội dung ghi nhớ..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddNoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold"
                >
                  Hủy
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">
                  Lưu Ghi Chú
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Add Wallet Modal */}
      {isAddWalletModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base">Thêm Ví Ngân Hàng Mới</h3>
              <button onClick={() => setIsAddWalletModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWallet} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Tên Ví / Ngân Hàng</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Ví MB Bank 0987654321"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Số Dư Ban Đầu (VND)</label>
                <input
                  type="number"
                  placeholder="5000000"
                  value={walletBalance}
                  onChange={(e) => setWalletBalance(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-bold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddWalletModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold"
                >
                  Hủy
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">
                  Thêm Ví
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Social Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm p-6 rounded-2xl space-y-5 shadow-2xl border border-indigo-500/30">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Đăng Nhập LifeHub
              </h3>
              <button onClick={() => setIsAuthModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleSocialLogin('google')}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <GoogleIcon className="w-5 h-5" />
                <span>Tiếp tục với Google</span>
              </button>

              <button
                onClick={() => handleSocialLogin('facebook')}
                className="w-full py-3 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <FacebookIcon className="w-5 h-5 fill-white" />
                <span>Tiếp tục với Facebook</span>
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
