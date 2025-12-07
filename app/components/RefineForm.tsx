"use client";

import React, { useState } from "react";

interface RefineFormProps {
  disabled?: boolean;
  loading?: boolean;
  error?: string | null;
  onRefine: (refineText: string) => Promise<void> | void;
}

export default function RefineForm({
  disabled,
  loading,
  error,
  onRefine,
}: RefineFormProps) {
  const [text, setText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await onRefine(text.trim());
    // 不强制清空，你可以根据习惯改成 setText("")
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border rounded bg-gray-50 space-y-3"
    >
      <h3 className="text-lg font-semibold">对当前计划做微调</h3>
      <p className="text-xs text-gray-500">
        例：&ldquo;周一的动作太多了，改成 3 个动作，每个 3 组即可&rdquo;、
        &ldquo;有膝盖伤史，深蹲改成臀桥 + 硬拉&rdquo; 等。
      </p>

      <textarea
        className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/40"
        rows={3}
        placeholder="在这里写下你想微调的地方……"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled || loading}
      />

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={disabled || loading}
        className="px-4 py-2 rounded bg-black text-white text-sm disabled:bg-gray-400"
      >
        {loading ? "正在微调…" : "微调当前计划"}
      </button>

      {disabled && (
        <p className="text-[11px] text-gray-400">
          请先在上方生成一份训练计划，再进行微调。
        </p>
      )}
    </form>
  );
}
