import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Sparkles, FolderPlus } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (dataUrl: string) => void;
  onOpenSamples: () => void;
  onOpenAIGenerator: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  onOpenSamples,
  onOpenAIGenerator,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageSelected(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto py-8">
      {/* Upload Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition cursor-pointer flex flex-col items-center justify-center gap-4 bg-zinc-900 shadow-2xl ${
          isDragging
            ? 'border-amber-500 bg-amber-500/10 scale-[1.01]'
            : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-md border border-amber-500/20">
          <Upload className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-bold text-zinc-100">
            修正したい画像をドラッグ＆ドロップ
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            またはクリックしてファイルを選択 (PNG, JPG, WebP 対応)
          </p>
        </div>

        <button
          type="button"
          className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl text-xs sm:text-sm font-bold transition shadow-md flex items-center gap-2 mt-2 border border-zinc-700"
        >
          <FolderPlus className="w-4 h-4 text-amber-500" />
          <span>パソコンから画像を選択</span>
        </button>
      </div>

      {/* Alternative Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={onOpenSamples}
          className="p-5 rounded-2xl bg-zinc-900 border border-zinc-850 hover:border-amber-500/30 hover:shadow-lg transition text-left flex items-start gap-4 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-100 group-hover:text-amber-400 transition">
              サンプル画像でお試し
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              風景・インテリア・カフェ・ペットなどのサンプル画像ですぐに部分修正を体験
            </p>
          </div>
        </button>

        <button
          onClick={onOpenAIGenerator}
          className="p-5 rounded-2xl bg-zinc-900 border border-zinc-850 hover:border-amber-500/30 hover:shadow-lg transition text-left flex items-start gap-4 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-100 group-hover:text-amber-400 transition">
              Gemini AI で新規画像を生成
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              テキストから新しい元画像を生成して、その一部をさらに修正・編集
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
