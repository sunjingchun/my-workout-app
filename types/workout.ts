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

// 前端发给 /api/workout/plan 的请求体（嵌套结构）
// —— WorkoutForm 现在就是按这个结构构造 payload 的
export interface GenerateWorkoutPlanRequest {
  userProfile: UserProfile;
  trainingPreference: TrainingPreference;
  nutritionPreference: NutritionPreference;
  recentTrainingRecord: RecentTrainingRecord;
}

// 单个动作
export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rpe: number;
  tips?: string;
}

// 单个训练日
export interface DayPlan {
  // 可选的展示标签，比如 "Monday" / "周一" / "Day 1"
  dayLabel?: string;

  title: string;
  focus: string;
  warmup?: string;
  exercises: Exercise[];
  cardio?: {
    type: string;
    durationMinutes: number;
    intensity?: string;
  } | null;
  notes?: string;
}

// 一周训练计划（PlanView 和后端 API 都在用这个结构）
export interface WeeklyWorkoutPlan {
  weekSummary: string;  // 总体策略
  days: DayPlan[];      // 一周的训练日数组
}

export interface NextSessionPlan {
  // 可选标签，比如 "周三训练日"
  dayLabel?: string;

  title: string;
  focus: string;
  warmup?: string;
  exercises: SessionExercise[];
  cardio?: {
    type: string;
    durationMinutes: number;
    intensity?: string;
  } | null;
  notes?: string;
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

// 用户基本信息
export interface UserProfile {
  age: number | null;          // 年龄
  gender: string;              // 性别："男" | "女" | 其他

  // 训练经验：为了兼容之前的代码，同时保留两个字段名
  experienceLevel: string;     // 供后端 / 请求体使用
  trainingExperience: string;  // 供前端表单（WorkoutForm）使用
}

// 与 WorkoutForm.tsx 完全对齐的训练偏好类型
export interface TrainingPreference {
  goal: string;                     // 训练目标
  goalReference?: string;           // 体型参考（仅在 goal == 某个体型 时）

  availableDaysPerWeek: number | null;   // 每周几天训练
  sessionDurationMinutes: number | null; // 单次训练时长（分钟）

  availableEquipment: string[];     // 可用于训练的器材列表

  jointLimitations: string;         // 关节限制/旧伤描述（表单里单独一块填的那段话）
}

// 营养/饮食偏好：与 WorkoutForm.tsx 完全对齐
export interface NutritionPreference {
  needDietPlan: boolean;     // 表单字段：是否需要生成饮食计划
  dietRestrictions: string;  // 表单字段：饮食限制/忌口描述

  // 为了兼容之前设计的请求体字段（可选）
  needDiet?: boolean;
  dietPreference?: string;
}

// 最近训练记录：与 WorkoutForm.tsx 对齐
export interface RecentTrainingRecord {
  hasRecentTraining: boolean;  // 近期是否有训练（例如：是/否 的选择）
  recentDescription: string;   // 对最近训练情况的描述（如果有的话）
}

// ===== 用户基础信息 =====
export interface UserProfile {
  age: number | null;
  gender: string;
  experienceLevel: string;
  trainingExperience: string;
}

// ===== 训练偏好（跟 WorkoutForm 字段保持一致）=====
export interface TrainingPreference {
  goal: string;
  goalReference?: string;

  availableDaysPerWeek: number | null;
  sessionDurationMinutes: number | null;

  availableEquipment: string[];

  jointLimitations: string;
}

// ===== 饮食偏好 =====
export interface NutritionPreference {
  needDietPlan: boolean;
  dietRestrictions: string;

  // 为了方便映射到后端请求，留两个可选别名
  needDiet?: boolean;
  dietPreference?: string;
}

// ===== 最近训练记录 =====
export interface RecentTrainingRecord {
  hasRecentTraining: boolean;
  recentDescription: string;
}

// ===== 发给 AI 层的“拍平版参数”（后端内部用）=====
export interface GenerateWorkoutPlanInput {
  age: number | null;
  gender: string;
  goal: string;
  availableDays: string; // 注意：这里我们已经在 route 里转成 string
  equipments: string;
  jointLimits: string;
  experienceLevel: string;
  lastSessions: string;
  todayFeedback: string;
  needDiet: boolean;
  dietPreference: string;
}