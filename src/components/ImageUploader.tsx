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
        className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition cursor-pointer flex flex-col items-center justify-center gap-4 bg-white shadow-xs ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
            : 'border-stone-300 hover:border-stone-400 hover:bg-stone-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
          <Upload className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-bold text-stone-900">
            修正したい画像をドラッグ＆ドロップ
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            またはクリックしてファイルを選択 (PNG, JPG, WebP 対応)
          </p>
        </div>

        <button
          type="button"
          className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs flex items-center gap-2 mt-2"
        >
          <FolderPlus className="w-4 h-4" />
          <span>パソコンから画像を選択</span>
        </button>
      </div>

      {/* Alternative Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={onOpenSamples}
          className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-indigo-300 hover:shadow-md transition text-left flex items-start gap-4 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900 group-hover:text-indigo-600 transition">
              サンプル画像でお試し
            </h4>
            <p className="text-xs text-stone-500 mt-1">
              風景・インテリア・カフェ・ペットなどのサンプル画像ですぐに部分修正を体験
            </p>
          </div>
        </button>

        <button
          onClick={onOpenAIGenerator}
          className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-indigo-300 hover:shadow-md transition text-left flex items-start gap-4 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900 group-hover:text-indigo-600 transition">
              Gemini AI で新規画像を生成
            </h4>
            <p className="text-xs text-stone-500 mt-1">
              テキストから新しい元画像を生成して、その一部をさらに修正・編集
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
