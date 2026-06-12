import {
  sama, hassabis, musk, lecun, karpathy,
  openaiOrg, anthropicOrg, deepmindOrg,
  type FeedSource,
} from "./feed";

export interface DigestHighlight {
  id: string;
  source: FeedSource;
  signalHint: string;
  summaryZh: string;
  tags: string[];
  score: number;
}

export interface SignalResonance {
  topic: string;
  description: string;
  sources: FeedSource[];
  tags: string[];
}

export interface OfficialNewsItem {
  source: FeedSource;
  title: string;
  summaryZh: string;
  readUrl: string;
}

export interface SourceActivity {
  source: FeedSource;
  count: number;
  topSummary: string;
}

export interface DigestEntry {
  id: string;
  date: string;         // display: "2026年6月11日 · 周三"
  dateIso: string;      // for sorting
  coreConclusion: string; // 今日核心 一句话
  stats: { label: string; value: string }[];
  highlights: DigestHighlight[];
  resonance: SignalResonance[];
  officialNews: OfficialNewsItem[];
  sourceActivity: SourceActivity[];
}

/* ── 今日简报（最新一期，默认展开） ── */
const today: DigestEntry = {
  id: "digest-2026-06-11",
  date: "2026年6月11日 · 周三",
  dateIso: "2026-06-11",
  coreConclusion:
    "OpenAI 准备打破 Scaling 惯例，两大阵营正面交锋——奥尔特曼暗示「能力台阶」，杨立昆直接反驳；同时 xAI 算力扩张、DeepMind 押注科学，今天的信号密度超出平日。",
  stats: [
    { label: "追踪信源", value: "5" },
    { label: "今日动态", value: "12" },
    { label: "高分条目", value: "7" },
    { label: "官方公告", value: "3" },
  ],
  highlights: [
    {
      id: "hl-1",
      source: sama,
      signalHint: "罕见地给出下一代模型的时间窗口，定调今年发布节奏。",
      summaryZh:
        "暗示下一代模型不是简单的升级，而是「能力台阶」，今年有几次让人意外的发布计划。",
      tags: ["模型发布", "AGI"],
      score: 9,
    },
    {
      id: "hl-2",
      source: lecun,
      signalHint: "对「能力台阶」说法直接泼冷水，路线之争再次摆上台面。",
      summaryZh:
        "引用奥尔特曼发言后反驳：单纯扩大自回归 LLM 规模到不了人类推理，世界模型才是出路。",
      tags: ["世界模型", "Scaling Law"],
      score: 8,
    },
    {
      id: "hl-3",
      source: hassabis,
      signalHint: "把 AI 时间表与科学突破绑定，透露 DeepMind 下一步重心。",
      summaryZh:
        "认为未来 5–10 年 AI 最大价值出现在科学发现——材料、药物、数学，而不是聊天机器人。",
      tags: ["AI for Science"],
      score: 8,
    },
  ],
  resonance: [
    {
      topic: "AI 路线之争",
      description:
        "奥尔特曼「能力台阶」+ 杨立昆「世界模型」同日碰撞，卡帕西也从工程角度指出 LLM 的上下文瓶颈——三人都在谈模型的边界，方向截然不同。",
      sources: [sama, lecun, karpathy],
      tags: ["Scaling Law", "AGI", "路线之争"],
    },
    {
      topic: "算力军备竞赛",
      description:
        "马斯克宣布 xAI 集群年底再翻倍，奥尔特曼暗示「能力台阶」背后也是算力支撑，两人都在同一天发出算力扩张信号。",
      sources: [musk, sama],
      tags: ["算力", "竞赛"],
    },
  ],
  officialNews: [
    {
      source: anthropicOrg,
      title: "Introducing Claude's enterprise-grade safety commitments",
      summaryZh:
        "Anthropic 发布企业安全承诺框架，数据隔离、不用客户数据训练、可审计日志首次量化成条款，配合企业版部署选项一并推出。",
      readUrl: "https://www.anthropic.com/news",
    },
    {
      source: openaiOrg,
      title: "New developer tools: granular permissions and longer context",
      summaryZh:
        "开发者平台新增细粒度权限控制，上下文窗口进一步拉长，配套用量看板与成本预警，支撑更复杂的多步 Agent 应用。",
      readUrl: "https://openai.com/blog",
    },
    {
      source: deepmindOrg,
      title: "AlphaProof advances: solving competition-level mathematics",
      summaryZh:
        "AlphaProof 在竞赛级数学题解题率显著提升，已与多所高校合作验证证明，将逐步向数学研究社区开放。",
      readUrl: "https://deepmind.google/discover/blog",
    },
  ],
  sourceActivity: [
    { source: sama, count: 3, topSummary: "暗示下一代模型「能力台阶」" },
    { source: lecun, count: 4, topSummary: "反驳 Scaling，力推世界模型" },
    { source: hassabis, count: 2, topSummary: "AI for Science 重心表态" },
    { source: karpathy, count: 2, topSummary: "Agent 瓶颈在 Eval，不在模型" },
    { source: musk, count: 1, topSummary: "xAI 集群年底再翻倍" },
  ],
};

/* ── 历史简报列表 ── */
const history: DigestEntry[] = [
  {
    id: "digest-2026-06-10",
    date: "2026年6月10日 · 周二",
    dateIso: "2026-06-10",
    coreConclusion:
      "Google DeepMind 宣布 AlphaProof 新里程碑，Anthropic 悄悄推送 Claude 企业版内测邀请，AI 科研赛道信号密集。",
    stats: [
      { label: "追踪信源", value: "5" },
      { label: "今日动态", value: "9" },
      { label: "高分条目", value: "5" },
      { label: "官方公告", value: "2" },
    ],
    highlights: [
      {
        id: "hl-h1",
        source: hassabis,
        signalHint: "AlphaProof 进展让 AI for Science 从愿景变成了近期事件。",
        summaryZh: "官宣 AlphaProof 解题率新高，并与多所顶校建立合作验证通道。",
        tags: ["AlphaProof", "数学"],
        score: 9,
      },
      {
        id: "hl-h2",
        source: karpathy,
        signalHint: "开发者工具观点具体，透露 Agent 工程实践当前瓶颈。",
        summaryZh: "强调 eval 基础设施比模型本身更重要，给出可落地建议。",
        tags: ["Agent", "Eval"],
        score: 8,
      },
    ],
    resonance: [],
    officialNews: [
      {
        source: deepmindOrg,
        title: "AlphaProof advances: solving competition-level mathematics",
        summaryZh: "形式化验证+强化学习结合，竞赛级数学解题率大幅提升。",
        readUrl: "https://deepmind.google/discover/blog",
      },
    ],
    sourceActivity: [
      { source: hassabis, count: 3, topSummary: "AlphaProof 新进展" },
      { source: karpathy, count: 3, topSummary: "Agent eval 方法论" },
      { source: sama, count: 1, topSummary: "简短感谢团队" },
      { source: lecun, count: 2, topSummary: "转发数学 AI 相关论文" },
    ],
  },
  {
    id: "digest-2026-06-09",
    date: "2026年6月9日 · 周一",
    dateIso: "2026-06-09",
    coreConclusion:
      "奥尔特曼发表长文谈 AGI 路线，马斯克公开算力投入数字，本周开局信号量大、竞争烈度高。",
    stats: [
      { label: "追踪信源", value: "5" },
      { label: "今日动态", value: "11" },
      { label: "高分条目", value: "6" },
      { label: "官方公告", value: "1" },
    ],
    highlights: [
      {
        id: "hl-h3",
        source: sama,
        signalHint: "长文罕见地公开讨论 AGI 时间线，态度比以往更确定。",
        summaryZh: "称 AGI 到来时间比大多数人预期更近，OpenAI 正在加速关键基础设施。",
        tags: ["AGI", "时间线"],
        score: 9,
      },
      {
        id: "hl-h4",
        source: musk,
        signalHint: "算力数字首次明确量化，可作为竞争参照系。",
        summaryZh: "披露 xAI Memphis 集群现有规模，并承诺年底翻倍，称算力是唯一护城河。",
        tags: ["算力", "xAI"],
        score: 8,
      },
    ],
    resonance: [
      {
        topic: "AGI 时间线",
        description: "奥尔特曼公开谈近期 AGI，马斯克算力扩张背后也是同一场赛跑，两人都在暗示窗口正在收窄。",
        sources: [sama, musk],
        tags: ["AGI", "竞赛"],
      },
    ],
    officialNews: [
      {
        source: openaiOrg,
        title: "OpenAI and infrastructure partnership announcement",
        summaryZh: "OpenAI 宣布与多家云服务商深化合作，为下一阶段训练储备算力。",
        readUrl: "https://openai.com/blog",
      },
    ],
    sourceActivity: [
      { source: sama, count: 4, topSummary: "AGI 路线长文" },
      { source: musk, count: 3, topSummary: "算力扩张计划" },
      { source: lecun, count: 2, topSummary: "转发开源模型进展" },
      { source: hassabis, count: 1, topSummary: "会议演讲预告" },
      { source: karpathy, count: 1, topSummary: "推荐 nanoGPT 改进版" },
    ],
  },
];

export const todayDigest = today;
export const digestHistory = history;
export const allDigests: DigestEntry[] = [today, ...history];
