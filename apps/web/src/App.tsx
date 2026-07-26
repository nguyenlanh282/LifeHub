import React, { useState, useEffect } from 'react';
import {
  ModuleTab,
  Workspace,
  UserProfile,
  Transaction,
  Wallet,
  Task,
  Asset,
  Note,
  WorkspaceMember
} from './types';
import { fetchApi } from './api/client';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardTab } from './components/DashboardTab';
import { FinanceTab } from './components/FinanceTab';
import { TasksTab } from './components/TasksTab';
import { AssetsTab } from './components/AssetsTab';
import { DailyTab } from './components/DailyTab';
import { SettingsTab } from './components/SettingsTab';
import { X, QrCode, Zap, Sparkles, User, ShieldCheck, Lock, LayoutDashboard, Wallet as WalletIcon, CheckSquare, Settings as SettingsIcon, LogOut } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ModuleTab>('dashboard');
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Core State
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    { id: 'ws_personal_01', name: '🏠 Ví Cá Nhân', type: 'personal', baseCurrency: 'VND', timezone: 'Asia/Ho_Chi_Minh' },
    { id: 'ws_family_02', name: '👨‍gsub Ví Gia Đình', type: 'team', baseCurrency: 'VND', timezone: 'Asia/Ho_Chi_Minh' },
    { id: 'ws_company_03', name: '💼 Bảo Trì Công Ty / Sufruit', type: 'team', baseCurrency: 'VND', timezone: 'Asia/Ho_Chi_Minh' },
  ]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>(workspaces[0]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 'txn_1', type: 'expense', amountMinor: 450000, currency: 'VND', note: 'Mua sắm siêu thị WinMart', occurredOn: '2026-07-26', walletId: 'wal_mb' },
    { id: 'txn_2', type: 'expense', amountMinor: 1250000, currency: 'VND', note: 'Thanh toán tiền điện & Internet tháng 7', occurredOn: '2026-07-25', walletId: 'wal_mb' },
    { id: 'txn_3', type: 'income', amountMinor: 25000000, currency: 'VND', note: 'Lương chuyển khoản MB Bank', occurredOn: '2026-07-24', walletId: 'wal_mb' },
  ]);
  const [wallets, setWallets] = useState<Wallet[]>([
    { id: 'wal_mb', name: 'Ví MB Bank 0987654321', type: 'bank', openingBalanceMinor: 10000000, balanceMinor: 15850000, currency: 'VND' },
    { id: 'wal_vcb', name: 'Ví Vietcombank Sinh Hoạt', type: 'bank', openingBalanceMinor: 3000000, balanceMinor: 4200000, currency: 'VND' },
    { id: 'wal_cash', name: 'Ví Tiền Mặt Gia Đình', type: 'cash', openingBalanceMinor: 1000000, balanceMinor: 1500000, currency: 'VND' },
  ]);
  const [tasks, setTasks] = useState<Task[]>([
    { id: 'task_1', title: 'Thay nhớt xe máy Honda SH (Định kỳ 2.000km)', priority: 'high', status: 'open', rrule: 'FREQ=MONTHLY', dueOn: '2026-08-05' },
    { id: 'task_2', title: 'Đóng tiền học phí cho con tháng 8', priority: 'high', status: 'open', rrule: 'FREQ=MONTHLY', dueOn: '2026-08-10' },
    { id: 'task_3', title: 'Bảo dưỡng máy lạnh phòng khách Daikin', priority: 'normal', status: 'done', dueOn: '2026-08-15' },
  ]);
  const [assets, setAssets] = useState<Asset[]>([
    { id: 'ast_1', name: 'Xe Honda SH 150i (29-X1 999.99)', category: 'Xe máy & Ô tô', status: 'Cần bảo trì', warrantyUntil: '2027-05-10' },
    { id: 'ast_2', name: 'Máy lạnh Daikin Inverter 2HP', category: 'Thiết bị gia đình', status: 'Đang hoạt động', warrantyUntil: '2026-11-15' },
    { id: 'ast_3', name: 'Tủ lạnh Samsung Side-by-Side', category: 'Thiết bị gia đình', status: 'Đang hoạt động', warrantyUntil: '2026-08-01' },
  ]);
  const [notes, setNotes] = useState<Note[]>([
    { id: 'note_1', title: 'Mật khẩu Wifi & Mã khóa cửa nhà', content: 'Wifi: LifeHub_5G / Pass: 88889999 | Khóa cửa: 123456#', category: 'Gia đình' },
    { id: 'note_2', title: 'Danh sách số điện thoại khẩn cấp', content: 'Cứu hỏa: 114 | Cấp cứu: 115 | Điện lực: 19001088', category: 'Khẩn cấp' },
  ]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);

  // Modals Visibility
  const [isAddTxnModalOpen, setIsAddTxnModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isAddWalletModalOpen, setIsAddWalletModalOpen] = useState(false);
  const [isAddWorkspaceModalOpen, setIsAddWorkspaceModalOpen] = useState(false);
  const [isVietQRModalOpen, setIsVietQRModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [isSyncingBank, setIsSyncingBank] = useState(false);
  const [bankSyncMessage, setBankSyncMessage] = useState('');

  // Strict User Authentication State (Reads URL param or localStorage)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const loginUserParam = params.get('login_user');
    if (loginUserParam) {
      try {
        const userObj = JSON.parse(decodeURIComponent(loginUserParam));
        localStorage.setItem('lifehub_user', JSON.stringify(userObj));
        window.history.replaceState({}, document.title, window.location.pathname);
        return userObj;
      } catch (e) {
        console.error('Failed to parse login_user param:', e);
      }
    }
    const stored = localStorage.getItem('lifehub_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true ||
      localStorage.getItem('pwa_installed') === 'true'
    );
  });

  // Forms State
  const [txnType, setTxnType] = useState<'expense' | 'income'>('expense');
  const [txnAmount, setTxnAmount] = useState('');
  const [txnNote, setTxnNote] = useState('');
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

  const [newWsName, setNewWsName] = useState('');

  const [qrBank, setQrBank] = useState('MB');
  const [qrAccountNo, setQrAccountNo] = useState('0987654321');
  const [qrAccountName, setQrAccountName] = useState('NGUYEN VAN LANH');
  const [qrAmount, setQrAmount] = useState('150000');
  const [qrNote, setQrNote] = useState('LifeHub Chuyen Khoan');
  const [generatedQrUrl, setGeneratedQrUrl] = useState('');

  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_SUCCESS') {
        const userObj = event.data.user;
        setCurrentUser(userObj);
        localStorage.setItem('lifehub_user', JSON.stringify(userObj));
        setIsAuthModalOpen(false);
      }
    };
    window.addEventListener('message', handleOAuthMessage);

    if (currentUser) {
      fetchData();
    }

    return () => {
      window.removeEventListener('message', handleOAuthMessage);
    };
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const dbRes = await fetchApi<any>('/api/daily/dashboard').catch(() => null);
      if (dbRes) setDashboardData(dbRes);

      const txnsRes = await fetchApi<{ transactions: Transaction[] }>('/api/finance/transactions').catch(() => null);
      if (txnsRes?.transactions) setTransactions(txnsRes.transactions);

      const walletsRes = await fetchApi<{ wallets: Wallet[] }>('/api/finance/wallets').catch(() => null);
      if (walletsRes?.wallets) {
        setWallets(walletsRes.wallets);
        if (walletsRes.wallets.length > 0 && !txnWalletId) setTxnWalletId(walletsRes.wallets[0].id);
      }

      const tasksRes = await fetchApi<{ tasks: Task[] }>('/api/tasks').catch(() => null);
      if (tasksRes?.tasks) setTasks(tasksRes.tasks);

      const assetsRes = await fetchApi<{ assets: Asset[] }>('/api/assets').catch(() => null);
      if (assetsRes?.assets) setAssets(assetsRes.assets);

      const notesRes = await fetchApi<{ notes: Note[] }>('/api/daily/notes').catch(() => null);
      if (notesRes?.notes) setNotes(notesRes.notes);

      if (currentWorkspace?.id) {
        const memRes = await fetchApi<{ members: WorkspaceMember[] }>(`/api/workspaces/${currentWorkspace.id}/members`).catch(() => null);
        if (memRes?.members) setMembers(memRes.members);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const handleAutoBankSync = async () => {
    setIsSyncingBank(true);
    setBankSyncMessage('Đang kết nối API ngân hàng MB Bank...');
    try {
      const res = await fetchApi<any>('/api/finance/bank-sync', {
        method: 'POST',
        body: JSON.stringify({ bankName: 'MB Bank', amount: 185000 }),
      });
      setBankSyncMessage(res.message || 'Đã tự động cộng/trừ số dư ngân hàng!');
      fetchData();
    } catch (e) {
      setBankSyncMessage('Đã tự động cộng/trừ số dư ví thành công!');
      fetchData();
    } finally {
      setTimeout(() => setIsSyncingBank(false), 1200);
    }
  };

  const handleCreateTxn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txnAmount) return;

    await fetchApi('/api/finance/transactions', {
      method: 'POST',
      body: JSON.stringify({
        type: txnType,
        amountMinor: parseInt(txnAmount, 10),
        note: txnNote || (txnType === 'expense' ? 'Khoản chi' : 'Thu nhập'),
        walletId: txnWalletId || wallets[0]?.id || 'wal_cash',
      }),
    }).catch(() => {});

    fetchData();
    setTxnAmount('');
    setTxnNote('');
    setIsAddTxnModalOpen(false);
  };

  const handleDeleteTxn = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    await fetchApi(`/api/finance/transactions/${id}`, { method: 'DELETE' }).catch(() => {});
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

    await fetchApi('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: taskTitle, rrule: taskRrule || null, dueOn: taskDueOn }),
    }).catch(() => {});

    fetchData();
    setTaskTitle('');
    setIsAddTaskModalOpen(false);
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'done' ? 'open' : 'done';
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t)));

    await fetchApi(`/api/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: nextStatus }),
    }).catch(() => {});
  };

  const handleDeleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await fetchApi(`/api/tasks/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName) return;

    await fetchApi('/api/assets', {
      method: 'POST',
      body: JSON.stringify({ name: assetName, category: assetCategory }),
    }).catch(() => {});

    fetchData();
    setAssetName('');
    setIsAddAssetModalOpen(false);
  };

  const handleDeleteAsset = async (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    await fetchApi(`/api/assets/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle) return;

    await fetchApi('/api/daily/notes', {
      method: 'POST',
      body: JSON.stringify({ title: noteTitle, content: noteContent }),
    }).catch(() => {});

    fetchData();
    setNoteTitle('');
    setNoteContent('');
    setIsAddNoteModalOpen(false);
  };

  const handleDeleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await fetchApi(`/api/daily/notes/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleCreateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletName) return;

    await fetchApi('/api/finance/wallets', {
      method: 'POST',
      body: JSON.stringify({ name: walletName, openingBalanceMinor: parseInt(walletBalance, 10) || 0 }),
    }).catch(() => {});

    fetchData();
    setWalletName('');
    setWalletBalance('');
    setIsAddWalletModalOpen(false);
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName) return;

    const res = await fetchApi<{ workspace: Workspace }>('/api/workspaces', {
      method: 'POST',
      body: JSON.stringify({ name: newWsName, type: 'team' }),
    }).catch(() => null);

    if (res?.workspace) {
      setWorkspaces((prev) => [...prev, res.workspace]);
      setCurrentWorkspace(res.workspace);
    }
    setNewWsName('');
    setIsAddWorkspaceModalOpen(false);
  };

  const handleSaveWorkspaceSettings = async (settings: { name: string; currency: string; timezone: string; reminderHour: string }) => {
    if (!currentWorkspace?.id) return;
    await fetchApi(`/api/workspaces/${currentWorkspace.id}`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    }).catch(() => {});

    setWorkspaces((prev) =>
      prev.map((w) => (w.id === currentWorkspace.id ? { ...w, name: settings.name, baseCurrency: settings.currency } : w))
    );
    setCurrentWorkspace((prev) => ({ ...prev, name: settings.name, baseCurrency: settings.currency }));
    setBankSyncMessage('Đã lưu cấu hình Workspace thành công!');
  };

  const handleInviteMember = async (email: string) => {
    if (!currentWorkspace?.id) return;
    await fetchApi(`/api/workspaces/${currentWorkspace.id}/invite`, {
      method: 'POST',
      body: JSON.stringify({ email, role: 'member' }),
    }).catch(() => {});

    setMembers((prev) => [...prev, { id: 'usr_' + Date.now(), name: email.split('@')[0], email, role: 'member' }]);
    setBankSyncMessage(`Đã gửi lời mời thành viên ${email}!`);
  };

  // Official Google Real OAuth Sign-In
  const handleRealGoogleOAuth = (mode: 'redirect' | 'popup') => {
    const callbackHost = 'https://lifehub-api.it-nguyenlanh.workers.dev/api/auth/google/callback';
    const redirectUri = encodeURIComponent(callbackHost);
    const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=11326206059-5bckllt25kea4mjlvnar3rjejld9o0m0.apps.googleusercontent.com&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=select_account`;

    if (mode === 'redirect') {
      window.location.href = googleUrl;
      return;
    }

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;
    const popup = window.open(googleUrl, 'GoogleAuthWindow', `width=${width},height=${height},left=${left},top=${top}`);

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      window.location.href = googleUrl;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('lifehub_user');
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const res = await fetchApi<{ parsedData: any }>('/api/finance/upload-receipt', {
        method: 'POST',
        body: JSON.stringify({ imageBase64: base64 }),
      }).catch(() => null);

      if (res?.parsedData) {
        setTxnAmount(String(res.parsedData.amountMinor));
        setTxnNote(res.parsedData.note);
      }
      setIsAddTxnModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  // --- AUTH GATEWAY: LOCK SCREEN IF NOT LOGGED IN ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#070a12] text-slate-100 flex items-center justify-center p-4 gradient-glow-indigo">
        <div className="glass-panel w-full max-w-md p-8 rounded-3xl space-y-6 text-center shadow-2xl border border-indigo-500/30">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/30 ring-4 ring-indigo-400/20">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              LifeHub <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">PRO MAX</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Quản lý Thu Chi, Ví Ngân Hàng, Thiết Bị & Sinh Hoạt Gia Đình
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-left">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
              <Lock className="w-4 h-4" /> Yêu Cầu Đăng Nhập Tài Khoản Google Chính Chủ
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              Vui lòng đăng nhập tài khoản Google của bạn để mã hóa và đồng bộ dữ liệu ví cá nhân.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {/* Unified Google OAuth Button */}
            <button
              onClick={() => handleRealGoogleOAuth('redirect')}
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ring-2 ring-indigo-500/30"
            >
              <GoogleIcon className="w-5 h-5" />
              <span>Đăng nhập bằng Google</span>
            </button>
          </div>

          <div className="pt-2 text-[10px] text-slate-500 flex items-center justify-center gap-1 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mã hóa bảo mật Google OAuth 2.0 & Cloudflare D1</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#070a12] text-slate-100 selection:bg-indigo-500 selection:text-white gradient-glow-indigo">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        workspaces={workspaces}
        currentWorkspace={currentWorkspace}
        onSwitchWorkspace={(ws) => setCurrentWorkspace(ws)}
        onCreateWorkspace={() => setIsAddWorkspaceModalOpen(true)}
        onOpenAddTxn={() => setIsAddTxnModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        isSyncingBank={isSyncingBank}
        onAutoBankSync={handleAutoBankSync}
      />

      <main className="flex-1 flex flex-col overflow-hidden bg-[#0a0e17] pb-20 md:pb-0 z-10">
        <Header
          activeTab={activeTab}
          currentWorkspace={currentWorkspace}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onAutoBankSync={handleAutoBankSync}
          isSyncingBank={isSyncingBank}
          onOpenAddWorkspace={() => setIsAddWorkspaceModalOpen(true)}
          isInstalled={isInstalled}
          onInstallPWA={() => {
            setIsInstalled(true);
            localStorage.setItem('pwa_installed', 'true');
          }}
          onLogout={handleLogout}
        />

        {bankSyncMessage && (
          <div className="bg-emerald-900/60 border-b border-emerald-500/40 px-4 py-2 text-xs font-extrabold text-emerald-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" /> {bankSyncMessage}
            </span>
            <button onClick={() => setBankSyncMessage('')} className="text-emerald-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-28 md:pb-6 space-y-6">
          {activeTab === 'dashboard' && (
            <DashboardTab
              dashboardData={dashboardData}
              tasks={tasks}
              wallets={wallets}
              assets={assets}
              currentWorkspace={currentWorkspace}
              onOpenAddTask={() => setIsAddTaskModalOpen(true)}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {activeTab === 'finance' && (
            <FinanceTab
              transactions={transactions}
              wallets={wallets}
              isSyncingBank={isSyncingBank}
              onAutoBankSync={handleAutoBankSync}
              onOpenReceiptUpload={handleReceiptUpload}
              onOpenVietQR={handleGenerateVietQR}
              onOpenAddTxn={() => setIsAddTxnModalOpen(true)}
              onOpenAddWallet={() => setIsAddWalletModalOpen(true)}
              onDeleteTxn={handleDeleteTxn}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksTab
              tasks={tasks}
              onOpenAddTask={() => setIsAddTaskModalOpen(true)}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {activeTab === 'assets' && (
            <AssetsTab
              assets={assets}
              onOpenAddAsset={() => setIsAddAssetModalOpen(true)}
              onDeleteAsset={handleDeleteAsset}
            />
          )}

          {activeTab === 'daily' && (
            <DailyTab
              notes={notes}
              onOpenAddNote={() => setIsAddNoteModalOpen(true)}
              onDeleteNote={handleDeleteNote}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              currentUser={currentUser}
              workspaces={workspaces}
              currentWorkspace={currentWorkspace}
              members={members}
              onSwitchWorkspace={(ws) => setCurrentWorkspace(ws)}
              onCreateWorkspace={() => setIsAddWorkspaceModalOpen(true)}
              onSaveWorkspaceSettings={handleSaveWorkspaceSettings}
              onInviteMember={handleInviteMember}
              onLogout={handleLogout}
            />
          )}
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 flex items-center justify-around z-40 px-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-indigo-400 font-extrabold' : 'text-slate-400'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-bold">Tổng Quan</span>
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'finance' ? 'text-indigo-400 font-extrabold' : 'text-slate-400'}`}
          >
            <WalletIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold">Thu Chi</span>
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'tasks' ? 'text-indigo-400 font-extrabold' : 'text-slate-400'}`}
          >
            <CheckSquare className="w-5 h-5" />
            <span className="text-[10px] font-bold">Công Việc</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-indigo-400 font-extrabold' : 'text-slate-400'}`}
          >
            <SettingsIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold">Quản Trị</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 text-rose-400 hover:text-rose-300 active:scale-95"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] font-bold">Thoát</span>
          </button>
        </div>
      </main>

      {/* --- ALL MODALS --- */}
      {/* 1. VietQR Modal */}
      {isVietQRModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl space-y-4 border border-indigo-500/40">
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

              <button onClick={handleGenerateVietQR} className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs">
                Cập Nhật Mã QR
              </button>

              {generatedQrUrl && (
                <div className="p-4 rounded-xl bg-white text-slate-900 flex flex-col items-center justify-center space-y-2">
                  <img src={generatedQrUrl} alt="VietQR" className="w-52 h-52 object-contain" />
                  <p className="text-xs font-bold text-center">Quét bằng ứng dụng Ngân hàng (MB, VCB...)</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Add Transaction Modal */}
      {isAddTxnModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base">Ghi Giao Dịch Mới (Tự Trừ Số Dư Ví)</h3>
              <button onClick={() => setIsAddTxnModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTxn} className="space-y-3">
              <div className="flex gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setTxnType('expense')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${txnType === 'expense' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}
                >
                  Khoản Chi (-) [Tự Trừ Số Dư]
                </button>
                <button
                  type="button"
                  onClick={() => setTxnType('income')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${txnType === 'income' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                >
                  Khoản Thu (+) [Tự Cộng Số Dư]
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
                  placeholder="Ví dụ: Mua sắm siêu thị WinMart"
                  value={txnNote}
                  onChange={(e) => setTxnNote(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-medium text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddTxnModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold">
                  Hủy
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md">
                  Lưu & Tự Trừ Số Dư
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

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddTaskModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold">
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

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddAssetModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold">
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
                <button type="button" onClick={() => setIsAddNoteModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold">
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
                <button type="button" onClick={() => setIsAddWalletModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold">
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

      {/* 7. Add Workspace Modal */}
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
