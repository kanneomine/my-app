import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Paintbrush,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Square,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { ToolType } from '../types';

interface ImageCanvasProps {
  imageSrc: string;
  onMaskChange: (maskBase64: string | null, compositeBase64: string | null) => void;
  isLoading?: boolean;
}

export const ImageCanvas: React.FC<ImageCanvasProps> = ({
  imageSrc,
  onMaskChange,
  isLoading = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null); // Black/White offscreen mask canvas
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null); // Visual red overlay canvas

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<ToolType>('brush');
  const [brushSize, setBrushSize] = useState<number>(35);
  const [maskOpacity, setMaskOpacity] = useState<number>(0.6);
  const [showMaskOverlay, setShowMaskOverlay] = useState<boolean>(true);
  const [hasMask, setHasMask] = useState<boolean>(false);

  // Undo/Redo history stack (storing ImageData)
  const historyRef = useRef<ImageData[]>([]);
  const historyStepRef = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Rect selection state
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  // Image dimensions
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number }>({
    width: 800,
    height: 800,
  });

  // Cursor position for brush preview circle
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Initialize canvases when image changes
  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      const w = img.naturalWidth || 800;
      const h = img.naturalHeight || 800;
      setImgDimensions({ width: w, height: h });

      // Initialize mask canvas (Black background)
      const maskCanvas = maskCanvasRef.current;
      if (maskCanvas) {
        maskCanvas.width = w;
        maskCanvas.height = h;
        const ctx = maskCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, w, h);
          // Save initial state for history
          const initialData = ctx.getImageData(0, 0, w, h);
          historyRef.current = [initialData];
          historyStepRef.current = 0;
          setCanUndo(false);
          setCanRedo(false);
        }
      }

      // Initialize overlay canvas
      const overlayCanvas = overlayCanvasRef.current;
      if (overlayCanvas) {
        overlayCanvas.width = w;
        overlayCanvas.height = h;
      }

      setHasMask(false);
      updateOverlayAndEmit();
    };
  }, [imageSrc]);

  // Save current mask state to history
  const saveHistoryStep = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    const currentData = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    // Slice off any redo history
    historyRef.current = historyRef.current.slice(0, historyStepRef.current + 1);
    historyRef.current.push(currentData);
    historyStepRef.current = historyRef.current.length - 1;

    setCanUndo(historyStepRef.current > 0);
    setCanRedo(false);
  };

  const handleUndo = () => {
    if (historyStepRef.current <= 0) return;
    historyStepRef.current -= 1;
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    const previousData = historyRef.current[historyStepRef.current];
    ctx.putImageData(previousData, 0, 0);

    setCanUndo(historyStepRef.current > 0);
    setCanRedo(historyStepRef.current < historyRef.current.length - 1);

    checkHasMask();
    updateOverlayAndEmit();
  };

  const handleRedo = () => {
    if (historyStepRef.current >= historyRef.current.length - 1) return;
    historyStepRef.current += 1;
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    const nextData = historyRef.current[historyStepRef.current];
    ctx.putImageData(nextData, 0, 0);

    setCanUndo(historyStepRef.current > 0);
    setCanRedo(historyStepRef.current < historyRef.current.length - 1);

    checkHasMask();
    updateOverlayAndEmit();
  };

  const checkHasMask = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    const data = imgData.data;
    // Check if any non-black pixel exists
    let maskFound = false;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] > 20 || data[i + 1] > 20 || data[i + 2] > 20) {
        maskFound = true;
        break;
      }
    }
    setHasMask(maskFound);
  };

  // Synchronize overlay canvas display & generate export base64
  const updateOverlayAndEmit = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!maskCanvas || !overlayCanvas) return;

    const maskCtx = maskCanvas.getContext('2d');
    const overlayCtx = overlayCanvas.getContext('2d');
    if (!maskCtx || !overlayCtx) return;

    const { width, height } = maskCanvas;
    overlayCtx.clearRect(0, 0, width, height);

    if (showMaskOverlay) {
      // Get mask pixels
      const maskImgData = maskCtx.getImageData(0, 0, width, height);
      const maskPixels = maskImgData.data;

      // Create red overlay
      const overlayImgData = overlayCtx.createImageData(width, height);
      const overlayPixels = overlayImgData.data;

      const alphaValue = Math.round(maskOpacity * 255);

      for (let i = 0; i < maskPixels.length; i += 4) {
        const r = maskPixels[i]; // White in mask = 255
        if (r > 30) {
          overlayPixels[i] = 239; // Red (239, 68, 68 - Tailwind red-500)
          overlayPixels[i + 1] = 68;
          overlayPixels[i + 2] = 68;
          overlayPixels[i + 3] = alphaValue;
        }
      }
      overlayCtx.putImageData(overlayImgData, 0, 0);
    }

    // Generate output mask base64 string
    const maskBase64 = maskCanvas.toDataURL('image/png');

    // Generate composite image (base image + red mask) for Gemini visual prompt context
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx && imageRef.current) {
      try {
        tempCtx.drawImage(imageRef.current, 0, 0, width, height);
        tempCtx.drawImage(overlayCanvas, 0, 0, width, height);
        const compositeBase64 = tempCanvas.toDataURL('image/jpeg', 0.85);
        onMaskChange(maskBase64, compositeBase64);
      } catch (e) {
        console.warn('Canvas export failed (cross-origin taint or memory):', e);
        onMaskChange(maskBase64, null);
      }
    } else {
      onMaskChange(maskBase64, null);
    }
  }, [maskOpacity, showMaskOverlay, onMaskChange]);

  useEffect(() => {
    updateOverlayAndEmit();
  }, [maskOpacity, showMaskOverlay, updateOverlayAndEmit]);

  // Convert client pointer event coordinates to canvas internal pixel coordinates
  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas) return null;

    const rect = overlayCanvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = overlayCanvas.width / rect.width;
    const scaleY = overlayCanvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
      screenX: clientX - rect.left,
      screenY: clientY - rect.top,
      rectWidth: rect.width,
    };
  };

  const drawStroke = (x: number, y: number, isStart: boolean) => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;

    if (tool === 'brush') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.fillStyle = '#FFFFFF';
    } else if (tool === 'eraser') {
      ctx.strokeStyle = '#000000';
      ctx.fillStyle = '#000000';
    }

    if (isStart) {
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    checkHasMask();
    updateOverlayAndEmit();
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (isLoading) return;
    const coords = getCanvasCoords(e);
    if (!coords) return;

    setIsDrawing(true);
    startPosRef.current = { x: coords.x, y: coords.y };

    if (tool === 'brush' || tool === 'eraser') {
      drawStroke(coords.x, coords.y, true);
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCanvasCoords(e);
    if (coords) {
      setMousePos({ x: coords.screenX, y: coords.screenY });
    }

    if (!isDrawing || isLoading) return;
    if (!coords) return;

    if (tool === 'brush' || tool === 'eraser') {
      drawStroke(coords.x, coords.y, false);
    } else if (tool === 'rect' && startPosRef.current) {
      // Preview rect
      const maskCanvas = maskCanvasRef.current;
      if (!maskCanvas) return;
      const ctx = maskCanvas.getContext('2d');
      if (!ctx) return;

      // Temporary draw for rect
      const startX = startPosRef.current.x;
      const startY = startPosRef.current.y;
      const width = coords.x - startX;
      const height = coords.y - startY;

      // Restore last history before drawing current drag rect
      if (historyRef.current[historyStepRef.current]) {
        ctx.putImageData(historyRef.current[historyStepRef.current], 0, 0);
      }
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(startX, startY, width, height);

      checkHasMask();
      updateOverlayAndEmit();
    }
  };

  const handlePointerUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      startPosRef.current = null;
      saveHistoryStep();
    }
  };

  const handleClearMask = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    setHasMask(false);
    saveHistoryStep();
    updateOverlayAndEmit();
  };

  // Smart Region Selection Presets
  const handleSmartPreset = (presetType: 'center' | 'bg' | 'bottom' | 'all') => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    const w = maskCanvas.width;
    const h = maskCanvas.height;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#FFFFFF';
    if (presetType === 'center') {
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2, w * 0.3, h * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (presetType === 'bottom') {
      ctx.fillRect(0, h * 0.55, w, h * 0.45);
    } else if (presetType === 'all') {
      ctx.fillRect(0, 0, w, h);
    } else if (presetType === 'bg') {
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2, w * 0.32, h * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    checkHasMask();
    saveHistoryStep();
    updateOverlayAndEmit();
  };

  // Expand / Dilate Mask
  const handleExpandMask = (amount: number) => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = maskCanvas;
    const imgData = ctx.getImageData(0, 0, width, height);
    const src = imgData.data;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.fillStyle = '#000000';
    tempCtx.fillRect(0, 0, width, height);
    tempCtx.fillStyle = '#FFFFFF';

    const step = Math.abs(amount);
    const isExpand = amount > 0;

    if (isExpand) {
      for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
          const idx = (y * width + x) * 4;
          if (src[idx] > 100) {
            tempCtx.beginPath();
            tempCtx.arc(x, y, step * 4, 0, Math.PI * 2);
            tempCtx.fill();
          }
        }
      }
    } else {
      ctx.filter = `blur(${step}px)`;
      ctx.drawImage(maskCanvas, 0, 0);
      ctx.filter = 'none';
    }

    if (isExpand) {
      ctx.drawImage(tempCanvas, 0, 0);
    }

    checkHasMask();
    saveHistoryStep();
    updateOverlayAndEmit();
  };

  return (
    <div className="flex flex-col bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
      {/* Top Toolbar */}
      <div className="bg-zinc-950 px-4 py-3 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-zinc-300">
        {/* Tool selector buttons */}
        <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setTool('brush')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              tool === 'brush'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title="塗りつぶしブラシ (部分選択)"
          >
            <Paintbrush className="w-3.5 h-3.5" />
            <span>ブラシ</span>
          </button>

          <button
            onClick={() => setTool('eraser')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              tool === 'eraser'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title="マスクを消去"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>消しゴム</span>
          </button>

          <button
            onClick={() => setTool('rect')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              tool === 'rect'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title="四角形選択"
          >
            <Square className="w-3.5 h-3.5" />
            <span>範囲選択</span>
          </button>
        </div>

        {/* Brush Size Slider */}
        <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
          <span className="text-xs text-zinc-400 font-medium">サイズ</span>
          <input
            type="range"
            min="5"
            max="120"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-24 sm:w-28 accent-amber-500 cursor-pointer"
          />
          <span className="text-xs text-zinc-300 min-w-[2.5rem] font-mono text-right">
            {brushSize}px
          </span>
        </div>

        {/* Undo / Redo / Clear / Smart Selection */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 disabled:opacity-40 disabled:hover:bg-zinc-900 transition cursor-pointer border border-zinc-800"
            title="元に戻す (Undo)"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 disabled:opacity-40 disabled:hover:bg-zinc-900 transition cursor-pointer border border-zinc-800"
            title="やり直す (Redo)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowMaskOverlay(!showMaskOverlay)}
            className={`p-2 rounded-lg transition cursor-pointer border border-zinc-800 ${
              showMaskOverlay
                ? 'bg-zinc-800 text-amber-500'
                : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'
            }`}
            title={showMaskOverlay ? 'マスクを非表示' : 'マスクを表示'}
          >
            {showMaskOverlay ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Smart Selection Quick Buttons */}
          <div className="hidden sm:flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-[11px]">
            <span className="text-zinc-500 px-1.5">範囲:</span>
            <button
              onClick={() => handleSmartPreset('center')}
              className="px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
              title="中央の被写体を概算選択"
            >
              中央被写体
            </button>
            <button
              onClick={() => handleSmartPreset('bg')}
              className="px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
              title="背景全体を選択"
            >
              背景全体
            </button>
            <button
              onClick={() => handleSmartPreset('all')}
              className="px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
              title="画像全体（ライティング・画質調整用）"
            >
              全選択
            </button>
          </div>

          <button
            onClick={() => handleExpandMask(3)}
            disabled={!hasMask}
            className="px-2 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition cursor-pointer border border-zinc-800 disabled:opacity-40"
            title="選択範囲を少し広げる"
          >
            + 拡大
          </button>

          <button
            onClick={handleClearMask}
            disabled={!hasMask}
            className="px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-medium transition cursor-pointer border border-rose-900/50 disabled:opacity-40"
            title="選択をすべて解除"
          >
            全消去
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div
        ref={containerRef}
        className="relative flex items-center justify-center p-4 sm:p-6 min-h-[420px] max-h-[600px] overflow-auto select-none bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px]"
        onMouseMove={handlePointerMove}
        onMouseLeave={() => setMousePos(null)}
      >
        <div className="relative shadow-2xl rounded-lg overflow-hidden border border-zinc-850 group inline-block">
          {/* Base Image */}
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Source for inpainting"
            className="max-h-[500px] w-auto object-contain block pointer-events-none"
            referrerPolicy="no-referrer"
          />

          {/* Offscreen Black/White Mask Canvas (Hidden) */}
          <canvas ref={maskCanvasRef} className="hidden" />

          {/* Visual Overlay Canvas (Red Translucent Mask) */}
          <canvas
            ref={overlayCanvasRef}
            className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
          />

          {/* Brush Diameter Circle Preview */}
          {mousePos && (tool === 'brush' || tool === 'eraser') && (
            <div
              className="pointer-events-none absolute rounded-full border-2 border-white/90 bg-red-500/20 shadow-xs -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${mousePos.x}px`,
                top: `${mousePos.y}px`,
                width: `${(brushSize * (overlayCanvasRef.current?.getBoundingClientRect().width || 1)) / (imgDimensions.width || 1)}px`,
                height: `${(brushSize * (overlayCanvasRef.current?.getBoundingClientRect().height || 1)) / (imgDimensions.height || 1)}px`,
              }}
            />
          )}

          {/* Loading Overlay Spinner */}
          {isLoading && (
            <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-white z-20 animate-fade-in">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin" />
                <Sparkles className="w-5 h-5 text-amber-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <p className="text-sm font-semibold tracking-wide text-amber-200">
                Gemini AI が部分画像修正中...
              </p>
              <p className="text-xs text-zinc-400">
                指定エリアを正確に認識して背景となじませています
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="bg-zinc-950 px-4 py-2 text-xs text-zinc-400 border-t border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              hasMask ? 'bg-emerald-500 animate-pulse' : 'bg-stone-600'
            }`}
          />
          <span>
            {hasMask
              ? '修正したい対象エリアが選択されています (赤色部分)'
              : '画像上の修正したい場所をブラシで塗ってください'}
          </span>
        </div>
        <span className="hidden sm:inline text-stone-500 font-mono">
          {imgDimensions.width} x {imgDimensions.height} px
        </span>
      </div>
    </div>
  );
};
