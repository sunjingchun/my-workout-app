// app/api/workout/refine/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateRefinedPlanService } from "@/lib/ai/workoutPlanner";
import type { WorkoutRefineRequest } from "@/types/workout";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as WorkoutRefineRequest;

    if (!body.previousPlan || !body.feedback) {
      return NextResponse.json(
        { error: "缺少 previousPlan 或 feedback 字段" },
        { status: 400 }
      );
    }

    const newPlan = await generateRefinedPlanService(body);

    return NextResponse.json(newPlan);
  } catch (err: any) {
    console.error("[/api/workout/refine] 生成微调计划失败：", err);
    return NextResponse.json(
      {
        error: "生成微调训练计划失败（服务端异常）",
        detail: String(err),
      },
      { status: 500 }
    );
  }
}
