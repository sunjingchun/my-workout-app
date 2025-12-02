"use client";

import { WeeklyWorkoutPlan } from "@/types/workout";

type PlanViewProps = {
  plan: WeeklyWorkoutPlan | null;
  loading: boolean;
};

export default function PlanView({ plan, loading }: PlanViewProps) {
  // ① 没有计划的情况，直接显示占位，不去 map
  if (!plan) {
    return (
      <div className="p-4 border rounded bg-white space-y-4 min-h-[260px]">
        <h2 className="text-xl font-semibold mb-2">训练计划预览</h2>
        <p className="text-gray-500 text-sm">
          {loading
            ? "正在根据你的信息生成训练计划，请稍候…"
            : "左侧填写基础信息并点击「生成训练计划」，这里会展示你的周训练安排与下一次训练日。"}
        </p>
      </div>
    );
  }

  // ② 有计划，但内部某些字段可能缺失，全部兜底
  const weeklyDays = plan.weeklyPlan ?? [];
  const nextSession = plan.nextSessionPlan;
  const nextExercises = nextSession?.exercises ?? [];

  return (
    <div className="p-4 border rounded bg-white space-y-4 min-h-[260px]">
      <h2 className="text-xl font-semibold mb-2">训练计划预览</h2>

      {/* 总体策略 */}
      <div className="space-y-1 text-sm">
        <p className="font-medium text-gray-800">总体策略</p>
        <p className="text-gray-700">{plan.strategySummary}</p>
        <p className="text-gray-700">{plan.frequencySuggestion}</p>
        <p className="text-gray-600 text-xs mt-1">拆分方式：{plan.splitType}</p>
      </div>

      {/* 周计划列表 */}
      <div className="space-y-3">
        <p className="font-medium text-sm text-gray-800">本周训练日安排</p>
        {weeklyDays.length === 0 && (
          <p className="text-xs text-gray-500">
            （当前示例计划暂未提供详细周计划。）
          </p>
        )}
        {weeklyDays.map((day, idx) => (
          <div
            key={idx}
            className="border rounded-lg p-3 bg-gray-50 space-y-1 text-sm"
          >
            <p className="font-semibold text-gray-900">{day.dayLabel}</p>
            <p className="text-gray-700 text-xs mb-1">{day.focus}</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-gray-800">
              {(day.exercises ?? []).map((ex, i) => (
                <li key={i}>
                  <span className="font-medium">{ex.name}</span>{" "}
                  — {ex.sets} 组 × {ex.reps} 次
                  {ex.rpe ? `（主观强度 RPE ${ex.rpe}）` : ""}
                  {ex.notes ? `｜${ex.notes}` : ""}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* 下一次训练日 */}
      {nextSession && (
        <div className="space-y-2">
          <p className="font-medium text-sm text-gray-800">下一次训练日建议</p>
          <div className="border rounded-lg p-3 bg-indigo-50 space-y-1 text-sm">
            <p className="font-semibold text-indigo-900">
              {nextSession.dayLabel}
            </p>
            <p className="text-indigo-800 text-xs mb-1">{nextSession.focus}</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-indigo-900">
              {nextExercises.map((ex, i) => (
                <li key={i}>
                  <span className="font-medium">{ex.name}</span>{" "}
                  — {ex.sets} 组 × {ex.reps} 次
                  {ex.rpe ? `（RPE ${ex.rpe}）` : ""}
                  {ex.notes ? `｜${ex.notes}` : ""}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 伤病提醒 & 器械免责声明 */}
      <div className="space-y-2 text-xs">
        {plan.injuryWarnings && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="font-semibold text-yellow-800">伤病规避提醒</p>
            <p className="text-yellow-800 mt-1">{plan.injuryWarnings}</p>
          </div>
        )}
        {plan.equipmentDisclaimer && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-600">
            {plan.equipmentDisclaimer}
          </div>
        )}
      </div>
    </div>
  );
}
