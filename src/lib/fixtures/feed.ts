/**
 * 信息流静态假数据（第一阶段 UI 用，不接任何接口）。
 * 命名严格遵循规范：公司名保留英文，人物用「中文译名 · 英文名」。
 * 头像不加载真实图片，用首字母色块（个人圆形 / 官方方角）代替，离线也能看。
 */

export type SourceType = "person" | "org";
export type Domain = "AI" | "crypto" | "space" | "biotech" | "other";
export type TweetRelation = "original" | "quote" | "reply";

export interface FeedSource {
  id: string;
  type: SourceType;
  /** 个人：中文译名；官方：机构英文名 */
  nameZh: string;
  nameEn: string;
  /** 个人头像底色（品牌色系派生），方便区分 */
  avatarTint: string;
  /** 头像首字母 */
  avatarText: string;
  /** 公司 / 职位，官方信源用机构定位 */
  company: string;
  title: string;
  domain: Domain;
}

export interface QuotedTweet {
  sourceName: string;
  handle: string;
  text: string;
}

export interface FeedTweet {
  id: string;
  contentType: "tweet";
  source: FeedSource;
  relation: TweetRelation;
  /** 被回复 / 被引用对象的名字（relation 非 original 时用） */
  relationTarget?: string;
  signalHint: string; // 为什么值得看
  summaryZh: string; // 中文摘要（推文：一两句话）
  originalText: string; // 英文原文
  tags: string[];
  publishedLabel: string; // 相对时间
  score: number; // 1-10 重要性
  hasOpinion: boolean; // 是否含实质观点
  isRead: boolean;
  isStarred: boolean;
  quoted?: QuotedTweet;
  media?: { thumbnailUrl: string; isVideo: boolean; aspectRatio: number };
  tweetUrl?: string; // 原推 URL，用于视频跳转等
}

export interface FeedArticle {
  id: string;
  contentType: "article";
  source: FeedSource;
  signalHint: string;
  title: string; // 文章标题（新闻卡片核心区别）
  summaryZh: string; // AI 摘要 ≤200 字
  tags: string[];
  publishedLabel: string;
  score: number;
  isRead: boolean;
  isStarred: boolean;
  readUrl: string; // 阅读全文跳转
  imageUrl?: string; // 配图（可选，引用原 URL）
}

/* —— 信源 —— */

export const sama: FeedSource = {
  id: "src-sama",
  type: "person",
  nameZh: "奥尔特曼",
  nameEn: "Sam Altman",
  avatarTint: "#6E59E0",
  avatarText: "S",
  company: "OpenAI",
  title: "CEO",
  domain: "AI",
};

export const hassabis: FeedSource = {
  id: "src-demis",
  type: "person",
  nameZh: "哈萨比斯",
  nameEn: "Demis Hassabis",
  avatarTint: "#2E8FB5",
  avatarText: "D",
  company: "Google DeepMind",
  title: "CEO",
  domain: "AI",
};

export const musk: FeedSource = {
  id: "src-musk",
  type: "person",
  nameZh: "马斯克",
  nameEn: "Elon Musk",
  avatarTint: "#1C1C22",
  avatarText: "E",
  company: "xAI / Tesla",
  title: "创始人",
  domain: "AI",
};

export const lecun: FeedSource = {
  id: "src-lecun",
  type: "person",
  nameZh: "杨立昆",
  nameEn: "Yann LeCun",
  avatarTint: "#1A6CC2",
  avatarText: "Y",
  company: "Meta",
  title: "首席 AI 科学家",
  domain: "AI",
};

export const karpathy: FeedSource = {
  id: "src-karpathy",
  type: "person",
  nameZh: "卡帕西",
  nameEn: "Andrej Karpathy",
  avatarTint: "#C2571A",
  avatarText: "A",
  company: "Eureka Labs",
  title: "创始人",
  domain: "AI",
};

export const openaiOrg: FeedSource = {
  id: "org-openai",
  type: "org",
  nameZh: "OpenAI",
  nameEn: "OpenAI",
  avatarTint: "#10A37F",
  avatarText: "O",
  company: "官方账号",
  title: "@OpenAI",
  domain: "AI",
};

export const anthropicOrg: FeedSource = {
  id: "org-anthropic",
  type: "org",
  nameZh: "Anthropic",
  nameEn: "Anthropic",
  avatarTint: "#C9683A",
  avatarText: "A",
  company: "官方账号",
  title: "@AnthropicAI",
  domain: "AI",
};

export const deepmindOrg: FeedSource = {
  id: "org-deepmind",
  type: "org",
  nameZh: "Google DeepMind",
  nameEn: "Google DeepMind",
  avatarTint: "#4285F4",
  avatarText: "G",
  company: "官方账号",
  title: "@GoogleDeepMind",
  domain: "AI",
};

/* —— 社交动态（推文） —— */

export const tweets: FeedTweet[] = [
  {
    id: "tw-1",
    contentType: "tweet",
    source: sama,
    relation: "original",
    signalHint: "罕见地给出下一代模型的时间窗口，定调今年发布节奏。",
    summaryZh:
      "下一个模型不只是增量更新，而是能力层面的跨越。今年会有几个我非常期待的惊喜。",
    originalText:
      "the next model isn't an incremental update, it's a step change in capability. we have a few surprises coming this year that i'm really excited about.",
    tags: ["模型发布", "AGI", "OpenAI"],
    publishedLabel: "12 分钟前",
    score: 9,
    hasOpinion: true,
    isRead: false,
    isStarred: false,
  },
  {
    id: "tw-2",
    contentType: "tweet",
    source: lecun,
    relation: "quote",
    relationTarget: "Sam Altman",
    signalHint: "对「能力台阶」说法直接泼冷水，两大阵营路线之争再次摆上台面。",
    summaryZh:
      "无论宣布多少惊喜，扩大自回归大模型的规模都无法让我们达到人类水平的推理能力。我们需要世界模型。这个观点不受欢迎，但经得起时间检验。",
    originalText:
      "Scaling up autoregressive LLMs will not get us to human-level reasoning, no matter how many surprises are announced. We need world models. This is not a popular opinion but it will age well.",
    tags: ["世界模型", "Scaling Law", "路线之争"],
    publishedLabel: "1 小时前",
    score: 8,
    hasOpinion: true,
    isRead: false,
    isStarred: true,
    quoted: {
      sourceName: "Sam Altman",
      handle: "@sama",
      text: "the next model isn't an incremental update, it's a step change in capability...",
    },
  },
  {
    id: "tw-3",
    contentType: "tweet",
    source: hassabis,
    relation: "original",
    signalHint: "把 AI 时间表和科学突破绑定，透露 DeepMind 的下一步重心在科学。",
    summaryZh:
      "我依然相信，未来 5 到 10 年 AI 最大的影响会体现在科学领域——新材料、药物和数学。聊天机器人只是个开始。",
    originalText:
      "I continue to believe the biggest impact of AI in the next 5-10 years will be in science — new materials, drugs, and mathematics. Chatbots are just the beginning.",
    tags: ["AI for Science", "DeepMind"],
    publishedLabel: "3 小时前",
    score: 8,
    hasOpinion: true,
    isRead: true,
    isStarred: false,
    media: {
      thumbnailUrl: "",
      isVideo: true,
      aspectRatio: 16 / 9,
    },
  },
  {
    id: "tw-4",
    contentType: "tweet",
    source: karpathy,
    relation: "reply",
    relationTarget: "一位开发者",
    signalHint: "给出可落地的工程经验，对做 Agent 的团队有直接参考价值。",
    summaryZh:
      "说真的，Agent 现在的瓶颈不在模型智力，而在上下文管理和评测体系。先把 eval 搭好，其他的自然跟上。",
    originalText:
      "honestly the bottleneck for agents right now isn't model intelligence, it's context management and evals. build your evals first, everything else follows.",
    tags: ["Agent", "工程实践", "Eval"],
    publishedLabel: "5 小时前",
    score: 7,
    hasOpinion: true,
    isRead: true,
    isStarred: false,
  },
  {
    id: "tw-5",
    contentType: "tweet",
    source: musk,
    relation: "original",
    signalHint: "公布 xAI 算力规模数字，是判断下一轮竞赛量级的关键信号。",
    summaryZh:
      "xAI 的训练集群在年底前还会再翻一倍。算力是现在唯一真正的护城河，其他一切都可以被复制。",
    originalText:
      "xAI's training cluster will double again before end of year. Compute is the only real moat right now. Everything else can be copied.",
    tags: ["算力", "xAI", "竞赛"],
    publishedLabel: "8 小时前",
    score: 7,
    hasOpinion: true,
    isRead: true,
    isStarred: false,
  },
];

/* —— 官方新闻（文章） —— */

export const articles: FeedArticle[] = [
  {
    id: "art-1",
    contentType: "article",
    source: anthropicOrg,
    signalHint: "首次给出企业级安全承诺的量化标准，是 to B 市场的信号弹。",
    title: "Introducing Claude's enterprise-grade safety commitments",
    summaryZh:
      "Anthropic 发布面向企业的安全承诺框架，首次把数据隔离、不用客户数据训练、可审计日志等做成可量化条款，并承诺第三方审计。文章强调这是为金融、医疗等强监管行业铺路，配合即将上线的企业版部署选项一起推出。",
    tags: ["企业安全", "Anthropic", "合规"],
    publishedLabel: "2 小时前",
    score: 8,
    isRead: false,
    isStarred: false,
    readUrl: "https://www.anthropic.com/news",
    imageUrl: "",
  },
  {
    id: "art-2",
    contentType: "article",
    source: openaiOrg,
    signalHint: "开放更细的调用权限，意味着第三方能做的应用边界一下被拓宽。",
    title: "New developer tools: granular permissions and longer context",
    summaryZh:
      "OpenAI 更新开发者平台，新增细粒度权限控制，开发者可按工具、按数据范围精确授权，同时把上下文窗口进一步拉长。官方称这是为支撑更复杂的多步 Agent 应用，并配套发布了用量看板与成本预警。",
    tags: ["开发者平台", "OpenAI", "Agent"],
    publishedLabel: "6 小时前",
    score: 7,
    isRead: false,
    isStarred: true,
    readUrl: "https://openai.com/blog",
  },
  {
    id: "art-3",
    contentType: "article",
    source: deepmindOrg,
    signalHint: "把成果直接投到真实科研管线，验证了「AI for Science」不是口号。",
    title:
      "AlphaProof advances: solving competition-level mathematics at scale",
    summaryZh:
      "Google DeepMind 公布 AlphaProof 最新进展，系统在竞赛级数学题上的解题率显著提升，并已开始与多所高校合作验证证明过程。博客详细介绍了形式化验证与强化学习结合的方法，并表示会逐步开放给数学研究社区使用。",
    tags: ["AlphaProof", "数学", "DeepMind"],
    publishedLabel: "1 天前",
    score: 9,
    isRead: true,
    isStarred: false,
    readUrl: "https://deepmind.google/discover/blog",
    imageUrl: "",
  },
];

/* 未读数（tab 角标用） */
export const unreadCounts = {
  social: tweets.filter((t) => !t.isRead).length,
  news: articles.filter((a) => !a.isRead).length,
};
