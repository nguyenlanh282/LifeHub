import React from 'react';
import { Transaction, Wallet } from '../types';
import {
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Camera,
  QrCode,
  Plus,
  Building2,
  Zap,
  Trash2
} from 'lucide-react';

interface FinanceTabProps {
  transactions: Transaction[];
  wallets: Wallet[];
  isSyncingBank: boolean;
  onAutoBankSync: () => void;
  onOpenReceiptUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenVietQR: () => void;
  onOpenAddTxn: () => void;
  onOpenAddWallet: () => void;
  onDeleteTxn: (id: string) => void;
}

export const FinanceTab: React.FC<FinanceTabProps> = ({
  transactions,
  wallets,
  isSyncingBank,
  onAutoBankSync,
  onOpenReceiptUpload,
  onOpenVietQR,
  onOpenAddTxn,
  onOpenAddWallet,
  onDeleteTxn,
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-extrabold text-white">Quản Lý Giao Dịch & Kết Nối Tự Động Ngân Hàng</h3>
          <p className="text-xs text-slate-400">Tự động trừ/cộng số dư ví ngân hàng khi phát sinh khoản chi hoặc đồng bộ qua Webhook.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onAutoBankSync}
            disabled={isSyncingBank}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncingBank ? 'animate-spin' : ''}`} />
            <span>⚡ Đồng Bộ MB/VCB Tự Động</span>
          </button>

          <label className="cursor-pointer px-3 py-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 hover:bg-purple-600/30">
            <Camera className="w-4 h-4" /> Up Ảnh Hóa Đơn
            <input type="file" accept="image/*" className="hidden" onChange={onOpenReceiptUpload} />
          </label>

          <button
            onClick={onOpenVietQR}
            className="px-3 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
          >
            <QrCode className="w-4 h-4" /> Tạo VietQR
          </button>

          <button
            onClick={onOpenAddTxn}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" /> Nhập Giao Dịch
          </button>
        </div>
      </div>

      {/* Wallets List Section */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" /> Số Dư Ví Ngân Hàng (Tự Động Cập Nhật)
          </h4>
          <button onClick={onOpenAddWallet} className="text-xs font-bold text-indigo-400 hover:underline">
            + Thêm Ví Ngân Hàng
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {wallets.map((w) => (
            <div key={w.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-black rounded-bl-lg border-b border-l border-emerald-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" /> TỰ TRỪ SỐ DƯ
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-slate-300">{w.name}</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  {w.type}
                </span>
              </div>
              <div className="text-xl font-black text-white pt-1">
                {(w.openingBalanceMinor || 0).toLocaleString('vi-VN')} ₫
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Tự động trừ khi phát sinh khoản chi</p>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions Table Section */}
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
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400 font-medium">{txn.occurredOn} • Ví Ngân Hàng</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      ✓ Đã tự trừ số dư
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`font-black text-sm ${txn.type === 'expense' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {txn.type === 'expense' ? '-' : '+'}{(txn.amountMinor || 0).toLocaleString('vi-VN')} ₫
                </span>
                <button onClick={() => onDeleteTxn(txn.id)} className="text-slate-500 hover:text-rose-400 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
