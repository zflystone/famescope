import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Noto_Serif_SC } from "next/font/google";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

// 分享金句用的中文衬线体
const notoSerif = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-noto-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FameScope · 每天 5 分钟，掌握领域里最有影响力的人都说了什么",
  description:
    "FameScope 帮你从噪音里提炼信号——追踪你关注领域里最有影响力的人，看他们说了什么、透露了什么信号。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FameScope",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f4f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0c12" },
  ],
};

// 在首屏绘制前确定主题，避免深浅色闪烁（FOUC）
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('famescope-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var dark = stored ? stored === 'dark' : prefersDark;
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${geistSans.variable} ${notoSerif.variable}`}>
        {children}
      </body>
    </html>
  );
}
