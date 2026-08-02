/**
 * Image helper utilities for scaling down base64 images before transmission to backend
 * and safely handling API fetch responses.
 */

export async function optimizeImageDataUrl(
  dataUrl: string,
  maxDimension: number = 1024,
  quality: number = 0.82
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }

  // If already small (< 150KB base64 length), return as is
  if (dataUrl.length < 150000) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(dataUrl);
      }
    }, 3000);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (resolved) return;
      clearTimeout(timeout);
      resolved = true;

      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      // Draw white background in case image has transparency (prevent black background on JPEG)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      ctx.drawImage(img, 0, 0, width, height);
      // Export as JPEG for maximum payload compression
      const resizedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(resizedDataUrl);
    };

    img.onerror = () => {
      if (!resolved) {
        clearTimeout(timeout);
        resolved = true;
        resolve(dataUrl);
      }
    };

    img.src = dataUrl;
  });
}

export async function safeFetchJson(
  url: string,
  options: RequestInit,
  retriesLeft: number = 2,
  backoffMs: number = 7000
): Promise<any> {
  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (netErr: any) {
    if (retriesLeft > 0) {
      await new Promise((res) => setTimeout(res, 2000));
      return safeFetchJson(url, options, retriesLeft - 1, backoffMs);
    }
    throw new Error(
      netErr?.message?.includes('Failed to fetch') || netErr?.message?.includes('Load failed')
        ? 'ネットワーク通信エラーが発生しました。インターネット接続と送信データのサイズを確認してください。'
        : netErr?.message || '通信エラーが発生しました。'
    );
  }

  let data: any = {};
  const text = await response.text();
  const isHtml = text.trim().startsWith('<');

  if (isHtml) {
    if (retriesLeft > 0) {
      console.warn('[Client Retry] Received HTML response from API route, retrying after 2s...');
      await new Promise((res) => setTimeout(res, 2000));
      return safeFetchJson(url, options, retriesLeft - 1, backoffMs);
    }
    data = {
      success: false,
      error: 'サーバーエラー（不正なレスポンス形式）が発生しました。通信または画像サイズを確認して再試行してください。',
    };
  } else {
    try {
      data = JSON.parse(text);
    } catch {
      data = {
        success: false,
        error: `サーバーエラーが発生しました (${response.status}: ${text.slice(0, 100)})`,
      };
    }
  }

  const isQuota = response.status === 429 || data.isQuotaExceeded;

  // Transparent automatic retry on 429 Rate Limit
  if (isQuota && retriesLeft > 0) {
    console.warn(`[Client 429] Rate limit hit. Automatically retrying in ${Math.round(backoffMs / 1000)}s...`);
    await new Promise((res) => setTimeout(res, backoffMs));
    return safeFetchJson(url, options, retriesLeft - 1, backoffMs + 3000);
  }

  if (!response.ok || !data.success) {
    const errMsg = data.error || `リクエストエラー (ステータス: ${response.status})`;
    const errObj = new Error(errMsg);
    (errObj as any).isQuotaExceeded = isQuota;
    throw errObj;
  }

  return data;
}
