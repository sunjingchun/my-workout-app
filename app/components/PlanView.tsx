"use client";

import type { WeeklyWorkoutPlan } from "@/types/workout";

interface PlanViewProps {
  plan: WeeklyWorkoutPlan | null;
  loading?: boolean;
}

export default function PlanView({ plan, loading }: PlanViewProps) {
  return (
    <section className="p-4 border rounded bg-gray-50 h-full overflow-y-auto">
      <h2 className="text-xl font-semibold mb-2">训练计划预览</h2>

      {/* 加载中 */}
      {loading && (
        <p className="text-sm text-gray-500">正在生成或微调训练计划，请稍候…</p>
      )}

      {/* 尚未生成计划 */}
      {!loading && !plan && (
        <p className="text-sm text-gray-500">
          尚未生成训练计划，请先在左侧填写信息并点击「生成训练计划」。
        </p>
      )}

      {/* 有计划但 days 为空（极端情况） */}
      {!loading && plan && (!plan.days || plan.days.length === 0) && (
        <div className="space-y-2 text-sm">
          <h3 className="font-semibold">总体策略</h3>
          <p>{plan.weekSummary}</p>
          <p className="text-gray-500">
            （当前示例计划暂未提供详细周计划。）
          </p>
        </div>
      )}

      {/* 正常周计划展示 */}
      {!loading && plan && plan.days && plan.days.length > 0 && (
        <div className="space-y-4 text-sm">
          {/* 总体策略 */}
          <div className="space-y-1">
            <h3 className="font-semibold">总体策略</h3>
            <p>{plan.weekSummary}</p>
          </div>

          {/* 每日计划 */}
          <div className="space-y-4">
            {plan.days.map((day, idx) => (
              <div
                key={idx}
                className="border rounded p-3 bg-white shadow-sm space-y-2"
              >
                <h4 className="font-semibold text-base">
                  {day.dayLabel || `Day ${idx + 1}`} · {day.focus}
                </h4>

                {/* 热身 */}
                {day.warmup && (
                  <p className="text-gray-700">
                    <span className="font-semibold">热身：</span>
                    {day.warmup}
                  </p>
                )}

                {/* 力量训练动作列表 */}
                {day.exercises && day.exercises.length > 0 && (
                  <div className="space-y-1">
                    <p className="font-semibold">力量训练：</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {day.exercises.map((ex, i) => (
                        <li key={i}>
                          <span className="font-semibold">{ex.name}</span>
                          {` — ${ex.sets} 组 × ${ex.reps} 次`}
                          {ex.rpe && `，RPE ${ex.rpe}`}
                          {ex.tips && `（${ex.tips}）`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 有氧部分 */}
                {day.cardio && (
                  <p className="text-gray-700">
                    <span className="font-semibold">有氧：</span>
                    {day.cardio.type} · {day.cardio.durationMinutes} 分钟
                    {day.cardio.intensity && ` · ${day.cardio.intensity}`}
                  </p>
                )}

                {/* 备注 */}
                {day.notes && (
                  <p className="text-gray-500 text-xs">
                    <span className="font-semibold">备注：</span>
                    {day.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
