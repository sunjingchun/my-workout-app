"use client";

import { useState } from "react";
import {
  GenerateWorkoutPlanRequest,
  UserProfile,
  TrainingPreference,
  NutritionPreference,
  RecentTrainingRecord,
} from "@/types/workout";

type WorkoutFormProps = {
  loading: boolean;
  onSubmit: (input: GenerateWorkoutPlanRequest) => void;
};

export default function WorkoutForm({ loading, onSubmit }: WorkoutFormProps) {
  // ======= 基础信息 =======
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<UserProfile["gender"]>("男");
  const [trainingExperience, setTrainingExperience] =
    useState<UserProfile["trainingExperience"]>("未填写");

  // ======= 训练偏好 =======
  const [goal, setGoal] = useState<TrainingPreference["goal"]>("增肌为主");
  const [goalReference, setGoalReference] = useState<string>("");

  const [availableDaysPerWeek, setAvailableDaysPerWeek] =
    useState<string>("");
  const [sessionDurationMinutes, setSessionDurationMinutes] =
    useState<string>("");

  const [availableEquipment, setAvailableEquipment] = useState<string[]>([
    "哑铃",
  ]);
  const [jointLimitations, setJointLimitations] = useState<string>("");

  // ======= 饮食偏好 =======
  const [needDietPlan, setNeedDietPlan] = useState<boolean>(false);
  const [dietRestrictions, setDietRestrictions] = useState<string>("");

  // ======= 最近训练情况 =======
  const [hasRecentTraining, setHasRecentTraining] = useState<boolean>(false);
  const [recentDescription, setRecentDescription] = useState<string>("");

  // 多选器械的小工具函数
  const toggleEquipment = (value: string) => {
    setAvailableEquipment((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const userProfile: UserProfile = {
      age: age ? Number(age) : null,
      gender,
      trainingExperience,
      experienceLevel: trainingExperience, // ← 新增：照填即可
    };

    const trainingPreference: TrainingPreference = {
      goal,
      goalReference: goal === "练得像某个体型" ? goalReference : undefined,
      availableDaysPerWeek: availableDaysPerWeek
        ? Number(availableDaysPerWeek)
        : null,
      sessionDurationMinutes: sessionDurationMinutes
        ? Number(sessionDurationMinutes)
        : null,
      availableEquipment,
      jointLimitations,
    };

    const nutritionPreference: NutritionPreference = {
      needDietPlan,
      dietRestrictions,
    };

    const recentTrainingRecord: RecentTrainingRecord = {
      hasRecentTraining,
      recentDescription,
    };

    const payload: GenerateWorkoutPlanRequest = {
      userProfile,
      trainingPreference,
      nutritionPreference,
      recentTrainingRecord,
    };

    onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border rounded bg-gray-50 space-y-4"
    >
      <h2 className="text-xl font-semibold mb-2">基础信息 & 训练偏好</h2>
      <p className="text-xs text-gray-600">
        Day4：表单已经和类型系统打通。你填写的所有字段都会被组装成
        GenerateWorkoutPlanRequest，传给上层。现在先用 mock 计划响应，下一步再接 LLM。
      </p>

      {/* ===== 基础信息 ===== */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">年龄</label>
          <input
            type="number"
            min={10}
            max={80}
            placeholder="例如：38"
            className="w-full border rounded p-2 text-sm"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">性别</label>
          <select
            className="w-full border rounded p-2 text-sm"
            value={gender}
            onChange={(e) =>
              setGender(e.target.value as UserProfile["gender"])
            }
          >
            <option>男</option>
            <option>女</option>
            <option>其他/不方便透露</option>
            <option>未填写</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">训练经验</label>
          <select
            className="w-full border rounded p-2 text-sm"
            value={trainingExperience}
            onChange={(e) =>
              setTrainingExperience(
                e.target.value as UserProfile["trainingExperience"]
              )
            }
          >
            <option>完全新手</option>
            <option>有一点基础</option>
            <option>训练一年以上</option>
            <option>未填写</option>
          </select>
        </div>
      </div>

      {/* ===== 训练目标 ===== */}
      <div className="space-y-3 pt-2 border-t border-gray-200">
        <div>
          <label className="block text-sm font-medium mb-1">训练目标</label>
          <select
            className="w-full border rounded p-2 text-sm"
            value={goal}
            onChange={(e) =>
              setGoal(e.target.value as TrainingPreference["goal"])
            }
          >
            <option>增肌为主</option>
            <option>减脂为主</option>
            <option>健康维持/塑形</option>
            <option>练得像某个体型</option>
            <option>未填写</option>
          </select>
        </div>

        {goal === "练得像某个体型" && (
          <div>
            <label className="block text-xs font-medium mb-1">
              参考体型（可选）
            </label>
            <input
              type="text"
              placeholder="例如：像某位运动员/演员的体型"
              className="w-full border rounded p-2 text-sm"
              value={goalReference}
              onChange={(e) => setGoalReference(e.target.value)}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              每周可训练天数
            </label>
            <input
              type="number"
              min={1}
              max={7}
              placeholder="例如：3"
              className="w-full border rounded p-2 text-sm"
              value={availableDaysPerWeek || ""}
              onChange={(e) => setAvailableDaysPerWeek(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              单次训练时长（分钟）
            </label>
            <input
              type="number"
              min={20}
              max={120}
              placeholder="例如：60"
              className="w-full border rounded p-2 text-sm"
              value={sessionDurationMinutes || ""}
              onChange={(e) => setSessionDurationMinutes(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ===== 可用器械（多选） ===== */}
      <div className="space-y-2 pt-2 border-t border-gray-200">
        <label className="block text-sm font-medium mb-1">
          可用器械（可多选）
        </label>
        <div className="flex flex-wrap gap-2 text-xs">
          {["哑铃", "弹力带", "壶铃", "无器械", "跑步机/椭圆机"].map(
            (eq) => (
              <button
                key={eq}
                type="button"
                onClick={() => toggleEquipment(eq)}
                className={`px-3 py-1 rounded-full border ${
                  availableEquipment.includes(eq)
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                {eq}
              </button>
            )
          )}
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">
            关节限制（肩/膝/腰等，选填）
          </label>
          <textarea
            className="w-full border rounded p-2 text-sm"
            rows={2}
            placeholder="例如：肩膀有旧伤，避免过头推举；下背偶尔不适，硬拉重量保守一点。"
            value={jointLimitations}
            onChange={(e) => setJointLimitations(e.target.value)}
          />
        </div>
      </div>

      {/* ===== 饮食偏好 ===== */}
      <div className="space-y-2 pt-2 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <input
            id="needDiet"
            type="checkbox"
            checked={needDietPlan}
            onChange={(e) => setNeedDietPlan(e.target.checked)}
          />
          <label htmlFor="needDiet" className="text-sm">
            需要顺带给出饮食规划建议
          </label>
        </div>
        {needDietPlan && (
          <div>
            <label className="block text-xs font-medium mb-1">
              饮食禁忌 / 习惯（选填）
            </label>
            <textarea
              className="w-full border rounded p-2 text-sm"
              rows={2}
              placeholder="例如：不吃牛肉；少油少盐；不喝酒；不吃辛辣。"
              value={dietRestrictions}
              onChange={(e) => setDietRestrictions(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* ===== 最近训练情况 ===== */}
      <div className="space-y-2 pt-2 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <input
            id="hasRecent"
            type="checkbox"
            checked={hasRecentTraining}
            onChange={(e) => setHasRecentTraining(e.target.checked)}
          />
          <label htmlFor="hasRecent" className="text-sm">
            最近 2–3 周有规律训练
          </label>
        </div>
        {hasRecentTraining && (
          <div>
            <label className="block text-xs font-medium mb-1">
              最近训练大致情况（自由描述）
            </label>
            <textarea
              className="w-full border rounded p-2 text-sm"
              rows={3}
              placeholder="例如：一周 3 次，全身训练；硬拉 60kg 3×5，深蹲 50kg 3×5，卧推 40kg 3×5。感觉硬拉轻松、深蹲吃力。"
              value={recentDescription}
              onChange={(e) => setRecentDescription(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* 提交按钮 */}
      <button
        type="submit"
        className="w-full bg-black text-white p-3 rounded mt-4 disabled:opacity-60 text-sm"
        disabled={loading}
      >
        {loading ? "生成中…" : "生成训练计划（当前使用示例计划响应）"}
      </button>
    </form>
  );
}
