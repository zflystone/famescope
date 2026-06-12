import type { DataSource } from "./interface";
import type { Person, RawPost } from "@/types";

const PEOPLE: Person[] = [
  {
    id: "sama",
    handle: "sama",
    displayName: "奥尔特曼 · Sam Altman",
    nameChinese: "奥尔特曼",
    nameEnglish: "Sam Altman",
    company: "OpenAI",
    title: "CEO",
    avatarUrl: "https://pbs.twimg.com/profile_images/804990434455887872/BG0Xh7Oa_400x400.jpg",
    domain: "AI",
  },
  {
    id: "demishassabis",
    handle: "demishassabis",
    displayName: "哈萨比斯 · Demis Hassabis",
    nameChinese: "哈萨比斯",
    nameEnglish: "Demis Hassabis",
    company: "Google DeepMind",
    title: "CEO",
    avatarUrl: "https://pbs.twimg.com/profile_images/1158077872838000641/9FqTBFQo_400x400.jpg",
    domain: "AI",
  },
  {
    id: "elonmusk",
    handle: "elonmusk",
    displayName: "马斯克 · Elon Musk",
    nameChinese: "马斯克",
    nameEnglish: "Elon Musk",
    company: "xAI",
    title: "CEO",
    avatarUrl: "https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok_400x400.jpg",
    domain: "AI",
  },
  {
    id: "ylecun",
    handle: "ylecun",
    displayName: "杨立昆 · Yann LeCun",
    nameChinese: "杨立昆",
    nameEnglish: "Yann LeCun",
    company: "Meta",
    title: "Chief AI Scientist",
    avatarUrl: "https://pbs.twimg.com/profile_images/1483577865056702469/rWA-3_T7_400x400.jpg",
    domain: "AI",
  },
  {
    id: "darioamodei",
    handle: "darioamodei",
    displayName: "阿莫迪 · Dario Amodei",
    nameChinese: "阿莫迪",
    nameEnglish: "Dario Amodei",
    company: "Anthropic",
    title: "CEO",
    avatarUrl: "https://pbs.twimg.com/profile_images/1634067486/Dario_photo_400x400.jpg",
    domain: "AI",
  },
  {
    id: "karpathy",
    handle: "karpathy",
    displayName: "卡帕西 · Andrej Karpathy",
    nameChinese: "卡帕西",
    nameEnglish: "Andrej Karpathy",
    company: "独立研究者",
    title: "AI Researcher",
    avatarUrl: "https://pbs.twimg.com/profile_images/1296667294148382721/9Pr6XrPB_400x400.jpg",
    domain: "AI",
  },
  {
    id: "gdb",
    handle: "gdb",
    displayName: "布罗克曼 · Greg Brockman",
    nameChinese: "布罗克曼",
    nameEnglish: "Greg Brockman",
    company: "OpenAI",
    title: "President",
    avatarUrl: "https://pbs.twimg.com/profile_images/1683782956/Greg-Brockman-Photo_400x400.jpg",
    domain: "AI",
  },
  {
    id: "vitalikbuterin",
    handle: "VitalikButerin",
    displayName: "布特林 · Vitalik Buterin",
    nameChinese: "布特林",
    nameEnglish: "Vitalik Buterin",
    company: "Ethereum Foundation",
    title: "Co-founder",
    avatarUrl: "https://pbs.twimg.com/profile_images/977496875887558661/L86xyLF4_400x400.jpg",
    domain: "crypto",
  },
];

const now = new Date("2026-06-10T08:00:00Z");
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();

const POSTS: RawPost[] = [
  {
    id: "post-001",
    personId: "sama",
    relation: "original",
    originalText:
      "We are releasing GPT-5 today. This is the most capable model we have ever built. It achieves state-of-the-art on nearly every benchmark we've measured, and it feels qualitatively different to use. More soon.",
    publishedAt: hoursAgo(1),
    url: "https://x.com/sama/status/mock001",
  },
  {
    id: "post-002",
    personId: "ylecun",
    relation: "reply",
    originalText:
      "Scaling LLMs is not going to get us to human-level AI. We need fundamentally different architectures that can reason about the physical world, not just predict tokens. The path forward is world models.",
    publishedAt: hoursAgo(2),
    url: "https://x.com/ylecun/status/mock002",
    replyTo: {
      personHandle: "sama",
      url: "https://x.com/sama/status/mock001",
    },
  },
  {
    id: "post-003",
    personId: "demishassabis",
    relation: "original",
    originalText:
      "AlphaFold 3 just predicted the structure of a previously unknown protein linked to Alzheimer's. We've now passed 200 million protein structures in our database. Science is accelerating faster than most people realise.",
    publishedAt: hoursAgo(3),
    url: "https://x.com/demishassabis/status/mock003",
    media: [
      {
        type: "image",
        url: "https://pbs.twimg.com/media/mockimage001.jpg",
        aspectRatio: 1.78,
      },
    ],
  },
  {
    id: "post-004",
    personId: "karpathy",
    relation: "original",
    originalText:
      "Software 3.0 is eating Software 2.0. The most valuable skill right now isn't writing code—it's knowing how to direct AI to write better code than you could yourself. This is a genuine phase transition in how software gets made.",
    publishedAt: hoursAgo(4),
    url: "https://x.com/karpathy/status/mock004",
  },
  {
    id: "post-005",
    personId: "darioamodei",
    relation: "original",
    originalText:
      "I've been thinking about the economic implications of AI more carefully. If AI systems can do most knowledge work by 2027, we may be looking at GDP growth rates of 10–30% per year in leading economies. The question isn't whether this happens, but whether our institutions can keep up.",
    publishedAt: hoursAgo(5),
    url: "https://x.com/darioamodei/status/mock005",
  },
  {
    id: "post-006",
    personId: "elonmusk",
    relation: "quote",
    originalText:
      "Grok 3 is now smarter than any AI on the planet. Don't take my word for it—run the benchmarks yourself. The gap between xAI and the competition is widening, not narrowing.",
    publishedAt: hoursAgo(6),
    url: "https://x.com/elonmusk/status/mock006",
    quotedPost: {
      personHandle: "xai",
      text: "Grok 3 benchmark results are live.",
      url: "https://x.com/xai/status/mock_xai",
    },
  },
  {
    id: "post-007",
    personId: "gdb",
    relation: "original",
    originalText:
      "The most underrated thing about the current AI moment: it's not just that models are getting smarter, it's that the tools for using them effectively are maturing rapidly. Cursor, Claude Code, Devin—these aren't toys anymore.",
    publishedAt: hoursAgo(8),
    url: "https://x.com/gdb/status/mock007",
  },
  {
    id: "post-008",
    personId: "vitalikbuterin",
    relation: "original",
    originalText:
      "Ethereum's blob capacity is increasing 3x with Pectra. This means L2 transaction fees drop by 80%. The endgame of cheap, secure, decentralized computation is closer than the bears think. Also, ZK-EVMs are nearly production ready.",
    publishedAt: hoursAgo(10),
    url: "https://x.com/VitalikButerin/status/mock008",
  },
  {
    id: "post-009",
    personId: "sama",
    relation: "reply",
    originalText:
      "Yann raises important points but I think he's wrong about the destination. The question isn't architecture—it's what level of reasoning emerges. We're still early.",
    publishedAt: hoursAgo(2.5),
    url: "https://x.com/sama/status/mock009",
    replyTo: {
      personHandle: "ylecun",
      url: "https://x.com/ylecun/status/mock002",
    },
  },
  {
    id: "post-010",
    personId: "karpathy",
    relation: "original",
    originalText:
      "Just dropped a new YouTube video: Neural Networks: Zero to Hero, Episode 12. We build a small transformer from scratch, including all the tricks that actually matter in practice (RoPE, SwiGLU, RMSNorm). Link in bio.",
    publishedAt: hoursAgo(12),
    url: "https://x.com/karpathy/status/mock010",
    media: [
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=mockvideoKarpathy",
        thumbnailUrl: "https://img.youtube.com/vi/mockvideoKarpathy/hqdefault.jpg",
        aspectRatio: 1.78,
      },
    ],
  },
  {
    id: "post-011",
    personId: "ylecun",
    relation: "reply",
    originalText: "Congrats! 👏",
    publishedAt: hoursAgo(1.5),
    url: "https://x.com/ylecun/status/mock011",
    replyTo: {
      personHandle: "demishassabis",
      url: "https://x.com/demishassabis/status/mock003",
    },
  },
  {
    id: "post-012",
    personId: "darioamodei",
    relation: "quote",
    originalText:
      "This is a genuinely important paper. Constitutional AI + scalable oversight is the only path I see to aligning models that are smarter than their trainers. Worth reading carefully.",
    publishedAt: hoursAgo(14),
    url: "https://x.com/darioamodei/status/mock012",
    quotedPost: {
      personHandle: "AnthropicAI",
      text: "New paper: Scalable oversight via debate and amplification.",
      url: "https://x.com/AnthropicAI/status/mock_anthropic",
    },
  },
];

export class MockDataSource implements DataSource {
  async getPeople(): Promise<Person[]> {
    return PEOPLE;
  }

  async getRecentPosts(since?: Date): Promise<RawPost[]> {
    if (!since) return [...POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    return POSTS.filter((p) => new Date(p.publishedAt) >= since).sort(
      (a, b) => b.publishedAt.localeCompare(a.publishedAt)
    );
  }

  async getPostsByPerson(personId: string, limit = 20): Promise<RawPost[]> {
    return POSTS.filter((p) => p.personId === personId)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, limit);
  }
}
