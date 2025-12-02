"use client";

import { useState } from "react";
import WorkoutForm from "@/app/components/WorkoutForm";
import PlanView from "@/app/components/PlanView";
import {
  WeeklyWorkoutPlan,
  GenerateWorkoutPlanRequest,
} from "@/types/workout";


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
