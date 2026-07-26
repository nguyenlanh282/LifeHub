import React from 'react';
import { Note } from '../types';
import { Plus, FileText, Trash2 } from 'lucide-react';

interface DailyTabProps {
  notes: Note[];
  onOpenAddNote: () => void;
  onDeleteNote: (id: string) => void;
}

export const DailyTab: React.FC<DailyTabProps> = ({
  notes,
  onOpenAddNote,
  onDeleteNote,
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold text-white">Ghi Chú Sổ Tay & Thói Quen Hằng Ngày</h3>
        <button
          onClick={onOpenAddNote}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" /> Tạo Ghi Chú
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notes.map((n) => (
          <div key={n.id} className="glass-panel p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-extrabold text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" /> {n.title}
              </span>
              <button onClick={() => onDeleteNote(n.id)} className="text-slate-500 hover:text-rose-400 p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800 font-mono">
              {n.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
