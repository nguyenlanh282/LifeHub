import React, { useState } from 'react';
import { Task } from '../types';
import { Plus, Check, Trash2 } from 'lucide-react';

interface TasksTabProps {
  tasks: Task[];
  onOpenAddTask: () => void;
  onToggleTask: (id: string, status: string) => void;
  onDeleteTask: (id: string) => void;
}

export const TasksTab: React.FC<TasksTabProps> = ({
  tasks,
  onOpenAddTask,
  onToggleTask,
  onDeleteTask,
}) => {
  const [taskFilter, setTaskFilter] = useState<'all' | 'recurring' | 'due' | 'done'>('all');

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'recurring') return !!t.rrule;
    if (taskFilter === 'done') return t.status === 'done';
    if (taskFilter === 'due') return t.status !== 'done';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="text-lg font-extrabold text-white">Quản Lý Công Việc & Lịch Tái Diễn (RRULE)</h3>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setTaskFilter('all')}
              className={`px-3 py-1 rounded-lg ${taskFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              Tất cả ({tasks.length})
            </button>
            <button
              onClick={() => setTaskFilter('recurring')}
              className={`px-3 py-1 rounded-lg ${taskFilter === 'recurring' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              Lịch lặp
            </button>
            <button
              onClick={() => setTaskFilter('done')}
              className={`px-3 py-1 rounded-lg ${taskFilter === 'done' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              Đã xong
            </button>
          </div>

          <button
            onClick={onOpenAddTask}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" /> Thêm Việc Mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.map((t) => (
          <div key={t.id} className="glass-panel p-5 rounded-2xl space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleTask(t.id, t.status)}
                  className={`w-6 h-6 rounded border flex items-center justify-center ${
                    t.status === 'done' ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-700'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </button>
                <h4 className={`font-bold text-base ${t.status === 'done' ? 'line-through text-slate-500' : 'text-white'}`}>
                  {t.title}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-400">
                  {t.priority || 'normal'}
                </span>
                <button onClick={() => onDeleteTask(t.id)} className="text-slate-500 hover:text-rose-400 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {t.description && <p className="text-xs text-slate-400 pl-9">{t.description}</p>}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 pl-9 font-medium">
              <span>Lặp: {t.rrule || 'Một lần'}</span>
              <span>Hạn: {t.dueOn}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
