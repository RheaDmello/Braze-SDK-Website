"use client";

import * as braze from "@braze/web-sdk";

let initialized = false;
let readyCallbacks = [];

export function initBraze() {
 if (initialized || typeof window === "undefined") return;

 braze.initialize(process.env.NEXT_PUBLIC_BRAZE_API_KEY, {
 baseUrl: process.env.NEXT_PUBLIC_BRAZE_ENDPOINT,
 enableLogging: true,
 });

 window.braze = braze;

 initialized = true;
 console.log("Braze initialized");

 readyCallbacks.forEach((cb) => cb());
 readyCallbacks = [];
}

export function onBrazeReady(callback) {
 if (initialized) {
 callback();
 } else {
 readyCallbacks.push(callback);
 }
}

export { braze };