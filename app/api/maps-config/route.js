export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return Response.json({ error: 'Maps configuration unavailable' }, { status: 503 });
  return Response.json({ apiKey }, { headers: { 'Cache-Control': 'private, no-store' } });
}
