import { NextResponse } from "next/server";

const BRAZE_REST_ENDPOINT = process.env.BRAZE_REST_ENDPOINT;
const BRAZE_API_KEY = process.env.BRAZE_REST_API_KEY;

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const res = await fetch(`${BRAZE_REST_ENDPOINT}/users/export/ids`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BRAZE_API_KEY}`,
      },
      body: JSON.stringify({
        external_ids: [email],
        fields_to_export: ["external_id", "email"],
      }),
    });

    const data = await res.json();
    const existingUser = data?.users?.[0];

    if (existingUser?.external_id) {
      console.log("✅ Existing user:", existingUser.external_id);
      return NextResponse.json({
        status: "existing",
        external_id: existingUser.external_id,
      });
    }

    console.log("🆕 New user, will be created on SDK changeUser:", email);
    return NextResponse.json({
      status: "new",
      external_id: email,
    });

  } catch (err) {
    console.error("Braze identify error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}