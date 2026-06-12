export type SourceType = "person" | "org";
export type ContentType = "tweet" | "article";
export type RelationType = "original" | "reply" | "quote";

export interface DbSource {
  id: string;
  type: SourceType;
  name_zh: string | null;
  name_en: string;
  company: string | null;
  title: string | null;
  x_handle: string | null;
  rss_url: string | null;
  avatar_tint: string;
  x_followers_count: number | null;
  x_verified: boolean;
  score_influence: number;
  score_relevance: number;
  score_activity: number;
  last_fetched_at: string | null;
  created_at: string;
}

export interface DbPost {
  id: string;
  source_id: string;
  content_type: ContentType;
  x_tweet_id: string | null;
  original_text: string | null;
  relation_type: RelationType | null;
  relation_target: string | null;
  quoted_tweet_id: string | null;
  quoted_text: string | null;
  title: string | null;
  article_url: string | null;
  summary_zh: string | null;
  signal_hint: string | null;
  score: number | null;
  tags: string[] | null;
  domain: string | null;
  has_opinion: boolean | null;
  media_url: string | null;
  media_is_video: boolean;
  media_aspect_ratio: number | null;
  published_at: string;
  created_at: string;
}

export interface DbUserSource {
  id: string;
  user_id: string;
  source_id: string;
  notify: boolean;
  followed_at: string;
}

export interface DbUserPostState {
  id: string;
  user_id: string;
  post_id: string;
  is_starred: boolean;
  created_at: string;
}

export interface DbDigest {
  id: string;
  user_id: string;
  generated_at: string;
  content: DigestContent;
}

// 简报 content 字段结构
export interface DigestContent {
  coreConclusion: string;
  highlights: DigestHighlightItem[];
  resonance: DigestResonanceItem[];
  officialNews: DigestNewsItem[];
  sourceActivity: DigestSourceActivityItem[];
}

export interface DigestHighlightItem {
  postId: string;
  sourceId: string;
  sourceNameZh: string | null;
  sourceNameEn: string;
  summaryZh: string;
  signalHint: string;
  score: number;
  tags: string[];
}

export interface DigestResonanceItem {
  topic: string;
  description: string;
  sourceIds: string[];
}

export interface DigestNewsItem {
  postId: string;
  sourceId: string;
  title: string;
  summaryZh: string;
  articleUrl: string;
}

export interface DigestSourceActivityItem {
  sourceId: string;
  sourceNameZh: string | null;
  sourceNameEn: string;
  count: number;
  topSummary: string;
}

// 查询结果：post 连表 source
export type PostWithSource = DbPost & { source: DbSource };

// 查询结果：user_post_state 连表 post+source
export type StarredPostWithSource = DbUserPostState & {
  post: PostWithSource;
};
