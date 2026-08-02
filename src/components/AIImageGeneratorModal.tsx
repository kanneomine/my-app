import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, Wand2 } from 'lucide-react';
import { safeFetchJson } from '../utils/imageUtils';

interface AIImageGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGeneratedImage: (imageUrl: string) => void;
}

export const AIImageGeneratorModal: React.FC<AIImageGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGeneratedImage,
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('プロンプトを入力してください。');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await safeFetchJson('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio }),
      });

      onGeneratedImage(data.imageUrl);
      onClose();
    } catch (err: any) {
      console.error('Image generation failed', err);
      setError(err.message || 'AI画像生成中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const PRESET_IDEAS = [
    '静かな海辺のカフェのテラス、木製デスクとコーヒーカップ、明るい日光',
    'モダンでシンプルな北欧風リビングルーム、白い壁と観葉植物',
    '緑豊かな公園の芝生の上にある木製のピクニックベンチ',
    '美味しそうな手作りケーキと苺のデザートプレート',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-stone-200 max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-stone-900">
              Gemini AI で新規元画像を生成
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prompt Input */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 block">
            どんな画像を生成しますか？
          </label>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="例: 明るい日の光が差し込むシンプルな部屋のデスク、PCと観葉植物"
            className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-stone-50 text-stone-900 resize-none"
          />

          {/* Quick Idea Chips */}
          <div className="mt-2 flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-stone-400">アイデア例:</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_IDEAS.map((idea, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(idea)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer text-left truncate max-w-full"
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Aspect Ratio */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 block">
            アスペクト比
          </label>
          <div className="flex gap-2">
            {[
              { label: '1:1 正方形', value: '1:1' },
              { label: '4:3 標準', value: '4:3' },
              { label: '16:9 ワイド', value: '16:9' },
              { label: '3:4 縦長', value: '3:4' },
            ].map((ar) => (
              <button
                key={ar.value}
                type="button"
                onClick={() => setAspectRatio(ar.value)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
                  aspectRatio === ar.value
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {ar.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition cursor-pointer"
          >
            キャンセル
          </button>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition flex items-center gap-2 cursor-pointer ${
              isLoading || !prompt.trim()
                ? 'bg-stone-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>生成中...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>画像を新規生成</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
