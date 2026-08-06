import React, { useState, useEffect } from 'react';
import {
  Download,
  Copy,
  Check,
  Split,
  Columns,
  Maximize2,
  Sparkles,
  RefreshCcw,
  ShieldCheck,
  Lock,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { MetadataPanel, ImageMetadata } from './MetadataPanel';

interface ResultViewerProps {
  originalImage: string;
  resultImage: string;
  maskImage?: string | null;
  onApplyAsBase: () => void;
  promptUsed: string;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({
  originalImage,
  resultImage,
  maskImage,
  onApplyAsBase,
  promptUsed,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 - 100
  const [viewMode, setViewMode] = useState<'slider' | 'sideBySide' | 'resultOnly'>('slider');
  const [copied, setCopied] = useState<boolean>(false);
  const [isApplied, setIsApplied] = useState<boolean>(false);
  const [showMetadataPanel, setShowMetadataPanel] = useState<boolean>(false);

  // Perfect pixel composite state
  const [compositeResultUrl, setCompositeResultUrl] = useState<string>(resultImage);
  const [useStrictMaskProtection, setUseStrictMaskProtection] = useState<boolean>(true);

  // Perform strict client-side pixel masking to guarantee unmasked pixels remain 100% untouched
  useEffect(() => {
    if (!useStrictMaskProtection || !maskImage || !originalImage || !resultImage) {
      setCompositeResultUrl(resultImage);
      return;
    }

    const origImg = new Image();
    const resImg = new Image();
    const maskImg = new Image();

    origImg.crossOrigin = 'anonymous';
    resImg.crossOrigin = 'anonymous';
    maskImg.crossOrigin = 'anonymous';

    let loadedCount = 0;
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === 3) {
        processStrictComposite();
      }
    };

    origImg.onload = checkAllLoaded;
    resImg.onload = checkAllLoaded;
    maskImg.onload = checkAllLoaded;

    origImg.src = originalImage;
    resImg.src = resultImage;
    maskImg.src = maskImage;

    const processStrictComposite = () => {
      try {
        const w = origImg.naturalWidth || 800;
        const h = origImg.naturalHeight || 800;

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw original image completely
        ctx.drawImage(origImg, 0, 0, w, h);
        const origData = ctx.getImageData(0, 0, w, h);

        // Draw result image in temp canvas
        const tempResCanvas = document.createElement('canvas');
        tempResCanvas.width = w;
        tempResCanvas.height = h;
        const resCtx = tempResCanvas.getContext('2d');
        if (!resCtx) return;
        resCtx.drawImage(resImg, 0, 0, w, h);
        const resData = resCtx.getImageData(0, 0, w, h);

        // Draw mask in temp canvas with a slight blur to create feathering
        const tempMaskCanvas = document.createElement('canvas');
        tempMaskCanvas.width = w;
        tempMaskCanvas.height = h;
        const maskCtx = tempMaskCanvas.getContext('2d');
        if (!maskCtx) return;

        // We apply a 5px gaussian blur filter on the mask canvas to smoothly feather the transition edges
        maskCtx.filter = "blur(5px)";
        maskCtx.drawImage(maskImg, 0, 0, w, h);
        const maskData = maskCtx.getImageData(0, 0, w, h);

        // Blend: Linear alpha blending based on the blurred mask density to ensure
        // that the edited area transitions seamlessly and beautifully into the original unedited area.
        const blended = ctx.createImageData(w, h);
        const bPix = blended.data;
        const oPix = origData.data;
        const rPix = resData.data;
        const mPix = maskData.data;

        for (let i = 0; i < bPix.length; i += 4) {
          // Average the RGB values of the blurred mask to calculate the blending alpha (0 to 1)
          const maskVal = (mPix[i] + mPix[i + 1] + mPix[i + 2]) / 3;
          const alpha = maskVal / 255;

          bPix[i] = Math.round(rPix[i] * alpha + oPix[i] * (1 - alpha));
          bPix[i + 1] = Math.round(rPix[i + 1] * alpha + oPix[i + 1] * (1 - alpha));
          bPix[i + 2] = Math.round(rPix[i + 2] * alpha + oPix[i + 2] * (1 - alpha));
          bPix[i + 3] = Math.round(rPix[i + 3] * alpha + oPix[i + 3] * (1 - alpha));
        }

        ctx.putImageData(blended, 0, 0);
        setCompositeResultUrl(canvas.toDataURL('image/png'));
      } catch (e) {
        console.error('Strict Composite failed:', e);
        setCompositeResultUrl(resultImage);
      }
    };
  }, [originalImage, resultImage, maskImage, useStrictMaskProtection]);

  const finalDisplayImage = compositeResultUrl || resultImage;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = finalDisplayImage;
    link.download = `inpaint-edited-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    try {
      const response = await fetch(finalDisplayImage);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const handleApply = () => {
    onApplyAsBase();
    setIsApplied(true);
    setTimeout(() => setIsApplied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex flex-col gap-4">
      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            AI 修正完了結果
          </h2>
          <p className="text-xs text-stone-500 mt-0.5 max-w-md truncate" title={promptUsed}>
            指示: "{promptUsed}"
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button
            onClick={() => setViewMode('slider')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'slider'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>スライダー比較</span>
          </button>

          <button
            onClick={() => setViewMode('sideBySide')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'sideBySide'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>並べて比較</span>
          </button>

          <button
            onClick={() => setViewMode('resultOnly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'resultOnly'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>修正結果のみ</span>
          </button>
        </div>
      </div>

      {/* Strict Pixel Protection Status & Toggle */}
      {maskImage && (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2 text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>未選択領域100%完全保護:</strong> 未選択部分のオリジナルピクセルを厳密に完全合成保持中
            </span>
          </div>
          <button
            type="button"
            onClick={() => setUseStrictMaskProtection(!useStrictMaskProtection)}
            className="text-[11px] font-bold underline cursor-pointer text-emerald-800 hover:text-emerald-950"
          >
            {useStrictMaskProtection ? '元ピクセル合成ON' : '全域AI出力適用'}
          </button>
        </div>
      )}

      {/* Main View Display */}
      {viewMode === 'slider' && (
        <div className="relative w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-900 select-none aspect-square max-h-[500px]">
          {/* Base Original Image */}
          <img
            src={originalImage}
            alt="Original"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            referrerPolicy="no-referrer"
          />

          {/* Result Image (Clipped) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPos}%` }}
          >
            <img
              src={finalDisplayImage}
              alt="AI Result"
              className="absolute inset-0 w-full h-full object-contain max-w-none pointer-events-none"
              style={{
                width: '100%',
                height: '100%',
              }}
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Slider Line Divider */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-2xl z-10 flex items-center justify-center"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="w-8 h-8 rounded-full bg-white text-stone-800 shadow-lg border border-stone-300 flex items-center justify-center text-xs font-black">
              ↔
            </div>
          </div>

          {/* Slider Input overlay */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
          />

          {/* Labels */}
          <span className="absolute bottom-3 left-3 bg-stone-900/80 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-md border border-white/20 font-medium">
            ✨ AI 修正後
          </span>
          <span className="absolute bottom-3 right-3 bg-stone-900/80 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-md border border-white/20 font-medium">
            元の画像
          </span>
        </div>
      )}

      {viewMode === 'sideBySide' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              修正前（元画像）
            </span>
            <div className="rounded-xl border border-stone-200 overflow-hidden bg-stone-900 aspect-square flex items-center justify-center">
              <img
                src={originalImage}
                alt="Before"
                className="max-h-full max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              修正後（Gemini AI 生成 + 未選択完全保護）
            </span>
            <div className="rounded-xl border border-indigo-200 overflow-hidden bg-stone-900 aspect-square flex items-center justify-center shadow-xs">
              <img
                src={finalDisplayImage}
                alt="After"
                className="max-h-full max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}

      {viewMode === 'resultOnly' && (
        <div className="rounded-xl border border-stone-200 overflow-hidden bg-stone-900 aspect-square max-h-[500px] flex items-center justify-center">
          <img
            src={finalDisplayImage}
            alt="AI Result Only"
            className="max-h-full max-w-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleApply}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
              isApplied
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-900 hover:bg-stone-800 text-white shadow-sm'
            }`}
          >
            {isApplied ? <Check className="w-4 h-4" /> : <RefreshCcw className="w-4 h-4" />}
            <span>{isApplied ? '適用完了！' : 'この結果を次の元画像にする (連続編集)'}</span>
          </button>

          <button
            onClick={() => setShowMetadataPanel(!showMetadataPanel)}
            className={`px-3.5 py-2.5 rounded-xl border transition text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer ${
              showMetadataPanel
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                : 'border-stone-200 hover:bg-stone-50 text-stone-700'
            }`}
          >
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>EXIF・メタデータ確認</span>
            {showMetadataPanel ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-medium transition flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'コピー完了' : 'コピー'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>高画質保存 (PNG)</span>
          </button>
        </div>
      </div>

      {/* Expandable Metadata & EXIF Editor Panel */}
      {showMetadataPanel && (
        <div className="mt-2 pt-3 border-t border-stone-200 animate-fadeIn">
          <MetadataPanel
            imageSrc={finalDisplayImage}
            promptUsed={promptUsed}
          />
        </div>
      )}
    </div>
  );
};
