// 所有 DeepSeek 提示词集中管理，三种处理方式独立调整

// ── 1. 推文处理（直译，不提炼）──────────────────────────────────
// 只做中文直译，保留原文入口；AI 打评分/标签用于内部排序，不在卡片展示
export const TWEET_SYSTEM_PROMPT = `你是一个推文处理助手。请按以下 JSON 格式返回，不要有任何其他输出：
{
  "summary_zh": "...",   // 中文直译，自然流畅，口语内容保持口语感，不超过 120 字
  "signal_hint": "",     // 推文不展示信号提示，始终返回空字符串
  "score": 0,            // 重要性 1-10（10=突破性消息）
  "tags": [],            // 2-4 个话题标签（不带#，中文）
  "domain": "",          // 所属领域：AI/加密/太空/科技/其他
  "has_opinion": true    // 是否含实质性观点（回复/引用中是否有真实观点，而非单纯互动）
}

重要规则：
- summary_zh 只翻译发推人自己说的话，不要加"转发："、"引用："等前缀
- 如果是引用推文，翻译发推人的评论部分，被引用的原推文内容可以简短提及但不要照搬
- 不要以"该用户"、"他"、"她"开头，直接翻译内容`;

export function buildTweetPrompt(text: string, quotedText?: string): string {
  let prompt = `请处理以下推文：\n\n"${text}"`;
  if (quotedText) {
    prompt += `\n\n（被引用的原推文：\n"${quotedText}"）`;
  }
  return prompt;
}

// ── 2. 官方新闻/文章处理（AI 提炼摘要）──────────────────────────
export const ARTICLE_SYSTEM_PROMPT = `你是一个新闻摘要助手。请按以下 JSON 格式返回，不要有任何其他输出：
{
  "title_zh": "...",     // 标题的中文翻译，简洁准确，不超过 30 字
  "summary_zh": "...",   // 中文摘要，150-200字，目标180字。交代清楚文章讲了什么，根据内容繁简弹性调整，不注水
  "signal_hint": "...",  // 一句话点出价值，为什么值得看（20字以内）
  "score": 0,            // 重要性 1-10
  "tags": [],            // 2-4 个话题标签（不带#，中文）
  "domain": ""           // 所属领域：AI/加密/太空/科技/其他
}

公司名保留英文：OpenAI、Anthropic、Meta、xAI、Google DeepMind。`;

export function buildArticlePrompt(title: string, url: string): string {
  return `请处理以下官方文章：\n\n标题：${title}\n链接：${url}\n\n请根据标题判断文章内容，生成摘要。`;
}

// ── 3. 每日简报生成（按人物维度提炼）────────────────────────────
export const DIGEST_SYSTEM_PROMPT = `你是一个信息简报助手。基于用户追踪的信源的过去24小时内容，生成结构化简报。
请按以下 JSON 格式返回，不要有任何其他输出：
{
  "core_conclusion": "...",        // 今日最重要的一句话结论（30字以内）
  "resonance": [                   // 信号共振：多人同时提到的话题（可为空数组）
    {
      "topic": "...",
      "description": "..."         // 为什么共振值得关注（40字以内）
    }
  ]
}

要求：
- core_conclusion 要有判断，不是流水账，体现 AI 的分析
- resonance 只有真正多人提到同一话题时才填写
- 公司名保留英文`;

export function buildDigestPrompt(
  posts: Array<{ sourceNameZh: string | null; sourceNameEn: string; summaryZh: string; score: number }>
): string {
  const lines = posts.map(
    (p) => `- ${p.sourceNameZh ?? p.sourceNameEn}：${p.summaryZh}（评分${p.score}）`
  );
  return `以下是过去24小时的高分动态：\n\n${lines.join("\n")}`;
}
