// lib/ai/workoutPlanner.ts
import type { GenerateWorkoutPlanInput, WeeklyWorkoutPlan, NextSessionPlan, WorkoutRefineRequest } from "@/types/workout";
import { getFallbackPlan } from "./fallback";


/**
 * AI 调用配置
 */
const AI_BASE_URL = process.env.AI_BASE_URL || "https://api.gptsapi.net/v1";
const AI_API_KEY =
  process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "";
const AI_MODEL = process.env.AI_MODEL || "gpt-4.1-mini";

function assertAIConfig() {
  if (!AI_API_KEY) {
    throw new Error(
      "[AI Config] 缺少 AI_API_KEY / OPENAI_API_KEY，请在 .env.local 中配置"
    );
  }
}

/**
 * PromptBuilder
 * 把 GenerateWorkoutPlanInput → 转成模型能理解的提示词
 */
function buildPromptPayload(input: GenerateWorkoutPlanInput) {
  const {
    age,
    gender,
    goal,
    availableDays,
    equipments,
    jointLimits,
    experienceLevel,
    lastSessions,
    todayFeedback,
    needDiet,
    dietPreference,
  } = input;

  const systemContent = `
你是一名专业的力量与体能训练师（Strength & Conditioning Coach），
擅长为 40+ 岁的用户设计安全、循序渐进的家庭训练计划。

【安全规则】
1. 不安排高风险动作（如奥举类、翻转类、需要高度技巧的自由重量）。
2. RPE（主观用力程度）控制在 6–9：
   - 新手或有关节/旧伤：优先安排 RPE 6–7；
   - 有经验者：可安排少量 RPE 8–9，但不允许所有动作都 9。
3. 每个动作的组数控制在 3–6 组。
4. 如用户有关节问题（jointLimits），请避免直接负荷对应部位，改用低冲击或替代动作。
5. 每次训练需包含简单热身说明和训练后拉伸建议。

【输出格式（非常重要）】
1. 你必须只返回一个 JSON 字符串，不要输出任何解释文字、标题、Markdown、注释。
2. JSON 顶层结构为：
{
  "weekSummary": "string",
  "days": [
    {
      "day": "Monday",
      "focus": "string",
      "exercises": [
        {
          "name": "string",
          "sets": 4,
          "reps": "8-10",
          "rpe": 7,
          "tips": "string"
        }
      ],
      "cardio": {
        "type": "string",
        "durationMinutes": 20,
        "intensity": "string"
      },
      "notes": "string"
    }
  ]
}
3. 不要在 JSON 外写任何内容，不要加“总体策略：”“拆分方式：”等额外文字。
  `.trim();

  const userContent = `
用户信息：
- 年龄：${age ?? "未提供"}
- 性别：${gender || "未提供"}
- 训练目标：${goal || "综合健康"}
- 训练水平：${experienceLevel || "未提供"}
- 每周可训练天数：${availableDays || "未提供"}
- 可用器械：${equipments || "仅自重"}
- 关节限制 / 旧伤：${jointLimits || "无"}
- 最近训练情况：${lastSessions || "无特别记录"}
- 今日训练感受反馈：${todayFeedback || "无"}

饮食需求：
- 是否需要给出饮食建议：${needDiet ? "是" : "否"}
- 饮食偏好 / 忌口：${dietPreference || "未特别说明"}

请根据上述信息，为用户生成 1 周训练计划（Weekly Plan），并严格按照系统消息中给出的 JSON 结构返回。
  `.trim();

  return {
    model: AI_MODEL,
    input: [
      { role: "system", content: systemContent },
      { role: "user", content: userContent },
    ],
  };
}

/**
 * Safety Guard 工具函数
 */
function clamp(num: number, min: number, max: number) {
  return Math.max(min, Math.min(max, num));
}

/**
 * 对模型返回的计划做安全裁剪（RPE / sets / 有氧时长）
 * 这里使用 any，避免因为类型不完全匹配在这里再编译报错
 */
function sanitizePlan(plan: any) {
  if (!plan || !Array.isArray(plan.days)) return plan;

  return {
    ...plan,
    days: plan.days.map((day: any) => {
      const safeExercises = Array.isArray(day.exercises)
        ? day.exercises.map((ex: any) => {
            const rawSets =
              typeof ex.sets === "number" && Number.isFinite(ex.sets)
                ? ex.sets
                : 3;
            const rawRpe =
              typeof ex.rpe === "number" && Number.isFinite(ex.rpe)
                ? ex.rpe
                : 7;

            return {
              ...ex,
              sets: clamp(rawSets, 1, 6),
              rpe: clamp(rawRpe, 6, 9),
            };
          })
        : [];

      let safeCardio = null;
      if (day.cardio) {
        const rawDur =
          typeof day.cardio.durationMinutes === "number" &&
          Number.isFinite(day.cardio.durationMinutes)
            ? day.cardio.durationMinutes
            : 20;
        safeCardio = {
          ...day.cardio,
          durationMinutes: clamp(rawDur, 10, 60),
        };
      }

      return {
        ...day,
        exercises: safeExercises,
        cardio: safeCardio,
      };
    }),
  };
}

/**
 * 调用 gptsapi /v1/responses，并从 output 结构中提取文本 → 再 JSON.parse
 */
async function callLLM(promptPayload: any) {
  assertAIConfig();

  const resp = await fetch(`${AI_BASE_URL}/responses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(promptPayload),
  });

  const json = await resp.json();

  // 调试用：可以先看一下原始返回长什么样
  if (process.env.NODE_ENV === "development") {
    console.log("[LLM raw response]", JSON.stringify(json, null, 2));
  }

  let textContent: string | null = null;

  // 1) 优先从 json.output[0].content[...] 里找 output_text
  if (Array.isArray(json.output) && json.output.length > 0) {
    const firstOutput = json.output[0];
    if (firstOutput && Array.isArray(firstOutput.content)) {
      const textItem = firstOutput.content.find(
        (c: any) =>
          c &&
          (c.type === "output_text" || c.type === "text") &&
          typeof c.text === "string"
      );
      if (textItem) {
        textContent = textItem.text;
      }
    }
  }

  // 2) 某些代理可能会直接给 output_text
  if (!textContent && typeof json.output_text === "string") {
    textContent = json.output_text;
  }

  // 3) 再不行，就看看 json 本身是不是字符串
  if (!textContent && typeof json === "string") {
    textContent = json;
  }

  if (!textContent || !textContent.trim()) {
    console.error("[LLM] 没有拿到有效文本内容：", json);
    return null;
  }

  try {
    const parsed = JSON.parse(textContent);
    return parsed;
  } catch (e) {
    console.error("[LLM] JSON.parse 解析模型输出失败:", e, textContent);
    return null;
  }
}

/**
 * 主服务函数：生成训练计划
 * - 尝试调用 LLM
 * - 失败时使用 fallback
 * - 对结果做安全裁剪
 */
export async function generateWorkoutPlanService(
  input: GenerateWorkoutPlanInput
) {
  const startedAt = Date.now();
  const promptPayload = buildPromptPayload(input);

  try {
    const result = await callLLM(promptPayload);

    if (!result) {
      throw new Error("LLM 返回结果为空或解析失败");
    }

    const safePlan = sanitizePlan(result);

    if (process.env.NODE_ENV === "development") {
      console.log("[WorkoutPlan] LLM success, plan:", safePlan);
      console.log(
        "[WorkoutPlan] duration(ms):",
        Date.now() - startedAt
      );
    }

    return safePlan;
  } catch (error: any) {
    console.error(
      "[WorkoutPlan] LLM 调用失败，使用 fallback。原因：",
      error?.message || error
    );

    const fallback = getFallbackPlan(input);
    const safeFallback = sanitizePlan(fallback);

    if (process.env.NODE_ENV === "development") {
      console.log("[WorkoutPlan] fallback plan:", safeFallback);
    }

    return safeFallback;
  }
}

// ========= 微调整周计划：根据 feedback 生成新的 WeeklyWorkoutPlan =========

function buildRefinePromptPayload(req: WorkoutRefineRequest) {
  const { previousPlan, feedback } = req;

  const systemContent = `
你是一名专业力量与体能教练。
现在你已经为用户生成了一份一周训练计划 WeeklyWorkoutPlan，
用户给出了对这份计划的反馈（例如：某些动作太累、某些关节不适、希望增加/减少某类训练）。

你的任务是：
1. 在原有 WeeklyWorkoutPlan 的基础上做「微调」，不要完全推翻，整体结构尽量保持一致。
2. 对用户反馈中提到的关节不适/疲劳部位，要主动降低负荷或替换更安全的动作。
3. 整体训练量可以略微增减，但不要变化过大。
4. 你必须只返回 JSON 字符串，不要输出任何多余文字。

输出 JSON 结构必须为：WeeklyWorkoutPlan
{
  "weekSummary": "string",
  "days": [
    {
      "day": "string",
      "focus": "string",
      "exercises": [
        {
          "name": "string",
          "sets": 3,
          "reps": "8-10",
          "rpe": 7,
          "tips": "string"
        }
      ],
      "cardio": {
        "type": "string",
        "durationMinutes": 20,
        "intensity": "string"
      },
      "notes": "string"
    }
  ]
}
`.trim();

  const userContent = `
【当前的一周训练计划 WeeklyWorkoutPlan】
${JSON.stringify(previousPlan).slice(0, 3000)}

【用户希望微调的内容（feedback）】
${feedback}

请在上述 WeeklyWorkoutPlan 基础上，生成一份「微调后」的新 WeeklyWorkoutPlan，
并严格按照系统消息中给出的 WeeklyWorkoutPlan JSON 结构返回，只返回 JSON。
`.trim();

  return {
    model: AI_MODEL,
    input: [
      { role: "system", content: systemContent },
      { role: "user", content: userContent },
    ],
  };
}

// 对外暴露的服务：返回新的整周计划
export async function generateRefinedPlanService(
  req: WorkoutRefineRequest
): Promise<WeeklyWorkoutPlan> {
  const startedAt = Date.now();
  const payload = buildRefinePromptPayload(req);

  try {
    const result = await callLLM(payload);
    if (!result) {
      throw new Error("LLM 返回为空或解析失败");
    }

    const safePlan = sanitizePlan(result) as WeeklyWorkoutPlan;

    if (process.env.NODE_ENV === "development") {
      console.log("[RefinePlan] LLM success, new plan:", safePlan);
      console.log("[RefinePlan] duration(ms):", Date.now() - startedAt);
    }

    return safePlan;
  } catch (err: any) {
    console.error(
      "[RefinePlan] 生成微调计划失败，回退使用原计划：",
      err?.message || err
    );
    // 兜底：返回原来的计划，不让前端崩
    return req.previousPlan;
  }
}

// 解析结果 + 做简单安全裁剪
function sanitizeNextSessionPlan(plan: any): NextSessionPlan {
  if (!plan) {
    throw new Error("NextSessionPlan is empty");
  }

  const exercises = Array.isArray(plan.exercises) ? plan.exercises : [];

  const safeExercises = exercises.map((ex: any) => ({
    name: String(ex.name ?? "未命名动作"),
    sets: clamp(
      typeof ex.sets === "number" && Number.isFinite(ex.sets) ? ex.sets : 3,
      1,
      6
    ),
    reps: String(ex.reps ?? "8-10"),
    rpe: clamp(
      typeof ex.rpe === "number" && Number.isFinite(ex.rpe) ? ex.rpe : 7,
      6,
      9
    ),
    tips: ex.tips ? String(ex.tips) : undefined,
  }));

  let safeCardio = null;
  if (plan.cardio) {
    const dur =
      typeof plan.cardio.durationMinutes === "number" &&
      Number.isFinite(plan.cardio.durationMinutes)
        ? plan.cardio.durationMinutes
        : 20;
    safeCardio = {
      type: String(plan.cardio.type ?? "快走"),
      durationMinutes: clamp(dur, 10, 60),
      intensity: plan.cardio.intensity
        ? String(plan.cardio.intensity)
        : "中等强度",
    };
  }

  return {
    title: String(plan.title ?? "下一次训练计划"),
    focus: String(plan.focus ?? "综合力量与心肺"),
    warmup: plan.warmup ? String(plan.warmup) : undefined,
    exercises: safeExercises,
    cardio: safeCardio,
    notes: plan.notes ? String(plan.notes) : undefined,
  };
}

// 对外暴露的服务：生成下一次训练计划
export async function generateRefinedSessionService(
  req: WorkoutRefineRequest
): Promise<NextSessionPlan> {
  const startedAt = Date.now();
  const payload = buildRefinePromptPayload(req);

  try {
    const result = await callLLM(payload);
    if (!result) {
      throw new Error("LLM 返回为空");
    }

    const nextSession = sanitizeNextSessionPlan(result);

    if (process.env.NODE_ENV === "development") {
      console.log("[NextSession] LLM success:", nextSession);
      console.log(
        "[NextSession] duration(ms):",
        Date.now() - startedAt
      );
    }

    return nextSession;
  } catch (err: any) {
    console.error("[NextSession] 生成失败：", err?.message || err);

    // 兜底：从上一周里挑一天做个简单版
    const firstDay = req.previousPlan.days?.[0];
    const fallback: NextSessionPlan = {
      title: "下一次训练计划（fallback）",
      focus: firstDay?.focus ?? "全身基础力量",
      warmup: "先进行 5-10 分钟全身动态热身（关节活动 + 轻度有氧）。",
      exercises: [
        {
          name: "徒手深蹲",
          sets: 3,
          reps: "10-12",
          rpe: 7,
          tips: "动作缓慢、保持脊柱中立。",
        },
        {
          name: "俯卧撑（可用跪姿）",
          sets: 3,
          reps: "8-10",
          rpe: 7,
          tips: "核心收紧，动作可控。",
        },
      ],
      cardio: {
        type: "快走",
        durationMinutes: 20,
        intensity: "中等强度",
      },
      notes: "由于 AI 生成失败，本次训练为基础安全版计划。",
    };

    return fallback;
  }
}