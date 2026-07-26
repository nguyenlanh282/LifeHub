import React, { useState } from 'react';
import { Workspace, WorkspaceMember } from '../types';
import { Sliders, Users, Mail, Send } from 'lucide-react';

interface SettingsTabProps {
  currentWorkspace: Workspace;
  members: WorkspaceMember[];
  onSaveWorkspaceSettings: (settings: { name: string; currency: string; timezone: string; reminderHour: string }) => void;
  onInviteMember: (email: string) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  currentWorkspace,
  members,
  onSaveWorkspaceSettings,
  onInviteMember,
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Workspace Settings Form */}
      <div className="glass-panel p-6 rounded-2xl space-y-5">
        <h3 className="text-lg font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sliders className="w-5 h-5 text-indigo-400" />
          Cấu Hình Workspace Hiện Tại ({currentWorkspace?.name})
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
              Lưu Cấu Hình Workspace
            </button>
          </div>
        </form>
      </div>

      {/* Members & Family Invitations Form */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-extrabold text-white text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Thành Viên Trong Workspace ({members.length})
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
