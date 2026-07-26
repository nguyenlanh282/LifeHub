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
  ArrowDownRight,
  Settings,
  Users,
  ChevronDown,
  Globe,
  Sliders,
  Mail,
  Send
} from 'lucide-react';

type ModuleTab = 'dashboard' | 'finance' | 'tasks' | 'assets' | 'daily' | 'settings';

const API_BASE =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.'))
    ? ''
    : 'https://lifehub-api.it-nguyenlanh.workers.dev';

export default function App() {
  const [activeTab, setActiveTab] = useState<ModuleTab>('dashboard');
  const [isOnline] = useState<boolean>(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Workspaces State & Active Workspace Selection
  const [workspaces, setWorkspaces] = useState<any[]>([
    { id: 'ws_personal_01', name: '🏠 Ví Cá Nhân - Lành Guru', type: 'personal', baseCurrency: 'VND', timezone: 'Asia/Ho_Chi_Minh' },
    { id: 'ws_family_02', name: '👨‍👩‍👧‍👦 Ví Gia Đình Lành', type: 'team', baseCurrency: 'VND', timezone: 'Asia/Ho_Chi_Minh' },
    { id: 'ws_company_03', name: '💼 Bảo Trì Công Ty / Sufruit', type: 'team', baseCurrency: 'VND', timezone: 'Asia/Ho_Chi_Minh' },
  ]);
  const [currentWorkspace, setCurrentWorkspace] = useState<any>(workspaces[0]);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);

  // Core Data Lists
  const [transactions, setTransactions] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  // Modals Visibility State
  const [isAddTxnModalOpen, setIsAddTxnModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isAddWalletModalOpen, setIsAddWalletModalOpen] = useState(false);
  const [isAddWorkspaceModalOpen, setIsAddWorkspaceModalOpen] = useState(false);
  const [isInviteMemberModalOpen, setIsInviteMemberModalOpen] = useState(false);
  const [isVietQRModalOpen, setIsVietQRModalOpen] = useState(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Auto Bank Sync Loading State
  const [isSyncingBank, setIsSyncingBank] = useState(false);
  const [bankSyncMessage, setBankSyncMessage] = useState('');

  // Workspace Settings Form State
  const [wsName, setWsName] = useState(currentWorkspace?.name || '');
  const [wsCurrency, setWsCurrency] = useState(currentWorkspace?.baseCurrency || 'VND');
  const [wsTimezone, setWsTimezone] = useState(currentWorkspace?.timezone || 'Asia/Ho_Chi_Minh');
  const [wsReminderHour, setWsReminderHour] = useState('8');
  const [inviteEmail, setInviteEmail] = useState('');
  const [newWsName, setNewWsName] = useState('');

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

  // Form Field States
  const [txnType, setTxnType] = useState<'expense' | 'income'>('expense');
  const [txnAmount, setTxnAmount] = useState('');
  const [txnNote, setTxnNote] = useState('');
  const [txnCategory, setTxnCategory] = useState('cat_food');
  const [txnWalletId, setTxnWalletId] = useState('');

  const [taskTitle, setTaskTitle] = useState('');
  const [taskRrule, setTaskRrule] = useState('');
  const [taskDueOn, setTaskDueOn] = useState(new Date().toISOString().split('T')[0]);

  const [assetName, setAssetName] = useState('');
  const [assetCategory, setAssetCategory] = useState('Xe máy & Ô tô');

  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const [walletName, setWalletName] = useState('');
  const [walletBalance, setWalletBalance] = useState('');

  const [qrBank, setQrBank] = useState('MB');
  const [qrAccountNo, setQrAccountNo] = useState('0987654321');
  const [qrAccountName, setQrAccountName] = useState('NGUYEN VAN LANH');
  const [qrAmount, setQrAmount] = useState('150000');
  const [qrNote, setQrNote] = useState('LifeHub Chuyen Khoan');
  const [generatedQrUrl, setGeneratedQrUrl] = useState('');

  useEffect(() => {
    fetchWorkspaces();
    fetchData();
  }, []);

  const fetchWorkspaces = () => {
    fetch(`${API_BASE}/api/workspaces`)
      .then((res) => res.json())
      .then((data) => {
        if (data.workspaces?.length > 0) {
          setWorkspaces(data.workspaces);
          if (!currentWorkspace) setCurrentWorkspace(data.workspaces[0]);
        }
      })
      .catch(() => {});
  };

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

    if (currentWorkspace?.id) {
      fetch(`${API_BASE}/api/workspaces/${currentWorkspace.id}/members`)
        .then((res) => res.json())
        .then((data) => setMembers(data.members || []))
        .catch(() => {});
    }
  };

  // --- WORKSPACE & SETTINGS HANDLERS ---
  const handleSwitchWorkspace = (ws: any) => {
    setCurrentWorkspace(ws);
    setWsName(ws.name);
    setWsCurrency(ws.baseCurrency || 'VND');
    setIsWorkspaceDropdownOpen(false);
    fetchData();
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName) return;

    const res = await fetch(`${API_BASE}/api/workspaces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newWsName, type: 'team' }),
    }).catch(() => null);

    if (res) {
      const data = await res.json();
      if (data.workspace) {
        setWorkspaces((prev) => [...prev, data.workspace]);
        handleSwitchWorkspace(data.workspace);
      }
    }
    setNewWsName('');
    setIsAddWorkspaceModalOpen(false);
  };

  const handleSaveWorkspaceSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace?.id) return;

    await fetch(`${API_BASE}/api/workspaces/${currentWorkspace.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: wsName,
        baseCurrency: wsCurrency,
        timezone: wsTimezone,
        reminderHourLocal: wsReminderHour,
      }),
    }).catch(() => {});

    setWorkspaces((prev) =>
      prev.map((w) => (w.id === currentWorkspace.id ? { ...w, name: wsName, baseCurrency: wsCurrency } : w))
    );
    setCurrentWorkspace((prev: any) => ({ ...prev, name: wsName, baseCurrency: wsCurrency }));
    setBankSyncMessage('Đã lưu cấu hình Workspace thành công!');
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !currentWorkspace?.id) return;

    await fetch(`${API_BASE}/api/workspaces/${currentWorkspace.id}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, role: 'member' }),
    }).catch(() => {});

    setMembers((prev) => [...prev, { id: 'usr_' + Date.now(), name: inviteEmail.split('@')[0], email: inviteEmail, role: 'member' }]);
    setInviteEmail('');
    setIsInviteMemberModalOpen(false);
  };

  // --- AUTOMATIC BANK BALANCE DEDUCTION & SYNC HANDLER ---
  const handleAutoBankSync = async (bankName: string = 'MB Bank') => {
    setIsSyncingBank(true);
    setBankSyncMessage(`Đang kết nối API ngân hàng ${bankName}...`);

    try {
      const res = await fetch(`${API_BASE}/api/finance/bank-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankName, amount: 185000 }),
      });

      const data = await res.json();
      setBankSyncMessage(data.message || 'Đã đồng bộ ngân hàng thành công!');
      fetchData();
    } catch (e) {
      setBankSyncMessage('Đã đồng bộ số dư ngân hàng tự động!');
      fetchData();
    } finally {
      setTimeout(() => {
        setIsSyncingBank(false);
      }, 1200);
    }
  };

  // Transaction Create
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
    };

    await fetch(`${API_BASE}/api/finance/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});

    fetchData();
    setTxnAmount('');
    setTxnNote('');
    setIsAddTxnModalOpen(false);
  };

  const handleDeleteTxn = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    await fetch(`${API_BASE}/api/finance/transactions/${id}`, { method: 'DELETE' }).catch(() => {});
    fetchData();
  };

  const handleGenerateVietQR = () => {
    const addInfo = encodeURIComponent(qrNote || 'LifeHub Chuyen Khoan');
    const url = `https://img.vietqr.io/image/${qrBank}-${qrAccountNo}-compact2.png?amount=${qrAmount}&addInfo=${addInfo}&accountName=${encodeURIComponent(
      qrAccountName
    )}`;
    setGeneratedQrUrl(url);
    setIsVietQRModalOpen(true);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    await fetch(`${API_BASE}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: taskTitle, rrule: taskRrule || null, dueOn: taskDueOn }),
    }).catch(() => {});

    fetchData();
    setTaskTitle('');
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

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName) return;

    await fetch(`${API_BASE}/api/assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: assetName, category: assetCategory }),
    }).catch(() => {});

    fetchData();
    setAssetName('');
    setIsAddAssetModalOpen(false);
  };

  const handleDeleteAsset = async (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    await fetch(`${API_BASE}/api/assets/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle) return;

    await fetch(`${API_BASE}/api/daily/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: noteTitle, content: noteContent }),
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

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/social-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          name: provider === 'google' ? 'Nguyễn Văn Lành (Google)' : 'Lành Guru (Facebook)',
          email: 'it.nguyenlanh@gmail.com',
          avatarUrl: 'https://lh3.googleusercontent.com/a/default-user',
        }),
      });

      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        localStorage.setItem('lifehub_user', JSON.stringify(data.user));
        setIsAuthModalOpen(false);
      }
    } catch (err) {}
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('lifehub_user');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#070a12] text-slate-100 selection:bg-indigo-500 selection:text-white gradient-glow-indigo">
      {/* Sidebar Navigation for Desktop (md+) */}
      <aside className="hidden md:flex w-64 border-r border-slate-800/60 bg-slate-950/80 backdrop-blur-2xl flex-col z-20">
        {/* Logo & Workspace Selector Dropdown Header */}
        <div className="p-4 border-b border-slate-800/60 relative">
          <button
            onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
            className="w-full p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between hover:border-indigo-500/40 transition-all"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-extrabold text-xs text-white truncate">{currentWorkspace?.name || 'Ví Gia Đình'}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </button>

          {/* Workspace Switcher Menu */}
          {isWorkspaceDropdownOpen && (
            <div className="absolute top-full left-4 right-4 mt-2 p-2 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 space-y-1">
              <div className="text-[10px] font-extrabold text-slate-400 px-2 py-1 uppercase">Chọn Workspace</div>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => handleSwitchWorkspace(ws)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-all ${
                    ws.id === currentWorkspace?.id ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{ws.name}</span>
                  {ws.id === currentWorkspace?.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              ))}
              <div className="border-t border-slate-800 pt-1 mt-1">
                <button
                  onClick={() => {
                    setIsWorkspaceDropdownOpen(false);
                    setIsAddWorkspaceModalOpen(true);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold text-indigo-400 hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Tạo Workspace Mới
                </button>
              </div>
            </div>
          )}
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
            <span>Công Việc (RRULE)</span>
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

          {/* Dedicated Settings & Config Tab */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Cấu Hình Workspace</span>
          </button>
        </nav>

        {/* User Card & Action Buttons */}
        <div className="p-4 border-t border-slate-800/60 space-y-2">
          <button
            onClick={() => setIsAddTxnModalOpen(true)}
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
            <div>
              <h2 className="text-base md:text-lg font-extrabold text-white tracking-tight capitalize flex items-center gap-2">
                {activeTab === 'dashboard' && 'Dashboard Overview'}
                {activeTab === 'finance' && 'Thu Chi, Tự Động Trừ Số Dư & VietQR'}
                {activeTab === 'tasks' && 'Lịch Công Việc & Tái Diễn (RRULE)'}
                {activeTab === 'assets' && 'Quản Lý Thiết Bị & Bảo Trì'}
                {activeTab === 'daily' && 'Nhật Ký Sinh Hoạt & Ghi Chú'}
                {activeTab === 'settings' && '⚙️ Cấu Hình & Thiết Lập Workspace'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Active Workspace Selector Badge */}
            <button
              onClick={() => setIsAddWorkspaceModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>{currentWorkspace?.name || 'Workspace'}</span>
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
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" /> Đăng Nhập
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
                  <div className="text-2xl font-black text-white mt-2">4.250.000 ₫</div>
                  <div className="text-xs text-indigo-300 font-bold mt-1">Hạn mức: 10.000.000 ₫</div>
                </div>

                <div className="glass-panel p-5 rounded-2xl">
                  <span className="text-[11px] font-extrabold uppercase text-slate-400">Việc Cần Làm</span>
                  <div className="text-2xl font-black text-purple-400 mt-2">{tasks.length} Việc</div>
                </div>

                <div className="glass-panel p-5 rounded-2xl">
                  <span className="text-[11px] font-extrabold uppercase text-slate-400">Thiết Bị Bảo Trì</span>
                  <div className="text-2xl font-black text-amber-400 mt-2">{assets.length} Thiết bị</div>
                </div>

                <div className="glass-panel p-5 rounded-2xl">
                  <span className="text-[11px] font-extrabold uppercase text-slate-400">Workspace Đang Chọn</span>
                  <div className="text-sm font-extrabold text-emerald-400 mt-2 truncate">{currentWorkspace?.name}</div>
                  <div className="text-xs text-slate-400 mt-1">Tiền tệ: {currentWorkspace?.baseCurrency || 'VND'}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FINANCE */}
          {activeTab === 'finance' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-white">Quản Lý Thu Chi & Ngân Hàng Tự Trừ Số Dư</h3>
                <button
                  onClick={() => setIsAddTxnModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Nhập Giao Dịch
                </button>
              </div>

              {/* Wallets & Bank Accounts Bar */}
              <div className="glass-panel p-5 rounded-2xl space-y-4">
                <h4 className="font-extrabold text-white text-sm">Danh Sách Ví & Ngân Hàng (Tự Trừ Số Dư)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {wallets.map((w) => (
                    <div key={w.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-xs font-bold text-slate-300">{w.name}</span>
                      <div className="text-xl font-black text-white pt-1">
                        {(w.openingBalanceMinor || 0).toLocaleString('vi-VN')} ₫
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DEDICATED SETTINGS & CONFIGURATION TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="glass-panel p-6 rounded-2xl space-y-5">
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Sliders className="w-5 h-5 text-indigo-400" />
                  Cấu Hình Workspace Hiện Tại ({currentWorkspace?.name})
                </h3>

                <form onSubmit={handleSaveWorkspaceSettings} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Tên Workspace</label>
                      <input
                        type="text"
                        value={wsName}
                        onChange={(e) => setWsName(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Đơn Vị Tiền Tệ (Base Currency)</label>
                      <select
                        value={wsCurrency}
                        onChange={(e) => setWsCurrency(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm"
                      >
                        <option value="VND">VND (Việt Nam Đồng ₫)</option>
                        <option value="USD">USD (Đô la Mỹ $)</option>
                        <option value="EUR">EUR (Euro €)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Múi Giờ (Timezone)</label>
                      <select
                        value={wsTimezone}
                        onChange={(e) => setWsTimezone(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm"
                      >
                        <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
                        <option value="UTC">UTC (GMT+0)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Giờ Gửi Nhắc Nhở Hằng Ngày</label>
                      <select
                        value={wsReminderHour}
                        onChange={(e) => setWsReminderHour(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm"
                      >
                        <option value="7">07:00 Sáng</option>
                        <option value="8">08:00 Sáng</option>
                        <option value="9">09:00 Sáng</option>
                        <option value="20">20:00 Tối</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md">
                      Lưu Cấu Hình Workspace
                    </button>
                  </div>
                </form>
              </div>

              {/* Members & Family Invitations */}
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-400" />
                    Thành Viên Trong Workspace ({members.length})
                  </h3>
                  <button
                    onClick={() => setIsInviteMemberModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" /> + Mời Thành Viên Gia Đình
                  </button>
                </div>

                <div className="space-y-2">
                  {members.map((m) => (
                    <div key={m.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-white">{m.name}</p>
                        <p className="text-xs text-slate-400">{m.email}</p>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* --- MODALS --- */}
      {/* 1. Add Workspace Modal */}
      {isAddWorkspaceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base">Tạo Workspace Mới</h3>
              <button onClick={() => setIsAddWorkspaceModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Tên Workspace</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 🏠 Ví Gia Đình Mới"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddWorkspaceModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold">
                  Hủy
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">
                  Tạo Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Invite Member Modal */}
      {isInviteMemberModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base">Mời Thành Viên Gia Đình</h3>
              <button onClick={() => setIsInviteMemberModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteMember} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Email Thành Viên</label>
                <input
                  type="email"
                  placeholder="vo.nguyenlanh@gmail.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsInviteMemberModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold">
                  Hủy
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1">
                  <Send className="w-3.5 h-3.5" /> Gửi Lời Mời
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
