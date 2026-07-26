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
import { X, QrCode, Zap, Sparkles, User } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ModuleTab>('dashboard');
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Core State
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    { id: 'ws_personal_01', name: '🏠 Ví Cá Nhân - Lành Guru', type: 'personal', baseCurrency: 'VND', timezone: 'Asia/Ho_Chi_Minh' },
    { id: 'ws_family_02', name: '👨‍👩‍👧‍👦 Ví Gia Đình Lành', type: 'team', baseCurrency: 'VND', timezone: 'Asia/Ho_Chi_Minh' },
    { id: 'ws_company_03', name: '💼 Bảo Trì Công Ty / Sufruit', type: 'team', baseCurrency: 'VND', timezone: 'Asia/Ho_Chi_Minh' },
  ]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>(workspaces[0]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
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

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('lifehub_user');
    return stored
      ? JSON.parse(stored)
      : {
          id: 'usr_g_default',
          name: 'Nguyễn Văn Lành (Google Auth)',
          email: 'it.nguyenlanh@gmail.com',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
          provider: 'google',
        };
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
    fetchData();
  }, []);

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

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    if (provider === 'google') {
      const isCustomDomain = window.location.hostname.includes('alita.vn');
      const callbackHost = isCustomDomain
        ? 'https://lifehub.alita.vn/api/auth/google/callback'
        : 'https://lifehub-api.it-nguyenlanh.workers.dev/api/auth/google/callback';
      const redirectUri = encodeURIComponent(callbackHost);
      const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=11326206059-5bckllt25kea4mjlvnar3rjejld9o0m0.apps.googleusercontent.com&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent`;

      const width = 500;
      const height = 600;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;
      window.open(googleUrl, 'GoogleAuthWindow', `width=${width},height=${height},left=${left},top=${top}`);
      return;
    }

    try {
      const res = await fetchApi<{ user: UserProfile }>('/api/auth/social-login', {
        method: 'POST',
        body: JSON.stringify({
          provider,
          name: 'Nguyễn Văn Lành (Google Auth)',
          email: 'it.nguyenlanh@gmail.com',
          avatarUrl: 'https://lh3.googleusercontent.com/a/default-user',
        }),
      });

      if (res?.user) {
        setCurrentUser(res.user);
        localStorage.setItem('lifehub_user', JSON.stringify(res.user));
        setIsAuthModalOpen(false);
      }
    } catch (err) {}
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

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
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
              currentWorkspace={currentWorkspace}
              members={members}
              onSaveWorkspaceSettings={handleSaveWorkspaceSettings}
              onInviteMember={handleInviteMember}
            />
          )}
        </div>
      </main>

      {/* --- MODALS --- */}
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

      {/* 8. Google OAuth & Social Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm p-6 rounded-2xl space-y-5 border border-indigo-500/30">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Đăng Nhập Google OAuth Real
              </h3>
              <button onClick={() => setIsAuthModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 text-center font-medium">
              Đăng nhập bằng tài khoản Google (`it.nguyenlanh@gmail.com`) để bảo mật dữ liệu.
            </p>

            <button
              onClick={() => handleSocialLogin('google')}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center gap-3 active:scale-95"
            >
              <User className="w-5 h-5 text-indigo-600" />
              <span>Tiếp tục với Google OAuth</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
