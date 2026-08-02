import React from 'react';
import { Sparkles, Image as ImageIcon, RefreshCw } from 'lucide-react';
import chicDarkIcon from '../assets/images/chic_dark_icon.svg';

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
    <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-zinc-800 shadow-md shadow-black/50 shrink-0 bg-zinc-950">
            <img
              src={chicDarkIcon}
              alt="Chic Dark Icon"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-100 leading-tight flex items-center gap-2">
              AI 一部分画像修正ツール
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-950 text-amber-400 font-semibold border border-amber-500/30">
                Inpainting Editor
              </span>
            </h1>
            <p className="text-xs text-zinc-400 hidden sm:block">
              画像の一部をブラシで囲んで指示するだけでピンポイントAI修正
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenSamples}
            className="px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition flex items-center gap-1.5 cursor-pointer border border-zinc-700/60"
            title="サンプル画像を選択"
          >
            <ImageIcon className="w-4 h-4 text-zinc-400" />
            <span className="hidden sm:inline">サンプル画像</span>
          </button>

          <button
            onClick={onOpenAIGenerator}
            className="px-3 py-1.5 text-xs sm:text-sm font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition flex items-center gap-1.5 border border-amber-500/30 cursor-pointer animate-pulse"
            title="プロンプトから新しい画像を生成"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">AIで新画像生成</span>
          </button>

          {hasImage && (
            <button
              onClick={onResetImage}
              className="px-3 py-1.5 text-xs sm:text-sm font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition flex items-center gap-1.5 border border-rose-500/30 cursor-pointer"
              title="画像をリセット"
            >
              <RefreshCw className="w-4 h-4 text-rose-400" />
              <span className="hidden md:inline">リセット</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
