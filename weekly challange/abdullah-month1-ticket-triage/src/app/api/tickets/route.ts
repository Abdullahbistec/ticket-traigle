import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const tickets = await db.ticket.findMany({
    orderBy: [{ createdAt: "desc" }],
  });

  const grouped = {
    P0: tickets.filter((t) => t.priority === "P0"),
    P1: tickets.filter((t) => t.priority === "P1"),
    P2: tickets.filter((t) => t.priority === "P2"),
  };

  const counts = {
    P0: grouped.P0.length,
    P1: grouped.P1.length,
    P2: grouped.P2.length,
    total: tickets.length,
  };

  return NextResponse.json({ tickets, grouped, counts });
}
