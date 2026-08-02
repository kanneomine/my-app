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
      <div className="bg-white rounded-2xl border border-stone-200 p-5 text-center text-stone-400">
        <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-xs font-medium">編集履歴はまだありません</p>
        <p className="text-[11px] text-stone-400 mt-1">
          部分修正を実行すると、修正前後がここに記録されます
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
          <History className="w-4 h-4 text-indigo-600" />
          <span>編集履歴 ({history.length})</span>
        </h3>
        <button
          onClick={onClearHistory}
          className="text-xs text-stone-400 hover:text-rose-600 transition cursor-pointer flex items-center gap-1"
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
            className="group p-2.5 rounded-xl border border-stone-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition cursor-pointer flex items-center gap-3"
          >
            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-stone-900 shrink-0 border border-stone-200">
              <img
                src={item.resultImage}
                alt="Revision result"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[11px] text-stone-400 mb-0.5">
                <span className="font-bold text-stone-600">Step #{history.length - index}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-xs text-stone-800 font-medium truncate" title={item.prompt}>
                {item.prompt || '部分修正'}
              </p>
              <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium">
                {item.mode === 'remove'
                  ? '削除'
                  : item.mode === 'replace'
                  ? '置換'
                  : item.mode === 'add'
                  ? '追加'
                  : '自由編集'}
              </span>
            </div>

            <div className="opacity-0 group-hover:opacity-100 transition text-indigo-600 pr-1">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
