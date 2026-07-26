import React, { useState } from 'react';
import {
  LayoutDashboard,
  Wallet,
  CheckSquare,
  Wrench,
  Calendar,
  Settings,
  Sparkles,
  Plus,
  ChevronDown,
  Check,
  RefreshCw,
  LogOut,
  User
} from 'lucide-react';
import { ModuleTab, Workspace, UserProfile } from '../types';

interface SidebarProps {
  activeTab: ModuleTab;
  setActiveTab: (tab: ModuleTab) => void;
  workspaces: Workspace[];
  currentWorkspace: Workspace;
  onSwitchWorkspace: (ws: Workspace) => void;
  onCreateWorkspace: () => void;
  onOpenAddTxn: () => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  isSyncingBank: boolean;
  onAutoBankSync: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  workspaces,
  currentWorkspace,
  onSwitchWorkspace,
  onCreateWorkspace,
  onOpenAddTxn,
  currentUser,
  onLogout,
  onOpenAuth,
  isSyncingBank,
  onAutoBankSync,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <aside className="hidden md:flex w-64 border-r border-slate-800/60 bg-slate-950/80 backdrop-blur-2xl flex-col z-20">
      {/* Workspace Selector Dropdown Header */}
      <div className="p-4 border-b border-slate-800/60 relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between hover:border-indigo-500/40 transition-all"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-extrabold text-xs text-white truncate">{currentWorkspace?.name || 'Workspace'}</span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-4 right-4 mt-2 p-2 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 space-y-1">
            <div className="text-[10px] font-extrabold text-slate-400 px-2 py-1 uppercase">Chọn Workspace</div>
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  onSwitchWorkspace(ws);
                  setIsDropdownOpen(false);
                }}
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
                  setIsDropdownOpen(false);
                  onCreateWorkspace();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold text-indigo-400 hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Tạo Workspace Mới
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Module Navigation Links */}
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

      {/* Sidebar Action Buttons & User Badge */}
      <div className="p-4 border-t border-slate-800/60 space-y-2">
        <button
          onClick={onAutoBankSync}
          disabled={isSyncingBank}
          className="w-full py-2 px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncingBank ? 'animate-spin' : ''}`} />
          <span>{isSyncingBank ? 'Đang Tự Trừ Số Dư...' : '⚡ Đồng Bộ Ngân Hàng Tự Động'}</span>
        </button>

        <button
          onClick={onOpenAddTxn}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Ghi Khoản Chi (+ Touch)</span>
        </button>

        {currentUser ? (
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <img
                src={currentUser.avatarUrl || 'https://lh3.googleusercontent.com/a/default-user'}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/30 shrink-0"
              />
              <span className="text-xs font-bold text-white truncate">{currentUser.name}</span>
            </div>
            <button onClick={onLogout} className="text-slate-400 hover:text-rose-400 p-1" title="Đăng xuất">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="w-full py-2 px-3 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
          >
            <User className="w-3.5 h-3.5" />
            <span>Đăng Nhập Google OAuth</span>
          </button>
        )}
      </div>
    </aside>
  );
};
