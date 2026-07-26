import React from 'react';
import { Asset } from '../types';
import { Plus, Wrench, Trash2 } from 'lucide-react';

interface AssetsTabProps {
  assets: Asset[];
  onOpenAddAsset: () => void;
  onDeleteAsset: (id: string) => void;
}

export const AssetsTab: React.FC<AssetsTabProps> = ({
  assets,
  onOpenAddAsset,
  onDeleteAsset,
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold text-white">Quản Lý Thiết Bị & Lịch Bảo Trì</h3>
        <button
          onClick={onOpenAddAsset}
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
              <button onClick={() => onDeleteAsset(ast.id)} className="text-slate-500 hover:text-rose-400 p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-400 space-y-1 font-medium">
              <p>Danh mục: <strong className="text-slate-200">{ast.category}</strong></p>
              <p>Vị trí: <strong className="text-slate-200">{ast.location || 'Nhà riêng'}</strong></p>
              <p>Hạn bảo hành: <strong className="text-amber-400 font-bold">{ast.warrantyUntil || '2027'}</strong></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
