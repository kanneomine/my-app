import React from 'react';
import {
  Wand2,
  Sparkles,
  PlusCircle,
  Replace,
  Eraser,
  SunMedium,
  Zap,
  ShieldCheck,
  MessageSquareText,
  AlertCircle,
  Sun,
  Moon,
  Flame,
  Lamp,
  Camera,
  Aperture,
  Palette,
  SlidersHorizontal,
} from 'lucide-react';
import { EditMode } from '../types';

interface PromptControlsProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  mode: EditMode;
  onModeChange: (mode: EditMode) => void;
  onSubmit: () => void;
  isLoading: boolean;
  hasMask: boolean;
  hasImage: boolean;
  error: string | null;
}

export const PromptControls: React.FC<PromptControlsProps> = ({
  prompt,
  onPromptChange,
  mode,
  onModeChange,
  onSubmit,
  isLoading,
  hasMask,
  hasImage,
  error,
}) => {
  // Frequently requested classic AI prompt chips
  const QUICK_CHIP_PROMPTS = [
    {
      id: 'brighten',
      icon: Sun,
      label: '☀️ 明るくする',
      text: '構図や描写はそのまま維持し、画像全体をより明るく自然で爽やかな光のバランスに調整してください',
      mode: 'lighting' as EditMode,
      color: 'hover:bg-amber-50 hover:text-amber-800 border-amber-200 text-amber-900 bg-amber-50/60',
    },
    {
      id: 'enhance_quality',
      icon: Sparkles,
      label: '✨ 画質を向上させる',
      text: '構図や色彩は維持し、全体の解像感を高めて細部まで輪郭をくっきりと高画質化してください',
      mode: 'enhance' as EditMode,
      color: 'hover:bg-purple-50 hover:text-purple-800 border-purple-200 text-purple-900 bg-purple-50/60',
    },
    {
      id: 'blur_bg',
      icon: Aperture,
      label: '📷 背景をぼかす',
      text: '主要な被写体をくっきり残し、背景部分を一眼レフカメラのポートレート機能のように自然にぼかしてください',
      mode: 'edit' as EditMode,
      color: 'hover:bg-indigo-50 hover:text-indigo-800 border-indigo-200 text-indigo-900 bg-indigo-50/60',
    },
    {
      id: 'remove_obj',
      icon: Eraser,
      label: '🗑️ 不要な物を消去',
      text: '選択した不要な物体や通行人を完全に消去し、周囲の背景となじませて補元してください',
      mode: 'remove' as EditMode,
      color: 'hover:bg-rose-50 hover:text-rose-800 border-rose-200 text-rose-900 bg-rose-50/60',
    },
    {
      id: 'vibrant_color',
      icon: Palette,
      label: '🎨 色鮮やかに補正',
      text: '構図や被写体は維持し、白とび・黒つぶれを抑え、発色が美しくメリハリのある色彩に調整してください',
      mode: 'enhance' as EditMode,
      color: 'hover:bg-emerald-50 hover:text-emerald-800 border-emerald-200 text-emerald-900 bg-emerald-50/60',
    },
    {
      id: 'denoise',
      icon: Wand2,
      label: '🧹 ノイズ除去',
      text: '画像のザラつきやデジタルノイズを除去し、滑らかでクリアな高品位画質に補正してください',
      mode: 'enhance' as EditMode,
      color: 'hover:bg-sky-50 hover:text-sky-800 border-sky-200 text-sky-900 bg-sky-50/60',
    },
  ];

  const LIGHTING_PRESETS = [
    {
      id: 'day',
      label: '☀️ 昼間・自然光',
      text: '構図や物体は一切変更せず、明るい自然な太陽光が全体に差し込む爽やかな昼間のライティングに変更してください',
      icon: Sun,
    },
    {
      id: 'night',
      label: '🌙 夜間・ナイトムード',
      text: '構図や物体は一切変更せず、しっとりとした落ち着いた夜間・月光の雰囲気にライティングを変更してください',
      icon: Moon,
    },
    {
      id: 'sunset',
      label: '🌅 夕暮れ・サンセット',
      text: '構図や物体は一切変更せず、暖かみのあるオレンジ色の夕焼け・サンセットの情緒あるライティングに変更してください',
      icon: Flame,
    },
    {
      id: 'indirect',
      label: '🕯️ 間接照明・ウォーム',
      text: '構図や物体は一切変更せず、お洒落で温かい間接照明・ウォームカラーのスタンドランプの明かりに調整してください',
      icon: Lamp,
    },
    {
      id: 'studio',
      label: '💡 スタジオ照明',
      text: '構図や物体は一切変更せず、被写体が引き立つクリアで上品なスタジオスポットライトにライティングを調整してください',
      icon: Camera,
    },
    {
      id: 'neon',
      label: '🌆 ネオン・サイバーパンク',
      text: '構図や物体は一切変更せず、幻想的なネオンカラーのサイバーパンク風ライティングに調整してください',
      icon: Zap,
    },
  ];

  const ENHANCE_PRESETS = [
    {
      id: 'sharp',
      label: '🔍 超高画質・クッキリ化',
      text: '構図や色合い・内容は一切変更せず、画像全体の解像感と細部ディテールを高め、輪郭をクッキリ鮮明に補正してください',
    },
    {
      id: 'noise',
      label: '🧹 デジタルノイズ除去',
      text: '構図や内容は一切変更せず、画像のザラつきやデジタルノイズを除去し、なめらかで綺麗な高品位画質に補正してください',
    },
    {
      id: 'contrast',
      label: '🎨 メリハリ・色彩最適化',
      text: '構図や内容は一切変更せず、白とびや黒つぶれを抑え、色鮮やかでメリハリのある美しい質感にバランス調整してください',
    },
    {
      id: 'dslr',
      label: '📸 一眼レフ風テクスチャ強調',
      text: '構図や内容は一切変更せず、高品質一眼レフで撮影したようなプロ仕様の細部質感と立体感を創出してください',
    },
  ];

  const handleChipClick = (chip: typeof QUICK_CHIP_PROMPTS[0]) => {
    onPromptChange(chip.text);
    onModeChange(chip.mode);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex flex-col gap-5">
      {/* Non-Destructive Protection Banner */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-stone-700 font-medium">
          <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
          <span>
            <strong>元画像100%保持設計:</strong> 未選択エリアのピクセルや被写体の配置は一切変更されません
          </span>
        </div>
        <span className="text-[11px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold shrink-0 hidden sm:inline">
          完全非破壊保証
        </span>
      </div>

      {/* Quick Preset Chips (定番プロンプト ワンタップ挿入) */}
      <div className="bg-gradient-to-r from-stone-50 via-indigo-50/30 to-purple-50/30 border border-stone-200 rounded-xl p-3.5 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            定番プロンプト (ワンタップで入力)
          </label>
          <span className="text-[11px] text-stone-500 hidden sm:inline">
            ボタンをタップすると指示文とモードが自動設定されます
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {QUICK_CHIP_PROMPTS.map((chip) => {
            const isSelected = prompt === chip.text;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleChipClick(chip)}
                className={`text-xs px-3 py-1.5 rounded-xl border font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : `bg-white ${chip.color}`
                }`}
              >
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Edit Mode Tabs */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 block">
          機能モードを選択
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          <button
            type="button"
            onClick={() => onModeChange('remove')}
            className={`p-2.5 rounded-xl border text-left flex flex-col gap-0.5 transition cursor-pointer ${
              mode === 'remove'
                ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-xs ring-1 ring-rose-500'
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <Eraser className="w-3.5 h-3.5 text-rose-600" />
              <span>消去</span>
            </div>
            <p className="text-[10px] text-stone-500 leading-tight">背景同化</p>
          </button>

          <button
            type="button"
            onClick={() => onModeChange('replace')}
            className={`p-2.5 rounded-xl border text-left flex flex-col gap-0.5 transition cursor-pointer ${
              mode === 'replace'
                ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-xs ring-1 ring-amber-500'
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <Replace className="w-3.5 h-3.5 text-amber-600" />
              <span>置き換え</span>
            </div>
            <p className="text-[10px] text-stone-500 leading-tight">別物体に差替</p>
          </button>

          <button
            type="button"
            onClick={() => onModeChange('add')}
            className={`p-2.5 rounded-xl border text-left flex flex-col gap-0.5 transition cursor-pointer ${
              mode === 'add'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs ring-1 ring-emerald-500'
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>要素追加</span>
            </div>
            <p className="text-[10px] text-stone-500 leading-tight">新しい物を追加</p>
          </button>

          <button
            type="button"
            onClick={() => onModeChange('lighting')}
            className={`p-2.5 rounded-xl border text-left flex flex-col gap-0.5 transition cursor-pointer ${
              mode === 'lighting'
                ? 'bg-sky-50 border-sky-500 text-sky-900 shadow-xs ring-1 ring-sky-500'
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <SunMedium className="w-3.5 h-3.5 text-sky-600" />
              <span>ライト調節</span>
            </div>
            <p className="text-[10px] text-stone-500 leading-tight">昼・夜・間接光</p>
          </button>

          <button
            type="button"
            onClick={() => onModeChange('enhance')}
            className={`p-2.5 rounded-xl border text-left flex flex-col gap-0.5 transition cursor-pointer ${
              mode === 'enhance'
                ? 'bg-purple-50 border-purple-500 text-purple-900 shadow-xs ring-1 ring-purple-500'
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>画質向上</span>
            </div>
            <p className="text-[10px] text-stone-500 leading-tight">超解像・鮮明化</p>
          </button>
        </div>
      </div>

      {/* Mode-Specific Presets Panel */}
      {mode === 'lighting' && (
        <div className="bg-sky-50/60 border border-sky-200 rounded-xl p-3.5 flex flex-col gap-2">
          <label className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
            <SunMedium className="w-4 h-4 text-sky-600" />
            照明・ライティングのワンタップ切替
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LIGHTING_PRESETS.map((preset) => {
              const isSelected = prompt === preset.text;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onPromptChange(preset.text)}
                  className={`p-2 rounded-lg text-left text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95 border ${
                    isSelected
                      ? 'bg-sky-600 text-white border-sky-600 shadow-md ring-1 ring-sky-500'
                      : 'bg-white hover:bg-sky-100/80 border-sky-200 text-stone-800'
                  }`}
                >
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-sky-700 mt-0.5">
            ※ 対象物の選択がない場合は画像全体の光を調整し、部分選択した場合はその場所の光を重点的に調整します。
          </p>
        </div>
      )}

      {mode === 'enhance' && (
        <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-3.5 flex flex-col gap-2">
          <label className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-600" />
            画質向上・クッキリ鮮明化プリセット
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ENHANCE_PRESETS.map((preset) => {
              const isSelected = prompt === preset.text;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onPromptChange(preset.text)}
                  className={`p-2 rounded-lg text-left text-xs font-bold transition cursor-pointer shadow-2xs active:scale-95 border ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md ring-1 ring-purple-500'
                      : 'bg-white hover:bg-purple-100/80 border-purple-200 text-stone-800'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Text Prompt Input */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
            <MessageSquareText className="w-4 h-4 text-stone-500" />
            AI 修正指示プロンプト
          </label>
          <span className="text-[11px] text-stone-400">具体的に入力すると精度が高まります</span>
        </div>

        <div className="relative">
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder={
              mode === 'lighting'
                ? '例: 暖かみのある間接照明と優しいランプの明かりに調整してください（元の画像は一切変更なし）。'
                : mode === 'enhance'
                ? '例: 全体の解像感を高め、輪郭をくっきりと鮮明に高画質化してください（元画像はそのまま保持）。'
                : mode === 'remove'
                ? '例: 選択した電柱と電線を消去して、後ろの空と雲をきれいに埋めてください。'
                : mode === 'replace'
                ? '例: 選択したマグカップを、湯気が立つ白い磁器製ティーカップに置き換えてください。'
                : mode === 'add'
                ? '例: 選択した場所に、鮮やかな赤と黄色のチューリップの花束を追加してください。'
                : '例: 選択したエリアを修正します。「背景をぼかす」「明るくする」など希望を入力してください。'
            }
            className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-stone-50/50 text-stone-900 placeholder:text-stone-400 resize-none"
          />
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isLoading || !hasImage}
        className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white shadow-md transition flex items-center justify-center gap-2 cursor-pointer ${
          isLoading || !hasImage
            ? 'bg-stone-300 cursor-not-allowed shadow-none'
            : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:opacity-95 shadow-indigo-200 active:scale-[0.99]'
        }`}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Gemini AI で画質保持修正を実行中...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>AIで選択部分・ライト・画質を修正実行</span>
          </>
        )}
      </button>
    </div>
  );
};
