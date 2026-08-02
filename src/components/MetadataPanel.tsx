import React, { useState, useEffect } from 'react';
import {
  FileText,
  Camera,
  MapPin,
  Tag,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Download,
  Info,
  Calendar,
  Sparkles,
  Sliders,
  ShieldAlert,
  Save,
  Globe,
  Cpu,
} from 'lucide-react';

export interface ImageMetadata {
  title: string;
  description: string;
  author: string;
  copyright: string;
  software: string;
  dateCreated: string;
  // Camera & Shot info
  cameraMake: string;
  cameraModel: string;
  iso: string;
  aperture: string;
  shutterSpeed: string;
  focalLength: string;
  colorSpace: string;
  // Location
  locationName: string;
  latitude: string;
  longitude: string;
  // Technical specs (auto-calculated)
  dimensions: string;
  aspectRatio: string;
  format: string;
  fileSizeEstimate: string;
  aiPromptUsed: string;
  aiMode: string;
}

interface MetadataPanelProps {
  imageSrc: string;
  promptUsed?: string;
  editMode?: string;
  onMetadataSave?: (metadata: ImageMetadata) => void;
}

export const MetadataPanel: React.FC<MetadataPanelProps> = ({
  imageSrc,
  promptUsed = '',
  editMode = 'edit',
  onMetadataSave,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'exif' | 'gps' | 'raw'>('basic');
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [metadata, setMetadata] = useState<ImageMetadata>({
    title: 'AI 編集後の写真',
    description: promptUsed || 'Gemini AIによって修正・編集された画像',
    author: 'AI Studio User',
    copyright: `© ${new Date().getFullYear()} All Rights Reserved`,
    software: 'Gemini AI Inpaint Editor v1.0',
    dateCreated: new Date().toISOString().replace('T', ' ').substring(0, 19),
    cameraMake: 'Virtual AI Camera',
    cameraModel: 'Gemini 2.5 Flash Neural Engine',
    iso: '100',
    aperture: 'f/2.8',
    shutterSpeed: '1/250s',
    focalLength: '35mm',
    colorSpace: 'sRGB',
    locationName: '未指定',
    latitude: '',
    longitude: '',
    dimensions: '---',
    aspectRatio: '---',
    format: 'image/png',
    fileSizeEstimate: '---',
    aiPromptUsed: promptUsed,
    aiMode: editMode,
  });

  // Calculate image dimensions and estimated file size dynamically
  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const w = img.naturalWidth || 800;
      const h = img.naturalHeight || 800;

      // Calculate greatest common divisor for aspect ratio
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const divisor = gcd(w, h);
      const aspect = `${w / divisor}:${h / divisor}`;

      // Estimate base64 file size
      const base64Length = imageSrc.length - (imageSrc.indexOf(',') + 1);
      const sizeInBytes = Math.round((base64Length * 3) / 4);
      const sizeInKB = (sizeInBytes / 1024).toFixed(1);
      const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
      const formattedSize =
        sizeInBytes > 1024 * 1024 ? `${sizeInMB} MB` : `${sizeInKB} KB`;

      const formatType = imageSrc.startsWith('data:image/jpeg')
        ? 'JPEG'
        : imageSrc.startsWith('data:image/webp')
        ? 'WebP'
        : 'PNG';

      setMetadata((prev) => ({
        ...prev,
        dimensions: `${w} × ${h} px`,
        aspectRatio: aspect,
        format: formatType,
        fileSizeEstimate: formattedSize,
        aiPromptUsed: promptUsed || prev.aiPromptUsed,
        aiMode: editMode || prev.aiMode,
      }));
    };
    img.src = imageSrc;
  }, [imageSrc, promptUsed, editMode]);

  const handleChange = (field: keyof ImageMetadata, value: string) => {
    setMetadata((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyPreset = (presetType: 'dslr' | 'mobile' | 'ai') => {
    if (presetType === 'dslr') {
      setMetadata((prev) => ({
        ...prev,
        cameraMake: 'Canon',
        cameraModel: 'EOS R5',
        iso: '100',
        aperture: 'f/2.8',
        shutterSpeed: '1/500s',
        focalLength: '50mm',
        software: 'Adobe Photoshop 2026 / Gemini AI',
      }));
    } else if (presetType === 'mobile') {
      setMetadata((prev) => ({
        ...prev,
        cameraMake: 'Apple',
        cameraModel: 'iPhone 15 Pro',
        iso: '50',
        aperture: 'f/1.78',
        shutterSpeed: '1/120s',
        focalLength: '24mm',
        software: 'iOS Photos / AI Inpaint',
      }));
    } else if (presetType === 'ai') {
      setMetadata((prev) => ({
        ...prev,
        cameraMake: 'Virtual AI Camera',
        cameraModel: 'Gemini 2.5 Flash Neural Engine',
        iso: '100',
        aperture: 'f/2.0',
        shutterSpeed: '1/250s',
        focalLength: '35mm',
        software: 'Gemini AI Inpaint Editor v1.0',
      }));
    }
  };

  const handleClearExif = () => {
    setMetadata((prev) => ({
      ...prev,
      cameraMake: 'なし',
      cameraModel: 'なし',
      iso: '-',
      aperture: '-',
      shutterSpeed: '-',
      focalLength: '-',
      locationName: '非公開 (消去済み)',
      latitude: '',
      longitude: '',
      author: '匿名',
    }));
  };

  const handleCopyJson = () => {
    const jsonString = JSON.stringify(metadata, null, 2);
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMetadata = () => {
    const jsonString = JSON.stringify(metadata, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `image-metadata-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (onMetadataSave) {
      onMetadataSave(metadata);
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 text-xs sm:text-sm text-zinc-200">
      {/* Header title */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-100 text-sm sm:text-base flex items-center gap-1.5">
              画像メタデータ (EXIF) インスペクター & 編集
            </h3>
            <p className="text-xs text-zinc-400">
              画像の撮影・解像度・カメラ設定およびAI生成タグの確認・任意編集が可能です
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              isSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-500 hover:bg-amber-600 text-zinc-950 shadow-md'
            }`}
          >
            {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaved ? '保存完了' : '変更を保存'}</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-850 flex flex-col gap-0.5">
          <span className="text-[10px] uppercase font-bold text-zinc-500">解像度</span>
          <span className="font-mono font-bold text-zinc-200 text-xs truncate">
            {metadata.dimensions}
          </span>
        </div>
        <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-850 flex flex-col gap-0.5">
          <span className="text-[10px] uppercase font-bold text-zinc-500">ファイル形式 / サイズ</span>
          <span className="font-mono font-bold text-zinc-200 text-xs truncate">
            {metadata.format} ({metadata.fileSizeEstimate})
          </span>
        </div>
        <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-850 flex flex-col gap-0.5">
          <span className="text-[10px] uppercase font-bold text-zinc-500">カメラ / モデル</span>
          <span className="font-mono font-bold text-zinc-200 text-xs truncate">
            {metadata.cameraMake} {metadata.cameraModel}
          </span>
        </div>
        <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-850 flex flex-col gap-0.5">
          <span className="text-[10px] uppercase font-bold text-zinc-500">AI指示文</span>
          <span className="font-mono font-bold text-amber-400 text-xs truncate" title={metadata.aiPromptUsed}>
            {metadata.aiPromptUsed || 'なし'}
          </span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
        <button
          type="button"
          onClick={() => setActiveTab('basic')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'basic'
              ? 'bg-amber-500 text-zinc-950 shadow-md font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>基本 & AI情報</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('exif')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'exif'
              ? 'bg-amber-500 text-zinc-950 shadow-md font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>カメラ (EXIF)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('gps')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'gps'
              ? 'bg-amber-500 text-zinc-950 shadow-md font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>位置情報 & 著作権</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('raw')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'raw'
              ? 'bg-amber-500 text-zinc-950 shadow-md font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>JSONデータ</span>
        </button>
      </div>

      {/* Tab 1: Basic & AI Metadata */}
      {activeTab === 'basic' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-900 p-4 rounded-xl border border-zinc-850">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-amber-500" />
              画像タイトル
            </label>
            <input
              type="text"
              value={metadata.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="px-3 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-zinc-950 font-medium text-xs sm:text-sm text-zinc-100"
              placeholder="画像タイトルを入力"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              作成・編集日時
            </label>
            <input
              type="text"
              value={metadata.dateCreated}
              onChange={(e) => handleChange('dateCreated', e.target.value)}
              className="px-3 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-zinc-950 font-mono text-xs sm:text-sm text-zinc-100"
            />
          </div>

          <div className="sm:col-span-2 flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              AI 修正指示文 (プロンプト)
            </label>
            <textarea
              rows={2}
              value={metadata.aiPromptUsed}
              onChange={(e) => handleChange('aiPromptUsed', e.target.value)}
              className="px-3 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-zinc-950 text-xs sm:text-sm font-mono resize-none text-zinc-100"
              placeholder="使用したプロンプト"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-300">編集モード</label>
            <input
              type="text"
              value={metadata.aiMode}
              onChange={(e) => handleChange('aiMode', e.target.value)}
              className="px-3 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-zinc-950 font-mono text-xs text-zinc-100"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-300">処理ソフトウェア</label>
            <input
              type="text"
              value={metadata.software}
              onChange={(e) => handleChange('software', e.target.value)}
              className="px-3 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-zinc-950 font-mono text-xs text-zinc-100"
            />
          </div>
        </div>
      )}

      {/* Tab 2: Camera & EXIF Data */}
      {activeTab === 'exif' && (
        <div className="flex flex-col gap-3 bg-zinc-900 p-4 rounded-xl border border-zinc-850">
          {/* Presets Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-850 pb-2.5">
            <span className="text-xs font-bold text-zinc-400 flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-amber-500" />
              EXIFプリセットクイック適用:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleApplyPreset('ai')}
                className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs font-bold transition cursor-pointer border border-amber-500/20"
              >
                ✨ AI標準
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('dslr')}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-bold transition cursor-pointer border border-zinc-700/60"
              >
                📷 一眼レフ (Canon R5)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('mobile')}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-bold transition cursor-pointer border border-zinc-700/60"
              >
                📱 スマホ (iPhone 15)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-zinc-300">カメラメーカー (Make)</label>
              <input
                type="text"
                value={metadata.cameraMake}
                onChange={(e) => handleChange('cameraMake', e.target.value)}
                className="px-3 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-zinc-950 font-medium text-xs text-zinc-100"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-zinc-300">カメラモデル (Model)</label>
              <input
                type="text"
                value={metadata.cameraModel}
                onChange={(e) => handleChange('cameraModel', e.target.value)}
                className="px-3 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-zinc-950 font-medium text-xs text-zinc-100"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-zinc-300">ISO 感度</label>
              <input
                type="text"
                value={metadata.iso}
                onChange={(e) => handleChange('iso', e.target.value)}
                className="px-3 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-zinc-950 font-mono text-xs text-zinc-100"
                placeholder="100"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-zinc-300">絞り値 (F-Number)</label>
              <input
                type="text"
                value={metadata.aperture}
                onChange={(e) => handleChange('aperture', e.target.value)}
                className="px-3 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-zinc-950 font-mono text-xs text-zinc-100"
                placeholder="f/2.8"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-zinc-300">シャッター速度</label>
              <input
                type="text"
                value={metadata.shutterSpeed}
                onChange={(e) => handleChange('shutterSpeed', e.target.value)}
                className="px-3 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-zinc-950 font-mono text-xs text-zinc-100"
                placeholder="1/250s"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-zinc-300">焦点距離 (Focal Length)</label>
              <input
                type="text"
                value={metadata.focalLength}
                onChange={(e) => handleChange('focalLength', e.target.value)}
                className="px-3 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-zinc-950 font-mono text-xs text-zinc-100"
                placeholder="35mm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: GPS & Copyright */}
      {activeTab === 'gps' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-900 p-4 rounded-xl border border-zinc-850">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-amber-500" />
              撮影/編集地名 (Location Name)
            </label>
            <input
              type="text"
              value={metadata.locationName}
              onChange={(e) => handleChange('locationName', e.target.value)}
              className="px-3 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-zinc-950 font-medium text-xs text-zinc-100"
              placeholder="例: 東京都渋谷区"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              緯度・経度 (Lat, Long)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={metadata.latitude}
                onChange={(e) => handleChange('latitude', e.target.value)}
                className="px-2.5 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-zinc-950 font-mono text-xs text-zinc-100"
                placeholder="緯度 (35.6580)"
              />
              <input
                type="text"
                value={metadata.longitude}
                onChange={(e) => handleChange('longitude', e.target.value)}
                className="px-2.5 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-zinc-950 font-mono text-xs text-zinc-100"
                placeholder="経度 (139.7016)"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-300">作者 / 作成者 (Author)</label>
            <input
              type="text"
              value={metadata.author}
              onChange={(e) => handleChange('author', e.target.value)}
              className="px-3 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-zinc-950 font-medium text-xs text-zinc-100"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-300">著作権表示 (Copyright)</label>
            <input
              type="text"
              value={metadata.copyright}
              onChange={(e) => handleChange('copyright', e.target.value)}
              className="px-3 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-zinc-950 font-medium text-xs text-zinc-100"
            />
          </div>
        </div>
      )}

      {/* Tab 4: Raw JSON View */}
      {activeTab === 'raw' && (
        <div className="bg-zinc-950 text-amber-400 p-3.5 rounded-xl border border-zinc-800 font-mono text-xs overflow-x-auto max-h-[220px]">
          <pre>{JSON.stringify(metadata, null, 2)}</pre>
        </div>
      )}

      {/* Bottom Privacy & Export Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800">
        <button
          type="button"
          onClick={handleClearExif}
          className="px-3 py-1.5 rounded-lg border border-red-900/50 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>プライバシー保護（位置情報・EXIF消去）</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyJson}
            className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'コピー完了' : 'JSONコピー'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadMetadata}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-750 text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>メタデータ保存 (.json)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
