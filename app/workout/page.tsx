"use client";

import { useState } from "react";
import WorkoutForm from "@/app/components/WorkoutForm";
import PlanView from "@/app/components/PlanView";
import {
  WeeklyWorkoutPlan,
  GenerateWorkoutPlanRequest,
} from "@/types/workout";

// 还是沿用你原来的 mockPlan（我略掉内容，只保留结构提示）
const mockPlan: WeeklyWorkoutPlan = {
  strategySummary:
    "家用器械（哑铃 + 徒手）三天训练：推 / 拉 / 腿，配合 2–3 次低强度有氧，目标是增肌 + 体脂略微下降。",
  frequencySuggestion: "建议每周 3 天力量训练 + 2 次 30 分钟散步/慢跑有氧。",
  splitType: "Push / Pull / Legs（三分化）",
  weeklyPlan: [
    // ... 这里保留你之前的 Day1/Day2/Day3 计划 ...
  ],
  nextSessionPlan: {
    // ... 你之前写的 nextSessionPlan ...
  },
  injuryWarnings:
    "如出现明显关节疼痛（刺痛/卡顿感），立即停止相关动作，改用更加温和的替代动作，并优先确认动作标准；持续不适请咨询医生或康复师。",
  equipmentDisclaimer:
    "本计划默认在家中使用基础器械（哑铃、弹力带、徒手），无教练一对一指导。请根据自身情况选择合适重量，确保动作可控，不要为了追求重量牺牲动作质量。",
};

export default function WorkoutPage() {
  const [plan, setPlan] = useState<WeeklyWorkoutPlan | null>(null);
  const [loading, setLoading] = useState(false);

  // Day5：接收表单生成的请求对象，调用 API / LLM
const handleGeneratePlan = async (input: GenerateWorkoutPlanRequest) => {
  setLoading(true);
  setPlan(null);

  try {
    const res = await fetch("/api/workout/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      throw new Error("生成失败");
    }

    const data = await res.json();

    setPlan(data);
  } catch (err) {
    console.error("前端生成失败：", err);
    alert("生成计划失败，请稍后重试。");
  } finally {
    setLoading(false);
  }
};


  return (
    <main className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 标题 */}
        <h1 className="text-3xl font-bold">
          AI 家用重训 & 有氧训练计划助手（Beta）
        </h1>

        {/* 简短说明 */}
        <p className="text-gray-700">
          输入基础信息后，系统会为你生成一套适合居家训练的「周计划 + 下一次训练日方案」。
          当前阶段（Day4）我们重点完成：表单 → 类型 → 请求对象的闭环，对应的结果仍使用示例计划。
        </p>

        {/* 免责声明 */}
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
          <p className="text-sm text-yellow-700">
            注意：本工具仅用于训练规划参考，不构成专业医疗或康复建议。如有既往伤病，请优先遵从医生或康复师意见。
          </p>
        </div>

        {/* 主体布局：左表单 + 右计划展示 */}
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          {/* 左侧：表单（Day4 版，返回结构化请求对象） */}
          <WorkoutForm loading={loading} onSubmit={handleGeneratePlan} />

          {/* 右侧：计划展示 */}
          <PlanView plan={plan} loading={loading} />
        </div>
      </div>
    </main>
  );
}
