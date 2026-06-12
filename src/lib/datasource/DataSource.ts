import type { RelationType } from "@/types/database";

// 采集到的原始内容，供 AI 处理管道消费
export interface RawPost {
  contentType: "tweet" | "article";
  // tweet
  xTweetId?: string;
  originalText?: string;
  relationType?: RelationType;
  relationTarget?: string;
  quotedTweetId?: string;
  quotedText?: string;
  // article
  title?: string;
  articleUrl?: string;
  // media
  mediaUrl?: string;
  mediaIsVideo?: boolean;
  mediaAspectRatio?: number;
  // time
  publishedAt: Date;
}

// 所有数据源实现此接口，将来换数据源不影响其他代码
export interface DataSource {
  /** 拉取某个 X 账号的最新推文（原创 + 回复 + 引用） */
  fetchTweets(xHandle: string, maxResults?: number): Promise<RawPost[]>;
  /** 拉取 RSS 文章（官方博客用） */
  fetchArticles?(rssUrl: string, since?: Date): Promise<RawPost[]>;
}
