"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { FeedTweet, FeedArticle } from "@/lib/fixtures/feed";

type Content = FeedTweet | FeedArticle;

/* ── 真实二维码（指向 famescope.cn）────────────────────────────── */
function QrCode() {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL("https://famescope.cn", {
      width: 80,
      margin: 1,
      color: { dark: "#534ab7", light: "#ffffff" },
    }).then(setDataUrl);
  }, []);

  if (!dataUrl) return <div style={{ width: 40, height: 40 }} />;

  return (
    <img
      src={dataUrl}
      alt="扫码访问 FameScope"
      width={40}
      height={40}
      style={{ imageRendering: "pixelated" }}
    />
  );
}

/* ── 装饰性背景圆环（右下角） ─────────────────────────────────── */
function BackgroundRings() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: -60,
        right: -60,
        pointerEvents: "none",
        zIndex: 0,
      }}
      aria-hidden
    >
      {[220, 160, 100].map((size, i) => (
        <div
          key={size}
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: size,
            height: size,
            borderRadius: "50%",
            border: `1px solid rgba(83,74,183,${0.04 + i * 0.03})`,
            transform: "translate(50%, 50%)",
          }}
        />
      ))}
    </div>
  );
}

/* ── 主卡片 ──────────────────────────────────────────────────── */
export default function ShareCard({ content }: { content: Content }) {
  const isTweet = content.contentType === "tweet";
  const tweet = isTweet ? (content as FeedTweet) : null;
  const article = !isTweet ? (content as FeedArticle) : null;

  const quoteZh = isTweet ? tweet!.summaryZh : article!.title;
  const subText = isTweet ? tweet!.originalText : article!.summaryZh;
  const source = content.source;
  const isOrg = source.type === "org";

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "18px",
        overflow: "hidden",
        position: "relative",
        boxShadow:
          "0 2px 12px rgba(83,74,183,0.1), 0 24px 48px rgba(83,74,183,0.08)",
      }}
    >
      {/* 顶部品牌渐变条 */}
      <div
        style={{
          height: "4px",
          background:
            "linear-gradient(90deg, #534ab7 0%, #7f77dd 55%, #a99ef5 100%)",
        }}
      />

      {/* 背景装饰圆环 */}
      <BackgroundRings />

      {/* 卡片主体 */}
      <div style={{ padding: "22px 22px 20px", position: "relative", zIndex: 1 }}>

        {/* 品牌行 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "34px",
              height: "34px",
              borderRadius: "9px",
              background: "linear-gradient(135deg, #534ab7, #7f77dd)",
              fontSize: "17px",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.02em",
              flexShrink: 0,
              boxShadow: "0 3px 10px rgba(83,74,183,0.35)",
            }}
          >
            F
          </span>
          <span
            style={{
              fontSize: "16px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#534ab7",
            }}
          >
            FameScope
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: "10px",
              fontWeight: 500,
              letterSpacing: "0.04em",
              color: "#534ab7",
              background: "rgba(83,74,183,0.08)",
              padding: "3px 9px",
              borderRadius: "20px",
            }}
          >
            {isTweet ? "社交信号" : "官方新闻"}
          </span>
        </div>

        {/* 核心引用 — 大字 serif，带左侧品牌竖线 */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "22px",
          }}
        >
          {/* 左侧竖线 */}
          <div
            style={{
              width: "3px",
              borderRadius: "2px",
              background: "linear-gradient(180deg, #534ab7 0%, #a99ef5 100%)",
              flexShrink: 0,
              alignSelf: "stretch",
              minHeight: "24px",
            }}
          />
          {/* 引用文字 */}
          <p
            style={{
              fontFamily:
                "var(--font-noto-serif, 'Noto Serif SC', 'Source Han Serif SC', 'STSong', serif)",
              fontSize: "19px",
              lineHeight: "1.65",
              color: "#1a1826",
              fontWeight: 500,
              letterSpacing: "0.01em",
              flex: 1,
            }}
          >
            {quoteZh}
          </p>
        </div>

        {/* 原文 / 摘要 副文字 */}
        {subText && (
          <p
            style={{
              fontSize: "12px",
              lineHeight: "1.6",
              color: "#9b98aa",
              fontStyle: isTweet ? "italic" : "normal",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              marginBottom: "18px",
              paddingLeft: "15px",
            }}
          >
            {subText}
          </p>
        )}

        {/* 分隔线 */}
        <div
          style={{
            height: "1px",
            background: "rgba(83,74,183,0.1)",
            marginBottom: "14px",
          }}
        />

        {/* 作者行 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "14px",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "34px",
              height: "34px",
              borderRadius: isOrg ? "9px" : "50%",
              background: source.avatarTint,
              fontSize: "13px",
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {source.avatarText}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#1a1826",
                lineHeight: 1.35,
                letterSpacing: "-0.01em",
              }}
            >
              {isOrg ? source.nameEn : `${source.nameEn}${source.nameZh && source.nameZh !== source.nameEn ? ` · ${source.nameZh}` : ""}`}
            </p>
            <p
              style={{
                fontSize: "11px",
                color: "#9b98aa",
                lineHeight: 1.35,
                marginTop: "1px",
              }}
            >
              {source.company}&nbsp;{source.title}
            </p>
          </div>
        </div>

        {/* 页脚：时间 + 域名 + 二维码 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            paddingTop: "12px",
            borderTop: "1px solid rgba(83,74,183,0.08)",
          }}
        >
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#534ab7",
                letterSpacing: "0.04em",
              }}
            >
              famescope.cn
            </p>
            <p
              style={{
                fontSize: "10px",
                color: "#c0bdd0",
                marginTop: "1px",
              }}
            >
              {content.publishedLabel}
            </p>
          </div>

          {/* QR code */}
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "10px",
              background: "#f5f3ff",
              border: "1px solid rgba(83,74,183,0.12)",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <QrCode />
          </div>
        </div>
      </div>
    </div>
  );
}
