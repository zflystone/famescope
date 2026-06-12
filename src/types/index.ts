export type PostRelation = "original" | "quote" | "reply";

export type Domain = "AI" | "crypto" | "space" | "biotech" | "other";

export interface Person {
  id: string;
  handle: string; // X handle, e.g. "sama"
  displayName: string; // e.g. "奥尔特曼 · Sam Altman"
  nameChinese: string; // e.g. "奥尔特曼"
  nameEnglish: string; // e.g. "Sam Altman"
  company: string; // e.g. "OpenAI"
  title: string;
  avatarUrl: string;
  domain: Domain;
}

export interface MediaItem {
  type: "image" | "video";
  url: string; // original URL, never downloaded
  thumbnailUrl?: string;
  aspectRatio?: number; // width/height, to prevent layout shift
}

export interface RawPost {
  id: string;
  personId: string;
  relation: PostRelation;
  originalText: string;
  publishedAt: string; // ISO 8601
  url: string; // link to original tweet
  media?: MediaItem[];
  quotedPost?: {
    personHandle: string;
    text: string;
    url: string;
  };
  replyTo?: {
    personHandle: string;
    url: string;
  };
}

export interface AiAnalysis {
  summaryZh: string;
  importanceScore: number; // 1-10
  tags: string[];
  domain: Domain;
  signalHint: string; // "为什么值得看"
  hasSubstantiveOpinion: boolean; // for reply/quote filtering
}

export interface Post extends RawPost {
  person: Person;
  analysis: AiAnalysis | null;
  isRead: boolean;
  isBookmarked: boolean;
}
