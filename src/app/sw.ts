import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface ServiceWorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();

// Web Push: 收到推送时弹通知
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(self as any).addEventListener("push", (event: any) => {
  const data = event.data?.json() ?? {};
  const title: string = data.title ?? "FameScope";
  const options = {
    body: data.body ?? "",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    data: { url: data.url ?? "/" },
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event.waitUntil((self as any).registration.showNotification(title, options));
});

// 点击通知时跳转
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(self as any).addEventListener("notificationclick", (event: any) => {
  event.notification.close();
  const url: string = event.notification.data?.url ?? "/";
  event.waitUntil(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (self as any).clients.matchAll({ type: "window" }).then((clientList: any[]) => {
      const existing = clientList.find((c) => c.url.includes(url));
      if (existing) return existing.focus();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (self as any).clients.openWindow(url);
    }),
  );
});
