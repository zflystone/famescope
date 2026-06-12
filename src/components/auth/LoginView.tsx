"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { IconArrowRight, IconRotateClockwise } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";

type Step = "email" | "code";

/* ── 倒计时 hook ─────────────────────────────────────────────── */
function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    setRemaining(seconds);
    timer.current = setInterval(() => {
      setRemaining((n) => {
        if (n <= 1) {
          clearInterval(timer.current!);
          return 0;
        }
        return n - 1;
      });
    }, 1000);
  }, [seconds]);

  useEffect(() => () => clearInterval(timer.current!), []);

  return { remaining, start };
}

/* ── 雷达装饰圆 ──────────────────────────────────────────────── */
function RadarRings() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {[280, 200, 130].map((size, i) => (
        <div
          key={size}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{
            width: size,
            height: size,
            borderColor: `rgba(255,255,255,${0.06 + i * 0.04})`,
          }}
        />
      ))}
      {/* 中心亮点 */}
      <div
        className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "rgba(255,255,255,0.25)" }}
      />
    </div>
  );
}

/* ── OTP 六格输入 ─────────────────────────────────────────────── */
function OtpInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  function handleKey(
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) {
    if (e.key === "Backspace") {
      if (!value[idx] && idx > 0) {
        inputs.current[idx - 1]?.focus();
        const arr = value.split("");
        arr[idx - 1] = "";
        onChange(arr.join(""));
      } else {
        const arr = value.split("");
        arr[idx] = "";
        onChange(arr.join(""));
      }
      return;
    }
    if (e.key === "ArrowLeft" && idx > 0) {
      inputs.current[idx - 1]?.focus();
      return;
    }
    if (e.key === "ArrowRight" && idx < 5) {
      inputs.current[idx + 1]?.focus();
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>, idx: number) {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) return;
    // 支持一次性粘贴 6 位
    if (raw.length > 1) {
      const filled = raw.slice(0, 6).padEnd(6, "");
      onChange(filled.slice(0, 6));
      inputs.current[Math.min(raw.length - 1, 5)]?.focus();
      return;
    }
    const arr = value.padEnd(6, "").split("");
    arr[idx] = raw[0];
    onChange(arr.join(""));
    if (idx < 5) inputs.current[idx + 1]?.focus();
  }

  return (
    <div className="flex justify-center gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKey(e, i)}
          onFocus={(e) => e.target.select()}
          className="h-[52px] w-[44px] rounded-xl border-2 text-center text-[20px] font-semibold outline-none transition-all"
          style={{
            background: "var(--color-bg-surface-2)",
            borderColor: value[i]
              ? "var(--color-brand)"
              : "var(--color-border)",
            color: "var(--color-text-primary)",
            caretColor: "var(--color-brand)",
          }}
          aria-label={`验证码第 ${i + 1} 位`}
        />
      ))}
    </div>
  );
}

/* ── 主组件 ──────────────────────────────────────────────────── */
export default function LoginView() {
  const supabase = createClient();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [emailError, setEmailError] = useState("");
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const { remaining, start: startCountdown } = useCountdown(60);

  const maskedEmail = email.replace(/(.{2}).+(@.+)/, "$1****$2");
  const codeComplete = code.replace(/\s/g, "").length === 6;

  function validateEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  async function handleSend() {
    if (!validateEmail(email)) {
      setEmailError("请输入有效的邮箱地址");
      return;
    }
    setEmailError("");
    setApiError("");
    setLoading(true);
    try {
      // 先查注册开关
      const regRes = await fetch("/api/auth/registration-status");
      const { enabled: regEnabled } = await regRes.json();

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: regEnabled },
      });
      if (error) {
        // 注册关闭时新邮箱会报错，给出友好提示
        if (!regEnabled) {
          setApiError("暂不开放注册，请联系管理员");
        } else {
          throw error;
        }
        return;
      }
      setStep("code");
      startCountdown();
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "发送失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (remaining > 0) return;
    setCode("");
    setApiError("");
    setLoading(true);
    try {
      const regRes = await fetch("/api/auth/registration-status");
      const { enabled: regEnabled } = await regRes.json();

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: regEnabled },
      });
      if (error) {
        if (!regEnabled) {
          setApiError("暂不开放注册，请联系管理员");
        } else {
          throw error;
        }
        return;
      }
      startCountdown();
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "发送失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    if (!codeComplete || loading) return;
    setApiError("");
    setLoading(true);
    try {
      const { data: otpData, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });
      if (error) throw error;

      // 判断是否新用户（注册时间在1分钟内 = 刚注册）
      const createdAt = otpData.user?.created_at;
      const isNewUser = createdAt
        ? Date.now() - new Date(createdAt).getTime() < 60_000
        : false;

      // 新用户时检查是否开放注册
      if (isNewUser) {
        const regRes = await fetch("/api/auth/registration-status");
        const { enabled } = await regRes.json();
        if (!enabled) {
          await supabase.auth.signOut();
          setApiError("暂不开放注册，请联系管理员");
          setCode("");
          return;
        }
      }

      // 判断是否需要引导（没有任何追踪信源）
      const { count } = await supabase
        .from("user_source")
        .select("*", { count: "exact", head: true });

      // 用整页跳转而非 router.push，确保 middleware 能读到刚写入的 session cookie
      window.location.href = count === 0 ? "/onboarding" : "/";
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "验证码错误，请重新输入");
      setCode("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="relative flex min-h-dvh flex-col"
      style={{ background: "var(--color-bg-page)" }}
    >
      {/* ── 顶部品牌区（深色背景） ────────────────────────────── */}
      <div
        className="relative flex flex-1 flex-col items-center justify-center pb-12"
        style={{
          background:
            "linear-gradient(175deg, #1a1630 0%, #22193e 55%, #2d1f52 100%)",
          minHeight: "45vh",
        }}
      >
        <RadarRings />

        {/* Logo 徽章 */}
        <div className="animate-fade-up relative z-10 flex flex-col items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center text-[28px] font-bold text-white"
            style={{
              borderRadius: "18px",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))",
              border: "1px solid rgba(255,255,255,0.18)",
              backdropFilter: "blur(8px)",
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
              letterSpacing: "-0.02em",
            }}
          >
            F
          </div>

          <div className="text-center">
            <h1
              className="text-[22px] font-semibold tracking-tight text-white"
              style={{ letterSpacing: "-0.02em" }}
            >
              FameScope
            </h1>
            <p
              className="mt-1 text-[13px]"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              每天 5 分钟，掌握领域信号
            </p>
          </div>
        </div>
      </div>

      {/* ── 表单卡（白色，从底部滑入） ───────────────────────── */}
      <div
        className="animate-slide-up relative z-10 -mt-6 rounded-t-[28px] px-6 pb-12 pt-8"
        style={{
          background: "var(--color-bg-elevated)",
          boxShadow: "0 -4px 30px rgba(0,0,0,0.12)",
          minHeight: "55vh",
        }}
      >
        {/* 拖拽提示条 */}
        <div className="mx-auto mb-6 h-1 w-10 rounded-full" style={{ background: "var(--color-border-strong)" }} />

        {step === "email" ? (
          <div className="animate-fade-up space-y-5">
            <div>
              <h2
                className="text-[20px] font-semibold"
                style={{ color: "var(--color-text-primary)", letterSpacing: "-0.01em" }}
              >
                邮箱登录
              </h2>
              <p className="mt-1 text-[13px]" style={{ color: "var(--color-text-tertiary)" }}>
                首次登录将自动注册账号
              </p>
            </div>

            {/* 邮箱输入 */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-tiny font-medium"
                style={{ color: "var(--color-text-secondary)" }}
              >
                邮箱地址
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="w-full rounded-xl border px-4 py-3.5 text-[15px] outline-none transition-all"
                style={{
                  background: "var(--color-bg-surface-2)",
                  borderColor: emailError
                    ? "rgb(220,38,38)"
                    : email
                    ? "var(--color-brand)"
                    : "var(--color-border)",
                  color: "var(--color-text-primary)",
                  boxShadow: email && !emailError
                    ? "0 0 0 3px var(--color-brand-weak)"
                    : "none",
                }}
              />
              {emailError && (
                <p className="text-tiny" style={{ color: "rgb(220,38,38)" }}>
                  {emailError}
                </p>
              )}
            </div>

            {/* API 错误 */}
            {apiError && (
              <p className="text-tiny" style={{ color: "rgb(220,38,38)" }}>
                {apiError}
              </p>
            )}

            {/* 发送按钮 */}
            <button
              type="button"
              onClick={handleSend}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-pill py-4 text-[15px] font-semibold transition-opacity active:opacity-80 disabled:opacity-60"
              style={{
                background: email ? "var(--color-brand)" : "var(--color-border-strong)",
                color: email ? "#fff" : "var(--color-text-tertiary)",
              }}
            >
              {loading ? "发送中…" : "发送验证码"}
              {!loading && <IconArrowRight size={18} stroke={2.2} />}
            </button>

            <p
              className="text-center text-tiny"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              登录即代表同意{" "}
              <a href="/terms" target="_blank" className="text-brand">用户协议</a>
              {" "}与{" "}
              <a href="/privacy" target="_blank" className="text-brand">隐私政策</a>
            </p>
          </div>
        ) : (
          <div className="animate-fade-up space-y-6">
            <div>
              <h2
                className="text-[20px] font-semibold"
                style={{ color: "var(--color-text-primary)", letterSpacing: "-0.01em" }}
              >
                输入验证码
              </h2>
              <p className="mt-1.5 text-[13px]" style={{ color: "var(--color-text-tertiary)" }}>
                验证码已发送至{" "}
                <span
                  className="font-medium"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {maskedEmail}
                </span>
              </p>
            </div>

            {/* OTP 六格 */}
            <OtpInput value={code} onChange={setCode} />

            {/* 重新发送 */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setStep("email"); setCode(""); }}
                className="text-tiny"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                ← 换个邮箱
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={remaining > 0}
                className="flex items-center gap-1 text-tiny font-medium transition-opacity"
                style={{
                  color: remaining > 0 ? "var(--color-text-tertiary)" : "var(--color-brand)",
                  opacity: remaining > 0 ? 0.6 : 1,
                }}
              >
                {remaining > 0 ? (
                  <><IconRotateClockwise size={12} stroke={2} />{remaining}s 后重新发送</>
                ) : (
                  <><IconRotateClockwise size={12} stroke={2} />重新发送</>
                )}
              </button>
            </div>

            {/* API 错误 */}
            {apiError && (
              <p className="text-center text-tiny" style={{ color: "rgb(220,38,38)" }}>
                {apiError}
              </p>
            )}

            {/* 验证按钮 */}
            <button
              type="button"
              onClick={handleVerify}
              disabled={!codeComplete || loading}
              className="flex w-full items-center justify-center gap-2 rounded-pill py-4 text-[15px] font-semibold transition-all active:opacity-80 disabled:opacity-60"
              style={{
                background: codeComplete ? "var(--color-brand)" : "var(--color-border-strong)",
                color: codeComplete ? "#fff" : "var(--color-text-tertiary)",
              }}
            >
              {loading ? "验证中…" : "验证登录"}
              {!loading && <IconArrowRight size={18} stroke={2.2} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
