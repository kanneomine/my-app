import React from 'react';
import { X, Image as ImageIcon, Sparkles, Check } from 'lucide-react';
import { SAMPLE_IMAGES } from '../data/sampleImages';
import { SampleImage } from '../types';

interface SampleImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sample: SampleImage) => void;
}

export const SampleImageGalleryModal: React.FC<SampleImageGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-850 max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh] text-zinc-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-850">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-zinc-100">
              サンプル画像で部分修正をお試し
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-850 text-zinc-400 hover:text-zinc-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Samples Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 overflow-y-auto">
          {SAMPLE_IMAGES.map((sample) => (
            <div
              key={sample.id}
              onClick={() => {
                onSelectSample(sample);
                onClose();
              }}
              className="group border border-zinc-800 hover:border-amber-500/50 rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer flex flex-col bg-zinc-950"
            >
              <div className="relative aspect-video overflow-hidden bg-zinc-900">
                <img
                  src={sample.url}
                  alt={sample.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-2 left-2 bg-zinc-900/95 backdrop-blur-xs text-zinc-100 text-[11px] px-2 py-0.5 rounded-md font-medium border border-zinc-800/60">
                  {sample.category}
                </span>
              </div>

              <div className="p-3 flex flex-col gap-1">
                <h4 className="text-sm font-bold text-zinc-100 group-hover:text-amber-400 transition">
                  {sample.title}
                </h4>
                <p className="text-xs text-zinc-400 line-clamp-2">{sample.description}</p>
                <div className="mt-2 text-[11px] bg-amber-500/10 text-amber-400 p-2 rounded-lg font-medium border border-amber-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="truncate">おすすめ: "{sample.suggestedPrompt}"</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-zinc-850 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 transition cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
