import React, { useState } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ImageCanvas } from './components/ImageCanvas';
import { PromptControls } from './components/PromptControls';
import { ResultViewer } from './components/ResultViewer';
import { HistorySidebar } from './components/HistorySidebar';
import { SampleImageGalleryModal } from './components/SampleImageGalleryModal';
import { AIImageGeneratorModal } from './components/AIImageGeneratorModal';
import { EditHistoryItem, EditMode, SampleImage } from './types';
import { Wand2, Image as ImageIcon, Sparkles, CheckCircle2 } from 'lucide-react';
import { optimizeImageDataUrl, safeFetchJson } from './utils/imageUtils';

export default function App() {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [maskImage, setMaskImage] = useState<string | null>(null);
  const [compositeImage, setCompositeImage] = useState<string | null>(null);

  const [prompt, setPrompt] = useState<string>('');
  const [mode, setMode] = useState<EditMode>('replace');

  const [resultImage, setResultImage] = useState<string | null>(null);
  const [lastPromptUsed, setLastPromptUsed] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [history, setHistory] = useState<EditHistoryItem[]>([]);

  // Modals
  const [isSamplesModalOpen, setIsSamplesModalOpen] = useState<boolean>(false);
  const [isAIGeneratorModalOpen, setIsAIGeneratorModalOpen] = useState<boolean>(false);

  const handleMaskChange = (maskBase64: string | null, compositeBase64: string | null) => {
    setMaskImage(maskBase64);
    setCompositeImage(compositeBase64);
  };

  const handleSelectSample = (sample: SampleImage) => {
    setCurrentImage(sample.url);
    setPrompt(sample.suggestedPrompt);
    setResultImage(null);
    setError(null);
  };

  const handleSelectAIGeneratedImage = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setPrompt('');
    setResultImage(null);
    setError(null);
  };

  const handleSubmitEdit = async () => {
    if (!currentImage) {
      setError('画像を選択またはアップロードしてください。');
      return;
    }

    if (!prompt.trim() && mode !== 'remove') {
      setError('AI修正の指示文（プロンプト）を入力してください。');
      return;
    }

    setIsLoading(true);
    setError(null);

    const actualPrompt = prompt.trim() || '選択したオブジェクトを自然に削除してください。';

    try {
      // Optimize image payload sizes (max 1024px) to prevent network transfer overload & timeouts
      const optBase = await optimizeImageDataUrl(currentImage, 1024, 0.85);
      const optComp = compositeImage ? await optimizeImageDataUrl(compositeImage, 1024, 0.85) : null;
      const optMask = (!optComp && maskImage) ? await optimizeImageDataUrl(maskImage, 1024, 0.85) : null;

      const data = await safeFetchJson('/api/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseImage: optBase,
          maskImage: optMask,
          compositeImage: optComp,
          prompt: actualPrompt,
          mode,
        }),
      });

      const newResult = data.imageUrl;
      setResultImage(newResult);
      setLastPromptUsed(actualPrompt);

      // Add to history
      const newHistoryItem: EditHistoryItem = {
        id: `hist-${Date.now()}`,
        timestamp: Date.now(),
        baseImage: currentImage,
        resultImage: newResult,
        maskImage: maskImage || '',
        prompt: actualPrompt,
        mode,
      };

      setHistory((prev) => [newHistoryItem, ...prev]);
    } catch (err: any) {
      console.error('Edit submit failed:', err);
      setError(err.message || '画像の一部分修正処理に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyResultAsBase = () => {
    if (!resultImage) return;
    setCurrentImage(resultImage);
    setResultImage(null);
    setPrompt('');
  };

  const handleReset = () => {
    setCurrentImage(null);
    setMaskImage(null);
    setCompositeImage(null);
    setResultImage(null);
    setPrompt('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans antialiased">
      {/* Navbar Header */}
      <Header
        onOpenSamples={() => setIsSamplesModalOpen(true)}
        onOpenAIGenerator={() => setIsAIGeneratorModalOpen(true)}
        onResetImage={handleReset}
        hasImage={!!currentImage}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!currentImage ? (
          /* Image Selection Screen */
          <ImageUploader
            onImageSelected={(url) => {
              setCurrentImage(url);
              setResultImage(null);
              setError(null);
            }}
            onOpenSamples={() => setIsSamplesModalOpen(true)}
            onOpenAIGenerator={() => setIsAIGeneratorModalOpen(true)}
          />
        ) : (
          /* Main Workspace Screen */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left/Center Column: Canvas & Results */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Canvas Component */}
              <ImageCanvas
                imageSrc={currentImage}
                onMaskChange={handleMaskChange}
                isLoading={isLoading}
              />

              {/* Prompt Controls Box */}
              <PromptControls
                prompt={prompt}
                onPromptChange={setPrompt}
                mode={mode}
                onModeChange={setMode}
                onSubmit={handleSubmitEdit}
                isLoading={isLoading}
                hasMask={!!maskImage}
                hasImage={!!currentImage}
                error={error}
              />

              {/* Result Comparison View (shows when edit completes) */}
              {resultImage && (
                <ResultViewer
                  originalImage={currentImage}
                  resultImage={resultImage}
                  maskImage={maskImage}
                  onApplyAsBase={handleApplyResultAsBase}
                  promptUsed={lastPromptUsed}
                />
              )}
            </div>

            {/* Right Column: Steps & History */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Instructions Box */}
              <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col gap-3">
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-indigo-600" />
                  使い方と機能ガイド
                </h3>
                <ol className="text-xs text-stone-600 space-y-2.5">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      <strong>タップして対象物選択:</strong> 画像内の修正・変更したい対象物（壁、洗面台、ソファーなど）を直接タップして選択します。選択サイズスライダーで選択範囲の大きさを調整できます。
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      <strong>機能モードの選択:</strong> 消去・置換・追加に加え、<strong>ライト調節（昼・夜・夕方・間接照明）</strong>や<strong>画質向上（高画質化・シャープ）</strong>を選択可能です。
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <span>
                      <strong>元画像100%保持保証:</strong> AI処理完了後、未選択部分のピクセルデータは完全に元の画像をそのまま合成保持します。
                    </span>
                  </li>
                </ol>
              </div>

              {/* Edit History Timeline */}
              <HistorySidebar
                history={history}
                onSelectHistoryItem={(item) => {
                  setResultImage(item.resultImage);
                  setLastPromptUsed(item.prompt);
                }}
                onClearHistory={() => setHistory([])}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-4 text-center text-xs text-stone-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AI 一部分画像修正ツール (Inpainting Editor) • Powered by Gemini AI</span>
          <span>高精度AIで自然に背景と馴染ませて部分選択編集</span>
        </div>
      </footer>

      {/* Modals */}
      <SampleImageGalleryModal
        isOpen={isSamplesModalOpen}
        onClose={() => setIsSamplesModalOpen(false)}
        onSelectSample={handleSelectSample}
      />

      <AIImageGeneratorModal
        isOpen={isAIGeneratorModalOpen}
        onClose={() => setIsAIGeneratorModalOpen(false)}
        onGeneratedImage={handleSelectAIGeneratedImage}
      />
    </div>
  );
}
