"use client";

import { useState } from "react";
import WorkoutForm from "@/app/components/WorkoutForm";
import RefineForm from "@/app/components/RefineForm";
import { PlanView } from "@/app/components/PlanView";
import {
  WeeklyWorkoutPlan,
  GenerateWorkoutPlanRequest,
} from "@/types/workout";

export default function WorkoutPage() {
  const [plan, setPlan] = useState<WeeklyWorkoutPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePlan = async (formData: GenerateWorkoutPlanRequest) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/workout/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "生成失败");

      setPlan(data);
    } catch (err: any) {
      setError(err.message || "生成失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">AI 家用训练计划助手（Beta）</h1>

        {error && <p className="text-sm text-red-600">错误：{error}</p>}

        <div className="grid md:grid-cols-2 gap-8 mt-8">
          {/* 左侧：表单 + 微调 */}
          <div className="space-y-6">
            <WorkoutForm loading={loading} onSubmit={handleGeneratePlan} />

            {/* 微调组件：将新的计划回传给 page.tsx → setPlan */}
            <RefineForm previousPlan={plan} onRefined={(newPlan) => setPlan(newPlan)} />
          </div>

          {/* 右侧：计划预览（始终展示当前 plan） */}
          <PlanView plan={plan} loading={loading} />
        </div>
      </div>
    </main>
  );
}
