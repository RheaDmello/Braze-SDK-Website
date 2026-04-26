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

export async function PATCH(request) {
  try {
    const { updates } = await request.json();
    // updates: [{ id: "product_id", quantity: newQuantity }, ...]

    const items = updates.map(({ id, quantity }) => ({
      id: String(id),
      quantity,
    }));

    const res = await fetch(`${BRAZE_REST_ENDPOINT}/catalogs/products/items`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BRAZE_API_KEY}`,
      },
      body: JSON.stringify({ items }),
    });

    const data = await res.json();
    console.log("Braze catalog PATCH response:", JSON.stringify(data));

    if (!res.ok) {
      return NextResponse.json({ error: data }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Braze catalog PATCH error:", err);
    return NextResponse.json({ error: "Failed to update catalog" }, { status: 500 });
  }
}