import { NextResponse, type NextRequest } from "next/server";
import { updateTicket } from "@/server/routes/tickets";

// In Next.js 15 dynamic route params are async and must be awaited.
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body: unknown = await req.json().catch(() => null);

  const result = await updateTicket(id, body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.ticket);
}
