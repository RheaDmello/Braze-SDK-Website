import { NextResponse } from "next/server";

const BRAZE_REST_ENDPOINT = process.env.BRAZE_REST_ENDPOINT;
const BRAZE_API_KEY = process.env.BRAZE_REST_API_KEY;

export async function GET() {
 try {
 const res = await fetch(`${BRAZE_REST_ENDPOINT}/catalogs/products/items`, {
 method: "GET",
 headers: {
 "Content-Type": "application/json",
 Authorization: `Bearer ${BRAZE_API_KEY}`,
 },
 });

 const data = await res.json();
 console.log("Braze catalog response:", JSON.stringify(data));

 return NextResponse.json({ items: data.items || [] });
 } catch (err) {
 console.error("Braze catalog error:", err);
 return NextResponse.json({ error: "Failed to fetch catalog" }, { status: 500 });
 }
}