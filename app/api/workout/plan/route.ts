// app/api/workout/plan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateWorkoutPlanService } from "@/lib/ai/workoutPlanner";
import {
  GenerateWorkoutPlanInput,
  GenerateWorkoutPlanRequest,
} from "@/types/workout";

function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateWorkoutPlanRequest;

    const { userProfile, trainingPreference, nutritionPreference, recentTrainingRecord } = body;

    // ===== 安全处理可训练天数 =====
    const rawDays =
      trainingPreference.availableDaysPerWeek != null
        ? trainingPreference.availableDaysPerWeek
        : 3;
    const safeDays = clamp(
      Number.isFinite(rawDays) ? rawDays : 3,
      1,
      7
    );

    // ===== 映射成 AI 层使用的 GenerateWorkoutPlanInput =====
    const input: GenerateWorkoutPlanInput = {
      age: userProfile.age,
      gender: userProfile.gender || "",
      goal: trainingPreference.goal || "",

      // AI 层定义为 string，这里统一转成字符串
      availableDays: String(safeDays),

      // 器械数组合成一个字符串，例："哑铃,弹力带"
      equipments: (trainingPreference.availableEquipment || []).join(", "),

      // 关节限制/旧伤
      jointLimits: trainingPreference.jointLimitations || "",

      // 训练经验：优先 experienceLevel，其次 trainingExperience
      experienceLevel:
        userProfile.experienceLevel ||
        userProfile.trainingExperience ||
        "",

      // 最近训练情况：有训练就用描述，没有就在这里写“近期没有系统训练”
      lastSessions: recentTrainingRecord.hasRecentTraining
        ? recentTrainingRecord.recentDescription || ""
        : "近期没有系统训练",

      // 目前我们没有单独“今天状态”字段，就先留空或后续再加字段映射
      todayFeedback: "",

      // 饮食偏好映射
      needDiet:
        typeof nutritionPreference.needDietPlan === "boolean"
          ? nutritionPreference.needDietPlan
          : !!nutritionPreference.needDiet,

      dietPreference:
        nutritionPreference.dietRestrictions ||
        nutritionPreference.dietPreference ||
        "",
    };

    const plan = await generateWorkoutPlanService(input);

    return NextResponse.json(plan);
  } catch (err: any) {
    console.error("[/api/workout/plan] 生成失败：", err);

    return NextResponse.json(
      { error: err.message || "生成训练计划失败（服务端异常）" },
      { status: 500 }
    );
  }
}
