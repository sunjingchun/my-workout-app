AI 家用重训 & 有氧训练计划助手（Beta）

一个基于大语言模型（LLM）的个性化训练计划生成器，
适合 在家使用哑铃、弹力带、徒手训练、有氧设备 的用户。

生成内容包含：

训练总策略（拆分方式 + 频率建议）

每周训练计划（推/拉/腿 或 上下肢）

下一次训练日的动作（含组数/次数/RPE/注意事项）

对伤病友好的替代动作（肩痛、膝痛、下背痛）

可选：基础饮食建议

对话式微调功能（根据用户反馈自动调整计划）

Features（功能特性）

支持「初次生成」和「二次微调」

支持用户上传最近训练记录

家用器械适配（哑铃、弹力带、壶铃、徒手）

JSON 结构化输出 → UI 展示清晰

每次生成的计划可写入本地历史记录

后端基于 Next.js App Router

前端使用 React + Tailwind UI

技术栈（Tech Stack）

Next.js App Router

TypeScript

Tailwind CSS

OpenAI / Qwen / DeepSeek（可自由替换）

自定义 LLM 层（Prompt Builder + Client + Parser）

Services 层（UI 与 API 的协调器）

LocalStorage 历史记录存储

本地运行（Local Development）
npm install
npm run dev


访问：

http://localhost:3000/workout

文件结构（重要）
app/workout/page.tsx          -- 主页面
app/api/workout/plan/route.ts -- 初次生成计划 API
app/api/workout/refine/route.ts -- 微调计划 API

types/workout.ts              -- 所有训练计划的类型定义
docs/workout-architecture.md  -- 架构文档

services/                     -- 服务层
lib/llm/                      -- AI 层（模型调用 + Prompt）
repositories/                 -- 本地历史记录存储
data/                         -- 静态动作库 & 伤病规则

声明（Disclaimer）

此工具仅用于训练规划参考，不构成专业健身建议。
如有伤病，请优先咨询专业医疗或康复机构。


目录结构

ai-workout-app/
├─ app/                         # ✅ UI 层 + API 入口
│  ├─ layout.tsx
│  ├─ page.tsx                  # 首页（可以简单介绍项目，用于导航）
│  │
│  ├─ workout/                  # 核心页面：AI 家用重训 & 有氧助手
│  │  └─ page.tsx               # 主 UI：表单 + 计划展示 + 微调对话框
│  │
│  ├─ api/
│  │  └─ workout/
│  │     ├─ plan/               # 生成初次计划的 API
│  │     │  └─ route.ts
│  │     └─ refine/             # 基于当前计划 + 用户反馈微调的 API
│  │        └─ route.ts
│  │
│  └─ components/               # 通用 UI 组件（可复用）
│     ├─ WorkoutForm.tsx        # 训练信息+器械+饮食表单（UI 层）
│     ├─ SessionLogForm.tsx     # 当日训练记录表单（UI 层）
│     ├─ PlanView.tsx           # 周计划 + 下一次训练日展示
│     ├─ DietPlanView.tsx       # 饮食方案展示
│     ├─ RefineBox.tsx          # 对话式微调输入框 + 按钮
│     ├─ RoutineAccordion.tsx   # 可折叠的训练日卡片（类似你现在的 Accordion）
│     └─ UiFeedback.tsx         # Loading / Error / Toast 之类的组件
│
├─ lib/                         # ✅ AI 层 + 通用逻辑（不依赖具体 UI）
│  ├─ llm/
│  │  ├─ client.ts              # LLMClient：封装 OpenAI / Qwen / DeepSeek 调用
│  │  ├─ workoutPrompt.ts       # WorkoutPromptBuilder：初次计划 Prompt 模板
│  │  ├─ workoutRefinePrompt.ts # RefineWorkoutPromptBuilder：微调 Prompt 模板
│  │  └─ jsonParser.ts          # JSONPlanParser：模型输出 JSON 解析 + 兜底
│  │
│  ├─ workout/
│  │  ├─ mappers.ts             # WorkoutPlanMapper：AI JSON → WeeklyWorkoutPlan 类型
│  │  ├─ safetyGuard.ts         # SafetyGuard：根据伤病/器械过滤危险动作
│  │  └─ planFormatter.ts       # 可选：把 plan 转成更易读的字符串/HTML 结构
│  │
│  └─ utils/
│     ├─ logger.ts              # 简单日志（可选）
│     └─ date.ts                # 日期处理（可选）
│
├─ services/                    # ✅ Service 层（协调 UI / API / Data）
│  ├─ workoutPlanService.ts     # WorkoutPlanService：前端调用用的 service
│  └─ historyService.ts         # HistoryService：读写本地历史，调用 Data Layer
│
├─ data/                        # ✅ Data 层里“静态数据”的一部分
│  ├─ exercises.json            # StaticExerciseDB：动作库（部位/难度/注意事项）
│  └─ injuryRules.json          # StaticInjuryRules：伤病 → 禁用/替代动作规则
│
├─ repositories/                # ✅ Data 层里“读写存储”的封装
│  ├─ localWorkoutHistoryRepo.ts # LocalWorkoutHistoryRepo：localStorage 历史记录
│  └─ userPreferenceRepo.ts      # 将来可放用户偏好（可空着，后面补）
│
├─ types/                       # ✅ Type & Contract（契约先行）
│  ├─ workout.ts                # 你 Day2 设计的所有类型：Request/Response/Plan…
│  └─ common.ts                 # 通用类型（Result<T>、APIError 等，可选）
│
├─ docs/                        # ✅ 文档层（架构 & 设计说明）
│  ├─ workout-architecture.md   # AI 家用重训 & 有氧助手架构说明（你今天要写的）
│  └─ api-contract.md           # 将来可以把接口契约单独整理出来（可先留空）
│
├─ public/                      # 静态资源（图标、LOGO 等）
│  └─ icons/                    # 将来可放部位图标、器械图标
│
├─ .env.local                   # 环境变量（模型 API KEY 等，不进 git）
├─ package.json
├─ tsconfig.json
└─ README.md
