import React from 'react';
import { History, Clock, ArrowRight, Trash2, RotateCcw } from 'lucide-react';
import { EditHistoryItem } from '../types';

interface HistorySidebarProps {
  history: EditHistoryItem[];
  onSelectHistoryItem: (item: EditHistoryItem) => void;
  onClearHistory: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  history,
  onSelectHistoryItem,
  onClearHistory,
}) => {
  if (history.length === 0) {
    return (
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 text-center text-zinc-400">
        <History className="w-8 h-8 mx-auto mb-2 opacity-50 text-amber-500" />
        <p className="text-xs font-medium text-zinc-200">編集履歴はまだありません</p>
        <p className="text-[11px] text-zinc-500 mt-1">
          部分修正を実行すると、修正前後がここに記録されます
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 shadow-lg flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-zinc-850 pb-2.5">
        <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
          <History className="w-4 h-4 text-amber-500" />
          <span>編集履歴 ({history.length})</span>
        </h3>
        <button
          onClick={onClearHistory}
          className="text-xs text-zinc-500 hover:text-rose-400 transition cursor-pointer flex items-center gap-1"
          title="履歴を全消去"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>消去</span>
        </button>
      </div>

      <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
        {history.map((item, index) => (
          <div
            key={item.id}
            onClick={() => onSelectHistoryItem(item)}
            className="group p-2.5 rounded-xl border border-zinc-850 hover:border-amber-500/30 hover:bg-zinc-950/60 transition cursor-pointer flex items-center gap-3"
          >
            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-zinc-950 shrink-0 border border-zinc-800">
              <img
                src={item.resultImage}
                alt="Revision result"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-0.5">
                <span className="font-bold text-amber-500">Step #{history.length - index}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-zinc-550" />
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-xs text-zinc-200 font-medium truncate" title={item.prompt}>
                {item.prompt || '部分修正'}
              </p>
              <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-950 text-zinc-400 font-medium border border-zinc-850">
                {item.mode === 'remove'
                  ? '削除'
                  : item.mode === 'replace'
                  ? '置換'
                  : item.mode === 'add'
                  ? '追加'
                  : '自由編集'}
              </span>
            </div>

            <div className="opacity-0 group-hover:opacity-100 transition text-amber-500 pr-1">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
