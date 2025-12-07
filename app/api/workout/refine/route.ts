// app/api/workout/refine/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const currentPlan = body.currentPlan;
    const refineMessage: string =
      body.refineMessage || body.refineText || body.refine || "";

    if (!currentPlan) {
      return NextResponse.json(
        { error: "缺少当前计划，无法微调" },
        { status: 400 }
      );
    }

    // 简单示例：在周总结里追加一段“根据你的反馈…”
    const updatedPlan = {
      ...currentPlan,
      weekSummary: `${currentPlan.weekSummary || "本周训练策略"}\n\n（根据你的反馈进行微调说明：${
        refineMessage || "未填写具体微调要求"
      }）`,
    };

    return NextResponse.json(updatedPlan);
  } catch (err: any) {
    console.error("[/api/workout/refine] 微调失败：", err);
    return NextResponse.json(
      { error: "微调训练计划失败（服务端异常）" },
      { status: 500 }
    );
  }
}
