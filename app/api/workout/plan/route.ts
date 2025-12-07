// app/api/workout/plan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateWorkoutPlanService } from "@/lib/ai/workoutPlanner"; // ✅ 这里要用 Service
import type { GenerateWorkoutPlanInput } from "@/types/workout";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as any;

    // 年龄
    const ageNum = Number(body.age);
    const safeAge = Number.isFinite(ageNum) ? ageNum : null;

    // 每周可训练天数
    const daysNum = Number(body.availableDays);
    const safeDays = Number.isFinite(daysNum) ? daysNum : 3;

    const input: GenerateWorkoutPlanInput = {
      age: safeAge,
      gender: body.gender || "",
      goal: body.goal || "",
      availableDays: safeDays,
      equipments: body.equipments || "",
      jointLimits: body.jointLimits || "",
      experienceLevel: body.experienceLevel || "",
      lastSessions: body.lastSessions || "",
      todayFeedback: body.todayFeedback || "",
      needDiet:
        body.needDiet === true ||
        body.needDiet === "true" ||
        body.needDiet === "on",
      dietPreference: body.dietPreference || "",
    };

    const plan = await generateWorkoutPlanService(input);

    return NextResponse.json(plan);
  } catch (err: any) {
    console.error("[/api/workout/plan] 生成失败：", err);

    return NextResponse.json(
      {
        error: "生成训练计划失败（服务端异常）",
        detail: String(err),
      },
      { status: 500 }
    );
  }
}
