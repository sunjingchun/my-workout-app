// lib/ai/config.ts
export const AI_BASE_URL =
  process.env.AI_BASE_URL || "https://api.gptsapi.net/v1";

export const AI_API_KEY =
  process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "";

export const AI_MODEL = process.env.AI_MODEL || "gpt-4.1-mini";

// 简单的配置检测（可选）
export function assertAIConfig() {
  if (!AI_API_KEY) {
    throw new Error(
      "[AI Config] Missing AI_API_KEY or OPENAI_API_KEY in environment variables"
    );
  }
}
