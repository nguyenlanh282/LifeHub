import React from 'react';
import { Task, Wallet, Asset, Workspace } from '../types';
import { Check, Trash2, TrendingDown, Wrench, Building2 } from 'lucide-react';

interface DashboardTabProps {
  dashboardData: any;
  tasks: Task[];
  wallets: Wallet[];
  assets: Asset[];
  currentWorkspace: Workspace;
  onOpenAddTask: () => void;
  onToggleTask: (id: string, status: string) => void;
  onDeleteTask: (id: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  dashboardData,
  tasks,
  wallets,
  assets,
  currentWorkspace,
  onOpenAddTask,
  onToggleTask,
  onDeleteTask,
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 4 Summary Stat Cards */}
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
          <div className="text-xs text-indigo-300 font-bold mt-1">Lịch lặp RRULE active</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-[11px] font-extrabold uppercase text-slate-400">Lịch Bảo Trì Xe</span>
          <div className="text-2xl font-black text-amber-400 mt-2">{assets.length} Thiết bị</div>
          <div className="text-xs text-amber-300 font-bold mt-1">Hạn thay nhớt 05/08</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-[11px] font-extrabold uppercase text-slate-400">Ví Ngân Hàng (Tự Trừ Số Dư)</span>
          <div className="text-2xl font-black text-emerald-400 mt-2">{wallets.length} Ví Active</div>
          <div className="text-xs text-emerald-300 font-bold mt-1">🟢 Đã bật Tự động đồng bộ số dư</div>
        </div>
      </div>

      {/* SVG Budget Ring & Active Tasks Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center space-y-3">
          <h4 className="font-extrabold text-white text-sm">Tỷ Lệ Tiêu Dùng Ngân Sách</h4>
          <div className="relative w-40 h-40 flex items-center justify-center">
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
                strokeDasharray="42.5, 100"
                strokeWidth="3.8"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-white">42.5%</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Đã sử dụng</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 text-center font-medium">Chi tiêu an toàn dưới 50% hạn mức tháng này.</p>
        </div>

        <div className="md:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-white text-base">Công Việc Ưu Tiên Cần Làm</h3>
            <button onClick={onOpenAddTask} className="text-xs font-bold text-indigo-400 hover:underline">
              + Thêm Việc Mới
            </button>
          </div>

          <div className="space-y-2.5">
            {tasks.map((t) => (
              <div key={t.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggleTask(t.id, t.status)}
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
                <button onClick={() => onDeleteTask(t.id)} className="text-slate-500 hover:text-rose-400 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
