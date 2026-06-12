import OpenAI from "openai";
import {
  TWEET_SYSTEM_PROMPT,
  ARTICLE_SYSTEM_PROMPT,
  buildTweetPrompt,
  buildArticlePrompt,
} from "@/lib/prompts";
import type { RawPost } from "@/lib/datasource/DataSource";

export interface ProcessedPost {
  titleZh?: string;
  summaryZh: string;
  signalHint: string;
  score: number;
  tags: string[];
  domain: string;
  hasOpinion: boolean;
}

export async function processPost(raw: RawPost): Promise<ProcessedPost> {
  const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com/v1",
  });
  const isTweet = raw.contentType === "tweet";

  const systemPrompt = isTweet ? TWEET_SYSTEM_PROMPT : ARTICLE_SYSTEM_PROMPT;
  const userPrompt = isTweet
    ? buildTweetPrompt(raw.originalText ?? "", raw.quotedText)
    : buildArticlePrompt(raw.title ?? "", raw.articleUrl ?? "");

  const completion = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 512,
  });

  const text = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(text);

  return {
    titleZh: parsed.title_zh || undefined,
    summaryZh: parsed.summary_zh ?? "",
    signalHint: parsed.signal_hint ?? "",
    score: Math.min(10, Math.max(1, Number(parsed.score) || 5)),
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 4) : [],
    domain: parsed.domain ?? "科技",
    hasOpinion: parsed.has_opinion !== false,
  };
}
