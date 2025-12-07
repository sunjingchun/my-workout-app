// lib/ai/logger.ts

export interface LLMLogEntry {
  timestamp: string;
  route: string;             // 比如 "/api/workout/plan"
  model: string;
  success: boolean;
  durationMs?: number;
  errorMessage?: string;

  // 下面这些字段不要太大，尽量截断
  requestInputPreview?: any;
  responseOutputPreview?: any;
}

export function logLLMCall(entry: LLMLogEntry) {
  // 生产环境可以只打错误日志，或接第三方服务
  if (process.env.NODE_ENV === "production") {
    if (!entry.success) {
      console.error("[LLM][ERROR]", JSON.stringify(entry, null, 2));
    }
    return;
  }

  // 开发环境：完整打印便于调试
  console.log("[LLM][CALL]", JSON.stringify(entry, null, 2));
}
