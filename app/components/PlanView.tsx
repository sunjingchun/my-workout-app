// app/components/PlanView.tsx
"use client";

import React from "react";
import type { WeeklyWorkoutPlan } from "@/types/workout";

interface PlanViewProps {
  plan: WeeklyWorkoutPlan | null;
  loading: boolean;
}

export function PlanView({ plan, loading }: PlanViewProps) {
  return (
    <div className="p-4 border rounded bg-gray-50 space-y-4">
      {/* 标题 */}
      <h2 className="text-xl font-semibold">训练计划预览</h2>

      {/* 加载中 */}
      {loading && (
        <p className="text-gray-500">正在生成训练计划，请稍候…</p>
      )}

      {/* 尚未生成计划 */}
      {!loading && !plan && (
        <p className="text-gray-500">
          尚未生成训练计划，请先在左侧填写信息并点击「生成训练计划」。
        </p>
      )}

      {/* 有计划但 days 为空（极端情况） */}
      {!loading && plan && (!plan.days || plan.days.length === 0) && (
        <div className="space-y-2">
          <h3 className="font-semibold">总体策略</h3>
          <p>{plan.weekSummary}</p>
          <p className="text-gray-500 text-sm">
            （当前计划暂无详细日程安排。）
          </p>
        </div>
      )}

      {/* 正常情况：有 weekSummary + days */}
      {!loading && plan && plan.days && plan.days.length > 0 && (
        <div className="space-y-4">
          {/* 总体策略 */}
          <section className="space-y-1">
            <h3 className="font-semibold">总体策略</h3>
            <p>{plan.weekSummary}</p>
          </section>

          {/* 本周训练日安排 */}
          <section className="space-y-2">
            <h3 className="font-semibold">本周训练日安排</h3>

            <div className="space-y-3">
              {plan.days.map((day) => (
                <div
                  key={day.day}
                  className="border border-gray-200 rounded p-3 bg-white"
                >
                  <h4 className="font-semibold mb-1">
                    {day.day} · {day.focus}
                  </h4>

                  {/* 力量训练动作列表 */}
                  <ul className="list-disc pl-5 space-y-1">
                    {day.exercises.map((ex) => (
                      <li key={`${day.day}-${ex.name}-${ex.reps}`}>
                        <span className="font-medium">{ex.name}</span>
                        {` — ${ex.sets} 组 × ${ex.reps} 次，RPE ${ex.rpe}`}
                        {ex.tips ? `（${ex.tips}）` : null}
                      </li>
                    ))}
                  </ul>

                  {/* 有氧部分 */}
                  {day.cardio && (
                    <p className="mt-2 text-sm">
                      <span className="font-medium">有氧：</span>
                      {day.cardio.type} · {day.cardio.durationMinutes} 分钟 ·{" "}
                      {day.cardio.intensity || "强度自控"}
                    </p>
                  )}

                  {/* 备注 */}
                  {day.notes && (
                    <p className="mt-2 text-xs text-gray-600">
                      备注：{day.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
