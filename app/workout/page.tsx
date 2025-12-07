"use client";

import { useState } from "react";
import WorkoutForm from "@/app/components/WorkoutForm";
import PlanView from "@/app/components/PlanView";
import RefineForm from "@/app/components/RefineForm";
import type { WeeklyWorkoutPlan, GenerateWorkoutPlanRequest } from "@/types/workout";

export default function WorkoutPage() {
  // 右侧展示的 AI 周计划
  const [plan, setPlan] = useState<WeeklyWorkoutPlan | null>(null);
  // 生成计划 loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 微调相关状态
  const [refining, setRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);

  /**
   * 生成训练计划（Day5 / Day6）
   */
  const handleGeneratePlan = async (formData: GenerateWorkoutPlanRequest) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/workout/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        let msg = "生成失败";
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      const data: WeeklyWorkoutPlan = await res.json();
      console.log("前端拿到的周计划:", data);
      setPlan(data);
    } catch (err: any) {
      console.error("前端生成失败：", err);
      setError(err.message || "生成失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 微调当前计划（Day8）
   * refineText：用户在微调输入框里的文字
   */
  const handleRefinePlan = async (refineText: string) => {
    if (!plan) return; // 没有计划时不允许微调

    setRefining(true);
    setRefineError(null);

    try {
      const res = await fetch("/api/workout/refine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPlan: plan,
          refineMessage: refineText,
        }),
      });

      if (!res.ok) {
        let msg = "微调失败";
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      const newPlan: WeeklyWorkoutPlan = await res.json();
      console.log("微调后的新计划:", newPlan);
      setPlan(newPlan); // ✅ 用新计划覆盖老计划，右侧立即刷新
    } catch (err: any) {
      console.error("前端微调失败：", err);
      setRefineError(err.message || "微调失败，请稍后重试");
    } finally {
      setRefining(false);
    }
  };

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 标题 */}
        <h1 className="text-3xl font-bold">AI 家用重训 & 有氧训练计划助手（Beta）</h1>

        {/* 简短说明 */}
        <p className="text-gray-700">
          输入基础信息后，系统会为你生成一套适合居家训练的「周计划 + 日常训练方案」。
          当前阶段我们重点完成：表单 → 类型 → 请求对象 → API → 结果展示 → 计划微调 的闭环。
        </p>

        {/* 错误提示（生成计划） */}
        {error && <p className="text-sm text-red-600">错误：{error}</p>}

        {/* 免责声明 */}
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
          <p className="text-sm text-yellow-700">
            注意：本工具仅用于训练规划参考，不构成专业医疗或康复建议。如有既往伤病，请优先遵从医生或康复师意见。
          </p>
        </div>

        {/* 主体布局：左表单 + 右计划展示 */}
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          {/* 左侧：表单 + 微调输入框 */}
          <div className="space-y-6">
            <WorkoutForm loading={loading} onSubmit={handleGeneratePlan} />

            {/* 微调表单：放在生成按钮下面 */}
            <RefineForm
              disabled={!plan}
              loading={refining}
              error={refineError}
              onRefine={handleRefinePlan}
            />
          </div>

          {/* 右侧：计划展示 */}
          <PlanView plan={plan} loading={loading || refining} />
        </div>
      </div>
    </main>
  );
}
