import { NextResponse } from "next/server";
import {
  GenerateWorkoutPlanRequest,
  WeeklyWorkoutPlan,
} from "@/types/workout";

// ===== Day5：直接在 API 里写简单 Prompt，可运行 =====

const buildPrompt = (input: GenerateWorkoutPlanRequest) => {
  return `
你是一名资深健身教练，擅长给「在家训练」的人提供科学训练方案。

请根据以下用户信息，生成一个结构化、严格 JSON 格式的训练计划。

【用户信息】
- 年龄：${input.userProfile.age ?? "未填写"}
- 性别：${input.userProfile.gender}
- 训练经验：${input.userProfile.trainingExperience}

【训练偏好】
- 目标：${input.trainingPreference.goal}
- 目标参考体型：${input.trainingPreference.goalReference ?? "无"}
- 每周可训练天数：${input.trainingPreference.availableDaysPerWeek ?? "未填写"}
- 单次训练时长：${input.trainingPreference.sessionDurationMinutes ?? "未填写"} 分钟
- 可用器械：${input.trainingPreference.availableEquipment.join("、")}
- 关节限制：${input.trainingPreference.jointLimitations || "无"}

【饮食偏好】
- 是否需要饮食规划：${input.nutritionPreference.needDietPlan}
- 饮食限制：${input.nutritionPreference.dietRestrictions || "无"}

【最近训练】
- 最近是否训练：${input.recentTrainingRecord.hasRecentTraining}
- 最近训练描述：${input.recentTrainingRecord.recentDescription || "无"}

请以严格 JSON 格式回答，必须符合以下 TypeScript 类型：

{
  "strategySummary": string,
  "frequencySuggestion": string,
  "splitType": string,
  "weeklyPlan": [
    {
      "dayLabel": string,
      "focus": string,
      "exercises": [
        {
          "name": string,
          "sets": number,
          "reps": number,
          "rpe": number,
          "notes": string,
          "equipment": string
        }
      ]
    }
  ],
  "nextSessionPlan": {
    "dayLabel": string,
    "focus": string,
    "exercises": [
      {
        "name": string,
        "sets": number,
        "reps": number,
        "rpe": number,
        "notes": string,
        "equipment": string
      }
    ]
  },
  "injuryWarnings": string,
  "equipmentDisclaimer": string
}

不要包含任何 JSON 外的解释，不要用 Markdown。
仅输出 JSON！
`;
};

// ===================================================
// Day5：最小可运行 LLM 调用
// 你可以用 OpenAI / Qwen / DeepSeek 任意模型
// ===================================================

// 如果你用 OpenAI（推荐最快上手）
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const MODEL = "gpt-4o-mini";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateWorkoutPlanRequest;

    const prompt = buildPrompt(body);

    // ============ 调用 OpenAI =============
    const completion = await fetch("https://api.gptsapi.net/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: "你是专业健身教练，擅长结构化 JSON 输出。" },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
      }),
    });

    const result = await completion.json();

    let raw = result.choices?.[0]?.message?.content ?? "{}";

    // Day5：简单 JSON parse（Day6 再写健壮 parser）
    let parsed: WeeklyWorkoutPlan;

    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      // 如果模型输出前后多了文本，尝试提取 {...}
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("模型输出非 JSON。");
      parsed = JSON.parse(match[0]);
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("API ERROR:", err);
    return NextResponse.json(
      { error: err.message || "生成训练计划失败" },
      { status: 500 }
    );
  }
}
