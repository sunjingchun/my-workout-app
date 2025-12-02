# AI 家用重训 & 有氧训练计划助手（Architecture）

## 1. 目标

为无法去健身房的人群，基于家用器械（哑铃、弹力带、徒手等）
生成个性化的训练计划（包括周计划 + 下一次训练日方案），并提供基础饮食建议。

## 2. 输入（Inputs）

- 年龄、性别
- 训练目标（增肌、减脂、保持、塑形、偶像体型）
- 每周可训练的天数和每次训练时长
- 可用器械（哑铃/杠铃/弹力带/无器械等）
- 关节限制（肩痛、下背不适、膝盖不稳等）
- 训练经验（有/无）
- 之前 3 次训练的具体记录（动作/重量/组数/次数/RPE）
- 当日训练记录（用于生成下一次训练日计划）
- 是否需要饮食规划 + 饮食禁忌
- 对话式微调说明（Refine Instruction，基于当前计划的调整需求）

## 3. 输出（Outputs）

- 训练总策略（Training Strategy Summary）
  - 训练拆分方式（Split Type：推拉腿、上下半身等）
  - 训练频率建议（Frequency Suggestion）
- 每周训练计划（Weekly Plan）
  - 每个训练日的分部说明（Day Plan）
  - 每日动作列表（动作 + 组数 + 次数 + RPE + 注意事项）
- 下一次训练日的详细计划（Next Session Plan）
- 饮食计划与提示（Diet Plan）
- 伤病规避提醒（Injury Warnings）
- 器械使用免责提醒（Equipment Disclaimer）
- （未来）版本历史：v1 初次计划、v2/v3 为对话式微调后的计划

---

## 4. 系统分层（System Layers）

### 4.1 UI Layer（界面层）

- 训练信息表单（用户基础信息 + 器械 + 时间 + 伤病）
- 当日训练记录表单（Today Session Log）
- 训练计划展示（Weekly Plan + Next Session Plan）
- 饮食建议展示（Diet Plan View）
- 对话式微调输入框 + 按钮（Refine Instruction Input）
- 历史记录/版本列表展示（History & Versions）
- Loading 状态、错误提示、Toast 提示

### 4.2 Service Layer（服务层）

- `WorkoutPlanService`
  - `generatePlan(request: GenerateWorkoutPlanRequest)`
  - `refinePlan(currentPlan, instruction, profile, jointLimitations, equipments)`
- `DietPlanService`（可内嵌在 Workout 服务内）
- `HistoryService`
  - 负责调用 Data Layer 管理本地历史记录 / 版本

### 4.3 Data Layer（数据层）

- `LocalWorkoutHistoryRepo`
  - 使用 `localStorage` 存储最近若干次生成结果或版本
- `StaticExerciseDB`
  - 静态动作库、基础注意事项（JSON）
- `StaticInjuryRules`
  - 针对肩/腰/膝等伤病的动作黑名单或替换建议
- （未来）`SupabaseWorkoutRepo`
  - 将用户与训练计划同步到云端

### 4.4 AI Layer（大模型层）

- `WorkoutPromptBuilder`
  - 构建初次训练计划的 Prompt（Generate Plan）
- `RefineWorkoutPromptBuilder`
  - 构建基于当前计划 + 用户反馈的微调 Prompt（Refine Plan）
- `DietPromptBuilder`
  - 构建饮食计划提示词
- `LLMClient`
  - 统一封装对不同模型（OpenAI / Qwen / DeepSeek 等）的调用
- `JSONPlanParser`
  - 解析 LLM 返回的 JSON，并做基础校验、错误兜底
- `SafetyGuard`
  - 根据关节限制、器械条件，对计划做二次安全检查（例如：膝伤禁深蹲）

---

## 5. API 契约（API Contract）

- `POST /api/workout/plan`
  - Request：`GenerateWorkoutPlanRequest`
  - Response：`GenerateWorkoutPlanResponse`

- `POST /api/workout/refine`
  - Request：`RefineWorkoutPlanRequest`
  - Response：`RefineWorkoutPlanResponse`

具体字段定义参见：`/types/workout.ts`
