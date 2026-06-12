import type { DataSource, RawPost } from "./DataSource";

const BASE_URL = "https://api.twitterapi.io/twitter";

// 实际 API 返回的 camelCase 结构
interface TwitterApiTweet {
  id: string;
  text: string;
  createdAt: string;
  isReply?: boolean;
  inReplyToUserId?: string;
  inReplyToUsername?: string;
  quoted_tweet?: {
    id: string;
    text: string;
  };
  retweeted_tweet?: {
    id: string;
    text: string;
  };
  extendedEntities?: {
    media?: Array<{
      media_url_https: string;
      type: string; // "photo" | "video" | "animated_gif"
      original_info?: { width: number; height: number };
    }>;
  };
}

// /user/last_tweets 响应结构
interface LastTweetsResponse {
  status: string;
  data: {
    tweets: TwitterApiTweet[];
    pin_tweet?: TwitterApiTweet;
  };
  has_next_page?: boolean;
}

export class TwitterApiIoDataSource implements DataSource {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async fetchTweets(xHandle: string, maxResults = 20): Promise<RawPost[]> {
    const handle = xHandle.replace(/^@/, "");
    const url = `${BASE_URL}/user/last_tweets?userName=${handle}&count=${maxResults}`;

    const res = await fetch(url, {
      headers: { "X-API-Key": this.apiKey },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error(`TwitterAPI.io error ${res.status} for @${handle}`);
    }

    const data: LastTweetsResponse = await res.json();
    const tweets: TwitterApiTweet[] = data.data?.tweets ?? [];

    // 过滤纯转发（retweeted_tweet 存在 = 只是 RT，无原创内容）
    // 过滤无文字内容的推文（去掉 URL 后本人文字不足 5 字）
    return tweets
      .filter((t) => {
        if (t.retweeted_tweet) return false;
        const ownText = t.text.replace(/https?:\/\/\S+/g, "").trim();
        // 无评论的引用推文 或 纯链接推文 → 过滤
        if (ownText.length < 5) return false;
        return true;
      })
      .map((t) => this.mapTweet(t));
  }

  // RSS 文章采集（官方博客）
  async fetchArticles(rssUrl: string, since?: Date): Promise<RawPost[]> {
    const res = await fetch(rssUrl, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`RSS fetch error for ${rssUrl}`);

    const xml = await res.text();
    return this.parseRss(xml, since);
  }

  private mapTweet(t: TwitterApiTweet): RawPost {
    let relationType: RawPost["relationType"] = "original";
    let relationTarget: string | undefined;
    let quotedTweetId: string | undefined;
    let quotedText: string | undefined;

    if (t.isReply || t.inReplyToUserId) {
      relationType = "reply";
      relationTarget = t.inReplyToUsername;
    } else if (t.quoted_tweet) {
      relationType = "quote";
      quotedTweetId = t.quoted_tweet.id;
      quotedText = t.quoted_tweet.text;
    }
    // retweeted_tweet 属于转推，不含原创观点，直接标 original 但 score 会低

    // 媒体（只存 URL，不下载）
    let mediaUrl: string | undefined;
    let mediaIsVideo = false;
    let mediaAspectRatio: number | undefined;
    const media = t.extendedEntities?.media?.[0];
    if (media) {
      mediaUrl = media.media_url_https;
      mediaIsVideo = media.type === "video" || media.type === "animated_gif";
      if (media.original_info) {
        mediaAspectRatio = media.original_info.width / media.original_info.height;
      }
    }

    // createdAt 格式：ISO 8601 或 Twitter 格式
    let publishedAt: Date;
    try {
      publishedAt = new Date(t.createdAt);
      if (isNaN(publishedAt.getTime())) publishedAt = new Date();
    } catch {
      publishedAt = new Date();
    }

    return {
      contentType: "tweet",
      xTweetId: t.id,
      originalText: t.text,
      relationType,
      relationTarget,
      quotedTweetId,
      quotedText,
      mediaUrl,
      mediaIsVideo,
      mediaAspectRatio,
      publishedAt,
    };
  }

  private parseRss(xml: string, since?: Date): RawPost[] {
    const items: RawPost[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const item = match[1];
      const title = this.extractTag(item, "title");
      const link = this.extractTag(item, "link");
      const pubDateStr = this.extractTag(item, "pubDate");
      if (!title || !link) continue;

      const publishedAt = pubDateStr ? new Date(pubDateStr) : new Date();
      if (since && publishedAt < since) continue;

      items.push({
        contentType: "article",
        title,
        articleUrl: link,
        publishedAt,
      });
    }

    return items;
  }

  private extractTag(xml: string, tag: string): string | undefined {
    const m = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([^<]*)<\\/${tag}>`));
    return m ? (m[1] ?? m[2])?.trim() : undefined;
  }
}
