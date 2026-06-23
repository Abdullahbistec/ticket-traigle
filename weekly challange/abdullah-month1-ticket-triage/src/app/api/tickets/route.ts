import { NextResponse } from "next/server";
import { listTickets } from "@/server/routes/tickets";

// Always read fresh from the database.
export const dynamic = "force-dynamic";

export async function GET() {
  const board = await listTickets();
  return NextResponse.json(board);
}
