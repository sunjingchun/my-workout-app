// types/workout.ts

// 🧩 用户输入结构（User Input DTO）
export interface GenerateWorkoutPlanInput {
  age: number | null;          // 年龄（允许 null，表示未填）
  gender: string;              // 性别
  goal: string;                // 训练目标（增肌/减脂/保持/练出某个体型）
  availableDays: string;       // 每周可训练时间（描述型文本即可）
  equipments: string;          // 可使用器械（哑铃/弹力带/自重等）
  jointLimits: string;         // 关节限制/伤病情况
  experienceLevel: string;     // 训练经验（新手/有经验）
  lastSessions: string;        // 最近 3 次训练记录（自由文本）
  todayFeedback: string;       // 当日训练反馈（自由文本）
  needDiet: boolean;           // 是否需要饮食建议
  dietPreference: string;      // 饮食偏好/禁忌
}

// 🧩 单个动作（Exercise）
export interface Exercise {
  name: string;        // 动作名称，例如：俯卧撑
  sets: number;        // 组数
  reps: number;        // 每组次数
  rpe: number;         // 主观用力程度 RPE（1–10）
  notes: string;       // 动作要点/注意事项
  equipment: string;   // 使用器械：自重/哑铃/弹力带/壶铃...
}

// 🧩 某一天的训练计划（Day Plan）
export interface DayPlan {
  dayLabel: string;    // 例如：Day 1 - 上肢推
  focus: string;       // 当天训练重点描述
  exercises: Exercise[]; // 当天所有动作列表
}

// 🧩 下一次训练日计划（Next Session Plan）
export interface NextSessionPlan {
  dayLabel: string;
  focus: string;
  exercises: Exercise[];
}

// 🧩 一周训练总计划（Weekly Workout Plan）
export interface WeeklyWorkoutPlan {
  strategySummary: string;     // 总体训练策略说明（2–3 句）
  frequencySuggestion: string; // 每周训练频率建议
  splitType: string;           // 训练拆分类型（全身/推拉腿/上肢下肢...）
  weeklyPlan: DayPlan[];       // 一周每天的训练安排
  nextSessionPlan: NextSessionPlan; // 下一次训练日的具体方案
  injuryWarnings: string;      // 伤病风险提示
  equipmentDisclaimer: string; // 器械/环境安全提示（居家训练注意事项）
}

// 一次训练的动作（可以复用你 WeeklyWorkoutPlan 里已有的类型）
export interface SessionExercise {
  name: string;
  sets: number;
  reps: string;
  rpe: number;
  tips?: string;
}

export interface NextSessionPlan {
  title: string;          // 比如 "下一次训练（全身基础力量）"
  focus: string;          // 主要训练目标
  warmup?: string;        // 热身建议
  exercises: SessionExercise[];
  cardio?: {
    type: string;
    durationMinutes: number;
    intensity?: string;
  } | null;
  notes?: string;         // 额外注意事项
}

// ✅ 新增：微调请求（Refine Request）
export interface WorkoutRefineRequest {
  previousPlan: WeeklyWorkoutPlan; // 当前右侧显示的计划
  feedback: string;                // 用户输入的微调需求
}