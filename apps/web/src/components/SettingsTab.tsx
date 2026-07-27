import React, { useState } from 'react';
import { Workspace, WorkspaceMember, UserProfile } from '../types';
import { Sliders, Users, Mail, Send, User, Shield, Briefcase, Plus, CheckCircle2, LogOut } from 'lucide-react';

interface SettingsTabProps {
  currentUser: UserProfile | null;
  workspaces: Workspace[];
  currentWorkspace: Workspace;
  members: WorkspaceMember[];
  onSwitchWorkspace: (ws: Workspace) => void;
  onCreateWorkspace: () => void;
  onSaveWorkspaceSettings: (settings: { name: string; currency: string; timezone: string; reminderHour: string }) => void;
  onInviteMember: (email: string) => void;
  onLogout: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  currentUser,
  workspaces,
  currentWorkspace,
  members,
  onSwitchWorkspace,
  onCreateWorkspace,
  onSaveWorkspaceSettings,
  onInviteMember,
  onLogout,
}) => {
  const [wsName, setWsName] = useState(currentWorkspace?.name || '');
  const [wsCurrency, setWsCurrency] = useState(currentWorkspace?.baseCurrency || 'VND');
  const [wsTimezone, setWsTimezone] = useState(currentWorkspace?.timezone || 'Asia/Ho_Chi_Minh');
  const [wsReminderHour, setWsReminderHour] = useState('8');
  const [inviteEmail, setInviteEmail] = useState('');

  const handleSubmitSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveWorkspaceSettings({
      name: wsName,
      currency: wsCurrency,
      timezone: wsTimezone,
      reminderHour: wsReminderHour,
    });
  };

  const handleSubmitInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    onInviteMember(inviteEmail);
    setInviteEmail('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* 1. USER ACCOUNT PROFILE MANAGEMENT CARD */}
      <div className="glass-panel p-6 rounded-2xl space-y-4 border border-indigo-500/30">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg">
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt="Avatar"
                  className="w-12 h-12 rounded-xl object-cover"
                  style={{ width: '48px', height: '48px', minWidth: '48px', minHeight: '48px', maxWidth: '48px', maxHeight: '48px', borderRadius: '12px', objectFit: 'cover' }}
                  onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                />
              ) : (
                currentUser?.name?.charAt(0) || 'U'
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                {currentUser?.name || 'Nguyễn Văn Lành'}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Xác Thực Google
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{currentUser?.email || 'it.nguyenlanh@gmail.com'}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Đăng Xuất
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Tài Khoản Đăng Nhập</p>
            <p className="text-xs font-bold text-white mt-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-indigo-400" /> {currentUser?.email || 'it.nguyenlanh@gmail.com'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Loại Xác Thực</p>
            <p className="text-xs font-bold text-white mt-1 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> Google OAuth 2.0
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Số Lượng Workspace</p>
            <p className="text-xs font-bold text-white mt-1 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-purple-400" /> {workspaces.length} Ví/Workspace
            </p>
          </div>
        </div>
      </div>

      {/* 2. MULTI-WORKSPACE MANAGEMENT CARD */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-extrabold text-white text-base flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-400" />
            Danh Sách Workspace Của Tài Khoản ({workspaces.length})
          </h3>
          <button
            onClick={onCreateWorkspace}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-md"
          >
            <Plus className="w-3.5 h-3.5" /> Tạo Workspace Mới
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {workspaces.map((ws) => {
            const isActive = ws.id === currentWorkspace.id;
            return (
              <div
                key={ws.id}
                onClick={() => onSwitchWorkspace(ws)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-indigo-950/60 border-indigo-500/80 shadow-lg ring-2 ring-indigo-500/20'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-sm text-white">{ws.name}</span>
                  {isActive && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Tiền tệ: {ws.baseCurrency || 'VND'}</span>
                  <span className="capitalize">{ws.type || 'Personal'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. WORKSPACE SETTINGS FORM */}
      <div className="glass-panel p-6 rounded-2xl space-y-5">
        <h3 className="text-lg font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sliders className="w-5 h-5 text-indigo-400" />
          Cấu Hình Chi Tiết Cho Workspace: <span className="text-indigo-300">{currentWorkspace?.name}</span>
        </h3>

        <form onSubmit={handleSubmitSettings} className="space-y-4">
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
              Lưu Cấu Hình Workspace Này
            </button>
          </div>
        </form>
      </div>

      {/* 4. WORKSPACE MEMBERS & INVITATIONS FORM */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-extrabold text-white text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Thành Viên Trong Workspace "{currentWorkspace?.name}" ({members.length})
          </h3>
        </div>

        <form onSubmit={handleSubmitInvite} className="flex gap-2">
          <input
            type="email"
            placeholder="Mời thành viên qua email (ví dụ: vo.nguyenlanh@gmail.com)..."
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold"
          />
          <button type="submit" className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md">
            <Send className="w-3.5 h-3.5" /> Gửi Lời Mời
          </button>
        </form>

        <div className="space-y-2 pt-2">
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
  );
};
