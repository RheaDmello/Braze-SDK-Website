"use client";

import * as braze from "@braze/web-sdk";

let initialized = false;
let readyCallbacks = [];

export function initBraze() {
  if (initialized || typeof window === "undefined") return;

  braze.initialize(process.env.NEXT_PUBLIC_BRAZE_API_KEY, {
    baseUrl: process.env.NEXT_PUBLIC_BRAZE_ENDPOINT,
    enableLogging: false, // ✅ disable logs
    allowUserSuppliedJavascript: true,
  });

  initialized = true;

  braze.openSession();

  readyCallbacks.forEach((cb) => cb());
  readyCallbacks = [];
}

export function onBrazeReady(callback) {
  if (typeof window === "undefined") return;

  if (initialized) {
    callback();
  } else {
    readyCallbacks.push(callback);
  }
}

export { braze };