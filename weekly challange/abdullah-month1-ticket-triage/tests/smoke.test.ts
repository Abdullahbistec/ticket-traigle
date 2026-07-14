import { describe, it, expect } from "vitest";
import { PatchTicketSchema } from "@/types/ticket";

describe("PatchTicketSchema — Zod validation", () => {
  it("accepts a valid priority patch", () => {
    const result = PatchTicketSchema.safeParse({ priority: "P0" });
    expect(result.success).toBe(true);
  });

  it("accepts a valid owner patch", () => {
    const result = PatchTicketSchema.safeParse({ owner: "engineering" });
    expect(result.success).toBe(true);
  });

  it("accepts a valid status patch", () => {
    const result = PatchTicketSchema.safeParse({ status: "IN_PROGRESS" });
    expect(result.success).toBe(true);
  });

  it("accepts a combined patch", () => {
    const result = PatchTicketSchema.safeParse({
      priority: "P1",
      owner: "billing",
      status: "RESOLVED",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid priority", () => {
    const result = PatchTicketSchema.safeParse({ priority: "P9" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty owner string", () => {
    const result = PatchTicketSchema.safeParse({ owner: "" });
    expect(result.success).toBe(false);
  });

  it("rejects unknown fields if strict", () => {
    const result = PatchTicketSchema.strict().safeParse({ hack: true });
    expect(result.success).toBe(false);
  });

  it("accepts an empty object (no-op patch)", () => {
    const result = PatchTicketSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
