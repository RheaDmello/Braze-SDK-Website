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

export async function initBraze(userId) {
  if (typeof window === "undefined") return;

  const res = await fetch("/api/braze-token");
  const { apiKey, baseUrl } = await res.json();

  if (!apiKey || !baseUrl) {
    console.error("❌ Braze init failed — could not load config from server.");
    return;
  }

  if (!initialized) {
    brazeSDK.initialize(apiKey, {
      baseUrl,
      enableLogging: false,
      allowUserSuppliedJavascript: true,
      noCookies: false,
      cookieExpiryInDays: 400,
    });

    brazeSDK.automaticallyShowInAppMessages();
    initialized = true;
  }

  if (userId && userId !== currentUserId) {
    currentUserId = userId;
    brazeSDK.changeUser(userId);
  }

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