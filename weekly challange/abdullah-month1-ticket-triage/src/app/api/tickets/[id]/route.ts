import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PatchTicketSchema } from "@/types/ticket";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const body: unknown = await request.json();
  const parsed = PatchTicketSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const existing = await db.ticket.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const updated = await db.ticket.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}
