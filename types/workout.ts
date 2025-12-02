// 用户基础信息（User Profile）
export type UserProfile = {
  age: number | null;
  gender: "男" | "女" | "其他/不方便透露" | "未填写";
  trainingExperience: "完全新手" | "有一点基础" | "训练一年以上" | "未填写";
};

// 训练偏好与限制（Training Preferences）
export type TrainingPreference = {
  goal:
    | "增肌为主"
    | "减脂为主"
    | "健康维持/塑形"
    | "练得像某个体型"
    | "未填写";
  goalReference?: string; // 比如“像 XXX 一样的体型”时的说明

  availableDaysPerWeek: number | null; // 每周可训练天数
  sessionDurationMinutes: number | null; // 单次训练时长（分钟）

  availableEquipment: string[]; // ["哑铃", "弹力带", "壶铃", "无器械", ...]
  jointLimitations: string; // 关节限制说明（肩/膝/腰等）
};

// 饮食相关（Nutrition）
export type NutritionPreference = {
  needDietPlan: boolean;
  dietRestrictions: string; // 忌口/素食/宗教饮食习惯等
};

// 最近训练情况（Recent Training）
export type RecentTrainingRecord = {
  hasRecentTraining: boolean;
  recentDescription: string; // 自由文本：最近 3 次训练的大致内容、重量、感觉等
};

// 生成训练计划的请求对象（前端 → 后端/LLM）
export type GenerateWorkoutPlanRequest = {
  userProfile: UserProfile;
  trainingPreference: TrainingPreference;
  nutritionPreference: NutritionPreference;
  recentTrainingRecord: RecentTrainingRecord;
};

// ================= 输出类型：你之前用在 mockPlan 的 =================

export type WorkoutExercise = {
  name: string;
  sets: number;
  reps: number;
  rpe?: number;
  notes?: string;
  equipment?: string;
};

export type WorkoutDayPlan = {
  dayLabel: string; // e.g. "Day 1 - 推（Push）"
  focus: string; // 训练重点
  exercises: WorkoutExercise[];
};

export type NextSessionPlan = {
  dayLabel: string;
  focus: string;
  exercises: WorkoutExercise[];
};

export type WeeklyWorkoutPlan = {
  strategySummary: string; // 总体策略说明
  frequencySuggestion: string; // 一周频率建议
  splitType: string; // 拆分方式（推/拉/腿、上下肢等）
  weeklyPlan: WorkoutDayPlan[];
  nextSessionPlan: NextSessionPlan;
  injuryWarnings: string; // 伤病规避提醒
  equipmentDisclaimer: string; // 器械使用免责声明
};
