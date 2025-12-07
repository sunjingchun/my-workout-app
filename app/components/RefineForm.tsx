// app/components/RefineForm.tsx
"use client";

import { useState } from "react";
import type { WeeklyWorkoutPlan } from "@/types/workout";

interface RefineFormProps {
  previousPlan: WeeklyWorkoutPlan | null;
  onRefined: (newPlan: WeeklyWorkoutPlan) => void;
}

export default function RefineForm({ previousPlan, onRefined }: RefineFormProps) {
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefine = async () => {
    if (!previousPlan) {
      alert("请先生成一份训练计划，再进行微调。");
      return;
    }
    if (!feedback.trim()) {
      alert("请先在输入框中写下你想微调的内容。");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        previousPlan,
        feedback,
      };

      const res = await fetch("/api/workout/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "微调计划生成失败");
      }

      onRefined(data); // 通知父组件，用新计划替换旧计划
    } catch (err: any) {
      console.error("微调失败：", err);
      setError(err.message || "微调失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded bg-gray-50 space-y-4">
      <h2 className="text-lg font-semibold">微调当前训练计划</h2>

      <p className="text-xs text-gray-600">
        例子：<br />
        · 深蹲有点重，想整体把下肢动作强度稍微降一点；<br />
        · 膝盖有点不适，去掉跳跃类动作；<br />
        · 上肢感觉太轻，可以把推举类动作增加一组。
      </p>

      <textarea
        rows={3}
        className="w-full border rounded px-2 py-1 text-sm"
        placeholder="写下你对当前计划的微调需求…"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      />

      <button
        type="button"
        onClick={handleRefine}
        disabled={loading}
        className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm disabled:opacity-60"
      >
        {loading ? "微调中…" : "微调当前计划"}
      </button>

      {error && <p className="text-xs text-red-600">错误：{error}</p>}
    </div>
  );
}
