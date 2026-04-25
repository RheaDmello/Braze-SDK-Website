"use client";

import * as brazeSDK from "@braze/web-sdk";

let initialized = false;
let currentUserId = null;
let readyCallbacks = [];

function flushCallbacks() {
  const cbs = readyCallbacks.slice();
  readyCallbacks = [];
  cbs.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error("Braze ready callback error:", e);
    }
  });
}

export function initBraze(userId) {
  if (typeof window === "undefined") return;

  const apiKey = process.env.NEXT_PUBLIC_BRAZE_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_BRAZE_ENDPOINT;

  // ── Diagnostic log — share this output if content cards fail ──────────────
  // Shows exactly what values the SDK receives at runtime.
  // Remove this log once everything is working.
  console.log("🔑 Braze config →", {
    apiKey: apiKey ? `${apiKey.substring(0, 8)}...` : "MISSING",
    baseUrl: baseUrl ?? "MISSING",
  });

  if (!apiKey || !baseUrl) {
    console.error(
      "❌ Braze init failed — missing env vars.\n" +
      "  Make sure .env.local is in your project ROOT (same folder as package.json).\n" +
      "  Required:\n" +
      "    NEXT_PUBLIC_BRAZE_API_KEY=your-web-sdk-key\n" +
      "    NEXT_PUBLIC_BRAZE_ENDPOINT=sdk.iad-01.braze.com   ← no https://, no trailing slash\n" +
      "  After editing .env.local you MUST restart: npm run dev"
    );
    return;
  }

  // Warn about the two most common endpoint mistakes
  if (baseUrl.startsWith("https://") || baseUrl.startsWith("http://")) {
    console.error(
      "❌ NEXT_PUBLIC_BRAZE_ENDPOINT must NOT include https://\n" +
      `  Current value: "${baseUrl}"\n` +
      `  Fix it to:     "${baseUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}"`
    );
    return;
  }
  if (baseUrl.endsWith("/")) {
    console.error(
      "❌ NEXT_PUBLIC_BRAZE_ENDPOINT must NOT have a trailing slash\n" +
      `  Current value: "${baseUrl}"\n` +
      `  Fix it to:     "${baseUrl.replace(/\/$/, "")}"`
    );
    return;
  }

  if (!initialized) {
    brazeSDK.initialize(apiKey, {
      baseUrl,
      enableLogging: true,
      allowUserSuppliedJavascript: true,
      noCookies: false,
      cookieExpiryInDays: 400,
    });

    // MUST be called before openSession so in-app messages display correctly
    brazeSDK.automaticallyShowInAppMessages();

    initialized = true;
    console.log("✅ Braze initialized successfully");
  }

  if (userId && userId !== currentUserId) {
    currentUserId = userId;
    brazeSDK.changeUser(userId);
    console.log("👤 Braze changeUser →", userId);
  }

  // Safe to call multiple times — Braze deduplicates internally
  brazeSDK.openSession();

  flushCallbacks();
}

export function switchBrazeUser(userId) {
  if (typeof window === "undefined" || !userId) return;

  if (!initialized) {
    readyCallbacks.push(() => switchBrazeUser(userId));
    return;
  }

  if (userId !== currentUserId) {
    currentUserId = userId;
    brazeSDK.changeUser(userId);
    console.log("🔄 Braze switchBrazeUser →", userId);
  }
}

export function onBrazeReady(cb) {
  if (initialized) {
    try {
      cb();
    } catch (e) {
      console.error("Braze ready callback error:", e);
    }
  } else {
    readyCallbacks.push(cb);
  }
}

export { brazeSDK as braze };