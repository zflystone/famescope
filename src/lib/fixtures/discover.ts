/**
 * 发现页静态假数据（第一阶段 UI，不接任何接口）。
 * 真实接入时必须走两步法：AI 召回候选 → TwitterAPI.io 核实真实账号 + 计算三维分值。
 */

import type { FeedSource } from "./feed";

export interface DiscoverScore {
  influence: number;  // 影响力 0-100（粉丝/认证/媒体提及）
  relevance: number;  // 相关性 0-100（简介+发帖与领域匹配度）
  activity: number;   // 活跃度 0-100（近30天发帖频率）
}

export interface DiscoverSource extends FeedSource {
  handle: string;          // X handle, e.g. "@sama"
  bio: string;             // 简介
  followerLabel: string;   // 显示粉丝数，如 "310万"
  followerCount?: number;  // 原始粉丝数（用于 API 调用，不做展示）
  verified: boolean;       // 认证
  score: DiscoverScore;
  isFollowing: boolean;    // 当前用户是否已追踪
  notifyEnabled: boolean;  // 实时提醒开关
}

/** 将粉丝数格式化为中文缩写 */
export function formatFollowerLabel(count: number): string {
  if (count >= 1_000_000) return `${(count / 10_000).toFixed(0)}万`;
  if (count >= 10_000) return `${(count / 10_000).toFixed(1)}万`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

/** 根据 handle 生成确定性头像底色 */
export function handleToTint(handle: string): string {
  const palette = [
    "#6E59E0", "#2E8FB5", "#1C9E6E", "#C25A1A",
    "#B52E6E", "#1A6CC2", "#7D3BC2", "#2E7E7E",
  ];
  let h = 0;
  for (let i = 0; i < handle.length; i++) h = (h * 31 + handle.charCodeAt(i)) & 0xff_ff_ff_ff;
  return palette[Math.abs(h) % palette.length];
}

export type Domain = "AI" | "加密" | "太空" | "生物科技" | "其他";

// ─── AI 领域：个人信源 ──────────────────────────────────────────

export const aiPersons: DiscoverSource[] = [
  {
    id: "src-sama",
    type: "person",
    nameZh: "奥尔特曼",
    nameEn: "Sam Altman",
    handle: "@sama",
    avatarTint: "#6E59E0",
    avatarText: "S",
    company: "OpenAI",
    title: "CEO",
    domain: "AI",
    bio: "CEO of OpenAI. Interested in AI, startups, and the future.",
    followerLabel: "310万",
    verified: true,
    score: { influence: 98, relevance: 97, activity: 82 },
    isFollowing: true,
    notifyEnabled: false,
  },
  {
    id: "src-lecun",
    type: "person",
    nameZh: "杨立昆",
    nameEn: "Yann LeCun",
    handle: "@ylecun",
    avatarTint: "#1A6CC2",
    avatarText: "Y",
    company: "Meta",
    title: "首席 AI 科学家",
    domain: "AI",
    bio: "Chief AI Scientist at Meta. Professor at NYU. Turing Award laureate.",
    followerLabel: "79万",
    verified: true,
    score: { influence: 90, relevance: 99, activity: 91 },
    isFollowing: true,
    notifyEnabled: true,
  },
  {
    id: "src-demis",
    type: "person",
    nameZh: "哈萨比斯",
    nameEn: "Demis Hassabis",
    handle: "@demishassabis",
    avatarTint: "#2E8FB5",
    avatarText: "D",
    company: "Google DeepMind",
    title: "CEO",
    domain: "AI",
    bio: "Co-founder & CEO of Google DeepMind. Nobel Prize in Chemistry 2024.",
    followerLabel: "62万",
    verified: true,
    score: { influence: 92, relevance: 98, activity: 58 },
    isFollowing: true,
    notifyEnabled: false,
  },
  {
    id: "src-karpathy",
    type: "person",
    nameZh: "卡帕西",
    nameEn: "Andrej Karpathy",
    handle: "@karpathy",
    avatarTint: "#C2571A",
    avatarText: "A",
    company: "Eureka Labs",
    title: "创始人",
    domain: "AI",
    bio: "Founder of Eureka Labs. Former OpenAI & Tesla AI. Building AI-native education.",
    followerLabel: "98万",
    verified: true,
    score: { influence: 88, relevance: 96, activity: 74 },
    isFollowing: true,
    notifyEnabled: false,
  },
  {
    id: "src-musk",
    type: "person",
    nameZh: "马斯克",
    nameEn: "Elon Musk",
    handle: "@elonmusk",
    avatarTint: "#1C1C22",
    avatarText: "E",
    company: "xAI / Tesla",
    title: "创始人",
    domain: "AI",
    bio: "Founder of xAI, Tesla, SpaceX. Building Grok.",
    followerLabel: "1.9亿",
    verified: true,
    score: { influence: 99, relevance: 79, activity: 99 },
    isFollowing: true,
    notifyEnabled: false,
  },
  {
    id: "src-amodei",
    type: "person",
    nameZh: "阿莫迪",
    nameEn: "Dario Amodei",
    handle: "@DarioAmodei",
    avatarTint: "#8B5E3C",
    avatarText: "D",
    company: "Anthropic",
    title: "CEO",
    domain: "AI",
    bio: "CEO of Anthropic. Thinking hard about AI safety and beneficial AI.",
    followerLabel: "22万",
    verified: true,
    score: { influence: 85, relevance: 97, activity: 42 },
    isFollowing: false,
    notifyEnabled: false,
  },
];

// ─── AI 领域：官方信源 ──────────────────────────────────────────

export const aiOrgs: DiscoverSource[] = [
  {
    id: "org-openai",
    type: "org",
    nameZh: "OpenAI",
    nameEn: "OpenAI",
    handle: "@OpenAI",
    avatarTint: "#10A37F",
    avatarText: "O",
    company: "官方账号",
    title: "AI 研究与部署公司",
    domain: "AI",
    bio: "OpenAI's mission is to ensure that artificial general intelligence benefits all of humanity.",
    followerLabel: "320万",
    verified: true,
    score: { influence: 99, relevance: 99, activity: 88 },
    isFollowing: true,
    notifyEnabled: false,
  },
  {
    id: "org-anthropic",
    type: "org",
    nameZh: "Anthropic",
    nameEn: "Anthropic",
    handle: "@AnthropicAI",
    avatarTint: "#C9683A",
    avatarText: "A",
    company: "官方账号",
    title: "AI 安全公司，Claude 母公司",
    domain: "AI",
    bio: "Anthropic is an AI safety company, working to build reliable, interpretable, and steerable AI systems.",
    followerLabel: "58万",
    verified: true,
    score: { influence: 91, relevance: 99, activity: 76 },
    isFollowing: true,
    notifyEnabled: false,
  },
  {
    id: "org-deepmind",
    type: "org",
    nameZh: "Google DeepMind",
    nameEn: "Google DeepMind",
    handle: "@GoogleDeepMind",
    avatarTint: "#4285F4",
    avatarText: "G",
    company: "官方账号",
    title: "Google 旗下 AI 研究机构",
    domain: "AI",
    bio: "Building AI responsibly to benefit humanity. AlphaFold, Gemini, AlphaProof and more.",
    followerLabel: "145万",
    verified: true,
    score: { influence: 94, relevance: 98, activity: 80 },
    isFollowing: true,
    notifyEnabled: false,
  },
  {
    id: "org-metaai",
    type: "org",
    nameZh: "Meta AI",
    nameEn: "Meta AI",
    handle: "@MetaAI",
    avatarTint: "#0082FB",
    avatarText: "M",
    company: "官方账号",
    title: "Meta 旗下 AI 研究部门",
    domain: "AI",
    bio: "Meta AI is building the future of AI. Home of Llama, SAM, and research across Meta.",
    followerLabel: "38万",
    verified: true,
    score: { influence: 88, relevance: 95, activity: 85 },
    isFollowing: false,
    notifyEnabled: false,
  },
  {
    id: "org-xai",
    type: "org",
    nameZh: "xAI",
    nameEn: "xAI",
    handle: "@xai",
    avatarTint: "#222222",
    avatarText: "X",
    company: "官方账号",
    title: "马斯克旗下 AI 公司",
    domain: "AI",
    bio: "xAI's mission is to understand the true nature of the universe. Building Grok.",
    followerLabel: "41万",
    verified: true,
    score: { influence: 87, relevance: 90, activity: 78 },
    isFollowing: false,
    notifyEnabled: false,
  },
];

// ─── 快捷领域 chips ──────────────────────────────────────────────

export const quickDomains: { label: string; emoji: string; key: Domain }[] = [
  { label: "AI", emoji: "🤖", key: "AI" },
  { label: "加密", emoji: "₿", key: "加密" },
  { label: "太空", emoji: "🚀", key: "太空" },
  { label: "生物科技", emoji: "🧬", key: "生物科技" },
];

// ─── 关键词识别规则（UI 层判断） ──────────────────────────────────

const DOMAIN_KEYWORDS = ["AI", "人工智能", "加密", "区块链", "太空", "航天", "生物", "科技", "金融", "医疗"];
const DOMAIN_MAP: Record<string, string> = {
  ai: "AI", "人工智能": "AI", 加密: "加密", 区块链: "加密", 太空: "太空",
  航天: "太空", 生物: "生物科技",
};

export function detectInputType(query: string): {
  type: "domain" | "name" | "ambiguous";
  normalizedDomain?: string;
} {
  const q = query.trim().toLowerCase();
  if (!q) return { type: "domain" };
  // 按空格分词后全词匹配，避免 "AnthropicAI" 被 "ai" 误匹配
  const words = q.split(/[\s,，、]+/);
  for (const kw of DOMAIN_KEYWORDS) {
    if (words.some((w) => w === kw.toLowerCase())) {
      return { type: "domain", normalizedDomain: DOMAIN_MAP[kw.toLowerCase()] ?? kw };
    }
  }
  return { type: "name" };
}

// ─── 名字搜索结果（fake） ────────────────────────────────────────

export function searchByName(query: string): DiscoverSource[] {
  const q = query.toLowerCase();
  return [...aiPersons, ...aiOrgs].filter(
    (s) =>
      s.nameZh.toLowerCase().includes(q) ||
      s.nameEn.toLowerCase().includes(q) ||
      s.handle.toLowerCase().includes(q)
  );
}
