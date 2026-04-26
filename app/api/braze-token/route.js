export async function GET(request) {
 const origin = request.headers.get("origin");
 const referer = request.headers.get("referer");

 const allowedOrigins = [
 "http://localhost:3000",
 "https://braze-sdk-website.vercel.app" // ← replace with your real domain
 ];

 const isAllowed = allowedOrigins.some(
 (o) => origin?.startsWith(o) || referer?.startsWith(o)
 );

 if (!isAllowed) {
 return Response.json({ error: "Unauthorized" }, { status: 401 });
 }

 return Response.json({
 apiKey: process.env.BRAZE_API_KEY,
 baseUrl: process.env.BRAZE_ENDPOINT,
 });
}