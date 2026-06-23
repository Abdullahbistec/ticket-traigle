import { describe, it, expect } from "vitest";
import {
  ticketPatchSchema,
  prioritySchema,
  seedTicketSchema,
} from "../src/lib/validation";

describe("ticketPatchSchema", () => {
  it("accepts a valid partial update", () => {
    const result = ticketPatchSchema.safeParse({ priority: "P0", owner: "Ruwan" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty body", () => {
    const result = ticketPatchSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects an unknown priority", () => {
    const result = ticketPatchSchema.safeParse({ priority: "P9" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty owner string", () => {
    const result = ticketPatchSchema.safeParse({ owner: "" });
    expect(result.success).toBe(false);
  });
});

describe("prioritySchema", () => {
  it("allows P0, P1, P2", () => {
    for (const p of ["P0", "P1", "P2"]) {
      expect(prioritySchema.safeParse(p).success).toBe(true);
    }
  });
});

describe("seedTicketSchema", () => {
  it("defaults status to open", () => {
    const parsed = seedTicketSchema.parse({
      title: "Seeded",
      priority: "P1",
      owner: "Imali",
    });
    expect(parsed.status).toBe("open");
  });
});
