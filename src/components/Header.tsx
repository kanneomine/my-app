import React from 'react';
import { Sparkles, Image as ImageIcon, RefreshCw, Sparkle } from 'lucide-react';

interface HeaderProps {
  onOpenSamples: () => void;
  onOpenAIGenerator: () => void;
  onResetImage: () => void;
  hasImage: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSamples,
  onOpenAIGenerator,
  onResetImage,
  hasImage,
}) => {
  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Instant-load CSS-based Glossy Green Marble Emblem */}
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-emerald-700/30 shadow-md shadow-emerald-900/10 shrink-0 bg-gradient-to-tr from-emerald-900 via-emerald-700 to-teal-500 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent pointer-events-none" />
            <Sparkle className="w-5 h-5 text-emerald-100 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-stone-900 leading-tight flex items-center gap-2">
              AI 一部分画像修正ツール
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                Inpainting Editor
              </span>
            </h1>
            <p className="text-xs text-stone-500 hidden sm:block">
              画像の一部をブラシで囲んで指示するだけでピンポイントAI修正
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenSamples}
            className="px-3 py-1.5 text-xs sm:text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            title="サンプル画像を選択"
          >
            <ImageIcon className="w-4 h-4 text-stone-600" />
            <span className="hidden sm:inline">サンプル画像</span>
          </button>

          <button
            onClick={onOpenAIGenerator}
            className="px-3 py-1.5 text-xs sm:text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition flex items-center gap-1.5 border border-indigo-200/60 cursor-pointer"
            title="プロンプトから新しい画像を生成"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">AIで新画像生成</span>
          </button>

          {hasImage && (
            <button
              onClick={onResetImage}
              className="px-3 py-1.5 text-xs sm:text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition flex items-center gap-1.5 border border-rose-200/60 cursor-pointer"
              title="画像をリセット"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden md:inline">リセット</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
