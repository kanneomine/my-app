import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 image transfers
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Image Inpainting API is running" });
  });

  // Lazy Gemini initialization helper
  function getGeminiAI() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // Automatic quota retry wrapper for 429 rate limit resets
  async function executeWithQuotaRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 1,
    baseDelayMs: number = 1500
  ): Promise<T> {
    let attempt = 0;
    while (true) {
      try {
        return await fn();
      } catch (err: any) {
        attempt++;
        const isQuota =
          err?.status === 429 ||
          err?.statusCode === 429 ||
          err?.message?.includes("429") ||
          err?.message?.includes("RESOURCE_EXHAUSTED") ||
          err?.message?.includes("Quota exceeded");

        if (isQuota) {
          let waitMs = baseDelayMs * attempt;
          const retryMatch = err?.message?.match(/retry in (\d+(?:\.\d+)?)s/i);
          if (retryMatch && retryMatch[1]) {
            const parsedSec = parseFloat(retryMatch[1]);
            if (!isNaN(parsedSec)) {
              waitMs = Math.ceil(parsedSec * 1000);
            }
          }

          // If requested wait is > 3000ms or attempt exceeds maxRetries, fail fast on this model
          // to allow testing next candidate model or returning HTTP 429 for transparent client retry
          if (waitMs > 3000 || attempt > maxRetries) {
            console.warn(
              `[Quota 429] Fast fail model (delay ${Math.round(waitMs / 1000)}s requested). Trying next candidate or returning 429...`
            );
            throw err;
          }

          console.warn(`[Quota 429] Short delay (${waitMs}ms). Retrying ${attempt}/${maxRetries}...`);
          await new Promise((resolve) => setTimeout(resolve, waitMs));
        } else {
          throw err;
        }
      }
    }
  }

  // Selective Image Editing / Inpainting Endpoint
  app.post("/api/edit-image", async (req, res) => {
    try {
      const {
        baseImage,
        maskImage,
        compositeImage,
        prompt,
        mode = "edit",
        aspectRatio = "1:1",
      } = req.body;

      if (!baseImage || !prompt) {
        return res.status(400).json({
          error: "元の画像と修正の指示プロンプトを入力してください。",
        });
      }

      const ai = getGeminiAI();

      // Robust base64 and remote URL image content parser
      const resolveImagePart = async (dataUrl: string) => {
        if (!dataUrl || typeof dataUrl !== "string") return null;
        
        const trimmed = dataUrl.trim();
        
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
          try {
            const resp = await fetch(trimmed);
            if (!resp.ok) {
              console.warn(`Failed to fetch external image (${resp.status}): ${trimmed}`);
              return null;
            }
            const arrayBuffer = await resp.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString("base64");
            const contentType = resp.headers.get("content-type") || "image/jpeg";
            const mimeType = contentType.split(";")[0].trim();
            return { mimeType: mimeType.startsWith("image/") ? mimeType : "image/jpeg", data: base64 };
          } catch (e: any) {
            console.error("Failed to fetch image URL on server:", trimmed, e?.message);
            return null;
          }
        }

        const matches = trimmed.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/s);
        if (matches && matches.length === 3) {
          return { mimeType: matches[1], data: matches[2].replace(/\s/g, "") };
        }

        // Fallback for raw base64 string
        const cleanBase64 = trimmed.replace(/^data:image\/\w+;base64,/, "").replace(/\s/g, "");
        if (cleanBase64.length > 50) {
          return { mimeType: "image/png", data: cleanBase64 };
        }
        return null;
      };

      const baseImagePart = await resolveImagePart(baseImage);
      const maskImagePart = maskImage ? await resolveImagePart(maskImage) : null;
      const compositeImagePart = compositeImage ? await resolveImagePart(compositeImage) : null;

      if (!baseImagePart) {
        return res.status(400).json({
          error: "画像の形式が無効か、画像を読み込めませんでした。",
        });
      }

      const parts: any[] = [];

      // Add base image
      parts.push({
        inlineData: {
          mimeType: baseImagePart.mimeType,
          data: baseImagePart.data,
        },
      });

      // Add composite image with red highlighted region if present
      if (compositeImagePart) {
        parts.push({
          inlineData: {
            mimeType: compositeImagePart.mimeType,
            data: compositeImagePart.data,
          },
        });
      } else if (maskImagePart) {
        parts.push({
          inlineData: {
            mimeType: maskImagePart.mimeType,
            data: maskImagePart.data,
          },
        });
      }

      // Detailed inpainting instructions for Gemini
      let instructionText = "";
      if (mode === "remove") {
        instructionText = `You are an expert image editor. Look at the base image and the highlighted red/masked region. Completely REMOVE the object/elements inside the highlighted mask region, and seamlessly fill in the background to match surrounding textures and lighting. Additional user details: "${prompt}". Leave all unmasked areas 100% unchanged and identical to the original base image.`;
      } else if (mode === "replace") {
        instructionText = `You are an expert image editor. Look at the base image and the highlighted red/masked region. REPLACE the selected masked area with: "${prompt}". Blend the edges smoothly into the original image while keeping the exact style, resolution, and lighting of the surrounding unmasked area. Unmasked areas must remain completely identical.`;
      } else if (mode === "add") {
        instructionText = `You are an expert image editor. Look at the base image and the highlighted red/masked region. ADD a new element inside the masked area described as: "${prompt}". Maintain consistent perspective, shadows, and lighting with the rest of the image. Unmasked areas must stay untouched.`;
      } else if (mode === "lighting") {
        instructionText = `You are an expert photographic lighting designer. CRITICAL REQUIREMENT: Do NOT alter any object, structure, position, composition, or elements in the image. Modify ONLY the lighting and illumination environment (such as ${prompt}). Keep all objects, shapes, and details 100% identical to the original image, adjusting only the light sources, ambient glow, shadows, highlights, color temperature, and atmospheric light bounce realistically. If a red mask is provided, focus the lighting effect mainly on the masked region, otherwise apply the lighting transform seamlessly across the scene.`;
      } else if (mode === "enhance") {
        instructionText = `You are an expert image restoration and enhancement engine. CRITICAL REQUIREMENT: Do NOT change any content, object, composition, or spatial details of the image. Enhance the image quality according to: "${prompt}". Increase sharpness, refine textures, remove noise/artifacts, optimize contrast and clarity, and bring out high-definition detail while remaining 100% faithful to the original scene. If a red mask is provided, enhance specifically that region; otherwise enhance the entire image uniformly.`;
      } else {
        instructionText = `You are an expert in partial image editing and inpainting. The user has marked a specific area of the image (highlighted in the red overlay / mask). Edit ONLY the specified masked region according to this request: "${prompt}". Make sure the unmasked areas remain completely untouched and identical to the original image, with seamless blending at the boundary.`;
      }

      parts.push({ text: instructionText });

      // Call Gemini Image model with fallback models and quota error handling
      const candidateModels = [
        "gemini-3.1-flash-image",
        "gemini-3.1-flash-lite-image",
        "gemini-3-pro-image",
      ];

      let lastError: any = null;
      let response: any = null;

      for (const modelName of candidateModels) {
        try {
          response = await executeWithQuotaRetry(() =>
            ai.models.generateContent({
              model: modelName,
              contents: { parts },
              config: {
                imageConfig: {
                  aspectRatio: aspectRatio as any,
                },
              },
            })
          );
          if (response.candidates && response.candidates[0]?.content?.parts) {
            break; // Successfully got response
          }
        } catch (err: any) {
          console.warn(`Model ${modelName} failed:`, err?.message || err);
          lastError = err;
        }
      }

      if (!response && lastError) {
        throw lastError;
      }

      // Extract generated image
      let resultImageUrl = null;
      let resultText = "";

      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64Data = part.inlineData.data;
            const mime = part.inlineData.mimeType || "image/png";
            resultImageUrl = `data:${mime};base64,${base64Data}`;
          } else if (part.text) {
            resultText += part.text;
          }
        }
      }

      if (!resultImageUrl) {
        // Fallback: if model returned text response instead of image
        return res.status(500).json({
          error: "画像生成レスポンスが得られませんでした。" + (resultText ? ` メッセージ: ${resultText}` : ""),
        });
      }

      return res.json({
        success: true,
        imageUrl: resultImageUrl,
        description: resultText,
      });
    } catch (error: any) {
      console.error("Inpainting error:", error);
      const isQuota =
        error?.status === 429 ||
        error?.message?.includes("429") ||
        error?.message?.includes("RESOURCE_EXHAUSTED") ||
        error?.message?.includes("Quota exceeded");

      const friendlyMessage = isQuota
        ? "Gemini APIの短時間リクエスト制限（クォータ制限 429）に達しました。約15〜30秒ほど時間を置いてから、再度「実行」ボタンを押してください。"
        : error.message || "画像修正処理に失敗しました。";

      return res.status(isQuota ? 429 : 500).json({
        error: friendlyMessage,
        isQuotaExceeded: isQuota,
      });
    }
  });

  // Base Image Generation Endpoint (for creating a new image from prompt)
  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, aspectRatio = "1:1" } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "プロンプトを入力してください。" });
      }

      const ai = getGeminiAI();
      const candidateModels = [
        "gemini-3.1-flash-image",
        "gemini-3.1-flash-lite-image",
        "gemini-3-pro-image",
      ];

      let resultImageUrl = null;
      let lastError: any = null;

      for (const modelName of candidateModels) {
        try {
          const response = await executeWithQuotaRetry(() =>
            ai.models.generateContent({
              model: modelName,
              contents: {
                parts: [{ text: prompt }],
              },
              config: {
                imageConfig: {
                  aspectRatio: aspectRatio as any,
                },
              },
            })
          );
          if (response.candidates && response.candidates[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData) {
                const base64Data = part.inlineData.data;
                const mime = part.inlineData.mimeType || "image/png";
                resultImageUrl = `data:${mime};base64,${base64Data}`;
                break;
              }
            }
            if (resultImageUrl) break;
          }
        } catch (err: any) {
          console.warn(`Generate model ${modelName} failed:`, err?.message || err);
          lastError = err;
        }
      }

      // Fallback for base image generation: try imagen-3.0-generate-002 if gemini content models were rate-limited
      if (!resultImageUrl) {
        try {
          const imagenResp = await executeWithQuotaRetry(() =>
            ai.models.generateImages({
              model: "imagen-3.0-generate-002",
              prompt,
              config: {
                numberOfImages: 1,
                aspectRatio: aspectRatio as any,
                outputMimeType: "image/jpeg",
              },
            })
          );
          if (imagenResp.generatedImages?.[0]?.image?.imageBytes) {
            resultImageUrl = `data:image/jpeg;base64,${imagenResp.generatedImages[0].image.imageBytes}`;
          }
        } catch (imagenErr: any) {
          console.warn("Imagen fallback failed:", imagenErr?.message || imagenErr);
        }
      }

      if (!resultImageUrl) {
        if (lastError) throw lastError;
        return res.status(500).json({ error: "画像の生成に失敗しました。" });
      }

      return res.json({ success: true, imageUrl: resultImageUrl });
    } catch (error: any) {
      console.error("Image generation error:", error);
      const isQuota =
        error?.status === 429 ||
        error?.message?.includes("429") ||
        error?.message?.includes("RESOURCE_EXHAUSTED") ||
        error?.message?.includes("Quota exceeded");

      const friendlyMessage = isQuota
        ? "Gemini APIの短時間リクエスト制限（クォータ制限 429）に達しました。約15〜30秒ほど時間を置いてから再度お試しください。"
        : error.message || "画像生成エラー";

      return res.status(isQuota ? 429 : 500).json({ error: friendlyMessage, isQuotaExceeded: isQuota });
    }
  });

  // Ensure all unmatched /api/* requests return a JSON 404 instead of falling through to Vite HTML fallback
  app.all("/api/*", (req, res) => {
    res.status(404).json({ success: false, error: "API エンドポイントが見つかりません。" });
  });

  // Global API error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path && req.path.startsWith("/api/")) {
      console.error("API Error:", err);
      const status = err.status || err.statusCode || 500;
      return res.status(status).json({
        success: false,
        error: err.message || "サーバー内部エラーが発生しました。",
      });
    }
    next(err);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
