import React from 'react';
import { Sparkles, RefreshCw, User, Smartphone, Users } from 'lucide-react';
import { ModuleTab, Workspace, UserProfile } from '../types';

interface HeaderProps {
  activeTab: ModuleTab;
  currentWorkspace: Workspace;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onAutoBankSync: () => void;
  isSyncingBank: boolean;
  onOpenAddWorkspace: () => void;
  isInstalled: boolean;
  onInstallPWA: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  currentWorkspace,
  currentUser,
  onOpenAuth,
  onAutoBankSync,
  isSyncingBank,
  onOpenAddWorkspace,
  isInstalled,
  onInstallPWA,
}) => {
  return (
    <header className="h-14 md:h-16 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-2.5">
        <div className="md:hidden w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
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
        <button
          onClick={onAutoBankSync}
          disabled={isSyncingBank}
          className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 font-bold text-xs flex items-center gap-1.5 border border-emerald-500/30 active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncingBank ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">⚡ Trừ Số Dư Tự Động</span>
        </button>

        <button
          onClick={onOpenAddWorkspace}
          className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1.5"
        >
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          <span className="truncate max-w-[120px]">{currentWorkspace?.name || 'Workspace'}</span>
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
            onClick={onOpenAuth}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 active:scale-95 transition-all"
          >
            <User className="w-3.5 h-3.5" />
            <span>Google Auth</span>
          </button>
        )}

        {!isInstalled && (
          <button
            onClick={onInstallPWA}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-indigo-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 active:scale-95 transition-all"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cài PWA</span>
          </button>
        )}
      </div>
    </header>
  );
};
