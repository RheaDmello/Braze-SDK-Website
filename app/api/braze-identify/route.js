// app/api/braze-identify/route.js

import { NextResponse } from "next/server";

const BRAZE_REST_ENDPOINT = process.env.BRAZE_REST_ENDPOINT;
const BRAZE_API_KEY = process.env.BRAZE_REST_API_KEY;

export async function POST(request) {
 try {
 console.log("🔥 braze-identify called");

 const { email } = await request.json();

 if (!email || !email.includes("@")) {
 return NextResponse.json({ error: "Invalid email" }, { status: 400 });
 }

 // ─────────────────────────────────────────────────────────────
 // STEP 1A: Search by email address
 // ─────────────────────────────────────────────────────────────
 const exportRes = await fetch(`${BRAZE_REST_ENDPOINT}/users/export/ids`, {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 Authorization: `Bearer ${BRAZE_API_KEY}`,
 },
 body: JSON.stringify({
 email_address: email,
 fields_to_export: ["external_id", "user_aliases", "email"],
 }),
 });

 const exportData = await exportRes.json();
 console.log("Braze email export response:", JSON.stringify(exportData));
 let users = exportData?.users || [];

 // ─────────────────────────────────────────────────────────────
 // STEP 1B: If not found by email, search by user alias
 // ─────────────────────────────────────────────────────────────
 if (users.length === 0) {
 const aliasRes = await fetch(`${BRAZE_REST_ENDPOINT}/users/export/ids`, {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 Authorization: `Bearer ${BRAZE_API_KEY}`,
 },
 body: JSON.stringify({
 user_aliases: [{ alias_name: email, alias_label: "email" }],
 fields_to_export: ["external_id", "user_aliases", "email"],
 }),
 });

 const aliasData = await aliasRes.json();
 console.log("Braze alias export response:", JSON.stringify(aliasData));
 users = aliasData?.users || [];
 }

 // ─────────────────────────────────────────────────────────────
 // STEP 2: Analyze what we found
 // ─────────────────────────────────────────────────────────────

 // Case A: Profile exists AND already has an external_id
 const userWithExternalId = users.find((u) => u.external_id);
 if (userWithExternalId) {
 console.log("✅ Case A: existing_identified →", userWithExternalId.external_id);
 return NextResponse.json({
 status: "existing_identified",
 external_id: userWithExternalId.external_id,
 });
 }

 // Case B: Profile exists with NO external_id but HAS an alias → merge it
 const aliasUser = users.find(
 (u) => !u.external_id && u.user_aliases?.length > 0
 );

 if (aliasUser) {
 const alias = aliasUser.user_aliases[0];
 console.log("🔗 Case B: alias_identified → merging alias:", alias);

 const identifyRes = await fetch(`${BRAZE_REST_ENDPOINT}/users/identify`, {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 Authorization: `Bearer ${BRAZE_API_KEY}`,
 },
 body: JSON.stringify({
 aliases_to_identify: [
 {
 external_id: email,
 user_alias: alias,
 },
 ],
 }),
 });

 const identifyData = await identifyRes.json();
 console.log("Braze /users/identify response:", JSON.stringify(identifyData));

 return NextResponse.json({
 status: "alias_identified",
 external_id: email,
 });
 }

 // Case C: Profile found but no external_id and no alias → can't merge
 if (users.length > 0) {
 console.log("⚠️ Case C: existing_no_alias → cannot merge");
 return NextResponse.json({
 status: "existing_no_alias",
 external_id: email,
 warning: "Profile found without external_id or alias — cannot merge automatically",
 });
 }

 // Case D: No profile found → brand new user
 console.log("🆕 Case D: new_user →", email);
 return NextResponse.json({
 status: "new_user",
 external_id: email,
 });

 } catch (err) {
 console.error("Braze identify error:", err);
 return NextResponse.json({ error: "Internal server error" }, { status: 500 });
 }
}