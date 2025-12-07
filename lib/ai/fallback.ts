// lib/ai/fallback.ts
import type { GenerateWorkoutPlanInput } from "@/types/workout";

/**
 * 当大模型调用失败时的兜底训练计划
 * 保证返回结构与 WeeklyWorkoutPlan 兼容：{ weekSummary, days: [...] }
 */
export function getFallbackPlan(input: GenerateWorkoutPlanInput): any {
  const goal = input.goal || "综合健康";

  return {
    weekSummary: `基础一周训练计划（fallback，目标：${goal}）。本计划为安全保守版，仅在 AI 生成失败时使用。`,
    days: [
      {
        day: "Day 1",
        focus: "全身基础力量",
        exercises: [
          {
            name: "徒手深蹲",
            sets: 3,
            reps: "10-12",
            rpe: 7,
            tips: "保持脊柱中立，动作缓慢控制，下蹲不要超过自身活动度。",
          },
          {
            name: "俯卧撑（可用跪姿减轻难度）",
            sets: 3,
            reps: "8-10",
            rpe: 7,
            tips: "核心收紧，身体保持一直线，如感觉吃力可改跪姿。",
          },
          {
            name: "哑铃或弹力带划船",
            sets: 3,
            reps: "10-12",
            rpe: 7,
            tips: "注意用背发力而不是手臂，避免耸肩。",
          },
        ],
        cardio: {
          type: "快走或室内单车",
          durationMinutes: 20,
          intensity: "中等，可正常说话但略微气喘",
        },
        notes: "作为一周的起始训练日，训练后做下肢和胸背的简单拉伸。",
      },
      {
        day: "Day 2",
        focus: "主动恢复 / 轻活动",
        exercises: [],
        cardio: {
          type: "轻松步行或拉伸",
          durationMinutes: 20,
          intensity: "轻度",
        },
        notes: "以恢复为主，可进行肩颈、髋部、腰背舒展。",
      },
      {
        day: "Day 3",
        focus: "下肢 + 核心",
        exercises: [
          {
            name: "静态弓步蹲（如膝盖不适可缩小步幅或改半蹲）",
            sets: 3,
            reps: "8-10/侧",
            rpe: 7,
            tips: "注意膝盖不要大幅超过脚尖，动作缓慢可控。",
          },
          {
            name: "臀桥",
            sets: 3,
            reps: "12-15",
            rpe: 7,
            tips: "收紧臀部发力，避免腰部过度后仰。",
          },
          {
            name: "平板支撑",
            sets: 3,
            reps: "20-30 秒",
            rpe: 7,
            tips: "身体保持一直线，避免塌腰或撅臀。",
          },
        ],
        cardio: {
          type: "快走 / 室内单车",
          durationMinutes: 20,
          intensity: "中等",
        },
        notes: "训练后注意小腿、大腿前后侧和臀部拉伸。",
      },
      {
        day: "Day 4",
        focus: "休息或轻活动",
        exercises: [],
        cardio: null,
        notes: "可完全休息，或做 10-15 分钟轻度散步与简单拉伸。",
      },
    ],
  };
}
